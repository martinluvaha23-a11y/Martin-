"""SQLite access layer: schema, per-thread connection reuse, kv + tombstone helpers.

The on-disk schema is intentionally identical to the legacy system so the same
school.db opens without any migration.
"""
import json
import sqlite3
import threading
import time
from contextlib import contextmanager

from . import config

_local = threading.local()
_init_lock = threading.Lock()


def _connect() -> sqlite3.Connection:
    con = sqlite3.connect(str(config.DB_PATH), timeout=30)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA journal_mode=WAL")
    con.execute("PRAGMA synchronous=NORMAL")
    con.execute("PRAGMA busy_timeout=30000")  # wait (not fail) on writer contention
    con.execute("PRAGMA cache_size=-32000")     # 32 MB page cache
    con.execute("PRAGMA temp_store=MEMORY")     # temp tables in RAM
    con.execute("PRAGMA mmap_size=268435456")   # 256 MB memory-map
    con.execute("PRAGMA optimize")              # auto-gather query stats
    return con


def get_conn() -> sqlite3.Connection:
    """Per-thread persistent connection (replaces connect-per-request)."""
    con = getattr(_local, "con", None)
    if con is None:
        con = _connect()
        _local.con = con
    return con


@contextmanager
def db_scope():
    """Yield the thread's connection with commit/rollback bookkeeping.

    Re-entrant: nested scopes join the outer transaction instead of committing
    it early (auditing inside a request handler, for example).
    """
    con = get_conn()
    depth = getattr(_local, "depth", 0)
    _local.depth = depth + 1
    try:
        yield con
        if depth == 0:
            con.commit()
    except Exception:
        if depth == 0:
            con.rollback()
        raise
    finally:
        _local.depth = depth


def init_db() -> None:
    with _init_lock, db_scope() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS students (
                admNo      TEXT PRIMARY KEY,
                first      TEXT,
                last       TEXT,
                fullName   TEXT,
                gender     TEXT,
                grade      TEXT,
                nemis      TEXT,
                assessment TEXT,
                parent     TEXT,
                phone      TEXT,
                dateAdded  TEXT,
                updated    TEXT DEFAULT (datetime('now','localtime'))
            )""")

        db.execute("""
            CREATE TABLE IF NOT EXISTS teachers (
                id           TEXT PRIMARY KEY,
                name         TEXT,
                phone        TEXT,
                classTeacher TEXT,
                assignments  TEXT,
                updated      TEXT DEFAULT (datetime('now','localtime'))
            )""")

        # Generic JSON-blob tables – one row per record, keyed by a string id.
        # raw_scores mirrors exams but holds the as-entered (unconverted) marks;
        # the processed exams rows are derived from it.
        for table in ("exams", "mean_scores", "booklist", "supervision_lists",
                      "raw_scores", "archived_exams", "archived_raw"):
            db.execute(f"""
                CREATE TABLE IF NOT EXISTS {table} (
                    id      TEXT PRIMARY KEY,
                    data    TEXT NOT NULL,
                    updated TEXT DEFAULT (datetime('now','localtime'))
                )""")

        # Key-value store for small blobs (counters, calendarEvents, attendance,
        # fees, comms and user:* accounts)
        db.execute("""
            CREATE TABLE IF NOT EXISTS kv_store (
                key     TEXT PRIMARY KEY,
                value   TEXT NOT NULL,
                updated TEXT DEFAULT (datetime('now','localtime'))
            )""")

        db.execute("""
            CREATE TABLE IF NOT EXISTS sync_tracking (
                table_name TEXT PRIMARY KEY,
                last_sync  TEXT DEFAULT (datetime('now','localtime'))
            )""")

        db.execute("""
            CREATE TABLE IF NOT EXISTS deleted_records (
                record_type TEXT NOT NULL,
                record_id   TEXT NOT NULL,
                deleted_at  TEXT DEFAULT (datetime('now','localtime')),
                PRIMARY KEY (record_type, record_id)
            )""")

        db.execute("""
            CREATE TABLE IF NOT EXISTS activity_log (
                id       INTEGER PRIMARY KEY AUTOINCREMENT,
                ts       TEXT DEFAULT (datetime('now','localtime')),
                username TEXT,
                action   TEXT,
                detail   TEXT,
                ip       TEXT
            )""")

        db.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                username TEXT PRIMARY KEY,
                role     TEXT DEFAULT 'user',
                updated  TEXT DEFAULT (datetime('now','localtime'))
            )""")

        for t in ("students", "teachers", "exams", "mean_scores",
                  "booklist", "supervision_lists", "raw_scores", "archived_exams",
                  "archived_raw"):
            db.execute(
                "INSERT OR IGNORE INTO sync_tracking(table_name, last_sync) "
                "VALUES(?, datetime('now','localtime'))", (t,))

        db.executescript("""
            CREATE INDEX IF NOT EXISTS idx_students_grade    ON students(grade);
            CREATE INDEX IF NOT EXISTS idx_students_adm      ON students(admNo);
            CREATE INDEX IF NOT EXISTS idx_teachers_name     ON teachers(name);
            CREATE INDEX IF NOT EXISTS idx_exams_id          ON exams(id);
            CREATE INDEX IF NOT EXISTS idx_archived_id       ON archived_exams(id);
            CREATE INDEX IF NOT EXISTS idx_archived_raw_id   ON archived_raw(id);
            CREATE INDEX IF NOT EXISTS idx_raw_scores_id     ON raw_scores(id);
            CREATE INDEX IF NOT EXISTS idx_mean_scores_id    ON mean_scores(id);
            CREATE INDEX IF NOT EXISTS idx_kv_key            ON kv_store(key);
            CREATE INDEX IF NOT EXISTS idx_activity_ts       ON activity_log(ts DESC);
        """)

        # Default counters / blobs
        db.execute("INSERT OR IGNORE INTO kv_store(key, value) VALUES('counters', ?)",
                   (json.dumps({"adm": 1, "tch": 1}),))
        db.execute("INSERT OR IGNORE INTO kv_store(key, value) VALUES('calendarEvents', '[]')")
        db.execute("INSERT OR IGNORE INTO kv_store(key, value) VALUES('attendance', '{}')")
        db.execute("INSERT OR IGNORE INTO kv_store(key, value) VALUES('fees', '{}')")
        db.execute("INSERT OR IGNORE INTO kv_store(key, value) VALUES('comms', '[]')")

    print("Database ready:", config.DB_PATH)


# ── contention retry ─────────────────────────────────────────────────────
def _is_locked_error(exc: BaseException) -> bool:
    return isinstance(exc, sqlite3.OperationalError) and "locked" in str(exc).lower()


def run_with_retry(fn, *, attempts: int = 4, base_delay: float = 0.05):
    """Run fn(); on 'database is locked' roll back and retry with backoff.

    Lets burst writes from many simultaneous users serialize gracefully
    instead of surfacing a 500. Each attempt gets a fresh transaction
    (db_scope rolls back on error), so retries never half-apply.
    """
    last = None
    for i in range(attempts):
        try:
            return fn()
        except Exception as exc:
            last = exc
            if not _is_locked_error(exc) or i == attempts - 1:
                raise
            time.sleep(base_delay * (2 ** i))
    raise last


# ── kv helpers ───────────────────────────────────────────────────────────────
def kv_get(db, key, default=None):
    row = db.execute("SELECT value FROM kv_store WHERE key=?", (key,)).fetchone()
    return json.loads(row["value"]) if row else default


def kv_set(db, key, value):
    db.execute(
        "INSERT INTO kv_store(key,value,updated) VALUES(?,?,datetime('now','localtime')) "
        "ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated=excluded.updated",
        (key, json.dumps(value)))


# ── stable record keys (identical to the legacy build) ──────────────────────
def exam_key(ex: dict) -> str:
    """One row per student per exam per term/year (the frontend never sets an
    exam id, so keying on admNo/exam/term/year is what keeps history intact)."""
    return f"{ex.get('admNo', '')}__{ex.get('examName', '')}__{ex.get('term', '')}__{ex.get('year', '')}"


def ms_key(ms: dict) -> str:
    return f"{ms.get('examId', '')}__{ms.get('grade', '')}"


def bl_key(b: dict) -> str:
    return b.get("id") or json.dumps(b, sort_keys=True)


def sv_key(sv: dict) -> str:
    return str(sv.get("createdAt") or json.dumps(sv, sort_keys=True))


# ── tombstones ───────────────────────────────────────────────────────────────
def mark_deleted(db, record_type: str, record_id: str) -> None:
    """Record a tombstone so this id can never be re-inserted by a stale sync."""
    db.execute("""
        INSERT OR REPLACE INTO deleted_records
        (record_type, record_id, deleted_at)
        VALUES (?, ?, datetime('now','localtime'))
    """, (record_type, record_id))


def tombstones_for(db) -> dict:
    """All tombstones as {record_type: set(record_id)} (one query per save)."""
    sets: dict = {}
    for r in db.execute("SELECT record_type, record_id FROM deleted_records"):
        sets.setdefault(r["record_type"], set()).add(r["record_id"])
    return sets

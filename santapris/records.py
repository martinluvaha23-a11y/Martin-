"""Full-database read, diff-based write and merge-restore.

Wire format is identical to the legacy build. The write path diffs incoming
records against stored ones so a save only touches rows that actually changed
— and skips the whole transaction when nothing changed. This removes the
legacy build's constant write-amplification (every save rewrote every row,
bumped the sync timestamp and made every connected device re-download the
entire database).
"""
import json
from datetime import datetime

from .database import (bl_key, exam_key, kv_get, kv_set, mark_deleted,
                       ms_key, sv_key, tombstones_for)

SYNC_TABLES = ("students", "teachers", "exams", "mean_scores",
               "booklist", "supervision_lists", "raw_scores", "archived_exams",
               "archived_raw")
STUDENT_COLS = ("first", "last", "fullName", "gender", "grade",
                "nemis", "assessment", "parent", "phone", "dateAdded")
TEACHER_COLS = ("name", "phone", "classTeacher", "assignments")
KV_KEYS = ("counters", "calendarEvents", "attendance", "fees", "comms",
           "dutyRota", "subjects", "examRegistry", "conversion", "specialTT",
           "rubrics", "publishers", "bookSubjects", "booklists", "bookLetterhead",
           "tblGrades", "tblAllocations")


# Grades 7-9 store ENG/KIS components as PP1/PP2; older clients stored the
# same components as GRA/COMP/LUG/INS. Normalize on write (additive only:
# fill a missing side from the present side) so a stale device pushing old
# snapshots can never wipe the other key set again, and every reader finds
# values regardless of which client version saved them.
_PP_MIRROR = (("ENG PP1", "GRA"), ("ENG PP2", "COMP"),
              ("KIS PP1", "LUG"), ("KIS PP2", "INS"))


def _normalize_subscores(grade, subscores):
    """Mirror PP<->legacy component keys for grades 7-9. Mutates and returns
    the dict. Never deletes, never alters values — only fills gaps."""
    if not isinstance(subscores, dict):
        return subscores
    if not grade or str(grade)[0] not in "789":
        return subscores
    for new_k, old_k in _PP_MIRROR:
        if subscores.get(new_k) is None and subscores.get(old_k) is not None:
            subscores[new_k] = subscores[old_k]
        elif subscores.get(old_k) is None and subscores.get(new_k) is not None:
            subscores[old_k] = subscores[new_k]
    return subscores


# ── Subject-level removal tombstones ─────────────────────────────────────
# Removing one subject's scores (admin clears a cell) must survive pushes
# from devices holding older snapshots — otherwise the old value is
# resurrected on the next sync. Whole-record deletes already work this way;
# subjects get the same treatment. Re-adding is explicit: a push carrying a
# value for a tombstoned subject must list it under payload "_forceSubjects"
# (which only a client looking at post-removal state does), otherwise the
# value is treated as stale and stripped.
_SUBJ_SEP = "__SUBJ:"
_SUB_COMPONENTS = {
    "ENG": {"ENG PP1", "ENG PP2", "GRA", "COMP"},
    "KIS": {"KIS PP1", "KIS PP2", "LUG", "INS"},
    "SCIE": {"SCIE PP1", "SCIE PP2"},
}


def subj_tomb_id(exam_key_str: str, subj: str) -> str:
    return f"{exam_key_str}{_SUBJ_SEP}{subj}"


def subject_tombs_for(db) -> dict:
    """{exam_key: set(subjects)} for removal tombstones (one query per save)."""
    out: dict = {}
    for r in db.execute(
            "SELECT record_id FROM deleted_records WHERE record_type='exam_subject'"):
        rid = r["record_id"]
        if _SUBJ_SEP in rid:
            key, subj = rid.rsplit(_SUBJ_SEP, 1)
            out.setdefault(key, set()).add(subj)
    return out


def strip_tombstoned_subjects(ex: dict, tombs: set) -> dict:
    """Return a copy of the exam record with tombstoned subjects removed
    (scores, rubrics, and any sub-component keys)."""
    if not tombs:
        return ex
    ex = dict(ex)
    scores = dict(ex.get("scores") or {})
    rubrics = dict(ex.get("rubrics") or {})
    subs = dict(ex.get("subScores") or {})
    for s in tombs:
        scores.pop(s, None)
        rubrics.pop(s, None)
        for sub in _SUB_COMPONENTS.get(s, ()):
            subs.pop(sub, None)
    ex["scores"] = scores
    ex["rubrics"] = rubrics
    ex["subScores"] = subs
    return ex


def remove_exam_subject(db, key: str, subj: str) -> str:
    """Strip one subject from a stored exam row and tombstone it so stale
    pushes can't resurrect it. If no subjects remain, the whole row is
    removed (with a whole-record tombstone). Returns
    'stripped' | 'deleted-row' | 'missing'. Additive-safe: never touches
    other subjects."""
    row = db.execute("SELECT data FROM exams WHERE id=?", (key,)).fetchone()
    if not row:
        return "missing"
    ex = strip_tombstoned_subjects(json.loads(row["data"]), {subj})
    mark_deleted(db, "exam_subject", subj_tomb_id(key, subj))
    # Mirror the removal into the raw-scores row (same id) so the Raw view
    # stays consistent and a future raw-save can't resurrect the subject.
    rrow = db.execute("SELECT data FROM raw_scores WHERE id=?", (key,)).fetchone()
    if rrow:
        rex = strip_tombstoned_subjects(json.loads(rrow["data"]), {subj})
        if rex.get("scores") or rex.get("subScores"):
            db.execute("UPDATE raw_scores SET data=?, updated=datetime('now','localtime') "
                       "WHERE id=?", (json.dumps(rex), key))
        else:
            db.execute("DELETE FROM raw_scores WHERE id=?", (key,))
    if ex.get("scores"):
        db.execute("UPDATE exams SET data=?, updated=datetime('now','localtime') "
                   "WHERE id=?", (json.dumps(ex), key))
        return "stripped"
    db.execute("DELETE FROM exams WHERE id=?", (key,))
    mark_deleted(db, "exam", key)
    return "deleted-row"


def archive_exam(db, exam_name: str) -> dict:
    """Move every live row of one exam into the archive bin under its ORIGINAL
    name — exams rows to archived_exams, raw rows to archived_raw (separate
    tables so neither clobbers the other). Tombstones each moved key plus a
    name-level tombstone so stale pushes can't resurrect them.
    Returns {moved, examName} (moved counts exam-table rows)."""
    moved = 0
    for r in db.execute("SELECT id, data FROM exams").fetchall():
        try:
            d = json.loads(r["data"])
        except Exception:
            continue
        if (d.get("examName") or "") != exam_name:
            continue
        db.execute("""
            INSERT OR REPLACE INTO archived_exams (id,data,updated)
            VALUES (?,?,datetime('now','localtime'))""", (r["id"], r["data"]))
        db.execute("DELETE FROM exams WHERE id=?", (r["id"],))
        mark_deleted(db, "exam", r["id"])
        moved += 1
    for r in db.execute("SELECT id, data FROM raw_scores").fetchall():
        try:
            d = json.loads(r["data"])
        except Exception:
            continue
        if (d.get("examName") or "") != exam_name:
            continue
        db.execute("""
            INSERT OR REPLACE INTO archived_raw (id,data,updated)
            VALUES (?,?,datetime('now','localtime'))""", (r["id"], r["data"]))
        db.execute("DELETE FROM raw_scores WHERE id=?", (r["id"],))
    # Name-level tombstone: any stale or future push carrying this exam name
    # is ignored everywhere until an explicit restore clears it.
    mark_deleted(db, "exam_name", exam_name)
    return {"moved": moved, "examName": exam_name}


def restore_archived(db, exam_name: str) -> dict:
    """Move archived rows of one exam back to their origin tables (original
    names): archived_exams → exams, archived_raw → raw_scores. Clears their
    exam tombstones so the restore sticks. Returns {restored}."""
    restored = 0
    db.execute("DELETE FROM deleted_records WHERE record_type='exam_name' AND record_id=?",
               (exam_name,))
    for table in ("archived_exams", "archived_raw"):
        dest = "exams" if table == "archived_exams" else "raw_scores"
        for r in db.execute(f"SELECT id, data FROM {table}").fetchall():
            try:
                d = json.loads(r["data"])
            except Exception:
                continue
            if (d.get("examName") or "") != exam_name:
                continue
            db.execute("DELETE FROM deleted_records WHERE record_type='exam' AND record_id=?", (r["id"],))
            if d.get("admNo"):
                db.execute(f"""
                    INSERT OR REPLACE INTO {dest} (id,data,updated)
                    VALUES (?,?,datetime('now','localtime'))""", (r["id"], r["data"]))
                restored += 1
            db.execute(f"DELETE FROM {table} WHERE id=?", (r["id"],))
    return {"restored": restored, "examName": exam_name}


def purge_archived(db, exam_name: str) -> dict:
    """Permanently delete one exam's archived rows from both archive tables.
    Exam tombstones are KEPT so stale devices can never resurrect them.
    Returns {purged}."""
    purged = 0
    for table in ("archived_exams", "archived_raw"):
        for r in db.execute(f"SELECT id, data FROM {table}").fetchall():
            try:
                d = json.loads(r["data"])
            except Exception:
                continue
            if (d.get("examName") or "") != exam_name:
                continue
            db.execute(f"DELETE FROM {table} WHERE id=?", (r["id"],))
            purged += 1
    return {"purged": purged, "examName": exam_name}



def _s(v) -> str:
    return "" if v is None else str(v)


def _canon(obj) -> str:
    return json.dumps(obj, sort_keys=True, ensure_ascii=False)


def _touch_sync(db) -> None:
    for t in SYNC_TABLES:
        db.execute(
            "UPDATE sync_tracking SET last_sync=datetime('now','localtime') "
            "WHERE table_name=?", (t,))


def read_full_db(db) -> dict:
    students = [dict(r) for r in
                db.execute("SELECT * FROM students ORDER BY admNo").fetchall()]

    teachers = []
    for r in db.execute("SELECT * FROM teachers ORDER BY name").fetchall():
        t = dict(r)
        t["assignments"] = json.loads(t["assignments"]) if t.get("assignments") else []
        teachers.append(t)

    exams = [json.loads(r["data"]) for r in
             db.execute("SELECT data FROM exams ORDER BY id").fetchall()]
    raw_scores = [json.loads(r["data"]) for r in
                  db.execute("SELECT data FROM raw_scores ORDER BY id").fetchall()]
    archived_exams = [json.loads(r["data"]) for r in
                      db.execute("SELECT data FROM archived_exams ORDER BY id").fetchall()]
    archived_raw = [json.loads(r["data"]) for r in
                    db.execute("SELECT data FROM archived_raw ORDER BY id").fetchall()]
    mean_scores = [json.loads(r["data"]) for r in
                   db.execute("SELECT data FROM mean_scores ORDER BY id").fetchall()]
    booklist = [json.loads(r["data"]) for r in
                db.execute("SELECT data FROM booklist ORDER BY id").fetchall()]
    supervision_lists = [json.loads(r["data"]) for r in
                         db.execute("SELECT data FROM supervision_lists ORDER BY id").fetchall()]

    counters = kv_get(db, "counters", {"adm": 1, "tch": 1})
    calendar_events = kv_get(db, "calendarEvents", [])
    attendance = kv_get(db, "attendance", {})
    fees = kv_get(db, "fees", {})
    comms = kv_get(db, "comms", [])
    duty_rota = kv_get(db, "dutyRota", {})
    subjects = kv_get(db, "subjects", [])
    exam_registry = kv_get(db, "examRegistry", [])
    conversion = kv_get(db, "conversion", {})
    special_tt = kv_get(db, "specialTT", {})
    rubrics = kv_get(db, "rubrics", {})
    publishers = kv_get(db, "publishers", [])
    book_subjects = kv_get(db, "bookSubjects", None)
    booklists = kv_get(db, "booklists", [])
    book_letterhead = kv_get(db, "bookLetterhead", None)
    tbl_grades = kv_get(db, "tblGrades", None)
    tbl_allocations = kv_get(db, "tblAllocations", [])

    deleted_records = [dict(r) for r in db.execute(
        "SELECT record_type, record_id, deleted_at FROM deleted_records").fetchall()]

    return {
        "students": students,
        "teachers": teachers,
        "exams": exams,
        "rawScores": raw_scores,
        "archivedExams": archived_exams,
        "archivedRaw": archived_raw,
        "meanScores": mean_scores,
        "booklist": booklist,
        "supervisionLists": supervision_lists,
        "counters": counters,
        "calendarEvents": calendar_events,
        "attendance": attendance,
        "fees": fees,
        "comms": comms,
        "dutyRota": duty_rota,
        "subjects": subjects,
        "examRegistry": exam_registry,
        "conversion": conversion,
        "specialTT": special_tt,
        "rubrics": rubrics,
        "publishers": publishers,
        "bookSubjects": book_subjects,
        "booklists": booklists,
        "bookLetterhead": book_letterhead,
        "tblGrades": tbl_grades,
        "tblAllocations": tbl_allocations,
        "deletedRecords": deleted_records,
    }


def _ts_key(ts):
    """Sortable key for the mixed timestamp formats in this DB
    ('YYYY-MM-DD HH:MM:SS' vs legacy 'DD/MM/YYYY'). Returns an ISO string
    so lexicographic order == chronological order; '' sorts last."""
    from datetime import datetime
    s = (ts or '').strip().replace('T', ' ')
    for fmt in ('%Y-%m-%d %H:%M:%S', '%Y-%m-%d', '%d/%m/%Y %H:%M:%S', '%d/%m/%Y'):
        try:
            return datetime.strptime(s, fmt).strftime('%Y-%m-%d %H:%M:%S')
        except Exception:
            continue
    return ''


def recent_activity(db, n: int = 5) -> list:
    """Five latest human-readable events for the dashboard ticker: newest
    exam submissions (grouped by exam+grade) and newest learner
    registrations, merged by timestamp, newest first."""
    events = []
    try:
        seen = set()
        for r in db.execute(
                "SELECT data, updated FROM exams ORDER BY updated DESC LIMIT 300").fetchall():
            try:
                d = json.loads(r["data"])
            except Exception:
                continue
            key = ((d.get("examName") or "Untitled Exam"),
                   (d.get("grade") or ""), (d.get("term") or ""),
                   str(d.get("year") or ""))
            if key in seen:
                continue
            seen.add(key)
            cnt = db.execute(
                "SELECT COUNT(*) FROM exams WHERE "
                "json_extract(data,'$.examName')=? AND "
                "json_extract(data,'$.grade')=? AND "
                "json_extract(data,'$.term')=? AND "
                "CAST(json_extract(data,'$.year') AS TEXT)=?",
                key).fetchone()[0]
            events.append({
                "kind": "scores",
                "text": "GRADE %s %s SCORES SUBMITTED (%d LEARNER%s)" % (
                    key[1], key[0], cnt, "" if cnt == 1 else "S"),
                "ts": r["updated"],
            })
            if len([e for e in events if e["kind"] == "scores"]) >= n:
                break
    except Exception:
        pass
    try:
        reg = []
        for r in db.execute(
                "SELECT grade, substr(dateAdded,1,10) AS day, COUNT(*) AS c, "
                "MAX(dateAdded) AS ts FROM students WHERE dateAdded IS NOT NULL "
                "AND dateAdded != '' GROUP BY grade, day "
                "ORDER BY ts DESC LIMIT 20").fetchall():
            iso = _ts_key(r["ts"])
            reg.append({
                "kind": "register",
                "text": "%d NEW LEARNER%s JOINED GRADE %s" % (
                    r["c"], "" if r["c"] == 1 else "S", r["grade"]),
                "ts": iso if iso else (r["ts"] or ""),
            })
        reg.sort(key=lambda e: _ts_key(e.get("ts") or ""), reverse=True)
        events.extend(reg[:5])
    except Exception:
        pass
    events.sort(key=lambda e: _ts_key(e.get("ts") or ""), reverse=True)
    return events[:n]


def write_full_db(db, data: dict) -> dict:
    """Upsert records from data — NEVER issues an implicit DELETE, so a race or
    empty push cannot wipe rows that already exist in the database. Individual
    deletions are handled by the dedicated DELETE endpoints.

    IMPORTANT: any 'deletedRecords' key in `data` is intentionally ignored.
    Tombstones are written exclusively by mark_deleted() inside the DELETE
    endpoints — the client is never authoritative over the deleted_records
    table, and a save never deletes rows that are merely absent from the
    payload (see the exams section below).
    """
    stats = {"students": 0, "teachers": 0, "exams": 0, "mean_scores": 0,
             "booklist": 0, "supervision_lists": 0, "kv": 0, "purged_exams": 0,
             "skipped_names": 0}
    tb = tombstones_for(db)
    # Exam names archived away: rows carrying them are ignored on push until
    # an explicit archive-restore clears the name.
    name_tombs = {r["record_id"] for r in
                  db.execute("SELECT record_id FROM deleted_records "
                             "WHERE record_type='exam_name'").fetchall()}

    # ── Students: upsert changed rows only ────────────────────────────────
    rows = {r["admNo"]: r for r in db.execute("SELECT * FROM students").fetchall()}
    for s in data.get("students", []):
        adm = s.get("admNo")
        if not adm or adm in tb.get("student", ()):
            continue
        full = s.get("fullName", f"{s.get('first', '')} {s.get('last', '')}")
        date_added = s.get("dateAdded", datetime.now().strftime("%d/%m/%Y"))
        vals = tuple(_s(v) for v in (
            s.get("first", ""), s.get("last", ""), full,
            s.get("gender", ""), s.get("grade", ""), s.get("nemis", ""),
            s.get("assessment", ""), s.get("parent", ""), s.get("phone", ""),
            date_added))
        row = rows.get(adm)
        if row is not None and all(_s(row[c]) == v for c, v in zip(STUDENT_COLS, vals)):
            continue
        db.execute("""
            INSERT OR REPLACE INTO students
            (admNo,first,last,fullName,gender,grade,nemis,assessment,parent,phone,dateAdded,updated)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,datetime('now','localtime'))""", (adm, *vals))
        stats["students"] += 1

    # ── Teachers: upsert changed rows only ────────────────────────────────
    trows = {r["id"]: r for r in db.execute("SELECT * FROM teachers").fetchall()}
    for t in data.get("teachers", []):
        tid = t.get("id")
        if not tid or tid in tb.get("teacher", ()):
            continue
        vals = (t.get("name", ""), t.get("phone", ""),
                t.get("classTeacher", ""), json.dumps(t.get("assignments", [])))
        row = trows.get(tid)
        if row is not None and all((_s(row[c]) if c != "assignments" else row[c]) == v
                                   for c, v in zip(TEACHER_COLS, vals)):
            continue
        db.execute("""
            INSERT OR REPLACE INTO teachers (id,name,phone,classTeacher,assignments,updated)
            VALUES (?,?,?,?,?,datetime('now','localtime'))""", (tid, *vals))
        stats["teachers"] += 1

    # ── Exams: upsert present records; NEVER delete absent ones ──────────
    # A push only ever adds/updates. Rows missing from a payload are NOT
    # deletions: with many devices on different snapshot ages, absence just
    # means "this client hadn't synced it yet". (An older build purged absent
    # rows here, which wiped freshly-saved records whenever two devices saved
    # concurrently, then tombstoned them so re-saving silently did nothing.)
    # Real deletions go exclusively through DELETE /api/exams, which creates
    # the tombstone explicitly. Every UI delete flow calls that endpoint.
    exrows = {r["id"]: r["data"] for r in
              db.execute("SELECT id, data FROM exams").fetchall()}
    subj_tombs = subject_tombs_for(db)
    # Explicit re-add intent: {exam_key: [subjects]}. Only a client looking at
    # post-removal state lists a subject here, so clearing is safe.
    force = data.get("_forceSubjects") or {}
    if isinstance(force, dict):
        for fkey, subs in force.items():
            for s in (subs or []):
                db.execute(
                    "DELETE FROM deleted_records WHERE record_type='exam_subject' "
                    "AND record_id=?", (subj_tomb_id(fkey, s),))
        subj_tombs = subject_tombs_for(db)  # re-read after clearing
    # Explicit exam re-add intent (rename-merge onto a previously deleted exam
    # name): clear whole-exam tombstones for these keys so the merge can land.
    # Stale pushes never list keys here — only deliberate UI actions do.
    clear_keys = data.get("_clearExamTombs") or []
    if isinstance(clear_keys, list):
        for ck in clear_keys:
            db.execute(
                "DELETE FROM deleted_records WHERE record_type='exam' "
                "AND record_id=?", (ck,))
        tb = tombstones_for(db)  # re-read after clearing
    incoming_keys = set()
    for ex in data.get("exams", []):
        key = exam_key(ex)
        if key in tb.get("exam", ()):
            continue
        if (ex.get("examName") or "") in name_tombs:
            stats["skipped_names"] += 1
            continue
        incoming_keys.add(key)
        if key in subj_tombs:
            ex = strip_tombstoned_subjects(ex, subj_tombs[key])
        if isinstance(ex.get("subScores"), dict):
            ex = dict(ex, subScores=_normalize_subscores(ex.get("grade"), dict(ex["subScores"])))
        stored = exrows.get(key)
        # Dict comparison (C-speed) instead of canon-dumps on both sides:
        # same skip decision, ~2x less serialization per row, and no
        # spurious rewrite for semantically identical values (e.g. 85/85.0).
        if stored is not None and json.loads(stored) == ex:
            continue
        db.execute("""
            INSERT OR REPLACE INTO exams (id,data,updated)
            VALUES (?,?,datetime('now','localtime'))""", (key, json.dumps(ex)))
        stats["exams"] += 1

    # NOTE: no purge of rows absent from the payload (see comment above).

    # ── Raw scores: as-entered marks, same keys as exams ──────────────────
    # Never normalized (raw stays raw) and never purged. Whole-exam and
    # subject tombstones are honoured so deletions stay deleted.
    rawrows = {r["id"]: r["data"] for r in
               db.execute("SELECT id, data FROM raw_scores").fetchall()}
    for rx in data.get("rawScores", []):
        key = exam_key(rx)
        if key in tb.get("exam", ()):
            continue
        if (rx.get("examName") or "") in name_tombs:
            stats["skipped_names"] += 1
            continue
        if key in subj_tombs:
            rx = strip_tombstoned_subjects(rx, subj_tombs[key])
        stored = rawrows.get(key)
        if stored is not None and json.loads(stored) == rx:
            continue
        db.execute("""
            INSERT OR REPLACE INTO raw_scores (id,data,updated)
            VALUES (?,?,datetime('now','localtime'))""", (key, json.dumps(rx)))
        stats["exams"] += 1

    # ── Archived exams: originals kept under original names ──────────────
    # Never shown in live views; never purged. Whole-exam tombstones are
    # honoured so deleted exams can't sneak back via the archive.
    for table, list_key in (("archived_exams", "archivedExams"),
                            ("archived_raw", "archivedRaw")):
        archrows = {r["id"]: r["data"] for r in
                    db.execute(f"SELECT id, data FROM {table}").fetchall()}
        for ax in data.get(list_key, []):
            key = exam_key(ax)
            if key in tb.get("exam", ()):
                continue
            stored = archrows.get(key)
            if stored is not None and json.loads(stored) == ax:
                continue
            db.execute(f"""
                INSERT OR REPLACE INTO {table} (id,data,updated)
                VALUES (?,?,datetime('now','localtime'))""", (key, json.dumps(ax)))
            stats["exams"] += 1

    # ── MeanScores / Booklist / SupervisionLists: upsert changed only ──────
    for table, list_key, key_fn, stat in (
            ("mean_scores", "meanScores", ms_key, "mean_scores"),
            ("booklist", "booklist", bl_key, "booklist"),
            ("supervision_lists", "supervisionLists", sv_key, "supervision_lists")):
        brows = {r["id"]: r["data"] for r in
                 db.execute(f"SELECT id, data FROM {table}").fetchall()}
        for rec in data.get(list_key, []):
            key = key_fn(rec)
            stored = brows.get(key)
            if stored is not None and json.loads(stored) == rec:
                continue
            db.execute(f"""
                INSERT OR REPLACE INTO {table} (id,data,updated)
                VALUES (?,?,datetime('now','localtime'))""", (key, json.dumps(rec)))
            stats[stat] += 1

    # ── KV blobs: upsert changed only ──────────────────────────────────────
    kvrows = {r["key"]: r["value"] for r in
              db.execute("SELECT key, value FROM kv_store").fetchall()}
    for key in KV_KEYS:
        if key not in data:
            continue
        stored = kvrows.get(key)
        if stored is not None and json.loads(stored) == data[key]:
            continue
        kv_set(db, key, data[key])
        stats["kv"] += 1

    stats["changed"] = any(v for k, v in stats.items() if k not in ("changed", "skipped_names"))
    if stats["changed"]:
        _touch_sync(db)
    return stats


def restore_backup(db, backup: dict) -> dict:
    """Merge a backup into the live DB — add new records, fill empty fields in
    existing students. Identical semantics to the legacy /api/restore."""
    existing_students = {r["admNo"]: dict(r) for r in
                         db.execute("SELECT * FROM students").fetchall()}
    added_s = 0
    for s in backup.get("students", []):
        adm = s.get("admNo", "")
        if not adm:
            continue
        if adm not in existing_students:
            db.execute("""
                INSERT INTO students
                (admNo,first,last,fullName,gender,grade,nemis,assessment,parent,phone,dateAdded,updated)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,datetime('now','localtime'))""", (
                adm, s.get("first", ""), s.get("last", ""),
                s.get("fullName", ""), s.get("gender", ""), s.get("grade", ""),
                s.get("nemis", ""), s.get("assessment", ""),
                s.get("parent", ""), s.get("phone", ""),
                s.get("dateAdded", datetime.now().strftime("%d/%m/%Y"))))
            added_s += 1
        else:
            db.execute("""
                UPDATE students SET
                  first      = CASE WHEN (first IS NULL OR first='')      THEN ? ELSE first END,
                  last       = CASE WHEN (last  IS NULL OR last='')       THEN ? ELSE last  END,
                  fullName   = CASE WHEN (fullName IS NULL OR fullName='') THEN ? ELSE fullName END,
                  gender     = CASE WHEN (gender IS NULL OR gender='')    THEN ? ELSE gender END,
                  grade      = CASE WHEN (grade IS NULL OR grade='')      THEN ? ELSE grade  END,
                  nemis      = CASE WHEN (nemis IS NULL OR nemis='')      THEN ? ELSE nemis  END,
                  assessment = CASE WHEN (assessment IS NULL OR assessment='') THEN ? ELSE assessment END,
                  parent     = CASE WHEN (parent IS NULL OR parent='')    THEN ? ELSE parent END,
                  phone      = CASE WHEN (phone IS NULL OR phone='')      THEN ? ELSE phone  END
                WHERE admNo=?""", (
                s.get("first", ""), s.get("last", ""), s.get("fullName", ""),
                s.get("gender", ""), s.get("grade", ""), s.get("nemis", ""),
                s.get("assessment", ""), s.get("parent", ""), s.get("phone", ""),
                adm))

    existing_teachers = {r["id"] for r in db.execute("SELECT id FROM teachers").fetchall()}
    added_t = 0
    for t in backup.get("teachers", []):
        tid = t.get("id", "")
        if tid and tid not in existing_teachers:
            db.execute("""
                INSERT INTO teachers (id,name,phone,classTeacher,assignments,updated)
                VALUES (?,?,?,?,?,datetime('now','localtime'))""", (
                tid, t.get("name", ""), t.get("phone", ""),
                t.get("classTeacher", ""), json.dumps(t.get("assignments", []))))
            added_t += 1

    existing_exams = {r["id"] for r in db.execute("SELECT id FROM exams").fetchall()}
    name_tombs_restore = {r["record_id"] for r in db.execute(
        "SELECT record_id FROM deleted_records WHERE record_type='exam_name'").fetchall()}
    added_e = 0
    for ex in backup.get("exams", []):
        key = exam_key(ex)
        if key not in existing_exams and (ex.get("examName") or "") not in name_tombs_restore:
            if isinstance(ex.get("subScores"), dict):
                ex = dict(ex, subScores=_normalize_subscores(ex.get("grade"), dict(ex["subScores"])))
            db.execute("""
                INSERT OR IGNORE INTO exams (id,data,updated)
                VALUES (?,?,datetime('now','localtime'))""", (key, json.dumps(ex)))
            added_e += 1

    for table, list_key, key_fn in (
            ("mean_scores", "meanScores", ms_key),
            ("booklist", "booklist", bl_key),
            ("raw_scores", "rawScores", exam_key),
            ("archived_exams", "archivedExams", exam_key),
            ("archived_raw", "archivedRaw", exam_key),
            ("supervision_lists", "supervisionLists", sv_key)):
        existing = {r["id"] for r in db.execute(f"SELECT id FROM {table}").fetchall()}
        for rec in backup.get(list_key, []):
            key = key_fn(rec)
            if key not in existing:
                db.execute(f"""
                    INSERT OR IGNORE INTO {table} (id,data,updated)
                    VALUES (?,?,datetime('now','localtime'))""", (key, json.dumps(rec)))

    if "counters" in backup:
        cur = kv_get(db, "counters", {"adm": 1, "tch": 1})
        bc = backup["counters"]
        kv_set(db, "counters", {
            "adm": max(cur.get("adm", 1), bc.get("adm", 1)),
            "tch": max(cur.get("tch", 1), bc.get("tch", 1)),
        })

    for kv_key in ("calendarEvents", "comms"):
        if kv_key in backup and isinstance(backup[kv_key], list):
            cur = kv_get(db, kv_key, [])
            existing_ids = {_canon(x) for x in cur}
            for item in backup[kv_key]:
                if _canon(item) not in existing_ids:
                    cur.append(item)
            kv_set(db, kv_key, cur)

    _touch_sync(db)
    total_s = db.execute("SELECT COUNT(*) FROM students").fetchone()[0]
    total_t = db.execute("SELECT COUNT(*) FROM teachers").fetchone()[0]
    sync_row = db.execute(
        "SELECT last_sync FROM sync_tracking WHERE table_name='students'").fetchone()
    last_sync = sync_row["last_sync"] if sync_row else datetime.now().isoformat()

    return {"added_s": added_s, "added_t": added_t, "added_e": added_e,
            "total_s": total_s, "total_t": total_t, "last_sync": last_sync}

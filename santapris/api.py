"""All /api endpoints.

Wire-compatible with the legacy build: same paths, same payloads, same status
codes and error messages. Responses may carry extra informational fields
(e.g. "changed" on /api/db/save).
"""
import asyncio
import json
import secrets
import sqlite3
from datetime import datetime

from fastapi import APIRouter, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse, Response
from starlette.responses import StreamingResponse

from . import audit, cache, config, database, events, records, security

router = APIRouter()


def _last_sync(db, table: str) -> str:
    row = db.execute("SELECT last_sync FROM sync_tracking WHERE table_name=?", (table,)).fetchone()
    return row["last_sync"] if row else datetime.now().isoformat()


# ── Full DB GET (frontend loadDB) ─────────────────────────────────────────────
@router.get("/api/db")
async def api_db_get(request: Request):
    body, etag = await run_in_threadpool(cache.get_snapshot)
    if request.headers.get("if-none-match") == etag:
        resp = Response(status_code=304)
    else:
        resp = Response(content=body, media_type="application/json")
    resp.headers["ETag"] = etag
    resp.headers["Cache-Control"] = "no-cache"
    return resp


def _save_job(data: dict) -> dict:
    # Retry on writer contention so burst saves from many simultaneous
    # users serialize gracefully instead of failing.
    def _do():
        with database.db_scope() as db:
            return records.write_full_db(db, data)
    return database.run_with_retry(_do)


def _locked_response():
    # Client push treats non-2xx as "try again later" and keeps local data,
    # so a busy server never causes data loss — the next save/poll retries.
    return JSONResponse({"ok": False, "error": "server busy, please retry"}, 503)


@router.post("/api/db/save")
async def api_db_save(request: Request):
    try:
        data = await request.json()
    except Exception:
        return JSONResponse({"ok": False, "error": "Invalid JSON"}, 400)
    try:
        stats = await run_in_threadpool(_save_job, data)
    except sqlite3.OperationalError:
        return _locked_response()
    changed = bool(stats.get("changed"))
    etag = None
    ts = None
    if changed:
        cache.invalidate()
        # Warm the cache so the saving client learns the new ts/etag and can
        # skip the redundant full re-read on its next poll (304 → no re-render).
        _, etag = await run_in_threadpool(cache.get_snapshot)
        ts = etag.strip('"') if etag else None
        events.hub.broadcast("db-changed", {"table": "all", "action": "save", "_self": False})
    return JSONResponse({"ok": True, "changed": changed, "ts": ts, "etag": etag,
                           "skipped_names": int(stats.get("skipped_names") or 0)})


# ── Students ──────────────────────────────────────────────────────────────────
@router.get("/api/students")
async def get_students(after: str = None):
    with database.db_scope() as db:
        if after:
            rows = db.execute(
                "SELECT * FROM students WHERE updated > ? ORDER BY admNo", (after,)).fetchall()
        else:
            rows = db.execute("SELECT * FROM students ORDER BY admNo").fetchall()
        last_sync = _last_sync(db, "students")
    return JSONResponse({"students": [dict(r) for r in rows], "last_sync": last_sync})


@router.post("/api/students")
async def add_or_update_student(request: Request):
    try:
        data = await request.json()
    except Exception:
        return JSONResponse({"ok": False, "error": "Invalid JSON"}, 400)
    for field in ("admNo", "first", "last", "gender", "grade"):
        if field not in data:
            return JSONResponse({"ok": False, "error": f"Missing: {field}"}, 400)
    with database.db_scope() as db:
        db.execute("""
            INSERT OR REPLACE INTO students
            (admNo,first,last,fullName,gender,grade,nemis,assessment,parent,phone,dateAdded,updated)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,datetime('now','localtime'))""", (
            data["admNo"], data["first"], data["last"],
            f"{data['first']} {data['last']}",
            data["gender"], data["grade"],
            data.get("nemis", ""), data.get("assessment", ""),
            data.get("parent", ""), data.get("phone", ""),
            data.get("dateAdded", datetime.now().strftime("%d/%m/%Y"))))
        db.execute("UPDATE sync_tracking SET last_sync=datetime('now','localtime') "
                   "WHERE table_name='students'")
        last_sync = _last_sync(db, "students")
    audit.log(request, "save-student", f"admNo={data['admNo']} grade={data['grade']}")
    cache.invalidate()
    events.hub.broadcast("db-changed", {"table": "students", "action": "save",
                                        "admNo": data["admNo"], "last_sync": last_sync})
    return JSONResponse({"ok": True, "admNo": data["admNo"], "last_sync": last_sync})


@router.delete("/api/students/{admNo}")
async def delete_student(admNo: str, request: Request):
    if security.current_role(request) != "admin":
        return JSONResponse({"ok": False, "error": "Admin privilege required"}, status_code=403)
    with database.db_scope() as db:
        database.mark_deleted(db, "student", admNo)
        db.execute("DELETE FROM students WHERE admNo=?", (admNo,))
        db.execute("UPDATE sync_tracking SET last_sync=datetime('now','localtime') "
                   "WHERE table_name='students'")
        last_sync = _last_sync(db, "students")
    audit.log(request, "delete-student", f"admNo={admNo}")
    cache.invalidate()
    events.hub.broadcast("db-changed", {"table": "students", "action": "delete",
                                        "admNo": admNo, "last_sync": last_sync})
    return JSONResponse({"ok": True, "last_sync": last_sync})


# ── Teachers ──────────────────────────────────────────────────────────────────
@router.get("/api/teachers")
async def get_teachers(after: str = None):
    with database.db_scope() as db:
        if after:
            rows = db.execute(
                "SELECT * FROM teachers WHERE updated > ? ORDER BY name", (after,)).fetchall()
        else:
            rows = db.execute("SELECT * FROM teachers ORDER BY name").fetchall()
        last_sync = _last_sync(db, "teachers")
    teachers = []
    for r in rows:
        t = dict(r)
        t["assignments"] = json.loads(t["assignments"]) if t.get("assignments") else []
        teachers.append(t)
    return JSONResponse({"teachers": teachers, "last_sync": last_sync})


@router.post("/api/teachers")
async def add_or_update_teacher(request: Request):
    try:
        data = await request.json()
    except Exception:
        return JSONResponse({"ok": False, "error": "Invalid JSON"}, 400)
    if not data.get("id"):
        return JSONResponse({"ok": False, "error": "Missing: id"}, 400)
    if not data.get("name"):
        return JSONResponse({"ok": False, "error": "Missing: name"}, 400)
    with database.db_scope() as db:
        db.execute("""
            INSERT OR REPLACE INTO teachers (id, name, phone, classTeacher, assignments, updated)
            VALUES (?, ?, ?, ?, ?, datetime('now','localtime'))""", (
            data["id"], data["name"],
            data.get("phone", ""), data.get("classTeacher", ""),
            json.dumps(data.get("assignments", []))))
        db.execute("UPDATE sync_tracking SET last_sync=datetime('now','localtime') "
                   "WHERE table_name='teachers'")
        last_sync = _last_sync(db, "teachers")
    audit.log(request, "save-teacher", f"id={data['id']} name={data['name']}")
    cache.invalidate()
    events.hub.broadcast("db-changed", {"table": "teachers", "action": "save",
                                        "id": data["id"], "last_sync": last_sync})
    return JSONResponse({"ok": True, "id": data["id"], "last_sync": last_sync})


@router.delete("/api/teachers/{teacher_id}")
async def delete_teacher(teacher_id: str, request: Request):
    if security.current_role(request) != "admin":
        return JSONResponse({"ok": False, "error": "Admin privilege required"}, status_code=403)
    with database.db_scope() as db:
        database.mark_deleted(db, "teacher", teacher_id)
        db.execute("DELETE FROM teachers WHERE id=?", (teacher_id,))
        db.execute("UPDATE sync_tracking SET last_sync=datetime('now','localtime') "
                   "WHERE table_name='teachers'")
        last_sync = _last_sync(db, "teachers")
    audit.log(request, "delete-teacher", f"id={teacher_id}")
    cache.invalidate()
    events.hub.broadcast("db-changed", {"table": "teachers", "action": "delete",
                                        "id": teacher_id, "last_sync": last_sync})
    return JSONResponse({"ok": True, "last_sync": last_sync})


# ── Exams (subject-level delete) ─────────────────────────────────────────────
# Clearing one subject's scores must stick: without a tombstone, any device
# holding an older snapshot resurrects the old value on its next push.
@router.delete("/api/exams/subject")
async def delete_exam_subject(admNo: str, subject: str, examName: str = "",
                              term: str = "", year: str = "",
                              request: Request = None):
    if security.current_role(request) != "admin":
        return JSONResponse({"ok": False, "error": "Admin privilege required"}, status_code=403)
    if not subject:
        return JSONResponse({"ok": False, "error": "Missing: subject"}, 400)
    key = database.exam_key({"admNo": admNo, "examName": examName, "term": term, "year": year})

    def _do():
        with database.db_scope() as db:
            result = records.remove_exam_subject(db, key, subject)
            if result == "missing":
                return result, None
            db.execute("UPDATE sync_tracking SET last_sync=datetime('now','localtime') "
                       "WHERE table_name='exams'")
            return result, _last_sync(db, "exams")

    try:
        result, last_sync = await run_in_threadpool(database.run_with_retry, _do)
    except sqlite3.OperationalError:
        return _locked_response()
    if result == "missing":
        return JSONResponse({"ok": False, "error": "record not found"}, 404)
    audit.log(request, "delete-exam-subject",
              f"admNo={admNo} examName={examName} term={term} year={year} subject={subject} -> {result}")
    cache.invalidate()
    events.hub.broadcast("db-changed", {"table": "exams", "action": "delete-subject",
                                        "admNo": admNo, "last_sync": last_sync})
    return JSONResponse({"ok": True, "result": result, "last_sync": last_sync})


# ── Exams (bulk subject-column clear) ────────────────────────────────────────
# Clear one subject's submitted scores for a whole exam+grade (admin fix for a
# wrongly-captured column) without deleting the exam. Each touched row goes
# through records.remove_exam_subject — additive-safe, tombstoned per row so
# stale devices can't resurrect the old values, other subjects untouched.
# Re-capture works via the normal save path (_forceSubjects clears tombs).
@router.delete("/api/exams/subject-column")
async def clear_exam_subject_column(examName: str = "", term: str = "",
                                    year: str = "", grade: str = "",
                                    subject: str = "", request: Request = None):
    if security.current_role(request) != "admin":
        return JSONResponse({"ok": False, "error": "Admin privilege required"}, status_code=403)
    if not subject or not examName:
        return JSONResponse({"ok": False, "error": "Missing: examName/subject"}, 400)

    def _do():
        with database.db_scope() as db:
            cleared = 0
            for r in db.execute("SELECT id, data FROM exams").fetchall():
                try:
                    d = json.loads(r["data"])
                except Exception:
                    continue
                if ((d.get("examName") or "") != examName or
                        str(d.get("term") or "") != str(term) or
                        str(d.get("year") or "") != str(year)):
                    continue
                if grade and (d.get("grade") or "") != grade:
                    continue
                if not isinstance(d.get("scores"), dict) or subject not in d["scores"]:
                    continue
                res = records.remove_exam_subject(db, r["id"], subject)
                if res in ("stripped", "deleted-row"):
                    cleared += 1
            db.execute("UPDATE sync_tracking SET last_sync=datetime('now','localtime') "
                       "WHERE table_name='exams'")
            return cleared, _last_sync(db, "exams")

    try:
        cleared, last_sync = await run_in_threadpool(database.run_with_retry, _do)
    except sqlite3.OperationalError:
        return _locked_response()
    audit.log(request, "clear-subject-column",
              f"examName={examName} term={term} year={year} grade={grade} subject={subject} -> {cleared}")
    cache.invalidate()
    events.hub.broadcast("db-changed", {"table": "exams", "action": "clear-subject-column",
                                        "examName": examName, "last_sync": last_sync})
    return JSONResponse({"ok": True, "cleared": cleared, "last_sync": last_sync})


# ── Exams (single-record delete) ─────────────────────────────────────────────
# /api/db/save only ever upserts exam records (so a stale or partial sync push
# can never wipe data) — it never deletes. Without this dedicated endpoint, a
# record removed client-side would still exist server-side and get pulled
# straight back in on the next poll.
@router.delete("/api/exams")
async def delete_exam(admNo: str, examName: str = "", term: str = "", year: str = "",
                      request: Request = None):
    if security.current_role(request) != "admin":
        return JSONResponse({"ok": False, "error": "Admin privilege required"}, status_code=403)
    key = database.exam_key({"admNo": admNo, "examName": examName, "term": term, "year": year})
    with database.db_scope() as db:
        database.mark_deleted(db, "exam", key)
        db.execute("DELETE FROM exams WHERE id=?", (key,))
        db.execute("DELETE FROM raw_scores WHERE id=?", (key,))
        db.execute("UPDATE sync_tracking SET last_sync=datetime('now','localtime') "
                   "WHERE table_name='exams'")
        last_sync = _last_sync(db, "exams")
    audit.log(request, "delete-exam", f"admNo={admNo} examName={examName} term={term} year={year}")
    cache.invalidate()
    events.hub.broadcast("db-changed", {"table": "exams", "action": "delete",
                                        "admNo": admNo, "last_sync": last_sync})
    return JSONResponse({"ok": True, "last_sync": last_sync})


def _archive_job(fn, exam_name: str):
    def _do():
        with database.db_scope() as db:
            return fn(db, exam_name)
    return database.run_with_retry(_do)


def _archive_done(action: str, exam_name: str, result: dict):
    cache.invalidate()
    events.hub.broadcast("db-changed", {"table": "exams", "action": action,
                                        "examName": exam_name})
    out = {"ok": True, "examName": exam_name}
    out.update(result)
    return JSONResponse(out)


# ── Edited-exams bin: archive / restore / permanently delete ────────────
@router.post("/api/archive/exam")
async def archive_exam_ep(request: Request):
    if security.current_role(request) != "admin":
        return JSONResponse({"ok": False, "error": "Admin privilege required"}, status_code=403)
    try:
        data = json.loads(await request.body())
    except Exception:
        data = {}
    exam_name = (data.get("examName") or "").strip()
    if not exam_name:
        return JSONResponse({"ok": False, "error": "Missing: examName"}, 400)
    try:
        result = await run_in_threadpool(_archive_job, records.archive_exam, exam_name)
    except sqlite3.OperationalError:
        return _locked_response()
    return _archive_done("archive-exam", exam_name, result)


@router.post("/api/archive/restore")
async def restore_archived_ep(request: Request):
    if security.current_role(request) != "admin":
        return JSONResponse({"ok": False, "error": "Admin privilege required"}, status_code=403)
    try:
        data = json.loads(await request.body())
    except Exception:
        data = {}
    exam_name = (data.get("examName") or "").strip()
    if not exam_name:
        return JSONResponse({"ok": False, "error": "Missing: examName"}, 400)
    try:
        result = await run_in_threadpool(_archive_job, records.restore_archived, exam_name)
    except sqlite3.OperationalError:
        return _locked_response()
    return _archive_done("restore-archived", exam_name, result)


@router.delete("/api/archive")
async def purge_archived_ep(examName: str = "", request: Request = None):
    if security.current_role(request) != "admin":
        return JSONResponse({"ok": False, "error": "Admin privilege required"}, status_code=403)
    if not examName:
        return JSONResponse({"ok": False, "error": "Missing: examName"}, 400)
    try:
        result = await run_in_threadpool(_archive_job, records.purge_archived, examName)
    except sqlite3.OperationalError:
        return _locked_response()
    return _archive_done("purge-archived", examName, result)


@router.get("/api/archive")
async def list_archived_ep(request: Request):
    # Direct bin listing (source of truth). The bin UI fetches this instead
    # of waiting for a background sync to deliver archivedExams.
    if security.current_role(request) != "admin":
        return JSONResponse({"ok": False, "error": "Admin privilege required"}, status_code=403)
    def _do():
        with database.db_scope() as db:
            ex = [json.loads(r["data"]) for r in
                  db.execute("SELECT data FROM archived_exams ORDER BY id").fetchall()]
            raw = [json.loads(r["data"]) for r in
                   db.execute("SELECT data FROM archived_raw ORDER BY id").fetchall()]
            return {"archivedExams": ex, "archivedRaw": raw}
    try:
        result = await run_in_threadpool(database.run_with_retry, _do)
    except sqlite3.OperationalError:
        return _locked_response()
    out = {"ok": True}
    out.update(result)
    return JSONResponse(out)


# ── Dashboard ticker: five latest events (any signed-in role) ─────────────
@router.get("/api/activity/recent")
async def recent_activity_ep(request: Request):
    if security.current_role(request) not in ("admin", "teacher"):
        return JSONResponse({"ok": False, "error": "Login required"}, status_code=403)

    def _do():
        with database.db_scope() as db:
            return records.recent_activity(db, 5)

    try:
        events = await run_in_threadpool(database.run_with_retry, _do)
    except sqlite3.OperationalError:
        return _locked_response()
    return JSONResponse({"ok": True, "events": events})


# ─── Restore (merge backup JSON into live DB) ─────────────────────────────────
def _restore_job(backup: dict) -> dict:
    def _do():
        with database.db_scope() as db:
            return records.restore_backup(db, backup)
    return database.run_with_retry(_do)


@router.post("/api/restore")
async def api_restore(request: Request):
    try:
        raw = await request.body()
        data = json.loads(raw) if raw else {}
    except Exception:
        return JSONResponse({"ok": False, "error": "bad json"}, 400)

    backup = data.get("data", {})
    if not backup:
        return JSONResponse({"ok": False, "error": "no data"}, 400)

    user = request.cookies.get("username", "?")
    try:
        result = await run_in_threadpool(_restore_job, backup)
    except sqlite3.OperationalError:
        return _locked_response()

    detail = (f"merge-restore | +{result['added_s']} students, +{result['added_t']} teachers, "
              f"+{result['added_e']} exams | total={result['total_s']} students")
    audit.log(request, "restore-backup", detail, user)
    cache.invalidate()
    events.hub.broadcast("db-changed", {"table": "all", "action": "restore",
                                        "students": result["total_s"],
                                        "last_sync": result["last_sync"]})

    return JSONResponse({
        "ok": True,
        "students": result["total_s"],
        "teachers": result["total_t"],
        "new_students_added": result["added_s"],
        "new_teachers_added": result["added_t"],
        "new_exams_added": result["added_e"],
        "message": (f"Merged: +{result['added_s']} students, +{result['added_t']} teachers, "
                    f"+{result['added_e']} exams  (total {result['total_s']} students)")
    })


# ─── Auth ─────────────────────────────────────────────────────────────────────
def _verify_and_upgrade(username: str, password: str, user_data: dict) -> bool:
    """PBKDF2 check (+ transparent legacy→PBKDF2 upgrade). CPU-bound, so the
    login endpoint runs it in a worker thread — 15 simultaneous morning
    logins must not stall the event loop for everyone else."""
    ok = security.verify_password(password, user_data.get("pw_hash", ""))
    if ok and not user_data.get("pw_hash", "").startswith("pbkdf2$"):
        security.upgrade_stored_password(username, password, user_data)
    return ok
@router.post("/api/login")
async def api_login(request: Request):
    try:
        data = json.loads(await request.body())
    except Exception:
        data = {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    role = "user"
    if not username:
        return JSONResponse({"ok": False, "error": "username required"}, 400)

    if username in security.BUILTIN:
        if not secrets.compare_digest(password, security.BUILTIN[username]["password"]):
            audit.log(request, "login-fail", "wrong password", username)
            return JSONResponse({"ok": False, "error": "wrong password"}, 401)
        role = security.BUILTIN[username]["role"]
    else:
        with database.db_scope() as db:
            row = db.execute("SELECT value FROM kv_store WHERE key=?",
                             (f"user:{username}",)).fetchone()
        if not row:
            audit.log(request, "login-fail", "unknown user", username)
            return JSONResponse({"ok": False, "error": "wrong username or password"}, 401)
        user_data = json.loads(row["value"])
        if not await run_in_threadpool(_verify_and_upgrade, username, password, user_data):
            audit.log(request, "login-fail", "wrong password", username)
            return JSONResponse({"ok": False, "error": "wrong username or password"}, 401)
        role = user_data.get("role", "teacher")

    audit.log(request, "login", f"role={role}", username)
    with database.db_scope() as db:
        db.execute("""
            INSERT INTO sessions(username,role,updated)
            VALUES(?,?,datetime('now','localtime'))
            ON CONFLICT(username) DO UPDATE SET role=excluded.role, updated=excluded.updated
        """, (username, role))
    resp = JSONResponse({"ok": True, "username": username, "role": role})
    cookie = {"max_age": config.SESSION_COOKIE_MAX_AGE, "path": "/",
              "samesite": "lax", "httponly": True}
    resp.set_cookie("username", username, **cookie)
    resp.set_cookie("role", role, **cookie)
    resp.set_cookie("srv_token", config.SERVER_TOKEN, **cookie)
    return resp


@router.post("/api/logout")
async def api_logout(request: Request):
    audit.log(request, "logout", "")
    resp = JSONResponse({"ok": True})
    resp.delete_cookie("username", path="/")
    resp.delete_cookie("role", path="/")
    resp.delete_cookie("srv_token", path="/")
    return resp


@router.post("/api/register")
async def api_register(request: Request):
    """Register a new teacher account. Admins can also call this to create accounts."""
    try:
        data = json.loads(await request.body())
    except Exception:
        data = {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    role = data.get("role", "teacher")   # default role is teacher

    if not username or len(username) < 3:
        return JSONResponse({"ok": False, "error": "Username must be at least 3 characters"}, 400)
    if not all(c.isalnum() or c in "_." for c in username):
        return JSONResponse({"ok": False, "error": "Username: letters, numbers, _ and . only"}, 400)
    if len(password) < 8:
        return JSONResponse({"ok": False, "error": "Password must be at least 8 characters"}, 400)

    if username in security.BUILTIN or username.lower() in [k.lower() for k in security.BUILTIN]:
        return JSONResponse({"ok": False, "error": "That username is reserved"}, 409)

    with database.db_scope() as db:
        existing_keys = [row["key"] for row in
                         db.execute("SELECT key FROM kv_store WHERE key LIKE 'user:%'").fetchall()]
        taken = [k[5:].lower() for k in existing_keys]   # strip "user:" prefix
        if username.lower() in taken:
            return JSONResponse({"ok": False, "error": "That username is already taken"}, 409)
        db.execute(
            "INSERT OR REPLACE INTO kv_store(key, value, updated) VALUES(?, ?, datetime('now','localtime'))",
            (f"user:{username}", json.dumps({
                "username": username,
                "pw_hash": security.hash_password(password),
                "role": role,
                "createdAt": datetime.now().strftime("%Y-%m-%d")
            })))

    audit.log(request, "register", f"role={role}", username)
    return JSONResponse({"ok": True, "username": username, "role": role})


@router.get("/api/users")
async def api_list_users(request: Request):
    """Return all registered (non-builtin) users. Admin only."""
    if security.current_role(request) != "admin":
        return JSONResponse({"error": "forbidden"}, 403)
    with database.db_scope() as db:
        rows = db.execute("SELECT key, value FROM kv_store WHERE key LIKE 'user:%'").fetchall()
    users = []
    for row in rows:
        d = json.loads(row["value"])
        users.append({"username": d["username"], "role": d.get("role", "teacher"),
                      "createdAt": d.get("createdAt", "")})
    for uname, info in security.BUILTIN.items():
        users.append({"username": uname, "role": info["role"], "createdAt": "built-in"})
    return JSONResponse(users)


@router.delete("/api/users/{username}")
async def api_delete_user(username: str, request: Request):
    """Delete a registered user. Admin only. Cannot delete built-ins."""
    if security.current_role(request) != "admin":
        return JSONResponse({"error": "forbidden"}, 403)
    if username in security.BUILTIN:
        return JSONResponse({"ok": False, "error": "Cannot delete built-in accounts"}, 400)
    with database.db_scope() as db:
        db.execute("DELETE FROM kv_store WHERE key=?", (f"user:{username}",))
    audit.log(request, "delete-user", username, request.cookies.get("username", "?"))
    return JSONResponse({"ok": True})


@router.get("/api/session")
async def api_session(request: Request):
    username = request.cookies.get("username")
    token = request.cookies.get("srv_token")
    if username and token == config.SERVER_TOKEN:
        return JSONResponse({"username": username, "role": request.cookies.get("role", "user")})
    return JSONResponse({"username": None}, 401)


# ─── Audit log API ────────────────────────────────────────────────────────────
@router.post("/api/log")
async def api_log(request: Request):
    try:
        data = json.loads(await request.body())
    except Exception:
        data = {}
    audit.log(request, data.get("action", "?"), data.get("detail", ""), data.get("username", ""))
    return JSONResponse({"ok": True})


@router.get("/api/log-history")
async def api_log_history(limit: int = 200):
    with database.db_scope() as db:
        rows = db.execute(
            "SELECT * FROM activity_log ORDER BY id DESC LIMIT ?", (limit,)).fetchall()
    return JSONResponse([dict(r) for r in rows])


# ─── SSE: instant push when any device saves ─────────────────────────────────
@router.get("/api/events")
async def api_events(request: Request):
    q = events.hub.connect()
    username = request.cookies.get("username", "?")
    audit.log(request, "sse-connect", f"clients={events.hub.size()}", username)

    async def stream():
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    msg = await asyncio.wait_for(q.get(), timeout=15.0)
                    yield msg
                except asyncio.TimeoutError:
                    yield ": heartbeat\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            events.hub.disconnect(q)
            audit.log(request, "sse-disconnect", f"clients={events.hub.size()}", username)

    return StreamingResponse(stream(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

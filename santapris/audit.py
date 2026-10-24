"""Activity audit trail: console line + activity_log table + SSE 'log' event."""
import sys
import threading
from datetime import datetime

from . import config, database, events

_print_lock = threading.Lock()
_writes = {"n": 0}


def log(request, action: str, detail: str = "", username: str = "") -> None:
    username = username or (request.cookies.get("username", "?") if request else "?")
    ip = request.client.host if request and request.client else "?"
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with _print_lock:
        print(f"[{ts}]  {ip:<15}  {username:<18}  {action:<22}  {detail}", flush=True)
    try:
        with database.db_scope() as db:
            db.execute(
                "INSERT INTO activity_log (ts,username,action,detail,ip) VALUES (?,?,?,?,?)",
                (ts, username, action, detail, ip))
            _writes["n"] += 1
            if _writes["n"] % 50 == 0:
                # rolling retention — the log table no longer grows forever
                db.execute(
                    "DELETE FROM activity_log WHERE id NOT IN "
                    "(SELECT id FROM activity_log ORDER BY id DESC LIMIT ?)",
                    (config.ACTIVITY_LOG_KEEP,))
    except Exception as exc:  # auditing must never break a request
        print(f"[audit] failed to persist log entry: {exc}", file=sys.stderr)
    events.hub.broadcast("log", {"ts": ts, "username": username,
                                 "action": action, "detail": detail, "ip": ip})

"""In-memory snapshot of the full-DB payload served by GET /api/db.

The snapshot is rebuilt only after a mutation actually changed data, so idle
polls cost zero disk I/O and zero re-serialization. The ETag is a content
hash, so clients get a true 304 whenever nothing changed (the legacy build
keyed the cache on a 1-second-granularity timestamp, which both missed
same-second updates and re-sent the whole database after no-op saves).
"""
import hashlib
import json
import threading

from . import database
from .records import read_full_db

_lock = threading.Lock()
# Singleflight: only one thread ever rebuilds the snapshot at a time. Without
# this, N clients polling right after a save each serialize the whole DB
# concurrently (CPU + GC spike, slower for everyone under load).
_build_lock = threading.Lock()
_body: str | None = None   # serialized payload (with _ts marker)
_etag = ""


def invalidate() -> None:
    global _body, _etag
    with _lock:
        _body, _etag = None, ""


def get_snapshot() -> tuple:
    """Return (json_body, etag). Concurrent callers share one rebuild."""
    global _body, _etag
    with _lock:
        if _body is not None:
            return _body, _etag
    # Only one builder at a time; the rest wait and share its result.
    with _build_lock:
        with _lock:
            if _body is not None:
                return _body, _etag
        with database.db_scope() as db:
            payload = read_full_db(db)
        core = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        ts = hashlib.sha1(core.encode("utf-8")).hexdigest()[:16]
        payload["_ts"] = ts
        body = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        etag = f'"{ts}"'
        with _lock:
            if _body is None:      # a concurrent build is equally valid
                _body, _etag = body, etag
            return _body, _etag

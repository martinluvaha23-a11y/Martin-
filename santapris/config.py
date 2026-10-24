"""Central configuration for the Santapris server."""
import os
import secrets
from pathlib import Path

PACKAGE_DIR = Path(__file__).resolve().parent     # .../santapris
ROOT_DIR = PACKAGE_DIR.parent                     # folder that holds school_system.py


def _resolve_db_path() -> Path:
    env = os.environ.get("SANTAPRIS_DB")
    if env:
        return Path(env).expanduser().resolve()
    return (ROOT_DIR / "school.db").resolve()


DB_PATH = _resolve_db_path()
FRONTEND_PATH = ROOT_DIR / "frontend.html"
STATIC_DIR = ROOT_DIR / "static"
SYNC_ENGINE_JS = PACKAGE_DIR / "resources" / "sync_engine.js"

# One-time token per server start; browser sessions are bound to it (as before).
SERVER_TOKEN = secrets.token_hex(16)

SESSION_COOKIE_MAX_AGE = 2_592_000            # 30 days, matches the legacy build
ACTIVITY_LOG_KEEP = 10_000                    # rolling window for the audit trail
LEGACY_PW_SALT = "santapris_salt_2024"        # legacy salted-sha256 scheme
PBKDF2_ITERATIONS = 200_000                   # modern password hashing

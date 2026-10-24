"""Passwords and request identity.

Registered accounts transparently upgrade from the legacy salted-sha256 scheme
to PBKDF2-HMAC-SHA256 (per-user salt, 200k iterations) on their first login.
"""
import hashlib
import json
import secrets

from . import config, database

# Built-in accounts (credentials unchanged from the legacy build).
BUILTIN = {
    "Martinsmarta": {"password": "Luvahama1995!", "role": "admin"},
    "Teacher":      {"password": "Teacher123",    "role": "teacher"},
}


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt,
                             config.PBKDF2_ITERATIONS)
    return f"pbkdf2${config.PBKDF2_ITERATIONS}${salt.hex()}${dk.hex()}"


def _legacy_hash(password: str) -> str:
    return hashlib.sha256((password + config.LEGACY_PW_SALT).encode("utf-8")).hexdigest()


def verify_password(password: str, stored: str) -> bool:
    if not stored:
        return False
    if stored.startswith("pbkdf2$"):
        try:
            _, iters, salt_hex, hash_hex = stored.split("$")
            dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"),
                                     bytes.fromhex(salt_hex), int(iters))
            return secrets.compare_digest(dk.hex(), hash_hex)
        except Exception:
            return False
    return secrets.compare_digest(_legacy_hash(password), stored)


def upgrade_stored_password(username: str, password: str, record: dict) -> None:
    """Re-store a legacy account under PBKDF2 after a successful login."""
    record = dict(record)
    record["pw_hash"] = hash_password(password)
    with database.db_scope() as db:
        db.execute(
            "INSERT OR REPLACE INTO kv_store(key, value, updated) "
            "VALUES(?, ?, datetime('now','localtime'))",
            (f"user:{username}", json.dumps(record)))


def current_role(request) -> str:
    """Role for the requesting browser. Requires a valid session token; prefers
    the role recorded server-side at login, falling back to the cookie.

    Unlike the legacy build (which trusted a client-editable role cookie), the
    role cannot be forged by editing cookies in the browser.
    """
    username = request.cookies.get("username")
    token = request.cookies.get("srv_token")
    if not username or token != config.SERVER_TOKEN:
        return ""
    with database.db_scope() as db:
        row = db.execute("SELECT role FROM sessions WHERE username=?", (username,)).fetchone()
    if row and row["role"]:
        return row["role"].lower()
    return (request.cookies.get("role") or "").lower()

"""Frontend serving: /app (with LAN-sync injection), /, /health and /static."""
import re

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from . import config

_frontend_cache = {"mtime": None, "html": ""}
_inject_cache = {"text": None}
_build_cache = {"t": 0.0, "id": ""}


def build_id() -> str:
    """Max mtime over the served frontend + static tree. Changes whenever any
    shipped file changes, so stale open tabs can detect a new version."""
    import time
    now = time.time()
    if now - _build_cache["t"] < 30:
        return _build_cache["id"]
    try:
        mts = [config.FRONTEND_PATH.stat().st_mtime]
        for p in config.STATIC_DIR.rglob("*"):
            if p.is_file():
                try:
                    mts.append(p.stat().st_mtime)
                except OSError:
                    pass
        _build_cache["id"] = str(int(max(mts))) if mts else "0"
    except OSError:
        _build_cache["id"] = "0"
    _build_cache["t"] = now
    return _build_cache["id"]


def build_inject_script() -> str:
    """The LAN sync engine, injected into every /app response (byte-identical
    to the legacy build's injection)."""
    if _inject_cache["text"] is None:
        inner = config.SYNC_ENGINE_JS.read_text(encoding="utf-8")
        _inject_cache["text"] = f'<script id="__srv_sync__">{inner}</script>'
    return _inject_cache["text"]


def _load_frontend():
    try:
        mtime = config.FRONTEND_PATH.stat().st_mtime
    except OSError:
        return None
    if _frontend_cache["mtime"] != mtime:
        _frontend_cache["html"] = config.FRONTEND_PATH.read_text(encoding="utf-8")
        _frontend_cache["mtime"] = mtime
    return _frontend_cache["html"]


def register_web(app: FastAPI) -> None:
    app.mount("/static", StaticFiles(directory=str(config.STATIC_DIR)), name="static")

    @app.get("/app", response_class=HTMLResponse)
    async def serve_app(request: Request):
        # Same cookie-binding check as the legacy build: a browser presenting a
        # username cookie without the matching server token is re-authenticated.
        if (request.cookies.get("username")
                and request.cookies.get("srv_token") != config.SERVER_TOKEN):
            resp = RedirectResponse("/app")
            resp.delete_cookie("username", path="/")
            resp.delete_cookie("role", path="/")
            resp.delete_cookie("srv_token", path="/")
            return resp
        html = _load_frontend()
        if html is None:
            return HTMLResponse("<h1>frontend.html not found</h1>", status_code=404)
        # cache-busting: stamp every local static reference with its file mtime
        # so browsers pick up updated code immediately after an upgrade
        def _bust(m):
            rel = m.group(2)
            p = config.STATIC_DIR / rel
            try:
                v = int(p.stat().st_mtime)
            except OSError:
                v = 0
            return f'{m.group(1)}="/static/{rel}?v={v}"'
        html = re.sub(r'(src|href)="/static/([^"]+)"', _bust, html)
        inject = build_inject_script()
        last_body = html.rfind("</body>")
        html = html[:last_body] + inject + html[last_body:] if last_body >= 0 else html + inject
        return HTMLResponse(html, headers={"Cache-Control": "no-cache"})

    @app.get("/")
    async def root():
        return RedirectResponse("/app")

    @app.get("/health")
    async def health():
        return JSONResponse({"ok": True, "status": "live", "build": build_id()})

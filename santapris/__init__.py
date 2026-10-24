"""Santapris School System — modernized application package."""
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

from . import database, events
from .api import router as api_router
from .web import register_web


class SelectiveGZip(GZipMiddleware):
    """GZip everything except the SSE stream (compression buffers heartbeats)."""

    def __init__(self, app, skip_paths=("/api/events",), **kwargs):
        super().__init__(app, **kwargs)
        self._skip = skip_paths

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http" and scope["path"].startswith(self._skip):
            await self.app(scope, receive, send)
            return
        await super().__call__(scope, receive, send)


@asynccontextmanager
async def _lifespan(app: FastAPI):
    events.hub.set_loop(asyncio.get_running_loop())
    yield


def create_app() -> FastAPI:
    database.init_db()
    app = FastAPI(title="Santapris School System", lifespan=_lifespan)
    app.add_middleware(SelectiveGZip, minimum_size=1024)
    app.include_router(api_router)
    register_web(app)

    @app.middleware("http")
    async def _cache_headers(request, call_next):
        response = await call_next(request)
        path = request.url.path
        if "/vendor-" in path:
            # Third-party libraries never change between releases
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        elif path.startswith("/static/"):
            # First-party assets: revalidate (cheap 304) so edits show up
            response.headers["Cache-Control"] = "no-cache"
        return response

    return app


app = create_app()

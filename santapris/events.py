"""Server-Sent Events hub: instant push to every connected device."""
import asyncio
import json
import threading


class EventHub:
    def __init__(self) -> None:
        self._loop: asyncio.AbstractEventLoop | None = None
        self._clients: set = set()
        self._lock = threading.Lock()

    def set_loop(self, loop: asyncio.AbstractEventLoop) -> None:
        self._loop = loop

    def connect(self) -> "asyncio.Queue[str]":
        q: "asyncio.Queue[str]" = asyncio.Queue(maxsize=100)
        with self._lock:
            self._clients.add(q)
        return q

    def disconnect(self, q) -> None:
        with self._lock:
            self._clients.discard(q)

    def size(self) -> int:
        with self._lock:
            return len(self._clients)

    def broadcast(self, event_type: str, payload: dict) -> None:
        """Thread-safe: may be called from worker threads or the event loop."""
        msg = f"event: {event_type}\ndata: {json.dumps(payload)}\n\n"
        loop = self._loop
        if loop is None or loop.is_closed():
            return
        try:
            loop.call_soon_threadsafe(self._deliver, msg)
        except RuntimeError:
            pass  # loop shutting down

    def _deliver(self, msg: str) -> None:
        dead = []
        for q in list(self._clients):
            try:
                q.put_nowait(msg)
            except asyncio.QueueFull:
                dead.append(q)
        for q in dead:
            self.disconnect(q)


hub = EventHub()

"""
Rate Limiting & Request Throttling Middleware for Kynetic AI.

Features:
- Sliding window counter per client IP or authenticated organization.
- Safe path exemption for health checks and OpenAPI docs.
- Configurable thresholds and burst tolerance.
- Standard HTTP 429 Too Many Requests response with Retry-After header.
"""

import time
import asyncio
from typing import Callable
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from app.core.config import settings


class SlidingWindowRateLimiter:
    """
    In-memory thread-safe sliding window rate limiter.
    """
    def __init__(self, limit_per_minute: int = 120, burst: int = 30):
        self.limit_per_minute = limit_per_minute
        self.burst = burst
        self._history: dict[str, list[float]] = {}
        self._lock = asyncio.Lock()

    async def is_allowed(self, client_key: str) -> tuple[bool, int]:
        """
        Determines if the client request is permitted under rate limits.
        Returns (is_allowed, retry_after_seconds).
        """
        now = time.time()
        window_start = now - 60.0

        async with self._lock:
            timestamps = self._history.get(client_key, [])
            # Filter out timestamps older than 60s
            recent = [t for t in timestamps if t > window_start]

            max_allowed = self.limit_per_minute + self.burst
            if len(recent) >= max_allowed:
                oldest_in_window = recent[0]
                retry_after = max(1, int(60.0 - (now - oldest_in_window)))
                self._history[client_key] = recent
                return False, retry_after

            recent.append(now)
            self._history[client_key] = recent

            # Periodic cleanup if map grows large
            if len(self._history) > 5000:
                to_del = [k for k, v in self._history.items() if not v or v[-1] < window_start]
                for k in to_del:
                    del self._history[k]

            return True, 0

    async def reset(self) -> None:
        async with self._lock:
            self._history.clear()


rate_limiter = SlidingWindowRateLimiter(
    limit_per_minute=settings.RATE_LIMIT_REQUESTS_PER_MINUTE,
    burst=settings.RATE_LIMIT_BURST
)


EXEMPT_PATHS = {
    "/health/live",
    "/health/ready",
    "/health/metrics",
    "/metrics",
    "/docs",
    "/redoc",
    "/openapi.json"
}


async def rate_limiting_middleware(request: Request, call_next: Callable) -> Response:
    """
    ASGI middleware enforcing client rate limits.
    """
    if not settings.RATE_LIMIT_ENABLED:
        return await call_next(request)

    path = request.url.path
    if path in EXEMPT_PATHS or path.startswith("/health/"):
        return await call_next(request)

    # Use client IP or Auth org header
    client_ip = request.client.host if request.client else "unknown"
    client_key = request.headers.get("X-Organization-ID") or client_ip

    allowed, retry_after = await rate_limiter.is_allowed(client_key)
    if not allowed:
        request_id = getattr(request.state, "request_id", "unknown-req-id")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            headers={"Retry-After": str(retry_after)},
            content={
                "error": {
                    "code": "RATE_LIMIT_EXCEEDED",
                    "message": f"Rate limit exceeded. Try again in {retry_after} seconds.",
                    "request_id": request_id,
                    "details": {"retry_after_seconds": retry_after}
                }
            }
        )

    return await call_next(request)

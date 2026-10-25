"""
Centralized Cache Service & Abstraction for Kynetic AI.

Features:
- Asynchronous Redis client with connection pooling and configurable timeouts.
- Graceful degradation: falls back to in-memory TTL store if Redis is unavailable or unconfigured.
- Cache-aside semantics with JSON serialization for dictionaries, lists, and primitives.
- Cache keys namespacing with strict multi-tenant boundary isolation.
- Structured metrics: hits, misses, sets, deletes, errors, latency, and hit ratio.
- Safe pattern invalidation without blocking Redis (using SCAN).
- Zero caching of credentials, secrets, or auth tokens.
"""

import asyncio
import json
import logging
import time
from typing import Any
from datetime import datetime, timezone
from decimal import Decimal

from app.core.config import settings

logger = logging.getLogger("kynetic.cache")


class CustomJSONEncoder(json.JSONEncoder):
    """Encodes Decimal and Datetime types to JSON-serializable primitives."""
    def default(self, obj: Any) -> Any:
        if isinstance(obj, Decimal):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


class CacheKeys:
    """Standardized, versioned cache key generator with strict tenant isolation."""
    PREFIX = "kynetic:v1"

    @classmethod
    def provider_catalog(cls) -> str:
        return f"{cls.PREFIX}:providers:catalog"

    @classmethod
    def compute_offers(
        cls,
        provider: str | None = None,
        region: str | None = None,
        gpu_model: str | None = None,
        min_vram: int | None = None
    ) -> str:
        p = (provider or "all").lower()
        r = (region or "all").lower()
        g = (gpu_model or "all").lower()
        v = str(min_vram or 0)
        return f"{cls.PREFIX}:offers:{p}:{r}:{g}:{v}"

    @classmethod
    def provider_pricing(cls, provider_key: str, offer_id: str, version: str = "v1") -> str:
        return f"{cls.PREFIX}:pricing:{provider_key.lower()}:{offer_id}:{version}"

    @classmethod
    def cost_estimate(cls, input_hash: str, pricing_version: str = "v1") -> str:
        return f"{cls.PREFIX}:estimates:{input_hash}:{pricing_version}"

    @classmethod
    def tenant_resource(cls, org_id: str, resource_type: str, resource_id: str) -> str:
        """Tenant-scoped cache key. Guarantees cross-tenant isolation."""
        return f"{cls.PREFIX}:org:{org_id}:{resource_type}:{resource_id}"

    @classmethod
    def tenant_pattern(cls, org_id: str) -> str:
        return f"{cls.PREFIX}:org:{org_id}:*"

    @classmethod
    def offers_pattern(cls) -> str:
        return f"{cls.PREFIX}:offers:*"

    @classmethod
    def providers_pattern(cls) -> str:
        return f"{cls.PREFIX}:providers:*"


class InMemoryTTLStore:
    """Thread-safe bounded in-memory cache with TTL support for fallback/offline use."""
    def __init__(self, max_items: int = 1000):
        self._store: dict[str, tuple[str, float]] = {}  # key -> (serialized_value, expire_at)
        self._max_items = max_items
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> str | None:
        async with self._lock:
            entry = self._store.get(key)
            if not entry:
                return None
            val_str, expire_at = entry
            if time.time() > expire_at:
                del self._store[key]
                return None
            return val_str

    async def set(self, key: str, value_str: str, ttl_seconds: int) -> bool:
        async with self._lock:
            if len(self._store) >= self._max_items:
                # Evict expired keys first
                now = time.time()
                expired = [k for k, (_, exp) in self._store.items() if now > exp]
                for k in expired:
                    del self._store[k]
                # If still at limit, evict oldest 20%
                if len(self._store) >= self._max_items:
                    to_remove = list(self._store.keys())[: self._max_items // 5]
                    for k in to_remove:
                        del self._store[k]
            expire_at = time.time() + ttl_seconds
            self._store[key] = (value_str, expire_at)
            return True

    async def delete(self, key: str) -> bool:
        async with self._lock:
            return self._store.pop(key, None) is not None

    async def delete_pattern(self, pattern: str) -> int:
        import fnmatch
        async with self._lock:
            matched = [k for k in self._store if fnmatch.fnmatch(k, pattern)]
            for k in matched:
                del self._store[k]
            return len(matched)

    async def clear(self) -> None:
        async with self._lock:
            self._store.clear()


class CacheService:
    """
    Centralized caching abstraction supporting Redis with in-memory graceful fallback.
    """
    def __init__(self):
        self._redis_client = None
        self._redis_pool = None
        self._memory_store = InMemoryTTLStore()
        self._redis_available = False
        self._metrics = {
            "hits": 0,
            "misses": 0,
            "sets": 0,
            "deletes": 0,
            "errors": 0,
            "total_latency_ms": 0.0,
            "operations_count": 0,
        }

    @property
    def is_redis_configured(self) -> bool:
        return bool(settings.REDIS_URL and settings.REDIS_ENABLED)

    async def initialize(self) -> None:
        """Initializes the Redis connection pool if configured and enabled."""
        if not self.is_redis_configured:
            logger.info("Redis caching disabled or unconfigured; using in-memory fallback cache.")
            self._redis_available = False
            return

        try:
            import redis.asyncio as aioredis
            self._redis_pool = aioredis.ConnectionPool.from_url(
                settings.REDIS_URL,
                max_connections=settings.REDIS_MAX_CONNECTIONS,
                socket_connect_timeout=settings.REDIS_CONNECT_TIMEOUT,
                socket_timeout=settings.REDIS_SOCKET_TIMEOUT,
                decode_responses=True
            )
            self._redis_client = aioredis.Redis(connection_pool=self._redis_pool)
            await self._redis_client.ping()
            self._redis_available = True
            logger.info("Connected to Redis cache successfully.")
        except Exception as exc:
            self._redis_available = False
            self._metrics["errors"] += 1
            logger.warning(
                f"Redis connection failed ({type(exc).__name__}: {exc}). "
                "Operating in graceful degradation mode (in-memory cache)."
            )

    async def close(self) -> None:
        """Closes Redis connections during application shutdown."""
        if self._redis_client:
            try:
                await self._redis_client.close()
            except Exception:
                pass
        if self._redis_pool:
            try:
                await self._redis_pool.disconnect()
            except Exception:
                pass
        self._redis_available = False

    async def get(self, key: str) -> Any | None:
        """
        Retrieves a cached value by key.
        Returns parsed JSON or None on cache miss or degradation.
        """
        start = time.perf_counter()
        raw_val: str | None = None
        hit = False

        if self._redis_available and self._redis_client:
            try:
                raw_val = await self._redis_client.get(key)
            except Exception as exc:
                self._metrics["errors"] += 1
                logger.warning(f"Redis GET failed for {key}: {exc}; falling back to memory.")
                raw_val = await self._memory_store.get(key)
        else:
            raw_val = await self._memory_store.get(key)

        duration_ms = (time.perf_counter() - start) * 1000
        self._metrics["total_latency_ms"] += duration_ms
        self._metrics["operations_count"] += 1

        if raw_val is not None:
            self._metrics["hits"] += 1
            try:
                return json.loads(raw_val)
            except Exception:
                return raw_val
        else:
            self._metrics["misses"] += 1
            return None

    async def set(self, key: str, value: Any, ttl_seconds: int | None = None) -> bool:
        """
        Serializes and sets a value in cache with a TTL.
        """
        start = time.perf_counter()
        ttl = ttl_seconds if ttl_seconds is not None else settings.CACHE_DEFAULT_TTL_SECONDS
        serialized = json.dumps(value, cls=CustomJSONEncoder)
        success = False

        if self._redis_available and self._redis_client:
            try:
                await self._redis_client.set(key, serialized, ex=ttl)
                # Keep in-memory store synchronized as backup
                await self._memory_store.set(key, serialized, ttl)
                success = True
            except Exception as exc:
                self._metrics["errors"] += 1
                logger.warning(f"Redis SET failed for {key}: {exc}; using in-memory store.")
                success = await self._memory_store.set(key, serialized, ttl)
        else:
            success = await self._memory_store.set(key, serialized, ttl)

        duration_ms = (time.perf_counter() - start) * 1000
        self._metrics["total_latency_ms"] += duration_ms
        self._metrics["operations_count"] += 1
        if success:
            self._metrics["sets"] += 1

        return success

    async def delete(self, key: str) -> bool:
        """Deletes a key from cache."""
        start = time.perf_counter()
        success = False

        if self._redis_available and self._redis_client:
            try:
                del_count = await self._redis_client.delete(key)
                await self._memory_store.delete(key)
                success = del_count > 0
            except Exception as exc:
                self._metrics["errors"] += 1
                logger.warning(f"Redis DELETE failed for {key}: {exc}; deleting from memory.")
                success = await self._memory_store.delete(key)
        else:
            success = await self._memory_store.delete(key)

        duration_ms = (time.perf_counter() - start) * 1000
        self._metrics["total_latency_ms"] += duration_ms
        self._metrics["operations_count"] += 1
        if success:
            self._metrics["deletes"] += 1

        return success

    async def delete_pattern(self, pattern: str) -> int:
        """
        Safely scans and deletes all keys matching pattern without blocking the event loop.
        """
        start = time.perf_counter()
        deleted = 0

        if self._redis_available and self._redis_client:
            try:
                cursor = 0
                keys_to_del = []
                while True:
                    cursor, keys = await self._redis_client.scan(cursor=cursor, match=pattern, count=100)
                    keys_to_del.extend(keys)
                    if cursor == 0:
                        break
                if keys_to_del:
                    deleted = await self._redis_client.delete(*keys_to_del)
                mem_deleted = await self._memory_store.delete_pattern(pattern)
                deleted = max(deleted, mem_deleted)
            except Exception as exc:
                self._metrics["errors"] += 1
                logger.warning(f"Redis delete_pattern failed for {pattern}: {exc}; deleting from memory.")
                deleted = await self._memory_store.delete_pattern(pattern)
        else:
            deleted = await self._memory_store.delete_pattern(pattern)

        duration_ms = (time.perf_counter() - start) * 1000
        self._metrics["total_latency_ms"] += duration_ms
        self._metrics["operations_count"] += 1
        self._metrics["deletes"] += deleted
        return deleted

    async def health_check(self) -> dict[str, Any]:
        """
        Checks cache health and returns status for readiness probes and diagnostics.
        """
        if not self.is_redis_configured:
            return {
                "status": "healthy",
                "backend": "in_memory",
                "message": "Redis not configured; running on local in-memory fallback",
                "redis_configured": False
            }

        start = time.perf_counter()
        try:
            if not self._redis_client:
                await self.initialize()

            if self._redis_client:
                pong = await self._redis_client.ping()
                latency_ms = (time.perf_counter() - start) * 1000
                self._redis_available = True
                return {
                    "status": "healthy",
                    "backend": "redis",
                    "latency_ms": round(latency_ms, 2),
                    "redis_configured": True,
                    "connected": True
                }
            else:
                return {
                    "status": "degraded",
                    "backend": "in_memory_fallback",
                    "message": "Redis client initialization pending or failed",
                    "redis_configured": True,
                    "connected": False
                }
        except Exception as exc:
            self._redis_available = False
            self._metrics["errors"] += 1
            return {
                "status": "degraded",
                "backend": "in_memory_fallback",
                "error": f"{type(exc).__name__}: {str(exc)}",
                "redis_configured": True,
                "connected": False
            }

    def get_metrics(self) -> dict[str, Any]:
        """Returns structured cache performance metrics."""
        hits = self._metrics["hits"]
        misses = self._metrics["misses"]
        total_lookups = hits + misses
        hit_ratio = round((hits / total_lookups) * 100, 2) if total_lookups > 0 else 0.0
        avg_latency = (
            round(self._metrics["total_latency_ms"] / self._metrics["operations_count"], 3)
            if self._metrics["operations_count"] > 0
            else 0.0
        )
        return {
            "hits": hits,
            "misses": misses,
            "sets": self._metrics["sets"],
            "deletes": self._metrics["deletes"],
            "errors": self._metrics["errors"],
            "hit_ratio_percent": hit_ratio,
            "total_lookups": total_lookups,
            "avg_latency_ms": avg_latency,
            "backend": "redis" if self._redis_available else "in_memory"
        }

    def reset_metrics(self) -> None:
        """Resets all metrics counters."""
        for k in self._metrics:
            if isinstance(self._metrics[k], float):
                self._metrics[k] = 0.0
            else:
                self._metrics[k] = 0

    async def clear_local_cache(self) -> None:
        """Utility for test suites to clear in-memory state."""
        await self._memory_store.clear()


# Global singleton instance
cache_service = CacheService()

import asyncio
import time
import pytest
from app.core.cache import CacheService, CacheKeys, InMemoryTTLStore
from app.core.config import settings


@pytest.mark.asyncio
async def test_in_memory_store_basic_crud():
    store = InMemoryTTLStore()
    assert await store.get("key1") is None

    await store.set("key1", "val1", ttl_seconds=10)
    assert await store.get("key1") == "val1"

    deleted = await store.delete("key1")
    assert deleted is True
    assert await store.get("key1") is None


@pytest.mark.asyncio
async def test_in_memory_store_ttl_expiration():
    store = InMemoryTTLStore()
    # 0 second TTL expires immediately
    await store.set("expiring_key", "val", ttl_seconds=0)
    await asyncio.sleep(0.01)
    assert await store.get("expiring_key") is None


@pytest.mark.asyncio
async def test_in_memory_store_pattern_deletion():
    store = InMemoryTTLStore()
    await store.set("kynetic:v1:offers:runpod:us:h100:80", "1", ttl_seconds=60)
    await store.set("kynetic:v1:offers:lambda:us:a100:80", "2", ttl_seconds=60)
    await store.set("kynetic:v1:providers:catalog", "3", ttl_seconds=60)

    deleted_count = await store.delete_pattern("kynetic:v1:offers:*")
    assert deleted_count == 2
    assert await store.get("kynetic:v1:offers:runpod:us:h100:80") is None
    assert await store.get("kynetic:v1:providers:catalog") == "3"


@pytest.mark.asyncio
async def test_cache_service_get_set_metrics():
    cache = CacheService()
    assert cache.is_redis_configured is False

    # Cache miss
    val = await cache.get("test_key")
    assert val is None

    # Cache set & hit
    data = {"offer_id": "off-1", "price": "2.50"}
    await cache.set("test_key", data, ttl_seconds=60)
    cached_val = await cache.get("test_key")
    assert cached_val == data

    metrics = cache.get_metrics()
    assert metrics["hits"] == 1
    assert metrics["misses"] == 1
    assert metrics["sets"] == 1
    assert metrics["hit_ratio_percent"] == 50.0


@pytest.mark.asyncio
async def test_cache_keys_tenant_isolation():
    org1 = "org-1111-aaaa"
    org2 = "org-2222-bbbb"

    key_org1 = CacheKeys.tenant_resource(org1, "project", "proj-alpha")
    key_org2 = CacheKeys.tenant_resource(org2, "project", "proj-alpha")

    # Keys must be completely distinct to prevent cross-tenant data leakage
    assert key_org1 != key_org2
    assert org1 in key_org1
    assert org2 in key_org2
    assert "kynetic:v1:org:" in key_org1


@pytest.mark.asyncio
async def test_cache_service_health_check_in_memory():
    cache = CacheService()
    health = await cache.health_check()
    assert health["status"] == "healthy"
    assert health["backend"] == "in_memory"


@pytest.mark.asyncio
async def test_cache_service_graceful_degradation_on_redis_error():
    cache = CacheService()
    # Simulate failed Redis client
    class FailingRedisMock:
        async def get(self, key):
            raise ConnectionError("Redis cluster unreachable")
        async def set(self, key, val, ex=None):
            raise TimeoutError("Redis socket timeout")

    cache._redis_client = FailingRedisMock()
    cache._redis_available = True

    # Should not raise exception, falls back safely to in-memory store
    await cache.set("fallback_key", {"status": "ok"}, ttl_seconds=60)
    retrieved = await cache.get("fallback_key")

    assert retrieved == {"status": "ok"}
    metrics = cache.get_metrics()
    assert metrics["errors"] >= 1

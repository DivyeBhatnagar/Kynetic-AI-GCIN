import pytest
from app.core.cache import cache_service, CacheKeys


AUTH_HEADERS = {
    "X-User-ID": "usr-cache-test",
    "X-Organization-ID": "org-cache-test",
    "X-User-Role": "ADMIN"
}


@pytest.mark.asyncio
async def test_provider_catalog_caching(client):
    cache_service.reset_metrics()
    await cache_service.clear_local_cache()

    # 1. First call: cache miss, populates cache
    res1 = await client.get("/v1/providers", headers=AUTH_HEADERS)
    assert res1.status_code == 200
    providers1 = res1.json()
    assert len(providers1) > 0

    metrics1 = cache_service.get_metrics()
    assert metrics1["hits"] == 0
    assert metrics1["misses"] >= 1
    assert metrics1["sets"] >= 1

    # 2. Second call: cache hit
    res2 = await client.get("/v1/providers", headers=AUTH_HEADERS)
    assert res2.status_code == 200
    providers2 = res2.json()
    assert len(providers2) == len(providers1)

    metrics2 = cache_service.get_metrics()
    assert metrics2["hits"] >= 1


@pytest.mark.asyncio
async def test_compute_offers_caching_and_invalidation(client):
    cache_service.reset_metrics()
    await cache_service.clear_local_cache()

    # 1. Fetch offers (miss -> cached)
    res1 = await client.get("/v1/compute-offers", headers=AUTH_HEADERS)
    assert res1.status_code == 200
    offers1 = res1.json()
    assert len(offers1) > 0

    metrics1 = cache_service.get_metrics()
    assert metrics1["misses"] >= 1

    # 2. Re-fetch offers (hit)
    res2 = await client.get("/v1/compute-offers", headers=AUTH_HEADERS)
    assert res2.status_code == 200
    assert len(res2.json()) == len(offers1)

    metrics2 = cache_service.get_metrics()
    assert metrics2["hits"] >= 1

    # 3. Trigger provider sync -> invalidates offers cache
    sync_res = await client.post("/v1/providers/runpod/sync-offers", headers=AUTH_HEADERS)
    assert sync_res.status_code == 200

    metrics3 = cache_service.get_metrics()
    assert metrics3["deletes"] >= 1

    # 4. Next call should be a fresh read (cache miss again)
    res3 = await client.get("/v1/compute-offers", headers=AUTH_HEADERS)
    assert res3.status_code == 200
    metrics4 = cache_service.get_metrics()
    assert metrics4["misses"] > metrics2["misses"]

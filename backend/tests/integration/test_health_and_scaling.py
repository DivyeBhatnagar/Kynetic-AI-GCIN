import pytest
from app.adapters.persistence.database import get_db
from app.main import app


@pytest.mark.asyncio
async def test_health_live_endpoint(client):
    res = await client.get("/health/live")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "alive"
    assert data["service"] == "kynetic-backend"
    assert "instance_id" in data
    assert "uptime_seconds" in data
    assert "X-Request-ID" in res.headers
    assert "X-Response-Time-Ms" in res.headers
    assert "X-Instance-ID" in res.headers


@pytest.mark.asyncio
async def test_health_ready_endpoint_healthy(client):
    res = await client.get("/health/ready")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ready"
    assert data["database"]["connected"] is True
    assert "cache" in data


@pytest.mark.asyncio
async def test_health_ready_endpoint_db_failure(client):
    async def failing_db():
        class MockBrokenSession:
            async def execute(self, stmt):
                raise ConnectionError("PostgreSQL pool connection refused")
        yield MockBrokenSession()

    app.dependency_overrides[get_db] = failing_db
    try:
        res = await client.get("/health/ready")
        assert res.status_code == 503
        data = res.json()
        assert data["status"] == "not_ready"
        assert data["database"]["connected"] is False
        assert "connection refused" in data["database"]["error"].lower()
    finally:
        app.dependency_overrides.pop(get_db, None)


@pytest.mark.asyncio
async def test_health_metrics_endpoint(client):
    res = await client.get("/health/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "cache_metrics" in data
    assert "pool_config" in data
    assert "rate_limiting" in data


@pytest.mark.asyncio
async def test_request_id_preservation(client):
    custom_req_id = "req_custom_trace_98765"
    res = await client.get("/health/live", headers={"X-Request-ID": custom_req_id})
    assert res.status_code == 200
    assert res.headers["X-Request-ID"] == custom_req_id

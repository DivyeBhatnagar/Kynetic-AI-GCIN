import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_cross_tenant_isolation(client: AsyncClient):
    # 1. Tenant A creates Org and Project
    headers_tenant_a = {
        "X-Org-ID": "org-tenant-alpha",
        "X-User-Role": "OWNER"
    }
    resp_proj = await client.post(
        "/v1/projects",
        json={"name": "Alpha Project", "slug": "alpha-proj"},
        headers=headers_tenant_a
    )
    assert resp_proj.status_code == 201
    project_id = resp_proj.json()["id"]

    # 2. Tenant B attempts to access Tenant A's project
    headers_tenant_b = {
        "X-Org-ID": "org-tenant-bravo",
        "X-User-Role": "DEVELOPER"
    }
    resp_forbidden = await client.get(
        f"/v1/projects/{project_id}",
        headers=headers_tenant_b
    )
    # Must reject with 403 Forbidden due to tenant boundary guard
    assert resp_forbidden.status_code == 403
    error_body = resp_forbidden.json()["error"]
    assert error_body["code"] == "TENANT_MISMATCH"

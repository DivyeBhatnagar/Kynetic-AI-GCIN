import pytest
from app.adapters.persistence.models import OrganizationModel, ProjectModel, WorkloadModel, RunModel
from app.adapters.persistence.database import get_db

AUTH_HEADERS = {
    "X-User-ID": "usr-page-test",
    "X-Organization-ID": "org-page-test",
    "X-User-Role": "ADMIN"
}


@pytest.mark.asyncio
async def test_compute_offers_pagination(client):
    res_all = await client.get("/v1/compute-offers", headers=AUTH_HEADERS)
    assert res_all.status_code == 200
    all_offers = res_all.json()
    assert len(all_offers) >= 2

    # Request limit=1, offset=0
    res_page1 = await client.get("/v1/compute-offers?limit=1&offset=0", headers=AUTH_HEADERS)
    assert res_page1.status_code == 200
    page1 = res_page1.json()
    assert len(page1) == 1
    assert page1[0]["id"] == all_offers[0]["id"]

    # Request limit=1, offset=1
    res_page2 = await client.get("/v1/compute-offers?limit=1&offset=1", headers=AUTH_HEADERS)
    assert res_page2.status_code == 200
    page2 = res_page2.json()
    assert len(page2) == 1
    assert page2[0]["id"] == all_offers[1]["id"]


@pytest.mark.asyncio
async def test_pagination_validation_boundaries(client):
    # Limit out of bounds (max 200)
    res_bad_limit = await client.get("/v1/compute-offers?limit=500", headers=AUTH_HEADERS)
    assert res_bad_limit.status_code == 422
    assert res_bad_limit.json()["error"]["code"] == "VALIDATION_ERROR"

    # Negative offset
    res_bad_offset = await client.get("/v1/compute-offers?offset=-5", headers=AUTH_HEADERS)
    assert res_bad_offset.status_code == 422

    # Zero limit (min 1)
    res_zero_limit = await client.get("/v1/compute-offers?limit=0", headers=AUTH_HEADERS)
    assert res_zero_limit.status_code == 422


@pytest.mark.asyncio
async def test_workloads_and_runs_pagination(client, db_session):
    # Setup test org and project
    org = OrganizationModel(id="org-page-test", name="Page Org", slug="page-org")
    proj = ProjectModel(id="proj-page-test", organization_id=org.id, name="Page Proj", slug="page-proj")
    db_session.add(org)
    db_session.add(proj)
    await db_session.flush()

    # Create 3 workloads
    for i in range(3):
        w = WorkloadModel(
            id=f"wl-page-{i}",
            organization_id=org.id,
            project_id=proj.id,
            name=f"Workload {i}",
            created_by="usr-page-test"
        )
        db_session.add(w)

    # Create 2 runs
    for i in range(2):
        r = RunModel(
            id=f"run-page-{i}",
            organization_id=org.id,
            project_id=proj.id,
            workload_revision_id="rev-1",
            plan_id="plan-1",
            compute_offer_id="off-1",
            status="RUNNING",
            idempotency_key=f"idemp-page-{i}",
            created_by="usr-page-test"
        )
        db_session.add(r)
    await db_session.commit()

    # Test workloads pagination
    res_wl_p1 = await client.get("/v1/workloads?limit=2&offset=0", headers=AUTH_HEADERS)
    assert res_wl_p1.status_code == 200
    assert len(res_wl_p1.json()) == 2

    res_wl_p2 = await client.get("/v1/workloads?limit=2&offset=2", headers=AUTH_HEADERS)
    assert res_wl_p2.status_code == 200
    assert len(res_wl_p2.json()) == 1

    # Test runs list endpoint
    res_runs = await client.get("/v1/runs?limit=10&offset=0", headers=AUTH_HEADERS)
    assert res_runs.status_code == 200
    runs_data = res_runs.json()
    assert len(runs_data) == 2

    # Test runs filter by status
    res_runs_filter = await client.get("/v1/runs?status=RUNNING", headers=AUTH_HEADERS)
    assert res_runs_filter.status_code == 200
    assert len(res_runs_filter.json()) == 2

    # Test runs tenant isolation: different tenant cannot see runs
    other_tenant_headers = {
        "X-User-ID": "usr-other",
        "X-Organization-ID": "org-other-isolated",
        "X-User-Role": "ADMIN"
    }
    res_isolated = await client.get("/v1/runs", headers=other_tenant_headers)
    assert res_isolated.status_code == 200
    assert len(res_isolated.json()) == 0

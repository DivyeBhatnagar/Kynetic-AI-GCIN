import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_provider_endpoints_and_live_sync_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Step 1: Query all available providers
        prov_resp = await client.get("/v1/providers")
        assert prov_resp.status_code == 200
        providers = prov_resp.json()
        assert len(providers) >= 5
        keys = {p["key"] for p in providers}
        assert "runpod" in keys
        assert "lambda" in keys
        assert "aws" in keys
        assert "gcp" in keys
        assert "azure" in keys

        # Step 2: Query aggregated compute offers across providers
        offers_resp = await client.get("/v1/compute-offers")
        assert offers_resp.status_code == 200
        all_offers = offers_resp.json()
        assert len(all_offers) >= 15

        # Filter by provider = runpod
        runpod_offers_resp = await client.get("/v1/compute-offers?provider=runpod")
        assert runpod_offers_resp.status_code == 200
        rp_offers = runpod_offers_resp.json()
        assert all(o["provider_key"] == "runpod" for o in rp_offers)

        # Filter by GPU model = H100 and min_vram = 80
        h100_resp = await client.get("/v1/compute-offers?gpu_model=H100&min_vram=80")
        assert h100_resp.status_code == 200
        h100_offers = h100_resp.json()
        assert len(h100_offers) >= 3
        assert all(o["gpu_model"] == "H100" and o["gpu_memory_gb"] >= 80 for o in h100_offers)

        # Step 3: Register a Provider Connection (e.g. for RunPod)
        conn_payload = {
            "provider_id": "prov-runpod-001",
            "display_name": "RunPod Production Account",
            "secret_reference": "vault://kynetic/org-default/runpod-api-key"
        }
        create_conn_resp = await client.post("/v1/provider-connections", json=conn_payload)
        assert create_conn_resp.status_code == 201
        conn_data = create_conn_resp.json()
        conn_id = conn_data["id"]
        assert conn_data["status"] == "ACTIVE"
        # Verify secret reference is masked
        assert conn_data["secret_reference_masked"].endswith("***")

        # Step 4: Verify Provider Connection
        verify_resp = await client.post(f"/v1/provider-connections/{conn_id}/verify")
        assert verify_resp.status_code == 200
        verify_data = verify_resp.json()
        assert verify_data["is_valid"] is True
        assert verify_data["status"] == "VERIFIED"
        assert "verified" in verify_data["message"].lower()

        # Step 5: Trigger Live Offer Sync from provider
        sync_resp = await client.post("/v1/providers/runpod/sync-offers")
        assert sync_resp.status_code == 200
        sync_data = sync_resp.json()
        assert sync_data["provider_key"] == "runpod"
        assert sync_data["synced_count"] >= 4
        assert len(sync_data["offers"]) >= 4
        assert any(o["gpu_model"] == "H100" for o in sync_data["offers"])

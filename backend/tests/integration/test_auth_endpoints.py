import pytest
import uuid


@pytest.mark.asyncio
async def test_register_user_success(client):
    unique_email = f"user_{uuid.uuid4().hex[:8]}@kynetic.ai"
    payload = {
        "email": unique_email,
        "password": "StrongPassword123!",
        "display_name": "Test Engineer",
        "organization_name": "Quantum Research Labs",
    }
    response = await client.post("/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "Bearer"
    assert data["expires_in"] == 1440 * 60
    assert data["user"]["email"] == unique_email
    assert data["user"]["display_name"] == "Test Engineer"
    assert data["organization"]["name"] == "Quantum Research Labs"
    assert data["organization"]["role"] == "OWNER"


@pytest.mark.asyncio
async def test_register_duplicate_email_conflict(client):
    unique_email = f"duplicate_{uuid.uuid4().hex[:8]}@kynetic.ai"
    payload = {
        "email": unique_email,
        "password": "Password123!",
        "display_name": "User One",
    }
    res1 = await client.post("/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = await client.post("/v1/auth/register", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]


@pytest.mark.asyncio
async def test_login_flow_and_failures(client):
    unique_email = f"login_{uuid.uuid4().hex[:8]}@kynetic.ai"
    register_payload = {
        "email": unique_email,
        "password": "SecretPassword99!",
        "display_name": "Login Tester",
    }
    reg_res = await client.post("/v1/auth/register", json=register_payload)
    assert reg_res.status_code == 201

    # 1. Successful login
    login_res = await client.post(
        "/v1/auth/login",
        json={"email": unique_email, "password": "SecretPassword99!"},
    )
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == unique_email

    # 2. Invalid password
    bad_pw_res = await client.post(
        "/v1/auth/login",
        json={"email": unique_email, "password": "WrongPassword!"},
    )
    assert bad_pw_res.status_code == 401

    # 3. Non-existent user
    unknown_user_res = await client.post(
        "/v1/auth/login",
        json={"email": "nonexistent@kynetic.ai", "password": "SecretPassword99!"},
    )
    assert unknown_user_res.status_code == 401


@pytest.mark.asyncio
async def test_token_refresh_flow(client):
    unique_email = f"refresh_{uuid.uuid4().hex[:8]}@kynetic.ai"
    reg_res = await client.post(
        "/v1/auth/register",
        json={
            "email": unique_email,
            "password": "Password456!",
            "display_name": "Refresh Tester",
        },
    )
    assert reg_res.status_code == 201
    refresh_token = reg_res.json()["refresh_token"]

    # Refresh valid token
    ref_res = await client.post("/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert ref_res.status_code == 200
    ref_data = ref_res.json()
    assert "access_token" in ref_data
    assert ref_data["token_type"] == "Bearer"

    # Refresh invalid token
    bad_ref = await client.post("/v1/auth/refresh", json={"refresh_token": "invalid.jwt.token"})
    assert bad_ref.status_code == 401


@pytest.mark.asyncio
async def test_auth_me_with_jwt_bearer(client):
    unique_email = f"me_{uuid.uuid4().hex[:8]}@kynetic.ai"
    reg_res = await client.post(
        "/v1/auth/register",
        json={
            "email": unique_email,
            "password": "SecurePassword123!",
            "display_name": "Profile Owner",
            "organization_name": "Profile Org",
        },
    )
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    org_id = reg_res.json()["organization"]["id"]

    # Call /v1/auth/me with Bearer JWT
    me_res = await client.get("/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["user"]["email"] == unique_email
    assert me_data["current_organization_id"] == org_id
    assert me_data["current_role"] == "OWNER"
    assert len(me_data["organizations"]) >= 1


@pytest.mark.asyncio
async def test_api_key_lifecycle_and_authentication(client):
    # 1. Register a user to obtain an OWNER token
    unique_email = f"apikey_{uuid.uuid4().hex[:8]}@kynetic.ai"
    reg_res = await client.post(
        "/v1/auth/register",
        json={
            "email": unique_email,
            "password": "MasterPassword777!",
            "display_name": "API Key Admin",
        },
    )
    assert reg_res.status_code == 201
    jwt_token = reg_res.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {jwt_token}"}

    # 2. Create API key
    create_key_res = await client.post(
        "/v1/api-keys",
        json={"name": "GitHub Actions CI Runner", "scopes": ["read", "write"], "expires_in_days": 30},
        headers=auth_headers,
    )
    assert create_key_res.status_code == 201
    key_data = create_key_res.json()
    secret_key = key_data["secret_key"]
    key_id = key_data["id"]
    assert secret_key.startswith("kyn_live_")
    assert key_data["prefix"] == secret_key[:16]
    assert key_data["status"] == "ACTIVE"

    # 3. List API keys
    list_keys_res = await client.get("/v1/api-keys", headers=auth_headers)
    assert list_keys_res.status_code == 200
    keys_list = list_keys_res.json()
    assert any(k["id"] == key_id for k in keys_list)
    # Ensure secret is NOT exposed in list response
    assert not any("secret_key" in k for k in keys_list)

    # 4. Use X-API-Key to authenticate against protected route (/v1/projects)
    api_auth_headers = {"X-API-Key": secret_key}
    projects_res = await client.get("/v1/projects", headers=api_auth_headers)
    assert projects_res.status_code == 200
    assert isinstance(projects_res.json(), list)

    # 5. Revoke the API key
    revoke_res = await client.delete(f"/v1/api-keys/{key_id}", headers=auth_headers)
    assert revoke_res.status_code == 204

    # 6. Subsequent request with revoked API key must fail with 401
    revoked_call = await client.get("/v1/projects", headers=api_auth_headers)
    assert revoked_call.status_code == 401
    assert "Invalid or revoked API key" in revoked_call.json()["detail"]

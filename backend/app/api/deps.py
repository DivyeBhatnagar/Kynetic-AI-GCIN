import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, Header, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.adapters.persistence.database import get_db
from app.adapters.persistence.models import ApiKeyModel
from app.core.errors import AuthenticationRequiredError, TenantMismatchError
from app.core.security import (
    AuthContext,
    Role,
    decode_jwt_token,
    hash_api_key,
    verify_api_token,
)


def get_request_id(x_request_id: str | None = Header(None)) -> str:
    return x_request_id or f"req_{uuid.uuid4().hex[:16]}"


async def get_current_auth(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    authorization: str | None = Header(None),
    x_api_key: str | None = Header(None),
    x_org_id: str | None = Header(None),
    x_organization_id: str | None = Header(None),
    x_user_role: str | None = Header(None),
) -> AuthContext:
    """
    Resolves caller authentication and tenancy context.
    Priority order:
    1. X-API-Key header or Bearer kyn_live_... API key
    2. Bearer JWT access token (RFC 7519 HS256)
    3. Legacy HMAC-signed token
    4. Development tenant headers (X-Org-ID / X-Organization-ID)
    5. Default development tenant fallback
    """
    # 1. API Key Authentication (X-API-Key or Bearer kyn_live_...)
    raw_api_key = x_api_key
    if not raw_api_key and authorization and authorization.startswith("Bearer kyn_live_"):
        raw_api_key = authorization[7:].strip()

    if raw_api_key:
        hashed = hash_api_key(raw_api_key)
        stmt = select(ApiKeyModel).where(ApiKeyModel.hashed_key == hashed)
        key_record = await db.scalar(stmt)
        if not key_record or key_record.status != "ACTIVE":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or revoked API key.",
                headers={"WWW-Authenticate": "ApiKey"},
            )
        if key_record.expires_at:
            exp = key_record.expires_at
            if exp.tzinfo is None:
                exp = exp.replace(tzinfo=timezone.utc)
            if exp < datetime.now(timezone.utc):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="API key has expired.",
                    headers={"WWW-Authenticate": "ApiKey"},
                )

        # Update last_used_at timestamp
        key_record.last_used_at = datetime.now(timezone.utc)
        await db.commit()

        return AuthContext(
            user_id=key_record.user_id or f"sa-{key_record.prefix}",
            email=f"apikey-{key_record.prefix}@kynetic.ai",
            organization_id=key_record.organization_id,
            role=Role.ADMIN,
        )

    # 2. Bearer Token Authentication (JWT or Legacy Token)
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()

        # Try RFC 7519 JWT verification
        jwt_payload = decode_jwt_token(token)
        if jwt_payload and jwt_payload.get("type") == "access":
            user_id = jwt_payload.get("sub", "unknown")
            email = jwt_payload.get("email", "")
            org_id = jwt_payload.get("org_id", "default-org")
            role_val = jwt_payload.get("role", Role.DEVELOPER.value)
            role = Role(role_val) if role_val in Role.__members__ else Role.DEVELOPER
            return AuthContext(
                user_id=user_id,
                email=email,
                organization_id=org_id,
                role=role,
            )

        # Try Legacy signed token verification
        verified = verify_api_token(token)
        if verified:
            user_id, org_id = verified
            return AuthContext(
                user_id=user_id,
                email=f"{user_id}@example.com",
                organization_id=org_id,
                role=Role.OWNER,
            )

        # If Authorization header was explicitly provided but invalid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authorization token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Development/Test mode: Allow explicit tenant headers
    org_id = x_org_id or x_organization_id
    if org_id:
        role = Role.DEVELOPER
        if x_user_role and x_user_role in Role.__members__:
            role = Role(x_user_role)
        return AuthContext(
            user_id="dev-user-001",
            email="dev@kynetic.ai",
            organization_id=org_id,
            role=role,
        )

    # 4. Default fallback for bootstrap dev/testing
    return AuthContext(
        user_id="default-user",
        email="admin@kynetic.ai",
        organization_id="default-org",
        role=Role.OWNER,
    )


def verify_tenant_access(resource_org_id: str, auth: AuthContext) -> None:
    """Guards against cross-tenant unauthorized data access."""
    if resource_org_id != auth.organization_id:
        raise TenantMismatchError(
            f"Resource belongs to tenant '{resource_org_id}', not caller '{auth.organization_id}'."
        )

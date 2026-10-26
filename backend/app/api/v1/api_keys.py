from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.adapters.persistence.database import get_db
from app.adapters.persistence.models import ApiKeyModel, utc_now
from app.api.deps import get_current_auth, verify_tenant_access
from app.core.security import AuthContext, Role, generate_api_key

router = APIRouter(prefix="/v1/api-keys", tags=["API Keys"])


# --- Schemas ---

class CreateApiKeyRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Descriptive name (e.g. CI/CD Pipeline, Dev CLI)")
    scopes: list[str] = Field(default=["read", "write"])
    expires_in_days: int | None = Field(default=None, ge=1, le=365, description="Optional lifetime in days")


class ApiKeyCreatedResponse(BaseModel):
    id: str
    name: str
    prefix: str
    secret_key: str = Field(..., description="Full secret key. Store this securely; it will not be displayed again.")
    scopes: list[str]
    status: str
    created_at: datetime
    expires_at: datetime | None


class ApiKeySummaryDTO(BaseModel):
    id: str
    name: str
    prefix: str
    scopes: list[str]
    status: str
    created_at: datetime
    last_used_at: datetime | None
    expires_at: datetime | None


# --- Endpoints ---

@router.post("", response_model=ApiKeyCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    req: CreateApiKeyRequest,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Issues a new headless developer API key for the current organization.
    The secret key is returned strictly ONCE in this response.
    """
    if auth.role not in [Role.OWNER, Role.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Organization Owners and Admins can create API keys.",
        )

    raw_key, prefix, hashed_key = generate_api_key(req.name)

    expires_at = None
    if req.expires_in_days:
        expires_at = datetime.now(timezone.utc) + timedelta(days=req.expires_in_days)

    api_key_model = ApiKeyModel(
        organization_id=auth.organization_id,
        user_id=auth.user_id if auth.user_id != "service-account" else None,
        name=req.name.strip(),
        prefix=prefix,
        hashed_key=hashed_key,
        scopes_json=req.scopes,
        status="ACTIVE",
        expires_at=expires_at,
    )
    db.add(api_key_model)
    await db.commit()
    await db.refresh(api_key_model)

    return ApiKeyCreatedResponse(
        id=api_key_model.id,
        name=api_key_model.name,
        prefix=api_key_model.prefix,
        secret_key=raw_key,
        scopes=api_key_model.scopes_json,
        status=api_key_model.status,
        created_at=api_key_model.created_at,
        expires_at=api_key_model.expires_at,
    )


@router.get("", response_model=list[ApiKeySummaryDTO])
async def list_api_keys(
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Lists active and revoked API keys belonging to the current organization.
    Secret values and cryptographic hashes are never exposed.
    """
    stmt = (
        select(ApiKeyModel)
        .where(ApiKeyModel.organization_id == auth.organization_id)
        .order_by(ApiKeyModel.created_at.desc())
    )
    result = await db.scalars(stmt)
    keys = result.all()

    return [
        ApiKeySummaryDTO(
            id=k.id,
            name=k.name,
            prefix=k.prefix,
            scopes=k.scopes_json,
            status=k.status,
            created_at=k.created_at,
            last_used_at=k.last_used_at,
            expires_at=k.expires_at,
        )
        for k in keys
    ]


@router.delete("/{api_key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(
    api_key_id: str,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Immediately revokes an API key, disabling subsequent authentication requests.
    """
    if auth.role not in [Role.OWNER, Role.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Organization Owners and Admins can revoke API keys.",
        )

    stmt = select(ApiKeyModel).where(ApiKeyModel.id == api_key_id)
    key = await db.scalar(stmt)
    if not key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found.")

    verify_tenant_access(key.organization_id, auth)

    key.status = "REVOKED"
    await db.commit()
    return None

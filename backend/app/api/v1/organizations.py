from typing import Annotated
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.adapters.persistence.database import get_db
from app.adapters.persistence.models import OrganizationModel, MembershipModel
from app.core.security import AuthContext
from app.api.deps import get_current_auth, verify_tenant_access
from app.core.errors import EntityNotFoundError

router = APIRouter(prefix="/v1/organizations", tags=["Organizations"])


class OrganizationCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    default_currency: str = Field(default="USD", min_length=3, max_length=3)


class OrganizationResponse(BaseModel):
    id: str
    name: str
    slug: str
    status: str
    default_currency: str


@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    payload: OrganizationCreateRequest,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    org = OrganizationModel(
        name=payload.name,
        slug=payload.slug,
        default_currency=payload.default_currency,
        status="ACTIVE"
    )
    db.add(org)
    await db.flush()

    # Link creator as OWNER
    membership = MembershipModel(
        organization_id=org.id,
        user_id=auth.user_id,
        role="OWNER",
        status="ACTIVE"
    )
    db.add(membership)
    await db.flush()

    return OrganizationResponse(
        id=org.id,
        name=org.name,
        slug=org.slug,
        status=org.status,
        default_currency=org.default_currency
    )


@router.get("", response_model=list[OrganizationResponse])
async def list_organizations(
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    # Only return organizations where user has membership
    stmt = (
        select(OrganizationModel)
        .join(MembershipModel, MembershipModel.organization_id == OrganizationModel.id)
        .where(MembershipModel.user_id == auth.user_id)
    )
    result = await db.execute(stmt)
    orgs = result.scalars().all()
    return [
        OrganizationResponse(
            id=o.id,
            name=o.name,
            slug=o.slug,
            status=o.status,
            default_currency=o.default_currency
        )
        for o in orgs
    ]


@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: str,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    verify_tenant_access(org_id, auth)
    stmt = select(OrganizationModel).where(OrganizationModel.id == org_id)
    result = await db.execute(stmt)
    org = result.scalar_one_or_none()
    if not org:
        raise EntityNotFoundError("Organization", org_id)
    return OrganizationResponse(
        id=org.id,
        name=org.name,
        slug=org.slug,
        status=org.status,
        default_currency=org.default_currency
    )

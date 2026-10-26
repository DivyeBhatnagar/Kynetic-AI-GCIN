import re
import secrets
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.adapters.persistence.database import get_db
from app.adapters.persistence.models import (
    MembershipModel,
    OrganizationModel,
    ProjectModel,
    UserModel,
    utc_now,
)
from app.api.deps import get_current_auth
from app.core.config import settings
from app.core.security import (
    AuthContext,
    Role,
    create_access_token,
    create_refresh_token,
    decode_jwt_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/v1/auth", tags=["Authentication"])


def _slugify(text: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return cleaned or "org"


# --- Schemas ---

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class RegisterRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_PATTERN, description="Valid email address")
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    display_name: str = Field(..., min_length=1, max_length=100)
    organization_name: str | None = Field(default=None, max_length=100)


class LoginRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_PATTERN)
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserDTO(BaseModel):
    id: str
    email: str
    display_name: str
    status: str


class OrganizationDTO(BaseModel):
    id: str
    name: str
    slug: str
    role: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int
    user: UserDTO
    organization: OrganizationDTO


class TokenRefreshResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    expires_in: int


class CurrentUserResponse(BaseModel):
    user: UserDTO
    organizations: list[OrganizationDTO]
    current_organization_id: str
    current_role: str


# --- Endpoints ---

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    req: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Registers a new tenant user, initializes their organization, default project,
    and returns a signed JWT access + refresh token session.
    """
    # 1. Check if email already exists
    existing = await db.scalar(select(UserModel).where(UserModel.email == req.email.lower().strip()))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists.",
        )

    # 2. Create User with PBKDF2 hash
    pwd_hash = hash_password(req.password)
    user = UserModel(
        email=req.email.lower().strip(),
        display_name=req.display_name.strip(),
        password_hash=pwd_hash,
        status="ACTIVE",
    )
    db.add(user)
    await db.flush()

    # 3. Create Default Organization
    org_name = (req.organization_name or f"{req.display_name}'s Org").strip()
    base_slug = _slugify(org_name)
    slug = f"{base_slug}-{secrets.token_hex(3)}"
    org = OrganizationModel(
        name=org_name,
        slug=slug,
        status="ACTIVE",
        default_currency="USD",
    )
    db.add(org)
    await db.flush()

    # 4. Create Default Project
    project = ProjectModel(
        organization_id=org.id,
        name="Default Project",
        slug="default-project",
        description="Auto-generated default project workspace",
        status="ACTIVE",
    )
    db.add(project)

    # 5. Add Membership as OWNER
    membership = MembershipModel(
        organization_id=org.id,
        user_id=user.id,
        role=Role.OWNER.value,
        status="ACTIVE",
    )
    db.add(membership)
    await db.commit()
    await db.refresh(user)
    await db.refresh(org)

    # 6. Issue Tokens
    access_token = create_access_token(
        user_id=user.id,
        email=user.email,
        organization_id=org.id,
        role=Role.OWNER,
    )
    refresh_token = create_refresh_token(user_id=user.id)

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="Bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserDTO(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            status=user.status,
        ),
        organization=OrganizationDTO(
            id=org.id,
            name=org.name,
            slug=org.slug,
            role=Role.OWNER.value,
        ),
    )


@router.post("/login", response_model=AuthResponse)
async def login_user(
    req: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Authenticates user credentials and issues an active JWT access session.
    """
    stmt = (
        select(UserModel)
        .options(selectinload(UserModel.memberships).selectinload(MembershipModel.organization))
        .where(UserModel.email == req.email.lower().strip())
    )
    user = await db.scalar(stmt)

    if not user or not user.password_hash or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended or deactivated.",
        )

    # Resolve primary organization membership
    active_membership = next((m for m in user.memberships if m.status == "ACTIVE"), None)
    if not active_membership:
        # Fallback or auto-create personal org
        org = OrganizationModel(
            name=f"{user.display_name}'s Org",
            slug=f"org-{secrets.token_hex(4)}",
            status="ACTIVE",
            default_currency="USD",
        )
        db.add(org)
        await db.flush()
        active_membership = MembershipModel(
            organization_id=org.id,
            user_id=user.id,
            role=Role.OWNER.value,
            status="ACTIVE",
        )
        db.add(active_membership)
        await db.commit()
        await db.refresh(active_membership)
        await db.refresh(org)
        active_membership.organization = org

    role = Role(active_membership.role) if active_membership.role in Role.__members__ else Role.DEVELOPER

    access_token = create_access_token(
        user_id=user.id,
        email=user.email,
        organization_id=active_membership.organization_id,
        role=role,
    )
    refresh_token = create_refresh_token(user_id=user.id)

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="Bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserDTO(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            status=user.status,
        ),
        organization=OrganizationDTO(
            id=active_membership.organization.id,
            name=active_membership.organization.name,
            slug=active_membership.organization.slug,
            role=active_membership.role,
        ),
    )


@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_access_token(
    req: RefreshTokenRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Exchanges a valid refresh token for a newly signed access token.
    """
    payload = decode_jwt_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    stmt = (
        select(UserModel)
        .options(selectinload(UserModel.memberships).selectinload(MembershipModel.organization))
        .where(UserModel.id == user_id)
    )
    user = await db.scalar(stmt)
    if not user or user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account associated with this token is not active.",
        )

    active_membership = next((m for m in user.memberships if m.status == "ACTIVE"), None)
    if not active_membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active organization membership found.",
        )

    role = Role(active_membership.role) if active_membership.role in Role.__members__ else Role.DEVELOPER

    new_access_token = create_access_token(
        user_id=user.id,
        email=user.email,
        organization_id=active_membership.organization_id,
        role=role,
    )

    return TokenRefreshResponse(
        access_token=new_access_token,
        token_type="Bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.get("/me", response_model=CurrentUserResponse)
async def get_current_user_profile(
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Returns the authenticated user's profile and organization memberships.
    """
    stmt = (
        select(UserModel)
        .options(selectinload(UserModel.memberships).selectinload(MembershipModel.organization))
        .where(UserModel.id == auth.user_id)
    )
    user = await db.scalar(stmt)

    if not user:
        # If authenticated via synthetic token or dev header
        return CurrentUserResponse(
            user=UserDTO(
                id=auth.user_id,
                email=auth.email,
                display_name=auth.email.split("@")[0].title(),
                status="ACTIVE",
            ),
            organizations=[
                OrganizationDTO(
                    id=auth.organization_id,
                    name="Default Workspace",
                    slug="default-workspace",
                    role=auth.role.value,
                )
            ],
            current_organization_id=auth.organization_id,
            current_role=auth.role.value,
        )

    orgs = [
        OrganizationDTO(
            id=m.organization.id,
            name=m.organization.name,
            slug=m.organization.slug,
            role=m.role,
        )
        for m in user.memberships
        if m.status == "ACTIVE"
    ]

    return CurrentUserResponse(
        user=UserDTO(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            status=user.status,
        ),
        organizations=orgs,
        current_organization_id=auth.organization_id,
        current_role=auth.role.value,
    )

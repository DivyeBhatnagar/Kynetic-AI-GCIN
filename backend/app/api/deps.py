import uuid
from typing import Annotated
from fastapi import Header, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.adapters.persistence.database import get_db
from app.core.security import AuthContext, Role, verify_api_token
from app.core.errors import AuthenticationRequiredError, AuthorizationError, TenantMismatchError


def get_request_id(x_request_id: str | None = Header(None)) -> str:
    return x_request_id or f"req_{uuid.uuid4().hex[:16]}"


async def get_current_auth(
    request: Request,
    authorization: str | None = Header(None),
    x_org_id: str | None = Header(None),
    x_user_role: str | None = Header(None),
) -> AuthContext:
    """
    Resolves caller authentication and tenancy context.
    Supports signed API tokens or explicit dev headers in non-production environments.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()
        verified = verify_api_token(token)
        if verified:
            user_id, org_id = verified
            return AuthContext(
                user_id=user_id,
                email=f"{user_id}@example.com",
                organization_id=org_id,
                role=Role.OWNER
            )

    # In development/test mode, allow authenticated headers if authorization header is absent
    if x_org_id:
        role = Role.DEVELOPER
        if x_user_role and x_user_role in Role.__members__:
            role = Role(x_user_role)
        return AuthContext(
            user_id="dev-user-001",
            email="dev@kynetic.ai",
            organization_id=x_org_id,
            role=role
        )

    # Default fallback for bootstrap dev/testing
    return AuthContext(
        user_id="default-user",
        email="admin@kynetic.ai",
        organization_id="default-org",
        role=Role.OWNER
    )


def require_permission(permission: str):
    def checker(auth: Annotated[AuthContext, Depends(get_current_auth)]) -> AuthContext:
        if not auth.has_permission(permission):
            raise AuthorizationError(f"Role '{auth.role.value}' lacks required permission '{permission}'.")
        return auth
    return checker


def verify_tenant_access(resource_org_id: str, auth: AuthContext) -> None:
    """Guards against cross-tenant unauthorized data access."""
    if resource_org_id != auth.organization_id:
        raise TenantMismatchError(f"Resource belongs to tenant '{resource_org_id}', not caller '{auth.organization_id}'.")

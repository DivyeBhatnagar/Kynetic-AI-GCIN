from typing import Annotated
from decimal import Decimal
from fastapi import APIRouter, Depends, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.adapters.persistence.database import get_db
from app.adapters.persistence.models import ProjectModel, ProjectPolicyModel
from app.core.security import AuthContext
from app.api.deps import get_current_auth, verify_tenant_access
from app.core.errors import EntityNotFoundError

router = APIRouter(prefix="/v1/projects", tags=["Projects"])


class ProjectCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    description: str | None = None
    max_job_cost: Decimal | None = None
    allowed_providers: list[str] = Field(default_factory=list)
    allowed_regions: list[str] = Field(default_factory=list)


class PolicyResponse(BaseModel):
    max_job_cost: Decimal | None
    require_approval_above: Decimal | None
    allowed_providers: list[str]
    allowed_regions: list[str]
    auto_action_mode: str
    cooldown_seconds: int


class ProjectResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    slug: str
    description: str | None
    status: str
    policy: PolicyResponse | None = None


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreateRequest,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    project = ProjectModel(
        organization_id=auth.organization_id,
        name=payload.name,
        slug=payload.slug,
        description=payload.description,
        status="ACTIVE"
    )
    db.add(project)
    await db.flush()

    policy = ProjectPolicyModel(
        organization_id=auth.organization_id,
        project_id=project.id,
        max_job_cost=payload.max_job_cost,
        require_approval_above=Decimal("50.0000"),
        allowed_providers=payload.allowed_providers,
        allowed_regions=payload.allowed_regions,
        auto_action_mode="RECOMMEND_ONLY",
        cooldown_seconds=300
    )
    db.add(policy)
    await db.flush()

    return ProjectResponse(
        id=project.id,
        organization_id=project.organization_id,
        name=project.name,
        slug=project.slug,
        description=project.description,
        status=project.status,
        policy=PolicyResponse(
            max_job_cost=policy.max_job_cost,
            require_approval_above=policy.require_approval_above,
            allowed_providers=policy.allowed_providers,
            allowed_regions=policy.allowed_regions,
            auto_action_mode=policy.auto_action_mode,
            cooldown_seconds=policy.cooldown_seconds
        )
    )


@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    limit: int = Query(50, ge=1, le=200, description="Max items to return"),
    offset: int = Query(0, ge=0, description="Items to skip"),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(ProjectModel)
        .where(ProjectModel.organization_id == auth.organization_id)
        .order_by(ProjectModel.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    projects = result.scalars().all()
    return [
        ProjectResponse(
            id=p.id,
            organization_id=p.organization_id,
            name=p.name,
            slug=p.slug,
            description=p.description,
            status=p.status
        )
        for p in projects
    ]


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ProjectModel).where(ProjectModel.id == project_id)
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()
    if not project:
        raise EntityNotFoundError("Project", project_id)
    verify_tenant_access(project.organization_id, auth)

    policy_stmt = select(ProjectPolicyModel).where(ProjectPolicyModel.project_id == project.id)
    policy_res = await db.execute(policy_stmt)
    policy = policy_res.scalar_one_or_none()

    policy_data = None
    if policy:
        policy_data = PolicyResponse(
            max_job_cost=policy.max_job_cost,
            require_approval_above=policy.require_approval_above,
            allowed_providers=policy.allowed_providers,
            allowed_regions=policy.allowed_regions,
            auto_action_mode=policy.auto_action_mode,
            cooldown_seconds=policy.cooldown_seconds
        )

    return ProjectResponse(
        id=project.id,
        organization_id=project.organization_id,
        name=project.name,
        slug=project.slug,
        description=project.description,
        status=project.status,
        policy=policy_data
    )

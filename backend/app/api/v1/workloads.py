from typing import Annotated, Any
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.adapters.persistence.database import get_db
from app.adapters.persistence.models import WorkloadModel, WorkloadRevisionModel, ProjectModel
from app.domain.workloads.manifest import WorkloadManifest
from app.core.security import AuthContext
from app.api.deps import get_current_auth, verify_tenant_access
from app.core.errors import EntityNotFoundError, ManifestValidationError

router = APIRouter(prefix="/v1/workloads", tags=["Workloads"])


class WorkloadCreateRequest(BaseModel):
    project_id: str
    manifest: WorkloadManifest


class WorkloadRevisionResponse(BaseModel):
    id: str
    revision_number: int
    schema_version: str
    manifest_digest: str
    fingerprint: dict[str, Any]
    manifest: dict[str, Any]


class WorkloadResponse(BaseModel):
    id: str
    organization_id: str
    project_id: str
    name: str
    workload_type: str
    status: str
    current_revision: WorkloadRevisionResponse | None = None


class ManifestValidationResponse(BaseModel):
    valid: bool
    manifest_digest: str
    fingerprint: dict[str, Any]
    message: str


@router.post("/validate-manifest", response_model=ManifestValidationResponse)
async def validate_manifest_endpoint(
    manifest: WorkloadManifest,
    auth: Annotated[AuthContext, Depends(get_current_auth)]
):
    """
    Validates workload manifest syntax, semantic rules and security policies.
    Returns calculated digest and execution fingerprint.
    """
    digest = manifest.compute_digest()
    fingerprint = manifest.derive_fingerprint()
    return ManifestValidationResponse(
        valid=True,
        manifest_digest=digest,
        fingerprint=fingerprint,
        message="Manifest is semantically valid and compliant with security rules."
    )


@router.post("", response_model=WorkloadResponse, status_code=status.HTTP_201_CREATED)
async def create_workload(
    payload: WorkloadCreateRequest,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    # Verify project exists and belongs to caller's org
    proj_stmt = select(ProjectModel).where(ProjectModel.id == payload.project_id)
    proj_res = await db.execute(proj_stmt)
    project = proj_res.scalar_one_or_none()
    if not project:
        raise EntityNotFoundError("Project", payload.project_id)
    verify_tenant_access(project.organization_id, auth)

    manifest = payload.manifest
    digest = manifest.compute_digest()
    fingerprint = manifest.derive_fingerprint()

    # Create Workload parent
    workload = WorkloadModel(
        organization_id=auth.organization_id,
        project_id=project.id,
        name=manifest.name,
        workload_type=manifest.workload_type,
        status="ACTIVE",
        created_by=auth.user_id
    )
    db.add(workload)
    await db.flush()

    # Create Revision 1 (immutable)
    revision = WorkloadRevisionModel(
        workload_id=workload.id,
        revision_number=1,
        schema_version=manifest.schema_version,
        manifest_json=manifest.model_dump(mode="json"),
        manifest_digest=digest,
        fingerprint_json=fingerprint,
        created_by=auth.user_id
    )
    db.add(revision)
    await db.flush()

    # Update current revision pointer
    workload.current_revision_id = revision.id
    await db.flush()

    return WorkloadResponse(
        id=workload.id,
        organization_id=workload.organization_id,
        project_id=workload.project_id,
        name=workload.name,
        workload_type=workload.workload_type,
        status=workload.status,
        current_revision=WorkloadRevisionResponse(
            id=revision.id,
            revision_number=revision.revision_number,
            schema_version=revision.schema_version,
            manifest_digest=revision.manifest_digest,
            fingerprint=revision.fingerprint_json,
            manifest=revision.manifest_json
        )
    )


@router.get("", response_model=list[WorkloadResponse])
async def list_workloads(
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    project_id: str | None = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(WorkloadModel)
        .where(WorkloadModel.organization_id == auth.organization_id)
        .order_by(WorkloadModel.created_at.desc())
    )
    if project_id:
        stmt = stmt.where(WorkloadModel.project_id == project_id)

    result = await db.execute(stmt)
    workloads = result.scalars().all()
    return [
        WorkloadResponse(
            id=w.id,
            organization_id=w.organization_id,
            project_id=w.project_id,
            name=w.name,
            workload_type=w.workload_type,
            status=w.status
        )
        for w in workloads
    ]


@router.get("/{workload_id}", response_model=WorkloadResponse)
async def get_workload(
    workload_id: str,
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    db: AsyncSession = Depends(get_db)
):
    stmt = select(WorkloadModel).where(WorkloadModel.id == workload_id)
    result = await db.execute(stmt)
    workload = result.scalar_one_or_none()
    if not workload:
        raise EntityNotFoundError("Workload", workload_id)
    verify_tenant_access(workload.organization_id, auth)

    rev_response = None
    if workload.current_revision_id:
        rev_stmt = select(WorkloadRevisionModel).where(WorkloadRevisionModel.id == workload.current_revision_id)
        rev_res = await db.execute(rev_stmt)
        revision = rev_res.scalar_one_or_none()
        if revision:
            rev_response = WorkloadRevisionResponse(
                id=revision.id,
                revision_number=revision.revision_number,
                schema_version=revision.schema_version,
                manifest_digest=revision.manifest_digest,
                fingerprint=revision.fingerprint_json,
                manifest=revision.manifest_json
            )

    return WorkloadResponse(
        id=workload.id,
        organization_id=workload.organization_id,
        project_id=workload.project_id,
        name=workload.name,
        workload_type=workload.workload_type,
        status=workload.status,
        current_revision=rev_response
    )

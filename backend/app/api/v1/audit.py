from typing import Annotated, Any
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.adapters.persistence.database import get_db
from app.adapters.persistence.models import AuditEventModel
from app.core.security import AuthContext
from app.api.deps import get_current_auth

router = APIRouter(prefix="/v1/audit-events", tags=["Audit & Security"])


class AuditEventResponse(BaseModel):
    id: str
    organization_id: str
    actor_id: str
    action: str
    resource_type: str
    resource_id: str
    result: str
    request_id: str
    metadata: dict[str, Any]
    created_at: datetime


@router.get("", response_model=list[AuditEventResponse])
async def list_audit_events(
    auth: Annotated[AuthContext, Depends(get_current_auth)],
    action: str | None = Query(None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(AuditEventModel)
        .where(AuditEventModel.organization_id == auth.organization_id)
        .order_by(AuditEventModel.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    if action:
        stmt = stmt.where(AuditEventModel.action == action)

    result = await db.execute(stmt)
    events = result.scalars().all()
    return [
        AuditEventResponse(
            id=e.id,
            organization_id=e.organization_id,
            actor_id=e.actor_id,
            action=e.action,
            resource_type=e.resource_type,
            resource_id=e.resource_id,
            result=e.result,
            request_id=e.request_id,
            metadata=e.safe_metadata_json,
            created_at=e.created_at
        )
        for e in events
    ]

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.adapters.persistence.database import get_db

router = APIRouter(tags=["Health"])


@router.get("/health/live", status_code=status.HTTP_200_OK)
async def liveness():
    """Liveness probe: verifies process is running."""
    return {"status": "alive", "service": "kynetic-backend"}


@router.get("/health/ready", status_code=status.HTTP_200_OK)
async def readiness(db: AsyncSession = Depends(get_db)):
    """Readiness probe: verifies database connectivity and core subsystems."""
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        return {"status": "not_ready", "database": f"error: {str(e)}"}

import time
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status, Response
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.adapters.persistence.database import get_db
from app.core.config import settings
from app.core.cache import cache_service

router = APIRouter(tags=["Health"])

START_TIME = time.time()


@router.get("/health/live", status_code=status.HTTP_200_OK)
async def liveness():
    """
    Liveness probe: verifies process is alive and responsive.
    Always returns 200 OK while the event loop is functioning.
    """
    uptime_seconds = int(time.time() - START_TIME)
    return {
        "status": "alive",
        "service": "kynetic-backend",
        "instance_id": settings.INSTANCE_ID,
        "uptime_seconds": uptime_seconds,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("/health/ready")
async def readiness(response: Response, db: AsyncSession = Depends(get_db)):
    """
    Readiness probe: verifies database connectivity and core subsystems.
    Returns HTTP 200 when ready to accept traffic, or HTTP 503 if required dependencies are down.
    """
    db_healthy = False
    db_error = None
    cache_health = await cache_service.health_check()

    try:
        await db.execute(text("SELECT 1"))
        db_healthy = True
    except Exception as exc:
        db_healthy = False
        db_error = str(exc)

    if not db_healthy:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "not_ready",
                "instance_id": settings.INSTANCE_ID,
                "database": {"connected": False, "error": db_error},
                "cache": cache_health,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )

    return {
        "status": "ready",
        "instance_id": settings.INSTANCE_ID,
        "database": {"connected": True},
        "cache": cache_health,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("/health/metrics", status_code=status.HTTP_200_OK)
async def metrics():
    """
    Telemetry and observability metrics for load balancers and monitoring collectors.
    """
    uptime_seconds = int(time.time() - START_TIME)
    cache_metrics = cache_service.get_metrics()
    return {
        "instance_id": settings.INSTANCE_ID,
        "uptime_seconds": uptime_seconds,
        "environment": settings.APP_ENV,
        "cache_metrics": cache_metrics,
        "pool_config": {
            "pool_size": settings.DB_POOL_SIZE,
            "max_overflow": settings.DB_MAX_OVERFLOW,
            "pool_timeout": settings.DB_POOL_TIMEOUT,
            "pool_recycle": settings.DB_POOL_RECYCLE,
        },
        "rate_limiting": {
            "enabled": settings.RATE_LIMIT_ENABLED,
            "limit_per_minute": settings.RATE_LIMIT_REQUESTS_PER_MINUTE,
            "burst": settings.RATE_LIMIT_BURST,
        }
    }

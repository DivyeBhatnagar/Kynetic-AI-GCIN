import uuid
import time
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.errors import KyneticError, kynetic_error_handler
from app.api.v1.router import api_v1_router
from app.api.v1.health import router as root_health_router

# Initialize structured logging
setup_logging(log_level=settings.LOG_LEVEL)

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Intelligent Compute Scheduling, Workload Orchestration & Multi-Provider Engine",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def correlation_id_and_timing_middleware(request: Request, call_next):
    """Assigns or preserves X-Request-ID and tracks latency."""
    request_id = request.headers.get("X-Request-ID") or f"req_{uuid.uuid4().hex[:16]}"
    request.state.request_id = request_id

    start_time = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start_time) * 1000

    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time-Ms"] = f"{duration_ms:.2f}"
    return response


# Register custom exception handlers for stable error envelope
app.add_exception_handler(KyneticError, kynetic_error_handler)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    request_id = getattr(request.state, "request_id", "unknown-request-id")
    errors = []
    for err in exc.errors():
        field = ".".join(str(loc) for loc in err["loc"])
        errors.append({"field": field, "message": err["msg"], "type": err["type"]})

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Input validation failed. Check request payload fields.",
                "request_id": request_id,
                "details": {"validation_errors": errors}
            }
        }
    )


# Mount health routes at top level and API routes under version prefix
app.include_router(root_health_router)
app.include_router(api_v1_router)

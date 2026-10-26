from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.api_keys import router as api_keys_router
from app.api.v1.organizations import router as orgs_router
from app.api.v1.projects import router as projects_router
from app.api.v1.providers import router as providers_router
from app.api.v1.workloads import router as workloads_router
from app.api.v1.planning import router as planning_router
from app.api.v1.runs import router as runs_router
from app.api.v1.ledger import router as ledger_router
from app.api.v1.audit import router as audit_router
from app.api.v1.benchmarks import router as benchmarks_router
from app.api.v1.predictions import router as predictions_router
from app.api.v1.checkpoints import router as checkpoints_router
from app.api.v1.arbitrage import router as arbitrage_router

api_v1_router = APIRouter()

# Health endpoints mounted at root and v1
api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(api_keys_router)
api_v1_router.include_router(orgs_router)
api_v1_router.include_router(projects_router)
api_v1_router.include_router(providers_router)
api_v1_router.include_router(workloads_router)
api_v1_router.include_router(planning_router)
api_v1_router.include_router(runs_router)
api_v1_router.include_router(ledger_router)
api_v1_router.include_router(audit_router)
api_v1_router.include_router(benchmarks_router)
api_v1_router.include_router(predictions_router)
api_v1_router.include_router(checkpoints_router)
api_v1_router.include_router(arbitrage_router)

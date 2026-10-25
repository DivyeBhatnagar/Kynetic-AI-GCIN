import pytest
from sqlalchemy import text
from app.adapters.persistence.models import (
    ComputeOfferModel,
    PriceObservationModel,
    WorkloadModel,
    PlanModel,
    PlanCandidateModel,
    BudgetReservationModel,
    RunModel,
    RunStateEventModel,
    CostLedgerEntryModel,
    AuditEventModel,
    PredictionModel,
    CheckpointModel,
    ArbitrageOpportunityModel
)


def get_table_indexes(model) -> dict[str, list[str]]:
    """Extracts index names and their indexed columns from a model."""
    result = {}
    for idx in model.__table__.indexes:
        result[idx.name] = [col.name for col in idx.columns]
    return result


def test_compute_offers_composite_indexes():
    indexes = get_table_indexes(ComputeOfferModel)
    assert "ix_compute_offers_provider_region" in indexes
    assert indexes["ix_compute_offers_provider_region"] == ["provider_id", "region_id"]
    assert "ix_compute_offers_gpu_vram" in indexes
    assert indexes["ix_compute_offers_gpu_vram"] == ["gpu_model", "gpu_memory_gb"]


def test_workload_and_run_composite_indexes():
    workload_indexes = get_table_indexes(WorkloadModel)
    assert "ix_workloads_org_proj_created" in workload_indexes
    assert workload_indexes["ix_workloads_org_proj_created"] == ["organization_id", "project_id", "created_at"]
    assert "ix_workloads_org_status" in workload_indexes

    run_indexes = get_table_indexes(RunModel)
    assert "ix_runs_org_status_created" in run_indexes
    assert run_indexes["ix_runs_org_status_created"] == ["organization_id", "status", "created_at"]
    assert "ix_runs_proj_created" in run_indexes
    assert run_indexes["ix_runs_proj_created"] == ["project_id", "created_at"]


def test_financial_and_audit_composite_indexes():
    ledger_indexes = get_table_indexes(CostLedgerEntryModel)
    assert "ix_ledger_org_run_effective" in ledger_indexes
    assert ledger_indexes["ix_ledger_org_run_effective"] == ["organization_id", "run_id", "effective_at"]

    audit_indexes = get_table_indexes(AuditEventModel)
    assert "ix_audit_org_action_created" in audit_indexes
    assert audit_indexes["ix_audit_org_action_created"] == ["organization_id", "action", "created_at"]


def test_checkpoint_and_arbitrage_composite_indexes():
    cp_indexes = get_table_indexes(CheckpointModel)
    assert "ix_checkpoints_run_verified_step" in cp_indexes
    assert cp_indexes["ix_checkpoints_run_verified_step"] == ["run_id", "is_verified", "step_number"]

    arb_indexes = get_table_indexes(ArbitrageOpportunityModel)
    assert "ix_arbitrage_org_status_created" in arb_indexes
    assert arb_indexes["ix_arbitrage_org_status_created"] == ["organization_id", "status", "created_at"]


@pytest.mark.asyncio
async def test_explain_query_plan_execution(db_session):
    """
    Verifies that the database engine can execute EXPLAIN on representative queries.
    Validates query planner functionality.
    """
    # SQLite EXPLAIN QUERY PLAN
    query = text(
        "EXPLAIN QUERY PLAN "
        "SELECT id, name, status FROM workloads "
        "WHERE organization_id = 'org-1' AND project_id = 'proj-1' "
        "ORDER BY created_at DESC"
    )
    result = await db_session.execute(query)
    rows = result.fetchall()
    assert len(rows) > 0

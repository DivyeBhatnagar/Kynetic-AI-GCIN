import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any
from sqlalchemy import (
    String,
    Text,
    Integer,
    Numeric,
    Boolean,
    DateTime,
    JSON,
    ForeignKey,
    Index,
    UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.adapters.persistence.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class OrganizationModel(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE", nullable=False)
    default_currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    memberships = relationship("MembershipModel", back_populates="organization", cascade="all, delete-orphan")
    projects = relationship("ProjectModel", back_populates="organization", cascade="all, delete-orphan")


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    memberships = relationship("MembershipModel", back_populates="user", cascade="all, delete-orphan")


class MembershipModel(Base):
    __tablename__ = "memberships"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(30), default="DEVELOPER", nullable=False)  # OWNER, ADMIN, DEVELOPER, VIEWER
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    organization = relationship("OrganizationModel", back_populates="memberships")
    user = relationship("UserModel", back_populates="memberships")

    __table_args__ = (
        UniqueConstraint("organization_id", "user_id", name="uq_membership_org_user"),
    )


class ProjectModel(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    organization = relationship("OrganizationModel", back_populates="projects")
    policy = relationship("ProjectPolicyModel", back_populates="project", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("organization_id", "slug", name="uq_project_org_slug"),
        Index("ix_projects_org_created", "organization_id", "created_at"),
    )


class ProjectPolicyModel(Base):
    __tablename__ = "project_policies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), unique=True, nullable=False)
    max_job_cost: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    require_approval_above: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    allowed_providers: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    allowed_regions: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    auto_action_mode: Mapped[str] = mapped_column(String(30), default="RECOMMEND_ONLY", nullable=False)
    cooldown_seconds: Mapped[int] = mapped_column(Integer, default=300, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    project = relationship("ProjectModel", back_populates="policy")


class ProviderModel(Base):
    __tablename__ = "provider_catalog"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    key: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE", nullable=False)
    adapter_version: Mapped[str] = mapped_column(String(30), default="1.0.0", nullable=False)
    capabilities_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class RegionModel(Base):
    __tablename__ = "regions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    provider_id: Mapped[str] = mapped_column(String(36), ForeignKey("provider_catalog.id", ondelete="CASCADE"), nullable=False, index=True)
    region_key: Mapped[str] = mapped_column(String(50), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    country_code: Mapped[str] = mapped_column(String(2), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE", nullable=False)

    __table_args__ = (
        UniqueConstraint("provider_id", "region_key", name="uq_provider_region"),
    )


class ComputeOfferModel(Base):
    __tablename__ = "compute_offers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    provider_id: Mapped[str] = mapped_column(String(36), ForeignKey("provider_catalog.id", ondelete="CASCADE"), nullable=False, index=True)
    region_id: Mapped[str] = mapped_column(String(36), ForeignKey("regions.id", ondelete="CASCADE"), nullable=False, index=True)
    external_offer_key: Mapped[str] = mapped_column(String(100), nullable=False)
    gpu_model: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    gpu_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    gpu_memory_gb: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    cpu_cores: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    ram_gb: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    storage_gb: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    capabilities_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    availability_status: Mapped[str] = mapped_column(String(30), default="AVAILABLE", nullable=False)
    source_type: Mapped[str] = mapped_column(String(30), default="SIMULATED", nullable=False)  # SIMULATED, VERIFIED_LIVE
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        UniqueConstraint("provider_id", "region_id", "external_offer_key", name="uq_offer_provider_region_key"),
    )


class PriceObservationModel(Base):
    __tablename__ = "price_observations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    compute_offer_id: Mapped[str] = mapped_column(String(36), ForeignKey("compute_offers.id", ondelete="CASCADE"), nullable=False, index=True)
    price_type: Mapped[str] = mapped_column(String(30), default="ON_DEMAND", nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    billing_unit: Mapped[str] = mapped_column(String(30), default="HOUR", nullable=False)
    source_reference: Mapped[str] = mapped_column(String(255), default="fixture_seed", nullable=False)
    freshness_status: Mapped[str] = mapped_column(String(30), default="FRESH", nullable=False)  # FRESH, STALE, UNKNOWN
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)


class ProviderConnectionModel(Base):
    __tablename__ = "provider_connections"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    provider_id: Mapped[str] = mapped_column(String(36), ForeignKey("provider_catalog.id", ondelete="CASCADE"), nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    secret_reference: Mapped[str] = mapped_column(String(255), nullable=False)  # Opaque reference, NEVER plaintext secret
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class WorkloadModel(Base):
    __tablename__ = "workloads"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    workload_type: Mapped[str] = mapped_column(String(50), default="batch_inference", nullable=False)
    current_revision_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE", nullable=False)
    created_by: Mapped[str] = mapped_column(String(36), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    revisions = relationship("WorkloadRevisionModel", back_populates="workload", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_workloads_org_created", "organization_id", "created_at"),
    )


class WorkloadRevisionModel(Base):
    __tablename__ = "workload_revisions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    workload_id: Mapped[str] = mapped_column(String(36), ForeignKey("workloads.id", ondelete="CASCADE"), nullable=False, index=True)
    revision_number: Mapped[int] = mapped_column(Integer, nullable=False)
    schema_version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
    manifest_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    manifest_digest: Mapped[str] = mapped_column(String(71), nullable=False, index=True)  # sha256:...
    fingerprint_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    created_by: Mapped[str] = mapped_column(String(36), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    workload = relationship("WorkloadModel", back_populates="revisions")

    __table_args__ = (
        UniqueConstraint("workload_id", "revision_number", name="uq_workload_revision"),
    )


class PlanModel(Base):
    __tablename__ = "plans"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    workload_revision_id: Mapped[str] = mapped_column(String(36), ForeignKey("workload_revisions.id", ondelete="CASCADE"), nullable=False, index=True)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="READY", nullable=False)  # READY, AWAITING_APPROVAL, APPROVED, EXPIRED
    selected_candidate_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    estimated_total_cost: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    assumptions_json: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    warnings_json: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_by: Mapped[str] = mapped_column(String(36), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    candidates = relationship("PlanCandidateModel", back_populates="plan", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_plans_org_created", "organization_id", "created_at"),
    )


class PlanCandidateModel(Base):
    __tablename__ = "plan_candidates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    plan_id: Mapped[str] = mapped_column(String(36), ForeignKey("plans.id", ondelete="CASCADE"), nullable=False, index=True)
    compute_offer_id: Mapped[str] = mapped_column(String(36), ForeignKey("compute_offers.id"), nullable=False, index=True)
    eligibility_status: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    rejection_reasons_json: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    rank: Mapped[int | None] = mapped_column(Integer, nullable=True)
    estimated_cost: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    estimated_duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    breakdown_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, default="", nullable=False)

    plan = relationship("PlanModel", back_populates="candidates")


class BudgetReservationModel(Base):
    __tablename__ = "budget_reservations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    run_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    reserved_amount: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    settled_amount: Mapped[Decimal] = mapped_column(Numeric(14, 4), default=Decimal("0.0000"), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE", nullable=False)  # ACTIVE, SETTLED, RELEASED
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class RunModel(Base):
    __tablename__ = "runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    workload_revision_id: Mapped[str] = mapped_column(String(36), ForeignKey("workload_revisions.id"), nullable=False, index=True)
    plan_id: Mapped[str] = mapped_column(String(36), ForeignKey("plans.id"), nullable=False, index=True)
    compute_offer_id: Mapped[str] = mapped_column(String(36), ForeignKey("compute_offers.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="PROVISIONING", nullable=False, index=True)
    idempotency_key: Mapped[str] = mapped_column(String(128), nullable=False)
    provider_resource_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    exit_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    error_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str] = mapped_column(String(36), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    state_events = relationship("RunStateEventModel", back_populates="run", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("organization_id", "idempotency_key", name="uq_run_org_idempotency"),
        Index("ix_runs_org_created", "organization_id", "created_at"),
    )


class RunStateEventModel(Base):
    __tablename__ = "run_state_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    run_id: Mapped[str] = mapped_column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    from_state: Mapped[str] = mapped_column(String(30), nullable=False)
    to_state: Mapped[str] = mapped_column(String(30), nullable=False)
    reason_code: Mapped[str] = mapped_column(String(50), default="LIFECYCLE_PROGRESSION", nullable=False)
    actor_id: Mapped[str] = mapped_column(String(36), nullable=False)
    correlation_id: Mapped[str] = mapped_column(String(64), nullable=False)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    run = relationship("RunModel", back_populates="state_events")


class UsageObservationModel(Base):
    __tablename__ = "usage_observations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    run_id: Mapped[str] = mapped_column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    provider_id: Mapped[str] = mapped_column(String(36), ForeignKey("provider_catalog.id"), nullable=False)
    metric_name: Mapped[str] = mapped_column(String(50), nullable=False)
    value_numeric: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    unit: Mapped[str] = mapped_column(String(30), nullable=False)
    period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class CostLedgerEntryModel(Base):
    __tablename__ = "cost_ledger_entries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    run_id: Mapped[str] = mapped_column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    entry_type: Mapped[str] = mapped_column(String(30), nullable=False)  # ESTIMATE, ACCRUED_USAGE, RECONCILED_INVOICE, ADJUSTMENT
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    effective_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        Index("ix_ledger_org_effective", "organization_id", "effective_at"),
    )


class AuditEventModel(Base):
    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_id: Mapped[str] = mapped_column(String(36), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False)
    resource_id: Mapped[str] = mapped_column(String(36), nullable=False)
    result: Mapped[str] = mapped_column(String(30), default="SUCCESS", nullable=False)
    request_id: Mapped[str] = mapped_column(String(64), nullable=False)
    safe_metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    __table_args__ = (
        Index("ix_audit_org_created", "organization_id", "created_at"),
    )


class BenchmarkRunModel(Base):
    __tablename__ = "benchmark_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    benchmark_suite_version: Mapped[str] = mapped_column(String(50), nullable=False)
    workload_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    hardware_model: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    hardware_gpu_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    hardware_vram_gb: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    workload_fingerprint_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    measurements_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    provenance_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    validity_status: Mapped[str] = mapped_column(String(30), default="VALID", nullable=False)
    sample_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        Index("ix_benchmarks_type_hw", "workload_type", "hardware_model"),
    )


class PredictionModel(Base):
    __tablename__ = "predictions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    workload_revision_id: Mapped[str] = mapped_column(String(36), ForeignKey("workload_revisions.id", ondelete="CASCADE"), nullable=False, index=True)
    compute_offer_id: Mapped[str] = mapped_column(String(36), ForeignKey("compute_offers.id"), nullable=False, index=True)
    model_name: Mapped[str] = mapped_column(String(50), default="kynetic-dt-v1", nullable=False)
    model_version: Mapped[str] = mapped_column(String(20), default="1.0.0", nullable=False)
    predicted_runtime_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    runtime_interval_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)  # {"low": int, "base": int, "high": int}
    predicted_cost: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    cost_interval_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)  # {"low": str, "base": str, "high": str}
    confidence_score: Mapped[Decimal] = mapped_column(Numeric(4, 3), nullable=False)  # 0.000 to 1.000
    sample_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_out_of_distribution: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    assumptions_json: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        Index("ix_predictions_org_created", "organization_id", "created_at"),
    )


class PredictionOutcomeModel(Base):
    __tablename__ = "prediction_outcomes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    prediction_id: Mapped[str] = mapped_column(String(36), ForeignKey("predictions.id", ondelete="CASCADE"), nullable=False, index=True)
    run_id: Mapped[str] = mapped_column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    actual_runtime_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    actual_cost: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    actual_throughput: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    runtime_error_percent: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    cost_error_percent: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    within_confidence_interval: Mapped[bool] = mapped_column(Boolean, nullable=False)
    measured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


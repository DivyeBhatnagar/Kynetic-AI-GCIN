# Kynetic AI --- Technical Requirements Document (TRD)

**Version:** 1.0\
**Status:** Technical baseline for staged implementation\
**Audience:** IDE coding agents, backend/frontend engineers, platform
engineers, QA and security reviewers\
**Purpose:** Specify the technical architecture, interfaces, data model,
safety controls, tests and release gates for Kynetic AI.

> **Implementation rule:** This TRD describes the intended system. It
> does not assert that integrations or features already exist. The IDE
> must inspect the repository first, preserve working code, document
> gaps, and implement only the approved phase. Provider-specific
> behavior must be verified against current provider APIs and terms
> before implementation.

------------------------------------------------------------------------

# 1. System Summary

Kynetic AI is a software-first, multi-provider compute intelligence and
workload orchestration platform. It helps users describe workloads and
constraints, estimate cost-to-completion, compare compatible compute
options, execute approved jobs, track actual costs, and eventually
support safe checkpoint-aware recovery and provider replanning.

The system is built in stages:

1.  **MVP:** workload registry, provider/candidate abstractions,
    transparent cost estimation, hard-constraint filtering, dry-run
    plans, basic execution records and usage/cost reporting.
2.  **Digital Twin:** benchmark registry, runtime/cost prediction and
    uncertainty reporting.
3.  **Checkpoint/resume:** adapters for selected workloads with
    integrity, compatibility, security and recovery validation.
4.  **Predictive Compute Arbitrage:** policy-aware recommendations and
    approval-gated replanning.
5.  **Expansion:** additional providers, workload families and
    enterprise controls.

Do not implement a general-purpose cloud or claim seamless migration of
arbitrary running workloads.

## 1.1 Normative terms

-   **MUST / MUST NOT:** required for correctness or safety.
-   **SHOULD / SHOULD NOT:** recommended unless a documented reason
    justifies an exception.
-   **MAY:** optional.
-   A **hard constraint** cannot be traded off against a cheaper score.
-   A **plan preview** must not incur provider charges or perform
    destructive actions.
-   **Estimated savings** are forecasts. **Verified savings** require
    actual usage/cost evidence and an agreed baseline.

------------------------------------------------------------------------

# 2. Architecture Principles

1.  Begin with a modular monolith and clear domain boundaries.
2.  Keep provider-specific logic behind capability-aware adapter
    interfaces.
3.  Separate planning from execution. Planning should be
    side-effect-free.
4.  Require explicit authorization for billable, destructive or
    data-moving actions.
5.  Filter hard constraints before candidate ranking.
6.  Estimate total cost-to-completion, not hourly price alone.
7.  Treat predictions as uncertain and timestamp all dynamic provider
    data.
8.  Use durable job state, idempotency keys, bounded retries and audit
    events.
9.  Avoid storing secrets in workload manifests, logs, client-side code
    or ordinary telemetry.
10. Make all automated actions observable and explainable.
11. Start with one workload class and a small number of provider
    adapters.
12. Do not split into microservices until scale, team boundaries or
    reliability needs justify the operational cost.

------------------------------------------------------------------------

# 3. Recommended Technology Baseline

The IDE must inspect the current repository before selecting or changing
frameworks. If the project is new, the following is the default
proposal.

  -----------------------------------------------------------------------
  Layer                   Proposed technology     Notes
  ----------------------- ----------------------- -----------------------
  Web frontend            Next.js, React,         Reuse existing frontend
                          TypeScript              if sound

  UI styling              Tailwind CSS            Keep components
                                                  accessible and
                                                  consistent

  API backend             Python, FastAPI,        Typed validation and
                          Pydantic                OpenAPI

  Primary database        PostgreSQL              Durable relational
                                                  records

  Cache/coordination      Redis                   Optional initially; do
                                                  not use as the only
                                                  durable store

  Background jobs         Celery or equivalent    Use only for actual
                                                  asynchronous workloads

  Workload packaging      OCI/Docker containers   Immutable image digest
                                                  preferred

  Authentication          Managed auth or         Enforce organization
                          maintained identity     and tenant isolation
                          library                 

  Secrets                 Dedicated secret        Never commit real
                          manager / secure        credentials
                          injection               

  Observability           Structured logs,        Redact secrets and
                          metrics, traces and     customer payloads
                          error reporting         

  Testing                 Pytest; frontend test   Unit, integration,
                          framework appropriate   contract and E2E tests
                          to repo                 

  Migrations              Alembic or existing     Never rely on implicit
                          migration system        schema mutation

  Deployment              Low-cost managed        Workload compute runs
                          control-plane hosting   on selected providers
                          initially               
  -----------------------------------------------------------------------

Do not introduce Redis, Celery, Kubernetes, a service mesh or other
infrastructure unless an actual MVP requirement needs it.

------------------------------------------------------------------------

# 4. Logical Architecture

``` text
Browser / CLI
     |
     v
Frontend + API Gateway / FastAPI
     |
     +--> Authentication / Organization / RBAC
     |
     +--> Workload Registry & Manifest Validator
     |
     +--> Policy Engine
     |
     +--> Cost Planner / Candidate Ranker
     |        |
     |        +--> Provider Adapter Interface
     |        +--> Pricing & Capability Records
     |        +--> Digital Twin (Phase 2)
     |
     +--> Plan Store / Approval Workflow
     |
     +--> Execution Orchestrator (later MVP scope)
     |        |
     |        +--> Provider Adapters
     |        +--> Job State Machine
     |        +--> Usage / Cost Ledger
     |        +--> Checkpoint Manager (later phase)
     |
     +--> Audit Event Store
     |
     +--> Background Workers (only for asynchronous tasks)
                |
                +--> Price refresh / provider polling
                +--> Execution events / reconciliation
                +--> Benchmarks / predictions
```

## 4.1 Component boundaries

### API layer

-   Authentication and request context.
-   Schema validation.
-   Authorization checks.
-   Request idempotency for state-changing operations.
-   Stable error responses.
-   Correlation/request IDs.

### Workload registry

-   Create and version workload manifests.
-   Validate resource requirements and execution constraints.
-   Store secret references, not secret values.
-   Record workload class and adapter capabilities.

### Provider adapter registry

-   Expose provider capabilities and normalized offers.
-   Track which operations are implemented and tested for each provider.
-   Never assume that pricing, availability, interruption notices or
    lifecycle semantics are identical.

### Planner

-   Filter incompatible candidates.
-   Enforce hard constraints.
-   Estimate total cost and runtime where data exists.
-   Return a side-effect-free, explainable plan.

### Execution orchestrator

-   Execute only an approved plan.
-   Track durable state transitions.
-   Provision, monitor, cancel, clean up and reconcile resources.
-   Use idempotency keys and bounded retries.

### Cost ledger

-   Keep estimates separate from actual charges.
-   Track cost source, timestamps, currency, units and confidence.
-   Reconcile internal estimates against provider billing data where
    available.

### Digital Twin

-   Benchmark data, prediction model versions, estimates, uncertainty,
    actual results and drift metrics.
-   Must not independently bypass policy checks.

### Checkpoint manager

-   Coordinate workload-specific adapters and checkpoint metadata.
-   Validate integrity, compatibility, encryption, access and retention.
-   Never imply generic GPU-memory migration.

------------------------------------------------------------------------

# 5. Environments and Configuration

Use separate development, test/staging and production environments where
practical.

## 5.1 Configuration requirements

-   All environment-specific settings must be externalized.
-   Include `.env.example` with placeholder values only.
-   Validate required settings at startup.
-   Never print secret values during startup or errors.
-   Do not place provider credentials in frontend variables or public
    client bundles.
-   Use separate credentials and accounts for test and production.
-   Use least-privilege scopes.
-   Support a local mock provider adapter for development.

Example placeholder configuration (adapt names to the actual codebase):

``` dotenv
APP_ENV=development
APP_NAME=Kynetic AI
API_BASE_URL=http://localhost:8000
DATABASE_URL=postgresql://user:password@localhost:5432/kynetic_dev
REDIS_URL=redis://localhost:6379/0
AUTH_SECRET=replace_with_local_secret
LOG_LEVEL=INFO
PROVIDER_MODE=mock
ENABLE_BILLABLE_EXECUTION=false
```

These values are illustrative. The implementation must use secure
configuration conventions for the selected libraries and hosting
environment.

## 5.2 Feature flags

Use feature flags or server-side configuration for: - Real provider
provisioning. - Billable execution. - Automated actions. -
Cross-provider replanning. - Checkpoint/resume adapters. - Experimental
prediction models.

Default billable execution and autonomous actions to disabled until the
corresponding release gate passes.

------------------------------------------------------------------------

# 6. Domain Model and Database Requirements

Use relational constraints and migrations. The exact schema may adapt to
the repository, but the following entities and relationships must be
represented as features are implemented.

## 6.1 Core entities

### Organization / Tenant

-   `id` (UUID)
-   `name`
-   `status`
-   `created_at`, `updated_at`

### User

-   `id`
-   `organization_id`
-   `email` or identity-provider subject
-   `role`
-   `status`
-   `created_at`, `updated_at`

### Provider

-   `id`
-   `slug`
-   `display_name`
-   `status`
-   `supported_capabilities` or normalized capability records

### ProviderAccount

-   `id`
-   `organization_id`
-   `provider_id`
-   `credential_reference` (secret-manager reference only)
-   `status`
-   `created_at`, `updated_at`

### ComputeOffer

-   `id`
-   `provider_id`
-   `provider_offer_id`
-   `region`
-   `accelerator_model`
-   `accelerator_count`
-   `vram_mb`
-   `cpu_count`
-   `ram_mb`
-   `storage_profile`
-   `price_amount`
-   `price_currency`
-   `billing_unit`
-   `price_observed_at`
-   `availability_status` and `availability_observed_at` when available
-   `capabilities_json`
-   `source_type` (live, imported, fixture)
-   `created_at`, `updated_at`

### Workload

-   `id`
-   `organization_id`
-   `name`
-   `description`
-   `workload_class`
-   `status`
-   `created_at`, `updated_at`

### WorkloadVersion / WorkloadManifest

-   `id`
-   `workload_id`
-   `version`
-   `container_image`
-   `container_digest`
-   `entrypoint`
-   `arguments` (avoid secrets)
-   `framework`
-   `framework_version`
-   `resource_requirements_json`
-   `input_data_references`
-   `constraints_json`
-   `checkpoint_capabilities_json`
-   `created_at`

### ExecutionPlan

-   `id`
-   `organization_id`
-   `workload_id`
-   `workload_version_id`
-   `status`
-   `objective`
-   `hard_constraints_json`
-   `selected_candidate_id` (nullable until selected)
-   `estimated_total_cost`
-   `currency`
-   `estimated_duration_seconds`
-   `uncertainty_json`
-   `explanation_json`
-   `created_by`
-   `created_at`, `expires_at`

### PlanCandidate

-   `id`
-   `execution_plan_id`
-   `provider_id`
-   `compute_offer_id`
-   `eligible`
-   `ineligibility_reasons_json`
-   `estimated_cost`
-   `estimated_duration_seconds`
-   `cost_components_json`
-   `confidence_json`
-   `rank`
-   `created_at`

### Approval

-   `id`
-   `organization_id`
-   `execution_plan_id`
-   `requested_by`
-   `approved_by`
-   `status`
-   `approved_action_scope_json`
-   `created_at`, `expires_at`, `decided_at`

### WorkloadRun

-   `id`
-   `organization_id`
-   `workload_id`
-   `execution_plan_id`
-   `status`
-   `provider_id`
-   `provider_resource_id`
-   `idempotency_key`
-   `started_at`, `finished_at`
-   `exit_code`
-   `error_code`
-   `error_summary` (redacted)
-   `created_at`, `updated_at`

### UsageRecord

-   `id`
-   `organization_id`
-   `workload_run_id`
-   `provider_id`
-   `resource_type`
-   `quantity`
-   `unit`
-   `amount`
-   `currency`
-   `source` (estimated, provider_metering, invoice_reconciled)
-   `observed_at`
-   `source_reference`

### CostEstimate

-   `id`
-   `workload_run_id` or `execution_plan_id`
-   `estimate_type`
-   `total_amount`
-   `currency`
-   `components_json`
-   `assumptions_json`
-   `price_snapshot_at`
-   `model_version`
-   `confidence_json`
-   `created_at`

### SavingsRecord

-   `id`
-   `organization_id`
-   `workload_run_id`
-   `baseline_definition_json`
-   `baseline_cost`
-   `actual_cost`
-   `verified_savings`
-   `currency`
-   `verification_status`
-   `verified_at`

### BenchmarkRun / PerformanceObservation (Phase 2)

-   Workload fingerprint and version.
-   Hardware/provider/software environment.
-   Benchmark methodology and repetitions.
-   Runtime, throughput, memory and utilization measurements.
-   Estimated versus actual values.
-   Sample quality and timestamps.

### Checkpoint (later phase)

-   `id`
-   `workload_run_id`
-   `adapter_name`
-   `adapter_version`
-   `manifest_version`
-   `storage_reference` (not a public unauthenticated URL)
-   `checksum`
-   `size_bytes`
-   `source_environment_json`
-   `state_version`
-   `status`
-   `created_at`, `validated_at`, `expires_at`, `deleted_at`

### Policy

-   `id`
-   `organization_id`
-   `name`
-   `budget_limit`
-   `currency`
-   `provider_allowlist`
-   `region_allowlist`
-   `data_movement_rules_json`
-   `minimum_savings_threshold`
-   `approval_mode`
-   `max_retries`
-   `cooldown_seconds`
-   `created_at`, `updated_at`

### AuditEvent

-   `id`
-   `organization_id`
-   `actor_id` (nullable for system actor)
-   `action`
-   `resource_type`
-   `resource_id`
-   `request_id`
-   `idempotency_key`
-   `outcome`
-   `metadata_redacted_json`
-   `created_at`

## 6.2 Data integrity

-   Use UUIDs or an equivalent non-guessable identifier for externally
    exposed resources.
-   Add foreign keys, indexes and unique constraints where appropriate.
-   Scope every tenant-owned query by organization/tenant.
-   Use database transactions for multi-record state changes.
-   Use migrations for schema changes.
-   Store money as fixed-precision decimals or integer minor units,
    never binary floating point.
-   Store durations as integer units with explicit units.
-   Store timestamps in UTC; preserve provider-local timezone only as
    metadata when needed.
-   Version workload manifests, policies, prediction models and
    checkpoint formats.
-   Never store raw secrets in JSON columns.

------------------------------------------------------------------------

# 7. Workload Manifest Contract

A manifest should be validated by a typed schema (e.g. Pydantic). The
following is illustrative, not a final schema:

``` yaml
apiVersion: kynetic.ai/v1
kind: Workload
metadata:
  name: example-batch-job
spec:
  workloadClass: batch-inference
  image: registry.example.com/team/job@sha256:REPLACE_WITH_DIGEST
  command: ["python", "run.py"]
  resources:
    accelerator:
      count: 1
      minVramGiB: 24
      preferredModels: []
    cpuCores: 8
    ramGiB: 32
    storageGiB: 100
  execution:
    maxBudget:
      amount: "80.00"
      currency: USD
    deadline: "2026-12-01T18:00:00Z"
    interruptionTolerance: checkpointable
    checkpointAdapter: null
  constraints:
    allowedProviders: []
    allowedRegions: ["eu-west"]
    dataResidency: ["EU"]
    allowDataEgress: false
  optimization:
    objective: lowest-cost-within-deadline
    minSavingsPercentToReplan: 15
    approvalMode: required
```

Requirements: - Validate enum values and units. - Reject invalid or
contradictory constraints. - Treat secrets as references to secret
storage, not inline values. - Validate image digest and command
structure where applicable. - Normalize timestamps and currency. -
Preserve user intent in a canonical stored form. - Return field-specific
validation errors. - Do not silently weaken a hard constraint to make a
candidate eligible.

------------------------------------------------------------------------

# 8. API Standards

Use versioned REST endpoints initially. Generate and maintain OpenAPI
from actual request/response schemas.

## 8.1 Common API requirements

-   Authentication on all private endpoints.
-   Organization-scoped authorization.
-   Typed request and response models.
-   Stable error format.
-   Pagination on collections.
-   Rate limiting where needed.
-   Correlation/request ID.
-   Idempotency keys for state-changing requests that may be retried.
-   Audit events for sensitive and billable operations.
-   No secrets in responses or logs.
-   Consistent UTC timestamps and currency units.
-   Explicit dry-run behavior.

Suggested error response:

``` json
{
  "error": {
    "code": "CONSTRAINT_UNSATISFIABLE",
    "message": "No candidate satisfies all hard constraints.",
    "request_id": "request-id",
    "details": {
      "constraints": ["allowed_region", "minimum_vram"]
    }
  }
}
```

Do not leak sensitive provider or tenant details in error messages.

## 8.2 Proposed endpoints

### Health and metadata

-   `GET /health/live`
-   `GET /health/ready`
-   `GET /v1/providers`
-   `GET /v1/compute-offers`

### Workloads

-   `POST /v1/workloads`
-   `GET /v1/workloads`
-   `GET /v1/workloads/{workload_id}`
-   `POST /v1/workloads/{workload_id}/versions`
-   `GET /v1/workloads/{workload_id}/runs`

### Planning

-   `POST /v1/workloads/{workload_id}/predict`
-   `POST /v1/workloads/{workload_id}/plans`
-   `GET /v1/plans/{plan_id}`
-   `POST /v1/plans/{plan_id}/approve`
-   `POST /v1/plans/{plan_id}/reject`

### Execution (enable only after safety gate)

-   `POST /v1/plans/{plan_id}/runs`
-   `GET /v1/runs/{run_id}`
-   `POST /v1/runs/{run_id}/cancel`
-   `GET /v1/runs/{run_id}/cost`
-   `GET /v1/runs/{run_id}/events`

### Digital Twin (Phase 2)

-   `POST /v1/benchmarks`
-   `GET /v1/workloads/{workload_id}/prediction-history`

### Checkpoint/resume (later phase)

-   `POST /v1/runs/{run_id}/checkpoints`
-   `GET /v1/checkpoints/{checkpoint_id}`
-   `POST /v1/runs/{run_id}/resume`

### Costs, savings, policy and audit

-   `GET /v1/workloads/{workload_id}/savings`
-   `GET /v1/usage`
-   `GET /v1/policies`
-   `POST /v1/policies`
-   `PATCH /v1/policies/{policy_id}`
-   `GET /v1/audit-events`

The API list may be trimmed for MVP. Do not create empty endpoints that
imply unsupported behavior.

------------------------------------------------------------------------

# 9. Cost Estimation and Candidate Selection

## 9.1 Candidate filtering order

1.  Validate offer data freshness and source.
2.  Verify workload/runtime/hardware compatibility.
3.  Enforce provider and region allowlists.
4.  Enforce data residency and egress restrictions.
5.  Enforce resource requirements and minimum VRAM.
6.  Check budget and deadline feasibility using available estimates.
7.  Apply customer-defined objective to eligible candidates.

Hard constraints must never be converted into weighted preferences.

## 9.2 Cost model

``` text
estimated_total_cost =
    compute_cost
  + storage_cost
  + data_transfer_cost
  + startup_and_queue_cost
  + checkpoint_and_restore_cost
  + expected_retry_and_failure_cost
  + other_known_provider_charges
```

For each component record: - Amount and currency. - Formula or
calculation source. - Input assumptions. - Data source and observation
timestamp. - Whether it is measured, provider-quoted, estimated or
unknown. - Confidence or uncertainty where available.

Do not show an apparently exact total if material cost components are
unknown. Show a range, explicit caveat, or mark the candidate as not
comparable.

## 9.3 Runtime model

MVP may use a manually entered estimate, benchmark lookup, or clearly
labelled heuristic. Digital Twin predictions belong to Phase 2 and must
include uncertainty.

Runtime estimates should account for workload class, hardware,
framework, data volume, startup time, transfer time and observed
throughput when data exists.

## 9.4 Replanning economics

For an in-progress workload:

``` text
expected_net_savings =
    expected_cost_to_finish_current_plan
  - expected_cost_to_finish_alternative
```

The alternative must include transfer, checkpoint, restore, startup,
retry and risk costs. Replan only if: - Target compatibility and hard
constraints pass. - Expected savings meet the configured threshold. -
Deadline/reliability risk is acceptable. - Cooldown/anti-oscillation
conditions pass. - Approval mode is satisfied. - A safe checkpoint or
task boundary exists for the workload.

MVP should implement pre-launch placement and plan preview before any
automatic in-flight replan.

------------------------------------------------------------------------

# 10. Workload Performance Digital Twin Requirements (Phase 2)

## 10.1 Prediction record

Every prediction should store: - Workload fingerprint/version. -
Candidate provider and hardware configuration. - Model name/version. -
Price and benchmark data timestamps. - Predicted runtime and cost,
including ranges. - Confidence/calibration information. - Assumptions
and known missing inputs. - Creation time and expiry/freshness status.

## 10.2 Model development

-   Begin with repeatable benchmark suites, baseline rules, lookup
    tables and simple regressors.
-   Keep training and evaluation datasets separated.
-   Avoid data leakage across repetitions or near-duplicate workload
    variants.
-   Report error by workload family and hardware class.
-   Track sample count and distribution shift.
-   Compare against simple baselines before promoting a model.
-   Use a conservative fallback for unseen workload/hardware
    combinations.
-   Only use customer telemetry for training where contracts, consent
    and privacy rules allow it.

## 10.3 Release gates

-   Prediction error measured on representative held-out workloads.
-   Confidence intervals evaluated for calibration.
-   Stale prices/benchmarks visibly flagged.
-   Low-confidence predictions cannot independently trigger high-impact
    actions.
-   Every recommendation can be traced to a model version and input
    snapshot.

------------------------------------------------------------------------

# 11. Predictive Compute Arbitrage Requirements (Phase 4)

## 11.1 Operating modes

-   Recommend-only.
-   Approval-required.
-   Policy-authorized automation.

The default must be recommend-only. Any mode change must be authorized
and audited.

## 11.2 Decision algorithm

1.  Read current run state and current policy.
2.  Refresh candidate data and confirm freshness.
3.  Filter incompatible/disallowed candidates.
4.  Estimate remaining cost and duration for the current plan and each
    alternative.
5.  Include migration overhead and uncertainty.
6.  Apply savings threshold, deadline, risk and cooldown policies.
7.  Generate a human-readable plan and explanation.
8.  Request approval if required.
9.  Revalidate plan freshness and policy before executing.
10. Execute an idempotent transition with bounded retries.
11. Verify target health/resume status before releasing source
    resources, where applicable.
12. Record actual results and reconcile savings.

## 11.3 Required protections

-   Prevent oscillation using cooldowns and material-improvement
    thresholds.
-   Expire plans when pricing/capacity assumptions are stale.
-   Never allow a plan approval to bypass changed hard constraints.
-   Enforce spending cap before provisioning and during execution.
-   Avoid double-running side-effecting jobs unless explicitly safe.
-   Preserve a recovery path before destructive source termination.
-   Log actor, policy version, estimate inputs, approval, actions and
    outcome.
-   Provide kill switch for automated actions.
-   Treat provider events as untrusted external input and validate them.

------------------------------------------------------------------------

# 12. Checkpoint and Resume Requirements (Phase 3)

## 12.1 Adapter contract

Each workload adapter should define: -
`supports_checkpoint(manifest, environment)` -
`create_checkpoint(run_context) -> checkpoint_metadata` -
`validate_checkpoint(checkpoint_metadata, target_environment)` -
`restore_checkpoint(checkpoint_metadata, target_environment)` -
`verify_resumed_state(run_context)` -
`estimate_checkpoint_overhead(run_context)` where measurable

The exact interface should follow the actual language and codebase.
Methods must return typed outcomes and safe error states.

## 12.2 Checkpoint lifecycle

`REQUESTED -> CREATING -> VALIDATING -> AVAILABLE -> RESTORING -> RESTORED`

Failure/expiry/deletion states should be explicit. A partially written
checkpoint must never be treated as `AVAILABLE`.

## 12.3 Integrity and security

-   Write checkpoint data atomically or commit through a validated
    manifest.
-   Verify checksum before restore.
-   Encrypt at rest and in transit.
-   Restrict access by tenant and workload authorization.
-   Store metadata separately from sensitive payload where practical.
-   Enforce region, retention and deletion policy.
-   Use signed or otherwise integrity-protected metadata where
    appropriate.
-   Do not expose public checkpoint URLs.
-   Do not log checkpoint payloads or credentials.

## 12.4 Compatibility

Validate framework/runtime versions, checkpoint format, model
architecture, required dependencies, target hardware capabilities and
any adapter-specific constraints. Never assume that GPU memory,
optimizer state or framework state is portable without the appropriate
mechanism.

## 12.5 Checkpoint policy

-   Configurable checkpoint interval and retention.
-   Cost-aware intervals only after measurement data is available.
-   Track time spent checkpointing, bytes written/transferred, restore
    time and lost work.
-   Test corruption, partial writes, incompatible targets, expired
    checkpoint, access denial and deletion.

------------------------------------------------------------------------

# 13. Execution State Machine and Reliability

Use a durable state machine. Exact states may differ by provider but
should normalize to a common lifecycle.

Suggested states:

``` text
DRAFT
  -> VALIDATED
  -> PLANNED
  -> AWAITING_APPROVAL
  -> APPROVED
  -> PROVISIONING
  -> STAGING_INPUTS
  -> RUNNING
  -> CHECKPOINTING (optional)
  -> SUCCEEDED | FAILED | CANCEL_REQUESTED | CANCELED
  -> RECONCILING
  -> FINALIZED
```

Rules: - State transitions must be validated and persisted
transactionally. - A retry must not create duplicate billable
resources. - Provider API timeouts must be treated as uncertain
outcomes; query provider state before retrying destructive actions. -
Cancellation is a request, not proof that the provider resource has
stopped. - Cleanup is retried safely and reported if it remains
incomplete. - Use provider resource IDs and idempotency keys to
reconcile external state. - Maintain an event history for each run. -
Never mark a run successful without a verified terminal condition.

------------------------------------------------------------------------

# 14. Security and Privacy Requirements

## 14.1 Authentication and authorization

-   Authenticate every private API request.
-   Authorize access by tenant and resource ownership.
-   Use RBAC or scoped permissions for users and service actors.
-   Require elevated permissions for provider credential changes, policy
    changes and automated execution.
-   Re-check authorization when background jobs execute actions.

## 14.2 Secrets and credentials

-   Store references to credentials, not credentials, in the database
    where possible.
-   Use provider-scoped least-privilege credentials.
-   Prefer read-only billing permissions for cost analysis.
-   Redact authorization headers, environment secrets and tokens from
    logs.
-   Rotate credentials and support revocation.
-   Never include secrets in frontend bundles.

## 14.3 Data protection

-   TLS for network traffic.
-   Encryption at rest for databases, checkpoints and sensitive
    artifacts.
-   Explicit data-region constraints.
-   Tenant isolation at API, database query, object storage and job
    execution layers.
-   Customer-defined retention/deletion where applicable.
-   Minimize collected telemetry and separate workload metadata from
    payloads.
-   Use customer telemetry for product improvement only according to
    contract and consent.

## 14.4 Auditability

Record: - Actor and tenant. - Action and target resource. - Timestamp
and request/correlation ID. - Policy version and approval where
relevant. - Outcome and redacted reason. - Plan/model version for
scheduling decisions.

Audit logs must not contain secrets or unrestricted raw workload
payloads.

------------------------------------------------------------------------

# 15. Frontend Technical Requirements

## 15.1 Core screens for MVP

1.  Sign-in / organization context.
2.  Workload list and creation.
3.  Workload manifest form or validated YAML/JSON editor.
4.  Candidate comparison and plan preview.
5.  Cost estimate breakdown and assumptions.
6.  Approval screen for actions.
7.  Run status/details.
8.  Usage/cost history.
9.  Basic settings and policy display.

## 15.2 Required UI states

Every data-dependent screen must support: - Loading. - Empty state. -
Validation errors. - API error. - Stale provider data. - No eligible
candidates. - Low-confidence estimate. - Pending approval. - In-progress
operation. - Partial provider failure. - Cancel requested versus
canceled. - Actual cost pending reconciliation.

## 15.3 UX safety

-   Clearly label fixture/mock data.
-   Show whether costs are estimated or actual.
-   Display currency and units.
-   Show data timestamp/freshness.
-   Explain why candidates were excluded.
-   Confirm billable or destructive actions.
-   Do not use ambiguous "Start" buttons for a dry run and billable
    execution interchangeably.
-   Keep dangerous actions visually distinct and require explicit
    confirmation.

------------------------------------------------------------------------

# 16. Logging, Metrics and Alerting

## 16.1 Structured logs

Include: - Timestamp. - Severity. - Environment. - Request/correlation
ID. - Tenant/resource IDs where safe. - Operation and outcome. -
Provider adapter and error code.

Exclude: - Secrets and tokens. - Raw user data. - Full environment
variables. - Sensitive checkpoint contents. - Unredacted provider
payloads unless explicitly approved for secure debugging.

## 16.2 Metrics

-   API latency and error rate.
-   Background queue depth and task failure rate.
-   Provider API error/timeout rate.
-   Plan generation latency.
-   Stale price/capacity data rate.
-   No-eligible-candidate rate.
-   Cost estimate versus actual error.
-   Run completion/failure/cancellation rates.
-   Resource cleanup failures.
-   Checkpoint and restore success (when supported).
-   Policy denial and attempted policy violation count.
-   Budget overrun count.
-   Gross margin and compute pass-through exposure.

Alert thresholds should be configured once actual service-level
objectives and traffic patterns are known.

------------------------------------------------------------------------

# 17. Testing Strategy

## 17.1 Unit tests

Required for: - Manifest validation. - Currency/decimal calculations. -
Candidate filtering. - Hard constraint enforcement. - Cost component
calculations. - Savings threshold and cooldown logic. - State-machine
transitions. - Permission checks. - Idempotency behavior. - Checkpoint
metadata validation in later phases.

## 17.2 Integration tests

-   Database migrations and repository operations.
-   API auth and tenant scoping.
-   Provider adapter contract tests.
-   Price ingestion freshness and malformed input.
-   Queue/worker retries if background jobs exist.
-   Usage reconciliation.
-   Checkpoint storage and integrity for supported adapters.

## 17.3 End-to-end tests

-   Create workload -\> validate -\> plan preview -\> view candidates.
-   No candidate satisfies constraints -\> informative error and no
    execution.
-   Approval required -\> action blocked until authorized.
-   Billable execution disabled -\> provisioning endpoint safely
    refuses.
-   Provider timeout -\> no duplicate resource creation.
-   Actual usage differs from estimate -\> both values retained and
    explained.
-   Checkpoint failure -\> no invalid checkpoint exposed as available.
-   Policy changes after plan creation -\> stale plan requires
    revalidation.

## 17.4 Test data

-   Fixtures must be clearly marked and never mixed with production
    offers.
-   Do not assert live provider prices as permanent constants.
-   Use deterministic fake provider adapters for unit/integration tests.
-   Add contract tests for real provider integrations where credentials
    and test environments are available.

------------------------------------------------------------------------

# 18. Deployment and Operations

## 18.1 Minimum deployment

-   Frontend and API deployed using the current project's supported
    platform.
-   Managed PostgreSQL or equivalent durable database.
-   Worker only if asynchronous processing is implemented.
-   Secure secret configuration.
-   Database migrations run as a controlled deployment step.
-   Health and readiness endpoints.
-   Error reporting and logs.
-   Backup and restore strategy for persistent data.

## 18.2 Deployment safety

-   No real provider provisioning in local/test environments by default.
-   Separate staging and production provider credentials.
-   Feature flags for billable execution and automated replanning.
-   Rollback strategy for application and database changes.
-   Schema migrations should be backward-compatible where practical.
-   Document operational procedures for provider credential revocation,
    budget stop, stuck jobs and cleanup failures.

------------------------------------------------------------------------

# 19. Performance and Scalability Requirements

Do not prematurely optimize for global-scale traffic. Establish
measurable targets after inspecting the current project and customer
needs.

Initial engineering expectations: - API responses for simple
database-backed reads should be responsive under normal load. -
Long-running provider calls, benchmarks and workload execution must be
asynchronous. - Pagination must be used for growing collections. -
Provider API calls should have timeouts, bounded retries and rate-limit
handling. - Cache only data with a clear freshness policy. - Plan
generation should remain deterministic for the same input snapshot and
model/policy versions, except for explicitly time-varying data. -
Database indexes should match actual query patterns. - Keep cost
calculation and policy logic independent from UI code. - Support
horizontal worker scaling only when required by workload volume.

------------------------------------------------------------------------

# 20. API and Provider Error Handling

Normalize provider errors into stable internal categories: -
Authentication/permission denied. - Offer not found or unavailable. -
Capacity unavailable. - Rate limited. - Timeout/unknown outcome. -
Invalid request. - Budget/policy denied. - Resource provisioning
failed. - Resource state unknown. - Cleanup failed. - Pricing data stale
or unavailable. - Unsupported capability.

Requirements: - Preserve a safe provider-specific diagnostic
reference. - Do not expose sensitive raw provider errors to end users. -
Retry only transient and safe-to-retry operations. - Use exponential
backoff with jitter where appropriate. - Never retry a non-idempotent
create/delete blindly after an unknown outcome. - Query provider state
before taking a potentially duplicate action.

------------------------------------------------------------------------

# 21. Phase-Specific Definition of Done

## Phase 1 --- MVP

-   Repository inspection and gap analysis completed.
-   Workload manifest schema implemented and tested.
-   Provider/offer source is real or clearly marked as fixture.
-   Candidate filtering enforces hard constraints.
-   Cost estimates show assumptions, currency, freshness and unknowns.
-   Plan preview is side-effect-free.
-   Billable execution is disabled unless explicitly enabled and gated.
-   Workload/run records and basic audit trail work.
-   Actual and estimated costs are distinct.
-   Core logic has unit tests.
-   Setup and limitations documented.

## Phase 2 --- Digital Twin

-   Benchmark metadata and provenance stored.
-   Runtime and cost predictions include uncertainty and model version.
-   Evaluation uses held-out representative workloads.
-   Stale inputs and out-of-distribution cases flagged.
-   Actual-versus-predicted dashboard/report available.

## Phase 3 --- Checkpoint/resume

-   At least one supported adapter tested end-to-end.
-   Checkpoint integrity and compatibility validation pass.
-   Restore/recovery behavior documented.
-   Encryption, access control, retention and deletion tested.
-   Unsupported workloads clearly rejected.

## Phase 4 --- Predictive Compute Arbitrage

-   Recommend-only mode reliable before automation.
-   Net cost includes transfer, checkpoint, restore, startup and risk
    overhead.
-   Thresholds, cooldown, budgets and approvals enforced.
-   Plan revalidated before execution.
-   Failed target launch cannot prematurely stop source workload.
-   Audit, kill switch and fallback tested.
-   Verified savings reconciled against actual usage/cost.

------------------------------------------------------------------------

# 22. IDE Agent Workflow

The coding IDE must follow this workflow.

## Step 1: Inspect

-   Read `PRD` and this TRD.
-   Inspect repository tree, existing implementation, package files,
    database schema, environment setup and tests.
-   Identify existing integrations and which are real versus mocked.
-   Do not overwrite working code before understanding it.

## Step 2: Report

Provide a concise gap analysis: - Existing architecture. - Features
already implemented. - Missing Phase 1 requirements. - Security or
correctness risks. - Proposed file changes and migration impact.

## Step 3: Plan

Create a small, ordered Phase 1 task plan with testable acceptance
criteria. Ask for clarification only when a decision is genuinely
blocking; otherwise use conservative defaults and document assumptions.

## Step 4: Implement incrementally

-   Work in small coherent changes.
-   Add types and validation first.
-   Add tests alongside calculations and policy logic.
-   Keep provider operations mocked or disabled unless explicitly
    configured.
-   Use migrations for database changes.
-   Keep mock data visibly separated from live data.

## Step 5: Verify

-   Run relevant tests, linting, type checks and build.
-   Test no-candidate, stale-data, permission-denied, timeout and
    policy-denied paths.
-   Check that no secrets are committed.
-   Check that the UI differentiates estimates, actuals and fixtures.

## Step 6: Report completion

At the end of each stage, state: - Files changed. - Features
implemented. - Tests run and their results. - Real versus mocked
integrations. - Known limitations. - Any migration or environment setup
required. - Recommended next task.

Do not report success for a test that was not run. Do not claim
production readiness based only on a successful local build.

------------------------------------------------------------------------

# 23. Phase 1 Implementation Backlog

Recommended order:

1.  Inspect existing repository and create a gap analysis.
2.  Establish typed domain models and workload manifest validation.
3.  Establish organization/tenant authorization boundaries.
4.  Add provider and compute-offer abstractions with mock adapter
    clearly labelled.
5.  Implement hard-constraint candidate filtering.
6.  Implement transparent cost-component calculation with decimal money
    values.
7.  Implement side-effect-free plan generation and explanation.
8.  Build dashboard for workload creation and candidate comparison.
9.  Add plan/run state and audit events.
10. Add cost/usage records, clearly separating estimated and actual
    values.
11. Add tests for all calculations, constraints and denied actions.
12. Document setup, limitations and next phase.
13. Only then evaluate a real provider integration based on validated
    customer need and safe test credentials.

Do not start with automated provider switching, a generalized checkpoint
service, a multi-provider billing marketplace, or complex predictive ML
models before this foundation is dependable.

------------------------------------------------------------------------

# 24. Open Technical Decisions

These decisions should be resolved based on the existing repository and
customer discovery: - Which workload family is the first supported
target? - Which one or two providers have the best combination of
demand, API access and testability? - Which auth provider and tenancy
model are already in place? - Will customers pay providers directly or
use a managed billing model? - Which price and availability sources can
be used reliably and legally? - What is the initial savings baseline
methodology? - What is the minimum material savings threshold for
re-planning? - Which checkpoint adapter should be implemented first? -
Which data regions and retention defaults are required? - What
prediction error and calibration gates are appropriate for the first
workload family?

Do not silently decide business-critical or security-sensitive questions
in code. Document chosen defaults and their rationale.

------------------------------------------------------------------------

# 25. Final Engineering Rule

**Kynetic AI must earn automation through evidence.** First make
workload descriptions, constraints, cost estimates and plan explanations
correct and transparent. Then measure real workload performance. Then
add checkpoint/resume for selected workloads. Finally enable compute
arbitrage only when its net savings, compatibility, policy enforcement
and recovery path can be demonstrated and audited.

The MVP is successful when it solves a narrow customer problem
reliably---not when every component in this document has been
implemented.

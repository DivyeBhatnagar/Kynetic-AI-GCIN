# Kynetic AI --- Complete Product Overview & IDE Handoff

**Document type:** Product overview, strategy, architecture brief, and
implementation guide\
**Product:** Kynetic AI\
**Version:** 1.0\
**Status:** Vision and product requirements; implementation should be
staged\
**Audience:** AI coding IDEs/agents, engineers, product collaborators,
and early design partners

------------------------------------------------------------------------

## 1. Executive Summary

**Kynetic AI is a software-first compute intelligence and workload
orchestration platform.** It helps developers and organizations
discover, compare, provision, execute, monitor, recover, and optimize
compute workloads across compatible cloud and specialist GPU providers.

The user describes the outcome they want---such as "run this workload
within \$50, finish before tomorrow, keep data in this region, and
recover safely from interruptions." Kynetic AI evaluates compatible
execution options, estimates total cost-to-completion and runtime,
recommends or selects a suitable plan under user policies, and tracks
actual results.

Kynetic AI should not begin as a capital-intensive GPU cloud or a basic
catalogue of cheap GPUs. It should begin as an **intelligent compute
scheduler with a marketplace attached**, using existing provider
infrastructure. This asset-light approach enables bootstrap-friendly
customer validation before substantial provider, infrastructure, or
marketplace commitments.

### Core promise

> **Tell Kynetic AI what you need to run, your budget, deadline, and
> constraints. It finds a suitable way to complete the workload,
> explains the trade-offs, and helps execute and optimize it safely.**

### Three differentiating capabilities

1.  **Workload Performance Digital Twin** --- predicts runtime,
    throughput, compatibility, and total cost for a workload on
    candidate hardware/providers, with uncertainty clearly communicated.
2.  **Predictive Compute Arbitrage** --- identifies when another
    compatible provider or configuration is likely to reduce *total
    remaining cost* without unacceptable deadline, reliability,
    security, or data-movement trade-offs.
3.  **Universal Checkpoint and Resume Layer** --- provides a common
    interface for checkpointing and resuming supported workloads,
    enabling recovery and safe replanning at workload-defined
    boundaries.

"Universal" is a long-term abstraction across supported adapters; it
does **not** imply every workload or GPU process can be migrated
seamlessly.

------------------------------------------------------------------------

## 2. Product Thesis and Positioning

### Problem

Compute selection and operation are fragmented: - Providers have
different hardware, prices, availability, billing rules, storage/network
costs, and APIs. - The cheapest hourly GPU is not always the cheapest
way to finish a job. - Developers often lack trustworthy estimates of
runtime and final bill before launching a workload. - Moving between
providers can require container changes, data movement, dependency
setup, checkpointing, and recovery logic. - Cloud bills are hard to map
to workload-level outcomes. - Interruptions and failures can waste
compute time when jobs cannot resume from useful state. - Enterprise
teams need spending controls, data residency, security, auditability,
and predictable operations.

### Product solution

Kynetic AI provides a common intelligence and control layer above
compute providers. It combines: - Workload descriptions and
compatibility checks. - Benchmarking and historical performance
observations. - Cost-to-completion estimates. - Provider and
configuration selection. - Policy-aware orchestration and usage
tracking. - Checkpoint/resume adapters for supported workloads. -
Actual-versus-predicted reporting and optimization feedback.

### Positioning

**Kynetic AI = workload-aware compute intelligence + orchestration +
multi-provider access.**

It is not initially: - A company building data centers or buying large
GPU fleets. - A guarantee that all running jobs can live-migrate across
clouds. - Merely a GPU price comparison website. - A speculative
financial arbitrage business. - A general-purpose cloud replacement. - A
proprietary model-training company whose main product is an LLM.

### Product principles

1.  **Cost-to-completion, not hourly-price minimization.**
2.  **User constraints are hard constraints** when explicitly marked as
    such.
3.  **Predict before automating.** Begin with transparent
    recommendations and approval-gated actions.
4.  **Never hide uncertainty.** Estimates must include assumptions and
    confidence.
5.  **No unsafe migrations.** Switch only at supported checkpoints, task
    boundaries, or before launch.
6.  **Asset-light first.** Use provider APIs and customer-authorized
    accounts; avoid carrying compute inventory or customer credit risk.
7.  **Actual outcomes improve future estimates**, subject to customer
    consent, privacy, and contractual limits.
8.  **Explain every material decision.** Show why a provider was
    selected and which costs/risks matter.
9.  **Customer control first.** Budgets, regions, data policies,
    approvals, and provider allowlists must be enforced.
10. **Build one workload family well before claiming broad
    portability.**

------------------------------------------------------------------------

## 3. Target Users and Initial Beachhead

### Initial customer segments

**Primary beachhead: AI startups and small ML teams** - Run model
training, fine-tuning, evaluation, batch inference, data processing, or
rendering. - Need to stretch compute budgets and do not have large
platform-engineering teams. - Can evaluate a paid pilot quickly when
savings and reliability are measurable.

**Secondary segments** - AI development agencies running workloads for
multiple clients. - Independent ML engineers and researchers with
recurring workloads. - GPU cloud providers and managed service providers
that need better customer-facing optimization. - Later: enterprises, AI
labs, and organizations with multi-cloud governance needs.

### Initial workload candidates

Prioritize workloads that can be benchmarked and recovered
predictably: 1. Batch inference and embedding generation. 2. Evaluation
suites and test workloads. 3. Image/video processing or rendering
queues. 4. Hyperparameter sweeps and independent experiments. 5.
Selected ML training/fine-tuning workloads with documented checkpoint
APIs. 6. Data preprocessing jobs.

Defer arbitrary live migration of stateful services, tightly coupled
multi-node distributed training across providers, and workloads with
non-idempotent external side effects until a workload-specific solution
is proven.

### Customer jobs-to-be-done

-   "Tell me which GPU/configuration is the most economical for this
    job."
-   "Estimate the final bill and time before I launch."
-   "Run this workload without exceeding my budget."
-   "Use another provider if it is genuinely cheaper and safe."
-   "Resume my supported training job after interruption."
-   "Show the actual savings and why the recommendation was made."
-   "Keep my data and workload within approved regions and providers."

------------------------------------------------------------------------

## 4. Core User Experience

### User-provided workload specification

A workload submission should capture, directly or through a guided
form/CLI:

-   Workload name and description.
-   Container image and immutable image digest where available.
-   Entrypoint, arguments, environment references, and required secrets
    (secrets must never be stored in plain text).
-   Workload class: batch inference, training, evaluation, rendering,
    preprocessing, etc.
-   Framework/runtime and version requirements.
-   Accelerator type, minimum VRAM, CPU, RAM, storage, interconnect, and
    parallelism requirements.
-   Input dataset size and location; data sensitivity and residency
    constraints.
-   Expected runtime or representative benchmark, if known.
-   Deadline and maximum budget.
-   Latency, reliability, and interruption tolerance.
-   Whether work can be decomposed into independent tasks.
-   Whether framework/application checkpointing is supported.
-   Approved providers, regions, instance types, and storage targets.
-   Approval mode: recommend-only, approval-required, or
    policy-authorized automation.

### Typical flow

1.  User submits workload manifest and constraints.
2.  Kynetic validates the manifest and checks required permissions and
    compatibility.
3.  Digital Twin evaluates eligible candidate configurations.
4.  Planner estimates runtime range, total cost-to-completion,
    uncertainty, and risks.
5.  Scheduler removes candidates that violate hard constraints.
6.  User sees ranked options and a clear explanation.
7.  User approves a plan or allows pre-authorized automation.
8.  Orchestrator provisions resources, stages data, runs the job,
    monitors health and cost, and records events.
9.  For supported workloads, the checkpoint layer can save state and
    resume after an interruption or approved replan.
10. Kynetic reports actual runtime, final cost, recovery performance,
    prediction error, and verified savings.

### Example user request

> Run this containerized fine-tuning job. Budget: \$80. Deadline: 8
> hours. Data must remain in the EU. Use compatible GPUs with at least
> 24 GB VRAM. Prefer low cost, but do not switch providers unless the
> expected net savings are at least 15% and the checkpoint is valid. Ask
> before any action that could exceed \$80.

The product should turn this into explicit, validated constraints---not
treat natural language as permission to perform arbitrary infrastructure
actions.

------------------------------------------------------------------------

## 5. Product Modules

### 5.1 Workload Registry and Manifest

Stores versioned workload definitions, hardware/software requirements,
input/output references, execution policies, and supported capabilities.

Responsibilities: - Validate manifests. - Fingerprint workload
characteristics without unnecessarily retaining payloads. - Record
workload class and adapter compatibility. - Track workload versions and
execution history. - Avoid exposing secrets in manifests, logs, or
telemetry.

### 5.2 Workload Performance Digital Twin

**Purpose:** estimate how a workload is likely to run and what it will
cost on each eligible candidate.

#### Inputs

-   Workload fingerprint and manifest.
-   Hardware profile: accelerator, VRAM, CPU, RAM, storage, interconnect
    where relevant.
-   Framework and runtime versions.
-   Dataset size, batch/sequence/image dimensions, parallelism and other
    workload characteristics.
-   Region/provider, current price, startup/queue estimates,
    storage/network charges and available reliability signals.
-   Historical measurements: runtime, throughput, peak memory,
    utilization, failures, retries and final billed cost.

#### Outputs

-   Predicted runtime and throughput for each compatible candidate.
-   Total cost-to-completion, itemized where possible.
-   Confidence intervals or uncertainty bands.
-   Compatibility and feasibility warnings.
-   Ranked candidates for cheapest completion, fastest completion,
    deadline-constrained completion, or custom objectives.
-   Post-run predicted-versus-actual report.

#### Functional requirements

-   Keep versioned benchmark records with workload, hardware, software,
    region, and methodology metadata.
-   Include prediction timestamp, model/version, assumptions and
    uncertainty.
-   Exclude candidates that fail hard compatibility, security, region,
    data residency or budget constraints.
-   Detect stale pricing, benchmark drift, and low-confidence
    extrapolation.
-   Fall back to transparent rules or request a benchmark when model
    confidence is insufficient.
-   Compare predictions to actual outcomes and track error by workload
    family and hardware class.
-   Do not represent predictions as guarantees.

#### Implementation strategy

Start with a benchmark registry, transparent rules, lookup tables and
simple regression models. Collect repeatable benchmark data before
introducing more complex models. Establish prediction-quality gates and
calibration before using predictions for autonomous actions.

### 5.3 Predictive Compute Arbitrage

**Purpose:** decide whether to launch on, remain on, or safely replan to
another eligible compute configuration/provider.

This is **policy-constrained compute optimization**, not speculative
buying or blind switching based on hourly price.

#### Decision model

Compare expected *remaining total cost-to-completion*:

`remaining_total_cost = remaining_compute + storage + data_transfer + startup/queue + checkpoint/restore + expected_retry/failure_cost + other applicable charges`

Switch or replan only if: - The target is compatible. - All hard user
constraints are satisfied. - The target is expected to meet the deadline
and reliability requirements. - Expected net savings exceed the
configured absolute/percentage threshold. - Data movement, checkpoint,
restart, startup, and risk costs are included. - Customer policy permits
the action and any required approval is obtained.

A simple economic test is:

`net_savings = expected_cost_without_switch - expected_cost_with_switch`

Switch only if `net_savings` exceeds the configured threshold and risk
constraints remain acceptable.

#### Modes

1.  **Recommend-only:** show alternatives; user decides.
2.  **Approval-required:** prepare a plan and request approval before
    billable or destructive actions.
3.  **Policy-authorized automation:** act only within explicit budget,
    provider, region, deadline, data and migration policies.
4.  **Pre-launch placement:** select a compatible candidate before the
    job starts; prioritize this early.
5.  **Checkpoint-aware replanning:** reconsider at a supported
    checkpoint or safe task boundary.
6.  **Task-level distribution:** distribute independent tasks when the
    workload can be partitioned and outputs safely aggregated.

#### Guardrails

-   Do not switch based only on headline hourly rates.
-   Use minimum net-savings thresholds and cooldowns to avoid
    oscillation.
-   Never exceed approved budgets or move data to disallowed regions.
-   Do not terminate the source before the target is confirmed healthy
    and recovery/consistency conditions are satisfied, where safe.
-   Avoid migration for tightly coupled or non-resumable jobs without an
    explicit application-level mechanism.
-   Log recommendations, approvals, actions, rollback/fallback and
    outcomes.
-   Distinguish estimated savings from verified savings.
-   Bound retries and make actions idempotent.

### 5.4 Universal Checkpoint and Resume Layer

**Purpose:** provide a common orchestration interface for saving and
restoring supported workload state.

"Universal" means a shared interface with workload/framework-specific
adapters. It does **not** mean arbitrary process memory or GPU memory
can always be moved between different clouds or GPU types.

#### State that may need to be saved

Depending on the framework: - Model weights. - Optimizer and
learning-rate scheduler state. - Global step, epoch, and training
progress. - Random-number-generator state. - Data-loader or sampler
position. - Application-specific state and completed-task ledger. -
Input/output references and idempotency keys. - Container digest,
framework/runtime version and hardware compatibility metadata.

#### Functional requirements

-   Versioned adapter interface for supported frameworks/workloads.
-   Framework/application checkpoint hooks where available.
-   Atomic checkpoint creation or manifest/commit protocol so incomplete
    files are not considered valid.
-   Checksum validation and compatibility validation before resume.
-   Encryption in transit and at rest, tenant isolation, region controls
    and authorized access.
-   Configurable checkpoint interval, retention and storage location.
-   Cost-aware checkpoint interval that balances checkpoint overhead,
    lost work and storage/transfer cost.
-   Track checkpoint, restore, resume success, recovery time and
    lost-work duration.
-   Enforce retention and deletion policies.
-   Ensure retry/resume operations are idempotent, or require
    workload-level deduplication for side-effecting operations.
-   Report actionable errors for corrupt, incomplete, incompatible or
    policy-disallowed checkpoints.

#### Initial scope

Start with independent batch workloads and selected ML training
frameworks with reliable checkpoint APIs. Add adapters only after
testing. Defer generic live migration of GPU memory and unsupported
tightly coupled distributed jobs.

### 5.5 Provider Adapter Layer

A common internal contract over provider-specific APIs.

Responsibilities may include: - List compatible compute
configurations. - Retrieve prices and price timestamps. - Check
capacity/availability where the provider exposes it. - Provision,
inspect and terminate instances/jobs. - Manage storage and network
setup. - Retrieve usage and billing/metering data. - Surface provider
errors, lifecycle events and interruption notices. - Normalize
provider-specific capabilities and limitations.

Use capability-based adapters: never assume all providers expose the
same pricing, capacity, interruption, checkpoint or lifecycle features.

### 5.6 Execution Orchestrator

-   Validate a plan before execution.
-   Provision and configure resources.
-   Stage data according to policy.
-   Start the workload and capture logs/metrics.
-   Monitor budget, health, deadlines and completion.
-   Handle retries and supported recovery.
-   Track lifecycle state and final outputs.
-   Clean up temporary resources reliably.
-   Reconcile expected versus actual usage.

### 5.7 Cost and Savings Ledger

-   Store price assumptions and their timestamps.
-   Estimate cost before execution.
-   Record actual resource usage and charges when available.
-   Itemize compute, storage, transfer, startup, checkpoint, retry and
    other known costs.
-   Separate forecast savings from verified savings.
-   Define a baseline for savings-based billing.
-   Account for provider discounts, credits, commitments, changes in
    workload volume and performance.
-   Keep an audit trail for customer invoices and disputes.

### 5.8 Policy, Security and Audit Layer

-   Role-based access and scoped permissions.
-   Provider and region allowlists.
-   Data residency and data movement restrictions.
-   Budget caps, alert thresholds and approval gates.
-   Secrets management and credential isolation.
-   Encryption in transit and at rest.
-   Tenant isolation.
-   Audit events for plans, approvals, actions, data movement,
    checkpoints and deletion.
-   Retention and deletion policies.
-   Customer control over telemetry use.
-   Least-privilege provider credentials; use read-only access for
    initial billing analysis wherever possible.

### 5.9 Dashboard and CLI

The dashboard should show: - Workloads and status. - Candidate
configurations and compatibility. - Predicted runtime/cost and
uncertainty. - Total cost-to-completion breakdown. - Why a candidate was
selected. - Budget usage and alerts. - Checkpoint and recovery
history. - Actual versus predicted cost/runtime. - Estimated versus
verified savings. - Provider activity and audit history.

A CLI should eventually support workflow automation and developer
ergonomics, e.g. submitting a manifest, previewing a plan, approving
execution, checking status, and retrieving outputs. CLI syntax is
illustrative until implemented.

------------------------------------------------------------------------

## 6. Business Model and Monetization

The company should be software-first and bootstrap-friendly. Monetize
measurable customer value before assuming the risk of compute resale.

### Revenue stream 1: Compute optimization SaaS

Proposed pricing to test: - Free audit/report for lead generation. -
Optimize: approximately ₹2,999--₹9,999/month for recommendations, cost
estimates, budget alerts and reporting. - Orchestrate: approximately
₹15,000--₹75,000/month for automated placement, execution management,
supported recovery and advanced controls. - Enterprise: custom annual
contracts, potentially ₹3 lakh--₹25 lakh+ per year depending on scope,
support and requirements.

These are hypotheses for customer discovery, not validated market rates.
Price by segment and value.

### Revenue stream 2: Savings-based fee

Potentially charge 10--20% of independently verified savings, with clear
baseline and attribution rules. A subscription minimum can stabilize
revenue. Do not charge on theoretical savings that were not realized.

### Revenue stream 3: Managed orchestration / transaction fee

When workloads are submitted and managed through Kynetic AI, charge a
disclosed orchestration or transaction fee. If compute is resold,
clearly disclose the commercial model and ensure customers understand
billing and support responsibilities.

### Revenue stream 4: Enterprise control plane

Annual contracts for governance, auditability, SSO/RBAC, private
deployment, custom policies, integration support, SLAs and advanced
scheduling.

### Revenue stream 5: Provider partnerships

After demonstrating demand, explore referral agreements, partner
integrations, volume discounts or white-label orchestration. Do not
depend on exclusive provider relationships early.

### Pricing principles

-   The free tier should have a clear conversion path.
-   Keep entry-level product self-serve and support-light.
-   Avoid open-ended custom consulting disguised as SaaS.
-   Do not finance customers' compute spend.
-   If compute is passed through Kynetic AI, collect sufficient funds or
    use a payment arrangement that limits credit exposure.
-   Keep compute pass-through revenue separate from net software revenue
    in internal reporting.
-   Track gross margin by revenue stream.

### Bootstrap go-to-market

1.  Interview 10--20 AI startups, ML engineers and agencies.
2.  Offer a cost audit and workload benchmark.
3.  Turn the first successful audits into paid pilots.
4.  Measure before/after runtime, cost, performance and reliability.
5.  Convert pilots into recurring subscriptions or managed optimization.
6.  Publish case studies only with customer approval and sound
    attribution.
7.  Build referrals and provider partnerships after the value
    proposition is proven.

### Capital discipline

-   Avoid buying GPU inventory.
-   Avoid long-term capacity commitments before demand is predictable.
-   Use existing provider APIs and open-source tools where practical.
-   Begin with one workload family and a limited set of providers.
-   Prefer customer-paid provider accounts or carefully controlled
    billing to avoid working-capital exposure.
-   Reinvest revenue in automation and product quality.

------------------------------------------------------------------------

## 7. Competitive Differentiation

Kynetic AI should not compete solely on having the lowest advertised GPU
rate. Existing cloud cost tools and GPU marketplaces already offer
pieces of the value proposition.

Potential differentiation: - Workload-level cost-to-completion rather
than generic infrastructure cost reporting. - Performance predictions
based on measured workload/hardware combinations. - Unified policy and
orchestration across providers. - Safe checkpoint-aware recovery for
explicitly supported workloads. - Transparent reasoning and verified
savings. - Feedback loop from predictions to actual workload outcomes. -
Developer-friendly submission model that abstracts provider differences
without hiding them.

Long-term defensibility can come from: 1. A high-quality workload
performance dataset. 2. A reliable execution and recovery layer. 3. A
calibrated cost-to-completion model. 4. Provider compatibility and
lifecycle adapters. 5. Customer policy, governance and operational
integration. 6. Trust from measurable results and transparent billing.

Network effects are a hypothesis to validate, not an automatic outcome.
Customer data must not be pooled or used for model training beyond
consent and contract terms.

------------------------------------------------------------------------

## 8. High-Level Technical Architecture

### Architectural style

Start as a **modular monolith** with clean module boundaries. Split into
services only when scale, reliability, team ownership or operational
needs justify the complexity.

### Suggested initial stack

Adapt to existing repository constraints before replacing anything: -
**Frontend:** Next.js + React + TypeScript + Tailwind CSS. - **Backend
API:** Python + FastAPI. - **Database:** PostgreSQL. - **Cache/ephemeral
coordination:** Redis. - **Background jobs:** Celery or an equivalent
queue/worker system. - **Workload packaging:** OCI/Docker containers. -
**Observability:** structured logs, metrics, traces, error reporting. -
**Deployment:** start with low-cost managed hosting for the control
plane; workload execution uses provider-specific compute APIs. -
**Authentication:** managed auth or a well-maintained identity library;
enforce RBAC and tenant boundaries. - **Secrets:** dedicated secrets
manager or secure environment injection; never commit secrets.

These are suggested defaults, not hard requirements. Do not introduce
unnecessary infrastructure in the MVP.

### Logical components

1.  Web dashboard and CLI.
2.  API/authentication layer.
3.  Workload registry and manifest validator.
4.  Policy and permissions engine.
5.  Provider adapter registry.
6.  Pricing/availability ingestion.
7.  Benchmark registry and Digital Twin predictor.
8.  Cost-to-completion planner.
9.  Placement/arbitrage decision engine.
10. Execution orchestrator and job-state machine.
11. Checkpoint adapter/orchestrator and storage metadata.
12. Cost/savings ledger.
13. Event log, telemetry and audit trail.
14. Background workers for provider polling, execution events,
    reconciliation and reports.

### Suggested repository organization

``` text
kynetic-ai/
  apps/
    web/                    # Next.js dashboard
    api/                    # FastAPI application
    worker/                 # background jobs
    cli/                    # optional developer CLI
  packages/
    shared-types/           # API schemas/contracts if shared
    provider-adapters/      # provider interfaces and implementations
    workload-adapters/      # checkpoint/workload adapters
  services/
    workload_registry/
    digital_twin/
    cost_planner/
    policy_engine/
    orchestrator/
    checkpoint_manager/
    billing_ledger/
  infra/
    docker/
    deployment/
    migrations/
  tests/
    unit/
    integration/
    contract/
    end_to_end/
  docs/
    PRODUCT_OVERVIEW.md
    ARCHITECTURE.md
    SECURITY.md
  .env.example
  README.md
```

This is a reference layout, not a requirement to create every folder in
the first commit. Prefer a simpler layout if it fits the existing
project better.

### Core domain entities

At minimum, plan for: - `User` - `Organization` / `Tenant` -
`ProviderAccount` - `Provider` - `ProviderCapability` - `ComputeOffer` /
`ComputeConfiguration` - `Workload` - `WorkloadVersion` -
`WorkloadManifest` - `WorkloadRun` - `ExecutionPlan` - `PlanCandidate` -
`Policy` - `Approval` - `ProviderResource` - `Checkpoint` -
`CheckpointAdapter` - `CostEstimate` - `UsageRecord` - `SavingsRecord` -
`BenchmarkRun` - `PerformanceObservation` - `AuditEvent` -
`SecretReference`

Use explicit lifecycle states, timestamps, ownership, and idempotency
identifiers where appropriate. Avoid storing secrets or raw customer
payloads in general-purpose tables/logs.

------------------------------------------------------------------------

## 9. Important APIs (Proposed)

API paths and schemas must be designed and validated against the actual
implementation. These endpoints are a starting contract, not evidence
that they already exist.

### Workload and planning

-   `POST /v1/workloads` --- create a workload.
-   `GET /v1/workloads/{id}` --- inspect workload and status.
-   `POST /v1/workloads/{id}/predict` --- estimate runtime/cost on
    eligible candidates.
-   `POST /v1/workloads/{id}/plans` --- create a dry-run placement plan.
-   `GET /v1/plans/{id}` --- inspect plan and explanation.
-   `POST /v1/plans/{id}/approve` --- approve a proposed action.
-   `POST /v1/workloads/{id}/runs` --- start a workload under an
    approved plan.
-   `GET /v1/runs/{id}` --- execution status and metrics.
-   `POST /v1/runs/{id}/cancel` --- request cancellation with lifecycle
    checks.

### Digital Twin and outcomes

-   `GET /v1/workloads/{id}/prediction-history` --- prediction versus
    actual history.
-   `GET /v1/workloads/{id}/savings` --- estimated and verified savings.
-   `POST /v1/benchmarks` --- register/submit a benchmark observation
    under authorized policy.

### Checkpoint and resume

-   `POST /v1/runs/{id}/checkpoints` --- request checkpoint via a
    supported adapter.
-   `GET /v1/checkpoints/{id}` --- inspect checkpoint metadata and
    state.
-   `POST /v1/runs/{id}/resume` --- resume from a validated checkpoint.

### Provider and usage

-   `GET /v1/providers` --- supported providers/capabilities.
-   `GET /v1/compute-offers` --- compatible compute candidates.
-   `GET /v1/runs/{id}/cost` --- estimate/actual cost breakdown.
-   `GET /v1/audit-events` --- authorized audit history.

All state-changing endpoints need authentication, authorization,
validation, idempotency, audit events and explicit error handling. Avoid
APIs that trigger billable actions by default when a dry-run can be
used.

------------------------------------------------------------------------

## 10. Core Algorithms and Decision Logic

### Candidate filtering

Filter before ranking: 1. Remove candidates that fail
runtime/framework/hardware compatibility. 2. Remove candidates that
violate provider, region, data, licensing, security or budget
constraints. 3. Remove candidates that cannot meet the deadline within
configured confidence/risk tolerance. 4. Rank remaining candidates by
the requested objective.

### Cost-to-completion

Estimate:

``` text
total_cost =
  expected_compute_cost
  + storage_cost
  + data_transfer_cost
  + startup_and_queue_cost
  + checkpoint_and_restore_cost
  + expected_retry_and_failure_cost
  + other_known_provider_charges
```

Represent unknown costs and uncertainty explicitly. Do not invent
precise prices where data is stale or unavailable.

### Objective modes

Support explicit objective presets: - Lowest expected cost subject to
deadline. - Fastest completion under budget. - Balanced cost,
performance and reliability. - Custom weighted objective. - Enterprise
policy-constrained objective.

Hard constraints must not be converted into soft weighted preferences.

### Arbitrage decision

-   Compute remaining cost on the current plan.
-   Compute expected remaining cost on each eligible alternative,
    including migration overhead and uncertainty.
-   Estimate expected net savings.
-   Apply configured absolute and percentage thresholds, cooldowns, risk
    limits and approval rules.
-   Produce an explainable plan.
-   Execute only when authorized.
-   Record actual results and reconcile later.

### Checkpoint interval

The optimal interval depends on checkpoint overhead,
failure/interruption probability, expected lost work, storage and
transfer costs, and workload-specific restore time. Start with a
configurable interval and measured observations; introduce optimization
only when enough reliable data exists.

### Prediction quality

Track runtime and cost errors separately, segmented by workload family
and hardware class. Use a defined representative benchmark suite and
confidence calibration. Do not gate quality solely on one aggregate
accuracy metric.

------------------------------------------------------------------------

## 11. Security, Reliability and Operational Requirements

-   Multi-tenant isolation for all data and actions.
-   Least-privilege provider credentials.
-   Read-only billing access for cost analysis when possible.
-   No hard-coded credentials or secrets in logs.
-   Encrypt secrets, checkpoints and sensitive data in transit and at
    rest.
-   Respect data residency and approved-region policies.
-   Require explicit authorization for billable or destructive actions.
-   Idempotent API and worker operations where feasible.
-   Bounded retries and dead-letter/error handling.
-   Durable job-state transitions and audit logs.
-   Resource cleanup even after failures or cancellation.
-   Reconciliation between provider usage and internal cost records.
-   Clear handling of stale pricing and missing provider signals.
-   Rate limits and abuse protection.
-   Backup and restore procedures for control-plane data.
-   Observability for API latency, queue depth, job failures, provider
    errors, cost reconciliation and recovery outcomes.
-   Customer-configurable retention/deletion policies.
-   Explicit limitations for unsupported workloads and provider
    features.

### Key non-goals and safety boundaries

-   No arbitrary cross-cloud live migration of running GPU memory.
-   No switching based only on headline hourly price.
-   No stopping the source job before a safe recovery plan is
    established.
-   No silent movement of data across regions or tenants.
-   No autonomous actions outside approved budgets and policies.
-   No claim of guaranteed savings or exact runtime.
-   No storing customer secrets or workload payloads without a clear
    requirement and safeguards.

------------------------------------------------------------------------

## 12. MVP Scope and Roadmap

### Phase 0 --- Customer discovery

-   Interview 10--20 target customers.
-   Select one workload category and two or three candidate providers.
-   Validate the customer's willingness to pay for measurable
    cost/performance improvement.
-   Define benchmark workload, baseline methodology, and success
    criteria.

### Phase 1 --- MVP: transparent cost intelligence

Build: - Basic account/auth and organization boundary. - Workload
manifest schema. - Limited provider offer/pricing ingestion or manually
validated provider data. - Candidate compatibility filtering. - Basic
cost estimate and comparison. - Plan preview/dry-run. - Usage and
outcome tracking. - Simple dashboard and audit events.

Exit criteria: - One defined workload completes or is benchmarked
end-to-end. - Estimates and assumptions are visible. - Actual cost can
be compared with predicted cost. - Hard constraints are enforced.

### Phase 2 --- Digital Twin

Build: - Benchmark registry. - Workload fingerprints. - Runtime and cost
predictions. - Confidence reporting and drift detection. -
Prediction-versus-actual evaluation.

Exit criteria: - Prediction error measured on a representative suite. -
Low-confidence cases handled safely. - No unsupported candidate is
recommended as compatible.

### Phase 3 --- Checkpoint/resume for selected workloads

Build: - First workload adapter(s). - Checkpoint metadata and integrity
checks. - Secure storage and retention policies. - Resume validation and
recovery reports.

Exit criteria: - Recovery tests pass for each supported adapter. -
Corrupt/incompatible checkpoints are rejected. - Recovery time and
checkpoint overhead are measured.

### Phase 4 --- Predictive compute arbitrage

Build: - Recommend-only mode. - Savings thresholds and policy engine. -
Approval-required execution. - Pre-launch placement and checkpoint-aware
replanning. - Fallback and audit behavior.

Exit criteria: - Net savings calculation includes migration costs. -
Hard policies cannot be bypassed by the scheduler. - Failed target
launches do not prematurely terminate a source workload. - Forecast
savings and verified savings are distinct.

### Phase 5 --- Broader compute network

-   Add providers based on customer demand.
-   Add enterprise policies and integrations.
-   Add more workload adapters.
-   Explore partner channels and volume economics.
-   Expand toward a broader compute control plane only when unit
    economics and reliability support it.

The dates for these phases should depend on validated release gates, not
arbitrary deadlines.

------------------------------------------------------------------------

## 13. Metrics and Success Criteria

### Product value

-   Customer-confirmed and independently reconcilable savings.
-   Runtime prediction error by workload family.
-   Cost prediction error by workload family.
-   Percentage of workloads with valid compatibility data.
-   Workload completion success rate.
-   Time from submission to successful execution.
-   Checkpoint and restore success rates for supported adapters.
-   Recovery time and lost-work duration.
-   Percentage of recommendations accepted.
-   Repeat workload rate.

### Reliability and safety

-   Policy violation count (target: zero).
-   Unauthorized billable/destructive action count (target: zero).
-   Premature source termination count (target: zero).
-   Failed/duplicate provider actions.
-   Cost overrun frequency.
-   Provider API failure rate.
-   Reconciliation discrepancy.
-   Prediction drift and low-confidence rate.

### Business

-   Paid customer count.
-   Monthly recurring revenue.
-   Average revenue per account.
-   Gross margin by revenue stream.
-   Customer acquisition cost and payback.
-   Logo and revenue retention.
-   Expansion revenue.
-   Support hours per account.
-   Compute pass-through exposure and working-capital risk.

------------------------------------------------------------------------

## 14. Main Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                    Why it matters          Mitigation
  ----------------------- ----------------------- -----------------------
  Poor prediction         Bad placement harms     Benchmarks,
  accuracy                trust or increases cost uncertainty, measured
                                                  outcomes, conservative
                                                  fallback

  Hidden migration costs  Nominally cheaper       Cost-to-completion
                          provider can be more    includes data, startup,
                          expensive overall       checkpoint, restore and
                                                  failure overhead

  Workload                Provider or hardware    Capability adapters,
  incompatibility         changes can break jobs  manifest validation,
                                                  explicit compatibility
                                                  checks

  Checkpoint limitations  Some workloads cannot   Start with supported
                          safely resume           frameworks and explicit
                                                  adapter coverage

  Provider API            Different semantics and Adapter contracts,
  inconsistency           data availability       capability flags,
                                                  contract tests

  Price/capacity          Estimates can become    Timestamped data,
  volatility              stale                   freshness checks,
                                                  confidence penalties

  Security/data residency Data movement can       Hard policy filters,
                          violate customer        encryption, audit and
                          obligations             region-aware storage

  Cloud billing exposure  Reselling compute can   Customer-paid provider
                          consume working capital accounts, prepayment,
                                                  limits and clear
                                                  billing

  Marketplace cold start  Too few providers or    Start with a few
                          customers reduce value  providers and a narrow
                                                  workload segment

  Enterprise sales        Long cycles and custom  Start with startups/ML
  complexity              requirements            teams; charge for
                                                  custom work

  Product overreach       Too many                Stage releases and
                          providers/features      require measurable
                          delay launch            gates
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 15. Bootstrap Financial Strategy

### Initial operating model

-   Founder-led customer discovery and sales.
-   Build a narrow product and automate recurring audit tasks.
-   Use low-cost hosting and managed services.
-   Avoid GPU inventory and long-term compute commitments.
-   Use open-source libraries and existing provider APIs.
-   Charge for pilots when the value is measurable.
-   Reinvest revenue into automation, reliability, and provider
    coverage.

### Illustrative pricing hypotheses

-   Free audit: ₹0, limited scope and used for lead generation.
-   Optimize SaaS: ₹2,999--₹9,999/month.
-   Orchestrate: ₹15,000--₹75,000/month.
-   Enterprise: custom annual pricing.
-   Savings fee: potentially 10--20% of verified savings, subject to
    baseline and attribution rules.
-   Compute orchestration/transaction fee: add only once the execution
    experience is reliable.

All pricing should be validated through customer interviews and paid
pilots.

### Financial discipline

-   Distinguish gross compute pass-through from software revenue.
-   Do not treat customer cloud spend as Kynetic AI revenue when the
    customer pays the provider directly.
-   Track direct delivery costs, support and gross margin by product.
-   Avoid giving away unlimited manual consulting.
-   Never guarantee savings until measurement and attribution are
    defensible.

------------------------------------------------------------------------

## 16. Long-Term Vision: 10--20 Years

These are strategic horizons, not predictions.

1.  **Compute cost intelligence:** trusted workload benchmarking and
    cost-to-completion.
2.  **Adaptive workload orchestration:** placement, retries,
    checkpoint-aware recovery and task distribution.
3.  **Universal compute control plane:** common interface across cloud
    GPUs, specialist GPU clouds and other compatible compute.
4.  **Autonomous compute procurement:** policy-authorized agents
    negotiate or choose among compatible offers and execute plans.
5.  **Global compute coordination network:** coordinate compute around
    cost, performance, availability, geography, reliability,
    energy/carbon and customer policy.

The enduring product abstraction is a customer specifying **what outcome
is needed and under which constraints**, while Kynetic AI decides how to
achieve it across available infrastructure.

------------------------------------------------------------------------

## 17. IDE / Coding-Agent Instructions

This document is a product and architecture brief. It is not permission
to implement every phase at once.

### First task for the IDE

1.  Inspect the existing repository, file tree, framework, dependencies,
    current implementation, tests, and environment setup.
2.  Identify what already exists before creating or replacing files.
3.  Summarize the current architecture and gaps against this overview.
4.  Propose a staged implementation plan for the **Phase 1 MVP only**.
5.  Preserve working code and existing design patterns unless there is a
    clear technical reason to change them.
6.  Do not implement the Digital Twin, automated arbitrage, or universal
    checkpoint system fully before the base workload, cost, and policy
    models are reliable.

### Implementation rules

-   Do not claim an integration works unless it has been implemented and
    tested.
-   Do not fabricate provider prices, capacity, benchmarks, or runtime
    predictions.
-   Clearly label mock/demo data and isolate it from production data
    paths.
-   Use typed schemas, input validation, error handling and structured
    logs.
-   Keep secrets out of source control, logs and client-side code.
-   Use dry-run mode for infrastructure actions until approval and
    policy handling are implemented.
-   Add unit tests for calculations and policy decisions, integration
    tests for adapters, and end-to-end tests for a supported workload.
-   Document required environment variables in `.env.example` with
    placeholders only.
-   Add database migrations for schema changes.
-   Keep UI states for loading, empty, error, stale data and
    low-confidence estimates.
-   Never imply a job can migrate safely unless the specific workload
    adapter and target compatibility have been validated.
-   Do not build a large microservice system prematurely; prefer modular
    components initially.
-   Report changed files, implementation choices, test results,
    limitations and next steps after each phase.

### Phase 1 acceptance checklist

-   [ ] Repository and architecture inspected before edits.
-   [ ] Workload manifest can be created and validated.
-   [ ] Provider candidates are drawn from real integrations or clearly
    labelled fixtures.
-   [ ] Candidate filtering respects hard constraints.
-   [ ] Cost estimates show assumptions, data freshness and known
    unknowns.
-   [ ] Plan preview is non-destructive and does not incur provider
    spend.
-   [ ] Any billable action is gated by explicit authorization.
-   [ ] Run status and actual usage can be recorded.
-   [ ] Predicted and actual costs are distinguishable.
-   [ ] Core calculation and policy logic has tests.
-   [ ] Security, setup and limitations are documented.

------------------------------------------------------------------------

## 18. Glossary

-   **Workload:** A defined compute task or application execution.
-   **Workload manifest:** Structured description of the workload,
    requirements and constraints.
-   **Compute offer:** A provider-specific hardware/configuration and
    pricing option.
-   **Cost-to-completion:** Expected total cost to finish a workload,
    not just an hourly rate.
-   **Digital Twin:** A predictive performance/cost model grounded in
    workload and benchmark observations.
-   **Compute arbitrage:** Policy-constrained selection or replanning to
    a more economical compatible compute option.
-   **Checkpoint:** A recoverable snapshot of application/framework
    progress.
-   **Resume:** Continue a supported workload from a validated
    checkpoint.
-   **Provider adapter:** Integration that normalizes provider-specific
    APIs and capabilities.
-   **Estimated savings:** Predicted savings relative to a defined
    baseline.
-   **Verified savings:** Savings supported by actual usage/cost data
    and agreed baseline methodology.
-   **Hard constraint:** A requirement that must not be violated, such
    as data region or budget cap.
-   **Idempotency:** Repeating an operation does not create unintended
    duplicate effects.

------------------------------------------------------------------------

## 19. Final Product Principle

**Build Kynetic AI as an intelligent compute scheduler with a
marketplace attached---not as a marketplace that hopes to add
intelligence later.**

Start with trustworthy workload-level cost intelligence, validate value
with paying customers, then add measured performance prediction, safe
checkpoint/resume for selected workloads, and finally policy-controlled
compute arbitrage. The platform should earn the right to automate more
as its predictions, integrations, and recovery behavior become
demonstrably reliable.

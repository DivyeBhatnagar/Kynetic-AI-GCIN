# Kynetic AI — Backend Engine

Intelligent compute scheduling, workload orchestration, and multi-provider execution control plane.

Built as a **modular monolith** with Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, and PostgreSQL/SQLite with Redis caching and multi-instance load balancing readiness.

---

## Architecture Highlights

1. **Intelligent Scheduler with Attached Marketplace:** Workload contracts and hard constraints (VRAM, GPU count, region, budget) are evaluated first; candidates are filtered transparently before ranking.
2. **Side-Effect-Free Planning:** Manifest validation, candidate comparison, and dry-run cost estimation never provision compute or incur provider charges.
3. **Multi-Tenant Security:** Every private route enforces organization-scoped tenancy (`verify_tenant_access`) and RBAC (`OWNER`, `ADMIN`, `DEVELOPER`, `VIEWER`).
4. **Idempotency & Budget Safeguards:** Billable resource launches require an `Idempotency-Key` header and acquire an atomic budget reservation hold before acquiring provider resources.
5. **Exact Financial Math:** All currency values are calculated and persisted using Python `Decimal` and SQL `Numeric(14, 4)`, eliminating floating-point rounding errors.
6. **Centralized Redis Caching with Graceful Fallback:** High-throughput cache-aside service (`app/core/cache.py`) supporting Redis with bounded in-memory fallback. Transparently degrades if Redis is offline without crashing the API.
7. **Database Indexing & Query Optimization:** 19 composite indexes targeting frequent join, filter, sort, and pagination patterns across workloads, runs, plans, offers, ledger, audit, checkpoints, and arbitrage.
8. **Horizontal Scaling Readiness:** Completely stateless application replicas. Safe connection pooling, graceful startup/shutdown via FastAPI `lifespan`, correlation IDs (`X-Request-ID`), response timing (`X-Response-Time-Ms`), and instance tagging (`X-Instance-ID`).
9. **Rate Limiting & Concurrency Throttling:** Sliding-window rate limiter protecting control plane endpoints with HTTP 429 and `Retry-After` headers.
10. **Secrets Safety:** Raw cloud credentials are never stored in database tables or logs. Database records store opaque `secret_reference` identifiers, and all loggers run automated JSON secret redactors.

---

## Directory Structure

```text
backend/
├── app/
│   ├── main.py                     # FastAPI application factory, lifespan, middleware, CORS
│   ├── api/
│   │   ├── deps.py                 # Auth context, RBAC and tenant scoping
│   │   └── v1/                     # Versioned API endpoints
│   │       ├── health.py           # /health/live, /health/ready, and /health/metrics
│   │       ├── organizations.py    # /v1/organizations, memberships
│   │       ├── projects.py         # /v1/projects, project policies (paginated)
│   │       ├── providers.py        # /v1/providers, compute-offers (cached & paginated)
│   │       ├── workloads.py        # /v1/workloads, revisions, manifest validation (paginated)
│   │       ├── planning.py         # /v1/workloads/{id}/plans, dry-run estimates, approvals
│   │       ├── runs.py             # /v1/runs (list & get), idempotent launch, state machine
│   │       ├── ledger.py           # /v1/runs/{id}/cost, immutable cost ledger, reconciliation
│   │       ├── checkpoints.py      # /runs/{id}/checkpoints, validation, resumption (paginated)
│   │       ├── arbitrage.py        # /runs/{id}/arbitrage, market scanning, execution (paginated)
│   │       ├── predictions.py      # /v1/workloads/{id}/predict, digital twin history (paginated)
│   │       └── audit.py            # /v1/audit-events (paginated)
│   ├── core/
│   │   ├── config.py               # Pydantic BaseSettings (DB pooling, Redis, rate limiting)
│   │   ├── cache.py                # Centralized CacheService (Redis + in-memory fallback)
│   │   ├── rate_limit.py           # Sliding-window rate limiter middleware
│   │   ├── security.py             # Roles, RBAC permissions, token verification
│   │   ├── logging.py              # Structured JSON logging with secret redactor
│   │   └── errors.py               # Standard domain errors and error envelope
│   ├── domain/
│   │   ├── common.py               # Money (Decimal), Currency, SourceType
│   │   ├── workloads/manifest.py   # WorkloadManifest, validation, digest, fingerprint
│   │   ├── planning/
│   │   │   ├── cost_engine.py      # Transparent cost estimation with unknown charge detection
│   │   │   └── candidate_evaluator.py # Two-stage candidate selection (hard constraints -> ranking)
│   │   ├── execution/
│   │   │   └── state_machine.py    # Validated RunStateMachine lifecycle
│   │   ├── digital_twin/           # Empirical benchmark registry, scaling predictor
│   │   ├── checkpoints/            # SafeTensors verification, ZeRO VRAM math, transfer estimator
│   │   └── arbitrage/              # Anti-oscillation guards, economics, preemption override
│   ├── ports/
│   │   └── provider_adapter.py     # ProviderAdapter Protocol and data types
│   └── adapters/
│       ├── persistence/
│       │   ├── database.py         # SQLAlchemy async engine, session factory, pool tuning
│       │   └── models.py           # Relational ORM models with composite performance indexes
│       └── providers/
│           ├── registry.py         # Dynamic multi-cloud ProviderRegistry
│           ├── fake_provider.py    # Deterministic simulated provider adapter
│           ├── runpod_adapter.py   # RunPod GraphQL adapter
│           ├── lambda_adapter.py   # Lambda Labs Cloud API adapter
│           ├── aws_adapter.py      # AWS EC2 compute adapter
│           ├── gcp_adapter.py      # GCP Compute Engine adapter
│           └── azure_adapter.py    # Azure Virtual Machines adapter
├── migrations/                     # Alembic migration environment
│   ├── env.py
│   └── versions/                   # Versioned schema & index migrations
├── tests/
│   ├── conftest.py                 # Async test fixtures, StaticPool DB, and cache reset
│   ├── unit/                       # Unit tests (cache, rate limiter, models, cost engine, evaluator)
│   ├── integration/                # Integration tests (health, pagination, caching, tenant isolation)
│   ├── e2e/                        # Complete vertical slice test
│   └── load/
│       ├── run_benchmarks.py       # Standalone reproducible async benchmark runner
│       └── locustfile.py           # Locust distributed load test scenario
├── pyproject.toml
├── alembic.ini
├── .env.example
├── Dockerfile
└── README.md
```

---

## Database Composite Index Inventory

The following versioned indexes (`migrations/versions/3d7450407dd4_add_performance_and_composite_indexes.py`) optimize frequently queried joins, status filters, and time-series orderings:

| Table | Index Name | Columns | Rationale / Query Pattern |
|---|---|---|---|
| `compute_offers` | `ix_compute_offers_provider_region` | `(provider_id, region_id)` | Fast lookup by provider & region |
| `compute_offers` | `ix_compute_offers_gpu_vram` | `(gpu_model, gpu_memory_gb)` | Accelerates candidate filtering by hardware spec |
| `price_observations` | `ix_price_obs_offer_observed` | `(compute_offer_id, observed_at)` | Latest price observation queries |
| `price_observations` | `ix_price_obs_offer_freshness` | `(compute_offer_id, freshness_status)` | Active freshness filtering |
| `workloads` | `ix_workloads_org_proj_created` | `(organization_id, project_id, created_at)` | Paginated workload listing per project |
| `workloads` | `ix_workloads_org_status` | `(organization_id, status)` | Fast active workload filtering |
| `plans` | `ix_plans_org_status_created` | `(organization_id, status, created_at)` | Plan approval and state lookups |
| `plans` | `ix_plans_proj_created` | `(project_id, created_at)` | Project plan history |
| `plan_candidates` | `ix_plan_candidates_plan_rank` | `(plan_id, rank)` | Candidate display ordering |
| `plan_candidates` | `ix_plan_candidates_plan_eligibility` | `(plan_id, eligibility_status)` | Eligible candidate retrieval |
| `budget_reservations` | `ix_budget_res_org_status_expires` | `(organization_id, status, expires_at)` | Expired budget hold sweeps |
| `runs` | `ix_runs_org_status_created` | `(organization_id, status, created_at)` | Paginated run filtering by state |
| `runs` | `ix_runs_proj_created` | `(project_id, created_at)` | Project execution listing |
| `run_state_events` | `ix_run_events_run_created` | `(run_id, created_at)` | Chronological audit trail in `get_run` |
| `cost_ledger_entries` | `ix_ledger_org_run_effective` | `(organization_id, run_id, effective_at)` | Per-run financial ledger aggregation |
| `audit_events` | `ix_audit_org_action_created` | `(organization_id, action, created_at)` | Security event filtering |
| `predictions` | `ix_predictions_org_rev_created` | `(organization_id, workload_revision_id, created_at)` | Digital twin revision history |
| `checkpoints` | `ix_checkpoints_run_verified_step` | `(run_id, is_verified, step_number)` | Fast recovery checkpoint lookup |
| `arbitrage_opportunities` | `ix_arbitrage_org_status_created` | `(organization_id, status, created_at)` | Pending migration candidate triage |

---

## Measured Performance & Benchmarks

The benchmark runner (`tests/load/run_benchmarks.py`) measures asynchronous throughput and percentile latencies:

```text
======================================================================
KYNETIC AI BACKEND BENCHMARK & PERFORMANCE MEASUREMENT SUITE
======================================================================

BENCHMARK RESULTS TABLE:
Scenario                           | Reqs  | RPS      | p50(ms)  | p95(ms)  | p99(ms)  | Errors
----------------------------------------------------------------------------------------
Health Liveness Probe              | 200   | 2549.9   | 4.15     | 17.25    | 17.72    | 0
Provider Catalog (Cold Cache)      | 1     | 54.2     | 18.28    | 18.28    | 18.28    | 0
Provider Catalog (Warm Cache)      | 200   | 2101.9   | 6.44     | 22.77    | 23.07    | 0
Compute Offers (Cold Cache)        | 1     | 839.7    | 1.08     | 1.08     | 1.08     | 0
Compute Offers (Warm Cache)        | 200   | 1925.2   | 8.98     | 9.56     | 9.70     | 0
Workload Listing (Indexed DB)      | 100   | 1133.6   | 7.62     | 19.02    | 23.59    | 0

CACHE EFFICIENCY SUMMARY:
Catalog Cache Hit Ratio: 99.5% (Hits: 200, Misses: 1)
Offers Cache Hit Ratio:  99.5% (Hits: 200, Misses: 1)
======================================================================
```

---

## Getting Started

### Prerequisites

- Python 3.11 or 3.12
- PostgreSQL 14+ (or SQLite for local development and unit tests)
- Redis 7+ (Optional: automatically falls back to in-memory cache if not present)

### Local Setup

1. **Create and activate a virtual environment:**
   ```bash
   python3.12 -m venv .venv
   source .venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install --upgrade pip setuptools
   pip install -e ".[dev]"
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

4. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

5. **Start local development server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

---

## Running Automated Tests & Benchmarks

Run the full automated test suite (66 tests):

```bash
pytest -v
```

Run test suite with test coverage report:

```bash
pytest --cov=app --cov-report=term-missing
```

Run reproducible performance benchmarks:

```bash
python tests/load/run_benchmarks.py
```

Run Locust load tests:

```bash
locust -f tests/load/locustfile.py --host=http://localhost:8000
```

---

## Multi-Instance Load Balancing Deployment

To run a multi-instance cluster locally with Docker Compose:

```bash
docker compose up --build
```

This starts:
- `kynetic-postgres`: PostgreSQL 16 database with persistent volume
- `kynetic-redis`: Redis 7 caching service with LRU eviction
- `kynetic-migration`: Controlled one-off Alembic migration container
- `kynetic-backend-1`: FastAPI instance 1 (`INSTANCE_ID=backend-replica-1`)
- `kynetic-backend-2`: FastAPI instance 2 (`INSTANCE_ID=backend-replica-2`)
- `kynetic-lb`: Nginx reverse proxy load balancing traffic across both replicas on port 80

---

## Core API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health/live` | Process liveness probe (instance ID, uptime) |
| `GET` | `/health/ready` | Deep readiness probe (DB check, cache check; HTTP 503 if down) |
| `GET` | `/health/metrics` | Observability metrics (cache hits, latency, pool config) |
| `POST` | `/v1/organizations` | Create tenant organization |
| `GET` | `/v1/organizations` | List caller's organizations |
| `POST` | `/v1/projects` | Create project with policy and spend limits |
| `GET` | `/v1/projects` | List caller's projects (paginated) |
| `GET` | `/v1/providers` | List compute providers and capabilities (cached) |
| `GET` | `/v1/compute-offers` | List normalized GPU offers (cached & paginated) |
| `POST` | `/v1/providers/{key}/sync-offers` | Pull live pricing & invalidate stale caches |
| `POST` | `/v1/provider-connections` | Securely register provider account (secret reference only) |
| `POST` | `/v1/workloads/validate-manifest` | Validate manifest syntax, security, and derive fingerprint |
| `POST` | `/v1/workloads` | Create workload and immutable revision 1 |
| `GET` | `/v1/workloads` | List tenant workloads (paginated, indexed) |
| `POST` | `/v1/workloads/{id}/plans` | Generate side-effect-free dry-run execution plan |
| `GET` | `/v1/plans/{id}` | Inspect plan, ranked candidates, assumptions, and warnings |
| `POST` | `/v1/plans/{id}/approve` | Approve plan requiring administrative review |
| `POST` | `/v1/plans/{id}/launch` | Launch run from plan (enforces `Idempotency-Key` and budget hold) |
| `GET` | `/v1/runs` | List tenant runs (paginated, indexed, status-filtered) |
| `GET` | `/v1/runs/{id}` | Inspect run lifecycle status and append-only state events |
| `POST` | `/v1/runs/{id}/cancel` | Request graceful cancellation and release compute resources |
| `GET` | `/v1/runs/{id}/logs` | Fetch container logs without exposing control plane credentials |
| `GET` | `/v1/runs/{id}/cost` | Inspect cost ledger (estimates vs actuals) |
| `POST` | `/v1/runs/{id}/reconcile` | Append accrued usage observation to immutable ledger |
| `GET` | `/v1/audit-events` | Query tenant audit events (paginated) |
| `POST` | `/runs/{run_id}/checkpoints` | Register checkpoint and verify SafeTensors header & SHA-256 |
| `GET` | `/runs/{run_id}/checkpoints` | List run checkpoints (paginated) |
| `POST` | `/runs/{run_id}/arbitrage/scan` | Scan real-time cross-cloud market for migration opportunities |
| `GET` | `/runs/{run_id}/arbitrage/opportunities` | List evaluated arbitrage candidates (paginated) |
| `POST` | `/arbitrage/opportunities/{id}/execute` | Idempotently resume on cost-optimal target cloud |

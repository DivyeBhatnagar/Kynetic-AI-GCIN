# Kynetic AI — Backend Engine

Intelligent compute scheduling, workload orchestration, and multi-provider execution control plane.

Built as a **modular monolith** with Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, and PostgreSQL.

---

## Architecture Highlights

1. **Intelligent Scheduler with Attached Marketplace:** Workload contracts and hard constraints (VRAM, GPU count, region, budget) are evaluated first; candidates are filtered transparently before ranking.
2. **Side-Effect-Free Planning:** Manifest validation, candidate comparison, and dry-run cost estimation never provision compute or incur provider charges.
3. **Multi-Tenant Security:** Every private route enforces organization-scoped tenancy (`verify_tenant_access`) and RBAC (`OWNER`, `ADMIN`, `DEVELOPER`, `VIEWER`).
4. **Idempotency & Budget Safeguards:** Billable resource launches require an `Idempotency-Key` header and acquire an atomic budget reservation hold before acquiring provider resources.
5. **Exact Financial Math:** All currency values are calculated and persisted using Python `Decimal` and SQL `Numeric(14, 4)`, eliminating floating-point rounding errors.
6. **Provider Abstraction Layer:** Stable `ProviderAdapter` protocol with explicit capability declarations and a deterministic `FakeProviderAdapter` for hermetic testing. All simulated offers and prices are explicitly marked `source_type="SIMULATED"`.
7. **Secrets Safety:** Raw cloud credentials are never stored in database tables or logs. Database records store opaque `secret_reference` identifiers, and all loggers run automated JSON secret redactors.

---

## Directory Structure

```text
backend/
├── app/
│   ├── main.py                     # FastAPI application factory, middleware, CORS
│   ├── api/
│   │   ├── deps.py                 # Auth context, RBAC and tenant scoping
│   │   └── v1/                     # Versioned API endpoints
│   │       ├── health.py           # /health/live and /health/ready
│   │       ├── organizations.py    # /v1/organizations, memberships
│   │       ├── projects.py         # /v1/projects, project policies
│   │       ├── providers.py        # /v1/providers, compute-offers, provider-connections
│   │       ├── workloads.py        # /v1/workloads, revisions, manifest validation
│   │       ├── planning.py         # /v1/workloads/{id}/plans, dry-run estimates, approvals
│   │       ├── runs.py             # /v1/runs, idempotent launch, state machine, logs
│   │       ├── ledger.py           # /v1/usage, cost ledger, reconciliation
│   │       └── audit.py            # /v1/audit-events
│   ├── core/
│   │   ├── config.py               # Pydantic BaseSettings (.env loading)
│   │   ├── security.py             # Roles, RBAC permissions, token verification
│   │   ├── logging.py              # Structured JSON logging with secret redactor
│   │   └── errors.py               # Standard domain errors and error envelope
│   ├── domain/
│   │   ├── common.py               # Money (Decimal), Currency, SourceType
│   │   ├── workloads/manifest.py   # WorkloadManifest, validation, digest, fingerprint
│   │   ├── planning/
│   │   │   ├── cost_engine.py      # Transparent cost estimation with unknown charge detection
│   │   │   └── candidate_evaluator.py # Two-stage candidate selection (hard constraints -> ranking)
│   │   └── execution/
│   │       └── state_machine.py    # Validated RunStateMachine lifecycle
│   ├── ports/
│   │   └── provider_adapter.py     # ProviderAdapter Protocol and data types
│   └── adapters/
│       ├── persistence/
│       │   ├── database.py         # SQLAlchemy async engine, session factory, Base
│       │   └── models.py           # Relational ORM models
│       └── providers/
│           └── fake_provider.py    # Deterministic simulated provider adapter
├── migrations/                     # Alembic migration environment
│   ├── env.py
│   └── versions/
│       └── 10e28eca61ee_initial_schema.py
├── tests/
│   ├── conftest.py                 # Async test fixtures and in-memory test DB
│   ├── unit/                       # Unit tests for manifest, cost engine, evaluator, state machine
│   ├── integration/                # Provider contract and cross-tenant isolation tests
│   └── e2e/                        # Complete vertical slice test
├── pyproject.toml
├── alembic.ini
├── .env.example
├── Dockerfile
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.11 or 3.12
- PostgreSQL 14+ (or SQLite for local development and unit tests)

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

6. **Interactive Documentation:**
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`
   - OpenAPI Schema: `http://localhost:8000/openapi.json`

---

## Running Automated Tests

Run the full test suite with verbose output:

```bash
pytest -v
```

Run test suite with test coverage report:

```bash
pytest --cov=app --cov-report=term-missing
```

---

## Core API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health/live` | Process liveness probe |
| `GET` | `/health/ready` | Database connectivity readiness probe |
| `POST` | `/v1/organizations` | Create tenant organization |
| `GET` | `/v1/organizations` | List caller's organizations |
| `POST` | `/v1/projects` | Create project with policy and spend limits |
| `GET` | `/v1/providers` | List compute providers and capabilities |
| `GET` | `/v1/compute-offers` | List normalized GPU offers (H100, A100, L40S) with pricing |
| `POST` | `/v1/provider-connections` | Securely register provider account (secret reference only) |
| `POST` | `/v1/workloads/validate-manifest` | Validate manifest syntax, security, and derive fingerprint |
| `POST` | `/v1/workloads` | Create workload and immutable revision 1 |
| `POST` | `/v1/workloads/{id}/plans` | Generate side-effect-free dry-run execution plan |
| `GET` | `/v1/plans/{id}` | Inspect plan, ranked candidates, assumptions, and warnings |
| `POST` | `/v1/plans/{id}/approve` | Approve plan requiring administrative review |
| `POST` | `/v1/plans/{id}/launch` | Launch run from plan (enforces `Idempotency-Key` and budget hold) |
| `GET` | `/v1/runs/{id}` | Inspect run lifecycle status and append-only state events |
| `POST` | `/v1/runs/{id}/cancel` | Request graceful cancellation and release compute resources |
| `GET` | `/v1/runs/{id}/logs` | Fetch container logs without exposing control plane credentials |
| `GET` | `/v1/runs/{id}/cost` | Inspect cost ledger (estimates vs actuals) |
| `POST` | `/v1/runs/{id}/reconcile` | Append accrued usage observation to immutable ledger |
| `GET` | `/v1/audit-events` | Query tenant audit events |

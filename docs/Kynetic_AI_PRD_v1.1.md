_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

#### **PRODUCT REQUIREMENTS DOCUMENT** 

# **Global Compute Intelligence Network** 

From GPU discovery to intelligent, workload-aware compute orchestration 

##### **PRODUCT THESIS** 

A software-first network that helps developers and businesses discover, provision, operate and optimise compute across multiple infrastructure providers. The long-term differentiator is workload intelligence: predicting where workloads should run based on cost, performance, reliability, compatibility, data locality and policy. 

|**Field**|**Definition**|
|---|---|
|Document status|Product strategy and MVP specification — Draft v1.0|
|Product name|Working title: Kynetic AI (Kynetic AI)|
|Product category|Compute marketplace + orchestration + optimisation|
|Primary launch market|AI developers, startups and research teams with repeat GPU<br>workloads|
|Initial business model|Provider marketplace and software-led orchestration; no<br>owned data centres required|
|Prepared|25 October 2026|



_Planning note: this PRD defines a proposed product direction. Market sizes, pricing, delivery dates and performance targets are hypotheses to validate, not guaranteed outcomes._ 

Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

## **Document Control** 

|**Version**|**Date**|**Change summary**|**Status**|
|---|---|---|---|
|0.1|25 Oct 2026|Initial product thesis, MVP<br>scope, requirements,<br>architecture and success<br>metrics|Draft|
|1.0|After customer discovery|To be updated with validated<br>ICP, provider agreements,<br>pricing and launch criteria|Planned|



### **How to use this PRD** 

This document is intended to align product, engineering, design, infrastructure, security and go-to-market work. It separates the launchable MVP from the long-term vision so the team can validate demand before investing in a broad orchestration network. 

## **Contents** 

- 1. Executive Summary 

- 2. Vision, Mission and Product Principles 

- 3. Problem Statement and Market Context 

- 4. Target Users and Jobs to Be Done 

- 5. Product Strategy and Scope 

- 6. User Journeys 

- 7. Functional Requirements 

- 8. Non-Functional Requirements 

- 9. Intelligence and Scheduling Design 

- 10. System Architecture and Data Model 

- 11. API and Integration Requirements 

- 12. Security, Privacy and Trust 

- 13. Billing and Commercial Model 

- 14. Metrics and Analytics 

- 15. Rollout Plan and Acceptance Criteria 

- 16. Risks, Dependencies and Open Questions 

- 17. Long-Term 100x Vision 

- Appendices: Glossary and Requirement Priority 

Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

## **1. Executive Summary** 

The Kynetic AI (Kynetic AI) is a proposed software platform for discovering, provisioning and optimising compute across multiple providers. It begins as a curated GPU marketplace and unified deployment layer, then develops into a workloadaware intelligence engine that recommends or selects suitable infrastructure. 

The product will not own data centres in its initial model. It will integrate with existing GPU cloud providers and, only when operationally mature, additional qualified infrastructure sources. Customers interact with Kynetic AI through a web dashboard and API/CLI; provider-specific complexity is hidden behind a common workload and resource model. 

##### **ONE-LINE VALUE PROPOSITION** 

Tell us what you want to run and the constraints that matter. Kynetic AI helps you find a compatible compute option, deploy it through a consistent workflow, understand the true cost, and learn from actual execution outcomes. 

### **1.1 Product outcomes** 

- Reduce the time and technical effort required to find and deploy suitable GPU compute. 

- Make pricing and estimated total workload cost easier to compare across supported providers. 

- Provide a consistent workflow for provisioning, monitoring, stopping and billing workloads. 

- Build a reliable dataset of observed workload performance, cost and provider reliability. 

- Use evidence-based recommendations to improve cost, completion time or reliability without violating user constraints. 

### **1.2 MVP definition** 

The MVP supports a limited number of verified GPU providers and a narrow set of containerised AI workloads. It includes provider catalogue ingestion, project and budget controls, deployment through provider adapters, status/usage visibility, cost tracking, and rule-based recommendations. Automatic cross-provider migration, arbitrary distributed training, homePC compute, a public third-party host marketplace, and fully autonomous procurement are explicitly outside the MVP. 

### **1.3 Product thesis** 

A marketplace alone is vulnerable to price competition and disintermediation. Kynetic AI must earn continued use by owning the workflow: deployment, observability, cost control, policy enforcement and workload-specific intelligence. The defensible asset is not a static catalogue; it is the combination of integrations, customer workflow, observed execution data and demonstrably better placement decisions. 

## **2. Vision, Mission and Product Principles** 

### **2.1 Vision** 

Become the trusted intelligence and transaction layer through which AI workloads access the most suitable computing resources across a heterogeneous global ecosystem. 

### **2.2 Mission** 

Make compute selection and execution as straightforward as specifying an outcome, budget and constraints—while preserving customer control over security, cost, region and reliability. 

### **2.3 Long-term promise** 

“Run the right workload on the right infrastructure, with transparent cost and measurable outcomes.” 

Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

### **2.4 Product principles** 

- Workload-first, not GPU-first: recommend based on the task and constraints, not only hardware price. 

- Evidence before automation: start with rules and observed benchmarks; increase automation only when results are measurable. 

- Transparent trade-offs: show why an option is recommended and which constraints it satisfies. 

- Customer control: budgets, regions, data policies and allowed providers are hard constraints, not soft preferences. 

- No hidden lock-in: use portable workload packaging where feasible and disclose provider-specific dependencies. 

- Reliability over catalogue size: a small, well-understood provider network is better than many unreliable listings. 

- Security by default: isolate workloads, protect credentials and minimise data movement. 

- Asset-light by design: aggregate existing infrastructure before considering capacity commitments or owned hardware. 

### **2.5 Strategic non-goals** 

- Building or financing data centres in the MVP. 

- Claiming to support every GPU, accelerator, provider or workload. 

- Guaranteeing the lowest price or perfect uptime across third-party providers. 

- Automatically migrating every running job between providers. 

- Running untrusted workloads on consumer PCs in the initial release. 

- Replacing hyperscaler cloud platforms or all enterprise infrastructure management. 

- Allowing an AI agent to make unrestricted purchases or change security policy. 

## **3. Problem Statement and Market Context** 

### **3.1 Customer problem** 

Compute buyers face fragmented supply, inconsistent provider APIs, confusing hardware and software compatibility, uncertain total costs, and limited visibility into actual workload performance. Selecting the lowest advertised GPU-hour price does not necessarily minimise the cost of completing a job. 

### **3.2 Current workflow and friction** 

|**Step**|**Current friction**|**Kynetic AI opportunity**|
|---|---|---|
|Discover|Provider catalogues and availability are<br>fragmented|Normalised catalogue and searchable<br>constraints|
|Compare|Different pricing, billing units and add-on<br>charges|Comparable estimates of total workload cost|
|Configure|Different APIs, images, drivers, storage and<br>networking|Common workload specification and<br>provider adapters|
|Operate|Monitoring and logs vary by provider|Unified lifecycle status and basic<br>observability|
|Control spend|Budget surprises and forgotten running<br>instances|Budgets, usage alerts, shutdown controls<br>and cost attribution|
|Learn|Actual performance data is not<br>systematically compared|Workload benchmark history and placement<br>recommendations|



### **3.3 Why now** 

AI workloads span training, fine-tuning, batch processing, inference, rendering and agent execution. These workloads have different requirements for GPU memory, throughput, latency, reliability, data locality and cost. The opportunity is to make 

Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

###### _GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

infrastructure choice and operation more workload-aware. The market is competitive, so the product must validate a specific customer pain rather than rely on general AI infrastructure growth. 

### **3.4 Initial problem hypothesis** 

##### **HYPOTHESIS TO VALIDATE** 

Small AI teams that use more than one GPU provider—or are willing to consider alternatives—will pay for a simpler way to deploy workloads, control spending and identify a better compute option. This hypothesis must be tested through interviews and paid pilots before expanding scope. 

## **4. Target Users and Jobs to Be Done** 

|**Persona**|**Needs / jobs**|**Initial priority**|
|---|---|---|
|AI developer / ML engineer|Deploy training, fine-tuning or batch<br>inference without learning every provider's<br>workflow; understand cost and failures.|Primary|
|Startup CTO / technical founder|Control compute budget, avoid vendor lock-<br>in where feasible, and make reliable<br>deployments repeatable.|Primary|
|Researcher / lab engineer|Run experiments with compatible hardware<br>and track usage across projects.|Secondary|
|Platform / DevOps engineer|Manage multiple providers, policies, access,<br>logs, quotas and operational reliability.|Later|
|GPU provider operator|Expose capacity, receive qualified demand,<br>integrate provisioning and get accurate<br>usage/payout records.|Supply partner|
|Enterprise security / procurement owner|Enforce approved providers, regions,<br>security controls, spend limits and<br>auditability.|Later|



### **4.1 Primary ideal customer profile (ICP)** 

- Small AI startups, independent developers and technical teams with recurring GPU workloads. 

- Teams whose workloads can be containerised and whose data/security requirements can be met by supported providers. 

- Customers with enough compute spend or operational friction to justify a platform fee or marketplace margin. 

- Early customers willing to work with a curated set of providers rather than expecting universal coverage. 

### **4.2 Jobs to be done** 

- When I have a workload, help me identify compatible compute options and their expected total cost. 

- When I select an option, deploy it without requiring me to learn the provider's entire platform. 

- While it runs, show status, logs, usage and accumulated cost in one place. 

- Before I exceed my budget, alert me or stop the workload according to my configured policy. 

- After completion, show actual runtime, cost and performance so I can make a better decision next time. 

Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

## **5. Product Strategy and Scope** 

### **5.1 Product phases** 

|**Phase**|**Product capability**|**Exit evidence**|
|---|---|---|
|Phase 0: Validation|Interviews, provider API review, workload<br>tests, manual cost comparisons|At least 3 design partners, provider access,<br>one repeated paid use case|
|Phase 1: Marketplace MVP|Curated catalogue, provider status,<br>deployment, usage and cost visibility|Customers complete paid deployments and<br>return|
|Phase 2: Operating layer|Common templates, logs, lifecycle controls,<br>quotas and better failure handling|Repeat deployments through the same<br>workflow|
|Phase 3: Intelligence|Workload benchmarks, cost/performance<br>estimates, explainable recommendations|Measured improvement versus customer<br>baseline|
|Phase 4: Autonomous coordination|Policy-bound placement and approved<br>procurement; broader infrastructure sources|Reliable execution with security, economics<br>and governance proven|



### **5.2 MVP in scope** 

- Account, workspace, project and API key management. 

- Curated, provider-sourced GPU catalogue with last-updated timestamps. 

- Normalised resource fields: accelerator model, VRAM, CPU, RAM, storage, region, price unit and provider. 

- Provider availability and supported deployment templates where available. 

- Workload submission with image/template, resource requirements, region and budget constraints. 

- Provider adapter to create, inspect and stop supported instances/jobs. 

- Workload lifecycle state, basic logs/metrics links and usage records. 

- Estimated and accrued cost display, budget thresholds and user notifications. 

- Rule-based recommendation ranking for supported options. 

- Provider health and workload outcome records for future intelligence. 

- Admin tools for provider onboarding, support and incident review. 

### **5.3 Explicitly out of scope for MVP** 

- Unrestricted automatic migration of running stateful workloads. 

- Multi-node distributed training across providers. 

- Guaranteed SLA across third-party providers unless contractually supported. 

- A public permissionless marketplace for arbitrary hosts. 

- Consumer GPU sharing and untrusted bare-metal execution. 

- Automated purchasing without customer approval. 

- Complex enterprise procurement, custom invoicing and financing products. 

- A custom foundation model for workload scheduling; start with rules, heuristics and measured benchmarks. 

## **6. User Journeys** 

### **6.1 First deployment** 

1. User creates an account and workspace, accepts terms, and configures billing. 

2. User selects a workload template or enters hardware, region, budget and runtime requirements. 

3. Kynetic AI returns eligible options, with price estimates, compatibility notes, provider and data freshness. 

4. User reviews trade-offs and explicitly confirms the deployment. 

5. Kynetic AI submits the job to the selected provider and returns a unified job ID. 

Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

6. User monitors lifecycle status, usage and cost; can stop the job or receive budget alerts. 

7. On completion, Kynetic AI records actual usage and provides a concise execution summary. 

### **6.2 Returning user: recommendation** 

8. User selects a prior workload or submits a new one. 

9. Kynetic AI uses the workload specification and eligible historical observations to rank supported options. 

10. The recommendation explains expected cost, performance range, confidence and trade-offs. 

11. User accepts, edits constraints or selects a different provider. 

12. Actual results are compared with estimates and used to update the workload's history. 

### **6.3 Provider onboarding** 

13. Provider is reviewed and approved by an administrator. 

14. Provider supplies API credentials through a secure integration flow and defines supported regions/resources. 

15. Kynetic AI validates provisioning, status, metering, termination and error handling in a test environment. 

16. Provider listings are enabled with pricing source, refresh time and operational status. 

17. Ongoing health checks, incident records and customer outcomes influence provider eligibility. 

## **7. Functional Requirements** 

Priority definitions: P0 = required for MVP launch; P1 = important after core flow is stable; P2 = later capability. Acceptance criteria are testable release conditions. 

|**ID**|**Requirement**|**Priority**|**Description**|**Acceptance criteria**|
|---|---|---|---|---|
|FR-001|Identity and workspace|P0|Users can sign up,<br>authenticate, create a<br>workspace and manage<br>project membership.|A user can create a<br>workspace and access only<br>authorised projects.|
|FR-002|Role-based access|P0|Support workspace owner,<br>admin, developer and read-<br>only roles.|Unauthorised users cannot<br>view secrets, launch jobs or<br>change billing settings.|
|FR-003|Provider catalogue|P0|Show supported resources<br>with provider, region,<br>accelerator, VRAM, CPU,<br>RAM, price, availability and<br>freshness.|Each listing shows its source<br>and last refresh time; stale<br>data is flagged.|
|FR-004|Provider adapter|P0|Create, inspect and<br>terminate supported provider<br>resources through a<br>common internal interface.|Contract tests cover<br>success, timeout, retry,<br>provider error and<br>termination.|
|FR-005|Workload submission|P0|Submit a supported<br>container/template with<br>resource, region, budget and<br>data requirements.|Invalid or unsupported<br>requests fail before a paid<br>resource is created.|
|FR-006|Option comparison|P0|Compare eligible options<br>using price and compatibility<br>filters.|Only options satisfying hard<br>constraints are shown as<br>eligible.|
|FR-007|Deployment confirmation|P0|Require explicit confirmation<br>before starting billable<br>resources.|The user sees provider,<br>resource, price basis and<br>budget warning before<br>launch.|
|FR-008|Lifecycle tracking|P0|Expose pending,<br>provisioning, running,<br>stopping, completed, failed<br>and terminated states.|State transitions are<br>timestamped and<br>recoverable after refresh.|



Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

|**ID**<br>FR-009|**Requirement**<br>Cost and usage|**Priority**<br>P0|**Description**<br>Display estimated and<br>accrued usage cost using<br>provider data where<br>available.|**Acceptance criteria**<br>The UI distinguishes estimate<br>from final provider-reported<br>charge.|
|---|---|---|---|---|
|FR-010|Budget guardrails|P0|Support budget thresholds<br>and alerts; offer user-<br>configured stop behaviour<br>where safe and supported.|Threshold events are logged<br>and notifications are emitted.|
|FR-011|Workload history|P0|Store workload<br>configuration, provider,<br>timestamps, status and<br>usage summary.|User can inspect previous<br>deployments and their<br>outcomes.|
|FR-012|Logs and observability|P1|Expose provider logs or<br>supported log links and basic<br>workload metrics.|User can locate logs for<br>supported deployments<br>without switching between<br>multiple dashboards where<br>integration permits.|
|FR-013|Rule-based<br>recommendations|P0|Rank eligible options by<br>configured priorities such as<br>cost, performance proxy and<br>reliability.|Recommendation includes<br>reasons, assumptions and<br>known unknowns.|
|FR-014|Provider health|P1|Track provider API health,<br>recent provisioning failures<br>and stale inventory.|Unhealthy providers can be<br>excluded or marked with a<br>warning.|
|FR-015|Workload benchmarks|P1|Run or ingest benchmark<br>observations for selected<br>workload/hardware<br>combinations.|Benchmark record includes<br>workload version, hardware,<br>software environment and<br>timestamp.|
|FR-016|Admin console|P0|Approve providers, manage<br>adapter status, inspect<br>failures and support<br>customer issues.|Administrative actions are<br>authenticated and audit<br>logged.|
|FR-017|Notifications|P0|Notify users about<br>deployment failures, budget<br>thresholds and termination.|Notification delivery status is<br>recorded; duplicate<br>notifications are controlled.|
|FR-018|API/CLI access|P1|Provide documented<br>programmatic submission<br>and status retrieval for<br>supported operations.|API uses scoped credentials,<br>rate limits and consistent<br>errors.|
|FR-019|Audit trail|P0|Record sensitive actions,<br>deployments, policy changes<br>and billing-relevant events.|Audit events include actor,<br>timestamp, action and target<br>resource.|
|FR-020|Feedback loop|P1|Capture actual runtime,<br>cost, success/failure and<br>optional user feedback.|Records can be linked to<br>workload and provider<br>without exposing secrets.|



### **7.1 User interface requirements** 

|**Screen**|**Required elements**|
|---|---|
|Dashboard|Spend to date, active jobs, recent deployments, budget alerts,<br>provider incidents|
|Compute catalogue|Search/filter, hardware specs, region, price unit, availability,|



Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

|**Screen**|**Required elements**|
|---|---|
||freshness and provider|
|Workload builder|Template/image, resources, region, data/security constraints,<br>budget and estimated cost|
|Comparison view|Eligible options, estimated total cost, compatibility, performance<br>evidence, reliability signal and explanation|
|Deployment detail|Status timeline, provider reference, usage, accrued cost, logs, stop<br>action and events|
|History|Past jobs, outcome, runtime, actual cost and repeat/run-again action|
|Workspace settings|Members, roles, API keys, billing, budgets, policies and audit trail|
|Admin|Provider integration status, catalogue freshness, failures, customer<br>support and audit events|



## **8. Non-Functional Requirements** 

|**Area**|**Requirement / target for initial production**|
|---|---|
|Availability|Kynetic AI control plane target: 99.5% monthly availability after beta;<br>provider availability is separate and must not be represented as<br>Kynetic AI-controlled.|
|Latency|Catalogue and job-status API target p95 under 500 ms excluding slow<br>provider calls; use asynchronous jobs for provisioning.|
|Scalability|Support horizontal scaling of API, workers and telemetry ingestion; no<br>assumption of global hyperscale in MVP.|
|Reliability|Idempotent launch/stop operations, bounded retries, dead-letter<br>handling and reconciliation for provider state drift.|
|Data freshness|Show timestamps and source; refresh cadence is provider-specific<br>and visible to the user.|
|Security|TLS in transit, encryption at rest, least-privilege access, secret<br>vaulting, scoped API keys and audit logging.|
|Observability|Structured logs, metrics, traces, alerts, provider adapter health and<br>correlation IDs.|
|Maintainability|Provider adapters isolated behind versioned interfaces; contract<br>tests required before enabling a provider.|
|Portability|Prefer OCI-compatible containers and explicit workload manifests;<br>disclose provider-specific dependencies.|
|Accessibility|Keyboard navigability, legible contrast, meaningful status text and<br>responsive layouts.|
|Recovery|Backups and documented restore tests for platform metadata;<br>workload recovery depends on provider and user data persistence<br>choices.|
|Cost controls|Avoid unbounded retries or runaway provisioning; set internal spend<br>limits, quotas and kill switches.|



Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

_Targets are initial design goals and must be refined after architecture tests, provider contracts and beta usage. The platform must not imply that its own availability guarantees the availability of third-party compute._ 

## **9. Intelligence and Scheduling Design** 

### **9.1 Decision model** 

The intelligence engine should first filter options using hard constraints, then rank the remaining candidates using explicit preferences. A candidate that violates a required region, memory limit, security policy or budget ceiling must not be recommended simply because it is cheap. 

### **9.2 Hard constraints** 

- Supported workload/runtime and accelerator compatibility. 

- Minimum VRAM, CPU, RAM and storage requirements. 

- Approved provider and region / data-residency policy. 

- Maximum budget or spending limit. 

- Required availability class or service-level capability, if supported. 

- Data handling, network and access restrictions. 

- Customer allowlist/denylist and workload-specific restrictions. 

### **9.3 Ranking dimensions** 

|**Signal**|**Meaning**|**MVP treatment**|
|---|---|---|
|Estimated total cost|Compute + storage + egress + likely retries<br>where estimable|Primary signal; show assumptions and<br>uncertainty|
|Expected runtime|Predicted completion time for the<br>workload/configuration|Use benchmarks when available; otherwise<br>label as unknown/proxy|
|Reliability|Provider/API health and observed workload<br>success|Use recent, sample-size-aware indicators|
|Compatibility confidence|Evidence that the workload runs on the<br>option|Prefer validated templates and benchmarks|
|Data locality|Cost, latency and policy impact of moving<br>data|Apply as hard constraint or explicit penalty|
|Interruption risk|Chance that a job may stop unexpectedly, if<br>known|Avoid unsupported claims; label provider<br>class and evidence|
|Carbon / energy signal|Estimated impact where credible data exists|Future feature; never invent unavailable<br>measurements|



### **9.4 MVP ranking logic** 

Recommended initial approach: deterministic filtering and weighted ranking. For each candidate, first validate hard constraints; then calculate a transparent score from normalised cost, observed reliability, expected runtime and compatibility confidence. Weights should be configurable by objective (lowest cost, fastest, balanced, or reliability-first). If a signal is missing, the system must disclose the missing data and avoid treating an unknown as a good score. 

### **9.5 Later intelligence** 

- Workload fingerprinting using declared requirements and observed execution telemetry. 

Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

###### _GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

- Performance models trained on repeatable benchmarks, with confidence intervals and drift monitoring. 

- Cost prediction that includes provider pricing, storage, network transfer, startup time and failure/retry likelihood. 

- Context-aware multi-objective scheduling across cost, performance, reliability, latency, data locality and optional sustainability signals. 

- Safe policy-constrained automated placement and re-optimisation for workloads that support it. 

- A feedback loop comparing prediction with actual outcome, versioned to avoid silent model regressions. 

##### **IMPORTANT DESIGN RULE** 

Do not label a recommendation “optimal” unless the objective, constraints, candidate set and evidence are defined. Prefer “recommended based on current price and observed benchmarks” with a confidence/evidence explanation. 

## **10. System Architecture and Data Model** 

### **10.1 Logical components** 

|**Component**|**Responsibilities**|
|---|---|
|Web app|Account, catalogue, workload builder, comparison, deployments,<br>history, budgets and admin UI|
|API gateway / backend|Authentication, request validation, workspace policy, rate limiting<br>and orchestration|
|Identity and policy service|Users, roles, project permissions, provider allowlists and budget<br>policy|
|Provider adapter layer|Provider-specific inventory, provisioning, lifecycle and usage<br>interfaces|
|Catalogue service|Normalise provider inventory, pricing and availability with freshness<br>metadata|
|Scheduler / recommendation service|Filter hard constraints, score candidates, explain recommendations<br>and record decisions|
|Job orchestration workers|Asynchronous provisioning, retries, reconciliation, stop operations<br>and notifications|
|Telemetry and billing service|Ingest usage, calculate estimates, reconcile provider charges and<br>produce cost summaries|
|Data store|Relational metadata, event history, benchmark observations and<br>encrypted secret references|
|Observability stack|Logs, metrics, traces, alerts, audit events and service health|



### **10.2 Suggested initial technology choices** 

|**Layer**|**Candidate approach**|**Notes**|
|---|---|---|
|Frontend|Next.js / React / TypeScript|Responsive dashboard; shared types with<br>API where practical|
|Backend API|Python + FastAPI|Fits provider integrations and later workload<br>intelligence services|



Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

|**Layer**|**Candidate approach**|**Notes**|
|---|---|---|
|Database|PostgreSQL|Source of truth for users, projects, jobs,<br>provider metadata and billing records|
|Cache / queue|Redis + worker queue|Use for transient cache and async jobs;<br>define retry and idempotency semantics|
|Workload packaging|OCI containers and versioned templates|Standardise where feasible; validate provider<br>runtime support|
|Secrets|Managed secret store / vault|Never store provider credentials in plain text<br>or logs|
|Metrics|OpenTelemetry-compatible instrumentation|Correlate platform and provider-adapter<br>events|
|Deployment|Containerised services|Start modular; avoid premature microservice<br>sprawl|



### **10.3 Core data entities** 

|**Entity**|**Important fields**|**Purpose**|
|---|---|---|
|User|id, email, status, created_at|Identity|
|Workspace|id, name, owner_id, billing_profile_id|Tenant boundary|
|Project|id, workspace_id, policy_id, budget_id|Workload and spend grouping|
|Provider|id, name, status, integration_type,<br>terms_version|Provider registry|
|ProviderResource|provider_id, region, accelerator, VRAM, CPU,<br>RAM, storage, price, observed_at|Normalised catalogue|
|WorkloadSpec|image/template, resources, region<br>constraints, budget, data policy|Desired execution|
|Deployment|id, workload_spec_id, provider_id,<br>provider_job_id, state, timestamps|Execution record|
|UsageRecord|deployment_id, interval, resource quantities,<br>source, estimated/actual cost|Metering and billing|
|BenchmarkRun|workload fingerprint, hardware, software,<br>runtime, cost, result, timestamp|Performance evidence|
|Recommendation|candidate set, constraints, scores, rationale,<br>model/rules version|Explainable decision record|
|AuditEvent|actor, action, target, timestamp, metadata|Security and accountability|
|ProviderCredentialRef|provider_id, secret_ref, scope, rotation<br>metadata|Reference to encrypted credentials|



### **10.4 Key state model** 

Deployment state transitions should be explicit: requested → validating → queued → provisioning → running → stopping → terminated/completed, with failed and cancelled states as appropriate. Every transition should be timestamped. A 

Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

reconciliation worker must periodically compare Kynetic AI state with provider state to handle timeouts, missed callbacks and manual changes made directly in provider consoles. 

## **11. API and Integration Requirements** 

### **11.1 API design principles** 

- Version the public API and document request/response schemas. 

- Use idempotency keys for operations that can create billable resources. 

- Use asynchronous jobs for provider operations that may take longer than a normal API request. 

- Return stable Kynetic AI resource IDs and keep provider-specific IDs internal or separately exposed. 

- Apply scoped API keys, rate limits and workspace/project permissions. 

- Standardise error codes while retaining safe provider diagnostics. 

- Never expose provider credentials or sensitive infrastructure details in responses. 

### **11.2 Proposed initial endpoints** 

|**Method / endpoint**|**Purpose**|**Priority**|
|---|---|---|
|GET /v1/resources|Search normalised compute catalogue|P0|
|GET /v1/providers|List enabled providers and supported<br>capabilities|P0|
|POST /v1/recommendations|Evaluate workload constraints and return<br>ranked eligible options|P0|
|POST /v1/deployments|Create a deployment after validation and<br>confirmation|P0|
|GET /v1/deployments/{id}|Read deployment status, provider reference<br>and cost summary|P0|
|POST /v1/deployments/{id}/stop|Request workload stop/termination|P0|
|GET /v1/deployments/{id}/usage|Read estimated and provider-reported usage|P0|
|GET /v1/projects/{id}/budget|Read budget, spend and threshold state|P0|
|GET /v1/benchmarks|Read benchmark observations for supported<br>workloads|P1|
|POST /v1/provider-webhooks/{provider}|Receive signed provider lifecycle/usage<br>events|P1|



### **11.3 Provider adapter contract** 

Each adapter should implement capability discovery, inventory/pricing retrieval, deployment creation, deployment status, termination, usage retrieval and error mapping where the provider supports them. The adapter must declare unsupported capabilities explicitly. Provider contract tests must validate idempotency, timeouts, partial failures, pagination, rate limits, pricing freshness and termination semantics. 

Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

## **12. Security, Privacy and Trust** 

### **12.1 Threat model highlights** 

- Compromised user or API key launching expensive workloads. 

- Provider credential leakage through logs, client bundles or error traces. 

- Cross-tenant access to workload metadata, logs, secrets or billing. 

- Malicious container images or workload code. 

- Supply-side fraud, false hardware listings or manipulated availability. 

- Usage metering disputes and unauthorised termination. 

- Data exposure through storage reuse, snapshots or misconfigured network access. 

### **12.2 Minimum security controls** 

- TLS for all network communication and encryption at rest for sensitive data. 

- Provider credentials stored in a managed secret store, scoped to minimum permissions and rotated where supported. 

- Tenant isolation and role-based access control; never rely on UI hiding alone. 

- Strong separation of platform control plane and customer workload execution. 

- Container image validation and explicit supported runtime policies; avoid privileged execution by default. 

- Budget caps, quotas, rate limits and anomaly alerts to limit abuse and surprise charges. 

- Audit logs for deployment, stop, access, policy, credential and billing-related actions. 

- Signed and verified provider webhooks where supported. 

- Data retention, deletion and incident response policies documented before production launch. 

- Security review before introducing third-party hosts or workloads containing sensitive data. 

### **12.3 Privacy and data locality** 

Collect only the metadata needed to operate the platform and improve recommendations. Avoid ingesting customer datasets or model contents unless required and explicitly consented to. Region restrictions must be enforced as hard constraints when a customer specifies them. Any sustainability, compliance or data-residency claim must be backed by a defined data source and scope. 

### **12.4 Trust and provider verification** 

Provider onboarding should include business identity and contact verification, technical capability validation, test deployments, terms and pricing review, support escalation path, data-handling review and ongoing reliability monitoring. Provider scores should use transparent, sample-size-aware metrics and should not be presented as guarantees. 

## **13. Billing and Commercial Model** 

### **13.1 Initial monetisation options** 

|**Model**|**How it works**|**Recommendation**|
|---|---|---|
|Marketplace take rate|Kynetic AI earns a disclosed margin or<br>commission on usage purchased through the<br>platform.|Use only where provider agreements and<br>economics support it.|
|Usage-based platform fee|Customer pays a fee tied to managed<br>compute usage or deployments.|Possible after value and billing accuracy are<br>proven.|
|Orchestration subscription|Recurring fee for multi-provider deployment,<br>governance, cost controls and observability.|Strategically attractive as product matures.|
|Enterprise contract|Custom pricing for support, policies,<br>integrations and reporting.|Later; avoid bespoke work before product-<br>market evidence.|



Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

|**Model**|**How it works**|**Recommendation**|
|---|---|---|
|Capacity reservation / resale|Kynetic AI commits to capacity or resells<br>provider compute.|Avoid initially due to utilisation and working-<br>capital risk.|



### **13.2 Billing rules** 

- Clearly label list price, estimated cost, accrued estimate and final provider-reported cost. 

- State billing unit and whether startup, storage, egress, taxes or minimum charges are included. 

- Do not claim a price is guaranteed unless a provider contract supports that guarantee. 

- Record the source and timestamp of pricing data. 

- Define handling of provider credits, refunds, failed launches and disputed usage. 

- Provide cost exports and project-level attribution. 

- Show the user which actions can continue incurring charges after the UI session ends. 

## **14. Metrics and Analytics** 

### **14.1 North-star metric** 

##### **NORTH-STAR METRIC** 

Successful, repeat paid workloads managed through Kynetic AI per active customer per month. This balances actual value delivery, repeat usage and platform adoption better than raw sign-ups or catalogue size. 

### **14.2 Core KPI tree** 

|**Category**|**Metric**|**Why it matters**|
|---|---|---|
|Acquisition|Qualified developer accounts; activation rate|Whether the product reaches the intended<br>users|
|Activation|Time from account creation to first<br>successful deployment|Ease of first value|
|Reliability|Deployment success rate; provider API<br>failure rate|Operational trust|
|Retention|Repeat paid workload rate; 30/90-day cohort<br>retention|Recurring product value|
|Economics|Gross profit per customer; contribution<br>margin; take rate|Viability of the business model|
|Cost performance|Estimated vs actual cost error; customer<br>savings versus baseline|Evidence for intelligence value|
|Performance|Estimated vs actual runtime; completion-<br>time improvement|Quality of recommendations|
|Supply|Provider availability; catalogue freshness;<br>provider concentration|Marketplace health and resilience|
|Support|Support tickets per deployment; time to<br>resolution|Operational burden|
|Security|Abuse incidents; unauthorised actions;|Trust and risk|



Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

|**Category**|**Metric**<br>credential incidents|**Why it matters**|
|---|---|---|



### **14.3 Initial launch targets (hypotheses)** 

These are proposed gates for a controlled beta, not external benchmarks. Revisit them after collecting baseline data. 

|**Metric**|**Initial target hypothesis**|
|---|---|
|Design partners|3–5 teams actively testing real workloads|
|Supported providers|2–3 providers with validated deployment paths|
|First deployment|Median time under 30 minutes for supported templates, excluding<br>provider queue delays|
|Deployment success|At least 95% for supported, valid configurations during beta; report<br>provider-caused failures separately|
|Repeat usage|At least 40% of activated design partners complete another paid<br>workload within 30 days|
|Cost estimate quality|For supported pricing models, target estimate error within 10% when<br>provider data permits; exclude unpredictable egress or clearly<br>disclose it|
|Customer value|At least one documented workload where Kynetic AI improves cost,<br>setup effort or reliability versus baseline|
|Security|No unresolved critical/high-severity security issues before<br>production rollout|



## **15. Rollout Plan and Acceptance Criteria** 

|**Milestone**|**Deliverables**|**Exit criteria**|
|---|---|---|
|M0: Discovery|Customer interviews, provider capability<br>matrix, workload shortlist, pricing model<br>hypotheses|Evidence of recurring pain, willing pilot users<br>and viable provider access|
|M1: Technical spike|Two provider adapters or one provider plus a<br>verified second integration path; deployment<br>prototype|Provision, inspect and terminate supported<br>resources reliably|
|M2: Private alpha|Auth, catalogue, workload builder, lifecycle<br>state, cost estimates, admin tools|Design partners can complete supported<br>workflows under supervision|
|M3: Closed beta|Budgets, alerts, usage reconciliation, logs,<br>audit trails, support playbook|No critical security issues; failure handling<br>and billing understood|
|M4: Intelligence beta|Benchmark harness, transparent candidate<br>ranking, recommendation history|Evidence that recommendations improve a<br>defined outcome|
|M5: Public launch decision|Pricing, terms, support, monitoring, incident<br>response and onboarding docs|Retention, economics, reliability and security<br>gates reviewed|



Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

### **15.1 Release acceptance checklist** 

- User can search supported resources and see pricing source/freshness. 

- User can create a workload only if required constraints are valid and supported. 

- Billable deployments require explicit user confirmation. 

- Repeated API requests cannot accidentally create duplicate paid resources. 

- User can inspect status, stop supported workloads and see estimated/actual cost distinctions. 

- Budget thresholds and alerts operate and are audit logged. 

- Provider failures are mapped to understandable errors without exposing secrets. 

- Provider state reconciliation handles timeouts and out-of-band changes. 

- Role and tenant boundaries pass automated tests. 

- Support can trace a deployment from Kynetic AI ID to provider reference. 

- Terms, privacy notice, refund/dispute policy and provider responsibilities are documented. 

## **16. Risks, Dependencies and Open Questions** 

### **16.1 Risk register** 

|**Risk**|**Likelihood / impact**|**Mitigation / owner**|
|---|---|---|
|Provider APIs or pricing change|Medium / High|Version adapters, contract tests, catalogue<br>freshness checks; Engineering|
|Customers bypass Kynetic AI|High / High|Own recurring workflow, observability, cost<br>controls and provider-neutral deployment;<br>Product|
|Weak gross margin|Medium / High|Model per-customer contribution, avoid low-<br>value support-heavy jobs, test subscription<br>value; Finance/Product|
|Poor workload portability|High / Medium|Declare supported workload classes and<br>provider-specific dependencies; Engineering|
|Security incident|Medium / Critical|Threat modelling, least privilege, tenant<br>isolation, incident response;<br>Security/Engineering|
|Provider concentration|Medium / High|Avoid single-provider dependency where<br>feasible; qualify alternatives; Partnerships|
|Inaccurate cost prediction|High / Medium|Label estimates, disclose assumptions,<br>reconcile with actuals; Data/Engineering|
|Overbuilding intelligence before data|High / High|Start with deterministic rules and benchmark<br>narrow workloads; Product|
|Legal/tax/payment complexity|Medium / High|Clarify whether Kynetic AI is agent, reseller or<br>marketplace; consult counsel before launch;<br>Operations|
|Data locality or export restrictions|Medium / High|Enforce region constraints and maintain<br>provider/data policy inventory;<br>Security/Legal|



### **16.2 Dependencies** 

- Provider API access, terms, pricing visibility and permission to resell or broker workloads. 

Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

- A defined initial workload class and benchmark methodology. 

- Payment processor and billing model appropriate to operating jurisdictions. 

- Legal review of marketplace/reseller status, taxes, customer terms and provider contracts. 

- Security and privacy design before accepting sensitive workloads. 

- Customer baseline data to evaluate whether Kynetic AI recommendations improve outcomes. 

### **16.3 Open questions to resolve before implementation** 

- Which first workload should be supported: fine-tuning, batch inference, image/video generation, rendering or another repeat use case? 

- Will Kynetic AI initially act as a referral marketplace, a disclosed agent, or a reseller/merchant of record? 

- Which 2–3 providers offer the best combination of API quality, reliability, price transparency and commercial terms? 

- Will customers bring their own provider credentials, use Kynetic AI-managed accounts, or both? 

- What is the minimum viable billing approach and who bears refund/chargeback risk? 

- Which customer data must remain within a specified region? 

- What workload telemetry can be collected with consent and used for recommendations? 

- What exact measurable advantage must Kynetic AI demonstrate to justify its fee? 

## **17. Long-Term 100x Vision** 

The long-term ambition is to evolve from a GPU marketplace into a trusted compute coordination network. The platform should make it possible for a developer or authorised AI agent to specify an outcome and constraints, while Kynetic AI evaluates compatible infrastructure, estimates trade-offs, provisions a workload, monitors it and learns from the result. 

### **17.1 Capability ladder** 

|**Stage**|**Capability**|**Defining customer promise**|
|---|---|---|
|1. Marketplace|Provider discovery, normalised listings and<br>basic deployment|Find and rent compute|
|2. Operating layer|Unified lifecycle, API/CLI, logs, usage and<br>budget controls|Run workloads through one workflow|
|3. Intelligence engine|Benchmarking, cost/performance prediction<br>and explainable placement|Choose suitable compute for the workload|
|4. Autonomous buyer|Policy-bound provider selection,<br>procurement and re-optimisation|Meet the objective within approved<br>constraints|
|5. Coordination network|Broader public cloud, specialist, private and<br>edge infrastructure integration|Coordinate eligible compute across the<br>ecosystem|



### **17.2 What could become defensible** 

- A large, high-quality corpus of workload-to-hardware performance observations. 

- Reliable cost prediction that accounts for runtime, storage, data movement and failure risk. 

- Deep provider integrations and portable workload execution patterns. 

- A trusted record of provider reliability, compatibility and service outcomes. 

- Enterprise policies and operational workflows that make Kynetic AI difficult to replace. 

- A network of demand and supply where additional participants improve availability and decision quality. 

### **17.3 What not to assume** 

- Not every workload can be moved across providers without changes. 

- Not every GPU-hour is comparable; hardware, interconnect, memory, software stack and queue time matter. 

Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

- More data does not automatically mean better scheduling; benchmarks must be relevant and unbiased. 

- Global coordination is constrained by latency, data-transfer costs, regulation, security and provider terms. 

- Autonomous purchasing must remain within customer-approved budgets and policies. 

##### **NORTH-STAR VISION** 

Become the system developers and authorised AI agents trust to decide where supported workloads should run—and to execute that decision transparently, safely and economically. 

## **Appendix A. Glossary** 

|**Term**|**Definition**|
|---|---|
|Compute|Processing resources such as GPUs, CPUs, memory, storage and<br>associated infrastructure.|
|Workload|A defined task or application executed on compute infrastructure.|
|Provider adapter|Integration that translates Kynetic AI's common interface into a<br>provider's API and capability model.|
|GTV|Gross transaction value: total value of compute transactions<br>facilitated; not equivalent to Kynetic AI revenue.|
|Take rate|Kynetic AI's share of transaction value, subject to the commercial<br>model.|
|Workload fingerprint|Structured description of workload requirements and observed<br>behaviour used for matching and prediction.|
|Placement|Selection of a provider/resource configuration for a workload.|
|Hard constraint|A condition that must be satisfied for an option to be eligible.|
|Recommendation confidence|How much relevant evidence supports a recommendation; it should<br>reflect missing data and sample size.|
|Data locality|Where data is stored or processed, relevant to latency, transfer cost,<br>security and regulation.|



## **Appendix B. Priority definitions** 

|**Priority**|**Meaning**|
|---|---|
|P0|Must be present for the MVP to deliver the core customer workflow<br>safely.|
|P1|Important capability to add after the core workflow is stable or before|
||wider beta.|
|P2|Future capability that should not block the MVP.|



## **Appendix C. Validation checklist for founder / product lead** 

- Have at least 15–20 target-customer conversations been completed? 

Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

- Can the team name the first workload class and explain why it is a good entry point? 

- Are at least two provider integration paths technically and commercially viable? 

- Has a real workload been deployed and terminated through the prototype? 

- Can the team estimate contribution margin for a representative customer? 

- Is the customer value proposition measurable against the existing workflow? 

- Are security, provider terms, billing responsibility and data handling reviewed? 

- Are the MVP requirements and success gates agreed by product and engineering? 

Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

## **PRD Addendum — Advanced Compute Intelligence** 

**Version: 1.1 | Status: Proposed capability expansion | This addendum extends the existing Kynetic AI PRD without changing the asset-light, software-first product thesis. The three capabilities below are staged additions, not MVP launch blockers.** 

### **A1. Product Strategy Update** 

Kynetic AI evolves from a provider discovery and deployment layer into a workload-aware compute intelligence platform. Its core promise is to estimate and reduce total cost-to-completion while respecting hard constraints for correctness, deadline, data locality, security, reliability and customer-approved spending. 

The product must not promise arbitrary live migration of a running process between clouds. Cross-provider optimization is implemented through a combination of predictive placement before launch, safe replanning at checkpoints, and task-level distribution for workloads that can be decomposed. A switch is recommended only when expected remaining savings exceed data transfer, restart/checkpoint, provisioning, reliability and operational overhead. 

### **A2. Capability 1 — Workload Performance Digital Twin** 

Purpose: build a predictive model for how a declared workload is likely to perform and what it will cost on each eligible compute configuration. The Digital Twin is a decision-support and scheduling service, not a guarantee of exact runtime. 

##### **A2.1 Inputs** 

- Workload manifest: container image, entrypoint, framework/runtime versions, workload class and declared resource requirements. 

- Hardware profile: accelerator model and VRAM, CPU, RAM, storage, interconnect where relevant, region and provider. 

- Execution characteristics: batch size, sequence/image dimensions, dataset size, parallelism, checkpoint support and expected duration. 

- Operational context: provider price and availability timestamps, queue/startup time, storage and network-transfer charges, interruption history and relevant service constraints. 

- Historical observations: actual runtime, throughput, peak memory, utilization, failures, retries, final billed cost and benchmark environment. 

##### **A2.2 Outputs** 

- Predicted runtime and throughput for each compatible candidate, with confidence intervals or confidence bands. 

- Estimated total cost-to-completion, itemised into compute, storage, transfer, startup, checkpoint/restart and expected retry costs where data is available. 

- Compatibility assessment and explicit uncertainty warnings when a candidate lacks representative benchmark evidence. 

- Ranked recommendations for cheapest completion, fastest completion, deadline-constrained completion or a customer-defined objective. 

- Post-run prediction-versus-actual report, including model version and the factors that contributed most to estimation error. 

##### **A2.3 Functional requirements** 

- DT-01: Store workload fingerprints separately from customer payloads; collect only telemetry permitted by customer policy. 

- DT-02: Maintain versioned benchmark records with hardware, software, region, workload shape and measurement methodology. 

- DT-03: Return predicted runtime, cost and uncertainty for each candidate; never silently present a point estimate as a guarantee. 

- DT-04: Exclude candidates that fail hard compatibility, security, region, data-residency or budget constraints before ranking. 

- DT-05: Compare predictions with actual outcomes and track error by workload family, hardware class and provider. 

Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

- DT-06: Detect stale prices, benchmark drift and low-confidence extrapolations; fall back to transparent rules when model confidence is insufficient. 

##### **A2.4 Initial implementation** 

Start with a benchmark registry, workload metadata schema, rules and regression/lookup-based estimators. Use repeatable microbenchmarks and customer-authorised production outcomes before attempting more complex learned models. Add uncertainty calibration and model monitoring before allowing the Digital Twin to trigger automated placement. 

##### **A2.5 Acceptance criteria** 

- For a defined benchmark suite, every prediction includes the measurement date, model version and uncertainty indication. 

- The system records predicted versus actual runtime and cost for completed runs and can report error by workload family. 

- Candidates that violate hard constraints are never recommended, even if they appear cheaper. 

- Low-confidence predictions are labelled and cannot independently trigger a high-impact automated migration. 

### **A3. Capability 2 — Predictive Compute Arbitrage** 

Purpose: continually identify when a workload can be placed or safely moved to a more economical compatible provider or hardware configuration. “Arbitrage” means policy-constrained compute optimization—not speculative buying, unapproved financial exposure or blindly switching providers because their headline hourly rate is lower. 

##### **A3.1 Decision model** 

For each eligible candidate, estimate remaining cost-to-completion rather than comparing only hourly prices. Include remaining compute, data egress/ingress, storage, queue and startup delay, checkpoint overhead, restore/restart time, expected failure/retry cost and the risk of missing the deadline. Replan only when expected benefit exceeds a configured minimum savings threshold and all hard constraints remain satisfied. 

##### **A3.2 Modes** 

- Recommend-only: display alternatives and expected net savings; the customer makes the decision. 

- Approval-required: prepare a switch plan and request customer approval before provisioning or stopping billable resources. 

- Policy-authorised automation: act only within explicit provider allowlists, spending caps, regions, deadline limits and migration rules. 

- Pre-launch placement: select the best eligible provider before a job starts; this is the safest and highest-priority initial mode. 

- Checkpoint-aware replanning: reconsider placement at a supported checkpoint or task boundary, not at arbitrary moments in a running process. 

- Task-level distribution: distribute independent tasks across providers when the workload can be partitioned and results can be safely aggregated. 

##### **A3.3 Functional requirements** 

- PCA-01: Ingest timestamped price, capacity/availability, performance, startup and reliability signals from supported providers. 

- PCA-02: Generate a candidate plan with predicted completion time, total cost, uncertainty, constraints and an explanation of the recommended action. 

- PCA-03: Calculate net savings after transfer, checkpoint, restart, storage, provisioning and expected failure costs. 

- PCA-04: Enforce a configurable minimum absolute/percentage benefit and a cooldown to avoid frequent oscillation between providers. 

- PCA-05: Apply a customer-defined policy for budget, maximum deadline risk, permitted regions, data movement, provider allowlist and approval requirements. 

- PCA-06: Record every recommendation, decision, approval, action, rollback and resulting outcome in an audit log. 

Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

- PCA-07: If a switch fails or becomes uneconomic, preserve the current valid execution where possible and report the reason rather than repeatedly retrying. 

- PCA-08: Show estimated savings separately from verified savings; reconcile verified results against actual provider billing data. 

##### **A3.4 Safety and economic guardrails** 

- No cross-provider switch unless the target supports the workload's runtime, hardware, data and licensing requirements. 

- Never exceed the customer-approved spending cap or move data to a disallowed region. 

- Do not terminate the source workload until the target is confirmed healthy and the recovery/consistency plan is satisfied, where dual-running is safe and affordable. 

- Avoid migration when the workload is tightly coupled, stateful or not safely restartable unless the application provides an explicit migration mechanism. 

- Account for provider terms, egress charges, discounts, commitments and minimum billing periods where applicable. 

- Do not claim guaranteed savings; report forecast, realised savings and confidence separately. 

##### **A3.5 Acceptance criteria** 

- Every proposed switch includes a cost-to-completion comparison with migration overhead and a clear explanation. 

- The scheduler refuses actions that violate hard policy constraints or fail the configured savings threshold. 

- Automated actions are idempotent, auditable and bounded by budgets and retry limits. 

- A failed target launch does not cause the source workload to be stopped prematurely. 

- The platform can compare predicted savings with reconciled actual costs after completion. 

### **A4. Capability 3 — Universal Checkpoint and Resume Layer** 

Purpose: provide a common orchestration interface for saving recoverable workload state and resuming supported workloads on compatible compute. “Universal” describes the intended abstraction across supported workload adapters; it does not mean every framework, model, GPU or live process can be checkpointed and resumed without applicationlevel support. 

##### **A4.1 Supported-state model** 

- Checkpoint manifest: workload ID, image digest, framework/runtime version, checkpoint format/version, source hardware profile, required dependencies and creation timestamp. 

- Training state where supported: model weights, optimizer and scheduler state, global step/epoch, random-numbergenerator state and data-loader/sampler position. 

- Application state: user-defined checkpoint hooks, task completion ledger, input/output references and idempotency keys for resumable batch jobs. 

- Storage metadata: checkpoint location, encryption/key reference, checksum, size, retention policy, data region and restore compatibility constraints. 

- Resume result: restored state validation, resume point, warm-up time, missing/incompatible fields and outcome. 

##### **A4.2 Functional requirements** 

- UCR-01: Define a versioned checkpoint adapter interface for supported frameworks and workload classes. 

- UCR-02: Support application/framework checkpoint hooks; do not assume a generic operating-system snapshot can migrate GPU state across different accelerators. 

- UCR-03: Write checkpoints atomically or use a manifest/commit protocol so incomplete checkpoints are never treated as valid. 

- UCR-04: Verify checksums and required files before resume; validate framework, runtime, model and hardware compatibility. 

- UCR-05: Encrypt checkpoint data in transit and at rest, enforce tenant isolation and region policies, and restrict access to authorised workloads. 

- UCR-06: Allow customer-configured checkpoint intervals, retention and storage targets, subject to workload capabilities and cost. 

Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

- UCR-07: Estimate checkpoint overhead and choose an interval that balances lost work, storage/transfer cost and runtime impact. 

- UCR-08: Track checkpoint creation, restore attempts, resume success, recovery time and lost-work duration. 

- UCR-09: Keep checkpoint deletion, retention and customer data export under explicit policy; never silently retain checkpoints beyond configured limits. 

- UCR-10: Make retry and resume operations idempotent or require workload-level deduplication for side-effecting tasks. 

##### **A4.3 Initial workload coverage** 

Prioritise independent batch jobs and selected machine-learning training frameworks that expose reliable checkpoint APIs. Add other frameworks through adapters after compatibility tests. Defer arbitrary live migration of GPU memory, tightly coupled multi-node training across clouds, and workloads with external side effects that cannot be made idempotent. 

##### **A4.4 Acceptance criteria** 

- A supported workload can create a valid checkpoint, stop, resume from that checkpoint and validate the resulting state. 

- Corrupt, incomplete, incompatible or policy-disallowed checkpoints are rejected with actionable errors. 

- Checkpoint storage, transfer and restore costs are visible in the job cost record. 

- A recovery test demonstrates a documented recovery-time objective for each supported workload adapter; no universal RTO is promised. 

- Retention and deletion policies are tested, including access-control and cross-tenant isolation. 

### **A5. Updated user journey: optimize and recover** 

18. The user submits a workload manifest and states budget, deadline, data-region rules, reliability needs and interruption tolerance. 

19. The Digital Twin evaluates compatible candidates and returns cost-to-completion, runtime range, uncertainty and trade-offs. 

20. The scheduler filters hard constraints, then selects a provider or proposes a plan with an explanation. 

21. If enabled, Predictive Compute Arbitrage monitors relevant changes and replans at safe boundaries; actions follow the customer's approval policy. 

22. For a supported workload, the checkpoint layer persists validated state to an approved storage target. 

23. If interruption or a beneficial switch occurs, Kynetic AI validates the target, restores state and verifies that execution has resumed. 

24. Kynetic AI reports actual runtime, final cost, recovery time, prediction error and verified savings; these observations improve future estimates where customer consent permits. 

### **A6. Architecture additions** 

- Workload Fingerprint Registry: stores versioned workload manifests and privacy-conscious performance features. 

- Benchmark and Digital Twin Service: manages benchmark suites, prediction models, confidence calibration and drift monitoring. 

- Cost-to-Completion Planner: computes candidate total cost and deadline/reliability trade-offs from provider and historical signals. 

- Arbitrage Policy Engine: evaluates savings thresholds, budgets, cooldowns, approval gates and customer hard constraints. 

- Checkpoint Orchestrator: coordinates adapters, checkpoint manifests, validation, encrypted storage, restore and recovery state. 

- Execution State Store and Audit Log: records plans, transitions, approvals, provider actions, checkpoints and final outcomes. 

- Provider Adapter Layer: exposes provider-specific pricing, provisioning, availability, metering and termination through a common internal contract. 

Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

The initial implementation may deploy these as modules in a modular monolith. Separate services only when load, team ownership or reliability requirements justify the operational overhead. 

### **A7. Proposed API additions** 

|**Endpoint**|**Purpose**|**Notes**|
|---|---|---|
|**POST /v1/workloads/{id}/predict**|Predict runtime and cost on eligible<br>candidates|Returns ranges, confidence, model<br>version and assumptions.|
|**POST /v1/workloads/{id}/plans**|Create a placement/optimization plan|Dry-run by default; no billable action.|
|**POST /v1/plans/{id}/approve**|Approve a proposed action|Requires scoped authorisation and<br>idempotency key.|
|**GET /v1/workloads/{id}/savings**|Retrieve estimated and verified<br>savings|Separate forecasts from reconciled<br>actuals.|
|**POST**|Request checkpoint through|Async operation; reports status and|
|**/v1/workloads/{id}/checkpoints**|supported adapter|manifest.|
|**POST /v1/workloads/{id}/resume**|Resume from a validated checkpoint|Validates compatibility, policy and<br>budget first.|
|**GET /v1/checkpoints/{id}**|Inspect checkpoint metadata and<br>state|Never exposes secrets or unrestricted<br>storage credentials.|
|**GET /v1/workloads/{id}/prediction-**<br>**history**|Compare predicted and actual<br>outcomes|Supports error analysis and model<br>monitoring.|



### **A8. Updated rollout plan** 

|**Stage**|**Capability**|**Release gate**|**Commercial purpose**|
|---|---|---|---|
|**Stage 1 — MVP**|Rules-based provider<br>comparison, workload<br>manifests, baseline cost<br>estimates and actual usage<br>tracking|At least one repeatable<br>workload completes end-<br>to-end with transparent<br>cost reporting|Earn trust and validate<br>willingness to pay.|
|**Stage 2 — Digital Twin**|Benchmark registry,<br>workload fingerprints,<br>runtime/cost prediction<br>and confidence reporting|Prediction error measured<br>on a defined test suite; low-<br>confidence cases handled<br>safely|Differentiate beyond<br>catalogue/price<br>comparison.|
|**Stage 3 —**<br>**Checkpoint/resume**|Adapters for selected batch<br>and ML workloads;<br>validated checkpoint<br>storage and recovery|Recovery tests pass for<br>each supported adapter,<br>including integrity and<br>policy checks|Enable resilience and safe<br>replanning.|
|**Stage 4 — Predictive**<br>**arbitrage**|Pre-launch optimization,<br>recommendation mode,<br>then approval-gated<br>checkpoint-aware<br>switching|Net-savings logic, policy<br>enforcement, auditability<br>and rollback/fallback tests<br>pass|Monetise orchestration and<br>verified optimization.|
|**Stage 5 — Network scale**|More providers, enterprise<br>policies, advanced<br>scheduling and partner<br>distribution|Unit economics, support<br>load and provider quality<br>meet agreed thresholds|Expand recurring revenue<br>and network value.|



Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 

_GLOBAL COMPUTE INTELLIGENCE NETWORK  |  PRODUCT REQUIREMENTS_ 

### **A9. Updated success metrics** 

- Prediction quality: runtime and cost error by workload family, with confidence calibration and sample count. 

- Optimization quality: verified net savings after all transfer, storage, startup, checkpoint, restart and retry costs. 

- Safety: policy-violation rate, unauthorised action count, budget-cap breach count and premature source termination count; target zero for policy violations and premature termination. 

- Recovery: checkpoint success rate, restore success rate, median/p95 recovery time and lost-work duration for each supported adapter. 

- Customer value: time to deploy, customer-confirmed savings, repeat workload rate, retention and expansion revenue. 

- Economics: gross margin by revenue stream, compute pass-through exposure, support hours per account, customer acquisition payback and net revenue retention. 

### **A10. Updated non-goals and assumptions** 

- No claim that every workload can be migrated seamlessly between AWS, Azure or other providers. 

- No live transfer of arbitrary GPU memory or unsupported distributed-training state. 

- No automated switch based solely on headline hourly price. 

- No use of customer workload telemetry for model training beyond agreed terms and consent. 

- No autonomous provider purchase or migration outside explicit budget, region, security and approval policies. 

- The Digital Twin is a predictive model whose accuracy must be measured and reported, not a deterministic simulator of all infrastructure. 

### **A11. Decisions required before implementation** 

- Select the first workload family for Digital Twin benchmarking and checkpoint adapter development. 

- Define the minimum net-savings threshold and risk tolerance for any proposed provider switch. 

- Choose checkpoint storage model, encryption/key management, region rules, retention and deletion defaults. 

- Define the baseline methodology for verified savings and how discounts, credits, changing workload volume and egress are treated. 

- Set prediction-quality release gates using a representative workload suite instead of relying on a single aggregate accuracy number. 

- Confirm which provider APIs expose the pricing, capacity and lifecycle signals needed for planning. 

Kynetic AI PRD v1.1 — Advanced Compute Intelligence Addendum 


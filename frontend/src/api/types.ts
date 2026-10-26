/**
 * Kynetic AI — TypeScript API Contracts
 * Aligned with FastAPI Pydantic v2 domain models
 */

export interface HealthResponse {
  status: string;
  service: string;
  instance_id: string;
  uptime_seconds: number;
  timestamp: string;
}

export interface ReadinessResponse {
  status: string;
  database: string;
  cache: string;
  timestamp: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: string;
  default_currency: string;
  created_at: string;
}

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description?: string;
  status: string;
  policy?: {
    max_job_cost?: string;
    require_approval_above?: string;
    allowed_providers: string[];
    allowed_regions: string[];
    auto_action_mode: string;
    cooldown_seconds: number;
  };
}

export interface ProviderCatalogItem {
  id: string;
  key: string;
  display_name: string;
  status: string;
  capabilities: {
    supports_spot?: boolean;
    supports_custom_images?: boolean;
    supports_attached_volumes?: boolean;
    supports_checkpoints?: boolean;
    supported_accelerator_families?: string[];
    [key: string]: unknown;
  };
}

export interface ComputeOffer {
  id: string;
  provider_key: string;
  region_key: string;
  external_offer_key: string;
  gpu_model: string;
  gpu_count: number;
  gpu_memory_gb: number;
  cpu_cores: number;
  ram_gb: number;
  storage_gb: number;
  price_per_hour: string;
  currency: string;
  source_type: 'SIMULATED' | 'VERIFIED_LIVE';
  freshness_status: 'FRESH' | 'STALE' | 'UNKNOWN';
}

export interface WorkloadManifest {
  schema_version: string;
  name: string;
  workload_type: string;
  image: {
    uri: string;
    digest?: string;
  };
  command: string[];
  working_directory?: string;
  resources: {
    gpu_count: number;
    gpu_memory_gb_min?: number;
    preferred_models?: string[];
    cpu_cores_min: number;
    ram_gb_min: number;
    storage_gb_min: number;
  };
  constraints?: {
    allowed_regions?: string[];
    allowed_provider_ids?: string[];
    denied_provider_ids?: string[];
    max_total_cost?: {
      amount: string;
      currency: string;
    };
    currency?: string;
    deadline_at?: string;
    data_residency?: string;
  };
  execution?: {
    timeout_seconds: number;
    retry_limit: number;
    interruptible: boolean;
    checkpoint_mode?: string;
    checkpoint_interval_seconds?: number;
  };
  environment?: Record<string, string>;
}

export interface ManifestValidationResponse {
  valid: boolean;
  manifest_digest: string;
  fingerprint: Record<string, unknown>;
  message: string;
}

export interface WorkloadRevision {
  id: string;
  revision_number: number;
  schema_version: string;
  manifest_digest: string;
  fingerprint: Record<string, unknown>;
  manifest: Record<string, unknown>;
}

export interface Workload {
  id: string;
  organization_id: string;
  project_id: string;
  name: string;
  workload_type: string;
  status: string;
  current_revision?: WorkloadRevision;
}

export interface PlanCandidate {
  id?: string;
  offer_id: string;
  provider_key: string;
  provider_name: string;
  region_key: string;
  gpu_model: string;
  gpu_count: number;
  gpu_memory_gb: number;
  is_eligible: boolean;
  rejection_reasons: string[];
  rank?: number;
  estimated_cost?: string;
  currency: string;
  explanation: string;
}

export interface PlanResponse {
  id: string;
  organization_id: string;
  project_id: string;
  workload_id: string;
  version: int;
  status: 'READY' | 'AWAITING_APPROVAL' | 'APPROVED' | 'EXPIRED';
  selected_candidate?: PlanCandidate;
  candidates: PlanCandidate[];
  estimated_total_cost: string;
  currency: string;
  assumptions: string[];
  warnings: string[];
  expires_at: string;
  created_at: string;
}

type int = number;

export interface RunStateEvent {
  from_state: string;
  to_state: string;
  reason_code: string;
  created_at: string;
}

export interface Run {
  id: string;
  organization_id: string;
  project_id: string;
  plan_id: string;
  compute_offer_id: string;
  status: 'DRAFT' | 'VALIDATED' | 'PLANNED' | 'AWAITING_APPROVAL' | 'APPROVED' | 'PROVISIONING' | 'RUNNING' | 'CANCEL_REQUESTED' | 'CANCELED' | 'SUCCEEDED' | 'FAILED' | 'RECONCILING' | 'FINALIZED';
  idempotency_key: string;
  provider_resource_id?: string;
  started_at?: string;
  ended_at?: string;
  error_summary?: string;
  state_events: RunStateEvent[];
  created_at: string;
}

export interface RunCostSummary {
  run_id: string;
  currency: string;
  estimated_cost: string;
  accrued_cost: string;
  final_cost?: string;
  variance_amount?: string;
  variance_percentage?: string;
  status: string;
}

export interface Checkpoint {
  id: string;
  run_id: string;
  project_id: string;
  step_number: number;
  storage_uri: string;
  sha256_digest: string;
  size_bytes: number;
  format: string;
  is_verified: boolean;
  verification_status: string;
  created_at: string;
}

export interface DigitalTwinPrediction {
  id: string;
  workload_revision_id: string;
  compute_offer_id: string;
  predicted_runtime_seconds: number;
  predicted_cost_usd: string;
  uncertainty_interval: {
    runtime_p10_seconds: number;
    runtime_p90_seconds: number;
    cost_p10_usd: string;
    cost_p90_usd: string;
  };
  methodology: string;
  model_name: string;
  model_version: string;
  assumptions: string[];
  warnings: string[];
}

export interface ArbitrageOpportunity {
  id: string;
  run_id: string;
  current_offer_id: string;
  target_offer_id: string;
  gross_savings_usd: string;
  migration_overhead_usd: string;
  net_savings_usd: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'EXECUTED' | 'REJECTED' | 'EXPIRED';
  anti_oscillation_check: {
    passed: boolean;
    cooldown_remaining_seconds: number;
  };
  explanation: string;
  created_at: string;
}

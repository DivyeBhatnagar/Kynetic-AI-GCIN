/**
 * Kynetic AI — High-Performance API Client Layer
 * Communicates with FastAPI Control Plane (default: http://127.0.0.1:8000/v1)
 */
import type {
  HealthResponse,
  ReadinessResponse,
  ProviderCatalogItem,
  ComputeOffer,
  Workload,
  WorkloadManifest,
  ManifestValidationResponse,
  PlanResponse,
  Run,
  RunCostSummary,
  Checkpoint,
  DigitalTwinPrediction,
  ArbitrageOpportunity
} from './types';

export class ApiError extends Error {
  code: string;
  statusCode: number;
  requestId?: string;
  details?: unknown;

  constructor(message: string, code: string, statusCode: number, requestId?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.requestId = requestId;
    this.details = details;
  }
}

class KyneticApiClient {
  private baseUrl: string;
  private organizationId: string;
  private token: string | null = null;

  constructor() {
    // Read from Vite environment or default to local backend
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    this.baseUrl = (envUrl ? envUrl.replace(/\/+$/, '') : 'http://127.0.0.1:8000') + '/v1';
    this.organizationId = localStorage.getItem('kyn_org_id') || 'default-org';
    this.token = localStorage.getItem('kyn_auth_token');
  }

  public setOrganizationId(orgId: string): void {
    this.organizationId = orgId;
    localStorage.setItem('kyn_org_id', orgId);
  }

  public setAuthToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem('kyn_auth_token', token);
    } else {
      localStorage.removeItem('kyn_auth_token');
    }
  }

  public getOrganizationId(): string {
    return this.organizationId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const requestId = `req_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      'X-Organization-ID': this.organizationId,
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorPayload = data && typeof data === 'object' && data.error ? data.error : null;
        const message = errorPayload?.message || response.statusText || 'An unexpected API error occurred';
        const code = errorPayload?.code || `HTTP_${response.status}`;
        const reqId = errorPayload?.request_id || response.headers.get('X-Request-ID') || requestId;
        throw new ApiError(message, code, response.status, reqId, errorPayload?.details);
      }

      return data as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      // Network or CORS error
      throw new ApiError(
        err.message || 'Network connection failed. Verify the Kynetic backend is running.',
        'NETWORK_ERROR',
        0,
        requestId
      );
    }
  }

  // --- Health & System ---
  public async getHealth(): Promise<HealthResponse> {
    // Health is mounted at root /health/live
    const rootUrl = this.baseUrl.replace(/\/v1$/, '');
    return this.request<HealthResponse>(`${rootUrl}/health/live`);
  }

  public async getReadiness(): Promise<ReadinessResponse> {
    const rootUrl = this.baseUrl.replace(/\/v1$/, '');
    return this.request<ReadinessResponse>(`${rootUrl}/health/ready`);
  }

  // --- Providers & Offers ---
  public async listProviders(): Promise<ProviderCatalogItem[]> {
    return this.request<ProviderCatalogItem[]>('/providers');
  }

  public async listComputeOffers(params?: {
    provider_key?: string;
    region_key?: string;
    gpu_model?: string;
    limit?: number;
    offset?: number;
  }): Promise<ComputeOffer[]> {
    const query = new URLSearchParams();
    if (params?.provider_key) query.append('provider_key', params.provider_key);
    if (params?.region_key) query.append('region_key', params.region_key);
    if (params?.gpu_model) query.append('gpu_model', params.gpu_model);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    const qs = query.toString();
    return this.request<ComputeOffer[]>(`/compute-offers${qs ? `?${qs}` : ''}`);
  }

  public async syncProviderOffers(providerKey: string): Promise<{ status: string; synced_offers_count: number; message: string }> {
    return this.request(`/providers/${providerKey}/sync-offers`, { method: 'POST' });
  }

  // --- Workloads & Manifests ---
  public async validateManifest(manifest: WorkloadManifest): Promise<ManifestValidationResponse> {
    return this.request<ManifestValidationResponse>('/workloads/validate-manifest', {
      method: 'POST',
      body: JSON.stringify(manifest)
    });
  }

  public async createWorkload(projectId: string, manifest: WorkloadManifest): Promise<Workload> {
    return this.request<Workload>('/workloads', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        manifest
      })
    });
  }

  public async listWorkloads(params?: { limit?: number; offset?: number }): Promise<Workload[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    const qs = query.toString();
    return this.request<Workload[]>(`/workloads${qs ? `?${qs}` : ''}`);
  }

  public async getWorkload(workloadId: string): Promise<Workload> {
    return this.request<Workload>(`/workloads/${workloadId}`);
  }

  // --- Planning & Dry-Runs ---
  public async generatePlan(workloadId: string): Promise<PlanResponse> {
    return this.request<PlanResponse>(`/workloads/${workloadId}/plans`, {
      method: 'POST'
    });
  }

  public async getPlan(planId: string): Promise<PlanResponse> {
    return this.request<PlanResponse>(`/plans/${planId}`);
  }

  public async approvePlan(planId: string): Promise<{ status: string; message: string }> {
    return this.request(`/plans/${planId}/approve`, {
      method: 'POST'
    });
  }

  // --- Runs & Execution ---
  public async launchRun(planId: string, offerId: string, idempotencyKey?: string): Promise<{ run_id: string; status: string }> {
    const key = idempotencyKey || `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return this.request(`/plans/${planId}/launch`, {
      method: 'POST',
      headers: {
        'Idempotency-Key': key
      },
      body: JSON.stringify({
        selected_offer_id: offerId
      })
    });
  }

  public async listRuns(params?: { limit?: number; offset?: number; status?: string }): Promise<Run[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.status) query.append('status', params.status);
    const qs = query.toString();
    return this.request<Run[]>(`/runs${qs ? `?${qs}` : ''}`);
  }

  public async getRun(runId: string): Promise<Run> {
    return this.request<Run>(`/runs/${runId}`);
  }

  public async getRunCost(runId: string): Promise<RunCostSummary> {
    return this.request<RunCostSummary>(`/runs/${runId}/cost`);
  }

  public async getRunLogs(runId: string): Promise<{ run_id: string; logs: string[] }> {
    return this.request<{ run_id: string; logs: string[] }>(`/runs/${runId}/logs`);
  }

  public async cancelRun(runId: string): Promise<{ run_id: string; status: string; message: string }> {
    return this.request(`/runs/${runId}/cancel`, {
      method: 'POST'
    });
  }

  // --- Checkpoints ---
  public async listCheckpoints(runId: string): Promise<Checkpoint[]> {
    return this.request<Checkpoint[]>(`/runs/${runId}/checkpoints`);
  }

  // --- Predictions & Digital Twin ---
  public async predictWorkload(
    workloadId: string,
    targetGpuModel?: string,
    targetGpuCount?: number
  ): Promise<DigitalTwinPrediction> {
    return this.request<DigitalTwinPrediction>(`/workloads/${workloadId}/predict`, {
      method: 'POST',
      body: JSON.stringify({
        target_gpu_model: targetGpuModel,
        target_gpu_count: targetGpuCount
      })
    });
  }

  // --- Arbitrage ---
  public async scanArbitrage(runId: string): Promise<{ opportunities_found: number; top_opportunity?: ArbitrageOpportunity }> {
    return this.request(`/runs/${runId}/arbitrage/scan`, {
      method: 'POST'
    });
  }

  public async listArbitrageOpportunities(runId: string): Promise<ArbitrageOpportunity[]> {
    return this.request<ArbitrageOpportunity[]>(`/runs/${runId}/arbitrage/opportunities`);
  }
}

export const apiClient = new KyneticApiClient();

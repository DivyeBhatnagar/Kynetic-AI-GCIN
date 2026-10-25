import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardComputeTopology } from '../components/DashboardComputeTopology';

interface DashboardPageProps {
  onOpenEarlyAccess?: () => void;
}

type WorkloadStatus = 'ALL' | 'RUNNING' | 'CHECKPOINTED' | 'COMPLETED' | 'QUEUED';
type LogFilter = 'ALL' | 'ARBITRAGE' | 'CHECKPOINT' | 'THERMAL' | 'NETWORK' | 'SCHEDULER';

interface WorkloadItem {
  id: string;
  name: string;
  spec: string;
  framework: string;
  provider: string;
  cluster: string;
  region: string;
  fabric: string;
  status: 'RUNNING' | 'CHECKPOINTED' | 'COMPLETED' | 'QUEUED';
  runtime: string;
  costIncurred: string;
  savings: string;
  savingsPercent: string;
  rationale: string;
  isRecommended?: boolean;
  telemetry: {
    gpuUtil: string;
    memoryBandwidth: string;
    vramAllocated: string;
    checkpointState: string;
    preemptionRisk: string;
  };
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenEarlyAccess }) => {
  const [filterType, setFilterType] = useState<WorkloadStatus>('ALL');
  const [expandedWorkloadId, setExpandedWorkloadId] = useState<string | null>('run_8f99a0e1');
  const [logFilter, setLogFilter] = useState<LogFilter>('ALL');

  const workloads: WorkloadItem[] = [
    {
      id: 'run_8f99a0e1',
      name: 'Llama 3 70B LoRA Alignment',
      spec: '70B parameters · 8,192 ctx · LoRA r=64',
      framework: 'PyTorch 2.4 FSDP',
      provider: 'CoreWeave',
      cluster: '8x H100 SXM5 80GB',
      region: 'us-east-1 // InfiniBand NDR',
      fabric: '3.2 Tbps Quantum-2 IB',
      status: 'RUNNING',
      runtime: '04h 18m 22s',
      costIncurred: '$89.40',
      savings: '-$42.10',
      savingsPercent: '32% opt',
      rationale: 'Optimal Memory Roofline (42 FLOP/B) · NVLink 4 prevents all-to-all communication barrier',
      isRecommended: true,
      telemetry: {
        gpuUtil: '94.2% Sustained',
        memoryBandwidth: '840 GB/s All-to-All',
        vramAllocated: '72.4 GB / 80 GB',
        checkpointState: 'Synced (step #4,200) to Cloudflare R2',
        preemptionRisk: '0.02% (Direct Dedicated Contract)',
      },
    },
    {
      id: 'run_44b3c99a',
      name: 'DeepSeek-R1 Distillation',
      spec: 'MoE sharding · 37B active parameters',
      framework: 'vLLM Multi-Node',
      provider: 'RunPod',
      cluster: '8x L40S Ada 48GB',
      region: 'eu-central // Spot Instance',
      fabric: '400 Gbps RoCE v2 Mesh',
      status: 'CHECKPOINTED',
      runtime: '02h 45m 11s',
      costIncurred: '$31.20',
      savings: '-$18.80',
      savingsPercent: '38% opt',
      rationale: 'Dynamic Arbitrage: Migrated from AWS p4d when secondary market spot dropped 41%',
      isRecommended: true,
      telemetry: {
        gpuUtil: '82.0% Active',
        memoryBandwidth: '310 GB/s Pooled GDDR6',
        vramAllocated: '312 GB / 384 GB',
        checkpointState: 'SafeTensors shard v2.1 validated in 1.4s',
        preemptionRisk: 'Automated fallback node in standby (Crusoe ND)',
      },
    },
    {
      id: 'run_9021dd72',
      name: 'SDXL Batch Generation 50k',
      spec: '50,000 latents · 16-channel VAE batch',
      framework: 'Diffusers Engine',
      provider: 'Lambda Labs',
      cluster: '16x RTX 4090 24GB',
      region: 'us-west-2 // PCIe Gen5',
      fabric: 'Direct Host PCIe x16',
      status: 'COMPLETED',
      runtime: '01h 04m 50s',
      costIncurred: '$14.90',
      savings: '-$9.30',
      savingsPercent: '38% opt',
      rationale: 'High Compute Intensity: Consumer Ada FP16 Tensor Cores yield 68% cost arbitrage',
      isRecommended: false,
      telemetry: {
        gpuUtil: '99.1% Average',
        memoryBandwidth: '128 GB/s Host-to-Device',
        vramAllocated: '22.8 GB / 24 GB',
        checkpointState: 'Output artifacts persisted to S3 bucket',
        preemptionRisk: 'Job Finished (100% SLA Satisfied)',
      },
    },
    {
      id: 'run_77180ef9',
      name: 'Qwen 2.5 32B FP8 Inference',
      spec: '32B FP8 Quantized · 128k context probe',
      framework: 'TensorRT-LLM',
      provider: 'Together',
      cluster: '4x H100 NVL 94GB',
      region: 'us-central // Reserved Pool',
      fabric: 'NVLink 900 GB/s',
      status: 'QUEUED',
      runtime: '00h 00m 00s',
      costIncurred: '$0.00',
      savings: 'Est. $44.00',
      savingsPercent: 'Pre-dispatch',
      rationale: 'Scheduled to dispatch at spot rate trough (estimated window in 18 minutes)',
      isRecommended: false,
      telemetry: {
        gpuUtil: '0.0% (Staged in Queue)',
        memoryBandwidth: 'Awaiting tensor weight hydration',
        vramAllocated: '0 GB / 376 GB',
        checkpointState: 'Weights pre-cached in local NVMe cache',
        preemptionRisk: 'High SLA reserve priority',
      },
    },
  ];

  const filteredWorkloads = workloads.filter((w) => {
    if (filterType === 'ALL') return true;
    return w.status === filterType;
  });

  const rawLogs = [
    {
      time: '14:48:02.104',
      type: 'ARBITRAGE',
      tagColor: 'text-accent-olive font-semibold',
      content: 'Swapped RunPod spot instance with zero memory checkpoint loss in 1.4s.',
      target: 'run_44b3c99a',
    },
    {
      time: '14:32:10.892',
      type: 'CHECKPOINT',
      tagColor: 'text-status-healthy font-semibold',
      content: 'Delta snapshot synced to Cloudflare R2 bucket (size: 14.2GB, duration: 3.1s).',
      target: 'run_8f99a0e1',
    },
    {
      time: '14:15:44.318',
      type: 'THERMAL',
      tagColor: 'text-status-warning font-semibold',
      content: 'CoreWeave node cw-h100-09 reached 78°C; throttling avoided via dynamic fan burst.',
      target: 'cw-h100-09',
    },
    {
      time: '14:02:19.005',
      type: 'SCHEDULER',
      tagColor: 'text-ink-muted font-semibold',
      content: 'Spec "Llama-3-70B-BF16-FineTune" evaluated against 12 candidate cloud availability zones.',
      target: 'blueprint-01',
    },
    {
      time: '13:58:01.440',
      type: 'NETWORK',
      tagColor: 'text-accent-olive font-semibold',
      content: 'Direct mesh cross-connect latency benchmarked at 1.18ms p50, 2.12ms p99.',
      target: 'mesh-router',
    },
  ];

  const filteredLogs = rawLogs.filter((l) => {
    if (logFilter === 'ALL') return true;
    return l.type === logFilter;
  });

  return (
    <div className="bg-canvas-base text-ink-primary font-body-md antialiased min-h-screen flex flex-col selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* MAIN CANVAS CONTAINER */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 md:px-margin-desktop py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* 1. OVERVIEW & WELCOME HERO SECTION */}
        <section className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-hairline-subtle pb-5">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-label-tag text-[10px] bg-canvas-alternate text-ink-muted px-2 py-0.5 rounded border border-hairline-default tracking-wider">
                  TIER: PRO ENTERPRISE // REGION: MULTI-CLOUD
                </span>
                <span className="flex items-center gap-1 font-label-tag text-[10px] text-accent-olive bg-secondary-container px-2 py-0.5 rounded border border-secondary-fixed">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-healthy animate-pulse"></span>
                  SIMULATED DEMO DATA · BROKER SYNCHRONIZED
                </span>
              </div>
              <h1 className="text-2xl sm:text-headline-md font-headline-md tracking-tight text-ink-primary font-medium">
                Welcome back, Synthetix Research
              </h1>
              <p className="text-body-sm sm:text-body-md font-body-md text-ink-muted mt-0.5">
                Real-time topology orchestration, continuous spot arbitrage, and preemption fault mitigation.
              </p>
            </div>

            {/* Action CTAs */}
            <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
              <Link
                to="/docs"
                className="bg-surface-elevated hover:bg-canvas-alternate border border-hairline-default text-ink-primary font-label-mono text-xs px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">terminal</span>
                <span>Quick Dry-Run CLI</span>
              </Link>
              <Link
                to="/workload-planner"
                className="bg-ink-primary hover:bg-accent-olive text-surface-elevated font-label-mono text-xs px-4 py-1.5 rounded-full transition-all duration-150 shadow-xs flex items-center gap-1.5 border border-transparent hover:border-accent-olive"
              >
                <span>Plan a Workload</span>
                <span className="material-symbols-outlined text-[15px]">arrow_outward</span>
              </Link>
            </div>
          </div>

          {/* 1.1 COMPUTE INTELLIGENCE TOPOLOGY LAYER */}
          <DashboardComputeTopology />

          {/* 1.2 4 QUICK METRIC CARDS WITH AUTHENTIC SPARKLINES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Total Estimated Savings */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-4 relative overflow-hidden transition-all duration-150 hover:border-accent-olive shadow-xs flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1 bg-accent-olive"></div>
              <div>
                <div className="flex items-center justify-between text-ink-muted font-label-mono text-[11px] mb-1.5">
                  <span className="uppercase tracking-wider">TOTAL ESTIMATED SAVINGS</span>
                  <span className="material-symbols-outlined text-[17px] text-accent-olive">savings</span>
                </div>
                <div className="text-2xl font-headline-sm text-ink-primary font-medium tracking-tight">
                  $18,420.50
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="font-label-tag text-[10px] bg-secondary-container text-accent-olive px-1.5 py-0.5 rounded border border-secondary-fixed font-semibold">
                    +34.2%
                  </span>
                  <span className="font-body-sm text-xs text-ink-subtle">vs on-demand list pricing</span>
                </div>
              </div>

              {/* Sparkline & Category Tag */}
              <div className="mt-3 pt-2.5 border-t border-hairline-subtle flex items-end justify-between">
                <span className="font-label-mono text-[10px] text-ink-subtle">
                  ESTIMATED ARBITRAGE
                </span>
                <svg className="w-20 h-6 overflow-visible" viewBox="0 0 80 24">
                  <path
                    d="M 0,20 Q 15,18 28,14 T 50,9 T 70,5 L 80,3"
                    fill="none"
                    stroke="#59664D"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                  <circle cx="80" cy="3" r="2.5" fill="#59664D" />
                </svg>
              </div>
            </div>

            {/* Card 2: Active GPU Fleet */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-4 relative overflow-hidden transition-all duration-150 hover:border-accent-olive shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-ink-muted font-label-mono text-[11px] mb-1.5">
                  <span className="uppercase tracking-wider">ACTIVE GPU FLEET</span>
                  <span className="material-symbols-outlined text-[17px] text-status-healthy">memory</span>
                </div>
                <div className="text-2xl font-headline-sm text-ink-primary font-medium tracking-tight">
                  32 Instances
                </div>
                <div className="mt-1 flex items-center justify-between text-xs font-body-sm text-ink-muted">
                  <span>24x H100 SXM5 · 8x L40S</span>
                  <span className="font-label-tag text-[10px] text-ink-subtle font-mono">CW / RUNPOD</span>
                </div>
              </div>

              {/* Capacity Progress Bar & Category Tag */}
              <div className="mt-3 pt-2.5 border-t border-hairline-subtle flex items-center justify-between">
                <span className="font-label-mono text-[10px] text-ink-subtle">
                  MEASURED ALLOCATION
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 bg-canvas-alternate h-1.5 rounded-full overflow-hidden">
                    <div className="bg-status-healthy h-full w-[88%]"></div>
                  </div>
                  <span className="font-label-mono text-[10px] text-ink-primary font-semibold">88%</span>
                </div>
              </div>
            </div>

            {/* Card 3: Simulated Workloads */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-4 relative overflow-hidden transition-all duration-150 hover:border-accent-olive shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-ink-muted font-label-mono text-[11px] mb-1.5">
                  <span className="uppercase tracking-wider">SIMULATED WORKLOADS</span>
                  <span className="material-symbols-outlined text-[17px] text-ink-muted">alt_route</span>
                </div>
                <div className="text-2xl font-headline-sm text-ink-primary font-medium tracking-tight">
                  142 Jobs
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs font-body-sm text-ink-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                  <span>99.8% preemption immunity score</span>
                </div>
              </div>

              {/* Daily volume sparkline & Category Tag */}
              <div className="mt-3 pt-2.5 border-t border-hairline-subtle flex items-end justify-between">
                <span className="font-label-mono text-[10px] text-ink-subtle">
                  SIMULATED BENCHMARKS
                </span>
                <svg className="w-20 h-6 overflow-visible" viewBox="0 0 80 24">
                  <rect x="2" y="14" width="6" height="10" rx="1" fill="#DCE7D3" />
                  <rect x="14" y="10" width="6" height="14" rx="1" fill="#DCE7D3" />
                  <rect x="26" y="8" width="6" height="16" rx="1" fill="#DCE7D3" />
                  <rect x="38" y="12" width="6" height="12" rx="1" fill="#DCE7D3" />
                  <rect x="50" y="6" width="6" height="18" rx="1" fill="#84A96C" />
                  <rect x="62" y="4" width="6" height="20" rx="1" fill="#59664D" />
                  <rect x="74" y="2" width="6" height="22" rx="1" fill="#59664D" />
                </svg>
              </div>
            </div>

            {/* Card 4: Live Broker Latency */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-4 relative overflow-hidden transition-all duration-150 hover:border-accent-olive shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-ink-muted font-label-mono text-[11px] mb-1.5">
                  <span className="uppercase tracking-wider">LIVE BROKER LATENCY</span>
                  <span className="material-symbols-outlined text-[17px] text-accent-olive">speed</span>
                </div>
                <div className="text-2xl font-headline-sm text-ink-primary font-medium tracking-tight">
                  1.2ms
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs font-body-sm text-ink-muted">
                  <span className="material-symbols-outlined text-[13px] text-accent-olive">hub</span>
                  <span>Global mesh synced (p99: 2.1ms)</span>
                </div>
              </div>

              {/* Real-time oscillation sparkline & Category Tag */}
              <div className="mt-3 pt-2.5 border-t border-hairline-subtle flex items-end justify-between">
                <span className="font-label-mono text-[10px] text-ink-subtle">
                  MEASURED EBPF TELEMETRY
                </span>
                <svg className="w-20 h-6 overflow-visible" viewBox="0 0 80 24">
                  <path
                    d="M 0,14 L 12,11 L 24,15 L 36,10 L 48,13 L 60,9 L 72,12 L 80,10"
                    fill="none"
                    stroke="#59664D"
                    strokeWidth="1.5"
                  />
                  <line x1="0" y1="6" x2="80" y2="6" stroke="#DEDDD5" strokeDasharray="2 2" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* 2. RECENT WORKLOADS & ACTIVE EXECUTIONS */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-title-md font-title-md font-medium text-ink-primary">
                Active Executions &amp; Recent Workloads
              </h2>
              <span className="font-label-tag text-[10px] bg-secondary-container text-accent-olive px-2 py-0.5 rounded-full border border-secondary-fixed">
                4 RUNNING CONCURRENTLY
              </span>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['ALL', 'RUNNING', 'CHECKPOINTED', 'COMPLETED', 'QUEUED'] as WorkloadStatus[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilterType(status)}
                    className={`font-label-mono text-[11px] px-2.5 py-1 rounded transition-colors ${
                      filterType === status
                        ? 'bg-ink-primary text-surface-elevated font-medium'
                        : 'bg-surface-elevated text-ink-muted hover:text-ink-primary border border-hairline-default hover:bg-canvas-alternate'
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Execution Matrix Container */}
          <div className="bg-surface-elevated border border-hairline-default rounded-lg overflow-x-auto shadow-xs">
            <table className="w-full text-left border-collapse min-w-[840px]">
              <thead>
                <tr className="bg-canvas-alternate border-b border-hairline-default font-label-mono text-label-mono text-ink-muted uppercase text-[11px]">
                  <th className="py-2.5 px-4">Workload / Spec</th>
                  <th className="py-2.5 px-4">Topology Cluster</th>
                  <th className="py-2.5 px-4">Routing Rationale</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Runtime</th>
                  <th className="py-2.5 px-4">Incurred / Saved</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-subtle text-body-sm font-body-sm">
                {filteredWorkloads.map((job) => {
                  const isExpanded = expandedWorkloadId === job.id;
                  const isRecommended = job.isRecommended;

                  return (
                    <React.Fragment key={job.id}>
                      <tr
                        onClick={() => setExpandedWorkloadId(isExpanded ? null : job.id)}
                        className={`transition-colors cursor-pointer ${
                          isRecommended
                            ? 'bg-[#FAF9F5] hover:bg-secondary-container/20 border-l-2 border-l-accent-olive'
                            : 'hover:bg-canvas-alternate/60'
                        }`}
                      >
                        <td className="py-3 px-4 font-medium text-ink-primary">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-accent-olive text-[17px]">
                              {job.status === 'RUNNING'
                                ? 'neurology'
                                : job.status === 'CHECKPOINTED'
                                ? 'hub'
                                : job.status === 'COMPLETED'
                                ? 'image'
                                : 'psychology'}
                            </span>
                            <span className="font-semibold text-xs text-ink-primary">{job.name}</span>
                          </div>
                          <div className="text-ink-subtle font-label-mono text-[11px] ml-6 flex items-center gap-2 mt-0.5">
                            <span>id: {job.id}</span>
                            <span>·</span>
                            <span className="text-accent-olive font-medium">{job.framework}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-ink-body">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-xs text-ink-primary">{job.cluster}</span>
                            <span className="font-label-tag text-[10px] px-1 py-0.2 bg-canvas-alternate rounded border border-hairline-default text-ink-body">
                              {job.provider}
                            </span>
                          </div>
                          <div className="text-ink-subtle text-[10px] font-label-mono mt-0.5">
                            {job.region}
                          </div>
                        </td>

                        <td className="py-3 px-4 max-w-[220px]">
                          <div className="text-[11px] text-ink-muted leading-tight font-body-sm line-clamp-2">
                            {job.rationale}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-label-tag text-[10px] ${
                              job.status === 'RUNNING'
                                ? 'bg-secondary-container border border-secondary-fixed text-accent-olive font-semibold'
                                : job.status === 'CHECKPOINTED'
                                ? 'bg-canvas-alternate border border-hairline-strong text-ink-body font-medium'
                                : job.status === 'COMPLETED'
                                ? 'bg-canvas-alternate border border-hairline-default text-ink-subtle'
                                : 'bg-secondary-container/50 border border-secondary-fixed text-ink-primary'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                job.status === 'RUNNING'
                                  ? 'bg-status-healthy animate-pulse'
                                  : job.status === 'CHECKPOINTED'
                                  ? 'bg-accent-olive'
                                  : job.status === 'COMPLETED'
                                  ? 'bg-ink-subtle'
                                  : 'bg-status-warning'
                              }`}
                            ></span>
                            <span>{job.status}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-ink-body font-label-mono text-xs">
                          {job.runtime}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-label-mono text-xs font-semibold text-ink-primary">
                            {job.costIncurred}
                          </div>
                          <div className="font-label-tag text-[10px] text-accent-olive font-medium">
                            {job.savings} ({job.savingsPercent})
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span
                              className="p-1 hover:bg-canvas-alternate rounded text-ink-muted hover:text-ink-primary transition-colors"
                              title="Toggle Telemetry Drawer"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {isExpanded ? 'expand_less' : 'query_stats'}
                              </span>
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Telemetry Drawer */}
                      {isExpanded && (
                        <tr className="bg-canvas-alternate/50 border-b border-hairline-default">
                          <td colSpan={7} className="px-5 py-3">
                            <div className="p-3 bg-surface-elevated rounded border border-hairline-default text-xs font-label-mono grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <span className="text-ink-subtle block mb-1">HARDWARE UTILIZATION</span>
                                <div className="text-ink-primary font-medium">{job.telemetry.gpuUtil}</div>
                                <div className="text-ink-muted text-[11px] mt-0.5">
                                  VRAM: {job.telemetry.vramAllocated}
                                </div>
                              </div>
                              <div>
                                <span className="text-ink-subtle block mb-1">FABRIC THROUGHPUT</span>
                                <div className="text-ink-primary font-medium">{job.telemetry.memoryBandwidth}</div>
                                <div className="text-ink-muted text-[11px] mt-0.5">{job.fabric}</div>
                              </div>
                              <div>
                                <span className="text-ink-subtle block mb-1">CHECKPOINT STATE &amp; SLA</span>
                                <div className="text-accent-olive font-medium">{job.telemetry.checkpointState}</div>
                                <div className="text-ink-muted text-[11px] mt-0.5">{job.telemetry.preemptionRisk}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. SAVED PLANS & CANDIDATE BLUEPRINTS */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base sm:text-title-md font-title-md font-medium text-ink-primary">
                Saved Plans &amp; Candidate Blueprints
              </h2>
              <p className="text-xs sm:text-body-sm font-body-sm text-ink-muted">
                Ready-to-provision declarative configurations synthesized by Kynetic Planner.
              </p>
            </div>
            <Link
              to="/workload-planner"
              className="font-label-mono text-xs text-accent-olive hover:underline flex items-center gap-1 font-medium"
            >
              <span>View all specifications</span>
              <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            </Link>
          </div>

          {/* Bento Cards Grid for Blueprints */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Blueprint 1 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-5 flex flex-col justify-between hover:border-accent-olive transition-all duration-150 shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-tag text-[10px] text-accent-olive bg-secondary-container px-1.5 py-0.5 rounded border border-secondary-fixed font-semibold">
                    OPTIMIZED FOR BF16
                  </span>
                  <span className="font-label-mono text-[10px] text-ink-subtle">Saved 2d ago</span>
                </div>
                <h3 className="text-sm font-headline-sm font-semibold text-ink-primary">
                  Llama-3-70B-BF16-FineTune
                </h3>
                <p className="font-body-sm text-xs text-ink-muted mt-1 leading-relaxed">
                  Multi-GPU distributed PEFT fine-tune run with automatic checkpoint offload.
                </p>

                {/* Technical Metric Box */}
                <div className="my-3.5 p-3 bg-canvas-alternate rounded border border-hairline-subtle font-label-mono text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-ink-body">
                    <span className="text-ink-muted">Estimated Cost:</span>
                    <span className="font-semibold text-ink-primary text-sm">$27.80</span>
                  </div>
                  <div className="flex justify-between items-center text-ink-body">
                    <span className="text-ink-muted">Expected Runtime:</span>
                    <span className="text-ink-primary font-medium">7h 35m</span>
                  </div>
                  <div className="flex justify-between items-center text-ink-body">
                    <span className="text-ink-muted">Hardware Target:</span>
                    <span className="text-accent-olive font-medium">8x L40S (RunPod)</span>
                  </div>
                  <div className="pt-1.5 border-t border-hairline-subtle text-[11px] text-accent-olive flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                    <span>Saves $4.60 under budget · 25m buffer</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-hairline-subtle">
                <Link
                  to="/recommendations"
                  className="flex-1 bg-ink-primary text-surface-elevated hover:bg-accent-olive font-label-mono text-xs py-1.5 rounded-full text-center transition-colors font-medium"
                >
                  Deploy
                </Link>
                <Link
                  to="/workload-planner"
                  className="px-3 py-1.5 border border-hairline-default hover:bg-canvas-alternate rounded-full font-label-mono text-xs text-ink-muted hover:text-ink-primary transition-colors"
                >
                  Edit in Planner
                </Link>
                <button
                  onClick={onOpenEarlyAccess}
                  className="p-1.5 border border-hairline-default hover:bg-canvas-alternate rounded-full text-ink-muted hover:text-ink-primary"
                  title="Export Spec"
                >
                  <span className="material-symbols-outlined text-[15px]">file_download</span>
                </button>
              </div>
            </div>

            {/* Blueprint 2 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-5 flex flex-col justify-between hover:border-accent-olive transition-all duration-150 shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-tag text-[10px] text-ink-body bg-canvas-alternate px-1.5 py-0.5 rounded border border-hairline-default">
                    BENCHMARK EVAL
                  </span>
                  <span className="font-label-mono text-[10px] text-ink-subtle">Saved 5d ago</span>
                </div>
                <h3 className="text-sm font-headline-sm font-semibold text-ink-primary">
                  Qwen-Coder-Continuous-Eval
                </h3>
                <p className="font-body-sm text-xs text-ink-muted mt-1 leading-relaxed">
                  Lightweight automated regression evaluation harness running synthetic coding tasks.
                </p>

                {/* Technical Metric Box */}
                <div className="my-3.5 p-3 bg-canvas-alternate rounded border border-hairline-subtle font-label-mono text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-ink-body">
                    <span className="text-ink-muted">Estimated Cost:</span>
                    <span className="font-semibold text-ink-primary text-sm">$12.40</span>
                  </div>
                  <div className="flex justify-between items-center text-ink-body">
                    <span className="text-ink-muted">Expected Runtime:</span>
                    <span className="text-ink-primary font-medium">2h 10m</span>
                  </div>
                  <div className="flex justify-between items-center text-ink-body">
                    <span className="text-ink-muted">Hardware Target:</span>
                    <span className="text-accent-olive font-medium">4x A100 PCIe</span>
                  </div>
                  <div className="pt-1.5 border-t border-hairline-subtle text-[11px] text-accent-olive flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                    <span>Direct PCIe adequate for small regression batches</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-hairline-subtle">
                <Link
                  to="/recommendations"
                  className="flex-1 bg-ink-primary text-surface-elevated hover:bg-accent-olive font-label-mono text-xs py-1.5 rounded-full text-center transition-colors font-medium"
                >
                  Deploy
                </Link>
                <Link
                  to="/workload-planner"
                  className="px-3 py-1.5 border border-hairline-default hover:bg-canvas-alternate rounded-full font-label-mono text-xs text-ink-muted hover:text-ink-primary transition-colors"
                >
                  Edit in Planner
                </Link>
                <button
                  onClick={onOpenEarlyAccess}
                  className="p-1.5 border border-hairline-default hover:bg-canvas-alternate rounded-full text-ink-muted hover:text-ink-primary"
                  title="Export Spec"
                >
                  <span className="material-symbols-outlined text-[15px]">file_download</span>
                </button>
              </div>
            </div>

            {/* Blueprint 3 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-5 flex flex-col justify-between hover:border-accent-olive transition-all duration-150 shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-tag text-[10px] text-accent-olive bg-secondary-container px-1.5 py-0.5 rounded border border-secondary-fixed font-semibold">
                    HIGH THROUGHPUT
                  </span>
                  <span className="font-label-mono text-[10px] text-ink-subtle">Saved 1w ago</span>
                </div>
                <h3 className="text-sm font-headline-sm font-semibold text-ink-primary">
                  Vision-Encoder-Pretrain-Spike
                </h3>
                <p className="font-body-sm text-xs text-ink-muted mt-1 leading-relaxed">
                  Full NVLink mesh spike for multi-modal embedder pretraining with flash-attn 3.
                </p>

                {/* Technical Metric Box */}
                <div className="my-3.5 p-3 bg-canvas-alternate rounded border border-hairline-subtle font-label-mono text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-ink-body">
                    <span className="text-ink-muted">Estimated Cost:</span>
                    <span className="font-semibold text-ink-primary text-sm">$114.00</span>
                  </div>
                  <div className="flex justify-between items-center text-ink-body">
                    <span className="text-ink-muted">Expected Runtime:</span>
                    <span className="text-ink-primary font-medium">14h 00m</span>
                  </div>
                  <div className="flex justify-between items-center text-ink-body">
                    <span className="text-ink-muted">Hardware Target:</span>
                    <span className="text-accent-olive font-medium">8x H100 SXM5</span>
                  </div>
                  <div className="pt-1.5 border-t border-hairline-subtle text-[11px] text-accent-olive flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                    <span>3.2 Tbps InfiniBand prevents all-reduce bottleneck</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-hairline-subtle">
                <Link
                  to="/recommendations"
                  className="flex-1 bg-ink-primary text-surface-elevated hover:bg-accent-olive font-label-mono text-xs py-1.5 rounded-full text-center transition-colors font-medium"
                >
                  Deploy
                </Link>
                <Link
                  to="/workload-planner"
                  className="px-3 py-1.5 border border-hairline-default hover:bg-canvas-alternate rounded-full font-label-mono text-xs text-ink-muted hover:text-ink-primary transition-colors"
                >
                  Edit in Planner
                </Link>
                <button
                  onClick={onOpenEarlyAccess}
                  className="p-1.5 border border-hairline-default hover:bg-canvas-alternate rounded-full text-ink-muted hover:text-ink-primary"
                  title="Export Spec"
                >
                  <span className="material-symbols-outlined text-[15px]">file_download</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Broker Policy Banner */}
          <div className="p-4 border border-dashed border-hairline-strong rounded-lg bg-canvas-alternate/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-body-sm font-body-sm text-ink-muted">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-accent-olive text-[20px] shrink-0">tune</span>
              <div>
                <span className="font-semibold text-ink-primary">Custom Broker Rules &amp; Automated Spot Bidding:</span>
                <span> No active custom broker policies active. Synthesize your first policy to unlock automated multi-cloud fallback.</span>
              </div>
            </div>
            <Link
              to="/architecture"
              className="shrink-0 whitespace-nowrap font-label-mono text-xs text-accent-olive bg-surface-elevated border border-hairline-default px-3.5 py-1.5 rounded-full hover:bg-secondary-container transition-colors font-medium"
            >
              Configure Arbitrage Policy →
            </Link>
          </div>
        </section>

        {/* 4. TELEMETRY STREAM & CLUSTER HEALTH */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          {/* Monospace Compact Real-time Event Log (2 Cols) */}
          <div className="lg:col-span-2 bg-canvas-alternate border border-hairline-default rounded-lg p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-hairline-subtle mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-status-healthy animate-pulse"></span>
                  <span className="font-label-mono text-xs text-ink-primary font-semibold uppercase tracking-wider">
                    TELEMETRY STREAM // LIVE MESH
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label-mono text-[10px] text-ink-subtle hidden sm:inline">
                    STREAMING AT 20HZ
                  </span>
                </div>
              </div>

              {/* Event Filter Pills */}
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                {(['ALL', 'ARBITRAGE', 'CHECKPOINT', 'THERMAL', 'NETWORK', 'SCHEDULER'] as LogFilter[]).map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => setLogFilter(type)}
                      className={`font-label-mono text-[10px] px-2 py-0.5 rounded transition-colors ${
                        logFilter === type
                          ? 'bg-ink-primary text-surface-elevated font-semibold'
                          : 'bg-surface-elevated border border-hairline-default text-ink-muted hover:text-ink-primary'
                      }`}
                    >
                      {type}
                    </button>
                  )
                )}
              </div>

              {/* Terminal Logs */}
              <div className="space-y-1.5 font-label-mono text-xs text-ink-body bg-[#181816] text-[#E8E7E0] p-3.5 rounded border border-hairline-strong/30 overflow-x-auto">
                {filteredLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                    <span className="text-[#8B8B84] shrink-0">{log.time}</span>
                    <span
                      className={`shrink-0 ${
                        log.type === 'ARBITRAGE'
                          ? 'text-[#84A96C]'
                          : log.type === 'CHECKPOINT'
                          ? 'text-[#A3E635]'
                          : log.type === 'THERMAL'
                          ? 'text-[#F59E0B]'
                          : log.type === 'NETWORK'
                          ? 'text-[#38BDF8]'
                          : 'text-[#9CA3AF]'
                      }`}
                    >
                      [{log.type}]
                    </span>
                    <span className="text-[#F3F4F6]">{log.content}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-hairline-subtle flex justify-between items-center text-ink-subtle font-label-mono text-[11px] flex-wrap gap-2">
              <span>Buffer: 10,000 entries retained</span>
              <button
                onClick={onOpenEarlyAccess}
                className="text-accent-olive hover:underline font-medium"
              >
                Download complete audit log (.jsonl)
              </button>
            </div>
          </div>

          {/* Cluster Health Summary Card (1 Col) */}
          <div className="bg-surface-elevated border border-hairline-default rounded-lg p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-hairline-subtle mb-3">
                <span className="font-label-mono text-xs text-ink-primary font-semibold uppercase tracking-wider">
                  CLUSTER STATUS
                </span>
                <span className="font-label-tag text-[10px] bg-secondary-container text-accent-olive px-1.5 py-0.5 rounded font-semibold">
                  ALL OPERATIONAL
                </span>
              </div>

              <div className="space-y-3 font-label-mono">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-ink-body">GPU Allocation (H100 SXM5)</span>
                    <span className="text-ink-primary font-semibold">24 / 24 Active</span>
                  </div>
                  <div className="w-full bg-canvas-alternate h-1.5 rounded-full overflow-hidden">
                    <div className="bg-accent-olive h-full w-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-ink-body">Secondary Fleet (L40S / RTX)</span>
                    <span className="text-ink-primary font-semibold">8 / 16 In Use</span>
                  </div>
                  <div className="w-full bg-canvas-alternate h-1.5 rounded-full overflow-hidden">
                    <div className="bg-status-healthy h-full w-1/2"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-ink-body">InfiniBand Fabric Load</span>
                    <span className="text-ink-primary font-semibold">412 GB/s (72%)</span>
                  </div>
                  <div className="w-full bg-canvas-alternate h-1.5 rounded-full overflow-hidden">
                    <div className="bg-accent-olive h-full w-[72%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-ink-body">Preemption Headroom</span>
                    <span className="text-status-healthy font-semibold">99.8% (0 drops)</span>
                  </div>
                  <div className="w-full bg-canvas-alternate h-1.5 rounded-full overflow-hidden">
                    <div className="bg-status-healthy h-full w-[99.8%]"></div>
                  </div>
                </div>
              </div>

              {/* Node health badges */}
              <div className="mt-4 pt-3 border-t border-hairline-subtle grid grid-cols-2 gap-2 text-[11px] font-label-mono">
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                  <span>CoreWeave: 12/12</span>
                </div>
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                  <span>RunPod: 8/8</span>
                </div>
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                  <span>Lambda: 4/4</span>
                </div>
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                  <span>Crusoe: Standby</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-hairline-subtle flex items-center justify-between text-ink-muted text-xs font-label-mono">
              <span>Active Quota: 64 GPUs</span>
              <button
                onClick={onOpenEarlyAccess}
                className="text-accent-olive hover:underline font-semibold"
              >
                Request Scale
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SupportedCloudsStrip } from '../components/SupportedCloudsStrip';
import { ComputeTopologyMesh } from '../components/ComputeTopologyMesh';
import {
  DigitalTwinDiagram,
  ArbitrageDiagram,
  CheckpointDiagram,
} from '../components/FeatureArchitectureDiagrams';
import { SEO } from '../components/SEO';
import { FAQSection } from '../components/FAQSection';
import { trackConversion } from '../utils/analytics';

interface HomePageProps {
  onOpenEarlyAccess: () => void;
}

type WorkloadPresetKey = 'llama-7b' | 'deepseek-moe' | 'flux-latent';

interface WorkloadPreset {
  id: WorkloadPresetKey;
  label: string;
  badge: string;
  prompt: string;
  constraints: { icon: string; label: string }[];
  defaultPlanId: number;
  recommendation: {
    headline: string;
    details: string;
    metrics: { label: string; value: string; positive?: boolean }[];
  };
  options: {
    id: number;
    num: string;
    name: string;
    provider: string;
    cost: string;
    runtime: string;
    memory: string;
    status: string;
    isRec: boolean;
  }[];
}

const WORKLOAD_PRESETS: Record<WorkloadPresetKey, WorkloadPreset> = {
  'llama-7b': {
    id: 'llama-7b',
    label: 'Llama-3-7B Fine-tune',
    badge: '8h Deadline · $50 Budget',
    prompt: 'Fine-tune a 7B parameter model. Finish within 8 hours. Minimize total cost.',
    constraints: [
      { icon: 'payments', label: 'Budget: $50' },
      { icon: 'schedule', label: 'Deadline: 8 hours' },
      { icon: 'memory', label: 'GPU memory: 24 GB+' },
      { icon: 'dns', label: 'Region: Preferred low-latency' },
    ],
    defaultPlanId: 2,
    recommendation: {
      headline: 'Option 02 (NVIDIA 8x L40S 48GB) selected for optimal memory roofline efficiency.',
      details:
        'LoRA gradient accumulation is strictly memory-bandwidth bounded (42 FLOPs/byte). The 8x L40S cluster pools 384 GB VRAM with 6.8 TB/s aggregate bandwidth, saving $4.60 beneath budget with a 25-minute buffer. Single H100 leaves 63% tensor cores idle.',
      metrics: [
        { label: 'Budget Surplus', value: '+$4.60 (9.2%)', positive: true },
        { label: 'Time Buffer', value: '25m safety margin', positive: true },
        { label: 'Compute Fit', value: '98.4% Roofline Match', positive: true },
      ],
    },
    options: [
      {
        id: 1,
        num: '01',
        name: 'NVIDIA H100 SXM5 80GB',
        provider: 'CoreWeave Cluster Node · Direct InfiniBand',
        cost: '$32.40',
        runtime: '5h 20m',
        memory: '80 GB',
        status: 'Compatible',
        isRec: false,
      },
      {
        id: 2,
        num: '02',
        name: 'NVIDIA 8x L40S 48GB',
        provider: 'RunPod Secure Cloud · PCIe Gen4 Mesh',
        cost: '$27.80',
        runtime: '7h 35m',
        memory: '384 GB',
        status: 'Best Tradeoff',
        isRec: true,
      },
      {
        id: 3,
        num: '03',
        name: 'NVIDIA A100 80GB PCIe',
        provider: 'Lambda Cloud · Dedicated On-Demand',
        cost: '$41.20',
        runtime: '4h 10m',
        memory: '80 GB',
        status: 'Compatible',
        isRec: false,
      },
      {
        id: 4,
        num: '04',
        name: 'NVIDIA GH200 Grace Hopper',
        provider: 'Crusoe Cloud · Geothermal Zero-Carbon',
        cost: '$36.50',
        runtime: '4h 45m',
        memory: '576 GB',
        status: 'Overprovisioned',
        isRec: false,
      },
    ],
  },
  'deepseek-moe': {
    id: 'deepseek-moe',
    label: 'DeepSeek-R1-671B MoE Sharding',
    badge: '48h SLA · $600 Budget',
    prompt:
      'Deploy distributed FP8 checkpoint across multi-host cluster. 671B MoE activation with 37B active parameters.',
    constraints: [
      { icon: 'payments', label: 'Budget: $600' },
      { icon: 'schedule', label: 'Deadline: 48 hours' },
      { icon: 'memory', label: 'Aggregate VRAM: 600 GB+' },
      { icon: 'lan', label: 'Fabric: 3.2 Tbps InfiniBand NDR' },
    ],
    defaultPlanId: 1,
    recommendation: {
      headline: 'Option 01 (8x NVIDIA H100 SXM5 80GB) selected for high-speed all-to-all NVLink interconnect.',
      details:
        'MoE token dispatch requires 900 GB/s inter-GPU bandwidth during dynamic routing. PCIe-based alternatives incur 4.2x latency overhead. H100 SXM5 completes execution in 22h 10m ($488.40) with zero OOM risk.',
      metrics: [
        { label: 'Cost Reserve', value: '$111.60 under cap', positive: true },
        { label: 'SLA Margin', value: '25h 50m early', positive: true },
        { label: 'Fabric Saturation', value: '88.2% NDR Utilized', positive: true },
      ],
    },
    options: [
      {
        id: 1,
        num: '01',
        name: '8x NVIDIA H100 SXM5 80GB',
        provider: 'CoreWeave Supercluster · 3.2 Tbps Quantum-2 IB',
        cost: '$488.40',
        runtime: '22h 10m',
        memory: '640 GB',
        status: 'Recommended',
        isRec: true,
      },
      {
        id: 2,
        num: '02',
        name: '8x NVIDIA GH200 NVL4',
        provider: 'Crusoe Cloud · Coherent LPDDR5X + HBM3',
        cost: '$540.00',
        runtime: '19h 40m',
        memory: '3,840 GB',
        status: 'Highest Perf',
        isRec: false,
      },
      {
        id: 3,
        num: '03',
        name: '16x NVIDIA A100 80GB SXM4',
        provider: 'Lambda Cloud · 2x Node InfiniBand HDR',
        cost: '$582.00',
        runtime: '41h 15m',
        memory: '1,280 GB',
        status: 'Near Deadline',
        isRec: false,
      },
      {
        id: 4,
        num: '04',
        name: '32x NVIDIA L40S 48GB',
        provider: 'RunPod · Distributed RoCE v2',
        cost: '$620.00',
        runtime: '58h 00m',
        memory: '1,536 GB',
        status: 'SLA Breach',
        isRec: false,
      },
    ],
  },
  'flux-latent': {
    id: 'flux-latent',
    label: 'Flux.1 Diffusion Batch Synthesis',
    badge: '2h SLA · High-Throughput Batch',
    prompt:
      'Batch generate 50,000 diffusion steps with 16-channel VAE latent decoding. Latency-tolerant pipeline.',
    constraints: [
      { icon: 'payments', label: 'Budget: $20' },
      { icon: 'schedule', label: 'Deadline: 2 hours' },
      { icon: 'memory', label: 'GPU memory: 24 GB' },
      { icon: 'speed', label: 'Target: 120 img/min' },
    ],
    defaultPlanId: 2,
    recommendation: {
      headline: 'Option 02 (4x NVIDIA RTX 4090 24GB) selected for maximum FP16 TFLOPS per dollar.',
      details:
        'Flux.1 DiT transformer blocks operate at 110 FLOPs/byte, saturating Ada Tensor cores without enterprise fabric requirements. Spot arbitrage secures $6.15 total cost (-68% vs enterprise A100).',
      metrics: [
        { label: 'Total Savings', value: '-68.5% Arbitrage', positive: true },
        { label: 'Job Runtime', value: '1h 14m (46m buffer)', positive: true },
        { label: 'Throughput', value: '142 img/min sustained', positive: true },
      ],
    },
    options: [
      {
        id: 1,
        num: '01',
        name: 'NVIDIA H100 NVL 94GB',
        provider: 'CoreWeave Dedicated Batch Node',
        cost: '$18.40',
        runtime: '0h 42m',
        memory: '94 GB',
        status: 'Overkill',
        isRec: false,
      },
      {
        id: 2,
        num: '02',
        name: '4x NVIDIA RTX 4090 24GB',
        provider: 'RunPod Community Spot · Local NVMe',
        cost: '$6.15',
        runtime: '1h 14m',
        memory: '96 GB',
        status: 'Max Efficiency',
        isRec: true,
      },
      {
        id: 3,
        num: '03',
        name: '2x NVIDIA L40S 48GB',
        provider: 'Lambda Cloud Dedicated',
        cost: '$11.80',
        runtime: '0h 58m',
        memory: '96 GB',
        status: 'Compatible',
        isRec: false,
      },
      {
        id: 4,
        num: '04',
        name: 'NVIDIA A10G 24GB (Spot)',
        provider: 'AWS EC2 g5.12xlarge',
        cost: '$14.20',
        runtime: '1h 48m',
        memory: '96 GB',
        status: 'Compatible',
        isRec: false,
      },
    ],
  },
};

export const HomePage: React.FC<HomePageProps> = ({ onOpenEarlyAccess }) => {
  const [selectedPresetKey, setSelectedPresetKey] = useState<WorkloadPresetKey>('llama-7b');
  const [selectedPlan, setSelectedPlan] = useState<number>(2);
  const [emailInput, setEmailInput] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [homeHoneypot, setHomeHoneypot] = useState('');

  const currentPreset = WORKLOAD_PRESETS[selectedPresetKey];

  const handlePresetChange = (key: WorkloadPresetKey) => {
    setSelectedPresetKey(key);
    setSelectedPlan(WORKLOAD_PRESETS[key].defaultPlanId);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeHoneypot.trim() !== '') {
      setEmailSubmitted(true);
      return;
    }
    if (emailInput.trim()) {
      trackConversion('home_waitlist_signup', { email: emailInput });
      setEmailSubmitted(true);
    }
  };

  return (
    <main className="flex-1 w-full">
      <SEO
        title="Autonomous AI Compute Intelligence &amp; GPU Broker"
        description="Your AI workloads. Always on the right compute. Multi-cloud GPU orchestration with 99.98% preemption immunity and continuous spot arbitrage."
        canonicalPath="/"
      />
      {/* ========================================== */}
      {/* 2. HERO SECTION                            */}
      {/* ========================================== */}
      <section
        className="pt-12 pb-10 sm:pt-16 sm:pb-12 md:pt-24 md:pb-16 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center"
        id="hero"
      >
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas-alternate border border-hairline-default rounded-full mb-6 sm:mb-8 max-w-full">
          <span className="w-2 h-2 rounded-full bg-status-healthy shrink-0"></span>
          <span className="font-label-mono text-[11px] sm:text-label-mono uppercase text-ink-body tracking-wider truncate">
            COMPUTE INTELLIGENCE, REIMAGINED
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl lg:text-headline-xl max-w-4xl text-ink-primary tracking-tight mb-4 sm:mb-6">
          Your AI workloads. Always on the{' '}
          <span className="text-accent-olive font-medium">right compute</span>.
        </h1>

        {/* Subhead */}
        <p className="font-body-lg text-sm sm:text-body-lg text-ink-muted max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
          Kynetic finds the best way to run your AI workloads across compute providers—balancing
          cost, performance, reliability, and time to completion.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-xs sm:max-w-none">
          <button
            onClick={onOpenEarlyAccess}
            className="inline-flex items-center justify-center h-11 sm:h-10 px-6 bg-ink-primary hover:bg-accent-olive-deep text-canvas-base rounded-full font-label-mono text-xs sm:text-label-mono font-medium transition-all duration-150 active:scale-[0.98] min-h-[44px]"
          >
            Get early access ↗
          </button>
          <a
            className="inline-flex items-center justify-center h-11 sm:h-10 px-6 bg-transparent hover:bg-canvas-alternate border border-hairline-default hover:border-ink-primary text-ink-primary rounded-full font-label-mono text-xs sm:text-label-mono font-medium transition-all duration-150 min-h-[44px]"
            href="#platform"
          >
            Explore the platform →
          </a>
        </div>

        {/* Trust Line */}
        <p className="font-label-mono text-[11px] sm:text-label-mono text-ink-subtle uppercase tracking-wider mb-6 sm:mb-8 px-2">
          Built for AI engineers, research teams, and compute-intensive businesses.
        </p>

        {/* Cloud Supported Logos Strip (Original Colors, Light Webpage Background) */}
        <SupportedCloudsStrip className="mt-2 w-full" />
      </section>

      {/* ========================================== */}
      {/* 3. HERO PRODUCT VISUALIZATION (PLANNER)   */}
      {/* ========================================== */}
      <section className="px-3.5 sm:px-6 md:px-12 max-w-7xl mx-auto pb-16 sm:pb-24" id="workload-planner">
        <div className="border border-hairline-default rounded-lg bg-surface-elevated overflow-hidden shadow-sm">
          {/* Planner Header Terminal Strip */}
          <div className="bg-canvas-alternate px-3.5 sm:px-6 py-3 border-b border-hairline-default flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="font-label-mono text-xs sm:text-label-mono uppercase tracking-wider text-ink-primary font-semibold">
                WORKLOAD PLANNER
              </span>
              <span className="text-hairline-strong font-label-mono text-label-mono hidden sm:inline">|</span>
              <span className="font-label-mono text-[11px] sm:text-label-mono text-ink-muted">
                v2.4 Kernel Optimizer &amp; Roofline Twin
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-full bg-canvas-base border border-hairline-default">
              <span className="w-2 h-2 rounded-full bg-status-active"></span>
              <span className="font-label-mono text-[10px] sm:text-label-mono text-ink-body">
                AUTONOMOUS ROUTING ENGINE
              </span>
            </div>
          </div>

          {/* Compute Topology Mesh Visualization */}
          <div className="border-b border-hairline-default overflow-hidden">
            <ComputeTopologyMesh />
          </div>

          <div className="p-3.5 sm:p-6 md:p-8">
            {/* 4-Stage Autonomous Intelligence Flow Pipeline */}
            <div className="mb-6 border border-hairline-default rounded-md bg-canvas-base p-3 sm:p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-2.5">
                <span className="font-label-mono text-[10px] sm:text-[11px] text-ink-muted uppercase tracking-wider font-semibold">
                  INTELLIGENCE PIPELINE FLOW
                </span>
                <span className="font-label-mono text-[10px] sm:text-[11px] text-status-healthy flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-healthy animate-pulse"></span>
                  Multi-Provider Telemetry Active
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-left">
                <div className="p-2.5 rounded bg-surface-elevated border border-hairline-default">
                  <div className="font-label-mono text-[10px] text-accent-olive font-semibold">STAGE 01</div>
                  <div className="font-headline-sm text-xs text-ink-primary font-medium">Intent Ingestion</div>
                  <div className="font-label-mono text-[10px] text-ink-muted">Tokens, Batch &amp; Memory Floor</div>
                </div>
                <div className="p-2.5 rounded bg-surface-elevated border border-hairline-default">
                  <div className="font-label-mono text-[10px] text-accent-olive font-semibold">STAGE 02</div>
                  <div className="font-headline-sm text-xs text-ink-primary font-medium">Roofline Twin</div>
                  <div className="font-label-mono text-[10px] text-ink-muted">Bandwidth vs Compute Bounds</div>
                </div>
                <div className="p-2.5 rounded bg-surface-elevated border border-hairline-default">
                  <div className="font-label-mono text-[10px] text-accent-olive font-semibold">STAGE 03</div>
                  <div className="font-headline-sm text-xs text-ink-primary font-medium">Arbitrage Sweep</div>
                  <div className="font-label-mono text-[10px] text-ink-muted">Egress &amp; Spot Crossover Delta</div>
                </div>
                <div className="p-2.5 rounded bg-canvas-alternate border border-accent-olive">
                  <div className="font-label-mono text-[10px] text-accent-olive font-bold">STAGE 04</div>
                  <div className="font-headline-sm text-xs text-ink-primary font-semibold">Autonomous Dispatch</div>
                  <div className="font-label-mono text-[10px] text-ink-body font-medium">Checkpoint Verified Target</div>
                </div>
              </div>
            </div>

            {/* Workload Presets Switcher */}
            <div className="mb-4">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
                <label className="block font-label-mono text-xs sm:text-label-mono text-ink-muted uppercase tracking-wider">
                  Select Workload Simulation Preset:
                </label>
                <span className="font-label-mono text-[10px] sm:text-[11px] text-ink-subtle">
                  Click to inspect live routing
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['llama-7b', 'deepseek-moe', 'flux-latent'] as WorkloadPresetKey[]).map((key) => {
                  const preset = WORKLOAD_PRESETS[key];
                  const isActive = selectedPresetKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handlePresetChange(key)}
                      className={`text-left p-3 rounded border transition-all text-xs min-h-[44px] ${
                        isActive
                          ? 'bg-canvas-alternate border-accent-olive ring-1 ring-accent-olive text-ink-primary'
                          : 'bg-canvas-base border-hairline-default text-ink-muted hover:border-hairline-strong hover:text-ink-primary'
                      }`}
                    >
                      <div className="font-headline-sm font-medium text-ink-primary">{preset.label}</div>
                      <div className="font-label-mono text-[11px] text-accent-olive font-medium mt-0.5">
                        {preset.badge}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User Input Prompt Box */}
            <div className="mb-6">
              <label className="block font-label-mono text-xs sm:text-label-mono text-ink-muted uppercase tracking-wider mb-2">
                Parsed Natural Language Intent
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-canvas-base border border-hairline-default rounded-md text-ink-primary gap-2">
                <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                  <span className="material-symbols-outlined text-accent-olive text-lg shrink-0 mt-0.5 sm:mt-0">terminal</span>
                  <span className="font-body-md text-sm sm:text-body-md text-ink-primary font-medium leading-relaxed">
                    {currentPreset.prompt}
                  </span>
                </div>
                <span className="font-label-mono text-[11px] sm:text-label-mono text-ink-muted bg-canvas-alternate px-2 py-0.5 sm:py-1 rounded border border-hairline-subtle self-start sm:self-auto shrink-0">
                  PARSED INTENT
                </span>
              </div>
            </div>

            {/* Constraint Chips Row */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
              <span className="font-label-mono text-xs sm:text-label-mono text-ink-muted mr-1">
                Constraints:
              </span>
              {currentPreset.constraints.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-canvas-alternate border border-hairline-default rounded text-ink-body font-label-mono text-xs sm:text-label-mono min-h-[32px]"
                >
                  <span className="material-symbols-outlined text-xs sm:text-sm text-ink-muted">{c.icon}</span>
                  {c.label}
                </span>
              ))}
            </div>

            {/* Mobile View: Dedicated Responsive Cards (< sm) */}
            <div className="block sm:hidden space-y-3">
              {currentPreset.options.map((opt) => {
                const isSelected = selectedPlan === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedPlan(opt.id)}
                    className={`p-3.5 rounded border transition-colors cursor-pointer text-left ${
                      opt.isRec
                        ? 'border-2 border-accent-olive bg-[#FAF9F5] ' +
                          (isSelected ? 'ring-2 ring-accent-olive shadow-sm' : '')
                        : isSelected
                        ? 'bg-canvas-base border-l-4 border-l-ink-primary border-hairline-default'
                        : 'bg-surface-elevated border-hairline-default hover:border-hairline-strong'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-label-mono text-xs ${opt.isRec ? 'text-accent-olive font-bold' : 'text-ink-subtle'}`}>
                          {opt.num}
                        </span>
                        <span className={`font-headline-sm text-sm text-ink-primary ${opt.isRec ? 'font-semibold' : 'font-medium'}`}>
                          {opt.name}
                        </span>
                      </div>
                      {opt.isRec && (
                        <span className="px-2 py-0.5 rounded-full bg-accent-olive text-canvas-base font-label-mono font-medium text-[9px] shrink-0">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-ink-muted mb-3 font-body-sm">
                      {opt.provider}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-hairline-subtle font-label-mono text-xs">
                      <div>
                        <div className="text-ink-subtle text-[10px] uppercase">Est. Total</div>
                        <div className={`text-sm font-semibold ${opt.isRec ? 'text-accent-olive' : 'text-ink-primary'}`}>
                          {opt.cost}
                        </div>
                      </div>
                      <div>
                        <div className="text-ink-subtle text-[10px] uppercase">Runtime</div>
                        <div className="text-ink-body font-medium">{opt.runtime}</div>
                      </div>
                      <div>
                        <div className="text-ink-subtle text-[10px] uppercase">Memory</div>
                        <div className="text-ink-muted">{opt.memory}</div>
                      </div>
                      <div>
                        <div className="text-ink-subtle text-[10px] uppercase">Status</div>
                        <div className="inline-flex items-center gap-1 font-medium text-ink-body">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              opt.isRec
                                ? 'bg-status-active'
                                : opt.status === 'SLA Breach'
                                ? 'bg-red-500'
                                : 'bg-status-healthy'
                            }`}
                          ></span>
                          <span>{opt.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop / Tablet View: Horizontally Scrollable Comparison Table (sm+) */}
            <div className="hidden sm:block border border-hairline-default rounded overflow-x-auto">
              <div className="min-w-[620px]">
                <div className="bg-canvas-alternate grid grid-cols-12 px-5 py-2.5 font-label-mono text-label-mono uppercase tracking-wider text-ink-muted border-b border-hairline-default">
                  <div className="col-span-5">Provider &amp; Architecture</div>
                  <div className="col-span-2 text-right">Estimated Total</div>
                  <div className="col-span-2 text-right">Runtime</div>
                  <div className="col-span-1 text-center">Memory</div>
                  <div className="col-span-2 text-right">Status</div>
                </div>

                {currentPreset.options.map((opt) => {
                  const isSelected = selectedPlan === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedPlan(opt.id)}
                      className={`grid grid-cols-12 px-5 py-4 items-center border-b border-hairline-subtle transition-colors cursor-pointer ${
                        opt.isRec
                          ? 'border-y-2 border-accent-olive bg-[#FAF9F5] relative ' +
                            (isSelected ? 'ring-1 ring-accent-olive shadow-sm' : '')
                          : isSelected
                          ? 'bg-canvas-base border-l-4 border-l-ink-primary'
                          : 'hover:bg-canvas-base'
                      }`}
                    >
                      <div className="col-span-5 flex items-center gap-3">
                        <span
                          className={`font-label-mono text-label-mono ${
                            opt.isRec ? 'text-accent-olive font-bold' : 'text-ink-subtle'
                          }`}
                        >
                          {opt.num}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-headline-sm text-title-sm text-ink-primary ${
                                opt.isRec ? 'font-semibold' : 'font-medium'
                              }`}
                            >
                              {opt.name}
                            </span>
                            {opt.isRec && (
                              <span className="px-2 py-0.5 rounded-full bg-accent-olive text-canvas-base font-label-mono text-label-mono font-medium text-[10px]">
                                RECOMMENDED
                              </span>
                            )}
                          </div>
                          <div
                            className={`font-body-sm text-body-sm ${
                              opt.isRec ? 'text-accent-olive font-medium' : 'text-ink-muted'
                            }`}
                          >
                            {opt.provider}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`col-span-2 text-right font-headline-sm text-title-sm text-ink-primary ${
                          opt.isRec ? 'font-semibold' : 'font-medium'
                        }`}
                      >
                        {opt.cost}
                      </div>
                      <div
                        className={`col-span-2 text-right font-body-md text-body-md ${
                          opt.isRec ? 'text-ink-primary font-medium' : 'text-ink-body'
                        }`}
                      >
                        {opt.runtime}
                      </div>
                      <div className="col-span-1 text-center font-label-mono text-label-mono text-ink-muted">
                        {opt.memory}
                      </div>
                      <div className="col-span-2 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border font-label-mono text-label-mono ${
                            opt.isRec
                              ? 'bg-canvas-alternate border-accent-olive text-ink-primary font-medium'
                              : 'bg-canvas-alternate border-hairline-default text-ink-body'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              opt.isRec
                                ? 'bg-status-active'
                                : opt.status === 'SLA Breach'
                                ? 'bg-red-500'
                                : 'bg-status-healthy'
                            }`}
                          ></span>
                          {opt.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendation Rationale Callout Card */}
            <div className="mt-4 p-4 sm:p-5 rounded-lg border border-hairline-default bg-[#FAF9F5] flex flex-col md:flex-row gap-4 sm:gap-5 items-start md:items-center justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-status-healthy"></span>
                  <span className="font-label-mono text-xs sm:text-label-mono font-bold text-accent-olive uppercase tracking-wider">
                    RECOMMENDATION RATIONALE
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-canvas-alternate border border-hairline-subtle font-label-mono text-ink-muted">
                    Deterministic Math
                  </span>
                </div>
                <div className="font-headline-sm text-sm sm:text-body-md text-ink-primary font-semibold mb-1">
                  {currentPreset.recommendation.headline}
                </div>
                <p className="font-body-sm text-xs sm:text-body-sm text-ink-muted leading-relaxed">
                  {currentPreset.recommendation.details}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                {currentPreset.recommendation.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex-1 md:flex-initial px-3 py-1.5 rounded bg-surface-elevated border border-hairline-default font-label-mono text-label-mono flex items-center justify-between gap-4"
                  >
                    <span className="text-ink-muted text-[11px]">{m.label}</span>
                    <span
                      className={`font-semibold text-[11px] ${
                        m.positive ? 'text-accent-olive' : 'text-ink-primary'
                      }`}
                    >
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-ink-muted font-label-mono text-xs sm:text-label-mono gap-2">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-ink-subtle">info</span>
                Calculated via eBPF hardware profiling &amp; dynamic spot arbitrage engine.
              </span>
              <span className="text-ink-subtle">Kynetic Routing Engine v2.14.0 · 20Hz Telemetry</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 4. POSITIONING / CAPABILITY STRIP          */}
      {/* ========================================== */}
      <section className="border-y border-hairline-default bg-canvas-alternate py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <p className="font-label-mono text-xs sm:text-label-mono uppercase tracking-widest text-ink-muted text-center mb-6 sm:mb-8">
            ONE INTELLIGENCE LAYER. MULTIPLE COMPUTE PROVIDERS.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-hairline-default pb-6 md:pb-0 md:pr-6">
              <div className="font-headline-sm text-base sm:text-title-md text-ink-primary font-medium mb-1">
                Compare total cost
              </div>
              <p className="font-body-sm text-xs sm:text-body-sm text-ink-muted">
                Factor in start latency, egress penalties, memory overhead, and true job completion
                duration.
              </p>
            </div>
            <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-hairline-default pb-6 md:pb-0 md:px-6">
              <div className="font-headline-sm text-base sm:text-title-sm text-ink-primary font-medium mb-1">
                Predict workload performance
              </div>
              <p className="font-body-sm text-xs sm:text-body-sm text-ink-muted">
                Simulate runtime accuracy based on model parameter architecture and memory
                bandwidth constraints.
              </p>
            </div>
            <div className="text-center md:text-left md:pl-6">
              <div className="font-headline-sm text-base sm:text-title-sm text-ink-primary font-medium mb-1">
                Optimize execution
              </div>
              <p className="font-body-sm text-xs sm:text-body-sm text-ink-muted">
                Continuously assess whether migrating or rebalancing checkpoints yields net
                savings under live conditions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 5. PROBLEM -> SOLUTION (01, 02, 03)        */}
      {/* ========================================== */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto" id="platform">
        <div className="mb-10 sm:mb-16 max-w-3xl">
          <span className="font-label-mono text-xs sm:text-label-mono uppercase tracking-wider text-accent-olive font-semibold mb-2 block">
            THE COMPUTATION DILEMMA
          </span>
          <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-headline-lg text-ink-primary tracking-tight mb-3 sm:mb-4">
            Choosing a GPU shouldn't be guesswork.
          </h2>
          <p className="font-body-lg text-sm sm:text-body-lg text-ink-muted leading-relaxed">
            Hourly pricing only tells part of the story. The real cost depends on runtime, startup
            delays, data movement, failures, and recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border border-hairline-default rounded-lg bg-surface-elevated overflow-hidden divide-y md:divide-y-0 md:divide-x divide-hairline-default">
          {/* Column 01 */}
          <div className="p-5 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="font-label-mono text-xs sm:text-label-mono text-ink-subtle uppercase tracking-wider mb-4 sm:mb-6">
                STEP 01
              </div>
              <h3 className="font-headline-sm text-lg sm:text-headline-sm text-ink-primary font-medium mb-3 sm:mb-4">
                01 — Compare beyond hourly rates
              </h3>
              <p className="font-body-md text-xs sm:text-body-md text-ink-muted leading-relaxed mb-6">
                A cheaper GPU per hour that runs twice as long costs more. Kynetic models actual
                runtimes across hardware generations before you provision a single minute of
                compute.
              </p>
            </div>
            <div className="p-3.5 sm:p-4 bg-canvas-alternate rounded border border-hairline-subtle font-label-mono text-xs sm:text-label-mono text-ink-body">
              <div className="flex justify-between mb-1">
                <span>Hourly Rate</span>
                <span className="text-ink-subtle">Partial truth</span>
              </div>
              <div className="flex justify-between font-medium text-ink-primary">
                <span>Actual Job Cost</span>
                <span className="text-accent-olive">Model Runtime × Rate + Egress</span>
              </div>
            </div>
          </div>

          {/* Column 02 */}
          <div className="p-5 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="font-label-mono text-xs sm:text-label-mono text-ink-subtle uppercase tracking-wider mb-4 sm:mb-6">
                STEP 02
              </div>
              <h3 className="font-headline-sm text-lg sm:text-headline-sm text-ink-primary font-medium mb-3 sm:mb-4">
                02 — Predict before you provision
              </h3>
              <p className="font-body-md text-xs sm:text-body-md text-ink-muted leading-relaxed mb-6">
                Input your model size, batch parameters, and framework. Our performance twin
                predicts memory fit, time-to-completion, and throttling probability with calibrated
                confidence intervals.
              </p>
            </div>
            <div className="p-3.5 sm:p-4 bg-canvas-alternate rounded border border-hairline-subtle font-label-mono text-xs sm:text-label-mono text-ink-body">
              <div className="flex justify-between mb-1">
                <span>Runtime Variance</span>
                <span className="text-status-healthy">± 4.2% Verified</span>
              </div>
              <div className="flex justify-between font-medium text-ink-primary">
                <span>OOM Prevention</span>
                <span className="text-status-healthy">100% Guardrail</span>
              </div>
            </div>
          </div>

          {/* Column 03 */}
          <div className="p-5 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="font-label-mono text-xs sm:text-label-mono text-ink-subtle uppercase tracking-wider mb-4 sm:mb-6">
                STEP 03
              </div>
              <h3 className="font-headline-sm text-lg sm:text-headline-sm text-ink-primary font-medium mb-3 sm:mb-4">
                03 — Optimize as conditions change
              </h3>
              <p className="font-body-md text-xs sm:text-body-md text-ink-muted leading-relaxed mb-6">
                Spot market drops or node degradations trigger real-time arbitrage. Kynetic
                calculates whether the cost of migrating checkpoints is offset by the destination's
                superior efficiency.
              </p>
            </div>
            <div className="p-3.5 sm:p-4 bg-canvas-alternate rounded border border-hairline-subtle font-label-mono text-xs sm:text-label-mono text-ink-body">
              <div className="flex justify-between mb-1">
                <span>Arbitrage Gain</span>
                <span className="text-accent-olive">Net positive threshold</span>
              </div>
              <div className="flex justify-between font-medium text-ink-primary">
                <span>Migration Friction</span>
                <span className="text-ink-subtle">&lt; 90s Pause overhead</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 6. HOW IT WORKS (Horizontal Pipeline)      */}
      {/* ========================================== */}
      <section className="py-16 sm:py-20 border-t border-hairline-default bg-canvas-base" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16">
            <div>
              <span className="font-label-mono text-xs sm:text-label-mono uppercase tracking-wider text-accent-olive font-semibold mb-2 block">
                PIPELINE EXECUTION
              </span>
              <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-headline-lg text-ink-primary tracking-tight">
                From workload to execution.
              </h2>
            </div>
            <p className="font-body-md text-xs sm:text-body-md text-ink-muted max-w-md mt-3 md:mt-0">
              A continuous four-stage control loop running autonomously behind every training
              session, batch inference job, or fine-tuning run.
            </p>
          </div>

          {/* 4-step horizontal pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative">
            {/* Step 1 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-5 sm:p-6 flex flex-col justify-between relative hover:border-hairline-strong transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <span className="font-label-mono text-xs sm:text-label-mono font-bold px-2 py-0.5 rounded bg-canvas-alternate border border-hairline-default text-ink-primary">
                    01
                  </span>
                  <span className="material-symbols-outlined text-ink-muted">edit_note</span>
                </div>
                <h4 className="font-headline-sm text-base sm:text-title-md text-ink-primary font-medium mb-2">
                  Describe
                </h4>
                <p className="font-body-sm text-xs sm:text-body-sm text-ink-muted">
                  Define model parameters, target duration, hardware preferences, and budgetary
                  ceilings.
                </p>
              </div>
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-hairline-subtle font-label-mono text-[11px] sm:text-label-mono text-ink-subtle">
                Input parsing layer
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-5 sm:p-6 flex flex-col justify-between relative hover:border-hairline-strong transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <span className="font-label-mono text-xs sm:text-label-mono font-bold px-2 py-0.5 rounded bg-canvas-alternate border border-hairline-default text-ink-primary">
                    02
                  </span>
                  <span className="material-symbols-outlined text-ink-muted">analytics</span>
                </div>
                <h4 className="font-headline-sm text-base sm:text-title-md text-ink-primary font-medium mb-2">
                  Evaluate
                </h4>
                <p className="font-body-sm text-xs sm:text-body-sm text-ink-muted">
                  Simulate job performance across bare metal, multi-cloud, and secondary compute
                  clusters.
                </p>
              </div>
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-hairline-subtle font-label-mono text-[11px] sm:text-label-mono text-ink-subtle">
                Benchmark digital twin
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-5 sm:p-6 flex flex-col justify-between relative hover:border-hairline-strong transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <span className="font-label-mono text-xs sm:text-label-mono font-bold px-2 py-0.5 rounded bg-canvas-alternate border border-hairline-default text-ink-primary">
                    03
                  </span>
                  <span className="material-symbols-outlined text-ink-muted">alt_route</span>
                </div>
                <h4 className="font-headline-sm text-base sm:text-title-md text-ink-primary font-medium mb-2">
                  Plan
                </h4>
                <p className="font-body-sm text-xs sm:text-body-sm text-ink-muted">
                  Receive deterministic recommendations detailing exact financial, time, and
                  reliability metrics.
                </p>
              </div>
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-hairline-subtle font-label-mono text-[11px] sm:text-label-mono text-ink-subtle">
                Constrained routing
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-5 sm:p-6 flex flex-col justify-between relative hover:border-hairline-strong transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <span className="font-label-mono text-xs sm:text-label-mono font-bold px-2 py-0.5 rounded bg-canvas-alternate border border-hairline-default text-ink-primary">
                    04
                  </span>
                  <span className="material-symbols-outlined text-ink-muted">sync</span>
                </div>
                <h4 className="font-headline-sm text-base sm:text-title-md text-ink-primary font-medium mb-2">
                  Optimize
                </h4>
                <p className="font-body-sm text-xs sm:text-body-sm text-ink-muted">
                  Maintain active telemetry to dynamically checkpoint, pause, or rebalance execution
                  if costs fluctuate.
                </p>
              </div>
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-hairline-subtle font-label-mono text-[11px] sm:text-label-mono text-ink-subtle">
                Active telemetry loop
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 7. COMPUTE INTELLIGENCE SECTION            */}
      {/* ========================================== */}
      <section className="py-16 sm:py-20 md:py-24 bg-canvas-alternate border-y border-hairline-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="max-w-2xl mb-10 sm:mb-16">
            <span className="font-label-mono text-xs sm:text-label-mono uppercase tracking-wider text-accent-olive font-semibold mb-2 block">
              CORE ARCHITECTURE
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-headline-lg text-ink-primary tracking-tight mb-3 sm:mb-4">
              Not another GPU marketplace. An intelligence layer.
            </h2>
            <p className="font-body-lg text-sm sm:text-body-lg text-ink-muted leading-relaxed">
              Marketplaces sell capacity. Kynetic optimizes decisions across all of them without
              lock-in or supplier preference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-5 sm:p-6 flex flex-col justify-between hover:border-hairline-strong transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded bg-canvas-alternate border border-hairline-default flex items-center justify-center">
                    <span className="material-symbols-outlined text-ink-primary text-lg">model_training</span>
                  </div>
                  <span className="font-label-mono text-[10px] sm:text-[11px] text-accent-olive font-semibold px-2 py-0.5 rounded bg-canvas-alternate border border-hairline-default">
                    CORE 01
                  </span>
                </div>
                <h3 className="font-headline-sm text-base sm:text-title-md text-ink-primary font-medium mb-2">
                  Workload Performance Digital Twin
                </h3>
                <p className="font-body-sm text-xs sm:text-body-sm text-ink-muted leading-relaxed mb-4">
                  Predict runtime, cost, and memory saturation before launch. Built using actual
                  execution curves across thousands of foundation models.
                </p>

                {/* Bespoke Interactive Diagram */}
                <div className="mb-4 overflow-x-auto">
                  <DigitalTwinDiagram />
                </div>
              </div>

              <ul className="space-y-2 border-t border-hairline-subtle pt-4 font-label-mono text-xs sm:text-label-mono text-ink-body">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-healthy shrink-0"></span>
                  <span>Bandwidth profiling (PCIe vs NVLink)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-healthy shrink-0"></span>
                  <span>Batch throughput curves</span>
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-5 sm:p-6 flex flex-col justify-between hover:border-hairline-strong transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded bg-canvas-alternate border border-hairline-default flex items-center justify-center">
                    <span className="material-symbols-outlined text-ink-primary text-lg">balance</span>
                  </div>
                  <span className="font-label-mono text-[10px] sm:text-[11px] text-accent-olive font-semibold px-2 py-0.5 rounded bg-canvas-alternate border border-hairline-default">
                    CORE 02
                  </span>
                </div>
                <h3 className="font-headline-sm text-base sm:text-title-md text-ink-primary font-medium mb-2">
                  Predictive Compute Arbitrage
                </h3>
                <p className="font-body-sm text-xs sm:text-body-sm text-ink-muted leading-relaxed mb-4">
                  Compare remaining workload cost against migration penalties in real time. Never
                  leave money on the table when secondary market spot prices dive.
                </p>

                {/* Bespoke Interactive Diagram */}
                <div className="mb-4 overflow-x-auto">
                  <ArbitrageDiagram />
                </div>
              </div>

              <ul className="space-y-2 border-t border-hairline-subtle pt-4 font-label-mono text-xs sm:text-label-mono text-ink-body">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-healthy shrink-0"></span>
                  <span>Egress cost compensation</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-healthy shrink-0"></span>
                  <span>SLA violation safeguards</span>
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-5 sm:p-6 flex flex-col justify-between relative hover:border-hairline-strong transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded bg-canvas-alternate border border-hairline-default flex items-center justify-center">
                    <span className="material-symbols-outlined text-ink-primary text-lg">
                      history_toggle_off
                    </span>
                  </div>
                  <span className="font-label-mono text-xs sm:text-label-mono px-2 py-0.5 rounded bg-canvas-alternate text-ink-muted border border-hairline-default">
                    Roadmap
                  </span>
                </div>
                <h3 className="font-headline-sm text-base sm:text-title-md text-ink-primary font-medium mb-2">
                  Checkpoint &amp; Resume
                </h3>
                <p className="font-body-sm text-xs sm:text-body-sm text-ink-muted leading-relaxed mb-4">
                  Seamlessly capture state across divergent hardware platforms without code alteration.
                  Moving an in-flight PyTorch session from Lambda to RunPod effortlessly.
                </p>

                {/* Bespoke Interactive Diagram */}
                <div className="mb-4 overflow-x-auto">
                  <CheckpointDiagram />
                </div>
              </div>

              <ul className="space-y-2 border-t border-hairline-subtle pt-4 font-label-mono text-xs sm:text-label-mono text-ink-body">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-subtle shrink-0"></span>
                  <span>Universal tensor state serialization</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-subtle shrink-0"></span>
                  <span>Zero-downtime shard re-hydration</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 8. DEVELOPER EXPERIENCE SECTION           */}
      {/* ========================================== */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto" id="developers">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Explanatory Column */}
          <div className="lg:col-span-5">
            <span className="font-label-mono text-xs sm:text-label-mono uppercase tracking-wider text-accent-olive font-semibold mb-2 block">
              SDK &amp; WORKFLOW
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-headline-lg text-ink-primary tracking-tight mb-3 sm:mb-4">
              Designed for developers. Built for real workloads.
            </h2>
            <p className="font-body-lg text-sm sm:text-body-lg text-ink-muted mb-6 sm:mb-8 leading-relaxed">
              Keep your existing workflows. Add a layer of intelligence around where and how your
              workloads run.
            </p>
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-accent-olive mt-0.5 text-lg shrink-0">
                  check_circle
                </span>
                <p className="font-body-md text-xs sm:text-body-md text-ink-body">
                  Native Python client with async scheduling primitives.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-accent-olive mt-0.5 text-lg shrink-0">
                  check_circle
                </span>
                <p className="font-body-md text-xs sm:text-body-md text-ink-body">
                  Drop-in compatibility with PyTorch, Ray, and Hugging Face Trainer.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-accent-olive mt-0.5 text-lg shrink-0">
                  check_circle
                </span>
                <p className="font-body-md text-xs sm:text-body-md text-ink-body">
                  Deterministic dry-runs via CLI to inspect cost curves locally.
                </p>
              </div>
            </div>
            <Link
              to="/docs"
              className="inline-flex items-center gap-2 font-headline-sm text-sm sm:text-title-sm text-ink-primary hover:text-accent-olive transition-colors font-medium min-h-[44px]"
            >
              <span>Explore the developer platform</span>
              <span>→</span>
            </Link>
          </div>

          {/* Right Terminal / Code Panel */}
          <div className="lg:col-span-7 w-full overflow-hidden">
            <div className="bg-[#141413] border border-[#2B2A27] rounded-lg overflow-hidden shadow-none w-full">
              {/* Terminal Titlebar */}
              <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#1C1B19] border-b border-[#2B2A27] flex items-center justify-between text-[#8E8D88] font-label-mono text-xs sm:text-label-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#33322E]"></span>
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#33322E]"></span>
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#33322E]"></span>
                  <span className="ml-1 sm:ml-2 text-[#C4C3BC] text-xs">plan_execution.py</span>
                </div>
                <span className="text-[11px] sm:text-xs">python3 · kynetic-v0.9.4</span>
              </div>
              {/* Code Content */}
              <div className="p-4 sm:p-6 technical-code text-xs sm:text-[13px] leading-relaxed overflow-x-auto text-[#E4E3DD]">
                <div>
                  <span className="text-[#7F7E77]"># 1. Initialize Kynetic compute layer</span>
                </div>
                <div>
                  <span className="text-[#B58A59]">import</span> kynetic{' '}
                  <span className="text-[#B58A59]">as</span> kc
                </div>
                <br />
                <div>
                  <span className="text-[#7F7E77]"># 2. Define workload constraint boundaries</span>
                </div>
                <div>plan = kc.plan(</div>
                <div className="pl-4">
                  workload=<span className="text-[#84A96C]">"fine-tune-llama-7b"</span>,
                </div>
                <div className="pl-4">
                  max_cost=<span className="text-[#5FB4B4]">50.00</span>,
                </div>
                <div className="pl-4">
                  deadline_hours=<span className="text-[#5FB4B4]">8.0</span>,
                </div>
                <div className="pl-4">
                  min_vram_gb=<span className="text-[#5FB4B4]">24</span>,
                </div>
                <div className="pl-4">
                  strategy=<span className="text-[#84A96C]">"min_total_cost"</span>
                </div>
                <div>)</div>
                <br />
                <div>
                  <span className="text-[#7F7E77]">
                    # 3. Inspect predictive digital twin recommendations
                  </span>
                </div>
                <div>
                  <span className="text-[#B58A59]">print</span>(f
                  <span className="text-[#84A96C]">
                    "Optimal Hardware: &#123;plan.recommended.architecture&#125;"
                  </span>
                  )
                </div>
                <div>
                  <span className="text-[#B58A59]">print</span>(f
                  <span className="text-[#84A96C]">
                    "Expected Duration: &#123;plan.recommended.estimated_runtime&#125;"
                  </span>
                  )
                </div>
                <div>
                  <span className="text-[#B58A59]">print</span>(f
                  <span className="text-[#84A96C]">
                    "Total Cost Est: $&#123;plan.recommended.total_cost:.2f&#125;"
                  </span>
                  )
                </div>
                <br />
                <div>
                  <span className="text-[#7F7E77]"># 4. Dispatch job through unified broker</span>
                </div>
                <div>
                  session = plan.execute(auto_checkpoint=
                  <span className="text-[#B58A59]">True</span>)
                </div>
              </div>
              {/* Panel Footer Disclaimer */}
              <div className="px-4 sm:px-5 py-2.5 bg-[#181816] border-t border-[#2B2A27] text-[10px] sm:text-[11px] text-[#7F7E77] font-label-mono">
                Conceptual SDK example — API availability and syntax are subject to implementation.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 8B. FREQUENTLY ASKED QUESTIONS            */}
      {/* ========================================== */}
      <FAQSection />

      {/* ========================================== */}
      {/* 9. FINAL SPACIOUS CTA                      */}
      {/* ========================================== */}
      <section className="py-16 sm:py-24 border-t border-hairline-default bg-canvas-base text-center" id="access">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <span className="font-label-mono text-xs sm:text-label-mono uppercase tracking-widest text-accent-olive font-semibold mb-3 sm:mb-4 block">
            GET STARTED
          </span>
          <h2 className="font-headline-xl text-3xl sm:text-4xl md:text-headline-xl text-ink-primary tracking-tight mb-4 sm:mb-6">
            Better compute decisions start here.
          </h2>
          <p className="font-body-lg text-sm sm:text-body-lg text-ink-muted max-w-xl mx-auto mb-8 sm:mb-10 px-2">
            Join leading machine learning teams using Kynetic to eliminate overprovisioning and run
            workloads on the optimal hardware.
          </p>

          {emailSubmitted ? (
            <div className="p-4 bg-canvas-alternate border border-hairline-default rounded-lg max-w-md mx-auto text-ink-primary font-body-md flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-status-healthy text-[20px]">check_circle</span>
              <span className="text-sm sm:text-base">Thank you! We'll invite your team in Cohort 04.</span>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto w-full">
              {/* Invisible Honeypot */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <input
                  type="text"
                  name="home_confirm_hp"
                  tabIndex={-1}
                  autoComplete="off"
                  value={homeHoneypot}
                  onChange={(e) => setHomeHoneypot(e.target.value)}
                />
              </div>

              <input
                className="w-full sm:w-72 h-11 sm:h-10 px-4 rounded bg-surface-elevated border border-hairline-default text-ink-primary placeholder:text-ink-subtle text-sm sm:text-body-md focus:border-ink-primary focus:ring-0 focus:outline-none min-h-[44px]"
                placeholder="name@company.com"
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <button
                className="w-full sm:w-auto inline-flex items-center justify-center h-11 sm:h-10 px-6 bg-ink-primary hover:bg-accent-olive-deep text-canvas-base rounded-full font-label-mono text-xs sm:text-label-mono font-medium transition-all duration-150 active:scale-[0.98] whitespace-nowrap min-h-[44px]"
                type="submit"
              >
                Request early access ↗
              </button>
            </form>
          )}

          <p className="font-label-mono text-[11px] sm:text-label-mono text-ink-subtle mt-4 px-2">
            Selective developer cohort rollout · No billing required for simulation access
          </p>
        </div>
      </section>
    </main>
  );
};

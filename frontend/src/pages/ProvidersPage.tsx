import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

interface Provider {
  id: string;
  name: string;
  initials: string;
  badges: string[];
  tagline: string;
  availability: {
    status: 'Available Now' | 'Spot Available' | 'Waitlist / Spot' | 'Reserved Only';
    color: string;
  };
  compute: {
    model: string;
    detail: string;
  };
  pricing: {
    price: string;
    unit: string;
    note: string;
  };
  fabric: {
    interconnect: string;
    regions: string;
  };
  benchmark: {
    tags: string[];
    rooflineScore: number;
  };
  websiteUrl: string;
}

const PROVIDERS: Provider[] = [
  {
    id: 'coreweave',
    name: 'CoreWeave',
    initials: 'CW',
    badges: ['Tier-1 Specialized AI Cloud', 'InfiniBand Quantum-2 Native'],
    tagline: 'Ultra-scale GPU fabrics designed specifically for large-scale distributed training and low-latency inference.',
    availability: { status: 'Available Now', color: 'bg-accent-olive' },
    compute: {
      model: '8x NVIDIA H100 SXM5 80GB',
      detail: 'HGX Node (640GB HBM3 memory)',
    },
    pricing: {
      price: '$2.85',
      unit: '/GPU/hr',
      note: 'Spot rate dynamically polled 4m ago',
    },
    fabric: {
      interconnect: '3.2 Tbps Quantum-2 InfiniBand',
      regions: 'US-East (NJ), US-West (NV), EU (UK)',
    },
    benchmark: {
      tags: ['FP8 Optimized', 'Megatron-LM Tested', 'Zero Jitter'],
      rooflineScore: 98.9,
    },
    websiteUrl: 'https://coreweave.com',
  },
  {
    id: 'runpod',
    name: 'RunPod',
    initials: 'RP',
    badges: ['Serverless & Bare Metal', 'Community & Secure Cloud'],
    tagline: 'Developer-friendly global compute orchestration with instant spin-up times and fractional worker support.',
    availability: { status: 'Spot Available', color: 'bg-accent-olive' },
    compute: {
      model: '8x NVIDIA L40S Ada 48GB',
      detail: 'Cost-Optimized Inference Cluster (384GB GDDR6)',
    },
    pricing: {
      price: '$1.12',
      unit: '/GPU/hr',
      note: '62% cheaper than on-demand hyperscalers',
    },
    fabric: {
      interconnect: '400 Gbps RoCE v2 Fabric',
      regions: 'US-Central, EU-West (NL), Canada',
    },
    benchmark: {
      tags: ['High Batch Inference', 'FP16 Dense', 'Cost Arbitrage #1'],
      rooflineScore: 94.2,
    },
    websiteUrl: 'https://runpod.io',
  },
  {
    id: 'lambda',
    name: 'Lambda Cloud',
    initials: 'LC',
    badges: ['Deep Learning Cloud', 'High Availability Reserve'],
    tagline: 'Turnkey AI compute infrastructure built by ML practitioners for foundational AI research and enterprise training.',
    availability: { status: 'Waitlist / Spot', color: 'bg-status-warning' },
    compute: {
      model: '8x NVIDIA A100 SXM4 80GB',
      detail: 'Tensor Core Clustered Node (640GB HBM2e)',
    },
    pricing: {
      price: '$1.89',
      unit: '/GPU/hr',
      note: 'Reserved 1-month contract base',
    },
    fabric: {
      interconnect: 'NVLink 600 GB/s + 200 Gbps IB',
      regions: 'US-West (CA, TX), US-East (VA)',
    },
    benchmark: {
      tags: ['Stable Training Runs', 'Checkpoint Heavy'],
      rooflineScore: 91.5,
    },
    websiteUrl: 'https://lambdalabs.com',
  },
  {
    id: 'crusoe',
    name: 'Crusoe Cloud',
    initials: 'CC',
    badges: ['100% Zero-Carbon Flared Gas', 'Clean Compute Leader'],
    tagline: 'Clustered low-emission compute powered by stranded energetic capture for sustainable hyperscale AI.',
    availability: { status: 'Reserved Only', color: 'bg-ink-subtle' },
    compute: {
      model: 'NVIDIA GH200 Grace Hopper',
      detail: 'Single & 8x Clustered (480GB+96GB HBM3)',
    },
    pricing: {
      price: '$2.45',
      unit: '/hr per Superchip',
      note: 'Quarterly commitments available',
    },
    fabric: {
      interconnect: '900 GB/s NVLink-C2C Coherent',
      regions: 'Iceland, US-North Dakota',
    },
    benchmark: {
      tags: ['Trillion-parameter MoE', 'Memory-bound LLM'],
      rooflineScore: 97.4,
    },
    websiteUrl: 'https://crusoe.ai',
  },
  {
    id: 'nebius',
    name: 'Nebius AI',
    initials: 'NB',
    badges: ['Hyperscale AI Infrastructure', 'Direct Bare Metal'],
    tagline: 'European hyperscale fabric engineered for massive context lengths and foundation model pretraining.',
    availability: { status: 'Available Now', color: 'bg-accent-olive' },
    compute: {
      model: 'NVIDIA H200 SXM5 141GB',
      detail: '8x Clustered Node (1,128GB HBM3e)',
    },
    pricing: {
      price: '$3.40',
      unit: '/GPU/hr',
      note: 'Flexible on-demand billing',
    },
    fabric: {
      interconnect: 'InfiniBand NDR 400G',
      regions: 'EU-North (Finland)',
    },
    benchmark: {
      tags: ['1M+ Token Context', 'Frontier LLM'],
      rooflineScore: 99.1,
    },
    websiteUrl: 'https://nebius.ai',
  },
];

export const ProvidersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [archFilter, setArchFilter] = useState('ALL');
  const [interconnectFilter, setInterconnectFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [contractFilter, setContractFilter] = useState('ALL');
  const [activeSlice, setActiveSlice] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  // Filter providers
  const filteredProviders = PROVIDERS.filter(p => {
    if (activeSlice === 'h100' && !p.compute.model.includes('H100')) return false;
    if (activeSlice === 'l40s' && !p.compute.model.includes('L40S')) return false;
    if (activeSlice === 'ib' && !p.fabric.interconnect.toLowerCase().includes('infiniband')) return false;
    if (activeSlice === 'eu' && !p.fabric.regions.includes('EU')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.compute.model.toLowerCase().includes(q) ||
        p.fabric.regions.toLowerCase().includes(q) ||
        p.fabric.interconnect.toLowerCase().includes(q) ||
        p.badges.some(b => b.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (archFilter !== 'ALL') {
      if (archFilter === 'H100' && !p.compute.model.includes('H100') && !p.compute.model.includes('H200')) return false;
      if (archFilter === 'L40S' && !p.compute.model.includes('L40S')) return false;
      if (archFilter === 'A100' && !p.compute.model.includes('A100')) return false;
      if (archFilter === 'GH200' && !p.compute.model.includes('GH200')) return false;
    }

    if (interconnectFilter !== 'ALL') {
      if (interconnectFilter === 'IB' && !p.fabric.interconnect.toLowerCase().includes('infiniband')) return false;
      if (interconnectFilter === 'ROCE' && !p.fabric.interconnect.toLowerCase().includes('roce')) return false;
      if (interconnectFilter === 'NVLINK' && !p.fabric.interconnect.toLowerCase().includes('nvlink')) return false;
    }

    return true;
  });

  return (
    <div className="bg-canvas-base text-ink-primary font-sans antialiased min-h-screen">
      <SEO
        title="Multi-Cloud GPU Provider Directory &amp; Pricing"
        description="Explore live pricing, SXM5 NVLink interconnect availability, and spot capacities across CoreWeave, Lambda Labs, RunPod, and Crusoe."
        canonicalPath="/providers"
      />
      <main className="w-full px-4 sm:px-6 md:px-margin-desktop py-6 sm:py-space-xl max-w-[1240px] mx-auto">
        {/* 1. Header & Live Mesh Stats */}
        <div className="mb-space-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hairline-default">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-secondary-container text-accent-olive font-label-mono text-label-tag">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-olive animate-pulse"></span>
                  GLOBAL COMPUTE DIRECTORY
                </span>
                <span className="text-label-mono text-ink-subtle">LIVE REFRESH 20Hz</span>
              </div>
              <h1 className="text-display-sm md:text-display-md font-serif text-ink-primary font-normal tracking-tight">
                Benchmark-Verified GPU Infrastructure
              </h1>
              <p className="text-body-md text-ink-muted mt-2 max-w-3xl leading-relaxed">
                Real-time cost arbitrage, interconnect topology audits, and hardware health metrics across vetted GPU clouds and sovereign HPC clusters.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/workload-planner"
                className="px-4 py-2 min-h-[44px] rounded bg-ink-primary text-surface-elevated text-label-mono font-medium hover:bg-neutral-800 transition-colors shadow-xs flex items-center justify-center"
              >
                Plan Workload ↗
              </Link>
              <Link
                to="/recommendations"
                className="px-4 py-2 min-h-[44px] rounded bg-surface-elevated border border-hairline-default text-ink-primary text-label-mono font-medium hover:bg-secondary-container hover:border-accent-olive/40 transition-colors flex items-center justify-center"
              >
                View Recommendations ↗
              </Link>
            </div>
          </div>

          {/* Top Real-time Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <div className="p-4 rounded border border-hairline-default bg-surface-elevated">
              <span className="text-label-mono text-ink-subtle uppercase block text-[11px]">ACTIVE MONITORED NODES</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-headline-sm font-semibold text-ink-primary">42,890</span>
                <span className="text-label-tag text-status-healthy font-mono">+3.8% w/w</span>
              </div>
            </div>
            <div className="p-4 rounded border border-hairline-default bg-surface-elevated">
              <span className="text-label-mono text-ink-subtle uppercase block text-[11px]">GLOBAL SPOT DELTA</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-headline-sm font-semibold text-accent-olive">-34.8%</span>
                <span className="text-label-tag text-ink-muted font-mono">vs Hyperscalers</span>
              </div>
            </div>
            <div className="p-4 rounded border border-hairline-default bg-surface-elevated">
              <span className="text-label-mono text-ink-subtle uppercase block text-[11px]">AVERAGE PROBE RTT</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-headline-sm font-semibold text-ink-primary">0.12 ms</span>
                <span className="text-label-tag text-status-healthy font-mono">Quantum-2 IB</span>
              </div>
            </div>
            <div className="p-4 rounded border border-hairline-default bg-surface-elevated">
              <span className="text-label-mono text-ink-subtle uppercase block text-[11px]">FABRIC HEALTH METRIC</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-headline-sm font-semibold text-status-healthy">99.88%</span>
                <span className="text-label-tag text-ink-muted font-mono">eBPF Validated</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Filter & Dimension Selection Panel */}
        <section className="bg-surface-elevated border border-hairline-default rounded-lg p-5 mb-space-lg shadow-xs">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between pb-4 border-b border-hairline-subtle">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter by architecture, interconnect, location or provider..."
                className="w-full pl-9 pr-4 py-2 bg-canvas-base border border-hairline-default rounded text-body-sm font-mono text-ink-primary placeholder:text-ink-subtle focus:outline-hidden focus:border-accent-olive transition-colors"
              />
            </div>

            {/* Quick Slices Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              <span className="text-label-mono text-ink-subtle mr-1 text-[11px]">QUICK SLICES:</span>
              {[
                { id: 'all', label: 'All Clusters' },
                { id: 'h100', label: 'H100 SXM5 (8-GPU)' },
                { id: 'l40s', label: 'Low-cost L40S' },
                { id: 'ib', label: 'InfiniBand Only' },
                { id: 'eu', label: 'EU Sovereign' },
              ].map(slice => (
                <button
                  key={slice.id}
                  onClick={() => setActiveSlice(slice.id)}
                  className={`px-3 py-1 rounded text-label-tag font-mono transition-colors whitespace-nowrap ${
                    activeSlice === slice.id
                      ? 'bg-accent-olive text-surface-elevated'
                      : 'bg-canvas-alternate text-ink-body hover:bg-secondary-container hover:text-accent-olive'
                  }`}
                >
                  {slice.label}
                </button>
              ))}
            </div>

            {/* Verified Telemetry Toggle */}
            <div className="flex items-center gap-2 pl-2 shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-hairline-subtle">
              <label className="text-label-mono text-ink-body text-[12px] flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={e => setVerifiedOnly(e.target.checked)}
                  className="rounded border-hairline-default text-accent-olive focus:ring-accent-olive/20"
                />
                eBPF Telemetry Verified Only
              </label>
            </div>
          </div>

          {/* Secondary Dropdown Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-label-mono text-[12px]">
            <div>
              <label className="block text-ink-subtle uppercase mb-1">Architecture</label>
              <select
                value={archFilter}
                onChange={e => setArchFilter(e.target.value)}
                className="w-full bg-canvas-base border border-hairline-default rounded px-3 py-2 sm:py-1.5 text-ink-primary focus:outline-hidden focus:border-accent-olive min-h-[40px] sm:min-h-0"
              >
                <option value="ALL">All Architectures</option>
                <option value="H100">NVIDIA H100 / H200 SXM5</option>
                <option value="L40S">NVIDIA L40S Ada (48GB)</option>
                <option value="A100">NVIDIA A100 SXM4 (80GB)</option>
                <option value="GH200">NVIDIA GH200 Grace Hopper</option>
              </select>
            </div>

            <div>
              <label className="block text-ink-subtle uppercase mb-1">Interconnect</label>
              <select
                value={interconnectFilter}
                onChange={e => setInterconnectFilter(e.target.value)}
                className="w-full bg-canvas-base border border-hairline-default rounded px-3 py-2 sm:py-1.5 text-ink-primary focus:outline-hidden focus:border-accent-olive min-h-[40px] sm:min-h-0"
              >
                <option value="ALL">All Interconnects</option>
                <option value="IB">3.2 Tbps Quantum-2 IB</option>
                <option value="ROCE">400 Gbps RoCE v2 Fabric</option>
                <option value="NVLINK">NVLink 600-900 GB/s</option>
              </select>
            </div>

            <div>
              <label className="block text-ink-subtle uppercase mb-1">Provider Tier</label>
              <select
                value={tierFilter}
                onChange={e => setTierFilter(e.target.value)}
                className="w-full bg-canvas-base border border-hairline-default rounded px-3 py-2 sm:py-1.5 text-ink-primary focus:outline-hidden focus:border-accent-olive min-h-[40px] sm:min-h-0"
              >
                <option value="ALL">All Verified Tiers</option>
                <option value="TIER1">Specialized AI Cloud (Tier-1)</option>
                <option value="HYPERSCALE">Direct Bare Metal</option>
                <option value="GREEN">Zero-Carbon Flared Gas</option>
              </select>
            </div>

            <div>
              <label className="block text-ink-subtle uppercase mb-1">Pricing Contract</label>
              <select
                value={contractFilter}
                onChange={e => setContractFilter(e.target.value)}
                className="w-full bg-canvas-base border border-hairline-default rounded px-3 py-2 sm:py-1.5 text-ink-primary focus:outline-hidden focus:border-accent-olive min-h-[40px] sm:min-h-0"
              >
                <option value="ALL">Spot & On-Demand</option>
                <option value="SPOT">Spot Only</option>
                <option value="ONDEMAND">On-Demand Guaranteed</option>
                <option value="RESERVED">1-Month Reserved Cluster</option>
              </select>
            </div>
          </div>
        </section>

        {/* 3. Provider Cards Grid */}
        <section className="space-y-4 mb-space-xl">
          {filteredProviders.length === 0 ? (
            <div className="p-8 text-center bg-surface-elevated border border-hairline-default rounded-lg">
              <span className="material-symbols-outlined text-4xl text-ink-subtle mb-2">search_off</span>
              <p className="text-body-md text-ink-muted">No compute providers matched your filter criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setArchFilter('ALL');
                  setInterconnectFilter('ALL');
                  setActiveSlice('all');
                }}
                className="mt-4 px-4 py-2 min-h-[44px] bg-accent-olive text-surface-elevated text-label-mono rounded hover:bg-accent-olive-deep transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredProviders.map(provider => (
              <article
                key={provider.id}
                className="bg-surface-elevated border border-hairline-default rounded-lg hover:border-accent-olive/40 transition-all overflow-hidden shadow-xs"
              >
                {/* Header row */}
                <div className="p-4 sm:p-5 md:p-6 border-b border-hairline-subtle bg-canvas-base">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-surface-elevated border border-hairline-default flex items-center justify-center font-headline-md font-semibold text-ink-primary text-lg sm:text-xl shadow-xs shrink-0">
                        {provider.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-title-md font-semibold text-ink-primary">{provider.name}</h3>
                          {provider.badges.map((badge, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-tag font-mono ${
                                idx === 0
                                  ? 'bg-secondary-container border border-secondary-fixed text-accent-olive'
                                  : 'bg-canvas-alternate border border-hairline-default text-ink-body'
                              }`}
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                        <p className="text-body-sm text-ink-muted mt-1">{provider.tagline}</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container border border-secondary-fixed text-label-tag font-mono text-accent-olive self-start md:self-auto">
                        <span className={`w-1.5 h-1.5 rounded-full ${provider.availability.color}`}></span>
                        <span>{provider.availability.status}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1 w-full sm:w-auto">
                        <Link
                          to="/workload-planner"
                          className="px-4 py-2 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-full bg-ink-primary text-surface-elevated text-label-mono font-medium hover:bg-neutral-800 transition-colors shadow-xs flex items-center justify-center"
                        >
                          Configure in Planner ↗
                        </Link>
                        <a
                          href={provider.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-full bg-surface-elevated border border-hairline-default text-ink-primary text-label-mono hover:bg-secondary-container hover:border-accent-olive/40 transition-colors flex items-center justify-center"
                        >
                          Provider Website ↗
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details 4-col Grid */}
                <div className="p-4 sm:p-5 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 bg-surface-elevated text-body-sm font-sans">
                  <div>
                    <span className="text-label-mono text-ink-subtle uppercase block mb-1 text-[11px]">
                      COMPUTE CONFIGURATION
                    </span>
                    <p className="font-medium text-ink-primary text-title-sm">{provider.compute.model}</p>
                    <p className="text-ink-muted text-body-sm mt-0.5">{provider.compute.detail}</p>
                  </div>

                  <div>
                    <span className="text-label-mono text-ink-subtle uppercase block mb-1 text-[11px]">
                      PRICING SWEEP
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-title-md font-semibold text-ink-primary">{provider.pricing.price}</span>
                      <span className="text-body-sm text-ink-muted">{provider.pricing.unit}</span>
                    </div>
                    <p className="text-ink-muted text-body-sm mt-0.5">{provider.pricing.note}</p>
                  </div>

                  <div>
                    <span className="text-label-mono text-ink-subtle uppercase block mb-1 text-[11px]">
                      FABRIC & TOPOLOGIES
                    </span>
                    <p className="text-ink-primary font-medium">{provider.fabric.interconnect}</p>
                    <p className="text-ink-muted text-body-sm mt-0.5">{provider.fabric.regions}</p>
                  </div>

                  <div>
                    <span className="text-label-mono text-ink-subtle uppercase block mb-1 text-[11px]">
                      BENCHMARK FIT
                    </span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {provider.benchmark.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-canvas-alternate text-ink-body text-label-tag font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-label-tag font-mono text-accent-olive">
                      <span className="material-symbols-outlined text-[14px]">bolt</span>
                      <span>Roofline Score: {provider.benchmark.rooflineScore} / 100</span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        {/* 4. Provider Benchmark Comparison Matrix (Telemetry Well) */}
        <section className="bg-surface-elevated border border-hairline-default rounded-lg p-4 sm:p-6 mb-space-xl shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-hairline-default gap-2">
            <div>
              <span className="text-label-mono text-accent-olive tracking-wider uppercase">
                ARCHITECTURAL BENCHMARK COMPARISON
              </span>
              <h3 className="text-title-md text-ink-primary font-semibold mt-0.5">
                Interconnect Throughput, Cold Starts & Network Stability
              </h3>
            </div>
            <div className="text-label-tag font-mono text-ink-muted flex items-center justify-between md:justify-end gap-2">
              <span className="text-[11px] text-ink-subtle md:hidden">Swipe sideways →</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-status-healthy"></span>
                <span>Sweep: 60s via eBPF probes</span>
              </div>
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-body-sm font-sans min-w-[680px]">
              <thead>
                <tr className="border-b border-hairline-default text-label-mono text-ink-muted text-[11px]">
                  <th className="py-3 px-3">PROVIDER</th>
                  <th className="py-3 px-3">PRIMARY ARCH</th>
                  <th className="py-3 px-3">COLD START LATENCY</th>
                  <th className="py-3 px-3">RESUME BANDWIDTH</th>
                  <th className="py-3 px-3">JITTER VARIANCE (RTT)</th>
                  <th className="py-3 px-3 text-right">EBPF SCORE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-subtle font-mono text-[12px]">
                <tr className="hover:bg-secondary-container/30 transition-colors">
                  <td className="py-3.5 px-3 font-sans font-medium text-ink-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-olive"></span> CoreWeave
                  </td>
                  <td className="py-3.5 px-3 font-sans text-ink-body">8x H100 SXM5</td>
                  <td className="py-3.5 px-3 text-ink-primary">1m 12s</td>
                  <td className="py-3.5 px-3 text-ink-primary font-medium">18.4 GB/s</td>
                  <td className="py-3.5 px-3 text-status-healthy">± 0.08 ms</td>
                  <td className="py-3.5 px-3 text-right text-accent-olive font-semibold">99.4%</td>
                </tr>
                <tr className="hover:bg-secondary-container/30 transition-colors">
                  <td className="py-3.5 px-3 font-sans font-medium text-ink-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-status-healthy"></span> RunPod
                  </td>
                  <td className="py-3.5 px-3 font-sans text-ink-body">8x L40S Ada</td>
                  <td className="py-3.5 px-3 text-status-healthy font-semibold">0m 38s</td>
                  <td className="py-3.5 px-3 text-ink-primary">12.1 GB/s</td>
                  <td className="py-3.5 px-3 text-ink-body">± 0.42 ms</td>
                  <td className="py-3.5 px-3 text-right text-accent-olive font-semibold">95.8%</td>
                </tr>
                <tr className="hover:bg-secondary-container/30 transition-colors">
                  <td className="py-3.5 px-3 font-sans font-medium text-ink-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-status-warning"></span> Lambda Cloud
                  </td>
                  <td className="py-3.5 px-3 font-sans text-ink-body">8x A100 SXM4</td>
                  <td className="py-3.5 px-3 text-ink-body">2m 45s</td>
                  <td className="py-3.5 px-3 text-ink-primary">14.6 GB/s</td>
                  <td className="py-3.5 px-3 text-ink-body">± 0.22 ms</td>
                  <td className="py-3.5 px-3 text-right text-accent-olive font-semibold">92.0%</td>
                </tr>
                <tr className="hover:bg-secondary-container/30 transition-colors">
                  <td className="py-3.5 px-3 font-sans font-medium text-ink-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Crusoe Cloud
                  </td>
                  <td className="py-3.5 px-3 font-sans text-ink-body">GH200 Grace Hopper</td>
                  <td className="py-3.5 px-3 text-ink-body">1m 54s</td>
                  <td className="py-3.5 px-3 text-ink-primary font-medium">19.2 GB/s</td>
                  <td className="py-3.5 px-3 text-status-healthy">± 0.12 ms</td>
                  <td className="py-3.5 px-3 text-right text-accent-olive font-semibold">97.8%</td>
                </tr>
                <tr className="hover:bg-secondary-container/30 transition-colors">
                  <td className="py-3.5 px-3 font-sans font-medium text-ink-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-olive"></span> Nebius AI
                  </td>
                  <td className="py-3.5 px-3 font-sans text-ink-body">8x H200 SXM5</td>
                  <td className="py-3.5 px-3 text-ink-primary">1m 05s</td>
                  <td className="py-3.5 px-3 text-ink-primary font-semibold">22.8 GB/s</td>
                  <td className="py-3.5 px-3 text-status-healthy">± 0.05 ms</td>
                  <td className="py-3.5 px-3 text-right text-accent-olive font-semibold">99.7%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

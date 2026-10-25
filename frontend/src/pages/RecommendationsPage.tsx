import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface RecommendationsPageProps {
  onOpenEarlyAccess?: () => void;
}

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({ onOpenEarlyAccess }) => {
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [savedPlans, setSavedPlans] = useState<string[]>([]);

  const toggleSave = (planId: string) => {
    setSavedPlans((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId]
    );
  };

  return (
    <div className="bg-canvas-base text-ink-primary font-body-md antialiased min-h-screen flex flex-col selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-space-lg md:px-margin-desktop py-space-xl space-y-space-lg">
        {/* SECTION 1: HEADER & WORKLOAD SUMMARY STRIP */}
        <header className="border-b border-hairline-default pb-space-lg">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-label-tag font-label-tag text-ink-muted mb-space-xs">
            <Link to="/workload-planner" className="hover:text-ink-primary transition-colors">
              Workload Planner
            </Link>
            <span className="text-hairline-strong">/</span>
            <span className="text-ink-primary font-medium">Solver Synthesis Results</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div>
              <div className="flex items-center gap-space-xs mb-1">
                <span className="font-label-tag text-label-tag text-accent-olive-deep bg-secondary-container px-2 py-0.5 rounded border border-secondary-fixed uppercase tracking-wider font-semibold">
                  SOLVER ENGINE V2.4 • OPTIMAL CANDIDATES
                </span>
                <span className="text-label-mono font-label-mono text-ink-subtle">Job ID: syn_8f99a0e1</span>
              </div>
              <h1 className="text-headline-md font-headline-md text-ink-primary tracking-tight font-medium">
                Evaluated Compute Allocations
              </h1>
              <p className="text-body-md font-body-md text-ink-muted mt-1 max-w-2xl leading-relaxed">
                Ranked by Pareto-optimal cost, runtime SLAs, and memory headroom. Verified against continuous real-time market spot sweeps.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-space-xs self-start md:self-auto flex-wrap">
              <Link
                to="/workload-planner"
                className="h-9 px-4 rounded-full border border-hairline-default bg-surface-elevated hover:bg-canvas-alternate text-ink-primary text-label-mono font-label-mono flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Adjust Constraints</span>
              </Link>
              <Link
                to="/providers"
                className="h-9 px-4 rounded-full border border-hairline-default bg-surface-elevated hover:bg-canvas-alternate text-ink-primary text-label-mono font-label-mono flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">view_list</span>
                <span>All Providers</span>
              </Link>
            </div>
          </div>

          {/* Target Workload Summary Strip */}
          <div className="mt-space-lg p-space-md bg-canvas-alternate rounded-lg border border-hairline-default flex flex-wrap items-center justify-between gap-space-sm text-body-sm font-body-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-olive text-[18px]">terminal</span>
              <span className="font-mono text-ink-primary font-medium">
                Fine-tune Llama 3 70B (LoRA) • &lt; 8h SLA • Hard Budget: $50.00 USD
              </span>
            </div>
            <div className="flex items-center gap-space-md text-label-mono font-label-mono text-ink-muted">
              <span>Seq: 8,192 tokens</span>
              <span>Precision: BF16</span>
              <span>Batch: 128 (GA: 4)</span>
              <span className="text-accent-olive-deep font-semibold">Max VRAM: 39.2 GB / Node</span>
            </div>
          </div>
        </header>

        {/* SECTION 2: VERIFIED VS SIMULATED NOTICE */}
        <section className="p-space-md bg-secondary-container/40 border border-secondary-fixed rounded-lg flex items-start gap-space-sm">
          <span className="material-symbols-outlined text-accent-olive text-[20px] mt-0.5 flex-shrink-0">
            verified_user
          </span>
          <div className="text-body-sm font-body-sm text-ink-body flex-1">
            <strong className="font-medium text-ink-primary">Verified vs Simulated Notice:</strong> Real-time spot pricing and network topology are verified via live provider telemetry probes (updated 42s ago). Total cost and runtime ranges are deterministic roofline models with 95% confidence intervals under standard checkpointing frequency.
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-label-tag font-label-tag text-ink-muted bg-surface-elevated border border-hairline-default px-2.5 py-1 rounded">
            <span className="w-2 h-2 rounded-full bg-status-healthy"></span>
            <span>PROBES: ONLINE</span>
          </div>
        </section>

        {/* SECTION 3: RANKED COMPUTE RECOMMENDATION CARDS */}
        <section aria-label="Compute Recommendation Ranks" className="flex flex-col gap-space-md">
          {/* RANK #1: Optimal Tradeoff (RECOMMENDED BLUEPRINT) */}
          <article className="relative bg-surface-elevated rounded-xl border-2 border-accent-olive shadow-sm overflow-hidden transition-all duration-200">
            {/* Atmospheric header gradient in olive */}
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-secondary-container/50 to-transparent pointer-events-none"></div>
            <div className="p-6 relative">
              {/* Top Row: Badge & Rank identifier */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container border border-secondary-fixed text-label-tag font-label-tag text-accent-olive-deep tracking-wider uppercase font-semibold">
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                    RECOMMENDED BLUEPRINT • RANK #1
                  </span>
                  <span className="text-label-mono font-label-mono text-ink-muted">Optimal Balance: Cost vs Throughput</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-label-tag font-label-tag text-ink-muted bg-canvas-alternate px-2.5 py-1 rounded border border-hairline-subtle">
                    SLA: 99.8% (eBPF Fabric)
                  </span>
                </div>
              </div>

              {/* Main Spec Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-6 border-b border-hairline-subtle">
                {/* Left Info: Hardware & Provider */}
                <div className="lg:col-span-5 flex flex-col gap-2">
                  <div>
                    <div className="text-label-tag font-label-tag text-accent-olive-deep uppercase font-bold tracking-wider">
                      RunPod Secure (US-Central)
                    </div>
                    <h2 className="text-headline-sm font-headline-sm text-ink-primary font-semibold mt-0.5">
                      8x NVIDIA L40S 48GB Ada
                    </h2>
                    <div className="text-body-sm font-body-sm text-ink-muted mt-1">
                      384GB Total VRAM • Ada Lovelace Architecture • 400 Gbps RoCE v2
                    </div>
                  </div>
                  {/* Constraint & Architectural Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-label-mono font-label-mono px-2 py-0.5 rounded bg-canvas-alternate border border-hairline-default text-ink-body">
                      PyTorch 2.3+ FlashAttention-3
                    </span>
                    <span className="text-label-mono font-label-mono px-2 py-0.5 rounded bg-canvas-alternate border border-hairline-default text-ink-body">
                      Zero-carbon Flared Gas
                    </span>
                  </div>
                </div>

                {/* Middle: Estimated Total Cost & Duration */}
                <div className="lg:col-span-4 grid grid-cols-2 gap-4 bg-canvas-alternate/70 p-3.5 rounded-lg border border-hairline-subtle">
                  <div>
                    <div className="text-label-tag font-label-tag text-ink-muted uppercase">Estimated Cost</div>
                    <div className="text-headline-sm font-headline-sm text-ink-primary font-bold mt-0.5">$27.80</div>
                    <div className="text-label-mono font-label-mono text-ink-subtle mt-0.5">
                      $3.60/hr active compute<br />+$0.60 checkpoint storage
                    </div>
                  </div>
                  <div>
                    <div className="text-label-tag font-label-tag text-ink-muted uppercase">Runtime Range</div>
                    <div className="text-headline-sm font-headline-sm text-ink-primary font-bold mt-0.5">7h 35m</div>
                    <div className="text-label-mono font-label-mono text-ink-subtle mt-0.5">
                      CI 95%: 7h 15m – 7h 45m<br />Nominal roofline run
                    </div>
                  </div>
                </div>

                {/* Right: Trade-off Analysis & Key Differentiation */}
                <div className="lg:col-span-3 flex flex-col justify-between h-full">
                  <div>
                    <div className="text-label-tag font-label-tag text-ink-muted uppercase mb-1">Solver Tradeoff Summary</div>
                    <p className="text-body-sm font-body-sm text-ink-body leading-relaxed">
                      <span className="text-accent-olive font-semibold">-14% cheaper</span> than H100 with guaranteed zero OOM risk and ample 64GB safety headroom.
                    </p>
                  </div>
                  <div className="mt-3 text-label-tag font-label-tag text-ink-subtle">
                    +2h 15m duration vs SXM5
                  </div>
                </div>
              </div>

              {/* Action & Detail Footer */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onOpenEarlyAccess}
                    className="h-10 px-5 rounded-full bg-ink-primary hover:bg-accent-olive-deep text-surface-elevated text-label-mono font-label-mono transition-all duration-150 flex items-center gap-2 shadow-sm active:scale-[0.99]"
                  >
                    <span>Generate Execution Plan</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                  </button>
                  <button
                    onClick={() => toggleSave('l40s')}
                    className={`h-10 px-4 rounded-full border text-label-mono font-label-mono transition-all duration-150 flex items-center gap-1.5 ${
                      savedPlans.includes('l40s')
                        ? 'bg-secondary-container border-accent-olive text-accent-olive-deep font-semibold'
                        : 'bg-surface-elevated border-hairline-default text-ink-primary hover:bg-canvas-alternate'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {savedPlans.includes('l40s') ? 'bookmark_added' : 'bookmark'}
                    </span>
                    <span>{savedPlans.includes('l40s') ? 'Saved' : 'Save Plan'}</span>
                  </button>
                </div>
                <button
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  className="text-body-sm font-body-sm text-accent-olive-deep hover:text-accent-olive flex items-center gap-1 font-medium transition-colors"
                >
                  <span>{detailsOpen ? 'Hide Granular Details' : 'View Granular Details'}</span>
                  <span className="material-symbols-outlined text-[18px]">
                    {detailsOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
              </div>

              {/* Collapsible Granular Detail Well */}
              {detailsOpen && (
                <div className="mt-4 pt-4 border-t border-hairline-subtle grid grid-cols-1 md:grid-cols-3 gap-4 text-label-mono font-label-mono">
                  <div className="bg-canvas-alternate p-3 rounded border border-hairline-subtle">
                    <span className="text-ink-subtle block mb-1">INTERCONNECT TOPOLOGY</span>
                    <span className="text-ink-primary font-medium">RoCE v2 non-blocking leaf-spine</span>
                    <span className="text-ink-muted block mt-1">Effective All-Reduce: 47.8 GB/s</span>
                  </div>
                  <div className="bg-canvas-alternate p-3 rounded border border-hairline-subtle">
                    <span className="text-ink-subtle block mb-1">CHECKPOINT RETENTION</span>
                    <span className="text-ink-primary font-medium">Warm NVMe Tier (2TB SSD)</span>
                    <span className="text-ink-muted block mt-1">Snapshot latency: 1.4s / 500 steps</span>
                  </div>
                  <div className="bg-canvas-alternate p-3 rounded border border-hairline-subtle">
                    <span className="text-ink-subtle block mb-1">SPOT PREEMPTION RISK</span>
                    <span className="text-ink-primary font-medium">Low (Historical 0.08% / 24h)</span>
                    <span className="text-ink-muted block mt-1">Automated checkpoint migration</span>
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* RANK #2: Fastest Completion */}
          <article className="bg-surface-elevated rounded-xl border border-hairline-default shadow-sm p-6 transition-all duration-200 hover:border-hairline-strong">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-canvas-alternate border border-hairline-default text-label-tag font-label-tag text-ink-primary tracking-wider uppercase font-semibold">
                  FASTEST COMPLETION • RANK #2
                </span>
                <span className="text-label-mono font-label-mono text-ink-muted">Infiniband Quantum-2 Clustered</span>
              </div>
              <span className="text-label-tag font-label-tag text-status-healthy font-semibold">98.4% CLUSTER SLA</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-6 border-b border-hairline-subtle">
              <div className="lg:col-span-5 flex flex-col gap-1.5">
                <div className="text-label-tag font-label-tag text-ink-muted uppercase font-bold">CoreWeave (US-East-1)</div>
                <h2 className="text-headline-sm font-headline-sm text-ink-primary font-semibold">
                  8x NVIDIA H100 SXM5 80GB
                </h2>
                <div className="text-body-sm font-body-sm text-ink-muted">
                  640GB Total VRAM • NVLink 4 (900 GB/s) • 3.2 Tbps Quantum-2 IB
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="text-label-mono font-label-mono px-2 py-0.5 rounded bg-secondary-container text-accent-olive-deep font-medium">
                    Fastest Execution Speed
                  </span>
                </div>
              </div>
              <div className="lg:col-span-4 grid grid-cols-2 gap-4 bg-canvas-alternate/60 p-3.5 rounded-lg border border-hairline-subtle">
                <div>
                  <div className="text-label-tag font-label-tag text-ink-muted uppercase">Estimated Cost</div>
                  <div className="text-headline-sm font-headline-sm text-ink-primary font-bold mt-0.5">$32.40</div>
                  <div className="text-label-mono font-label-mono text-ink-subtle mt-0.5">
                    $6.07/hr combined cost
                  </div>
                </div>
                <div>
                  <div className="text-label-tag font-label-tag text-ink-muted uppercase">Runtime Range</div>
                  <div className="text-headline-sm font-headline-sm text-ink-primary font-bold mt-0.5">5h 20m</div>
                  <div className="text-label-mono font-label-mono text-ink-subtle mt-0.5">
                    CI 95%: 5h 10m – 5h 30m
                  </div>
                </div>
              </div>
              <div className="lg:col-span-3">
                <div className="text-label-tag font-label-tag text-ink-muted uppercase mb-1">Tradeoff Analysis</div>
                <p className="text-body-sm font-body-sm text-ink-body">
                  Fastest overall completion (<span className="font-medium text-ink-primary">saves 2h 15m</span>), but incurs <span className="font-medium text-ink-primary">+$4.60 USD</span> premium. Excellent if delivery cadence is paramount.
                </p>
              </div>
            </div>
            <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenEarlyAccess}
                  className="h-9 px-4 rounded-full bg-ink-primary hover:bg-accent-olive-deep text-surface-elevated text-label-mono font-label-mono transition-all duration-150 flex items-center gap-1.5 shadow-sm"
                >
                  <span>Generate Execution Plan</span>
                </button>
                <button
                  onClick={() => toggleSave('h100')}
                  className="h-9 px-3.5 rounded-full bg-surface-elevated border border-hairline-default text-ink-primary text-label-mono font-label-mono hover:border-hairline-strong transition-all duration-150"
                >
                  {savedPlans.includes('h100') ? 'Saved' : 'Save Plan'}
                </button>
              </div>
              <span className="text-body-sm font-body-sm text-ink-muted flex items-center gap-1">
                <span>NVLink 4 Fabric Verified</span>
                <span className="material-symbols-outlined text-[16px] text-status-healthy">check</span>
              </span>
            </div>
          </article>

          {/* RANK #3: Max Cost Economy */}
          <article className="bg-surface-elevated rounded-xl border border-hairline-default shadow-sm p-6 transition-all duration-200 hover:border-hairline-strong">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-canvas-alternate border border-hairline-default text-label-tag font-label-tag text-ink-muted tracking-wider uppercase font-semibold">
                  LEGACY ARCHITECTURE • RANK #3
                </span>
                <span className="text-label-mono font-label-mono text-ink-muted">PCIe Bus Gen4</span>
              </div>
              <span className="text-label-tag font-label-tag text-ink-muted">RELIABILITY INDEX: 96.1%</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-6 border-b border-hairline-subtle">
              <div className="lg:col-span-5 flex flex-col gap-1.5">
                <div className="text-label-tag font-label-tag text-ink-muted uppercase font-bold">Lambda Cloud (US-Texas)</div>
                <h2 className="text-headline-sm font-headline-sm text-ink-primary font-semibold">
                  8x NVIDIA A100 80GB PCIe
                </h2>
                <div className="text-body-sm font-body-sm text-ink-muted">
                  640GB Total VRAM • PCIe Interconnect • Dedicated Host
                </div>
              </div>
              <div className="lg:col-span-4 grid grid-cols-2 gap-4 bg-canvas-alternate/60 p-3.5 rounded-lg border border-hairline-subtle">
                <div>
                  <div className="text-label-tag font-label-tag text-ink-muted uppercase">Estimated Cost</div>
                  <div className="text-headline-sm font-headline-sm text-ink-primary font-bold mt-0.5">$41.20</div>
                  <div className="text-label-mono font-label-mono text-ink-subtle mt-0.5">
                    $10.05/hr combined compute
                  </div>
                </div>
                <div>
                  <div className="text-label-tag font-label-tag text-ink-muted uppercase">Runtime Range</div>
                  <div className="text-headline-sm font-headline-sm text-ink-primary font-bold mt-0.5">4h 05m – 4h 25m</div>
                  <div className="text-label-mono font-label-mono text-ink-subtle mt-0.5">
                    PCIe bus overhead bottleneck
                  </div>
                </div>
              </div>
              <div className="lg:col-span-3">
                <div className="text-label-tag font-label-tag text-ink-muted uppercase mb-1">Tradeoff Analysis</div>
                <p className="text-body-sm font-body-sm text-ink-body">
                  PCIe bus bottleneck under heavy gradient all-reduce. Sub-optimal cost efficiency compared to L40S Ada fabric.
                </p>
              </div>
            </div>
            <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenEarlyAccess}
                  className="h-9 px-4 rounded-full bg-ink-primary hover:bg-accent-olive-deep text-surface-elevated text-label-mono font-label-mono transition-all duration-150"
                >
                  Generate Execution Plan
                </button>
                <button
                  onClick={() => toggleSave('a100')}
                  className="h-9 px-3.5 rounded-full bg-surface-elevated border border-hairline-default text-ink-primary text-label-mono font-label-mono"
                >
                  {savedPlans.includes('a100') ? 'Saved' : 'Save Plan'}
                </button>
              </div>
              <span className="text-body-sm font-body-sm text-ink-muted">PCIe Bandwidth Clamp</span>
            </div>
          </article>

          {/* RANK #4: Next-Gen Sovereign Compute Preview */}
          <article className="bg-canvas-alternate/60 rounded-xl border border-hairline-default p-5 border-dashed">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-2.5 py-0.5 rounded bg-surface-elevated border border-hairline-default text-label-tag font-label-tag text-accent-olive-deep font-semibold">
                  PREVIEW BATCH // RANK #4
                </span>
                <span className="text-title-sm font-title-sm font-medium text-ink-primary">4x NVIDIA GH200 Grace Hopper (480GB + 96GB HBM3)</span>
                <span className="text-label-mono font-label-mono text-ink-muted hidden md:inline">Crusoe Cloud (EU-West Iceland)</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-label-tag font-label-tag text-ink-subtle uppercase block">Est. Cost</span>
                  <span className="text-title-sm font-title-sm font-semibold text-ink-primary">$35.10 USD</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-elevated border border-hairline-default text-label-tag font-label-tag text-ink-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                  100% Geo Clean Energy
                </span>
              </div>
            </div>
          </article>
        </section>

        {/* SECTION 4: DEEP DIVE COMPARATIVE ARCHITECTURE MATRIX */}
        <section className="mt-space-md rounded-xl bg-surface-elevated border border-hairline-default overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-hairline-default flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-canvas-alternate to-surface-elevated">
            <div>
              <h3 className="text-title-md font-title-md text-ink-primary font-medium">Comparative Architectural Matrix</h3>
              <p className="text-body-sm font-body-sm text-ink-muted">Hardware bottlenecks, thermal profiling, and memory rooflines across solver candidates.</p>
            </div>
            <span className="text-label-mono font-label-mono text-ink-muted">Roofline Model v4.1</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-hairline-default text-label-tag font-label-tag text-ink-subtle uppercase bg-canvas-base">
                  <th className="py-3 px-6">Hardware Profile</th>
                  <th className="py-3 px-4">VRAM Headroom (LoRA 8k)</th>
                  <th className="py-3 px-4">Interconnect Throughput</th>
                  <th className="py-3 px-4">Thermal Throttling Risk</th>
                  <th className="py-3 px-4">Cold-Start Spin Latency</th>
                  <th className="py-3 px-6 text-right">Effective $/hr</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-subtle text-body-sm font-body-sm">
                {/* Row 1: L40S */}
                <tr className="hover:bg-secondary-container/20 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-ink-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-olive"></span>
                    <span>8x L40S (RunPod Secure)</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-ink-body">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-hairline-subtle h-2 rounded-full overflow-hidden">
                        <div className="bg-accent-olive h-full w-[78%]"></div>
                      </div>
                      <span>64GB Buffer (Safe)</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-ink-body">RoCE v2 400 Gbps</td>
                  <td className="py-3.5 px-4 text-status-healthy font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>&lt; 0.2% probability</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-ink-body">24.2 seconds</td>
                  <td className="py-3.5 px-6 text-right font-mono font-medium text-ink-primary">$3.60</td>
                </tr>

                {/* Row 2: H100 */}
                <tr className="hover:bg-secondary-container/20 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-ink-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-status-healthy"></span>
                    <span>8x H100 SXM5 (CoreWeave)</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-ink-body">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-hairline-subtle h-2 rounded-full overflow-hidden">
                        <div className="bg-accent-olive h-full w-[45%]"></div>
                      </div>
                      <span>320GB Buffer (Excess)</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-ink-body">NVLink 4 + IB 3.2Tbps</td>
                  <td className="py-3.5 px-4 text-status-healthy font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>0.0% probability</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-ink-body">48.6 seconds</td>
                  <td className="py-3.5 px-6 text-right font-mono font-medium text-ink-primary">$6.07</td>
                </tr>

                {/* Row 3: A100 */}
                <tr className="hover:bg-secondary-container/20 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-ink-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-hairline-strong"></span>
                    <span>8x A100 PCIe (Lambda)</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-ink-body">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-hairline-subtle h-2 rounded-full overflow-hidden">
                        <div className="bg-status-warning h-full w-[88%]"></div>
                      </div>
                      <span>180GB Buffer (Moderate)</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-ink-body">PCIe Gen4 (64 GB/s)</td>
                  <td className="py-3.5 px-4 text-status-warning font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    <span>2.8% (Air-cooled)</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-ink-body">112.0 seconds</td>
                  <td className="py-3.5 px-6 text-right font-mono font-medium text-ink-primary">$10.05</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

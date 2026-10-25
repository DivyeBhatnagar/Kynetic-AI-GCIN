import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface MobileHomePageProps {
  onOpenEarlyAccess: () => void;
}

export const MobileHomePage: React.FC<MobileHomePageProps> = ({ onOpenEarlyAccess }) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="bg-canvas-base text-ink-primary font-body-md antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed min-h-screen flex flex-col justify-between items-center w-full">
      {/* 1. Top Navigation Bar (Mobile Optimized: 390px Viewport) */}
      <header className="sticky top-0 z-50 bg-canvas-base/95 backdrop-blur-sm border-b border-hairline-default w-full">
        <div className="max-w-[420px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center group" aria-label="Kynetic AI Home">
            <img
              alt="Kynetic AI — Autonomous Compute Intelligence Logo"
              className="h-7 w-auto object-contain transition-opacity group-hover:opacity-90"
              src="/assets/Kynetic%20AI%20Logo.png"
            />
          </Link>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenEarlyAccess}
              className="h-8 px-3 rounded-[9999px] bg-canvas-alternate border border-hairline-default text-ink-primary font-label-mono text-label-mono flex items-center gap-1 active:scale-95 transition-all"
            >
              <span>Early Access</span>
              <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
            </button>
            <button
              aria-label="Open Navigation"
              className="w-8 h-8 rounded-lg border border-hairline-default flex items-center justify-center bg-surface-elevated text-ink-primary active:bg-canvas-alternate"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            >
              <span className="material-symbols-outlined text-[18px]">
                {mobileDrawerOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu Drawer */}
        {mobileDrawerOpen && (
          <nav className="border-t border-hairline-default bg-canvas-alternate px-5 py-4 space-y-3">
            <Link
              to="/"
              className="block py-1 text-ink-primary font-medium border-b border-hairline-subtle"
            >
              Platform (Desktop View)
            </Link>
            <Link
              to="/workload-planner"
              className="block py-1 text-ink-body hover:text-ink-primary border-b border-hairline-subtle"
            >
              Workload Planner
            </Link>
            <Link
              to="/architecture"
              className="block py-1 text-ink-body hover:text-ink-primary border-b border-hairline-subtle"
            >
              Architecture &amp; Control Plane
            </Link>
            <Link
              to="/docs"
              className="block py-1 text-ink-body hover:text-ink-primary border-b border-hairline-subtle"
            >
              Documentation
            </Link>
            <Link to="/early-access" className="block py-1 text-ink-body hover:text-ink-primary">
              Private Cohort Admissions
            </Link>
          </nav>
        )}
      </header>

      {/* Main Column Flow (Constrained to 390px Viewport standard) */}
      <main className="w-full max-w-[420px] mx-auto px-4 pt-6 pb-16 flex-1 space-y-12">
        {/* 2. Hero Section */}
        <section className="space-y-6 pt-2 relative">
          {/* Soft atmospheric light olive radial glow backdrop */}
          <div
            className="absolute inset-x-0 top-0 h-96 pointer-events-none -z-10"
            style={{
              background:
                'radial-gradient(80% 50% at 50% -10%, rgba(217, 231, 200, 0.45), transparent 70%)',
            }}
          ></div>
          {/* Eyebrow label with olive system pulse indicator */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[9999px] bg-secondary-container border border-secondary-fixed">
            <span className="w-1.5 h-1.5 rounded-full bg-status-healthy animate-pulse"></span>
            <span className="font-label-mono text-label-tag tracking-wider uppercase text-on-secondary-fixed-variant font-semibold">
              Compute Intelligence, Reimagined
            </span>
          </div>
          {/* Hero Headline & Copy */}
          <div className="space-y-3">
            <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-ink-primary tracking-tight font-normal leading-[1.12]">
              Your AI workloads. <br />
              <span className="font-medium text-ink-primary">Always on the right compute.</span>
            </h1>
            <p className="font-body-md text-body-md text-ink-body leading-relaxed">
              Architectural workload routing across cloud, bare-metal, and private clusters. Zero
              synthetic markup, guaranteed thermal reliability, and automated spot salvage.
            </p>
          </div>
          {/* Action Stack */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={onOpenEarlyAccess}
              className="w-full h-11 rounded-[9999px] bg-ink-primary text-surface-elevated font-label-mono text-body-sm flex items-center justify-center gap-2 active:bg-accent-olive-deep transition-colors shadow-none"
            >
              <span>Get early access</span>
              <span className="material-symbols-outlined text-[16px]">north_east</span>
            </button>
            <Link
              to="/architecture"
              className="w-full h-11 rounded-[9999px] bg-transparent border border-hairline-default text-ink-primary font-label-mono text-body-sm flex items-center justify-center gap-1.5 active:bg-canvas-alternate transition-colors"
            >
              <span>Explore platform</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          {/* Micro Telemetry Ticker */}
          <div className="pt-2 border-t border-hairline-subtle flex items-center justify-between text-ink-muted font-label-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
              Cluster Latency: <span className="text-ink-primary font-medium">14.2ms</span>
            </span>
            <span className="text-ink-muted">Active GPUs: 128,490</span>
          </div>
        </section>

        {/* 3. Interactive Workload Planner Demo Card (Mobile-Optimized) */}
        <section className="rounded-xl border border-hairline-default bg-surface-elevated p-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-hairline-subtle">
            <span className="font-label-mono text-label-mono font-medium text-ink-primary">
              Workload Planner
            </span>
            <span className="px-2 py-0.5 rounded bg-canvas-alternate font-label-mono text-[11px] text-ink-muted">
              PREVIEW
            </span>
          </div>
          {/* Job Spec Prompt Box */}
          <div className="space-y-3">
            <div className="rounded-lg bg-canvas-alternate border border-hairline-subtle p-3 space-y-1.5">
              <span className="font-label-mono text-label-tag text-ink-muted uppercase">
                Job Spec Prompt
              </span>
              <p className="font-label-mono text-body-sm text-ink-primary">
                Fine-tune 7B model · &lt;8h deadline · Min cost
              </p>
            </div>
            {/* 2x2 Constraints Grid */}
            <div className="grid grid-cols-2 gap-2 text-label-mono text-[12px]">
              <div className="p-2.5 rounded border border-hairline-default bg-canvas-base space-y-0.5">
                <span className="text-ink-muted uppercase text-[10px] block">Max Budget</span>
                <span className="font-semibold text-ink-primary text-body-sm">$30.00 / run</span>
              </div>
              <div className="p-2.5 rounded border border-hairline-default bg-canvas-base space-y-0.5">
                <span className="text-ink-muted uppercase text-[10px] block">Max SLA</span>
                <span className="font-semibold text-ink-primary text-body-sm">8h 00m</span>
              </div>
              <div className="p-2.5 rounded border border-hairline-default bg-canvas-base space-y-0.5">
                <span className="text-ink-muted uppercase text-[10px] block">Memory Req</span>
                <span className="font-semibold text-ink-primary text-body-sm">&ge;320GB Total</span>
              </div>
              <div className="p-2.5 rounded border border-hairline-default bg-canvas-base space-y-0.5">
                <span className="text-ink-muted uppercase text-[10px] block">Topology</span>
                <span className="font-semibold text-ink-primary text-body-sm truncate block">
                  NVLink Interconnect
                </span>
              </div>
            </div>
            {/* Vertically Stacked GPU Candidate Cards */}
            <div className="space-y-2 pt-1">
              <span className="font-label-mono text-label-tag text-ink-muted uppercase tracking-wider block">
                Evaluated Compute Allocations
              </span>
              {/* GPU Option B: Recommended */}
              <div className="rounded-lg border-2 border-accent-olive bg-secondary-container/30 p-3 relative">
                <div className="flex items-center justify-between pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-status-healthy"></span>
                    <span className="font-headline-sm text-body-md font-semibold text-ink-primary">
                      NVIDIA 8x L40S 48GB
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-[9999px] bg-secondary-container border border-secondary-fixed text-accent-olive-deep font-label-mono text-[10px] uppercase font-semibold">
                    Recommended
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-sm pt-1 border-t border-hairline-subtle font-label-mono">
                  <span className="text-ink-body">
                    Cost: <strong className="text-ink-primary font-semibold">$27.80</strong>
                  </span>
                  <span className="text-ink-body">
                    Est. Time: <strong className="text-ink-primary font-semibold">7h 35m</strong>
                  </span>
                  <span className="text-accent-olive text-[11px] font-medium">-14% under cap</span>
                </div>
              </div>
              {/* GPU Option A */}
              <div className="rounded-lg border border-hairline-default bg-canvas-base p-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="font-headline-sm text-body-sm font-medium text-ink-primary">
                    NVIDIA H100 SXM5 80GB
                  </span>
                  <span className="font-label-mono text-[11px] text-ink-muted">High Speed</span>
                </div>
                <div className="flex items-center justify-between text-body-sm pt-1 border-t border-hairline-subtle font-label-mono">
                  <span className="text-ink-body">Cost: $42.50</span>
                  <span className="text-ink-body">Est: 2h 45m</span>
                  <span className="text-status-warning text-[11px]">+41% Budget Exceeded</span>
                </div>
              </div>
              {/* GPU Option C */}
              <div className="rounded-lg border border-hairline-default bg-canvas-base p-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="font-headline-sm text-body-sm font-medium text-ink-primary">
                    NVIDIA 4x A100 PCIe 80GB
                  </span>
                  <span className="font-label-mono text-[11px] text-ink-muted">Spot Bid</span>
                </div>
                <div className="flex items-center justify-between text-body-sm pt-1 border-t border-hairline-subtle font-label-mono">
                  <span className="text-ink-body">Cost: $21.90</span>
                  <span className="text-ink-body">Est: 8h 15m</span>
                  <span className="text-status-critical text-[11px]">SLA Breach (Risk)</span>
                </div>
              </div>
            </div>
            {/* CTA to Full Simulator */}
            <Link
              to="/workload-planner"
              className="w-full py-2.5 rounded-lg bg-canvas-alternate border border-hairline-default font-label-mono text-body-sm text-ink-primary flex items-center justify-center gap-1.5 hover:bg-canvas-base transition-colors"
            >
              <span>Open Full Interactive Simulator</span>
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </Link>
          </div>
        </section>

        {/* 4. Positioning Strip */}
        <section className="rounded-xl border border-hairline-default bg-canvas-alternate p-4 space-y-3">
          <div className="space-y-1">
            <span className="font-label-mono text-label-tag text-accent-olive uppercase tracking-wider block font-semibold">
              Unified Fabric
            </span>
            <h3 className="font-headline-sm text-body-lg font-medium text-ink-primary tracking-tight">
              ONE INTELLIGENCE LAYER. MULTIPLE COMPUTE PROVIDERS.
            </h3>
          </div>
          <p className="font-body-sm text-ink-body leading-relaxed">
            Decouple model orchestration from single-cloud lock-in. Real-time arbitrage between
            hyperscaler reservations and on-demand GPU capacity.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-hairline-default font-label-mono text-label-mono text-ink-primary">
              Zero Vendor Lock
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-hairline-default font-label-mono text-label-mono text-ink-primary">
              Thermal Throttling Guard
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-hairline-default font-label-mono text-label-mono text-ink-primary">
              Spot Preemption Recovery
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-hairline-default font-label-mono text-label-mono text-ink-primary">
              Automated Checkpointing
            </span>
          </div>
        </section>

        {/* 5. Problem -> Solution 3-Part Cards */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-title-md text-ink-primary">
              Infrastructure Reality
            </h2>
            <span className="font-label-mono text-[11px] text-ink-muted">Audit vs. Resolution</span>
          </div>
          <div className="space-y-3">
            {/* Card 01 */}
            <div className="rounded-xl border border-hairline-default bg-surface-elevated p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-label-mono text-title-sm font-semibold text-accent-olive">01</span>
                <span className="font-label-mono text-[10px] uppercase text-status-warning bg-canvas-alternate px-2 py-0.5 rounded">
                  High Fragmentation
                </span>
              </div>
              <h4 className="font-headline-sm text-title-sm text-ink-primary font-medium">
                GPU Fragmentation &amp; Manual Triage
              </h4>
              <p className="font-body-sm text-ink-body">
                ML engineers waste 18% of their engineering cycles manually provisioning nodes and
                matching CUDA versions across disparate provider consoles.
              </p>
              <div className="pt-2 border-t border-hairline-subtle text-body-sm text-ink-primary font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-accent-olive">
                  check_circle
                </span>
                <span>Single declarative API routes across all architectures.</span>
              </div>
            </div>
            {/* Card 02 */}
            <div className="rounded-xl border border-hairline-default bg-surface-elevated p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-label-mono text-title-sm font-semibold text-accent-olive">02</span>
                <span className="font-label-mono text-[10px] uppercase text-status-critical bg-canvas-alternate px-2 py-0.5 rounded">
                  Uncontrolled Cost
                </span>
              </div>
              <h4 className="font-headline-sm text-title-sm text-ink-primary font-medium">
                Overprovisioning as Default Habit
              </h4>
              <p className="font-body-sm text-ink-body">
                Teams default to top-tier SXM cards regardless of batch size or precision
                constraints, creating 40%+ idle GPU memory waste during training epochs.
              </p>
              <div className="pt-2 border-t border-hairline-subtle text-body-sm text-ink-primary font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-accent-olive">
                  check_circle
                </span>
                <span>Right-sized tensor core matching cuts spend by 34%.</span>
              </div>
            </div>
            {/* Card 03 */}
            <div className="rounded-xl border border-hairline-default bg-surface-elevated p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-label-mono text-title-sm font-semibold text-accent-olive">03</span>
                <span className="font-label-mono text-[10px] uppercase text-ink-muted bg-canvas-alternate px-2 py-0.5 rounded">
                  Silent Degradation
                </span>
              </div>
              <h4 className="font-headline-sm text-title-sm text-ink-primary font-medium">
                Thermal Throttling &amp; Silent Drops
              </h4>
              <p className="font-body-sm text-ink-body">
                Standard hypervisors fail to alert on node thermal degradation, causing silent
                throughput drops and stalled long-running distributed jobs.
              </p>
              <div className="pt-2 border-t border-hairline-subtle text-body-sm text-ink-primary font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-accent-olive">
                  check_circle
                </span>
                <span>Telemetry pre-empts thermal stalls with seamless migration.</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. 4-Step Vertical Process Flow */}
        <section className="space-y-4">
          <div className="space-y-1">
            <span className="font-label-mono text-label-tag text-accent-olive uppercase tracking-wider block font-semibold">
              Lifecycle
            </span>
            <h2 className="font-headline-sm text-title-md text-ink-primary">
              Autonomous Routing Pipeline
            </h2>
          </div>
          <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-hairline-strong">
            {/* Step 01 */}
            <div className="relative space-y-1">
              <div className="absolute -left-[29px] top-0.5 w-[22px] h-[22px] rounded-full bg-surface-elevated border-2 border-ink-primary flex items-center justify-center font-label-mono text-[10px] font-bold text-ink-primary">
                01
              </div>
              <h4 className="font-headline-sm text-body-md font-semibold text-ink-primary">
                01 Describe
              </h4>
              <p className="font-body-sm text-ink-body">
                Submit simple job parameters: target parameters, time constraints, memory bandwidth
                targets, or maximum budget.
              </p>
            </div>
            {/* Step 02 */}
            <div className="relative space-y-1">
              <div className="absolute -left-[29px] top-0.5 w-[22px] h-[22px] rounded-full bg-surface-elevated border border-hairline-strong flex items-center justify-center font-label-mono text-[10px] text-ink-muted">
                02
              </div>
              <h4 className="font-headline-sm text-body-md font-semibold text-ink-primary">
                02 Evaluate
              </h4>
              <p className="font-body-sm text-ink-body">
                Kynetic’s simulator tests your kernel profile against hundreds of active cluster nodes
                in parallel within 800ms.
              </p>
            </div>
            {/* Step 03 */}
            <div className="relative space-y-1">
              <div className="absolute -left-[29px] top-0.5 w-[22px] h-[22px] rounded-full bg-surface-elevated border border-hairline-strong flex items-center justify-center font-label-mono text-[10px] text-ink-muted">
                03
              </div>
              <h4 className="font-headline-sm text-body-md font-semibold text-ink-primary">
                03 Plan
              </h4>
              <p className="font-body-sm text-ink-body">
                Receive deterministic execution plans with cost, runtime, and thermal resilience
                guarantees prior to container launch.
              </p>
            </div>
            {/* Step 04 */}
            <div className="relative space-y-1">
              <div className="absolute -left-[29px] top-0.5 w-[22px] h-[22px] rounded-full bg-secondary-container border-2 border-accent-olive flex items-center justify-center font-label-mono text-[10px] font-bold text-accent-olive-deep">
                04
              </div>
              <h4 className="font-headline-sm text-body-md font-semibold text-ink-primary">
                04 Optimize
              </h4>
              <p className="font-body-sm text-ink-body">
                Real-time live telemetry dynamically reallocates micro-batches if spot nodes receive
                eviction flags.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Compute Intelligence Cards with 'Roadmap' Badges */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-title-md text-ink-primary">Core Intelligence</h2>
            <span className="font-label-mono text-[11px] text-ink-muted">Capabilities</span>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-hairline-default bg-surface-elevated space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-body-md font-semibold text-ink-primary">
                  Dynamic Kernel Sharding
                </span>
                <span className="px-2 py-0.5 rounded bg-canvas-alternate border border-hairline-subtle text-ink-muted font-label-mono text-[10px] uppercase">
                  GA · v1.4
                </span>
              </div>
              <p className="font-body-sm text-ink-body">
                Automated Megatron-LM tensor parallel slicing without requiring model re-architecting
                or code modifications.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-hairline-default bg-surface-elevated space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-body-md font-semibold text-ink-primary">
                  Spot Arbitrage Orchestrator
                </span>
                <span className="px-2 py-0.5 rounded bg-secondary-container text-accent-olive-deep font-label-mono text-[10px] uppercase font-semibold">
                  Active Feed
                </span>
              </div>
              <p className="font-body-sm text-ink-body">
                Cross-provider spot bids with continuous snapshotting to salvage uncommitted capacity
                at 60–80% discounts.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-hairline-default bg-surface-elevated space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-body-md font-semibold text-ink-primary">
                  Pre-Run Roofline Simulator
                </span>
                <span className="px-2 py-0.5 rounded bg-canvas-alternate border border-hairline-subtle text-ink-muted font-label-mono text-[10px] uppercase">
                  Q2 Preview
                </span>
              </div>
              <p className="font-body-sm text-ink-body">
                Deterministic cost calculation against real network topologies before scheduling GPU
                allocations.
              </p>
            </div>
          </div>
        </section>

        {/* 8. Python SDK Code Panel */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-title-md text-ink-primary">Declarative API</h2>
            <span className="font-label-mono text-[11px] text-ink-muted">python-sdk</span>
          </div>
          <div className="rounded-xl border border-hairline-default bg-surface-elevated p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-hairline-subtle">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-hairline-strong"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-hairline-strong"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-hairline-strong"></span>
              </div>
              <span className="font-label-mono text-[11px] text-ink-muted">
                orchestration_job.py
              </span>
            </div>
            <pre className="text-[12px] leading-5 text-ink-primary overflow-x-auto py-1 font-mono">
              <code>
                <span className="text-ink-muted">import</span>{' '}
                <span className="text-accent-olive font-medium">kynetic</span>{' '}
                <span className="text-ink-muted">as</span> kn
                {'\n\n'}
                <span className="text-ink-muted"># 1. Initialize workload target</span>
                {'\n'}
                job = kn.Workload(
                {'\n'}    model=<span className="text-accent-olive-deep">"mistralai/Mistral-7B-v0.1"</span>,
                {'\n'}    task=<span className="text-accent-olive-deep">"fine_tune_lora"</span>,
                {'\n'}    max_budget_usd=<span className="text-accent-olive font-medium">30.00</span>,
                {'\n'}    max_duration_hours=<span className="text-accent-olive font-medium">8.0</span>
                {'\n'})
                {'\n\n'}
                <span className="text-ink-muted"># 2. Compile optimal execution plan</span>
                {'\n'}
                plan = kn.planner.resolve(job)
                {'\n'}
                <span className="text-ink-muted">
                  print(f"Assigned: &#123;plan.gpu_sku&#125; | Est: $&#123;plan.cost&#125;")
                </span>
                {'\n\n'}
                <span className="text-ink-muted"># 3. Autonomous dispatch with spot fallback</span>
                {'\n'}
                cluster = kn.dispatch(plan, spot_fallback=
                <span className="text-accent-olive font-medium">True</span>)
                {'\n'}
                cluster.stream_telemetry()
              </code>
            </pre>
          </div>
          <p className="font-label-mono text-[11px] text-ink-muted">
            ← Swipe code block horizontally to inspect full definition
          </p>
        </section>

        {/* 9. Compact Final CTA */}
        <section
          className="relative rounded-xl border border-secondary-fixed bg-surface-elevated p-5 text-center space-y-4 overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(217, 231, 200, 0.45), rgb(255, 255, 255) 75%)',
          }}
        >
          <div className="space-y-1.5 relative z-10">
            <h3 className="font-headline-sm text-headline-sm text-ink-primary">
              Ready to orchestrate compute?
            </h3>
            <p className="font-body-sm text-ink-body">
              Join high-scale ML engineering teams running production LLM pipelines on Kynetic.
            </p>
          </div>
          <div className="space-y-2 relative z-10">
            <button
              onClick={onOpenEarlyAccess}
              className="w-full h-11 rounded-[9999px] bg-ink-primary text-surface-elevated font-label-mono text-body-sm flex items-center justify-center gap-2 active:bg-accent-olive-deep transition-colors"
            >
              <span>Request access key</span>
              <span className="material-symbols-outlined text-[16px]">key</span>
            </button>
            <span className="font-label-mono text-[11px] text-ink-muted block">
              Direct API credentials within 24 hours
            </span>
          </div>
        </section>

        {/* 10. Minimalist Mobile Footer */}
        <footer className="pt-6 border-t border-hairline-default text-center space-y-3 text-ink-muted font-body-sm text-[12px]">
          <div className="flex items-center justify-center">
            <img
              alt="Kynetic AI — Autonomous Compute Intelligence Logo"
              className="h-6 w-auto object-contain"
              src="/assets/Kynetic%20AI%20Logo.png"
            />
          </div>
          <p>© 2026 Kynetic AI • Made in India 🇮🇳. Autonomous Compute Intelligence.</p>
          <div className="flex flex-wrap justify-center gap-3 text-ink-body font-label-mono text-[11px]">
            <Link to="/privacy-policy" className="hover:underline">
              Privacy
            </Link>
            <Link to="/terms" className="hover:underline">
              Terms
            </Link>
            <Link to="/cookie-policy" className="hover:underline">
              Cookies
            </Link>
            <Link to="/refund-policy" className="hover:underline">
              Refunds
            </Link>
            <Link to="/docs" className="hover:underline">
              Docs
            </Link>
            <Link to="/architecture" className="hover:underline">
              Architecture
            </Link>
            <Link to="/workload-planner" className="hover:underline">
              Planner
            </Link>
            <button onClick={onOpenEarlyAccess} className="hover:underline">
              Early Access
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

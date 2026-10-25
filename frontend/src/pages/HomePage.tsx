import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface HomePageProps {
  onOpenEarlyAccess: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenEarlyAccess }) => {
  const [selectedPlan, setSelectedPlan] = useState<number>(2); // Option B selected by default
  const [emailInput, setEmailInput] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setEmailSubmitted(true);
    }
  };

  return (
    <main className="flex-1 w-full">
      {/* ========================================== */}
      {/* 2. HERO SECTION                            */}
      {/* ========================================== */}
      <section
        className="pt-16 pb-12 md:pt-24 md:pb-16 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center"
        id="hero"
      >
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas-alternate border border-hairline-default rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-status-healthy"></span>
          <span className="font-label-mono text-label-mono uppercase text-ink-body tracking-wider">
            COMPUTE INTELLIGENCE, REIMAGINED
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="font-headline-xl text-headline-xl max-w-4xl text-ink-primary tracking-tight mb-6">
          Your AI workloads. Always on the{' '}
          <span className="text-accent-olive font-medium">right compute</span>.
        </h1>

        {/* Subhead */}
        <p className="font-body-lg text-body-lg text-ink-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          Kynetic finds the best way to run your AI workloads across compute providers—balancing
          cost, performance, reliability, and time to completion.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <button
            onClick={onOpenEarlyAccess}
            className="inline-flex items-center justify-center h-10 px-6 bg-ink-primary hover:bg-accent-olive-deep text-canvas-base rounded-full font-label-mono text-label-mono font-medium transition-all duration-150 active:scale-[0.98]"
          >
            Get early access ↗
          </button>
          <a
            className="inline-flex items-center justify-center h-10 px-6 bg-transparent hover:bg-canvas-alternate border border-hairline-default hover:border-ink-primary text-ink-primary rounded-full font-label-mono text-label-mono font-medium transition-all duration-150"
            href="#platform"
          >
            Explore the platform →
          </a>
        </div>

        {/* Trust Line */}
        <p className="font-label-mono text-label-mono text-ink-subtle uppercase tracking-wider">
          Built for AI engineers, research teams, and compute-intensive businesses.
        </p>
      </section>

      {/* ========================================== */}
      {/* 3. HERO PRODUCT VISUALIZATION (PLANNER)   */}
      {/* ========================================== */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto pb-24" id="workload-planner">
        <div className="border border-hairline-default rounded-lg bg-surface-elevated overflow-hidden shadow-sm">
          {/* Planner Header Terminal Strip */}
          <div className="bg-canvas-alternate px-6 py-3.5 border-b border-hairline-default flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-label-mono text-label-mono uppercase tracking-wider text-ink-primary font-semibold">
                WORKLOAD PLANNER
              </span>
              <span className="text-hairline-strong font-label-mono text-label-mono">|</span>
              <span className="font-label-mono text-label-mono text-ink-muted">
                v2.4 Kernel Optimizer
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-canvas-base border border-hairline-default">
              <span className="w-2 h-2 rounded-full bg-status-active"></span>
              <span className="font-label-mono text-label-mono text-ink-body">
                DEMO SIMULATION
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* User Input Prompt Box */}
            <div className="mb-6">
              <label className="block font-label-mono text-label-mono text-ink-muted uppercase tracking-wider mb-2">
                Target Workload Specification
              </label>
              <div className="flex items-center justify-between p-4 bg-canvas-base border border-hairline-default rounded-md text-ink-primary font-headline-sm text-title-md">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-accent-olive">terminal</span>
                  <span className="font-body-md text-body-md text-ink-primary font-medium">
                    Fine-tune a 7B parameter model. Finish within 8 hours. Minimize total cost.
                  </span>
                </div>
                <span className="font-label-mono text-label-mono text-ink-muted bg-canvas-alternate px-2 py-1 rounded border border-hairline-subtle hidden sm:inline-block">
                  PARSED INTENT
                </span>
              </div>
            </div>

            {/* Constraint Chips Row */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="font-label-mono text-label-mono text-ink-muted mr-1">
                Constraints:
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-canvas-alternate border border-hairline-default rounded text-ink-body font-label-mono text-label-mono">
                <span className="material-symbols-outlined text-sm text-ink-muted">payments</span>
                Budget: $50
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-canvas-alternate border border-hairline-default rounded text-ink-body font-label-mono text-label-mono">
                <span className="material-symbols-outlined text-sm text-ink-muted">schedule</span>
                Deadline: 8 hours
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-canvas-alternate border border-hairline-default rounded text-ink-body font-label-mono text-label-mono">
                <span className="material-symbols-outlined text-sm text-ink-muted">memory</span>
                GPU memory: 24 GB+
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-canvas-alternate border border-hairline-default rounded text-ink-body font-label-mono text-label-mono">
                <span className="material-symbols-outlined text-sm text-ink-muted">dns</span>
                Region: Preferred region
              </span>
            </div>

            {/* Comparison Table Structure */}
            <div className="border border-hairline-default rounded overflow-hidden">
              <div className="bg-canvas-alternate grid grid-cols-12 px-5 py-2.5 font-label-mono text-label-mono uppercase tracking-wider text-ink-muted border-b border-hairline-default">
                <div className="col-span-5">Provider &amp; Architecture</div>
                <div className="col-span-2 text-right">Estimated Total</div>
                <div className="col-span-2 text-right">Runtime</div>
                <div className="col-span-1 text-center">Memory</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              {/* Option A */}
              <div
                onClick={() => setSelectedPlan(1)}
                className={`grid grid-cols-12 px-5 py-4 items-center border-b border-hairline-subtle transition-colors cursor-pointer ${
                  selectedPlan === 1 ? 'bg-canvas-base border-l-4 border-l-ink-primary' : 'hover:bg-canvas-base'
                }`}
              >
                <div className="col-span-5 flex items-center gap-3">
                  <span className="font-label-mono text-label-mono text-ink-subtle">01</span>
                  <div>
                    <div className="font-headline-sm text-title-sm text-ink-primary font-medium">
                      NVIDIA H100 SXM5 80GB
                    </div>
                    <div className="font-body-sm text-body-sm text-ink-muted">
                      CoreWeave Cluster Node · Direct InfiniBand
                    </div>
                  </div>
                </div>
                <div className="col-span-2 text-right font-headline-sm text-title-sm text-ink-primary font-medium">
                  $32.40
                </div>
                <div className="col-span-2 text-right font-body-md text-body-md text-ink-body">
                  5h 20m
                </div>
                <div className="col-span-1 text-center font-label-mono text-label-mono text-ink-muted">
                  80 GB
                </div>
                <div className="col-span-2 text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-canvas-alternate border border-hairline-default text-ink-body font-label-mono text-label-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                    Compatible
                  </span>
                </div>
              </div>

              {/* Option B (RECOMMENDED) */}
              <div
                onClick={() => setSelectedPlan(2)}
                className={`grid grid-cols-12 px-5 py-4 items-center border-y-2 border-accent-olive bg-[#FAF9F5] relative transition-colors cursor-pointer ${
                  selectedPlan === 2 ? 'ring-1 ring-accent-olive shadow-sm' : ''
                }`}
              >
                <div className="col-span-5 flex items-center gap-3">
                  <span className="font-label-mono text-label-mono text-accent-olive font-bold">
                    02
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-title-sm text-ink-primary font-semibold">
                        NVIDIA 8x L40S 48GB
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-accent-olive text-canvas-base font-label-mono text-label-mono font-medium text-[10px]">
                        RECOMMENDED
                      </span>
                    </div>
                    <div className="font-body-sm text-body-sm text-accent-olive font-medium">
                      Optimal balance: $4.60 under budget · 25m safety margin
                    </div>
                  </div>
                </div>
                <div className="col-span-2 text-right font-headline-sm text-title-sm text-ink-primary font-semibold">
                  $27.80
                </div>
                <div className="col-span-2 text-right font-body-md text-body-md text-ink-primary font-medium">
                  7h 35m
                </div>
                <div className="col-span-1 text-center font-label-mono text-label-mono text-ink-muted">
                  384 GB
                </div>
                <div className="col-span-2 text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-canvas-alternate border border-accent-olive text-ink-primary font-label-mono text-label-mono font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-active"></span>
                    Best Tradeoff
                  </span>
                </div>
              </div>

              {/* Option C */}
              <div
                onClick={() => setSelectedPlan(3)}
                className={`grid grid-cols-12 px-5 py-4 items-center transition-colors cursor-pointer ${
                  selectedPlan === 3 ? 'bg-canvas-base border-l-4 border-l-ink-primary' : 'hover:bg-canvas-base'
                }`}
              >
                <div className="col-span-5 flex items-center gap-3">
                  <span className="font-label-mono text-label-mono text-ink-subtle">03</span>
                  <div>
                    <div className="font-headline-sm text-title-sm text-ink-primary font-medium">
                      NVIDIA A100 80GB PCIe
                    </div>
                    <div className="font-body-sm text-body-sm text-ink-muted">
                      Lambda Cloud · Dedicated On-Demand
                    </div>
                  </div>
                </div>
                <div className="col-span-2 text-right font-headline-sm text-title-sm text-ink-primary font-medium">
                  $41.20
                </div>
                <div className="col-span-2 text-right font-body-md text-body-md text-ink-body">
                  4h 10m
                </div>
                <div className="col-span-1 text-center font-label-mono text-label-mono text-ink-muted">
                  80 GB
                </div>
                <div className="col-span-2 text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-canvas-alternate border border-hairline-default text-ink-body font-label-mono text-label-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                    Compatible
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-ink-muted font-label-mono text-label-mono gap-2">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-ink-subtle">info</span>
                Estimated costs calculated via benchmark telemetry. Illustrative demo data — not
                live broker quotes.
              </span>
              <span className="text-ink-subtle">Execution Engine 2.14.0</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 4. POSITIONING / CAPABILITY STRIP          */}
      {/* ========================================== */}
      <section className="border-y border-hairline-default bg-canvas-alternate py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="font-label-mono text-label-mono uppercase tracking-widest text-ink-muted text-center mb-8">
            ONE INTELLIGENCE LAYER. MULTIPLE COMPUTE PROVIDERS.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-hairline-default pb-6 md:pb-0 md:pr-6">
              <div className="font-headline-sm text-title-md text-ink-primary font-medium mb-1">
                Compare total cost
              </div>
              <p className="font-body-sm text-body-sm text-ink-muted">
                Factor in start latency, egress penalties, memory overhead, and true job completion
                duration.
              </p>
            </div>
            <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-hairline-default pb-6 md:pb-0 md:px-6">
              <div className="font-headline-sm text-title-sm text-ink-primary font-medium mb-1">
                Predict workload performance
              </div>
              <p className="font-body-sm text-body-sm text-ink-muted">
                Simulate runtime accuracy based on model parameter architecture and memory
                bandwidth constraints.
              </p>
            </div>
            <div className="text-center md:text-left md:pl-6">
              <div className="font-headline-sm text-title-sm text-ink-primary font-medium mb-1">
                Optimize execution
              </div>
              <p className="font-body-sm text-body-sm text-ink-muted">
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
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto" id="platform">
        <div className="mb-16 max-w-3xl">
          <span className="font-label-mono text-label-mono uppercase tracking-wider text-accent-olive font-semibold mb-2 block">
            THE COMPUTATION DILEMMA
          </span>
          <h2 className="font-headline-lg text-headline-lg text-ink-primary tracking-tight mb-4">
            Choosing a GPU shouldn't be guesswork.
          </h2>
          <p className="font-body-lg text-body-lg text-ink-muted leading-relaxed">
            Hourly pricing only tells part of the story. The real cost depends on runtime, startup
            delays, data movement, failures, and recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border border-hairline-default rounded-lg bg-surface-elevated overflow-hidden divide-y md:divide-y-0 md:divide-x divide-hairline-default">
          {/* Column 01 */}
          <div className="p-8 flex flex-col justify-between">
            <div>
              <div className="font-label-mono text-label-mono text-ink-subtle uppercase tracking-wider mb-6">
                STEP 01
              </div>
              <h3 className="font-headline-sm text-headline-sm text-ink-primary font-medium mb-4">
                01 — Compare beyond hourly rates
              </h3>
              <p className="font-body-md text-body-md text-ink-muted leading-relaxed mb-6">
                A cheaper GPU per hour that runs twice as long costs more. Kynetic models actual
                runtimes across hardware generations before you provision a single minute of
                compute.
              </p>
            </div>
            <div className="p-4 bg-canvas-alternate rounded border border-hairline-subtle font-label-mono text-label-mono text-ink-body">
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
          <div className="p-8 flex flex-col justify-between">
            <div>
              <div className="font-label-mono text-label-mono text-ink-subtle uppercase tracking-wider mb-6">
                STEP 02
              </div>
              <h3 className="font-headline-sm text-headline-sm text-ink-primary font-medium mb-4">
                02 — Predict before you provision
              </h3>
              <p className="font-body-md text-body-md text-ink-muted leading-relaxed mb-6">
                Input your model size, batch parameters, and framework. Our performance twin
                predicts memory fit, time-to-completion, and throttling probability with calibrated
                confidence intervals.
              </p>
            </div>
            <div className="p-4 bg-canvas-alternate rounded border border-hairline-subtle font-label-mono text-label-mono text-ink-body">
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
          <div className="p-8 flex flex-col justify-between">
            <div>
              <div className="font-label-mono text-label-mono text-ink-subtle uppercase tracking-wider mb-6">
                STEP 03
              </div>
              <h3 className="font-headline-sm text-headline-sm text-ink-primary font-medium mb-4">
                03 — Optimize as conditions change
              </h3>
              <p className="font-body-md text-body-md text-ink-muted leading-relaxed mb-6">
                Spot market drops or node degradations trigger real-time arbitrage. Kynetic
                calculates whether the cost of migrating checkpoints is offset by the destination's
                superior efficiency.
              </p>
            </div>
            <div className="p-4 bg-canvas-alternate rounded border border-hairline-subtle font-label-mono text-label-mono text-ink-body">
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
      <section className="py-20 border-t border-hairline-default bg-canvas-base" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <span className="font-label-mono text-label-mono uppercase tracking-wider text-accent-olive font-semibold mb-2 block">
                PIPELINE EXECUTION
              </span>
              <h2 className="font-headline-lg text-headline-lg text-ink-primary tracking-tight">
                From workload to execution.
              </h2>
            </div>
            <p className="font-body-md text-body-md text-ink-muted max-w-md mt-4 md:mt-0">
              A continuous four-stage control loop running autonomously behind every training
              session, batch inference job, or fine-tuning run.
            </p>
          </div>

          {/* 4-step horizontal pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-6 flex flex-col justify-between relative hover:border-hairline-strong transition-colors">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-label-mono text-label-mono font-bold px-2 py-0.5 rounded bg-canvas-alternate border border-hairline-default text-ink-primary">
                    01
                  </span>
                  <span className="material-symbols-outlined text-ink-muted">edit_note</span>
                </div>
                <h4 className="font-headline-sm text-title-md text-ink-primary font-medium mb-2">
                  Describe
                </h4>
                <p className="font-body-sm text-body-sm text-ink-muted">
                  Define model parameters, target duration, hardware preferences, and budgetary
                  ceilings.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-hairline-subtle font-label-mono text-label-mono text-ink-subtle">
                Input parsing layer
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-6 flex flex-col justify-between relative hover:border-hairline-strong transition-colors">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-label-mono text-label-mono font-bold px-2 py-0.5 rounded bg-canvas-alternate border border-hairline-default text-ink-primary">
                    02
                  </span>
                  <span className="material-symbols-outlined text-ink-muted">analytics</span>
                </div>
                <h4 className="font-headline-sm text-title-md text-ink-primary font-medium mb-2">
                  Evaluate
                </h4>
                <p className="font-body-sm text-body-sm text-ink-muted">
                  Simulate job performance across bare metal, multi-cloud, and secondary compute
                  clusters.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-hairline-subtle font-label-mono text-label-mono text-ink-subtle">
                Benchmark digital twin
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-6 flex flex-col justify-between relative hover:border-hairline-strong transition-colors">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-label-mono text-label-mono font-bold px-2 py-0.5 rounded bg-canvas-alternate border border-hairline-default text-ink-primary">
                    03
                  </span>
                  <span className="material-symbols-outlined text-ink-muted">alt_route</span>
                </div>
                <h4 className="font-headline-sm text-title-md text-ink-primary font-medium mb-2">
                  Plan
                </h4>
                <p className="font-body-sm text-body-sm text-ink-muted">
                  Receive deterministic recommendations detailing exact financial, time, and
                  reliability metrics.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-hairline-subtle font-label-mono text-label-mono text-ink-subtle">
                Constrained routing
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-6 flex flex-col justify-between relative hover:border-hairline-strong transition-colors">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-label-mono text-label-mono font-bold px-2 py-0.5 rounded bg-canvas-alternate border border-hairline-default text-ink-primary">
                    04
                  </span>
                  <span className="material-symbols-outlined text-ink-muted">sync</span>
                </div>
                <h4 className="font-headline-sm text-title-md text-ink-primary font-medium mb-2">
                  Optimize
                </h4>
                <p className="font-body-sm text-body-sm text-ink-muted">
                  Maintain active telemetry to dynamically checkpoint, pause, or rebalance execution
                  if costs fluctuate.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-hairline-subtle font-label-mono text-label-mono text-ink-subtle">
                Active telemetry loop
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 7. COMPUTE INTELLIGENCE SECTION            */}
      {/* ========================================== */}
      <section className="py-24 bg-canvas-alternate border-y border-hairline-default">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-2xl mb-16">
            <span className="font-label-mono text-label-mono uppercase tracking-wider text-accent-olive font-semibold mb-2 block">
              CORE ARCHITECTURE
            </span>
            <h2 className="font-headline-lg text-headline-lg text-ink-primary tracking-tight mb-4">
              Not another GPU marketplace. An intelligence layer.
            </h2>
            <p className="font-body-lg text-body-lg text-ink-muted leading-relaxed">
              Marketplaces sell capacity. Kynetic optimizes decisions across all of them without
              lock-in or supplier preference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-8">
              <div className="w-10 h-10 rounded bg-canvas-alternate border border-hairline-default flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-ink-primary">model_training</span>
              </div>
              <h3 className="font-headline-sm text-title-md text-ink-primary font-medium mb-3">
                Workload Performance Digital Twin
              </h3>
              <p className="font-body-md text-body-md text-ink-muted leading-relaxed mb-6">
                Predict runtime, cost, and memory saturation before launch. Built using actual
                execution curves across thousands of foundation models.
              </p>
              <ul className="space-y-2 border-t border-hairline-subtle pt-4 font-label-mono text-label-mono text-ink-body">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                  <span>Bandwidth profiling (PCIe vs NVLink)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                  <span>Batch throughput curves</span>
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-8">
              <div className="w-10 h-10 rounded bg-canvas-alternate border border-hairline-default flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-ink-primary">balance</span>
              </div>
              <h3 className="font-headline-sm text-title-md text-ink-primary font-medium mb-3">
                Predictive Compute Arbitrage
              </h3>
              <p className="font-body-md text-body-md text-ink-muted leading-relaxed mb-6">
                Compare remaining workload cost against migration penalties in real time. Never
                leave money on the table when secondary market spot prices dive.
              </p>
              <ul className="space-y-2 border-t border-hairline-subtle pt-4 font-label-mono text-label-mono text-ink-body">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                  <span>Egress cost compensation</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                  <span>SLA violation safeguards</span>
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-8 relative">
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded bg-canvas-alternate border border-hairline-default flex items-center justify-center">
                  <span className="material-symbols-outlined text-ink-primary">
                    history_toggle_off
                  </span>
                </div>
                <span className="font-label-mono text-label-mono px-2 py-0.5 rounded bg-canvas-alternate text-ink-muted border border-hairline-default">
                  Roadmap
                </span>
              </div>
              <h3 className="font-headline-sm text-title-md text-ink-primary font-medium mb-3">
                Checkpoint &amp; Resume
              </h3>
              <p className="font-body-md text-body-md text-ink-muted leading-relaxed mb-6">
                Seamlessly capture state across divergent hardware platforms without code alteration.
                Moving an in-flight PyTorch session from Lambda to RunPod effortlessly.
              </p>
              <ul className="space-y-2 border-t border-hairline-subtle pt-4 font-label-mono text-label-mono text-ink-body">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-subtle"></span>
                  <span>Universal tensor state serialization</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-subtle"></span>
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
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto" id="developers">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Explanatory Column */}
          <div className="lg:col-span-5">
            <span className="font-label-mono text-label-mono uppercase tracking-wider text-accent-olive font-semibold mb-2 block">
              SDK &amp; WORKFLOW
            </span>
            <h2 className="font-headline-lg text-headline-lg text-ink-primary tracking-tight mb-4">
              Designed for developers. Built for real workloads.
            </h2>
            <p className="font-body-lg text-body-lg text-ink-muted mb-8 leading-relaxed">
              Keep your existing workflows. Add a layer of intelligence around where and how your
              workloads run.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-accent-olive mt-0.5">
                  check_circle
                </span>
                <p className="font-body-md text-body-md text-ink-body">
                  Native Python client with async scheduling primitives.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-accent-olive mt-0.5">
                  check_circle
                </span>
                <p className="font-body-md text-body-md text-ink-body">
                  Drop-in compatibility with PyTorch, Ray, and Hugging Face Trainer.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-accent-olive mt-0.5">
                  check_circle
                </span>
                <p className="font-body-md text-body-md text-ink-body">
                  Deterministic dry-runs via CLI to inspect cost curves locally.
                </p>
              </div>
            </div>
            <Link
              to="/docs"
              className="inline-flex items-center gap-2 font-headline-sm text-title-sm text-ink-primary hover:text-accent-olive transition-colors font-medium"
            >
              <span>Explore the developer platform</span>
              <span>→</span>
            </Link>
          </div>

          {/* Right Terminal / Code Panel */}
          <div className="lg:col-span-7">
            <div className="bg-[#141413] border border-[#2B2A27] rounded-lg overflow-hidden shadow-none">
              {/* Terminal Titlebar */}
              <div className="px-4 py-3 bg-[#1C1B19] border-b border-[#2B2A27] flex items-center justify-between text-[#8E8D88] font-label-mono text-label-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#33322E]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#33322E]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#33322E]"></span>
                  <span className="ml-2 text-[#C4C3BC]">plan_execution.py</span>
                </div>
                <span>python3 · kynetic-v0.9.4</span>
              </div>
              {/* Code Content */}
              <div className="p-6 technical-code text-[13px] leading-relaxed overflow-x-auto text-[#E4E3DD]">
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
              <div className="px-5 py-2.5 bg-[#181816] border-t border-[#2B2A27] text-[11px] text-[#7F7E77] font-label-mono">
                Conceptual SDK example — API availability and syntax are subject to implementation.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 9. FINAL SPACIOUS CTA                      */}
      {/* ========================================== */}
      <section className="py-24 border-t border-hairline-default bg-canvas-base text-center" id="access">
        <div className="max-w-4xl mx-auto px-6">
          <span className="font-label-mono text-label-mono uppercase tracking-widest text-accent-olive font-semibold mb-4 block">
            GET STARTED
          </span>
          <h2 className="font-headline-xl text-headline-xl text-ink-primary tracking-tight mb-6">
            Better compute decisions start here.
          </h2>
          <p className="font-body-lg text-body-lg text-ink-muted max-w-xl mx-auto mb-10">
            Join leading machine learning teams using Kynetic to eliminate overprovisioning and run
            workloads on the optimal hardware.
          </p>

          {emailSubmitted ? (
            <div className="p-4 bg-canvas-alternate border border-hairline-default rounded-lg max-w-md mx-auto text-ink-primary font-body-md flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-status-healthy text-[20px]">check_circle</span>
              <span>Thank you! We'll invite your team in Cohort 04.</span>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <input
                className="w-full sm:w-72 h-10 px-4 rounded bg-surface-elevated border border-hairline-default text-ink-primary placeholder:text-ink-subtle text-body-md focus:border-ink-primary focus:ring-0 focus:outline-none"
                placeholder="name@company.com"
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <button
                className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-6 bg-ink-primary hover:bg-accent-olive-deep text-canvas-base rounded-full font-label-mono text-label-mono font-medium transition-all duration-150 active:scale-[0.98] whitespace-nowrap"
                type="submit"
              >
                Request early access ↗
              </button>
            </form>
          )}

          <p className="font-label-mono text-label-mono text-ink-subtle mt-4">
            Selective developer cohort rollout · No billing required for simulation access
          </p>
        </div>
      </section>
    </main>
  );
};

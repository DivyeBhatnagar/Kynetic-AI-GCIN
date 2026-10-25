import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

interface ArchitecturePageProps {
  onOpenEarlyAccess: () => void;
}

export const ArchitecturePage: React.FC<ArchitecturePageProps> = ({ onOpenEarlyAccess }) => {
  return (
    <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 md:px-margin-desktop py-6 sm:py-space-xl">
      <SEO
        title="Distributed Control Plane &amp; eBPF Telemetry"
        description="Technical specification of Kynetic AI's multi-cloud arbitration broker, eBPF telemetry daemons, and preemption immunity protocol."
        canonicalPath="/architecture"
      />
      {/* HERO SECTION */}
      <section className="mb-space-xl pt-space-xs sm:pt-space-md">
        {/* Eyebrow & Telemetry Badge */}
        <div className="flex flex-wrap items-center gap-space-sm mb-space-md">
          <div className="inline-flex items-center gap-2 h-6 px-2.5 rounded-full bg-sky-subtle border border-sky-soft text-label-tag font-label-tag text-blue-deep uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-electric animate-pulse"></span>
            <span>SYSTEM ARCHITECTURE &amp; CONTROL PLANE</span>
          </div>
          <span className="text-ink-subtle text-label-mono font-label-mono">
            REV 4.8.2 // PROD RUNTIME
          </span>
        </div>

        {/* Main Headline & Subheading */}
        <div className="max-w-4xl space-y-space-md">
          <h1 className="text-3xl sm:text-4xl md:text-headline-xl font-headline-xl text-ink-primary tracking-tight">
            The intelligence layer between model code and bare-metal silicon.
          </h1>
          <p className="font-body-lg text-body-lg text-ink-muted max-w-3xl leading-relaxed">
            Kynetic sits asynchronously above hyperscalers and specialized GPU clouds, turning
            fragmented compute markets into a unified, deterministic runtime.
          </p>
        </div>

        {/* Quick Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-space-md mt-space-xl pt-space-lg border-t border-hairline-default">
          <div>
            <span className="block text-ink-subtle font-label-mono text-label-mono mb-1">
              SCHEDULING LATENCY
            </span>
            <span className="font-headline-sm text-headline-sm text-ink-primary">
              14.2<span className="text-title-sm text-blue-electric ml-0.5">ms</span>
            </span>
          </div>
          <div>
            <span className="block text-ink-subtle font-label-mono text-label-mono mb-1">
              INTER-CLOUD HOPS
            </span>
            <span className="font-headline-sm text-headline-sm text-ink-primary">
              0 <span className="text-title-sm text-ink-muted font-body-sm font-normal">(Direct-path)</span>
            </span>
          </div>
          <div>
            <span className="block text-ink-subtle font-label-mono text-label-mono mb-1">
              PREEMPTION SURVIVAL
            </span>
            <span className="font-headline-sm text-headline-sm text-ink-primary">
              99.98<span className="text-title-sm text-blue-electric ml-0.5">%</span>
            </span>
          </div>
          <div>
            <span className="block text-ink-subtle font-label-mono text-label-mono mb-1">
              RUNTIME TOPOLOGY
            </span>
            <span className="font-headline-sm text-headline-sm text-ink-primary">
              Non-Blocking
            </span>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE DIAGRAM / 4-STRATA RUNTIME STACK */}
      <section className="mb-space-xl" id="interactive-stack">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-space-md">
          <div>
            <h2 className="font-headline-md text-headline-md text-ink-primary">
              Control Plane Strata
            </h2>
            <p className="font-body-sm text-body-sm text-ink-muted mt-1">
              Four deterministic asynchronous layers orchestrating continuous inference &amp;
              distributed training.
            </p>
          </div>
          <div className="mt-2 sm:mt-0 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-status-healthy"></span>
            <span className="font-label-mono text-label-mono text-ink-muted">
              SYNCHRONIZED TELEMETRY FEED
            </span>
          </div>
        </div>

        {/* Stack Container */}
        <div className="space-y-space-md">
          {/* LAYER 1 */}
          <div className="bg-surface-elevated border border-hairline-default rounded-lg p-space-lg transition-all duration-200 hover:border-sky-ice hover:shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-electric/40 via-sky-ice/20 to-transparent"></div>
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-space-lg">
              <div className="lg:w-1/3">
                <div className="flex items-center gap-space-xs mb-1">
                  <span className="font-label-mono text-label-mono text-blue-deep font-semibold">
                    LAYER 01
                  </span>
                  <span className="text-ink-subtle font-label-mono text-label-mono">
                    — INGRESS &amp; COMPUTATION
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-ink-primary mb-2">
                  Workload Introspection &amp; Parsing Engine
                </h3>
                <p className="font-body-sm text-body-sm text-ink-muted">
                  Ingests distributed computation graphs, analyzes kernel arithmetic intensity against
                  targeted hardware rooflines, and breaks jobs into atomic execution manifests.
                </p>
              </div>

              {/* Nodes Visualization */}
              <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                <div className="bg-canvas-alternate border border-hairline-subtle rounded p-space-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-mono text-label-mono text-ink-primary font-medium">
                      Model Code Parsing
                    </span>
                    <span className="material-symbols-outlined text-ink-muted">schema</span>
                  </div>
                  <div className="font-label-tag text-label-tag text-ink-subtle uppercase">
                    HuggingFace · PyTorch · Ray · vLLM
                  </div>
                  <p className="font-body-sm text-body-sm text-ink-muted mt-2">
                    Abstract Syntax Tree decomposition of model parameters and context memory buffers.
                  </p>
                </div>
                <div className="bg-canvas-alternate border border-hairline-subtle rounded p-space-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-mono text-label-mono text-ink-primary font-medium">
                      Roofline Modeling
                    </span>
                    <span className="material-symbols-outlined text-blue-electric">speed</span>
                  </div>
                  <div className="font-label-tag text-label-tag text-ink-subtle uppercase">
                    Compute vs Memory Bound
                  </div>
                  <p className="font-body-sm text-body-sm text-ink-muted mt-2">
                    Determines SRAM occupancy, Tensor Core peak utilization, and KV-cache bounds.
                  </p>
                </div>
                <div className="bg-canvas-alternate border border-hairline-subtle rounded p-space-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-mono text-label-mono text-ink-primary font-medium">
                      Batch Profiler
                    </span>
                    <span className="material-symbols-outlined text-ink-muted">tune</span>
                  </div>
                  <div className="font-label-tag text-label-tag text-ink-subtle uppercase">
                    Continuous Batching
                  </div>
                  <p className="font-body-sm text-body-sm text-ink-muted mt-2">
                    Calculates dynamic sequence length histograms to prevent tail execution waste.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* LAYER 2 */}
          <div className="bg-surface-elevated border border-hairline-default rounded-lg p-space-lg transition-all duration-200 hover:border-sky-ice hover:shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-electric/60 via-sky-ice/30 to-transparent"></div>
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-space-lg">
              <div className="lg:w-1/3">
                <div className="flex items-center gap-space-xs mb-1">
                  <span className="font-label-mono text-label-mono text-blue-deep font-semibold">
                    LAYER 02
                  </span>
                  <span className="text-ink-subtle font-label-mono text-label-mono">
                    — HARDWARE MESH
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-ink-primary mb-2">
                  Predictive Digital Twin &amp; Telemetry Mesh
                </h3>
                <p className="font-body-sm text-body-sm text-ink-muted">
                  Synthesizes low-level silicon metrics from 30+ providers into an identical,
                  continuously simulated digital twin to forecast hardware faults prior to crash.
                </p>
              </div>

              {/* Nodes Visualization */}
              <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                <div className="bg-canvas-alternate border border-hairline-subtle rounded p-space-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-mono text-label-mono text-ink-primary font-medium">
                      Silicon Degradation
                    </span>
                    <span className="material-symbols-outlined text-status-warning">
                      thermostat
                    </span>
                  </div>
                  <div className="font-label-tag text-label-tag text-ink-subtle uppercase">
                    XID Error · ECC Multi-bit
                  </div>
                  <p className="font-body-sm text-body-sm text-ink-muted mt-2">
                    Monitors memory junction thermals, silent data corruption, and throttle cascades.
                  </p>
                </div>
                <div className="bg-canvas-alternate border border-hairline-subtle rounded p-space-sm ring-1 ring-blue-electric/30 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-mono text-label-mono text-blue-deep font-medium">
                      Interconnect Matrix
                    </span>
                    <span className="material-symbols-outlined text-blue-electric">hub</span>
                  </div>
                  <div className="font-label-tag text-label-tag text-blue-deep uppercase">
                    900 GB/s NVLink vs PCIe 5.0
                  </div>
                  <p className="font-body-sm text-body-sm text-ink-muted mt-2">
                    Topology simulation predicting all-reduce bottlenecks across heterogeneous hosts.
                  </p>
                </div>
                <div className="bg-canvas-alternate border border-hairline-subtle rounded p-space-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-mono text-label-mono text-ink-primary font-medium">
                      Dynamic Latency Probe
                    </span>
                    <span className="material-symbols-outlined text-ink-muted">network_check</span>
                  </div>
                  <div className="font-label-tag text-label-tag text-ink-subtle uppercase">
                    eBPF Packet Tracing
                  </div>
                  <p className="font-body-sm text-body-sm text-ink-muted mt-2">
                    Sub-millisecond packet jitter tracking between distributed InfiniBand clusters.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* LAYER 3 */}
          <div className="bg-surface-elevated border border-hairline-default rounded-lg p-space-lg transition-all duration-200 hover:border-sky-ice hover:shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-electric/80 via-sky-ice/40 to-transparent"></div>
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-space-lg">
              <div className="lg:w-1/3">
                <div className="flex items-center gap-space-xs mb-1">
                  <span className="font-label-mono text-label-mono text-blue-deep font-semibold">
                    LAYER 03
                  </span>
                  <span className="text-ink-subtle font-label-mono text-label-mono">
                    — DISPATCH &amp; SETTLEMENT
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-ink-primary mb-2">
                  Deterministic Arbitrage &amp; Multi-Cloud Broker
                </h3>
                <p className="font-body-sm text-body-sm text-ink-muted">
                  Solves continuous mixed-integer constraint problems balancing spot pricing, SLA
                  guarantees, egress costs, and reservation preemption hedging.
                </p>
              </div>

              {/* Nodes Visualization */}
              <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                <div className="bg-canvas-alternate border border-hairline-subtle rounded p-space-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-mono text-label-mono text-ink-primary font-medium">
                      Preemption Hedging
                    </span>
                    <span className="material-symbols-outlined text-blue-electric">
                      currency_exchange
                    </span>
                  </div>
                  <div className="font-label-tag text-label-tag text-ink-subtle uppercase">
                    Spot Market Calculus
                  </div>
                  <p className="font-body-sm text-body-sm text-ink-muted mt-2">
                    Automated bidding matrix across AWS, GCP, Lambda, CoreWeave, and FluidStack.
                  </p>
                </div>
                <div className="bg-canvas-alternate border border-hairline-subtle rounded p-space-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-mono text-label-mono text-ink-primary font-medium">
                      Egress Arbitrage
                    </span>
                    <span className="material-symbols-outlined text-ink-muted">swap_calls</span>
                  </div>
                  <div className="font-label-tag text-label-tag text-ink-subtle uppercase">
                    Penalty Mitigation
                  </div>
                  <p className="font-body-sm text-body-sm text-ink-muted mt-2">
                    Dynamic co-locating of parameter weights against regional checkpoint buckets.
                  </p>
                </div>
                <div className="bg-canvas-alternate border border-hairline-subtle rounded p-space-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-mono text-label-mono text-ink-primary font-medium">
                      Reservation Dispatch
                    </span>
                    <span className="material-symbols-outlined text-ink-muted">dns</span>
                  </div>
                  <div className="font-label-tag text-label-tag text-ink-subtle uppercase">
                    Instant Spin-up API
                  </div>
                  <p className="font-body-sm text-body-sm text-ink-muted mt-2">
                    Bare-metal microVM instantiation in &lt; 850ms with pre-cached CUDA runtimes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* LAYER 4 */}
          <div className="bg-surface-elevated border border-hairline-default rounded-lg p-space-lg transition-all duration-200 hover:border-sky-ice hover:shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-electric via-sky-ice/50 to-transparent"></div>
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-space-lg">
              <div className="lg:w-1/3">
                <div className="flex items-center gap-space-xs mb-1">
                  <span className="font-label-mono text-label-mono text-blue-deep font-semibold">
                    LAYER 04
                  </span>
                  <span className="text-ink-subtle font-label-mono text-label-mono">
                    — FAULT TOLERANCE
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-ink-primary mb-2">
                  Universal Checkpoint &amp; Failover Fabric
                </h3>
                <p className="font-body-sm text-body-sm text-ink-muted">
                  Patented state preservation layer. Serializes distributed optimizer states and
                  model tensors with zero CPU pause, enabling seamless host migrations.
                </p>
              </div>

              {/* Nodes Visualization */}
              <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                <div className="bg-canvas-alternate border border-hairline-subtle rounded p-space-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-mono text-label-mono text-ink-primary font-medium">
                      Zero-Pause Serialization
                    </span>
                    <span className="material-symbols-outlined text-ink-muted">save</span>
                  </div>
                  <div className="font-label-tag text-label-tag text-ink-subtle uppercase">
                    Asynchronous DMA
                  </div>
                  <p className="font-body-sm text-body-sm text-ink-muted mt-2">
                    Tensors streamed directly out of HBM3 memory without interrupting current step.
                  </p>
                </div>
                <div className="bg-canvas-alternate border border-hairline-subtle rounded p-space-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-mono text-label-mono text-ink-primary font-medium">
                      Cross-Cloud Hydration
                    </span>
                    <span className="material-symbols-outlined text-blue-electric">cloud_sync</span>
                  </div>
                  <div className="font-label-tag text-label-tag text-ink-subtle uppercase">
                    AWS → Lambda Hot-Swap
                  </div>
                  <p className="font-body-sm text-body-sm text-ink-muted mt-2">
                    State restoration takes under 2.4 seconds with progressive differential tensor
                    sync.
                  </p>
                </div>
                <div className="bg-canvas-alternate border border-hairline-subtle rounded p-space-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-mono text-label-mono text-ink-primary font-medium">
                      Multi-Destination Pipe
                    </span>
                    <span className="material-symbols-outlined text-ink-muted">share</span>
                  </div>
                  <div className="font-label-tag text-label-tag text-ink-subtle uppercase">
                    S3 / Cloudflare R2
                  </div>
                  <p className="font-body-sm text-body-sm text-ink-muted mt-2">
                    Multiplexed parallel egress maximizing line-rate throughput without egress choke.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE TELEMETRY / RUNTIME RECESSED WELL */}
      <section className="mb-space-xl">
        <div className="bg-canvas-alternate border border-hairline-subtle rounded-lg p-space-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-space-sm border-b border-hairline-default mb-space-md gap-2">
            <div className="flex items-center gap-space-sm">
              <span className="inline-flex w-2.5 h-2.5 rounded-full bg-status-active"></span>
              <span className="font-label-mono text-label-mono text-ink-primary font-medium">
                LIVE CONTROL PLANE SIMULATION TRACE
              </span>
            </div>
            <div className="text-label-mono text-label-mono text-ink-subtle flex items-center gap-space-md">
              <span>CLUSTER_ID: us-west-kyn-408</span>
              <span>TOPOLOGY: 64x H100 SXM5</span>
            </div>
          </div>
          <div className="font-label-mono text-label-mono space-y-2 text-ink-body">
            <div className="flex items-baseline gap-space-sm">
              <span className="text-blue-electric">[14:02:19.402]</span>
              <span className="text-ink-primary">K-TWIN::</span>
              <span>
                Analyzing thermal gradient on Node #38 (GPU 3 &amp; 4 junction: +4.2°C/min trend).
                ECC non-fatal spike: 3 count.
              </span>
            </div>
            <div className="flex items-baseline gap-space-sm">
              <span className="text-blue-electric">[14:02:20.118]</span>
              <span className="text-ink-primary">ARBITRAGE::</span>
              <span>
                Degradation threshold reached (94.1% risk vector). Initiating warm reservation at
                alternative provider [Lambda-Austin-Pool4].
              </span>
            </div>
            <div className="flex items-baseline gap-space-sm">
              <span className="text-blue-deep font-semibold">[14:02:21.054]</span>
              <span className="text-blue-deep font-semibold">FABRIC::</span>
              <span>
                DMA snapshot locked at step 48,192. Serializing weights to edge buffer. Egress time:
                1.14s. No loss in model convergence detected.
              </span>
            </div>
            <div className="flex items-baseline gap-space-sm">
              <span className="text-blue-electric">[14:02:22.201]</span>
              <span className="text-ink-primary">SYSTEM::</span>
              <span className="text-ink-primary font-medium">
                Hot-swap verified. Step 48,193 continued on new fabric without training disruption.
                Total downtime: 0.00s.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNICAL PILLARS (3-Column Layout) */}
      <section className="mb-space-xl">
        <div className="mb-space-lg">
          <span className="font-label-mono text-label-mono text-blue-deep font-semibold tracking-wider uppercase">
            CORE PILLARS
          </span>
          <h2 className="font-headline-lg text-headline-lg text-ink-primary tracking-tight mt-1">
            Engineered for absolute computational certainty.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {/* Pillar 1 */}
          <div className="bg-surface-elevated border border-hairline-default rounded-lg p-space-lg flex flex-col justify-between hover:border-sky-ice transition-colors duration-150">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <span className="font-label-mono text-label-mono text-blue-deep font-semibold text-sm">
                  01
                </span>
                <div className="w-8 h-8 rounded-full bg-sky-subtle flex items-center justify-center text-blue-deep">
                  <span className="material-symbols-outlined">memory</span>
                </div>
              </div>
              <h3 className="font-title-md text-title-md text-ink-primary font-medium mb-space-sm">
                Kernel-Aware Digital Twin
              </h3>
              <p className="font-body-sm text-body-sm text-ink-muted leading-relaxed">
                Real-time FLOPS estimation based on transformer attention mechanisms, memory bandwidth
                bottlenecks, and actual provider node degradation telemetry.
              </p>
            </div>
            <div className="mt-space-md pt-space-sm border-t border-hairline-subtle text-label-tag text-label-tag text-ink-subtle uppercase">
              Roofline Fidelity &gt; 99.4%
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-surface-elevated border border-hairline-default rounded-lg p-space-lg flex flex-col justify-between hover:border-sky-ice transition-colors duration-150">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <span className="font-label-mono text-label-mono text-blue-deep font-semibold text-sm">
                  02
                </span>
                <div className="w-8 h-8 rounded-full bg-sky-subtle flex items-center justify-center text-blue-deep">
                  <span className="material-symbols-outlined">balance</span>
                </div>
              </div>
              <h3 className="font-title-md text-title-md text-ink-primary font-medium mb-space-sm">
                Multi-Cloud Preemption Arbitrage
              </h3>
              <p className="font-body-sm text-body-sm text-ink-muted leading-relaxed">
                Real-time risk modeling that migrates in-flight PyTorch checkpoints when spot nodes
                degrade or secondary markets drop below calculated cost thresholds.
              </p>
            </div>
            <div className="mt-space-md pt-space-sm border-t border-hairline-subtle text-label-tag text-label-tag text-ink-subtle uppercase">
              Up to 72% Cost Delta Captured
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-surface-elevated border border-hairline-default rounded-lg p-space-lg flex flex-col justify-between hover:border-sky-ice transition-colors duration-150">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <span className="font-label-mono text-label-mono text-blue-deep font-semibold text-sm">
                  03
                </span>
                <div className="w-8 h-8 rounded-full bg-sky-subtle flex items-center justify-center text-blue-deep">
                  <span className="material-symbols-outlined">polyline</span>
                </div>
              </div>
              <h3 className="font-title-md text-title-md text-ink-primary font-medium mb-space-sm">
                Egress &amp; Topology Neutralizer
              </h3>
              <p className="font-body-sm text-body-sm text-ink-muted leading-relaxed">
                Automated cluster placement minimizing data ingress/egress transit costs and ensuring
                strict NVLink/InfiniBand inter-node guarantees across clusters.
              </p>
            </div>
            <div className="mt-space-md pt-space-sm border-t border-hairline-subtle text-label-tag text-label-tag text-ink-subtle uppercase">
              Zero Cross-Region Egress Penalty
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY, COMPLIANCE & ISOLATION ARCHITECTURE */}
      <section className="mb-space-xl bg-surface-elevated border border-hairline-default rounded-lg p-5 sm:p-space-xl relative overflow-hidden">
        <div className="max-w-2xl mb-space-lg">
          <span className="font-label-mono text-label-mono text-blue-deep font-semibold tracking-wider uppercase">
            SECURITY &amp; COMPLIANCE
          </span>
          <h2 className="font-headline-md text-headline-md text-ink-primary mt-1">
            Zero-Trust Isolation Architecture
          </h2>
          <p className="font-body-md text-body-md text-ink-muted mt-2">
            Kynetic operates on pure orchestration telemetry. Your model weights, raw training data,
            and application prompts never cross your perimeter.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg pt-space-md border-t border-hairline-default">
          <div>
            <div className="flex items-center gap-space-xs text-ink-primary font-title-sm font-title-sm mb-1">
              <span className="material-symbols-outlined text-blue-electric">lock_clock</span>
              <span>Zero-Agent Deployment</span>
            </div>
            <p className="font-body-sm text-body-sm text-ink-muted">
              Non-intrusive orchestration via native cloud APIs and kernel eBPF probes. No permanent
              proprietary binaries injected into production runtime containers.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-space-xs text-ink-primary font-title-sm font-title-sm mb-1">
              <span className="material-symbols-outlined text-blue-electric">verified_user</span>
              <span>SOC2 Type II &amp; ISO 27001</span>
            </div>
            <p className="font-body-sm text-body-sm text-ink-muted">
              Continuous compliance auditing across all control-plane microservices. Cryptographically
              verifiable audit trails for every scheduler dispatch.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-space-xs text-ink-primary font-title-sm font-title-sm mb-1">
              <span className="material-symbols-outlined text-blue-electric">shield</span>
              <span>Customer VPC Isolation</span>
            </div>
            <p className="font-body-sm text-body-sm text-ink-muted">
              Weights and datasets reside exclusively inside customer-managed object stores (AWS S3,
              GCS, Cloudflare R2). Kynetic only receives performance telemetry.
            </p>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE WHITE PAPER & CTA SECTION */}
      <section className="my-space-xl p-5 sm:p-space-xl bg-canvas-alternate border border-hairline-default rounded-lg text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-space-md">
          <span className="font-label-mono text-label-mono text-blue-deep font-semibold tracking-wider uppercase">
            TECHNICAL SPECIFICATION
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-headline-lg font-headline-lg text-ink-primary tracking-tight">
            Read the 42-page formal specification.
          </h2>
          <p className="font-body-md text-body-md text-ink-muted">
            Comprehensive benchmark methodologies, formal proof of deterministic checkpoint
            serialization, and multi-cloud latency distribution analysis.
          </p>
          {/* CTA Action Cluster */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-space-sm pt-space-sm">
            <button
              onClick={onOpenEarlyAccess}
              className="w-full sm:w-auto min-h-[44px] px-6 inline-flex items-center justify-center rounded-full bg-ink-primary text-surface-elevated text-label-mono font-label-mono hover:bg-neutral-800 transition-all duration-150"
            >
              Inspect the Architecture Whitepaper (PDF)
            </button>
            <Link
              to="/docs"
              className="w-full sm:w-auto min-h-[44px] px-6 inline-flex items-center justify-center rounded-full bg-surface-elevated border border-hairline-default text-ink-primary text-label-mono font-label-mono hover:border-sky-ice hover:bg-sky-subtle transition-all duration-150"
            >
              Explore Documentation →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

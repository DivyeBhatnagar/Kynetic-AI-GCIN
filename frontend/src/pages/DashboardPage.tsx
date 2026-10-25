import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface DashboardPageProps {
  onOpenEarlyAccess?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenEarlyAccess }) => {
  const [filterType, setFilterType] = useState('ALL');

  return (
    <div className="bg-canvas-base text-ink-primary font-body-md antialiased min-h-screen flex flex-col selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* MAIN CANVAS CONTAINER */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-space-lg md:px-margin-desktop py-space-xl space-y-space-xl">
        {/* 1. OVERVIEW & WELCOME HERO SECTION */}
        <section className="space-y-space-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md border-b border-hairline-subtle pb-space-lg">
            <div>
              <div className="flex items-center gap-space-sm mb-space-xs flex-wrap">
                <span className="font-label-tag text-label-tag bg-canvas-alternate text-ink-muted px-2 py-0.5 rounded border border-hairline-default tracking-wider">
                  TIER: PRO ENTERPRISE // REGION: MULTI-CLOUD
                </span>
                <span className="flex items-center gap-1 font-label-tag text-label-tag text-accent-olive-deep bg-secondary-container px-2 py-0.5 rounded border border-secondary-fixed">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-healthy animate-pulse"></span>
                  BROKER SYNCHRONIZED
                </span>
              </div>
              <h1 className="text-headline-md font-headline-md tracking-tight text-ink-primary font-medium">
                Welcome back, Synthetix Research
              </h1>
              <p className="text-body-md font-body-md text-ink-muted mt-0.5">
                Real-time topology orchestration, continuous spot arbitrage, and preemption fault mitigation.
              </p>
            </div>
            {/* Action CTAs */}
            <div className="flex items-center gap-space-sm self-start md:self-auto flex-wrap">
              <Link
                to="/docs"
                className="bg-surface-elevated hover:bg-canvas-alternate border border-hairline-default text-ink-primary font-label-mono text-label-mono px-space-md py-2 rounded-full transition-all duration-150 flex items-center gap-space-xs"
              >
                <span className="material-symbols-outlined text-[16px]">terminal</span>
                <span>Quick Dry-Run CLI</span>
              </Link>
              <Link
                to="/workload-planner"
                className="bg-ink-primary hover:bg-accent-olive-deep text-surface-elevated font-label-mono text-label-mono px-space-lg py-2 rounded-full transition-all duration-150 shadow-sm flex items-center gap-space-xs border border-transparent hover:border-accent-olive"
              >
                <span>Plan a Workload</span>
                <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
              </Link>
            </div>
          </div>

          {/* 4 Quick Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {/* Card 1: Total Estimated Savings */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-space-md relative overflow-hidden transition-all duration-150 hover:border-secondary-fixed shadow-xs">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-olive to-status-healthy"></div>
              <div className="flex items-center justify-between text-ink-muted font-label-mono text-label-mono mb-space-xs">
                <span>TOTAL ESTIMATED SAVINGS</span>
                <span className="material-symbols-outlined text-[18px] text-accent-olive">savings</span>
              </div>
              <div className="text-headline-sm font-headline-sm text-ink-primary font-medium">$18,420.50</div>
              <div className="mt-space-xs flex items-center gap-1.5">
                <span className="font-label-tag text-label-tag bg-secondary-container text-accent-olive-deep px-1.5 py-0.5 rounded border border-secondary-fixed font-semibold">
                  +34.2%
                </span>
                <span className="font-body-sm text-body-sm text-ink-subtle">vs on-demand list pricing</span>
              </div>
            </div>

            {/* Card 2: Active GPU Fleet */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-space-md relative overflow-hidden transition-all duration-150 hover:border-secondary-fixed shadow-xs">
              <div className="flex items-center justify-between text-ink-muted font-label-mono text-label-mono mb-space-xs">
                <span>ACTIVE GPU FLEET</span>
                <span className="material-symbols-outlined text-[18px] text-status-healthy">memory</span>
              </div>
              <div className="text-headline-sm font-headline-sm text-ink-primary font-medium">32 Instances</div>
              <div className="mt-space-xs flex items-center justify-between text-body-sm font-body-sm text-ink-muted">
                <span>24x H100 SXM5 · 8x L40S</span>
                <span className="font-label-tag text-label-tag text-ink-subtle">CW / RUNPOD</span>
              </div>
            </div>

            {/* Card 3: Simulated Workloads */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-space-md relative overflow-hidden transition-all duration-150 hover:border-secondary-fixed shadow-xs">
              <div className="flex items-center justify-between text-ink-muted font-label-mono text-label-mono mb-space-xs">
                <span>SIMULATED WORKLOADS</span>
                <span className="material-symbols-outlined text-[18px] text-ink-muted">alt_route</span>
              </div>
              <div className="text-headline-sm font-headline-sm text-ink-primary font-medium">142 Jobs</div>
              <div className="mt-space-xs flex items-center gap-1 text-body-sm font-body-sm text-ink-body">
                <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                <span>99.8% preemption immunity score</span>
              </div>
            </div>

            {/* Card 4: Live Broker Latency */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-space-md relative overflow-hidden transition-all duration-150 hover:border-secondary-fixed shadow-xs">
              <div className="flex items-center justify-between text-ink-muted font-label-mono text-label-mono mb-space-xs">
                <span>LIVE BROKER LATENCY</span>
                <span className="material-symbols-outlined text-[18px] text-accent-olive">speed</span>
              </div>
              <div className="text-headline-sm font-headline-sm text-ink-primary font-medium">1.2ms</div>
              <div className="mt-space-xs flex items-center gap-1 text-body-sm font-body-sm text-ink-muted">
                <span className="material-symbols-outlined text-[14px] text-accent-olive">hub</span>
                <span>Global mesh synced (p99: 2.1ms)</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. RECENT WORKLOADS & ACTIVE EXECUTIONS */}
        <section className="space-y-space-md">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-space-sm">
              <h2 className="text-title-md font-title-md font-medium text-ink-primary">Active Executions &amp; Recent Workloads</h2>
              <span className="font-label-tag text-label-tag bg-secondary-container text-accent-olive-deep px-2 py-0.5 rounded-full border border-secondary-fixed">
                4 RUNNING CONCURRENTLY
              </span>
            </div>
            <div className="flex items-center gap-space-xs">
              <button
                onClick={() => setFilterType(filterType === 'ALL' ? 'RUNNING' : 'ALL')}
                className="bg-surface-elevated hover:bg-canvas-alternate border border-hairline-default px-space-sm py-1 rounded text-body-sm font-body-sm text-ink-muted flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                <span>Filter: {filterType}</span>
              </button>
              <button
                onClick={() => {}}
                className="bg-surface-elevated hover:bg-canvas-alternate border border-hairline-default px-space-sm py-1 rounded text-body-sm font-body-sm text-ink-muted flex items-center gap-1 transition-colors"
                title="Refresh Table"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
              </button>
            </div>
          </div>

          {/* Execution Matrix Container */}
          <div className="bg-surface-elevated border border-hairline-default rounded-lg overflow-x-auto shadow-xs">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-canvas-alternate border-b border-hairline-default font-label-mono text-label-mono text-ink-muted uppercase">
                  <th className="py-space-sm px-space-md">Workload / Spec</th>
                  <th className="py-space-sm px-space-md">Topology Cluster</th>
                  <th className="py-space-sm px-space-md">Status</th>
                  <th className="py-space-sm px-space-md">Runtime</th>
                  <th className="py-space-sm px-space-md">Incurred / Saved</th>
                  <th className="py-space-sm px-space-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-subtle text-body-sm font-body-sm">
                {/* Row 1 */}
                <tr className="hover:bg-secondary-container/20 transition-colors duration-150">
                  <td className="py-space-md px-space-md font-medium text-ink-primary">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-accent-olive text-[18px]">neurology</span>
                      <span>Llama 3 70B LoRA Alignment</span>
                    </div>
                    <div className="text-ink-subtle font-label-mono text-label-mono ml-6">job-id: run_8f99a0e1 · PyTorch 2.4 FSDP</div>
                  </td>
                  <td className="py-space-md px-space-md text-ink-body">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-ink-primary">8x H100 SXM5</span>
                      <span className="font-label-tag text-label-tag px-1 bg-surface-container rounded border border-hairline-default">CoreWeave</span>
                    </div>
                    <div className="text-ink-subtle text-[11px] font-label-mono">us-east-1 // InfiniBand NDR</div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="inline-flex items-center gap-1.5 bg-secondary-container border border-secondary-fixed text-accent-olive-deep px-2 py-0.5 rounded-full font-label-tag text-label-tag">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-healthy animate-ping"></span>
                      <span>RUNNING</span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md text-ink-body font-label-mono text-label-mono">
                    04h 18m 22s
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="font-label-mono text-label-mono font-medium text-ink-primary">$89.40</div>
                    <div className="font-label-tag text-label-tag text-accent-olive">-$42.10 (32% opt)</div>
                  </td>
                  <td className="py-space-md px-space-md text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to="/recommendations" className="p-1 hover:bg-canvas-alternate rounded text-ink-muted hover:text-ink-primary" title="Inspect Telemetry">
                        <span className="material-symbols-outlined text-[18px]">query_stats</span>
                      </Link>
                      <button className="p-1 hover:bg-canvas-alternate rounded text-ink-muted hover:text-ink-primary">
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-secondary-container/20 transition-colors duration-150">
                  <td className="py-space-md px-space-md font-medium text-ink-primary">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-accent-olive text-[18px]">hub</span>
                      <span>DeepSeek-R1 Distillation</span>
                    </div>
                    <div className="text-ink-subtle font-label-mono text-label-mono ml-6">job-id: run_44b3c99a · vLLM Multi-Node</div>
                  </td>
                  <td className="py-space-md px-space-md text-ink-body">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-ink-primary">8x L40S</span>
                      <span className="font-label-tag text-label-tag px-1 bg-surface-container rounded border border-hairline-default">RunPod</span>
                    </div>
                    <div className="text-ink-subtle text-[11px] font-label-mono">eu-central // Spot Instance</div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="inline-flex items-center gap-1.5 bg-canvas-alternate border border-hairline-strong text-ink-muted px-2 py-0.5 rounded-full font-label-tag text-label-tag">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                      <span>CHECKPOINTED</span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md text-ink-body font-label-mono text-label-mono">
                    02h 45m 11s
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="font-label-mono text-label-mono font-medium text-ink-primary">$31.20</div>
                    <div className="font-label-tag text-label-tag text-accent-olive">-$18.80 (38% opt)</div>
                  </td>
                  <td className="py-space-md px-space-md text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to="/recommendations" className="p-1 hover:bg-canvas-alternate rounded text-ink-muted hover:text-ink-primary" title="Inspect Telemetry">
                        <span className="material-symbols-outlined text-[18px]">query_stats</span>
                      </Link>
                      <button className="p-1 hover:bg-canvas-alternate rounded text-ink-muted hover:text-ink-primary">
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-secondary-container/20 transition-colors duration-150">
                  <td className="py-space-md px-space-md font-medium text-ink-primary">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-ink-muted text-[18px]">image</span>
                      <span>SDXL Batch Generation 50k</span>
                    </div>
                    <div className="text-ink-subtle font-label-mono text-label-mono ml-6">job-id: run_9021dd72 · Diffusers Engine</div>
                  </td>
                  <td className="py-space-md px-space-md text-ink-body">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-ink-primary">16x RTX 4090</span>
                      <span className="font-label-tag text-label-tag px-1 bg-surface-container rounded border border-hairline-default">Lambda</span>
                    </div>
                    <div className="text-ink-subtle text-[11px] font-label-mono">us-west-2 // PCIe Gen5</div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="inline-flex items-center gap-1.5 bg-canvas-alternate border border-hairline-default text-ink-subtle px-2 py-0.5 rounded-full font-label-tag text-label-tag">
                      <span className="w-1.5 h-1.5 rounded-full bg-ink-subtle"></span>
                      <span>COMPLETED</span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md text-ink-body font-label-mono text-label-mono">
                    01h 04m 50s
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="font-label-mono text-label-mono font-medium text-ink-primary">$14.90</div>
                    <div className="font-label-tag text-label-tag text-accent-olive">-$9.30 (38% opt)</div>
                  </td>
                  <td className="py-space-md px-space-md text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to="/recommendations" className="p-1 hover:bg-canvas-alternate rounded text-ink-muted hover:text-ink-primary" title="Inspect Telemetry">
                        <span className="material-symbols-outlined text-[18px]">query_stats</span>
                      </Link>
                      <button className="p-1 hover:bg-canvas-alternate rounded text-ink-muted hover:text-ink-primary">
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="hover:bg-secondary-container/20 transition-colors duration-150">
                  <td className="py-space-md px-space-md font-medium text-ink-primary">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-accent-olive-deep text-[18px]">psychology</span>
                      <span>Qwen 2.5 32B FP8 Inference</span>
                    </div>
                    <div className="text-ink-subtle font-label-mono text-label-mono ml-6">job-id: run_77180ef9 · TensorRT-LLM</div>
                  </td>
                  <td className="py-space-md px-space-md text-ink-body">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-ink-primary">4x H100 NVL</span>
                      <span className="font-label-tag text-label-tag px-1 bg-surface-container rounded border border-hairline-default">Together</span>
                    </div>
                    <div className="text-ink-subtle text-[11px] font-label-mono">us-central // Reserved Pool</div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="inline-flex items-center gap-1.5 bg-secondary-container/60 border border-secondary-fixed text-ink-primary px-2 py-0.5 rounded-full font-label-tag text-label-tag">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-warning"></span>
                      <span>QUEUED</span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md text-ink-body font-label-mono text-label-mono">
                    00h 00m 00s
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="font-label-mono text-label-mono font-medium text-ink-primary">$0.00</div>
                    <div className="font-label-tag text-label-tag text-ink-subtle">Est. $44.00</div>
                  </td>
                  <td className="py-space-md px-space-md text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to="/recommendations" className="p-1 hover:bg-canvas-alternate rounded text-ink-muted hover:text-ink-primary" title="Inspect Telemetry">
                        <span className="material-symbols-outlined text-[18px]">query_stats</span>
                      </Link>
                      <button className="p-1 hover:bg-canvas-alternate rounded text-ink-muted hover:text-ink-primary">
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. SAVED PLANS & CANDIDATE BLUEPRINTS */}
        <section className="space-y-space-md">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-title-md font-title-md font-medium text-ink-primary">Saved Plans &amp; Candidate Blueprints</h2>
              <p className="text-body-sm font-body-sm text-ink-muted">Ready-to-provision declarative configurations synthesized by Kynetic Planner.</p>
            </div>
            <Link to="/workload-planner" className="font-label-mono text-label-mono text-accent-olive-deep hover:underline flex items-center gap-1">
              <span>View all specifications</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </Link>
          </div>

          {/* Bento Cards Grid for Blueprints */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Blueprint 1 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-space-lg flex flex-col justify-between hover:border-secondary-fixed transition-all duration-150 shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="font-label-tag text-label-tag text-accent-olive-deep bg-secondary-container px-1.5 py-0.5 rounded border border-secondary-fixed">
                    OPTIMIZED FOR BF16
                  </span>
                  <span className="font-label-mono text-label-mono text-ink-subtle">Saved 2d ago</span>
                </div>
                <h3 className="text-title-sm font-title-sm font-medium text-ink-primary">Llama-3-70B-BF16-FineTune</h3>
                <p className="font-body-sm text-body-sm text-ink-muted mt-1">Multi-GPU distributed PEFT fine-tune run with automatic checkpoint offload.</p>
                <div className="my-space-md p-space-sm bg-canvas-alternate rounded border border-hairline-subtle font-label-mono text-label-mono space-y-1">
                  <div className="flex justify-between text-ink-body">
                    <span>Estimated Cost:</span>
                    <span className="font-medium text-ink-primary">$27.80</span>
                  </div>
                  <div className="flex justify-between text-ink-body">
                    <span>Expected Runtime:</span>
                    <span className="text-ink-primary">7h 35m</span>
                  </div>
                  <div className="flex justify-between text-ink-body">
                    <span>Hardware Target:</span>
                    <span className="text-accent-olive font-medium">8x L40S (RunPod)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-space-xs pt-space-xs border-t border-hairline-subtle">
                <Link
                  to="/recommendations"
                  className="flex-1 bg-ink-primary text-surface-elevated hover:bg-accent-olive-deep font-label-mono text-label-mono py-1.5 rounded-full text-center transition-colors"
                >
                  Deploy
                </Link>
                <Link
                  to="/workload-planner"
                  className="px-3 py-1.5 border border-hairline-default hover:bg-canvas-alternate rounded-full font-label-mono text-label-mono text-ink-muted transition-colors"
                >
                  Edit in Planner
                </Link>
                <button
                  onClick={onOpenEarlyAccess}
                  className="p-1.5 border border-hairline-default hover:bg-canvas-alternate rounded-full text-ink-muted"
                  title="Export Spec"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                </button>
              </div>
            </div>

            {/* Blueprint 2 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-space-lg flex flex-col justify-between hover:border-secondary-fixed transition-all duration-150 shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="font-label-tag text-label-tag text-ink-body bg-canvas-alternate px-1.5 py-0.5 rounded border border-hairline-default">
                    BENCHMARK EVAL
                  </span>
                  <span className="font-label-mono text-label-mono text-ink-subtle">Saved 5d ago</span>
                </div>
                <h3 className="text-title-sm font-title-sm font-medium text-ink-primary">Qwen-Coder-Continuous-Eval</h3>
                <p className="font-body-sm text-body-sm text-ink-muted mt-1">Lightweight automated regression evaluation harness running synthetic coding tasks.</p>
                <div className="my-space-md p-space-sm bg-canvas-alternate rounded border border-hairline-subtle font-label-mono text-label-mono space-y-1">
                  <div className="flex justify-between text-ink-body">
                    <span>Estimated Cost:</span>
                    <span className="font-medium text-ink-primary">$12.40</span>
                  </div>
                  <div className="flex justify-between text-ink-body">
                    <span>Expected Runtime:</span>
                    <span className="text-ink-primary">2h 10m</span>
                  </div>
                  <div className="flex justify-between text-ink-body">
                    <span>Hardware Target:</span>
                    <span className="text-accent-olive font-medium">4x A100 PCIe</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-space-xs pt-space-xs border-t border-hairline-subtle">
                <Link
                  to="/recommendations"
                  className="flex-1 bg-ink-primary text-surface-elevated hover:bg-accent-olive-deep font-label-mono text-label-mono py-1.5 rounded-full text-center transition-colors"
                >
                  Deploy
                </Link>
                <Link
                  to="/workload-planner"
                  className="px-3 py-1.5 border border-hairline-default hover:bg-canvas-alternate rounded-full font-label-mono text-label-mono text-ink-muted transition-colors"
                >
                  Edit in Planner
                </Link>
                <button
                  onClick={onOpenEarlyAccess}
                  className="p-1.5 border border-hairline-default hover:bg-canvas-alternate rounded-full text-ink-muted"
                  title="Export Spec"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                </button>
              </div>
            </div>

            {/* Blueprint 3 */}
            <div className="bg-surface-elevated border border-hairline-default rounded-lg p-space-lg flex flex-col justify-between hover:border-secondary-fixed transition-all duration-150 shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="font-label-tag text-label-tag text-accent-olive-deep bg-secondary-container px-1.5 py-0.5 rounded border border-secondary-fixed">
                    HIGH THROUGHPUT
                  </span>
                  <span className="font-label-mono text-label-mono text-ink-subtle">Saved 1w ago</span>
                </div>
                <h3 className="text-title-sm font-title-sm font-medium text-ink-primary">Vision-Encoder-Pretrain-Spike</h3>
                <p className="font-body-sm text-body-sm text-ink-muted mt-1">Full NVLink mesh spike for multi-modal embedder pretraining with flash-attn 3.</p>
                <div className="my-space-md p-space-sm bg-canvas-alternate rounded border border-hairline-subtle font-label-mono text-label-mono space-y-1">
                  <div className="flex justify-between text-ink-body">
                    <span>Estimated Cost:</span>
                    <span className="font-medium text-ink-primary">$114.00</span>
                  </div>
                  <div className="flex justify-between text-ink-body">
                    <span>Expected Runtime:</span>
                    <span className="text-ink-primary">14h 00m</span>
                  </div>
                  <div className="flex justify-between text-ink-body">
                    <span>Hardware Target:</span>
                    <span className="text-accent-olive font-medium">8x H100 SXM5</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-space-xs pt-space-xs border-t border-hairline-subtle">
                <Link
                  to="/recommendations"
                  className="flex-1 bg-ink-primary text-surface-elevated hover:bg-accent-olive-deep font-label-mono text-label-mono py-1.5 rounded-full text-center transition-colors"
                >
                  Deploy
                </Link>
                <Link
                  to="/workload-planner"
                  className="px-3 py-1.5 border border-hairline-default hover:bg-canvas-alternate rounded-full font-label-mono text-label-mono text-ink-muted transition-colors"
                >
                  Edit in Planner
                </Link>
                <button
                  onClick={onOpenEarlyAccess}
                  className="p-1.5 border border-hairline-default hover:bg-canvas-alternate rounded-full text-ink-muted"
                  title="Export Spec"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Empty State Callout */}
          <div className="p-space-md border border-dashed border-hairline-strong rounded-lg bg-canvas-alternate/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md text-body-sm font-body-sm text-ink-muted">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-accent-olive-deep text-[22px]">tune</span>
              <div>
                <span className="font-medium text-ink-primary">Custom Broker Rules &amp; Automated Spot Bidding:</span>
                <span> No active custom broker policies active. Synthesize your first policy to unlock automated multi-cloud fallback.</span>
              </div>
            </div>
            <Link
              to="/architecture"
              className="whitespace-nowrap font-label-mono text-label-mono text-accent-olive-deep bg-surface-elevated border border-hairline-default px-space-md py-1.5 rounded-full hover:bg-secondary-container transition-colors"
            >
              Configure Arbitrage Policy →
            </Link>
          </div>
        </section>

        {/* 4. TELEMETRY STREAM & CLUSTER HEALTH */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Monospace Compact Real-time Event Log (2 Cols) */}
          <div className="lg:col-span-2 bg-canvas-alternate border border-hairline-default rounded-lg p-space-md flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-space-xs border-b border-hairline-subtle mb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded-full bg-status-healthy"></span>
                  <span className="font-label-mono text-label-mono text-ink-primary font-medium uppercase">TELEMETRY STREAM // LIVE MESH</span>
                </div>
                <span className="font-label-mono text-label-mono text-ink-subtle">STREAMING AT 20HZ</span>
              </div>
              <div className="space-y-1.5 font-label-mono text-label-mono text-ink-body">
                <div className="flex items-start gap-space-xs">
                  <span className="text-ink-subtle">14:48:02</span>
                  <span className="text-accent-olive-deep font-semibold">[ARBITRAGE]</span>
                  <span>Swapped RunPod spot instance with zero memory checkpoint loss in 1.4s.</span>
                </div>
                <div className="flex items-start gap-space-xs">
                  <span className="text-ink-subtle">14:32:10</span>
                  <span className="text-accent-olive font-semibold">[CHECKPOINT]</span>
                  <span>Delta snapshot synced to Cloudflare R2 bucket (size: 14.2GB, duration: 3.1s).</span>
                </div>
                <div className="flex items-start gap-space-xs">
                  <span className="text-ink-subtle">14:15:44</span>
                  <span className="text-status-warning font-semibold">[THERMAL]</span>
                  <span>CoreWeave node cw-h100-09 reached 78°C; throttling avoided via fan burst.</span>
                </div>
                <div className="flex items-start gap-space-xs">
                  <span className="text-ink-subtle">14:02:19</span>
                  <span className="text-ink-muted font-semibold">[SCHEDULER]</span>
                  <span>Spec "Llama-3-70B-BF16-FineTune" evaluated against 12 candidate cloud availability zones.</span>
                </div>
                <div className="flex items-start gap-space-xs">
                  <span className="text-ink-subtle">13:58:01</span>
                  <span className="text-accent-olive-deep font-semibold">[NETWORK]</span>
                  <span>Direct mesh cross-connect latency benchmarked at 1.18ms p50, 2.12ms p99.</span>
                </div>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs border-t border-hairline-subtle flex justify-between items-center text-ink-subtle font-label-mono text-label-mono">
              <span>Buffer: 10,000 entries retained</span>
              <button onClick={onOpenEarlyAccess} className="text-accent-olive-deep hover:underline">
                Download complete audit log (.jsonl)
              </button>
            </div>
          </div>

          {/* Cluster Health Summary Card (1 Col) */}
          <div className="bg-surface-elevated border border-hairline-default rounded-lg p-space-md flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-space-xs border-b border-hairline-subtle mb-space-sm">
                <span className="font-label-mono text-label-mono text-ink-primary font-medium uppercase">CLUSTER STATUS</span>
                <span className="font-label-tag text-label-tag bg-secondary-container text-accent-olive-deep px-1.5 py-0.5 rounded">ALL OPERATIONAL</span>
              </div>
              <div className="space-y-space-sm">
                <div>
                  <div className="flex justify-between text-body-sm font-body-sm mb-1">
                    <span className="text-ink-body">GPU Allocation (H100 SXM5)</span>
                    <span className="font-label-mono text-label-mono font-medium text-ink-primary">24 / 24 Active</span>
                  </div>
                  <div className="w-full bg-canvas-alternate h-1.5 rounded-full overflow-hidden">
                    <div className="bg-accent-olive h-full w-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-body-sm font-body-sm mb-1">
                    <span className="text-ink-body">Secondary Fleet (L40S / RTX)</span>
                    <span className="font-label-mono text-label-mono font-medium text-ink-primary">8 / 16 In Use</span>
                  </div>
                  <div className="w-full bg-canvas-alternate h-1.5 rounded-full overflow-hidden">
                    <div className="bg-status-healthy h-full w-1/2"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-body-sm font-body-sm mb-1">
                    <span className="text-ink-body">InfiniBand Fabric Load</span>
                    <span className="font-label-mono text-label-mono font-medium text-ink-primary">412 GB/s (72%)</span>
                  </div>
                  <div className="w-full bg-canvas-alternate h-1.5 rounded-full overflow-hidden">
                    <div className="bg-accent-olive-deep h-full w-[72%]"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs border-t border-hairline-subtle flex items-center justify-between text-ink-muted text-body-sm font-body-sm">
              <span>Active Quota: 64 GPUs</span>
              <button onClick={onOpenEarlyAccess} className="font-label-mono text-label-mono text-accent-olive-deep hover:underline">
                Request Scale
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

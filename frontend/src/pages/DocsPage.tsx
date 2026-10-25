import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

interface DocsPageProps {
  onOpenEarlyAccess: () => void;
}

export const DocsPage: React.FC<DocsPageProps> = ({ onOpenEarlyAccess: _onOpenEarlyAccess }) => {
  const [activeTab, setActiveTab] = useState<'python' | 'cli' | 'rest'>('python');
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedPip, setCopiedPip] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pythonCode = `# Import the universal orchestrator
import kynetic as kn

# 1. Establish secure session
client = kn.Client()

# 2. Declare workload envelope with hard SLA constraints
workload = client.workloads.plan(
    model="llama-3-8b",
    training_dataset="s3://internal-weights/curated-tokens-v2",
    constraints=kn.Constraints(
        max_budget_usd=40.00,
        deadline_hours=6.0,
        allow_preemptible_spot=True,
        checkpoint_sync_interval=300, # 5 min automated push
        topology_requirement="sxm5_nvlink"
    )
)

# 3. Simulate and dry-run candidate market rankings
simulation = workload.simulate()
print(f"Optimal provider chosen: {simulation.best_candidate.provider_name}")
print(f"Estimated effective cost: \${simulation.best_candidate.projected_cost:.2f}")

# 4. Dispatch workload with self-healing recovery
run = workload.dispatch(auto_resume=True)
run.stream_telemetry()`;

  const cliCode = `# 1. Authenticate CLI session
kn auth login --api-key $KYNETIC_API_KEY

# 2. Dry-run plan evaluation
kn plan create \\
  --model llama-3-8b \\
  --dataset s3://internal-weights/curated-tokens-v2 \\
  --max-budget 40.00 \\
  --deadline 6.0 \\
  --topology sxm5_nvlink

# 3. Dispatch execution run
kn run dispatch --plan-id plan_98a72f10 --auto-resume`;

  const restCode = `curl -X POST https://api.kynetic.ai/v1/workloads/plan \\
  -H "Authorization: Bearer $KYNETIC_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "llama-3-8b",
    "dataset": "s3://internal-weights/curated-tokens-v2",
    "constraints": {
      "max_budget_usd": 40.00,
      "deadline_hours": 6.0,
      "allow_preemptible_spot": true,
      "topology_requirement": "sxm5_nvlink"
    }
  }'`;

  const getCodeSnippet = () => {
    switch (activeTab) {
      case 'cli':
        return cliCode;
      case 'rest':
        return restCode;
      case 'python':
      default:
        return pythonCode;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyPip = () => {
    navigator.clipboard.writeText('pip install kynetic');
    setCopiedPip(true);
    setTimeout(() => setCopiedPip(false), 2000);
  };

  return (
    <div className="w-full max-w-[1240px] mx-auto flex-1 flex flex-col md:flex-row px-space-md md:px-space-lg lg:px-margin-desktop py-space-lg gap-space-lg">
      <SEO
        title="Python SDK, CLI &amp; Workload API Documentation"
        description="Developer quickstart, Python SDK client reference, CLI deployment guide, and REST API specification for Kynetic AI compute orchestration."
        canonicalPath="/docs"
      />
      {/* LEFT SIDEBAR: Collapsible Architectural Nav */}
      <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 md:border-r border-hairline-default md:pr-space-md self-start md:sticky md:top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <div className="flex items-center justify-between pb-space-sm mb-space-sm border-b border-hairline-subtle">
          <span className="text-label-tag font-label-tag uppercase tracking-wider text-ink-muted">
            Navigation Index
          </span>
          <span className="text-label-tag font-label-tag text-blue-deep bg-sky-subtle px-2 py-0.5 rounded-full border border-sky-soft">
            v2.4.0-stable
          </span>
        </div>

        {/* Quick Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Filter documentation... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 rounded border border-hairline-default bg-surface-elevated text-ink-primary focus:border-blue-electric outline-none"
          />
        </div>

        <nav className="space-y-space-md text-body-sm font-body-sm">
          {/* Section 1 */}
          <div>
            <div className="flex items-center justify-between text-ink-primary font-medium py-1">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-ink-muted">terminal</span>
                Getting Started
              </span>
              <span className="material-symbols-outlined text-[16px] text-ink-subtle cursor-pointer">
                expand_more
              </span>
            </div>
            <div className="mt-1 ml-4 pl-2 border-l border-hairline-default space-y-1">
              <a
                className="block py-1 text-blue-electric font-medium bg-sky-subtle/50 -ml-[9px] pl-2 rounded-r border-l-2 border-blue-electric"
                href="#prerequisites"
              >
                Quickstart (5 min)
              </a>
              <a className="block py-1 text-ink-muted hover:text-ink-primary transition-colors" href="#installation">
                Installation
              </a>
              <a className="block py-1 text-ink-muted hover:text-ink-primary transition-colors" href="#initialize-client">
                Authentication
              </a>
              <a className="block py-1 text-ink-muted hover:text-ink-primary transition-colors" href="#dry-run-simulation">
                Core Concepts
              </a>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <div className="flex items-center justify-between text-ink-primary font-medium py-1">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-ink-muted">memory</span>
                Compute Planning
              </span>
              <span className="material-symbols-outlined text-[16px] text-ink-subtle cursor-pointer">
                expand_more
              </span>
            </div>
            <div className="mt-1 ml-4 pl-2 border-l border-hairline-default space-y-1">
              <Link to="/workload-planner" className="block py-1 text-ink-muted hover:text-ink-primary transition-colors">
                Defining Workloads
              </Link>
              <Link to="/workload-planner" className="block py-1 text-ink-muted hover:text-ink-primary transition-colors">
                Budget &amp; SLA Constraints
              </Link>
              <Link to="/workload-planner" className="block py-1 text-ink-muted hover:text-ink-primary transition-colors">
                Provider Selection
              </Link>
              <Link
                to="/workload-planner"
                className="block py-1 text-ink-muted hover:text-ink-primary transition-colors flex items-center justify-between"
              >
                <span>Digital Twin Simulator</span>
                <span className="text-[9px] font-mono uppercase bg-canvas-alternate px-1 py-0.5 rounded text-ink-muted border border-hairline-subtle">
                  BETA
                </span>
              </Link>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <div className="flex items-center justify-between text-ink-primary font-medium py-1">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-ink-muted">code</span>
                SDK Reference
              </span>
              <span className="material-symbols-outlined text-[16px] text-ink-subtle cursor-pointer">
                expand_more
              </span>
            </div>
            <div className="mt-1 ml-4 pl-2 border-l border-hairline-default space-y-1">
              <a className="block py-1 text-ink-muted hover:text-ink-primary transition-colors" href="#initialize-client">
                Python Client (<code className="text-[12px] font-mono text-ink-primary">kynetic-py</code>)
              </a>
              <a className="block py-1 text-ink-muted hover:text-ink-primary transition-colors" href="#initialize-client">
                CLI Reference (<code className="text-[12px] font-mono text-ink-primary">kn</code>)
              </a>
              <a className="block py-1 text-ink-muted hover:text-ink-primary transition-colors" href="#initialize-client">
                REST API
              </a>
              <a className="block py-1 text-ink-muted hover:text-ink-primary transition-colors" href="#initialize-client">
                Webhooks
              </a>
            </div>
          </div>

          {/* Section 4 */}
          <div>
            <div className="flex items-center justify-between text-ink-primary font-medium py-1">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-ink-muted">hub</span>
                Advanced Orchestration
              </span>
              <span className="material-symbols-outlined text-[16px] text-ink-subtle cursor-pointer">
                expand_more
              </span>
            </div>
            <div className="mt-1 ml-4 pl-2 border-l border-hairline-default space-y-1">
              <Link to="/architecture" className="block py-1 text-ink-muted hover:text-ink-primary transition-colors">
                Spot Preemption Recovery
              </Link>
              <Link to="/architecture" className="block py-1 text-ink-muted hover:text-ink-primary transition-colors">
                Checkpoint &amp; Resume
              </Link>
              <Link to="/architecture" className="block py-1 text-ink-muted hover:text-ink-primary transition-colors">
                Multi-Cluster Slurm Integration
              </Link>
              <Link to="/architecture" className="block py-1 text-ink-muted hover:text-ink-primary transition-colors">
                Kubernetes Operator
              </Link>
            </div>
          </div>

          {/* Section 5 */}
          <div>
            <div className="flex items-center justify-between text-ink-primary font-medium py-1">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-ink-muted">dns</span>
                Providers &amp; Hardware
              </span>
              <span className="material-symbols-outlined text-[16px] text-ink-subtle cursor-pointer">
                expand_more
              </span>
            </div>
            <div className="mt-1 ml-4 pl-2 border-l border-hairline-default space-y-1">
              <a className="block py-1 text-ink-muted hover:text-ink-primary transition-colors" href="#dry-run-simulation">
                H100 SXM5 / PCIe
              </a>
              <a className="block py-1 text-ink-muted hover:text-ink-primary transition-colors" href="#dry-run-simulation">
                L40S Cluster Topologies
              </a>
              <a className="block py-1 text-ink-muted hover:text-ink-primary transition-colors" href="#dry-run-simulation">
                A100 High-Bandwidth
              </a>
              <a className="block py-1 text-ink-muted hover:text-ink-primary transition-colors" href="#dry-run-simulation">
                B200 / GB200 Preview
              </a>
              <a className="block py-1 text-ink-muted hover:text-ink-primary transition-colors" href="#dry-run-simulation">
                Provider Benchmarks
              </a>
            </div>
          </div>
        </nav>

        {/* Thermal Status Card */}
        <div className="mt-space-lg p-space-sm bg-surface-elevated border border-hairline-default rounded-lg">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-label-tag font-label-tag text-ink-muted">TELEMETRY MONITOR</span>
            <span className="w-2 h-2 rounded-full bg-status-healthy"></span>
          </div>
          <div className="text-[12px] font-mono text-ink-body flex justify-between">
            <span>Global Spot Liquidity</span>
            <span className="text-blue-electric font-semibold">94.2%</span>
          </div>
          <div className="w-full bg-hairline-subtle h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-blue-electric h-full w-[94.2%]"></div>
          </div>
        </div>
      </aside>

      {/* CENTER MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 md:px-space-md">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-body-sm font-body-sm text-ink-muted mb-space-sm">
          <Link to="/docs" className="hover:text-ink-primary transition-colors">
            Docs
          </Link>
          <span className="text-hairline-strong">/</span>
          <span className="hover:text-ink-primary transition-colors">Quickstart</span>
          <span className="text-hairline-strong">/</span>
          <span className="text-ink-primary font-medium">Python Client SDK</span>
        </nav>

        {/* Page Header with Atmospheric Wash */}
        <div className="p-space-lg rounded-xl bg-gradient-to-b from-sky-subtle/50 via-canvas-base to-canvas-base border border-hairline-default mb-space-lg">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-subtle border border-sky-soft text-blue-deep text-label-tag font-label-tag mb-space-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-electric animate-pulse"></span>
            GETTING STARTED • STEP 01
          </div>
          <h1 className="text-headline-md md:text-headline-lg font-headline-md md:font-headline-lg text-ink-primary tracking-tight mt-1 mb-space-xs">
            Quickstart: Orchestrating your first training job
          </h1>
          <p className="text-body-lg font-body-lg text-ink-body max-w-2xl leading-relaxed">
            Install the Kynetic SDK, inspect real-time compute options with zero cloud lock-in, and
            dispatch a fault-tolerant training run.
          </p>
        </div>

        {/* Section: Prerequisites */}
        <section className="mb-space-lg" id="prerequisites">
          <h2 className="text-title-md font-title-md text-ink-primary font-semibold mb-space-xs flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-electric rounded"></span>
            1. Prerequisites
          </h2>
          <p className="text-body-md font-body-md text-ink-body mb-space-sm">
            Before initiating execution, verify that your environment satisfies hardware isolation and
            network protocol parameters:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
            <div className="p-space-sm bg-surface-elevated border border-hairline-default rounded-lg">
              <span className="text-label-mono font-label-mono text-ink-muted uppercase block mb-1">
                Runtime Version
              </span>
              <span className="text-body-md font-body-md font-medium text-ink-primary">
                Python 3.10+ or Linux x86_64
              </span>
            </div>
            <div className="p-space-sm bg-surface-elevated border border-hairline-default rounded-lg">
              <span className="text-label-mono font-label-mono text-ink-muted uppercase block mb-1">
                Credential Binding
              </span>
              <span className="text-body-md font-body-md font-medium text-ink-primary">
                KYNETIC_API_KEY exported to env
              </span>
            </div>
          </div>
        </section>

        {/* Section: Installation */}
        <section className="mb-space-lg" id="installation">
          <h2 className="text-title-md font-title-md text-ink-primary font-semibold mb-space-xs flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-electric rounded"></span>
            2. Installation
          </h2>
          <p className="text-body-md font-body-md text-ink-body mb-space-sm">
            Deploy the unified orchestration client into your virtual environment:
          </p>
          {/* Recessed Terminal Block */}
          <div className="bg-canvas-alternate border border-hairline-default rounded-lg overflow-hidden">
            <div className="px-space-md py-2 bg-hairline-subtle/60 border-b border-hairline-default flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-hairline-strong"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-hairline-strong"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-hairline-strong"></span>
                <span className="text-label-mono font-label-mono text-ink-muted text-xs ml-2">
                  bash ~ zsh
                </span>
              </div>
              <button
                className="text-label-mono font-label-mono text-xs text-ink-muted hover:text-ink-primary flex items-center gap-1 transition-colors"
                onClick={handleCopyPip}
              >
                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                <span>{copiedPip ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-space-md font-mono text-body-sm text-ink-primary">
              <span className="text-ink-subtle select-none">$ </span>pip install kynetic
            </div>
          </div>
        </section>

        {/* Section: Interactive Code Execution Block */}
        <section className="mb-space-lg" id="initialize-client">
          <div className="flex items-center justify-between mb-space-xs">
            <h2 className="text-title-md font-title-md text-ink-primary font-semibold flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-electric rounded"></span>
              3. Initialize Client &amp; Define Constraints
            </h2>
          </div>
          <p className="text-body-md font-body-md text-ink-body mb-space-sm">
            Switch between native environments to view the orchestration pipeline contract:
          </p>
          {/* Code Block Container with Tab Switcher */}
          <div className="bg-canvas-alternate border border-hairline-default rounded-lg overflow-hidden">
            {/* Code Tabs */}
            <div className="flex items-center justify-between border-b border-hairline-default px-space-md bg-canvas-base">
              <div className="flex gap-space-md">
                <button
                  onClick={() => setActiveTab('python')}
                  className={`py-2.5 text-label-mono font-label-mono border-b-2 text-xs transition-colors ${
                    activeTab === 'python'
                      ? 'border-blue-electric text-ink-primary font-medium'
                      : 'border-transparent text-ink-muted hover:text-ink-primary'
                  }`}
                >
                  Python SDK
                </button>
                <button
                  onClick={() => setActiveTab('cli')}
                  className={`py-2.5 text-label-mono font-label-mono border-b-2 text-xs transition-colors ${
                    activeTab === 'cli'
                      ? 'border-blue-electric text-ink-primary font-medium'
                      : 'border-transparent text-ink-muted hover:text-ink-primary'
                  }`}
                >
                  CLI (kn)
                </button>
                <button
                  onClick={() => setActiveTab('rest')}
                  className={`py-2.5 text-label-mono font-label-mono border-b-2 text-xs transition-colors ${
                    activeTab === 'rest'
                      ? 'border-blue-electric text-ink-primary font-medium'
                      : 'border-transparent text-ink-muted hover:text-ink-primary'
                  }`}
                >
                  cURL REST
                </button>
              </div>
              <button
                onClick={handleCopyCode}
                className="text-label-mono font-label-mono text-xs text-ink-muted hover:text-ink-primary flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">copy_all</span>
                <span>{copiedScript ? 'Copied script!' : 'Copy script'}</span>
              </button>
            </div>
            {/* Code Well */}
            <div className="p-space-md font-mono text-body-sm leading-relaxed overflow-x-auto text-ink-primary bg-surface-elevated">
              <pre>{getCodeSnippet()}</pre>
            </div>
          </div>
        </section>

        {/* Section: Visual Parameter Specifications Table */}
        <section className="mb-space-lg" id="dry-run-simulation">
          <h2 className="text-title-md font-title-md text-ink-primary font-semibold mb-space-xs flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-electric rounded"></span>
            4. Workload Constraint Parameters
          </h2>
          <p className="text-body-md font-body-md text-ink-body mb-space-sm">
            Technical specifications passed to the autonomous allocation engine:
          </p>
          {/* Technical Spec Table */}
          <div className="border border-hairline-default rounded-lg overflow-x-auto bg-surface-elevated">
            <table className="w-full text-left border-collapse text-body-sm font-body-sm">
              <thead>
                <tr className="border-b border-hairline-default bg-canvas-alternate text-ink-muted text-label-tag font-label-tag">
                  <th className="py-2.5 px-4 font-semibold uppercase">Parameter</th>
                  <th className="py-2.5 px-4 font-semibold uppercase">Type</th>
                  <th className="py-2.5 px-4 font-semibold uppercase">Default</th>
                  <th className="py-2.5 px-4 font-semibold uppercase">Architectural Behavior</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-subtle">
                <tr className="hover:bg-sky-subtle/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-ink-primary">
                    max_budget_usd
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-blue-deep">float</td>
                  <td className="py-3 px-4 font-mono text-xs text-ink-muted">None</td>
                  <td className="py-3 px-4 text-ink-body">
                    Hard budget clamp. Cluster is cleanly terminated after graceful checkpoint push if
                    reached.
                  </td>
                </tr>
                <tr className="hover:bg-sky-subtle/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-ink-primary">
                    checkpoint_sync_interval
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-blue-deep">int (sec)</td>
                  <td className="py-3 px-4 font-mono text-xs text-ink-muted">300</td>
                  <td className="py-3 px-4 text-ink-body">
                    Zero-overhead delta synchronization frequency into encrypted blob storage.
                  </td>
                </tr>
                <tr className="hover:bg-sky-subtle/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-ink-primary">
                    allow_preemptible_spot
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-blue-deep">boolean</td>
                  <td className="py-3 px-4 font-mono text-xs text-ink-muted">True</td>
                  <td className="py-3 px-4 text-ink-body">
                    Enables cross-datacenter spot arbitrage with 30-second preemption notice
                    absorption.
                  </td>
                </tr>
                <tr className="hover:bg-sky-subtle/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-ink-primary">
                    topology_requirement
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-blue-deep">string</td>
                  <td className="py-3 px-4 font-mono text-xs text-ink-muted">"sxm5_nvlink"</td>
                  <td className="py-3 px-4 text-ink-body">
                    Mandates inter-GPU interconnect bandwidth (minimum 900 GB/s bidirectional NVLink).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section: Troubleshooting Callout */}
        <section className="mb-space-xl" id="error-handling">
          <div className="p-space-md bg-canvas-base border border-sky-ice/70 rounded-xl relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-sky-subtle rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-blue-electric text-[24px] mt-0.5">
                lightbulb
              </span>
              <div>
                <h4 className="text-title-sm font-title-sm font-semibold text-ink-primary mb-1">
                  Troubleshooting &amp; Operational Best Practice
                </h4>
                <p className="text-body-sm font-body-sm text-ink-body leading-relaxed mb-space-xs">
                  When operating with spot clusters in low-liquidity geo-regions (e.g.{' '}
                  <code className="font-mono text-xs text-ink-primary bg-hairline-subtle px-1 rounded">
                    eu-central-1
                  </code>
                  ), initialize with fallback topology constraints. If preemption rates exceed 2
                  events per hour, the Kynetic supervisor seamlessly transitions the state to an
                  on-demand node within 4.2 seconds without loss of loss-curve telemetry.
                </p>
                <div className="flex items-center gap-space-sm">
                  <Link
                    to="/architecture"
                    className="text-label-mono font-label-mono text-blue-deep hover:underline text-xs flex items-center gap-1"
                  >
                    Read Checkpoint Protocol Architecture
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Page Pagination */}
        <div className="border-t border-hairline-default pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md mb-space-xl">
          <Link
            to="/architecture"
            className="w-full sm:w-auto p-space-sm border border-hairline-default rounded-lg hover:border-sky-ice hover:bg-sky-subtle/20 transition-all flex items-center gap-space-sm group"
          >
            <span className="material-symbols-outlined text-ink-muted group-hover:text-blue-electric transition-colors">
              arrow_back
            </span>
            <div className="text-left">
              <span className="text-label-tag font-label-tag text-ink-muted block uppercase">
                Previous Section
              </span>
              <span className="text-body-sm font-body-sm font-medium text-ink-primary">
                Architecture Overview
              </span>
            </div>
          </Link>
          <Link
            to="/workload-planner"
            className="w-full sm:w-auto p-space-sm border border-hairline-default rounded-lg hover:border-sky-ice hover:bg-sky-subtle/20 transition-all flex items-center justify-end gap-space-sm text-right group"
          >
            <div>
              <span className="text-label-tag font-label-tag text-ink-muted block uppercase">
                Next Section
              </span>
              <span className="text-body-sm font-body-sm font-medium text-ink-primary">
                Configuring Spot Arbitrage
              </span>
            </div>
            <span className="material-symbols-outlined text-ink-muted group-hover:text-blue-electric transition-colors">
              arrow_forward
            </span>
          </Link>
        </div>
      </main>

      {/* RIGHT COLUMN: Table of Contents */}
      <aside className="hidden lg:block w-56 flex-shrink-0 self-start sticky top-20 text-body-sm font-body-sm border-l border-hairline-default pl-space-md">
        <span className="text-label-tag font-label-tag text-ink-muted uppercase tracking-wider block mb-space-sm">
          On This Page
        </span>
        <ul className="space-y-2 text-ink-muted">
          <li>
            <a className="hover:text-ink-primary transition-colors block text-xs py-0.5" href="#prerequisites">
              1. Prerequisites
            </a>
          </li>
          <li>
            <a className="hover:text-ink-primary transition-colors block text-xs py-0.5" href="#installation">
              2. Installation
            </a>
          </li>
          <li>
            <a
              className="text-blue-deep font-medium block text-xs py-0.5 border-l-2 border-blue-electric -ml-[17px] pl-[15px]"
              href="#initialize-client"
            >
              3. Initialize Client
            </a>
          </li>
          <li>
            <a className="hover:text-ink-primary transition-colors block text-xs py-0.5" href="#dry-run-simulation">
              4. Dry-run Simulation
            </a>
          </li>
          <li>
            <a className="hover:text-ink-primary transition-colors block text-xs py-0.5" href="#error-handling">
              5. Error Handling &amp; Limits
            </a>
          </li>
        </ul>

        {/* Community / Support Box */}
        <div className="mt-space-lg pt-space-md border-t border-hairline-subtle">
          <span className="text-label-tag font-label-tag text-ink-muted uppercase tracking-wider block mb-2">
            Need Assistance?
          </span>
          <div className="space-y-2">
            <a
              className="text-xs text-ink-body hover:text-blue-deep flex items-center gap-1.5 transition-colors"
              href="https://discord.gg"
              target="_blank"
              rel="noreferrer"
            >
              <span className="material-symbols-outlined text-[15px]">forum</span>
              Discord Developer Guild
            </a>
            <a
              className="text-xs text-ink-body hover:text-blue-deep flex items-center gap-1.5 transition-colors"
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
            >
              <span className="material-symbols-outlined text-[15px]">bug_report</span>
              File an Issue
            </a>
            <a
              className="text-xs text-ink-body hover:text-blue-deep flex items-center gap-1.5 transition-colors"
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
            >
              <span className="material-symbols-outlined text-[15px]">edit</span>
              Edit on GitHub
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
};

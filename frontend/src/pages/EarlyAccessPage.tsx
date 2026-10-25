import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { trackConversion } from '../utils/analytics';

export const EarlyAccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [handle, setHandle] = useState('');
  const [gpuScale, setGpuScale] = useState('16-64');
  const [selectedWorkloads, setSelectedWorkloads] = useState<string[]>([
    'Distributed Pre-training',
    'High-Throughput Inference / vLLM',
  ]);
  const [bottleneck, setBottleneck] = useState('Spot preemption & lost checkpoints');
  const [spendTier, setSpendTier] = useState('tier2');

  // Anti-Spam Honeypot & Rate Limiting
  const [honeypot, setHoneypot] = useState('');
  const [rateLimitError, setRateLimitError] = useState('');

  const toggleWorkload = (wl: string) => {
    setSelectedWorkloads((prev) =>
      prev.includes(wl) ? prev.filter((item) => item !== wl) : [...prev, wl]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Honeypot Trap Check: If filled by automated bots, silently drop submission
    if (honeypot.trim() !== '') {
      console.warn('[Security Guard] Automated bot submission rejected.');
      setSubmitted(true);
      return;
    }

    // 2. Client-side Rate Limiting (1 submission every 15 seconds)
    const now = Date.now();
    const lastSub = localStorage.getItem('kynetic_last_submission_ts');
    if (lastSub && now - parseInt(lastSub, 10) < 15000) {
      setRateLimitError('Too many submissions detected. Please wait 15 seconds before retrying.');
      return;
    }
    localStorage.setItem('kynetic_last_submission_ts', now.toString());

    // 3. Track conversion event in Google Analytics 4
    trackConversion('early_access_submitted', {
      org,
      gpu_scale: gpuScale,
      spend_tier: spendTier,
    });

    // 4. Navigate directly to the dedicated conversion Thank You page
    navigate('/thank-you');
  };

  return (
    <main className="flex-1 relative">
      <SEO
        title="Request Enterprise Early Access"
        description="Apply for dedicated GPU compute concierge, custom broker topologies, and guaranteed 99.98% preemption immunity."
        canonicalPath="/early-access"
      />
      {/* Ambient Sky Radial Gradient for Hero Depth */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1240px] h-[480px] pointer-events-none opacity-75 overflow-hidden z-0"
      >
        <div className="w-[840px] h-[340px] mx-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-subtle via-canvas-base/40 to-transparent blur-2xl"></div>
      </div>

      <div className="max-w-[1240px] mx-auto px-space-lg md:px-margin-desktop pt-space-xl pb-space-xl relative z-10">
        {/* HERO CONTEXT */}
        <section className="max-w-3xl mb-space-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-canvas-alternate border border-hairline-default mb-space-md">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-electric"></span>
            <span className="text-label-mono font-label-mono text-ink-body">
              PRIVATE ADMISSION // COHORT 04
            </span>
          </div>
          <h1 className="text-headline-lg md:text-headline-xl font-headline-xl tracking-tight text-ink-primary mb-space-md">
            Architectural compute orchestration for high-scale AI engineering.
          </h1>
          <p className="text-body-lg font-body-lg text-ink-body leading-relaxed mb-space-lg max-w-2xl">
            We onboard engineering teams in phased cohorts to ensure dedicated compute concierge,
            tailor custom GPU broker topologies, and maintain 99.98% preemption immunity.
          </p>
          {/* Metric Telemetry Capsule Strip */}
          <div className="flex flex-wrap items-center gap-x-space-md gap-y-space-xs text-body-sm font-body-sm text-ink-muted border-l-2 border-sky-vibrant pl-space-md py-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-label-mono font-label-mono text-ink-body">Current batch:</span>
              <span className="text-ink-primary font-medium">Q2 2026</span>
            </div>
            <span className="text-hairline-strong">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-label-mono font-label-mono text-ink-body">Review latency:</span>
              <span className="text-ink-primary font-medium">&lt; 24h</span>
            </div>
            <span className="text-hairline-strong">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-label-mono font-label-mono text-ink-body">Allocation:</span>
              <span className="inline-flex items-center text-blue-deep font-medium">
                84% filled
              </span>
            </div>
          </div>
        </section>

        {/* TWO-COLUMN WORKBENCH / APPLICATION LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT COLUMN: APPLICATION FORM (7 COLS) */}
          <section className="lg:col-span-7 bg-surface-elevated border border-hairline-default rounded-xl p-space-lg md:p-space-xl">
            <div className="flex items-center justify-between border-b border-hairline-subtle pb-space-md mb-space-lg">
              <div>
                <h2 className="text-headline-sm font-headline-sm text-ink-primary">
                  Early Access Specification
                </h2>
                <p className="text-body-sm font-body-sm text-ink-muted mt-0.5">
                  Tell us about your cluster topography &amp; scaling constraints.
                </p>
              </div>
              <span className="px-2 py-1 bg-canvas-alternate border border-hairline-default rounded text-label-tag font-label-tag text-ink-body">
                STEP 1/1
              </span>
            </div>

            {rateLimitError && (
              <div className="mb-4 p-3 rounded bg-red-50 border border-status-critical/30 text-status-critical text-body-sm font-medium">
                {rateLimitError}
              </div>
            )}

            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-12 h-12 rounded-full bg-sky-subtle border border-sky-soft text-blue-deep flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[24px]">check</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-ink-primary">
                  Application Submitted
                </h3>
                <p className="font-body-md text-ink-muted max-w-md mx-auto">
                  Thank you! Your Cohort 04 admission ticket has been generated. Our team will review
                  your workload specifications and contact you at{' '}
                  <span className="text-ink-primary font-medium">{email || 'your email'}</span>.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2 bg-ink-primary text-canvas-base rounded-full font-label-mono text-label-mono font-medium hover:bg-neutral-800"
                >
                  Edit Submission
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-space-lg">
                {/* Honeypot Anti-Spam (Invisible to humans) */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <label htmlFor="website_confirm_hp">Do not fill this field</label>
                  <input
                    type="text"
                    id="website_confirm_hp"
                    name="website_confirm_hp"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {/* Work Email */}
                <div>
                  <label
                    className="block text-label-mono font-label-mono text-ink-primary mb-1.5"
                    htmlFor="work-email"
                  >
                    Work Email <span className="text-blue-electric">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className="w-full h-10 px-3.5 bg-surface-elevated border border-hairline-default rounded text-ink-primary placeholder:text-ink-subtle focus:outline-none focus:border-blue-electric focus:ring-1 focus:ring-blue-electric text-body-sm font-body-sm"
                      id="work-email"
                      placeholder="alex@frontier-research.ai"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-ink-subtle">
                      <span className="material-symbols-outlined text-[16px]">alternate_email</span>
                    </div>
                  </div>
                </div>

                {/* Organization & Handle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  <div>
                    <label
                      className="block text-label-mono font-label-mono text-ink-primary mb-1.5"
                      htmlFor="org-name"
                    >
                      Organization / Entity <span className="text-blue-electric">*</span>
                    </label>
                    <input
                      className="w-full h-10 px-3.5 bg-surface-elevated border border-hairline-default rounded text-ink-primary placeholder:text-ink-subtle focus:outline-none focus:border-blue-electric focus:ring-1 focus:ring-blue-electric text-body-sm font-body-sm"
                      id="org-name"
                      placeholder="Synthetix Labs Inc."
                      required
                      type="text"
                      value={org}
                      onChange={(e) => setOrg(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-label-mono font-label-mono text-ink-primary mb-1.5"
                      htmlFor="handle"
                    >
                      GitHub / Hugging Face Handle
                    </label>
                    <input
                      className="w-full h-10 px-3.5 bg-surface-elevated border border-hairline-default rounded text-ink-primary placeholder:text-ink-subtle focus:outline-none focus:border-blue-electric focus:ring-1 focus:ring-blue-electric text-body-sm font-body-sm"
                      id="handle"
                      placeholder="org-or-lead-eng"
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                    />
                  </div>
                </div>

                {/* Current GPU Scale (Segmented control) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-label-mono font-label-mono text-ink-primary">
                      Current GPU Scale (Active Nodes)
                    </label>
                    <span className="text-label-tag font-label-tag text-ink-muted">
                      RESERVATION TIER
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { val: '<16', label: '< 16 GPUs' },
                      { val: '16-64', label: '16 – 64 GPUs' },
                      { val: '64-256', label: '64 – 256 GPUs' },
                      { val: '256+', label: '256+ Cluster' },
                    ].map((item) => (
                      <label key={item.val} className="cursor-pointer">
                        <input
                          className="sr-only peer"
                          name="gpu_scale"
                          type="radio"
                          value={item.val}
                          checked={gpuScale === item.val}
                          onChange={() => setGpuScale(item.val)}
                        />
                        <div className="h-10 flex items-center justify-center border border-hairline-default rounded text-body-sm font-body-sm text-ink-body peer-checked:bg-sky-subtle peer-checked:border-sky-ice peer-checked:text-blue-deep peer-checked:font-medium hover:border-hairline-strong transition-all">
                          {item.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Primary Workload Classification (Multi-select Pills) */}
                <div>
                  <label className="block text-label-mono font-label-mono text-ink-primary mb-2">
                    Primary Workload Topology (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2" id="workload-pill-group">
                    {[
                      'Distributed Pre-training',
                      'Fine-Tuning / LoRA (7B–70B+)',
                      'High-Throughput Inference / vLLM',
                      'Synthetic Data Generation',
                      'Batch Reinforcement Learning (RLHF/DPO)',
                    ].map((wl) => {
                      const isSelected = selectedWorkloads.includes(wl);
                      return (
                        <button
                          key={wl}
                          type="button"
                          onClick={() => toggleWorkload(wl)}
                          className={`workload-pill px-3 py-1.5 rounded-full text-body-sm font-body-sm border transition-all ${
                            isSelected
                              ? 'border-sky-ice bg-sky-subtle text-blue-deep font-medium'
                              : 'border-hairline-default bg-canvas-alternate text-ink-body hover:border-hairline-strong'
                          }`}
                        >
                          {wl}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cloud Providers Checkbox Matrix */}
                <div>
                  <label className="block text-label-mono font-label-mono text-ink-primary mb-2">
                    Current GPU Compute Providers In Use
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { name: 'Lambda Cloud', checked: true },
                      { name: 'CoreWeave', checked: true },
                      { name: 'RunPod', checked: false },
                      { name: 'AWS (Trainium/p5)', checked: false },
                      { name: 'Crusoe Energy', checked: false },
                      { name: 'GCP (TPU/H100)', checked: false },
                    ].map((provider, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-2 p-2.5 rounded border border-hairline-default bg-canvas-base hover:border-hairline-strong cursor-pointer transition-colors"
                      >
                        <input
                          defaultChecked={provider.checked}
                          className="w-4 h-4 text-blue-electric rounded border-hairline-default focus:ring-0"
                          type="checkbox"
                        />
                        <span className="text-body-sm font-body-sm text-ink-primary">
                          {provider.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Primary Bottleneck Dropdown */}
                <div>
                  <label
                    className="block text-label-mono font-label-mono text-ink-primary mb-1.5"
                    htmlFor="bottleneck"
                  >
                    Largest Operational Bottleneck
                  </label>
                  <div className="relative">
                    <select
                      className="w-full h-10 pl-3.5 pr-10 bg-surface-elevated border border-hairline-default rounded text-ink-primary focus:outline-none focus:border-blue-electric focus:ring-1 focus:ring-blue-electric text-body-sm font-body-sm appearance-none"
                      id="bottleneck"
                      value={bottleneck}
                      onChange={(e) => setBottleneck(e.target.value)}
                    >
                      <option>Spot preemption &amp; lost checkpoints</option>
                      <option>Fragmented provider billing &amp; quotes</option>
                      <option>GPU availability / multi-week wait times</option>
                      <option>High cross-region egress costs</option>
                      <option>Lack of automated multi-cloud fallback</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted">
                      <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* Monthly Spend Ceiling */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-label-mono font-label-mono text-ink-primary">
                      Target Monthly GPU Compute Spend
                    </label>
                    <span className="text-label-tag font-label-tag text-ink-muted">
                      ESTIMATED QUOTA
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'tier1', label: '$5k – $20k /mo' },
                      { val: 'tier2', label: '$20k – $100k /mo' },
                      { val: 'tier3', label: '$100k+ Enterprise' },
                    ].map((tier) => (
                      <label key={tier.val} className="cursor-pointer">
                        <input
                          className="sr-only peer"
                          name="spend_tier"
                          type="radio"
                          value={tier.val}
                          checked={spendTier === tier.val}
                          onChange={() => setSpendTier(tier.val)}
                        />
                        <div className="h-10 flex flex-col items-center justify-center border border-hairline-default rounded text-body-sm font-body-sm text-ink-body peer-checked:bg-sky-subtle peer-checked:border-sky-ice peer-checked:text-blue-deep peer-checked:font-medium hover:border-hairline-strong transition-all">
                          {tier.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* CTA Action */}
                <div className="pt-space-sm">
                  <button
                    className="w-full h-11 px-space-lg rounded-full bg-ink-primary text-surface-elevated text-label-mono font-label-mono hover:bg-blue-deep transition-all duration-150 flex items-center justify-center gap-2 group shadow-sm active:scale-[0.99]"
                    type="submit"
                  >
                    <span>Submit Early Access Application</span>
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                      north_east
                    </span>
                  </button>
                  <div className="flex items-center justify-center gap-2 mt-3.5 text-label-tag font-label-tag text-ink-muted">
                    <span className="material-symbols-outlined text-[14px] text-ink-subtle">
                      verified_user
                    </span>
                    <span>
                      Zero-data ingress. Weights and checkpoints remain in your VPC. SOC-2 compliant.
                    </span>
                  </div>
                </div>
              </form>
            )}
          </section>

          {/* RIGHT COLUMN: COHORT ADVANTAGES & LIVE TELEMETRY (5 COLS) */}
          <aside className="lg:col-span-5 space-y-space-lg">
            {/* Card 1: Cohort Inclusions */}
            <div className="bg-surface-elevated border border-hairline-default rounded-xl p-space-lg">
              <div className="flex items-center justify-between border-b border-hairline-subtle pb-space-sm mb-space-md">
                <h3 className="text-title-sm font-title-sm text-ink-primary font-medium">
                  Cohort 04 Admissions Guarantee
                </h3>
                <span className="text-label-mono font-label-mono text-blue-deep bg-sky-subtle px-2 py-0.5 rounded">
                  DIRECT ENG
                </span>
              </div>
              <ul className="space-y-space-md">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded flex items-center justify-center bg-canvas-alternate text-ink-primary shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[15px]">tune</span>
                  </div>
                  <div>
                    <h4 className="text-title-sm font-title-sm text-ink-primary">
                      White-glove Cluster Profiling
                    </h4>
                    <p className="text-body-sm font-body-sm text-ink-muted mt-0.5">
                      Custom roofline model &amp; FLOPs estimation mapped to your exact model context
                      lengths.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded flex items-center justify-center bg-canvas-alternate text-ink-primary shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[15px]">currency_exchange</span>
                  </div>
                  <div>
                    <h4 className="text-title-sm font-title-sm text-ink-primary">
                      Zero-Markup Spot Arbitrage
                    </h4>
                    <p className="text-body-sm font-body-sm text-ink-muted mt-0.5">
                      Direct broker pricing across 30+ verified providers. Guaranteed zero surcharge
                      throughout the early batch.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded flex items-center justify-center bg-canvas-alternate text-ink-primary shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[15px]">terminal</span>
                  </div>
                  <div>
                    <h4 className="text-title-sm font-title-sm text-ink-primary">
                      Dedicated Kernel Eng Slack
                    </h4>
                    <p className="text-body-sm font-body-sm text-ink-muted mt-0.5">
                      Direct private bridge with Kynetic core systems engineers for distributed
                      torch/Triton triage.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded flex items-center justify-center bg-canvas-alternate text-ink-primary shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[15px]">fast_forward</span>
                  </div>
                  <div>
                    <h4 className="text-title-sm font-title-sm text-ink-primary">
                      Universal Checkpoint Fabric
                    </h4>
                    <p className="text-body-sm font-body-sm text-ink-muted mt-0.5">
                      eBPF-accelerated continuous snapshotting with sub-18s recovery across
                      alternative cloud nodes.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Card 2: Live Broker & Telemetry Well */}
            <div className="bg-canvas-alternate border border-hairline-default rounded-xl p-space-lg">
              <div className="flex items-center justify-between pb-space-sm border-b border-hairline-default mb-space-md">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-status-healthy"></span>
                  <span className="text-label-mono font-label-mono text-ink-primary">
                    BROKER_TELEMETRY // LIVE
                  </span>
                </div>
                <span className="text-label-mono font-label-mono text-ink-muted">POLL: 1.2s</span>
              </div>
              {/* Terminal Rows */}
              <div className="space-y-space-sm font-label-mono text-label-mono">
                <div className="p-2.5 rounded bg-surface-elevated border border-hairline-subtle">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-ink-primary font-medium">US-East (Virginia)</span>
                    <span className="text-blue-deep font-semibold">$2.14/hr</span>
                  </div>
                  <div className="flex justify-between items-center text-ink-muted">
                    <span>H100 SXM5 · 8x Clustered</span>
                    <span className="text-status-active">98.4% Available</span>
                  </div>
                  {/* Mini Progress Bar */}
                  <div className="w-full bg-hairline-subtle h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-electric h-full w-[98.4%]"></div>
                  </div>
                </div>
                <div className="p-2.5 rounded bg-surface-elevated border border-hairline-subtle">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-ink-primary font-medium">US-Central (Texas)</span>
                    <span className="text-ink-primary font-semibold">$1.18/hr</span>
                  </div>
                  <div className="flex justify-between items-center text-ink-muted">
                    <span>L40S Pool · NVLink Active</span>
                    <span className="text-status-active">Ready</span>
                  </div>
                  <div className="w-full bg-hairline-subtle h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-sky-vibrant h-full w-[76%]"></div>
                  </div>
                </div>
                <div className="p-2.5 rounded bg-surface-elevated border border-hairline-subtle">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-ink-primary font-medium">EU-West (Iceland)</span>
                    <span className="text-blue-deep font-semibold">Reserved Batch</span>
                  </div>
                  <div className="flex justify-between items-center text-ink-muted">
                    <span>GH200 Grace Hopper · 100% Geo</span>
                    <span className="text-ink-primary">Low-Carbon</span>
                  </div>
                  <div className="w-full bg-hairline-subtle h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-deep h-full w-[91%]"></div>
                  </div>
                </div>
              </div>
              {/* Footer indicator in terminal */}
              <div className="mt-space-md pt-2 border-t border-hairline-default flex items-center justify-between text-label-tag font-label-tag text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-electric animate-ping"></span>
                  <span>GLOBAL SCHEDULER: NOMINAL</span>
                </span>
                <span>SYNCHRONIZED</span>
              </div>
            </div>

            {/* Micro Quote / Attestation */}
            <div className="p-space-md rounded-lg border border-hairline-subtle bg-surface-elevated/60 text-ink-muted text-body-sm font-body-sm italic">
              “Kynetic cut our checkpoint failure recovery latency from 45 minutes to 22 seconds
              across spot instances.”
              <div className="mt-2 text-label-mono font-label-mono not-italic text-ink-primary font-medium flex items-center gap-1.5">
                <span>— Principal ML Systems Eng</span>
                <span className="text-ink-subtle">· Frontier Bio</span>
              </div>
            </div>
          </aside>
        </div>

        {/* TRUST & SECURITY STRIP */}
        <section className="mt-space-xl pt-space-xl border-t border-hairline-default">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-body-sm font-body-sm text-ink-muted">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-electric text-xl mt-0.5">
                encrypted
              </span>
              <div>
                <span className="font-semibold text-ink-primary block mb-0.5">
                  Zero Trust Architecture
                </span>
                <p>Telemetry only. Training data and checkpoint shards never transit our network.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-electric text-xl mt-0.5">
                cloud_done
              </span>
              <div>
                <span className="font-semibold text-ink-primary block mb-0.5">Multi-Cloud Native</span>
                <p>Supports Lambda, CoreWeave, RunPod, AWS Trainium/H100, and Crusoe Energy.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-electric text-xl mt-0.5">
                speed
              </span>
              <div>
                <span className="font-semibold text-ink-primary block mb-0.5">
                  Automated Spot Salvage
                </span>
                <p>30-second notice checkpoint migration with sub-18s recovery latency.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

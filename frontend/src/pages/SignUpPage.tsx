import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { trackConversion } from '../utils/analytics';
import { apiClient } from '../api/client';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [workloadRole, setWorkloadRole] = useState('ml_engineer');
  const [password, setPassword] = useState('arch-compute-9981-cluster#alpha');
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim() !== '') {
      navigate('/thank-you');
      return;
    }
    trackConversion('sign_up_completed', { role: workloadRole });
    setIsSubmitting(true);
    apiClient.setAuthToken(`kyn_user_${Date.now()}`);
    apiClient.setOrganizationId(organization ? organization.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'default-org');
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/thank-you');
    }, 400);
  };

  return (
    <div className="bg-canvas-base text-ink-primary font-body-md antialiased min-h-screen flex flex-col justify-between selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <SEO
        title="Create Enterprise Account &amp; Free Compute Quota"
        description="Provision your isolated multi-cloud GPU tenant, initialize eBPF kernel telemetry, and claim trial compute quota."
        canonicalPath="/signup"
      />
      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: Workspace Provisioning Form */}
          <section className="lg:col-span-7 bg-surface-elevated border border-hairline-default rounded-xl p-5 sm:p-8 lg:p-10 shadow-xs relative">
            {/* Header Group */}
            <div className="space-y-2.5 mb-6">
              <div className="inline-flex items-center gap-2 font-label-tag text-[10px] sm:text-label-tag text-accent-olive tracking-wider">
                <span className="w-2 h-2 rounded-full bg-status-healthy"></span>
                <span>GET STARTED // PROVISION YOUR WORKSPACE</span>
              </div>
              <h1 className="text-2xl sm:text-headline-md lg:text-headline-lg text-ink-primary font-medium tracking-tight">
                Create your Kynetic AI account
              </h1>
              <p className="font-body-md text-sm sm:text-body-md text-ink-muted max-w-xl leading-relaxed">
                Simulate training and inference runs across 30+ GPU clouds with zero vendor lock-in.
              </p>
            </div>

            {/* 1-Click Developer Auth Cluster */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center gap-3 h-11 sm:h-10 min-h-[44px] px-5 rounded-full bg-canvas-base border border-hairline-default text-ink-primary font-label-mono text-xs sm:text-label-mono hover:border-hairline-strong hover:bg-canvas-alternate active:scale-[0.99] transition-all duration-150 font-medium"
              >
                <svg aria-hidden="true" className="w-4 h-4 fill-current text-ink-primary" viewBox="0 0 24 24">
                  <path
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    fillRule="evenodd"
                  />
                </svg>
                <span>Sign up with GitHub</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center gap-3 h-11 sm:h-10 min-h-[44px] px-5 rounded-full bg-canvas-base border border-hairline-default text-ink-primary font-label-mono text-xs sm:text-label-mono hover:border-hairline-strong hover:bg-canvas-alternate active:scale-[0.99] transition-all duration-150 font-medium"
              >
                <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Sign up with Google</span>
              </button>
            </div>

            {/* Architectural Hairline Divider */}
            <div className="relative flex items-center py-2 mb-6 text-center">
              <div className="flex-grow border-t border-hairline-subtle"></div>
              <span className="flex-shrink mx-4 font-label-mono text-[11px] text-ink-subtle uppercase tracking-wider">
                or register with corporate email
              </span>
              <div className="flex-grow border-t border-hairline-subtle"></div>
            </div>

            {/* Registration Form Inputs */}
            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              {/* Invisible Honeypot Spam Guard */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <input
                  type="text"
                  name="signup_confirm_hp"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {/* Name & Work Email Split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-label-mono text-xs text-ink-primary" htmlFor="full-name">
                    Full Name
                  </label>
                  <input
                    id="full-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Alex Mercer"
                    className="w-full h-11 sm:h-10 min-h-[44px] px-3.5 rounded bg-surface-elevated border border-hairline-default text-ink-primary font-body-sm text-sm focus:border-ink-primary focus:ring-1 focus:ring-ink-primary focus:outline-none transition-all placeholder:text-ink-subtle"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-label-mono text-xs text-ink-primary" htmlFor="work-email">
                    Work Email
                  </label>
                  <input
                    id="work-email"
                    type="email"
                    required
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    placeholder="alex@frontier-research.ai"
                    className="w-full h-11 sm:h-10 min-h-[44px] px-3.5 rounded bg-surface-elevated border border-hairline-default text-ink-primary font-body-sm text-sm focus:border-ink-primary focus:ring-1 focus:ring-ink-primary focus:outline-none transition-all placeholder:text-ink-subtle"
                  />
                </div>
              </div>

              {/* Organization */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block font-label-mono text-xs text-ink-primary" htmlFor="org-entity">
                    Organization / Research Entity
                  </label>
                  <span className="font-label-mono text-[11px] text-ink-subtle">Domain autolink enabled</span>
                </div>
                <input
                  id="org-entity"
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Synthetix Labs or Institute ID"
                  className="w-full h-11 sm:h-10 min-h-[44px] px-3.5 rounded bg-surface-elevated border border-hairline-default text-ink-primary font-body-sm text-sm focus:border-ink-primary focus:ring-1 focus:ring-ink-primary focus:outline-none transition-all placeholder:text-ink-subtle"
                />
              </div>

              {/* Workload Role Selector */}
              <div className="space-y-2">
                <label className="block font-label-mono text-xs text-ink-primary">
                  Primary Workload Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'ml_engineer', label: 'ML Systems Eng' },
                    { id: 'ai_researcher', label: 'AI Researcher' },
                    { id: 'infra_arch', label: 'Infra Architect' },
                    { id: 'founder', label: 'Founder / Exec' },
                  ].map((role) => (
                    <label
                      key={role.id}
                      className={`flex items-center justify-center p-2.5 min-h-[44px] rounded border cursor-pointer transition-all ${
                        workloadRole === role.id
                          ? 'border-accent-olive bg-[#FAF9F5] ring-1 ring-accent-olive font-semibold text-ink-primary'
                          : 'border-hairline-default bg-canvas-base hover:border-hairline-strong text-ink-muted'
                      }`}
                    >
                      <input
                        type="radio"
                        name="workload_role"
                        value={role.id}
                        checked={workloadRole === role.id}
                        onChange={() => setWorkloadRole(role.id)}
                        className="sr-only"
                      />
                      <span className="font-label-mono text-xs text-center">{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Password + Entropy Meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block font-label-mono text-xs text-ink-primary" htmlFor="password">
                    Console Master Password
                  </label>
                  <span className="font-label-mono text-[11px] text-status-healthy flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    <span>High Entropy (128-bit)</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 sm:h-10 min-h-[44px] px-3.5 pr-11 rounded bg-surface-elevated border border-hairline-default text-ink-primary font-body-sm text-sm focus:border-ink-primary focus:ring-1 focus:ring-ink-primary focus:outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 bottom-0 px-3 text-ink-subtle hover:text-ink-primary transition-colors focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[17px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                {/* Password Strength Indicator */}
                <div className="pt-1 space-y-1">
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="h-1 rounded-full bg-status-healthy"></div>
                    <div className="h-1 rounded-full bg-status-healthy"></div>
                    <div className="h-1 rounded-full bg-status-healthy"></div>
                  </div>
                  <div className="flex justify-between text-ink-subtle font-label-mono text-[11px] pt-0.5">
                    <span>Entropy score: Excellent</span>
                    <span>Meets SOC2 Type II threshold</span>
                  </div>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="pt-1 flex items-start gap-3">
                <input
                  id="consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                  className="w-4 h-4 mt-0.5 rounded border-hairline-default text-accent-olive focus:ring-0 focus:ring-offset-0 bg-surface-elevated accent-accent-olive cursor-pointer"
                />
                <label htmlFor="consent" className="font-body-sm text-xs text-ink-body leading-relaxed cursor-pointer select-none">
                  I agree to the{' '}
                  <a href="#agreement" className="text-ink-primary font-semibold underline underline-offset-2 hover:text-accent-olive">
                    Cluster Provisioning Agreement
                  </a>
                  ,{' '}
                  <a href="#terms" className="text-ink-primary font-semibold underline underline-offset-2 hover:text-accent-olive">
                    Terms of Service
                  </a>
                  , and consent to zero-ingress telemetry logs.
                </label>
              </div>

              {/* Action Button */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-full bg-ink-primary text-canvas-base font-label-mono text-xs sm:text-label-mono flex items-center justify-center gap-2 hover:bg-accent-olive active:scale-[0.99] transition-all duration-150 shadow-xs font-medium"
                >
                  <span className="tracking-wide">
                    {isSubmitting ? 'Provisioning Workspace...' : 'Create Account & Claim 500 Compute Credits'}
                  </span>
                  <span className="material-symbols-outlined text-[15px]">arrow_outward</span>
                </button>
                <p className="font-label-mono text-[11px] text-ink-muted text-center">
                  Free tier includes instant roofline analysis and 50 simulated workload runs. No credit card required.
                </p>
              </div>
            </form>

            {/* Link to Sign In */}
            <div className="mt-5 pt-3 border-t border-hairline-subtle flex items-center justify-center gap-2 text-xs font-body-sm">
              <span className="text-ink-muted">Already have an account?</span>
              <Link to="/signin" className="text-accent-olive font-semibold hover:underline">
                Sign in →
              </Link>
            </div>
          </section>

          {/* RIGHT COLUMN: Architectural Trust & Value Proposition */}
          <aside className="lg:col-span-5 flex flex-col space-y-5">
            <div className="bg-canvas-alternate rounded-xl border border-hairline-default p-6 space-y-5 shadow-xs">
              {/* Card Header */}
              <div className="border-b border-hairline-subtle pb-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-tag text-[10px] text-ink-subtle uppercase">
                    Engineered Architecture
                  </span>
                  <span className="inline-flex items-center gap-1 font-label-mono text-xs text-accent-olive font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                    v2.1 Kernel Active
                  </span>
                </div>
                <h2 className="font-headline-sm text-base sm:text-title-md text-ink-primary font-semibold">
                  The Intelligence Layer for Compute
                </h2>
              </div>

              {/* Value Pillars */}
              <div className="space-y-4">
                {/* Pillar 1 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-hairline-default flex items-center justify-center text-accent-olive shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[17px]">hub</span>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-headline-sm text-xs font-semibold text-ink-primary">
                      Deterministic Multi-Cloud Arbitrage
                    </h3>
                    <p className="font-body-sm text-xs text-ink-muted leading-relaxed">
                      Save 20–40% on H100, L40S, and A100 spot instances with automated preemption shielding and checkpoint persistence.
                    </p>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-hairline-default flex items-center justify-center text-accent-olive shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[17px]">monitoring</span>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-headline-sm text-xs font-semibold text-ink-primary">
                      Roofline &amp; Memory Modeling
                    </h3>
                    <p className="font-body-sm text-xs text-ink-muted leading-relaxed">
                      Accurate FLOPs, tensor parallelism efficiency, and VRAM memory-bandwidth estimation before spending a single dollar.
                    </p>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-hairline-default flex items-center justify-center text-accent-olive shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[17px]">shield</span>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-headline-sm text-xs font-semibold text-ink-primary">
                      Zero-Data Ingress Architecture
                    </h3>
                    <p className="font-body-sm text-xs text-ink-muted leading-relaxed">
                      Code, training checkpoints, and model weights stay strictly inside your own AWS, GCP, Lambda, or bare-metal VPCs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Included in Free Tier Telemetry Box */}
              <div className="bg-surface-elevated rounded-lg border border-hairline-default p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-label-mono text-xs text-ink-primary font-semibold">
                    Included in Developer Provisioning:
                  </span>
                  <span className="font-label-tag text-[10px] text-accent-olive bg-secondary-container px-2 py-0.5 rounded font-semibold">
                    ZERO COST
                  </span>
                </div>
                <ul className="space-y-1.5 font-body-sm text-xs text-ink-body">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-status-healthy text-[15px]">check</span>
                    <span>500 free simulation credits for LLM &amp; vision jobs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-status-healthy text-[15px]">check</span>
                    <span>Full access to 30+ verified GPU provider live index</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-status-healthy text-[15px]">check</span>
                    <span>Interactive Workload Planner CLI &amp; Python SDK</span>
                  </li>
                </ul>
              </div>

              {/* Trust & Compliance Badges */}
              <div className="pt-2 border-t border-hairline-subtle flex flex-wrap items-center justify-between gap-3 text-ink-subtle font-label-mono text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">verified_user</span>
                  <span>SOC2 Type II</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">award_star</span>
                  <span>ISO 27001 Certified</span>
                </div>
              </div>
            </div>

            {/* Telemetry Node Status Preview */}
            <div className="p-3.5 rounded-lg bg-surface-elevated border border-hairline-default flex items-center justify-between text-ink-muted font-label-mono text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-healthy"></span>
                <span className="text-ink-primary font-medium">Global Pool Latency:</span>
                <span>18ms (avg)</span>
              </div>
              <div className="flex items-center gap-1 text-ink-subtle text-[11px]">
                <span className="material-symbols-outlined text-[14px]">memory</span>
                <span>12,480 GPUs indexed</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

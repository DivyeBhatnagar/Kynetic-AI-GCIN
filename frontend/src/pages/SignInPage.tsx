import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim() !== '') {
      navigate('/dashboard');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="bg-canvas-base text-ink-primary font-body-md antialiased min-h-screen flex flex-col justify-between selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <SEO
        title="Console Sign In &amp; mTLS Session Auth"
        description="Authenticate into the Kynetic AI orchestration console with single sign-on, SAML, or hardware mTLS keys."
        canonicalPath="/signin"
      />
      {/* ================= MAIN CONTENT VIEWPORT ================= */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: PRIMARY SIGN-IN CARD (7 cols) */}
          <section className="lg:col-span-7 bg-surface-elevated border border-hairline-default rounded-xl p-5 sm:p-8 lg:p-10 shadow-xs relative">
            {/* Eyebrow Tag */}
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-olive"></span>
              <span className="font-label-tag text-[10px] sm:text-label-tag tracking-wider uppercase text-ink-muted">
                AUTHENTICATION // CONSOLE ACCESS
              </span>
            </div>

            {/* Heading & Editorial Subtext */}
            <h1 className="text-2xl sm:text-headline-md lg:text-headline-lg text-ink-primary font-medium tracking-tight mb-2 sm:mb-3">
              Sign in to Kynetic AI
            </h1>
            <p className="font-body-md text-sm sm:text-body-md text-ink-muted mb-6 sm:mb-8 leading-relaxed max-w-xl">
              Access your compute control plane, workload simulations, and multi-cloud broker.
            </p>

            {/* Quick Developer Auth Providers */}
            <div className="space-y-2.5 mb-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-center gap-3 h-11 sm:h-10 min-h-[44px] px-4 rounded-full border border-hairline-default bg-canvas-base hover:bg-canvas-alternate hover:border-hairline-strong transition-all duration-150 active:scale-[0.99] text-ink-primary font-label-mono text-xs sm:text-label-mono font-medium"
              >
                {/* GitHub Minimal SVG */}
                <svg aria-hidden="true" className="w-4 h-4 fill-current text-ink-primary" viewBox="0 0 24 24">
                  <path
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    fillRule="evenodd"
                  />
                </svg>
                <span>Continue with GitHub</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-center gap-3 h-11 sm:h-10 min-h-[44px] px-4 rounded-full border border-hairline-default bg-canvas-base hover:bg-canvas-alternate hover:border-hairline-strong transition-all duration-150 active:scale-[0.99] text-ink-primary font-label-mono text-xs sm:text-label-mono font-medium"
              >
                {/* Google Minimal SVG */}
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
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-between h-11 sm:h-10 min-h-[44px] px-4 rounded-full border border-hairline-default bg-canvas-base hover:bg-canvas-alternate hover:border-hairline-strong transition-all duration-150 active:scale-[0.99] text-ink-primary font-label-mono text-xs sm:text-label-mono font-medium"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-accent-olive">lock_open</span>
                  <span>Single Sign-On (SAML / Okta)</span>
                </span>
                <span className="font-label-tag text-[10px] tracking-widest px-2 py-0.5 rounded bg-secondary-fixed text-accent-olive font-semibold uppercase">
                  Enterprise
                </span>
              </button>
            </div>

            {/* Hairline Divider */}
            <div className="relative my-6 sm:my-8 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-hairline-subtle"></div>
              </div>
              <span className="relative bg-surface-elevated px-3 font-label-mono text-[11px] text-ink-subtle uppercase tracking-wider">
                or continue with work email
              </span>
            </div>

            {/* Form Elements */}
            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              {/* Invisible Honeypot Spam Guard */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <input
                  type="text"
                  name="signin_confirm_hp"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {/* Work Email */}
              <div>
                <label className="block font-label-mono text-xs text-ink-primary mb-1.5" htmlFor="work-email">
                  Work Email
                </label>
                <div className="relative">
                  <input
                    id="work-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@frontier-research.ai"
                    className="w-full h-11 sm:h-10 min-h-[44px] px-3.5 bg-surface-elevated border border-hairline-default rounded text-ink-primary font-body-sm text-sm placeholder:text-ink-subtle focus:border-ink-primary focus:ring-1 focus:ring-ink-primary focus:outline-none transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-ink-subtle">
                    <span className="material-symbols-outlined text-[17px]">alternate_email</span>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-label-mono text-xs text-ink-primary" htmlFor="password">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password reset link sent to registered email.');
                    }}
                    className="font-body-sm text-xs text-accent-olive hover:underline transition-colors py-1"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 sm:h-10 min-h-[44px] px-3.5 bg-surface-elevated border border-hairline-default rounded text-ink-primary font-body-sm text-sm placeholder:text-ink-subtle focus:border-ink-primary focus:ring-1 focus:ring-ink-primary focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-subtle hover:text-ink-primary transition-colors focus:outline-none min-h-[44px] min-w-[44px] justify-center"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[17px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember session & MFA indication */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="h-4 w-4 rounded border-hairline-default text-ink-primary focus:ring-0 focus:ring-offset-0 focus:border-ink-primary transition-colors accent-accent-olive"
                  />
                  <span className="font-body-sm text-xs sm:text-sm text-ink-body">
                    Remember this device (30-day session)
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 sm:h-10 min-h-[44px] mt-2 rounded-full bg-ink-primary text-canvas-base hover:bg-accent-olive active:scale-[0.99] font-label-mono text-xs sm:text-label-mono font-medium transition-all duration-150 flex items-center justify-center gap-2 shadow-xs"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Console'}</span>
                <span className="material-symbols-outlined text-[15px]">arrow_outward</span>
              </button>
            </form>

            {/* Hardware & Security Isolation Assurance Note */}
            <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-hairline-subtle flex items-start gap-3">
              <span className="material-symbols-outlined text-accent-olive text-[18px] shrink-0 mt-0.5">
                verified_user
              </span>
              <p className="font-body-sm text-xs text-ink-muted leading-relaxed">
                Passkey &amp; hardware MFA supported. Zero telemetry ingress into customer VPCs. Hardware enclave attestation enabled.
              </p>
            </div>

            {/* Link to Sign Up */}
            <div className="mt-4 pt-3 border-t border-hairline-subtle flex items-center justify-center gap-2 text-xs font-body-sm">
              <span className="text-ink-muted">Don't have an account?</span>
              <Link to="/signup" className="text-accent-olive font-semibold hover:underline">
                Create an account →
              </Link>
            </div>
          </section>

          {/* RIGHT COLUMN: TELEMETRY & CLUSTER GUARD (5 cols) */}
          <aside className="lg:col-span-5 space-y-4 sm:space-y-6">
            {/* Live Cluster Node Status Card */}
            <div className="bg-canvas-alternate border border-hairline-default rounded-xl p-5 sm:p-6 relative">
              <div className="flex items-center justify-between pb-3.5 border-b border-hairline-subtle mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-ink-primary text-[17px]">terminal</span>
                  <span className="font-label-mono text-xs text-ink-primary font-semibold">
                    Cluster Guard Telemetry
                  </span>
                </div>
                <span className="font-label-tag text-[10px] text-accent-olive tracking-wider bg-surface-elevated border border-hairline-default px-2 py-0.5 rounded font-semibold uppercase">
                  Connected
                </span>
              </div>

              {/* Structured Monastic Node Specs */}
              <div className="space-y-2.5 font-label-mono text-xs">
                <div className="flex justify-between items-center py-1 border-b border-hairline-subtle">
                  <span className="text-ink-muted">Target Control Plane</span>
                  <span className="text-ink-primary font-medium">us-east-prod-01</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-hairline-subtle">
                  <span className="text-ink-muted">Handshake Latency</span>
                  <span className="text-ink-primary font-medium">1.2ms (p99)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-hairline-subtle">
                  <span className="text-ink-muted">Preemption Immunity</span>
                  <span className="text-status-healthy font-semibold">99.98% Guaranteed</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-ink-muted">Active Global Nodes</span>
                  <span className="text-ink-primary font-medium">41,280 H100/A100s</span>
                </div>
              </div>

              {/* Terminal Mock Readout */}
              <div className="mt-4 p-3 rounded-lg bg-[#181816] text-[#E8E7E0] border border-hairline-strong/30 font-label-mono text-[11px] leading-relaxed">
                <div className="flex items-center gap-2 text-[#8B8B84] mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                  <span>TLS 1.3 / Mutual mTLS Auth Verified</span>
                </div>
                <p className="text-[#9CA3AF]">$ kynetic-agent auth --tenant=isolated</p>
                <p className="text-[#84A96C] font-medium">&gt; routing: multi-cloud mesh active</p>
              </div>
            </div>

            {/* Scale & Compliance Guarantee Card */}
            <div className="bg-surface-elevated border border-hairline-default rounded-xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-canvas-alternate flex items-center justify-center text-accent-olive border border-hairline-default">
                  <span className="material-symbols-outlined text-[19px]">encrypted</span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-sm font-semibold text-ink-primary">Enterprise Grade Control</h2>
                  <p className="font-body-sm text-xs text-ink-muted">SOC2 Type II &amp; FedRAMP Ready</p>
                </div>
              </div>
              <p className="font-body-sm text-xs text-ink-body mb-4 leading-relaxed">
                "Orchestrating over 40,000 GPUs across 30+ verified tier-IV datacenters with automated fault-recovery."
              </p>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-hairline-subtle">
                <span className="px-2.5 py-1 rounded bg-canvas-alternate border border-hairline-default text-[10px] font-label-mono text-ink-muted font-medium">
                  Audit Logs (SIEM Sync)
                </span>
                <span className="px-2.5 py-1 rounded bg-canvas-alternate border border-hairline-default text-[10px] font-label-mono text-ink-muted font-medium">
                  Zero-Trust VPC
                </span>
                <span className="px-2.5 py-1 rounded bg-canvas-alternate border border-hairline-default text-[10px] font-label-mono text-ink-muted font-medium">
                  FIPS 140-3
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

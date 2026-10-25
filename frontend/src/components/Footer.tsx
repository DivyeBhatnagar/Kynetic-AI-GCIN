import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  variant?: 'olive' | 'editorial';
}

export const Footer: React.FC<FooterProps> = ({ variant = 'olive' }) => {
  const logoSrc = '/assets/Kynetic%20AI%20Logo.png';

  if (variant === 'editorial') {
    return (
      <footer className="w-full bg-canvas-alternate border-t border-hairline-default mt-auto">
        <div className="w-full px-4 sm:px-6 md:px-12 py-8 sm:py-12 max-w-7xl mx-auto">
          {/* Top Row: Brand & Live System Status */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-hairline-subtle gap-4">
            <Link to="/" className="flex items-center group py-0.5" aria-label="Kynetic AI Home">
              <img
                alt="Kynetic AI — Autonomous Compute Intelligence Logo"
                className="h-7 w-auto object-contain transition-opacity group-hover:opacity-90"
                src={logoSrc}
              />
            </Link>
            {/* Live Operations Telemetry Status */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-label-tag font-label-tag">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-status-healthy shrink-0"></span>
                <span className="text-ink-primary uppercase">GLOBAL RUNTIME: OPERATIONAL</span>
              </div>
              <span className="text-hairline-strong hidden sm:inline">|</span>
              <span className="text-ink-muted">H100 POOL LATENCY: 1.2ms</span>
              <span className="text-hairline-strong hidden sm:inline">|</span>
              <span className="text-ink-muted">ACTIVE BROKER NODES: 8,419</span>
              <span className="text-hairline-strong hidden sm:inline">|</span>
              <span className="text-ink-primary font-medium inline-flex items-center gap-1">
                <span>🇮🇳</span> MADE IN INDIA
              </span>
            </div>
          </div>

          {/* Legal and Compliance Links Grid */}
          <div className="py-6 border-b border-hairline-subtle">
            <div className="flex flex-wrap items-center gap-x-5 sm:gap-x-6 gap-y-2 text-xs sm:text-body-sm font-body-sm">
              <Link to="/privacy-policy" className="text-ink-muted hover:text-accent-olive transition-colors py-1">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-ink-muted hover:text-accent-olive transition-colors py-1">
                Terms &amp; Cond.
              </Link>
              <Link to="/cookie-policy" className="text-ink-muted hover:text-accent-olive transition-colors py-1">
                Cookie Policy
              </Link>
              <Link to="/refund-policy" className="text-ink-muted hover:text-accent-olive transition-colors py-1">
                Refund Policy
              </Link>
              <Link to="/cookie-consent" className="text-ink-muted hover:text-accent-olive transition-colors py-1">
                Cookie + Form Consent
              </Link>
              <Link to="/user-data-collection" className="text-ink-muted hover:text-accent-olive transition-colors py-1">
                What User Data You Collect
              </Link>
              <Link to="/third-party-embeds" className="text-ink-muted hover:text-accent-olive transition-colors py-1">
                Third Party Embeds
              </Link>
              <Link to="/architecture" className="text-ink-primary font-medium underline underline-offset-4 py-1">
                Security Architecture
              </Link>
            </div>
          </div>

          {/* Bottom Row: Copyright & India Tag */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-6 gap-3 sm:gap-4">
            <p className="font-body-sm text-xs sm:text-body-sm text-ink-muted flex flex-wrap items-center gap-2">
              <span>© 2026 Kynetic AI.</span>
              <span>High-performance compute infrastructure. All rights reserved.</span>
              <span className="text-hairline-strong">•</span>
              <span className="inline-flex items-center gap-1 font-medium text-ink-primary">
                <span>🇮🇳</span> Made in India
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-label-mono text-ink-subtle">
              <span>DPDP ACT 2023 COMPLIANT</span>
              <span>•</span>
              <span>SOC2 TYPE II CONTROLS</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-hairline-default bg-canvas-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-10 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-6 gap-6 sm:gap-8 mb-10 sm:mb-14">
          {/* Brand Wordmark Col */}
          <div className="col-span-2 sm:col-span-2 md:col-span-2">
            <Link to="/" className="inline-block mb-3 sm:mb-4 group" aria-label="Kynetic AI Home">
              <img
                alt="Kynetic AI — Autonomous Compute Intelligence Logo"
                className="h-7 sm:h-8 md:h-9 w-auto object-contain transition-opacity group-hover:opacity-90"
                src={logoSrc}
              />
            </Link>
            <p className="font-body-sm text-xs sm:text-body-sm text-ink-muted max-w-xs leading-relaxed">
              High-scale compute orchestration &amp; GPU optimization. Autonomous intelligence across distributed bare-metal and cloud providers.
            </p>
            <div className="mt-3 sm:mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded bg-surface-elevated border border-hairline-default text-[11px] sm:text-xs font-label-mono text-ink-primary">
              <span className="text-sm">🇮🇳</span>
              <span className="font-medium">Made in India</span>
              <span className="text-ink-subtle">• Global Compute Grid</span>
            </div>
          </div>

          {/* Nav Col 1: Product */}
          <div>
            <h4 className="font-label-mono text-xs sm:text-label-mono uppercase tracking-wider text-ink-primary font-semibold mb-2 sm:mb-3">
              Product
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-body-sm font-body-sm text-ink-muted">
              <li>
                <Link to="/dashboard" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  Console Dashboard
                </Link>
              </li>
              <li>
                <Link to="/workload-planner" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  Workload Planner
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  Compute Recommendations
                </Link>
              </li>
              <li>
                <Link to="/providers" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  Compute Providers Directory
                </Link>
              </li>
              <li>
                <Link to="/architecture" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  System Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Col 2: Resources */}
          <div>
            <h4 className="font-label-mono text-xs sm:text-label-mono uppercase tracking-wider text-ink-primary font-semibold mb-2 sm:mb-3">
              Resources
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-body-sm font-body-sm text-ink-muted">
              <li>
                <Link to="/docs" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  Python SDK
                </Link>
              </li>
              <li>
                <Link to="/architecture" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  Telemetry Status
                </Link>
              </li>
              <li>
                <Link to="/workload-planner" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  GPU Benchmarks
                </Link>
              </li>
              <li>
                <a href="/#faq" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  Frequently Asked Questions (FAQ)
                </a>
              </li>
            </ul>
          </div>

          {/* Nav Col 3: Legal & Governance (ALL 7 REQUESTED PAGES) */}
          <div>
            <h4 className="font-label-mono text-xs sm:text-label-mono uppercase tracking-wider text-ink-primary font-semibold mb-2 sm:mb-3">
              Legal &amp; Trust
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-body-sm font-body-sm text-ink-muted">
              <li>
                <Link to="/privacy-policy" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  Terms &amp; Cond.
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/cookie-consent" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  Cookie + Form Consent
                </Link>
              </li>
              <li>
                <Link to="/user-data-collection" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  What User Data You Collect
                </Link>
              </li>
              <li>
                <Link to="/third-party-embeds" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  Third Party Embeds
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Col 4: Company */}
          <div>
            <h4 className="font-label-mono text-xs sm:text-label-mono uppercase tracking-wider text-ink-primary font-semibold mb-2 sm:mb-3">
              Company
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-body-sm font-body-sm text-ink-muted">
              <li>
                <Link to="/signin" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  Console Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/early-access" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  Request Access
                </Link>
              </li>
              <li>
                <Link to="/architecture" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  Security
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-ink-primary transition-colors py-0.5 inline-block">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Hairline Row */}
        <div className="pt-6 sm:pt-8 border-t border-hairline-default flex flex-col md:flex-row justify-between items-start md:items-center text-ink-muted text-xs sm:text-body-sm font-body-sm gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span>© 2026 Kynetic AI.</span>
            <span>High-scale compute orchestration &amp; GPU optimization.</span>
            <span className="text-hairline-strong">•</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-ink-primary">
              <span>🇮🇳</span> Made in India
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-label-mono text-xs sm:text-label-mono text-ink-subtle">
            <span>REGION: US-EAST-1</span>
            <span>SYSTEMS OPERATIONAL</span>
            <span className="inline-flex items-center gap-1.5 text-ink-body">
              <span className="w-2 h-2 rounded-full bg-status-healthy"></span>
              LATENCY: 18ms
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};


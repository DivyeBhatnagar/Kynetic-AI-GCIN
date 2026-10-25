import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  variant?: 'olive' | 'editorial';
}

export const Footer: React.FC<FooterProps> = ({ variant = 'olive' }) => {
  const logoSrc = '/assets/image.png';

  if (variant === 'editorial') {
    return (
      <footer className="w-full bg-canvas-alternate border-t border-hairline-default mt-auto">
        <div className="w-full px-6 md:px-12 py-12 max-w-7xl mx-auto">
          {/* Top Row: Brand & Live System Status */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-hairline-subtle gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-ink-primary text-surface-elevated text-xs font-semibold">
                K
              </span>
              <span className="text-title-sm font-title-sm font-medium text-ink-primary">
                Kynetic AI
              </span>
            </div>
            {/* Live Operations Telemetry Status */}
            <div className="flex flex-wrap items-center gap-4 text-label-tag font-label-tag">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-status-healthy"></span>
                <span className="text-ink-primary uppercase">GLOBAL RUNTIME: OPERATIONAL</span>
              </div>
              <span className="text-hairline-strong hidden sm:inline">|</span>
              <span className="text-ink-muted">H100 POOL LATENCY: 1.2ms</span>
              <span className="text-hairline-strong hidden sm:inline">|</span>
              <span className="text-ink-muted">ACTIVE BROKER NODES: 8,419</span>
            </div>
          </div>
          {/* Bottom Row: Copyright & Editorial Links */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-6 gap-4">
            <p className="font-body-sm text-body-sm text-ink-muted">
              © 2025 Kynetic AI Inc. High-performance compute infrastructure. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-body-sm font-body-sm">
              <Link to="/docs" className="text-ink-muted hover:text-accent-olive transition-colors">
                Privacy Policy
              </Link>
              <Link to="/docs" className="text-ink-muted hover:text-accent-olive transition-colors">
                Terms of Service
              </Link>
              <Link to="/architecture" className="text-ink-primary underline underline-offset-4">
                Security Architecture
              </Link>
              <Link to="/architecture" className="text-ink-muted hover:text-accent-olive transition-colors">
                Compliance (SOC2)
              </Link>
              <Link to="/workload-planner" className="text-ink-muted hover:text-accent-olive transition-colors">
                System Status
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-hairline-default bg-canvas-base">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-14">
          {/* Brand Wordmark Col */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img
                alt="Kynetic AI Logo"
                className="w-6 h-6 object-contain rounded-sm"
                src={logoSrc}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/logo_olive.svg';
                }}
              />
              <span className="font-headline-sm text-title-sm text-ink-primary font-medium tracking-tight">
                Kynetic AI
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-ink-muted max-w-xs leading-relaxed">
              High-scale compute orchestration &amp; GPU optimization. Autonomous intelligence across distributed providers.
            </p>
          </div>

          {/* Nav Col 1 */}
          <div>
            <h4 className="font-label-mono text-label-mono uppercase tracking-wider text-ink-primary font-semibold mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-body-sm font-body-sm text-ink-muted">
              <li>
                <Link to="/workload-planner" className="hover:text-ink-primary transition-colors">
                  Workload Planner
                </Link>
              </li>
              <li>
                <Link to="/architecture" className="hover:text-ink-primary transition-colors">
                  Performance Twin
                </Link>
              </li>
              <li>
                <Link to="/architecture" className="hover:text-ink-primary transition-colors">
                  Arbitrage Engine
                </Link>
              </li>
              <li>
                <Link to="/architecture" className="hover:text-ink-primary transition-colors">
                  System Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Col 2 */}
          <div>
            <h4 className="font-label-mono text-label-mono uppercase tracking-wider text-ink-primary font-semibold mb-3">
              Resources
            </h4>
            <ul className="space-y-2 text-body-sm font-body-sm text-ink-muted">
              <li>
                <Link to="/docs" className="hover:text-ink-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-ink-primary transition-colors">
                  Python SDK
                </Link>
              </li>
              <li>
                <Link to="/architecture" className="hover:text-ink-primary transition-colors">
                  Telemetry Status
                </Link>
              </li>
              <li>
                <Link to="/workload-planner" className="hover:text-ink-primary transition-colors">
                  GPU Benchmarks
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Col 3 */}
          <div>
            <h4 className="font-label-mono text-label-mono uppercase tracking-wider text-ink-primary font-semibold mb-3">
              Company
            </h4>
            <ul className="space-y-2 text-body-sm font-body-sm text-ink-muted">
              <li>
                <Link to="/early-access" className="hover:text-ink-primary transition-colors">
                  Request Access
                </Link>
              </li>
              <li>
                <Link to="/architecture" className="hover:text-ink-primary transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link to="/mobile" className="hover:text-ink-primary transition-colors">
                  Mobile Preview
                </Link>
              </li>
              <li>
                <Link to="/early-access" className="hover:text-ink-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Hairline Row */}
        <div className="pt-8 border-t border-hairline-default flex flex-col md:flex-row justify-between items-center text-ink-muted text-body-sm font-body-sm gap-4">
          <div>
            © 2025 Kynetic AI Inc. High-scale compute orchestration &amp; GPU optimization.
          </div>
          <div className="flex flex-wrap items-center gap-6 font-label-mono text-label-mono text-ink-subtle">
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

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

export const NotFoundPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const quickNav = [
    { name: 'Console Dashboard', path: '/dashboard', desc: 'Active workload telemetry & cluster nodes' },
    { name: 'Workload Planner', path: '/workload-planner', desc: 'Roofline simulation & GPU arbitrage' },
    { name: 'Compute Directory', path: '/providers', desc: 'H100/H200 multi-cloud spot catalog' },
    { name: 'Architecture Spec', path: '/architecture', desc: 'Distributed control plane & security' },
    { name: 'Developer Docs', path: '/docs', desc: 'Python SDK, CLI & OpenAPI quickstart' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const term = searchTerm.toLowerCase();
    if (term.includes('dash') || term.includes('console')) navigate('/dashboard');
    else if (term.includes('plan') || term.includes('gpu') || term.includes('sim')) navigate('/workload-planner');
    else if (term.includes('prov') || term.includes('runpod') || term.includes('lambda')) navigate('/providers');
    else if (term.includes('arch') || term.includes('sec')) navigate('/architecture');
    else if (term.includes('doc') || term.includes('sdk') || term.includes('cli')) navigate('/docs');
    else if (term.includes('sign') || term.includes('log')) navigate('/signin');
    else navigate(`/?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="min-h-screen bg-canvas-base text-ink-primary font-body-md flex flex-col justify-center py-20 px-6">
      <SEO
        title="404 Node Unreachable"
        description="The requested routing endpoint or cluster document does not exist on the Kynetic AI compute mesh."
      />

      <div className="max-w-3xl mx-auto w-full">
        {/* Terminal Diagnostic Banner */}
        <div className="p-6 md:p-8 rounded border border-hairline-default bg-surface-elevated shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-hairline-subtle">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-status-critical"></span>
              <span className="font-label-mono text-label-mono uppercase tracking-wider text-status-critical font-bold">
                ROUTING ANOMALY • HTTP 404
              </span>
            </div>
            <span className="font-label-mono text-xs text-ink-subtle">
              CLUSTER: US-EAST-1 (OPERATIONAL)
            </span>
          </div>

          <div className="space-y-3 font-label-mono text-xs text-ink-body bg-canvas-alternate/70 p-4 rounded border border-hairline-default">
            <p className="text-ink-primary font-semibold">
              $ kn route resolve &quot;{location.pathname}&quot;
            </p>
            <p className="text-status-critical">
              [ERR_ENDPOINT_UNDEFINED]: Target URI path yielded 0 active ingress routes in orchestration routing table.
            </p>
            <p className="text-ink-muted">
              Latency: 0.8ms • mTLS handshake: verified • Fallback resolution: initiated
            </p>
          </div>

          <div className="space-y-3">
            <h1 className="font-headline-lg text-headline-lg text-ink-primary tracking-tight">
              Page or Node Endpoint Not Found
            </h1>
            <p className="font-body-md text-ink-muted leading-relaxed">
              The page you are looking for may have been migrated, decommissioned, or typed incorrectly. You can use the quick diagnostic search below or select an active compute portal.
            </p>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Search destination (e.g. 'workload planner', 'docs', 'pricing')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded bg-canvas-base border border-hairline-default focus:border-accent-olive focus:outline-none text-body-sm text-ink-primary placeholder:text-ink-subtle"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded bg-accent-olive text-white font-label-mono text-label-mono uppercase tracking-wider hover:bg-accent-olive-deep transition-all shadow-sm"
            >
              Resolve
            </button>
          </form>

          {/* Active Navigation Routes Grid */}
          <div>
            <h3 className="font-label-mono text-label-mono uppercase text-ink-muted tracking-wider font-semibold mb-3">
              Operational Gateways
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickNav.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="p-3.5 rounded border border-hairline-default bg-canvas-base hover:bg-canvas-alternate hover:border-hairline-strong transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-body-sm text-ink-primary group-hover:text-accent-olive transition-colors">
                      {item.name}
                    </span>
                    <span className="font-label-mono text-xs text-accent-olive">→</span>
                  </div>
                  <p className="text-xs text-ink-muted mt-1">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-hairline-subtle flex flex-wrap items-center justify-between gap-4 text-xs font-label-mono text-ink-muted">
            <Link to="/" className="text-accent-olive hover:underline font-medium">
              ← Return to Kynetic AI Homepage
            </Link>
            <span>Need human support? Contact infra@kynetic.ai</span>
          </div>
        </div>
      </div>
    </div>
  );
};

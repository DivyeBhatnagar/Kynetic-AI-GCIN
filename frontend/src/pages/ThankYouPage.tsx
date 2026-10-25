import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { trackConversion } from '../utils/analytics';

export const ThankYouPage: React.FC = () => {
  const [refId, setRefId] = useState('KYN-CONF-7821');

  useEffect(() => {
    // Generate deterministic or session reference code
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const token = `KYN-COHORT-${randomHex}`;
    setRefId(token);

    // Track conversion event for Google Analytics 4 & Telemetry
    trackConversion('early_access_conversion', {
      reference_id: token,
      timestamp: new Date().toISOString(),
    });
  }, []);

  return (
    <div className="min-h-screen bg-canvas-base text-ink-primary font-body-md pt-24 sm:pt-28 pb-12 sm:pb-20 px-4 sm:px-6">
      <SEO
        title="Application Received &amp; Confirmed"
        description="Your early access application for Kynetic AI enterprise compute orchestration has been confirmed."
      />

      <div className="max-w-3xl mx-auto w-full">
        <div className="p-5 sm:p-8 md:p-12 rounded border border-hairline-default bg-surface-elevated shadow-sm space-y-6 sm:space-y-8">
          {/* Header Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-hairline-subtle">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-status-healthy shrink-0"></span>
              <span className="font-label-mono text-xs sm:text-label-mono uppercase tracking-wider text-status-healthy font-bold">
                APPLICATION CONFIRMED • CONVERSION COMPLETE
              </span>
            </div>
            <div className="self-start sm:self-auto px-3 py-1 rounded bg-canvas-alternate border border-hairline-default font-label-mono text-xs text-ink-primary">
              REF: <span className="font-semibold text-accent-olive">{refId}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-headline-lg font-headline-lg text-ink-primary tracking-tight">
              Welcome to the Kynetic Compute Mesh
            </h1>
            <p className="font-body-md text-ink-muted leading-relaxed">
              Thank you for applying for early platform access. Your workload profile has been registered in our routing queue, and our engineering concierge is preparing your isolated tenant credentials.
            </p>
          </div>

          {/* Process Timeline Steps */}
          <div className="space-y-4">
            <h3 className="font-label-mono text-xs sm:text-label-mono uppercase text-ink-muted tracking-wider font-semibold">
              Onboarding Pipeline Protocol
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded border border-hairline-default bg-canvas-alternate/60 space-y-2">
                <span className="font-label-mono text-xs text-accent-olive font-bold">STAGE 01</span>
                <h4 className="font-title-sm text-ink-primary font-semibold">Roofline Calibration</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  We simulate your model memory bandwidth saturation against live H100/H200 spot pools.
                </p>
              </div>

              <div className="p-4 rounded border border-hairline-default bg-canvas-alternate/60 space-y-2">
                <span className="font-label-mono text-xs text-accent-olive font-bold">STAGE 02</span>
                <h4 className="font-title-sm text-ink-primary font-semibold">Concierge Review</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  An infra architect examines your custom topology constraints and SLA deadlines within 24h.
                </p>
              </div>

              <div className="p-4 rounded border border-hairline-default bg-canvas-alternate/60 space-y-2">
                <span className="font-label-mono text-xs text-accent-olive font-bold">STAGE 03</span>
                <h4 className="font-title-sm text-ink-primary font-semibold">mTLS Token Dispatch</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  You will receive secure API keys and cluster access links directly via your registered work email.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links & CTA */}
          <div className="pt-6 border-t border-hairline-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/workload-planner"
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded bg-accent-olive text-white font-label-mono text-label-mono uppercase tracking-wider hover:bg-accent-olive-deep transition-all text-center shadow-sm flex items-center justify-center"
            >
              Simulate Another Workload
            </Link>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs font-label-mono text-ink-muted">
              <Link to="/dashboard" className="text-accent-olive hover:underline font-medium min-h-[36px] flex items-center">
                View Live Dashboard
              </Link>
              <span>•</span>
              <Link to="/docs" className="text-ink-primary hover:underline min-h-[36px] flex items-center">
                Read Python SDK Docs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

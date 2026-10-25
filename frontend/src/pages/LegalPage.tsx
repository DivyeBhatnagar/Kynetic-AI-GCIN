import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SEO } from '../components/SEO';

export type LegalTab =
  | 'privacy'
  | 'terms'
  | 'cookies'
  | 'refund'
  | 'consent'
  | 'data-collection'
  | 'third-party';

interface LegalPageProps {
  initialTab?: LegalTab;
}

export const LegalPage: React.FC<LegalPageProps> = ({ initialTab }) => {
  const location = useLocation();

  // Determine active tab from URL path or prop
  const getTabFromPath = (): LegalTab => {
    const path = location.pathname.toLowerCase();
    if (path.includes('terms')) return 'terms';
    if (path.includes('cookie-policy')) return 'cookies';
    if (path.includes('refund')) return 'refund';
    if (path.includes('consent')) return 'consent';
    if (path.includes('data-collection') || path.includes('user-data')) return 'data-collection';
    if (path.includes('third-party')) return 'third-party';
    if (path.includes('privacy')) return 'privacy';
    return initialTab || 'privacy';
  };

  const [activeTab, setActiveTab] = useState<LegalTab>(getTabFromPath());
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Dynamic SEO metadata per tab
  const getTabSEO = () => {
    switch (activeTab) {
      case 'terms':
        return {
          title: 'Terms & Conditions of Compute Service',
          description: 'Master Service Agreement governing compute arbitration, dual-use restrictions, and 99.98% preemption SLA credits.',
        };
      case 'cookies':
        return {
          title: 'Cookie Policy & Storage Governance',
          description: 'Detailed inventory of essential mTLS session cookies, security tokens, and self-hosted telemetry storage.',
        };
      case 'refund':
        return {
          title: 'Refund & Preemption Credit Policy',
          description: '100% compute credit restoration for interrupted spot cycles, hardware defect refunds, and wallet withdrawals.',
        };
      case 'consent':
        return {
          title: 'Cookie & Form Consent Management',
          description: 'User permission preferences center under GDPR Art. 7 and Indian Digital Personal Data Protection Act 2023.',
        };
      case 'data-collection':
        return {
          title: 'What User Data We Collect & Retain',
          description: 'Full transparency regarding developer identity, telemetry metrics, and zero-customer-model-weight training guarantees.',
        };
      case 'third-party':
        return {
          title: 'Third-Party Embeds & Cloud Sub-Processors',
          description: 'Registry of vetted GPU cloud providers, payment gateways, and zero third-party ad network tracking policies.',
        };
      case 'privacy':
      default:
        return {
          title: 'Privacy Policy & DPDP Data Stewardship',
          description: 'Data protection standards certified under DPDP Act 2023 (India) and EU General Data Protection Regulation.',
        };
    }
  };

  const seoData = getTabSEO();

  // Consent interactive state
  const [consentPrefs, setConsentPrefs] = useState({
    necessary: true, // cannot be disabled
    telemetry: true,
    providerMetrics: true,
    productUpdates: false,
  });
  const [savedConsentAlert, setSavedConsentAlert] = useState(false);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const tabs: { id: LegalTab; label: string; path: string; tag: string }[] = [
    { id: 'privacy', label: 'Privacy Policy', path: '/privacy-policy', tag: 'DPDP & GDPR' },
    { id: 'terms', label: 'Terms & Conditions', path: '/terms', tag: 'LEGAL CONTRACT' },
    { id: 'cookies', label: 'Cookie Policy', path: '/cookie-policy', tag: 'TRACKING' },
    { id: 'refund', label: 'Refund Policy', path: '/refund-policy', tag: 'SLA CREDITS' },
    { id: 'consent', label: 'Cookie & Form Consent', path: '/cookie-consent', tag: 'CONSENT LOG' },
    { id: 'data-collection', label: 'What Data We Collect', path: '/user-data-collection', tag: 'TRANSPARENCY' },
    { id: 'third-party', label: 'Third-Party Embeds', path: '/third-party-embeds', tag: 'SUB-PROCESSORS' },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveConsent = () => {
    localStorage.setItem('kynetic_consent_preferences_v1', JSON.stringify(consentPrefs));
    setSavedConsentAlert(true);
    setTimeout(() => setSavedConsentAlert(false), 3000);
  };

  return (
    <div className="min-h-screen bg-canvas-base text-ink-primary font-body-md pt-24 pb-20">
      <SEO
        title={seoData.title}
        description={seoData.description}
      />
      {/* Top Header Banner */}
      <div className="border-b border-hairline-default bg-canvas-alternate/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3 font-label-mono text-label-mono text-ink-muted">
                <span className="px-2 py-0.5 rounded bg-surface-elevated border border-hairline-default text-accent-olive font-semibold">
                  LEGAL &amp; COMPLIANCE
                </span>
                <span>•</span>
                <span>VERSION 2.6</span>
                <span>•</span>
                <span>EFFECTIVE: OCTOBER 2026</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-ink-primary font-medium">
                  <span>🇮🇳</span> Made in India (Global Infrastructure)
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-ink-primary tracking-tight">
                Trust, Governance &amp; Compute Protocols
              </h1>
              <p className="font-body-md text-ink-muted mt-2 max-w-2xl leading-relaxed">
                Clear, transparent, and enforceable legal standards for Kynetic AI&apos;s global compute intelligence,
                autonomous GPU workload routing, and ephemeral telemetry orchestration.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-end">
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded border border-hairline-default bg-surface-elevated hover:bg-canvas-alternate font-label-mono text-label-mono text-ink-primary transition-all flex items-center gap-2 shadow-sm"
                title="Copy current document link"
              >
                <svg className="w-3.5 h-3.5 text-accent-olive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copiedLink ? 'Link Copied!' : 'Share Document'}
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded border border-hairline-default bg-surface-elevated hover:bg-canvas-alternate font-label-mono text-label-mono text-ink-primary transition-all flex items-center gap-2 shadow-sm"
                title="Print or export to PDF"
              >
                <svg className="w-3.5 h-3.5 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print PDF
              </button>
            </div>
          </div>

          {/* Quick Tab Selector Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pt-8 scrollbar-none border-t border-hairline-default mt-8">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`px-4 py-2.5 rounded text-body-sm font-medium whitespace-nowrap transition-all flex items-center gap-2.5 border ${
                    isActive
                      ? 'bg-accent-olive text-white border-accent-olive shadow-sm'
                      : 'bg-surface-elevated text-ink-muted border-hairline-default hover:text-ink-primary hover:border-hairline-strong'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`font-label-mono text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      isActive ? 'bg-white/20 text-white' : 'bg-canvas-alternate text-ink-subtle'
                    }`}
                  >
                    {tab.tag}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Sticky Index & Verification Card */}
          <div className="lg:col-span-3 space-y-6">
            <div className="p-5 rounded border border-hairline-default bg-surface-elevated shadow-sm sticky top-28 space-y-5">
              <div>
                <span className="font-label-mono text-[11px] uppercase tracking-wider text-accent-olive font-semibold">
                  DOCUMENT DIRECTORY
                </span>
                <p className="font-headline-sm text-headline-sm text-ink-primary mt-1">
                  Policy Index
                </p>
              </div>

              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className={`block px-3 py-2 rounded text-body-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-secondary-fixed/50 text-accent-olive font-semibold border-l-2 border-accent-olive'
                        : 'text-ink-muted hover:text-ink-primary hover:bg-canvas-alternate'
                    }`}
                  >
                    {tab.label}
                  </Link>
                ))}
              </nav>

              <hr className="border-hairline-subtle" />

              {/* Compliance & Regulatory Seal */}
              <div className="p-4 rounded bg-canvas-alternate/80 border border-hairline-default space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-status-healthy"></span>
                  <span className="font-label-mono text-[11px] uppercase tracking-wider text-ink-primary font-bold">
                    COMPLIANCE ATTESTATION
                  </span>
                </div>
                <p className="font-body-sm text-xs text-ink-muted leading-relaxed">
                  Kynetic AI operates in strict conformance with the <strong>Digital Personal Data Protection Act, 2023 (India)</strong>, <strong>EU General Data Protection Regulation (GDPR)</strong>, and <strong>SOC 2 Type II</strong> trust principles.
                </p>
                <div className="pt-1 flex flex-col gap-1 text-[11px] font-label-mono text-ink-subtle">
                  <span>DPO CONTACT: privacy@kynetic.ai</span>
                  <span>LEGAL SEAT: Bengaluru &amp; New Delhi, India</span>
                  <span>DATA ENCRYPTION: AES-256-GCM / TLS 1.3</span>
                </div>
              </div>

              {/* Search Within Policies */}
              <div>
                <label htmlFor="policy-search" className="block font-label-mono text-[11px] uppercase text-ink-muted mb-1.5 font-medium">
                  Filter Current Policy
                </label>
                <div className="relative">
                  <input
                    id="policy-search"
                    type="text"
                    placeholder="Search keywords (e.g., eBPF, refund, spot)..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded text-body-sm bg-canvas-base border border-hairline-default focus:border-accent-olive focus:outline-none placeholder:text-ink-subtle"
                  />
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter('')}
                      className="absolute right-2.5 top-2.5 text-xs text-ink-subtle hover:text-ink-primary"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Document Display */}
          <div className="lg:col-span-9 bg-surface-elevated border border-hairline-default rounded p-8 md:p-12 shadow-sm min-h-[800px]">
            {/* 1. PRIVACY POLICY */}
            {activeTab === 'privacy' && (
              <div className="prose prose-slate max-w-none space-y-8">
                <div className="border-b border-hairline-default pb-6">
                  <span className="font-label-mono text-label-mono text-accent-olive font-semibold tracking-wider uppercase">
                    SECTION 01 • LEGAL MASTER
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-ink-primary mt-2">
                    Privacy Policy &amp; Data Stewardship
                  </h2>
                  <p className="font-body-sm text-ink-muted mt-2">
                    Last Modified: October 24, 2026 • Effective Worldwide • Certified under DPDP Act 2023 &amp; GDPR Regulation (EU) 2016/679.
                  </p>
                </div>

                {/* Important Notice Callout */}
                <div className="p-5 rounded bg-canvas-alternate border-l-4 border-accent-olive space-y-2">
                  <h3 className="font-title-sm text-title-sm text-ink-primary font-bold">
                    Zero Customer Model &amp; Weight Training Guarantee
                  </h3>
                  <p className="font-body-sm text-ink-body leading-relaxed">
                    Kynetic AI acts as an autonomous compute intelligence and routing orchestrator. <strong>We do not inspect, retain, serialize, or train AI models on your proprietary model weights, training checkpoints, input prompts, or dataset tokens.</strong> All cluster communications execute via ephemeral, hardware-encrypted transit channels.
                  </p>
                </div>

                <div className="space-y-6 text-body-md text-ink-body leading-relaxed">
                  <div>
                    <h3 className="font-headline-sm text-ink-primary font-semibold mb-2">1. Who We Are and Data Controller Identification</h3>
                    <p>
                      Kynetic AI (&quot;Kynetic&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a high-performance compute intelligence and multi-cloud GPU orchestration platform engineered in India with globally distributed routing nodes across North America, Europe, and Asia-Pacific.
                    </p>
                    <p className="mt-2">
                      For individuals in India, Kynetic AI functions as a Data Fiduciary under the <em>Digital Personal Data Protection Act, 2023 (DPDP)</em>. For users situated in the European Economic Area (EEA), the United Kingdom, or Switzerland, Kynetic AI operates as a Data Controller in respect of user account metadata and a Data Processor in respect of cloud orchestration telemetry.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-ink-primary font-semibold mb-2">2. Information We Collect</h3>
                    <p>We restrict data collection exclusively to what is strictly necessary to route, benchmark, optimize, and bill high-performance AI compute workloads:</p>
                    <ul className="list-disc pl-6 space-y-1.5 mt-2">
                      <li><strong>Account &amp; Identity Information:</strong> Name, work email address, organization identity, authorized GitHub/Google OAuth IDs, and role (e.g., ML Systems Engineer, Infra Architect).</li>
                      <li><strong>Workload Specification Envelopes:</strong> Model architectures (e.g., Llama-3-70B, DeepSeek MoE), required tensor precision (FP8, BF16), SLA latency thresholds, target budget caps, and topology preferences (SXM5 NVLink, PCIe).</li>
                      <li><strong>Hardware Performance Telemetry (eBPF):</strong> Kernel-level GPU utilization metrics, SM clock frequencies, memory bandwidth saturation (GB/s), NVLink interconnect fabric latency, and thermal throttles.</li>
                      <li><strong>Billing &amp; Financial Metadata:</strong> Tokenized payment references managed by certified Level-1 PCI-DSS processors (Stripe, Razorpay). Raw credit card numbers never touch or rest on Kynetic AI systems.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-ink-primary font-semibold mb-2">3. Lawful Bases for Processing (GDPR &amp; DPDP 2023)</h3>
                    <p>We process personal and telemetry data pursuant to the following lawful grounds:</p>
                    <div className="overflow-x-auto mt-3">
                      <table className="w-full text-left font-body-sm border border-hairline-default">
                        <thead className="bg-canvas-alternate font-label-mono text-label-mono uppercase text-ink-primary">
                          <tr>
                            <th className="p-3 border-b border-hairline-default">Category</th>
                            <th className="p-3 border-b border-hairline-default">Purpose</th>
                            <th className="p-3 border-b border-hairline-default">Lawful Basis</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-hairline-subtle text-ink-body">
                          <tr>
                            <td className="p-3 font-medium">Workload Optimization</td>
                            <td className="p-3">Roofline modeling, spot arbitrage, cluster migration</td>
                            <td className="p-3 font-label-mono text-xs">Performance of Contract (Art 6(1)(b))</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-medium">Identity &amp; API Keys</td>
                            <td className="p-3">mTLS authentication, cluster guardrails, RBAC</td>
                            <td className="p-3 font-label-mono text-xs">Security &amp; Legal Compliance (Art 6(1)(c))</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-medium">Platform Analytics</td>
                            <td className="p-3">Self-hosted eBPF benchmarking, latency heatmaps</td>
                            <td className="p-3 font-label-mono text-xs">Legitimate Interests / Consent</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-ink-primary font-semibold mb-2">4. Your Data Subject Rights</h3>
                    <p>
                      Regardless of your geographic location, Kynetic AI honors universal developer privacy rights. You have the right to:
                    </p>
                    <ul className="list-disc pl-6 space-y-1.5 mt-2">
                      <li><strong>Access &amp; Portability:</strong> Request an automated export of your workload run logs and billing statements in JSON format.</li>
                      <li><strong>Erasure (&quot;Right to be Forgotten&quot;):</strong> Request immediate scrubbing of your identity records and associated API credentials.</li>
                      <li><strong>Grievance Redressal (India DPDP):</strong> Lodge an inquiry with our designated Grievance Officer at <code className="bg-canvas-alternate px-1.5 py-0.5 rounded text-accent-olive">grievance@kynetic.ai</code>. We respond within 48 business hours.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-ink-primary font-semibold mb-2">5. Data Retention &amp; Destruction</h3>
                    <p>
                      We adhere to strict data obsolescence schedules. Live telemetry logs are aggregated after 30 days and permanently deleted after 90 days. Ephemeral checkpoint transfer tokens are destroyed within 120 seconds of successful peer-to-peer verification between customer S3 buckets and provider clusters.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TERMS & CONDITIONS */}
            {activeTab === 'terms' && (
              <div className="prose prose-slate max-w-none space-y-8">
                <div className="border-b border-hairline-default pb-6">
                  <span className="font-label-mono text-label-mono text-accent-olive font-semibold tracking-wider uppercase">
                    SECTION 02 • BINDING AGREEMENT
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-ink-primary mt-2">
                    Terms &amp; Conditions of Service
                  </h2>
                  <p className="font-body-sm text-ink-muted mt-2">
                    Effective Date: October 2026 • Governs all compute allocations, autonomous broker dispatch, and console operations.
                  </p>
                </div>

                <div className="space-y-6 text-body-md text-ink-body leading-relaxed">
                  <div>
                    <h3 className="font-headline-sm text-ink-primary font-semibold mb-2">1. Acceptance of Master Terms</h3>
                    <p>
                      By creating an account, invoking the Kynetic Python SDK (<code className="bg-canvas-alternate px-1.5 py-0.5 rounded text-accent-olive">kynetic.Client()</code>), dispatching workloads via the CLI, or accessing the Console Dashboard, you agree to be legally bound by these Terms and Conditions. If you represent an entity, you certify you possess legal authority to bind said entity.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-ink-primary font-semibold mb-2">2. Nature of Compute Orchestration Services</h3>
                    <p>
                      Kynetic AI provides an algorithmic intelligence plane and broker middleware. We connect engineering workloads to bare-metal and containerized GPU infrastructure provided by vetted tier-1 compute vendors (including CoreWeave, RunPod, Lambda Labs, Crusoe, and hyperscalers).
                    </p>
                    <p className="mt-2">
                      Kynetic maintains active telemetry monitoring, automated preemption checkpointing, and dynamic arbitrage routing. While our autonomous scheduler targets <strong>99.98% preemption immunity</strong>, customer acknowledges that underlying third-party spot instances are subject to host hardware anomalies and provider capacity reclamation.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-ink-primary font-semibold mb-2">3. Acceptable Use Policy &amp; Dual-Use AI Restrictions</h3>
                    <p>Users may not deploy workloads through Kynetic AI for any of the following unauthorized activities:</p>
                    <ul className="list-disc pl-6 space-y-1.5 mt-2">
                      <li>Automated synthesis or design of chemical, biological, radiological, or nuclear (CBRN) weapons or hazardous pathogens.</li>
                      <li>Generation, distribution, or facilitation of Child Sexual Abuse Material (CSAM).</li>
                      <li>Cryptocurrency mining on subsidized spot tiers or unauthorized distributed denial-of-service (DDoS) infrastructure.</li>
                      <li>Violating international export control regulations (including US EAR and Indian SCOMET export controls).</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-ink-primary font-semibold mb-2">4. Fees, Billing &amp; Dynamic Hourly Arbitrage</h3>
                    <p>
                      Compute charges accrue on a per-second or per-hour basis based on the prevailing spot market or reserved rates displayed in the Workload Planner. Pre-paid balance deductions occur dynamically as nodes execute runs. You are responsible for all incurred compute fees resulting from jobs triggered via your authenticated API keys.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-ink-primary font-semibold mb-2">5. Governing Law &amp; Dispute Resolution</h3>
                    <p>
                      These Terms are governed by and construed in accordance with the laws of <strong>India</strong>, without regard to conflict of laws principles. Any unresolved disputes arising hereunder shall be finally resolved through binding arbitration administered in New Delhi, India, in accordance with the <em>Arbitration and Conciliation Act, 1996</em>, conducted in the English language before a sole arbitrator.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. COOKIE POLICY */}
            {activeTab === 'cookies' && (
              <div className="prose prose-slate max-w-none space-y-8">
                <div className="border-b border-hairline-default pb-6">
                  <span className="font-label-mono text-label-mono text-accent-olive font-semibold tracking-wider uppercase">
                    SECTION 03 • BROWSER STORAGE
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-ink-primary mt-2">
                    Cookie &amp; Local Storage Policy
                  </h2>
                  <p className="font-body-sm text-ink-muted mt-2">
                    Published: October 2026 • Strict compliance with ePrivacy Directive and Indian Digital Personal Data Protection standards.
                  </p>
                </div>

                <div className="space-y-6 text-body-md text-ink-body leading-relaxed">
                  <p>
                    Kynetic AI employs minimalist, privacy-first cookies and browser storage technologies. <strong>We do not deploy third-party advertising cookies, cross-site trackers, or data-broker pixels.</strong> Every cookie serves a concrete operational necessity.
                  </p>

                  <div>
                    <h3 className="font-headline-sm text-ink-primary font-semibold mb-3">Detailed Cookie Inventory</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-body-sm border border-hairline-default">
                        <thead className="bg-canvas-alternate font-label-mono text-label-mono uppercase text-ink-primary">
                          <tr>
                            <th className="p-3 border-b border-hairline-default">Cookie Name</th>
                            <th className="p-3 border-b border-hairline-default">Type</th>
                            <th className="p-3 border-b border-hairline-default">Duration</th>
                            <th className="p-3 border-b border-hairline-default">Purpose</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-hairline-subtle text-ink-body">
                          <tr>
                            <td className="p-3 font-mono text-xs font-semibold text-accent-olive">__kynetic_session</td>
                            <td className="p-3">Strictly Necessary</td>
                            <td className="p-3">Session</td>
                            <td className="p-3">Secures mTLS session token and validates authenticated cluster routing requests.</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-mono text-xs font-semibold text-accent-olive">__kynetic_csrf</td>
                            <td className="p-3">Strictly Necessary</td>
                            <td className="p-3">Session</td>
                            <td className="p-3">Cryptographic anti-CSRF token preventing cross-origin execution exploits.</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-mono text-xs font-semibold text-accent-olive">kn_dash_prefs</td>
                            <td className="p-3">Functional</td>
                            <td className="p-3">1 Year</td>
                            <td className="p-3">Saves UI state, topology view presets (SXM5 vs PCIe), and theme preferences.</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-mono text-xs font-semibold text-accent-olive">ph_kynetic_telemetry</td>
                            <td className="p-3">Analytics (Self-hosted)</td>
                            <td className="p-3">30 Days</td>
                            <td className="p-3">First-party error monitoring and latency performance diagnostics via self-hosted PostHog.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-ink-primary font-semibold mb-2">How to Manage and Revoke Cookies</h3>
                    <p>
                      You can modify your consent at any time directly on our <Link to="/cookie-consent" className="text-accent-olive underline font-medium">Cookie &amp; Form Consent Page</Link>. Furthermore, all modern web browsers permit you to block or delete cookies via your browser settings menu.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. REFUND POLICY */}
            {activeTab === 'refund' && (
              <div className="prose prose-slate max-w-none space-y-8">
                <div className="border-b border-hairline-default pb-6">
                  <span className="font-label-mono text-label-mono text-accent-olive font-semibold tracking-wider uppercase">
                    SECTION 04 • FINANCIAL TRANSPARENCY
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-ink-primary mt-2">
                    Refund &amp; Preemption Credit Policy
                  </h2>
                  <p className="font-body-sm text-ink-muted mt-2">
                    Updated: October 2026 • Covers GPU cluster reservations, spot preemption credits, and SLA guarantees.
                  </p>
                </div>

                <div className="space-y-6 text-body-md text-ink-body leading-relaxed">
                  <div className="p-5 rounded bg-canvas-alternate border-l-4 border-status-healthy space-y-2">
                    <h3 className="font-title-sm text-title-sm text-ink-primary font-bold">
                      Automated Preemption Failure Protection
                    </h3>
                    <p className="font-body-sm text-ink-body leading-relaxed">
                      If an underlying cloud provider abruptly interrupts a spot GPU cluster without granting the required 30-second ACPI shutdown notice—causing an unrecoverable run failure—<strong>100% of compute credits burned during that interrupted cycle are automatically restored to your wallet</strong>.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-ink-primary font-semibold mb-2">1. Wallet Compute Credits vs. Gateway Currency</h3>
                    <p>
                      Kynetic AI accounts operate using USD or INR denominated compute balances. When you deposit funds via Stripe or Razorpay, funds are converted into active orchestrator credits available for real-time GPU auction allocation.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-ink-primary font-semibold mb-2">2. Hardware Defect &amp; Silent GPU Failure Refunds</h3>
                    <p>
                      If a provisioned GPU node suffers a hardware defect (e.g., persistent PCIe bus drop, uncorrectable ECC memory error, thermal throttling below 60% base clock) within the first 15 minutes of job initialization, our eBPF daemon flags the node and refunds the full allocation cost immediately upon verification.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-ink-primary font-semibold mb-2">3. Unused Prepaid Balance Refunds</h3>
                    <p>
                      Customers may request a complete cash refund of any <strong>unspent prepaid wallet balances</strong> within 30 calendar days of deposit. Refunds will be credited back to the original funding payment method (credit card, bank account, or wire) less any non-refundable card gateway processing fees incurred (typically 2.9% + $0.30).
                    </p>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-ink-primary font-semibold mb-2">4. Requesting an Audit or Dispute</h3>
                    <p>
                      To request a manual billing review, open a ticket from your Console Dashboard or email <code className="bg-canvas-alternate px-1.5 py-0.5 rounded text-accent-olive">billing@kynetic.ai</code> with your Plan Run ID. Our financial operations team conducts telemetry traces within 24 business hours.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. COOKIE & FORM CONSENT */}
            {activeTab === 'consent' && (
              <div className="prose prose-slate max-w-none space-y-8">
                <div className="border-b border-hairline-default pb-6">
                  <span className="font-label-mono text-label-mono text-accent-olive font-semibold tracking-wider uppercase">
                    SECTION 05 • PERMISSIONS MANAGEMENT
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-ink-primary mt-2">
                    Cookie &amp; Form Consent Preferences
                  </h2>
                  <p className="font-body-sm text-ink-muted mt-2">
                    Interactive preference center • Real-time permission revocation under GDPR Art. 7 and DPDP Act 2023 Sec. 6.
                  </p>
                </div>

                {savedConsentAlert && (
                  <div className="p-4 rounded bg-secondary-fixed/50 border border-status-healthy text-accent-olive flex items-center gap-3">
                    <svg className="w-5 h-5 text-accent-olive flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-body-sm font-medium">
                      Consent preferences updated and synchronized across all active browser sessions.
                    </span>
                  </div>
                )}

                <div className="space-y-6 text-body-md text-ink-body leading-relaxed">
                  <p>
                    Control how Kynetic AI handles browser storage tokens and interactive submission forms (such as Early Access onboarding, Workload Planner simulations, and API credential generation).
                  </p>

                  <div className="space-y-4 border border-hairline-default rounded p-6 bg-canvas-alternate/40">
                    {/* Item 1 */}
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-hairline-subtle">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-title-sm text-ink-primary font-bold">Strictly Necessary Cookies</span>
                          <span className="font-label-mono text-[10px] bg-ink-primary text-white px-2 py-0.5 rounded">REQUIRED</span>
                        </div>
                        <p className="font-body-sm text-ink-muted mt-1">
                          Crucial for TLS session authorization, CSRF protection, and real-time WebSocket broker streaming. Cannot be disabled.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={consentPrefs.necessary}
                        disabled
                        className="mt-1 h-4 w-4 rounded accent-accent-olive cursor-not-allowed"
                      />
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-hairline-subtle">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-title-sm text-ink-primary font-bold">Kernel eBPF Telemetry &amp; Performance</span>
                          <span className="font-label-mono text-[10px] bg-secondary-fixed text-accent-olive px-2 py-0.5 rounded">RECOMMENDED</span>
                        </div>
                        <p className="font-body-sm text-ink-muted mt-1">
                          Enables anonymous kernel telemetry collection (GPU temperature, memory throughput, latency) to improve spot arbitrage algorithms.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={consentPrefs.telemetry}
                        onChange={(e) => setConsentPrefs({ ...consentPrefs, telemetry: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded accent-accent-olive cursor-pointer"
                      />
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-hairline-subtle">
                      <div>
                        <span className="font-title-sm text-ink-primary font-bold">Multi-Cloud Provider Benchmarking</span>
                        <p className="font-body-sm text-ink-muted mt-1">
                          Allows benchmarking queries against live provider APIs (RunPod, Lambda, CoreWeave) to display real-time pricing on your dashboard.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={consentPrefs.providerMetrics}
                        onChange={(e) => setConsentPrefs({ ...consentPrefs, providerMetrics: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded accent-accent-olive cursor-pointer"
                      />
                    </div>

                    {/* Item 4 */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="font-title-sm text-ink-primary font-bold">Product Announcements &amp; GPU Batch Drop Alerts</span>
                        <p className="font-body-sm text-ink-muted mt-1">
                          Receive technical release notes and alerts when reserved clusters (B200 / H200) become available at discounted spot prices.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={consentPrefs.productUpdates}
                        onChange={(e) => setConsentPrefs({ ...consentPrefs, productUpdates: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded accent-accent-olive cursor-pointer"
                      />
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={handleSaveConsent}
                        className="px-6 py-2.5 rounded bg-accent-olive text-white font-label-mono text-label-mono uppercase tracking-wider hover:bg-accent-olive-deep transition-all shadow-sm"
                      >
                        Save Preferences
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-ink-primary font-semibold mb-2">Form Data Submission Policy</h3>
                    <p>
                      Whenever you submit a web form on <code className="bg-canvas-alternate px-1.5 py-0.5 rounded text-accent-olive">kynetic.ai</code> (including Early Access onboarding, Contact sales, or Workload Architect requests), your contact email, organization name, and workload specifications are encrypted and routed directly to our private CRM and database. We never license, sell, or rent submitted form data to third-party marketing brokers.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 6. WHAT USER DATA WE COLLECT */}
            {activeTab === 'data-collection' && (
              <div className="prose prose-slate max-w-none space-y-8">
                <div className="border-b border-hairline-default pb-6">
                  <span className="font-label-mono text-label-mono text-accent-olive font-semibold tracking-wider uppercase">
                    SECTION 06 • GRANULAR TRANSPARENCY
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-ink-primary mt-2">
                    What User Data We Collect &amp; Process
                  </h2>
                  <p className="font-body-sm text-ink-muted mt-2">
                    Comprehensive technical inventory of data schemas, transit lifecycles, and cryptographic isolation.
                  </p>
                </div>

                <div className="space-y-6 text-body-md text-ink-body leading-relaxed">
                  <p>
                    Engineers and enterprise ML leaders deserve complete visibility into how compute intelligence software handles their technical environment. Below is the exact inventory of every telemetry field collected by Kynetic AI:
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-body-sm border border-hairline-default">
                      <thead className="bg-canvas-alternate font-label-mono text-label-mono uppercase text-ink-primary">
                        <tr>
                          <th className="p-3 border-b border-hairline-default">Data Vector</th>
                          <th className="p-3 border-b border-hairline-default">Exact Fields Collected</th>
                          <th className="p-3 border-b border-hairline-default">Storage Duration</th>
                          <th className="p-3 border-b border-hairline-default">Encryption</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hairline-subtle text-ink-body">
                        <tr>
                          <td className="p-3 font-semibold text-ink-primary">1. Developer Identity</td>
                          <td className="p-3">Work email, name, hashed password (Argon2id), GitHub OAuth subject UID.</td>
                          <td className="p-3 font-label-mono text-xs">Account Lifetime</td>
                          <td className="p-3 font-label-mono text-xs text-status-healthy">AES-256 at rest</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-ink-primary">2. Model Metadata</td>
                          <td className="p-3">Model class (e.g., Llama-3-70B), parameter count, sequence context length.</td>
                          <td className="p-3 font-label-mono text-xs">Run duration + 90d</td>
                          <td className="p-3 font-label-mono text-xs text-status-healthy">Encrypted DB</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-ink-primary">3. Model Weights &amp; Tensors</td>
                          <td className="p-3 font-medium text-status-healthy">ZERO. No customer weights or dataset tokens are ever read, captured, or stored.</td>
                          <td className="p-3 font-label-mono text-xs text-status-healthy">0 Days (None)</td>
                          <td className="p-3 font-label-mono text-xs text-status-healthy">Direct Cloud NVMe</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-ink-primary">4. Hardware eBPF Telemetry</td>
                          <td className="p-3">SM clock rates, VRAM allocation (GB), PCIe/NVLink bus saturation, thermal sensors.</td>
                          <td className="p-3 font-label-mono text-xs">30 Days (Rolling)</td>
                          <td className="p-3 font-label-mono text-xs text-status-healthy">Encrypted Timeseries</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-ink-primary">5. Billing &amp; Invoices</td>
                          <td className="p-3">Billing organization, tax ID (GST/VAT), currency, tokenized Stripe/Razorpay IDs.</td>
                          <td className="p-3 font-label-mono text-xs">7 Years (Statutory)</td>
                          <td className="p-3 font-label-mono text-xs text-status-healthy">PCI-DSS Compliant</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-ink-primary font-semibold mb-2">Automated Data Deletion Protocol</h3>
                    <p>
                      When you delete an execution run or terminate your organization account, our cryptographic keys for your tenant are invalidated, rendering historic telemetry undecryptable across all backup replicas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. THIRD PARTY EMBEDS & SUB-PROCESSORS */}
            {activeTab === 'third-party' && (
              <div className="prose prose-slate max-w-none space-y-8">
                <div className="border-b border-hairline-default pb-6">
                  <span className="font-label-mono text-label-mono text-accent-olive font-semibold tracking-wider uppercase">
                    SECTION 07 • VENDOR GOVERNANCE
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-ink-primary mt-2">
                    Third-Party Embeds &amp; Sub-Processors
                  </h2>
                  <p className="font-body-sm text-ink-muted mt-2">
                    Public registry of all infrastructure partners, payment processors, and telemetry services.
                  </p>
                </div>

                <div className="space-y-6 text-body-md text-ink-body leading-relaxed">
                  <p>
                    Kynetic AI partners with certified cloud infrastructure providers and compliance-grade software vendors to deliver globally resilient GPU orchestration. Every sub-processor undergoes rigorous vendor security assessments:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Partner 1 */}
                    <div className="p-4 rounded border border-hairline-default bg-canvas-alternate/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-title-sm text-ink-primary font-bold">CoreWeave, Inc.</span>
                        <span className="font-label-mono text-[10px] bg-surface-elevated px-2 py-0.5 rounded border border-hairline-default">USA</span>
                      </div>
                      <p className="font-body-sm text-ink-muted text-xs">
                        High-density NVIDIA HGX H100 and H200 bare-metal cluster provisioning and InfiniBand fabric hosting.
                      </p>
                    </div>

                    {/* Partner 2 */}
                    <div className="p-4 rounded border border-hairline-default bg-canvas-alternate/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-title-sm text-ink-primary font-bold">RunPod, Inc.</span>
                        <span className="font-label-mono text-[10px] bg-surface-elevated px-2 py-0.5 rounded border border-hairline-default">USA</span>
                      </div>
                      <p className="font-body-sm text-ink-muted text-xs">
                        Serverless and dynamic spot GPU cluster execution for burst inference and containerized fine-tuning.
                      </p>
                    </div>

                    {/* Partner 3 */}
                    <div className="p-4 rounded border border-hairline-default bg-canvas-alternate/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-title-sm text-ink-primary font-bold">Lambda Labs, Inc.</span>
                        <span className="font-label-mono text-[10px] bg-surface-elevated px-2 py-0.5 rounded border border-hairline-default">USA</span>
                      </div>
                      <p className="font-body-sm text-ink-muted text-xs">
                        On-demand GPU cloud instances and reserved SXM5 topologies for distributed training workloads.
                      </p>
                    </div>

                    {/* Partner 4 */}
                    <div className="p-4 rounded border border-hairline-default bg-canvas-alternate/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-title-sm text-ink-primary font-bold">Crusoe Energy Systems</span>
                        <span className="font-label-mono text-[10px] bg-surface-elevated px-2 py-0.5 rounded border border-hairline-default">USA</span>
                      </div>
                      <p className="font-body-sm text-ink-muted text-xs">
                        Zero-carbon climate-aligned GPU infrastructure powered by stranded renewable energy.
                      </p>
                    </div>

                    {/* Partner 5 */}
                    <div className="p-4 rounded border border-hairline-default bg-canvas-alternate/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-title-sm text-ink-primary font-bold">Stripe, Inc.</span>
                        <span className="font-label-mono text-[10px] bg-surface-elevated px-2 py-0.5 rounded border border-hairline-default">GLOBAL</span>
                      </div>
                      <p className="font-body-sm text-ink-muted text-xs">
                        PCI-DSS Level 1 payment gateway processing for international credit card and ACH automated clearinghouse deposits.
                      </p>
                    </div>

                    {/* Partner 6 */}
                    <div className="p-4 rounded border border-hairline-default bg-canvas-alternate/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-title-sm text-ink-primary font-bold">Razorpay Software Pvt. Ltd.</span>
                        <span className="font-label-mono text-[10px] bg-surface-elevated px-2 py-0.5 rounded border border-hairline-default">INDIA</span>
                      </div>
                      <p className="font-body-sm text-ink-muted text-xs">
                        Reserve Bank of India (RBI) authorized payment aggregator for domestic INR UPI, Net Banking, and corporate cards.
                      </p>
                    </div>

                    {/* Partner 7 */}
                    <div className="p-4 rounded border border-hairline-default bg-canvas-alternate/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-title-sm text-ink-primary font-bold">Cloudflare, Inc.</span>
                        <span className="font-label-mono text-[10px] bg-surface-elevated px-2 py-0.5 rounded border border-hairline-default">GLOBAL</span>
                      </div>
                      <p className="font-body-sm text-ink-muted text-xs">
                        DDoS edge protection, TLS 1.3 termination, and DNS integrity routing.
                      </p>
                    </div>

                    {/* Partner 8 */}
                    <div className="p-4 rounded border border-hairline-default bg-canvas-alternate/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-title-sm text-ink-primary font-bold">PostHog (Self-Hosted)</span>
                        <span className="font-label-mono text-[10px] bg-surface-elevated px-2 py-0.5 rounded border border-hairline-default">INTERNAL</span>
                      </div>
                      <p className="font-body-sm text-ink-muted text-xs">
                        Privacy-first product telemetry hosted directly on private Kynetic infrastructure. Zero third-party tracking.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-ink-primary font-semibold mb-2">Content Security Policy (CSP) Guarantee</h3>
                    <p>
                      Kynetic enforces a rigorous Content Security Policy restricting runtime script executions. No third-party ad networks, social trackers, or unauthorized analytics scripts can inject code into authenticated console workspaces.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

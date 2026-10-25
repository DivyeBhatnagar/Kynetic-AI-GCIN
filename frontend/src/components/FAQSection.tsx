import React, { useState } from 'react';

interface FAQItem {
  id: string;
  question: string;
  category: string;
  answer: string | React.ReactNode;
}

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      category: 'ARCHITECTURE & ORCHESTRATION',
      question: 'How does Kynetic AI differ from traditional cloud aggregators or static GPU listings?',
      answer:
        'Traditional aggregators are passive brokers that merely list available virtual machines with static pricing tables. Kynetic AI is an autonomous intelligence layer. We profile your actual workload execution profile using Roofline algorithmic modeling, monitor live cluster memory saturation via eBPF kernel daemons, and dynamically arbitrate between spot and on-demand instances across tier-1 providers (CoreWeave, Lambda, RunPod, Crusoe) in real-time.',
    },
    {
      id: 'faq-2',
      category: 'DATA PRIVACY & MODEL SECURITY',
      question: 'Are our proprietary model weights, training checkpoints, or dataset tokens ever stored or trained on?',
      answer:
        'Zero customer data retention. Kynetic AI never inspects, caches, serializes, or trains AI models on your weights, prompts, or dataset tokens. Compute nodes communicate directly with your own private S3/GCS buckets over hardware-encrypted mTLS tunnels. Telemetry collected by Kynetic is restricted strictly to anonymous kernel performance vectors (SM clock speeds, thermal sensors, and memory throughput GB/s).',
    },
    {
      id: 'faq-3',
      category: 'RELIABILITY & SPOT RECOVERY',
      question: 'How does the 99.98% preemption immunity mechanism work on spot GPU clusters?',
      answer:
        'When spot instances are reclaimed by a cloud provider, standard workloads crash and lose hours of training state. Kynetic intercepts host ACPI shutdown warnings, initiates sub-second delta-weight checkpointing into distributed NVMe memory caches, and autonomously spins up an equivalent standby node on an alternative provider in under 30 seconds—resuming training without developer intervention.',
    },
    {
      id: 'faq-4',
      category: 'HARDWARE & TOPOLOGIES',
      question: 'Which GPU architectures and cluster interconnect topologies are supported?',
      answer:
        'We support all modern enterprise AI accelerators: NVIDIA Blackwell B200, Hopper H200 and H100 (both SXM5 80GB and PCIe variants), Ampere A100 (80GB/40GB), L40S, and AMD Instinct MI300X. Supported interconnect fabrics include 3.2 Tbps NVIDIA Quantum-2 InfiniBand, NVLink-4, and ultra-low-latency RoCE v2 multi-node networks.',
    },
    {
      id: 'faq-5',
      category: 'BILLING & ARBITRAGE',
      question: 'How does dynamic arbitrage and billing work across different cloud providers?',
      answer:
        'Billing is consolidated into a single unified Kynetic statement in USD or INR. You pay standard spot or reserved market rates per second without provider lock-in. Our arbitrage broker constantly computes effective cost-per-token curves, capturing spot price drops of 30% to 75% while safeguarding your execution deadlines.',
    },
    {
      id: 'faq-6',
      category: 'INTEGRATION & DEVELOPER EXPERIENCE',
      question: 'How quickly can our team integrate Kynetic AI into our existing PyTorch / Slurm pipeline?',
      answer:
        'Integration requires zero rewriting of your training loops. You can either use our lightweight Python SDK (import kynetic as kn) with two lines of envelope declarations, or wrap existing Docker containers using our CLI command (kn run dispatch --auto-resume). Full integration typically takes under 10 minutes.',
    },
  ];

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section
      id="faq"
      className="py-20 border-t border-hairline-default bg-canvas-base scroll-mt-20"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="flex items-center justify-center gap-2 font-label-mono text-label-mono text-accent-olive font-semibold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-olive"></span>
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-ink-primary tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="font-body-md text-ink-muted leading-relaxed">
            Everything you need to know about autonomous compute routing, preemption immunity, multi-cloud GPU arbitrage, and model data isolation.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
                className={`rounded border transition-all duration-200 ${
                  isOpen
                    ? 'border-accent-olive/60 bg-surface-elevated shadow-sm'
                    : 'border-hairline-default bg-canvas-alternate/40 hover:border-hairline-strong'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-5 md:p-6 flex items-start justify-between gap-4 focus:outline-none"
                >
                  <div className="space-y-1">
                    <span className="font-label-mono text-[10px] text-accent-olive font-semibold tracking-wider uppercase">
                      {faq.category}
                    </span>
                    <h3
                      itemProp="name"
                      className="font-title-sm md:font-title-md text-ink-primary font-medium tracking-tight"
                    >
                      {faq.question}
                    </h3>
                  </div>
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-1 transition-transform duration-200 border ${
                      isOpen
                        ? 'rotate-180 bg-accent-olive text-white border-accent-olive'
                        : 'bg-surface-elevated text-ink-muted border-hairline-default'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                    className="px-5 pb-6 md:px-6 md:pb-6 pt-0 border-t border-hairline-subtle"
                  >
                    <div
                      itemProp="text"
                      className="text-body-md text-ink-body leading-relaxed pt-4 font-body-md"
                    >
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Support Banner */}
        <div className="mt-12 p-6 rounded border border-hairline-default bg-canvas-alternate/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="font-title-sm text-ink-primary font-semibold">
              Have specific cluster or network latency requirements?
            </h4>
            <p className="text-body-sm text-ink-muted mt-0.5">
              Our infrastructure architects can review your custom training envelope.
            </p>
          </div>
          <a
            href="mailto:infra@kynetic.ai"
            className="px-5 py-2 rounded bg-surface-elevated border border-hairline-default hover:bg-white text-ink-primary font-label-mono text-label-mono uppercase tracking-wider transition-all whitespace-nowrap shadow-sm"
          >
            Speak to an Architect
          </a>
        </div>
      </div>
    </section>
  );
};

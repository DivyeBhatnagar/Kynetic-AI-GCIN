import React, { useState } from 'react';

interface EarlyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EarlyAccessModal: React.FC<EarlyAccessModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    org: '',
    handle: '',
    gpuScale: '16-64',
    workloads: ['Distributed Pre-training', 'High-Throughput Inference / vLLM'],
    bottleneck: 'Spot preemption & lost checkpoints',
    spendTier: 'tier2',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const toggleWorkload = (wl: string) => {
    setFormData((prev) => ({
      ...prev,
      workloads: prev.workloads.includes(wl)
        ? prev.workloads.filter((item) => item !== wl)
        : [...prev.workloads, wl],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-primary/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-elevated border border-hairline-default rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 md:p-8 animate-in fade-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-ink-muted hover:text-ink-primary p-1 rounded-full border border-hairline-subtle hover:bg-canvas-alternate transition-colors"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {submitted ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container border border-secondary-fixed text-accent-olive-deep flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[24px]">check</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-ink-primary">
              Application Received
            </h3>
            <p className="font-body-md text-ink-muted max-w-md mx-auto">
              We have queued your cohort request. An engineering lead will review your cluster spec
              and reply within 24 hours.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="mt-4 px-6 py-2 bg-ink-primary text-canvas-base rounded-full font-label-mono text-label-mono font-medium hover:bg-accent-olive-deep"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-status-healthy animate-pulse"></span>
              <span className="text-label-mono font-label-mono text-ink-muted uppercase">
                COHORT 04 ADMISSION
              </span>
            </div>
            <h2 className="text-headline-sm font-headline-sm text-ink-primary mb-1">
              Request Early Access
            </h2>
            <p className="text-body-sm font-body-sm text-ink-muted mb-6">
              Tailored compute concierge and non-blocking GPU scheduling for machine learning teams.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-label-mono font-label-mono text-ink-primary mb-1">
                  Work Email <span className="text-accent-olive">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@frontier-research.ai"
                  className="w-full h-10 px-3.5 bg-canvas-base border border-hairline-default rounded text-ink-primary text-body-sm focus:border-accent-olive outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-mono font-label-mono text-ink-primary mb-1">
                    Organization <span className="text-accent-olive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.org}
                    onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                    placeholder="Synthetix Labs Inc."
                    className="w-full h-10 px-3.5 bg-canvas-base border border-hairline-default rounded text-ink-primary text-body-sm focus:border-accent-olive outline-none"
                  />
                </div>
                <div>
                  <label className="block text-label-mono font-label-mono text-ink-primary mb-1">
                    GitHub / Hugging Face Handle
                  </label>
                  <input
                    type="text"
                    value={formData.handle}
                    onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                    placeholder="org-or-lead-eng"
                    className="w-full h-10 px-3.5 bg-canvas-base border border-hairline-default rounded text-ink-primary text-body-sm focus:border-accent-olive outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-mono font-label-mono text-ink-primary mb-2">
                  Current GPU Scale
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-body-sm">
                  {['< 16 GPUs', '16 – 64 GPUs', '64 – 256 GPUs', '256+ Cluster'].map((tier) => (
                    <button
                      type="button"
                      key={tier}
                      onClick={() => setFormData({ ...formData, gpuScale: tier })}
                      className={`h-9 flex items-center justify-center border rounded text-body-sm font-body-sm transition-all ${
                        formData.gpuScale === tier
                          ? 'bg-secondary-container border-accent-olive text-accent-olive-deep font-medium'
                          : 'border-hairline-default bg-canvas-base text-ink-body hover:border-hairline-strong'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-label-mono font-label-mono text-ink-primary mb-2">
                  Primary Workloads
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Distributed Pre-training',
                    'Fine-Tuning / LoRA (7B–70B+)',
                    'High-Throughput Inference / vLLM',
                    'Synthetic Data Generation',
                    'Batch RL (RLHF/DPO)',
                  ].map((wl) => {
                    const isSelected = formData.workloads.includes(wl);
                    return (
                      <button
                        type="button"
                        key={wl}
                        onClick={() => toggleWorkload(wl)}
                        className={`px-3 py-1 rounded-full text-xs font-body-sm border transition-all ${
                          isSelected
                            ? 'border-accent-olive bg-secondary-container text-accent-olive-deep font-medium'
                            : 'border-hairline-default bg-canvas-alternate text-ink-body hover:border-hairline-strong'
                        }`}
                      >
                        {wl}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-label-mono font-label-mono text-ink-primary mb-1">
                  Primary Bottleneck
                </label>
                <select
                  value={formData.bottleneck}
                  onChange={(e) => setFormData({ ...formData, bottleneck: e.target.value })}
                  className="w-full h-10 px-3.5 bg-canvas-base border border-hairline-default rounded text-ink-primary text-body-sm focus:border-accent-olive outline-none"
                >
                  <option>Spot preemption &amp; lost checkpoints</option>
                  <option>Fragmented provider billing &amp; quotes</option>
                  <option>GPU availability / multi-week wait times</option>
                  <option>High cross-region egress costs</option>
                  <option>Lack of automated multi-cloud fallback</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-11 rounded-full bg-ink-primary text-surface-elevated text-label-mono font-label-mono hover:bg-accent-olive-deep transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <span>Submit Early Access Application</span>
                  <span className="text-xs">↗</span>
                </button>
                <p className="text-center font-label-tag text-ink-subtle text-xs mt-3">
                  Zero data ingress · Weights remain inside your VPC · SOC2 Type II Certified
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

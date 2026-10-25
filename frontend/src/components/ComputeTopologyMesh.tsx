import React, { useState } from 'react';

export const ComputeTopologyMesh: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string>('node-b');

  const nodes = [
    {
      id: 'node-a',
      name: 'NVIDIA H100 SXM5',
      provider: 'CoreWeave US-East',
      interconnect: '3.2 Tbps Quantum-2 IB',
      vram: '80 GB HBM3',
      efficiency: '98.9%',
      status: 'Active · Standby',
      isOptimal: false,
      color: '#59664D',
    },
    {
      id: 'node-b',
      name: '8x NVIDIA L40S Ada',
      provider: 'RunPod EU-West',
      interconnect: '400 Gbps RoCE v2',
      vram: '384 GB GDDR6',
      efficiency: '99.4%',
      status: 'Target Candidate · Dispatching',
      isOptimal: true,
      color: '#84A96C',
    },
    {
      id: 'node-c',
      name: 'NVIDIA A100 SXM4',
      provider: 'Lambda Labs US-TX',
      interconnect: 'NVLink 600 GB/s',
      vram: '80 GB HBM2e',
      efficiency: '91.5%',
      status: 'Active · Preemptible',
      isOptimal: false,
      color: '#59664D',
    },
    {
      id: 'node-d',
      name: 'NVIDIA GH200 Grace Hopper',
      provider: 'Crusoe Cloud ND',
      interconnect: '900 GB/s NVLink-C2C',
      vram: '576 GB Coherent',
      efficiency: '97.4%',
      status: 'Standby · Clean Gas',
      isOptimal: false,
      color: '#59664D',
    },
  ];

  return (
    <div className="w-full mb-6">
      <div className="rounded-t-lg border border-hairline-default border-b-0 bg-surface-elevated/70 backdrop-blur-xs p-5 md:p-6 overflow-hidden relative">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#191919 1px, transparent 1px), linear-gradient(90deg, #191919 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Header Telemetry Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-hairline-subtle gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-status-healthy animate-pulse"></span>
            <span className="font-label-mono text-label-mono uppercase tracking-wider text-ink-primary font-semibold text-[11px] sm:text-[12px]">
              AUTONOMOUS COMPUTE TOPOLOGY MESH
            </span>
            <span className="text-hairline-strong font-label-mono hidden md:inline">|</span>
            <span className="font-label-mono text-label-mono text-ink-muted text-[11px] hidden md:inline">
              LIVE 20Hz eBPF HARDWARE ROUTING
            </span>
          </div>

          <div className="flex items-center gap-4 text-label-tag font-mono text-ink-muted text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-olive"></span>
              Jitter: ±0.08ms
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
              Mesh Saturation: 94.2%
            </span>
            <span className="hidden lg:inline text-ink-subtle">
              OOM Guard: 100% Active
            </span>
          </div>
        </div>

        {/* Interactive Routing Flow Visualizer */}
        <div className="pt-6 relative z-10">
          {/* Top Ingestion Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-3.5 bg-canvas-base border border-hairline-default rounded-md">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="w-7 h-7 rounded bg-secondary-container flex items-center justify-center text-accent-olive font-mono text-[11px] font-bold">
                01
              </span>
              <div>
                <span className="text-label-mono text-ink-subtle uppercase text-[10px] block">
                  WORKLOAD INGESTION VECTOR
                </span>
                <span className="font-mono text-body-sm font-medium text-ink-primary">
                  Llama-3-7B · FP16 · 4,096 Tokens · Target: &lt;8.0h · Budget: $50
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-label-mono text-[11px] text-ink-muted shrink-0 w-full md:w-auto justify-end">
              <span className="px-2 py-0.5 rounded bg-canvas-alternate border border-hairline-subtle text-ink-body">
                Memory Floor: 24.2 GB
              </span>
              <span className="px-2 py-0.5 rounded bg-secondary-container border border-secondary-fixed text-accent-olive font-medium">
                Tensor Intensity: 138.4 FLOP/B
              </span>
            </div>
          </div>

          {/* Center Dynamic SVG Technical Paths */}
          <div className="relative py-4 hidden md:block">
            <svg
              className="w-full h-16"
              viewBox="0 0 1000 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              {/* Node A route */}
              <path
                d="M500 0 C500 24, 125 24, 125 64"
                stroke="#DEDDD5"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {/* Node B optimal active route (pulsing Olive Green) */}
              <path
                d="M500 0 C500 24, 375 24, 375 64"
                stroke="#59664D"
                strokeWidth="2.5"
                className="animate-data-flow"
              />
              {/* Node C route */}
              <path
                d="M500 0 C500 24, 625 24, 625 64"
                stroke="#DEDDD5"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {/* Node D route */}
              <path
                d="M500 0 C500 24, 875 24, 875 64"
                stroke="#DEDDD5"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Central Routing Core Badge */}
              <circle cx="500" cy="0" r="5" fill="#59664D" />
              <circle cx="500" cy="0" r="8" stroke="#84A96C" strokeWidth="1.5" opacity="0.6" />
              <circle cx="375" cy="64" r="4.5" fill="#84A96C" className="animate-pulse" />
            </svg>
          </div>

          {/* 4 Multi-Provider GPU Nodes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-2">
            {nodes.map((node) => {
              const isSelected = activeNode === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setActiveNode(node.id)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                    node.isOptimal
                      ? 'bg-secondary-container/40 border-accent-olive shadow-xs'
                      : isSelected
                      ? 'bg-surface-elevated border-ink-primary shadow-xs'
                      : 'bg-surface-elevated border-hairline-default hover:border-hairline-strong'
                  }`}
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label-mono text-ink-subtle uppercase text-[10px]">
                      {node.provider}
                    </span>
                    {node.isOptimal ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-accent-olive text-canvas-base font-label-mono text-[9px] font-bold tracking-wide">
                        RECOMMENDED
                      </span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-ink-subtle"></span>
                    )}
                  </div>

                  <div className="font-headline-sm text-[13px] font-semibold text-ink-primary mb-1">
                    {node.name}
                  </div>

                  <div className="text-[11px] font-mono text-ink-muted space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-ink-subtle">VRAM:</span>
                      <span className="text-ink-body font-medium">{node.vram}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-subtle">Fabric:</span>
                      <span className="text-ink-body truncate max-w-[120px]">{node.interconnect}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-hairline-subtle">
                      <span className="text-ink-subtle">Roofline Fit:</span>
                      <span
                        className={`font-semibold ${
                          node.isOptimal ? 'text-accent-olive' : 'text-ink-primary'
                        }`}
                      >
                        {node.efficiency}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

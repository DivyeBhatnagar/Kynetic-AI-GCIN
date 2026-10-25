import React from 'react';

// 1. Digital Twin Roofline Model Diagram
export const DigitalTwinDiagram: React.FC = () => {
  return (
    <div className="w-full my-4 rounded border border-hairline-default bg-canvas-base p-3 overflow-hidden">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-hairline-subtle text-label-mono text-[10px] text-ink-muted">
        <span className="font-semibold text-accent-olive">EMPIRICAL ROOFLINE MODEL</span>
        <span>FLOP/BYTE VS TFLOPS</span>
      </div>

      <svg viewBox="0 0 320 120" className="w-full h-28" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Grid lines */}
        <line x1="30" y1="10" x2="310" y2="10" stroke="#E8E7E0" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="30" y1="55" x2="310" y2="55" stroke="#E8E7E0" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="30" y1="100" x2="310" y2="100" stroke="#DEDDD5" strokeWidth="1.5" />
        <line x1="30" y1="10" x2="30" y2="100" stroke="#DEDDD5" strokeWidth="1.5" />

        {/* Memory Bandwidth Slanted Bound */}
        <path d="M30 100 L140 25" stroke="#59664D" strokeWidth="2" />
        {/* Peak Compute Flat Roofline */}
        <path d="M140 25 L310 25" stroke="#59664D" strokeWidth="2" strokeDasharray="4 4" />

        {/* Memory-bound shaded zone */}
        <path d="M30 100 L140 25 L140 100 Z" fill="#59664D" fillOpacity="0.08" />

        {/* Operational Point of Workload */}
        <circle cx="100" cy="52" r="4.5" fill="#84A96C" />
        <circle cx="100" cy="52" r="8" stroke="#84A96C" strokeWidth="1.2" opacity="0.6" className="animate-pulse" />

        {/* Text annotations */}
        <text x="110" y="50" fill="#191919" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="600">
          Workload Op Point (138.4 FLOP/B)
        </text>
        <text x="35" y="85" fill="#686861" fontSize="8" fontFamily="JetBrains Mono, monospace">
          Memory-Bound Zone
        </text>
        <text x="210" y="20" fill="#686861" fontSize="8" fontFamily="JetBrains Mono, monospace">
          Peak Tensor Compute
        </text>
      </svg>

      {/* Dark Technical Telemetry Drawer */}
      <div className="mt-2 p-2.5 rounded bg-[#181816] text-[#E4E3DD] font-mono text-[10.5px] leading-relaxed">
        <div className="flex justify-between text-[#8E8D88] text-[9.5px] uppercase mb-1">
          <span>CALIBRATED KERNEL PROFILE</span>
          <span className="text-status-healthy">±4.2% ERROR TOLERANCE</span>
        </div>
        <div className="text-[#C4C3BC]">
          arithmetic_intensity: <span className="text-[#84A96C]">138.4 FLOP/B</span>
        </div>
        <div className="text-[#C4C3BC]">
          predicted_runtime: <span className="text-[#E4E3DD] font-semibold">7h 35m</span> · saturation: <span className="text-[#84A96C]">86.2%</span>
        </div>
      </div>
    </div>
  );
};

// 2. Predictive Compute Arbitrage Diagram
export const ArbitrageDiagram: React.FC = () => {
  return (
    <div className="w-full my-4 rounded border border-hairline-default bg-canvas-base p-3 overflow-hidden">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-hairline-subtle text-label-mono text-[10px] text-ink-muted">
        <span className="font-semibold text-accent-olive">MIGRATION ECONOMICS CURVE</span>
        <span>BREAKEVEN CROSSOVER</span>
      </div>

      <svg viewBox="0 0 320 120" className="w-full h-28" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Coordinate grid */}
        <line x1="30" y1="100" x2="310" y2="100" stroke="#DEDDD5" strokeWidth="1.5" />
        <line x1="30" y1="10" x2="30" y2="100" stroke="#DEDDD5" strokeWidth="1.5" />

        {/* Status Quo Cost Path (higher slope) */}
        <path d="M30 90 L290 20" stroke="#686861" strokeWidth="1.5" strokeDasharray="3 3" />

        {/* Migration Pause Spike + Lower Cost Slope */}
        <path
          d="M30 90 L120 68 L120 58 L290 35"
          stroke="#59664D"
          strokeWidth="2.5"
        />

        {/* Crossover threshold point */}
        <circle cx="120" cy="63" r="4.5" fill="#84A96C" />
        <circle cx="210" cy="46" r="3.5" fill="#59664D" />

        {/* Shaded net savings area */}
        <path d="M210 46 L290 20 L290 35 Z" fill="#84A96C" fillOpacity="0.2" />

        <text x="130" y="62" fill="#191919" fontSize="8.5" fontFamily="JetBrains Mono, monospace" fontWeight="600">
          Migration Barrier ($1.20)
        </text>
        <text x="215" y="30" fill="#59664D" fontSize="8.5" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          Net Arbitrage Yield (+18.4%)
        </text>
      </svg>

      {/* Dark Technical Telemetry Drawer */}
      <div className="mt-2 p-2.5 rounded bg-[#181816] text-[#E4E3DD] font-mono text-[10.5px] leading-relaxed">
        <div className="flex justify-between text-[#8E8D88] text-[9.5px] uppercase mb-1">
          <span>ANTI-OSCILLATION SAFEGUARD</span>
          <span className="text-[#84A96C]">DISPATCH APPROVED</span>
        </div>
        <div className="text-[#C4C3BC]">
          cooldown_status: <span className="text-[#E4E3DD]">0s (Unlocked)</span> · max_hops: <span className="text-[#E4E3DD]">1/3</span>
        </div>
        <div className="text-[#C4C3BC]">
          projected_delta: <span className="text-[#84A96C] font-semibold">-$4.60 net savings</span> after egress
        </div>
      </div>
    </div>
  );
};

// 3. Universal Checkpoint & Resume Diagram
export const CheckpointDiagram: React.FC = () => {
  return (
    <div className="w-full my-4 rounded border border-hairline-default bg-canvas-base p-3 overflow-hidden">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-hairline-subtle text-label-mono text-[10px] text-ink-muted">
        <span className="font-semibold text-accent-olive">SHARDED TENSOR HYDRATION</span>
        <span>ZERO-DOWNTIME RESUME</span>
      </div>

      <svg viewBox="0 0 320 120" className="w-full h-28" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Source Cluster Ranks */}
        <rect x="25" y="20" width="60" height="20" rx="3" fill="#E9EFE5" stroke="#59664D" strokeWidth="1" />
        <text x="32" y="34" fill="#191919" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
          Rank 0-3
        </text>

        <rect x="25" y="48" width="60" height="20" rx="3" fill="#E9EFE5" stroke="#59664D" strokeWidth="1" />
        <text x="32" y="62" fill="#191919" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
          Rank 4-7
        </text>

        {/* Central Validation Gateway */}
        <rect x="125" y="28" width="70" height="32" rx="4" fill="#181816" stroke="#2B2A27" strokeWidth="1" />
        <text x="131" y="42" fill="#84A96C" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          SafeTensors
        </text>
        <text x="131" y="53" fill="#8E8D88" fontSize="7" fontFamily="JetBrains Mono, monospace">
          SHA-256 Valid
        </text>

        {/* Destination Hardware Cluster */}
        <rect x="235" y="20" width="65" height="48" rx="4" fill="#F4F4F0" stroke="#59664D" strokeWidth="1.5" />
        <text x="242" y="40" fill="#191919" fontSize="8.5" fontFamily="JetBrains Mono, monospace" fontWeight="600">
          Target HGX
        </text>
        <text x="242" y="52" fill="#59664D" fontSize="7.5" fontFamily="JetBrains Mono, monospace">
          NVLink C2C
        </text>

        {/* Flow Connectors */}
        <path d="M85 30 L125 38" stroke="#59664D" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M85 58 L125 50" stroke="#59664D" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M195 44 L235 44" stroke="#84A96C" strokeWidth="2" className="animate-data-flow" />

        {/* Bottom Status bar */}
        <text x="30" y="98" fill="#686861" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
          Zero Shard Inversion · 38.4s Cross-Cloud Restoration
        </text>
      </svg>

      {/* Dark Technical Telemetry Drawer */}
      <div className="mt-2 p-2.5 rounded bg-[#181816] text-[#E4E3DD] font-mono text-[10.5px] leading-relaxed">
        <div className="flex justify-between text-[#8E8D88] text-[9.5px] uppercase mb-1">
          <span>UNIVERSAL SERIALIZER</span>
          <span className="text-[#84A96C]">HASH VERIFIED</span>
        </div>
        <div className="text-[#C4C3BC]">
          tensor_engine: <span className="text-[#E4E3DD]">SafeTensors ZeRO-3</span>
        </div>
        <div className="text-[#C4C3BC]">
          resume_latency: <span className="text-[#84A96C] font-semibold">38.4s</span> (Multi-Cloud Egress Buffer)
        </div>
      </div>
    </div>
  );
};

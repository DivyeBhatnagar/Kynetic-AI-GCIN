import React, { useState } from 'react';

interface ClusterNode {
  id: string;
  name: string;
  provider: string;
  region: string;
  gpus: string;
  interconnect: string;
  status: 'ACTIVE_RUN' | 'CHECKPOINT' | 'IDLE_STANDBY' | 'COMPLETED';
  activeJob: string;
  bandwidth: string;
  spotArbitrageDelta: string;
  temp: string;
  utilization: number;
}

export const DashboardComputeTopology: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-cw');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const clusterNodes: ClusterNode[] = [
    {
      id: 'node-cw',
      name: 'CoreWeave Supercluster 04',
      provider: 'CoreWeave',
      region: 'us-east-1 (NJ)',
      gpus: '8x NVIDIA H100 SXM5 80GB',
      interconnect: '3.2 Tbps Quantum-2 IB NDR',
      status: 'ACTIVE_RUN',
      activeJob: 'Llama 3 70B LoRA Alignment (run_8f99a0e1)',
      bandwidth: '840 GB/s All-to-All',
      spotArbitrageDelta: '-32% vs AWS p5.48xlarge',
      temp: '68°C',
      utilization: 94,
    },
    {
      id: 'node-runpod',
      name: 'RunPod Secure Pod 12',
      provider: 'RunPod',
      region: 'eu-central-1 (Frankfurt)',
      gpus: '8x NVIDIA L40S Ada 48GB',
      interconnect: '400 Gbps RoCE v2 Fabric',
      status: 'CHECKPOINT',
      activeJob: 'DeepSeek-R1 Distillation (run_44b3c99a)',
      bandwidth: '310 GB/s Direct-Mesh',
      spotArbitrageDelta: '-38% vs list price',
      temp: '62°C',
      utilization: 82,
    },
    {
      id: 'node-lambda',
      name: 'Lambda Hyperplane 07',
      provider: 'Lambda Labs',
      region: 'us-west-2 (Oregon)',
      gpus: '16x NVIDIA RTX 4090 24GB',
      interconnect: 'PCIe Gen5 x16 Non-blocking',
      status: 'COMPLETED',
      activeJob: 'SDXL Batch Generation 50k (run_9021dd72)',
      bandwidth: '128 GB/s Host-to-Device',
      spotArbitrageDelta: '-68% vs enterprise A100',
      temp: '55°C',
      utilization: 12,
    },
    {
      id: 'node-crusoe',
      name: 'Crusoe CleanCloud ND',
      provider: 'Crusoe Cloud',
      region: 'us-central-1 (ND)',
      gpus: '4x NVIDIA GH200 Grace Hopper',
      interconnect: '900 GB/s NVLink-C2C',
      status: 'IDLE_STANDBY',
      activeJob: 'Standby for Preemption Fallback',
      bandwidth: '4.0 TB/s Coherent Memory',
      spotArbitrageDelta: 'Zero-Carbon Spot Arbitrage',
      temp: '49°C',
      utilization: 5,
    },
  ];

  const selectedNode = clusterNodes.find((n) => n.id === selectedNodeId) || clusterNodes[0];

  return (
    <div className="border border-hairline-default rounded-lg bg-surface-elevated overflow-hidden shadow-xs">
      {/* Top Header Strip */}
      <div className="bg-canvas-alternate px-4 md:px-5 py-3 border-b border-hairline-default flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-status-healthy animate-pulse"></span>
          <span className="font-label-mono text-label-mono text-ink-primary font-semibold uppercase tracking-wider text-xs">
            COMPUTE TOPOLOGY ORCHESTRATION MESH
          </span>
          <span className="text-hairline-strong font-label-mono hidden sm:inline">|</span>
          <span className="font-label-mono text-label-mono text-ink-muted text-xs hidden sm:inline">
            eBPF Kernel Routing · Multi-Cloud Direct Connect
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-label-mono text-xs text-ink-muted hidden md:inline">
            4 Clusters Dispatched · 32 GPUs Active
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="font-label-mono text-xs text-ink-muted hover:text-ink-primary flex items-center gap-1 px-2 py-0.5 rounded bg-surface-elevated border border-hairline-default hover:border-hairline-strong transition-colors"
          >
            <span>{isExpanded ? 'Compact View' : 'Inspect Topology'}</span>
            <span className="material-symbols-outlined text-[14px]">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 md:p-5">
          {/* Visual Node Grid & Routing Mesh */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            {clusterNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const statusColor =
                node.status === 'ACTIVE_RUN'
                  ? 'bg-status-healthy text-accent-olive-deep'
                  : node.status === 'CHECKPOINT'
                  ? 'bg-secondary-container text-accent-olive'
                  : node.status === 'COMPLETED'
                  ? 'bg-canvas-alternate text-ink-muted'
                  : 'bg-canvas-alternate text-ink-subtle';

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-3.5 rounded border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-accent-olive bg-[#FAF9F5] ring-1 ring-accent-olive shadow-xs'
                      : 'border-hairline-default bg-canvas-base hover:border-hairline-strong'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label-mono text-[10px] text-accent-olive font-semibold px-1.5 py-0.5 rounded bg-canvas-alternate border border-hairline-subtle">
                      {node.provider}
                    </span>
                    <span
                      className={`font-label-mono text-[9px] px-1.5 py-0.5 rounded font-medium ${statusColor}`}
                    >
                      {node.status}
                    </span>
                  </div>

                  <div className="font-headline-sm text-xs font-semibold text-ink-primary truncate mb-1">
                    {node.gpus}
                  </div>

                  <div className="font-label-mono text-[11px] text-ink-muted truncate mb-2">
                    {node.region}
                  </div>

                  <div className="border-t border-hairline-subtle pt-2 flex items-center justify-between text-[11px] font-label-mono">
                    <span className="text-ink-subtle">Load:</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 bg-canvas-alternate h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-accent-olive h-full"
                          style={{ width: `${node.utilization}%` }}
                        ></div>
                      </div>
                      <span className="text-ink-primary font-medium">{node.utilization}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Connected Telemetry Drawer for Selected Node */}
          <div className="p-3.5 rounded bg-canvas-alternate border border-hairline-default flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-label-mono">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-accent-olive font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-status-healthy"></span>
                {selectedNode.name}
              </span>
              <span className="text-hairline-strong">|</span>
              <span className="text-ink-muted">Fabric:</span>
              <span className="text-ink-primary font-medium">{selectedNode.interconnect}</span>
              <span className="text-hairline-strong">|</span>
              <span className="text-ink-muted">Throughput:</span>
              <span className="text-ink-primary font-medium">{selectedNode.bandwidth}</span>
              <span className="text-hairline-strong">|</span>
              <span className="text-ink-muted">Arbitrage:</span>
              <span className="text-accent-olive font-medium">{selectedNode.spotArbitrageDelta}</span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-ink-muted">Core Temp:</span>
              <span className="text-ink-primary font-medium">{selectedNode.temp}</span>
              <span className="text-ink-subtle text-[11px]">eBPF probe #09 synced</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

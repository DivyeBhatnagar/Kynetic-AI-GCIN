import React from 'react';

interface CloudProvider {
  name: string;
  category: string;
  logo: string;
  heightClass?: string;
}

export const SupportedCloudsStrip: React.FC<{ className?: string }> = ({ className = '' }) => {
  const providers: CloudProvider[] = [
    {
      name: 'Amazon Web Services',
      category: 'Hyperscaler',
      logo: '/assets/providers/aws.svg',
      heightClass: 'h-6 sm:h-7',
    },
    {
      name: 'Google Cloud Platform',
      category: 'Hyperscaler',
      logo: '/assets/providers/google-cloud.svg',
      heightClass: 'h-7 sm:h-8',
    },
    {
      name: 'Microsoft Azure',
      category: 'Hyperscaler',
      logo: '/assets/providers/azure.svg',
      heightClass: 'h-6 sm:h-7',
    },
    {
      name: 'NVIDIA DGX / HGX Fabric',
      category: 'Hardware Architecture',
      logo: '/assets/providers/nvidia.svg',
      heightClass: 'h-6 sm:h-7',
    },
    {
      name: 'CoreWeave',
      category: 'Specialist AI Cloud',
      logo: '/assets/providers/coreweave.svg',
      heightClass: 'h-5 sm:h-6',
    },
    {
      name: 'RunPod',
      category: 'Specialist AI Cloud',
      logo: '/assets/providers/runpod.svg',
      heightClass: 'h-7 sm:h-8',
    },
    {
      name: 'Lambda Labs',
      category: 'Deep Learning Cloud',
      logo: '/assets/providers/lambda.svg',
      heightClass: 'h-6 sm:h-7',
    },
    {
      name: 'Crusoe Cloud',
      category: 'Clean Compute',
      logo: '/assets/providers/crusoe.svg',
      heightClass: 'h-6 sm:h-7',
    },
    {
      name: 'Nebius AI',
      category: 'Hyperscale AI Fabric',
      logo: '/assets/providers/nebius.svg',
      heightClass: 'h-6 sm:h-7',
    },
    {
      name: 'Together AI',
      category: 'Decentralized AI',
      logo: '/assets/providers/together.svg',
      heightClass: 'h-5 sm:h-6',
    },
    {
      name: 'Oracle Cloud (OCI)',
      category: 'Hyperscaler',
      logo: '/assets/providers/oracle.svg',
      heightClass: 'h-5 sm:h-6',
    },
  ];

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      {/* Monospace Subtitle (matching reference screenshot, keeping warm webpage background) */}
      <div className="text-center mb-6">
        <p className="font-label-mono text-label-mono uppercase tracking-[0.2em] text-ink-muted text-[11px] sm:text-[12px] font-medium">
          NATIVE SCHEDULING &amp; COST ARBITRAGE ACROSS HYPERSCALERS &amp; SPECIALIST GPU CLOUDS
        </p>
      </div>

      {/* Logos Strip with Original Downloaded Vector Assets */}
      <div className="relative overflow-hidden py-4 px-6 rounded-xl border border-hairline-default/80 bg-surface-elevated/40 backdrop-blur-xs">
        <div className="flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-10 gap-y-5">
          {providers.map((provider) => (
            <div
              key={provider.name}
              title={`${provider.name} (${provider.category})`}
              className="flex items-center justify-center opacity-85 hover:opacity-100 hover:scale-110 transition-all duration-200 cursor-pointer select-none py-1"
            >
              <img
                src={provider.logo}
                alt={provider.name}
                className={`${provider.heightClass || 'h-6 sm:h-7'} w-auto object-contain max-w-[120px]`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

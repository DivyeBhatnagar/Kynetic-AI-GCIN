import React from 'react';

interface CloudProvider {
  name: string;
  category: string;
  svg: React.ReactNode;
}

export const SupportedCloudsStrip: React.FC<{ className?: string }> = ({ className = '' }) => {
  const providers: CloudProvider[] = [
    {
      name: 'Amazon Web Services',
      category: 'Hyperscaler',
      svg: (
        <svg viewBox="0 0 100 60" className="h-6 md:h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M32.8 35.8c-4.4 3.2-10.7 4.9-16.2 4.9-7.7 0-14.6-2.9-19.8-7.7-.4-.4 0-.9.5-.6 5.6 3.2 12.4 5.2 19.4 5.2 4.8 0 10.4-1.3 15.5-3.8.7-.4 1.3.4.6 2z"
            fill="#FF9900"
          />
          <path
            d="M34.2 33.6c-.6-.7-3.8-.3-5.2-.2-.5 0-.6-.4-.2-.7 2.4-1.7 6.4-1.2 6.9-.6.5.6-.2 4.6-2.4 6.5-.4.3-.7.2-.6-.3.4-1.4 1.9-4.1 1.5-4.7z"
            fill="#FF9900"
          />
          <text
            x="3"
            y="25"
            fill="#232F3E"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="800"
            fontSize="26"
            letterSpacing="-0.5"
          >
            aws
          </text>
        </svg>
      ),
    },
    {
      name: 'Google Cloud Platform',
      category: 'Hyperscaler',
      svg: (
        <svg viewBox="0 0 140 36" className="h-6 md:h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(2, 2)">
            {/* Google Cloud Authentic 4-color Cloud Icon */}
            <path
              d="M19.4 11.2c-.2-3.8-3.4-6.8-7.2-6.8-2.6 0-4.9 1.4-6.1 3.5-1.1-.6-2.3-1-3.6-1-3.6 0-6.5 2.9-6.5 6.5 0 .4 0 .8.1 1.2C-2.4 15.8-1 18.5 1 20.3c1.5 1.3 3.4 2.1 5.5 2.1h12.6c3.6 0 6.5-2.9 6.5-6.5 0-2.8-1.8-5.3-4.5-6.1l-1.7.4z"
              fill="#4285F4"
            />
            <path
              d="M12.2 4.4c-2.6 0-4.9 1.4-6.1 3.5 1.4 1.3 3.3 2.1 5.4 2.1 2.9 0 5.4-1.5 6.8-3.8-.9-1.1-2.4-1.8-6.1-1.8z"
              fill="#EA4335"
            />
            <path
              d="M6.1 7.9C5 7.3 3.8 6.9 2.5 6.9-1.1 6.9-4 9.8-4 13.4c0 .4 0 .8.1 1.2 1.3-1.6 3.2-2.7 5.4-2.7 1.7 0 3.3.6 4.6 1.6V7.9z"
              fill="#FBBC05"
            />
            <path
              d="M19.4 11.2c-.2.9-.6 1.7-1.1 2.4-1.4 2.3-3.9 3.8-6.8 3.8-2.1 0-4-.8-5.4-2.1v5.1h13c3.6 0 6.5-2.9 6.5-6.5 0-1.2-.3-2.3-.9-3.2l-5.3.5z"
              fill="#34A853"
            />
          </g>
          <text
            x="36"
            y="23"
            fill="#3C4043"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="600"
            fontSize="15"
            letterSpacing="-0.2"
          >
            Google Cloud
          </text>
        </svg>
      ),
    },
    {
      name: 'Microsoft Azure',
      category: 'Hyperscaler',
      svg: (
        <svg viewBox="0 0 115 36" className="h-6 md:h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(2, 4)">
            {/* Azure Official Emblem */}
            <path
              d="M17.4 25.2H2.2c-.7 0-1.1-.7-.8-1.3L13.1 3c.3-.6 1.2-.6 1.5 0l3.6 6.3c-2.7 1.8-8.2 6.7-8.2 11.3 0 2.2 1.1 3.9 2.6 4.6h4.8z"
              fill="#0078D4"
            />
            <path
              d="M17.4 25.2h6.8c.7 0 1.2-.7.8-1.3L16.2 8.7c-.3-.5-1.1-.3-1.2.2-.6 4.9 3.3 9.4 3.7 13.5.1 1.1-.5 2.1-1.3 2.8z"
              fill="#5EA0EF"
            />
            <path
              d="M14.6 3c-.3-.6-1.2-.6-1.5 0L1.4 23.9c-.3.6.1 1.3.8 1.3h8.9c-.9-.8-1.5-1.9-1.5-3.3 0-4.6 5.5-9.5 8.2-11.3L14.6 3z"
              fill="#005BA1"
            />
          </g>
          <text
            x="36"
            y="23"
            fill="#002451"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="600"
            fontSize="16"
            letterSpacing="-0.2"
          >
            Azure
          </text>
        </svg>
      ),
    },
    {
      name: 'CoreWeave',
      category: 'Specialist AI Cloud',
      svg: (
        <svg viewBox="0 0 135 36" className="h-6 md:h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(2, 6)">
            {/* CoreWeave geometric pulse mark */}
            <rect x="0" y="0" width="8" height="24" rx="2" fill="#000000" />
            <rect x="11" y="5" width="8" height="19" rx="2" fill="#00D2A0" />
            <rect x="22" y="10" width="8" height="14" rx="2" fill="#000000" />
          </g>
          <text
            x="40"
            y="24"
            fill="#111827"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="700"
            fontSize="15"
            letterSpacing="-0.3"
          >
            CoreWeave
          </text>
        </svg>
      ),
    },
    {
      name: 'RunPod',
      category: 'Specialist AI Cloud',
      svg: (
        <svg viewBox="0 0 115 36" className="h-6 md:h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(2, 4)">
            {/* RunPod Isometric Cube */}
            <path d="M14 2L26 8.5V21.5L14 28L2 21.5V8.5L14 2Z" fill="#6E3FF3" />
            <path d="M14 2L26 8.5L14 15L2 8.5L14 2Z" fill="#8E65FF" />
            <path d="M14 15V28L2 21.5V8.5L14 15Z" fill="#5827DE" />
          </g>
          <text
            x="36"
            y="23"
            fill="#18181B"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="700"
            fontSize="16"
            letterSpacing="-0.2"
          >
            RunPod
          </text>
        </svg>
      ),
    },
    {
      name: 'Lambda Labs',
      category: 'Deep Learning Cloud',
      svg: (
        <svg viewBox="0 0 120 36" className="h-6 md:h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(2, 4)">
            {/* Lambda Symbol with Vivid Gradient Tone */}
            <rect width="26" height="26" rx="6" fill="#8B5CF6" />
            <path
              d="M7 20l5.5-12h2.5L20 20h-2.8l-1.8-4.2h-5L8.8 20H7zm5.5-6.2h3.6L14.3 9.4h-.2l-1.6 4.4z"
              fill="#FFFFFF"
            />
          </g>
          <text
            x="36"
            y="23"
            fill="#1F2937"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="700"
            fontSize="16"
            letterSpacing="-0.3"
          >
            Lambda
          </text>
        </svg>
      ),
    },
    {
      name: 'Crusoe Cloud',
      category: 'Clean Compute',
      svg: (
        <svg viewBox="0 0 115 36" className="h-6 md:h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(2, 4)">
            {/* Crusoe Clean Energy Flame */}
            <circle cx="13" cy="13" r="13" fill="#FFF2EE" />
            <path
              d="M13 4c1 4.5 5 7.5 5 11 0 3.3-2.7 6-6 6s-6-2.7-6-6c0-4 4.5-8.5 7-11z"
              fill="#FF5226"
            />
            <path
              d="M13 11c.7 2.3 2.7 3.8 2.7 5.6 0 1.7-1.4 3-3.1 3-1.7 0-3.1-1.3-3.1-3 0-2 2.3-4.3 3.5-5.6z"
              fill="#FFB020"
            />
          </g>
          <text
            x="35"
            y="23"
            fill="#1E293B"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="700"
            fontSize="16"
            letterSpacing="-0.2"
          >
            Crusoe
          </text>
        </svg>
      ),
    },
    {
      name: 'Nebius AI',
      category: 'Hyperscale AI Fabric',
      svg: (
        <svg viewBox="0 0 115 36" className="h-6 md:h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(2, 5)">
            {/* Nebius Star polygon mark */}
            <rect width="24" height="24" rx="5" fill="#000000" />
            <path
              d="M12 4l2.2 5.5 5.8.5-4.4 3.8 1.3 5.7L12 16.5l-4.9 3 1.3-5.7-4.4-3.8 5.8-.5L12 4z"
              fill="#FFFFFF"
            />
          </g>
          <text
            x="34"
            y="23"
            fill="#111827"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="700"
            fontSize="16"
            letterSpacing="-0.2"
          >
            Nebius
          </text>
        </svg>
      ),
    },
    {
      name: 'Together AI',
      category: 'Decentralized AI',
      svg: (
        <svg viewBox="0 0 120 36" className="h-6 md:h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(2, 5)">
            {/* Together AI Node Cluster */}
            <circle cx="7" cy="8" r="4" fill="#0F62FE" />
            <circle cx="17" cy="8" r="4" fill="#0043CE" />
            <circle cx="12" cy="17" r="4" fill="#001D6C" />
            <line x1="7" y1="8" x2="17" y2="8" stroke="#0F62FE" strokeWidth="2" />
            <line x1="7" y1="8" x2="12" y2="17" stroke="#0F62FE" strokeWidth="2" />
            <line x1="17" y1="8" x2="12" y2="17" stroke="#0043CE" strokeWidth="2" />
          </g>
          <text
            x="32"
            y="23"
            fill="#0F172A"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="700"
            fontSize="15"
            letterSpacing="-0.2"
          >
            Together AI
          </text>
        </svg>
      ),
    },
    {
      name: 'Oracle Cloud Infrastructure',
      category: 'Hyperscaler',
      svg: (
        <svg viewBox="0 0 100 36" className="h-6 md:h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(2, 6)">
            {/* Oracle Red Pill / Oval */}
            <rect x="0" y="3" width="26" height="16" rx="8" stroke="#F80000" strokeWidth="3.5" fill="none" />
          </g>
          <text
            x="36"
            y="23"
            fill="#C74634"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="800"
            fontSize="16"
            letterSpacing="0.2"
          >
            OCI
          </text>
        </svg>
      ),
    },
    {
      name: 'NVIDIA DGX / HGX Fabric',
      category: 'Hardware Architecture',
      svg: (
        <svg viewBox="0 0 120 36" className="h-6 md:h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(2, 6)">
            {/* NVIDIA Signature Green Eye mark */}
            <path
              d="M17.5 12c-2.4-2.2-5.4-3.5-8.7-3.5-7.3 0-13.3 6-13.3 13.3 0 1.2.2 2.3.5 3.4 1.3-4.5 5.5-7.8 10.4-7.8 6 0 10.9 4.9 10.9 10.9 0 .4 0 .9-.1 1.3 5.3-2.1 9-7.3 9-13.4 0-1.6-.3-3.1-.7-4.2z"
              fill="#76B900"
            />
            <path
              d="M15 15.5c-1.6-1.5-3.6-2.4-5.8-2.4-4.8 0-8.8 4-8.8 8.8 0 1.2.2 2.3.7 3.3.7-2.7 3.2-4.7 6.1-4.7 3.5 0 6.4 2.9 6.4 6.4 0 .4 0 .9-.1 1.3 2.9-1.5 4.8-4.5 4.8-7.9 0-1.8-.7-3.4-1.8-4.8l-1.5 0z"
              fill="#76B900"
            />
          </g>
          <text
            x="36"
            y="23"
            fill="#111827"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="800"
            fontSize="15"
            letterSpacing="0.2"
          >
            NVIDIA
          </text>
        </svg>
      ),
    },
  ];

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      {/* Monospace Subtitle (exact style as user reference, matching warm theme) */}
      <div className="text-center mb-6">
        <p className="font-label-mono text-label-mono uppercase tracking-[0.2em] text-ink-muted text-[11px] sm:text-[12px] font-medium">
          NATIVE SCHEDULING &amp; COST ARBITRAGE ACROSS HYPERSCALERS &amp; SPECIALIST GPU CLOUDS
        </p>
      </div>

      {/* Logos Strip in Authentic Original Colors on Webpage Background */}
      <div className="relative overflow-hidden py-3 px-4 rounded-xl border border-hairline-default/80 bg-surface-elevated/40 backdrop-blur-xs">
        <div className="flex flex-wrap items-center justify-center gap-x-8 md:gap-x-10 gap-y-5">
          {providers.map((provider) => (
            <div
              key={provider.name}
              title={`${provider.name} (${provider.category})`}
              className="flex items-center justify-center opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-150 cursor-pointer select-none"
            >
              {provider.svg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

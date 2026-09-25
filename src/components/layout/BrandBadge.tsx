import React from 'react';

export const BrandBadge: React.FC<{ subtitle?: string }> = ({
  subtitle = "AI Customer Communication Orchestrator",
}) => {
  return (
    <div className="flex items-center space-x-3 select-none">
      {/* Aurora Cloud Logo Mark */}
      <div className="w-9 h-9 flex-shrink-0 rounded-xl shadow-xs overflow-hidden">
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="badge-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="45%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#090D16" />
            </linearGradient>
            <linearGradient id="badge-stream" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="35%" stopColor="#06B6D4" />
              <stop offset="70%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
            <linearGradient id="badge-ribbon" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="40%" stopColor="#38BDF8" />
              <stop offset="75%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
            <linearGradient id="badge-glass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="badge-spark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>

          <rect width="64" height="64" rx="16" fill="url(#badge-bg)" />
          <rect x="1" y="1" width="62" height="62" rx="15" stroke="url(#badge-ribbon)" strokeWidth="1.2" strokeOpacity="0.45" />

          {/* Cloud Outline with Glassmorphism */}
          <path
            d="M19 43h25a9.5 9.5 0 0 0 3-18.5 12.5 12.5 0 0 0-23.4-5.3A10.5 10.5 0 0 0 19 43z"
            fill="url(#badge-glass)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.2"
          />

          {/* Fluid Aurora Wave Ribbons */}
          <path
            d="M13 38.5c5-4 12-3.5 18-7s11-9 20-6"
            stroke="url(#badge-stream)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M15 42c6-3.5 13-2 20-5.5s10-8 17-5.5"
            stroke="url(#badge-ribbon)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M21 28.5c4-3.5 9-4 14-2s8 6 14 5"
            stroke="#38BDF8"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="0.5 3"
          />

          {/* AI Beacon Spark */}
          <g transform="translate(46, 14)">
            <path
              d="M0 -6 C0 -1.5, 1.5 0, 6 0 C1.5 0, 0 1.5, 0 6 C0 1.5, -1.5 0, -6 0 C-1.5 0, 0 -1.5, 0 -6 Z"
              fill="url(#badge-spark)"
            />
            <circle cx="0" cy="0" r="1.2" fill="#FFFFFF" />
          </g>
        </svg>
      </div>

      <div>
        <span className="font-extrabold text-lg sm:text-xl tracking-tight text-aurora-neutral-900 leading-none">
          Aurora Cloud
        </span>
      </div>
    </div>
  );
};

import React from 'react';

export const BrandBadge: React.FC<{ subtitle?: string }> = ({ subtitle = "AI Communication Orchestrator" }) => {
  return (
    <div className="flex items-center space-x-3">
      {/* Sunrise mark per Aurora Cloud guidelines: 1.5px stroke, rounded terminals */}
      <div className="w-8 h-8 rounded-md bg-aurora-primary flex items-center justify-center text-white shadow-sm flex-shrink-0">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v4" />
          <path d="M4.93 10.93l2.83-2.83" />
          <path d="M2 18h20" />
          <path d="M20 18a8 8 0 0 0-16 0" />
          <path d="M19.07 10.93l-2.83-2.83" />
        </svg>
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-base text-aurora-neutral-900 tracking-tight">Aurora Cloud</span>
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-aurora-primary-light text-aurora-primary font-semibold">
            Enterprise
          </span>
        </div>
        <p className="text-xs text-aurora-neutral-500 font-normal">{subtitle}</p>
      </div>
    </div>
  );
};

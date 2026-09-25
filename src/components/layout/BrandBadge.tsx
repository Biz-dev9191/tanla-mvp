import React from 'react';

export const BrandBadge: React.FC<{ subtitle?: string }> = ({
  subtitle = "AI Customer Communication Orchestrator",
}) => {
  return (
    <div className="flex items-center space-x-3 select-none">
      {/* Aurora Cloud Sunrise Mark - Modern, Bold & Polished */}
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 via-aurora-primary to-purple-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/30 flex-shrink-0 transition-transform transform hover:scale-105">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-xs"
        >
          <path d="M12 3v3" />
          <path d="M5.22 10.22l2.12-2.12" />
          <path d="M3 18h18" />
          <path d="M19 18a7 7 0 0 0-14 0" />
          <path d="M18.78 10.22l-2.12-2.12" />
        </svg>
      </div>

      <div className="flex items-center">
        <span className="font-extrabold text-[17px] tracking-tight text-aurora-neutral-950">
          Aurora <span className="text-aurora-primary font-black">Cloud</span>
        </span>
      </div>
    </div>
  );
};

import React from 'react';

export const BrandBadge: React.FC<{ subtitle?: string }> = ({
  subtitle = "AI Customer Communication Orchestrator",
}) => {
  return (
    <div className="flex items-center space-x-3 select-none">
      {/* Aurora Cloud Sunrise Mark */}
      <div className="w-9 h-9 rounded-lg bg-aurora-primary flex items-center justify-center text-white shadow-xs flex-shrink-0">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v3" />
          <path d="M5.22 10.22l2.12-2.12" />
          <path d="M3 18h18" />
          <path d="M19 18a7 7 0 0 0-14 0" />
          <path d="M18.78 10.22l-2.12-2.12" />
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

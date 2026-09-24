import React from 'react';

export const BrandBadge: React.FC<{ subtitle?: string }> = ({
  subtitle = "AI Customer Communication Orchestrator",
}) => {
  return (
    <div className="flex items-center space-x-3 select-none">
      {/* Aurora Cloud Sunrise Mark (1.5px stroke, 24px minimum sizing floor, rounded terminals) */}
      <div className="w-8 h-8 rounded bg-aurora-primary flex items-center justify-center text-white shadow-sm flex-shrink-0">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
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
        <span className="font-bold text-base tracking-tight text-aurora-neutral-900">Aurora Cloud</span>
      </div>
    </div>
  );
};

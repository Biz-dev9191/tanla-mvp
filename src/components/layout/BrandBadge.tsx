import React from 'react';

export const BrandBadge: React.FC<{ subtitle?: string }> = ({
  subtitle = "AI Customer Communication Orchestrator",
}) => {
  return (
    <div className="flex items-center space-x-3 select-none">
      {/* Aurora Cloud Logo Mark - Solid Option 1 */}
      <div className="w-9 h-9 flex-shrink-0 rounded-xl shadow-xs overflow-hidden">
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <rect width="64" height="64" rx="16" fill="#2B4C7E" />
          <rect x="1" y="1" width="62" height="62" rx="15" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.3" />
          <path d="M16 42C21 34 26 24 35 24C44 24 40 40 48 40" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          <path d="M16 26C24 26 28 42 37 42C44 42 46 32 50 28" stroke="#BFDBFE" strokeWidth="3" strokeLinecap="round" />
          <circle cx="36" cy="33" r="2.5" fill="#FFFFFF" />
          <path d="M48 18L49 20L51 21L49 22L48 24L47 22L45 21L47 20Z" fill="#FFFFFF" />
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

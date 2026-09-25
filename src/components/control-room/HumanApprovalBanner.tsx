import React from 'react';
import { ShieldAlert, Check, XCircle } from 'lucide-react';

interface HumanApprovalBannerProps {
  reason?: string;
  onApprove: () => void;
  onRequestRevision?: () => void;
  onSuppress?: () => void;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Not Required';
}

export const HumanApprovalBanner: React.FC<HumanApprovalBannerProps> = ({
  reason,
  onApprove,
  onRequestRevision,
  onSuppress,
  status,
}) => {
  if (status === 'Not Required') return null;

  return (
    <div className="bg-amber-50/95 border border-amber-300/80 rounded-lg px-3.5 py-2.5 shadow-2xs mb-5 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Info Column */}
        <div className="flex items-center space-x-2.5 flex-1 min-w-0">
          <div className="p-1.5 bg-amber-100 text-amber-800 rounded-md flex-shrink-0 border border-amber-200/80">
            <ShieldAlert strokeWidth={1.75} className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-xs font-bold text-aurora-neutral-900 leading-tight">
                Human Supervisor Approval Required
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-600 text-white leading-none">
                {status}
              </span>
            </div>
            <p className="text-[11px] text-aurora-neutral-700 leading-snug mt-0.5 truncate sm:max-w-2xl" title={reason}>
              {reason || 'This communication involves financial commitments or policy exceptions requiring authorization.'}
            </p>
          </div>
        </div>

        {/* Right Action Encapsulated within the strip */}
        {status === 'Pending' && (
          <div className="flex-shrink-0 self-end sm:self-center">
            <button
              onClick={onApprove}
              className="px-3.5 py-1.5 bg-aurora-primary hover:bg-aurora-primary-hover text-white rounded-md text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <Check strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Approve & Authorize</span>
            </button>
          </div>
        )}

        {status === 'Approved' && (
          <div className="flex-shrink-0 text-[11px] font-bold text-emerald-700 flex items-center space-x-1 bg-white px-2.5 py-1 rounded-md border border-emerald-200 shadow-2xs whitespace-nowrap self-end sm:self-center">
            <Check strokeWidth={2} className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authorized</span>
          </div>
        )}

        {status === 'Rejected' && (
          <div className="flex-shrink-0 text-[11px] font-bold text-rose-700 flex items-center space-x-1 bg-white px-2.5 py-1 rounded-md border border-rose-200 shadow-2xs whitespace-nowrap self-end sm:self-center">
            <XCircle strokeWidth={2} className="w-3.5 h-3.5 text-rose-600" />
            <span>Suppressed</span>
          </div>
        )}
      </div>
    </div>
  );
};

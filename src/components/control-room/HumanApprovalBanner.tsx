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
    <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5 flex-1 min-w-0">
          <div className="p-2.5 bg-amber-100 text-amber-800 rounded-lg flex-shrink-0 mt-0.5 border border-amber-200">
            <ShieldAlert strokeWidth={1.75} className="w-5 h-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h3 className="text-sm font-bold text-aurora-neutral-900">Human Supervisor Approval Required</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-600 text-white">
                {status}
              </span>
            </div>
            <p className="text-xs text-aurora-neutral-700 leading-relaxed max-w-3xl">
              {reason || 'This communication involves financial commitments or exceptional policy criteria that require human authorization before outbound dispatch.'}
            </p>
          </div>
        </div>

        {status === 'Pending' && (
          <div className="flex-shrink-0 w-full md:w-auto flex justify-end">
            <button
              onClick={onApprove}
              className="w-full md:w-auto whitespace-nowrap px-6 py-2.5 bg-aurora-primary hover:bg-aurora-primary-hover text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-2 shadow-xs transition active:scale-98 cursor-pointer"
            >
              <Check strokeWidth={2} className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Approve & Authorize</span>
            </button>
          </div>
        )}

        {status === 'Approved' && (
          <div className="flex-shrink-0 text-xs font-bold text-emerald-700 flex items-center space-x-1.5 bg-white px-3.5 py-2 rounded-lg border border-emerald-200 shadow-2xs whitespace-nowrap">
            <Check strokeWidth={2} className="w-4 h-4 text-emerald-600" />
            <span>Authorized by Supervisor</span>
          </div>
        )}

        {status === 'Rejected' && (
          <div className="flex-shrink-0 text-xs font-bold text-rose-700 flex items-center space-x-1.5 bg-white px-3.5 py-2 rounded-lg border border-rose-200 shadow-2xs whitespace-nowrap">
            <XCircle strokeWidth={2} className="w-4 h-4 text-rose-600" />
            <span>Suppressed by Supervisor</span>
          </div>
        )}
      </div>
    </div>
  );
};

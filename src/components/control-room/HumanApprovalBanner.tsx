import React from 'react';
import { ShieldAlert, Check, RefreshCw, XCircle } from 'lucide-react';

interface HumanApprovalBannerProps {
  reason?: string;
  onApprove: () => void;
  onRequestRevision: () => void;
  onSuppress: () => void;
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
    <div className="bg-aurora-warning-light border-2 border-aurora-warning rounded-lg p-5 shadow-aurora mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-aurora-warning/20 text-aurora-warning rounded-md mt-0.5">
            <ShieldAlert strokeWidth={1.5} className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-aurora-neutral-900">Human Supervisor Approval Required</h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-aurora-warning text-white">
                {status}
              </span>
            </div>
            <p className="text-xs text-aurora-neutral-700 mt-1 leading-relaxed">
              {reason || 'This communication involves financial commitments or exceptional policy criteria that require human authorization before outbound dispatch.'}
            </p>
          </div>
        </div>

        {status === 'Pending' && (
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={onSuppress}
              className="px-3 py-1.5 border border-aurora-neutral-300 bg-aurora-neutral-0 hover:bg-aurora-neutral-100 text-aurora-neutral-900 rounded text-xs font-semibold flex items-center space-x-1"
            >
              <XCircle strokeWidth={1.5} className="w-3.5 h-3.5 text-aurora-error" />
              <span>Suppress</span>
            </button>
            <button
              onClick={onRequestRevision}
              className="px-3 py-1.5 border border-aurora-neutral-300 bg-aurora-neutral-0 hover:bg-aurora-neutral-100 text-aurora-neutral-900 rounded text-xs font-semibold flex items-center space-x-1"
            >
              <RefreshCw strokeWidth={1.5} className="w-3.5 h-3.5 text-aurora-primary" />
              <span>Request Revision</span>
            </button>
            <button
              onClick={onApprove}
              className="px-4 py-1.5 bg-aurora-primary hover:bg-aurora-primary-hover text-white rounded text-xs font-bold flex items-center space-x-1 shadow-sm"
            >
              <Check strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>Approve & Authorize</span>
            </button>
          </div>
        )}

        {status === 'Approved' && (
          <div className="text-xs font-bold text-aurora-success flex items-center space-x-1 bg-aurora-neutral-0 px-3 py-1.5 rounded border border-aurora-success/30">
            <Check strokeWidth={1.5} className="w-4 h-4" />
            <span>Authorized by Supervisor</span>
          </div>
        )}

        {status === 'Rejected' && (
          <div className="text-xs font-bold text-aurora-error flex items-center space-x-1 bg-aurora-neutral-0 px-3 py-1.5 rounded border border-aurora-error/30">
            <XCircle strokeWidth={1.5} className="w-4 h-4" />
            <span>Suppressed by Supervisor</span>
          </div>
        )}
      </div>
    </div>
  );
};

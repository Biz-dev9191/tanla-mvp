import React from 'react';
import { PolicyTreeNode } from '@/core/policy-tree-data';
import { X, ShieldCheck, Check, AlertCircle } from 'lucide-react';

interface PolicyDetailModalProps {
  node: PolicyTreeNode | null;
  onClose: () => void;
}

export const PolicyDetailModal: React.FC<PolicyDetailModalProps> = ({ node, onClose }) => {
  if (!node) return null;

  return (
    <div className="fixed inset-0 z-50 bg-aurora-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-aurora-neutral-0 rounded-lg max-w-lg w-full border border-aurora-neutral-300 shadow-aurora-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-aurora-neutral-200 mb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck strokeWidth={1.5} className="w-5 h-5 text-aurora-primary" />
            <h3 className="font-bold text-sm text-aurora-neutral-900">{node.name}</h3>
          </div>
          <button onClick={onClose} className="text-aurora-neutral-500 hover:text-aurora-neutral-900 p-1">
            <X strokeWidth={1.5} className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="font-semibold text-aurora-neutral-500 block mb-0.5">Description:</span>
            <p className="text-aurora-neutral-900">{node.description}</p>
          </div>

          {node.ruleCode && (
            <div>
              <span className="font-semibold text-aurora-neutral-500 block mb-0.5">Policy Rule Identifier:</span>
              <span className="font-mono font-bold text-aurora-primary bg-aurora-primary-light px-2 py-0.5 rounded">
                {node.ruleCode}
              </span>
            </div>
          )}

          {node.allowedSummary && (
            <div className="p-3 bg-aurora-success-light border border-aurora-success/20 rounded-md">
              <span className="font-bold text-aurora-success flex items-center space-x-1 mb-1">
                <Check strokeWidth={1.5} className="w-4 h-4" />
                <span>Permitted Agent Actions:</span>
              </span>
              <p className="text-aurora-neutral-900 leading-relaxed">{node.allowedSummary}</p>
            </div>
          )}

          {node.prohibitedSummary && (
            <div className="p-3 bg-aurora-error-light border border-aurora-error/20 rounded-md">
              <span className="font-bold text-aurora-error flex items-center space-x-1 mb-1">
                <AlertCircle strokeWidth={1.5} className="w-4 h-4" />
                <span>Strictly Prohibited Claims:</span>
              </span>
              <p className="text-aurora-neutral-900 leading-relaxed">{node.prohibitedSummary}</p>
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-aurora-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-aurora-neutral-100 hover:bg-aurora-neutral-200 text-aurora-neutral-900 rounded-md text-xs font-semibold"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

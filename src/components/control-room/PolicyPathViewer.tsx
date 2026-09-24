import React from 'react';
import { PolicyRule } from '@/core/types';
import { GitBranch, ChevronRight, ShieldCheck } from 'lucide-react';

interface PolicyPathViewerProps {
  policyPath: string[];
  appliedPolicies: PolicyRule[];
}

export const PolicyPathViewer: React.FC<PolicyPathViewerProps> = ({ policyPath, appliedPolicies }) => {
  return (
    <div className="bg-aurora-neutral-0 rounded-lg p-5 border border-aurora-neutral-200 shadow-aurora">
      <div className="flex items-center justify-between pb-3 border-b border-aurora-neutral-200 mb-4">
        <div className="flex items-center space-x-2">
          <GitBranch strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
          <h3 className="text-sm font-bold text-aurora-neutral-900">Applied Policy Tree Path</h3>
        </div>
        <span className="text-xs text-aurora-neutral-500">{appliedPolicies.length} Active Policies</span>
      </div>

      {/* Path Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 bg-aurora-neutral-100 rounded-md border border-aurora-neutral-200 text-xs mb-4">
        {policyPath.map((node, idx) => (
          <React.Fragment key={idx}>
            <span
              className={`px-2 py-0.5 rounded font-medium ${
                idx === policyPath.length - 1
                  ? 'bg-aurora-primary text-white font-bold'
                  : 'bg-aurora-neutral-0 text-aurora-neutral-700 border border-aurora-neutral-300'
              }`}
            >
              {node}
            </span>
            {idx < policyPath.length - 1 && (
              <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5 text-aurora-neutral-500" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Rules list */}
      <div className="space-y-3">
        {appliedPolicies.map((policy) => (
          <div
            key={policy.id}
            className="p-3 rounded border border-aurora-neutral-200 bg-aurora-neutral-100 text-xs space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-aurora-primary">{policy.id}</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-aurora-neutral-200 text-aurora-neutral-700">
                {policy.category}
              </span>
            </div>
            <h4 className="font-bold text-aurora-neutral-900">{policy.title}</h4>
            <p className="text-aurora-neutral-700 leading-relaxed">{policy.rule}</p>

            <div className="pt-1.5 border-t border-aurora-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="font-semibold text-aurora-success block mb-0.5">Permitted Actions:</span>
                <ul className="list-disc list-inside text-aurora-neutral-700 space-y-0.5">
                  {policy.allowedActions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-semibold text-aurora-error block mb-0.5">Prohibited Actions:</span>
                <ul className="list-disc list-inside text-aurora-neutral-700 space-y-0.5">
                  {policy.prohibitedActions.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

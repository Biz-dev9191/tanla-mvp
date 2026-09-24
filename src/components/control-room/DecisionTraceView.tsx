import React from 'react';
import { FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

interface DecisionTraceViewProps {
  trace: string[];
  isSuppressed?: boolean;
}

export const DecisionTraceView: React.FC<DecisionTraceViewProps> = ({ trace, isSuppressed }) => {
  return (
    <div className="bg-aurora-neutral-0 rounded-lg p-5 border border-aurora-neutral-200 shadow-aurora">
      <div className="flex items-center justify-between pb-3 border-b border-aurora-neutral-200 mb-4">
        <div className="flex items-center space-x-2">
          <FileText strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
          <h3 className="text-sm font-bold text-aurora-neutral-900">Governance Decision Trace</h3>
        </div>
        <span className="text-xs text-aurora-neutral-500 font-medium">Safe Business Evidence</span>
      </div>

      <div className="space-y-2.5">
        {trace.map((item, index) => (
          <div
            key={index}
            className="flex items-start space-x-2.5 p-2.5 rounded bg-aurora-neutral-100 border border-aurora-neutral-200 text-xs text-aurora-neutral-900"
          >
            <div className="mt-0.5">
              {item.includes('Suppressed') || item.includes('Blocked') ? (
                <ShieldAlert strokeWidth={1.5} className="w-4 h-4 text-aurora-warning flex-shrink-0" />
              ) : (
                <CheckCircle2 strokeWidth={1.5} className="w-4 h-4 text-aurora-success flex-shrink-0" />
              )}
            </div>
            <p className="leading-relaxed font-normal">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

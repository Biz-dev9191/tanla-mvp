import React from 'react';
import { CommunicationStrategy } from '@/core/types';
import { Compass, ShieldCheck, AlertTriangle } from 'lucide-react';

interface StrategyCardProps {
  strategy: CommunicationStrategy;
  primaryObjective: string;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, primaryObjective }) => {
  const rows = [
    { label: 'Business Objective', value: primaryObjective.replace(/_/g, ' ').toUpperCase() },
    { label: 'Decision Verdict', value: strategy.decision },
    { label: 'Recommended Channel', value: strategy.selectedChannel },
    { label: 'Fallback Channel', value: strategy.fallbackChannel || 'None' },
    { label: 'Synthesized Tone', value: strategy.tone },
    { label: 'Formality Level', value: strategy.formality },
    { label: 'Message Density', value: strategy.messageLength },
    { label: 'Personalisation', value: strategy.personalisationLevel },
    { label: 'Call to Action', value: strategy.ctaType === 'None' ? 'None (Zero Friction)' : strategy.ctaType },
    { label: 'Customer Action Required', value: strategy.customerActionRequired ? 'Yes (Document / Payment)' : 'None (Proactive)' },
    {
      label: 'Human Supervisor Review',
      value: strategy.humanApprovalRequired ? 'Mandatory (Compensation / Exception)' : 'Not Required (Autonomous)',
      highlight: strategy.humanApprovalRequired,
    },
  ];

  return (
    <div className="bg-aurora-neutral-0 rounded-lg p-5 border border-aurora-neutral-200 shadow-aurora">
      <div className="flex items-center justify-between pb-3 border-b border-aurora-neutral-200 mb-4">
        <div className="flex items-center space-x-2">
          <Compass strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
          <h3 className="text-sm font-bold text-aurora-neutral-900">Communication Strategy Decision</h3>
        </div>
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded ${
            strategy.decision === 'SEND'
              ? 'bg-aurora-success-light text-aurora-success border border-aurora-success/20'
              : strategy.decision === 'ESCALATE'
              ? 'bg-aurora-warning-light text-aurora-warning border border-aurora-warning/20'
              : 'bg-aurora-error-light text-aurora-error border border-aurora-error/20'
          }`}
        >
          {strategy.decision}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-aurora-neutral-200 text-aurora-neutral-500 uppercase tracking-wider">
              <th className="py-2 font-semibold">Strategic Attribute</th>
              <th className="py-2 font-semibold">Agent Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-aurora-neutral-200/60">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-aurora-neutral-100/50">
                <td className="py-2.5 font-medium text-aurora-neutral-700">{row.label}</td>
                <td className="py-2.5 font-semibold text-aurora-neutral-900">
                  {row.highlight ? (
                    <span className="inline-flex items-center space-x-1 text-aurora-warning font-bold">
                      <AlertTriangle strokeWidth={1.5} className="w-3.5 h-3.5" />
                      <span>{row.value}</span>
                    </span>
                  ) : (
                    row.value
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

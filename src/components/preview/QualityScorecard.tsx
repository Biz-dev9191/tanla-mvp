import React from 'react';
import { GuardrailEvaluation } from '@/core/types';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Award } from 'lucide-react';

interface QualityScorecardProps {
  guardrails: GuardrailEvaluation;
}

export const QualityScorecard: React.FC<QualityScorecardProps> = ({ guardrails }) => {
  const items = [
    {
      label: 'Personalisation Depth',
      verdict: guardrails.personalisationQuality,
      status: 'pass',
      details: 'Grounded in customer segment, history, and individual preferences.',
    },
    {
      label: 'Tone Alignment',
      verdict: guardrails.toneAlignment.passed ? 'Pass' : 'Fail',
      status: guardrails.toneAlignment.passed ? 'pass' : 'fail',
      details: guardrails.toneAlignment.details,
    },
    {
      label: 'Policy Compliance',
      verdict: guardrails.policyCompliance.passed ? 'Pass' : 'Requires Review',
      status: guardrails.policyCompliance.passed ? 'pass' : 'warn',
      details: guardrails.policyCompliance.details,
    },
    {
      label: 'Factual Grounding',
      verdict: guardrails.factualAccuracy.passed ? 'Pass' : 'Fail',
      status: guardrails.factualAccuracy.passed ? 'pass' : 'fail',
      details: guardrails.factualAccuracy.details,
    },
    {
      label: 'Channel Constraints',
      verdict: guardrails.channelFit.passed ? 'Pass' : 'Fail',
      status: guardrails.channelFit.passed ? 'pass' : 'fail',
      details: guardrails.channelFit.details,
    },
    {
      label: 'Fatigue & Frequency Check',
      verdict: guardrails.fatigueCheck.passed ? 'Pass' : 'Suppressed',
      status: guardrails.fatigueCheck.passed ? 'pass' : 'suppressed',
      details: guardrails.fatigueCheck.details,
    },
    {
      label: 'Unsupported Promise Check',
      verdict: guardrails.unsupportedPromises.detected ? 'Violated' : 'Pass (Zero Hallucinations)',
      status: guardrails.unsupportedPromises.detected ? 'fail' : 'pass',
      details: guardrails.unsupportedPromises.details,
    },
  ];

  return (
    <div className="bg-aurora-neutral-0 rounded-lg p-5 border border-aurora-neutral-200 shadow-aurora">
      <div className="flex items-center justify-between pb-3 border-b border-aurora-neutral-200 mb-4">
        <div className="flex items-center space-x-2">
          <Award strokeWidth={1.5} className="w-5 h-5 text-aurora-primary" />
          <h3 className="text-sm font-bold text-aurora-neutral-900">Message Governance & Quality Scorecard</h3>
        </div>
        <span className="text-xs text-aurora-neutral-500 font-medium">Deterministic & AI Validated</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border flex flex-col justify-between ${
              item.status === 'pass'
                ? 'bg-aurora-neutral-100/60 border-aurora-neutral-200'
                : item.status === 'warn'
                ? 'bg-aurora-warning-light/40 border-aurora-warning/30'
                : 'bg-aurora-error-light/40 border-aurora-error/30'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-xs text-aurora-neutral-900">{item.label}</span>
              <span
                className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                  item.status === 'pass'
                    ? 'bg-aurora-success-light text-aurora-success'
                    : item.status === 'warn'
                    ? 'bg-aurora-warning-light text-aurora-warning'
                    : 'bg-aurora-error-light text-aurora-error'
                }`}
              >
                {item.verdict}
              </span>
            </div>
            <p className="text-[11px] text-aurora-neutral-700 leading-relaxed">{item.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

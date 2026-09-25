import React from 'react';
import { PolicyRule, ClauseCitation } from '@/core/types';
import { GitBranch, ShieldCheck } from 'lucide-react';

interface PolicyPathViewerProps {
  policyPath?: string[];
  appliedPolicies: PolicyRule[];
  clauseCitations?: ClauseCitation[];
  humanApprovalRequired?: boolean;
  approvalReason?: string;
}

export const PolicyPathViewer: React.FC<PolicyPathViewerProps> = ({
  appliedPolicies = [],
  clauseCitations = [],
  humanApprovalRequired,
  approvalReason,
}) => {
  // Only showcase policies which result in human intervention required
  const policiesRequiringIntervention: PolicyRule[] = [];

  appliedPolicies.forEach((p) => {
    // Check if explicitly marked as escalation trigger
    if (p.escalationTriggered) {
      if (!policiesRequiringIntervention.some((item) => item.id === p.id)) {
        policiesRequiringIntervention.push(p);
      }
    } else if (
      humanApprovalRequired &&
      (p.escalationRequired ||
        (approvalReason &&
          (approvalReason.includes(p.id) ||
            (p.title && approvalReason.includes(p.title)))))
    ) {
      if (!policiesRequiringIntervention.some((item) => item.id === p.id)) {
        policiesRequiringIntervention.push(p);
      }
    }
  });

  // Fallback: If humanApprovalRequired is true and appliedPolicies did not yield a rule, check clauseCitations
  if (
    policiesRequiringIntervention.length === 0 &&
    humanApprovalRequired &&
    clauseCitations &&
    clauseCitations.length > 0
  ) {
    const matchingCitations = clauseCitations.filter(
      (c) =>
        (approvalReason &&
          (approvalReason.includes(c.clauseId) || approvalReason.includes(c.title))) ||
        c.directiveType === 'MANDATORY'
    );
    matchingCitations.forEach((c) => {
      if (!policiesRequiringIntervention.some((item) => item.id === c.clauseId)) {
        policiesRequiringIntervention.push({
          id: c.clauseId,
          nodePath: `${c.sourceDocument} > ${c.section}`,
          category: (c.section.toLowerCase().includes('privacy')
            ? 'privacy'
            : c.section.toLowerCase().includes('finan')
            ? 'financial'
            : 'escalation') as any,
          title: c.title,
          rule: c.excerpt || c.complianceRequirement,
          condition: c.complianceRequirement,
          allowedActions: ['Adhere strictly to verified facts and supervisor directives'],
          prohibitedActions: ['Outbound transmission without documented supervisor approval'],
          escalationRequired: true,
          escalationTriggered: true,
          priority: 'high',
        });
      }
    });
  }

  return (
    <div className="bg-aurora-neutral-0 rounded-lg p-5 border border-aurora-neutral-200 shadow-aurora space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-aurora-neutral-200">
        <div className="flex items-center space-x-2">
          <GitBranch strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
          <h3 className="text-sm font-bold text-aurora-neutral-900">Applied Policy & Clause Citations</h3>
        </div>
        <span className="text-xs text-aurora-neutral-500 font-mono">
          {policiesRequiringIntervention.length > 0
            ? `${policiesRequiringIntervention.length} ${policiesRequiringIntervention.length === 1 ? 'Escalation Policy Cited' : 'Escalation Policies Cited'}`
            : '0 Escalation Policies Cited'}
        </span>
      </div>

      {/* Showcase ONLY policies that result in human intervention */}
      {policiesRequiringIntervention.length > 0 ? (
        <div className="space-y-3">
          {policiesRequiringIntervention.map((policy) => (
            <div
              key={policy.id}
              className="p-4 sm:p-5 rounded-lg border border-aurora-neutral-200 bg-aurora-neutral-50 text-xs space-y-2.5"
            >
              {/* Top Row: Policy Code & Category Tag */}
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-aurora-primary">
                  {policy.id}
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-aurora-neutral-200 text-aurora-neutral-700">
                  {policy.category || 'GOVERNANCE'}
                </span>
              </div>

              {/* Title */}
              <h4 className="font-bold text-sm text-aurora-neutral-900 leading-snug">
                {policy.title}
              </h4>

              {/* Rule / Statement */}
              <p className="text-xs text-aurora-neutral-700 leading-relaxed">
                {policy.rule}
              </p>

              {/* Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <span className="font-bold text-xs text-emerald-700 block mb-1">
                    Permitted Actions:
                  </span>
                  {policy.allowedActions && policy.allowedActions.length > 0 ? (
                    <ul className="text-aurora-neutral-700 space-y-1">
                      {policy.allowedActions.map((action, i) => (
                        <li key={i} className="flex items-start space-x-1.5 leading-relaxed">
                          <span className="text-aurora-neutral-500 select-none">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-aurora-neutral-500 italic">None specified</p>
                  )}
                </div>

                <div>
                  <span className="font-bold text-xs text-red-700 block mb-1">
                    Prohibited Actions:
                  </span>
                  {policy.prohibitedActions && policy.prohibitedActions.length > 0 ? (
                    <ul className="text-aurora-neutral-700 space-y-1">
                      {policy.prohibitedActions.map((prohibition, i) => (
                        <li key={i} className="flex items-start space-x-1.5 leading-relaxed">
                          <span className="text-aurora-neutral-500 select-none">•</span>
                          <span>{prohibition}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-aurora-neutral-500 italic">None specified</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State when no policy requires human intervention */
        <div className="p-6 rounded-lg border border-aurora-neutral-200 bg-aurora-neutral-50 text-center space-y-2">
          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <ShieldCheck strokeWidth={1.5} className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-aurora-neutral-900">No Human Intervention Required</h4>
          <p className="text-xs text-aurora-neutral-600 max-w-md mx-auto leading-relaxed">
            All evaluated governance policies passed autonomously. No policy triggered a supervisor escalation gate for this scenario.
          </p>
        </div>
      )}
    </div>
  );
};

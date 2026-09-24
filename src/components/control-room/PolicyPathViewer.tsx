import React from 'react';
import { PolicyRule, ClauseCitation } from '@/core/types';
import { GitBranch, ChevronRight, ShieldCheck, BookOpen, ExternalLink, Quote } from 'lucide-react';

interface PolicyPathViewerProps {
  policyPath: string[];
  appliedPolicies: PolicyRule[];
  clauseCitations?: ClauseCitation[];
}

export const PolicyPathViewer: React.FC<PolicyPathViewerProps> = ({
  policyPath,
  appliedPolicies,
  clauseCitations = [],
}) => {
  return (
    <div className="bg-aurora-neutral-0 rounded-lg p-5 border border-aurora-neutral-200 shadow-aurora space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-aurora-neutral-200">
        <div className="flex items-center space-x-2">
          <GitBranch strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
          <h3 className="text-sm font-bold text-aurora-neutral-900">Applied Policy & Clause Citations</h3>
        </div>
        <span className="text-xs text-aurora-neutral-500 font-mono">
          {clauseCitations.length > 0 ? `${clauseCitations.length} Citations Verified` : `${appliedPolicies.length} Active Policies`}
        </span>
      </div>

      {/* Path Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 bg-aurora-neutral-100 rounded-md border border-aurora-neutral-200 text-xs">
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

      {/* RAG Clause Citations with Verbatim Excerpts */}
      {clauseCitations.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-aurora-neutral-900">
            <BookOpen strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
            <span>RAG Document Clause Citations</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {clauseCitations.map((citation, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-aurora-neutral-200 bg-aurora-neutral-100/70 text-xs space-y-2 hover:border-aurora-primary/40 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-aurora-primary text-[11px] bg-white px-2 py-0.5 rounded border border-aurora-neutral-300">
                      {citation.clauseId}
                    </span>
                    <span className="font-semibold text-aurora-neutral-900">{citation.sourceDocument}</span>
                    <span className="text-[10px] bg-aurora-neutral-200 text-aurora-neutral-700 px-1.5 py-0.2 rounded font-mono">
                      {citation.section}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        citation.directiveType === 'MANDATORY'
                          ? 'bg-aurora-primary-light text-aurora-primary'
                          : citation.directiveType === 'PROHIBITIVE'
                          ? 'bg-aurora-error-light text-aurora-error'
                          : 'bg-aurora-neutral-200 text-aurora-neutral-700'
                      }`}
                    >
                      {citation.directiveType}
                    </span>
                    <span className="text-[10px] font-mono text-aurora-success font-bold">
                      {Math.round(citation.relevanceScore * 100)}% Match
                    </span>
                  </div>
                </div>

                <h4 className="font-bold text-aurora-neutral-900">{citation.title}</h4>

                {/* Excerpt Quote */}
                <div className="p-2.5 rounded bg-white border border-aurora-neutral-200 text-aurora-neutral-700 italic leading-relaxed text-[11px] flex items-start space-x-2">
                  <Quote strokeWidth={1.5} className="w-3.5 h-3.5 text-aurora-primary flex-shrink-0 mt-0.5" />
                  <span>"{citation.excerpt}"</span>
                </div>

                <div className="text-[11px] text-aurora-neutral-700 pt-1 flex items-center justify-between">
                  <span><strong>Compliance Requirement:</strong> {citation.complianceRequirement}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules list */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-aurora-neutral-700 uppercase tracking-wider">
          Enforced Policy Directives ({appliedPolicies.length})
        </h4>
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


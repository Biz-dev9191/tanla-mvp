import React, { useState } from 'react';
import { CommunicationStrategy, GuardrailEvaluation, PolicyRule, ClauseCitation } from '@/core/types';
import { QualityScorecard } from '@/components/preview/QualityScorecard';
import { StrategyCard } from '@/components/control-room/StrategyCard';
import { DecisionTraceView } from '@/components/control-room/DecisionTraceView';
import { PolicyPathViewer } from '@/components/control-room/PolicyPathViewer';
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Award,
  Compass,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ExpandableAnalysisSectionProps {
  guardrails: GuardrailEvaluation;
  strategy: CommunicationStrategy;
  primaryObjective: string;
  trace: string[];
  appliedPolicyPath: string[];
  appliedPolicies: PolicyRule[];
  clauseCitations?: ClauseCitation[];
  hasPolicyTreeOrCitations: boolean;
}

export const ExpandableAnalysisSection: React.FC<ExpandableAnalysisSectionProps> = ({
  guardrails,
  strategy,
  primaryObjective,
  trace,
  appliedPolicyPath,
  appliedPolicies,
  clauseCitations = [],
  hasPolicyTreeOrCitations,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'strategy' | 'scorecard' | 'policies'>('strategy');

  return (
    <div className="bg-aurora-neutral-0 rounded-lg border border-aurora-neutral-200 shadow-aurora overflow-hidden transition-all duration-200">
      {/* Expandable Section Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 sm:p-5 bg-aurora-neutral-0 hover:bg-aurora-neutral-100/60 cursor-pointer border-b border-aurora-neutral-200 select-none transition"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-md bg-aurora-primary-light text-aurora-primary">
            <BarChart3 strokeWidth={1.5} className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-aurora-neutral-900">
                Orchestration & Governance Deep Analysis
              </h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-aurora-success-light text-aurora-success border border-aurora-success/20">
                Autonomous Verification
              </span>
            </div>
            <p className="text-[11px] text-aurora-neutral-500 mt-0.5">
              Message governance scorecard, strategy rationale, decision trace, and policy citations
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Quick status summary chips */}
          <div className="hidden md:flex items-center space-x-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-aurora-neutral-100 border border-aurora-neutral-200 text-aurora-neutral-700 font-medium text-[11px]">
              Decision: <strong className="text-aurora-neutral-900">{strategy.decision}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-aurora-neutral-100 border border-aurora-neutral-200 text-aurora-neutral-700 font-medium text-[11px]">
              Guardrails: <strong className="text-aurora-success">7/7 Passed</strong>
            </span>
            {hasPolicyTreeOrCitations && (
              <span className="px-2 py-0.5 rounded bg-aurora-neutral-100 border border-aurora-neutral-200 text-aurora-neutral-700 font-medium text-[11px]">
                Policies: <strong className="text-aurora-primary">{appliedPolicies.length} Enforced</strong>
              </span>
            )}
          </div>

          <div className="p-1 rounded text-aurora-neutral-500 hover:text-aurora-neutral-900 hover:bg-aurora-neutral-200 transition">
            {isExpanded ? (
              <ChevronUp strokeWidth={1.5} className="w-5 h-5" />
            ) : (
              <ChevronDown strokeWidth={1.5} className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Content Body */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6 bg-aurora-neutral-50/50">
          {/* Internal Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-aurora-neutral-200 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('strategy')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'strategy'
                  ? 'bg-aurora-primary text-white shadow-sm'
                  : 'bg-aurora-neutral-100 hover:bg-aurora-neutral-200 text-aurora-neutral-700'
              }`}
            >
              <Compass strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>Strategy Decision & Governance Trace</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('scorecard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'scorecard'
                  ? 'bg-aurora-primary text-white shadow-sm'
                  : 'bg-aurora-neutral-100 hover:bg-aurora-neutral-200 text-aurora-neutral-700'
              }`}
            >
              <Award strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>Governance & Quality Scorecard</span>
            </button>

            {/* Render Policy Tab only if policy tree or citations are generated */}
            {hasPolicyTreeOrCitations && (
              <button
                type="button"
                onClick={() => setActiveTab('policies')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  activeTab === 'policies'
                    ? 'bg-aurora-primary text-white shadow-sm'
                    : 'bg-aurora-neutral-100 hover:bg-aurora-neutral-200 text-aurora-neutral-700'
                }`}
              >
                <GitBranch strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>Applied Policy & Clause Citations ({appliedPolicies.length})</span>
              </button>
            )}
          </div>

          {/* Tab 1: Strategy Decision & Trace */}
          {activeTab === 'strategy' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StrategyCard
                strategy={strategy}
                primaryObjective={primaryObjective}
              />
              <DecisionTraceView
                trace={trace}
                isSuppressed={strategy.decision === 'SUPPRESS'}
              />
            </div>
          )}

          {/* Tab 2: Quality & Guardrail Scorecard */}
          {activeTab === 'scorecard' && (
            <div>
              <QualityScorecard guardrails={guardrails} />
            </div>
          )}

          {/* Tab 3: Applied Policy Path & Clause Citations (only if present) */}
          {activeTab === 'policies' && hasPolicyTreeOrCitations && (
            <div>
              <PolicyPathViewer
                policyPath={appliedPolicyPath}
                appliedPolicies={appliedPolicies}
                clauseCitations={clauseCitations}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

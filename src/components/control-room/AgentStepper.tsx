import React, { useState } from 'react';
import { AgentExecutionStep, ReflectionLoopIteration, ClauseCitation } from '@/core/types';
import { AGENT_GOVERNANCE_POLICIES } from '@/core/agent-policies';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Bot,
  RefreshCw,
  Shield,
  Sparkles,
  FileText,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

interface AgentStepperProps {
  steps: AgentExecutionStep[];
  currentRunningIndex?: number;
  reflectionLoops?: ReflectionLoopIteration[];
  clauseCitations?: ClauseCitation[];
}

const POLICY_CODE_MAP: { [key: string]: { code: string; color: string } } = {
  context: { code: 'CCAP-2026-v2.4', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  objective: { code: 'ORAP-2026-v2.1', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  policy_tree: { code: 'PTGAP-2026-v1.8', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  policy: { code: 'EPAP-2026-v3.0', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  strategy: { code: 'CSAP-2026-v2.5', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  message: { code: 'CMGAP-2026-v4.2', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  guardrail: { code: 'CSGAP-2026-v3.3', color: 'bg-teal-50 text-teal-700 border-teal-200' },
};

export const AgentStepper: React.FC<AgentStepperProps> = ({ steps, currentRunningIndex, reflectionLoops, clauseCitations }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const getStatusBadge = (status: AgentExecutionStep['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-aurora-success-light text-aurora-success border border-aurora-success/20">
            <CheckCircle2 strokeWidth={1.5} className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      case 'needs_revision':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-aurora-accent-light text-aurora-accent border border-aurora-accent/20">
            <RefreshCw strokeWidth={1.5} className="w-3.5 h-3.5 animate-spin" />
            <span>Revision Loop</span>
          </span>
        );
      case 'escalated':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-aurora-warning-light text-aurora-warning border border-aurora-warning/20">
            <AlertTriangle strokeWidth={1.5} className="w-3.5 h-3.5" />
            <span>Escalated (Human Approval)</span>
          </span>
        );
      case 'suppressed':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-aurora-error-light text-aurora-error border border-aurora-error/20">
            <XCircle strokeWidth={1.5} className="w-3.5 h-3.5" />
            <span>Suppressed</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-aurora-primary-light text-aurora-primary border border-aurora-primary/20">
            <span className="w-2 h-2 rounded-full bg-aurora-primary animate-ping mr-1"></span>
            <span>Processing</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-aurora-neutral-200 text-aurora-neutral-700">
            <Clock strokeWidth={1.5} className="w-3.5 h-3.5" />
            <span>Waiting</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-aurora-neutral-0 rounded-lg p-5 border border-aurora-neutral-200 shadow-aurora space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-aurora-neutral-200">
        <div className="flex items-center space-x-2">
          <Bot strokeWidth={1.5} className="w-5 h-5 text-aurora-primary" />
          <div>
            <h2 className="text-sm font-bold text-aurora-neutral-900">Multi-Agent Execution Pipeline</h2>
            <p className="text-[11px] text-aurora-neutral-500">7 Specialized Collaborative Agents Governed by Dedicated Policy Documents</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {reflectionLoops && reflectionLoops.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-aurora-accent-light text-aurora-accent font-bold text-[10px] border border-aurora-accent/20">
              {reflectionLoops.length} Reflection Loops
            </span>
          )}
          <span className="text-xs text-aurora-neutral-500 font-mono">
            {steps.filter((s) => s.status === 'completed' || s.status === 'escalated' || s.status === 'suppressed').length} / {steps.length} Steps
          </span>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isExpanded = expandedIndex === idx;
          const policyMeta = POLICY_CODE_MAP[step.agentId] || { code: 'GOV-2026', color: 'bg-gray-50 text-gray-700 border-gray-200' };
          const policyDoc = AGENT_GOVERNANCE_POLICIES.find((p) => p.agentId === step.agentId);
          const isEscalated = step.status === 'escalated';

          return (
            <div
              key={idx}
              className={`border rounded-lg transition-all ${
                step.status === 'completed'
                  ? 'border-aurora-neutral-200 bg-aurora-neutral-0 hover:border-aurora-neutral-300'
                  : step.status === 'escalated'
                  ? 'border-aurora-warning/40 bg-aurora-warning-light/30'
                  : step.status === 'suppressed'
                  ? 'border-aurora-error/40 bg-aurora-error-light/30'
                  : 'border-aurora-neutral-200 bg-aurora-neutral-100'
              }`}
            >
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="p-3.5 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-aurora-primary-light text-aurora-primary flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-aurora-neutral-900">{step.agentName}</h4>
                      <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded border ${policyMeta.color}`}>
                        {policyMeta.code}
                      </span>
                      {getStatusBadge(step.status)}
                    </div>
                    <p className="text-xs text-aurora-neutral-700 mt-0.5 leading-relaxed">{step.summary}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs text-aurora-neutral-500">
                  <span className="font-mono hidden sm:inline">{step.durationMs}ms</span>
                  {isExpanded ? (
                    <ChevronUp strokeWidth={1.5} className="w-4 h-4 text-aurora-neutral-700" />
                  ) : (
                    <ChevronDown strokeWidth={1.5} className="w-4 h-4 text-aurora-neutral-700" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 border-t border-aurora-neutral-200 bg-aurora-neutral-100 text-xs space-y-3.5 rounded-b-lg">
                  {/* 1. Human Approval Gate Rationale & Policy Reference (if escalated or requires human sign-off) */}
                  {isEscalated && (
                    <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 space-y-2">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle strokeWidth={1.5} className="w-4 h-4 text-amber-700 flex-shrink-0" />
                        <span className="font-bold text-xs uppercase tracking-wider text-amber-900">
                          Human Supervisor Approval Gate Activated
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div>
                          <strong className="text-amber-900">Decision Rationale:</strong>{' '}
                          <span>
                            Human review is required before dispatch because this decision triggers a financial concession, goodwill compensation, or complaint escalation threshold.
                          </span>
                        </div>
                        {clauseCitations && clauseCitations.length > 0 && (
                          <div className="p-2 rounded bg-white/80 border border-amber-200 font-mono text-[11px] text-amber-900 space-y-1">
                            <div className="font-bold flex items-center space-x-1">
                              <FileText strokeWidth={1.5} className="w-3.5 h-3.5 text-amber-700" />
                              <span>Governing Policy Citation: {clauseCitations[0].clauseId} ({clauseCitations[0].section}: {clauseCitations[0].title})</span>
                            </div>
                            <p className="font-sans text-[11px] text-amber-950 leading-relaxed">
                              "{clauseCitations[0].excerpt || clauseCitations[0].complianceRequirement}"
                            </p>
                          </div>
                        )}
                        <div className="text-[11px] text-amber-800">
                          <strong>Required Supervisor Action:</strong> Review customer interaction history, verify credit authorization in CRM, and click <strong>Approve & Send</strong> on the banner above.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Agent Execution Role & Framework */}
                  {policyDoc && (
                    <div className="p-3 rounded-lg bg-white border border-aurora-neutral-200 space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-aurora-neutral-100">
                        <div className="flex items-center space-x-1.5 text-aurora-primary font-bold text-[11px]">
                          <Shield strokeWidth={1.5} className="w-3.5 h-3.5" />
                          <span>Agent Execution Role &amp; Framework ({policyDoc.policyCode})</span>
                        </div>
                        <span className="text-[10px] font-mono text-aurora-neutral-500">{policyDoc.department}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-bold text-aurora-neutral-800 text-[11px] block">Agent Objective:</span>
                          <p className="text-aurora-neutral-600 leading-snug text-[11px]">{policyDoc.governanceObjective}</p>
                        </div>
                        <div>
                          <span className="font-bold text-aurora-neutral-800 text-[11px] block">Transformation Role:</span>
                          <p className="text-aurora-neutral-600 leading-snug text-[11px]">{policyDoc.transformationRole}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Evidence & Action details */}
                  <div className="p-3 rounded-lg bg-white border border-aurora-neutral-200 space-y-1.5">
                    <span className="font-bold text-aurora-neutral-900 block text-[11px] uppercase tracking-wider">
                      Structured Directives & Railguard Evidence:
                    </span>
                    <ul className="space-y-1 text-aurora-neutral-700">
                      {step.details.map((detail, dIdx) => (
                        <li key={dIdx} className="flex items-start space-x-2">
                          <span className="text-aurora-primary font-bold">›</span>
                          <span className="leading-relaxed">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


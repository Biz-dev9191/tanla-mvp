import React, { useState } from 'react';
import { AgentExecutionStep, ReflectionLoopIteration } from '@/core/types';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ChevronDown, ChevronUp, Bot, RefreshCw, BrainCircuit, Shield, Sparkles } from 'lucide-react';

interface AgentStepperProps {
  steps: AgentExecutionStep[];
  currentRunningIndex?: number;
  reflectionLoops?: ReflectionLoopIteration[];
}

const POLICY_CODE_MAP: { [key: string]: { code: string; color: string } } = {
  context: { code: 'CCAP-2026', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  objective: { code: 'ORAP-2026', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  policy_tree: { code: 'PTGAP-2026', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  policy: { code: 'EPAP-2026', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  strategy: { code: 'CSAP-2026', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  message: { code: 'CMGAP-2026', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  guardrail: { code: 'CSGAP-2026', color: 'bg-teal-50 text-teal-700 border-teal-200' },
};

export const AgentStepper: React.FC<AgentStepperProps> = ({ steps, currentRunningIndex, reflectionLoops }) => {
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

          return (
            <div
              key={idx}
              className={`border rounded-lg transition-all ${
                step.status === 'completed'
                  ? 'border-aurora-neutral-200 bg-aurora-neutral-0 hover:border-aurora-neutral-300'
                  : step.status === 'escalated'
                  ? 'border-aurora-warning/30 bg-aurora-warning-light/30'
                  : step.status === 'suppressed'
                  ? 'border-aurora-error/30 bg-aurora-error-light/30'
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
                <div className="p-3.5 border-t border-aurora-neutral-200 bg-aurora-neutral-100 text-xs space-y-3 rounded-b-lg">
                  {/* Chain-of-Thought Trace */}
                  {step.chainOfThought && step.chainOfThought.length > 0 && (
                    <div className="space-y-1.5 p-2.5 rounded bg-white border border-aurora-neutral-200">
                      <div className="flex items-center space-x-1.5 text-aurora-primary font-bold text-[11px]">
                        <BrainCircuit strokeWidth={1.5} className="w-3.5 h-3.5" />
                        <span>Policy-Governed Chain-of-Thought Reasoning Trace ({policyMeta.code}):</span>
                      </div>
                      <ul className="space-y-1 text-aurora-neutral-700 font-mono text-[11px] leading-relaxed">
                        {step.chainOfThought.map((thought, tIdx) => (
                          <li key={tIdx} className="p-1.5 rounded bg-aurora-neutral-100/60 border border-aurora-neutral-200/50">
                            {thought}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Evidence & Action details */}
                  <div>
                    <span className="font-semibold text-aurora-neutral-900 block mb-1">
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

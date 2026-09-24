import React, { useState } from 'react';
import { AgentExecutionStep } from '@/core/types';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ChevronDown, ChevronUp, Bot, RefreshCw } from 'lucide-react';

interface AgentStepperProps {
  steps: AgentExecutionStep[];
  currentRunningIndex?: number;
}

export const AgentStepper: React.FC<AgentStepperProps> = ({ steps, currentRunningIndex }) => {
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
            <span>Revision Required</span>
          </span>
        );
      case 'escalated':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-aurora-warning-light text-aurora-warning border border-aurora-warning/20">
            <AlertTriangle strokeWidth={1.5} className="w-3.5 h-3.5" />
            <span>Escalated</span>
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
    <div className="bg-aurora-neutral-0 rounded-lg p-5 border border-aurora-neutral-200 shadow-aurora">
      <div className="flex items-center justify-between pb-3 border-b border-aurora-neutral-200 mb-4">
        <div className="flex items-center space-x-2">
          <Bot strokeWidth={1.5} className="w-5 h-5 text-aurora-primary" />
          <h2 className="text-sm font-bold text-aurora-neutral-900">Multi-Agent Execution Pipeline</h2>
        </div>
        <span className="text-xs text-aurora-neutral-500 font-mono">
          {steps.filter((s) => s.status === 'completed' || s.status === 'escalated' || s.status === 'suppressed').length} / {steps.length} Agents Executed
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isExpanded = expandedIndex === idx;
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
                  <div className="w-6 h-6 rounded-full bg-aurora-primary-light text-aurora-primary flex items-center justify-center text-xs font-bold font-mono">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs sm:text-sm font-bold text-aurora-neutral-900">{step.agentName}</h4>
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
                <div className="p-3.5 border-t border-aurora-neutral-200 bg-aurora-neutral-100 text-xs space-y-1.5 rounded-b-lg">
                  <span className="font-semibold text-aurora-neutral-900 block mb-1">
                    Agent Action Summary & Evidence:
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

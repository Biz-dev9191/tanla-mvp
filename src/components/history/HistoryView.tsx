import React from 'react';
import { OrchestrationResult } from '@/core/types';
import { History, Eye, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface HistoryViewProps {
  history: OrchestrationResult[];
  onSelectRun: (run: OrchestrationResult) => void;
  onNewRun: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelectRun, onNewRun }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-aurora-neutral-200 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-aurora-primary bg-aurora-primary-light px-2.5 py-1 rounded">
            Governance & Compliance
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-aurora-neutral-900 mt-2 tracking-tight">
            Communication Audit History
          </h1>
          <p className="text-sm text-aurora-neutral-700 mt-1 max-w-2xl leading-relaxed">
            Immutable audit log of all AI agent orchestration runs, applied policy paths, decisions, and guardrail validation verdicts.
          </p>
        </div>

        <button
          onClick={onNewRun}
          className="px-4 py-2 bg-aurora-primary hover:bg-aurora-primary-hover text-white rounded-md text-xs font-bold shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <span>Create New Communication</span>
          <ArrowRight strokeWidth={1.5} className="w-4 h-4" />
        </button>
      </div>

      {history.length === 0 ? (
        <div className="bg-aurora-neutral-0 rounded-lg p-12 text-center border border-aurora-neutral-200 shadow-aurora">
          <History strokeWidth={1.5} className="w-10 h-10 text-aurora-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-aurora-neutral-900">No communication runs yet</h3>
          <p className="text-xs text-aurora-neutral-500 mt-1 max-w-sm mx-auto">
            Create your first AI-orchestrated customer communication from the brief interface.
          </p>
          <button
            onClick={onNewRun}
            className="mt-4 px-4 py-2 bg-aurora-primary text-white rounded-md text-xs font-semibold"
          >
            Create Communication
          </button>
        </div>
      ) : (
        <div className="bg-aurora-neutral-0 rounded-lg border border-aurora-neutral-200 shadow-aurora overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-aurora-neutral-100 border-b border-aurora-neutral-200 text-aurora-neutral-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp / ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Event Summary</th>
                  <th className="py-3 px-4">Objective</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4">Guardrails</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aurora-neutral-200/70">
                {history.map((run) => (
                  <tr key={run.id} className="hover:bg-aurora-neutral-100/60 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-aurora-neutral-500">
                      <div>{run.id}</div>
                      <div className="text-[10px]">{new Date(run.timestamp).toLocaleTimeString()}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-aurora-neutral-900">{run.customer.name}</div>
                      <div className="text-[11px] text-aurora-neutral-500">
                        {run.customer.segment} · {run.customer.digitalProfile}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-aurora-neutral-700">
                      {run.event.title}
                    </td>
                    <td className="py-3 px-4 text-aurora-neutral-900 font-medium">
                      {run.objective.primary.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-aurora-primary font-mono">
                      {run.strategy.selectedChannel}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          run.strategy.decision === 'SEND'
                            ? 'bg-aurora-success-light text-aurora-success border border-aurora-success/20'
                            : run.strategy.decision === 'ESCALATE'
                            ? 'bg-aurora-warning-light text-aurora-warning border border-aurora-warning/20'
                            : 'bg-aurora-error-light text-aurora-error border border-aurora-error/20'
                        }`}
                      >
                        {run.strategy.decision}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center space-x-1 text-aurora-success font-semibold text-[11px]">
                        <CheckCircle2 strokeWidth={1.5} className="w-3.5 h-3.5" />
                        <span>{run.guardrails.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectRun(run)}
                        className="px-2.5 py-1 bg-aurora-neutral-100 hover:bg-aurora-primary hover:text-white border border-aurora-neutral-300 rounded text-xs font-semibold transition flex items-center space-x-1 ml-auto"
                      >
                        <Eye strokeWidth={1.5} className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

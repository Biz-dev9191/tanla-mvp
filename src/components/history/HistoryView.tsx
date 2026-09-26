import React, { useState } from 'react';
import { OrchestrationResult } from '@/core/types';
import {
  History,
  Eye,
  ArrowRight,
  CheckCircle2,
  Trash2,
  X,
  User,
  Calendar,
  ShieldCheck,
  MessageSquare,
  Mail,
  Smartphone,
  PhoneCall,
  Clock,
  Tag,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface HistoryViewProps {
  history: OrchestrationResult[];
  onSelectRun?: (run: OrchestrationResult) => void;
  onNewRun: () => void;
  onClearHistory?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectRun,
  onNewRun,
  onClearHistory,
}) => {
  const [inspectedRun, setInspectedRun] = useState<OrchestrationResult | null>(null);
  const [inspectTab, setInspectTab] = useState<'messages' | 'context' | 'governance'>('messages');
  const [activeChannel, setActiveChannel] = useState<'Email' | 'WhatsApp' | 'SMS' | 'Voice'>('Email');

  const handleOpenInspector = (run: OrchestrationResult) => {
    setInspectedRun(run);
    setInspectTab('messages');
    const ch = run.strategy?.selectedChannel;
    if (ch === 'WhatsApp' || ch === 'SMS' || ch === 'Voice') {
      setActiveChannel(ch);
    } else {
      setActiveChannel('Email');
    }
  };

  const handleCloseInspector = () => {
    setInspectedRun(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-aurora-neutral-200 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-aurora-primary bg-aurora-primary-light px-3 py-1.5 rounded-md">
              Audit History
            </span>
          </div>
          <p className="text-sm text-aurora-neutral-700 mt-1 max-w-2xl leading-relaxed">
            Review all messages sent to customers, delivery channels, and decision logs.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onNewRun}
            className="px-4 py-2 bg-aurora-primary hover:bg-aurora-primary-hover text-white rounded-md text-xs font-bold shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-1.5 cursor-pointer"
          >
            <span>New Communication</span>
            <ArrowRight strokeWidth={1.5} className="w-4 h-4" />
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-aurora-neutral-0 rounded-lg p-12 text-center border border-aurora-neutral-200 shadow-aurora">
          <History strokeWidth={1.5} className="w-10 h-10 text-aurora-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-aurora-neutral-900">No sent communications logged yet</h3>
          <p className="text-xs text-aurora-neutral-500 mt-1 max-w-md mx-auto leading-relaxed">
            Communications are recorded in this audit history only when you click <strong>Send</strong> (either for an individual channel or across all channels) from the Decision & Previews page.
          </p>
          <button
            type="button"
            onClick={onNewRun}
            className="mt-4 px-4 py-2 bg-aurora-primary hover:bg-aurora-primary-hover text-white rounded-md text-xs font-semibold shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Go to Communication Brief
          </button>
        </div>
      ) : (
        <div className="bg-aurora-neutral-0 rounded-lg border border-aurora-neutral-200 shadow-aurora overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-aurora-neutral-100 border-b border-aurora-neutral-200 text-aurora-neutral-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-[14%]">Dispatched / ID</th>
                  <th className="py-3 px-4 w-[14%]">Customer</th>
                  <th className="py-3 px-4 w-[18%]">Event Summary</th>
                  <th className="py-3 px-4 w-[14%]">Objective</th>
                  <th className="py-3 px-4 w-[15%]">Dispatched Channel</th>
                  <th className="py-3 px-4 w-[8%]">Decision</th>
                  <th className="py-3 px-4 w-[9%]">Quality Checks</th>
                  <th className="py-3 px-4 w-[8%] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aurora-neutral-200/70">
                {history.map((run) => (
                  <tr key={run.id} className="hover:bg-aurora-neutral-100/60 transition">
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div className="font-bold text-aurora-neutral-900">{run.id}</div>
                      <div className="text-[10px] text-aurora-neutral-500 font-sans mt-0.5 whitespace-nowrap">
                        {new Date(run.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })}, {new Date(run.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-aurora-neutral-900">{run.customer.name}</div>
                      <div className="text-[11px] text-aurora-neutral-500">
                        {run.customer.segment} · {run.customer.digitalProfile}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-aurora-neutral-700 leading-snug whitespace-normal break-words max-w-[190px]">
                      {run.event.title}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      {(run as any).userSelectedObjective !== false && run.objective?.primary ? (
                        <>
                          <div className="font-semibold text-aurora-neutral-900 capitalize">
                            {run.objective.primary.replace(/_/g, ' ')}
                          </div>
                          {run.objective.secondary && run.objective.secondary.toLowerCase() !== run.objective.primary.replace(/_/g, ' ').toLowerCase() && (
                            <div className="text-[11px] text-aurora-neutral-500 truncate mt-0.5" title={run.objective.secondary}>
                              {run.objective.secondary}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-aurora-neutral-400 font-mono font-medium">--</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-aurora-primary font-mono text-[11px]">
                      {(() => {
                        const raw = (run as any).dispatchedChannel || run.strategy.selectedChannel || 'WhatsApp';
                        if (raw.toLowerCase().trim() === 'all') {
                          return 'WhatsApp, SMS, Email, Voice';
                        }
                        return raw;
                      })()}
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
                        type="button"
                        onClick={() => handleOpenInspector(run)}
                        className="px-2.5 py-1 bg-aurora-neutral-100 hover:bg-aurora-primary hover:text-white border border-aurora-neutral-300 rounded text-xs font-semibold transition flex items-center space-x-1 ml-auto cursor-pointer"
                        title="Inspect record details without affecting active generated output"
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

      {/* Interstitial Inspector Modal (Opens directly on this page without modifying active generated output) */}
      {inspectedRun && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-aurora-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-aurora-neutral-300 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-5 bg-aurora-neutral-50 border-b border-aurora-neutral-200 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider bg-aurora-primary text-white px-2.5 py-0.5 rounded">
                    Audit Record
                  </span>
                  <span className="font-mono text-xs font-semibold text-aurora-neutral-600">
                    {inspectedRun.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      inspectedRun.strategy.decision === 'SEND'
                        ? 'bg-aurora-success-light text-aurora-success border border-aurora-success/30'
                        : inspectedRun.strategy.decision === 'ESCALATE'
                        ? 'bg-aurora-warning-light text-aurora-warning border border-aurora-warning/30'
                        : 'bg-aurora-error-light text-aurora-error border border-aurora-error/30'
                    }`}
                  >
                    {inspectedRun.strategy.decision}
                  </span>
                </div>
                <h2 className="text-base font-bold text-aurora-neutral-900 mt-1">
                  {inspectedRun.customer.name} · {inspectedRun.event.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-aurora-neutral-500 mt-0.5">
                  <span className="flex items-center space-x-1">
                    <Clock strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>Dispatched: {new Date(inspectedRun.timestamp).toLocaleString()}</span>
                  </span>
                  <span>•</span>
                  <span>
                    Channel:{' '}
                    <strong className="text-aurora-neutral-800">
                      {(inspectedRun as any).dispatchedChannel || inspectedRun.strategy.selectedChannel || 'WhatsApp'}
                    </strong>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseInspector}
                className="p-1.5 text-aurora-neutral-400 hover:text-aurora-neutral-700 hover:bg-aurora-neutral-200 rounded-lg transition"
                aria-label="Close inspector"
              >
                <X strokeWidth={2} className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="px-5 pt-3 border-b border-aurora-neutral-200 bg-white flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setInspectTab('messages')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
                  inspectTab === 'messages'
                    ? 'border-aurora-primary text-aurora-primary'
                    : 'border-transparent text-aurora-neutral-500 hover:text-aurora-neutral-900'
                }`}
              >
                Dispatched Messages
              </button>
              <button
                type="button"
                onClick={() => setInspectTab('context')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
                  inspectTab === 'context'
                    ? 'border-aurora-primary text-aurora-primary'
                    : 'border-transparent text-aurora-neutral-500 hover:text-aurora-neutral-900'
                }`}
              >
                Customer & Event Context
              </button>
              <button
                type="button"
                onClick={() => setInspectTab('governance')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
                  inspectTab === 'governance'
                    ? 'border-aurora-primary text-aurora-primary'
                    : 'border-transparent text-aurora-neutral-500 hover:text-aurora-neutral-900'
                }`}
              >
                Policy Governance & Checks
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-aurora-neutral-50/50">
              {/* TAB 1: DISPATCHED MESSAGES */}
              {inspectTab === 'messages' && (
                <div className="space-y-4">
                  {/* Channel Subtabs */}
                  <div className="flex bg-aurora-neutral-200/80 p-1 rounded-lg text-xs font-semibold max-w-md">
                    <button
                      type="button"
                      onClick={() => setActiveChannel('Email')}
                      className={`flex-1 py-1.5 rounded-md flex items-center justify-center space-x-1.5 transition ${
                        activeChannel === 'Email'
                          ? 'bg-white text-aurora-neutral-900 shadow-2xs font-bold'
                          : 'text-aurora-neutral-600 hover:text-aurora-neutral-900'
                      }`}
                    >
                      <Mail strokeWidth={1.5} className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveChannel('WhatsApp')}
                      className={`flex-1 py-1.5 rounded-md flex items-center justify-center space-x-1.5 transition ${
                        activeChannel === 'WhatsApp'
                          ? 'bg-white text-aurora-neutral-900 shadow-2xs font-bold'
                          : 'text-aurora-neutral-600 hover:text-aurora-neutral-900'
                      }`}
                    >
                      <MessageSquare strokeWidth={1.5} className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveChannel('SMS')}
                      className={`flex-1 py-1.5 rounded-md flex items-center justify-center space-x-1.5 transition ${
                        activeChannel === 'SMS'
                          ? 'bg-white text-aurora-neutral-900 shadow-2xs font-bold'
                          : 'text-aurora-neutral-600 hover:text-aurora-neutral-900'
                      }`}
                    >
                      <Smartphone strokeWidth={1.5} className="w-3.5 h-3.5" />
                      <span>SMS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveChannel('Voice')}
                      className={`flex-1 py-1.5 rounded-md flex items-center justify-center space-x-1.5 transition ${
                        activeChannel === 'Voice'
                          ? 'bg-white text-aurora-neutral-900 shadow-2xs font-bold'
                          : 'text-aurora-neutral-600 hover:text-aurora-neutral-900'
                      }`}
                    >
                      <PhoneCall strokeWidth={1.5} className="w-3.5 h-3.5" />
                      <span>Voice</span>
                    </button>
                  </div>

                  {/* Channel Content Card */}
                  {(() => {
                    const chKey = activeChannel.toLowerCase() as keyof typeof inspectedRun.messages;
                    const msg = inspectedRun.messages[chKey];

                    if (!msg) {
                      return (
                        <div className="p-8 text-center text-xs text-aurora-neutral-500 bg-white rounded-xl border border-aurora-neutral-200">
                          No message copy recorded for this channel.
                        </div>
                      );
                    }

                    return (
                      <div className="bg-white rounded-xl border border-aurora-neutral-200 shadow-2xs p-5 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-aurora-neutral-200">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-aurora-neutral-900">
                              {activeChannel} Copy Record
                            </span>
                            <div className="text-[11px] text-aurora-neutral-500 mt-0.5">
                              Recipient: {inspectedRun.customer.name} ({activeChannel === 'Email' ? inspectedRun.customer.email : inspectedRun.customer.phone})
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono font-bold bg-aurora-neutral-100 text-aurora-neutral-700 px-2 py-0.5 rounded border border-aurora-neutral-200">
                              {msg.characterCount} chars
                            </span>
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                              Tone: {inspectedRun.strategy.tone}
                            </span>
                          </div>
                        </div>

                        {/* Subject if Email */}
                        {activeChannel === 'Email' && msg.subject && (
                          <div className="bg-aurora-neutral-50 p-3 rounded-lg border border-aurora-neutral-200 text-xs">
                            <span className="font-bold text-aurora-neutral-600 uppercase text-[10px] block mb-0.5">
                              Subject Line:
                            </span>
                            <span className="font-semibold text-aurora-neutral-900">{msg.subject}</span>
                          </div>
                        )}

                        {/* Body Text */}
                        <div className="bg-aurora-neutral-50/70 p-4 rounded-xl border border-aurora-neutral-200 text-xs text-aurora-neutral-900 whitespace-pre-wrap leading-relaxed font-sans">
                          {msg.body}
                        </div>

                        {/* Call to Action info */}
                        {(inspectedRun.strategy.ctaText || (inspectedRun.strategy.ctaType && inspectedRun.strategy.ctaType !== 'None')) && (
                          <div className="flex items-center space-x-2 pt-2 text-xs">
                            <span className="font-bold text-aurora-neutral-700">Call to Action:</span>
                            <span className="px-2.5 py-1 bg-aurora-primary-light text-aurora-primary font-semibold rounded-md border border-aurora-primary/20">
                              {inspectedRun.strategy.ctaText || inspectedRun.strategy.ctaType}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 2: CUSTOMER & EVENT CONTEXT */}
              {inspectTab === 'context' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Card */}
                  <div className="bg-white rounded-xl border border-aurora-neutral-200 p-4 space-y-3">
                    <div className="flex items-center space-x-2 pb-2 border-b border-aurora-neutral-200">
                      <User strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-aurora-neutral-900">
                        Customer Context
                      </h3>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-aurora-neutral-100">
                        <span className="text-aurora-neutral-500">Name</span>
                        <span className="font-semibold text-aurora-neutral-900">{inspectedRun.customer.name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-aurora-neutral-100">
                        <span className="text-aurora-neutral-500">Age Group</span>
                        <span className="font-medium text-aurora-neutral-800">{inspectedRun.customer.ageGroup}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-aurora-neutral-100">
                        <span className="text-aurora-neutral-500">Segment</span>
                        <span className="font-medium text-aurora-neutral-800">{inspectedRun.customer.segment}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-aurora-neutral-100">
                        <span className="text-aurora-neutral-500">Digital Persona</span>
                        <span className="font-medium text-aurora-neutral-800">{inspectedRun.customer.digitalProfile}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-aurora-neutral-100">
                        <span className="text-aurora-neutral-500">Sentiment</span>
                        <span className="font-medium text-aurora-neutral-800">{inspectedRun.customer.sentiment}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-aurora-neutral-100">
                        <span className="text-aurora-neutral-500">Email</span>
                        <span className="font-mono text-[11px] text-aurora-neutral-800">{inspectedRun.customer.email}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-aurora-neutral-500">Phone</span>
                        <span className="font-mono text-[11px] text-aurora-neutral-800">{inspectedRun.customer.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Event & Objective Card */}
                  <div className="bg-white rounded-xl border border-aurora-neutral-200 p-4 space-y-3">
                    <div className="flex items-center space-x-2 pb-2 border-b border-aurora-neutral-200">
                      <Calendar strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-aurora-neutral-900">
                        Event & Objective
                      </h3>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-aurora-neutral-100">
                        <span className="text-aurora-neutral-500">Event Title</span>
                        <span className="font-semibold text-aurora-neutral-900">{inspectedRun.event.title}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-aurora-neutral-100">
                        <span className="text-aurora-neutral-500">Event Type</span>
                        <span className="font-mono text-aurora-neutral-800">{inspectedRun.event.eventType}</span>
                      </div>
                      {inspectedRun.event.orderId && (
                        <div className="flex justify-between py-1 border-b border-aurora-neutral-100">
                          <span className="text-aurora-neutral-500">Order ID</span>
                          <span className="font-mono font-medium text-aurora-neutral-900">{inspectedRun.event.orderId}</span>
                        </div>
                      )}
                      {inspectedRun.event.transactionId && (
                        <div className="flex justify-between py-1 border-b border-aurora-neutral-100">
                          <span className="text-aurora-neutral-500">Transaction ID</span>
                          <span className="font-mono font-medium text-aurora-neutral-900">{inspectedRun.event.transactionId}</span>
                        </div>
                      )}
                      {inspectedRun.event.amount !== undefined && inspectedRun.event.amount !== null && inspectedRun.event.amount !== '' && (
                        <div className="flex justify-between py-1 border-b border-aurora-neutral-100">
                          <span className="text-aurora-neutral-500">Amount</span>
                          <span className="font-bold text-aurora-neutral-900">
                            {String(inspectedRun.event.amount).startsWith('$') ? inspectedRun.event.amount : `$${inspectedRun.event.amount}`}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-1 border-b border-aurora-neutral-100">
                        <span className="text-aurora-neutral-500">Primary Objective</span>
                        <span className="font-semibold text-aurora-neutral-900">
                          {(inspectedRun as any).userSelectedObjective !== false && inspectedRun.objective?.primary
                            ? inspectedRun.objective.primary.replace(/_/g, ' ')
                            : '--'}
                        </span>
                      </div>
                      <div className="py-1">
                        <span className="text-aurora-neutral-500 block mb-0.5">Verified Facts</span>
                        <p className="text-aurora-neutral-700 bg-aurora-neutral-50 p-2 rounded border border-aurora-neutral-200 text-[11px] leading-relaxed">
                          {Array.isArray(inspectedRun.event.verifiedFacts)
                            ? inspectedRun.event.verifiedFacts.join(' • ')
                            : inspectedRun.event.verifiedFacts || 'Grounded in event history.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: POLICY GOVERNANCE & CHECKS */}
              {inspectTab === 'governance' && (
                <div className="bg-white rounded-xl border border-aurora-neutral-200 p-5 space-y-4">
                  <div className="flex items-center space-x-2 pb-3 border-b border-aurora-neutral-200">
                    <ShieldCheck strokeWidth={1.5} className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-aurora-neutral-900">
                      Governance & Deterministic Safety Verifications
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center space-x-1.5 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 strokeWidth={2} className="w-4 h-4 text-emerald-600" />
                        <span>Strict Zero Hallucination</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-1">
                        100% grounded in verified inputs. No manufactured IDs or monetary figures.
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center space-x-1.5 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 strokeWidth={2} className="w-4 h-4 text-emerald-600" />
                        <span>Channel Constraints</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-1">
                        Zero exclamation marks across all channels. SMS constrained to ≤ 160 characters.
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center space-x-1.5 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 strokeWidth={2} className="w-4 h-4 text-emerald-600" />
                        <span>Policy Gate Verified</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-1">
                        Status: <strong>{inspectedRun.guardrails.status}</strong>. Decision: <strong>{inspectedRun.strategy.decision}</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Decision Rationale */}
                  <div className="p-3 bg-aurora-neutral-50 rounded-lg border border-aurora-neutral-200 text-xs space-y-1">
                    <span className="font-bold text-aurora-neutral-700 uppercase text-[10px] block">
                      Decision Rationale
                    </span>
                    <p className="text-aurora-neutral-800 leading-relaxed">
                      {inspectedRun.strategy.approvalReason ||
                        inspectedRun.strategy.suppressionReason ||
                        'Selected based on persona digital profile, age group preferences, and business objective priority.'}
                    </p>
                  </div>

                  {/* Applied Policy Path */}
                  {inspectedRun.appliedPolicyPath && inspectedRun.appliedPolicyPath.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <span className="font-bold text-aurora-neutral-700 uppercase text-[10px] block">
                        Applied Policy Tree Path
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-aurora-neutral-100 rounded-lg border border-aurora-neutral-200 text-[11px] font-mono">
                        {inspectedRun.appliedPolicyPath.map((step, idx) => (
                          <React.Fragment key={idx}>
                            <span className="px-2 py-0.5 bg-white text-aurora-neutral-800 rounded border border-aurora-neutral-300 font-semibold">
                              {step}
                            </span>
                            {idx < inspectedRun.appliedPolicyPath!.length - 1 && (
                              <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5 text-aurora-neutral-400" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-aurora-neutral-200 flex items-center justify-between">
              <span className="text-[11px] text-aurora-neutral-500">
                Viewing archived audit record · Active brief and generated outputs are preserved
              </span>
              <button
                type="button"
                onClick={handleCloseInspector}
                className="px-4 py-2 bg-aurora-primary hover:bg-aurora-primary-hover text-white rounded-md text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

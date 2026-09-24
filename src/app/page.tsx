'use client';

import React, { useState, useEffect } from 'react';
import { CustomerProfile, BusinessEvent, BusinessObjective, OrchestrationResult, BusinessObjectiveType } from '@/core/types';
import { PRESET_SCENARIOS } from '@/core/presets';
import { Header } from '@/components/layout/Header';
import { CommunicationBrief } from '@/components/brief/CommunicationBrief';
import { AgentStepper } from '@/components/control-room/AgentStepper';
import { DecisionTraceView } from '@/components/control-room/DecisionTraceView';
import { StrategyCard } from '@/components/control-room/StrategyCard';
import { PolicyPathViewer } from '@/components/control-room/PolicyPathViewer';
import { HumanApprovalBanner } from '@/components/control-room/HumanApprovalBanner';
import { ChannelPreviewTabs } from '@/components/preview/ChannelPreviewTabs';
import { QualityScorecard } from '@/components/preview/QualityScorecard';
import { CustomerResponseSimulator } from '@/components/preview/CustomerResponseSimulator';
import { InteractiveTree } from '@/components/policy/InteractiveTree';
import { PolicyDetailModal } from '@/components/policy/PolicyDetailModal';
import { PolicyUploader } from '@/components/policy/PolicyUploader';
import { KnowledgeBaseView } from '@/components/knowledge/KnowledgeBaseView';
import { HistoryView } from '@/components/history/HistoryView';
import { PolicyTreeNode, defaultPolicyTree } from '@/core/policy-tree-data';
import { DynamicPolicyParseResult } from '@/core/policy-generator';
import { ArrowLeft, RefreshCw, AlertCircle, Sparkles, ShieldCheck, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'brief' | 'control-room' | 'policy-tree' | 'knowledge-base' | 'history'>('brief');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<OrchestrationResult | null>(null);
  const [history, setHistory] = useState<OrchestrationResult[]>([]);
  const [selectedPolicyNode, setSelectedPolicyNode] = useState<PolicyTreeNode | null>(null);
  const [customPolicyTree, setCustomPolicyTree] = useState<PolicyTreeNode | null>(null);
  const [customPolicyRules, setCustomPolicyRules] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedHistory = localStorage.getItem('aurora_orchestration_history');
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } catch (e) {
        console.warn('Could not load history from storage:', e);
      }
    }
  }, []);

  // Run orchestration
  const handleRunOrchestration = async (payload: any) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // Validate that all 3 columns have at least 1 input
      if (payload.customerProfileText !== undefined) {
        const hasCol1 = payload.customerProfileText.trim().length > 0 || (payload.customerPills && payload.customerPills.length > 0);
        const hasCol2 = payload.eventHistoryText.trim().length > 0 || (payload.eventPills && payload.eventPills.length > 0);
        const hasCol3 = payload.objectiveText.trim().length > 0 || (payload.objectivePills && payload.objectivePills.length > 0);

        if (!hasCol1 || !hasCol2 || !hasCol3) {
          throw new Error("Please provide at least one detail (text description, filter pill, or structured field) in each of the 3 columns to proceed.");
        }
      }

      const geminiKey = typeof window !== 'undefined' ? localStorage.getItem('aurora_gemini_key') || undefined : undefined;
      const openaiKey = typeof window !== 'undefined' ? localStorage.getItem('aurora_openai_key') || undefined : undefined;

      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          customRules: customPolicyRules.length > 0 ? customPolicyRules : undefined,
          geminiKey,
          openaiKey,
        }),
      });

      const data: OrchestrationResult = await res.json();

      if (!res.ok) {
        throw new Error((data as any).error || 'Orchestration execution failed.');
      }

      setCurrentResult(data);
      setHistory((prev) => {
        const updated = [data, ...prev];
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('aurora_orchestration_history', JSON.stringify(updated.slice(0, 50)));
          } catch (e) {}
        }
        return updated;
      });
      setActiveTab('control-room');
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during agent orchestration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-run with pivoted objective
  const handlePivotObjective = async (newObjective: BusinessObjectiveType) => {
    if (!currentResult) return;
    const updatedObjective: BusinessObjective = {
      ...currentResult.objective,
      primary: newObjective,
    };
    await handleRunOrchestration({
      customer: currentResult.customer,
      event: currentResult.event,
      objective: updatedObjective,
    });
  };

  // Dynamic policy applied
  const handleApplyDynamicPolicy = (result: DynamicPolicyParseResult) => {
    setCustomPolicyTree(result.tree);
    setCustomPolicyRules(result.rules);
    if (currentResult) {
      setCurrentResult({
        ...currentResult,
        appliedPolicies: result.rules,
      });
    }
  };


  // Human approval handlers
  const handleApprove = () => {
    if (!currentResult) return;
    setCurrentResult({
      ...currentResult,
      humanApprovalStatus: 'Approved',
      strategy: {
        ...currentResult.strategy,
        decision: 'SEND',
      },
    });
  };

  const handleRequestRevision = () => {
    if (!currentResult) return;
    handleRunOrchestration({
      customer: currentResult.customer,
      event: currentResult.event,
      objective: currentResult.objective,
    });
  };

  const handleSuppress = () => {
    if (!currentResult) return;
    setCurrentResult({
      ...currentResult,
      humanApprovalStatus: 'Rejected',
      strategy: {
        ...currentResult.strategy,
        decision: 'SUPPRESS',
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-aurora-neutral-100 text-aurora-neutral-900 font-sans">
      <Header
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t)}
      />

      {errorMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 bg-aurora-error-light border border-aurora-error/30 rounded-lg flex items-center justify-between text-xs text-aurora-error font-semibold">
            <div className="flex items-center space-x-2">
              <AlertCircle strokeWidth={1.5} className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-aurora-neutral-900 underline">
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 pb-16">
        {/* HOME VIEW: ONLY HERO SECTION */}
        {activeTab === 'home' && (
          <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto my-auto flex flex-col justify-center items-center text-center">
            <div className="space-y-6 max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-aurora-primary-light border border-aurora-primary/10 rounded-full text-xs font-semibold text-aurora-primary">
                <Sparkles strokeWidth={1.5} className="w-4 h-4" />
                <span>Enterprise Agentic Communication Layer</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-aurora-neutral-900 leading-tight">
                From customer event to the right conversation.
              </h1>

              <p className="text-base sm:text-lg text-aurora-neutral-700 leading-relaxed max-w-2xl mx-auto">
                An AI agent system that understands customer context, consults company policies, determines the communication strategy, crafts channel-tailored messages, validates deterministic safety guardrails, and executes live communications.
              </p>

              {/* ONLY Get Started CTA */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('brief')}
                  className="inline-flex items-center space-x-2.5 px-8 py-3.5 bg-aurora-primary hover:bg-aurora-primary-dark text-white rounded-md text-sm font-semibold shadow-aurora transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Get Started</span>
                  <ArrowRight strokeWidth={1.5} className="w-4 h-4" />
                </button>
              </div>

              {/* Minimal Trust Indicator Badges */}
              <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-aurora-neutral-200 text-xs font-medium text-aurora-neutral-700">
                <div className="p-3 bg-aurora-neutral-0 rounded-lg border border-aurora-neutral-200">
                  <div className="font-bold text-aurora-neutral-900">Context Grounded</div>
                  <p className="text-aurora-neutral-500 text-[11px] mt-0.5">Dual-mode brief input</p>
                </div>
                <div className="p-3 bg-aurora-neutral-0 rounded-lg border border-aurora-neutral-200">
                  <div className="font-bold text-aurora-neutral-900">Policy Governed</div>
                  <p className="text-aurora-neutral-500 text-[11px] mt-0.5">Dynamic document tree</p>
                </div>
                <div className="p-3 bg-aurora-neutral-0 rounded-lg border border-aurora-neutral-200">
                  <div className="font-bold text-aurora-neutral-900">Multi-Channel</div>
                  <p className="text-aurora-neutral-500 text-[11px] mt-0.5">WhatsApp, SMS, Email, Voice</p>
                </div>
                <div className="p-3 bg-aurora-neutral-0 rounded-lg border border-aurora-neutral-200">
                  <div className="font-bold text-aurora-neutral-900">Guardrail Engine</div>
                  <p className="text-aurora-neutral-500 text-[11px] mt-0.5">Zero-hallucination checks</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Communication Brief */}
        {activeTab === 'brief' && (
          <div id="brief-section">
            <CommunicationBrief onRunOrchestration={handleRunOrchestration} isLoading={isLoading} />
          </div>
        )}

        {/* Tab 2: Agent Control Room */}
        {activeTab === 'control-room' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {currentResult ? (
              <>
                {/* Top Control Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-aurora-neutral-200 gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setActiveTab('brief')}
                        className="p-1 text-aurora-neutral-500 hover:text-aurora-neutral-900 hover:bg-aurora-neutral-200 rounded"
                        title="Back to Brief"
                      >
                        <ArrowLeft strokeWidth={1.5} className="w-4 h-4" />
                      </button>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-aurora-primary bg-aurora-primary-light px-2.5 py-1 rounded">
                        Agent Control Room
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-aurora-neutral-900 mt-2 tracking-tight">
                      Communication Decision & Execution
                    </h1>
                    <p className="text-xs text-aurora-neutral-500 mt-0.5 font-mono">
                      Run ID: {currentResult.id} · Customer: {currentResult.customer.name} ({currentResult.customer.segment})
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('brief')}
                    className="px-4 py-2 bg-aurora-neutral-0 hover:bg-aurora-neutral-100 border border-aurora-neutral-300 text-aurora-neutral-700 rounded-md text-xs font-semibold shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto"
                  >
                    <span>Edit Input Brief</span>
                  </button>
                </div>

                {/* Human Approval Gate (if triggered) */}
                <HumanApprovalBanner
                  status={currentResult.humanApprovalStatus || 'Not Required'}
                  reason={currentResult.strategy.approvalReason}
                  onApprove={handleApprove}
                  onRequestRevision={handleRequestRevision}
                  onSuppress={handleSuppress}
                />

                {/* 1. Multi-Channel Previews (WhatsApp, SMS, Email, Voice) - ON TOP */}
                <ChannelPreviewTabs
                  messages={currentResult.messages}
                  recommendedChannel={currentResult.strategy.selectedChannel}
                  customer={currentResult.customer}
                />

                {/* 2. Message Quality & Guardrail Scorecard */}
                <QualityScorecard guardrails={currentResult.guardrails} />

                {/* 3. Customer Response Simulation */}
                <CustomerResponseSimulator
                  customer={currentResult.customer}
                  event={currentResult.event}
                  message={
                    currentResult.messages[
                      currentResult.strategy.selectedChannel.toLowerCase() as keyof typeof currentResult.messages
                    ] || currentResult.messages.whatsapp
                  }
                />

                {/* 6. Agent Stepper Pipeline with Reflection Loops */}
                <AgentStepper
                  steps={currentResult.agentSteps}
                  reflectionLoops={currentResult.reflectionLoops}
                />

                {/* 7. Grid: Decision Trace + Strategy Card */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <DecisionTraceView
                    trace={currentResult.decisionTrace}
                    isSuppressed={currentResult.strategy.decision === 'SUPPRESS'}
                  />
                  <StrategyCard
                    strategy={currentResult.strategy}
                    primaryObjective={currentResult.objective.primary}
                  />
                </div>

                {/* 8. Applied Policy Path & Clause Citations */}
                <PolicyPathViewer
                  policyPath={currentResult.appliedPolicyPath}
                  appliedPolicies={currentResult.appliedPolicies}
                  clauseCitations={currentResult.clauseCitations}
                />
              </>
            ) : (
              <div className="bg-aurora-neutral-0 rounded-lg p-12 text-center border border-aurora-neutral-200 shadow-aurora">
                <RefreshCw strokeWidth={1.5} className="w-10 h-10 text-aurora-neutral-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-aurora-neutral-900">No active orchestration run</h3>
                <p className="text-xs text-aurora-neutral-500 mt-1 max-w-sm mx-auto">
                  Configure your customer scenario in the communication brief to start agent orchestration.
                </p>
                <button
                  onClick={() => setActiveTab('brief')}
                  className="mt-4 px-4 py-2 bg-aurora-primary text-white rounded-md text-xs font-semibold"
                >
                  Go to Brief
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Policy Tree */}
        {activeTab === 'policy-tree' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="pb-4 border-b border-aurora-neutral-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-aurora-primary bg-aurora-primary-light px-2.5 py-1 rounded">
                Policy Governance
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-aurora-neutral-900 mt-2 tracking-tight">
                Enterprise Policy Tree Explorer
              </h1>
              <p className="text-sm text-aurora-neutral-700 mt-1 max-w-3xl leading-relaxed">
                Upload custom policy documents, paste company rules, or inspect the interactive deterministic rule hierarchy governing all automated outbound communications.
              </p>
            </div>

            {/* Dynamic Policy Document Uploader */}
            <div id="policy-uploader-card">
              <PolicyUploader onApplyDynamicPolicy={handleApplyDynamicPolicy} />
            </div>

            {/* Interactive Policy Tree */}
            <InteractiveTree
              tree={customPolicyTree !== null ? customPolicyTree : currentResult?.policyTree !== undefined ? currentResult.policyTree : null}
              highlightedPath={currentResult?.appliedPolicyPath || ["Communication", "Transactional", "Payment", "Payment Successful", "Order Failed"]}
              onSelectNode={(node) => setSelectedPolicyNode(node)}
              onLoadSampleTree={() => setCustomPolicyTree(defaultPolicyTree)}
              onOpenUploader={() => {
                const el = document.getElementById('policy-uploader-card');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <PolicyDetailModal
              node={selectedPolicyNode}
              onClose={() => setSelectedPolicyNode(null)}
            />
          </div>
        )}

        {/* Tab 4: Knowledge Base */}
        {activeTab === 'knowledge-base' && <KnowledgeBaseView />}

        {/* Tab 5: History */}
        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onSelectRun={(run) => {
              setCurrentResult(run);
              setActiveTab('control-room');
            }}
            onNewRun={() => setActiveTab('brief')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-aurora-neutral-0 border-t border-aurora-neutral-200 py-6 text-center text-xs text-aurora-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Aurora Cloud · AI Customer Communication Orchestrator · Enterprise MVP</span>
          <span>Adheres to Aurora Cloud v1.0 Design & Governance Guidelines</span>
        </div>
      </footer>
    </div>
  );
}

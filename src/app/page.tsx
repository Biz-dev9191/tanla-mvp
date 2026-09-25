'use client';

import React, { useState, useEffect } from 'react';
import { CustomerProfile, BusinessEvent, BusinessObjective, OrchestrationResult, BusinessObjectiveType, PreferredChannel } from '@/core/types';
import { PRESET_SCENARIOS } from '@/core/presets';
import { Header } from '@/components/layout/Header';
import { CommunicationBrief } from '@/components/brief/CommunicationBrief';
import { AgentStepper } from '@/components/control-room/AgentStepper';
import { DecisionTraceView } from '@/components/control-room/DecisionTraceView';
import { StrategyCard } from '@/components/control-room/StrategyCard';
import { HumanApprovalBanner } from '@/components/control-room/HumanApprovalBanner';
import { ChannelPreviewTabs } from '@/components/preview/ChannelPreviewTabs';
import { ExpandableAnalysisSection } from '@/components/control-room/ExpandableAnalysisSection';
import { CustomerResponseSimulator } from '@/components/preview/CustomerResponseSimulator';
import { InteractiveTree } from '@/components/policy/InteractiveTree';
import { PolicyDetailModal } from '@/components/policy/PolicyDetailModal';
import { PolicyUploader } from '@/components/policy/PolicyUploader';
import { KnowledgeBaseView } from '@/components/knowledge/KnowledgeBaseView';
import { HistoryView } from '@/components/history/HistoryView';
import { PolicyTreeNode, defaultPolicyTree } from '@/core/policy-tree-data';
import { DynamicPolicyParseResult, StructuredPolicyDocument, SAMPLE_ENTERPRISE_POLICY, parsePolicyDocumentText } from '@/core/policy-generator';
import { ArrowLeft, RefreshCw, AlertCircle, Sparkles, ShieldCheck, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'brief' | 'control-room' | 'policy-tree' | 'knowledge-base' | 'history'>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<OrchestrationResult | null>(null);
  const [history, setHistory] = useState<OrchestrationResult[]>([]);
  const [selectedPolicyNode, setSelectedPolicyNode] = useState<PolicyTreeNode | null>(null);
  const [customPolicyTree, setCustomPolicyTree] = useState<PolicyTreeNode | null>(null);
  const [customPolicyRules, setCustomPolicyRules] = useState<any[]>([]);
  const [customPolicyDocText, setCustomPolicyDocText] = useState<string | null>(null);
  const [customStructuredDoc, setCustomStructuredDoc] = useState<StructuredPolicyDocument | null>(null);
  const [isApplyingPolicy, setIsApplyingPolicy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Scroll to top whenever active tab changes or page loads
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if ('scrollRestoration' in window.history) {
          window.history.scrollRestoration = 'manual';
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      } catch (e) {
        window.scrollTo(0, 0);
      }
    }
  }, [activeTab]);

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

      const activeRules = payload.customRules !== undefined ? payload.customRules : (customPolicyRules.length > 0 ? customPolicyRules : undefined);
      const activeDocText = payload.customPolicyDocText !== undefined ? payload.customPolicyDocText : (customPolicyDocText || undefined);

      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          customRules: activeRules,
          customPolicyDocText: activeDocText,
          useSamplePolicyTree: true,
          geminiKey,
          openaiKey,
        }),
      });

      const data: OrchestrationResult = await res.json();

      if (!res.ok) {
        throw new Error((data as any).error || 'Orchestration execution failed.');
      }

      setCurrentResult(data);
      setActiveTab('control-room');
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during agent orchestration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Log sent communication to Audit History
  const handleSendMessage = (target: { channel: string; channelName: string; timestamp: string }) => {
    if (!currentResult) return;
    
    let resolvedChannel: PreferredChannel = 'WhatsApp';
    let dispatchedChannelName = target.channelName || target.channel;

    if (dispatchedChannelName.includes(',')) {
      // Multi-channel list (e.g., 'WhatsApp, Email' or 'WhatsApp, SMS, Email, Voice')
      const first = dispatchedChannelName.split(',')[0].trim() as PreferredChannel;
      resolvedChannel = first || 'WhatsApp';
    } else {
      const chLower = dispatchedChannelName.toLowerCase();
      if (chLower.includes('sms')) {
        resolvedChannel = 'SMS';
        dispatchedChannelName = 'SMS';
      } else if (chLower.includes('email')) {
        resolvedChannel = 'Email';
        dispatchedChannelName = 'Email';
      } else if (chLower.includes('voice')) {
        resolvedChannel = 'Voice';
        dispatchedChannelName = 'Voice';
      } else {
        resolvedChannel = 'WhatsApp';
        dispatchedChannelName = 'WhatsApp';
      }
    }

    const dispatchedRun: any = {
      ...currentResult,
      id: `DISP-${Date.now()}`,
      timestamp: new Date().toISOString(),
      dispatchedChannel: dispatchedChannelName,
      strategy: {
        ...currentResult.strategy,
        selectedChannel: resolvedChannel,
      },
    };

    setHistory((prev) => {
      const updated = [dispatchedRun, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('aurora_orchestration_history', JSON.stringify(updated.slice(0, 50)));
        } catch (e) {}
      }
      return updated;
    });
  };

  // Clear Audit History
  const handleClearHistory = () => {
    setHistory([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('aurora_orchestration_history');
      } catch (e) {}
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
      customRules: customPolicyRules,
      customPolicyDocText: customPolicyDocText || undefined,
    });
  };

  // 1. Generate policy tree from uploaded/pasted text
  const handleGeneratePolicyTree = (result: DynamicPolicyParseResult, rawPolicyText: string) => {
    if (result.isValid && result.tree) {
      setCustomPolicyTree(result.tree);
      setCustomPolicyRules(result.rules);
      setCustomStructuredDoc(result.structuredDocument || null);
      setCustomPolicyDocText(rawPolicyText);
    } else {
      setCustomPolicyTree(null);
      setCustomPolicyRules([]);
      setCustomStructuredDoc(null);
      setCustomPolicyDocText(null);
    }
  };

  // 2. Apply generated policy tree to current run and regenerate output
  const handleApplyToCurrentRun = async () => {
    try {
      setIsApplyingPolicy(true);
      if (currentResult) {
        await handleRunOrchestration({
          customer: currentResult.customer,
          event: currentResult.event,
          objective: currentResult.objective,
          customRules: customPolicyRules,
          customPolicyDocText: customPolicyDocText || undefined,
          useSamplePolicyTree: true,
        });
      } else {
        await handleRunOrchestration({
          customerProfileText: "Customer: Standard Customer, Segment: Standard",
          eventHistoryText: "Payment succeeded for online transaction, order confirmation pending",
          objectiveText: "Primary Objective: Reassure customer of order status and payment safety",
          customRules: customPolicyRules,
          customPolicyDocText: customPolicyDocText || undefined,
          useSamplePolicyTree: true,
        });
      }
      setActiveTab('control-room');
    } finally {
      setIsApplyingPolicy(false);
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
      customRules: customPolicyRules.length > 0 ? customPolicyRules : undefined,
      customPolicyDocText: customPolicyDocText || undefined,
      useSamplePolicyTree: true,
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
        hasActiveRun={Boolean(currentResult)}
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
          <div className="pt-8 pb-14 sm:pt-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col justify-center items-center text-center">
            <div className="space-y-6 max-w-3xl">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-aurora-neutral-900 leading-tight">
                From customer event to the right conversation.
              </h1>

              <p className="text-base sm:text-lg text-aurora-neutral-700 leading-relaxed max-w-2xl mx-auto">
                An AI agent system that understands customer context, consults company policies, determines the communication strategy, crafts channel-tailored messages, validates deterministic safety guardrails, and executes live communications.
              </p>

              {/* ONLY Get Started CTA */}
              <div className="pt-2">
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
              <div className="pt-8 sm:pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-aurora-neutral-200 text-xs font-medium text-aurora-neutral-700">
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
            <CommunicationBrief
              onRunOrchestration={handleRunOrchestration}
              isLoading={isLoading}
              onNavigateToPolicyTree={() => setActiveTab('policy-tree')}
            />
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
                        Decision & Previews
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-aurora-neutral-900 mt-2 tracking-tight">
                      Decision & Previews
                    </h1>
                    <p className="text-sm text-aurora-neutral-700 mt-1 max-w-3xl leading-relaxed">
                      Review AI decisions, multi-channel message previews, safety guardrail checks, and customer response simulations.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('brief')}
                    className="px-4 py-2 bg-aurora-neutral-0 hover:bg-aurora-neutral-100 border border-aurora-neutral-300 text-aurora-neutral-700 rounded-md text-xs font-semibold shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-1.5 self-start sm:self-auto"
                  >
                    <span>Edit Brief</span>
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
                  onSendMessage={handleSendMessage}
                  humanApprovalRequired={currentResult.strategy.humanApprovalRequired}
                  humanApprovalStatus={currentResult.humanApprovalStatus}
                />

                {/* 2. Multi-Agent Execution Pipeline with Reflection Loops */}
                <AgentStepper
                  steps={currentResult.agentSteps}
                  reflectionLoops={currentResult.reflectionLoops}
                  clauseCitations={currentResult.clauseCitations}
                />

                {/* 3. Customer Roleplay & Multi-Turn Situation Simulator */}
                <CustomerResponseSimulator
                  customer={currentResult.customer}
                  event={currentResult.event}
                  message={
                    currentResult.messages[
                      currentResult.strategy.selectedChannel.toLowerCase() as keyof typeof currentResult.messages
                    ] || currentResult.messages.whatsapp
                  }
                />

                {/* 4. Expandable Analysis Section (Collapsed by default) */}
                <ExpandableAnalysisSection
                  guardrails={currentResult.guardrails}
                  strategy={currentResult.strategy}
                  primaryObjective={currentResult.objective.primary}
                  trace={currentResult.decisionTrace}
                  appliedPolicyPath={currentResult.appliedPolicyPath}
                  appliedPolicies={currentResult.appliedPolicies}
                  clauseCitations={currentResult.clauseCitations}
                  hasPolicyTreeOrCitations={Boolean(
                    (currentResult.appliedPolicies && currentResult.appliedPolicies.length > 0) ||
                    (currentResult.clauseCitations && currentResult.clauseCitations.length > 0) ||
                    (currentResult.policyTree !== null && currentResult.policyTree !== undefined)
                  )}
                />
              </>
            ) : (
              <div className="bg-aurora-neutral-0 rounded-lg p-12 text-center border border-aurora-neutral-200 shadow-aurora">
                <RefreshCw strokeWidth={1.5} className="w-10 h-10 text-aurora-neutral-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-aurora-neutral-900">No active communication generated yet</h3>
                <p className="text-xs text-aurora-neutral-500 mt-1 max-w-sm mx-auto">
                  Configure customer details and event information in the brief to generate multi-channel communications.
                </p>
                <button
                  onClick={() => setActiveTab('brief')}
                  className="mt-4 px-4 py-2 bg-aurora-primary hover:bg-aurora-primary-hover text-white rounded-md text-xs font-semibold shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Go to Communication Brief
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Policy Tree */}
        {activeTab === 'policy-tree' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
                    Policy Governance
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-aurora-neutral-900 mt-2 tracking-tight">
                  Policy Governance Rules
                </h1>
                <p className="text-sm text-aurora-neutral-700 mt-1 max-w-3xl leading-relaxed">
                  View governance rules or upload custom policy documents to dynamically steer agent communications.
                </p>
              </div>

              {/* Top Navigation CTAs */}
              <div className="flex items-center space-x-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('brief')}
                  className="px-3.5 py-2 bg-white hover:bg-aurora-neutral-100 border border-aurora-neutral-300 text-aurora-neutral-800 rounded-md text-xs font-semibold shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-1.5"
                >
                  <ArrowLeft strokeWidth={1.5} className="w-3.5 h-3.5" />
                  <span>Back to Brief</span>
                </button>
                <button
                  type="button"
                  onClick={() => currentResult && setActiveTab('control-room')}
                  disabled={!currentResult}
                  className={`px-3.5 py-2 rounded-md text-xs font-semibold shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 flex items-center space-x-1.5 ${
                    currentResult
                      ? 'bg-aurora-primary hover:bg-aurora-primary-hover text-white cursor-pointer'
                      : 'bg-aurora-neutral-200 text-aurora-neutral-400 border border-aurora-neutral-300 cursor-not-allowed opacity-60'
                  }`}
                  title={!currentResult ? 'Generate a communication in brief first to view message review' : undefined}
                >
                  <span>Decision & Previews</span>
                  <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dynamic Policy Document Uploader */}
            <div id="policy-uploader-card">
              <PolicyUploader
                onGeneratePolicyTree={handleGeneratePolicyTree}
                activePolicyText={customPolicyDocText || undefined}
              />
            </div>

            {/* Interactive Policy Tree */}
            <InteractiveTree
              tree={customPolicyTree !== null ? customPolicyTree : currentResult?.policyTree !== undefined ? currentResult.policyTree : null}
              highlightedPath={currentResult?.appliedPolicyPath || ["Communication", "Transactional", "Payment", "Payment Successful", "Order Failed"]}
              onSelectNode={(node) => setSelectedPolicyNode(node)}
              onLoadSampleTree={() => {
                const parsed = parsePolicyDocumentText(SAMPLE_ENTERPRISE_POLICY);
                if (parsed.isValid && parsed.tree) {
                  setCustomPolicyTree(parsed.tree);
                  setCustomPolicyRules(parsed.rules);
                  setCustomStructuredDoc(parsed.structuredDocument || null);
                  setCustomPolicyDocText(SAMPLE_ENTERPRISE_POLICY);
                } else {
                  setCustomPolicyTree(defaultPolicyTree);
                  setCustomPolicyRules([]);
                  setCustomStructuredDoc(null);
                  setCustomPolicyDocText(null);
                }
              }}
              onOpenUploader={() => {
                const el = document.getElementById('policy-uploader-card');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onApplyToCurrentRun={handleApplyToCurrentRun}
              canApplyToCurrentRun={Boolean(customPolicyTree || (customPolicyRules && customPolicyRules.length > 0))}
              isApplying={isApplyingPolicy}
            />

            <PolicyDetailModal
              node={selectedPolicyNode}
              onClose={() => setSelectedPolicyNode(null)}
            />
          </div>
        )}

        {/* Tab 4: Knowledge Base */}
        {activeTab === 'knowledge-base' && (
          <KnowledgeBaseView
            customPolicyTree={customPolicyTree}
            customPolicyRules={customPolicyRules}
            customPolicyDocText={customPolicyDocText}
            customStructuredDoc={customStructuredDoc}
            onNavigateToPolicyTree={() => setActiveTab('policy-tree')}
            onNavigateToControlRoom={() => setActiveTab('control-room')}
            onNavigateToBrief={() => setActiveTab('brief')}
            hasActiveRun={Boolean(currentResult)}
          />
        )}

        {/* Tab 5: History */}
        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onSelectRun={(run) => {
              setCurrentResult(run);
              setActiveTab('control-room');
            }}
            onNewRun={() => setActiveTab('brief')}
            onClearHistory={handleClearHistory}
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

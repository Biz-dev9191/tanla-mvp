import React, { useState } from 'react';
import { CHANNEL_GUIDELINES } from '@/core/knowledge-base';
import { CUSTOMER_PERSONA_CATALOG, CustomerPersona } from '@/core/personas';
import { AGENT_GOVERNANCE_POLICIES, AGENT_TRANSFORMATION_HIERARCHY } from '@/core/agent-policies';
import { PolicyTreeNode, defaultPolicyTree } from '@/core/policy-tree-data';
import { StructuredPolicyDocument } from '@/core/policy-generator';
import {
  Smartphone,
  Check,
  Search,
  Users,
  Layers,
  Shield,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Calculator,
  HelpCircle,
  Clock,
  Sparkles,
  BarChart3,
  HeartHandshake,
  CheckCircle2,
  Network,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  GitBranch,
} from 'lucide-react';

interface KnowledgeBaseViewProps {
  customPolicyTree?: PolicyTreeNode | null;
  customPolicyRules?: any[];
  customPolicyDocText?: string | null;
  customStructuredDoc?: StructuredPolicyDocument | null;
  onNavigateToPolicyTree?: () => void;
  onNavigateToControlRoom?: () => void;
  onNavigateToBrief?: () => void;
  hasActiveRun?: boolean;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  customPolicyTree,
  customPolicyRules,
  customPolicyDocText,
  customStructuredDoc,
  onNavigateToPolicyTree,
  onNavigateToControlRoom,
  onNavigateToBrief,
  hasActiveRun = false,
}) => {
  const [activeSection, setActiveSection] = useState<'agent_policies' | 'policy_tree' | 'heuristics' | 'personas' | 'hierarchy' | 'channels'>('agent_policies');
  const [personaSearch, setPersonaSearch] = useState<string>('');
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [selectedAgentPolicy, setSelectedAgentPolicy] = useState<string>('CCAP-2026-v2.4');
  const [policySearch, setPolicySearch] = useState<string>('');
  const [expandedTreeNodes, setExpandedTreeNodes] = useState<Record<string, boolean>>({
    'custom-root': true,
    root: true,
  });
  const [showRawDoc, setShowRawDoc] = useState<boolean>(false);

  const toggleTreeNode = (nodeId: string) => {
    setExpandedTreeNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const hasPolicyDocument = Boolean(
    customPolicyTree ||
    (customPolicyRules && customPolicyRules.length > 0) ||
    customStructuredDoc ||
    (customPolicyDocText && customPolicyDocText.trim().length > 0)
  );

  const activeSections = customStructuredDoc?.sections || (customPolicyTree?.children ? customPolicyTree.children.map((child, idx) => ({
    sectionId: child.id,
    sectionNumber: `${idx + 1}.0`,
    title: child.name,
    category: (child.category || 'governance') as any,
    description: child.description || '',
    clauses: (child.children || []).map((c, cIdx) => ({
      clauseId: c.ruleCode || `CLAUSE-${idx + 1}.${cIdx + 1}`,
      sectionId: child.id,
      sectionTitle: child.name,
      title: c.name,
      statement: c.description || c.allowedSummary || c.name,
      directive: (c.prohibitedSummary && !c.allowedSummary ? 'PROHIBITIVE' : 'MANDATORY') as any,
      category: (child.category || 'governance') as any,
      allowedActions: c.allowedSummary ? [c.allowedSummary] : [],
      prohibitedActions: c.prohibitedSummary ? [c.prohibitedSummary] : [],
      escalationRequired: Boolean((c as any).requiresHumanSupervisor),
      thresholdAmount: (c as any).escalationThreshold,
    })),
  })) : []);

  const activeRulesList = (customPolicyRules && customPolicyRules.length > 0)
    ? customPolicyRules
    : (customStructuredDoc?.sections.flatMap(s => s.clauses.map(c => ({
        ruleCode: c.clauseId,
        name: c.title,
        description: c.statement,
        category: c.category,
        enforcementLevel: c.directive,
        condition: c.statement,
        action: c.allowedActions.join('; ') || c.statement,
        prohibition: c.prohibitedActions.join('; ') || 'Standard adherence',
        escalationThreshold: c.thresholdAmount,
        requiresHumanSupervisor: c.escalationRequired,
        railguardCheck: c.directive === 'PROHIBITIVE' ? 'Forbidden in customer copy' : 'Mandatory in orchestration',
      }))) || []);

  const activeRuleCount = activeRulesList.length || customStructuredDoc?.totalClauses || 0;
  const escalationCount = customStructuredDoc?.escalationClauseCount || activeRulesList.filter((r: any) => r.requiresHumanSupervisor || r.escalationThreshold !== undefined).length;

  // Filter Personas
  const filteredPersonas = CUSTOMER_PERSONA_CATALOG.filter((p) => {
    const matchesCohort = selectedCohort === 'all' || p.cohort.toLowerCase().includes(selectedCohort.toLowerCase());
    const matchesSearch =
      !personaSearch.trim() ||
      p.name.toLowerCase().includes(personaSearch.toLowerCase()) ||
      p.archetype.toLowerCase().includes(personaSearch.toLowerCase()) ||
      p.tonePreference.toLowerCase().includes(personaSearch.toLowerCase()) ||
      p.communicationStyle.toLowerCase().includes(personaSearch.toLowerCase());
    return matchesCohort && matchesSearch;
  });

  const currentPolicy = AGENT_GOVERNANCE_POLICIES.find((p) => p.policyCode === selectedAgentPolicy) || AGENT_GOVERNANCE_POLICIES[0];

  const renderInteractiveTreeNode = (node: PolicyTreeNode, depth: number = 0) => {
    const isExpanded = expandedTreeNodes[node.id] ?? (depth < 2);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="space-y-1 text-xs">
        <div
          onClick={() => hasChildren && toggleTreeNode(node.id)}
          className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
            hasChildren ? 'cursor-pointer hover:bg-aurora-neutral-50' : 'bg-aurora-neutral-50/50'
          } ${
            depth === 0
              ? 'bg-aurora-neutral-100 border-aurora-neutral-300 font-bold'
              : depth === 1
              ? 'bg-white border-aurora-neutral-200 font-semibold'
              : 'bg-white/80 border-aurora-neutral-200 text-aurora-neutral-800'
          }`}
          style={{ marginLeft: `${depth * 14}px` }}
        >
          <div className="flex items-center space-x-2 min-w-0">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown strokeWidth={1.5} className="w-4 h-4 text-aurora-neutral-500 flex-shrink-0" />
              ) : (
                <ChevronRight strokeWidth={1.5} className="w-4 h-4 text-aurora-neutral-500 flex-shrink-0" />
              )
            ) : (
              <span className="w-2 h-2 rounded-full bg-aurora-primary flex-shrink-0 ml-1" />
            )}
            <div className="truncate">
              <span className="text-aurora-neutral-900">{node.name}</span>
              {node.ruleCode && (
                <span className="ml-2 font-mono text-[10px] text-aurora-primary bg-aurora-primary-light px-1.5 py-0.5 rounded">
                  {node.ruleCode}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {node.category && (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-aurora-neutral-100 text-aurora-neutral-600">
                {node.category}
              </span>
            )}
            {(node as any).requiresHumanSupervisor && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                Supervisor Gate
              </span>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1 border-l border-aurora-neutral-200 ml-3 pl-1">
            {node.children!.map((child) => renderInteractiveTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-aurora-neutral-200 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-aurora-primary bg-aurora-primary-light px-2.5 py-1 rounded">
              Knowledge Rules
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-aurora-neutral-900 tracking-tight">
            Knowledge Rules
          </h1>
          <p className="text-sm text-aurora-neutral-700 mt-1 max-w-3xl leading-relaxed">
            The central guide for AI agent governance rules, customer personas, multi-agent execution pipeline, channel guidelines, and scoring formulas.
          </p>
        </div>

        {/* Top Navigation CTAs */}
        <div className="flex items-center space-x-2 self-start sm:self-auto flex-shrink-0">
          {onNavigateToBrief && (
            <button
              type="button"
              onClick={onNavigateToBrief}
              className="px-3.5 py-2 bg-white hover:bg-aurora-neutral-100 border border-aurora-neutral-300 text-aurora-neutral-800 rounded-md text-xs font-semibold shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-1.5"
            >
              <ArrowLeft strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>Back to Brief</span>
            </button>
          )}
          {onNavigateToControlRoom && (
            <button
              type="button"
              onClick={() => hasActiveRun && onNavigateToControlRoom()}
              disabled={!hasActiveRun}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 flex items-center space-x-1.5 ${
                hasActiveRun
                  ? 'bg-aurora-primary hover:bg-aurora-primary-hover text-white cursor-pointer'
                  : 'bg-aurora-neutral-200 text-aurora-neutral-400 border border-aurora-neutral-300 cursor-not-allowed opacity-60'
              }`}
              title={!hasActiveRun ? 'Generate a communication in brief first to view message review' : undefined}
            >
              <span>Decision & Previews</span>
              <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-aurora-neutral-200 pb-3 overflow-x-auto">
        {[
          { id: 'agent_policies', label: 'Agent Governance Rules (7)', icon: Shield },
          {
            id: 'policy_tree',
            label: hasPolicyDocument
              ? `Policy Tree & Rules (${activeRuleCount > 0 ? `${activeRuleCount} Rules` : 'Active'})`
              : 'Policy Tree & Rules (Empty)',
            icon: Network,
          },
          { id: 'heuristics', label: 'Scoring & Heuristic Formulas', icon: Calculator },
          { id: 'personas', label: 'Customer Personas (25+)', icon: Users },
          { id: 'hierarchy', label: 'Execution Pipeline', icon: Layers },
          { id: 'channels', label: 'Channel Guidelines', icon: Smartphone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-aurora-primary text-white shadow-sm'
                  : 'bg-aurora-neutral-100 text-aurora-neutral-700 hover:bg-aurora-neutral-200'
              }`}
            >
              <Icon strokeWidth={1.5} className="w-4 h-4 flex-shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Agent Governance Policies & Rules */}
      {activeSection === 'agent_policies' && (
        <div className="space-y-6">
          {/* Agent Policy Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {AGENT_GOVERNANCE_POLICIES.map((p) => {
              const isSelected = selectedAgentPolicy === p.policyCode;
              return (
                <button
                  key={p.policyCode}
                  onClick={() => setSelectedAgentPolicy(p.policyCode)}
                  className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-aurora-primary-light/40 border-aurora-primary shadow-sm ring-1 ring-aurora-primary'
                      : 'bg-white border-aurora-neutral-200 hover:border-aurora-neutral-300'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold text-aurora-primary block">
                      Agent {p.agentNumber}
                    </span>
                    <span className="text-xs font-bold text-aurora-neutral-900 line-clamp-1 mt-0.5">
                      {p.title.split(' ')[0]} {p.title.split(' ')[1]}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-aurora-neutral-500 mt-2 block">
                    {p.policyCode.split('-')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Agent Governance Detailed Card */}
          <div className="bg-white rounded-xl border border-aurora-neutral-200 shadow-sm p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-aurora-neutral-200 gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-white bg-aurora-primary px-2.5 py-1 rounded">
                    {currentPolicy.policyCode}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-aurora-neutral-600 bg-aurora-neutral-100 px-2.5 py-1 rounded">
                    Agent {currentPolicy.agentNumber}: {currentPolicy.agentId.toUpperCase()}
                  </span>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active & Enforced
                  </span>
                </div>
                <h2 className="text-xl font-bold text-aurora-neutral-900 mt-2">
                  {currentPolicy.title}
                </h2>
                <p className="text-xs text-aurora-neutral-600 mt-1">
                  Department: <span className="font-semibold text-aurora-neutral-800">{currentPolicy.department}</span> • Version: <span className="font-mono">{currentPolicy.version}</span>
                </p>
              </div>

              <div className="p-3 bg-aurora-neutral-50 rounded-lg border border-aurora-neutral-200 text-xs max-w-sm">
                <span className="font-bold text-aurora-neutral-800 block text-[11px] uppercase tracking-wider mb-1">
                  Pipeline Role
                </span>
                <p className="text-aurora-neutral-600 leading-snug">{currentPolicy.transformationRole}</p>
              </div>
            </div>

            {/* Governance Objective */}
            <div className="p-4 bg-sky-50/70 rounded-lg border border-sky-200 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 block">
                Primary Objective
              </span>
              <p className="text-xs text-sky-950 leading-relaxed font-medium">
                {currentPolicy.governanceObjective}
              </p>
            </div>

            {/* Ingested Inputs & Produced Outputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-aurora-neutral-50 border border-aurora-neutral-200 space-y-2 text-xs">
                <span className="font-bold text-aurora-neutral-800 uppercase tracking-wider block text-[11px]">
                  Input Information
                </span>
                <ul className="space-y-1.5 text-aurora-neutral-700">
                  {currentPolicy.mandatoryInputs.map((input, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-aurora-primary mt-1 flex-shrink-0"></span>
                      <span>{input}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-aurora-neutral-50 border border-aurora-neutral-200 space-y-2 text-xs">
                <span className="font-bold text-aurora-neutral-800 uppercase tracking-wider block text-[11px]">
                  Produced Outputs
                </span>
                <ul className="space-y-1.5 text-aurora-neutral-700">
                  {currentPolicy.governedOutputs.map((output, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <Check strokeWidth={2} className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{output}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Permitted & Prohibited Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-2 text-xs">
                <span className="font-bold text-emerald-900 uppercase tracking-wider block text-[11px]">
                  Allowed Actions
                </span>
                <ul className="space-y-1.5 text-emerald-950">
                  {currentPolicy.permittedActions.map((action, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-emerald-700 font-bold">✓</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-red-50/60 border border-red-200 space-y-2 text-xs">
                <span className="font-bold text-red-900 uppercase tracking-wider block text-[11px]">
                  Prohibited Actions
                </span>
                <ul className="space-y-1.5 text-red-950">
                  {currentPolicy.prohibitedActions.map((action, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-red-700 font-bold">✕</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Strict Quality Checks & Anti-Hallucination Constraints */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
                <div className="flex items-center space-x-1.5 text-amber-900 font-bold">
                  <ShieldCheck strokeWidth={1.5} className="w-4 h-4 text-amber-700" />
                  <span className="uppercase tracking-wider text-[11px]">Strict Quality Checks</span>
                </div>
                <ul className="space-y-1.5 text-amber-950">
                  {currentPolicy.strictRailguards.map((rg, idx) => (
                    <li key={idx} className="leading-snug">{rg}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-purple-50/60 border border-purple-200 space-y-2 text-xs">
                <div className="flex items-center space-x-1.5 text-purple-900 font-bold">
                  <ShieldAlert strokeWidth={1.5} className="w-4 h-4 text-purple-700" />
                  <span className="uppercase tracking-wider text-[11px]">Zero-Hallucination Rules</span>
                </div>
                <ul className="space-y-1.5 text-purple-950">
                  {currentPolicy.antiHallucinationConstraints.map((ah, idx) => (
                    <li key={idx} className="leading-snug">{ah}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Governance Rules Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-aurora-neutral-700">
                Agent Specific Rules ({currentPolicy.rules.length})
              </h3>
              <div className="border border-aurora-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-aurora-neutral-100 text-aurora-neutral-600 uppercase text-[10px] tracking-wider border-b border-aurora-neutral-200">
                    <tr>
                      <th className="py-2.5 px-3">Rule Code</th>
                      <th className="py-2.5 px-3">Rule Name & Explanation</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Enforcement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-aurora-neutral-200">
                    {currentPolicy.rules.map((rule) => (
                      <tr key={rule.ruleCode} className="hover:bg-aurora-neutral-50/80">
                        <td className="py-2.5 px-3 font-mono font-bold text-aurora-primary align-top">
                          {rule.ruleCode}
                        </td>
                        <td className="py-2.5 px-3 align-top">
                          <span className="font-bold text-aurora-neutral-900 block">{rule.name}</span>
                          <span className="text-aurora-neutral-600 text-[11px] block mt-0.5">{rule.description}</span>
                          <span className="text-emerald-700 font-mono text-[10px] block mt-1">Verification: {rule.railguardCheck}</span>
                        </td>
                        <td className="py-2.5 px-3 align-top">
                          <span className="text-[10px] bg-aurora-neutral-100 text-aurora-neutral-700 px-2 py-0.5 rounded font-medium">
                            {rule.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 align-top">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            rule.enforcementLevel === 'MANDATORY'
                              ? 'bg-aurora-primary-light text-aurora-primary'
                              : rule.enforcementLevel === 'PROHIBITIVE'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-aurora-neutral-200 text-aurora-neutral-700'
                          }`}>
                            {rule.enforcementLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Decision Heuristics & Escalation Triggers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-aurora-neutral-50 rounded-lg border border-aurora-neutral-200 text-xs space-y-1.5">
                <span className="font-bold text-aurora-neutral-800 uppercase tracking-wider block text-[11px]">
                  Decision Guidelines
                </span>
                <ul className="space-y-1 text-aurora-neutral-700 text-[11px]">
                  {currentPolicy.decisionHeuristics.map((dh, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5 text-aurora-primary flex-shrink-0 mt-0.5" />
                      <span>{dh}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-red-50/50 rounded-lg border border-red-200 text-xs space-y-1.5">
                <span className="font-bold text-red-800 uppercase tracking-wider block text-[11px]">
                  Human Supervisor Approval Triggers
                </span>
                <ul className="space-y-1 text-red-900 text-[11px]">
                  {currentPolicy.escalationTriggers.map((et, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <AlertTriangle strokeWidth={1.5} className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>{et}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Policy Tree & Governance Rules */}
      {activeSection === 'policy_tree' && (
        <div className="space-y-6">
          {!hasPolicyDocument ? (
            /* EMPTY STATE: Shown when no policy is uploaded/shared */
            <div className="bg-white rounded-xl border border-aurora-neutral-200 shadow-sm p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-aurora-neutral-100 border border-aurora-neutral-300 text-aurora-neutral-500 flex items-center justify-center mx-auto">
                <GitBranch strokeWidth={1.5} className="w-7 h-7 text-aurora-neutral-400" />
              </div>
              <div className="max-w-lg mx-auto space-y-2">
                <h3 className="text-base font-bold text-aurora-neutral-900">
                  No Policy Document Shared
                </h3>
                <p className="text-xs text-aurora-neutral-600 leading-relaxed">
                  The Policy Tree is generated dynamically only when a compliance or policy document is uploaded or shared. No policy document has been shared in this session yet.
                </p>
              </div>
              {onNavigateToPolicyTree && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onNavigateToPolicyTree}
                    className="px-4 py-2 bg-aurora-primary hover:bg-aurora-primary-hover text-white rounded-lg text-xs font-bold shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center space-x-2"
                  >
                    <FileText strokeWidth={1.5} className="w-4 h-4" />
                    <span>Upload / Share Policy Document</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* DYNAMIC POLICY CONTENT: Rendered strictly from uploaded/shared document */
            <>
              {/* Document Overview Header Card */}
              <div className="bg-white p-6 rounded-xl border border-aurora-neutral-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-aurora-neutral-200 gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white bg-aurora-primary px-2.5 py-1 rounded">
                        {customStructuredDoc?.documentId || 'ACTIVE-DOC'}
                      </span>
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Active Policy Document ({activeRuleCount} Rules Active)
                      </span>
                      <span className="text-xs font-mono text-aurora-neutral-600 bg-aurora-neutral-100 px-2 py-0.5 rounded border border-aurora-neutral-200">
                        Version {customStructuredDoc?.version || '2.0'}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-aurora-neutral-900 mt-2">
                      {customStructuredDoc?.title || customPolicyTree?.name || 'Customer Communication Policy'}
                    </h2>
                    <p className="text-xs text-aurora-neutral-600 mt-1">
                      {customStructuredDoc?.effectiveScope || 'Customer-facing transactional communications and refund orchestration'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 self-start sm:self-auto flex-shrink-0">
                    {onNavigateToPolicyTree && (
                      <button
                        type="button"
                        onClick={onNavigateToPolicyTree}
                        className="px-4 py-2 bg-aurora-primary hover:bg-aurora-primary-hover text-white rounded-md text-xs font-semibold shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-1.5"
                      >
                        <ExternalLink strokeWidth={1.5} className="w-3.5 h-3.5" />
                        <span>Manage / Upload Document</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Metrics Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-3 bg-aurora-neutral-50 rounded-lg border border-aurora-neutral-200">
                    <span className="text-[10px] uppercase font-bold text-aurora-neutral-500 block">Enforced Rules</span>
                    <span className="text-lg font-bold text-aurora-primary">{activeRuleCount}</span>
                  </div>
                  <div className="p-3 bg-aurora-neutral-50 rounded-lg border border-aurora-neutral-200">
                    <span className="text-[10px] uppercase font-bold text-aurora-neutral-500 block">Structured Sections</span>
                    <span className="text-lg font-bold text-aurora-neutral-900">{activeSections.length}</span>
                  </div>
                  <div className="p-3 bg-aurora-neutral-50 rounded-lg border border-aurora-neutral-200">
                    <span className="text-[10px] uppercase font-bold text-aurora-neutral-500 block">Supervisor Gates</span>
                    <span className="text-lg font-bold text-amber-700">{escalationCount}</span>
                  </div>
                  <div className="p-3 bg-aurora-neutral-50 rounded-lg border border-aurora-neutral-200">
                    <span className="text-[10px] uppercase font-bold text-aurora-neutral-500 block">Ingestion Status</span>
                    <span className="text-xs font-bold text-emerald-700 block mt-1">Live in Session</span>
                  </div>
                </div>

                {/* Quick Search */}
                <div className="relative pt-2">
                  <Search strokeWidth={1.5} className="w-4 h-4 text-aurora-neutral-400 absolute left-3 top-4.5" />
                  <input
                    type="text"
                    value={policySearch}
                    onChange={(e) => setPolicySearch(e.target.value)}
                    placeholder="Search policy rules by code, section title, allowed actions, or prohibitions..."
                    className="w-full pl-9 pr-3 py-2 bg-aurora-neutral-50 border border-aurora-neutral-200 rounded-lg text-xs text-aurora-neutral-900 focus:bg-white focus:ring-1 focus:ring-aurora-primary font-sans"
                  />
                </div>
              </div>

              {/* Structured Policy Sections Grid */}
              {activeSections.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-aurora-neutral-700">
                      Document Hierarchy &amp; Sections ({activeSections.length})
                    </h3>
                    <span className="text-[11px] text-aurora-neutral-500 font-mono">
                      Parsed from shared policy document
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeSections
                      .filter((sec: any) => {
                        if (!policySearch.trim()) return true;
                        const q = policySearch.toLowerCase();
                        return (
                          sec.title.toLowerCase().includes(q) ||
                          (sec.description && sec.description.toLowerCase().includes(q)) ||
                          sec.clauses.some((cl: any) =>
                            cl.title.toLowerCase().includes(q) ||
                            cl.statement.toLowerCase().includes(q)
                          )
                        );
                      })
                      .map((sec: any, idx: number) => {
                      const categoryColors: Record<string, { bg: string; dot: string; border: string }> = {
                        transactional: { bg: 'bg-emerald-50/50', dot: 'bg-emerald-500', border: 'border-emerald-200' },
                        privacy: { bg: 'bg-purple-50/50', dot: 'bg-purple-500', border: 'border-purple-200' },
                        financial: { bg: 'bg-amber-50/50', dot: 'bg-amber-500', border: 'border-amber-200' },
                        frequency: { bg: 'bg-sky-50/50', dot: 'bg-sky-500', border: 'border-sky-200' },
                        channel: { bg: 'bg-indigo-50/50', dot: 'bg-indigo-500', border: 'border-indigo-200' },
                        governance: { bg: 'bg-aurora-neutral-50', dot: 'bg-aurora-neutral-500', border: 'border-aurora-neutral-200' },
                      };
                      const catTheme = categoryColors[sec.category] || categoryColors.governance;

                      return (
                        <div
                          key={sec.sectionId || idx}
                          className={`bg-white p-4 rounded-xl border shadow-sm space-y-2 flex flex-col justify-between ${catTheme.border}`}
                        >
                          <div>
                            <div className="flex items-center justify-between pb-2 border-b border-aurora-neutral-200">
                              <div className="flex items-center space-x-2 truncate">
                                <span className={`w-2.5 h-2.5 rounded-full ${catTheme.dot} flex-shrink-0`} />
                                <h4 className="font-bold text-xs uppercase tracking-wider text-aurora-neutral-900 truncate">
                                  {sec.sectionNumber} {sec.title}
                                </h4>
                              </div>
                              <span className="text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-aurora-neutral-100 text-aurora-neutral-600 flex-shrink-0">
                                {sec.clauses.length} {sec.clauses.length === 1 ? 'clause' : 'clauses'}
                              </span>
                            </div>
                            {sec.description && (
                              <p className="text-xs text-aurora-neutral-600 leading-snug mt-2 line-clamp-2">
                                {sec.description}
                              </p>
                            )}
                            <div className="pt-2 text-[11px] text-aurora-neutral-600 space-y-1">
                              {sec.clauses.slice(0, 3).map((cl: any, cIdx: number) => (
                                <div key={cIdx} className="truncate">
                                  • <span className="font-medium text-aurora-neutral-800">{cl.title}:</span> {cl.statement}
                                </div>
                              ))}
                              {sec.clauses.length > 3 && (
                                <div className="text-[10px] text-aurora-neutral-400 font-mono">
                                  +{sec.clauses.length - 3} more clauses
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Interactive Policy Tree Decision Hierarchy */}
              {customPolicyTree && (
                <div className="bg-white rounded-xl border border-aurora-neutral-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-aurora-neutral-200">
                    <div className="flex items-center space-x-2">
                      <GitBranch strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                      <h3 className="text-sm font-bold text-aurora-neutral-900">
                        Dynamic Decision Tree Structure
                      </h3>
                    </div>
                    <span className="text-[11px] text-aurora-neutral-500 font-mono">
                      Expand nodes to view structured decision paths
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {renderInteractiveTreeNode(customPolicyTree)}
                  </div>
                </div>
              )}

              {/* Raw Ingested Policy Document (Collapsible) */}
              {customPolicyDocText && (
                <div className="bg-white rounded-xl border border-aurora-neutral-200 shadow-sm p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-aurora-neutral-900">
                        Raw Ingested Policy Document
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRawDoc(!showRawDoc)}
                      className="text-xs text-aurora-primary font-semibold hover:underline"
                    >
                      {showRawDoc ? 'Hide Document Text' : `View Original Document Text (${customPolicyDocText.length} characters)`}
                    </button>
                  </div>
                  {showRawDoc && (
                    <pre className="p-3 bg-aurora-neutral-50 rounded-lg border border-aurora-neutral-200 text-xs text-aurora-neutral-800 font-mono whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                      {customPolicyDocText}
                    </pre>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 2: Scoring & Heuristic Formulas (NEW TAB) */}
      {activeSection === 'heuristics' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-aurora-neutral-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-aurora-neutral-900">
                System Heuristics & Calculation Formulas
              </h2>
              <p className="text-xs text-aurora-neutral-600 mt-1">
                Every score, risk tier, and decision threshold in Aurora Cloud is backed by deterministic business logic. Here is how each metric is calculated.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formula Card 1: Attention Fatigue */}
              <div className="p-5 rounded-xl bg-aurora-neutral-50 border border-aurora-neutral-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-aurora-neutral-200">
                  <div className="flex items-center space-x-2">
                    <Clock strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                    <h3 className="font-bold text-sm text-aurora-neutral-900">24-Hour Attention Fatigue Score</h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-aurora-primary bg-aurora-primary-light px-2 py-0.5 rounded">
                    0 to 100 Scale
                  </span>
                </div>
                <p className="text-xs text-aurora-neutral-700 leading-relaxed">
                  Measures recent message frequency and emotional state to prevent customer inbox fatigue, spam complaints, and opt-outs.
                </p>
                
                <div className="p-3 bg-white rounded-lg border border-aurora-neutral-200 font-mono text-xs text-aurora-neutral-900 space-y-1.5">
                  <div className="font-bold text-aurora-primary">Fatigue Score = (Velocity × 25) + Sentiment Modifier</div>
                  <div className="text-[11px] text-aurora-neutral-600 font-sans">
                    • <strong>Velocity:</strong> Total Transactional + Promotional messages in last 24 hours (bounded 0 to 4)
                  </div>
                  <div className="text-[11px] text-aurora-neutral-600 font-sans">
                    • <strong>Score Bounds:</strong> Range 0 to 100 (Clamped between minimum 0 and maximum 100)
                  </div>
                </div>

                {/* Explicit Sentiment Modifier Values Table */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-aurora-neutral-800 text-[11px] uppercase tracking-wider block">
                      Sentiment Modifier Values
                    </span>
                    <span className="text-[10px] font-mono text-aurora-neutral-500">
                      Deterministic Emotional Calibration
                    </span>
                  </div>
                  <div className="border border-aurora-neutral-200 rounded-lg overflow-hidden bg-white text-[11px]">
                    <table className="w-full text-left">
                      <thead className="bg-aurora-neutral-50 text-aurora-neutral-700 font-bold border-b border-aurora-neutral-200">
                        <tr>
                          <th className="p-2">Customer Sentiment</th>
                          <th className="p-2 text-center w-24">Modifier Value</th>
                          <th className="p-2">Operational Computation Impact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-aurora-neutral-200">
                        <tr className="hover:bg-aurora-neutral-50/70 transition">
                          <td className="p-2 font-semibold text-red-700 flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                            <span>Frustrated</span>
                          </td>
                          <td className="p-2 font-mono font-bold text-center text-red-700 bg-red-50/50">+20</td>
                          <td className="p-2 text-aurora-neutral-600 leading-snug">
                            Active grievance and friction amplify fatigue index, accelerating the suppression threshold.
                          </td>
                        </tr>
                        <tr className="hover:bg-aurora-neutral-50/70 transition">
                          <td className="p-2 font-semibold text-amber-700 flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                            <span>Anxious</span>
                          </td>
                          <td className="p-2 font-mono font-bold text-center text-amber-700 bg-amber-50/50">+15</td>
                          <td className="p-2 text-aurora-neutral-600 leading-snug">
                            Emotional apprehension heightens sensitivity to notification overload; requires heightened reassurance.
                          </td>
                        </tr>
                        <tr className="hover:bg-aurora-neutral-50/70 transition">
                          <td className="p-2 font-semibold text-sky-700 flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />
                            <span>Urgent</span>
                          </td>
                          <td className="p-2 font-mono font-bold text-center text-sky-700 bg-sky-50/50">+10</td>
                          <td className="p-2 text-aurora-neutral-600 leading-snug">
                            Time-sensitive blocker increases customer cognitive pressure; non-critical outbound updates are deprioritized.
                          </td>
                        </tr>
                        <tr className="hover:bg-aurora-neutral-50/70 transition">
                          <td className="p-2 font-semibold text-aurora-neutral-800 flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-aurora-neutral-400 flex-shrink-0" />
                            <span>Neutral</span>
                          </td>
                          <td className="p-2 font-mono font-bold text-center text-aurora-neutral-700 bg-aurora-neutral-50">0</td>
                          <td className="p-2 text-aurora-neutral-600 leading-snug">
                            Standard baseline state; fatigue score is strictly derived from 24h message velocity.
                          </td>
                        </tr>
                        <tr className="hover:bg-aurora-neutral-50/70 transition">
                          <td className="p-2 font-semibold text-emerald-700 flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                            <span>Satisfied</span>
                          </td>
                          <td className="p-2 font-mono font-bold text-center text-emerald-700 bg-emerald-50/50">-10</td>
                          <td className="p-2 text-aurora-neutral-600 leading-snug">
                            Positive brand affinity and high customer goodwill provide an attention tolerance buffer.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-aurora-neutral-800 text-[11px] uppercase tracking-wider block">Decision Action Bands</span>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                      <span className="font-bold text-emerald-800 block">0–30 (Low)</span>
                      <span className="text-emerald-950 text-[10px]">Safe to send. Full dispatch allowed.</span>
                    </div>
                    <div className="p-2 rounded bg-amber-50 border border-amber-200">
                      <span className="font-bold text-amber-800 block">31–69 (Medium)</span>
                      <span className="text-amber-950 text-[10px]">Consolidate updates into single brief.</span>
                    </div>
                    <div className="p-2 rounded bg-red-50 border border-red-200">
                      <span className="font-bold text-red-800 block">70–100 (High)</span>
                      <span className="text-red-950 text-[10px]">Auto-suppress non-critical messages.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formula Card 2: 7-Point Quality Scorecard */}
              <div className="p-5 rounded-xl bg-aurora-neutral-50 border border-aurora-neutral-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-aurora-neutral-200">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                    <h3 className="font-bold text-sm text-aurora-neutral-900">7-Point Governance Scorecard</h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Pass / Fail Gate
                  </span>
                </div>
                <p className="text-xs text-aurora-neutral-700 leading-relaxed">
                  Before any message is ready to send, the autonomous Critic agent executes 7 deterministic quality checks:
                </p>
                
                <div className="space-y-1.5 text-xs">
                  {[
                    { name: '1. Personalisation Depth', desc: 'Customer name on line 1, exact account & event context.' },
                    { name: '2. Tone Alignment', desc: 'Direct, Calm, Competent. Strictly zero exclamation marks.' },
                    { name: '3. Policy Compliance', desc: 'Complies with financial liability and consent rules.' },
                    { name: '4. Factual Grounding', desc: 'Only cites verified facts, numbers, and references.' },
                    { name: '5. Channel Fit', desc: 'Adheres to character limits and formatting rules.' },
                    { name: '6. Fatigue Check', desc: 'Verifies customer is below 24-hour message thresholds.' },
                    { name: '7. Zero Hallucinations', desc: 'Zero unauthorized promises, discounts, or dates.' },
                  ].map((chk, i) => (
                    <div key={i} className="flex items-start space-x-2 p-1.5 rounded bg-white border border-aurora-neutral-200 text-[11px]">
                      <CheckCircle2 strokeWidth={2} className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-aurora-neutral-900">{chk.name}:</strong>{' '}
                        <span className="text-aurora-neutral-600">{chk.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formula Card 3: Inbound Support Deflection */}
              <div className="p-5 rounded-xl bg-aurora-neutral-50 border border-aurora-neutral-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-aurora-neutral-200">
                  <div className="flex items-center space-x-2">
                    <HeartHandshake strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                    <h3 className="font-bold text-sm text-aurora-neutral-900">Inbound Support Deflection Logic</h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    Deflection Rate ~85%+
                  </span>
                </div>
                <p className="text-xs text-aurora-neutral-700 leading-relaxed">
                  Support calls are deflected by proactively answering the 4 questions customers always call about before they have to ask:
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-aurora-neutral-200">
                    <span className="font-bold text-aurora-neutral-900 block">1. What happened to my transaction?</span>
                    <span className="text-aurora-neutral-600 text-[11px]">State clear event outcome (e.g. Order #4012 failed, payment was captured).</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-aurora-neutral-200">
                    <span className="font-bold text-aurora-neutral-900 block">2. Where is my money?</span>
                    <span className="text-aurora-neutral-600 text-[11px]">State exact refund reference number and 3-5 business days banking cycle.</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-aurora-neutral-200">
                    <span className="font-bold text-aurora-neutral-900 block">3. Do I need to do anything?</span>
                    <span className="text-aurora-neutral-600 text-[11px]">Explicitly declare "No action is required from you" to eliminate repeat inquiries.</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-aurora-neutral-200">
                    <span className="font-bold text-aurora-neutral-900 block">4. What if I still need help?</span>
                    <span className="text-aurora-neutral-600 text-[11px]">Provide a direct 1-click support tracking link without forcing a phone call.</span>
                  </div>
                </div>
              </div>

              {/* Formula Card 4: Sentiment Trajectory Tracking */}
              <div className="p-5 rounded-xl bg-aurora-neutral-50 border border-aurora-neutral-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-aurora-neutral-200">
                  <div className="flex items-center space-x-2">
                    <BarChart3 strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                    <h3 className="font-bold text-sm text-aurora-neutral-900">Sentiment Trajectory Scoring</h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Multi-Turn Analysis
                  </span>
                </div>
                <p className="text-xs text-aurora-neutral-700 leading-relaxed">
                  During multi-turn customer roleplay simulations, emotional trajectory is scored across 5 sentiment bands:
                </p>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 bg-white rounded border border-aurora-neutral-200">
                    <span className="font-bold text-red-700">Frustrated / Anxious</span>
                    <span className="text-aurora-neutral-600 text-[11px]">Initial inbound state • High friction & worry</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border border-aurora-neutral-200">
                    <span className="font-bold text-amber-700">Neutral / Inquiring</span>
                    <span className="text-aurora-neutral-600 text-[11px]">Seeking clarification on reference ID or timeline</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border border-aurora-neutral-200">
                    <span className="font-bold text-emerald-700">Reassured / Relieved</span>
                    <span className="text-aurora-neutral-600 text-[11px]">Issue resolved autonomously • Zero-action acknowledged</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border border-aurora-neutral-200">
                    <span className="font-bold text-sky-700">Delighted (5/5 Rating)</span>
                    <span className="text-aurora-neutral-600 text-[11px]">Customer thanks agent and closes conversation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 25+ Customer Personas Catalog */}
      {activeSection === 'personas' && (
        <div className="space-y-6">
          {/* Persona Cohort Filter & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Personas (25)' },
                { id: 'Gen Z', label: 'Gen Z (18–26)' },
                { id: 'Millennial', label: 'Millennial (27–42)' },
                { id: 'Gen X', label: 'Gen X (43–58)' },
                { id: 'Baby Boomer', label: 'Baby Boomer (59–77)' },
                { id: 'Silent Generation', label: 'Silent Gen (78+)' },
              ].map((cohort) => (
                <button
                  key={cohort.id}
                  onClick={() => setSelectedCohort(cohort.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedCohort === cohort.id
                      ? 'bg-aurora-primary text-white shadow-sm'
                      : 'bg-aurora-neutral-100 text-aurora-neutral-700 hover:bg-aurora-neutral-200'
                  }`}
                >
                  {cohort.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search strokeWidth={1.5} className="w-4 h-4 text-aurora-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={personaSearch}
                onChange={(e) => setPersonaSearch(e.target.value)}
                placeholder="Search archetype, tone, or style..."
                className="w-full bg-white border border-aurora-neutral-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-aurora-neutral-900 focus:outline-none focus:ring-1 focus:ring-aurora-primary"
              />
            </div>
          </div>

          {/* Personas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPersonas.map((persona) => (
              <div
                key={persona.id}
                className="bg-white rounded-xl border border-aurora-neutral-200 shadow-sm p-5 space-y-4 hover:border-aurora-primary transition flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-aurora-primary bg-aurora-primary-light px-2 py-0.5 rounded">
                      {persona.cohort.split(' ')[0]} {persona.cohort.split(' ')[1]}
                    </span>
                    <span className="text-[10px] font-semibold text-aurora-neutral-600 bg-aurora-neutral-100 px-2 py-0.5 rounded">
                      {persona.segment} Tier
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-aurora-neutral-900">{persona.name}</h3>
                    <p className="text-xs text-aurora-neutral-600 font-medium">{persona.archetype}</p>
                  </div>

                  <div className="p-3 bg-aurora-neutral-50 rounded-lg border border-aurora-neutral-200 text-xs space-y-1.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-aurora-neutral-500 block">Tone Preference</span>
                      <p className="text-aurora-neutral-800 font-medium">{persona.tonePreference}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-aurora-neutral-500 block">Communication Style</span>
                      <p className="text-aurora-neutral-700 leading-snug">{persona.communicationStyle}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block">Frustration Triggers</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {persona.frustrationTriggers.map((ft, i) => (
                          <span key={i} className="text-[10px] bg-red-50 text-red-800 border border-red-200 px-1.5 py-0.2 rounded">
                            {ft}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Reassurance Needs</span>
                      <p className="text-emerald-900 text-[11px] leading-snug">{persona.reassuranceRequirements}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-aurora-neutral-200 text-[11px] text-aurora-neutral-600 flex items-center justify-between">
                  <span>Channel: <strong className="text-aurora-neutral-900">{persona.preferredChannel}</strong></span>
                  <span className="font-mono text-aurora-neutral-500">{persona.exampleGreeting} ...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Multi-Agent Execution Pipeline */}
      {activeSection === 'hierarchy' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-aurora-neutral-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-aurora-neutral-900">
                Multi-Agent Execution Pipeline
              </h2>
              <p className="text-xs text-aurora-neutral-600 mt-1">
                Visualizing the sequential layers through which customer information is ingested, contextualized, compliance-checked, strategically formatted, drafted, and verified by the Critic agent.
              </p>
            </div>

            {/* Sequential Flow Nodes */}
            <div className="space-y-3">
              {AGENT_TRANSFORMATION_HIERARCHY.map((layer) => (
                <div
                  key={layer.layerIndex}
                  className="p-4 rounded-xl bg-aurora-neutral-50 border border-aurora-neutral-200 space-y-2 hover:border-aurora-primary transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-aurora-neutral-200">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-aurora-primary text-white font-bold text-xs flex items-center justify-center">
                        {layer.layerIndex}
                      </span>
                      <h3 className="font-bold text-sm text-aurora-neutral-900">{layer.agentName}</h3>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-aurora-neutral-800">
                    {layer.transformationSummary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                    <div className="p-2.5 bg-white rounded-lg border border-aurora-neutral-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-0.5">
                        Ingested Inputs
                      </span>
                      <span className="text-aurora-neutral-700 text-[11px] leading-snug block">
                        {layer.inputDescription}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-aurora-neutral-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
                        Produced Outputs
                      </span>
                      <span className="text-aurora-neutral-700 text-[11px] leading-snug block">
                        {layer.outputDescription}
                      </span>
                    </div>

                    <div className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-0.5">
                        Key Quality Checks
                      </span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {layer.keyRailguards.map((rg, i) => (
                          <span key={i} className="text-[10px] bg-white text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded font-mono">
                            {rg}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Channel Guidelines */}
      {activeSection === 'channels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(CHANNEL_GUIDELINES).map(([channel, data]) => (
            <div key={channel} className="bg-aurora-neutral-0 p-5 rounded-lg border border-aurora-neutral-200 shadow-aurora text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-aurora-neutral-200">
                <span className="font-bold text-sm text-aurora-neutral-900">{channel}</span>
                <span className="text-[11px] font-mono font-bold text-aurora-primary bg-aurora-primary-light px-2 py-0.5 rounded">
                  Max: {data.maxCharacters} chars
                </span>
              </div>
              <div>
                <span className="font-bold text-aurora-neutral-800 block text-[11px] uppercase tracking-wider mb-0.5">Structure & Layout:</span>
                <p className="text-aurora-neutral-700">{data.structure}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-aurora-neutral-50 rounded border border-aurora-neutral-200">
                  <span className="font-bold text-aurora-neutral-700 block text-[10px] uppercase">Greeting:</span>
                  <span className="text-aurora-neutral-900 italic font-mono">{data.greeting}</span>
                </div>
                <div className="p-2 bg-aurora-neutral-50 rounded border border-aurora-neutral-200">
                  <span className="font-bold text-aurora-neutral-700 block text-[10px] uppercase">Sign-Off:</span>
                  <span className="text-aurora-neutral-900 italic font-mono">{data.signoff}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-aurora-neutral-200 space-y-1">
                <div className="flex flex-wrap gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mr-1">Permitted:</span>
                  {data.permittedElements.map((pe, i) => (
                    <span key={i} className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded">
                      {pe}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 mr-1">Prohibited:</span>
                  {data.prohibitions.map((pr, i) => (
                    <span key={i} className="text-[10px] bg-red-50 text-red-800 border border-red-200 px-1.5 py-0.2 rounded">
                      {pr}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

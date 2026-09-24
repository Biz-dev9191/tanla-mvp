import React, { useState } from 'react';
import { BRAND_VOICE_GUIDELINES, CUSTOMER_SEGMENT_GUIDELINES, CHANNEL_GUIDELINES } from '@/core/knowledge-base';
import { CUSTOMER_PERSONA_CATALOG, CustomerPersona } from '@/core/personas';
import { AGENT_GOVERNANCE_POLICIES, AGENT_TRANSFORMATION_HIERARCHY, AgentGovernancePolicy } from '@/core/agent-policies';
import {
  BookOpen,
  Sparkles,
  Smartphone,
  Check,
  X,
  Search,
  Users,
  Layers,
  Shield,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'agent_policies' | 'personas' | 'hierarchy' | 'brand' | 'segments' | 'channels'>('agent_policies');
  const [personaSearch, setPersonaSearch] = useState<string>('');
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [selectedAgentPolicy, setSelectedAgentPolicy] = useState<string>('CCAP-2026-v2.4');

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-aurora-neutral-200">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-aurora-primary bg-aurora-primary-light px-2.5 py-1 rounded">
            Agent Governance & Knowledge Base
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            25+ Persona Catalog Active
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
            7 Governed Agent Layers
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-aurora-neutral-900 tracking-tight">
          Governed Knowledge Base & Agent Engine
        </h1>
        <p className="text-sm text-aurora-neutral-700 mt-1 max-w-4xl leading-relaxed">
          The central repository for specialized AI agent governance rules, 25+ demographic customer personas, multi-agent transformation hierarchies, brand voice guidelines, customer segment profiles, and channel formatting constraints.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-aurora-neutral-200 pb-3 overflow-x-auto">
        {[
          { id: 'agent_policies', label: 'Agent Governance Rules (7)', icon: Shield },
          { id: 'personas', label: 'Customer Personas (25+)', icon: Users },
          { id: 'hierarchy', label: 'Transformation Hierarchy', icon: Layers },
          { id: 'brand', label: 'Brand Voice & Tone', icon: Sparkles },
          { id: 'segments', label: 'Customer Segments', icon: BookOpen },
          { id: 'channels', label: 'Channel Constraints', icon: Smartphone },
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
                  Transformation Layer
                </span>
                <p className="text-aurora-neutral-600 leading-snug">{currentPolicy.transformationRole}</p>
              </div>
            </div>

            {/* Governance Objective */}
            <div className="p-4 bg-sky-50/70 rounded-lg border border-sky-200 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 block">
                Official Governance Objective
              </span>
              <p className="text-xs text-sky-950 leading-relaxed font-medium">
                {currentPolicy.governanceObjective}
              </p>
            </div>

            {/* Mandatory Inputs & Governed Outputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-aurora-neutral-50 border border-aurora-neutral-200 space-y-2 text-xs">
                <span className="font-bold text-aurora-neutral-800 uppercase tracking-wider block text-[11px]">
                  Mandatory Ingested Inputs
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
                  Governed Transformation Outputs
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
                  Permitted Agent Actions
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
                  Prohibited Agent Actions
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

            {/* Strict Railguards & Anti-Hallucination Constraints */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
                <div className="flex items-center space-x-1.5 text-amber-900 font-bold">
                  <ShieldCheck strokeWidth={1.5} className="w-4 h-4 text-amber-700" />
                  <span className="uppercase tracking-wider text-[11px]">Strict Railguards</span>
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
                  <span className="uppercase tracking-wider text-[11px]">Anti-Hallucination Constraints</span>
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
                Agent Policy Rules ({currentPolicy.rules.length})
              </h3>
              <div className="border border-aurora-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-aurora-neutral-100 text-aurora-neutral-600 uppercase text-[10px] tracking-wider border-b border-aurora-neutral-200">
                    <tr>
                      <th className="py-2.5 px-3">Rule Code</th>
                      <th className="py-2.5 px-3">Rule Name & Description</th>
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
                  Decision Heuristics
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
                  Mandatory Human Approval Triggers
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

      {/* TAB 2: 25+ Customer Personas Catalog */}
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
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Reassurance Requirement</span>
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

      {/* TAB 3: Transformation Layer Hierarchy */}
      {activeSection === 'hierarchy' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-aurora-neutral-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-aurora-neutral-900">
                Multi-Agent Transformation Pipeline & Execution Flow
              </h2>
              <p className="text-xs text-aurora-neutral-600 mt-1">
                Visualizing the sequential layers through which a raw customer event is ingested, contextualized, compliant-checked, strategically formatted, drafted, and verified by the Critic agent.
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
                        Key Railguards Enforced
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

      {/* TAB 4: Brand Voice & Tone */}
      {activeSection === 'brand' && (
        <div className="space-y-6">
          <div className="bg-aurora-neutral-0 p-6 rounded-lg border border-aurora-neutral-200 shadow-aurora">
            <h3 className="text-base font-bold text-aurora-neutral-900 mb-2">{BRAND_VOICE_GUIDELINES.name}</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {BRAND_VOICE_GUIDELINES.values.map((v, i) => (
                <span key={i} className="text-xs px-2.5 py-1 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded font-medium text-aurora-neutral-900">
                  {v}
                </span>
              ))}
            </div>

            <h4 className="text-xs font-bold text-aurora-neutral-500 uppercase tracking-wider mb-3">Core Pillars</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(BRAND_VOICE_GUIDELINES.pillars).map(([key, item]) => (
                <div key={key} className="p-4 rounded-lg bg-aurora-neutral-100 border border-aurora-neutral-200 text-xs space-y-2">
                  <span className="font-bold text-sm uppercase tracking-wide text-aurora-primary block">{key}</span>
                  <p className="text-aurora-neutral-700">{item.rule}</p>
                  <div className="pt-2 border-t border-aurora-neutral-200 space-y-1">
                    <div className="flex items-start space-x-1.5 text-aurora-success">
                      <Check strokeWidth={1.5} className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">"{item.goodExample}"</span>
                    </div>
                    <div className="flex items-start space-x-1.5 text-aurora-error">
                      <X strokeWidth={1.5} className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span className="line-through text-aurora-neutral-500">"{item.badExample}"</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-aurora-neutral-200">
              <h4 className="text-xs font-bold text-aurora-neutral-500 uppercase tracking-wider mb-2">Strict Formatting Rules</h4>
              <ul className="space-y-1.5 text-xs text-aurora-neutral-700">
                {BRAND_VOICE_GUIDELINES.formattingRules.map((r, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-aurora-primary"></span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Customer Segments */}
      {activeSection === 'segments' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(CUSTOMER_SEGMENT_GUIDELINES).map(([segment, data]) => (
            <div key={segment} className="bg-aurora-neutral-0 p-5 rounded-lg border border-aurora-neutral-200 shadow-aurora text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-aurora-neutral-200">
                <span className="font-bold text-sm text-aurora-neutral-900">{segment}</span>
                <span className="text-[11px] px-2 py-0.5 bg-aurora-primary-light text-aurora-primary font-bold rounded">
                  Profile
                </span>
              </div>
              <div>
                <span className="font-bold text-aurora-neutral-800 block text-[11px] uppercase tracking-wider mb-0.5">Communication Style:</span>
                <p className="text-aurora-neutral-700">{data.style}</p>
              </div>
              <div>
                <span className="font-bold text-aurora-neutral-800 block text-[11px] uppercase tracking-wider mb-0.5">Channel Affinity:</span>
                <div className="flex flex-wrap gap-1">
                  {data.channelPreferenceWeight.map((ch, i) => (
                    <span key={i} className="text-[10px] bg-aurora-neutral-100 text-aurora-neutral-800 border border-aurora-neutral-300 px-1.5 py-0.2 rounded font-mono">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-bold text-aurora-neutral-800 block text-[11px] uppercase tracking-wider mb-0.5">Information Density:</span>
                <p className="text-aurora-neutral-600 text-[11px]">{data.informationDensity}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: Channels */}
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
                <span className="font-bold text-aurora-neutral-800 block text-[11px] uppercase tracking-wider mb-0.5">Structural Guideline:</span>
                <p className="text-aurora-neutral-700">{data.structure}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-aurora-neutral-50 rounded border border-aurora-neutral-200">
                  <span className="font-bold text-aurora-neutral-700 block text-[10px] uppercase">Greeting Format:</span>
                  <span className="text-aurora-neutral-900 italic font-mono">{data.greeting}</span>
                </div>
                <div className="p-2 bg-aurora-neutral-50 rounded border border-aurora-neutral-200">
                  <span className="font-bold text-aurora-neutral-700 block text-[10px] uppercase">Signoff Format:</span>
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
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 mr-1">Prohibitions:</span>
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

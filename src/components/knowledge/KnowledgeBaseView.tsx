import React, { useState } from 'react';
import { BRAND_VOICE_GUIDELINES, CUSTOMER_SEGMENT_GUIDELINES, CHANNEL_GUIDELINES } from '@/core/knowledge-base';
import { CUSTOMER_PERSONA_CATALOG, CustomerPersona } from '@/core/personas';
import { AGENT_TRANSFORMATION_HIERARCHY } from '@/core/agent-policies';
import { BookOpen, Sparkles, Smartphone, Check, X, Search, Users, Layers, ArrowRight } from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'personas' | 'hierarchy' | 'brand' | 'segments' | 'channels'>('personas');
  const [personaSearch, setPersonaSearch] = useState<string>('');
  const [selectedCohort, setSelectedCohort] = useState<string>('all');

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-aurora-neutral-200">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-aurora-primary bg-aurora-primary-light px-2.5 py-1 rounded">
            Knowledge Base
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            25+ Persona Catalog Active
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
            7 Agent Transformation Layers
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-aurora-neutral-900 tracking-tight">
          Enterprise Knowledge Base & Guidelines
        </h1>
        <p className="text-sm text-aurora-neutral-700 mt-1 max-w-4xl leading-relaxed">
          The central repository for customer personas across demographic cohorts, multi-agent transformation hierarchies, brand voice guidelines, customer segment profiles, and channel formatting constraints.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-aurora-neutral-200 pb-3 overflow-x-auto">
        {[
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

      {/* TAB 1: 25+ Customer Personas Catalog */}
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

      {/* TAB 2: Transformation Layer Hierarchy */}
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

      {/* TAB 3: Brand Voice & Tone */}
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

      {/* TAB 4: Customer Segments */}
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

      {/* TAB 5: Channels */}
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

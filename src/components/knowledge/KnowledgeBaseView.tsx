import React, { useState } from 'react';
import { BRAND_VOICE_GUIDELINES, CUSTOMER_SEGMENT_GUIDELINES, CHANNEL_GUIDELINES, COMPANY_POLICIES } from '@/core/knowledge-base';
import { BookOpen, Sparkles, Smartphone, ShieldCheck, Check, X, ShieldAlert } from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'brand' | 'segments' | 'channels' | 'policies'>('brand');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-aurora-neutral-200">
        <span className="text-[11px] font-bold uppercase tracking-wider text-aurora-primary bg-aurora-primary-light px-2.5 py-1 rounded">
          Enterprise Governance
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-aurora-neutral-900 mt-2 tracking-tight">
          Governed Knowledge Base & Policy Engine
        </h1>
        <p className="text-sm text-aurora-neutral-700 mt-1 max-w-3xl leading-relaxed">
          The single source of truth for brand voice, customer communication profiles, channel constraints, and deterministic policy rulebooks.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-aurora-neutral-200 pb-3 overflow-x-auto">
        {[
          { id: 'brand', label: 'Brand Voice & Tone', icon: Sparkles },
          { id: 'segments', label: 'Customer Segments', icon: BookOpen },
          { id: 'channels', label: 'Channel Constraints', icon: Smartphone },
          { id: 'policies', label: 'Governance Policies', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-aurora-primary text-white shadow-sm'
                  : 'bg-aurora-neutral-100 text-aurora-neutral-700 hover:bg-aurora-neutral-200'
              }`}
            >
              <Icon strokeWidth={1.5} className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section 1: Brand Voice */}
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

      {/* Section 2: Customer Segments */}
      {activeSection === 'segments' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(CUSTOMER_SEGMENT_GUIDELINES).map(([name, seg]) => (
            <div key={name} className="bg-aurora-neutral-0 p-5 rounded-lg border border-aurora-neutral-200 shadow-aurora flex flex-col justify-between text-xs">
              <div>
                <span className="font-bold text-sm text-aurora-neutral-900 block mb-1">{name}</span>
                <p className="text-aurora-neutral-700 mb-4 leading-relaxed">{seg.style}</p>
              </div>
              <div className="pt-3 border-t border-aurora-neutral-200 space-y-2">
                <div>
                  <span className="font-semibold text-aurora-neutral-500 block mb-1">Channel Preference Hierarchy:</span>
                  <div className="flex space-x-1">
                    {seg.channelPreferenceWeight.map((ch, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-aurora-primary-light text-aurora-primary font-bold rounded text-[10px]">
                        {idx + 1}. {ch}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-aurora-neutral-500 block mb-0.5">Information Density:</span>
                  <p className="text-aurora-neutral-700">{seg.informationDensity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 3: Channel Constraints */}
      {activeSection === 'channels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(CHANNEL_GUIDELINES).map(([channel, guide]) => (
            <div key={channel} className="bg-aurora-neutral-0 p-5 rounded-lg border border-aurora-neutral-200 shadow-aurora text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-aurora-neutral-200">
                <h3 className="font-bold text-sm text-aurora-neutral-900">{channel}</h3>
                <span className="font-mono text-aurora-neutral-500">Max {guide.maxCharacters} chars</span>
              </div>
              <div>
                <span className="font-semibold text-aurora-neutral-500 block mb-0.5">Structural Requirements:</span>
                <p className="text-aurora-neutral-900">{guide.structure}</p>
              </div>
              <div>
                <span className="font-semibold text-aurora-neutral-500 block mb-0.5">Greeting Style:</span>
                <p className="text-aurora-neutral-700 italic">"{guide.greeting}"</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-aurora-neutral-200 text-[11px]">
                <div>
                  <span className="font-semibold text-aurora-success block mb-0.5">Permitted:</span>
                  <ul className="list-disc list-inside text-aurora-neutral-700">
                    {guide.permittedElements.map((el, i) => (
                      <li key={i}>{el}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-aurora-error block mb-0.5">Prohibitions:</span>
                  <ul className="list-disc list-inside text-aurora-neutral-700">
                    {guide.prohibitions.map((pr, i) => (
                      <li key={i}>{pr}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 4: Policies */}
      {activeSection === 'policies' && (
        <div className="space-y-4">
          {COMPANY_POLICIES.map((pol) => (
            <div key={pol.id} className="bg-aurora-neutral-0 p-5 rounded-lg border border-aurora-neutral-200 shadow-aurora text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-aurora-primary">{pol.id}</span>
                  <span className="font-bold text-sm text-aurora-neutral-900">{pol.title}</span>
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  pol.priority === 'critical'
                    ? 'bg-aurora-error-light text-aurora-error border border-aurora-error/20'
                    : 'bg-aurora-warning-light text-aurora-warning border border-aurora-warning/20'
                }`}>
                  {pol.priority} priority
                </span>
              </div>
              <p className="text-aurora-neutral-700 leading-relaxed">{pol.rule}</p>
              <div className="pt-2 border-t border-aurora-neutral-200 flex items-center justify-between text-[11px] text-aurora-neutral-500">
                <span className="font-mono">Node: {pol.nodePath}</span>
                <span>Human Approval: {pol.escalationRequired ? 'Mandatory' : 'Autonomous'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

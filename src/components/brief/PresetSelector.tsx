import React from 'react';
import { PRESET_SCENARIOS, PresetScenario } from '@/core/presets';
import { Sparkles, ArrowRight, UserCheck, ShieldAlert, Clock } from 'lucide-react';

interface PresetSelectorProps {
  selectedPresetId?: string;
  onSelectPreset: (preset: PresetScenario) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({ selectedPresetId, onSelectPreset }) => {
  return (
    <div className="bg-aurora-neutral-0 rounded-lg p-5 border border-aurora-neutral-200 shadow-aurora mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
          <h3 className="text-sm font-bold text-aurora-neutral-900">Pre-Configured Enterprise Scenarios</h3>
        </div>
        <span className="text-xs text-aurora-neutral-500">1-click to test agent orchestration</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRESET_SCENARIOS.map((scenario) => {
          const isSelected = selectedPresetId === scenario.id;
          const isHero = scenario.id === 'hero-rahul';
          return (
            <button
              key={scenario.id}
              onClick={() => onSelectPreset(scenario)}
              className={`text-left p-3.5 rounded-lg border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-aurora-primary bg-aurora-primary-light shadow-sm'
                  : 'border-aurora-neutral-200 hover:border-aurora-neutral-300 hover:bg-aurora-neutral-100 bg-aurora-neutral-0'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      isHero
                        ? 'bg-aurora-primary text-white'
                        : scenario.badge === 'Contrasting'
                        ? 'bg-aurora-neutral-200 text-aurora-neutral-900'
                        : scenario.badge === 'Suppression Test'
                        ? 'bg-aurora-warning-light text-aurora-warning border border-aurora-warning/20'
                        : scenario.badge === 'Contradiction Test'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : scenario.badge === 'Consent Gate'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-aurora-error-light text-aurora-error border border-aurora-error/20'
                    }`}
                  >
                    {scenario.badge}
                  </span>
                  <span className="text-xs text-aurora-neutral-500 font-mono">{scenario.customer.preferredChannel}</span>
                </div>
                <h4 className="text-sm font-semibold text-aurora-neutral-900 leading-tight mb-1">{scenario.customer.name}</h4>
                <p className="text-xs text-aurora-neutral-500 line-clamp-2 leading-relaxed">{scenario.tagline}</p>
              </div>
              
              <div className="mt-3 pt-2 border-t border-aurora-neutral-200/60 flex items-center justify-between text-xs text-aurora-primary font-medium">
                <span>Load context</span>
                <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { BusinessObjectiveType } from '@/core/types';
import { Target, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';

interface ObjectivePivotBarProps {
  currentObjective: BusinessObjectiveType;
  onPivotObjective: (newObjective: BusinessObjectiveType) => void;
  isLoading?: boolean;
}

export const ObjectivePivotBar: React.FC<ObjectivePivotBarProps> = ({
  currentObjective,
  onPivotObjective,
  isLoading,
}) => {
  const [selectedObjective, setSelectedObjective] = useState<BusinessObjectiveType>(currentObjective);

  const handleRerun = () => {
    onPivotObjective(selectedObjective);
  };

  return (
    <div className="bg-aurora-neutral-0 rounded-lg p-5 border-2 border-aurora-primary/30 shadow-aurora">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Target strokeWidth={1.5} className="w-5 h-5 text-aurora-primary" />
            <h3 className="text-sm font-bold text-aurora-neutral-900">
              Interactive Objective Pivot · Test Strategy Adaptation
            </h3>
          </div>
          <p className="text-xs text-aurora-neutral-700 mt-1 leading-relaxed">
            Changing the objective doesn't just rewrite wording — the agents re-evaluate channel, tone, policy path, and call-to-action requirements.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <select
            value={selectedObjective}
            onChange={(e) => setSelectedObjective(e.target.value as BusinessObjectiveType)}
            className="p-2.5 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded-md text-xs font-bold text-aurora-neutral-900 focus:ring-2 focus:ring-aurora-primary"
          >
            <option value="resolve_issue">Resolve issue proactively</option>
            <option value="reduce_support_contacts">Minimise incoming support contacts</option>
            <option value="reassure_customer">Reassure anxious customer</option>
            <option value="retain_customer">Retain high-value customer</option>
            <option value="complete_application">Complete onboarding / application</option>
            <option value="recover_payment">Recover failed payment</option>
            <option value="inform_customer">Inform customer of update</option>
          </select>

          <button
            type="button"
            onClick={handleRerun}
            disabled={isLoading}
            className="px-5 py-2.5 bg-aurora-primary hover:bg-aurora-primary-hover text-white rounded-md text-xs font-bold shadow-sm flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw strokeWidth={1.5} className="w-3.5 h-3.5 animate-spin" />
                <span>Re-running Agents...</span>
              </>
            ) : (
              <>
                <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>Re-run Agent System</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { CustomerProfile, BusinessEvent } from '@/core/types';
import { ChevronDown, ChevronUp, Sliders, Shield, History } from 'lucide-react';

interface AdvancedContextProps {
  customer: CustomerProfile;
  event: BusinessEvent;
  onChangeCustomer: (updated: Partial<CustomerProfile>) => void;
  onChangeEvent: (updated: Partial<BusinessEvent>) => void;
}

export const AdvancedContext: React.FC<AdvancedContextProps> = ({
  customer,
  event,
  onChangeCustomer,
  onChangeEvent,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-aurora-neutral-0 rounded-lg border border-aurora-neutral-200 overflow-hidden shadow-aurora">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-aurora-neutral-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Sliders strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
          <span className="text-sm font-semibold text-aurora-neutral-900">Advanced Customer Context & History</span>
          <span className="text-xs text-aurora-neutral-500 font-normal hidden sm:inline">
            (Fatigue counts, support history, sentiment, verified facts)
          </span>
        </div>
        <div className="flex items-center space-x-1 text-xs text-aurora-neutral-500 font-medium">
          <span>{isOpen ? 'Collapse' : 'Expand'}</span>
          {isOpen ? <ChevronUp strokeWidth={1.5} className="w-4 h-4" /> : <ChevronDown strokeWidth={1.5} className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-aurora-neutral-200 bg-aurora-neutral-100 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 24h Transactional message count */}
            <div>
              <label className="block text-aurora-neutral-700 font-medium mb-1">
                24h Transactional Messages
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={customer.recentCommunicationCount24h.transactional}
                onChange={(e) =>
                  onChangeCustomer({
                    recentCommunicationCount24h: {
                      ...customer.recentCommunicationCount24h,
                      transactional: parseInt(e.target.value) || 0,
                    },
                  })
                }
                className="w-full p-2 bg-aurora-neutral-0 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:ring-1 focus:ring-aurora-primary"
              />
              <span className="text-[10px] text-aurora-neutral-500">Threshold: $\ge 3$ triggers fatigue check</span>
            </div>

            {/* 24h Promotional message count */}
            <div>
              <label className="block text-aurora-neutral-700 font-medium mb-1">
                24h Promotional Messages
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={customer.recentCommunicationCount24h.promotional}
                onChange={(e) =>
                  onChangeCustomer({
                    recentCommunicationCount24h: {
                      ...customer.recentCommunicationCount24h,
                      promotional: parseInt(e.target.value) || 0,
                    },
                  })
                }
                className="w-full p-2 bg-aurora-neutral-0 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:ring-1 focus:ring-aurora-primary"
              />
              <span className="text-[10px] text-aurora-neutral-500">Threshold: $\ge 2$ triggers hard suppression</span>
            </div>

            {/* Prior Support Contacts */}
            <div>
              <label className="block text-aurora-neutral-700 font-medium mb-1">
                Prior Support Tickets
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={customer.previousSupportContacts}
                onChange={(e) =>
                  onChangeCustomer({
                    previousSupportContacts: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full p-2 bg-aurora-neutral-0 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:ring-1 focus:ring-aurora-primary"
              />
              <span className="text-[10px] text-aurora-neutral-500">Influences reassurance & proactive resolution</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Customer Sentiment */}
            <div>
              <label className="block text-aurora-neutral-700 font-medium mb-1">
                Customer Sentiment State
              </label>
              <select
                value={customer.sentiment}
                onChange={(e) => onChangeCustomer({ sentiment: e.target.value as any })}
                className="w-full p-2 bg-aurora-neutral-0 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:ring-1 focus:ring-aurora-primary"
              >
                <option value="Neutral">Neutral</option>
                <option value="Anxious">Anxious (Heightened Reassurance)</option>
                <option value="Frustrated">Frustrated (Empathetic / Direct)</option>
                <option value="Satisfied">Satisfied</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Resolution Status */}
            <div>
              <label className="block text-aurora-neutral-700 font-medium mb-1">
                Event Resolution Status
              </label>
              <select
                value={event.resolutionStatus}
                onChange={(e) => onChangeEvent({ resolutionStatus: e.target.value as any })}
                className="w-full p-2 bg-aurora-neutral-0 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:ring-1 focus:ring-aurora-primary"
              >
                <option value="Refund Initiated">Refund Initiated (No Customer Action)</option>
                <option value="Resolved">Resolved</option>
                <option value="Requires Customer Action">Requires Customer Action (Upload/Retry)</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending Approval">Pending Supervisor Approval</option>
                <option value="None Required">None Required (Routine)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

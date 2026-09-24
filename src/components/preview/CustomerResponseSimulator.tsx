import React, { useState } from 'react';
import { CustomerProfile, BusinessEvent, ChannelMessage } from '@/core/types';
import { MessageSquareText, Sparkles, User, Loader2, ArrowRight } from 'lucide-react';

interface CustomerResponseSimulatorProps {
  customer: CustomerProfile;
  event: BusinessEvent;
  message: ChannelMessage;
}

export const CustomerResponseSimulator: React.FC<CustomerResponseSimulatorProps> = ({
  customer,
  event,
  message,
}) => {
  const [response, setResponse] = useState<{ reply: string; sentiment: string; followupNeeded: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulate = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/simulate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer, event, message: message.body }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-aurora-neutral-0 rounded-lg p-5 border border-aurora-neutral-200 shadow-aurora">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-aurora-neutral-200 mb-4 gap-2">
        <div className="flex items-center space-x-2">
          <MessageSquareText strokeWidth={1.5} className="w-5 h-5 text-aurora-primary" />
          <h3 className="text-sm font-bold text-aurora-neutral-900">Simulate Customer Reaction</h3>
        </div>
        <button
          type="button"
          onClick={handleSimulate}
          disabled={isLoading}
          className="px-3 py-1.5 bg-aurora-neutral-100 hover:bg-aurora-neutral-200 text-aurora-primary border border-aurora-neutral-300 rounded text-xs font-bold flex items-center space-x-1.5 transition disabled:opacity-50 self-start sm:self-auto"
        >
          {isLoading ? (
            <>
              <Loader2 strokeWidth={1.5} className="w-3.5 h-3.5 animate-spin" />
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>Predict Customer Reply</span>
            </>
          )}
        </button>
      </div>

      {response ? (
        <div className="space-y-3 bg-aurora-neutral-100 p-4 rounded-lg border border-aurora-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-aurora-neutral-900">
              <User strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
              <span>Simulated Inbound Message from {customer.name}</span>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-aurora-success-light text-aurora-success border border-aurora-success/20">
              Sentiment: {response.sentiment}
            </span>
          </div>

          <p className="text-xs text-aurora-neutral-900 bg-white p-3 rounded border border-neutral-200 italic leading-relaxed">
            "{response.reply}"
          </p>

          <div className="text-[11px] text-aurora-neutral-700 flex items-center justify-between pt-1">
            <span>Customer Support Escalation Needed: <strong>{response.followupNeeded ? 'Yes' : 'No (Issue Resolved)'}</strong></span>
            <span className="text-aurora-neutral-500 font-mono">Channel: Inbound {customer.preferredChannel}</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-aurora-neutral-500">
          Click "Predict Customer Reply" to evaluate how {customer.name} is expected to respond to this orchestrated message.
        </div>
      )}
    </div>
  );
};

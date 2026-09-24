import React, { useState } from 'react';
import { Sparkles, ArrowRightLeft, Check, X } from 'lucide-react';

interface BeforeAfterCompareProps {
  genericTemplateText: string;
  aiMessageText: string;
  differences: string[];
}

export const BeforeAfterCompare: React.FC<BeforeAfterCompareProps> = ({
  genericTemplateText,
  aiMessageText,
  differences,
}) => {
  const [showDiff, setShowDiff] = useState(true);

  return (
    <div className="bg-aurora-neutral-0 rounded-lg p-5 border border-aurora-neutral-200 shadow-aurora">
      <div className="flex items-center justify-between pb-3 border-b border-aurora-neutral-200 mb-4">
        <div className="flex items-center space-x-2">
          <ArrowRightLeft strokeWidth={1.5} className="w-5 h-5 text-aurora-primary" />
          <h3 className="text-sm font-bold text-aurora-neutral-900">Before (Template) vs AI Multi-Agent Comparison</h3>
        </div>
        <button
          type="button"
          onClick={() => setShowDiff(!showDiff)}
          className="text-xs text-aurora-primary font-semibold hover:underline"
        >
          {showDiff ? 'Hide Comparison' : 'Show Comparison'}
        </button>
      </div>

      {showDiff && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Generic Legacy Template */}
            <div className="p-4 rounded-lg border border-aurora-neutral-300 bg-aurora-neutral-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-aurora-neutral-500">
                    Legacy Predefined Template
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-aurora-neutral-200 text-aurora-neutral-700">
                    Static / Unaware
                  </span>
                </div>
                <p className="text-xs text-aurora-neutral-700 leading-relaxed font-sans italic bg-aurora-neutral-0 p-3 rounded border border-aurora-neutral-200">
                  "{genericTemplateText}"
                </p>
              </div>
              <div className="mt-3 text-[11px] text-aurora-neutral-500 space-y-1">
                <div className="flex items-center space-x-1 text-aurora-error">
                  <X strokeWidth={1.5} className="w-3.5 h-3.5" />
                  <span>No customer profile awareness</span>
                </div>
                <div className="flex items-center space-x-1 text-aurora-error">
                  <X strokeWidth={1.5} className="w-3.5 h-3.5" />
                  <span>Forces customer to initiate support call</span>
                </div>
              </div>
            </div>

            {/* AI Agent Orchestrated Message */}
            <div className="p-4 rounded-lg border-2 border-aurora-primary/40 bg-aurora-primary-light/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-aurora-primary">
                    AI Agent Orchestrated Message
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-aurora-primary text-white">
                    Context Grounded
                  </span>
                </div>
                <p className="text-xs text-aurora-neutral-900 leading-relaxed font-sans bg-white p-3 rounded border border-aurora-primary/20 shadow-sm">
                  "{aiMessageText.slice(0, 240)}..."
                </p>
              </div>
              <div className="mt-3 text-[11px] text-aurora-neutral-700 space-y-1">
                <div className="flex items-center space-x-1 text-aurora-success font-medium">
                  <Check strokeWidth={1.5} className="w-3.5 h-3.5" />
                  <span>Cites verified transaction facts and refund timeline</span>
                </div>
                <div className="flex items-center space-x-1 text-aurora-success font-medium">
                  <Check strokeWidth={1.5} className="w-3.5 h-3.5" />
                  <span>Proactive zero-action reassurance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Value Shift Breakdown */}
          <div className="p-3 bg-aurora-neutral-100 rounded-lg border border-aurora-neutral-200 text-xs">
            <span className="font-bold text-aurora-neutral-900 block mb-1.5">
              Specific Enterprise Value Drivers:
            </span>
            <ul className="space-y-1 text-aurora-neutral-700">
              {differences.map((diff, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-aurora-primary font-bold">›</span>
                  <span>{diff}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

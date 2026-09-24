import React from 'react';
import { ChannelMessage } from '@/core/types';
import { Smartphone } from 'lucide-react';

interface SMSFrameProps {
  message: ChannelMessage;
  recipientPhone?: string;
}

export const SMSFrame: React.FC<SMSFrameProps> = ({ message, recipientPhone = "+91 98765 43210" }) => {
  const isOverLimit = message.characterCount > 160;

  return (
    <div className="max-w-sm mx-auto bg-aurora-neutral-900 rounded-3xl p-3 shadow-aurora-lg border-4 border-aurora-neutral-700">
      {/* Phone Screen */}
      <div className="bg-aurora-neutral-0 rounded-2xl overflow-hidden min-h-[300px] flex flex-col justify-between border border-aurora-neutral-200">
        {/* Header */}
        <div className="bg-aurora-neutral-100 p-3 border-b border-aurora-neutral-200 text-center">
          <div className="w-8 h-8 rounded-full bg-aurora-neutral-300 text-aurora-neutral-700 mx-auto flex items-center justify-center text-xs font-bold mb-1">
            AC
          </div>
          <span className="text-xs font-bold text-aurora-neutral-900 block">Aurora Cloud</span>
          <span className="text-[10px] text-aurora-neutral-500 font-mono">{recipientPhone}</span>
        </div>

        {/* Bubble */}
        <div className="p-4 flex-1 flex flex-col justify-end">
          <div className="bg-aurora-neutral-100 border border-aurora-neutral-300 rounded-2xl rounded-bl-sm p-3.5 text-xs text-aurora-neutral-900 leading-relaxed shadow-sm">
            {message.body}
            <div className="text-[9px] text-aurora-neutral-500 text-right mt-1.5 font-mono">
              SMS · Direct
            </div>
          </div>
        </div>

        {/* Counter */}
        <div className="p-2.5 bg-aurora-neutral-100 border-t border-aurora-neutral-200 flex items-center justify-between text-[11px]">
          <span className={`font-mono font-bold ${isOverLimit ? 'text-aurora-error' : 'text-aurora-success'}`}>
            {message.characterCount} / 160 chars
          </span>
          <span className="text-[10px] uppercase font-bold text-aurora-neutral-500">
            {isOverLimit ? 'Multi-Part SMS' : 'Single Segment'}
          </span>
        </div>
      </div>
    </div>
  );
};

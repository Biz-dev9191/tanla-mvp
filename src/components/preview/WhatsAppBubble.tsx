import React from 'react';
import { ChannelMessage } from '@/core/types';
import { MessageSquare, CheckCheck, Smartphone } from 'lucide-react';

interface WhatsAppBubbleProps {
  message: ChannelMessage;
  recipientName: string;
  phone?: string;
}

export const WhatsAppBubble: React.FC<WhatsAppBubbleProps> = ({ message, recipientName, phone = "+91 98765 43210" }) => {
  return (
    <div className="max-w-md mx-auto bg-[#EFEAE2] rounded-xl overflow-hidden border border-aurora-neutral-300 shadow-aurora-md">
      {/* WhatsApp Header */}
      <div className="bg-[#075E54] text-white p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-white text-[#075E54] font-bold text-xs flex items-center justify-center">
            AC
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-xs tracking-tight">Aurora Cloud Verified</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]"></span>
            </div>
            <span className="text-[10px] text-white/80 font-mono">{phone}</span>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-white/20 rounded">
          Simulation
        </span>
      </div>

      {/* Message Area */}
      <div className="p-4 space-y-3 min-h-[220px] flex flex-col justify-end bg-[radial-gradient(#d1d7db_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="self-start max-w-[90%] bg-white rounded-lg p-3.5 shadow-sm text-xs text-[#111B21] relative rounded-tl-none border border-neutral-200">
          <p className="whitespace-pre-line leading-relaxed font-sans">{message.body}</p>
          <div className="flex items-center justify-end space-x-1 mt-2 text-[10px] text-neutral-400">
            <span>Just now</span>
            <CheckCheck strokeWidth={1.5} className="w-3.5 h-3.5 text-[#53BDEB]" />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-white border-t border-neutral-200 text-center text-[10px] text-neutral-500 font-mono">
        {message.characterCount} characters · Optimized for WhatsApp Business API
      </div>
    </div>
  );
};

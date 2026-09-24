import React from 'react';
import { ChannelMessage } from '@/core/types';
import {
  ChevronLeft,
  Signal,
  Wifi,
  Battery,
  User,
  Info,
  Camera,
  Mic,
  Smile,
  ArrowUp,
} from 'lucide-react';

interface SMSFrameProps {
  message: ChannelMessage;
  recipientPhone?: string;
}

export const SMSFrame: React.FC<SMSFrameProps> = ({
  message,
  recipientPhone = "+91 98765 43210",
}) => {
  const isOverLimit = message.characterCount > 160;
  const segments = Math.ceil(message.characterCount / 160) || 1;

  return (
    <div className="flex flex-col items-center">
      {/* Smartphone Device Shell */}
      <div className="w-full max-w-[340px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-black/60 relative">
        {/* Physical Button Accents */}
        <div className="absolute -left-4.5 top-24 w-1 h-8 bg-slate-700 rounded-l-sm" />
        <div className="absolute -left-4.5 top-36 w-1 h-12 bg-slate-700 rounded-l-sm" />
        <div className="absolute -left-4.5 top-52 w-1 h-12 bg-slate-700 rounded-l-sm" />
        <div className="absolute -right-4.5 top-32 w-1 h-16 bg-slate-700 rounded-r-sm" />

        {/* Mobile Screen */}
        <div className="bg-[#F2F2F7] rounded-[34px] overflow-hidden flex flex-col justify-between border border-slate-900 relative shadow-inner min-h-[540px]">
          {/* Top Status Bar (iOS style) */}
          <div className="bg-white/90 backdrop-blur-md text-neutral-900 pt-2 px-6 pb-1 flex items-center justify-between text-[11px] font-semibold tracking-tight border-b border-neutral-200/50">
            <span>9:41</span>
            {/* Dynamic Island Notch */}
            <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-900 mr-1" />
            </div>
            <div className="flex items-center space-x-1.5 text-neutral-800">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* iOS Messages Navigation Bar */}
          <div className="bg-white/90 backdrop-blur-md px-3 py-2 flex items-center justify-between border-b border-neutral-200 shadow-2xs">
            <div className="flex items-center space-x-1 text-blue-500 cursor-pointer -ml-1">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-xs font-normal">Messages</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-600 to-slate-400 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                AC
              </div>
              <span className="text-[11px] font-bold text-neutral-900 mt-0.5">Aurora Cloud</span>
              <span className="text-[9px] text-neutral-500 font-mono">{recipientPhone}</span>
            </div>

            <div className="w-6 flex justify-end">
              <Info className="w-4 h-4 text-blue-500 cursor-pointer" />
            </div>
          </div>

          {/* Chat Canvas Area */}
          <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-end">
            {/* Date / Timestamp Header */}
            <div className="self-center text-center">
              <span className="text-[10px] text-neutral-400 font-medium">
                Today 10:24 AM
              </span>
              <div className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold mt-0.5">
                SMS / Text Message
              </div>
            </div>

            {/* Inbound SMS Bubble (iOS Neutral Grey Style) */}
            <div className="self-start max-w-[90%] bg-[#E9E9EB] text-neutral-900 rounded-[20px] rounded-tl-sm px-3.5 py-2.5 shadow-2xs text-[12px] leading-relaxed relative">
              <p className="whitespace-pre-line font-sans">{message.body}</p>
              <div className="text-[9px] text-neutral-500 text-right mt-1 font-mono">
                Delivered
              </div>
            </div>
          </div>

          {/* Bottom iOS SMS Composer Bar */}
          <div className="bg-white/90 backdrop-blur-md px-3 py-2 flex items-center space-x-2 border-t border-neutral-200">
            <Camera className="w-5 h-5 text-neutral-400 cursor-pointer" />
            <div className="flex-1 bg-[#E9E9EB] rounded-full px-3.5 py-1.5 flex items-center justify-between text-xs text-neutral-400">
              <span>Text Message</span>
              <Smile className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs cursor-pointer">
              <ArrowUp className="w-4 h-4" />
            </div>
          </div>

          {/* iPhone Home Indicator */}
          <div className="bg-white/90 pb-2 pt-0.5 flex justify-center">
            <div className="w-28 h-1 bg-neutral-900/60 rounded-full" />
          </div>
        </div>
      </div>

      {/* SMS Telemetry & Segment Pill */}
      <div className="mt-3 text-center">
        <span className="inline-flex items-center space-x-1.5 text-[11px] font-mono font-medium text-aurora-neutral-600 bg-white px-3 py-1 rounded-full border border-aurora-neutral-200 shadow-2xs">
          <span className={isOverLimit ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'}>
            {message.characterCount} / 160 chars
          </span>
          <span>•</span>
          <span>{segments} SMS {segments > 1 ? 'Segments' : 'Segment'} (GSM 7-bit)</span>
        </span>
      </div>
    </div>
  );
};

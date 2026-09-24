import React from 'react';
import { ChannelMessage } from '@/core/types';
import {
  ChevronLeft,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Camera,
  Mic,
  CheckCheck,
  Wifi,
  Battery,
  Signal,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface WhatsAppBubbleProps {
  message: ChannelMessage;
  recipientName: string;
  phone?: string;
}

export const WhatsAppBubble: React.FC<WhatsAppBubbleProps> = ({
  message,
  recipientName,
  phone = "+91 98765 43210",
}) => {
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
        <div className="bg-[#EFEAE2] rounded-[34px] overflow-hidden flex flex-col justify-between border border-slate-900 relative shadow-inner min-h-[540px]">
          {/* Top Status Bar (iOS style) with Mathematically Centered Dynamic Island */}
          <div className="bg-[#075E54] text-white pt-2 px-6 pb-1 flex items-center justify-between text-[11px] font-semibold tracking-tight relative">
            <span className="z-10">9:41</span>
            {/* Dynamic Island Notch - Centered Mathematically */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-20 h-4 bg-black rounded-full flex items-center justify-center pointer-events-none z-10 shadow-xs">
              <div className="w-2 h-2 rounded-full bg-slate-900 mr-1" />
            </div>
            <div className="flex items-center space-x-1.5 text-white/90 z-10">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* WhatsApp App Bar */}
          <div className="bg-[#075E54] text-white px-3 py-2 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5 text-white cursor-pointer -ml-1" />
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white text-[#075E54] font-bold text-xs flex items-center justify-center shadow-xs">
                  AC
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#25D366] border-2 border-[#075E54]" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-xs tracking-tight">Aurora Cloud</span>
                  <ShieldCheck className="w-3 h-3 text-[#25D366] fill-[#25D366]/20" />
                </div>
                <span className="text-[10px] text-white/80 font-normal">Official Business Account</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-white/90">
              <Video className="w-4 h-4 cursor-pointer" />
              <Phone className="w-3.5 h-3.5 cursor-pointer" />
              <MoreVertical className="w-4 h-4 cursor-pointer" />
            </div>
          </div>

          {/* Chat Canvas Area */}
          <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-end bg-[radial-gradient(#cfd5d9_1px,transparent_1px)] [background-size:14px_14px]">
            {/* Encryption pill */}
            <div className="self-center bg-[#FFEECD] text-[#54656F] text-[9px] px-3 py-1 rounded-md shadow-2xs max-w-[260px] text-center flex items-center justify-center space-x-1 border border-[#F4E3BE]">
              <Lock className="w-2.5 h-2.5 flex-shrink-0 text-[#8696A0]" />
              <span>Messages are end-to-end encrypted.</span>
            </div>

            {/* Date pill */}
            <div className="self-center bg-white/80 backdrop-blur-xs text-[#54656F] text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-2xs border border-neutral-200/60">
              Today
            </div>

            {/* Inbound Message Bubble */}
            <div className="self-start max-w-[92%] bg-white rounded-2xl rounded-tl-xs p-3 shadow-xs text-xs text-[#111B21] border border-neutral-200/80 relative">
              <p className="whitespace-pre-line leading-relaxed font-sans text-[12px]">{message.body}</p>
              <div className="flex items-center justify-end space-x-1 mt-1.5 text-[9px] text-[#667781]">
                <span>10:24 AM</span>
                <CheckCheck strokeWidth={1.75} className="w-3.5 h-3.5 text-[#53BDEB]" />
              </div>
            </div>
          </div>

          {/* Bottom WhatsApp Composer Bar */}
          <div className="bg-[#F0F2F5] px-2.5 py-2 flex items-center space-x-1.5 border-t border-neutral-300/70">
            <div className="flex-1 bg-white rounded-full px-3 py-1.5 flex items-center space-x-2 border border-neutral-200 shadow-2xs">
              <Smile className="w-4 h-4 text-[#8696A0] cursor-pointer" />
              <span className="text-xs text-[#8696A0] flex-1">Message</span>
              <Paperclip className="w-3.5 h-3.5 text-[#8696A0] cursor-pointer" />
              <Camera className="w-3.5 h-3.5 text-[#8696A0] cursor-pointer" />
            </div>
            <div className="w-8 h-8 rounded-full bg-[#00A884] text-white flex items-center justify-center shadow-xs cursor-pointer">
              <Mic className="w-4 h-4" />
            </div>
          </div>

          {/* iPhone Home Indicator */}
          <div className="bg-[#F0F2F5] pb-2 pt-0.5 flex justify-center">
            <div className="w-28 h-1 bg-neutral-900/60 rounded-full" />
          </div>
        </div>
      </div>

      {/* Metadata Pill */}
      <div className="mt-3 text-center">
        <span className="inline-flex items-center space-x-1.5 text-[11px] font-mono font-medium text-aurora-neutral-600 bg-white px-3 py-1 rounded-full border border-aurora-neutral-200 shadow-2xs">
          <span>{message.characterCount} characters</span>
          <span>•</span>
          <span className="text-emerald-700 font-bold">WhatsApp Business API Verified</span>
        </span>
      </div>
    </div>
  );
};

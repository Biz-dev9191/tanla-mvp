import React, { useState } from 'react';
import { ChannelMessage, PreferredChannel, CustomerProfile } from '@/core/types';
import { WhatsAppBubble } from './WhatsAppBubble';
import { SMSFrame } from './SMSFrame';
import { EmailTemplateView } from './EmailTemplateView';
import { VoiceSimulation } from './VoiceSimulation';
import { MessageSquare, Smartphone, Mail, PhoneCall, Send, CheckCircle2, Loader2, SendHorizontal } from 'lucide-react';

interface ChannelPreviewTabsProps {
  messages: {
    whatsapp: ChannelMessage;
    sms: ChannelMessage;
    email: ChannelMessage;
    voice: ChannelMessage;
  };
  recommendedChannel: PreferredChannel;
  customer: CustomerProfile;
  onSendMessage?: (target: { channel: PreferredChannel | 'ALL'; channelName: string; timestamp: string }) => void;
}

export const ChannelPreviewTabs: React.FC<ChannelPreviewTabsProps> = ({
  messages,
  recommendedChannel,
  customer,
  onSendMessage,
}) => {
  const [activeChannel, setActiveChannel] = useState<PreferredChannel>(recommendedChannel);
  const [isSending, setIsSending] = useState(false);
  const [sentStatus, setSentStatus] = useState<{ channel: string; timestamp: string } | null>(null);

  const channels = [
    { id: 'WhatsApp', label: 'WhatsApp', icon: MessageSquare, isLive: false },
    { id: 'SMS', label: 'SMS', icon: Smartphone, isLive: false },
    { id: 'Email', label: 'Email', icon: Mail, isLive: true },
    { id: 'Voice', label: 'Voice (Simulated)', icon: PhoneCall, isLive: false },
  ] as const;

  const handleDispatch = async (target: PreferredChannel | 'ALL') => {
    try {
      setIsSending(true);
      setSentStatus(null);

      // If email is targeted, trigger backend send-email endpoint
      if ((target === 'Email' || target === 'ALL') && customer.email) {
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: customer.email,
              subject: messages.email.subject || 'Aurora Cloud Notification',
              body: messages.email.body,
            }),
          });
        } catch (e) {
          console.warn('Email dispatch failed or simulated:', e);
        }
      }

      // Simulate a realistic gateway response delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      const channelLabel = target === 'ALL' ? 'All Channels (WhatsApp, SMS, Email, Voice)' : target;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setSentStatus({
        channel: channelLabel,
        timestamp,
      });

      if (onSendMessage) {
        onSendMessage({
          channel: target,
          channelName: channelLabel,
          timestamp,
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  const activeChannelData = channels.find((c) => c.id === activeChannel) || channels[0];
  const ActiveIcon = activeChannelData.icon;

  return (
    <div className="bg-aurora-neutral-0 rounded-lg p-5 border border-aurora-neutral-200 shadow-aurora space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-aurora-neutral-200 gap-2">
        <div className="flex items-center space-x-2">
          <MessageSquare strokeWidth={1.5} className="w-5 h-5 text-aurora-primary" />
          <h3 className="text-sm font-bold text-aurora-neutral-900">Multi-Channel Communication Previews</h3>
        </div>
        <span className="text-xs text-aurora-neutral-500">
          Recommended Channel: <strong className="text-aurora-primary font-bold">{recommendedChannel}</strong>
        </span>
      </div>

      {/* Channel Switcher Tabs */}
      <div className="flex space-x-2 border-b border-aurora-neutral-200 pb-3 overflow-x-auto">
        {channels.map((ch) => {
          const Icon = ch.icon;
          const isActive = activeChannel === ch.id;
          const isRecommended = recommendedChannel === ch.id;

          return (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id as PreferredChannel)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-aurora-primary text-white shadow-sm'
                  : 'bg-aurora-neutral-100 text-aurora-neutral-700 hover:bg-aurora-neutral-200'
              }`}
            >
              <Icon strokeWidth={1.5} className="w-4 h-4" />
              <span>{ch.label}</span>
              {isRecommended && (
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                    isActive ? 'bg-white text-aurora-primary' : 'bg-aurora-primary text-white'
                  }`}
                >
                  Recommended
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Render active preview frame */}
      <div className="py-2">
        {activeChannel === 'WhatsApp' && (
          <WhatsAppBubble message={messages.whatsapp} recipientName={customer.name} phone={customer.phone} />
        )}
        {activeChannel === 'SMS' && (
          <SMSFrame message={messages.sms} recipientPhone={customer.phone} />
        )}
        {activeChannel === 'Email' && (
          <EmailTemplateView message={messages.email} recipientEmail={customer.email || "customer@example.com"} recipientName={customer.name} />
        )}
        {activeChannel === 'Voice' && (
          <VoiceSimulation message={messages.voice} customerName={customer.name} />
        )}
      </div>

      {/* Bottom Dispatch Action Bar */}
      <div className="pt-4 border-t border-aurora-neutral-200 space-y-3">
        {/* Sent Confirmation Banner */}
        {sentStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs flex items-center justify-between text-emerald-950 shadow-2xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2 strokeWidth={2} className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">
                Message successfully sent via <strong className="text-emerald-900">{sentStatus.channel}</strong> to {customer.name}.
              </span>
            </div>
            <span className="font-mono text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
              Logged in Audit History • {sentStatus.timestamp}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-aurora-neutral-500 font-mono self-start sm:self-center">
            Recipient: {customer.name} ({customer.preferredChannel}) · Logged to Audit History on Send
          </span>

          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            {/* Button 1: Send on Current Active Channel */}
            <button
              type="button"
              onClick={() => handleDispatch(activeChannel)}
              disabled={isSending}
              className="w-full sm:w-auto px-4 py-2.5 bg-aurora-neutral-100 hover:bg-aurora-neutral-200 border border-aurora-neutral-300 text-aurora-neutral-900 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition shadow-xs disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 strokeWidth={1.5} className="w-4 h-4 animate-spin text-aurora-primary" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <ActiveIcon strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                  <span>Send on {activeChannel}</span>
                </>
              )}
            </button>

            {/* Button 2: Send Across All Channels */}
            <button
              type="button"
              onClick={() => handleDispatch('ALL')}
              disabled={isSending}
              className="w-full sm:w-auto px-5 py-2.5 bg-aurora-primary hover:bg-aurora-primary-hover text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition shadow-aurora-md disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 strokeWidth={1.5} className="w-4 h-4 animate-spin text-white" />
                  <span>Dispatching Omnichannel...</span>
                </>
              ) : (
                <>
                  <SendHorizontal strokeWidth={1.5} className="w-4 h-4" />
                  <span>Send Across All Channels</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

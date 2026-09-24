import React, { useState } from 'react';
import { ChannelMessage, PreferredChannel, CustomerProfile } from '@/core/types';
import { WhatsAppBubble } from './WhatsAppBubble';
import { SMSFrame } from './SMSFrame';
import { EmailTemplateView } from './EmailTemplateView';
import { VoiceSimulation } from './VoiceSimulation';
import { MessageSquare, Smartphone, Mail, PhoneCall, Send, CheckCircle2, Loader2, SendHorizontal, Lock } from 'lucide-react';

interface ChannelPreviewTabsProps {
  messages: {
    whatsapp: ChannelMessage;
    sms: ChannelMessage;
    email: ChannelMessage;
    voice: ChannelMessage;
  };
  recommendedChannel: PreferredChannel;
  customer: CustomerProfile;
  onSendMessage?: (target: { channel: string; channelName: string; timestamp: string }) => void;
  humanApprovalRequired?: boolean;
  humanApprovalStatus?: 'Pending' | 'Approved' | 'Rejected' | 'Not Required' | 'Revision Requested' | 'Suppressed';
}

export const ChannelPreviewTabs: React.FC<ChannelPreviewTabsProps> = ({
  messages,
  recommendedChannel,
  customer,
  onSendMessage,
  humanApprovalRequired,
  humanApprovalStatus,
}) => {
  const [activeChannel, setActiveChannel] = useState<PreferredChannel>(recommendedChannel);
  const [selectedChannels, setSelectedChannels] = useState<PreferredChannel[]>([
    'WhatsApp',
    'SMS',
    'Email',
    'Voice',
  ]);
  const [isSending, setIsSending] = useState(false);
  const [sentStatus, setSentStatus] = useState<{ channel: string; timestamp: string } | null>(null);

  const isApprovalPending = Boolean(humanApprovalRequired && humanApprovalStatus !== 'Approved');

  const channels = [
    { id: 'WhatsApp', label: 'WhatsApp', icon: MessageSquare, isLive: false },
    { id: 'SMS', label: 'SMS', icon: Smartphone, isLive: false },
    { id: 'Email', label: 'Email', icon: Mail, isLive: true },
    { id: 'Voice', label: 'Voice (Simulated)', icon: PhoneCall, isLive: false },
  ] as const;

  const toggleChannel = (chId: PreferredChannel) => {
    setSelectedChannels((prev) =>
      prev.includes(chId) ? prev.filter((id) => id !== chId) : [...prev, chId]
    );
  };

  const handleDispatch = async (target: PreferredChannel | PreferredChannel[]) => {
    try {
      setIsSending(true);
      setSentStatus(null);

      const targetList: PreferredChannel[] = Array.isArray(target) ? target : [target];
      if (targetList.length === 0) return;

      // If email is targeted, trigger backend send-email endpoint
      if (targetList.includes('Email') && customer.email) {
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

      const channelLabel = targetList.join(', ');
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setSentStatus({
        channel: channelLabel,
        timestamp,
      });

      if (onSendMessage) {
        onSendMessage({
          channel: channelLabel,
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

      {/* Channel Switcher Tabs with Checkboxes */}
      <div className="flex space-x-2 border-b border-aurora-neutral-200 pb-3 overflow-x-auto items-center">
        {channels.map((ch) => {
          const Icon = ch.icon;
          const isActive = activeChannel === ch.id;
          const isRecommended = recommendedChannel === ch.id;
          const isChecked = selectedChannels.includes(ch.id as PreferredChannel);

          return (
            <div
              key={ch.id}
              onClick={() => setActiveChannel(ch.id as PreferredChannel)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer select-none ${
                isActive
                  ? 'bg-aurora-primary text-white shadow-sm'
                  : 'bg-aurora-neutral-100 text-aurora-neutral-700 hover:bg-aurora-neutral-200'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleChannel(ch.id as PreferredChannel);
                }}
                onClick={(e) => e.stopPropagation()}
                title={`Select ${ch.label} for dispatch`}
                className={`w-3.5 h-3.5 rounded cursor-pointer ${
                  isActive ? 'accent-white bg-white text-aurora-primary' : 'accent-aurora-primary'
                }`}
              />
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
            </div>
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

        {/* Pending Approval Notice */}
        {isApprovalPending && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs flex items-center space-x-2 text-amber-900 shadow-2xs">
            <Lock strokeWidth={1.5} className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Supervisor Authorization Required:</strong> Dispatch buttons are locked until human approval is granted in the supervisor panel above.
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
              disabled={isSending || isApprovalPending}
              title={isApprovalPending ? 'Human approval required before dispatching' : undefined}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition shadow-xs ${
                isApprovalPending
                  ? 'bg-aurora-neutral-100 text-aurora-neutral-400 border border-aurora-neutral-200 cursor-not-allowed opacity-60'
                  : 'bg-aurora-neutral-100 hover:bg-aurora-neutral-200 border border-aurora-neutral-300 text-aurora-neutral-900 disabled:opacity-50'
              }`}
            >
              {isSending ? (
                <>
                  <Loader2 strokeWidth={1.5} className="w-4 h-4 animate-spin text-aurora-primary" />
                  <span>Dispatching...</span>
                </>
              ) : isApprovalPending ? (
                <>
                  <Lock strokeWidth={1.5} className="w-4 h-4 text-aurora-neutral-400" />
                  <span>Send on {activeChannel} (Locked)</span>
                </>
              ) : (
                <>
                  <ActiveIcon strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                  <span>Send on {activeChannel}</span>
                </>
              )}
            </button>

            {/* Button 2: Send to Selected Channels */}
            <button
              type="button"
              onClick={() => handleDispatch(selectedChannels)}
              disabled={isSending || isApprovalPending || selectedChannels.length === 0}
              title={
                isApprovalPending
                  ? 'Human approval required before dispatching'
                  : selectedChannels.length === 0
                  ? 'Please select at least one channel'
                  : undefined
              }
              className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition shadow-aurora-md ${
                isApprovalPending || selectedChannels.length === 0
                  ? 'bg-aurora-neutral-300 text-aurora-neutral-500 border border-aurora-neutral-300 cursor-not-allowed opacity-60'
                  : 'bg-aurora-primary hover:bg-aurora-primary-hover text-white disabled:opacity-50'
              }`}
            >
              {isSending ? (
                <>
                  <Loader2 strokeWidth={1.5} className="w-4 h-4 animate-spin text-white" />
                  <span>Dispatching Selected...</span>
                </>
              ) : isApprovalPending ? (
                <>
                  <Lock strokeWidth={1.5} className="w-4 h-4 text-aurora-neutral-500" />
                  <span>Send to Selected Channels (Locked)</span>
                </>
              ) : (
                <>
                  <SendHorizontal strokeWidth={1.5} className="w-4 h-4" />
                  <span>
                    Send to Selected {selectedChannels.length === 1 ? 'Channel' : 'Channels'}
                    {selectedChannels.length > 0 ? ` (${selectedChannels.length})` : ''}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ChannelMessage, PreferredChannel, CustomerProfile } from '@/core/types';
import { WhatsAppBubble } from './WhatsAppBubble';
import { SMSFrame } from './SMSFrame';
import { EmailTemplateView } from './EmailTemplateView';
import { VoiceSimulation } from './VoiceSimulation';
import { MessageSquare, Smartphone, Mail, PhoneCall, Check } from 'lucide-react';

interface ChannelPreviewTabsProps {
  messages: {
    whatsapp: ChannelMessage;
    sms: ChannelMessage;
    email: ChannelMessage;
    voice: ChannelMessage;
  };
  recommendedChannel: PreferredChannel;
  customer: CustomerProfile;
}

export const ChannelPreviewTabs: React.FC<ChannelPreviewTabsProps> = ({
  messages,
  recommendedChannel,
  customer,
}) => {
  const [activeChannel, setActiveChannel] = useState<PreferredChannel>(recommendedChannel);

  const channels = [
    { id: 'WhatsApp', label: 'WhatsApp', icon: MessageSquare, isLive: false },
    { id: 'SMS', label: 'SMS', icon: Smartphone, isLive: false },
    { id: 'Email', label: 'Email', icon: Mail, isLive: true },
    { id: 'Voice', label: 'Voice (Simulated)', icon: PhoneCall, isLive: false },
  ] as const;

  return (
    <div className="bg-aurora-neutral-0 rounded-lg p-5 border border-aurora-neutral-200 shadow-aurora">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-aurora-neutral-200 mb-4 gap-2">
        <div className="flex items-center space-x-2">
          <MessageSquare strokeWidth={1.5} className="w-5 h-5 text-aurora-primary" />
          <h3 className="text-sm font-bold text-aurora-neutral-900">Multi-Channel Communication Previews</h3>
        </div>
        <span className="text-xs text-aurora-neutral-500">
          Recommended Channel: <strong className="text-aurora-primary font-bold">{recommendedChannel}</strong>
        </span>
      </div>

      {/* Channel Switcher Tabs */}
      <div className="flex space-x-2 border-b border-aurora-neutral-200 pb-3 mb-6 overflow-x-auto">
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

      {/* Render active preview */}
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
    </div>
  );
};

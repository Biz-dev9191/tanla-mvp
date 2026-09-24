import React, { useState } from 'react';
import { ChannelMessage } from '@/core/types';
import { Mail } from 'lucide-react';

interface EmailTemplateViewProps {
  message: ChannelMessage;
  recipientEmail?: string;
  recipientName?: string;
}

export const EmailTemplateView: React.FC<EmailTemplateViewProps> = ({
  message,
  recipientEmail = "customer@example.com",
  recipientName = "Customer",
}) => {
  const [emailTo, setEmailTo] = useState(recipientEmail);

  return (
    <div className="bg-aurora-neutral-0 rounded-xl border border-aurora-neutral-300 shadow-aurora-md overflow-hidden max-w-2xl mx-auto">
      {/* Email Client Header */}
      <div className="bg-aurora-neutral-100 p-4 border-b border-aurora-neutral-200 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
            <span className="text-xs font-bold text-aurora-neutral-900">Enterprise Email Client</span>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-aurora-primary-light text-aurora-primary border border-aurora-primary/20">
            Outbound Channel Preview
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center">
            <span className="w-16 font-semibold text-aurora-neutral-500">From:</span>
            <span className="text-aurora-neutral-900 font-mono text-[11px]">
              Aurora Cloud Notifications &lt;notifications@auroracloud.app&gt;
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-16 font-semibold text-aurora-neutral-500">To:</span>
            <input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              className="flex-1 p-1 bg-aurora-neutral-0 border border-aurora-neutral-300 rounded font-mono text-[11px] text-aurora-neutral-900 focus:ring-1 focus:ring-aurora-primary"
            />
          </div>
          <div className="flex items-center">
            <span className="w-16 font-semibold text-aurora-neutral-500">Subject:</span>
            <span className="font-bold text-aurora-neutral-900 flex-1">{message.subject}</span>
          </div>
        </div>
      </div>

      {/* Email Body Canvas */}
      <div className="p-6 bg-white min-h-[300px]">
        {/* Aurora Cloud Email Header Logo */}
        <div className="pb-4 mb-4 border-b border-aurora-neutral-200 flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-aurora-primary text-white flex items-center justify-center font-bold text-[10px]">
            AC
          </div>
          <span className="font-bold text-xs text-aurora-neutral-900 tracking-tight">Aurora Cloud</span>
        </div>

        <div className="text-xs sm:text-sm text-aurora-neutral-900 leading-relaxed whitespace-pre-line font-sans">
          {message.body}
        </div>

        {/* Email Footer */}
        <div className="mt-8 pt-4 border-t border-aurora-neutral-200 text-[10px] text-aurora-neutral-500 space-y-1">
          <p>Aurora Cloud Inc. · Automated Notification Service</p>
          <p>This is a governed transactional communication. Preferences can be managed in your dashboard.</p>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="p-3 bg-aurora-neutral-100 border-t border-aurora-neutral-200 flex items-center justify-between text-xs text-aurora-neutral-500 font-mono">
        <span>{message.characterCount} characters</span>
        <span>Grounded in verified event facts</span>
      </div>
    </div>
  );
};

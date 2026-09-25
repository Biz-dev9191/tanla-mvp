import React, { useState } from 'react';
import { ChannelMessage } from '@/core/types';
import { Mail } from 'lucide-react';

interface EmailTemplateViewProps {
  message: ChannelMessage;
  recipientEmail?: string;
  recipientName?: string;
  fromEmail?: string;
}

export const EmailTemplateView: React.FC<EmailTemplateViewProps> = ({
  message,
  recipientEmail = "customer@example.com",
  recipientName = "Customer",
  fromEmail = "rachit9191@gmail.com",
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
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center">
            <span className="w-16 font-semibold text-aurora-neutral-500">From:</span>
            <span className="text-aurora-neutral-900 font-mono text-[11px]">
              Aurora Cloud Notifications &lt;{fromEmail}&gt;
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
        <div className="pb-4 mb-4 border-b border-aurora-neutral-200 flex items-center space-x-2 select-none">
          <div className="w-6 h-6 flex-shrink-0 rounded-md shadow-2xs overflow-hidden">
            <svg
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <rect width="64" height="64" rx="16" fill="#2B4C7E" />
              <rect x="1" y="1" width="62" height="62" rx="15" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.3" />
              <path d="M16 42C21 34 26 24 35 24C44 24 40 40 48 40" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
              <path d="M16 26C24 26 28 42 37 42C44 42 46 32 50 28" stroke="#BFDBFE" strokeWidth="3" strokeLinecap="round" />
              <circle cx="36" cy="33" r="2.5" fill="#FFFFFF" />
              <path d="M48 18L49 20L51 21L49 22L48 24L47 22L45 21L47 20Z" fill="#FFFFFF" />
            </svg>
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

import React, { useState } from 'react';
import { ChannelMessage } from '@/core/types';
import { Mail, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ status: 'DELIVERED' | 'SIMULATED' | 'FAILED'; details: string } | null>(null);

  const handleSendEmail = async () => {
    try {
      setIsSending(true);
      setSendResult(null);

      const customKey = typeof window !== 'undefined' ? localStorage.getItem('aurora_resend_key') : null;
      const customFrom = typeof window !== 'undefined' ? localStorage.getItem('aurora_sender_email') : null;

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTo,
          subject: message.subject || 'Aurora Cloud Notification',
          body: message.body,
          apiKey: customKey || undefined,
          from: customFrom || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSendResult({
          status: data.status,
          details: data.details,
        });
      } else {
        setSendResult({
          status: 'FAILED',
          details: data.error || 'Failed to dispatch email.',
        });
      }
    } catch (err: any) {
      setSendResult({
        status: 'FAILED',
        details: err.message || 'Network error.',
      });
    } finally {
      setIsSending(false);
    }
  };

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
            Live Outbound Channel
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

      {/* Dispatch Action Footer */}
      <div className="p-3.5 bg-aurora-neutral-100 border-t border-aurora-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-aurora-neutral-500 font-mono">
          {message.characterCount} words/chars · Grounded in verified facts
        </span>

        <button
          type="button"
          onClick={handleSendEmail}
          disabled={isSending}
          className="w-full sm:w-auto px-4 py-2 bg-aurora-primary hover:bg-aurora-primary-hover text-white rounded-md text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition disabled:opacity-50"
        >
          {isSending ? (
            <>
              <Loader2 strokeWidth={1.5} className="w-3.5 h-3.5 animate-spin" />
              <span>Sending Outbound Email...</span>
            </>
          ) : (
            <>
              <Send strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>Send Live Email via Provider</span>
            </>
          )}
        </button>
      </div>

      {/* Dispatch Result Notification */}
      {sendResult && (
        <div
          className={`p-3 text-xs flex items-start space-x-2 ${
            sendResult.status === 'DELIVERED'
              ? 'bg-aurora-success-light text-aurora-success border-t border-aurora-success/20'
              : sendResult.status === 'SIMULATED'
              ? 'bg-aurora-primary-light text-aurora-primary border-t border-aurora-primary/20'
              : 'bg-aurora-error-light text-aurora-error border-t border-aurora-error/20'
          }`}
        >
          {sendResult.status === 'FAILED' ? (
            <AlertCircle strokeWidth={1.5} className="w-4 h-4 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 strokeWidth={1.5} className="w-4 h-4 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-bold block">
              {sendResult.status === 'DELIVERED'
                ? 'Outbound Email Delivered [LIVE]'
                : sendResult.status === 'SIMULATED'
                ? 'Outbound Email Dispatched [SIMULATION]'
                : 'Delivery Failed'}
            </span>
            <span>{sendResult.details}</span>
          </div>
        </div>
      )}
    </div>
  );
};

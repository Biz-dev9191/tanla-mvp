import React, { useState, useEffect } from 'react';
import { Settings, Key, Mail, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKeys: (keys: { resendKey: string; geminiKey: string; openaiKey: string; senderEmail: string }) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSaveKeys }) => {
  const [resendKey, setResendKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [senderEmail, setSenderEmail] = useState('Aurora Cloud <rachit9191@gmail.com>');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setResendKey(localStorage.getItem('aurora_resend_key') || '');
      setGeminiKey(localStorage.getItem('aurora_gemini_key') || '');
      setOpenaiKey(localStorage.getItem('aurora_openai_key') || '');
      setSenderEmail(localStorage.getItem('aurora_sender_email') || 'Aurora Cloud <rachit9191@gmail.com>');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aurora_resend_key', resendKey.trim());
      localStorage.setItem('aurora_gemini_key', geminiKey.trim());
      localStorage.setItem('aurora_openai_key', openaiKey.trim());
      localStorage.setItem('aurora_sender_email', senderEmail.trim());
    }
    onSaveKeys({ resendKey, geminiKey, openaiKey, senderEmail });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-aurora-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-aurora-neutral-0 rounded-lg max-w-lg w-full border border-aurora-neutral-300 shadow-aurora-lg p-5 flex flex-col space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-aurora-neutral-200">
          <div className="flex items-center space-x-2">
            <Settings strokeWidth={1.5} className="w-5 h-5 text-aurora-primary" />
            <h3 className="font-bold text-sm text-aurora-neutral-900">Live API Provider Configuration</h3>
          </div>
          <button onClick={onClose} className="text-aurora-neutral-500 hover:text-aurora-neutral-900 p-1">
            <X strokeWidth={1.5} className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Resend Email API Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-aurora-neutral-900 flex items-center space-x-1">
                <Mail strokeWidth={1.5} className="w-3.5 h-3.5 text-aurora-primary" />
                <span>Resend API Key (for Live Outbound Email Delivery)</span>
              </label>
              <a
                href="https://resend.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-aurora-primary font-semibold hover:underline"
              >
                Get Free Key (resend.com) →
              </a>
            </div>
            <input
              type="password"
              value={resendKey}
              onChange={(e) => setResendKey(e.target.value)}
              placeholder="re_xxxxxxxxxxxxxxxxxxxxx"
              className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 font-mono text-[11px] focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
            />
            <span className="text-[10px] text-aurora-neutral-500 mt-0.5 block">
              Required for live email delivery to real inboxes like rachit9191@gmail.com.
            </span>
          </div>

          {/* Sender Address */}
          <div>
            <label className="font-semibold text-aurora-neutral-700 block mb-1">
              Sender Email Address ("From:")
            </label>
            <input
              type="text"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="Aurora Cloud <rachit9191@gmail.com>"
              className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 font-mono text-[11px] focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
            />
            <span className="text-[10px] text-aurora-neutral-500 mt-0.5 block">
              Default Resend sandbox uses <code className="bg-aurora-neutral-200 px-1 rounded">onboarding@resend.dev</code>.
            </span>
          </div>

          {/* Gemini API Key */}
          <div className="pt-2 border-t border-aurora-neutral-200">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-aurora-neutral-900 flex items-center space-x-1">
                <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5 text-aurora-primary" />
                <span>Google Gemini API Key (Optional)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-aurora-primary font-semibold hover:underline"
              >
                Get Gemini Key →
              </a>
            </div>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxx"
              className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 font-mono text-[11px] focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
            />
          </div>
        </div>

        {savedSuccess && (
          <div className="p-2.5 bg-aurora-success-light border border-aurora-success/30 rounded text-xs text-aurora-success font-bold flex items-center space-x-1.5">
            <Check strokeWidth={1.5} className="w-4 h-4" />
            <span>Settings saved successfully. Live delivery enabled.</span>
          </div>
        )}

        <div className="pt-2 border-t border-aurora-neutral-200 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-aurora-neutral-300 rounded text-xs font-semibold text-aurora-neutral-700 hover:bg-aurora-neutral-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-aurora-primary hover:bg-aurora-primary-hover text-white rounded text-xs font-bold shadow-sm flex items-center space-x-1"
          >
            <Check strokeWidth={1.5} className="w-3.5 h-3.5" />
            <span>Save & Apply Keys</span>
          </button>
        </div>
      </div>
    </div>
  );
};

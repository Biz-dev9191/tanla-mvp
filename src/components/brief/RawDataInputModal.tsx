import React, { useState } from 'react';
import { CustomerProfile, BusinessEvent, BusinessObjective } from '@/core/types';
import { FileJson, Upload, X, Check } from 'lucide-react';

interface RawDataInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: { customer: CustomerProfile; event: BusinessEvent; objective: BusinessObjective }) => void;
}

export const RawDataInputModal: React.FC<RawDataInputModalProps> = ({ isOpen, onClose, onImport }) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApply = () => {
    try {
      setError(null);
      const parsed = JSON.parse(jsonText);
      if (!parsed.customer || !parsed.event || !parsed.objective) {
        throw new Error("JSON must contain 'customer', 'event', and 'objective' root objects.");
      }
      onImport(parsed);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid JSON format. Please verify structure.');
    }
  };

  const sampleTemplate = JSON.stringify(
    {
      customer: {
        id: "CUST-9901",
        name: "Aarav Mehta",
        age: 31,
        ageGroup: "25–34",
        segment: "High Value",
        digitalProfile: "Digital-first",
        preferredLanguage: "English",
        preferredChannel: "WhatsApp",
        consent: { transactional: true, promotional: true, voice: false },
        customerValue: "VIP",
        tenureMonths: 24,
        recentCommunicationCount24h: { transactional: 1, promotional: 0 },
        previousSupportContacts: 1,
        sentiment: "Neutral",
        phone: "+91 99887 76655",
      },
      event: {
        id: "EVT-5512",
        eventType: "payment_successful_order_failed",
        title: "Payment captured successfully, inventory hold failed",
        description: "Payment ID: PAY_11204 succeeded, order creation timed out.",
        timestamp: "Just now",
        verifiedFacts: ["Payment ID: PAY_11204", "Amount: $85.00", "Auto-refund initiated to card ending 9921"],
        resolutionStatus: "Refund Initiated",
        transactionId: "PAY_11204",
        amount: "$85.00",
      },
      objective: {
        primary: "resolve_issue",
        secondary: "Reassure customer of instant automated refund",
      },
    },
    null,
    2
  );

  return (
    <div className="fixed inset-0 z-50 bg-aurora-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-aurora-neutral-0 rounded-lg max-w-2xl w-full border border-aurora-neutral-300 shadow-aurora-lg flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-aurora-neutral-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileJson strokeWidth={1.5} className="w-5 h-5 text-aurora-primary" />
            <h3 className="font-bold text-base text-aurora-neutral-900">Import Structured JSON / CSV Payload</h3>
          </div>
          <button onClick={onClose} className="text-aurora-neutral-500 hover:text-aurora-neutral-900 p-1">
            <X strokeWidth={1.5} className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-aurora-neutral-700 font-medium">Paste JSON Payload:</span>
            <button
              onClick={() => setJsonText(sampleTemplate)}
              className="text-aurora-primary hover:underline font-semibold"
            >
              Insert Sample Template
            </button>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Paste JSON structured input here..."
            className="w-full h-64 p-3 font-mono text-xs bg-aurora-neutral-100 border border-aurora-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aurora-primary"
          />

          {error && (
            <div className="p-3 bg-aurora-error-light border border-aurora-error/20 rounded text-xs text-aurora-error font-medium">
              {error}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-aurora-neutral-200 flex justify-end space-x-3 bg-aurora-neutral-100 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-aurora-neutral-300 text-aurora-neutral-700 rounded-md text-sm font-medium hover:bg-aurora-neutral-0"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-aurora-primary text-white rounded-md text-sm font-semibold hover:bg-aurora-primary-hover flex items-center space-x-1.5"
          >
            <Check strokeWidth={1.5} className="w-4 h-4" />
            <span>Apply Payload</span>
          </button>
        </div>
      </div>
    </div>
  );
};

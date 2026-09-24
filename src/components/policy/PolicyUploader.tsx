import React, { useState } from 'react';
import { Upload, FileText, Sparkles, CheckCircle2, Network } from 'lucide-react';
import { parsePolicyDocumentText, DynamicPolicyParseResult } from '@/core/policy-generator';

interface PolicyUploaderProps {
  onGeneratePolicyTree: (result: DynamicPolicyParseResult, rawPolicyText: string) => void;
  activePolicyText?: string;
}

export const PolicyUploader: React.FC<PolicyUploaderProps> = ({ onGeneratePolicyTree, activePolicyText }) => {
  const [policyText, setPolicyText] = useState(activePolicyText || "");
  const [fileName, setFileName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const sampleFintechPolicy = `# Enterprise Customer Communication Policy v2.4

1. Transactional Payments & Failures:
- For successful payments where order provisioning fails, immediately cite payment ID and confirm automated refund within 3-5 business days.
- Prohibit asking customer to pay again immediately without verified refund status.
- Reassure customer that zero action is required on their part.

2. Privacy & Data Masking:
- Never expose full credit card numbers or banking passwords. Always mask to last 4 digits (e.g. **** 4012).
- Prohibit transmitting internal database keys across public channels.

3. Financial Commitments & Compensation:
- Agents must never grant goodwill compensation or discount vouchers above $0 without Human Supervisor Approval.
- Any compensation request above $0 must be escalated to human supervisor review.

4. Communication Fatigue:
- Suppress promotional messages if customer received 2 or more messages in 24 hours.
- Suppress routine maintenance notices if customer received 3 or more transactional updates today.`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPolicyText(content);
      setStatusMessage(`Loaded "${file.name}". Click "Generate Policy Tree" below to build the decision hierarchy.`);
    };
    reader.readAsText(file);
  };

  const handleGenerate = () => {
    const trimmed = policyText.trim();
    if (!trimmed) return;
    const parsed = parsePolicyDocumentText(trimmed);
    onGeneratePolicyTree(parsed, trimmed);
    setStatusMessage(`Policy tree generated with ${parsed.rules.length} governance rules. Click "Apply to Current Run" on the Policy Tree box below to update communication outputs.`);
  };

  const isGenerateDisabled = !policyText.trim();

  return (
    <div className="bg-aurora-neutral-0 rounded-lg p-5 border border-aurora-neutral-200 shadow-aurora space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-aurora-neutral-200 gap-2">
        <div className="flex items-center space-x-2">
          <Upload strokeWidth={1.5} className="w-5 h-5 text-aurora-primary" />
          <h3 className="text-sm font-bold text-aurora-neutral-900">
            Dynamic Policy Document Uploader & Tree Generator
          </h3>
        </div>
        <button
          type="button"
          onClick={() => {
            setPolicyText(sampleFintechPolicy);
            setFileName("fintech-policy-sample.md");
            setStatusMessage("Sample Enterprise Policy loaded into editor. Click 'Generate Policy Tree' below to build tree.");
          }}
          className="text-xs text-aurora-primary font-semibold hover:underline flex items-center space-x-1"
        >
          <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5" />
          <span>Insert Sample Enterprise Policy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Upload File Box */}
        <div className="border-2 border-dashed border-aurora-neutral-300 rounded-lg p-4 text-center hover:border-aurora-primary transition flex flex-col items-center justify-center bg-aurora-neutral-100">
          <FileText strokeWidth={1.5} className="w-8 h-8 text-aurora-primary mb-2" />
          <span className="text-xs font-bold text-aurora-neutral-900 block mb-1">Upload Policy Document</span>
          <span className="text-[10px] text-aurora-neutral-500 mb-3 font-mono">TXT, MD, JSON, CSV</span>
          
          <label className="px-3 py-1.5 bg-aurora-primary hover:bg-aurora-primary-hover text-white rounded text-xs font-semibold cursor-pointer shadow-sm">
            <span>Browse File</span>
            <input type="file" accept=".txt,.md,.json,.csv,.doc" onChange={handleFileUpload} className="hidden" />
          </label>
          {fileName && <span className="text-[10px] font-mono text-aurora-primary mt-2 font-bold">{fileName}</span>}
        </div>

        {/* Text Paste Box */}
        <div className="md:col-span-2 space-y-2">
          <textarea
            rows={4}
            value={policyText}
            onChange={(e) => setPolicyText(e.target.value)}
            placeholder="Or paste company policy guidelines, restrictions, required disclosures, and escalation rules here..."
            className="w-full p-3 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded-md text-xs text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary font-sans leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-aurora-neutral-500">
              The AI parses categories, permitted actions, prohibited claims, and human approval triggers.
            </span>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerateDisabled}
              className={`px-4 py-2 rounded text-xs font-bold shadow-sm transition flex items-center justify-center space-x-1.5 ${
                isGenerateDisabled
                  ? 'bg-aurora-neutral-300 text-aurora-neutral-500 cursor-not-allowed opacity-60'
                  : 'bg-aurora-primary hover:bg-aurora-primary-hover text-white cursor-pointer'
              }`}
            >
              <Network strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>Generate Policy Tree</span>
            </button>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-aurora-success-light border border-aurora-success/20 rounded-md text-xs text-aurora-success flex items-center space-x-2 font-semibold">
          <CheckCircle2 strokeWidth={1.5} className="w-4 h-4 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
};


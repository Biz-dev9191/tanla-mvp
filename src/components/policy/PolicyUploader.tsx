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

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [structuredDoc, setStructuredDoc] = useState<any | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPolicyText(content);
      setErrorMessage(null);
      setStatusMessage(`Loaded "${file.name}". Click "Generate Policy Tree" below to validate and build the structured policy tree.`);
    };
    reader.readAsText(file);
  };

  const handleGenerate = () => {
    const trimmed = policyText.trim();
    if (!trimmed) return;

    setErrorMessage(null);
    const parsed = parsePolicyDocumentText(trimmed);

    if (!parsed.isValid) {
      setErrorMessage(parsed.error || 'The provided text could not be parsed as an enterprise policy document. Random text, short phrases, or text without governance directives are rejected by policy railguards.');
      setStatusMessage(null);
      setStructuredDoc(null);
      onGeneratePolicyTree(parsed, trimmed);
      return;
    }

    setStructuredDoc(parsed.structuredDocument);
    onGeneratePolicyTree(parsed, trimmed);
    setStatusMessage(`Policy document validated: ${parsed.structuredDocument?.totalClauses} clauses structured across ${parsed.structuredDocument?.sections.length} sections. Policy tree constructed.`);
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
            setErrorMessage(null);
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
            onChange={(e) => {
              setPolicyText(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="Or paste company policy guidelines, restrictions, required disclosures, and escalation rules here..."
            className="w-full p-3 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded-md text-xs text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary font-sans leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-aurora-neutral-500">
              Converts policy text into a Structured Document model first, then constructs the Policy Tree hierarchy.
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

      {errorMessage && (
        <div className="p-3 bg-aurora-error-light border border-aurora-error/30 rounded-md text-xs text-aurora-error font-semibold space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-aurora-error/20 px-1.5 py-0.5 rounded">Validation Error</span>
            <span>{errorMessage}</span>
          </div>
          <p className="text-[11px] text-aurora-error/80 font-normal pl-2">
            Enterprise Railguards prevent generating a policy tree from random strings or non-policy text. Please ensure your document specifies actionable directives (e.g. must, prohibit, require, refund, privacy).
          </p>
        </div>
      )}

      {statusMessage && (
        <div className="p-3 bg-aurora-success-light border border-aurora-success/20 rounded-md text-xs text-aurora-success flex items-center space-x-2 font-semibold">
          <CheckCircle2 strokeWidth={1.5} className="w-4 h-4 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Structured Document Specification Viewer */}
      {structuredDoc && (
        <div className="mt-4 pt-4 border-t border-aurora-neutral-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <FileText strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
              <span className="text-xs font-bold text-aurora-neutral-900">
                Structured Document Model ({structuredDoc.title} · {structuredDoc.version})
              </span>
            </div>
            <span className="text-[11px] text-aurora-neutral-500 font-mono">
              {structuredDoc.totalClauses} Clauses · {structuredDoc.sections.length} Sections · {structuredDoc.escalationClauseCount} Escalation Gates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
            {structuredDoc.sections.map((section: any) => (
              <div key={section.sectionId} className="p-3 bg-aurora-neutral-100 rounded-lg border border-aurora-neutral-200 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-aurora-neutral-900 text-[11px]">{section.title}</span>
                  <span className="text-[10px] font-mono text-aurora-neutral-500 bg-white px-1.5 py-0.5 rounded border border-aurora-neutral-200">
                    {section.clauses.length} clauses
                  </span>
                </div>
                <div className="space-y-1.5 mt-2">
                  {section.clauses.map((clause: any) => (
                    <div key={clause.clauseId} className="p-2 bg-white rounded border border-aurora-neutral-200 text-[11px]">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-aurora-neutral-800">{clause.title}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          clause.directive === 'PROHIBITIVE'
                            ? 'bg-rose-100 text-rose-700'
                            : clause.directive === 'MANDATORY'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {clause.directive}
                        </span>
                      </div>
                      <p className="text-aurora-neutral-600 line-clamp-2">{clause.statement}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


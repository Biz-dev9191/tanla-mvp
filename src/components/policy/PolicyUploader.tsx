import React, { useState, useEffect } from 'react';
import { Upload, FileText, Sparkles, CheckCircle2, Network, Trash2 } from 'lucide-react';
import { parsePolicyDocumentText, DynamicPolicyParseResult, SAMPLE_ENTERPRISE_POLICY } from '@/core/policy-generator';

interface PolicyUploaderProps {
  onGeneratePolicyTree: (result: DynamicPolicyParseResult, rawPolicyText: string) => void;
  activePolicyText?: string;
}

export const PolicyUploader: React.FC<PolicyUploaderProps> = ({ onGeneratePolicyTree, activePolicyText }) => {
  const [policyText, setPolicyText] = useState(activePolicyText || "");
  const [fileName, setFileName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [structuredDoc, setStructuredDoc] = useState<any | null>(null);

  useEffect(() => {
    if (activePolicyText !== undefined) {
      setPolicyText(activePolicyText || "");
    }
  }, [activePolicyText]);

  const handleClear = () => {
    setPolicyText('');
    setFileName(null);
    setStatusMessage(null);
    setErrorMessage(null);
    setStructuredDoc(null);
    onGeneratePolicyTree({
      isValid: false,
      tree: null,
      rules: [],
      structuredDocument: null,
      summary: 'Policy document cleared.',
    }, '');
  };

  const sampleFintechPolicy = SAMPLE_ENTERPRISE_POLICY;

  const examplePolicyPlaceholder = `e.g. Expected Policy Document Structure:

# Customer Communication & Refund Policy
**Document ID:** POL-2026-01  |  **Version:** 2.1  |  **Status:** Active

# 1. Transactional & Order Guidelines
- For failed orders with captured payments, immediately initiate auto-refund and cite payment ID.
- Reassure customer that zero action is required on their part.
- Prohibit asking customer to re-pay without verified refund status.

# 2. Privacy & Data Protection
- Never expose full credit card numbers or passwords in customer copy.
- Always mask payment cards to the last 4 digits (e.g. **** 4012).

# 3. Financial Commitments & Escalation
- All goodwill credit vouchers or compensation exceeding $25.00 require human supervisor approval.
- Escalate to supervisor review whenever a billing dispute or legal threat is detected.

# 4. Attention Fatigue & Frequency Limits
- Maximum 3 refund-related transactional communications within 24 hours.
- Suppress promotional campaigns if customer received 2 or more messages today.`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = '.' + (file.name.split('.').pop() || '').toLowerCase();
    if (!['.txt', '.md', '.md5'].includes(fileExt)) {
      setErrorMessage(`Invalid file format "${file.name}". Only text (.txt) and markdown (.md, .md5) files are supported.`);
      setStatusMessage(null);
      e.target.value = '';
      return;
    }

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
    <div className="bg-aurora-neutral-0 rounded-xl p-6 border border-aurora-neutral-200 shadow-aurora space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-aurora-neutral-200 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-aurora-primary-light flex items-center justify-center text-aurora-primary">
            <Upload strokeWidth={1.75} className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-aurora-neutral-900">
              Dynamic Policy Document Ingestion & Tree Generator
            </h3>
            <p className="text-xs text-aurora-neutral-500">
              Upload compliance guidelines or write markdown directives to construct a real-time governance tree.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {(policyText.trim().length > 0 || fileName) && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 bg-aurora-neutral-100 hover:bg-rose-50 text-aurora-neutral-700 hover:text-rose-700 border border-aurora-neutral-300 hover:border-rose-300 rounded-md text-xs font-semibold shadow-2xs transition flex items-center space-x-1.5"
            >
              <Trash2 strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>Clear Editor</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setPolicyText(sampleFintechPolicy);
              setFileName("fintech-policy-sample.md");
              setErrorMessage(null);
              setStatusMessage("Sample Enterprise Policy loaded into editor. Click 'Generate Policy Tree' to build tree.");
            }}
            className="px-3.5 py-1.5 bg-aurora-primary-light hover:bg-aurora-primary hover:text-white text-aurora-primary border border-aurora-primary/30 rounded-md text-xs font-bold shadow-2xs transition flex items-center space-x-1.5"
          >
            <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5" />
            <span>Insert Sample Enterprise Policy</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Column Ingestion Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: File Ingestion Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="flex items-center justify-between h-6">
            <span className="text-xs font-bold uppercase tracking-wider text-aurora-neutral-700">
              Document Upload
            </span>
            <span className="text-[10px] font-mono text-aurora-neutral-500 bg-aurora-neutral-100 px-2 py-0.5 rounded border border-aurora-neutral-200">
              .txt, .md, .md5
            </span>
          </div>

          {/* Drag & Drop File Box - Sized to match textarea */}
          <div className="border-2 border-dashed border-aurora-neutral-300 hover:border-aurora-primary rounded-xl transition-all bg-aurora-neutral-50/70 hover:bg-aurora-neutral-50 h-[260px] flex flex-col items-center justify-center overflow-hidden">
            {fileName ? (
              <div className="flex flex-col items-center justify-center h-full w-full p-4 space-y-3 animate-fadeIn">
                <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                  <FileText strokeWidth={1.75} className="w-5 h-5" />
                </div>
                <div className="text-center px-2 w-full">
                  <span className="text-xs font-bold text-aurora-neutral-900 block font-mono truncate max-w-[220px] mx-auto">
                    {fileName}
                  </span>
                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center justify-center space-x-1 mt-1">
                    <CheckCircle2 strokeWidth={1.75} className="w-3.5 h-3.5 text-emerald-500" />
                    <span>File Loaded & Synced</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <label className="px-3 py-1.5 bg-white hover:bg-aurora-neutral-100 text-aurora-neutral-700 rounded-lg text-xs font-semibold cursor-pointer transition inline-flex items-center space-x-1.5 border border-aurora-neutral-300 shadow-2xs">
                    <Upload strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>Change File</span>
                    <input type="file" accept=".txt,.md,.md5" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFileName(null);
                      if (policyText === sampleFintechPolicy) setPolicyText('');
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5 border border-rose-200 shadow-2xs"
                  >
                    <Trash2 strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full p-5 text-center">
                <div className="w-10 h-10 rounded-full bg-aurora-neutral-200/80 text-aurora-primary flex items-center justify-center mb-2.5">
                  <FileText strokeWidth={1.75} className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-aurora-neutral-900 block mb-0.5">
                  Upload Policy File
                </span>
                <p className="text-[11px] text-aurora-neutral-500 mb-3.5 max-w-[200px] leading-tight">
                  Select or drop your policy text or markdown file
                </p>
                <label className="px-4 py-2 bg-aurora-primary hover:bg-aurora-primary-hover text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs transition-transform transform active:scale-95 inline-flex items-center space-x-1.5">
                  <Upload strokeWidth={1.5} className="w-3.5 h-3.5" />
                  <span>Browse File</span>
                  <input type="file" accept=".txt,.md,.md5" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Markdown Policy Editor (8 Cols) */}
        <div className="lg:col-span-8 space-y-2.5">
          <div className="flex items-center justify-between h-6">
            <span className="text-xs font-bold uppercase tracking-wider text-aurora-neutral-700">
              Policy Directives & Direct Rules
            </span>
          </div>

          {/* Textarea Editor - Exact matching height */}
          <div className="h-[260px] rounded-xl overflow-hidden border border-aurora-neutral-300 focus-within:border-aurora-primary focus-within:ring-1 focus-within:ring-aurora-primary transition shadow-2xs">
            <textarea
              value={policyText}
              onChange={(e) => {
                setPolicyText(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder={examplePolicyPlaceholder}
              className="w-full h-full p-3.5 bg-aurora-neutral-50/60 focus:bg-white text-xs text-aurora-neutral-900 font-mono leading-relaxed resize-none focus:outline-none"
            />
          </div>

          {/* Editor Action Footer */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerateDisabled}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold shadow-sm transition flex items-center justify-center space-x-2 flex-shrink-0 ${
                isGenerateDisabled
                  ? 'bg-aurora-neutral-200 text-aurora-neutral-400 border border-aurora-neutral-300 cursor-not-allowed opacity-60'
                  : 'bg-aurora-primary hover:bg-aurora-primary-hover text-white cursor-pointer shadow-aurora-md'
              }`}
            >
              <Network strokeWidth={1.5} className="w-4 h-4" />
              <span>Generate Policy Tree</span>
            </button>
          </div>
        </div>
      </div>

      {/* Validation Feedback & Status Banners */}
      {errorMessage && (
        <div className="p-3.5 bg-aurora-error-light border border-aurora-error/30 rounded-lg text-xs text-aurora-error font-semibold space-y-1 animate-fadeIn">
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
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center space-x-2 font-semibold shadow-2xs animate-fadeIn">
          <CheckCircle2 strokeWidth={1.5} className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Structured Document Specification Viewer */}
      {structuredDoc && (
        <div className="mt-4 pt-4 border-t border-aurora-neutral-200 animate-fadeIn">
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


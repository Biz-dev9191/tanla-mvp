import { PolicyTreeNode } from './policy-tree-data';
import { PolicyRule } from './types';

export interface StructuredPolicyClause {
  clauseId: string;
  sectionId: string;
  sectionTitle: string;
  title: string;
  statement: string;
  directive: 'MANDATORY' | 'PROHIBITIVE' | 'PERMISSIVE';
  category: 'transactional' | 'privacy' | 'frequency' | 'financial' | 'channel' | 'governance';
  allowedActions: string[];
  prohibitedActions: string[];
  escalationRequired: boolean;
  thresholdAmount?: number;
}

export interface StructuredPolicySection {
  sectionId: string;
  sectionNumber: string;
  title: string;
  category: 'transactional' | 'privacy' | 'frequency' | 'financial' | 'channel' | 'governance';
  description: string;
  clauses: StructuredPolicyClause[];
}

export interface StructuredPolicyDocument {
  title: string;
  documentId?: string;
  version: string;
  effectiveDate?: string;
  effectiveScope: string;
  rawWordCount: number;
  sections: StructuredPolicySection[];
  totalClauses: number;
  escalationClauseCount: number;
  parsedAt: string;
}

export interface DynamicPolicyParseResult {
  isValid: boolean;
  error?: string;
  structuredDocument: StructuredPolicyDocument | null;
  tree: PolicyTreeNode | null;
  rules: PolicyRule[];
  summary: string;
}

// Enterprise Governance Lexicon for strict policy validation
const POLICY_DIRECTIVE_KEYWORDS = [
  'must', 'shall', 'prohibit', 'prohibited', 'require', 'required', 'requires',
  'never', 'allow', 'allowed', 'permit', 'permitted', 'mandate', 'mandatory',
  'clause', 'section', 'policy', 'guideline', 'standard', 'compliance', 'rule',
  'escalat', 'supervisor', 'approval', 'consent', 'opt-in', 'opt-out', 'dnd',
  'privacy', 'pii', 'gdpr', 'mask', 'masking', 'password', 'card', 'credential',
  'refund', 'compensation', 'credit', 'voucher', 'waiver', 'liability', 'dispute',
  'fatigue', 'frequency', 'velocity', 'cap', 'suppress', 'suppression',
  'transaction', 'order', 'payment', 'telemetry', 'guardrail', 'decision tree'
];

/**
 * Railguard Validator: Verifies whether the input text is a genuine enterprise policy document
 * or random/unstructured noise.
 */
export function validatePolicyDocumentText(text: string): { isValid: boolean; reason?: string } {
  const trimmed = text.trim();
  
  // 1. Length & Word Count bounds
  if (trimmed.length < 35) {
    return {
      isValid: false,
      reason: 'Policy document is too short (Minimum 35 characters required).',
    };
  }

  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 7) {
    return {
      isValid: false,
      reason: 'Insufficient word count (Minimum 7 words required).',
    };
  }

  // 2. Gibberish & Repetition Detection (Keyboard spam or unspaced text)
  const avgWordLen = trimmed.length / words.length;
  if (avgWordLen > 22) {
    return {
      isValid: false,
      reason: 'Text contains uncharacteristically long continuous strings resembling gibberish or keyboard spam.',
    };
  }

  const letterCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
  if (letterCount / trimmed.length < 0.45) {
    return {
      isValid: false,
      reason: 'Text does not contain enough natural language alphabetic content.',
    };
  }

  // 3. Governance Semantic Density Check
  const lower = trimmed.toLowerCase();
  const matchedKeywords = POLICY_DIRECTIVE_KEYWORDS.filter(kw => lower.includes(kw));
  
  if (matchedKeywords.length < 2) {
    return {
      isValid: false,
      reason: 'No policy governance directives, compliance terms, or operational constraints were detected in the input text.',
    };
  }

  return { isValid: true };
}

/**
 * Filter out ASCII tree diagrams, code block lines, and pure diagram noise
 */
function isDiagramOrNoiseLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('```')) return true;
  // ASCII tree drawing characters
  if (/^[│├└─│\s\+\-\|\>]+$/.test(trimmed)) return true;
  if (trimmed.includes('├──') || trimmed.includes('└──') || trimmed.includes('│')) return true;
  // Flowchart arrow lines (e.g. "↓" or "→")
  if (/^[↓→←↑\s]+$/.test(trimmed)) return true;
  if (trimmed === '↓' || trimmed === '→') return true;
  return false;
}

/**
 * Determine high-level category from section name or text
 */
function determineCategory(text: string): 'transactional' | 'privacy' | 'financial' | 'frequency' | 'channel' | 'governance' {
  const lower = text.toLowerCase();
  if (lower.includes('privacy') || lower.includes('security') || lower.includes('pii') || lower.includes('gdpr') || lower.includes('mask') || lower.includes('credential')) {
    return 'privacy';
  }
  if (lower.includes('frequency') || lower.includes('fatigue') || lower.includes('cap') || lower.includes('suppress')) {
    return 'frequency';
  }
  if (lower.includes('compensation') || lower.includes('financial') || lower.includes('credit') || lower.includes('voucher') || lower.includes('waiver') || lower.includes('liability')) {
    return 'financial';
  }
  if (lower.includes('channel') || lower.includes('sms') || lower.includes('whatsapp') || lower.includes('email') || lower.includes('tone') || lower.includes('tenor')) {
    return 'channel';
  }
  if (lower.includes('transaction') || lower.includes('refund') || lower.includes('order') || lower.includes('payment') || lower.includes('kyc')) {
    return 'transactional';
  }
  return 'governance';
}

/**
 * Parses raw enterprise policy text, validates integrity, converts into a Structured Policy Document,
 * and generates a clean, grounded Policy Tree without random words.
 */
export function parsePolicyDocumentText(policyText: string): DynamicPolicyParseResult {
  // Step 1: Railguard Validation
  const validation = validatePolicyDocumentText(policyText);
  if (!validation.isValid) {
    return {
      isValid: false,
      error: validation.reason,
      structuredDocument: null,
      tree: null,
      rules: [],
      summary: `Validation Failed: ${validation.reason}`,
    };
  }

  const rawLines = policyText.split('\n');
  const words = policyText.split(/\s+/).filter(Boolean);

  // Extract Metadata: Title, Document ID, Version, Date
  let docTitle = 'Enterprise Policy Document';
  let titleFound = false;
  let docId: string | undefined = undefined;
  let docVersion = 'v1.0';
  let effectiveDate: string | undefined = undefined;

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Title from primary # header (first top-level non-numbered header)
    if (!titleFound && trimmed.startsWith('# ') && !/^#\s*\d+[\.\)]/.test(trimmed)) {
      docTitle = trimmed.replace(/^#+\s*/, '').trim();
      titleFound = true;
      const verInTitle = docTitle.match(/v\d+(?:\.\d+)?/i);
      if (verInTitle) docVersion = verInTitle[0];
    }
    // Document ID
    const idMatch = trimmed.match(/\*\*(?:Document ID|Policy ID):\*\*\s*([A-Za-z0-9_-]+)/i);
    if (idMatch) docId = idMatch[1].trim();

    // Version
    const verMatch = trimmed.match(/\*\*(?:Version):\*\*\s*([vV]?\d+(?:\.\d+)?)/i);
    if (verMatch) docVersion = verMatch[1].trim();

    // Effective Date
    const dateMatch = trimmed.match(/\*\*(?:Effective Date):\*\*\s*([^\*\n]+)/i);
    if (dateMatch) effectiveDate = dateMatch[1].trim();
  }

  // Step 2: Parse into Structural Sections
  interface RawSection {
    sectionNumber: string;
    title: string;
    rawLines: string[];
  }

  const sections: RawSection[] = [];
  let currentSec: RawSection | null = null;

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (isDiagramOrNoiseLine(trimmed)) continue;

    // Detect Section Header: e.g. "Section 1.0: ...", "# 1. Purpose", "## 4. Core Principles", "# 7. Payment Successful + Order Failed"
    const sectionKeywordMatch = trimmed.match(/^(?:Section|Clause|Article|Policy|Part)\s*([\d\w.-]*)[:\s-]*(.*)/i);
    const headerMatch = trimmed.match(/^(?:#{1,3}\s*)?(\d+(?:\.\d+)?)\.?\s+(.+)$/);
    const isMarkdownHeader = trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ');

    if (sectionKeywordMatch && sectionKeywordMatch[2] && sectionKeywordMatch[2].trim().length > 3) {
      if (currentSec && currentSec.rawLines.length > 0) {
        sections.push(currentSec);
      }
      currentSec = {
        sectionNumber: sectionKeywordMatch[1] ? sectionKeywordMatch[1].replace(/[:\s]/g, '') : `${sections.length + 1}.0`,
        title: sectionKeywordMatch[2].replace(/[:*#]/g, '').trim(),
        rawLines: [],
      };
      continue;
    } else if (headerMatch && (isMarkdownHeader || /^\d+\.\s+[A-Z]/.test(trimmed))) {
      const secNum = headerMatch[1].trim();
      const secTitle = headerMatch[2].replace(/^#+\s*/, '').replace(/[:*]/g, '').trim();

      // Avoid false positive on simple numbered list items like "1. Eligible customers receive refunds"
      const isSubstantiveHeading = isMarkdownHeader || secTitle.length < 50;

      if (isSubstantiveHeading) {
        if (currentSec && currentSec.rawLines.length > 0) {
          sections.push(currentSec);
        }
        currentSec = {
          sectionNumber: secNum,
          title: secTitle,
          rawLines: [],
        };
        continue;
      }
    } else if (isMarkdownHeader && !headerMatch) {
      // Named header like "# Definitions" or "## Required communication"
      const cleanHeader = trimmed.replace(/^#+\s*/, '').replace(/[:*]/g, '').trim();
      if (cleanHeader.length > 2 && cleanHeader.length < 60 && !cleanHeader.toLowerCase().includes('document id')) {
        if (currentSec && currentSec.rawLines.length > 0) {
          sections.push(currentSec);
        }
        currentSec = {
          sectionNumber: `Sec-${sections.length + 1}`,
          title: cleanHeader,
          rawLines: [],
        };
        continue;
      }
    }

    if (!currentSec) {
      currentSec = {
        sectionNumber: '1.0',
        title: 'General Governance',
        rawLines: [],
      };
    }

    currentSec.rawLines.push(trimmed);
  }

  if (currentSec && currentSec.rawLines.length > 0) {
    sections.push(currentSec);
  }

  // Step 3: Extract Granular Substantive Clauses per Section
  const structuredSections: StructuredPolicySection[] = [];
  let globalClauseCount = 0;

  for (const sec of sections) {
    const secCategory = determineCategory(`${sec.title} ${sec.rawLines.join(' ')}`);
    const clauses: StructuredPolicyClause[] = [];
    const secId = `sec-${sec.sectionNumber.replace(/[^a-z0-9]/gi, '-')}`;

    let currentContext = sec.title;
    let pendingAvoidOrProhibited = false;
    let pendingListItems: string[] = [];

    const flushListItems = () => {
      if (pendingListItems.length > 0) {
        globalClauseCount++;
        const statement = pendingAvoidOrProhibited
          ? `Prohibited: The system must strictly avoid and not communicate: ${pendingListItems.join(', ')}.`
          : `${currentContext}: ${pendingListItems.join('; ')}.`;

        const isEscalation = statement.toLowerCase().includes('supervisor') || statement.toLowerCase().includes('approval') || statement.toLowerCase().includes('escalat');
        const directive: 'MANDATORY' | 'PROHIBITIVE' | 'PERMISSIVE' = pendingAvoidOrProhibited
          ? 'PROHIBITIVE'
          : isEscalation
          ? 'MANDATORY'
          : 'MANDATORY';

        clauses.push({
          clauseId: `POL-${sec.sectionNumber.replace(/[^0-9.]/g, '') || globalClauseCount}-${clauses.length + 1}`,
          sectionId: secId,
          sectionTitle: sec.title,
          title: pendingAvoidOrProhibited ? `Prohibited in ${sec.title}` : `${sec.title} Requirements`,
          statement,
          directive,
          category: secCategory,
          allowedActions: pendingAvoidOrProhibited
            ? ['Adhere strictly to verified facts without unapproved commitments']
            : [statement],
          prohibitedActions: pendingAvoidOrProhibited
            ? pendingListItems
            : ['Do not invent unverified timelines or unapproved outcomes'],
          escalationRequired: isEscalation,
        });

        pendingListItems = [];
        pendingAvoidOrProhibited = false;
      }
    };

    for (let i = 0; i < sec.rawLines.length; i++) {
      const line = sec.rawLines[i];
      const lower = line.toLowerCase();

      // Check for subheadings like "### 4.1 Accuracy" or "### Required communication" or "### Prohibited"
      if (line.startsWith('###') || line.startsWith('##') || line.startsWith('**Required') || line.startsWith('**Prohibited') || line.startsWith('### Prohibited') || line.startsWith('Avoid:')) {
        flushListItems();
        currentContext = line.replace(/^[#*:]+\s*/, '').replace(/[:*#]/g, '').trim();
        pendingAvoidOrProhibited = lower.includes('prohibit') || lower.includes('avoid') || lower.includes('never');
        continue;
      }

      if (lower.startsWith('avoid:') || lower.startsWith('prohibited:')) {
        flushListItems();
        currentContext = `${sec.title} Restrictions`;
        pendingAvoidOrProhibited = true;
        continue;
      }

      // Check for bullet list items
      const isBullet = line.startsWith('* ') || line.startsWith('- ') || /^\d+\.\s+/.test(line);

      if (isBullet) {
        const cleanItem = line.replace(/^[-*\d.)]+\s*/, '').trim();

        // If the item is just a few words (like "* refund status" or "* clear"), accumulate it into the context
        if (cleanItem.split(/\s+/).length < 5) {
          pendingListItems.push(cleanItem);
          continue;
        }

        // If it's a substantive sentence or rule (>= 5 words)
        globalClauseCount++;
        const isEscalation = cleanItem.toLowerCase().includes('supervisor') || cleanItem.toLowerCase().includes('approval') || cleanItem.toLowerCase().includes('escalat');
        const isProhibitive = pendingAvoidOrProhibited || cleanItem.toLowerCase().startsWith('do not') || cleanItem.toLowerCase().startsWith('never') || cleanItem.toLowerCase().startsWith('prohibit');
        const isPermissive = cleanItem.toLowerCase().startsWith('permit') || cleanItem.toLowerCase().startsWith('allow') || cleanItem.toLowerCase().includes('permitted to') || cleanItem.toLowerCase().includes('allowed to') || cleanItem.toLowerCase().includes('may provide');
        const directive: 'MANDATORY' | 'PROHIBITIVE' | 'PERMISSIVE' = isProhibitive
          ? 'PROHIBITIVE'
          : isPermissive
          ? 'PERMISSIVE'
          : 'MANDATORY';

        // Extract clean title
        let clauseTitle = cleanItem.length > 45 ? cleanItem.slice(0, 42) + '...' : cleanItem;
        const colonSplit = cleanItem.split(/[:—]/);
        if (colonSplit.length > 1 && colonSplit[0].length < 35 && colonSplit[0].length > 3) {
          clauseTitle = colonSplit[0].trim();
        }

        // Parse numeric monetary amount if present
        const amountMatch = cleanItem.match(/(?:above|over|exceeding|greater than|more than|\$|₹)\s*[\$₹]?(\d+(?:\.\d{1,2})?)/i);
        const thresholdAmount = amountMatch ? parseFloat(amountMatch[1]) : undefined;

        clauses.push({
          clauseId: `POL-${sec.sectionNumber.replace(/[^0-9.]/g, '') || globalClauseCount}-${clauses.length + 1}`,
          sectionId: secId,
          sectionTitle: sec.title,
          title: clauseTitle,
          statement: cleanItem,
          directive,
          category: secCategory,
          allowedActions: isProhibitive
            ? ['Ground all communication strictly in verified factual telemetry and policy constraints']
            : [cleanItem],
          prohibitedActions: isProhibitive
            ? [cleanItem]
            : ['Do not invent unverified timelines, unauthorized compensation, or unapproved promises'],
          escalationRequired: isEscalation,
          thresholdAmount,
        });
      } else if (line.length > 30 && (lower.includes('must') || lower.includes('shall') || lower.includes('prohibit') || lower.includes('require') || lower.includes('never') || lower.includes('escalate'))) {
        // Substantive standalone paragraph statement
        globalClauseCount++;
        const isEscalation = lower.includes('supervisor') || lower.includes('approval') || lower.includes('escalat');
        const isProhibitive = lower.includes('prohibit') || lower.includes('never') || lower.includes('cannot') || lower.includes('do not');
        const directive: 'MANDATORY' | 'PROHIBITIVE' | 'PERMISSIVE' = isProhibitive ? 'PROHIBITIVE' : 'MANDATORY';

        clauses.push({
          clauseId: `POL-${sec.sectionNumber.replace(/[^0-9.]/g, '') || globalClauseCount}-${clauses.length + 1}`,
          sectionId: secId,
          sectionTitle: sec.title,
          title: line.length > 45 ? line.slice(0, 42) + '...' : line,
          statement: line,
          directive,
          category: secCategory,
          allowedActions: isProhibitive ? ['Strict compliance with documented constraint'] : [line],
          prohibitedActions: isProhibitive ? [line] : ['Do not make unauthorized commitments'],
          escalationRequired: isEscalation,
        });
      }
    }

    flushListItems();

    if (clauses.length > 0) {
      structuredSections.push({
        sectionId: secId,
        sectionNumber: sec.sectionNumber.startsWith('Sec') ? sec.sectionNumber : `Section ${sec.sectionNumber}`,
        title: sec.title,
        category: secCategory,
        description: `Operational rules and compliance constraints governing ${sec.title}`,
        clauses,
      });
    }
  }

  const allStructuredClauses = structuredSections.flatMap(s => s.clauses);

  // If no granular clauses were extracted from candidate lines, double check validity
  if (allStructuredClauses.length === 0) {
    return {
      isValid: false,
      error: 'No valid policy clauses or actionable governance rules could be parsed from the provided text.',
      structuredDocument: null,
      tree: null,
      rules: [],
      summary: 'Validation Failed: No actionable policy clauses parsed.',
    };
  }

  // Step 4: Build Structured Policy Document
  const structuredDocument: StructuredPolicyDocument = {
    title: docTitle,
    documentId: docId,
    version: docVersion,
    effectiveDate,
    effectiveScope: 'Customer-facing transactional communications and refund orchestration',
    rawWordCount: words.length,
    sections: structuredSections,
    totalClauses: allStructuredClauses.length,
    escalationClauseCount: allStructuredClauses.filter(c => c.escalationRequired).length,
    parsedAt: new Date().toISOString(),
  };

  // Step 5: Build Flat Policy Rules for Orchestrator Ingestion
  const flatRules: PolicyRule[] = allStructuredClauses.map(clause => ({
    id: clause.clauseId,
    nodePath: `${docTitle} > ${clause.sectionTitle} > ${clause.title}`,
    category: (clause.category === 'governance' ? 'transactional' : clause.category) as any,
    title: clause.title,
    rule: clause.statement,
    condition: clause.thresholdAmount ? `amount_check_threshold_${clause.thresholdAmount}` : 'parsed_document_clause',
    allowedActions: clause.allowedActions,
    prohibitedActions: clause.prohibitedActions,
    escalationRequired: clause.escalationRequired,
    priority: clause.escalationRequired ? 'critical' : 'high',
  }));

  // Step 6: Construct Clean Hierarchical Policy Tree from the Structured Document
  const treeChildren: PolicyTreeNode[] = structuredSections.map(section => ({
    id: section.sectionId,
    name: `${section.sectionNumber}: ${section.title}`,
    description: section.description,
    category: 'category',
    children: section.clauses.map(c => ({
      id: c.clauseId,
      name: c.title,
      ruleCode: c.clauseId,
      description: c.statement,
      category: 'leaf',
      allowedSummary: c.allowedActions.join('; '),
      prohibitedSummary: c.prohibitedActions.join('; '),
    })),
  }));

  const tree: PolicyTreeNode = {
    id: 'custom-root',
    name: `${structuredDocument.title} (${structuredDocument.version})`,
    description: `${structuredDocument.documentId ? `[${structuredDocument.documentId}] ` : ''}Policy Tree generated from structured document (${structuredDocument.totalClauses} active clauses across ${structuredSections.length} sections)`,
    category: 'root',
    children: treeChildren,
  };

  return {
    isValid: true,
    structuredDocument,
    tree,
    rules: flatRules,
    summary: `Structured document parsed: ${structuredDocument.totalClauses} clauses across ${structuredSections.length} sections (${structuredDocument.escalationClauseCount} escalation gates). Policy tree constructed successfully.`,
  };
}

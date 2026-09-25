import { PolicyTreeNode } from './policy-tree-data';
import { PolicyRule } from './types';

export interface StructuredPolicyClause {
  clauseId: string;
  sectionId: string;
  sectionTitle: string;
  title: string;
  statement: string;
  directive: 'MANDATORY' | 'PROHIBITIVE' | 'PERMISSIVE';
  category: 'transactional' | 'privacy' | 'frequency' | 'financial' | 'channel';
  allowedActions: string[];
  prohibitedActions: string[];
  escalationRequired: boolean;
  thresholdAmount?: number;
}

export interface StructuredPolicySection {
  sectionId: string;
  sectionNumber: string;
  title: string;
  category: 'transactional' | 'privacy' | 'frequency' | 'financial' | 'channel';
  description: string;
  clauses: StructuredPolicyClause[];
}

export interface StructuredPolicyDocument {
  title: string;
  version: string;
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
  'transaction', 'order', 'payment', 'telemetry', 'channel', 'whatsapp', 'sms', 'email'
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
 * Parses raw enterprise policy text, validates integrity, converts into a Structured Policy Document,
 * and generates a fully-grounded Policy Tree.
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

  const lines = policyText.split('\n').map(l => l.trim()).filter(Boolean);
  const words = policyText.split(/\s+/).filter(Boolean);

  // Extract Document Title & Version
  let docTitle = 'Enterprise Policy Document';
  let docVersion = 'v1.0';
  const titleLine = lines.find(l => l.startsWith('#') || l.toLowerCase().includes('policy') || l.toLowerCase().includes('directive'));
  if (titleLine) {
    const cleanTitle = titleLine.replace(/^#+\s*/, '').trim();
    if (cleanTitle.length > 3 && cleanTitle.length < 80) {
      docTitle = cleanTitle;
      const verMatch = cleanTitle.match(/v\d+(?:\.\d+)?/i);
      if (verMatch) docVersion = verMatch[0];
    }
  }

  // Categories registry
  const categoryDefinitions: {
    [key in 'transactional' | 'privacy' | 'financial' | 'frequency' | 'channel']: {
      id: string;
      title: string;
      description: string;
      clauses: StructuredPolicyClause[];
    };
  } = {
    transactional: {
      id: 'sec-transactional',
      title: 'Transactional Communications & Service Protocols',
      description: 'Order fulfillment, payment handling, inventory timeouts, and transactional notifications',
      clauses: [],
    },
    privacy: {
      id: 'sec-privacy',
      title: 'Privacy, Data Protection & Credential Masking',
      description: 'PII safeguarding, payment card redaction, credential masking, and GDPR/compliance rules',
      clauses: [],
    },
    financial: {
      id: 'sec-financial',
      title: 'Financial Governance, Compensation & Approval Gates',
      description: 'Discretionary credits, goodwill compensation, monetary thresholds, and supervisor authorizations',
      clauses: [],
    },
    frequency: {
      id: 'sec-frequency',
      title: 'Fatigue Management, Velocity & Suppression Limits',
      description: 'Customer attention frequency caps, rolling 24-hour limits, and notification suppression triggers',
      clauses: [],
    },
    channel: {
      id: 'sec-channel',
      title: 'Channel Guidelines & Formatting Bounds',
      description: 'SMS character density, WhatsApp structure, Email formal layout, and Quiet Hours compliance',
      clauses: [],
    },
  };

  let currentCategoryKey: 'transactional' | 'privacy' | 'financial' | 'frequency' | 'channel' = 'transactional';
  let currentSectionTitle = 'General Governance';
  let currentSectionId = 'sec-1';
  let clauseIndex = 0;

  lines.forEach((line) => {
    const lower = line.toLowerCase();

    // Check for explicit Section Header (e.g., "1. Transactional Payments" or "Section 2.0: Privacy")
    const sectionMatch = line.match(/^(?:#+\s*|\b(?:Section|Clause|Article|Policy|Part)\s*[\d\w.-]*[:\s-]*|\d+[\.\)]\s+)(.*)/i);
    const isHeaderLine = line.startsWith('#') || /^\d+[\.\)]\s+[A-Za-z]/.test(line) || /^section\b/i.test(line);

    if (isHeaderLine && sectionMatch && sectionMatch[1]) {
      const detectedHeader = sectionMatch[1].replace(/[:*#]/g, '').trim();
      if (detectedHeader.length > 3) {
        currentSectionTitle = detectedHeader;
        currentSectionId = `sec-${detectedHeader.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      }
    }

    // Determine target category
    if (lower.includes('privacy') || lower.includes('security') || lower.includes('pii') || lower.includes('gdpr') || lower.includes('mask') || lower.includes('password') || lower.includes('credential')) {
      currentCategoryKey = 'privacy';
    } else if (lower.includes('frequency') || lower.includes('fatigue') || lower.includes('limit') || lower.includes('cap') || lower.includes('suppress') || lower.includes('velocity')) {
      currentCategoryKey = 'frequency';
    } else if (lower.includes('compensation') || lower.includes('discount') || lower.includes('refund') || lower.includes('credit') || lower.includes('voucher') || lower.includes('waiver') || lower.includes('liability')) {
      currentCategoryKey = 'financial';
    } else if (lower.includes('sms') || lower.includes('whatsapp') || lower.includes('character') || lower.includes('quiet hour') || lower.includes('format') || lower.includes('channel')) {
      currentCategoryKey = 'channel';
    } else if (lower.includes('transaction') || lower.includes('order') || lower.includes('payment') || lower.includes('service') || lower.includes('application') || lower.includes('kyc')) {
      currentCategoryKey = 'transactional';
    }

    // Identify policy clauses: Bullet points, numbered statements, or lines with modal directives
    const isClauseLine = line.startsWith('-') || line.startsWith('*') || /^\d+\.\d+/.test(line) || /^\d+[\.\)]\s+[^A-Z]/.test(line) ||
      (lower.includes('must') || lower.includes('prohibit') || lower.includes('require') || lower.includes('shall') || lower.includes('never') || lower.includes('allow'));

    if (isClauseLine) {
      const cleanStatement = line.replace(/^[-*\d.)]+\s*/, '').trim();
      if (cleanStatement.length < 8) return;

      clauseIndex++;
      const clauseId = `POL-DOC-${clauseIndex}`;

      // Escalation checks
      const isEscalation = lower.includes('supervisor') || lower.includes('approval') || lower.includes('escalat') ||
        lower.includes('compensation') || lower.includes('goodwill') || lower.includes('credit');

      // Directive classification
      const isProhibitive = lower.includes('prohibit') || lower.includes('never') || lower.includes('do not') || lower.includes('forbidden') || lower.includes('cannot');
      const isMandatory = isEscalation || lower.includes('must') || lower.includes('shall') || lower.includes('require') || lower.includes('strictly');
      const directive: 'MANDATORY' | 'PROHIBITIVE' | 'PERMISSIVE' = isProhibitive ? 'PROHIBITIVE' : isMandatory ? 'MANDATORY' : 'PERMISSIVE';

      // Parse numerical amount threshold if specified
      const amountMatch = cleanStatement.match(/(?:above|over|exceeding|greater than|more than|\$)\s*\$?(\d+(?:\.\d{1,2})?)/i);
      const thresholdAmount = amountMatch ? parseFloat(amountMatch[1]) : undefined;

      // Extract concise clause title
      let clauseTitle = cleanStatement.length > 50 ? cleanStatement.slice(0, 48) + '...' : cleanStatement;
      const colonSplit = cleanStatement.split(':');
      if (colonSplit.length > 1 && colonSplit[0].length < 40) {
        clauseTitle = colonSplit[0].trim();
      }

      const clause: StructuredPolicyClause = {
        clauseId,
        sectionId: currentSectionId,
        sectionTitle: currentSectionTitle,
        title: clauseTitle,
        statement: cleanStatement,
        directive,
        category: currentCategoryKey,
        allowedActions: isProhibitive
          ? ['Ground all communication strictly in verified factual telemetry and policy constraints']
          : [cleanStatement],
        prohibitedActions: isProhibitive
          ? [cleanStatement]
          : ['Do not invent unverified settlement dates or unauthorized compensation promises'],
        escalationRequired: isEscalation,
        thresholdAmount,
      };

      categoryDefinitions[currentCategoryKey].clauses.push(clause);
    }
  });

  // Collect all structured clauses across active categories
  const activeSections: StructuredPolicySection[] = Object.entries(categoryDefinitions)
    .filter(([_, cat]) => cat.clauses.length > 0)
    .map(([catKey, cat], idx) => ({
      sectionId: cat.id,
      sectionNumber: `Section ${idx + 1}.0`,
      title: cat.title,
      category: catKey as any,
      description: cat.description,
      clauses: cat.clauses,
    }));

  const allStructuredClauses = activeSections.flatMap(s => s.clauses);

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

  // Step 2: Build Structured Policy Document
  const structuredDocument: StructuredPolicyDocument = {
    title: docTitle,
    version: docVersion,
    effectiveScope: 'Enterprise Outbound Communication Channels',
    rawWordCount: words.length,
    sections: activeSections,
    totalClauses: allStructuredClauses.length,
    escalationClauseCount: allStructuredClauses.filter(c => c.escalationRequired).length,
    parsedAt: new Date().toISOString(),
  };

  // Step 3: Build Flat Policy Rules for Orchestrator Ingestion
  const flatRules: PolicyRule[] = allStructuredClauses.map(clause => ({
    id: clause.clauseId,
    nodePath: `Custom Governance > ${clause.sectionTitle} > ${clause.title}`,
    category: clause.category as any,
    title: clause.title,
    rule: clause.statement,
    condition: clause.thresholdAmount ? `amount_check_threshold_${clause.thresholdAmount}` : 'parsed_document_clause',
    allowedActions: clause.allowedActions,
    prohibitedActions: clause.prohibitedActions,
    escalationRequired: clause.escalationRequired,
    priority: clause.escalationRequired ? 'critical' : 'high',
  }));

  // Step 4: Construct Deterministic Policy Tree from the Structured Document
  const treeChildren: PolicyTreeNode[] = activeSections.map(section => ({
    id: section.sectionId,
    name: section.title,
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
    description: `Grounding tree created from structured policy document (${structuredDocument.totalClauses} active clauses across ${activeSections.length} sections)`,
    category: 'root',
    children: treeChildren,
  };

  return {
    isValid: true,
    structuredDocument,
    tree,
    rules: flatRules,
    summary: `Structured document parsed: ${structuredDocument.totalClauses} clauses across ${activeSections.length} sections (${structuredDocument.escalationClauseCount} escalation gates). Policy tree constructed successfully.`,
  };
}

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
  const baseGuidance = 'Please share the sample policy document and share it in the requested format and details.';

  // 1. Length & Word Count bounds
  if (trimmed.length < 35) {
    return {
      isValid: false,
      reason: `${baseGuidance} The provided text is too short (Minimum 35 characters required).`,
    };
  }

  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 7) {
    return {
      isValid: false,
      reason: `${baseGuidance} Insufficient word count (Minimum 7 words required).`,
    };
  }

  // 2. Gibberish & Repetition Detection (Keyboard spam or unspaced text)
  const avgWordLen = trimmed.length / words.length;
  if (avgWordLen > 22) {
    return {
      isValid: false,
      reason: `${baseGuidance} Text contains uncharacteristically long continuous strings resembling gibberish or keyboard spam.`,
    };
  }

  const letterCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
  if (letterCount / trimmed.length < 0.45) {
    return {
      isValid: false,
      reason: `${baseGuidance} Text does not contain enough natural language alphabetic content.`,
    };
  }

  // 3. Telemetry / Customer Ticket Details Detection
  const hasCustomerTicketFields = /(customer\s*(name|id|details)?|account\s*(number|id)?|order\s*id|phone\s*number|ticket\s*id|tracking\s*number)\s*[:=-]/i.test(trimmed);
  const hasPolicyStructure = /(^|\n)\s*(#{1,4}\s+|section\s*[\d\w.-]*[:\s]|clause\s*[\d\w.-]*[:\s]|article\s*[\d\w.-]*[:\s]|\d+\.\s+[A-Z])/i.test(trimmed);
  
  if (hasCustomerTicketFields && !hasPolicyStructure) {
    return {
      isValid: false,
      reason: `${baseGuidance} The provided text appears to be customer or ticket details rather than an enterprise policy document.`,
    };
  }

  // 4. Governance Semantic Density Check
  const lower = trimmed.toLowerCase();
  const matchedKeywords = POLICY_DIRECTIVE_KEYWORDS.filter(kw => lower.includes(kw));

  if (matchedKeywords.length < 2) {
    return {
      isValid: false,
      reason: `${baseGuidance} No actionable policy governance directives, compliance terms, or operational constraints were detected in the input text.`,
    };
  }

  // 5. Structural Format Verification
  const hasDirectivesOrBullets = /(^|\n)\s*([*-]|\d+\.)\s+/m.test(trimmed);
  if (!hasPolicyStructure && !hasDirectivesOrBullets) {
    return {
      isValid: false,
      reason: `${baseGuidance} The document lacks structured section headings (# Section) or bulleted policy directives (- Directive).`,
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
 * Accurately extracts a monetary threshold amount from policy clause text
 */
export function extractThresholdFromText(text: string): number | undefined {
  // 1. Matches: "greater than or equal to $0", "greater or equal to $0", "equal to or greater than $0", ">= $0", ">= 0"
  const gteMatch = text.match(/(?:greater\s+(?:than\s+)?or\s+equal\s+to|equal\s+to\s+or\s+greater\s+than|>=\s*|=>\s*)\s*[\$₹]?\s*(\d+(?:\.\d{1,2})?)/i);
  if (gteMatch) return parseFloat(gteMatch[1]);

  // 2. Matches: "above $500", "over $500", "exceeding $500", "greater than $500", "more than $500", "exceeds $500"
  const exceedsMatch = text.match(/(?:above|over|exceeding|greater than|more than|exceeds)\s*[\$₹]?\s*(\d+(?:\.\d{1,2})?)/i);
  if (exceedsMatch) return parseFloat(exceedsMatch[1]);

  // 3. Matches: "$500 or more", "$500 and above", "$500 and over"
  const orMoreMatch = text.match(/[\$₹]\s*(\d+(?:\.\d{1,2})?)\s*(?:or more|and above|and over)/i);
  if (orMoreMatch) return parseFloat(orMoreMatch[1]);

  // 4. Matches: "up to $500", "limit of $500", "cap of $500", "maximum of $500", "capped at $500", "under $500", "below $500"
  const capMatch = text.match(/(?:up to|limit of|cap of|maximum of|capped at|under|below|limit is|cap is|maximum is)\s*[\$₹]?\s*(\d+(?:\.\d{1,2})?)/i);
  if (capMatch) return parseFloat(capMatch[1]);

  // 5. Matches: "threshold: $500", "limit: $500", "cap: $500", "amount: $500"
  const directMatch = text.match(/(?:threshold|limit|cap|maximum|max|amount)[\s:]*[\$₹]\s*(\d+(?:\.\d{1,2})?)/i);
  if (directMatch) return parseFloat(directMatch[1]);

  // 6. Matches currency amount if in context of supervisor, approval, authorization, refund, dispute, compensation, limit, cap
  if (/(?:supervisor|approval|authori[zs]ation|refund|dispute|compensation|limit|cap)/i.test(text)) {
    const plainMatch = text.match(/[\$₹]\s*(\d+(?:\.\d{1,2})?)/);
    if (plainMatch) return parseFloat(plainMatch[1]);
  }

  return undefined;
}

/**
 * Detects whether a policy clause or rule specifies that an amount >= $0 (zero or greater) requires approval.
 * When >= $0 is set in the policy rule, every refund or coupon requires human intervention.
 */
export function isZeroOrGreaterThreshold(
  ruleOrText: PolicyRule | string | { title?: string; rule?: string; statement?: string; condition?: string; thresholdAmount?: number }
): boolean {
  if (typeof ruleOrText === 'object' && ruleOrText !== null) {
    if (ruleOrText.thresholdAmount !== undefined && ruleOrText.thresholdAmount <= 0) {
      return true;
    }
  }
  const text = typeof ruleOrText === 'string'
    ? ruleOrText.toLowerCase()
    : `${ruleOrText.title || ''} ${ruleOrText.rule || ''} ${(ruleOrText as any).statement || ''} ${ruleOrText.condition || ''}`.toLowerCase();

  const patterns = [
    /greater\s+(?:than\s+)?or\s+equal\s+to\s+[\$₹]?\s*0(?:\.00?)?/i,
    /equal\s+to\s+or\s+greater\s+than\s+[\$₹]?\s*0(?:\.00?)?/i,
    />=\s*[\$₹]?\s*0(?:\.00?)?/i,
    /(?:above|over|exceeding|greater than|more than|exceeds)\s+[\$₹]?\s*0(?:\.00?)?/i,
    /[\$₹]?\s*0(?:\.00?)?\s+(?:or more|and above|and over)/i,
    /amount\s+(?:is\s+)?(?:greater\s+than\s+|above\s+|over\s+)?[\$₹]?\s*0(?:\.00?)?/i,
    /limit\s+(?:is\s+|of\s+)?[\$₹]?\s*0(?:\.00?)?/i,
    /cap\s+(?:is\s+|of\s+)?[\$₹]?\s*0(?:\.00?)?/i,
  ];

  return patterns.some(pattern => pattern.test(text));
}

/**
 * Checks whether the policy explicitly mentions financial caps, refund limits, coupons, or compensation guardrails.
 * If the policy does not mention it, it shouldn't be used as a guardrail.
 */
export function policyMentionsFinancialGuardrail(rules: PolicyRule[]): boolean {
  if (!rules || rules.length === 0) return false;
  return rules.some(rule => {
    if (rule.thresholdAmount !== undefined) return true;
    if (isZeroOrGreaterThreshold(rule)) return true;
    const text = `${rule.title} ${rule.rule} ${rule.condition}`.toLowerCase();
    const hasNumericAmount = /[\$₹]\s*\d+/.test(text) || extractThresholdFromText(text) !== undefined;
    const mentionsTopic = /refund|coupon|voucher|credit|compensation|goodwill|fee waiver|settlement|financial liability/i.test(text);
    return hasNumericAmount || (mentionsTopic && (rule.escalationRequired || /supervisor|approval|escalat|authori|human review/i.test(text)));
  });
}

/**
 * Checks if a clause statement specifies an escalation requirement
 */
export function isEscalationDirective(text: string): boolean {
  const lower = text.toLowerCase();
  // Check for negative context first
  if (lower.includes('without supervisor') || lower.includes('without approval') || lower.includes('no supervisor') || lower.includes('no approval')) {
    if (lower.includes('above') || lower.includes('exceeding') || lower.includes('over') || lower.includes('requires approval') || lower.includes('require approval')) {
      return true;
    }
    return false;
  }
  return lower.includes('supervisor') || lower.includes('approval') || lower.includes('escalat') || lower.includes('human review');
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

        const isEscalation = isEscalationDirective(statement);
        const thresholdAmount = extractThresholdFromText(statement);
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
          thresholdAmount,
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
        const isEscalation = isEscalationDirective(cleanItem);
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
        const thresholdAmount = extractThresholdFromText(cleanItem);

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
        const isEscalation = isEscalationDirective(line);
        const isProhibitive = lower.includes('prohibit') || lower.includes('never') || lower.includes('cannot') || lower.includes('do not');
        const directive: 'MANDATORY' | 'PROHIBITIVE' | 'PERMISSIVE' = isProhibitive ? 'PROHIBITIVE' : 'MANDATORY';
        const thresholdAmount = extractThresholdFromText(line);

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
          thresholdAmount,
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
    thresholdAmount: clause.thresholdAmount,
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

  if (structuredSections.length === 0 || flatRules.length === 0) {
    return {
      isValid: false,
      error: 'Please share the sample policy document and share it in the requested format and details. No substantive governance directives or clauses could be extracted from the provided text.',
      structuredDocument: null,
      tree: null,
      rules: [],
      summary: 'Validation Failed: Please share the sample policy document and share it in the requested format and details.',
    };
  }

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

export const SAMPLE_ENTERPRISE_POLICY = `# Enterprise Customer Communication Policy v2.4

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

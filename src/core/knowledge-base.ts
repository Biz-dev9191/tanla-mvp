import { PolicyRule } from './types';

export const BRAND_VOICE_GUIDELINES = {
  name: "Aurora Cloud Brand Voice",
  values: [
    "Clarity over cleverness",
    "Respect for attention",
    "Earn trust with follow-through",
    "Small teams, taken seriously",
  ],
  pillars: {
    direct: {
      rule: "State the facts and next steps without hedging or unnecessary preambles.",
      goodExample: "Set a deadline.",
      badExample: "You have the ability to configure a deadline.",
    },
    calm: {
      rule: "Maintain a steady, reassuring tone. Avoid hype, alarmism, or false enthusiasm.",
      goodExample: "Task moved to Done.",
      badExample: "Awesome, done!",
    },
    competent: {
      rule: "Clearly explain what occurred, the current state, and the exact next step without jargon or excuses.",
      goodExample: "We initiated a full refund of $49.50 to your original payment method. No action is required.",
      badExample: "Oops! Something went wrong on our server. We hope you understand!",
    },
  },
  formattingRules: [
    "No exclamation marks in product communication or customer messages.",
    "Sentence case throughout; eyebrow labels are the only all-caps use.",
    "Second person ('you', 'your'), never refer to the customer in third person.",
    "Never invent unverified delivery dates, refund timelines, or discount promises.",
    "Never manufacture unapproved external URLs or fake phone numbers; direct customers to the official app and web dashboard.",
    "Every new paragraph and sentence across all communication channels must strictly begin with a capital letter.",
    "Standard punctuation and grammar rules must be observed; greetings must end with a comma followed by clean double newlines (\\n\\n), eliminating comma splices.",
    "Brand de-duplication: Avoid redundant repetitive mentions of brand name inside message bodies; rely on verified channel identity headers and natural first-person pronouns ('we', 'our team').",
    "Elevated VIP & Younger persona standards: VIP communications must use natural, executive priority phrasing; younger persona communications must be crisp, modern, active, and grammatically complete.",
    "One clear outcome or call to action per message.",
  ],
};

export const CUSTOMER_SEGMENT_GUIDELINES = {
  "Digital-first": {
    style: "Concise, mobile-first, conversational, straightforward, minimal filler.",
    channelPreferenceWeight: ["WhatsApp", "SMS", "Email"],
    informationDensity: "High density with low word count. Direct links to self-service tracking.",
  },
  "Assisted": {
    style: "Explicit next steps, reassuring context, zero technical jargon, structured reassurance.",
    channelPreferenceWeight: ["Email", "Voice", "WhatsApp"],
    informationDensity: "Step-by-step layout. Clear timeline and direct support reassurance.",
  },
  "Mixed": {
    style: "Balanced tone, clear summary followed by optional detailed link.",
    channelPreferenceWeight: ["WhatsApp", "Email", "SMS"],
    informationDensity: "Moderate context with immediate status.",
  },
};

export const CHANNEL_GUIDELINES = {
  WhatsApp: {
    maxCharacters: 600,
    structure: "Persona-adaptive conversational layout. 1-2 focused paragraphs, outcome in first sentence, verified reference ID, and clear dashboard guidance. Dynamically adapts phrasing, pacing, and tone to the customer's generational cohort (Gen Z direct and modern, Senior patient and reassuring, Millennial data-efficient, VIP priority concierge).",
    greeting: "Persona-calibrated greeting (e.g. 'Hi [Name],' for Gen Z, 'Hello [Name],' for Senior/Millennial) followed cleanly by double line breaks",
    signoff: "Customer Support Team",
    permittedElements: ["Plain text", "Bold formatting (*word*)", "App and web dashboard references", "Verified Telemetry IDs"],
    prohibitions: ["Manufactured external links", "Invented phone numbers", "Exclamation marks", "Excessive emojis", "Lowercase paragraph starts", "Repetitive brand mentions"],
  },
  SMS: {
    maxCharacters: 160,
    structure: "DLT-compliant pre-approved standard template with bounded dynamic variables ({CustomerName}, {OrderRef}, {AmountRef}). Identical registered structure across all customer cohorts to guarantee telecom regulatory compliance without conversational persona drift.",
    greeting: "Standard DLT variable prefix: 'Aurora Cloud: Hi {CustomerName},'",
    signoff: "Aurora Cloud",
    permittedElements: ["Plain text", "Pre-registered dynamic variables", "App and web dashboard references", "Verified IDs"],
    prohibitions: ["Conversational persona drift", "Unregistered template variations", "Exclamation marks", "Length over 160 characters"],
  },
  Email: {
    maxCharacters: 2000,
    structure: "Gravity-governed architecture. Critical events (Payment Failed, Service Outage, Disputes) use formal institutional standard templates for regulatory clarity and legal precision. Non-critical events (Delays, Renewals, Incomplete KYC) dynamically adapt tone, tenor, and structure based on customer persona (warm and detailed for Seniors, concise for Gen Z, concierge for VIPs).",
    greeting: "Formal salutation 'Dear [Name],' for critical events; Persona-calibrated for non-critical events",
    signoff: "Formal compliance closing for critical events; Persona-calibrated for non-critical events",
    permittedElements: ["Structured headings", "Bullet points", "Verified telemetry", "App and web dashboard references"],
    prohibitions: ["Manufactured external links", "Invented phone numbers", "Exclamation marks", "Informal slang during critical events", "Lowercase paragraph starts"],
  },
  Voice: {
    maxCharacters: 500,
    structure: "Persona-calibrated spoken audio script. Adapts phrasing, pacing, and salutations to the customer persona (Gen Z: fast, friendly, direct; Senior: unhurried, reassuring, patient guidance; Millennial: crisp, data-first; VIP: executive priority acknowledgement).",
    greeting: "Persona-calibrated spoken greeting (e.g. 'Hi [Name], quick update...' for Gen Z vs. 'Hello [Name], this is an important update...' for Senior)",
    signoff: "Warm, professional conversational closing",
    permittedElements: ["Phonetic clarity", "Pacing pauses", "App and web dashboard guidance", "Reassurance statements"],
    prohibitions: ["Invented phone numbers", "Fast speech for seniors", "Exclamation marks", "Robotic jargon", "Repetitive brand name callouts"],
  },
};

export interface GovernedPolicyDocument {
  id: string;
  title: string;
  code: string;
  version: string;
  lastUpdated: string;
  summary: string;
  clauses: {
    clauseId: string;
    section: string;
    title: string;
    text: string;
    directiveType: 'MANDATORY' | 'PROHIBITIVE' | 'PERMISSIVE';
    complianceRequirement: string;
    keywords: string[];
    escalationRequired: boolean;
  }[];
}

export const POLICY_DOCUMENTS_INDEX: GovernedPolicyDocument[] = [
  {
    id: "DOC-PAY-01",
    title: "Payment, Refund & Financial Liability Standards",
    code: "PRL-2026-v4",
    version: "4.2",
    lastUpdated: "September 2026",
    summary: "Mandatory corporate guidelines governing automated refunds, payment capture failures, banking settlement SLAs, and goodwill credit caps.",
    clauses: [
      {
        clauseId: "PRL-SEC-3.1",
        section: "Section 3.1",
        title: "Automated Refund Notification & Card Masking",
        text: "In all instances where transaction capture succeeds but downstream order provisioning fails, the automated orchestrator must immediately generate an unambiguous refund confirmation. The communication must state the exact captured amount and payment gateway reference ID. Payment instruments must be masked to display only the last 4 digits (e.g. Card ending in 4012).",
        directiveType: "MANDATORY",
        complianceRequirement: "Must confirm payment reference, exact amount, card mask, and automated refund initiation without demanding customer intervention.",
        keywords: ["refund", "payment", "capture", "order failed", "masking", "card", "4012", "provisioning"],
        escalationRequired: false,
      },
      {
        clauseId: "PRL-SEC-3.4",
        section: "Section 3.4",
        title: "Settlement Timeline Standard",
        text: "Agents must cite standard banking settlement cycles (3 to 5 business days) as an estimate subject to the receiving financial institution. Agents are strictly prohibited from guaranteeing same-day settlement or immediate credit unless explicit real-time rails (IMPS/FedNow/SEPA Instant) have been confirmed by gateway telemetry.",
        directiveType: "PROHIBITIVE",
        complianceRequirement: "Cite 3-5 business days banking cycle; prohibit same-day guarantees without telemetry verification.",
        keywords: ["settlement", "timeline", "banking cycle", "business days", "guarantee", "same-day"],
        escalationRequired: false,
      },
      {
        clauseId: "PRL-SEC-5.2",
        section: "Section 5.2",
        title: "Goodwill Credit and Compensation Authority",
        text: "Automated communication systems possess $0 independent financial authorization for discretionary compensation, apology credits, or promotional vouchers. Any message offering monetary goodwill above $0 must be held in ESCALATION status and routed to an authorized Operations Supervisor for cryptographic sign-off under POL-FIN-001.",
        directiveType: "MANDATORY",
        complianceRequirement: "Hold discretionary credits in ESCALATION queue for supervisor sign-off before dispatch.",
        keywords: ["compensation", "goodwill", "voucher", "credit", "discount", "supervisor", "escalation", "authorization"],
        escalationRequired: true,
      },
    ],
  },
  {
    id: "DOC-PRV-02",
    title: "Data Protection, PII & Consent Protocol",
    code: "DPP-GDPR-CCPA-2026",
    version: "3.1",
    lastUpdated: "August 2026",
    summary: "Enterprise privacy safeguards covering personal identifiable information (PII) masking, channel consent enforcement, and unencrypted transmission prohibitions.",
    clauses: [
      {
        clauseId: "DPP-SEC-2.1",
        section: "Section 2.1",
        title: "PII Scrubbing and Redaction in Multi-Channel Outbound",
        text: "Plaintext transmission of primary account numbers (PAN), CVVs, passwords, full Aadhaar/SSN numbers, or unencrypted session tokens across WhatsApp, SMS, Email, or Voice synthesis is strictly prohibited. Only non-sensitive verified identifiers (First Name, truncated Order ID, masked card ending) may appear in outbound payloads.",
        directiveType: "PROHIBITIVE",
        complianceRequirement: "Strict redaction of all sensitive payment and identity tokens.",
        keywords: ["pii", "privacy", "pan", "card", "redaction", "masking", "security", "token", "password"],
        escalationRequired: false,
      },
      {
        clauseId: "DPP-SEC-4.3",
        section: "Section 4.3",
        title: "Channel Consent Hierarchy and Opt-In Enforcement",
        text: "Communications classified as promotional require verified opt-in consent recorded within the last 180 days. Transactional communications are permitted for active account holders but must respect channel-specific opt-outs unless classified as Critical Security Alerts.",
        directiveType: "MANDATORY",
        complianceRequirement: "Enforce consent verification prior to message dispatch.",
        keywords: ["consent", "opt-in", "promotional", "transactional", "compliance", "channel"],
        escalationRequired: false,
      },
    ],
  },
  {
    id: "DOC-GOV-03",
    title: "Customer Attention, Tone & Fatigue Mitigation Directive",
    code: "CAF-2026-v2",
    version: "2.4",
    lastUpdated: "July 2026",
    summary: "Governance limits for frequency capping, multi-channel suppression, brand tone adherence, and zero-friction customer reassurance.",
    clauses: [
      {
        clauseId: "CAF-SEC-1.2",
        section: "Section 1.2",
        title: "24-Hour Velocity Threshold & Autonomous Suppression",
        text: "If an individual customer profile has received 2 or more promotional messages, or 3 or more transactional messages within a rolling 24-hour window, subsequent non-critical communications must be SUPPRESSED autonomously by the orchestrator. The suppression event must be logged with an immutable audit trace.",
        directiveType: "MANDATORY",
        complianceRequirement: "Suppress outbound dispatch when rolling 24h frequency exceeds threshold.",
        keywords: ["fatigue", "frequency", "suppression", "velocity", "24-hour", "limits", "cap"],
        escalationRequired: false,
      },
      {
        clauseId: "CAF-SEC-2.5",
        section: "Section 2.5",
        title: "Aurora Brand Voice & Zero Exclamation Mandate",
        text: "All customer-facing text across all channels must embody the Aurora Brand Voice: Direct, Calm, Competent. Exclamation marks (!) are strictly prohibited in all transactional and support communications. Language must avoid alarmism, false excitement, bureaucratic jargon, or blaming third-party partners.",
        directiveType: "PROHIBITIVE",
        complianceRequirement: "Zero exclamation marks, calm sentence-case phrasing, second-person direct clarity.",
        keywords: ["brand", "voice", "tone", "exclamation", "calm", "direct", "competent", "formatting"],
        escalationRequired: false,
      },
      {
        clauseId: "CAF-SEC-3.1",
        section: "Section 3.1",
        title: "Customer Friction Minimization and Action Clarity",
        text: "Whenever a business event has been resolved automatically (e.g. auto-refund initiated, system failure remediated), the communication must explicitly declare 'No action is required from you' to prevent unnecessary support ticket creation.",
        directiveType: "MANDATORY",
        complianceRequirement: "Explicit zero-friction declaration on automated resolutions.",
        keywords: ["friction", "no action", "reassurance", "support ticket", "resolution", "clarity"],
        escalationRequired: false,
      },
    ],
  },
];

export const COMPANY_POLICIES: PolicyRule[] = [
  {
    id: "POL-TX-001",
    nodePath: "Communication > Transactional > Payment > Payment Successful > Order Failed",
    category: "transactional",
    title: "Payment Captured but Order Creation Failed",
    rule: "When customer payment succeeds but order provisioning fails, immediately reassure the customer, confirm payment capture ID, state that auto-refund has been initiated, and prohibit requesting the customer to retry payment immediately without verification.",
    condition: "event.type == 'payment_successful_order_failed'",
    allowedActions: [
      "Confirm payment capture ID and amount",
      "Confirm refund initiation within standard 3-5 business days banking cycle",
      "Reassure customer no further action is required",
      "Provide customer support escalation link if needed",
    ],
    prohibitedActions: [
      "Do not ask customer to re-enter payment credentials",
      "Do not promise same-day refund unless explicitly authorized",
      "Do not blame third-party gateways without constructive resolution",
    ],
    escalationRequired: false,
    priority: "critical",
  },
  {
    id: "POL-TX-002",
    nodePath: "Communication > Transactional > Payment > Payment Failed",
    category: "transactional",
    title: "Payment Processing Failure",
    rule: "Inform customer of payment failure reason without technical error codes. Provide a secure, direct link to retry payment. Do not retry automatically without consent.",
    condition: "event.type == 'payment_failed'",
    allowedActions: ["Provide retry payment link", "Explain card/bank decline category"],
    prohibitedActions: ["Expose internal gateway trace", "Charge without customer retry"],
    escalationRequired: false,
    priority: "high",
  },
  {
    id: "POL-TX-003",
    nodePath: "Communication > Transactional > Application > Incomplete Application",
    category: "transactional",
    title: "Pending Documents on Application",
    rule: "State exact missing document names, format requirements, upload deadline, and simple 1-step upload link. Avoid bureaucratic language.",
    condition: "event.type == 'application_incomplete'",
    allowedActions: ["List missing document", "Provide direct secure upload link", "State application hold deadline"],
    prohibitedActions: ["Threaten immediate cancellation without grace period", "Request PII over unencrypted email"],
    escalationRequired: false,
    priority: "medium",
  },
  {
    id: "POL-PRV-001",
    nodePath: "Communication > Governance > Privacy & Security",
    category: "privacy",
    title: "Customer PII & Sensitive Data Masking",
    rule: "Never send full credit card numbers, passwords, bank account numbers, or internal database keys in plain text across any channel. Mask credit cards to last 4 digits (e.g. **** 4012).",
    condition: "always",
    allowedActions: ["Mask sensitive identifiers", "Use verified customer first name"],
    prohibitedActions: ["Expose full card numbers", "Send plain-text tokens or internal secrets"],
    escalationRequired: false,
    priority: "critical",
  },
  {
    id: "POL-FAT-001",
    nodePath: "Communication > Governance > Fatigue & Frequency",
    category: "frequency",
    title: "Customer Message Frequency Suppression",
    rule: "If customer has received 2 or more promotional messages in the last 24 hours, all further promotional communications must be SUPPRESSED. If customer has received 3 or more transactional messages today, non-critical transactional messages must be consolidated or suppressed.",
    condition: "customer.recentCommunicationCount24h.promotional >= 2 || customer.recentCommunicationCount24h.transactional >= 3",
    allowedActions: ["Suppress communication with audit log", "Queue for consolidation digest"],
    prohibitedActions: ["Spam customer beyond frequency cap"],
    escalationRequired: false,
    priority: "high",
  },
  {
    id: "POL-FIN-001",
    nodePath: "Communication > Governance > Financial Commitments",
    category: "financial",
    title: "Unauthorized Compensation & Promise Prevention",
    rule: "AI agents are strictly prohibited from inventing discounts, goodwill credits, or compensation amounts above $0 without human supervisor approval. Any compensation offer requires HUMAN APPROVAL.",
    condition: "message.containsCompensation == true",
    allowedActions: ["State standard refund timeline", "Escalate to human supervisor for goodwill credit"],
    prohibitedActions: ["Promise unauthorized goodwill vouchers", "Guarantee bank processing times"],
    escalationRequired: true,
    priority: "critical",
  },
  {
    id: "POL-CONS-001",
    nodePath: "Communication > Governance > Consent Compliance",
    category: "promotional",
    title: "Opt-In Consent Enforcement",
    rule: "Promotional communication is strictly prohibited if customer promotional consent is false. Transactional communication requires transactional consent.",
    condition: "customer.consent == false",
    allowedActions: ["Block message before generation", "Log compliance block"],
    prohibitedActions: ["Send promotional message without verified opt-in"],
    escalationRequired: false,
    priority: "critical",
  },
];

/**
 * Clause-Level Semantic & Keyword RAG Retrieval Engine
 */
export function retrieveClauseCitations(
  eventType: string,
  eventDescription: string,
  objectivePrimary: string,
  customRules?: PolicyRule[],
  query?: string
): import('./types').ClauseCitation[] {
  const citations: import('./types').ClauseCitation[] = [];
  const queryTokens = [
    eventType,
    eventDescription,
    objectivePrimary,
    query || '',
  ]
    .join(' ')
    .toLowerCase()
    .split(/[\s,._\-:;]+/)
    .filter((w) => w.length > 2);

  // 1. Search Core Policy Documents
  for (const doc of POLICY_DOCUMENTS_INDEX) {
    for (const clause of doc.clauses) {
      let matchCount = 0;
      for (const kw of clause.keywords) {
        if (queryTokens.some((t) => t.includes(kw.toLowerCase()) || kw.toLowerCase().includes(t))) {
          matchCount += 1.5;
        }
      }
      // Check clause text matches
      const textLower = clause.text.toLowerCase();
      for (const token of queryTokens) {
        if (textLower.includes(token)) {
          matchCount += 0.4;
        }
      }

      if (matchCount > 0.8) {
        const relevanceScore = Math.min(0.99, Math.round((0.75 + matchCount * 0.05) * 100) / 100);
        citations.push({
          clauseId: clause.clauseId,
          sourceDocument: doc.title,
          section: clause.section,
          title: clause.title,
          excerpt: clause.text,
          relevanceScore,
          directiveType: clause.directiveType,
          complianceRequirement: clause.complianceRequirement,
        });
      }
    }
  }

  // 2. Search Custom Uploaded Rules (if provided)
  if (customRules && customRules.length > 0) {
    for (const rule of customRules) {
      let matchCount = 0;
      const ruleLower = `${rule.title} ${rule.rule} ${rule.allowedActions.join(' ')} ${rule.prohibitedActions.join(' ')}`.toLowerCase();
      for (const token of queryTokens) {
        if (ruleLower.includes(token)) {
          matchCount += 0.8;
        }
      }
      if (matchCount > 0.5) {
        citations.push({
          clauseId: rule.id,
          sourceDocument: 'Custom Uploaded Policy Document',
          section: rule.nodePath.split(' > ').pop() || 'Section 1.0',
          title: rule.title,
          excerpt: rule.rule,
          relevanceScore: Math.min(0.98, Math.round((0.8 + matchCount * 0.04) * 100) / 100),
          directiveType: rule.prohibitedActions.length > 0 ? 'PROHIBITIVE' : 'MANDATORY',
          complianceRequirement: rule.allowedActions.join('; ') || 'Strict compliance with uploaded policy.',
        });
      }
    }
  }

  // Sort by highest relevance score and return top matches
  return citations.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 4);
}


import { PreferredChannel } from './types';

export interface PolicyRuleDefinition {
  ruleCode: string;
  name: string;
  description: string;
  category: 'Demographic' | 'Friction & Fatigue' | 'Compliance & Legal' | 'Financial & SLA' | 'Tone & Style' | 'Anti-Hallucination' | 'Channel Constraints';
  enforcementLevel: 'MANDATORY' | 'PROHIBITIVE' | 'ADVISORY';
  railguardCheck: string;
}

export interface AgentGovernancePolicy {
  agentNumber: number;
  agentId: 'context' | 'objective' | 'policy_tree' | 'policy' | 'strategy' | 'message' | 'guardrail';
  policyCode: string;
  version: string;
  title: string;
  department: string;
  effectiveDate: string;
  governanceObjective: string;
  transformationRole: string;
  mandatoryInputs: string[];
  governedOutputs: string[];
  permittedActions: string[];
  prohibitedActions: string[];
  strictRailguards: string[];
  antiHallucinationConstraints: string[];
  rules: PolicyRuleDefinition[];
  decisionHeuristics: string[];
  escalationTriggers: string[];
}

export const AGENT_1_CONTEXT_POLICY: AgentGovernancePolicy = {
  agentNumber: 1,
  agentId: 'context',
  policyCode: 'CCAP-2026-v2.4',
  version: '2.4.0',
  title: 'Customer Context & Persona Extraction Governance Policy',
  department: 'Enterprise Customer Experience & Identity Architecture',
  effectiveDate: '2026-01-15',
  governanceObjective:
    'Standardize the deterministic ingestion, psychographic synthesis, and demographic persona classification across 25+ curated archetypes while calculating 24-hour attention fatigue and verifying explicit channel consent.',
  transformationRole:
    'Layer 1: Transforms raw customer attributes, support contact history, and 24-hour message frequency into a rich, structured Customer Persona and Attention Fatigue profile.',
  mandatoryInputs: [
    'Customer Name, Age / Age Group (18–24, 25–34, 35–44, 45–54, 55+)',
    'Account Segment (Standard, Premium, High Value, VIP, New)',
    'Digital Maturity Profile (Digital-first, Mixed, Assisted)',
    'Prior Support Interaction Count (Past 30 days)',
    '24-Hour Outbound Communication Velocity (Transactional + Promotional)',
    'Explicit Channel Consent Flags (Transactional, Promotional, Voice)',
    'Emotional Sentiment Indicator (Neutral, Frustrated, Anxious, Satisfied, Urgent)'
  ],
  governedOutputs: [
    'Matched Persona Archetype (Selected from 25+ Persona Catalog across Gen Z, Millennial, Gen X, Baby Boomer, Silent Gen)',
    'Attention Fatigue Score (0–100) & Risk Band (Low, Moderate, High)',
    'Emotional Friction Reassurance Priority (Standard vs. Critical)',
    'Contactability Verification & Channel Suitability Assessment',
    'Sensitivities & Missing Metadata Audit Trail'
  ],
  permittedActions: [
    'Map demographic traits to validated persona archetypes in the Catalog',
    'Calculate attention fatigue using deterministic velocity formula: (totalRecent * 25) + sentimentModifier',
    'Flag unverified email or phone numbers as missing metadata',
    'Escalate reassurance priority when prior contacts >= 2 or customer is Frustrated'
  ],
  prohibitedActions: [
    'NEVER invent demographic attributes not present in the customer brief',
    'NEVER assume promotional or voice consent if explicit flag is false or unverified',
    'NEVER classify a customer into a high-fatigue category without calculating 24h message velocity',
    'NEVER alter customer identity keys (ID, Phone, Email) during context transformation'
  ],
  strictRailguards: [
    'RG-CTX-01: Fatigue Score cap at 100 with mandatory suppression warning at score >= 70.',
    'RG-CTX-02: Missing contact endpoint (e.g. Email without email address) must invalidate the channel for primary dispatch.',
    'RG-CTX-03: Frustrated or Anxious sentiment mandates heightened reassurance flag passed to Strategy Layer.'
  ],
  antiHallucinationConstraints: [
    'All persona assignments must match an existing catalog archetype ID exactly.',
    'Historical support count must strictly reflect input brief telemetry.',
    'Do not hallucinate external CRM data not provided in the session context.'
  ],
  rules: [
    {
      ruleCode: 'CTX-DEMO-001',
      name: 'Generational Cohort Alignment',
      description: 'Match customers under 27 to Gen Z archetypes, 27-42 to Millennial, 43-58 to Gen X, 59-77 to Baby Boomers, and 78+ to Silent Generation.',
      category: 'Demographic',
      enforcementLevel: 'MANDATORY',
      railguardCheck: 'Persona cohort matches customer ageGroup.'
    },
    {
      ruleCode: 'CTX-FATIGUE-002',
      name: '24-Hour Attention Fatigue Threshold',
      description: 'If a customer received >= 3 messages in the last 24 hours, fatigue score must exceed 60 and trigger suppression review.',
      category: 'Friction & Fatigue',
      enforcementLevel: 'MANDATORY',
      railguardCheck: 'Velocity check enforces fatigue risk calculation.'
    },
    {
      ruleCode: 'CTX-CONSENT-003',
      name: 'Explicit Channel Consent Verification',
      description: 'Communication is prohibited on any channel where consent is explicitly false.',
      category: 'Compliance & Legal',
      enforcementLevel: 'MANDATORY',
      railguardCheck: 'Consent boolean check per channel.'
    }
  ],
  decisionHeuristics: [
    'If priorSupportContacts >= 2, escalate reassurance priority to Critical.',
    'If digitalProfile is "Assisted", default primary channel affinity to Email or Voice over WhatsApp.',
    'If customerValue is "VIP", prioritize white-glove executive reassurance markers.'
  ],
  escalationTriggers: [
    'Customer has 3+ unresolved support contacts within 48 hours.',
    'Customer exhibits extreme churn indicators combined with VIP status.'
  ]
};

export const AGENT_2_OBJECTIVE_POLICY: AgentGovernancePolicy = {
  agentNumber: 2,
  agentId: 'objective',
  policyCode: 'ORAP-2026-v2.1',
  version: '2.1.0',
  title: 'Objective Formulation & Support Deflection Policy',
  department: 'Enterprise Customer Operations & Product Strategy',
  effectiveDate: '2026-01-15',
  governanceObjective:
    'Identify precisely WHAT communication must be sent, extract verifiable root causes from business events, and formulate crisp resolution goals that eliminate customer confusion and deflect inbound support contacts.',
  transformationRole:
    'Layer 2: Transforms raw business events and enterprise objectives into actionable resolution goals with root-cause isolation and zero-friction next steps.',
  mandatoryInputs: [
    'Business Event Payload (eventType, title, description, verifiedFacts, resolutionStatus)',
    'Primary Business Objective (resolve_issue, reduce_support_contacts, reassure_customer, retain_customer, recover_payment)',
    'Context Analysis Output from Agent 1'
  ],
  governedOutputs: [
    'Resolved Primary & Secondary Communication Intent',
    'Isolated Root Cause & Plain-Language Problem Statement',
    'Customer Action Requirement (Action Required vs. Zero-Action Reassurance)',
    'Support Deflection Roadmap & Clarity Score (0–100)',
    'Mandatory Resolution Truths (Refund status, ETA, Order reference)'
  ],
  permittedActions: [
    'Synthesize complex technical error codes into empathetic customer-facing root causes',
    'Declare zero customer action required when automated remediation is in flight',
    'Set explicit deflection goals targeting 0 inbound support tickets',
    'Formulate single-click call-to-action (CTA) requirements'
  ],
  prohibitedActions: [
    'NEVER shift blame onto the customer for system/payment gateway disruptions',
    'NEVER leave resolution status ambiguous (e.g. "we are looking into it" without concrete details)',
    'NEVER introduce secondary marketing objectives during high-severity transactional failure events',
    'NEVER omit the exact transaction or order reference when financial deductions occurred'
  ],
  strictRailguards: [
    'RG-OBJ-01: Financial deductions mandate immediate refund or fulfillment disclosure in the primary objective.',
    'RG-OBJ-02: Support contact reduction requires eliminating open-ended phrases like "call us if you have questions" when automated tracking is provided.',
    'RG-OBJ-03: High anxiety events require reassuring objective statements placed ahead of procedural instructions.'
  ],
  antiHallucinationConstraints: [
    'Resolution status must match verified system facts (e.g. do not state "Refund Completed" if status is "Refund Initiated").',
    'Do not invent compensation amounts not validated by the financial event payload.'
  ],
  rules: [
    {
      ruleCode: 'OBJ-ROOT-001',
      name: 'Transparent Root-Cause Declaration',
      description: 'Every outbound communication must clearly identify the trigger event in non-jargon language.',
      category: 'Financial & SLA',
      enforcementLevel: 'MANDATORY',
      railguardCheck: 'Root cause extracted and validated against event verifiedFacts.'
    },
    {
      ruleCode: 'OBJ-DEFLECT-002',
      name: 'Support Deflection Optimization',
      description: 'Communication must contain all information required to prevent the customer from calling support.',
      category: 'Tone & Style',
      enforcementLevel: 'MANDATORY',
      railguardCheck: 'Zero-action clarity evaluated; clarity score >= 80.'
    }
  ],
  decisionHeuristics: [
    'If event is payment_successful_order_failed, primary objective MUST be reassurance + automated refund confirmation.',
    'If application_incomplete, primary objective MUST be friction-free single-tap resumption.'
  ],
  escalationTriggers: [
    'Event indicates systemic outage affecting > 10,000 customers simultaneously.',
    'Event involves unauthorized security or account access flags.'
  ]
};

export const AGENT_3_POLICY_TREE_POLICY: AgentGovernancePolicy = {
  agentNumber: 3,
  agentId: 'policy_tree',
  policyCode: 'PTGAP-2026-v1.8',
  version: '1.8.0',
  title: 'Policy Tree Generator Agent Governance Policy',
  department: 'Enterprise Knowledge Management & Decision Intelligence',
  effectiveDate: '2026-01-15',
  governanceObjective:
    'Ingest unstructured compliance manuals, SLA documents, and business rulebooks; extract hierarchical decision trees; and make them available for dynamic evaluation. If no document is provided, safely bypass execution.',
  transformationRole:
    'Layer 3: Transforms uploaded policy text and knowledge documents into an executable hierarchical policy tree with parent-child decision paths.',
  mandatoryInputs: [
    'Uploaded Enterprise Policy Document Text (Optional)',
    'Pre-existing Enterprise Baseline Policy Tree',
    'Business Domain Taxonomy (Transactional, Financial, Privacy, Escalation)'
  ],
  governedOutputs: [
    'Structured Policy Nodes (Root, Category Branches, Leaf Decision Rules)',
    'Condition Logic Operators (EQUALS, CONTAINS, GREATER_THAN, IN_ARRAY)',
    'Allowed & Prohibited Action Sets per Node',
    'Document Clause Citation Mappings (Section, Title, Verbatim Excerpt)',
    'Skip Status Flag (Executed vs. Bypassed - Using Baseline)'
  ],
  permittedActions: [
    'Parse uploaded PDF/Text/Markdown policy documentation into structured rule nodes',
    'Bypass document extraction and pass baseline enterprise policies when no document is uploaded',
    'Extract verbatim clause citations with relevance scoring',
    'Inject custom financial limits or SLA thresholds into dynamic policy nodes'
  ],
  prohibitedActions: [
    'NEVER hallucinate non-existent compliance clauses not in the uploaded text or baseline',
    'NEVER generate cyclical decision nodes in the policy tree',
    'NEVER override core statutory regulations (e.g. TCPA/TRAI quiet hours) via uploaded documents',
    'NEVER fail the orchestration pipeline if an optional policy document is absent'
  ],
  strictRailguards: [
    'RG-TREE-01: Safe Fallback — If uploaded document is empty or invalid, seamlessly use Enterprise Baseline Tree.',
    'RG-TREE-02: Acyclicity Verification — Generated policy trees must form directed acyclic graphs (DAG).',
    'RG-TREE-03: Clause Integrity — Every extracted rule must link to a valid source excerpt.'
  ],
  antiHallucinationConstraints: [
    'Clause excerpts must be verbatim substrings of the provided document.',
    'Relevance scores must be calculated strictly from semantic overlap.'
  ],
  rules: [
    {
      ruleCode: 'TREE-EXT-001',
      name: 'Dynamic Node Extraction',
      description: 'Extract conditions, allowed actions, and prohibitions into typed PolicyRule structures.',
      category: 'Compliance & Legal',
      enforcementLevel: 'MANDATORY',
      railguardCheck: 'Each node has valid category, condition, allowedActions, and prohibitedActions.'
    },
    {
      ruleCode: 'TREE-SKIP-002',
      name: 'Graceful Skip Handling',
      description: 'When no custom document is uploaded, set status to SKIPPED and supply default enterprise rules.',
      category: 'Financial & SLA',
      enforcementLevel: 'MANDATORY',
      railguardCheck: 'Skip handler does not throw or halt execution.'
    }
  ],
  decisionHeuristics: [
    'If uploaded text length < 50 characters, treat as omitted and bypass.',
    'If uploaded document contains financial compensation terms, flag for human approval node injection.'
  ],
  escalationTriggers: [
    'Uploaded document contains contradictory compliance rules that cannot be resolved.'
  ]
};

export const AGENT_4_COMPLIANCE_POLICY: AgentGovernancePolicy = {
  agentNumber: 4,
  agentId: 'policy',
  policyCode: 'EPAP-2026-v3.0',
  version: '3.0.0',
  title: 'Enterprise Policy, Compliance & Regulatory Governance Policy',
  department: 'Enterprise Legal, Risk Management & Regulatory Affairs',
  effectiveDate: '2026-01-15',
  governanceObjective:
    'Enforce strict regulatory compliance (TRAI DLT, TCPA, GDPR, RBI), enterprise SLA rules, privacy masking, and statutory financial guardrails ($0 unauthorized compensation gate).',
  transformationRole:
    'Layer 4: Traverses the policy tree, applies deterministic guardrails, matches regulatory clauses, and binds permissible actions to the communication context.',
  mandatoryInputs: [
    'Customer Profile (with consent & fatigue score)',
    'Business Event (with transaction metadata)',
    'Context Analysis Output & Objective Definition',
    'Active Policy Tree (Dynamic or Baseline)'
  ],
  governedOutputs: [
    'Applied Policy Decision Path (Breadcrumbs through Policy Tree)',
    'Matched Enterprise Policy Rules (with Priority & Prohibitions)',
    'Verbatim Clause Citations (with Mandatory / Prohibitive Directives)',
    'Financial Compensation Authorization Status (Permitted vs. Gate Escalation)',
    'Mandatory Action Boundaries for Message Generation'
  ],
  permittedActions: [
    'Enforce statutory quiet hours (21:00 to 08:00) by converting promotional SMS to morning queue',
    'Mask Personally Identifiable Information (PII) including card numbers (last 4 digits only)',
    'Trigger mandatory Human Approval requirement if compensation > $0 without prior system authorization',
    'Select applicable DLT template registration categories for Indian telecom routing'
  ],
  prohibitedActions: [
    'NEVER authorize financial compensation or credit promises exceeding $0 without human supervisor approval (POL-FIN-001)',
    'NEVER permit promotional content during transactional failure resolution flows',
    'NEVER transmit full payment card PAN, CVV, or bank account numbers over unencrypted channels',
    'NEVER bypass privacy masking rules regardless of customer value tier'
  ],
  strictRailguards: [
    'RG-POL-01 (POL-FIN-001): Zero unauthorized financial promises. Any goodwill credit or payout requires supervisor sign-off.',
    'RG-POL-02 (POL-PRIV-002): PII Masking — Full account numbers and passwords must never be emitted.',
    'RG-POL-03 (POL-FREQ-003): Frequency Capping — Reject messages if customer reached daily limit unless high-urgency transactional.'
  ],
  antiHallucinationConstraints: [
    'All policy citations must directly reflect certified enterprise policy rules.',
    'No compliance approvals may be assumed without explicit rule node matching.'
  ],
  rules: [
    {
      ruleCode: 'POL-FIN-001',
      name: 'Financial Compensation & Refund Authorization Gate',
      description: 'Automated systems may confirm verified refunds initiated by payment gateways. Any additional monetary compensation requires human approval.',
      category: 'Financial & SLA',
      enforcementLevel: 'MANDATORY',
      railguardCheck: 'Verify no unauthorized credit or compensation is added without human approval flag.'
    },
    {
      ruleCode: 'POL-PRIV-002',
      name: 'PII & Financial Data Masking',
      description: 'Card numbers must display last 4 digits only (e.g. card ending 4012). Full account numbers are strictly prohibited.',
      category: 'Compliance & Legal',
      enforcementLevel: 'MANDATORY',
      railguardCheck: 'Regex check for 16-digit card numbers and PII.'
    },
    {
      ruleCode: 'POL-TXN-003',
      name: 'Transactional Integrity & No Upselling',
      description: 'Transactional notifications must not contain promotional discounts or upselling material.',
      category: 'Compliance & Legal',
      enforcementLevel: 'MANDATORY',
      railguardCheck: 'Promotional keywords rejected during transactional failures.'
    }
  ],
  decisionHeuristics: [
    'If event contains verified auto-refund, permit refund confirmation stating exact bank timeline (3–5 business days).',
    'If customer requested custom compensation, mandate Human Approval workflow.'
  ],
  escalationTriggers: [
    'Customer disputes amount > $500.',
    'Regulatory complaint threat detected in customer sentiment.'
  ]
};

export const AGENT_5_STRATEGY_POLICY: AgentGovernancePolicy = {
  agentNumber: 5,
  agentId: 'strategy',
  policyCode: 'CSAP-2026-v2.5',
  version: '2.5.0',
  title: 'Communication Strategy & Channel Matrix Governance Policy',
  department: 'Omnichannel Strategy & Customer Engagement Operations',
  effectiveDate: '2026-01-15',
  governanceObjective:
    'Synthesize persona archetype, emotional sentiment, policy boundaries, and urgency to select the optimal channel, fallback channel, and precise tone matrix (e.g. casual-competent for Gen Z, step-by-step reassuring for Baby Boomers).',
  transformationRole:
    'Layer 5: Transforms customer persona, context dynamics, and compliance boundaries into a strategic channel routing decision and tone matrix blueprint.',
  mandatoryInputs: [
    'Matched Customer Persona (from Agent 1 Catalog)',
    'Context Analysis Output (Fatigue score, Sensitivities)',
    'Objective Definition (from Agent 2)',
    'Compliance Boundaries & Applied Policies (from Agent 4)'
  ],
  governedOutputs: [
    'Strategic Dispatch Decision (SEND, SUPPRESS, ESCALATE)',
    'Primary Dispatch Channel (WhatsApp, SMS, Email, Voice)',
    'Fallback Channel (for delivery redundancy)',
    'Tone & Formality Matrix (Aligned to Generation Persona Archetype)',
    'Message Length Guideline (Ultra-concise, Concise, Detailed)',
    'Call-to-Action (CTA) Blueprint & Urgency Tier (Low, Medium, High)'
  ],
  permittedActions: [
    'Route high-urgency notifications to instant channels (WhatsApp or SMS)',
    'Route assisted/senior customers or detailed audit logs to Email',
    'Configure casual, crisp tone for Gen Z personas and structured, reassuring tone for Baby Boomer personas',
    'Suppress outbound communication if 24h attention fatigue score >= 70 and event is non-critical'
  ],
  prohibitedActions: [
    'NEVER route to a channel where customer consent is false',
    'NEVER select Voice as primary channel for non-urgent transactional receipts',
    'NEVER assign a casual/slang tone to VIP enterprise founders or senior citizens',
    'NEVER suppress critical security or financial debit failure notifications regardless of fatigue'
  ],
  strictRailguards: [
    'RG-STR-01: Tone Alignment — Tone must strictly match the assigned Persona archetype in the catalog.',
    'RG-STR-02: Channel Redundancy — Always define a fallback channel with verified contactability.',
    'RG-STR-03: Suppression Protection — High-severity payment failures MUST NEVER be suppressed.'
  ],
  antiHallucinationConstraints: [
    'Selected channels must be supported by the enterprise omnichannel stack.',
    'Tone directives must reference explicit persona attributes.'
  ],
  rules: [
    {
      ruleCode: 'STR-GENZ-001',
      name: 'Gen Z Persona Tone Calibration',
      description: 'For Gen Z personas, tone must be direct, modern, casual-competent, and ultra-concise with zero bureaucratic jargon.',
      category: 'Tone & Style',
      enforcementLevel: 'MANDATORY',
      railguardCheck: 'Formality set to Conversational; messageLength set to Ultra-concise.'
    },
    {
      ruleCode: 'STR-BOOMER-002',
      name: 'Baby Boomer Persona Tone Calibration',
      description: 'For Baby Boomer personas, tone must be patient, respectful, step-by-step reassuring with clear human-assisted support access.',
      category: 'Tone & Style',
      enforcementLevel: 'MANDATORY',
      railguardCheck: 'Formality set to Reassuring; clear step-by-step clarity.'
    },
    {
      ruleCode: 'STR-CHAN-003',
      name: 'Channel Consent & Fallback Enforcement',
      description: 'Primary channel must have verified consent. Fallback channel must differ from primary.',
      category: 'Compliance & Legal',
      enforcementLevel: 'MANDATORY',
      railguardCheck: 'Primary channel != Fallback channel, both have consent.'
    }
  ],
  decisionHeuristics: [
    'If digitalProfile is Digital-first and ageGroup is 18–24 or 25–34, select WhatsApp with SMS fallback.',
    'If digitalProfile is Assisted or ageGroup is 55+, select Email with SMS fallback.',
    'If sentiment is Frustrated, increase personalization depth to Deep.'
  ],
  escalationTriggers: [
    'Fatigue score >= 80 on non-transactional event (triggers SUPPRESS decision).'
  ]
};

export const AGENT_6_MESSAGE_POLICY: AgentGovernancePolicy = {
  agentNumber: 6,
  agentId: 'message',
  policyCode: 'CMGAP-2026-v4.2',
  version: '4.2.0',
  title: 'Multi-Channel Message Generation Governance Policy',
  department: 'AI Content Generation, Brand Integrity & Channel Standards',
  effectiveDate: '2026-01-15',
  governanceObjective:
    'Generate synchronized, channel-optimized customer communications across WhatsApp, SMS, Email, and Voice. Enforce strict character limits, persona voice alignment, and absolute railguards (ZERO EXCLAMATION MARKS).',
  transformationRole:
    'Layer 6: Generates full multi-channel message payloads strictly governed by persona tone, strategy guidelines, and policy constraints.',
  mandatoryInputs: [
    'Customer Profile & Matched Persona',
    'Business Event with Verified Facts (Amounts, IDs, Timelines)',
    'Objective Resolution Roadmap',
    'Strategic Matrix (Selected Channel, Tone, CTA)',
    'Policy Constraints & PII Masking Directives'
  ],
  governedOutputs: [
    'WhatsApp Message Payload (Rich text, emojis, quick CTA, <= 1024 chars)',
    'SMS Message Payload (GSM-7 compatible, <= 160 chars, essential facts only)',
    'Email Message Payload (Formal subject line, detailed breakdown, clear signature, <= 2000 chars)',
    'Voice Interactive Script (Phonetic clarity, conversational pacing, <= 500 chars)'
  ],
  permittedActions: [
    'Include verified transaction ID, order ID, and refund timelines (3–5 business days)',
    'Use persona-appropriate greetings (e.g. "Hi Aria," for Gen Z vs. "Dear Robert," for Baby Boomer)',
    'Adapt message layout to channel constraints (bullet points for email, single paragraph for SMS)',
    'Include direct 1-tap tracking link for self-service status verification'
  ],
  prohibitedActions: [
    'NEVER USE EXCLAMATION MARKS (!) UNDER ANY CIRCUMSTANCES (STRICT CORPORATE RAILGUARD)',
    'NEVER exceed 160 characters in the SMS body payload',
    'NEVER exceed 1024 characters in the WhatsApp payload',
    'NEVER use unverified promises (e.g. "refund instantly" instead of "initiated within 3–5 days")',
    'NEVER display unmasked 16-digit credit card numbers'
  ],
  strictRailguards: [
    'RG-MSG-01: ZERO EXCLAMATION MARKS — Any exclamation mark (!) constitutes an instant generation failure.',
    'RG-MSG-02: SMS Character Cap — Body must be <= 160 characters strictly.',
    'RG-MSG-03: Factual Fidelity — Every ID, amount, and timeframe must match the verified event facts exactly.'
  ],
  antiHallucinationConstraints: [
    'Do not invent discount coupons, compensation vouchers, or fake phone numbers.',
    'Timelines must match enterprise SLA (3–5 business days for card refunds).'
  ],
  rules: [
    {
      ruleCode: 'MSG-PUNC-001',
      name: 'Zero Exclamation Mark Railguard',
      description: 'Exclamation marks are perceived as aggressive or artificial during transaction failures and are strictly forbidden.',
      category: 'Tone & Style',
      enforcementLevel: 'MANDATORY',
      railguardCheck: 'Regex test: /!/ must return false on all channel bodies.'
    },
    {
      ruleCode: 'MSG-SMS-002',
      name: 'SMS 160-Character Limit',
      description: 'SMS messages must fit into a single standard telecom segment of 160 characters.',
      category: 'Channel Constraints',
      enforcementLevel: 'MANDATORY',
      railguardCheck: 'sms.body.length <= 160.'
    },
    {
      ruleCode: 'MSG-FACT-003',
      name: 'Verified Fact Ingestion',
      description: 'Messages must include verified event facts such as Order ID and Refund Status.',
      category: 'Anti-Hallucination',
      enforcementLevel: 'MANDATORY',
      railguardCheck: 'Verified facts present in message content.'
    }
  ],
  decisionHeuristics: [
    'For Gen Z persona: Use 2 concise sentences, friendly opening, zero corporate filler.',
    'For Baby Boomer persona: Use respectful greeting, clear 3-step timeline, reference ID, and support signature.',
    'For VIP persona: Acknowledge account standing with white-glove executive reassurance.'
  ],
  escalationTriggers: [
    'Model output fails punctuation or length constraints after revision.'
  ]
};

export const AGENT_7_CRITIC_POLICY: AgentGovernancePolicy = {
  agentNumber: 7,
  agentId: 'guardrail',
  policyCode: 'CSGAP-2026-v3.3',
  version: '3.3.0',
  title: 'Critic, Safety Guardrail & Autonomous Reflection Governance Policy',
  department: 'Enterprise AI Safety, Model Evaluation & Human-in-the-Loop Governance',
  effectiveDate: '2026-01-15',
  governanceObjective:
    'Execute rigorous 7-point automated verification across all generated messages, enforce reflection feedback loops to correct errors autonomously, and gate high-risk or financial-compensation outputs for Human Approval.',
  transformationRole:
    'Layer 7: Inspects, validates, verifies facts, executes multi-turn reflection corrections, and makes the final go/no-go PASS, REVISE, ESCALATE, or SUPPRESS decision.',
  mandatoryInputs: [
    'All Generated Channel Messages (WhatsApp, SMS, Email, Voice)',
    'Verified Facts from Business Event',
    'Customer Persona & Tone Blueprint',
    'Applied Compliance Rules & Clause Citations',
    'Revision Counter (Max 2 autonomous reflection loops)'
  ],
  governedOutputs: [
    '7-Point Guardrail Verification Matrix (Accuracy, Policy, Privacy, Tone, Channel, Fatigue, Promises)',
    'Overall Evaluation Decision (PASS, REVISE, ESCALATE, SUPPRESS)',
    'Reflection Loop Iteration Records (Feedback, Violations, Corrections Applied)',
    'Human Approval Status (Not Required, Pending Human Approval, Escalated)',
    'Actionable Feedback for Generation Revision'
  ],
  permittedActions: [
    'Approve message (PASS) when all 7 checks pass with 0 violations',
    'Trigger autonomous reflection loop (REVISE) when minor violations (e.g. exclamation mark, length) are detected (up to 2 iterations)',
    'Escalate for Human Approval when unauthorized financial compensation is present or high churn risk requires supervisor review',
    'Suppress message (SUPPRESS) when severe fatigue or compliance breach cannot be resolved'
  ],
  prohibitedActions: [
    'NEVER PASS a message containing an exclamation mark (!)',
    'NEVER PASS a message exceeding 160 characters for SMS',
    'NEVER PASS a message containing unverified financial promises without Human Approval status set to Pending',
    'NEVER execute more than 2 reflection loops to prevent infinite latency loops'
  ],
  strictRailguards: [
    'RG-CRT-01: Exclamation Mark Detection — Instant REVISE flag if any channel body contains "!".',
    'RG-CRT-02: Fact Verification — Reject messages referencing unverified transaction amounts or IDs.',
    'RG-CRT-03: Financial Gate — If financial compensation > $0 is detected, humanApprovalRequired must be true.'
  ],
  antiHallucinationConstraints: [
    'Verify that all cited transaction numbers exist in the source event payload.',
    'Verify that refund dates do not promise same-day settlement unless verified in facts.'
  ],
  rules: [
    {
      ruleCode: 'CRT-PUNC-001',
      name: 'Zero Exclamation Mark Enforcement',
      description: 'Critic must flag any exclamation mark and provide actionable feedback to strip it.',
      category: 'Tone & Style',
      enforcementLevel: 'MANDATORY',
      railguardCheck: 'Checks body.includes("!").'
    },
    {
      ruleCode: 'CRT-FACT-002',
      name: 'Factual Accuracy Verification',
      description: 'Critic must compare message text against event.verifiedFacts for 100% fidelity.',
      category: 'Anti-Hallucination',
      enforcementLevel: 'MANDATORY',
      railguardCheck: 'No hallucinated facts or incorrect amounts.'
    },
    {
      ruleCode: 'CRT-HUMAN-003',
      name: 'Human-in-the-Loop Escalation Gate',
      description: 'Critic must halt automated dispatch and mandate human approval if high-risk policy boundaries are crossed.',
      category: 'Financial & SLA',
      enforcementLevel: 'MANDATORY',
      railguardCheck: 'humanApprovalStatus set to Pending when escalation criteria met.'
    }
  ],
  decisionHeuristics: [
    'If revisionCount < 2 and minor violations exist, trigger autonomous reflection loop.',
    'If revisionCount >= 2 and violations persist, escalate to Human Approval.',
    'If all checks pass, output PASS decision with Personalisation Quality rating.'
  ],
  escalationTriggers: [
    'Unauthorized compensation claim detected.',
    'Persistent railguard failure after 2 reflection loops.',
    'Customer threatens legal or regulatory action.'
  ]
};

export const AGENT_GOVERNANCE_POLICIES: AgentGovernancePolicy[] = [
  AGENT_1_CONTEXT_POLICY,
  AGENT_2_OBJECTIVE_POLICY,
  AGENT_3_POLICY_TREE_POLICY,
  AGENT_4_COMPLIANCE_POLICY,
  AGENT_5_STRATEGY_POLICY,
  AGENT_6_MESSAGE_POLICY,
  AGENT_7_CRITIC_POLICY
];

export interface TransformationLayerHierarchy {
  layerIndex: number;
  agentName: string;
  agentCode: string;
  policyCode: string;
  inputDescription: string;
  outputDescription: string;
  keyRailguards: string[];
  transformationSummary: string;
}

export const AGENT_TRANSFORMATION_HIERARCHY: TransformationLayerHierarchy[] = [
  {
    layerIndex: 1,
    agentName: 'Customer Context & Persona Agent',
    agentCode: 'context',
    policyCode: 'CCAP-2026-v2.4',
    inputDescription: 'Raw customer profile, demographic pills, 24h message velocity, prior support contacts.',
    outputDescription: 'Matched 25+ Persona archetype, Attention Fatigue score (0-100), emotional friction priorities.',
    keyRailguards: ['Fatigue velocity cap', 'Explicit consent verification', 'No demographic hallucination'],
    transformationSummary: 'Transforms raw profile into a psychographic persona (Gen Z, Millennial, Gen X, Boomer, Silent Gen) with fatigue index.'
  },
  {
    layerIndex: 2,
    agentName: 'Objective & Resolution Agent',
    agentCode: 'objective',
    policyCode: 'ORAP-2026-v2.1',
    inputDescription: 'Business event payload, transaction IDs, verified facts, primary enterprise objective.',
    outputDescription: 'Root-cause isolation, support deflection roadmap, zero-action reassurance clarity.',
    keyRailguards: ['Mandatory root cause', 'Zero customer blame', 'Deflection clarity >= 80'],
    transformationSummary: 'Transforms complex technical failures into crystal-clear customer resolution objectives that eliminate support friction.'
  },
  {
    layerIndex: 3,
    agentName: 'Policy Tree Generator Agent',
    agentCode: 'policy_tree',
    policyCode: 'PTGAP-2026-v1.8',
    inputDescription: 'Uploaded custom policy document (PDF/Text) or default enterprise rulebook.',
    outputDescription: 'Hierarchical decision tree with DAG structure, condition logic, and clause citations. (Skipped if no document uploaded).',
    keyRailguards: ['Graceful skip handling', 'Acyclicity DAG check', 'Verbatim clause integrity'],
    transformationSummary: 'Transforms unstructured compliance manuals into executable policy decision trees or safely falls back to enterprise baseline.'
  },
  {
    layerIndex: 4,
    agentName: 'Enterprise Policy & Compliance Agent',
    agentCode: 'policy',
    policyCode: 'EPAP-2026-v3.0',
    inputDescription: 'Active policy tree, customer context, transaction metadata, regulatory compliance requirements.',
    outputDescription: 'Traversed decision path, DLT templates, PII masking rules, POL-FIN-001 $0 compensation gate.',
    keyRailguards: ['POL-FIN-001 $0 compensation limit', 'PII card masking (last 4 digits)', 'Transactional integrity'],
    transformationSummary: 'Applies enterprise regulations, statutory laws (TRAI/GDPR/TCPA), and enforces human approval on financial compensation.'
  },
  {
    layerIndex: 5,
    agentName: 'Communication Strategy Agent',
    agentCode: 'strategy',
    policyCode: 'CSAP-2026-v2.5',
    inputDescription: 'Matched Persona archetype, context sensitivities, objective goals, compliance boundaries.',
    outputDescription: 'Primary and fallback channel selection (WhatsApp/SMS/Email/Voice), Persona-calibrated tone matrix.',
    keyRailguards: ['Channel consent verification', 'Persona tone calibration', 'Suppression on critical fatigue'],
    transformationSummary: 'Selects the highest-converting channel and aligns formality/tone to the specific demographic persona.'
  },
  {
    layerIndex: 6,
    agentName: 'Multi-Channel Message Generator',
    agentCode: 'message',
    policyCode: 'CMGAP-2026-v4.2',
    inputDescription: 'Strategy tone matrix, verified facts, Persona voice guidelines, channel constraints.',
    outputDescription: 'Synchronized messages for WhatsApp (rich), SMS (160c), Email (detailed), Voice (phonetic).',
    keyRailguards: ['ZERO EXCLAMATION MARKS (!)', 'SMS <= 160 characters', 'Factual fidelity'],
    transformationSummary: 'Generates multi-channel drafts with zero corporate fluff, zero exclamation marks, and strict length limits.'
  },
  {
    layerIndex: 7,
    agentName: 'Critic, Guardrail & Reflection Agent',
    agentCode: 'guardrail',
    policyCode: 'CSGAP-2026-v3.3',
    inputDescription: 'Generated message payloads, verified facts, policy citations, revision count.',
    outputDescription: '7-point verification matrix, PASS/REVISE/ESCALATE decision, autonomous reflection loop iterations.',
    keyRailguards: ['7-Point safety verification', 'Reflection feedback loops (max 2)', 'Human Approval escalation gating'],
    transformationSummary: 'Verifies safety, corrects errors autonomously through reflection loops, and gates high-risk outputs for human sign-off.'
  }
];

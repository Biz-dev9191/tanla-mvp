export type CustomerSegment = 'Standard' | 'Premium' | 'High Value' | 'New' | 'Long-term';
export type DigitalProfile = 'Digital-first' | 'Mixed' | 'Assisted';
export type PreferredLanguage = 'English' | 'Hindi' | 'Spanish' | 'Other';
export type PreferredChannel = 'WhatsApp' | 'Email' | 'SMS' | 'Voice';
export type AgeGroup = '18–24' | '25–34' | '35–44' | '45–54' | '55+';

export interface StreamlinedBriefPayload {
  customerProfileText: string;
  customerPills: string[];
  eventHistoryText: string;
  eventPills: string[];
  objectiveText: string;
  objectivePills: string[];
}

export interface CustomerConsent {
  transactional: boolean;
  promotional: boolean;
  voice: boolean;
}

export interface CommunicationHistoryItem {
  id: string;
  channel: PreferredChannel;
  type: 'transactional' | 'promotional';
  timestamp: string;
  summary: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  age: number;
  ageGroup: AgeGroup;
  segment: CustomerSegment;
  digitalProfile: DigitalProfile;
  preferredLanguage: PreferredLanguage;
  preferredChannel: PreferredChannel;
  consent: CustomerConsent;
  customerValue: 'Standard' | 'Medium' | 'High' | 'VIP';
  tenureMonths: number;
  recentCommunicationCount24h: {
    transactional: number;
    promotional: number;
  };
  previousSupportContacts: number;
  sentiment: 'Neutral' | 'Frustrated' | 'Anxious' | 'Satisfied' | 'Urgent';
  email?: string;
  phone?: string;
}

export type EventType =
  | 'payment_successful_order_failed'
  | 'payment_failed'
  | 'refund_delayed'
  | 'order_delayed'
  | 'service_disruption'
  | 'application_incomplete'
  | 'subscription_expiring'
  | 'customer_complaint'
  | 'promotional_opportunity'
  | 'other';

export interface BusinessEvent {
  id: string;
  eventType: EventType;
  title: string;
  description: string;
  timestamp: string;
  verifiedFacts: string[];
  resolutionStatus: 'Resolved' | 'Refund Initiated' | 'In Progress' | 'Requires Customer Action' | 'Pending Approval' | 'None Required';
  transactionId?: string;
  orderId?: string;
  amount?: string;
}

export type BusinessObjectiveType =
  | 'resolve_issue'
  | 'reduce_support_contacts'
  | 'reassure_customer'
  | 'retain_customer'
  | 'recover_payment'
  | 'increase_conversion'
  | 'inform_customer'
  | 'complete_application'
  | 're_engage_customer';

export interface BusinessObjective {
  primary: BusinessObjectiveType;
  secondary?: string;
  customNote?: string;
}

export interface PolicyRule {
  id: string;
  nodePath: string;
  category: 'transactional' | 'promotional' | 'financial' | 'privacy' | 'frequency' | 'escalation';
  title: string;
  rule: string;
  condition: string;
  allowedActions: string[];
  prohibitedActions: string[];
  escalationRequired: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface CommunicationStrategy {
  decision: 'SEND' | 'SUPPRESS' | 'ESCALATE';
  selectedChannel: PreferredChannel;
  fallbackChannel?: PreferredChannel;
  tone: string;
  formality: 'Conversational' | 'Professional' | 'Reassuring' | 'Direct';
  messageLength: 'Ultra-concise' | 'Concise' | 'Detailed';
  language: PreferredLanguage;
  personalisationLevel: 'Standard' | 'High' | 'Deep';
  ctaType: 'None' | 'Click Link' | 'Upload Document' | 'Contact Support' | 'Retry Payment';
  ctaText?: string;
  urgency: 'Low' | 'Medium' | 'High';
  customerActionRequired: boolean;
  humanApprovalRequired: boolean;
  approvalReason?: string;
  suppressionReason?: string;
}

export interface ChannelMessage {
  channel: PreferredChannel;
  subject?: string;
  body: string;
  characterCount: number;
  previewUrl?: string;
  isSimulated: boolean;
}

export interface ClauseCitation {
  clauseId: string;
  sourceDocument: string;
  section: string;
  title: string;
  excerpt: string;
  relevanceScore: number;
  directiveType: 'MANDATORY' | 'PROHIBITIVE' | 'PERMISSIVE';
  complianceRequirement: string;
}

export interface ReflectionLoopIteration {
  iteration: number;
  criticFeedback: string;
  violationsDetected: string[];
  previousDraftSummary: string;
  revisedDraftSummary: string;
  correctionsApplied: string[];
  timestamp: string;
}

export interface SimulationTurn {
  turnIndex: number;
  speaker: 'customer' | 'agent';
  channel: PreferredChannel;
  message: string;
  sentiment?: 'Relieved' | 'Frustrated' | 'Satisfied' | 'Anxious' | 'Skeptical' | 'Neutral' | 'Delighted' | 'Cooperative';
  sentimentScore?: number; // 0 to 100 (100 = highly positive)
  escalationRisk?: 'Low' | 'Moderate' | 'High';
  intent?: string;
  timestamp: string;
}

export interface SimulationPersona {
  id: string;
  name: string;
  category: 'High Value VIP' | 'Frustrated Senior' | 'Tech-Savvy Digital' | 'Cautious First-Timer' | 'Urgent Escalator';
  description: string;
  temperament: string;
  initialSentiment: 'Anxious' | 'Frustrated' | 'Neutral' | 'Satisfied';
}

export interface SimulationSession {
  id: string;
  persona: SimulationPersona;
  turns: SimulationTurn[];
  resolutionStatus: 'Resolved' | 'Escalated to Human' | 'Follow-up Scheduled' | 'Pending Customer Action';
  customerSatisfactionScore: number; // 1 to 5
  supportTicketDeflected: boolean;
  summary: string;
}

export interface GuardrailEvaluation {
  status: 'PASS' | 'REVISE' | 'ESCALATE' | 'SUPPRESS';
  factualAccuracy: { passed: boolean; details: string };
  policyCompliance: { passed: boolean; details: string };
  privacyCheck: { passed: boolean; details: string };
  toneAlignment: { passed: boolean; details: string };
  channelFit: { passed: boolean; details: string };
  fatigueCheck: { passed: boolean; details: string };
  unsupportedPromises: { detected: boolean; details: string };
  personalisationQuality: 'Standard' | 'High' | 'Exceptional';
  feedbackForRevision?: string;
  violationCodes?: string[];
  actionableFeedback?: string[];
  revisionCount: number;
  reflectionLoops?: ReflectionLoopIteration[];
}

export interface AgentExecutionStep {
  agentId: 'context' | 'objective' | 'policy_tree' | 'policy' | 'strategy' | 'message' | 'guardrail';
  agentName: string;
  status: 'waiting' | 'processing' | 'completed' | 'needs_revision' | 'escalated' | 'suppressed' | 'failed';
  summary: string;
  details: string[];
  chainOfThought?: string[];
  durationMs: number;
  timestamp: string;
}

export interface OrchestrationResult {
  id: string;
  timestamp: string;
  customer: CustomerProfile;
  event: BusinessEvent;
  objective: BusinessObjective;
  agentSteps: AgentExecutionStep[];
  decisionTrace: string[];
  appliedPolicyPath: string[];
  appliedPolicies: PolicyRule[];
  clauseCitations?: ClauseCitation[];
  reflectionLoops?: ReflectionLoopIteration[];
  strategy: CommunicationStrategy;
  messages: {
    whatsapp: ChannelMessage;
    sms: ChannelMessage;
    email: ChannelMessage;
    voice: ChannelMessage;
  };
  guardrails: GuardrailEvaluation;
  genericTemplateComparison: {
    templateText: string;
    differences: string[];
  };
  humanApprovalStatus?: 'Pending' | 'Approved' | 'Rejected' | 'Not Required';
}


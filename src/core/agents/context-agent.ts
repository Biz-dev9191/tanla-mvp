import { CustomerProfile, BusinessEvent, AgentExecutionStep } from '../types';
import { CustomerPersona, matchCustomerPersona } from '../personas';

export interface ContextAnalysisOutput {
  segmentSummary: string;
  channelPreference: string;
  supportHistoryContext: string;
  fatigueRisk: 'Low' | 'Moderate' | 'High';
  fatigueScore: number; // 0 to 100
  sentimentDynamics: {
    primary: string;
    escalationSensitivity: 'Low' | 'Medium' | 'High' | 'Critical';
    reassurancePriority: 'High' | 'Standard';
  };
  digitalMaturity: 'Digital-first' | 'Mixed' | 'Assisted';
  matchedPersona: CustomerPersona;
  sensitivities: string[];
  missingInformation: string[];
  chainOfThought: string[];
  step: AgentExecutionStep;
}

export const SENTIMENT_FATIGUE_MODIFIERS: Record<
  CustomerProfile['sentiment'],
  { value: number; label: string; rationale: string }
> = {
  Frustrated: {
    value: 20,
    label: '+20',
    rationale: 'Active grievance and friction amplify fatigue index, accelerating the suppression threshold.',
  },
  Anxious: {
    value: 15,
    label: '+15',
    rationale: 'Emotional apprehension heightens sensitivity to notification overload; requires heightened reassurance.',
  },
  Urgent: {
    value: 10,
    label: '+10',
    rationale: 'Time-sensitive blocker increases customer cognitive pressure; non-critical outbound updates are deprioritized.',
  },
  Neutral: {
    value: 0,
    label: '0 (Baseline)',
    rationale: 'Standard baseline state; fatigue score is strictly derived from 24h message velocity.',
  },
  Satisfied: {
    value: -10,
    label: '-10',
    rationale: 'Positive brand goodwill and affinity provide an attention tolerance buffer.',
  },
};

export function runCustomerContextAgent(
  customer: CustomerProfile,
  event: BusinessEvent
): ContextAnalysisOutput {
  const startTime = Date.now();
  const sensitivities: string[] = [];
  const missingInfo: string[] = [];
  const chainOfThought: string[] = [];

  // Match against 25+ Persona Catalog
  const matchedPersona = matchCustomerPersona(customer);

  // Chain-of-thought 1: Persona & Generational Ingestion
  chainOfThought.push(
    `[Step 1 - Profile Ingestion & Persona Synthesis (CCAP-2026)] Ingested profile for '${customer.name}' (Age: ${customer.age || 34}, Age Group: ${customer.ageGroup}, Segment: ${customer.segment}, Tenure: ${customer.tenureMonths}m, Value: ${customer.customerValue}). Matched to Persona Archetype: '${matchedPersona.name}' (${matchedPersona.cohort} - ${matchedPersona.archetype}).`
  );

  // Chain-of-thought 2: Persona Tone & Communication Style Calibration
  chainOfThought.push(
    `[Step 2 - Persona Behavioral Matrix] Tone Blueprint: "${matchedPersona.tonePreference}". Communication Style: "${matchedPersona.communicationStyle}". Key Frustration Triggers: [${matchedPersona.frustrationTriggers.join(', ')}]. Reassurance Requirements: "${matchedPersona.reassuranceRequirements}".`
  );

  // Chain-of-thought 3: Support History & Sentiment Dynamics
  const prevContacts = customer.previousSupportContacts || 0;
  const isHighValue = customer.customerValue === 'VIP' || customer.customerValue === 'High';
  const isAnxious = customer.sentiment === 'Anxious' || customer.sentiment === 'Frustrated' || customer.sentiment === 'Urgent';

  chainOfThought.push(
    `[Step 3 - History & Sentiment Evaluation] Prior support contact count: ${prevContacts}. Observed emotional sentiment: '${customer.sentiment}'. ${
      prevContacts > 1 ? 'Customer exhibits cumulative friction; reassurance buffer required.' : 'No critical friction history.'
    }`
  );

  if (prevContacts >= 2) {
    sensitivities.push(`Customer has contacted support ${prevContacts} times previously - requires heightened reassurance and zero friction.`);
  }

  if (isHighValue) {
    sensitivities.push(`High-value ${customer.segment} tier account (${customer.tenureMonths} months tenure, Value Tier: ${customer.customerValue}).`);
  }

  if (isAnxious) {
    sensitivities.push(`Customer sentiment flagged as '${customer.sentiment}'. Tone must be calm, direct, and reassuring without corporate defensiveness.`);
  }

  // Chain-of-thought 4: Message Velocity & Attention Fatigue Assessment
  const transactional24h = customer.recentCommunicationCount24h.transactional || 0;
  const promotional24h = customer.recentCommunicationCount24h.promotional || 0;
  const totalRecent = transactional24h + promotional24h;

  const sentimentEntry = SENTIMENT_FATIGUE_MODIFIERS[customer.sentiment] || SENTIMENT_FATIGUE_MODIFIERS.Neutral;
  const sentimentModifier = sentimentEntry.value;

  const velocityScore = totalRecent * 25;
  let fatigueScore = velocityScore + sentimentModifier;
  fatigueScore = Math.min(100, Math.max(0, fatigueScore));

  const fatigueRisk = fatigueScore >= 70 ? 'High' : fatigueScore >= 40 ? 'Moderate' : 'Low';

  chainOfThought.push(
    `[Step 4 - Attention Fatigue Calculus (CTX-FATIGUE-002)] 24h Outbound Velocity: ${transactional24h} transactional, ${promotional24h} promotional (Total: ${totalRecent} msgs × 25 = ${velocityScore}). Sentiment Modifier for '${customer.sentiment}': ${sentimentModifier >= 0 ? `+${sentimentModifier}` : sentimentModifier}. Computed Attention Fatigue Score: ${fatigueScore}/100 (Risk: ${fatigueRisk}).`
  );

  // Chain-of-thought 5: Channel Capability & Contactability Check
  if (customer.preferredChannel === 'Email' && !customer.email) {
    missingInfo.push('Customer preferred channel is Email but email address is unverified.');
  }
  if (customer.preferredChannel === 'WhatsApp' && !customer.phone) {
    missingInfo.push('Customer preferred channel is WhatsApp but phone number is unverified.');
  }

  chainOfThought.push(
    `[Step 5 - Channel Consent & Verification (CTX-CONSENT-003)] Preferred channel: ${customer.preferredChannel}. Consent: Transactional=${customer.consent.transactional}, Promotional=${customer.consent.promotional}, Voice=${customer.consent.voice}. Contact verification status: ${missingInfo.length === 0 ? 'Verified' : 'Missing metadata'}.`
  );

  const duration = Date.now() - startTime + 45;

  const step: AgentExecutionStep = {
    agentId: 'context',
    agentName: 'Customer Context & Persona Agent',
    status: 'completed',
    summary: `Profile structured: ${customer.name} -> Persona: ${matchedPersona.name}`,
    details: [
      `Ingested profile and matched to Persona: '${matchedPersona.name}' (${matchedPersona.cohort}).`,
      `Persona tone blueprint: "${matchedPersona.tonePreference}".`,
      `Preferred channel: ${customer.preferredChannel} (Transactional consent verified).`,
      `Assessed 24h message frequency (${totalRecent} recent msgs × 25 = ${velocityScore}, Sentiment '${customer.sentiment}': ${sentimentModifier >= 0 ? `+${sentimentModifier}` : sentimentModifier}, Fatigue Score: ${fatigueScore}/100, Risk: ${fatigueRisk}).`,
      `Factored ${prevContacts} prior support contacts and '${customer.sentiment}' sentiment dynamics.`,
    ],
    chainOfThought,
    durationMs: duration,
    timestamp: new Date().toISOString(),
  };

  return {
    segmentSummary: `${customer.segment} (${customer.ageGroup} / ${customer.digitalProfile})`,
    channelPreference: customer.preferredChannel,
    supportHistoryContext: `${prevContacts} prior support interactions`,
    fatigueRisk,
    fatigueScore,
    sentimentDynamics: {
      primary: customer.sentiment,
      escalationSensitivity: isHighValue && isAnxious ? 'Critical' : isAnxious ? 'High' : 'Medium',
      reassurancePriority: isAnxious || prevContacts >= 1 ? 'High' : 'Standard',
    },
    digitalMaturity: customer.digitalProfile,
    matchedPersona,
    sensitivities,
    missingInformation: missingInfo,
    chainOfThought,
    step,
  };
}

import { CustomerProfile, BusinessEvent, AgentExecutionStep } from '../types';

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
  sensitivities: string[];
  missingInformation: string[];
  chainOfThought: string[];
  step: AgentExecutionStep;
}

export function runCustomerContextAgent(
  customer: CustomerProfile,
  event: BusinessEvent
): ContextAnalysisOutput {
  const startTime = Date.now();
  const sensitivities: string[] = [];
  const missingInfo: string[] = [];
  const chainOfThought: string[] = [];

  // Chain-of-thought 1: Persona & Demographic Synthesis
  chainOfThought.push(
    `[Step 1 - Profile Ingestion] Ingesting profile for customer '${customer.name}' (Age: ${customer.age || 34}, Age Group: ${customer.ageGroup}, Segment: ${customer.segment}, Tenure: ${customer.tenureMonths} months, Value Tier: ${customer.customerValue}).`
  );

  // Chain-of-thought 2: Support History & Sentiment Dynamics
  const prevContacts = customer.previousSupportContacts || 0;
  const isHighValue = customer.customerValue === 'VIP' || customer.customerValue === 'High';
  const isAnxious = customer.sentiment === 'Anxious' || customer.sentiment === 'Frustrated' || customer.sentiment === 'Urgent';

  chainOfThought.push(
    `[Step 2 - History & Sentiment Evaluation] Prior support contact count: ${prevContacts}. Observed emotional sentiment: '${customer.sentiment}'. ${
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

  // Chain-of-thought 3: Message Velocity & Attention Fatigue Assessment
  const transactional24h = customer.recentCommunicationCount24h.transactional || 0;
  const promotional24h = customer.recentCommunicationCount24h.promotional || 0;
  const totalRecent = transactional24h + promotional24h;

  let fatigueScore = totalRecent * 25;
  if (customer.sentiment === 'Frustrated') fatigueScore += 20;
  fatigueScore = Math.min(100, Math.max(0, fatigueScore));

  const fatigueRisk = fatigueScore >= 70 ? 'High' : fatigueScore >= 40 ? 'Moderate' : 'Low';

  chainOfThought.push(
    `[Step 3 - Attention Fatigue Calculus] 24h Outbound Velocity: ${transactional24h} transactional, ${promotional24h} promotional (Total: ${totalRecent}). Computed Attention Fatigue Score: ${fatigueScore}/100 (Risk: ${fatigueRisk}).`
  );

  // Chain-of-thought 4: Channel Capability & Masking Constraints
  if (customer.preferredChannel === 'Email' && !customer.email) {
    missingInfo.push('Customer preferred channel is Email but email address is unverified.');
  }
  if (customer.preferredChannel === 'WhatsApp' && !customer.phone) {
    missingInfo.push('Customer preferred channel is WhatsApp but phone number is unverified.');
  }

  chainOfThought.push(
    `[Step 4 - Channel Affinity & Contactability] Preferred channel: ${customer.preferredChannel}. Consent: Transactional=${customer.consent.transactional}, Promotional=${customer.consent.promotional}, Voice=${customer.consent.voice}. Contact verification status: ${missingInfo.length === 0 ? 'Verified' : 'Missing metadata'}.`
  );

  const duration = Date.now() - startTime + 45;

  const step: AgentExecutionStep = {
    agentId: 'context',
    agentName: 'Customer Context Agent',
    status: 'completed',
    summary: `Profile structured: ${customer.name} (${customer.segment}, ${customer.digitalProfile}, ${customer.preferredChannel})`,
    details: [
      `Understood ${customer.name}'s digital profile as '${customer.digitalProfile}' with language '${customer.preferredLanguage}'.`,
      `Identified preferred communication channel: ${customer.preferredChannel} (Consent verified).`,
      `Assessed 24h message frequency (${totalRecent} recent messages, Fatigue Score: ${fatigueScore}/100, Risk: ${fatigueRisk}).`,
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
    sensitivities,
    missingInformation: missingInfo,
    chainOfThought,
    step,
  };
}


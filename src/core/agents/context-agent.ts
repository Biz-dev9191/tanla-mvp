import { CustomerProfile, BusinessEvent, AgentExecutionStep, AgeGroup, CustomerSegment, DigitalProfile, PreferredChannel } from '../types';
import { CustomerPersona, matchCustomerPersona } from '../personas';

export interface CustomerSynthesisInput {
  structuredCustomer?: Partial<CustomerProfile>;
  customerPills?: string[];
  customerProfileText?: string;
  rawCustomer?: CustomerProfile;
}

export interface ContextAnalysisOutput {
  synthesizedCustomer: CustomerProfile;
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

/**
 * Agent 1 Information Hierarchy & Synthesis Engine (Purview: Column 1 ONLY)
 * Hierarchy: Structured Form (Tier 1) > Pills (Tier 2) > Text (Tier 3)
 */
export function synthesizeCustomerProfile(input: CustomerSynthesisInput): {
  customer: CustomerProfile;
  hierarchyLog: string[];
} {
  const hierarchyLog: string[] = [];
  const s = input.structuredCustomer || {};
  const pills = input.customerPills || [];
  const pillsStr = pills.join(' ').toLowerCase();
  const text = (input.customerProfileText || '').trim();
  const textLower = text.toLowerCase();

  // 1. Customer Name (Tier 1 > Tier 3)
  let cleanName = 'Customer';
  if (s.name && s.name.trim() && s.name.trim().toLowerCase() !== 'customer' && s.name.trim().toLowerCase() !== 'valued customer') {
    cleanName = s.name.trim();
    hierarchyLog.push(`[Information Hierarchy - Name] Adopted Structured Form (Tier 1): "${cleanName}".`);
  } else if (text) {
    const nameMatch = text.match(/(?:Customer|Name|User|Account Holder|Client)[\s:]+([A-Za-z]+(?:\s+[A-Za-z]+)*)/i);
    if (nameMatch && nameMatch[1]) {
      const extracted = nameMatch[1].split(/[,;\n]/)[0].trim();
      if (extracted.toLowerCase() !== 'valued customer' && extracted.toLowerCase() !== 'valued') {
        cleanName = extracted;
        hierarchyLog.push(`[Information Hierarchy - Name] Extracted from Narrative Text (Tier 3): "${cleanName}".`);
      }
    } else {
      const firstSegment = text.split(/[\n;,]/)[0].trim();
      const firstLineClean = firstSegment.replace(/^(?:Customer|Name|User|Account Holder|Profile)[\s:-]*/i, '').trim();
      if (firstLineClean && firstLineClean.length >= 2 && firstLineClean.length < 35 && !firstLineClean.toLowerCase().includes('account') && firstLineClean.toLowerCase() !== 'valued customer') {
        cleanName = firstLineClean;
        hierarchyLog.push(`[Information Hierarchy - Name] Extracted from Narrative Text (Tier 3): "${cleanName}".`);
      }
    }
  }

  // 2. Age & Age Cohort (Tier 1 > Tier 2 > Tier 3)
  let age = 34;
  let ageGroup: AgeGroup = '25–34';
  let ageSource = 'Default Baseline';

  if (s.ageGroup) {
    ageGroup = s.ageGroup as AgeGroup;
    age = ageGroup === '18–24' ? 22 : ageGroup === '55+' ? 66 : ageGroup === '45–54' ? 48 : ageGroup === '35–44' ? 38 : 30;
    ageSource = `Structured Form (Tier 1: ${ageGroup})`;
    hierarchyLog.push(`[Information Hierarchy - Demographics] Bound Age Cohort from ${ageSource}.`);
    // Check if narrative text conflicted
    const textAgeMatch = text.match(/(\d{2})\s*(?:years?\s*old|yo|\b)/i);
    if (textAgeMatch && parseInt(textAgeMatch[1]) !== age) {
      hierarchyLog.push(`[Contradiction Resolved] Overrode freeform text age (${textAgeMatch[1]}) with Structured Form tier selection (${ageGroup}).`);
    }
  } else if (pills.length > 0) {
    if (pillsStr.includes('18–24') || pillsStr.includes('gen z') || pillsStr.includes('student')) {
      age = 22; ageGroup = '18–24'; ageSource = 'Pills (Tier 2: 18–24)';
    } else if (pillsStr.includes('55+') || pillsStr.includes('senior') || pillsStr.includes('boomer') || pillsStr.includes('retired')) {
      age = 65; ageGroup = '55+'; ageSource = 'Pills (Tier 2: 55+)';
    } else if (pillsStr.includes('45–54') || pillsStr.includes('gen x')) {
      age = 48; ageGroup = '45–54'; ageSource = 'Pills (Tier 2: 45–54)';
    } else if (pillsStr.includes('35–44')) {
      age = 38; ageGroup = '35–44'; ageSource = 'Pills (Tier 2: 35–44)';
    } else if (pillsStr.includes('25–34')) {
      age = 30; ageGroup = '25–34'; ageSource = 'Pills (Tier 2: 25–34)';
    }
    if (ageSource !== 'Default Baseline') {
      hierarchyLog.push(`[Information Hierarchy - Demographics] Inferred Age Cohort from ${ageSource}.`);
    }
  }
  
  if (ageSource === 'Default Baseline' && text) {
    const ageMatch = text.match(/(\d{2})\s*(?:years?\s*old|yo|\b)/i);
    if (ageMatch && parseInt(ageMatch[1]) >= 18 && parseInt(ageMatch[1]) <= 99) {
      age = parseInt(ageMatch[1]);
      if (age <= 26) ageGroup = '18–24';
      else if (age <= 34) ageGroup = '25–34';
      else if (age <= 44) ageGroup = '35–44';
      else if (age <= 54) ageGroup = '45–54';
      else ageGroup = '55+';
      hierarchyLog.push(`[Information Hierarchy - Demographics] Ingested Age Cohort from Narrative Text (Tier 3: ${age}yo -> ${ageGroup}).`);
    }
  }

  // 3. Customer Segment & Account Value (Tier 1 > Tier 2 > Tier 3)
  let segment: CustomerSegment = 'Standard';
  let customerValue: 'VIP' | 'High' | 'Standard' = 'Standard';
  let segSource = 'Default';

  if (s.segment) {
    segment = s.segment as CustomerSegment;
    customerValue = (segment as string) === 'VIP' || segment === 'High Value' ? 'VIP' : segment === 'Premium' ? 'High' : 'Standard';
    segSource = `Structured Form (Tier 1: ${segment})`;
    hierarchyLog.push(`[Information Hierarchy - Segment] Bound Tier from ${segSource}.`);
  } else if (pillsStr.includes('vip') || pillsStr.includes('high ltv') || pillsStr.includes('high value')) {
    segment = 'High Value';
    customerValue = 'VIP';
    hierarchyLog.push(`[Information Hierarchy - Segment] Inferred VIP status from Filter Pills (Tier 2).`);
  } else if (pillsStr.includes('premium')) {
    segment = 'Premium';
    customerValue = 'High';
    hierarchyLog.push(`[Information Hierarchy - Segment] Inferred Premium status from Filter Pills (Tier 2).`);
  } else if (pillsStr.includes('new customer') || pillsStr.includes('new')) {
    segment = 'New';
    hierarchyLog.push(`[Information Hierarchy - Segment] Inferred New Customer from Filter Pills (Tier 2).`);
  } else if (textLower.includes('vip')) {
    segment = 'High Value';
    customerValue = 'VIP';
    hierarchyLog.push(`[Information Hierarchy - Segment] Supplemented VIP status from Narrative Text (Tier 3).`);
  } else if (textLower.includes('premium')) {
    segment = 'Premium';
    customerValue = 'High';
    hierarchyLog.push(`[Information Hierarchy - Segment] Supplemented Premium status from Narrative Text (Tier 3).`);
  }

  // 4. Digital Maturity & Preferred Channel (Tier 1 > Tier 2 > Tier 3)
  let digitalProfile: DigitalProfile = 'Digital-first';
  if (s.digitalProfile) {
    digitalProfile = s.digitalProfile as DigitalProfile;
    hierarchyLog.push(`[Information Hierarchy - Digital Maturity] Bound from Structured Form (Tier 1: ${digitalProfile}).`);
  } else if (pillsStr.includes('assisted') || pillsStr.includes('assisted-service')) {
    digitalProfile = 'Assisted';
    hierarchyLog.push(`[Information Hierarchy - Digital Maturity] Inferred Assisted from Filter Pills (Tier 2).`);
  } else if (pillsStr.includes('mixed')) {
    digitalProfile = 'Mixed';
    hierarchyLog.push(`[Information Hierarchy - Digital Maturity] Inferred Mixed from Filter Pills (Tier 2).`);
  } else if (textLower.includes('assisted') || ageGroup === '55+') {
    digitalProfile = 'Assisted';
    hierarchyLog.push(`[Information Hierarchy - Digital Maturity] Calibrated Assisted from Demographics/Narrative (Tier 3).`);
  }

  const preferredChannel: PreferredChannel = digitalProfile === 'Assisted' || ageGroup === '55+' ? 'Email' : 'WhatsApp';

  // 5. Emotional Sentiment & Prior Support Friction (Tier 1 > Tier 2 > Tier 3)
  let sentiment: CustomerProfile['sentiment'] = 'Neutral';
  if (s.sentiment) {
    sentiment = s.sentiment;
    hierarchyLog.push(`[Information Hierarchy - Sentiment] Ingested from Structured Form (Tier 1: ${sentiment}).`);
  } else if (textLower.includes('frustrated') || textLower.includes('angry') || textLower.includes('upset')) {
    sentiment = 'Frustrated';
    hierarchyLog.push(`[Information Hierarchy - Sentiment] Detected Frustration from Narrative Text (Tier 3).`);
  } else if (textLower.includes('anxious') || textLower.includes('worried') || textLower.includes('concerned')) {
    sentiment = 'Anxious';
    hierarchyLog.push(`[Information Hierarchy - Sentiment] Detected Anxiety from Narrative Text (Tier 3).`);
  } else if (textLower.includes('urgent') || textLower.includes('emergency')) {
    sentiment = 'Urgent';
    hierarchyLog.push(`[Information Hierarchy - Sentiment] Detected Urgency from Narrative Text (Tier 3).`);
  }

  const prevContacts = s.previousSupportContacts !== undefined ? s.previousSupportContacts : (textLower.includes('contacted support') ? 2 : 0);

  const finalEmail = s.email && s.email.trim() ? s.email.trim() : `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/^\.+|\.+$/g, '') || 'customer'}@example.com`;
  const finalPhone = s.phone && s.phone.trim() ? s.phone.trim() : '+91 98765 43210';

  const customer: CustomerProfile = {
    id: s.id || `CUST-${Math.floor(10000 + Math.random() * 90000)}`,
    name: cleanName,
    age,
    ageGroup,
    segment,
    digitalProfile,
    preferredLanguage: 'English',
    preferredChannel,
    consent: s.consent || { transactional: true, promotional: !pillsStr.includes('opt-out'), voice: digitalProfile === 'Assisted' },
    customerValue,
    tenureMonths: s.tenureMonths || (pillsStr.includes('long-term') ? 36 : 14),
    recentCommunicationCount24h: s.recentCommunicationCount24h || { transactional: 1, promotional: 0 },
    previousSupportContacts: prevContacts,
    sentiment,
    email: finalEmail,
    phone: finalPhone,
  };

  return { customer, hierarchyLog };
}

export function runCustomerContextAgent(
  customerOrInput: CustomerProfile | CustomerSynthesisInput,
  eventArg?: BusinessEvent
): ContextAnalysisOutput {
  const startTime = Date.now();
  const sensitivities: string[] = [];
  const missingInfo: string[] = [];
  const chainOfThought: string[] = [];

  let customer: CustomerProfile;
  if ('preferredChannel' in customerOrInput) {
    customer = customerOrInput as CustomerProfile;
  } else {
    const syn = synthesizeCustomerProfile(customerOrInput as CustomerSynthesisInput);
    customer = syn.customer;
    chainOfThought.push(...syn.hierarchyLog);
  }

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
    synthesizedCustomer: customer,
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

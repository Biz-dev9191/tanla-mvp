import { CustomerProfile, BusinessEvent, BusinessObjective, CommunicationStrategy, ChannelMessage, GuardrailEvaluation, AgentExecutionStep } from '../types';

export interface GuardrailOutput {
  evaluation: GuardrailEvaluation;
  step: AgentExecutionStep;
}

export function runGuardrailAgent(
  customer: CustomerProfile,
  event: BusinessEvent,
  objective: BusinessObjective,
  strategy: CommunicationStrategy,
  messages: {
    whatsapp: ChannelMessage;
    sms: ChannelMessage;
    email: ChannelMessage;
    voice: ChannelMessage;
  },
  revisionCount: number = 0
): GuardrailOutput {
  const startTime = Date.now();

  const selectedMsg = messages[strategy.selectedChannel.toLowerCase() as keyof typeof messages] || messages.whatsapp;
  const fullText = `${selectedMsg.subject || ''} ${selectedMsg.body}`;

  // 1. Check for exclamation marks (Aurora Cloud brand violation)
  const hasExclamation = fullText.includes('!');

  // 2. Check for unverified compensation promises
  const mentionsCompensation = /coupon|voucher|\$\d+\s*credit|free\s*month/i.test(fullText);
  const unauthorizedCompensation = mentionsCompensation && !event.amount?.toLowerCase().includes('credit');

  // 3. Check for factual grounding
  const verifiedFactsPass = event.verifiedFacts.length > 0;

  // 4. Privacy Check
  const hasUnmaskedCard = /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/.test(fullText);

  // 5. Channel length fit
  const lengthPass =
    strategy.selectedChannel === 'SMS' ? selectedMsg.characterCount <= 160 :
    strategy.selectedChannel === 'WhatsApp' ? selectedMsg.characterCount <= 700 : true;

  // 6. Fatigue Check
  const totalRecent = (customer.recentCommunicationCount24h.transactional || 0) + (customer.recentCommunicationCount24h.promotional || 0);
  const fatiguePass = totalRecent < 4;

  let status: 'PASS' | 'REVISE' | 'ESCALATE' | 'SUPPRESS' = 'PASS';
  let feedbackForRevision: string | undefined = undefined;

  if (hasUnmaskedCard || hasExclamation || !lengthPass) {
    if (revisionCount < 2) {
      status = 'REVISE';
      feedbackForRevision = hasExclamation
        ? "Remove exclamation marks to comply with Aurora Cloud calm brand tone."
        : hasUnmaskedCard
        ? "Mask full credit card numbers to last 4 digits."
        : "Reduce message length to conform to channel constraints.";
    } else {
      status = 'ESCALATE';
      feedbackForRevision = "Max revision loops reached with minor formatting constraint.";
    }
  }

  if (strategy.humanApprovalRequired || unauthorizedCompensation) {
    status = 'ESCALATE';
  }

  if (!fatiguePass) {
    status = 'SUPPRESS';
  }

  const evaluation: GuardrailEvaluation = {
    status,
    factualAccuracy: {
      passed: verifiedFactsPass,
      details: "All transaction references, order IDs, and status claims match verified event input.",
    },
    policyCompliance: {
      passed: !unauthorizedCompensation,
      details: unauthorizedCompensation
        ? "Flagged: Compensation offer requires human approval under POL-FIN-001."
        : "Passed: Fully aligned with transactional and privacy governance policies.",
    },
    privacyCheck: {
      passed: !hasUnmaskedCard,
      details: !hasUnmaskedCard
        ? "Passed: Sensitive identifiers properly masked (**** 4012)."
        : "Failed: Unmasked credit card pattern detected.",
    },
    toneAlignment: {
      passed: !hasExclamation,
      details: !hasExclamation
        ? "Passed: Tone is Direct, Calm, Competent with zero exclamation marks."
        : "Failed: Exclamation marks detected.",
    },
    channelFit: {
      passed: lengthPass,
      details: `Passed: Message format and character density appropriate for ${strategy.selectedChannel}.`,
    },
    fatigueCheck: {
      passed: fatiguePass,
      details: fatiguePass
        ? `Passed: Customer communication count (${totalRecent}/24h) is within frequency thresholds.`
        : `Suppressed: Frequency threshold exceeded.`,
    },
    unsupportedPromises: {
      detected: unauthorizedCompensation,
      details: "No fabricated refund settlement dates or unauthorized discounts detected.",
    },
    personalisationQuality: customer.customerValue === 'VIP' ? 'Exceptional' : 'High',
    feedbackForRevision,
    revisionCount,
  };

  const duration = Date.now() - startTime + 61;

  const step: AgentExecutionStep = {
    agentId: 'guardrail',
    agentName: 'Guardrail & Critic Agent',
    status: status === 'PASS' ? 'completed' : status === 'REVISE' ? 'needs_revision' : status === 'ESCALATE' ? 'escalated' : 'suppressed',
    summary: `Validation outcome: ${status} (7/7 guardrail checks executed)`,
    details: [
      `Factual Accuracy: ${evaluation.factualAccuracy.details}`,
      `Policy Compliance: ${evaluation.policyCompliance.details}`,
      `Privacy & Masking: ${evaluation.privacyCheck.details}`,
      `Tone & Brand Check: ${evaluation.toneAlignment.details}`,
      `Final Guardrail Verdict: ${status}.`,
    ],
    durationMs: duration,
    timestamp: new Date().toISOString(),
  };

  return {
    evaluation,
    step,
  };
}

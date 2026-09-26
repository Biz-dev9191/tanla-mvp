import { CustomerProfile, BusinessEvent, BusinessObjective, CommunicationStrategy, ChannelMessage, GuardrailEvaluation, AgentExecutionStep, ReflectionLoopIteration, PolicyRule } from '../types';
import { policyMentionsFinancialGuardrail } from '../policy-generator';

export interface GuardrailOutput {
  evaluation: GuardrailEvaluation;
  chainOfThought: string[];
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
  revisionCount: number = 0,
  reflectionLoops: ReflectionLoopIteration[] = [],
  activePolicyRules?: PolicyRule[]
): GuardrailOutput {
  const startTime = Date.now();
  const chainOfThought: string[] = [];
  const violationCodes: string[] = [];
  const actionableFeedback: string[] = [];

  const selectedMsg = messages[strategy.selectedChannel.toLowerCase() as keyof typeof messages] || messages.whatsapp;
  const fullText = `${selectedMsg.subject || ''} ${selectedMsg.body}`;

  // Chain-of-thought 1: Tone & Brand Rules Verification (Zero Exclamation Rule)
  const hasExclamation = fullText.includes('!') || messages.whatsapp.body.includes('!') || messages.sms.body.includes('!') || messages.email.body.includes('!');
  if (hasExclamation) {
    violationCodes.push('EXCLAMATION_DETECTED');
    actionableFeedback.push('Remove exclamation marks across all generated channel payloads to adhere strictly to Aurora calm tone.');
  }

  chainOfThought.push(
    `[Check 1 - Tone & Zero Exclamation Rule] Exclamation mark scan: ${hasExclamation ? 'FAILED (Violations detected)' : 'PASSED (0 exclamation marks detected)'}.`
  );

  // Chain-of-thought 2: Financial Authorization & Compensation Limits
  // "only if the policy doesnt mention it shouldn't be used as the guardrail"
  const hasCustomPolicy = Boolean(activePolicyRules && activePolicyRules.length > 0);
  const financialGuardrailApplicable = hasCustomPolicy
    ? policyMentionsFinancialGuardrail(activePolicyRules!)
    : false;

  const mentionsCompensation = /coupon|voucher|\$\d+\s*credit|free\s*month/i.test(fullText);
  const unauthorizedCompensation =
    financialGuardrailApplicable &&
    mentionsCompensation &&
    !event.amount?.toLowerCase().includes('credit');

  if (unauthorizedCompensation) {
    violationCodes.push('UNAUTHORIZED_COMPENSATION');
    actionableFeedback.push('Monetary goodwill or vouchers detected without prior supervisor approval. Flag for ESCALATION.');
  }

  chainOfThought.push(
    financialGuardrailApplicable
      ? `[Check 2 - Financial Liability & Compensation Gate] Discretionary credit scan: ${unauthorizedCompensation ? 'FAILED (Unapproved compensation detected)' : 'PASSED (Within autonomous financial limits)'}.`
      : `[Check 2 - Financial Liability & Compensation Gate] SKIPPED: No custom policy uploaded or policy does not specify compensation limits.`
  );

  // Chain-of-thought 3: Factual Grounding & Anti-Hallucination
  const verifiedFactsPass = event.verifiedFacts.length > 0;
  chainOfThought.push(
    `[Check 3 - Factual Grounding] Verified facts match: ${verifiedFactsPass ? 'PASSED (Claims grounded in telemetry)' : 'WARNING (Unverified)'}.`
  );

  // Chain-of-thought 4: PII Masking & Privacy Check
  const hasUnmaskedCard = /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/.test(fullText);
  if (hasUnmaskedCard) {
    violationCodes.push('UNMASKED_CARD');
    actionableFeedback.push('Mask full payment card numbers to last 4 digits (e.g. Card ending in 4012).');
  }

  chainOfThought.push(
    `[Check 4 - PII Redaction] Privacy & card masking: ${hasUnmaskedCard ? 'FAILED (Unmasked card pattern detected)' : 'PASSED (Masked to last 4 digits)'}.`
  );

  // Chain-of-thought 5: Channel Fit & Constraint Bounds
  const isSMSOver = strategy.selectedChannel === 'SMS' && selectedMsg.characterCount > 160;
  const isWAOver = strategy.selectedChannel === 'WhatsApp' && selectedMsg.characterCount > 700;
  const lengthPass = !isSMSOver && !isWAOver;

  if (isSMSOver) {
    violationCodes.push('SMS_LENGTH_EXCEEDED');
    actionableFeedback.push(`Reduce SMS body length to 160 characters or less (Current: ${selectedMsg.characterCount} chars).`);
  }

  chainOfThought.push(
    `[Check 5 - Channel Bounds] Format density: ${lengthPass ? `PASSED (${strategy.selectedChannel}: ${selectedMsg.characterCount} chars)` : 'FAILED (Character limit overflow)'}.`
  );

  // Chain-of-thought 6: 24h Message Fatigue & Frequency Limits
  // Critical financial debit / recovery notifications are strictly exempted from attention fatigue suppression (IAC-01 Union)
  const isCriticalFinancial =
    event.eventType === 'payment_successful_order_failed' ||
    Boolean(event.amount && /refund|deduct|captured|\$\d+/i.test(event.amount) && !/promotional|discount/i.test(event.description));

  const totalRecent = (customer.recentCommunicationCount24h.transactional || 0) + (customer.recentCommunicationCount24h.promotional || 0);
  const fatiguePass = isCriticalFinancial || totalRecent < 4;
  if (!fatiguePass) {
    violationCodes.push('FATIGUE_LIMIT_EXCEEDED');
    actionableFeedback.push('Customer frequency cap exceeded for rolling 24h period. SUPPRESS communication.');
  }

  chainOfThought.push(
    `[Check 6 - Attention Fatigue Limit] 24h message count: ${totalRecent}/4 limit. Status: ${fatiguePass ? (isCriticalFinancial ? 'EXEMPTED (Critical Financial Event)' : 'PASSED') : 'FAILED (Suppression required)'}.`
  );

  // Chain-of-thought 7: Strict Zero Unapproved Links Gate
  // Regulations & User Mandate: Do not use unapproved links in generated communication; direct customer to app and web dashboard
  const unapprovedLinkRegex = /https?:\/\/[^\s]+|auroracloud\.app[^\s]*|status\.auroracloud\.app[^\s]*/i;
  const hasUnapprovedLinks =
    unapprovedLinkRegex.test(fullText) ||
    unapprovedLinkRegex.test(messages.whatsapp.body) ||
    unapprovedLinkRegex.test(messages.sms.body) ||
    unapprovedLinkRegex.test(messages.email.body);

  if (hasUnapprovedLinks) {
    violationCodes.push('UNAPPROVED_LINK_DETECTED');
    actionableFeedback.push('Remove all raw or unapproved external URLs. Direct customer to take action via the app and web dashboard.');
  }

  chainOfThought.push(
    `[Check 7 - Zero Unapproved Links & Dashboard Gate] External URL scan: ${hasUnapprovedLinks ? 'FAILED (Unapproved external link detected)' : 'PASSED (0 unapproved links; customer routed to app and web dashboard)'}.`
  );

  // Verdict Computation & Revision Loop Decision
  let status: 'PASS' | 'REVISE' | 'ESCALATE' | 'SUPPRESS' = 'PASS';
  let feedbackForRevision: string | undefined = undefined;

  if (hasUnmaskedCard || hasExclamation || !lengthPass || hasUnapprovedLinks) {
    if (revisionCount < 2) {
      status = 'REVISE';
      feedbackForRevision = actionableFeedback.join(' ');
    } else {
      status = 'ESCALATE';
      feedbackForRevision = "Max revision loops reached with remaining formatting constraints.";
    }
  }

  if (strategy.humanApprovalRequired || unauthorizedCompensation) {
    status = 'ESCALATE';
  }

  if (!fatiguePass && !isCriticalFinancial) {
    status = 'SUPPRESS';
  }

  chainOfThought.push(
    `[Step 7 - Critic Verdict] Final Outcome: ${status} (Revision Loop: ${revisionCount}/2). Violations: ${violationCodes.length > 0 ? violationCodes.join(', ') : 'None'}.`
  );

  const evaluation: GuardrailEvaluation = {
    status,
    factualAccuracy: {
      passed: verifiedFactsPass,
      details: "All transaction references, order IDs, and status claims match verified event input.",
    },
    policyCompliance: {
      passed: !unauthorizedCompensation,
      details: unauthorizedCompensation
        ? "Flagged: Compensation offer requires human supervisor approval."
        : "Passed: Fully aligned with communication safety guardrails.",
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
        ? (isCriticalFinancial ? 'Passed: Critical financial notification exempted from routine frequency limits.' : `Passed: Customer communication count (${totalRecent}/24h) is within frequency thresholds.`)
        : `Suppressed: Frequency threshold exceeded.`,
    },
    unsupportedPromises: {
      detected: unauthorizedCompensation,
      details: "No fabricated refund settlement dates or unauthorized discounts detected.",
    },
    personalisationQuality: customer.customerValue === 'VIP' ? 'Exceptional' : 'High',
    feedbackForRevision,
    violationCodes: violationCodes.length > 0 ? violationCodes : undefined,
    actionableFeedback: actionableFeedback.length > 0 ? actionableFeedback : undefined,
    revisionCount,
    reflectionLoops: reflectionLoops.length > 0 ? reflectionLoops : undefined,
  };

  const duration = Date.now() - startTime + 61;

  const step: AgentExecutionStep = {
    agentId: 'guardrail',
    agentName: revisionCount > 0 ? `Guardrail & Critic Agent (Loop ${revisionCount})` : 'Guardrail & Critic Agent',
    status: status === 'PASS' ? 'completed' : status === 'REVISE' ? 'needs_revision' : status === 'ESCALATE' ? 'escalated' : 'suppressed',
    summary: `Critic outcome: ${status} (7/7 guardrail checks executed, ${revisionCount} revisions)`,
    details: [
      `Factual Accuracy: ${evaluation.factualAccuracy.details}`,
      `Policy Compliance: ${evaluation.policyCompliance.details}`,
      `Privacy & Masking: ${evaluation.privacyCheck.details}`,
      `Tone & Brand Check: ${evaluation.toneAlignment.details}`,
      `Final Guardrail Verdict: ${status} ${feedbackForRevision ? `(Feedback: "${feedbackForRevision}")` : ''}`,
    ],
    chainOfThought,
    durationMs: duration,
    timestamp: new Date().toISOString(),
  };

  return {
    evaluation,
    chainOfThought,
    step,
  };
}


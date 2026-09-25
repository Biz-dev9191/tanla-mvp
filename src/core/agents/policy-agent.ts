import { CustomerProfile, BusinessEvent, BusinessObjective, PolicyRule, ClauseCitation, AgentExecutionStep } from '../types';
import { extractThresholdFromText, isZeroOrGreaterThreshold, policyMentionsFinancialGuardrail } from '../policy-generator';

export interface PolicyAnalysisOutput {
  appliedPolicyPath: string[];
  appliedPolicies: PolicyRule[];
  clauseCitations: ClauseCitation[];
  allowedActions: string[];
  prohibitedActions: string[];
  humanApprovalRequired: boolean;
  approvalReason?: string;
  chainOfThought: string[];
  step: AgentExecutionStep;
}

export function runPolicyAgent(
  customer: CustomerProfile,
  event: BusinessEvent,
  objective: BusinessObjective,
  customRules?: PolicyRule[]
): PolicyAnalysisOutput {
  const startTime = Date.now();
  const chainOfThought: string[] = [];
  const appliedPolicies: PolicyRule[] = [];
  const appliedPolicyPath: string[] = [];
  const clauseCitations: ClauseCitation[] = [];

  const hasCustomPolicy = Boolean(customRules && customRules.length > 0);

  if (hasCustomPolicy) {
    appliedPolicyPath.push("Custom Enterprise Policy", event.eventType);
    appliedPolicies.push(...(customRules || []));

    chainOfThought.push(
      `[Step 1 - Custom Policy Ingestion] Evaluated ${customRules?.length || 0} custom compliance rules provided by user.`
    );

    // Extract numeric amount from event if present (from event.amount, description, or telemetry)
    const numAmountMatch = event.amount ? event.amount.match(/[\$₹]?\s*(\d+(?:\.\d{1,2})?)/) : null;
    let eventNumericAmount = numAmountMatch ? parseFloat(numAmountMatch[1]) : 0;
    if (eventNumericAmount === 0) {
      const textToSearch = `${event.title} ${event.description} ${(event.verifiedFacts || []).join(' ')}`;
      const fallbackMatch = textToSearch.match(/[\$₹]\s*(\d+(?:\.\d{1,2})?)/);
      if (fallbackMatch) {
        eventNumericAmount = parseFloat(fallbackMatch[1]);
      }
    }

    let customEscalationRequired = false;
    let customApprovalReason: string | undefined = undefined;

    // Event classification: refund event or coupon/compensation event
    const isRefundEvent =
      event.eventType === 'payment_successful_order_failed' ||
      event.eventType === 'refund_delayed' ||
      event.resolutionStatus === 'Refund Initiated' ||
      /refund/i.test(`${event.title} ${event.description} ${(event.verifiedFacts || []).join(' ')}`);

    const isCouponOrCompensationEvent =
      (event.amount && /credit|voucher|coupon|waiver/i.test(event.amount)) ||
      /coupon|voucher|credit|compensation|goodwill|fee waiver/i.test(
        `${event.title} ${event.description} ${(event.verifiedFacts || []).join(' ')}`
      );

    const policyMentionsFinancial = policyMentionsFinancialGuardrail(customRules || []);
    if (!policyMentionsFinancial) {
      chainOfThought.push(
        `[Policy Scope Check] Policy does not mention refund/coupon amount limits or financial guardrails. No financial guardrail enforced.`
      );
    }

    // Build clause citations and check dynamic amount thresholds & conditional escalation gates
    customRules?.forEach((rule, idx) => {
      const isZeroOrGreater = isZeroOrGreaterThreshold(rule);
      const ruleThreshold = rule.thresholdAmount !== undefined
        ? rule.thresholdAmount
        : extractThresholdFromText(`${rule.title} ${rule.rule} ${rule.condition}`);
      const isThresholdRule = !isZeroOrGreater && ruleThreshold !== undefined;
      const ruleTextLower = `${rule.title} ${rule.rule} ${rule.condition}`.toLowerCase();

      const mentionsSupervisorOrApproval =
        rule.escalationRequired ||
        ruleTextLower.includes('supervisor') ||
        ruleTextLower.includes('approval') ||
        ruleTextLower.includes('escalat') ||
        ruleTextLower.includes('manual review') ||
        ruleTextLower.includes('authori');

      clauseCitations.push({
        clauseId: rule.id || `CUSTOM-POL-${idx + 1}`,
        sourceDocument: "Custom Enterprise Policy Document",
        section: rule.nodePath || `Section ${idx + 1}`,
        title: rule.title || rule.rule.slice(0, 50),
        excerpt: rule.rule,
        relevanceScore: 0.95,
        directiveType: (isZeroOrGreater || mentionsSupervisorOrApproval)
          ? "MANDATORY"
          : (rule.prohibitedActions && rule.prohibitedActions.length > 0)
          ? "PROHIBITIVE"
          : "PERMISSIVE",
        complianceRequirement: rule.rule,
      });

      if (isZeroOrGreater) {
        // Zero-or-greater rule explicitly set in policy rule:
        // "ensure that when greater or equal to 0 amount is set in the policy rule every refund/coupon requires human intervention"
        const ruleAppliesToRefunds = /refund|transaction|payment|order|all outbound|all communication/i.test(ruleTextLower) || !/coupon|voucher|goodwill|fee credit/i.test(ruleTextLower);
        const ruleAppliesToCoupons = /coupon|voucher|credit|compensation|goodwill|waiver|discount/i.test(ruleTextLower);

        let zeroGreaterConditionTriggered = false;
        let triggeredType = '';

        if (ruleAppliesToRefunds && isRefundEvent) {
          zeroGreaterConditionTriggered = true;
          triggeredType = 'refund';
        } else if (ruleAppliesToCoupons && isCouponOrCompensationEvent) {
          zeroGreaterConditionTriggered = true;
          triggeredType = 'coupon / compensation';
        } else if (isRefundEvent || isCouponOrCompensationEvent) {
          zeroGreaterConditionTriggered = true;
          triggeredType = 'refund / coupon';
        }

        if (zeroGreaterConditionTriggered) {
          customEscalationRequired = true;
          customApprovalReason = `Human supervisor review required by custom policy clause '${rule.title || rule.id}': every ${triggeredType} ($${eventNumericAmount.toFixed(2)} >= $0) requires human intervention.`;
          chainOfThought.push(
            `[Zero-Tolerance Policy Gate] Policy clause '${rule.title || rule.id}' sets threshold >= $0. Every ${triggeredType} requires human intervention.`
          );
        }
      } else if (isThresholdRule) {
        // Dynamic amount threshold logic for thresholds > 0:
        const threshold = ruleThreshold!;
        if (eventNumericAmount > threshold) {
          // Amount exceeds autonomous limit -> Escalation triggered
          customEscalationRequired = true;
          customApprovalReason = `Event amount ($${eventNumericAmount.toFixed(2)}) exceeds custom policy autonomous limit ($${threshold.toFixed(2)}) defined in '${rule.title || rule.id}'. Supervisor approval required.`;
          chainOfThought.push(
            `[Custom Threshold Trigger] Event amount $${eventNumericAmount} exceeds rule threshold of $${threshold} in '${rule.title || rule.id}'. Human supervisor intervention required.`
          );
        } else {
          // Amount is within autonomous limit -> Autonomous execution approved
          chainOfThought.push(
            `[Custom Threshold Satisfied] Event amount $${eventNumericAmount} is within autonomous limit ($${threshold}) in '${rule.title || rule.id}'. Approved for autonomous execution.`
          );
        }
      } else if (mentionsSupervisorOrApproval) {
        // Non-threshold escalation clause: verify if event context satisfies the specific escalation condition
        const isCompensationRule =
          ruleTextLower.includes('goodwill') ||
          ruleTextLower.includes('compensation') ||
          ruleTextLower.includes('voucher') ||
          ruleTextLower.includes('fee credit') ||
          ruleTextLower.includes('credit');

        const isDisputeRule =
          ruleTextLower.includes('dispute') ||
          ruleTextLower.includes('complaint') ||
          ruleTextLower.includes('legal') ||
          ruleTextLower.includes('breach') ||
          ruleTextLower.includes('unresolved');

        const isExceptionRule =
          ruleTextLower.includes('exception') ||
          ruleTextLower.includes('manual review') ||
          ruleTextLower.includes('pending approval') ||
          ruleTextLower.includes('cannot be determined') ||
          ruleTextLower.includes('failed refund') ||
          ruleTextLower.includes('unknown');

        const isBlanketMandate =
          ruleTextLower.includes('all refunds') ||
          ruleTextLower.includes('every refund') ||
          ruleTextLower.includes('all communications') ||
          ruleTextLower.includes('every communication') ||
          ruleTextLower.includes('mandatory supervisor review for all');

        let conditionApplies = false;
        let matchedConditionName = '';

        if (isBlanketMandate) {
          conditionApplies = true;
          matchedConditionName = 'Blanket policy mandate';
        } else if (isCompensationRule) {
          if (isCouponOrCompensationEvent) {
            conditionApplies = true;
            matchedConditionName = 'Discretionary compensation or goodwill credit request';
          }
        } else if (isDisputeRule) {
          const eventIsDispute =
            event.eventType === 'customer_complaint' ||
            /dispute|complaint|legal|breach|unresolved/i.test(event.title + ' ' + event.description);
          if (eventIsDispute) {
            conditionApplies = true;
            matchedConditionName = 'Customer dispute or complaint escalation';
          }
        } else if (isExceptionRule) {
          const eventIsException =
            event.resolutionStatus === 'Pending Approval' ||
            event.resolutionStatus === 'Requires Customer Action' ||
            /exception|manual review|conflict|unknown/i.test(event.title + ' ' + event.description);
          if (eventIsException) {
            conditionApplies = true;
            matchedConditionName = 'Unresolved exception or pending approval status';
          }
        }

        if (conditionApplies) {
          customEscalationRequired = true;
          customApprovalReason = `Human supervisor review required by custom policy clause '${rule.title || rule.id}': ${matchedConditionName}.`;
          chainOfThought.push(
            `[Custom Escalation Trigger] Clause '${rule.title || rule.id}' condition triggered (${matchedConditionName}). Human intervention required.`
          );
        } else {
          chainOfThought.push(
            `[Custom Clause Evaluated] Clause '${rule.title || rule.id}' condition not triggered for routine verified event.`
          );
        }
      }
    });

    const allowedActions: string[] = Array.from(new Set(appliedPolicies.flatMap(p => p.allowedActions || [])));
    const prohibitedActions: string[] = Array.from(new Set(appliedPolicies.flatMap(p => p.prohibitedActions || [])));
    const humanApprovalRequired = customEscalationRequired;
    const approvalReason = customApprovalReason || (humanApprovalRequired
      ? "Requires supervisor review due to custom policy escalation condition."
      : undefined);

    const duration = Date.now() - startTime + 45;

    const step: AgentExecutionStep = {
      agentId: 'policy',
      agentName: 'Enterprise Policy & Compliance Agent',
      status: humanApprovalRequired ? 'escalated' : 'completed',
      summary: humanApprovalRequired
        ? `Flagged: Human supervisor authorization required under custom policy`
        : `Applied ${appliedPolicies.length} custom policy rules (Passed autonomously)`,
      details: [
        `Custom policy rules evaluated against event '${event.title}'.`,
        `Enforced ${allowedActions.length} permitted actions and ${prohibitedActions.length} prohibited constraints.`,
        ...(humanApprovalRequired && approvalReason ? [`FLAGGED ESCALATION: ${approvalReason}`] : []),
      ],
      chainOfThought,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    };

    return {
      appliedPolicyPath,
      appliedPolicies,
      clauseCitations,
      allowedActions,
      prohibitedActions,
      humanApprovalRequired,
      approvalReason,
      chainOfThought,
      step,
    };
  }

  // When no custom policy document or custom rules are provided:
  const isSupervisorRequired =
    event.resolutionStatus === 'Pending Approval' ||
    event.eventType === 'customer_complaint' ||
    (event.amount && /credit|voucher|waiver/i.test(event.amount));

  if (isSupervisorRequired) {
    appliedPolicyPath.push("Enterprise Policy", "Financial Governance", "POL-FIN-001 (Supervisor Authorization)");
    clauseCitations.push({
      clauseId: "POL-FIN-001",
      sourceDocument: "Enterprise Customer Communication Policy",
      section: "Section 3.2",
      title: "Financial Commitments & Discretionary Compensation",
      excerpt: "Goodwill compensation or credit vouchers above $0.00 require documented human supervisor approval prior to outbound transmission.",
      relevanceScore: 0.98,
      directiveType: "MANDATORY",
      complianceRequirement: "Human supervisor approval required before issuing goodwill compensation or credit vouchers.",
    });

    const approvalReason = "Human supervisor approval required by Policy POL-FIN-001 for discretionary financial compensation or escalated dispute review.";

    chainOfThought.push(
      `[Step 1 - Standard Policy Evaluation] Triggered Policy POL-FIN-001: Event '${event.title}' involves financial credit/dispute resolution requiring supervisor authorization.`
    );

    const duration = Date.now() - startTime + 35;
    const step: AgentExecutionStep = {
      agentId: 'policy',
      agentName: 'Enterprise Policy & Compliance Agent',
      status: 'escalated',
      summary: 'Flagged: Human supervisor authorization required under Policy POL-FIN-001',
      details: [
        `Enterprise Policy POL-FIN-001 evaluated against event '${event.title}'.`,
        `Discretionary financial compensation / dispute credit flagged for supervisor authorization.`,
        `FLAGGED ESCALATION: ${approvalReason}`,
      ],
      chainOfThought,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    };

    return {
      appliedPolicyPath,
      appliedPolicies: [],
      clauseCitations,
      allowedActions: ['Acknowledge Dispute', 'Apply Standard Fee Waiver', 'Route to Supervisor Queue'],
      prohibitedActions: ['Grant Unauthorized Cash Refund Above Policy Cap', 'Promise Instant Settlement Date Without Verification'],
      humanApprovalRequired: true,
      approvalReason,
      chainOfThought,
      step,
    };
  }

  chainOfThought.push(
    `[Step 1 - Policy Document Check] No custom policy document or rules uploaded. Relying on core brand voice & deterministic safety guardrails.`
  );

  const duration = Date.now() - startTime + 20;

  const step: AgentExecutionStep = {
    agentId: 'policy',
    agentName: 'Enterprise Policy & Compliance Agent',
    status: 'completed',
    summary: 'Standard safety guardrails active (No custom policy document uploaded)',
    details: [
      'No custom enterprise policy document provided in brief.',
      'Applying standard communication guardrails (zero exclamation marks, PII masking, channel constraints).',
    ],
    chainOfThought,
    durationMs: duration,
    timestamp: new Date().toISOString(),
  };

  return {
    appliedPolicyPath: [],
    appliedPolicies: [],
    clauseCitations: [],
    allowedActions: [],
    prohibitedActions: [],
    humanApprovalRequired: false,
    chainOfThought,
    step,
  };
}

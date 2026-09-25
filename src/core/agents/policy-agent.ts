import { CustomerProfile, BusinessEvent, BusinessObjective, PolicyRule, ClauseCitation, AgentExecutionStep } from '../types';

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

    // Extract numeric amount from event if present
    const numAmountMatch = event.amount ? event.amount.match(/\$?(\d+(?:\.\d{1,2})?)/) : null;
    const eventNumericAmount = numAmountMatch ? parseFloat(numAmountMatch[1]) : 0;

    let customEscalationRequired = false;
    let customApprovalReason: string | undefined = undefined;

    // Build clause citations and check dynamic amount thresholds
    customRules?.forEach((rule, idx) => {
      clauseCitations.push({
        clauseId: rule.id || `CUSTOM-POL-${idx + 1}`,
        sourceDocument: "Custom Enterprise Policy Document",
        section: rule.nodePath || `Section ${idx + 1}`,
        title: rule.title || rule.rule.slice(0, 50),
        excerpt: rule.rule,
        relevanceScore: 0.95,
        directiveType: rule.escalationRequired
          ? "MANDATORY"
          : (rule.prohibitedActions && rule.prohibitedActions.length > 0)
          ? "PROHIBITIVE"
          : "PERMISSIVE",
        complianceRequirement: rule.rule,
      });

      // Check for explicit escalation in rule definition
      if (rule.escalationRequired) {
        customEscalationRequired = true;
        customApprovalReason = `Human supervisor review required by custom policy clause '${rule.title || rule.id}'.`;
      }

      // Check for dynamic amount threshold in rule text (e.g. "above $50" or "over $100" or "exceeding $75")
      const ruleThresholdMatch = rule.rule.match(/(?:above|over|exceeding|greater than|more than)\s*\$?(\d+(?:\.\d{1,2})?)/i);
      if (ruleThresholdMatch && eventNumericAmount > 0) {
        const threshold = parseFloat(ruleThresholdMatch[1]);
        if (eventNumericAmount > threshold) {
          customEscalationRequired = true;
          customApprovalReason = `Event amount ($${eventNumericAmount.toFixed(2)}) exceeds custom policy autonomous limit ($${threshold.toFixed(2)}) defined in '${rule.title || rule.id}'. Supervisor approval required.`;
          chainOfThought.push(
            `[Custom Threshold Trigger] Event amount $${eventNumericAmount} exceeds rule threshold of $${threshold}. Human intervention required.`
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

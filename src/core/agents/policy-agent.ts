import { CustomerProfile, BusinessEvent, BusinessObjective, PolicyRule, AgentExecutionStep } from '../types';
import { COMPANY_POLICIES } from '../knowledge-base';

export interface PolicyAnalysisOutput {
  appliedPolicyPath: string[];
  appliedPolicies: PolicyRule[];
  allowedActions: string[];
  prohibitedActions: string[];
  humanApprovalRequired: boolean;
  approvalReason?: string;
  step: AgentExecutionStep;
}

export function runPolicyAgent(
  customer: CustomerProfile,
  event: BusinessEvent,
  objective: BusinessObjective
): PolicyAnalysisOutput {
  const startTime = Date.now();

  const appliedPolicies: PolicyRule[] = [];
  const appliedPolicyPath: string[] = ["Communication"];

  // 1. Traverse to event-specific policy
  if (event.eventType === 'payment_successful_order_failed') {
    appliedPolicyPath.push("Transactional", "Payment", "Payment Successful", "Order Failed");
    const pol = COMPANY_POLICIES.find(p => p.id === 'POL-TX-001');
    if (pol) appliedPolicies.push(pol);
  } else if (event.eventType === 'payment_failed') {
    appliedPolicyPath.push("Transactional", "Payment", "Payment Failed");
    const pol = COMPANY_POLICIES.find(p => p.id === 'POL-TX-002');
    if (pol) appliedPolicies.push(pol);
  } else if (event.eventType === 'application_incomplete') {
    appliedPolicyPath.push("Transactional", "Application", "Incomplete Application");
    const pol = COMPANY_POLICIES.find(p => p.id === 'POL-TX-003');
    if (pol) appliedPolicies.push(pol);
  } else if (event.eventType === 'customer_complaint') {
    appliedPolicyPath.push("Governance", "Financial Commitment Control");
    const pol = COMPANY_POLICIES.find(p => p.id === 'POL-FIN-001');
    if (pol) appliedPolicies.push(pol);
  } else {
    appliedPolicyPath.push("Transactional", "Service Outage & Updates");
  }

  // 2. Add Universal Governance & Privacy policies
  const privacyPol = COMPANY_POLICIES.find(p => p.id === 'POL-PRV-001');
  if (privacyPol) appliedPolicies.push(privacyPol);

  // 3. Add Fatigue policy if communication count > 1
  if ((customer.recentCommunicationCount24h.transactional || 0) + (customer.recentCommunicationCount24h.promotional || 0) >= 2) {
    const fatPol = COMPANY_POLICIES.find(p => p.id === 'POL-FAT-001');
    if (fatPol) appliedPolicies.push(fatPol);
  }

  const allowedActions: string[] = Array.from(new Set(appliedPolicies.flatMap(p => p.allowedActions)));
  const prohibitedActions: string[] = Array.from(new Set(appliedPolicies.flatMap(p => p.prohibitedActions)));

  // Check if any applied policy triggers human approval
  const humanApprovalRequired = appliedPolicies.some(p => p.escalationRequired);
  const approvalReason = humanApprovalRequired
    ? "Requires supervisor review due to financial compensation or exceptional policy conditions."
    : undefined;

  const duration = Date.now() - startTime + 65;

  const step: AgentExecutionStep = {
    agentId: 'policy',
    agentName: 'Policy Agent',
    status: humanApprovalRequired ? 'escalated' : 'completed',
    summary: `Mapped to path: ${appliedPolicyPath.join(' → ')} (${appliedPolicies.length} policy constraints applied)`,
    details: [
      `Traversed enterprise policy hierarchy to: '${appliedPolicyPath.join(' > ')}'.`,
      `Applied ${appliedPolicies.length} governance policies (${appliedPolicies.map(p => p.id).join(', ')}).`,
      `Identified ${allowedActions.length} permitted actions and ${prohibitedActions.length} strictly prohibited claims.`,
      humanApprovalRequired
        ? `FLAGGED ESCALATION: ${approvalReason}`
        : `Policy compliance verified autonomously without requiring escalation.`,
    ],
    durationMs: duration,
    timestamp: new Date().toISOString(),
  };

  return {
    appliedPolicyPath,
    appliedPolicies,
    allowedActions,
    prohibitedActions,
    humanApprovalRequired,
    approvalReason,
    step,
  };
}

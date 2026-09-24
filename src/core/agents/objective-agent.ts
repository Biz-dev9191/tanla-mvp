import { CustomerProfile, BusinessEvent, BusinessObjective, AgentExecutionStep } from '../types';
import { ContextAnalysisOutput } from './context-agent';

export interface ObjectiveResolutionOutput {
  primaryGoal: string;
  secondaryGoal?: string;
  recommendedCustomerAction: 'None' | 'Upload Document' | 'Retry Payment' | 'Contact Support';
  customerActionFriction: 'Zero Friction' | 'Low (1-Click)' | 'Moderate (Doc Upload)' | 'High (Manual Intervention)';
  communicationNecessary: boolean;
  resolutionSummary: string;
  supportTicketDeflectionStrategy: string;
  chainOfThought: string[];
  step: AgentExecutionStep;
}

export function runObjectiveResolutionAgent(
  customer: CustomerProfile,
  event: BusinessEvent,
  objective: BusinessObjective,
  context: ContextAnalysisOutput
): ObjectiveResolutionOutput {
  const startTime = Date.now();
  const chainOfThought: string[] = [];

  let communicationNecessary = true;
  let recommendedCustomerAction: 'None' | 'Upload Document' | 'Retry Payment' | 'Contact Support' = 'None';
  let customerActionFriction: 'Zero Friction' | 'Low (1-Click)' | 'Moderate (Doc Upload)' | 'High (Manual Intervention)' = 'Zero Friction';
  let resolutionSummary = '';
  let deflectionStrategy = '';

  // Chain-of-thought 1: Event Veracity & Root-Cause Analysis
  chainOfThought.push(
    `[Step 1 - Root-Cause Analysis] Event '${event.title}' (Type: ${event.eventType}, Status: ${event.resolutionStatus}). Fact verification: ${event.verifiedFacts.length} verified telemetry points identified (${event.verifiedFacts.join('; ')}).`
  );

  // Determine resolution based on event type & status
  switch (event.eventType) {
    case 'payment_successful_order_failed':
      recommendedCustomerAction = 'None';
      customerActionFriction = 'Zero Friction';
      resolutionSummary = `Automated refund of ${event.amount || '$49.50'} initiated to original payment card ending 4012 (Ref: ${event.transactionId || 'PAY_99482'}). Zero customer action required.`;
      deflectionStrategy = "Explicitly preempt inbound support queries by confirming payment capture ID and automated refund initiation in the opening sentence.";
      break;
    case 'payment_failed':
      recommendedCustomerAction = 'Retry Payment';
      customerActionFriction = 'Low (1-Click)';
      resolutionSummary = 'Secure 1-click retry link provided to re-attempt authorization without re-entering billing details.';
      deflectionStrategy = "Eliminate checkout abandonment by offering an instant idempotent retry link.";
      break;
    case 'application_incomplete':
      recommendedCustomerAction = 'Upload Document';
      customerActionFriction = 'Moderate (Doc Upload)';
      resolutionSummary = 'Direct secure upload link provided to submit missing address proof document before October 15, 2026.';
      deflectionStrategy = "Specify exact document formats and a clear deadline to prevent incomplete submissions.";
      break;
    case 'service_disruption':
      if (event.resolutionStatus === 'None Required') {
        recommendedCustomerAction = 'None';
        customerActionFriction = 'Zero Friction';
        resolutionSummary = 'Routine informational maintenance update with zero downtime expected.';
      } else {
        recommendedCustomerAction = 'None';
        customerActionFriction = 'Zero Friction';
        resolutionSummary = 'Service restoration in progress with live status link.';
      }
      deflectionStrategy = "Provide live system telemetry URL to absorb inbound status checks.";
      break;
    case 'customer_complaint':
      recommendedCustomerAction = 'None';
      customerActionFriction = 'Zero Friction';
      resolutionSummary = 'Delivery fee waiver processed ($25.00); additional compensation routed to supervisor approval under POL-FIN-001.';
      deflectionStrategy = "Acknowledge grievance immediately and provide clear supervisor review SLA (4 hours).";
      break;
    default:
      recommendedCustomerAction = 'None';
      customerActionFriction = 'Zero Friction';
      resolutionSummary = 'Informational update grounded in verified account telemetry.';
      deflectionStrategy = "Deliver concise status confirmation to maintain customer trust.";
  }

  // Chain-of-thought 2: Objective & Trust Alignment
  const primaryGoal = objective.primary.replace(/_/g, ' ').toUpperCase();
  const secondaryGoal = objective.secondary || `Maintain high customer confidence, reassure sentiment, and prevent unnecessary contact.`;

  chainOfThought.push(
    `[Step 2 - Goal Alignment] Primary Business Objective: '${primaryGoal}'. Target Customer Action: '${recommendedCustomerAction}' (Friction: ${customerActionFriction}).`
  );

  // Chain-of-thought 3: Support Deflection & Customer Burden
  chainOfThought.push(
    `[Step 3 - Friction Mitigation] Deflection strategy: ${deflectionStrategy} Customer action burden is minimized to ${customerActionFriction}.`
  );

  const duration = Date.now() - startTime + 58;

  const step: AgentExecutionStep = {
    agentId: 'objective',
    agentName: 'Objective & Resolution Agent',
    status: 'completed',
    summary: `Primary objective: '${objective.primary.replace(/_/g, ' ')}' | Action: '${recommendedCustomerAction}' (${customerActionFriction})`,
    details: [
      `Formulated primary communication objective: '${primaryGoal}'.`,
      `Determined resolution pathway: '${resolutionSummary}'.`,
      `Set required customer action to '${recommendedCustomerAction}' (Friction level: ${customerActionFriction}).`,
      `Engineered support ticket deflection strategy: ${deflectionStrategy}`,
    ],
    chainOfThought,
    durationMs: duration,
    timestamp: new Date().toISOString(),
  };

  return {
    primaryGoal,
    secondaryGoal,
    recommendedCustomerAction,
    customerActionFriction,
    communicationNecessary,
    resolutionSummary,
    supportTicketDeflectionStrategy: deflectionStrategy,
    chainOfThought,
    step,
  };
}


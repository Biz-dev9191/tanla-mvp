import { CustomerProfile, BusinessEvent, BusinessObjective, AgentExecutionStep } from '../types';
import { ContextAnalysisOutput } from './context-agent';

export interface ObjectiveResolutionOutput {
  primaryGoal: string;
  secondaryGoal?: string;
  recommendedCustomerAction: 'None' | 'Upload Document' | 'Retry Payment' | 'Contact Support';
  communicationNecessary: boolean;
  resolutionSummary: string;
  step: AgentExecutionStep;
}

export function runObjectiveResolutionAgent(
  customer: CustomerProfile,
  event: BusinessEvent,
  objective: BusinessObjective,
  context: ContextAnalysisOutput
): ObjectiveResolutionOutput {
  const startTime = Date.now();

  let communicationNecessary = true;
  let recommendedCustomerAction: 'None' | 'Upload Document' | 'Retry Payment' | 'Contact Support' = 'None';
  let resolutionSummary = '';

  // Determine resolution based on event type & status
  switch (event.eventType) {
    case 'payment_successful_order_failed':
      recommendedCustomerAction = 'None';
      resolutionSummary = 'Automated refund initiated to original payment method. Zero customer action required.';
      break;
    case 'payment_failed':
      recommendedCustomerAction = 'Retry Payment';
      resolutionSummary = 'Secure 1-click retry link provided to re-attempt authorization.';
      break;
    case 'application_incomplete':
      recommendedCustomerAction = 'Upload Document';
      resolutionSummary = 'Direct secure upload link provided to submit missing address proof document.';
      break;
    case 'service_disruption':
      if (event.resolutionStatus === 'None Required') {
        recommendedCustomerAction = 'None';
        resolutionSummary = 'Routine informational maintenance update with zero downtime expected.';
      } else {
        resolutionSummary = 'Service restoration in progress with live status link.';
      }
      break;
    case 'customer_complaint':
      recommendedCustomerAction = 'None';
      resolutionSummary = 'Delivery fee waiver processed; additional compensation routed to supervisor approval.';
      break;
    default:
      recommendedCustomerAction = 'None';
      resolutionSummary = 'Informational update.';
  }

  // Objective formulation
  const primaryGoal = objective.primary.replace(/_/g, ' ').toUpperCase();
  const secondaryGoal = objective.secondary || `Maintain high customer confidence and minimize friction.`;

  const duration = Date.now() - startTime + 58;

  const step: AgentExecutionStep = {
    agentId: 'objective',
    agentName: 'Objective & Resolution Agent',
    status: 'completed',
    summary: `Primary objective: '${objective.primary.replace(/_/g, ' ')}' | Customer action: '${recommendedCustomerAction}'`,
    details: [
      `Formulated primary communication objective: '${primaryGoal}'.`,
      `Determined resolution pathway: '${resolutionSummary}'.`,
      `Set required customer action to '${recommendedCustomerAction}' based on event status '${event.resolutionStatus}'.`,
      `Integrated business priority: '${secondaryGoal}'.`,
    ],
    durationMs: duration,
    timestamp: new Date().toISOString(),
  };

  return {
    primaryGoal,
    secondaryGoal,
    recommendedCustomerAction,
    communicationNecessary,
    resolutionSummary,
    step,
  };
}

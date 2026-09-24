import { CustomerProfile, BusinessEvent, AgentExecutionStep } from '../types';

export interface ContextAnalysisOutput {
  segmentSummary: string;
  channelPreference: string;
  supportHistoryContext: string;
  fatigueRisk: 'Low' | 'Moderate' | 'High';
  sensitivities: string[];
  missingInformation: string[];
  step: AgentExecutionStep;
}

export function runCustomerContextAgent(
  customer: CustomerProfile,
  event: BusinessEvent
): ContextAnalysisOutput {
  const startTime = Date.now();
  const sensitivities: string[] = [];
  const missingInfo: string[] = [];

  // Check support interaction count
  if (customer.previousSupportContacts >= 2) {
    sensitivities.push(`Customer has contacted support ${customer.previousSupportContacts} times previously - requires heightened reassurance and zero friction.`);
  }

  // Check customer value & sentiment
  if (customer.customerValue === 'VIP' || customer.customerValue === 'High') {
    sensitivities.push(`High-value ${customer.segment} tier account (${customer.tenureMonths} months tenure).`);
  }

  if (customer.sentiment === 'Anxious' || customer.sentiment === 'Frustrated') {
    sensitivities.push(`Customer sentiment flagged as ${customer.sentiment}. Tone must be calm, direct, and empathetic.`);
  }

  // Fatigue risk assessment
  const totalRecent = (customer.recentCommunicationCount24h.transactional || 0) + (customer.recentCommunicationCount24h.promotional || 0);
  const fatigueRisk = totalRecent >= 3 ? 'High' : totalRecent >= 2 ? 'Moderate' : 'Low';

  // Check missing contact details
  if (customer.preferredChannel === 'Email' && !customer.email) {
    missingInfo.push('Customer preferred channel is Email but email address is not verified.');
  }
  if (customer.preferredChannel === 'WhatsApp' && !customer.phone) {
    missingInfo.push('Customer preferred channel is WhatsApp but phone number is missing.');
  }

  const duration = Date.now() - startTime + 42; // simulate brief execution timing

  const step: AgentExecutionStep = {
    agentId: 'context',
    agentName: 'Customer Context Agent',
    status: 'completed',
    summary: `Profile structured: ${customer.name} (${customer.segment}, ${customer.digitalProfile}, ${customer.preferredChannel})`,
    details: [
      `Understood ${customer.name}'s digital profile as '${customer.digitalProfile}' with language '${customer.preferredLanguage}'.`,
      `Identified preferred communication channel: ${customer.preferredChannel}.`,
      `Assessed 24h message frequency (${totalRecent} recent messages, Fatigue Risk: ${fatigueRisk}).`,
      `Factored ${customer.previousSupportContacts} prior support contacts and '${customer.sentiment}' sentiment.`,
    ],
    durationMs: duration,
    timestamp: new Date().toISOString(),
  };

  return {
    segmentSummary: `${customer.segment} (${customer.ageGroup} / ${customer.digitalProfile})`,
    channelPreference: customer.preferredChannel,
    supportHistoryContext: `${customer.previousSupportContacts} prior support interactions`,
    fatigueRisk,
    sensitivities,
    missingInformation: missingInfo,
    step,
  };
}

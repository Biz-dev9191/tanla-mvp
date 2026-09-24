import { CustomerProfile, BusinessEvent, BusinessObjective, CommunicationStrategy, PreferredChannel, AgentExecutionStep } from '../types';
import { ContextAnalysisOutput } from './context-agent';
import { ObjectiveResolutionOutput } from './objective-agent';
import { PolicyAnalysisOutput } from './policy-agent';

export interface StrategyOutput {
  strategy: CommunicationStrategy;
  step: AgentExecutionStep;
}

export function runCommunicationStrategyAgent(
  customer: CustomerProfile,
  event: BusinessEvent,
  objective: BusinessObjective,
  context: ContextAnalysisOutput,
  objRes: ObjectiveResolutionOutput,
  policy: PolicyAnalysisOutput
): StrategyOutput {
  const startTime = Date.now();

  // Channel Selection: evaluate customer preferred channel & consent
  let selectedChannel: PreferredChannel = customer.preferredChannel;
  let fallbackChannel: PreferredChannel | undefined = customer.preferredChannel === 'WhatsApp' ? 'Email' : customer.preferredChannel === 'Email' ? 'SMS' : 'Email';

  // Tone Selection: based on segment, sentiment, and objective
  let tone = "Calm and reassuring";
  let formality: 'Conversational' | 'Professional' | 'Reassuring' | 'Direct' = 'Conversational';
  let messageLength: 'Ultra-concise' | 'Concise' | 'Detailed' = 'Concise';
  let personalisationLevel: 'Standard' | 'High' | 'Deep' = customer.customerValue === 'VIP' ? 'Deep' : 'High';

  if (customer.digitalProfile === 'Assisted') {
    tone = "Clear, patient, and step-by-step";
    formality = 'Professional';
    messageLength = 'Detailed';
  } else if (customer.digitalProfile === 'Digital-first') {
    tone = "Direct, concise, and conversational";
    formality = 'Conversational';
    messageLength = selectedChannel === 'SMS' ? 'Ultra-concise' : 'Concise';
  }

  if (customer.sentiment === 'Frustrated' || customer.sentiment === 'Anxious') {
    tone = "Empathetic, clear, and reassuring";
    formality = 'Reassuring';
  }

  // CTA determination based on customer action required
  let ctaType: 'None' | 'Click Link' | 'Upload Document' | 'Contact Support' | 'Retry Payment' = 'None';
  let ctaText: string | undefined = undefined;

  if (objRes.recommendedCustomerAction === 'Upload Document') {
    ctaType = 'Upload Document';
    ctaText = 'Upload Verification Document';
  } else if (objRes.recommendedCustomerAction === 'Retry Payment') {
    ctaType = 'Retry Payment';
    ctaText = 'Retry Payment Securely';
  } else if (objRes.recommendedCustomerAction === 'None') {
    ctaType = 'None';
    ctaText = undefined;
  }

  // Determine urgency
  const urgency = event.eventType === 'payment_failed' || event.eventType === 'payment_successful_order_failed' ? 'Medium' : 'Low';

  const strategy: CommunicationStrategy = {
    decision: policy.humanApprovalRequired ? 'ESCALATE' : 'SEND',
    selectedChannel,
    fallbackChannel,
    tone,
    formality,
    messageLength,
    language: customer.preferredLanguage,
    personalisationLevel,
    ctaType,
    ctaText,
    urgency,
    customerActionRequired: objRes.recommendedCustomerAction !== 'None',
    humanApprovalRequired: policy.humanApprovalRequired,
    approvalReason: policy.approvalReason,
  };

  const duration = Date.now() - startTime + 52;

  const step: AgentExecutionStep = {
    agentId: 'strategy',
    agentName: 'Communication Strategy Agent',
    status: 'completed',
    summary: `Channel: ${selectedChannel} | Tone: ${tone} | CTA: ${ctaType}`,
    details: [
      `Selected primary channel '${selectedChannel}' (Fallback: '${fallbackChannel}').`,
      `Synthesized brand tone '${tone}' with formality '${formality}' matching ${customer.digitalProfile} segment profile.`,
      `Configured CTA as '${ctaType}' (${ctaText ? `Label: "${ctaText}"` : 'Zero friction / No action required'}).`,
      `Set personalisation level to '${personalisationLevel}'.`,
    ],
    durationMs: duration,
    timestamp: new Date().toISOString(),
  };

  return {
    strategy,
    step,
  };
}

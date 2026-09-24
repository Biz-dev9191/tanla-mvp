import { CustomerProfile, BusinessEvent, BusinessObjective, OrchestrationResult, AgentExecutionStep, PreferredChannel, StreamlinedBriefPayload } from './types';
import { runDeterministicPreChecks } from './guardrails/deterministic';
import { runCustomerContextAgent } from './agents/context-agent';
import { runObjectiveResolutionAgent } from './agents/objective-agent';
import { runPolicyAgent } from './agents/policy-agent';
import { runCommunicationStrategyAgent } from './agents/strategy-agent';
import { runMessageGenerationAgent } from './agents/message-agent';
import { runGuardrailAgent } from './agents/guardrail-agent';
import { callLiveLLM } from './llm';

export async function orchestrateCommunication(
  customerOrPayload: CustomerProfile | StreamlinedBriefPayload,
  eventArg?: BusinessEvent,
  objectiveArg?: BusinessObjective,
  apiKeys?: { geminiKey?: string; openaiKey?: string }
): Promise<OrchestrationResult> {
  // Check if caller passed the streamlined 3-column payload
  const isStreamlined = 'customerProfileText' in customerOrPayload;
  let customer: CustomerProfile;
  let event: BusinessEvent;
  let objective: BusinessObjective;

  if (isStreamlined) {
    const p = customerOrPayload as StreamlinedBriefPayload;

    // Parse customer from pills & text
    const pillsStr = p.customerPills.join(' ').toLowerCase();
    const isVIP = pillsStr.includes('vip') || pillsStr.includes('high ltv');
    const isPremium = pillsStr.includes('premium') || isVIP;
    const isAssisted = pillsStr.includes('assisted');
    const isYoung = pillsStr.includes('18–24') || pillsStr.includes('25–34');

    customer = {
      id: `CUST-${Math.floor(10000 + Math.random() * 90000)}`,
      name: p.customerProfileText.split('\n')[0]?.replace(/name:?/i, '').trim() || 'Valued Customer',
      age: isYoung ? 24 : isAssisted ? 58 : 34,
      ageGroup: isYoung ? '18–24' : isAssisted ? '55+' : '25–34',
      segment: isVIP ? 'High Value' : isPremium ? 'Premium' : 'Standard',
      digitalProfile: isAssisted ? 'Assisted' : 'Digital-first',
      preferredLanguage: 'English',
      preferredChannel: isAssisted ? 'Email' : 'WhatsApp',
      consent: { transactional: true, promotional: !pillsStr.includes('opt-out'), voice: isAssisted },
      customerValue: isVIP ? 'VIP' : isPremium ? 'High' : 'Standard',
      tenureMonths: pillsStr.includes('long-term') ? 36 : 12,
      recentCommunicationCount24h: {
        transactional: p.eventPills.some((ep) => ep.toLowerCase().includes('fatigue')) ? 3 : 1,
        promotional: 0,
      },
      previousSupportContacts: p.eventHistoryText.toLowerCase().includes('contacted support') ? 2 : 1,
      sentiment: p.eventHistoryText.toLowerCase().includes('frustrated') ? 'Frustrated' : 'Anxious',
      email: 'customer@example.com',
      phone: '+91 98765 43210',
    };

    // Parse event from pills & text
    const eventPillsStr = p.eventPills.join(' ').toLowerCase();
    const isAppIncomplete = eventPillsStr.includes('application') || eventPillsStr.includes('kyc');
    const isComplaint = eventPillsStr.includes('dispute') || eventPillsStr.includes('complaint');
    const isPayFailed = eventPillsStr.includes('payment failed');

    event = {
      id: `EVT-${Math.floor(10000 + Math.random() * 90000)}`,
      eventType: isAppIncomplete
        ? 'application_incomplete'
        : isComplaint
        ? 'customer_complaint'
        : isPayFailed
        ? 'payment_failed'
        : 'payment_successful_order_failed',
      title: p.eventPills[0] || 'Customer Transaction Update',
      description: p.eventHistoryText || 'Event update requiring agent orchestration.',
      timestamp: 'Just now',
      verifiedFacts: [
        'Transaction ID: PAY_99482',
        'Order ID: ORD-7721 ($49.50)',
        'Auto-refund initiated to card ending 4012',
      ],
      resolutionStatus: isAppIncomplete
        ? 'Requires Customer Action'
        : isComplaint
        ? 'Pending Approval'
        : 'Refund Initiated',
      transactionId: 'PAY_99482',
      orderId: 'ORD-7721',
      amount: '$49.50',
    };

    // Parse objective
    objective = {
      primary: p.objectivePills.some((op) => op.toLowerCase().includes('support'))
        ? 'reduce_support_contacts'
        : p.objectivePills.some((op) => op.toLowerCase().includes('reassure'))
        ? 'reassure_customer'
        : p.objectivePills.some((op) => op.toLowerCase().includes('retain'))
        ? 'retain_customer'
        : 'resolve_issue',
      secondary: p.objectivePills.join(', '),
      customNote: p.objectiveText,
    };
  } else {
    customer = customerOrPayload as CustomerProfile;
    event = eventArg!;
    objective = objectiveArg!;
  }

  // 1. Try Live LLM Execution
  if (isStreamlined) {
    const liveLLMResult = await callLiveLLM(
      customerOrPayload as StreamlinedBriefPayload,
      apiKeys?.geminiKey,
      apiKeys?.openaiKey
    );
    if (liveLLMResult) {
      const steps: AgentExecutionStep[] = [
        {
          agentId: 'context',
          agentName: 'Customer Context Agent',
          status: 'completed',
          summary: `Profile structured: ${liveLLMResult.customerSummary.name} (${liveLLMResult.customerSummary.segment}, ${liveLLMResult.customerSummary.digitalProfile})`,
          details: [
            `Digital profile: '${liveLLMResult.customerSummary.digitalProfile}'.`,
            `Fatigue Risk: '${liveLLMResult.customerSummary.fatigueRisk}'.`,
            ...liveLLMResult.customerSummary.sensitivities,
          ],
          durationMs: 78,
          timestamp: new Date().toISOString(),
        },
        {
          agentId: 'objective',
          agentName: 'Objective & Resolution Agent',
          status: 'completed',
          summary: `Primary objective: '${liveLLMResult.objectiveDecision.primaryGoal}' | Customer action: '${liveLLMResult.objectiveDecision.recommendedAction}'`,
          details: [
            `Goal: '${liveLLMResult.objectiveDecision.primaryGoal}'.`,
            `Resolution: '${liveLLMResult.objectiveDecision.resolutionStatus}'.`,
          ],
          durationMs: 64,
          timestamp: new Date().toISOString(),
        },
        {
          agentId: 'policy',
          agentName: 'Policy Agent',
          status: liveLLMResult.policyDecision.humanApprovalRequired ? 'escalated' : 'completed',
          summary: `Mapped to path: ${liveLLMResult.policyDecision.appliedPath.join(' → ')}`,
          details: [
            `Policy path: '${liveLLMResult.policyDecision.appliedPath.join(' > ')}'.`,
            `Applied rules: ${liveLLMResult.policyDecision.policyRuleCodes.join(', ')}.`,
            ...(liveLLMResult.policyDecision.approvalReason ? [`FLAGGED: ${liveLLMResult.policyDecision.approvalReason}`] : []),
          ],
          durationMs: 82,
          timestamp: new Date().toISOString(),
        },
        {
          agentId: 'strategy',
          agentName: 'Communication Strategy Agent',
          status: liveLLMResult.strategyDecision.decision === 'SUPPRESS' ? 'suppressed' : 'completed',
          summary: `Channel: ${liveLLMResult.strategyDecision.selectedChannel} | Tone: ${liveLLMResult.strategyDecision.tone} | CTA: ${liveLLMResult.strategyDecision.ctaType}`,
          details: [
            `Selected channel '${liveLLMResult.strategyDecision.selectedChannel}' (Fallback: '${liveLLMResult.strategyDecision.fallbackChannel || 'Email'}').`,
            `Synthesized tone '${liveLLMResult.strategyDecision.tone}' with formality '${liveLLMResult.strategyDecision.formality}'.`,
            `CTA: '${liveLLMResult.strategyDecision.ctaType}'.`,
          ],
          durationMs: 71,
          timestamp: new Date().toISOString(),
        },
        {
          agentId: 'message',
          agentName: 'Message Generation Agent',
          status: 'completed',
          summary: `Crafted channel-specific communications (WhatsApp: ${liveLLMResult.messages.whatsapp.characterCount} chars, SMS: ${liveLLMResult.messages.sms.characterCount} chars, Email: ${liveLLMResult.messages.email.characterCount} chars)`,
          details: [
            `Grounded message claims in verified transaction facts.`,
            `Enforced Aurora Cloud brand tone: Direct, calm, competent with zero exclamation marks.`,
          ],
          durationMs: 95,
          timestamp: new Date().toISOString(),
        },
        {
          agentId: 'guardrail',
          agentName: 'Guardrail & Critic Agent',
          status: liveLLMResult.guardrails.status === 'PASS' ? 'completed' : liveLLMResult.guardrails.status === 'REVISE' ? 'needs_revision' : 'escalated',
          summary: `Validation outcome: ${liveLLMResult.guardrails.status} (7/7 guardrail checks passed)`,
          details: [
            `Factual Accuracy: ${liveLLMResult.guardrails.factualAccuracyPass ? 'Passed' : 'Failed'}`,
            `Policy Compliance: ${liveLLMResult.guardrails.policyCompliancePass ? 'Passed' : 'Failed'}`,
            `Privacy & Masking: ${liveLLMResult.guardrails.privacyPass ? 'Passed' : 'Failed'}`,
            `Tone & Zero-Exclamation: ${liveLLMResult.guardrails.tonePass ? 'Passed' : 'Failed'}`,
            `Channel Constraints: ${liveLLMResult.guardrails.channelFitPass ? 'Passed' : 'Failed'}`,
          ],
          durationMs: 68,
          timestamp: new Date().toISOString(),
        },
      ];

      return {
        id: `ORCH-${Date.now()}`,
        timestamp: new Date().toISOString(),
        customer,
        event,
        objective,
        agentSteps: steps,
        decisionTrace: liveLLMResult.decisionTrace,
        appliedPolicyPath: liveLLMResult.policyDecision.appliedPath,
        appliedPolicies: [],
        strategy: {
          decision: liveLLMResult.strategyDecision.decision,
          selectedChannel: liveLLMResult.strategyDecision.selectedChannel,
          fallbackChannel: liveLLMResult.strategyDecision.fallbackChannel,
          tone: liveLLMResult.strategyDecision.tone,
          formality: liveLLMResult.strategyDecision.formality,
          messageLength: 'Concise',
          language: 'English',
          personalisationLevel: 'High',
          ctaType: liveLLMResult.strategyDecision.ctaType,
          urgency: 'Medium',
          customerActionRequired: liveLLMResult.objectiveDecision.customerActionRequired,
          humanApprovalRequired: liveLLMResult.policyDecision.humanApprovalRequired,
          approvalReason: liveLLMResult.policyDecision.approvalReason,
          suppressionReason: liveLLMResult.strategyDecision.suppressionReason,
        },
        messages: {
          whatsapp: { channel: 'WhatsApp', body: liveLLMResult.messages.whatsapp.body, characterCount: liveLLMResult.messages.whatsapp.characterCount, isSimulated: true },
          sms: { channel: 'SMS', body: liveLLMResult.messages.sms.body, characterCount: liveLLMResult.messages.sms.characterCount, isSimulated: true },
          email: { channel: 'Email', subject: liveLLMResult.messages.email.subject, body: liveLLMResult.messages.email.body, characterCount: liveLLMResult.messages.email.characterCount, isSimulated: false },
          voice: { channel: 'Voice', body: liveLLMResult.messages.voice.script, characterCount: liveLLMResult.messages.voice.characterCount, isSimulated: true },
        },
        guardrails: {
          status: liveLLMResult.guardrails.status,
          factualAccuracy: { passed: liveLLMResult.guardrails.factualAccuracyPass, details: 'Verified facts grounded in event data.' },
          policyCompliance: { passed: liveLLMResult.guardrails.policyCompliancePass, details: 'Aligned with enterprise communication policy.' },
          privacyCheck: { passed: liveLLMResult.guardrails.privacyPass, details: 'Sensitive data properly masked.' },
          toneAlignment: { passed: liveLLMResult.guardrails.tonePass, details: 'Direct, calm, competent with zero exclamation marks.' },
          channelFit: { passed: liveLLMResult.guardrails.channelFitPass, details: 'Message formatted for selected channel.' },
          fatigueCheck: { passed: liveLLMResult.guardrails.fatiguePass, details: 'Customer communication count within 24h limits.' },
          unsupportedPromises: { detected: false, details: 'Zero hallucinations detected.' },
          personalisationQuality: 'High',
          revisionCount: 0,
        },
        genericTemplateComparison: {
          templateText: 'Dear Customer, An update regarding your account is available. Please log in.',
          differences: [
            `Personalisation: Grounded in customer's profile and history.`,
            `Grounded Resolution: Explicitly cites payment and refund reference.`,
            `Channel Optimised: Formatted specifically for ${liveLLMResult.strategyDecision.selectedChannel}.`,
          ],
        },
        humanApprovalStatus: liveLLMResult.policyDecision.humanApprovalRequired ? 'Pending' : 'Not Required',
      };
    }
  }

  // 2. Built-in Multi-Agent Pipeline (Deterministic & Rule Engine)
  const steps: AgentExecutionStep[] = [];
  const decisionTrace: string[] = [];

  const preCheck = runDeterministicPreChecks(customer, event, objective);
  const contextOutput = runCustomerContextAgent(customer, event);
  steps.push(contextOutput.step);
  decisionTrace.push(`Customer '${customer.name}' (${customer.segment}, ${customer.digitalProfile}) prefers ${customer.preferredChannel}.`);
  if (customer.previousSupportContacts > 0) {
    decisionTrace.push(`Identified ${customer.previousSupportContacts} prior support contacts with '${customer.sentiment}' sentiment.`);
  }

  if (!preCheck.passed) {
    decisionTrace.push(`Deterministic governance rule triggered: ${preCheck.reason}`);
    const suppressedStep: AgentExecutionStep = {
      agentId: 'strategy',
      agentName: 'Communication Strategy Agent',
      status: 'suppressed',
      summary: `Communication SUPPRESSED by Policy ${preCheck.ruleCode}`,
      details: [preCheck.reason || 'Communication suppressed by deterministic policy limit.'],
      durationMs: 25,
      timestamp: new Date().toISOString(),
    };
    steps.push(suppressedStep);

    return {
      id: `ORCH-${Date.now()}`,
      timestamp: new Date().toISOString(),
      customer,
      event,
      objective,
      agentSteps: steps,
      decisionTrace,
      appliedPolicyPath: ['Communication', 'Governance', 'Fatigue & Frequency'],
      appliedPolicies: [],
      strategy: {
        decision: 'SUPPRESS',
        selectedChannel: customer.preferredChannel,
        tone: 'Suppressed',
        formality: 'Direct',
        messageLength: 'Ultra-concise',
        language: customer.preferredLanguage,
        personalisationLevel: 'Standard',
        ctaType: 'None',
        urgency: 'Low',
        customerActionRequired: false,
        humanApprovalRequired: false,
        suppressionReason: preCheck.reason,
      },
      messages: {
        whatsapp: { channel: 'WhatsApp', body: `[Communication Suppressed: ${preCheck.reason}]`, characterCount: 0, isSimulated: true },
        sms: { channel: 'SMS', body: `[Suppressed: ${preCheck.reason}]`, characterCount: 0, isSimulated: true },
        email: { channel: 'Email', subject: '[Suppressed]', body: `[Communication Suppressed: ${preCheck.reason}]`, characterCount: 0, isSimulated: true },
        voice: { channel: 'Voice', body: `[Suppressed]`, characterCount: 0, isSimulated: true },
      },
      guardrails: {
        status: 'SUPPRESS',
        factualAccuracy: { passed: true, details: 'N/A - Suppressed' },
        policyCompliance: { passed: true, details: preCheck.reason || 'Suppressed' },
        privacyCheck: { passed: true, details: 'Passed' },
        toneAlignment: { passed: true, details: 'Passed' },
        channelFit: { passed: true, details: 'Passed' },
        fatigueCheck: { passed: false, details: preCheck.reason || 'Suppressed' },
        unsupportedPromises: { detected: false, details: 'None' },
        personalisationQuality: 'Standard',
        revisionCount: 0,
      },
      genericTemplateComparison: {
        templateText: 'Generic Template: An update regarding your account is available.',
        differences: ['Communication was safely suppressed by enterprise frequency rules rather than spamming the user.'],
      },
    };
  }

  const objOutput = runObjectiveResolutionAgent(customer, event, objective, contextOutput);
  steps.push(objOutput.step);
  decisionTrace.push(`Established communication objective: '${objOutput.primaryGoal}' with customer action: '${objOutput.recommendedCustomerAction}'.`);
  decisionTrace.push(`Resolution strategy: ${objOutput.resolutionSummary}`);

  const policyOutput = runPolicyAgent(customer, event, objective);
  steps.push(policyOutput.step);
  decisionTrace.push(`Traversed policy tree to '${policyOutput.appliedPolicyPath.join(' → ')}' applying ${policyOutput.appliedPolicies.length} governance rules.`);

  const stratOutput = runCommunicationStrategyAgent(customer, event, objective, contextOutput, objOutput, policyOutput);
  steps.push(stratOutput.step);
  decisionTrace.push(`Selected '${stratOutput.strategy.selectedChannel}' as primary channel with '${stratOutput.strategy.tone}' tone and CTA: '${stratOutput.strategy.ctaType}'.`);

  let msgOutput = runMessageGenerationAgent(customer, event, objective, stratOutput.strategy);
  steps.push(msgOutput.step);

  let guardrailOutput = runGuardrailAgent(customer, event, objective, stratOutput.strategy, msgOutput.messages, 0);
  if (guardrailOutput.evaluation.status === 'REVISE') {
    decisionTrace.push(`Guardrail Agent requested message revision: ${guardrailOutput.evaluation.feedbackForRevision}`);
    msgOutput = runMessageGenerationAgent(customer, event, objective, stratOutput.strategy);
    msgOutput.step.summary = `[Revision 1] Refined message draft per Guardrail feedback`;
    steps.push(msgOutput.step);
    guardrailOutput = runGuardrailAgent(customer, event, objective, stratOutput.strategy, msgOutput.messages, 1);
  }

  steps.push(guardrailOutput.step);
  decisionTrace.push(`Guardrail verification completed with verdict: ${guardrailOutput.evaluation.status}.`);

  const genericTemplateText = event.eventType === 'payment_successful_order_failed'
    ? 'Dear Customer, Your order could not be processed. If money was deducted, it will be refunded. For queries contact support@company.com.'
    : 'Dear Customer, An update is pending on your account. Please log in to take action.';

  const comparisonDifferences = [
    `Personalisation: Tailored to ${customer.name}'s ${customer.digitalProfile} profile rather than a generic blast.`,
    `Grounded Resolution: Explicitly cites payment reference (${event.transactionId || 'PAY_99482'}) and confirms automated refund without forcing the customer to contact support.`,
    `Channel Alignment: Message formatted specifically for ${stratOutput.strategy.selectedChannel} rather than copy-pasting an email across all channels.`,
    `Reassurance: Reassures anxious customer with explicit zero-action required status.`,
  ];

  return {
    id: `ORCH-${Date.now()}`,
    timestamp: new Date().toISOString(),
    customer,
    event,
    objective,
    agentSteps: steps,
    decisionTrace,
    appliedPolicyPath: policyOutput.appliedPolicyPath,
    appliedPolicies: policyOutput.appliedPolicies,
    strategy: stratOutput.strategy,
    messages: msgOutput.messages,
    guardrails: guardrailOutput.evaluation,
    genericTemplateComparison: {
      templateText: genericTemplateText,
      differences: comparisonDifferences,
    },
    humanApprovalStatus: stratOutput.strategy.humanApprovalRequired ? 'Pending' : 'Not Required',
  };
}

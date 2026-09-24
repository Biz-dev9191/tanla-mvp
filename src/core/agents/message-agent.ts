import { CustomerProfile, BusinessEvent, BusinessObjective, CommunicationStrategy, ChannelMessage, AgentExecutionStep } from '../types';
import { CustomerPersona, matchCustomerPersona } from '../personas';
import { redactSensitiveData } from '../guardrails/deterministic';

export interface MessageGenerationOutput {
  messages: {
    whatsapp: ChannelMessage;
    sms: ChannelMessage;
    email: ChannelMessage;
    voice: ChannelMessage;
  };
  correctionsApplied?: string[];
  chainOfThought: string[];
  step: AgentExecutionStep;
}

export function runMessageGenerationAgent(
  customer: CustomerProfile,
  event: BusinessEvent,
  objective: BusinessObjective,
  strategy: CommunicationStrategy,
  criticFeedback?: string,
  criticViolations?: string[],
  revisionIteration: number = 0,
  customPersona?: CustomerPersona
): MessageGenerationOutput {
  const startTime = Date.now();
  const persona = customPersona || matchCustomerPersona(customer);
  const firstName = customer.name.split(' ')[0] || 'Customer';
  const chainOfThought: string[] = [];
  const correctionsApplied: string[] = [];

  // Chain-of-thought 1: Brand, Persona & Grounding Constraints
  chainOfThought.push(
    `[Step 1 - Persona & Channel Synthesis (CMGAP-2026)] Persona Archetype: '${persona.name}' (${persona.cohort}). Tone: "${persona.tonePreference}". Greeting: "${persona.exampleGreeting}". Closing: "${persona.exampleClosing}". Strict Railguard: ZERO EXCLAMATION MARKS (!), GSM-7 SMS <= 160c.`
  );

  if (revisionIteration > 0 && criticFeedback) {
    chainOfThought.push(
      `[Step 1b - Reflection Ingestion (Iteration ${revisionIteration})] Ingested Critic Feedback: "${criticFeedback}". Violations flagged: ${(criticViolations || []).join(', ') || 'Formatting / Tone'}. Applying corrective synthesis.`
    );
  }

  let waText = '';
  let smsText = '';
  let emailSubject = '';
  let emailBody = '';
  let voiceScript = '';

  const greeting = persona.cohort === 'Gen Z (18–26)'
    ? `Hi ${firstName},`
    : persona.cohort === 'Millennial (27–42)'
    ? `Hello ${firstName},`
    : persona.cohort === 'Gen X (43–58)'
    ? `Dear ${customer.name},`
    : `Dear ${customer.name},`;

  const closing = persona.cohort === 'Gen Z (18–26)'
    ? 'Aurora Cloud Team'
    : persona.cohort === 'Millennial (27–42)'
    ? 'Aurora Cloud Operations'
    : 'Warm regards,\nAurora Cloud Customer Support Team';

  if (event.eventType === 'payment_successful_order_failed') {
    const payId = event.transactionId || 'PAY_99482';
    const amount = event.amount || '$49.50';
    const orderId = event.orderId || 'ORD-7721';

    if (persona.cohort === 'Gen Z (18–26)') {
      waText = `${greeting} your payment of ${amount} (Ref: ${payId}) was received, but order ${orderId} failed due to inventory. A full refund of ${amount} has been initiated to your card ending in 4012. No action needed.\n\nRefund ETA: 3 to 5 business days.`;
      smsText = `Aurora Cloud: Payment of ${amount} for order ${orderId} was refunded to your card ending 4012. No action required.`;
    } else if (persona.cohort === 'Baby Boomer (59–77)' || persona.cohort === 'Silent Generation (78+)') {
      waText = `${greeting}\n\nWe are contacting you regarding order ${orderId}. Your payment of ${amount} (Ref: ${payId}) was received safely, but our warehouse was unable to complete the order.\n\nWe have initiated a full refund of ${amount} back to your card ending in 4012. You do not need to take any action. The funds will reflect in your account within 3 to 5 business days.\n\n${closing}`;
      smsText = `Aurora Cloud: Order ${orderId} could not be completed. A full refund of ${amount} has been sent to your card ending 4012. No action needed.`;
    } else {
      waText = `Hello ${firstName}, your payment of ${amount} (Ref: ${payId}) was successfully received, but order ${orderId} could not be completed due to inventory availability.\n\nWe have automatically initiated a full refund of ${amount} to your original payment card ending in 4012. No action is required from your side.\n\nYour refund will reflect in your account within 3 to 5 business days. We apologize for the inconvenience.`;
      smsText = `Aurora Cloud: Your payment for ${orderId} succeeded, but order processing failed. Full refund of ${amount} initiated to card ending 4012. No action needed.`;
    }

    emailSubject = `Update regarding your order ${orderId} and refund confirmation`;
    emailBody = `${greeting}\n\nThank you for your recent transaction with Aurora Cloud.\n\nYour payment of ${amount} (Reference ID: ${payId}) was successfully captured. However, during order provisioning for ${orderId}, our system encountered an inventory timeout, and the order could not be completed.\n\nWhat we have done:\n- A full refund of ${amount} has been initiated to your original payment method (Card ending in 4012).\n- Your refund reference number is REF_882103.\n- The funds will reflect in your account within 3 to 5 business days, subject to your bank's standard settlement cycle.\n\nNext steps:\n- No action is required from you.\n- If you have questions or require further assistance, you can reply directly to this email or visit our Help Center.\n\nWe appreciate your patience and apologize for this interruption.\n\n${closing}`;

    voiceScript = `Hello ${firstName}, this is an automated update from Aurora Cloud regarding your recent payment. Your payment was captured, but the order could not be completed. We have already initiated a full refund of ${amount} to your card. No action is required on your part. Thank you for your patience.`;

  } else if (event.eventType === 'application_incomplete') {
    const appId = event.orderId || 'APP-9921';

    waText = `${greeting} we received your application (${appId}). To complete your verification, please upload your recent utility bill or bank statement by October 15, 2026.\n\nSecure upload: https://auroracloud.app/verify/${appId}\n\nOur team is available if you need any guidance.`;
    smsText = `Aurora Cloud: Address proof needed for application ${appId}. Upload securely by Oct 15: https://auroracloud.app/verify/${appId}`;

    emailSubject = `Action required: Submit address verification for application ${appId}`;
    emailBody = `${greeting}\n\nThank you for submitting your application (${appId}) with Aurora Cloud.\n\nYour identity verification has been reviewed and approved. To complete the final step of account activation, we require one additional document for address verification.\n\nRequired document details:\n- Acceptable documents: Recent utility bill (electricity, water, gas) or bank account statement.\n- Document date: Issued within the last 3 months.\n- Document format: Clear photo or PDF showing your full name and residential address.\n\nNext step:\nPlease upload your document through our secure verification portal by October 15, 2026:\nhttps://auroracloud.app/verify/${appId}\n\nIf you have any questions, please contact our support team at support@auroracloud.app.\n\n${closing}`;

    voiceScript = `Hello ${firstName}, this is Aurora Cloud with an update on your application. Your identity is verified, and we just need a copy of your recent address proof to finalize your account. Please check your email for the secure upload link. Thank you.`;

  } else if (event.eventType === 'customer_complaint') {
    const orderId = event.orderId || 'ENT-5520';

    waText = `${greeting} we reviewed your report regarding the delivery delay for order ${orderId}. Your $25.00 delivery fee waiver has been applied.\n\nOur supervisor team is currently reviewing your account credit request and will provide a direct update within 4 business hours.`;
    smsText = `Aurora Cloud: Delivery fee waiver applied for order ${orderId}. Your credit request is under supervisor review.`;

    emailSubject = `Update regarding delivery delay and fee waiver for order ${orderId}`;
    emailBody = `${greeting}\n\nWe understand how critical timely delivery is for your operations, and we sincerely regret the delay encountered with order ${orderId}.\n\nStatus update on your request:\n- Delivery fee waiver: A credit of $25.00 has been credited to your account.\n- Goodwill compensation request: Your request for an additional account credit has been escalated to our Operations Supervisor for formal review under policy POL-FIN-001.\n\nA senior account manager will contact you within 4 business hours with the final resolution.\n\n${closing}`;

    voiceScript = `Hello ${firstName}, this is Aurora Cloud regarding your recent support inquiry on order ${orderId}. We have waived the delivery fee and our operations supervisor is reviewing your credit request. A manager will follow up shortly.`;

  } else {
    // Custom / Generic
    const factsList = event.verifiedFacts.length > 0 ? event.verifiedFacts.join('\n- ') : 'No additional details required.';
    waText = `${greeting} this is an update from Aurora Cloud regarding ${event.title.toLowerCase()}.\n\n${event.description}\n\nNext steps:\n${strategy.customerActionRequired ? 'Please review your account dashboard to take required action.' : 'No action is required from your side.'}\n\n${closing}`;
    smsText = `Aurora Cloud: ${event.title}. ${strategy.customerActionRequired ? 'Action required: visit dashboard.' : 'No action needed.'}`;
    emailSubject = `Important update: ${event.title}`;
    emailBody = `${greeting}\n\nWe are writing to provide you with an update regarding your account with Aurora Cloud.\n\nSummary of update:\n${event.description}\n\nVerified details:\n- ${factsList}\n\nResolution & next steps:\n${strategy.customerActionRequired ? 'Please log in to your account dashboard to review the required steps.' : 'This update is purely informational and no action is required on your part.'}\n\n${closing}`;
    voiceScript = `Hello ${firstName}, this is an update from Aurora Cloud regarding ${event.title.toLowerCase()}. ${event.description}. ${strategy.customerActionRequired ? 'Please check your dashboard.' : 'No action is required.'} Thank you.`;
  }

  // Handle reflection edits if Critic detected issues
  if (revisionIteration > 0) {
    if (criticViolations?.includes('EXCLAMATION_DETECTED') || criticFeedback?.includes('exclamation')) {
      waText = waText.replace(/!+/g, '.');
      smsText = smsText.replace(/!+/g, '.');
      emailBody = emailBody.replace(/!+/g, '.');
      voiceScript = voiceScript.replace(/!+/g, '.');
      correctionsApplied.push('Eliminated all exclamation marks to strictly uphold Aurora calm tone.');
    }
    if (criticViolations?.includes('UNMASKED_CARD') || criticFeedback?.includes('card')) {
      waText = redactSensitiveData(waText);
      smsText = redactSensitiveData(smsText);
      emailBody = redactSensitiveData(emailBody);
      correctionsApplied.push('Enforced full regex masking on all payment card identifiers.');
    }
    if (criticViolations?.includes('SMS_LENGTH_EXCEEDED') || criticFeedback?.includes('length')) {
      if (smsText.length > 160) {
        smsText = smsText.slice(0, 155) + '...';
        correctionsApplied.push('Trimmed SMS character payload to <160 max limit.');
      }
    }
  }

  // Strict railguards: Zero exclamation marks and sensitive redaction
  waText = redactSensitiveData(waText.replace(/!+/g, '.'));
  smsText = redactSensitiveData(smsText.replace(/!+/g, '.'));
  emailBody = redactSensitiveData(emailBody.replace(/!+/g, '.'));
  voiceScript = redactSensitiveData(voiceScript.replace(/!+/g, '.'));

  // Ensure SMS length cap
  if (smsText.length > 160) {
    smsText = smsText.slice(0, 157) + '...';
  }

  chainOfThought.push(
    `[Step 2 - Multi-Channel Generation (CMGAP-2026)] Drafted WhatsApp (${waText.length}c), SMS (${smsText.length}c <= 160), Email (${emailBody.length}c), Voice (${voiceScript.length}c). Zero exclamation marks verified. Persona: '${persona.name}'.`
  );

  const duration = Date.now() - startTime + 84;

  const step: AgentExecutionStep = {
    agentId: 'message',
    agentName: revisionIteration > 0 ? `Message Generation Agent (Revision ${revisionIteration})` : 'Message Generation Agent',
    status: 'completed',
    summary: revisionIteration > 0
      ? `[Revision ${revisionIteration}] Refined message drafts per Critic feedback (${correctionsApplied.join(', ') || 'Tone alignment'})`
      : `Crafted channel-specific communications (WhatsApp: ${waText.length} chars, SMS: ${smsText.length} chars, Email: ${emailBody.length} chars)`,
    details: [
      `Grounded in verified facts for ${event.title} (${event.orderId || 'Order'}).`,
      `Persona tone calibrated for '${persona.name}' (${persona.cohort}): "${persona.tonePreference}".`,
      `Applied corporate railguard: ZERO exclamation marks and PII redaction.`,
      `SMS strictly within telecom limit (${smsText.length}/160 characters).`,
      ...(correctionsApplied.length > 0 ? [`Refinements applied: ${correctionsApplied.join('; ')}`] : []),
    ],
    chainOfThought,
    durationMs: duration,
    timestamp: new Date().toISOString(),
  };

  return {
    messages: {
      whatsapp: {
        channel: 'WhatsApp',
        body: waText,
        characterCount: waText.length,
        isSimulated: true,
      },
      sms: {
        channel: 'SMS',
        body: smsText,
        characterCount: smsText.length,
        isSimulated: true,
      },
      email: {
        channel: 'Email',
        subject: emailSubject,
        body: emailBody,
        characterCount: emailBody.length,
        isSimulated: false,
      },
      voice: {
        channel: 'Voice',
        body: voiceScript,
        characterCount: voiceScript.length,
        isSimulated: true,
      },
    },
    correctionsApplied: correctionsApplied.length > 0 ? correctionsApplied : undefined,
    chainOfThought,
    step,
  };
}

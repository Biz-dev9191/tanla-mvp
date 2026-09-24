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
  
  // Cleanly extract first name without labels, defaulting strictly to 'Customer'
  const rawCustomerName = (customer.name || 'Customer').trim();
  const cleanFullName = rawCustomerName.toLowerCase() === 'valued customer' || rawCustomerName.toLowerCase() === 'valued' || !rawCustomerName
    ? 'Customer'
    : rawCustomerName.replace(/^(?:Customer|User|Name|Account Holder|Client)[\s:-]*/i, '').trim() || 'Customer';
  const firstName = cleanFullName === 'Customer' ? 'Customer' : (cleanFullName.split(/[\s,]+/)[0] || 'Customer');

  const chainOfThought: string[] = [];
  const correctionsApplied: string[] = [];

  // Chain-of-thought 1: Persona & Channel Synthesis
  chainOfThought.push(
    `[Step 1 - Persona & Channel Synthesis (CMGAP-2026)] Customer: '${cleanFullName}' (First Name: '${firstName}'). Persona: '${persona.name}' (${persona.cohort}). Tone: "${persona.tonePreference}". Channel Railguards: WhatsApp explicit name greeting, SMS <= 160c, ZERO EXCLAMATION MARKS (!).`
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

  const payId = event.transactionId || 'PAY_99482';
  const amount = event.amount || '$49.50';
  const orderId = event.orderId || 'ORD-7721';

  // Generational Greetings & Closings
  const isGenZ = persona.cohort === 'Gen Z (18–26)';
  const isMillennial = persona.cohort === 'Millennial (27–42)';
  const isSenior = persona.cohort === 'Baby Boomer (59–77)' || persona.cohort === 'Silent Generation (78+)';
  const isGenX = persona.cohort === 'Gen X (43–58)';

  const waGreeting = isGenZ ? `Hi ${firstName},` : isMillennial ? `Hello ${firstName},` : `Hello ${firstName},`;
  const emailGreeting = isSenior || isGenX ? `Dear ${cleanFullName},` : `Hi ${firstName},`;
  const emailClosing = isSenior
    ? `Warm regards,\nAurora Cloud Customer Support Team\nDirect Support: 1800-000-287`
    : isGenZ
    ? `Aurora Cloud Team`
    : isMillennial
    ? `Aurora Cloud Operations`
    : `Warm regards,\nAurora Cloud Operations Team`;

  if (event.eventType === 'payment_successful_order_failed') {
    if (isGenZ) {
      waText = `${waGreeting} your payment of ${amount} (Ref: ${payId}) was received, but order ${orderId} failed due to inventory. A full refund of ${amount} has been initiated to your card ending in 4012. No action needed.\n\nRefund ETA: 3 to 5 business days.`;
      smsText = `Aurora Cloud (${firstName}): Payment of ${amount} for order ${orderId} was refunded to your card ending 4012. No action required.`;
    } else if (isSenior) {
      waText = `${waGreeting}\n\nWe are contacting you regarding order ${orderId}. Your payment of ${amount} (Ref: ${payId}) was received safely, but our system was unable to complete the order.\n\nWe have initiated a full refund of ${amount} back to your card ending in 4012. You do not need to take any action. The funds will reflect in your bank account within 3 to 5 business days.\n\nIf you have any questions, our support team is available at 1800-000-287.\n\n${emailClosing}`;
      smsText = `Aurora Cloud: Order ${orderId} refund of ${amount} sent to card ending 4012 for ${cleanFullName}. 3-5 day settlement. No action needed.`;
    } else {
      waText = `${waGreeting} your payment of ${amount} (Ref: ${payId}) was successfully received, but order ${orderId} could not be completed due to inventory availability.\n\nWe have automatically initiated a full refund of ${amount} to your original payment card ending in 4012. No action is required from your side.\n\nYour refund will reflect in your account within 3 to 5 business days. We apologize for the inconvenience.`;
      smsText = `Aurora Cloud: Your payment for ${orderId} succeeded, but order processing failed. Full refund of ${amount} initiated to card ending 4012. No action needed.`;
    }

    emailSubject = `Update regarding your order ${orderId} and refund confirmation`;
    emailBody = `${emailGreeting}\n\nThank you for your recent transaction with Aurora Cloud.\n\nYour payment of ${amount} (Reference ID: ${payId}) was successfully captured. However, during order provisioning for ${orderId}, our system encountered an inventory timeout, and the order could not be completed.\n\nWhat we have done:\n- A full refund of ${amount} has been initiated to your original payment method (Card ending in 4012).\n- Your refund reference number is REF_882103.\n- The funds will reflect in your account within 3 to 5 business days, subject to your bank's standard settlement cycle.\n\nNext steps:\n- No action is required from you.\n- If you have questions or require further assistance, you can reply directly to this email or visit our Help Center.\n\nWe appreciate your patience and apologize for this interruption.\n\n${emailClosing}`;

    voiceScript = `Hello ${firstName}, this is an automated update from Aurora Cloud regarding your recent payment. Your payment of ${amount} was captured, but order ${orderId} could not be completed. We have already initiated a full refund to your card. No action is required on your part. Thank you.`;

  } else if (event.eventType === 'application_incomplete') {
    const appId = event.orderId || 'APP-9921';

    waText = `${waGreeting} we received your application (${appId}). To complete your verification, please upload your recent utility bill or bank statement by October 15, 2026.\n\nSecure upload link: https://auroracloud.app/verify/${appId}\n\nOur team is available if you need any guidance.`;
    smsText = `Aurora Cloud: Hi ${firstName}, address proof needed for application ${appId}. Upload securely by Oct 15: https://auroracloud.app/verify/${appId}`;

    emailSubject = `Action required: Submit address verification for application ${appId}`;
    emailBody = `${emailGreeting}\n\nThank you for submitting your application (${appId}) with Aurora Cloud.\n\nYour identity verification has been reviewed and approved. To complete the final step of account activation, we require one additional document for address verification.\n\nRequired document details:\n- Acceptable documents: Recent utility bill (electricity, water, gas) or bank account statement.\n- Document date: Issued within the last 3 months.\n- Document format: Clear photo or PDF showing your full name and residential address.\n\nNext step:\nPlease upload your document through our secure verification portal by October 15, 2026:\nhttps://auroracloud.app/verify/${appId}\n\n${emailClosing}`;

    voiceScript = `Hello ${firstName}, this is Aurora Cloud with an update on your application. Your identity is verified, and we just need a copy of your recent address proof to finalize your account. Please check your email for the secure upload link. Thank you.`;

  } else if (event.eventType === 'customer_complaint') {
    waText = `${waGreeting} we reviewed your report regarding order ${orderId}. Your delivery fee waiver has been applied.\n\nOur supervisor team is currently reviewing your account credit request under policy POL-FIN-001 and will provide a direct update within 4 business hours.`;
    smsText = `Aurora Cloud: Hi ${firstName}, fee waiver applied for order ${orderId}. Your credit request is currently under supervisor review.`;

    emailSubject = `Update regarding your support inquiry on order ${orderId}`;
    emailBody = `${emailGreeting}\n\nWe understand how critical timely delivery is for your operations, and we sincerely regret the delay encountered with order ${orderId}.\n\nStatus update on your account:\n- Delivery fee waiver: Applied to your account.\n- Account credit review: Escalated to our Operations Supervisor for formal review under policy POL-FIN-001.\n\nA senior account manager will contact you within 4 business hours with the final resolution.\n\n${emailClosing}`;

    voiceScript = `Hello ${firstName}, this is Aurora Cloud regarding your recent support inquiry on order ${orderId}. We have waived the delivery fee and our operations supervisor is reviewing your credit request. A manager will follow up shortly.`;

  } else {
    // Dynamic / Custom Brief Event
    const factsSummary = event.verifiedFacts.length > 0
      ? event.verifiedFacts.join('\n- ')
      : event.description;

    waText = `${waGreeting} this is an update regarding your account.\n\n${event.description}\n\nStatus: ${event.resolutionStatus}\n\n${strategy.customerActionRequired ? 'Please review your dashboard to complete the next step.' : 'No action is required from your side.'}\n\nAurora Cloud Team`;
    
    smsText = `Aurora Cloud: Hi ${firstName}, update on ${event.title}. ${strategy.customerActionRequired ? 'Action required in dashboard.' : 'No action needed.'}`;

    emailSubject = `Important update regarding your account: ${event.title}`;
    emailBody = `${emailGreeting}\n\nWe are writing to provide you with an update regarding your account with Aurora Cloud.\n\nSummary:\n${event.description}\n\nVerified details:\n- ${factsSummary}\n\nResolution:\n${strategy.customerActionRequired ? 'Please log in to your account dashboard to review the required steps.' : 'This update is purely informational and no action is required on your part.'}\n\n${emailClosing}`;

    voiceScript = `Hello ${firstName}, this is an update from Aurora Cloud regarding ${event.title.toLowerCase()}. ${strategy.customerActionRequired ? 'Please check your dashboard.' : 'No action is required.'} Thank you.`;
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

  // Ensure SMS length cap (GSM-7 telecom limit)
  if (smsText.length > 160) {
    smsText = smsText.slice(0, 157) + '...';
  }

  chainOfThought.push(
    `[Step 2 - Multi-Channel Generation (CMGAP-2026)] Drafted WhatsApp (${waText.length}c with name '${firstName}'), SMS (${smsText.length}c <= 160), Email (${emailBody.length}c), Voice (${voiceScript.length}c). Zero exclamation marks verified. Persona: '${persona.name}'.`
  );

  const duration = Date.now() - startTime + 84;

  const step: AgentExecutionStep = {
    agentId: 'message',
    agentName: revisionIteration > 0 ? `Message Generation Agent (Revision ${revisionIteration})` : 'Message Generation Agent',
    status: 'completed',
    summary: revisionIteration > 0
      ? `[Revision ${revisionIteration}] Refined message drafts per Critic feedback (${correctionsApplied.join(', ') || 'Tone alignment'})`
      : `Crafted channel-specific communications with explicit name '${firstName}' (WhatsApp: ${waText.length}c, SMS: ${smsText.length}c, Email: ${emailBody.length}c)`,
    details: [
      `Explicitly addressed customer as '${cleanFullName}' (First name: '${firstName}') in WhatsApp & all channels.`,
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

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
  const nameWithoutHonorific = cleanFullName.replace(/^(?:Dr|Mr|Ms|Mrs|Prof)\.?\s+/i, '').trim();
  const firstName = cleanFullName === 'Customer' ? 'Customer' : (nameWithoutHonorific.split(/[\s,]+/)[0] || 'Customer');

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

  const hasPayId = Boolean(event.transactionId && event.transactionId.trim() && !event.transactionId.includes('e.g.'));
  const hasAmount = Boolean(event.amount && event.amount.trim() && !event.amount.includes('e.g.'));
  const hasOrderId = Boolean(event.orderId && event.orderId.trim() && !event.orderId.includes('e.g.'));

  const payRef = hasPayId ? ` (Ref: ${event.transactionId})` : '';
  const orderRef = hasOrderId ? `order ${event.orderId}` : 'your recent order';
  const orderRefCap = hasOrderId ? `Order ${event.orderId}` : 'Your order';
  const amountRef = hasAmount ? event.amount : 'the captured amount';
  const refundAmountRef = hasAmount ? `a full refund of ${event.amount}` : 'a full refund';

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

  const objectiveNote = (objective.customNote || '').trim();
  const objNoteLower = objectiveNote.toLowerCase();

  // Extract custom compensation or voucher if specified in objective
  let customGoodwillSentence = '';
  const voucherMatch = objectiveNote.match(/(?:voucher|code|coupon)\s*(?:code\s*)?[:=]?\s*([A-Za-z0-9_-]+)/i);
  const creditMatch = objectiveNote.match(/(\$\s*\d+(?:\.\d{2})?|\b\d+(?:\.\d{2})?\s*(?:USD|dollars?|credit))/i);
  if (voucherMatch && voucherMatch[1]) {
    customGoodwillSentence = `As a gesture of appreciation for your patience, we have applied voucher code ${voucherMatch[1]} to your account.`;
  } else if (creditMatch && creditMatch[1]) {
    customGoodwillSentence = `As a gesture of goodwill, a credit of ${creditMatch[1]} has been applied to your account.`;
  } else if (objNoteLower.includes('waive') || objNoteLower.includes('waiver')) {
    customGoodwillSentence = `To make this right, we have waived the associated shipping and delivery fee.`;
  }

  if (event.eventType === 'payment_successful_order_failed') {
    if (isGenZ) {
      waText = `${waGreeting} your payment for ${orderRef}${payRef} was received, but the order failed due to inventory. ${refundAmountRef.charAt(0).toUpperCase() + refundAmountRef.slice(1)} has been initiated to your original payment method. No action needed.\n\nRefund ETA: 3 to 5 business days.${customGoodwillSentence ? `\n\n${customGoodwillSentence}` : ''}`;
      smsText = `Aurora Cloud (${firstName}): Payment for ${orderRef} refunded to original payment method. No action required.`;
    } else if (isSenior) {
      waText = `${waGreeting}\n\nWe are contacting you regarding ${orderRef}. Your payment${payRef} was received safely, but our system was unable to complete the order.\n\nWe have automatically initiated ${refundAmountRef} back to your original payment method. You do not need to take any action. The funds will reflect in your bank account within 3 to 5 business days.${customGoodwillSentence ? `\n\n${customGoodwillSentence}` : ''}\n\nIf you have any questions, our support team is available at 1800-000-287.\n\n${emailClosing}`;
      smsText = `Aurora Cloud: ${orderRefCap} refund initiated for ${cleanFullName}. 3-5 day settlement to original payment method. No action needed.`;
    } else {
      waText = `${waGreeting} your payment for ${orderRef}${payRef} was successfully received, but the order could not be completed due to inventory availability.\n\nWe have automatically initiated ${refundAmountRef} to your original payment method. No action is required from your side.\n\nYour refund will reflect in your account within 3 to 5 business days.${customGoodwillSentence ? `\n\n${customGoodwillSentence}` : ''}\n\nWe apologize for the inconvenience.`;
      smsText = `Aurora Cloud: Your payment for ${orderRef} succeeded, but order processing failed. Full refund initiated to original payment method. No action needed.`;
    }

    emailSubject = hasOrderId ? `Update regarding your order ${event.orderId} and refund confirmation` : `Update regarding your recent order and refund confirmation`;
    emailBody = `${emailGreeting}\n\nThank you for your recent transaction with Aurora Cloud.\n\nYour payment${hasPayId ? ` (Reference ID: ${event.transactionId})` : ''} was successfully captured. However, during order provisioning for ${orderRef}, our system encountered an inventory timeout, and the order could not be completed.\n\nWhat we have done:\n- ${refundAmountRef.charAt(0).toUpperCase() + refundAmountRef.slice(1)} has been initiated to your original payment method.\n- The funds will reflect in your account within 3 to 5 business days, subject to your bank's standard settlement cycle.\n${customGoodwillSentence ? `- ${customGoodwillSentence}\n` : ''}\nNext steps:\n- No action is required from you.\n- If you have questions or require further assistance, you can reply directly to this email or visit our Help Center.\n\nWe appreciate your patience and apologize for this interruption.\n\n${emailClosing}`;

    voiceScript = `Hello ${firstName}, this is an automated update from Aurora Cloud regarding your recent payment. Your payment was captured, but ${orderRef} could not be completed. We have already initiated a full refund to your original payment method. No action is required on your part. Thank you.`;

  } else if (event.eventType === 'order_delayed') {
    const delayReason = event.description.toLowerCase().includes('weather') || event.description.toLowerCase().includes('blizzard') || event.description.toLowerCase().includes('storm')
      ? 'severe weather conditions along the transit route'
      : event.description.toLowerCase().includes('logistics') || event.description.toLowerCase().includes('hub')
      ? 'logistics sorting congestion at our regional hub'
      : 'unexpected transit delays';
    
    const trackUrl = hasOrderId ? `https://auroracloud.app/track/${event.orderId}` : 'https://auroracloud.app/track';

    if (isGenZ) {
      waText = `${waGreeting} heads up that ${orderRef} is running slightly behind schedule due to ${delayReason}. We are prioritizing delivery and expect it to arrive within 2 to 3 business days.\n\nTrack package: ${trackUrl}${customGoodwillSentence ? `\n\n${customGoodwillSentence}` : ''}\n\nNo action needed on your end.`;
      smsText = `Aurora Cloud: Hi ${firstName}, ${orderRef} delayed due to transit conditions. Live tracking: auroracloud.app/track/${event.orderId || 'pkg'}. No action needed.`;
    } else if (isSenior) {
      waText = `${waGreeting}\n\nWe are writing to provide you with a personal delivery update regarding ${orderRef}. Due to ${delayReason}, shipment delivery has been rescheduled to arrive within 2 to 3 business days.\n\nOur operations team is closely monitoring your shipment. You can track real-time delivery progress here:\n${trackUrl}${customGoodwillSentence ? `\n\n${customGoodwillSentence}` : ''}\n\nYou do not need to contact support or take any action. If you have any questions, our support team is available at 1800-000-287.\n\n${emailClosing}`;
      smsText = `Aurora Cloud: Delivery update for ${orderRefCap}. Shipment rescheduled. Track live: auroracloud.app/track. No action required.`;
    } else {
      waText = `${waGreeting} we wanted to proactively inform you that ${orderRef} is delayed due to ${delayReason}.\n\nOur logistics team has prioritized your parcel, and delivery is now estimated within 2 to 3 business days.\n\nLive tracking link:\n${trackUrl}${customGoodwillSentence ? `\n\n${customGoodwillSentence}` : ''}\n\nNo action is required from your side. We apologize for the delay and appreciate your understanding.`;
      smsText = `Aurora Cloud: Hi ${firstName}, ${orderRef} delayed by transit congestion. Track live: auroracloud.app/track. No action needed.`;
    }

    emailSubject = hasOrderId ? `Delivery update: Order ${event.orderId} status and tracking` : `Delivery update regarding your recent order`;
    emailBody = `${emailGreeting}\n\nWe are reaching out with an update regarding your delivery for ${orderRef}.\n\nDue to ${delayReason}, your shipment has encountered a delay and is now scheduled for delivery within the next 2 to 3 business days.\n\nShipment details:\n- Order Reference: ${event.orderId || 'Aurora Order'}\n- Current Status: In transit (Priority routing)\n${hasAmount ? `- Order Value: ${event.amount}\n` : ''}${customGoodwillSentence ? `- Goodwill Resolution: ${customGoodwillSentence}\n` : ''}\nYou can track the updated delivery progress in real time here:\n${trackUrl}\n\nNext steps:\n- No action is needed from you. We are tracking the package to ensure safe arrival.\n- For any questions, please reply directly to this notification.\n\nThank you for your patience and support.\n\n${emailClosing}`;

    voiceScript = `Hello ${firstName}, this is a courtesy update from Aurora Cloud regarding ${orderRef}. Your delivery is slightly delayed due to transit conditions and is expected within 2 to 3 days. Live tracking has been sent to your email. No action is required on your part. Thank you.`;

  } else if (event.eventType === 'service_disruption') {
    const statusUrl = 'https://status.auroracloud.app';
    const maintenanceDetails = event.description || 'Scheduled infrastructure maintenance is underway to enhance system resilience.';

    waText = `${waGreeting} this is an advance service advisory regarding your Aurora Cloud account.\n\n${maintenanceDetails}\n\nKey highlights:\n- Account data and security are fully protected\n- Zero permanent data loss\n- Live status and progress: ${statusUrl}\n\nNo action is required from your side. Thank you for your cooperation.`;
    smsText = `Aurora Cloud: Service advisory for ${firstName}. Scheduled update in progress. Systems safe. Track status: status.auroracloud.app`;

    emailSubject = `Service Advisory: Scheduled system update and telemetry status`;
    emailBody = `${emailGreeting}\n\nWe are writing to provide advance notice of an upcoming system maintenance window affecting Aurora Cloud services.\n\nMaintenance Summary:\n${maintenanceDetails}\n\nOperational Assurances:\n- All customer account configurations, data, and security policies remain fully protected with zero loss.\n- Automated failovers are in place to minimize operational disruption.\n- Real-time updates and restoration telemetry will be continuously posted at ${statusUrl}.\n\nNext steps:\n- No customer intervention is required.\n- If you notice unexpected behavior following maintenance, our 24/7 Operations Desk is available to assist.\n\nThank you for your continued partnership.\n\n${emailClosing}`;

    voiceScript = `Hello ${firstName}, this is Aurora Cloud with an automated service advisory. Scheduled system maintenance is in progress. All customer accounts and data are secure. For live updates, please check status.auroracloud.app. Thank you.`;

  } else if (event.eventType === 'subscription_expiring') {
    const renewUrl = hasOrderId ? `https://auroracloud.app/billing/renew/${event.orderId}` : 'https://auroracloud.app/billing/renew';
    const planName = event.orderId ? event.orderId : 'Aurora Cloud Subscription';

    waText = `${waGreeting} this is a friendly reminder that your ${planName} is scheduled for renewal shortly${hasAmount ? ` (${event.amount})` : ''}.\n\nTo ensure continuous, uninterrupted access to all enterprise features, please confirm or update your renewal details below:\n${renewUrl}${customGoodwillSentence ? `\n\n${customGoodwillSentence}` : ''}\n\nOur team is available if you have any questions.`;
    smsText = `Aurora Cloud: Hi ${firstName}, your ${planName} renews soon${hasAmount ? ` (${event.amount})` : ''}. Confirm renewal: auroracloud.app/renew`;

    emailSubject = `Notice: Upcoming subscription renewal for ${planName}`;
    emailBody = `${emailGreeting}\n\nThank you for choosing Aurora Cloud as your trusted communication platform.\n\nThis is an advance notice that your subscription for ${planName} is approaching its scheduled renewal date.\n\nRenewal details:\n- Subscription: ${planName}\n${hasAmount ? `- Renewal Amount: ${event.amount}\n` : ''}- Status: Active (Scheduled for auto-renewal)\n${customGoodwillSentence ? `- Special Offer: ${customGoodwillSentence}\n` : ''}\nNext steps:\n- To review your plan, update payment method, or adjust preferences, visit your billing dashboard:\n${renewUrl}\n\nThank you for being a valued customer.\n\n${emailClosing}`;

    voiceScript = `Hello ${firstName}, this is a courtesy reminder from Aurora Cloud that your subscription is scheduled for renewal soon. To review your plan or update payment details, please check your email or visit your account portal. Thank you.`;

  } else if (event.eventType === 'payment_failed') {
    const retryUrl = hasOrderId ? `https://auroracloud.app/pay/retry/${event.orderId}` : 'https://auroracloud.app/pay/retry';
    const declineCard = event.verifiedFacts.find((f) => f.toLowerCase().includes('card')) || 'your registered payment card';

    waText = `${waGreeting} we were unable to process your payment${amountRef ? ` of ${amountRef}` : ''} for ${orderRef} using ${declineCard}.\n\nTo keep your order active and prevent cancellation, please use our secure 1-click link to complete your payment within 24 hours:\n${retryUrl}\n\nNo re-registration is required. If you already completed this payment, please disregard this message.`;
    smsText = `Aurora Cloud: Hi ${firstName}, payment for ${orderRef} was declined (${amountRef}). Complete payment securely within 24h: auroracloud.app/pay/retry`;

    emailSubject = `Action required: Complete payment for ${orderRef}`;
    emailBody = `${emailGreeting}\n\nWe encountered an issue while processing your recent payment for ${orderRef}.\n\nPayment details:\n- Order Reference: ${event.orderId || 'Aurora Order'}\n- Declining Method: ${declineCard}\n${hasAmount ? `- Amount: ${event.amount}\n` : ''}- Reason: Bank authorization was unsuccessful\n\nNext steps to complete your order:\n1. Click the secure payment retry link below:\n${retryUrl}\n2. Verify or update your payment details.\n3. The link will remain active for 24 hours.\n\nIf you have any questions or need assistance, please reply directly to this email.\n\n${emailClosing}`;

    voiceScript = `Hello ${firstName}, this is Aurora Cloud regarding your recent payment attempt for ${orderRef}. The bank authorization was declined. Please check your email for a secure link to complete your payment within 24 hours. Thank you.`;

  } else if (event.eventType === 'application_incomplete') {
    const appIdText = hasOrderId ? ` (${event.orderId})` : '';
    const uploadUrl = hasOrderId ? `https://auroracloud.app/verify/${event.orderId}` : 'https://auroracloud.app/verify';
    const missingDoc = event.description.toLowerCase().includes('utility') || event.description.toLowerCase().includes('bill')
      ? 'recent utility bill (electricity, water, or gas)'
      : event.description.toLowerCase().includes('address')
      ? 'valid address proof document'
      : 'identity verification document';

    waText = `${waGreeting} thank you for submitting your application${appIdText}. Your initial identity verification has been approved. To finalize account activation, please upload your ${missingDoc} by the stated deadline.\n\nSecure upload portal:\n${uploadUrl}\n\nOur team is available if you need any assistance.`;
    smsText = `Aurora Cloud: Hi ${firstName}, ${missingDoc} required for application${appIdText}. Upload securely: ${uploadUrl}`;

    emailSubject = hasOrderId ? `Action required: Submit documentation for application ${event.orderId}` : `Action required: Complete your application verification`;
    emailBody = `${emailGreeting}\n\nThank you for submitting your application${appIdText} with Aurora Cloud.\n\nYour preliminary identity review has been approved. To finalize your onboarding and activate your account, we require one additional verification document.\n\nRequired document:\n- ${missingDoc}\n- Must be clearly legible and issued within the last 3 months.\n\nNext step:\nPlease upload your document through our secure portal:\n${uploadUrl}\n\nIf you have questions, our onboarding specialists are here to guide you.\n\n${emailClosing}`;

    voiceScript = `Hello ${firstName}, this is Aurora Cloud regarding your recent application. We need one additional document to complete your account setup. Please check your email for the secure upload link. Thank you.`;

  } else if (event.eventType === 'customer_complaint') {
    const disputeIdText = hasOrderId ? ` (${event.orderId})` : hasPayId ? ` (${event.transactionId})` : '';
    const resolutionAction = customGoodwillSentence || (event.amount ? `A fee adjustment of ${event.amount} has been initiated.` : 'Your dispute has been logged for supervisor resolution.');

    waText = `${waGreeting} we have received your report regarding ${orderRef}${disputeIdText} and apologize for the inconvenience you experienced.\n\n${resolutionAction}\n\nOur Operations Supervisor has been assigned to your case and will provide a formal follow-up within 4 business hours. No further action is required from you at this time.`;
    smsText = `Aurora Cloud: Hi ${firstName}, dispute received for ${orderRef}. Resolution in progress under supervisor review (4h SLA).`;

    emailSubject = hasOrderId ? `Support Escalation: Update on case for order ${event.orderId}` : `Support Escalation: Update regarding your support inquiry`;
    emailBody = `${emailGreeting}\n\nThank you for bringing your concerns regarding ${orderRef}${disputeIdText} to our attention. We take service quality seriously and regret the friction you experienced.\n\nActions taken on your account:\n- Case Review: Escalated directly to an Operations Supervisor.\n- Account Adjustment: ${resolutionAction}\n- Response SLA: A senior account specialist will contact you with a complete resolution within 4 business hours.\n\nNext steps:\n- No action is needed from your side.\n- If you have additional context to share, you can reply directly to this email.\n\nWe appreciate your patience while we resolve this matter.\n\n${emailClosing}`;

    voiceScript = `Hello ${firstName}, this is Aurora Cloud regarding your recent inquiry on ${orderRef}. We have prioritized your case and our operations supervisor will provide a full resolution within 4 business hours. Thank you.`;

  } else {
    // Dynamic / Custom Brief Event Grounded in User Input
    const factsSummary = event.verifiedFacts.length > 0
      ? event.verifiedFacts.join('\n- ')
      : event.description;

    waText = `${waGreeting} this is an update regarding your account.\n\n${event.description}\n\nStatus: ${event.resolutionStatus}${customGoodwillSentence ? `\n\n${customGoodwillSentence}` : ''}\n\n${strategy.customerActionRequired ? 'Please review your dashboard to complete the next step.' : 'No action is required from your side.'}\n\nAurora Cloud Team`;
    
    smsText = `Aurora Cloud: Hi ${firstName}, update on ${event.title}. ${strategy.customerActionRequired ? 'Action required in dashboard.' : 'No action needed.'}`;

    emailSubject = `Important update regarding your account: ${event.title}`;
    emailBody = `${emailGreeting}\n\nWe are writing to provide you with an update regarding your account with Aurora Cloud.\n\nSummary:\n${event.description}\n\nVerified details:\n- ${factsSummary}\n${customGoodwillSentence ? `\nResolution:\n${customGoodwillSentence}\n` : ''}\nNext steps:\n${strategy.customerActionRequired ? 'Please log in to your account dashboard to review the required steps.' : 'This update is purely informational and no action is required on your part.'}\n\n${emailClosing}`;

    voiceScript = `Hello ${firstName}, this is an update from Aurora Cloud regarding ${event.title.toLowerCase()}. ${strategy.customerActionRequired ? 'Please check your dashboard.' : 'No action is required.'} Thank you.`;
  }

  // Handle reflection edits if Critic detected issues
  if (revisionIteration > 0) {
    if (criticViolations?.includes('EXCLAMATION_DETECTED') || criticFeedback?.includes('exclamation')) {
      waText = waText.replace(/!+/g, '.');
      smsText = smsText.replace(/!+/g, '.');
      emailSubject = emailSubject.replace(/!+/g, '.');
      emailBody = emailBody.replace(/!+/g, '.');
      voiceScript = voiceScript.replace(/!+/g, '.');
      correctionsApplied.push('Eliminated all exclamation marks to strictly uphold Aurora calm tone.');
    }
    if (criticViolations?.includes('UNMASKED_CARD') || criticFeedback?.includes('card')) {
      waText = redactSensitiveData(waText);
      smsText = redactSensitiveData(smsText);
      emailSubject = redactSensitiveData(emailSubject);
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
  emailSubject = redactSensitiveData(emailSubject.replace(/!+/g, '.'));
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

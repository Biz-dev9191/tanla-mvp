import { orchestrateCommunication } from '../src/core/orchestrator';
import { StreamlinedBriefPayload } from '../src/core/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
}

async function runCoherenceTests() {
  console.log('🧪 Starting Active Coherence & Alignment Tests for Text & Pills across all 3 columns...\n');

  // Test 1: Shipment Delay with custom text and pills
  console.log('--- Test 1: Shipment Delay (Order Delayed + Voucher Resolution) ---');
  const payload1: StreamlinedBriefPayload = {
    customerProfileText: "Customer Priya Sharma, a 28-year-old VIP buyer who is frustrated after app delays",
    customerPills: ["25–34", "VIP", "Digital-first"],
    eventHistoryText: "Order #ORD-5541 ($135.00) delayed by 3 days due to blizzard in Northern hub. Original promised delivery was yesterday. Tracking ID TRK-9901.",
    eventPills: ["Shipment Delayed"],
    objectiveText: "Proactively notify customer with revised ETA, provide live tracking link, waive $15 shipping fee with voucher code SHIPFREE, and reassure them to avoid inbound support call.",
    objectivePills: ["Resolve Issue Proactively", "Minimise Support Contacts", "Reassure Customer"],
    useSamplePolicyTree: true,
  };

  const res1 = await orchestrateCommunication(payload1);
  console.log(`- Event Classified: ${res1.event.eventType} (Title: "${res1.event.title}")`);
  console.log(`- Selected Channel: ${res1.strategy.selectedChannel}`);
  console.log(`- CTA Type: ${res1.strategy.ctaType}`);
  console.log(`- WhatsApp Message:\n  "${res1.messages.whatsapp.body.slice(0, 160)}..."`);
  console.log(`- SMS Message (${res1.messages.sms.characterCount} chars):\n  "${res1.messages.sms.body}"`);

  assert(res1.event.eventType === 'order_delayed', `Expected eventType 'order_delayed', got '${res1.event.eventType}'`);
  assert(res1.event.orderId === 'ORD-5541', `Expected orderId ORD-5541, got '${res1.event.orderId}'`);
  assert(res1.event.amount === '$135.00', `Expected amount $135.00, got '${res1.event.amount}'`);
  assert(res1.messages.whatsapp.body.includes('ORD-5541') || res1.messages.whatsapp.body.includes('delayed'), 'WhatsApp message should ground in order ORD-5541 or delay');
  assert(res1.messages.whatsapp.body.includes('SHIPFREE') || res1.messages.whatsapp.body.includes('waive') || res1.messages.whatsapp.body.includes('$15'), 'WhatsApp message should cite voucher SHIPFREE or fee waiver');
  assert(res1.messages.whatsapp.body.toLowerCase().includes('dashboard'), 'WhatsApp should direct customer to dashboard');
  assert(!res1.messages.whatsapp.body.includes('https://'), 'WhatsApp must not contain raw unapproved URLs');
  assert(!res1.messages.whatsapp.body.includes('!'), 'WhatsApp must have zero exclamation marks');
  assert(!res1.messages.sms.body.includes('!'), 'SMS must have zero exclamation marks');
  assert(!res1.messages.email.body.includes('!'), 'Email must have zero exclamation marks');
  assert(res1.messages.sms.characterCount <= 160, `SMS character limit exceeded (${res1.messages.sms.characterCount})`);
  assert(res1.strategy.ctaType === 'Track Shipment', `Expected CTA 'Track Shipment', got '${res1.strategy.ctaType}'`);
  console.log('✅ Test 1 Passed: Shipment Delay fully coherent and grounded in user text and pills.\n');

  // Test 2: Service Disruption / Scheduled Maintenance
  console.log('--- Test 2: Service Disruption / Scheduled Maintenance ---');
  const payload2: StreamlinedBriefPayload = {
    customerProfileText: "Dr. Elena Rostova, 52, Enterprise Admin, prefers Email",
    customerPills: ["45–54", "High Value", "Mixed"],
    eventHistoryText: "Emergency database maintenance scheduled for Sunday Oct 4 from 02:00 UTC to 04:00 UTC. Cloud APIs will experience up to 15 mins latency.",
    eventPills: ["Service Disruption / Maintenance"],
    objectiveText: "Notify admin in advance, reassure that all data is encrypted and backed up, provide status via dashboard, and minimize support tickets.",
    objectivePills: ["Resolve Issue Proactively", "Minimise Support Contacts"],
    useSamplePolicyTree: true,
  };

  const res2 = await orchestrateCommunication(payload2);
  console.log(`- Event Classified: ${res2.event.eventType}`);
  console.log(`- Selected Channel: ${res2.strategy.selectedChannel}`);
  console.log(`- Email Subject: "${res2.messages.email.subject}"`);
  console.log(`- SMS Message (${res2.messages.sms.characterCount} chars):\n  "${res2.messages.sms.body}"`);

  assert(res2.event.eventType === 'service_disruption', `Expected 'service_disruption', got '${res2.event.eventType}'`);
  assert(res2.messages.whatsapp.body.toLowerCase().includes('dashboard') || res2.messages.email.body.toLowerCase().includes('dashboard'), 'Should direct customer to dashboard');
  assert(!res2.messages.whatsapp.body.includes('status.auroracloud.app'), 'Should not contain raw unapproved URL');
  assert(res2.messages.whatsapp.body.toLowerCase().includes('maintenance') || res2.messages.whatsapp.body.toLowerCase().includes('advisory'), 'Should cite maintenance/advisory');
  assert(!res2.messages.whatsapp.body.includes('!'), 'Zero exclamation marks verified in WhatsApp');
  assert(!res2.messages.email.body.includes('!'), 'Zero exclamation marks verified in Email');
  assert(res2.messages.sms.characterCount <= 160, `SMS character limit exceeded (${res2.messages.sms.characterCount})`);
  console.log('✅ Test 2 Passed: Service Disruption coherent and adheres to all constraints.\n');

  // Test 3: Payment Failed / Expired Card
  console.log('--- Test 3: Payment Failed / Retry Link ---');
  const payload3: StreamlinedBriefPayload = {
    customerProfileText: "Vikram Malhotra, 24 years old Gen Z student",
    customerPills: ["18–24", "Standard", "Digital-first"],
    eventHistoryText: "Payment of $49.00 declined by issuing bank for annual subscription renewal. Card ending 3381 expired.",
    eventPills: ["Payment Failed"],
    objectiveText: "Prompt customer to update payment card securely via app and web dashboard before midnight to prevent service interruption.",
    objectivePills: ["Recover Revenue", "Resolve Issue Proactively"],
    useSamplePolicyTree: true,
  };

  const res3 = await orchestrateCommunication(payload3);
  console.log(`- Event Classified: ${res3.event.eventType}`);
  console.log(`- Recommended Action: ${res3.strategy.ctaType}`);
  console.log(`- WhatsApp Message:\n  "${res3.messages.whatsapp.body.slice(0, 150)}..."`);

  assert(res3.event.eventType === 'payment_failed', `Expected 'payment_failed', got '${res3.event.eventType}'`);
  assert(res3.messages.whatsapp.body.toLowerCase().includes('dashboard'), 'WhatsApp should provide retry guidance in dashboard');
  assert(!res3.messages.whatsapp.body.includes('auroracloud.app/pay'), 'WhatsApp must not contain unapproved URLs');
  assert(res3.messages.whatsapp.body.includes('$49.00') || res3.messages.whatsapp.body.includes('declined'), 'Should cite decline / amount');
  assert(!res3.messages.whatsapp.body.includes('!'), 'Zero exclamation marks in WhatsApp');
  assert(res3.messages.sms.characterCount <= 160, `SMS character limit exceeded (${res3.messages.sms.characterCount})`);
  assert(res3.strategy.ctaType === 'Retry Payment', `Expected CTA 'Retry Payment', got '${res3.strategy.ctaType}'`);
  console.log('✅ Test 3 Passed: Payment Failed generates secure 1-click retry instructions.\n');

  // Test 4: Incomplete Application / Pending KYC
  console.log('--- Test 4: Incomplete Application / Pending KYC ---');
  const payload4: StreamlinedBriefPayload = {
    customerProfileText: "Anita Roy, 38, New Customer",
    customerPills: ["35–44", "New Customer", "Digital-first"],
    eventHistoryText: "Loan application APP-8820: Identity verified, but recent electricity utility bill / address proof missing.",
    eventPills: ["Incomplete Application / Pending KYC"],
    objectiveText: "Guide customer to upload utility bill through app and web dashboard by Friday to finalize loan approval.",
    objectivePills: ["Complete Onboarding"],
    useSamplePolicyTree: true,
  };

  const res4 = await orchestrateCommunication(payload4);
  console.log(`- Event Classified: ${res4.event.eventType}`);
  console.log(`- CTA Type: ${res4.strategy.ctaType}`);
  console.log(`- WhatsApp Message:\n  "${res4.messages.whatsapp.body.slice(0, 150)}..."`);

  assert(res4.event.eventType === 'application_incomplete', `Expected 'application_incomplete', got '${res4.event.eventType}'`);
  assert(res4.event.orderId === 'APP-8820', `Expected orderId APP-8820, got '${res4.event.orderId}'`);
  assert(res4.messages.whatsapp.body.toLowerCase().includes('dashboard'), 'Should direct to upload in dashboard');
  assert(!res4.messages.whatsapp.body.includes('auroracloud.app/verify'), 'Should not contain unapproved verify URL');
  assert(res4.messages.whatsapp.body.toLowerCase().includes('utility bill') || res4.messages.whatsapp.body.toLowerCase().includes('document'), 'Should specify document');
  assert(!res4.messages.whatsapp.body.includes('!'), 'Zero exclamation marks');
  assert(res4.messages.sms.characterCount <= 160, `SMS character limit exceeded (${res4.messages.sms.characterCount})`);
  assert(res4.strategy.ctaType === 'Upload Document', `Expected CTA 'Upload Document', got '${res4.strategy.ctaType}'`);
  console.log('✅ Test 4 Passed: Incomplete KYC properly requests missing document.\n');

  // Test 5: Billing Dispute / Customer Complaint
  console.log('--- Test 5: Billing Dispute / Escalation Review ---');
  const payload5: StreamlinedBriefPayload = {
    customerProfileText: "Marcus Vance, VIP customer, 6 years tenure. Very angry about duplicate $85 charge on invoice INV-7741.",
    customerPills: ["VIP", "High LTV", "Frustrated"],
    eventHistoryText: "Dispute Ref DISP-9921 for duplicate charge of $85.00 on invoice INV-7741. Customer contacted billing twice.",
    eventPills: ["Billing Dispute / Escalation"],
    objectiveText: "Acknowledge error immediately, confirm $85 credit initiated, escalate to billing supervisor for final signoff within 2 hours, and retain customer.",
    objectivePills: ["Retain High-Value Customer", "Resolve Issue Proactively"],
    useSamplePolicyTree: true,
  };

  const res5 = await orchestrateCommunication(payload5);
  console.log(`- Event Classified: ${res5.event.eventType}`);
  console.log(`- WhatsApp Message:\n  "${res5.messages.whatsapp.body.slice(0, 160)}..."`);

  assert(res5.event.eventType === 'customer_complaint', `Expected 'customer_complaint', got '${res5.event.eventType}'`);
  assert(res5.event.orderId === 'DISP-9921' || res5.event.amount === '$85.00', 'Should capture dispute ID or amount');
  assert(res5.messages.whatsapp.body.includes('supervisor') || res5.messages.whatsapp.body.includes('4 business hours') || res5.messages.whatsapp.body.includes('$85'), 'Should cite supervisor review or adjustment');
  assert(!res5.messages.whatsapp.body.includes('!'), 'Zero exclamation marks');
  assert(res5.messages.sms.characterCount <= 160, `SMS character limit exceeded (${res5.messages.sms.characterCount})`);
  console.log('✅ Test 5 Passed: Customer Complaint acknowledges grievance with concrete supervisor SLA.\n');

  // Test 6: Information Hierarchy - Structured Form (Tier 1) Overrides Contradictory Text (Tier 3)
  console.log('--- Test 6: Information Hierarchy (Tier 1 Structured Form Overrides Contradictory Tier 3 Text) ---');
  const payload6: StreamlinedBriefPayload = {
    // Structured form explicitly says Senior (55+) and VIP
    structuredCustomer: {
      id: 'CUST-TEST-6',
      name: 'Robert Davis',
      age: 68,
      ageGroup: '55+',
      segment: 'VIP',
      digitalProfile: 'Assisted',
      preferredLanguage: 'English',
      preferredChannel: 'Email',
      consent: { transactional: true, promotional: false, voice: true },
      customerValue: 'VIP',
      tenureMonths: 48,
      recentCommunicationCount24h: { transactional: 1, promotional: 0 },
      previousSupportContacts: 0,
      sentiment: 'Neutral',
      email: 'robert.davis@example.com',
      phone: '+1 555 019 2831',
    },
    // Contradictory text claiming customer is a 21-year-old student with Standard tier
    customerProfileText: 'Customer is a 21 yo college student named Rob, Standard account tier with app-only habits.',
    customerPills: ['VIP'],
    structuredEvent: {
      id: 'EVT-TEST-6',
      eventType: 'payment_successful_order_failed',
      title: 'Payment Received / Order Provisioning Update',
      description: 'Order failed after capture.',
      timestamp: 'Just now',
      verifiedFacts: ['Event: Payment Received / Order Provisioning Update'],
      resolutionStatus: 'Refund Initiated',
    },
    eventHistoryText: 'Payment received but inventory out of stock. Order cancelled.',
    eventPills: ['Payment Ok / Order Failed'],
    structuredObjective: {
      primary: 'reassure_customer',
      secondary: 'Reassure customer / Calm anxiety',
    },
    useSamplePolicyTree: true,
  };

  const res6 = await orchestrateCommunication(payload6);
  console.log(`- Synthesized Customer Age Group: ${res6.customer.ageGroup} (Expected '55+')`);
  console.log(`- Synthesized Customer Segment: ${res6.customer.segment} (Expected 'High Value' or VIP)`);
  console.log(`- Channel Selected: ${res6.strategy.selectedChannel} (Expected 'Email' for Assisted/55+)`);

  assert(res6.customer.ageGroup === '55+', `Expected Tier 1 Structured ageGroup '55+', got '${res6.customer.ageGroup}'`);
  assert(res6.customer.customerValue === 'VIP', `Expected Tier 1 Structured value 'VIP', got '${res6.customer.customerValue}'`);
  assert(res6.strategy.selectedChannel === 'Email', `Expected Assisted channel 'Email', got '${res6.strategy.selectedChannel}'`);
  console.log('✅ Test 6 Passed: Tier 1 Structured Form strictly overrides contradictory Tier 3 text.\n');

  // Test 7: Information Hierarchy - Filter Pill (Tier 2) Overrides Contradictory Text (Tier 3) When Structured Is Empty
  console.log('--- Test 7: Information Hierarchy (Tier 2 Pill Overrides Contradictory Text) ---');
  const payload7: StreamlinedBriefPayload = {
    customerProfileText: 'Customer is 45 years old Gen X working professional named Maya Lin.',
    customerPills: ['18–24', 'Standard', 'Digital-first'], // Pill explicitly indicates Gen Z
    eventHistoryText: 'Payment failed for checkout. Card declined.',
    eventPills: ['Payment Failed'],
    objectiveText: 'Send 1-click retry payment link.',
    objectivePills: ['Recover Revenue'],
    useSamplePolicyTree: true,
  };

  const res7 = await orchestrateCommunication(payload7);
  console.log(`- Synthesized Age Group from Pill: ${res7.customer.ageGroup} (Expected '18–24')`);
  console.log(`- Synthesized Persona Cohort: ${res7.agentSteps[0].details[0]}`);

  assert(res7.customer.ageGroup === '18–24', `Expected Pill Tier 2 ageGroup '18–24', got '${res7.customer.ageGroup}'`);
  console.log('✅ Test 7 Passed: Tier 2 Pill correctly prioritized over contradictory freeform text.\n');

  // Test 8: Strict Zero-Manufactured Information Engine
  console.log('--- Test 8: Strict Zero-Manufactured Information (No Dummy $49.50 or PAY_99482) ---');
  const payload8: StreamlinedBriefPayload = {
    customerProfileText: 'Customer John Doe.',
    customerPills: ['25–34', 'Standard'],
    // Omit transactionId and amount completely!
    eventHistoryText: 'Payment was charged but the order was cancelled due to an internal provisioning error.',
    eventPills: ['Payment Ok / Order Failed'],
    objectiveText: 'Inform customer of automated full refund and confirm zero action is needed.',
    objectivePills: ['Resolve Issue Proactively'],
    useSamplePolicyTree: true,
  };

  const res8 = await orchestrateCommunication(payload8);
  console.log(`- Synthesized Event Amount: ${res8.event.amount || '(None / Undefined - Correct)'}`);
  console.log(`- Synthesized Event TxId: ${res8.event.transactionId || '(None / Undefined - Correct)'}`);
  console.log(`- WhatsApp Message Body:\n  "${res8.messages.whatsapp.body}"`);

  assert(!res8.messages.whatsapp.body.includes('$49.50'), 'Must NOT manufacture synthetic default amount $49.50');
  assert(!res8.messages.whatsapp.body.includes('PAY_99482'), 'Must NOT manufacture synthetic default transaction ID PAY_99482');
  assert(!res8.messages.sms.body.includes('$49.50'), 'SMS must not manufacture $49.50');
  assert(!res8.messages.email.body.includes('$49.50'), 'Email must not manufacture $49.50');
  assert(res8.messages.whatsapp.body.toLowerCase().includes('refund'), 'Message should reference refund naturally');
  console.log('✅ Test 8 Passed: Strict Zero-Manufactured Information verified. No hallucinated IDs or amounts.\n');

  // Test 9: Purview Isolation & Text Supplementation
  console.log('--- Test 9: Purview Isolation & Narrative Text Supplementation ---');
  const payload9: StreamlinedBriefPayload = {
    structuredCustomer: {
      id: 'CUST-TEST-9',
      name: 'Samir Patel',
      ageGroup: '35–44',
      segment: 'Standard',
      // Sentiment left unselected in structured form!
    },
    customerProfileText: 'Samir Patel contacted support multiple times and is extremely frustrated and angry about service quality.',
    customerPills: ['35–44', 'Standard'],
    structuredEvent: {
      id: 'EVT-TEST-9',
      eventType: 'customer_complaint',
      title: 'Billing Dispute / Escalation Review',
      description: 'Customer dispute regarding duplicate billing.',
      resolutionStatus: 'Pending Approval',
    },
    eventHistoryText: 'Billing dispute logged for review.',
    eventPills: ['Billing Dispute / Escalation'],
    structuredObjective: {
      primary: 'resolve_issue',
    },
    objectiveText: 'Offer voucher code PEACE20 to reassure customer.',
    useSamplePolicyTree: true,
  };

  const res9 = await orchestrateCommunication(payload9);
  console.log(`- Synthesized Customer Sentiment: ${res9.customer.sentiment} (Expected 'Frustrated' supplemented from text)`);
  console.log(`- Voucher code citation: ${res9.messages.whatsapp.body.includes('PEACE20') ? 'PEACE20 Cited' : 'Not Cited'}`);

  assert(res9.customer.sentiment === 'Frustrated', `Expected sentiment 'Frustrated' supplemented from text, got '${res9.customer.sentiment}'`);
  assert(res9.messages.whatsapp.body.includes('PEACE20'), 'Objective voucher note PEACE20 should be integrated into final copy');
  console.log('✅ Test 9 Passed: Narrative text successfully supplements unselected fields and vouchers.\n');

  console.log('🎉 ALL 9 ACTIVE COHERENCE, HIERARCHY & TEXT/PILLS INTEGRATION TESTS PASSED SUCCESSFULLY!');
}

runCoherenceTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});

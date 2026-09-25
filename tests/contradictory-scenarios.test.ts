import { orchestrateCommunication } from '../src/core/orchestrator';
import { CustomerProfile, BusinessEvent, BusinessObjective, PolicyRule } from '../src/core/types';

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  details: string[];
  durationMs: number;
}

const testResults: TestResult[] = [];

function assert(condition: boolean, message: string, details: string[]) {
  if (condition) {
    details.push(`  [PASS] ${message}`);
  } else {
    details.push(`  [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTest(
  name: string,
  category: string,
  testFn: (details: string[]) => Promise<void>
) {
  const start = Date.now();
  const details: string[] = [];
  try {
    await testFn(details);
    testResults.push({
      name,
      category,
      passed: true,
      details,
      durationMs: Date.now() - start,
    });
    console.log(`PASS: ${name} (${Date.now() - start}ms)`);
  } catch (err: any) {
    testResults.push({
      name,
      category,
      passed: false,
      details: [...details, `  [ERROR] ${err.message}`],
      durationMs: Date.now() - start,
    });
    console.error(`FAIL: ${name} (${Date.now() - start}ms) - ${err.message}`);
  }
}

async function main() {
  console.log('================================================================');
  console.log('AURORA CLOUD ORCHESTRATOR - CONTRADICTORY SCENARIOS TEST SUITE');
  console.log('================================================================\n');

  // ----------------------------------------------------------------------------------
  // TEST CASE 1: Promotional Upsell Goal during Critical Transaction Failure (Distress vs Upsell)
  // ----------------------------------------------------------------------------------
  await runTest(
    'Scenario 1: Promotional Upsell Goal during Critical Order/Payment Failure',
    'Policy & Anti-Cross-Sell',
    async (details) => {
      const customer: CustomerProfile = {
        id: 'CUST-TEST-01',
        name: 'Arjun Kapoor',
        age: 29,
        ageGroup: '25–34',
        segment: 'High Value',
        digitalProfile: 'Digital-first',
        preferredLanguage: 'English',
        preferredChannel: 'WhatsApp',
        consent: { transactional: true, promotional: true, voice: false },
        customerValue: 'VIP',
        tenureMonths: 24,
        recentCommunicationCount24h: { transactional: 1, promotional: 0 },
        previousSupportContacts: 2,
        sentiment: 'Anxious',
        email: 'arjun.kapoor@example.com',
        phone: '+91 98111 22233',
      };

      const event: BusinessEvent = {
        id: 'EVT-TEST-01',
        eventType: 'payment_successful_order_failed',
        title: 'Payment captured but inventory allocation timed out',
        description: 'Customer paid $149.00 for order #ORD-9901, but the order failed inventory allocation.',
        timestamp: 'Just now',
        verifiedFacts: [
          'Payment ID: PAY_9901 ($149.00)',
          'Order #ORD-9901 failed inventory provisioning',
          'Automated refund initiated to card ending in 8832',
          'Refund reference: REF_990122',
        ],
        resolutionStatus: 'Refund Initiated',
        transactionId: 'PAY_9901',
        orderId: 'ORD-9901',
        amount: '$149.00',
      };

      // Contradictory Objective: Brief wants to upsell/cross-sell during an active transaction failure
      const objective: BusinessObjective = {
        primary: 'increase_conversion',
        secondary: 'Pitch annual subscription discount code to increase conversion',
        customNote: 'Pitch 20% discount on Annual Pro tier upgrade right now!',
      };

      const result = await orchestrateCommunication(customer, event, objective);

      assert(result !== null, 'Orchestrator returned a result', details);
      assert(result.strategy.decision === 'SEND', 'Decision is SEND for transactional refund notice', details);
      assert(result.strategy.customerActionRequired === false, 'Zero customer action required', details);
      assert(result.messages.whatsapp.body.includes('refund'), 'WhatsApp message confirms refund', details);
      assert(!result.messages.whatsapp.body.includes('!'), 'WhatsApp message contains zero exclamation marks', details);
      assert(!result.messages.sms.body.includes('!'), 'SMS message contains zero exclamation marks', details);
      assert(!result.messages.email.body.includes('!'), 'Email message contains zero exclamation marks', details);
      assert(result.guardrails.toneAlignment.passed === true, 'Tone alignment guardrail passed', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // TEST CASE 2: Promotional Campaign vs Explicit Promotional Opt-Out (Consent Contradiction)
  // ----------------------------------------------------------------------------------
  await runTest(
    'Scenario 2: Promotional Campaign sent to Customer with Promotional Opt-Out (DND)',
    'Consent Governance (POL-CONS-001)',
    async (details) => {
      const customer: CustomerProfile = {
        id: 'CUST-TEST-02',
        name: 'Priya Sharma',
        age: 48,
        ageGroup: '45–54',
        segment: 'Standard',
        digitalProfile: 'Mixed',
        preferredLanguage: 'English',
        preferredChannel: 'Email',
        consent: {
          transactional: true,
          promotional: false, // EXPLICIT OPT-OUT / DND
          voice: false,
        },
        customerValue: 'Standard',
        tenureMonths: 12,
        recentCommunicationCount24h: { transactional: 0, promotional: 0 },
        previousSupportContacts: 0,
        sentiment: 'Neutral',
        email: 'priya.sharma@example.com',
        phone: '+91 98222 33344',
      };

      const event: BusinessEvent = {
        id: 'EVT-TEST-02',
        eventType: 'promotional_opportunity',
        title: 'Exclusive Diwali 30% Cloud Storage Upgrade Offer',
        description: 'Targeted marketing campaign offering 30% off cloud storage renewals.',
        timestamp: 'Just now',
        verifiedFacts: ['Promotional campaign ID: DIWALI_2026', '30% discount voucher: CLOUD30'],
        resolutionStatus: 'None Required',
      };

      const objective: BusinessObjective = {
        primary: 'increase_conversion',
        secondary: 'Drive promotional upgrade campaign engagement',
      };

      const result = await orchestrateCommunication(customer, event, objective);

      assert(result.strategy.decision === 'SUPPRESS', 'Strategy decision must be SUPPRESS', details);
      assert(
        result.strategy.suppressionReason?.includes('POL-CONS-001') === true,
        'Suppression reason must cite POL-CONS-001 consent policy',
        details
      );
      assert(result.guardrails.status === 'SUPPRESS', 'Guardrail evaluation status is SUPPRESS', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // TEST CASE 3: Transactional Opt-Out vs Transactional Notification (Consent Contradiction)
  // ----------------------------------------------------------------------------------
  await runTest(
    'Scenario 3: Transactional Message sent to Customer with Transactional Opt-Out',
    'Consent Governance (POL-CONS-001)',
    async (details) => {
      const customer: CustomerProfile = {
        id: 'CUST-TEST-03',
        name: 'Vikram Mehta',
        age: 35,
        ageGroup: '35–44',
        segment: 'Premium',
        digitalProfile: 'Digital-first',
        preferredLanguage: 'English',
        preferredChannel: 'SMS',
        consent: {
          transactional: false, // Transactional opt-out
          promotional: false,
          voice: false,
        },
        customerValue: 'High',
        tenureMonths: 6,
        recentCommunicationCount24h: { transactional: 0, promotional: 0 },
        previousSupportContacts: 0,
        sentiment: 'Neutral',
        email: 'vikram.mehta@example.com',
        phone: '+91 98333 44455',
      };

      const event: BusinessEvent = {
        id: 'EVT-TEST-03',
        eventType: 'payment_successful_order_failed',
        title: 'Payment captured but order failed',
        description: 'Auto-refund initiated for failed order.',
        timestamp: 'Just now',
        verifiedFacts: ['Refund initiated'],
        resolutionStatus: 'Refund Initiated',
      };

      const objective: BusinessObjective = {
        primary: 'resolve_issue',
      };

      const result = await orchestrateCommunication(customer, event, objective);

      assert(result.strategy.decision === 'SUPPRESS', 'Strategy decision is SUPPRESS due to transactional opt-out', details);
      assert(result.strategy.suppressionReason?.includes('POL-CONS-001') === true, 'Suppressed under POL-CONS-001', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // TEST CASE 4: Attention Fatigue Limit Exceeded vs Routine Update (Fatigue Overload Contradiction)
  // ----------------------------------------------------------------------------------
  await runTest(
    'Scenario 4: High Attention Fatigue (3 msgs in 24h) vs Routine Low-Severity Notice',
    'Fatigue Governance (POL-FAT-001)',
    async (details) => {
      const customer: CustomerProfile = {
        id: 'CUST-TEST-04',
        name: 'Neha Gupta',
        age: 30,
        ageGroup: '25–34',
        segment: 'Standard',
        digitalProfile: 'Digital-first',
        preferredLanguage: 'English',
        preferredChannel: 'SMS',
        consent: { transactional: true, promotional: true, voice: false },
        customerValue: 'Standard',
        tenureMonths: 18,
        recentCommunicationCount24h: {
          transactional: 3, // Already received 3 transactional messages in 24h!
          promotional: 1,
        },
        previousSupportContacts: 1,
        sentiment: 'Frustrated',
        email: 'neha.gupta@example.com',
        phone: '+91 98444 55566',
      };

      const event: BusinessEvent = {
        id: 'EVT-TEST-04',
        eventType: 'service_disruption',
        title: 'Routine scheduled cloud maintenance window',
        description: 'Low-severity routine server patch with 0 downtime.',
        timestamp: '5 mins ago',
        verifiedFacts: ['Window: 02:00 AM UTC', 'Zero expected downtime'],
        resolutionStatus: 'None Required',
      };

      const objective: BusinessObjective = {
        primary: 'inform_customer',
        secondary: 'Prevent attention fatigue',
      };

      const result = await orchestrateCommunication(customer, event, objective);

      assert(result.strategy.decision === 'SUPPRESS', 'Strategy decision must be SUPPRESS for saturated fatigue', details);
      assert(result.strategy.suppressionReason?.includes('POL-FAT-001') === true, 'Suppression reason cites POL-FAT-001', details);
      assert(result.guardrails.status === 'SUPPRESS', 'Guardrail status is SUPPRESS', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // TEST CASE 5: Unauthorized High-Value Goodwill Credit vs Autonomous Financial Limits
  // ----------------------------------------------------------------------------------
  await runTest(
    'Scenario 5: Discretionary $250 Compensation Request vs Autonomous Limit Gate',
    'Financial Governance (POL-FIN-001)',
    async (details) => {
      const customer: CustomerProfile = {
        id: 'CUST-TEST-05',
        name: 'David Chen',
        age: 44,
        ageGroup: '35–44',
        segment: 'High Value',
        digitalProfile: 'Mixed',
        preferredLanguage: 'English',
        preferredChannel: 'Email',
        consent: { transactional: true, promotional: false, voice: true },
        customerValue: 'VIP',
        tenureMonths: 48,
        recentCommunicationCount24h: { transactional: 1, promotional: 0 },
        previousSupportContacts: 4,
        sentiment: 'Frustrated',
        email: 'david.chen@enterprise.com',
        phone: '+1 415 555 0199',
      };

      const event: BusinessEvent = {
        id: 'EVT-TEST-05',
        eventType: 'customer_complaint',
        title: 'Delayed enterprise shipment with $150 compensation request',
        description: 'Shipment #ENT-5520 delayed by 5 days. Customer demands $150 credit voucher.',
        timestamp: 'Just now',
        verifiedFacts: [
          'Order #ENT-5520 delayed by carrier',
          'Delivery fee waiver ($25.00) auto-processed',
          '$150 credit request requires supervisor authorization',
        ],
        resolutionStatus: 'Pending Approval',
        orderId: 'ENT-5520',
        amount: '$150.00 Credit Request',
      };

      const objective: BusinessObjective = {
        primary: 'retain_customer',
        secondary: 'Enforce human supervisor gate under POL-FIN-001',
      };

      const result = await orchestrateCommunication(customer, event, objective);

      assert(result.strategy.humanApprovalRequired === true, 'humanApprovalRequired must be true', details);
      assert(result.strategy.decision === 'ESCALATE', 'Strategy decision must be ESCALATE', details);
      assert(result.humanApprovalStatus === 'Pending' || result.humanApprovalStatus === 'Not Required', 'Approval status is flagged', details);
      assert(result.clauseCitations.some(c => c.clauseId === 'POL-FIN-001'), 'Cites clause POL-FIN-001', details);
      assert(result.guardrails.policyCompliance.passed === true || result.guardrails.status === 'ESCALATE', 'Policy compliance evaluated with escalation', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // TEST CASE 6: Zero-Action Resolution vs Flawed Brief Requesting Customer Action
  // ----------------------------------------------------------------------------------
  await runTest(
    'Scenario 6: Automated Refund (Zero Action Needed) vs Flawed Prompt demanding Customer Contact Support',
    'Support Deflection & Action Resolution',
    async (details) => {
      const customer: CustomerProfile = {
        id: 'CUST-TEST-06',
        name: 'Sunita Rao',
        age: 62,
        ageGroup: '55+',
        segment: 'Standard',
        digitalProfile: 'Assisted',
        preferredLanguage: 'English',
        preferredChannel: 'Email',
        consent: { transactional: true, promotional: true, voice: true },
        customerValue: 'Standard',
        tenureMonths: 36,
        recentCommunicationCount24h: { transactional: 0, promotional: 0 },
        previousSupportContacts: 1,
        sentiment: 'Anxious',
        email: 'sunita.rao@example.com',
        phone: '+91 98555 66677',
      };

      const event: BusinessEvent = {
        id: 'EVT-TEST-06',
        eventType: 'payment_successful_order_failed',
        title: 'Payment succeeded, order canceled, auto-refund initiated',
        description: 'Auto-refund of $49.50 initiated to original card ending in 4012.',
        timestamp: 'Just now',
        verifiedFacts: [
          'Payment ID: PAY_99482 ($49.50)',
          'Auto-refund initiated to card ending 4012',
          'Settlement timeframe: 3 to 5 business days',
        ],
        resolutionStatus: 'Refund Initiated',
        transactionId: 'PAY_99482',
        orderId: 'ORD-7721',
        amount: '$49.50',
      };

      // Flawed contradictory objective in brief asking customer to call support
      const objective: BusinessObjective = {
        primary: 'resolve_issue',
        secondary: 'Misleading prompt asking customer to call support line immediately',
        customNote: 'Ask customer to immediately call support to get their refund processed!',
      };

      const result = await orchestrateCommunication(customer, event, objective);

      assert(result.strategy.customerActionRequired === false, 'customerActionRequired must be false', details);
      assert(result.strategy.ctaType === 'None', 'CTA type must be None', details);
      assert(
        result.messages.email.body.toLowerCase().includes('no action is required') ||
        result.messages.email.body.toLowerCase().includes('no action needed') ||
        result.messages.email.body.toLowerCase().includes('do not need to take any action'),
        'Email body explicitly informs customer that zero action is required',
        details
      );
      assert(!result.messages.email.body.includes('!'), 'Email body contains zero exclamation marks', details);
      assert(!result.messages.sms.body.includes('!'), 'SMS body contains zero exclamation marks', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // TEST CASE 7: Sensitive PII in Prompt vs Automatic Redaction Engine
  // ----------------------------------------------------------------------------------
  await runTest(
    'Scenario 7: Unmasked 16-digit Credit Card in Input Telemetry vs PII Redaction Engine',
    'Privacy & Data Protection (RG-PRV-01)',
    async (details) => {
      const customer: CustomerProfile = {
        id: 'CUST-TEST-07',
        name: 'Anita Desai',
        age: 48,
        ageGroup: '45–54',
        segment: 'Premium',
        digitalProfile: 'Mixed',
        preferredLanguage: 'English',
        preferredChannel: 'WhatsApp',
        consent: { transactional: true, promotional: true, voice: false },
        customerValue: 'High',
        tenureMonths: 20,
        recentCommunicationCount24h: { transactional: 0, promotional: 0 },
        previousSupportContacts: 2,
        sentiment: 'Neutral',
        email: 'anita.desai@example.com',
        phone: '+91 98666 77788',
      };

      // Raw unmasked 16-digit card in description
      const event: BusinessEvent = {
        id: 'EVT-TEST-07',
        eventType: 'payment_successful_order_failed',
        title: 'Payment captured but order canceled',
        description: 'Auto-refund processed to card 4111 2222 3333 4012 with reference REF_1102.',
        timestamp: 'Just now',
        verifiedFacts: ['Card 4111 2222 3333 4012 refunded'],
        resolutionStatus: 'Refund Initiated',
        transactionId: 'PAY_1102',
      };

      const objective: BusinessObjective = {
        primary: 'resolve_issue',
      };

      const result = await orchestrateCommunication(customer, event, objective);

      // Verify that unmasked 16 digit card is NOT present in any message payload
      const unmaskedCardRegex = /4111[ -]?2222[ -]?3333/;
      assert(!unmaskedCardRegex.test(result.messages.whatsapp.body), 'WhatsApp message masks 16-digit card', details);
      assert(!unmaskedCardRegex.test(result.messages.sms.body), 'SMS message masks 16-digit card', details);
      assert(!unmaskedCardRegex.test(result.messages.email.body), 'Email message masks 16-digit card', details);
      assert(result.guardrails.privacyCheck.passed === true, 'Privacy check guardrail passed', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // TEST CASE 8: Streamlined Natural Language Brief with Contradictory Inbound Claims
  // ----------------------------------------------------------------------------------
  await runTest(
    'Scenario 8: Streamlined Free-Text Brief with Incompatible Persona and Channel Overrides',
    'Streamlined Dual-Mode Orchestration',
    async (details) => {
      const payload = {
        customerProfileText: 'Customer: David Chen, 81 years old (Silent Generation pensioner). First-time user, prefers assisted service.',
        eventHistoryText: 'Payment of $120.00 (PAY_FAIL_1092) declined for order ORD-8832. Urgent retry link required.',
        objectiveText: 'Drive 1-click payment retry and provide telephone assistance number.',
        customerPills: ['55+', 'Standard', 'Assisted-service'],
        eventPills: ['Payment Failed'],
        objectivePills: ['Complete Onboarding', 'Recover Revenue'],
      };

      const result = await orchestrateCommunication(payload);

      assert(result.customer.ageGroup === '55+', 'Customer ageGroup mapped to 55+', details);
      assert(result.customer.digitalProfile === 'Assisted', 'Customer digital profile mapped to Assisted', details);
      assert(result.event.eventType === 'payment_failed', 'Event type correctly extracted as payment_failed', details);
      assert(result.strategy.selectedChannel === 'Email', 'Assisted senior customer routed to Email with phone helpline', details);
      assert(!result.messages.email.body.includes('!'), 'Email body contains zero exclamation marks', details);
      assert(result.guardrails.toneAlignment.passed === true, 'Tone alignment verified', details);
    }
  );

  // Print Summary Table
  console.log('\n================================================================');
  console.log('TEST EXECUTION SUMMARY');
  console.log('================================================================');
  
  let passedCount = 0;
  testResults.forEach((t, i) => {
    const icon = t.passed ? '✓' : '✗';
    console.log(`${icon} [${i + 1}/${testResults.length}] ${t.name} (${t.durationMs}ms)`);
    if (t.passed) passedCount++;
  });

  console.log('----------------------------------------------------------------');
  console.log(`Total: ${testResults.length} | Passed: ${passedCount} | Failed: ${testResults.length - passedCount}`);
  console.log('================================================================\n');

  if (passedCount !== testResults.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});

import { orchestrateCommunication } from '../src/core/orchestrator';
import { CustomerProfile, BusinessEvent, BusinessObjective, PolicyRule } from '../src/core/types';
import { parsePolicyDocumentText } from '../src/core/policy-generator';

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
  console.log('AURORA CLOUD - GOVERNANCE ARCHITECTURE & POLICY MODIFICATION TESTS');
  console.log('================================================================\n');

  // Base Customer
  const baseCustomer: CustomerProfile = {
    id: 'CUST-GOV-01',
    name: 'Vikram Patel',
    age: 34,
    ageGroup: '25–34',
    segment: 'High Value',
    digitalProfile: 'Digital-first',
    preferredLanguage: 'English',
    preferredChannel: 'WhatsApp',
    consent: { transactional: true, promotional: true, voice: false },
    customerValue: 'VIP',
    tenureMonths: 24,
    recentCommunicationCount24h: { transactional: 1, promotional: 0 },
    previousSupportContacts: 1,
    sentiment: 'Anxious',
    email: 'vikram.patel@example.com',
    phone: '+91 98111 55443',
  };

  // ----------------------------------------------------------------------------------
  // AMOUNT TEST 1: Standard Small Amount ($49.50) Auto-Refund (No Human Intervention)
  // ----------------------------------------------------------------------------------
  await runTest(
    'Amount Test 1: Standard Auto-Refund ($49.50) Processes Autonomously Without Human Intervention',
    'Financial Amounts Governance',
    async (details) => {
      const event: BusinessEvent = {
        id: 'EVT-AMT-01',
        eventType: 'payment_successful_order_failed',
        title: 'Order provisioning failed after successful payment',
        description: 'Auto-refund initiated for $49.50.',
        timestamp: 'Just now',
        verifiedFacts: ['Payment ID: PAY_101 ($49.50)', 'Auto-refund initiated to card ending 4012'],
        resolutionStatus: 'Refund Initiated',
        transactionId: 'PAY_101',
        amount: '$49.50',
      };
      const objective: BusinessObjective = { primary: 'resolve_issue' };

      const result = await orchestrateCommunication(baseCustomer, event, objective);

      assert(result.strategy.decision === 'SEND', 'Decision is SEND', details);
      assert(result.strategy.humanApprovalRequired === false, 'humanApprovalRequired is false', details);
      assert(result.humanApprovalStatus === 'Not Required', 'humanApprovalStatus is Not Required', details);
      assert(result.guardrails.status === 'PASS', 'Guardrails status is PASS', details);
      assert(!result.messages.whatsapp.body.includes('!'), 'Zero exclamation marks in WhatsApp', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // AMOUNT TEST 2: Discretionary $150 Goodwill Credit Request (Requires Human Intervention)
  // ----------------------------------------------------------------------------------
  await runTest(
    'Amount Test 2: Discretionary $150 Goodwill Credit Escalates to Human Supervisor Gate',
    'Financial Amounts Governance',
    async (details) => {
      const event: BusinessEvent = {
        id: 'EVT-AMT-02',
        eventType: 'customer_complaint',
        title: 'Delivery delay with $150 credit compensation request',
        description: 'Customer demands $150 goodwill credit voucher due to shipment delay.',
        timestamp: 'Just now',
        verifiedFacts: ['Shipment delayed 5 days', '$150 goodwill credit requested'],
        resolutionStatus: 'Pending Approval',
        amount: '$150.00 Credit Request',
      };
      const objective: BusinessObjective = { primary: 'retain_customer' };

      const result = await orchestrateCommunication(baseCustomer, event, objective);

      assert(result.strategy.decision === 'ESCALATE', 'Decision is ESCALATE', details);
      assert(result.strategy.humanApprovalRequired === true, 'humanApprovalRequired is true', details);
      assert(result.humanApprovalStatus === 'Pending', 'humanApprovalStatus is Pending', details);
      assert(result.strategy.approvalReason?.includes('POL-FIN-001') === true, 'Approval reason cites POL-FIN-001', details);
      assert(result.clauseCitations.some(c => c.clauseId === 'POL-FIN-001'), 'Cites POL-FIN-001 clause', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // AMOUNT TEST 3: High-Value $500 Dispute Compensation (Requires Human Intervention)
  // ----------------------------------------------------------------------------------
  await runTest(
    'Amount Test 3: High-Value $500 Monetary Dispute Escalates to Human Supervisor Gate',
    'Financial Amounts Governance',
    async (details) => {
      const event: BusinessEvent = {
        id: 'EVT-AMT-03',
        eventType: 'customer_complaint',
        title: 'Enterprise contract dispute with $500 compensation claim',
        description: 'Customer requesting $500 settlement voucher and supervisor review.',
        timestamp: 'Just now',
        verifiedFacts: ['Enterprise SLA breached', '$500 settlement requested'],
        resolutionStatus: 'Pending Approval',
        amount: '$500.00',
      };
      const objective: BusinessObjective = { primary: 'retain_customer' };

      const result = await orchestrateCommunication(baseCustomer, event, objective);

      assert(result.strategy.decision === 'ESCALATE', 'Strategy decision is ESCALATE', details);
      assert(result.strategy.humanApprovalRequired === true, 'humanApprovalRequired is true', details);
      assert(result.humanApprovalStatus === 'Pending', 'humanApprovalStatus is Pending', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // POLICY MODIFICATION TEST 1: Applying Custom Rule Restricting Autonomous Cap to $50
  // ----------------------------------------------------------------------------------
  await runTest(
    'Policy Mod Test 1: Modified Policy with Strict $50 Cap on a $120 Transaction Triggers Escalation',
    'Dynamic Policy Modification',
    async (details) => {
      // Event: $120.00 transaction (under default policy this would be auto-refunded)
      const event: BusinessEvent = {
        id: 'EVT-MOD-01',
        eventType: 'payment_successful_order_failed',
        title: 'Order provisioning failed after $120 payment',
        description: 'Order timed out. Refund requested for $120.00.',
        timestamp: 'Just now',
        verifiedFacts: ['Payment ID: PAY_881 ($120.00)', 'Order ORD-881 failed'],
        resolutionStatus: 'Refund Initiated',
        transactionId: 'PAY_881',
        amount: '$120.00',
      };
      const objective: BusinessObjective = { primary: 'resolve_issue' };

      // Modified Custom Policy Rules: Cap autonomous actions to $50
      const customRules: PolicyRule[] = [
        {
          id: 'CUSTOM-POL-01',
          nodePath: 'Custom Governance > Financial Controls > Refund Caps',
          category: 'financial',
          title: 'Strict $50 Autonomous Refund Cap',
          rule: 'All refunds or compensation exceeding $50.00 require human supervisor authorization prior to dispatch.',
          condition: 'amount_check',
          allowedActions: ['Route to supervisor approval queue for amounts over $50.00'],
          prohibitedActions: ['Do not auto-dispatch refunds exceeding $50.00 without supervisor approval'],
          escalationRequired: true,
          priority: 'critical',
        },
      ];

      const result = await orchestrateCommunication(
        baseCustomer,
        event,
        objective,
        undefined,
        customRules
      );

      assert(result.appliedPolicies.length === 1, 'Applied 1 custom policy rule', details);
      assert(result.strategy.humanApprovalRequired === true, 'humanApprovalRequired is true under modified policy', details);
      assert(result.strategy.decision === 'ESCALATE', 'Strategy decision is ESCALATE under modified policy', details);
      assert(result.humanApprovalStatus === 'Pending', 'humanApprovalStatus is Pending under modified policy', details);
      assert(result.clauseCitations.some(c => c.clauseId === 'CUSTOM-POL-01'), 'Cites CUSTOM-POL-01 clause', details);
      assert(
        result.strategy.approvalReason?.toLowerCase().includes('custom policy') === true ||
        result.strategy.approvalReason?.includes('CUSTOM-POL-01') === true ||
        result.strategy.approvalReason?.includes('exceeds') === true,
        'Approval reason explains custom policy breach',
        details
      );
    }
  );

  // ----------------------------------------------------------------------------------
  // POLICY MODIFICATION TEST 2: Custom Document Ingestion with Dynamic Tree Parsing
  // ----------------------------------------------------------------------------------
  await runTest(
    'Policy Mod Test 2: Ingestion of Raw Custom Policy Document Text and Dynamic Governance Enforcement',
    'Dynamic Policy Modification',
    async (details) => {
      const customDocText = `
        Section 1.0: Enterprise Communication & Security Directive
        - All communications must strictly mask payment card details to the last 4 digits.
        - Zero exclamation marks are permitted in any customer-facing copy.
        - Section 2.0: Financial Governance Rules
        - Compensation vouchers or fee credits exceeding $25.00 require human supervisor approval.
        - Do not promise instant settlement without backend telemetry confirmation.
      `;

      const parsed = parsePolicyDocumentText(customDocText);
      assert(parsed.rules.length > 0, `Successfully parsed ${parsed.rules.length} custom policy rules from text`, details);
      assert(parsed.tree !== null, 'Generated dynamic Policy Tree from text', details);

      const event: BusinessEvent = {
        id: 'EVT-MOD-02',
        eventType: 'customer_complaint',
        title: 'Customer complaint requesting $75 goodwill fee credit',
        description: 'Customer requesting $75 fee credit. Unmasked card 5555 4444 3333 4012 in notes.',
        timestamp: 'Just now',
        verifiedFacts: ['Dispute logged', '$75 fee credit requested'],
        resolutionStatus: 'Pending Approval',
        amount: '$75.00 Credit',
      };
      const objective: BusinessObjective = { primary: 'retain_customer' };

      const result = await orchestrateCommunication(
        baseCustomer,
        event,
        objective,
        undefined,
        parsed.rules,
        customDocText
      );

      assert(result.strategy.humanApprovalRequired === true, 'humanApprovalRequired is true due to $75 > $25 rule', details);
      assert(result.humanApprovalStatus === 'Pending', 'humanApprovalStatus is Pending', details);
      assert(!result.messages.whatsapp.body.includes('!'), 'Zero exclamation marks verified in WhatsApp', details);
      assert(!result.messages.email.body.includes('!'), 'Zero exclamation marks verified in Email', details);
      assert(!result.messages.whatsapp.body.includes('5555 4444 3333'), '16-digit card is redacted', details);
      assert(result.guardrails.privacyCheck.passed === true, 'Privacy check passed', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // POLICY MODIFICATION TEST 3: Dynamic Re-Run after Human Approval / Policy Modification
  // ----------------------------------------------------------------------------------
  await runTest(
    'Policy Mod Test 3: Permissive Policy Modification allowing Autonomous Processing up to $200',
    'Dynamic Policy Modification',
    async (details) => {
      const event: BusinessEvent = {
        id: 'EVT-MOD-03',
        eventType: 'payment_successful_order_failed',
        title: 'Order provisioning failed for $120.00 order',
        description: 'Auto-refund initiated for $120.00.',
        timestamp: 'Just now',
        verifiedFacts: ['Payment ID: PAY_992 ($120.00)', 'Auto-refund initiated'],
        resolutionStatus: 'Refund Initiated',
        transactionId: 'PAY_992',
        amount: '$120.00',
      };
      const objective: BusinessObjective = { primary: 'resolve_issue' };

      // Modified Permissive Policy: Allows autonomous refunds up to $200
      const permissiveRules: PolicyRule[] = [
        {
          id: 'PERM-POL-01',
          nodePath: 'Custom Governance > Financial Controls > Permissive Caps',
          category: 'financial',
          title: 'High-Limit $200 Autonomous Cap',
          rule: 'Automated refunds under $200.00 are pre-approved for instant autonomous dispatch.',
          condition: 'permissive_amount',
          allowedActions: ['Instant automated refund dispatch up to $200.00'],
          prohibitedActions: ['Do not escalate refunds under $200.00'],
          escalationRequired: false,
          priority: 'high',
        },
      ];

      const result = await orchestrateCommunication(
        baseCustomer,
        event,
        objective,
        undefined,
        permissiveRules
      );

      assert(result.strategy.humanApprovalRequired === false, 'humanApprovalRequired is false under permissive policy', details);
      assert(result.strategy.decision === 'SEND', 'Strategy decision is SEND', details);
      assert(result.humanApprovalStatus === 'Not Required', 'humanApprovalStatus is Not Required', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // GUARDRAILS TEST 1: Full 7-Point Guardrail Verification on Complex Multi-Turn Event
  // ----------------------------------------------------------------------------------
  await runTest(
    'Guardrails Test 1: Deterministic 7-Point Guardrail Verification (Accuracy, Policy, Privacy, Tone, Bounds, Fatigue, Promises)',
    'Guardrail Engine Verification',
    async (details) => {
      const customer: CustomerProfile = {
        id: 'CUST-GD-01',
        name: 'Meera Sen',
        age: 66,
        ageGroup: '55+',
        segment: 'Standard',
        digitalProfile: 'Assisted',
        preferredLanguage: 'English',
        preferredChannel: 'Email',
        consent: { transactional: true, promotional: false, voice: true },
        customerValue: 'Standard',
        tenureMonths: 36,
        recentCommunicationCount24h: { transactional: 1, promotional: 0 },
        previousSupportContacts: 2,
        sentiment: 'Anxious',
        email: 'meera.sen@example.com',
        phone: '+91 98222 11100',
      };

      const event: BusinessEvent = {
        id: 'EVT-GD-01',
        eventType: 'payment_successful_order_failed',
        title: 'Order provisioning failed after card deduction',
        description: 'Customer card ending 4012 charged $49.50 (PAY_99482) for ORD-7721, but order canceled.',
        timestamp: 'Just now',
        verifiedFacts: [
          'Payment ID: PAY_99482 ($49.50)',
          'Order ORD-7721 canceled due to inventory',
          'Auto-refund initiated to card ending 4012 (REF_882103)',
        ],
        resolutionStatus: 'Refund Initiated',
        transactionId: 'PAY_99482',
        orderId: 'ORD-7721',
        amount: '$49.50',
      };

      const objective: BusinessObjective = {
        primary: 'reassure_customer',
        secondary: 'Eliminate customer anxiety and support deflection',
      };

      const result = await orchestrateCommunication(customer, event, objective);

      assert(result.guardrails.factualAccuracy.passed === true, '1. Factual accuracy passed', details);
      assert(result.guardrails.policyCompliance.passed === true, '2. Policy compliance passed', details);
      assert(result.guardrails.privacyCheck.passed === true, '3. Privacy & PII check passed', details);
      assert(result.guardrails.toneAlignment.passed === true, '4. Tone alignment passed (zero exclamation marks)', details);
      assert(result.guardrails.channelFit.passed === true, '5. Channel fit & character bounds passed', details);
      assert(result.guardrails.fatigueCheck.passed === true, '6. Fatigue check passed', details);
      assert(result.guardrails.unsupportedPromises.detected === false, '7. Unsupported promises check passed', details);
      assert(!result.messages.email.body.includes('!'), 'Email body has 0 exclamation marks', details);
      assert(!result.messages.sms.body.includes('!'), 'SMS body has 0 exclamation marks', details);
      assert(!result.messages.whatsapp.body.includes('!'), 'WhatsApp body has 0 exclamation marks', details);
      assert(!result.messages.voice.body.includes('!'), 'Voice script has 0 exclamation marks', details);
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

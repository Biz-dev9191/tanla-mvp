import { orchestrateCommunication } from '../src/core/orchestrator';
import { CustomerProfile, BusinessEvent, BusinessObjective, PolicyRule } from '../src/core/types';
import { parsePolicyDocumentText } from '../src/core/policy-generator';
import { userDocumentText } from './user-policy-document.test';

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
      assert(result.strategy.approvalReason?.includes('supervisor') === true, 'Approval reason requires supervisor', details);
      assert(result.clauseCitations.length === 0, 'No clause citations when no policy uploaded', details);
      assert(result.appliedPolicies.length === 0, 'No applied policies when no policy uploaded', details);
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

  // ----------------------------------------------------------------------------------
  // POLICY MODIFICATION TEST 4: High Threshold ($500) Policy with Routine Small Amount ($25)
  // ----------------------------------------------------------------------------------
  await runTest(
    'Policy Mod Test 4: High Threshold ($500) Policy with Small Amount ($25.00) Executes Autonomously Without Escalation',
    'Dynamic Policy Modification',
    async (details) => {
      const event: BusinessEvent = {
        id: 'EVT-MOD-04',
        eventType: 'payment_successful_order_failed',
        title: 'Order provisioning failed for small $25 transaction',
        description: 'Auto-refund initiated for $25.00.',
        timestamp: 'Just now',
        verifiedFacts: ['Payment ID: PAY_551 ($25.00)', 'Auto-refund initiated to card ending 4012'],
        resolutionStatus: 'Refund Initiated',
        transactionId: 'PAY_551',
        amount: '$25.00',
      };
      const objective: BusinessObjective = { primary: 'resolve_issue' };

      // High threshold policy ($500 limit)
      const highLimitRules: PolicyRule[] = [
        {
          id: 'CUSTOM-POL-HIGH',
          nodePath: 'Custom Governance > Financial Controls > High Limit Refund Policy',
          category: 'financial',
          title: 'Autonomous Refund Cap up to $500',
          rule: 'Refunds exceeding $500.00 require human supervisor authorization prior to dispatch.',
          condition: 'amount_check_threshold_500',
          allowedActions: ['Process refunds up to $500.00 autonomously'],
          prohibitedActions: ['Do not auto-dispatch refunds exceeding $500.00 without supervisor approval'],
          escalationRequired: true,
          thresholdAmount: 500,
          priority: 'critical',
        },
      ];

      const result = await orchestrateCommunication(
        baseCustomer,
        event,
        objective,
        undefined,
        highLimitRules
      );

      assert(result.strategy.decision === 'SEND', 'Decision is SEND for $25.00 <= $500.00 limit', details);
      assert(result.strategy.humanApprovalRequired === false, 'humanApprovalRequired is false', details);
      assert(result.humanApprovalStatus === 'Not Required', 'humanApprovalStatus is Not Required', details);
      assert(result.guardrails.status === 'PASS', 'Guardrails status is PASS', details);
      assert(!result.messages.whatsapp.body.includes('!'), 'WhatsApp has zero exclamation marks', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // POLICY MODIFICATION TEST 5: Dynamic Threshold Update from High ($1000) to Low ($500) on Same $750 Transaction
  // ----------------------------------------------------------------------------------
  await runTest(
    'Policy Mod Test 5: Dynamic Threshold Update from $1000 Cap (Autonomous) to $500 Cap (Escalates) on Same $750 Transaction',
    'Dynamic Policy Modification',
    async (details) => {
      const event: BusinessEvent = {
        id: 'EVT-MOD-05',
        eventType: 'payment_successful_order_failed',
        title: 'Order provisioning failed for $750 transaction',
        description: 'Auto-refund initiated for $750.00.',
        timestamp: 'Just now',
        verifiedFacts: ['Payment ID: PAY_750 ($750.00)', 'Auto-refund initiated'],
        resolutionStatus: 'Refund Initiated',
        transactionId: 'PAY_750',
        amount: '$750.00',
      };
      const objective: BusinessObjective = { primary: 'resolve_issue' };

      // Phase 1: High Cap ($1000) -> $750 is within limit
      const highLimit1000: PolicyRule[] = [
        {
          id: 'CUSTOM-CAP-1000',
          nodePath: 'Custom Governance > Financial Controls > $1000 Cap',
          category: 'financial',
          title: '$1000 Refund Autonomous Limit',
          rule: 'Refunds exceeding $1000.00 require human supervisor approval.',
          condition: 'amount_check_threshold_1000',
          allowedActions: ['Autonomous dispatch under $1000.00'],
          prohibitedActions: ['Do not auto-dispatch refunds exceeding $1000.00'],
          escalationRequired: true,
          thresholdAmount: 1000,
          priority: 'critical',
        },
      ];

      const res1 = await orchestrateCommunication(baseCustomer, event, objective, undefined, highLimit1000);
      assert(res1.strategy.decision === 'SEND', 'Phase 1: Decision is SEND under $1000 threshold', details);
      assert(res1.strategy.humanApprovalRequired === false, 'Phase 1: humanApprovalRequired is false', details);
      assert(res1.humanApprovalStatus === 'Not Required', 'Phase 1: humanApprovalStatus is Not Required', details);

      // Phase 2: Policy modified to lower cap ($500) -> $750 now exceeds limit
      const lowLimit500: PolicyRule[] = [
        {
          id: 'CUSTOM-CAP-500',
          nodePath: 'Custom Governance > Financial Controls > $500 Cap',
          category: 'financial',
          title: '$500 Refund Autonomous Limit',
          rule: 'Refunds exceeding $500.00 require human supervisor approval.',
          condition: 'amount_check_threshold_500',
          allowedActions: ['Autonomous dispatch under $500.00'],
          prohibitedActions: ['Do not auto-dispatch refunds exceeding $500.00'],
          escalationRequired: true,
          thresholdAmount: 500,
          priority: 'critical',
        },
      ];

      const res2 = await orchestrateCommunication(baseCustomer, event, objective, undefined, lowLimit500);
      assert(res2.strategy.decision === 'ESCALATE', 'Phase 2: Decision transitions to ESCALATE under $500 threshold', details);
      assert(res2.strategy.humanApprovalRequired === true, 'Phase 2: humanApprovalRequired is true', details);
      assert(res2.humanApprovalStatus === 'Pending', 'Phase 2: humanApprovalStatus is Pending', details);
      assert(res2.strategy.approvalReason?.includes('exceeds') === true, 'Phase 2: Approval reason cites amount exceeding limit', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // POLICY MODIFICATION TEST 6: Multi-Clause Raw Document Ingestion with $500 Limit and Multi-Scenario Events
  // ----------------------------------------------------------------------------------
  await runTest(
    'Policy Mod Test 6: Ingestion of Raw Policy Document with $500 Limit Tested Against Multi-Scenario Events',
    'Dynamic Policy Modification',
    async (details) => {
      const docText = `
        # Enterprise Customer Communication & Refund Policy
        **Document ID:** POL-2026-MULTI  |  **Version:** 3.0  |  **Status:** Active

        # 1. Transactional & Order Guidelines
        - For failed orders with captured payments, immediately initiate auto-refund and cite payment ID.
        - Reassure customer that zero action is required on their part.
        - Automated refunds up to $500.00 are processed autonomously without supervisor intervention.
        - Refunds exceeding $500.00 require human supervisor approval before dispatch.

        # 2. Privacy & Data Protection
        - Always mask payment cards to the last 4 digits (e.g. **** 4012).
        - Zero exclamation marks are permitted in customer copy.

        # 3. Dispute Escalations
        - Customer complaints or billing disputes must be escalated to human supervisor review.
      `;

      const parsed = parsePolicyDocumentText(docText);
      assert(parsed.isValid === true, 'Parsed multi-clause document successfully', details);
      assert(parsed.rules.length >= 4, `Extracted ${parsed.rules.length} active governance rules`, details);

      // Scenario 6A: Small $35 auto-refund -> Autonomous
      const eventSmall: BusinessEvent = {
        id: 'EVT-6A',
        eventType: 'payment_successful_order_failed',
        title: 'Small order failure $35',
        description: 'Auto-refund initiated for $35.00.',
        timestamp: 'Just now',
        verifiedFacts: ['Payment ID: PAY_6A ($35.00)', 'Auto-refund initiated'],
        resolutionStatus: 'Refund Initiated',
        transactionId: 'PAY_6A',
        amount: '$35.00',
      };
      const resSmall = await orchestrateCommunication(baseCustomer, eventSmall, { primary: 'resolve_issue' }, undefined, parsed.rules, docText);
      assert(resSmall.strategy.decision === 'SEND', 'Scenario 6A ($35): Decision is SEND', details);
      assert(resSmall.strategy.humanApprovalRequired === false, 'Scenario 6A: humanApprovalRequired is false', details);
      assert(resSmall.humanApprovalStatus === 'Not Required', 'Scenario 6A: humanApprovalStatus is Not Required', details);

      // Scenario 6B: Large $650 auto-refund -> Exceeds $500 threshold
      const eventLarge: BusinessEvent = {
        id: 'EVT-6B',
        eventType: 'payment_successful_order_failed',
        title: 'Large order failure $650',
        description: 'Order failed for $650.00 purchase.',
        timestamp: 'Just now',
        verifiedFacts: ['Payment ID: PAY_6B ($650.00)', 'Order provisioning failed'],
        resolutionStatus: 'Refund Initiated',
        transactionId: 'PAY_6B',
        amount: '$650.00',
      };
      const resLarge = await orchestrateCommunication(baseCustomer, eventLarge, { primary: 'resolve_issue' }, undefined, parsed.rules, docText);
      assert(resLarge.strategy.decision === 'ESCALATE', 'Scenario 6B ($650): Decision is ESCALATE', details);
      assert(resLarge.strategy.humanApprovalRequired === true, 'Scenario 6B: humanApprovalRequired is true', details);
      assert(resLarge.humanApprovalStatus === 'Pending', 'Scenario 6B: humanApprovalStatus is Pending', details);
      assert(resLarge.strategy.approvalReason?.includes('exceeds') === true, 'Scenario 6B: Approval reason cites threshold breach', details);

      // Scenario 6C: Dispute event with small amount ($15) -> Escalates due to dispute clause
      const eventDispute: BusinessEvent = {
        id: 'EVT-6C',
        eventType: 'customer_complaint',
        title: 'Customer complaint regarding incorrect charge of $15',
        description: 'Customer dispute regarding billing charge. Supervisor review requested.',
        timestamp: 'Just now',
        verifiedFacts: ['Dispute logged', 'Disputed charge $15.00'],
        resolutionStatus: 'Pending Approval',
        amount: '$15.00',
      };
      const resDispute = await orchestrateCommunication(baseCustomer, eventDispute, { primary: 'retain_customer' }, undefined, parsed.rules, docText);
      assert(resDispute.strategy.decision === 'ESCALATE', 'Scenario 6C (Dispute): Decision is ESCALATE', details);
      assert(resDispute.strategy.humanApprovalRequired === true, 'Scenario 6C: humanApprovalRequired is true', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // POLICY MODIFICATION TEST 7: Full 98-Clause Enterprise Policy (REF-COM-001) with Routine $25 Auto-Refund
  // ----------------------------------------------------------------------------------
  await runTest(
    'Policy Mod Test 7: Full 98-Clause Enterprise Policy (REF-COM-001) Executes Small $25.00 Routine Refund Autonomously',
    'Dynamic Policy Modification',
    async (details) => {
      const parsed = parsePolicyDocumentText(userDocumentText);
      assert(parsed.isValid === true, 'Parsed REF-COM-001 successfully', details);
      assert(parsed.rules.length > 50, `Parsed full policy tree with ${parsed.rules.length} clauses`, details);

      const event: BusinessEvent = {
        id: 'EVT-USER-POL-01',
        eventType: 'payment_successful_order_failed',
        title: 'Order provisioning failed after successful payment',
        description: 'Auto-refund initiated for $25.00 per policy REF-COM-001 Section 7.',
        timestamp: 'Just now',
        verifiedFacts: ['Payment ID: PAY_9981 ($25.00)', 'Order ORD_9981 failed', 'Auto-refund initiated'],
        resolutionStatus: 'Refund Initiated',
        transactionId: 'PAY_9981',
        orderId: 'ORD_9981',
        amount: '$25.00',
      };

      const result = await orchestrateCommunication(
        baseCustomer,
        event,
        { primary: 'resolve_issue' },
        undefined,
        parsed.rules,
        userDocumentText
      );

      assert(result.strategy.decision === 'SEND', 'Routine refund under REF-COM-001 is SEND', details);
      assert(result.strategy.humanApprovalRequired === false, 'humanApprovalRequired is false for verified routine refund', details);
      assert(result.humanApprovalStatus === 'Not Required', 'humanApprovalStatus is Not Required', details);
      assert(result.guardrails.status === 'PASS', 'Guardrails status is PASS', details);
      assert(!result.messages.whatsapp.body.includes('!'), 'WhatsApp message has zero exclamation marks', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // POLICY MODIFICATION TEST 8: When Greater or Equal to 0 Amount is Set, Every Refund/Coupon Requires Human Intervention
  // ----------------------------------------------------------------------------------
  await runTest(
    'Policy Mod Test 8: Policy Rule with Greater or Equal to 0 Amount Requires Human Intervention for Every Refund/Coupon',
    'Dynamic Policy Modification',
    async (details) => {
      // Policy rule specifying greater or equal to 0 amount
      const gteZeroRules: PolicyRule[] = [
        {
          id: 'POL-GTE-ZERO',
          nodePath: 'Custom Governance > Financial Controls > Zero Tolerance Policy',
          category: 'financial',
          title: 'All Refunds and Coupons >= $0 Require Authorization',
          rule: 'Any refund or discount coupon greater than or equal to 0 requires human supervisor intervention prior to transmission.',
          condition: 'amount_gte_0',
          allowedActions: ['Route to supervisor queue for any amount >= $0'],
          prohibitedActions: ['Do not auto-dispatch refunds or coupons >= $0 without supervisor review'],
          escalationRequired: true,
          thresholdAmount: 0,
          priority: 'critical',
        },
      ];

      // Scenario 8A: Standard small refund of $25.00
      const refundEvent: BusinessEvent = {
        id: 'EVT-8A',
        eventType: 'payment_successful_order_failed',
        title: 'Small refund $25',
        description: 'Auto-refund initiated for $25.00.',
        timestamp: 'Just now',
        verifiedFacts: ['Payment ID: PAY_8A ($25.00)', 'Refund initiated'],
        resolutionStatus: 'Refund Initiated',
        transactionId: 'PAY_8A',
        amount: '$25.00',
      };
      const res8A = await orchestrateCommunication(baseCustomer, refundEvent, { primary: 'resolve_issue' }, undefined, gteZeroRules);
      assert(res8A.strategy.decision === 'ESCALATE', 'Scenario 8A ($25 refund): Decision is ESCALATE', details);
      assert(res8A.strategy.humanApprovalRequired === true, 'Scenario 8A: humanApprovalRequired is true', details);
      assert(res8A.humanApprovalStatus === 'Pending', 'Scenario 8A: humanApprovalStatus is Pending', details);

      // Scenario 8B: $0.00 refund
      const zeroRefundEvent: BusinessEvent = {
        id: 'EVT-8B',
        eventType: 'payment_successful_order_failed',
        title: 'Zero dollar refund $0',
        description: 'Order canceled. Zero-fee refund processed for $0.00.',
        timestamp: 'Just now',
        verifiedFacts: ['Payment ID: PAY_8B ($0.00)'],
        resolutionStatus: 'Refund Initiated',
        transactionId: 'PAY_8B',
        amount: '$0.00',
      };
      const res8B = await orchestrateCommunication(baseCustomer, zeroRefundEvent, { primary: 'resolve_issue' }, undefined, gteZeroRules);
      assert(res8B.strategy.decision === 'ESCALATE', 'Scenario 8B ($0 refund): Decision is ESCALATE', details);
      assert(res8B.strategy.humanApprovalRequired === true, 'Scenario 8B: humanApprovalRequired is true', details);
      assert(res8B.humanApprovalStatus === 'Pending', 'Scenario 8B: humanApprovalStatus is Pending', details);

      // Scenario 8C: Coupon / goodwill credit request
      const couponEvent: BusinessEvent = {
        id: 'EVT-8C',
        eventType: 'promotional_opportunity',
        title: 'Customer goodwill coupon discount request',
        description: 'Customer requesting discount voucher or coupon credit.',
        timestamp: 'Just now',
        verifiedFacts: ['Customer requested discount voucher coupon'],
        resolutionStatus: 'In Progress',
        amount: '15% Coupon',
      };
      const res8C = await orchestrateCommunication(baseCustomer, couponEvent, { primary: 'retain_customer' }, undefined, gteZeroRules);
      assert(res8C.strategy.decision === 'ESCALATE', 'Scenario 8C (Coupon): Decision is ESCALATE', details);
      assert(res8C.strategy.humanApprovalRequired === true, 'Scenario 8C: humanApprovalRequired is true', details);
      assert(res8C.humanApprovalStatus === 'Pending', 'Scenario 8C: humanApprovalStatus is Pending', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // POLICY MODIFICATION TEST 9: Policy Rule with "above $0" Amount Requires Human Intervention
  // ----------------------------------------------------------------------------------
  await runTest(
    'Policy Mod Test 9: Policy Rule with Above $0 Threshold Requires Human Intervention for Routine Refunds and Coupons',
    'Dynamic Policy Modification',
    async (details) => {
      const aboveZeroRules: PolicyRule[] = [
        {
          id: 'POL-ABOVE-ZERO',
          nodePath: 'Custom Governance > Financial Controls > Zero Tolerance Cap',
          category: 'financial',
          title: 'All Refunds Above $0 Require Supervisor Approval',
          rule: 'All refunds and goodwill compensation vouchers above $0 require human supervisor approval.',
          condition: 'above_0',
          allowedActions: ['Escalate all transactions above $0 to supervisor review'],
          prohibitedActions: ['Do not auto-dispatch refunds above $0 without review'],
          escalationRequired: true,
          thresholdAmount: 0,
          priority: 'critical',
        },
      ];

      const event: BusinessEvent = {
        id: 'EVT-9',
        eventType: 'payment_successful_order_failed',
        title: 'Routine auto-refund for $49.50',
        description: 'Auto-refund initiated for $49.50.',
        timestamp: 'Just now',
        verifiedFacts: ['Payment ID: PAY_9 ($49.50)', 'Refund initiated'],
        resolutionStatus: 'Refund Initiated',
        transactionId: 'PAY_9',
        amount: '$49.50',
      };

      const result = await orchestrateCommunication(baseCustomer, event, { primary: 'resolve_issue' }, undefined, aboveZeroRules);
      assert(result.strategy.decision === 'ESCALATE', 'Decision is ESCALATE under above $0 rule', details);
      assert(result.strategy.humanApprovalRequired === true, 'humanApprovalRequired is true', details);
      assert(result.humanApprovalStatus === 'Pending', 'humanApprovalStatus is Pending', details);
      assert(result.strategy.approvalReason?.includes('>= $0') === true || result.strategy.approvalReason?.includes('POL-ABOVE-ZERO') === true, 'Approval reason explains zero threshold gate', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // POLICY MODIFICATION TEST 10: When Policy Does Not Mention Refund/Coupon Limits, Guardrail Is Not Used
  // ----------------------------------------------------------------------------------
  await runTest(
    'Policy Mod Test 10: When Policy Does Not Mention Refund/Coupon Limits, Guardrail Is Not Used and Execution Is Autonomous',
    'Dynamic Policy Modification',
    async (details) => {
      // Policy document strictly about Privacy and Tone; NO mention of refund caps, coupons, or compensation limits
      const nonFinancialPolicyText = `
        # Enterprise Security and Tone Policy
        **Document ID:** SEC-TONE-01  |  **Version:** 1.0  |  **Status:** Active

        # 1. Privacy and Data Redaction
        - All customer communications must mask payment card numbers to the last 4 digits.
        - Never transmit plaintext passwords or authentication tokens in customer notifications.

        # 2. Communication Tenor
        - All communications must maintain a calm, competent, and reassuring tenor.
        - Zero exclamation marks are permitted across all outbound copy.
      `;

      const parsed = parsePolicyDocumentText(nonFinancialPolicyText);
      assert(parsed.isValid === true, 'Parsed non-financial policy document successfully', details);
      assert(parsed.rules.length >= 2, `Extracted ${parsed.rules.length} security and tone rules`, details);

      // Event: $150.00 refund transaction
      const event: BusinessEvent = {
        id: 'EVT-10',
        eventType: 'payment_successful_order_failed',
        title: 'Order provisioning failed for $150 purchase',
        description: 'Auto-refund initiated for $150.00. Card ending in 4012 charged.',
        timestamp: 'Just now',
        verifiedFacts: ['Payment ID: PAY_10 ($150.00)', 'Auto-refund initiated to card ending 4012'],
        resolutionStatus: 'Refund Initiated',
        transactionId: 'PAY_10',
        amount: '$150.00',
      };

      const result = await orchestrateCommunication(
        baseCustomer,
        event,
        { primary: 'resolve_issue' },
        undefined,
        parsed.rules,
        nonFinancialPolicyText
      );

      // Since the policy does not mention refund/coupon limits, no financial guardrail is used
      assert(result.strategy.decision === 'SEND', 'Decision is SEND because policy does not mention refund caps', details);
      assert(result.strategy.humanApprovalRequired === false, 'humanApprovalRequired is false', details);
      assert(result.humanApprovalStatus === 'Not Required', 'humanApprovalStatus is Not Required', details);
      assert(result.guardrails.status === 'PASS', 'Guardrails status is PASS without unmentioned guardrails', details);
      assert(!result.messages.whatsapp.body.includes('!'), 'WhatsApp has zero exclamation marks', details);
      assert(!result.messages.email.body.includes('!'), 'Email has zero exclamation marks', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // Test 11: Applied Policy Citations Isolates Strictly Escalation-Triggering Policies
  // ----------------------------------------------------------------------------------
  await runTest(
    'Policy Citation Test 11: Applied Policy Citations Isolates Strictly Escalation-Triggering Policies',
    'Policy Citations',
    async (details) => {
      const policyWithEscalation = `# Enterprise Refund & Compliance Policy

## Section 1: Customer Communication Directives
- Ground all communication strictly in verified factual telemetry and policy constraints.
- Never expose full credit card numbers or banking passwords. Always mask to last 4 digits (e.g. **** 4012).

## Section 2: Authorization & Monetary Limits
- Standard refunds up to $100.00 proceed autonomously.
- Any discretionary goodwill compensation or credit above $50.00 requires documented human supervisor approval prior to outbound transmission.
`;

      const parsed = parsePolicyDocumentText(policyWithEscalation);
      assert(parsed.isValid, 'Policy is validly parsed', details);

      // Event A: Discretionary compensation $75 -> triggers human supervisor escalation
      const escalationEvent: BusinessEvent = {
        id: 'evt-comp-75',
        eventType: 'customer_complaint',
        title: 'Customer Demands Goodwill Compensation',
        description: 'Customer experienced service delay and requested goodwill credit voucher.',
        amount: '$75.00 goodwill credit',
        timestamp: '2026-09-25T10:00:00Z',
        verifiedFacts: ['Delay was 45 minutes', 'Customer requested $75 credit voucher'],
        resolutionStatus: 'Requires Customer Action',
      };

      const resultEscalation = await orchestrateCommunication(
        baseCustomer,
        escalationEvent,
        { primary: 'reassure_customer' },
        undefined,
        parsed.rules,
        policyWithEscalation
      );

      assert(resultEscalation.strategy.humanApprovalRequired === true, 'Human approval required for $75 goodwill credit', details);
      const triggeredEscalations = resultEscalation.appliedPolicies.filter(p => p.escalationTriggered);
      assert(triggeredEscalations.length > 0, 'At least 1 policy flagged as escalationTriggered', details);
      assert(
        triggeredEscalations.some(p => p.title.toLowerCase().includes('goodwill') || p.title.toLowerCase().includes('authorization') || p.rule.includes('50.00')),
        'Cited policy is specifically the supervisor escalation clause',
        details
      );

      // Event B: Routine autonomous refund $25 -> no human intervention required
      const autonomousEvent: BusinessEvent = {
        id: 'evt-refund-25',
        eventType: 'payment_successful_order_failed',
        title: 'Routine Automatic Refund',
        description: 'Payment captured but inventory depleted. Automatic refund initiated.',
        amount: '$25.00',
        timestamp: '2026-09-25T10:05:00Z',
        verifiedFacts: ['Payment captured', 'Refund $25.00 initiated'],
        resolutionStatus: 'Refund Initiated',
      };

      const resultAutonomous = await orchestrateCommunication(
        baseCustomer,
        autonomousEvent,
        { primary: 'resolve_issue' },
        undefined,
        parsed.rules,
        policyWithEscalation
      );

      assert(resultAutonomous.strategy.humanApprovalRequired === false, 'Autonomous event does not require human approval', details);
      const autonomousEscalations = resultAutonomous.appliedPolicies.filter(p => p.escalationTriggered);
      assert(autonomousEscalations.length === 0, 'Zero policies flagged as escalationTriggered for autonomous event', details);
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

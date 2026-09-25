import { parsePolicyDocumentText, validatePolicyDocumentText } from '../src/core/policy-generator';
import { orchestrateCommunication } from '../src/core/orchestrator';
import { CustomerProfile, BusinessEvent, BusinessObjective } from '../src/core/types';

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
  console.log('AURORA CLOUD - POLICY TREE GENERATION & RAILGUARDS TEST SUITE');
  console.log('================================================================\n');

  // ----------------------------------------------------------------------------------
  // TEST 1: Rejection of Keyboard Spam / Random Characters
  // ----------------------------------------------------------------------------------
  await runTest(
    'Test 1: Strict Rejection of Keyboard Spam & Random Characters',
    'Railguard Validation',
    async (details) => {
      const spamInput = 'asdfghjklqwertyuiopzxcvbnm1234567890!@#$%^&*()';
      const validation = validatePolicyDocumentText(spamInput);
      const parsed = parsePolicyDocumentText(spamInput);

      assert(validation.isValid === false, 'Validator marks spam input as invalid', details);
      assert(parsed.isValid === false, 'Parse result isValid is false', details);
      assert(parsed.tree === null, 'No policy tree is generated (tree is null)', details);
      assert(parsed.rules.length === 0, 'No rules generated (rules array is empty)', details);
      assert(parsed.structuredDocument === null, 'No structured document created', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // TEST 2: Rejection of Generic Non-Policy Sentences
  // ----------------------------------------------------------------------------------
  await runTest(
    'Test 2: Rejection of Generic Unrelated Text Lacking Governance Directives',
    'Railguard Validation',
    async (details) => {
      const unrelatedText = 'The quick brown fox jumps over the lazy dog on a beautiful sunny morning in the green meadow.';
      const parsed = parsePolicyDocumentText(unrelatedText);

      assert(parsed.isValid === false, 'Generic non-policy text rejected', details);
      assert(parsed.tree === null, 'Tree is null for unrelated text', details);
      assert(parsed.rules.length === 0, 'Rules count is 0', details);
      assert(parsed.error !== undefined, 'Error message provided explaining rejection reason', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // TEST 3: Rejection of Trivial Short Strings
  // ----------------------------------------------------------------------------------
  await runTest(
    'Test 3: Rejection of Trivial / Ultra-Short Strings',
    'Railguard Validation',
    async (details) => {
      const shortText = 'hello world policy test';
      const parsed = parsePolicyDocumentText(shortText);

      assert(parsed.isValid === false, 'Short trivial string rejected', details);
      assert(parsed.tree === null, 'Tree is null', details);
      assert(parsed.rules.length === 0, 'Rules length is 0', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // TEST 4: Structured Policy Document Conversion & Grounded Tree Construction
  // ----------------------------------------------------------------------------------
  await runTest(
    'Test 4: Structured Policy Document Conversion and Hierarchical Tree Construction',
    'Document-to-Tree Architecture',
    async (details) => {
      const enterprisePolicyDoc = `
        # Enterprise Customer Communication Policy v2.4
        
        Section 1.0: Transactional Payments & Failures
        - For successful payments where order provisioning fails, immediately cite payment ID and confirm automated refund within 3 to 5 business days.
        - Prohibit asking customer to pay again immediately without verified refund status.
        - Reassure customer that zero action is required on their part.
        
        Section 2.0: Privacy & Data Masking
        - Never expose full credit card numbers or banking passwords. Always mask to last 4 digits (e.g. **** 4012).
        - Prohibit transmitting internal database keys across public communication channels.
        
        Section 3.0: Financial Governance & Compensation
        - Agents must never grant goodwill compensation or discount vouchers above $0 without Human Supervisor Approval.
        - Any compensation request above $0 must be escalated to human supervisor review.
        
        Section 4.0: Communication Fatigue & Quiet Hours
        - Suppress promotional messages if customer received 2 or more messages in 24 hours.
        - Suppress routine maintenance notices if customer received 3 or more transactional updates today.
      `;

      const parsed = parsePolicyDocumentText(enterprisePolicyDoc);

      assert(parsed.isValid === true, 'Document is marked valid', details);
      assert(parsed.structuredDocument !== null, 'Structured document is successfully created', details);
      assert(parsed.structuredDocument?.title.includes('Enterprise Customer Communication Policy') === true, 'Document title parsed', details);
      assert(parsed.structuredDocument?.version === 'v2.4', 'Document version parsed as v2.4', details);
      assert((parsed.structuredDocument?.sections.length || 0) >= 3, `Extracted ${parsed.structuredDocument?.sections.length} structured sections`, details);
      assert((parsed.structuredDocument?.totalClauses || 0) >= 6, `Extracted ${parsed.structuredDocument?.totalClauses} granular clauses`, details);

      // Verify Tree Structure
      assert(parsed.tree !== null, 'Policy Tree is generated', details);
      assert(parsed.tree?.category === 'root', 'Tree root node category is root', details);
      assert((parsed.tree?.children?.length || 0) >= 3, `Tree contains ${parsed.tree?.children?.length} category branches`, details);

      // Verify Leaf Nodes
      const leafNodes = (parsed.tree?.children || []).flatMap(c => c.children || []);
      assert(leafNodes.length >= 6, `Tree contains ${leafNodes.length} leaf clause nodes`, details);
      assert(leafNodes.every(l => l.category === 'leaf'), 'All leaf nodes marked with category leaf', details);
      assert(leafNodes.every(l => l.allowedSummary && l.prohibitedSummary), 'Every leaf node has allowed and prohibited summaries', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // TEST 5: Directive Classification & Monetary Threshold Parsing
  // ----------------------------------------------------------------------------------
  await runTest(
    'Test 5: Accurate Classification of Directives (PROHIBITIVE, MANDATORY, PERMISSIVE) and Monetary Caps',
    'Clause Directives & Thresholds',
    async (details) => {
      const directivePolicyDoc = `
        Section 1.0: Fintech Directive
        - Prohibit sending unencrypted financial credentials over SMS.
        - Mandatory supervisor sign-off required for goodwill credits exceeding $50.00.
        - Permitted to provide instant tracking link for order status updates.
      `;

      const parsed = parsePolicyDocumentText(directivePolicyDoc);
      assert(parsed.isValid === true, 'Policy text is valid', details);

      const clauses = parsed.structuredDocument?.sections.flatMap(s => s.clauses) || [];
      const prohibitiveClause = clauses.find(c => c.directive === 'PROHIBITIVE');
      const mandatoryClause = clauses.find(c => c.directive === 'MANDATORY');
      const permissiveClause = clauses.find(c => c.directive === 'PERMISSIVE');

      assert(prohibitiveClause !== undefined, 'Prohibitive clause identified', details);
      assert(prohibitiveClause?.statement.includes('Prohibit sending unencrypted') === true, 'Prohibitive statement matched', details);

      assert(mandatoryClause !== undefined, 'Mandatory clause identified', details);
      assert(mandatoryClause?.escalationRequired === true, 'Escalation requirement flagged for mandatory clause', details);
      assert(mandatoryClause?.thresholdAmount === 50, 'Monetary threshold amount parsed as $50', details);

      assert(permissiveClause !== undefined, 'Permissive clause identified', details);
    }
  );

  // ----------------------------------------------------------------------------------
  // TEST 6: Orchestrator Integration with Dynamically Generated Tree
  // ----------------------------------------------------------------------------------
  await runTest(
    'Test 6: End-to-End Orchestrator Integration with Structured Document & Tree',
    'Orchestrator Integration',
    async (details) => {
      const docText = `
        Section 1.0: Payment and Order Safety
        - When inventory allocation fails for paid orders, confirm automated refund immediately and state zero action required.
        - Prohibit asking for re-payment.
        - Mask all payment card digits except last 4.
      `;

      const parsed = parsePolicyDocumentText(docText);
      assert(parsed.isValid === true, 'Document parsed successfully', details);

      const customer: CustomerProfile = {
        id: 'CUST-TREE-01',
        name: 'Anita Desai',
        age: 48,
        ageGroup: '45–54',
        segment: 'Premium',
        digitalProfile: 'Mixed',
        preferredLanguage: 'English',
        preferredChannel: 'WhatsApp',
        consent: { transactional: true, promotional: true, voice: false },
        customerValue: 'High',
        tenureMonths: 18,
        recentCommunicationCount24h: { transactional: 1, promotional: 0 },
        previousSupportContacts: 2,
        sentiment: 'Anxious',
        email: 'anita.desai@example.com',
        phone: '+91 98777 66554',
      };

      const event: BusinessEvent = {
        id: 'EVT-TREE-01',
        eventType: 'payment_successful_order_failed',
        title: 'Payment captured but inventory allocation timed out',
        description: 'Auto-refund initiated for order ORD-1192 ($49.50) to card ending 4012.',
        timestamp: 'Just now',
        verifiedFacts: ['Payment ID: PAY_1192 ($49.50)', 'Auto-refund initiated to card ending 4012'],
        resolutionStatus: 'Refund Initiated',
        transactionId: 'PAY_1192',
        amount: '$49.50',
      };

      const objective: BusinessObjective = { primary: 'resolve_issue' };

      const result = await orchestrateCommunication(
        customer,
        event,
        objective,
        undefined,
        parsed.rules,
        docText
      );

      assert(result.appliedPolicies.length === parsed.rules.length, `Applied ${parsed.rules.length} custom rules`, details);
      assert(result.clauseCitations.length > 0, 'Clause citations generated referencing structured document', details);
      assert(result.clauseCitations[0].sourceDocument === 'Custom Enterprise Policy Document', 'Citations reference custom document', details);
      assert(!result.messages.whatsapp.body.includes('!'), 'WhatsApp has 0 exclamation marks', details);
      assert(result.strategy.customerActionRequired === false, 'Zero action required confirmed', details);
    }
  );

  // Print Summary Table
  console.log('\n================================================================');
  console.log('POLICY TREE GENERATION TEST EXECUTION SUMMARY');
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

import { parsePolicyDocumentText, validatePolicyDocumentText } from '../src/core/policy-generator';

const userDocumentText = `# Refund & Customer Communication Policy

**Document ID:** REF-COM-001
**Version:** 2.1
**Effective Date:** 01 September 2026
**Document Owner:** Customer Experience & Operations
**Classification:** Internal — Customer Communication Rules
**Status:** Active
**Applies To:** Customer-facing transactional communications

---

# 1. Purpose

This policy establishes the rules governing customer refunds and the communications associated with refunds.

The purpose of this policy is to ensure that:

1. Eligible customers receive refunds consistently.
2. Customers receive accurate and timely information.
3. Communication is based only on verified transaction information.
4. Customers are not required to repeat information already available to the enterprise.
5. Refund communications comply with customer consent, communication preferences, and frequency limits.
6. Customer-facing messages do not contain unsupported commitments.
7. Exceptions are escalated to an authorised human reviewer.

---

# 2. Scope

This policy applies to refund-related customer events including:

* Payment successful but order failed
* Order cancelled after payment
* Duplicate payment
* Partial refund
* Refund initiated
* Refund processing delay
* Refund completed
* Refund failed
* Refund requiring manual intervention

This policy governs **customer communication** as well as the communication-related decision associated with a refund.

It does not independently determine accounting or financial settlement procedures.

---

# 3. Definitions

### 3.1 Successful Payment

A payment for which the payment system has returned a confirmed successful status.

### 3.2 Failed Order

An order that cannot be fulfilled despite a successful payment.

### 3.3 Refund Initiated

A refund instruction has been successfully submitted to the applicable payment or settlement system.

### 3.4 Refund Completed

The enterprise has received confirmation that the refund has been successfully processed.

### 3.5 Refund Pending

A refund has been initiated but completion has not yet been confirmed.

### 3.6 Manual Review

A case requiring human assessment because automated policy rules cannot determine the appropriate outcome.

---

# 4. Core Principles

All refund communication must follow these principles.

### 4.1 Accuracy

Only verified information may be communicated to the customer.

The system must not invent:

* refund status
* refund amount
* refund date
* transaction status
* compensation
* processing timelines
* customer eligibility

### 4.2 Transparency

Where a refund has been initiated, the communication should clearly state that the refund has been initiated.

Where the refund has not been initiated, the communication must not imply that it has.

### 4.3 Customer Effort Reduction

Customers should not be asked to provide information already available in enterprise systems.

### 4.4 Appropriate Personalisation

Communication should use relevant customer context without exposing unnecessary personal information.

### 4.5 Channel Preference

Where permitted, the customer's preferred communication channel should be used.

### 4.6 No Unauthorised Commitments

Agents and automated communication systems must not make commitments that are not supported by an approved policy or verified system information.

---

# 5. Refund Decision Tree

The following decision tree must be applied before refund communication is generated.

\`\`\`text
Payment Status
│
├── Failed
│   └── No refund communication
│       unless customer was charged
│
└── Successful
    │
    └── Order Status
        │
        ├── Successful
        │   └── No refund required
        │
        └── Failed / Cancelled
            │
            └── Refund Status
                │
                ├── Not Required
                │   └── No refund communication
                │
                ├── Not Initiated
                │   └── Initiate refund process
                │
                ├── Initiated
                │   └── Send refund initiated communication
                │
                ├── Completed
                │   └── Send refund completed communication
                │
                └── Failed / Unknown
                    └── Manual review
\`\`\`

---

# 6. Refund Eligibility

A customer is automatically eligible for a refund when all of the following conditions are satisfied:

1. Payment status is confirmed successful.
2. The associated order is confirmed failed or cancelled.
3. The transaction has not already been refunded.
4. The amount eligible for refund is determinable.
5. No active dispute or conflicting refund process exists.

If any required condition cannot be verified, the case must be sent for review.

---

# 7. Payment Successful + Order Failed

## 7.1 Refund Not Yet Initiated

If:

* payment = successful
* order = failed
* refund = not initiated

then:

### Required action

The refund process should be initiated where the automated refund process is available.

### Customer communication

The customer may be informed that:

* the order could not be completed;
* the payment was received;
* a refund is being processed or has been initiated, **only if this status is verified**.

The communication must not state that a refund has been initiated until initiation is confirmed.

---

# 8. Refund Initiated

If the refund status is confirmed as **initiated**, the customer may be informed.

### Required communication

The message should include:

* acknowledgement of the issue;
* refund confirmation;
* refund amount where verified;
* relevant processing information where approved;
* whether the customer needs to take any action.

### Example communication intent

> Inform the customer that the refund has been initiated and that no further action is required unless otherwise specified.

### Prohibited

Do not:

* guarantee an exact credit date unless explicitly supported by verified information;
* claim that the customer's bank has already credited the amount;
* ask the customer to initiate another refund;
* request unnecessary transaction information.

---

# 9. Refund Completed

If the enterprise has confirmed that the refund has been completed:

### Required communication

The customer may receive a confirmation stating:

* refund completed;
* refund amount;
* relevant transaction reference where appropriate.

The communication should avoid unnecessary detail.

---

# 10. Refund Processing Delay

A refund is considered delayed when:

1. The refund has been initiated; and
2. The configured expected processing window has been exceeded; and
3. Completion has not been confirmed.

### Required action

The case must be evaluated against the escalation rules.

If no manual intervention is required:

> Inform the customer that the refund remains in progress.

If manual intervention is required:

> Escalate the case and communicate that the issue has been escalated.

### Prohibited

Do not state:

> "Your refund will definitely arrive tomorrow."

unless the exact date is verified and explicitly permitted by policy.

---

# 11. Refund Failed or Unknown

If refund status is:

* Failed
* Unknown
* Conflicting across systems

the automated communication system must not create a definitive refund status.

### Required action

**Escalate to human review.**

Customer communication should not imply that the refund has been successfully initiated or completed.

---

# 12. Communication Channel Rules

The Communication Strategy Agent must consider:

1. Customer preference
2. Consent
3. Communication type
4. Channel availability
5. Previous communication
6. Communication frequency
7. Policy restrictions

### Priority

For transactional communications:

**Customer preferred channel → available approved channel → fallback channel**

For example:

\`\`\`text
Preferred: WhatsApp
        ↓
Consent available?
        ↓
Yes
        ↓
WhatsApp available?
        ↓
Yes
        ↓
Send WhatsApp
\`\`\`

If WhatsApp cannot be used:

\`\`\`text
WhatsApp
   ↓
Unavailable
   ↓
Email
   ↓
Available
   ↓
Send Email
\`\`\`

The fallback must comply with customer consent and communication policy.

---

# 13. Communication Frequency

To prevent customer fatigue:

### Transactional communications

Maximum:

**3 refund-related communications within 24 hours**

### Promotional communications

Promotional communication must not be combined with a refund-resolution communication unless explicitly permitted by campaign policy.

### Suppression

If the customer has already received equivalent information within the configured suppression period, duplicate communication should be suppressed.

---

# 14. Customer Communication Profile

The Communication Strategy Agent must consider the customer's communication profile.

The profile may include:

* age group
* customer segment
* digital behaviour
* preferred language
* preferred channel
* historical engagement
* explicit communication preference

Age must **not** be used as the sole determinant of communication tone.

---

# 15. Tone & Tenor Guidelines

## 15.1 Standard Customer

Tone:

* clear
* professional
* concise
* reassuring

Avoid:

* excessive formality
* unnecessary jargon

---

## 15.2 Premium Customer

Tone:

* personalised
* proactive
* reassuring
* confident

Communication should acknowledge inconvenience where appropriate.

Avoid:

* generic wording
* unnecessary requests for customer effort

---

## 15.3 Digital-First Customer

Tone:

* concise
* conversational
* direct
* mobile-friendly

Use short paragraphs.

Avoid:

* lengthy explanations
* unnecessary formal language

---

## 15.4 Assisted-Service Customer

Tone:

* clear
* reassuring
* explicit
* patient

Provide sufficient context to understand:

1. What happened
2. What has been done
3. What happens next
4. Whether the customer needs to do anything

Avoid:

* unexplained technical terms
* assumptions about digital familiarity

---

# 16. Channel-Specific Tone

## WhatsApp

Use:

* concise sentences
* conversational tone
* clear outcome
* short paragraphs
* direct next step where necessary

Avoid:

* long explanations
* unnecessary formalities

---

## SMS

Use:

* essential information only
* short sentences
* direct language

Prioritise:

1. What happened
2. What was done
3. Required customer action, if any

---

## Email

Use:

* clear subject line
* contextual explanation
* structured body
* appropriate sign-off

Email may contain more detail than WhatsApp or SMS where useful.

---

# 17. Personalisation Rules

Permitted personalisation includes:

* customer's name
* verified transaction context
* verified order context
* customer communication preference
* relevant resolution status
* appropriate language

Do not personalise using sensitive information unless explicitly required and authorised.

Do not mention internal customer scoring or segmentation to customers.

For example, do not say:

> "As a Premium customer..."

unless explicitly permitted by a separate policy.

---

# 18. Prohibited Claims

The communication system must never claim:

* a refund has been initiated when it has not;
* a refund has completed when it has not;
* an exact refund date without verified information;
* a compensation amount without authorisation;
* an outcome that depends on a third party;
* that a customer has taken an action that cannot be verified.

---

# 19. Customer Action Rules

If no customer action is required:

> Clearly tell the customer that no action is required.

If action is required:

* explain exactly what is required;
* explain why;
* provide the approved next step;
* avoid asking the customer to repeat information already available.

---

# 20. Escalation Rules

A case must be escalated when:

1. Refund status is contradictory.
2. Refund amount cannot be determined.
3. A duplicate refund may exist.
4. Customer has initiated a dispute.
5. Compensation is requested but not pre-authorised.
6. The customer threatens legal action.
7. Required customer information is unavailable.
8. The applicable policy is ambiguous.
9. A policy exception is required.
10. The customer explicitly requests human assistance.

---

# 21. Human Approval

Human approval is mandatory when communication includes:

* compensation
* policy exceptions
* financial commitments
* legal matters
* sensitive customer circumstances
* unsupported resolution promises

The agent must not bypass human approval.

---

# 22. Guardrail Requirements

Before any communication is sent, the Guardrail Agent must validate:

### Factual grounding

Every material claim must be supported by verified information.

### Policy compliance

The message must comply with applicable policy.

### Customer consent

The channel and communication type must be permitted.

### Tone

The message must comply with the applicable communication profile.

### Privacy

No unnecessary sensitive information may be included.

### Frequency

The communication must not violate frequency limits.

### Channel

The content must comply with channel-specific guidelines.

### Unsupported promises

The message must not introduce unverified guarantees.

---

# 23. Guardrail Outcomes

The Guardrail Agent can return exactly one of:

### PASS

Message can proceed.

### REVISE

Message should be returned to the Message Agent with corrective instructions.

### ESCALATE

Human review required.

### SUPPRESS

Communication should not be sent.

---

# 24. Communication Suppression

The system should suppress communication when:

* equivalent information has already been sent;
* communication frequency limits have been exceeded;
* customer has opted out of the relevant communication;
* no useful information can be provided;
* the case is awaiting human resolution;
* the customer has explicitly requested no further communication.

The system should display the reason for suppression internally.

---

# 25. Policy Priority

Where policies conflict, apply the following hierarchy:

1. Customer safety and privacy
2. Regulatory/legal requirements
3. Explicit customer consent/preferences
4. Mandatory enterprise policies
5. Transactional communication rules
6. Brand communication guidelines
7. Personalisation preferences

Lower-priority rules must not override higher-priority constraints.

---

# 26. AI Agent Responsibilities

The AI agents may:

* interpret customer context;
* retrieve relevant policies;
* recommend communication strategy;
* generate communication;
* adapt communication by channel;
* identify potential policy conflicts;
* recommend suppression;
* recommend escalation.

The AI agents may NOT:

* invent facts;
* override mandatory policies;
* approve unauthorised compensation;
* bypass human approval;
* claim an action occurred when it has not been verified;
* modify company policy.

---

# 31. Policy Governance

All policies should have:

* Policy ID
* Version
* Effective date
* Owner
* Status
* Priority
* Conditions
* Allowed actions
* Prohibited actions
* Escalation conditions

AI agents must use the currently active version.

---

# 32. Auditability

For every communication run, the system should retain an internal audit record containing:

* customer/event identifier
* objective
* policies consulted
* communication strategy
* generated message
* guardrail result
* revisions
* final decision
* channel
* send/suppress/escalate status

Do not expose sensitive internal audit information to the customer.

---

# 33. Customer-Facing Transparency

The customer should see only the final communication and relevant information required to understand the situation.

Do not expose:

* internal customer scores
* internal policy identifiers
* AI reasoning
* internal escalation rules
* internal fraud/risk signals
* system prompts

The enterprise operator may inspect the applicable policy and decision evidence through the internal product interface.

---

# 35. Final Policy Principle

The enterprise communication system should optimise for:

> **The right information, to the right customer, through the right channel, in the right tone, at the right time — while remaining within verified business policy.**

The AI's role is to interpret context and personalise execution.

The policy's role is to define what the AI is allowed to do.

The guardrail's role is to ensure the final communication remains within those boundaries.
`;

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

async function run() {
  console.log('Testing User Enterprise Policy Ingestion...');
  const res = parsePolicyDocumentText(userDocumentText);

  assert(res.isValid === true, 'Parse result should be valid');
  assert(res.structuredDocument !== null, 'Structured document must exist');
  assert(res.tree !== null, 'Tree must exist');

  console.log(`Title: ${res.structuredDocument?.title}`);
  console.log(`Document ID: ${res.structuredDocument?.documentId}`);
  console.log(`Version: ${res.structuredDocument?.version}`);
  console.log(`Effective Scope: ${res.structuredDocument?.effectiveScope}`);
  console.log(`Sections count: ${res.structuredDocument?.sections.length}`);
  console.log(`Total clauses: ${res.structuredDocument?.totalClauses}`);
  console.log(`Escalation gates count: ${res.structuredDocument?.escalationClauseCount}`);

  assert(res.structuredDocument?.documentId === 'REF-COM-001', 'Document ID should be REF-COM-001');
  assert(res.structuredDocument?.version === '2.1', 'Version should be 2.1');
  assert((res.structuredDocument?.sections.length || 0) >= 10, 'Should have parsed at least 10 sections');
  assert((res.structuredDocument?.totalClauses || 0) >= 15, 'Should have parsed at least 15 substantive clauses');

  // Verify that NO random box-drawing characters or isolated words are present as titles
  const allTitles = (res.tree?.children || []).flatMap(sec => (sec.children || []).map(leaf => leaf.name));
  console.log('\nSample generated leaf node titles:');
  allTitles.slice(0, 10).forEach(t => console.log('  -', t));

  const hasAsciiTrash = allTitles.some(t => t.includes('├──') || t.includes('└──') || t.includes('│') || t.includes('↓'));
  assert(!hasAsciiTrash, 'Must NOT contain ASCII box-drawing or flowchart characters in leaf titles');

  const hasSingleWordTitles = allTitles.some(t => t.trim().split(/\s+/).length === 1 && !t.includes(':'));
  assert(!hasSingleWordTitles, 'Must NOT contain random single-word titles');

  console.log('\nTesting Random Text Rejection...');
  const randomGibberish = 'asdfghjklqwertyuiop zxcvbnm1234567890 !@#$%^&*() random keyboard spam';
  const randomRes = parsePolicyDocumentText(randomGibberish);
  assert(randomRes.isValid === false, 'Random gibberish must be rejected');
  assert(randomRes.tree === null, 'Random text must produce tree === null');
  assert(randomRes.rules.length === 0, 'Random text must produce 0 rules');
  console.log('Random text properly rejected:', randomRes.error);

  console.log('\nAll assertions passed successfully!');
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

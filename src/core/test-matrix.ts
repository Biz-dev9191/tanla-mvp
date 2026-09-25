import { AgeGroup, CustomerSegment, DigitalProfile, PreferredChannel, EventType, BusinessObjectiveType } from './types';

export interface MatrixCustomerProfile {
  id: string;
  label: string;
  name: string;
  email?: string;
  phone?: string;
  age: number;
  ageGroup: AgeGroup;
  segment: CustomerSegment;
  digitalProfile: DigitalProfile;
  preferredChannel: PreferredChannel;
  sentiment: 'Neutral' | 'Frustrated' | 'Anxious' | 'Satisfied' | 'Urgent';
  previousSupportContacts: number;
  descriptionText: string;
  pills: string[];
}

export interface MatrixBusinessEvent {
  id: string;
  label: string;
  eventType: EventType;
  title: string;
  transactionId: string;
  orderId: string;
  amount: string;
  resolutionStatus: 'Resolved' | 'Refund Initiated' | 'In Progress' | 'Requires Customer Action' | 'Pending Approval' | 'None Required';
  verifiedFacts: string;
  descriptionText: string;
  pills: string[];
}

export interface MatrixBusinessObjective {
  id: string;
  label: string;
  primary: BusinessObjectiveType;
  secondary: string;
  descriptionText: string;
  pills: string[];
}

export const MATRIX_CUSTOMERS: MatrixCustomerProfile[] = [
  {
    id: 'cust-1-genz',
    label: '1. Rahul Sharma (Gen Z / 22y / Digital-First / Premium / Anxious)',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    age: 22,
    ageGroup: '18–24',
    segment: 'Premium',
    digitalProfile: 'Digital-first',
    preferredChannel: 'WhatsApp',
    sentiment: 'Anxious',
    previousSupportContacts: 2,
    descriptionText: 'Customer: Rahul Sharma, 22 years old (Gen Z student). Premium tier account with high mobile engagement. Anxious regarding financial deductions, 2 prior support contacts.',
    pills: ['18–24', 'Premium', 'Digital-first', 'High LTV'],
  },
  {
    id: 'cust-2-boomer',
    label: '2. Meera Sen (Baby Boomer / 66y / Assisted / Standard / Cautious)',
    name: 'Meera Sen',
    email: 'meera.sen@example.com',
    phone: '+91 98112 34567',
    age: 66,
    ageGroup: '55+',
    segment: 'Standard',
    digitalProfile: 'Assisted',
    preferredChannel: 'Email',
    sentiment: 'Anxious',
    previousSupportContacts: 1,
    descriptionText: 'Customer: Meera Sen, 66 years old (Baby Boomer). Standard account holder, prefers step-by-step assisted instructions, zero technical jargon, telephone support accessibility.',
    pills: ['55+', 'Standard', 'Assisted-service', 'Long-term'],
  },
  {
    id: 'cust-3-millennial',
    label: '3. Vikram Patel (Millennial / 34y / VIP High-LTV / SaaS Founder / Urgent)',
    name: 'Vikram Patel',
    email: 'vikram.patel@example.com',
    phone: '+91 99201 88319',
    age: 34,
    ageGroup: '25–34',
    segment: 'High Value',
    digitalProfile: 'Digital-first',
    preferredChannel: 'WhatsApp',
    sentiment: 'Urgent',
    previousSupportContacts: 3,
    descriptionText: 'Customer: Vikram Patel, 34 years old (Millennial SaaS founder). High-LTV VIP tier ($12,000 ARR). Expects immediate telemetry, transaction references, zero bureaucratic delay.',
    pills: ['25–34', 'VIP', 'Digital-first', 'High LTV'],
  },
  {
    id: 'cust-4-genx',
    label: '4. Anita Desai (Gen X / 48y / Corporate Director / Mixed / Frustrated)',
    name: 'Anita Desai',
    email: 'anita.desai@example.com',
    phone: '+91 98450 11223',
    age: 48,
    ageGroup: '45–54',
    segment: 'Premium',
    digitalProfile: 'Mixed',
    preferredChannel: 'Email',
    sentiment: 'Frustrated',
    previousSupportContacts: 4,
    descriptionText: 'Customer: Anita Desai, 48 years old (Gen X corporate director). Premium tier account, high churn risk with 4 prior unresolved delivery disputes. Tone must be accountable and decisive.',
    pills: ['45–54', 'Premium', 'Mixed', 'High LTV'],
  },
  {
    id: 'cust-5-silent',
    label: '5. David Chen (Silent Gen / 81y / Pensioner / Assisted / First-Timer)',
    name: 'David Chen',
    email: 'david.chen@example.com',
    phone: '+91 98100 55443',
    age: 81,
    ageGroup: '55+',
    segment: 'New',
    digitalProfile: 'Assisted',
    preferredChannel: 'Email',
    sentiment: 'Neutral',
    previousSupportContacts: 1,
    descriptionText: 'Customer: David Chen, 81 years old (Silent Generation pensioner). First-time digital user. Requires high-respect, patient, simple layout with direct telephone assistance.',
    pills: ['55+', 'New Customer', 'Assisted-service'],
  },
];

export const MATRIX_EVENTS: MatrixBusinessEvent[] = [
  {
    id: 'evt-1-order-failed',
    label: '1. Payment Ok / Order Provisioning Failed (Auto-Refund $49.50)',
    eventType: 'payment_successful_order_failed',
    title: 'Payment captured but order allocation timed out',
    transactionId: 'PAY_99482',
    orderId: 'ORD-7721',
    amount: '$49.50',
    resolutionStatus: 'Refund Initiated',
    verifiedFacts: 'Payment ID: PAY_99482 ($49.50), Order #ORD-7721 failed inventory allocation, Auto-refund initiated to card ending 4012 (Ref: REF_882103)',
    descriptionText: 'Payment of $49.50 (Payment ID: PAY_99482) succeeded, but order provisioning for #ORD-7721 timed out. Automated refund initiated to card ending 4012 (Ref: REF_882103). 3 to 5 business days settlement.',
    pills: ['Payment Ok / Order Failed'],
  },
  {
    id: 'evt-2-pay-failed',
    label: '2. Payment Failed / Card Declined (Retry Required $120.00)',
    eventType: 'payment_failed',
    title: 'Card payment declined during checkout',
    transactionId: 'PAY_FAIL_1092',
    orderId: 'ORD-8832',
    amount: '$120.00',
    resolutionStatus: 'Requires Customer Action',
    verifiedFacts: 'Payment attempt PAY_FAIL_1092 ($120.00) declined by issuer, Order #ORD-8832 held in pending reserve for 2 hours, Secure 1-tap retry link generated',
    descriptionText: 'Payment attempt of $120.00 (ID: PAY_FAIL_1092) for order #ORD-8832 was declined by your bank. Order is held for 2 hours. Secure retry link: https://auroracloud.app/pay/ORD-8832',
    pills: ['Payment Failed'],
  },
  {
    id: 'evt-3-kyc',
    label: '3. Application Pending KYC (Address Proof Required by Oct 15)',
    eventType: 'application_incomplete',
    title: 'Application pending residential address proof',
    transactionId: 'KYC_6621',
    orderId: 'APP-9921',
    amount: 'N/A',
    resolutionStatus: 'Requires Customer Action',
    verifiedFacts: 'Application #APP-9921 identity approved, Address verification document needed by Oct 15, Utility bill or bank statement acceptable',
    descriptionText: 'Application #APP-9921 identity check approved. Residential address proof (utility bill or bank statement from last 3 months) required by October 15, 2026. Secure upload: https://auroracloud.app/verify/APP-9921',
    pills: ['Incomplete Application / Pending KYC'],
  },
  {
    id: 'evt-4-dispute',
    label: '4. Delivery Delay & Support Dispute (Fee Waiver + Credit Escalation)',
    eventType: 'customer_complaint',
    title: 'Enterprise shipment delay dispute and fee waiver review',
    transactionId: 'DISP_5520',
    orderId: 'ENT-5520',
    amount: '$250.00',
    resolutionStatus: 'Pending Approval',
    verifiedFacts: 'Shipment ENT-5520 delayed by 48 hours, $25 delivery fee waiver applied automatically, $150 goodwill credit request escalated to Operations Supervisor under POL-FIN-001',
    descriptionText: 'Customer raised critical escalation regarding 48-hour delivery delay on order #ENT-5520. $25 delivery fee waiver applied. Customer requested $150 credit requiring human supervisor approval.',
    pills: ['Billing Dispute / Escalation'],
  },
  {
    id: 'evt-5-sub-renewal',
    label: '5. Subscription Renewal Notice & Loyalty Perk ($299.00/yr)',
    eventType: 'subscription_expiring',
    title: 'Annual cloud enterprise tier renewal & loyalty perk',
    transactionId: 'SUB_4410',
    orderId: 'SUB-4410',
    amount: '$299.00/yr',
    resolutionStatus: 'Resolved',
    verifiedFacts: 'Annual subscription renewal scheduled for next week, 20% loyalty bonus storage voucher available for active accounts with opt-in consent',
    descriptionText: 'Annual subscription for plan #SUB-4410 ($299.00/yr) renews on October 20. Dedicated loyalty bonus storage unlocked. Promotional consent verified.',
    pills: ['Service Disruption / Maintenance'],
  },
];

export const MATRIX_OBJECTIVES: MatrixBusinessObjective[] = [
  {
    id: 'obj-1-remediation',
    label: '1. Resolve Issue Proactively & Confirm Automated Remediation',
    primary: 'resolve_issue',
    secondary: 'Confirm automated refund/remediation with explicit reference ID and zero action required',
    descriptionText: 'Resolve the issue proactively, confirm the automated refund to card ending 4012, provide explicit reference code, and state zero action required.',
    pills: ['Resolve Issue Proactively', 'Reassure Customer'],
  },
  {
    id: 'obj-2-deflection',
    label: '2. Minimise Inbound Support Contacts & Friction (Support Deflection)',
    primary: 'reduce_support_contacts',
    secondary: 'Eliminate customer friction, provide direct self-service tracking, prevent contact center overload',
    descriptionText: 'Minimise incoming customer support contacts by answering all settlement timelines upfront and providing 1-click tracking.',
    pills: ['Minimise Support Contacts', 'Resolve Issue Proactively'],
  },
  {
    id: 'obj-3-reassurance',
    label: '3. Reassure Customer Anxiety & Prevent Emotional Escalation',
    primary: 'reassure_customer',
    secondary: 'Empathize with customer distress, guarantee safety of funds, de-escalate anxiety',
    descriptionText: 'Reassure the customer that their funds are 100% safe, provide immediate peace of mind, and prevent customer churn.',
    pills: ['Reassure Customer', 'Minimise Support Contacts'],
  },
  {
    id: 'obj-4-vip-retention',
    label: '4. Retain High-Value VIP Customer & Provide Executive Follow-up',
    primary: 'retain_customer',
    secondary: 'White-glove SLA handling, acknowledge VIP status, promise direct supervisor update within 4 hours',
    descriptionText: 'Retain high-value account by acknowledging VIP tier, applying immediate delivery waiver, and assigning a senior operations manager for review.',
    pills: ['Retain High-Value Customer', 'Reassure Customer'],
  },
  {
    id: 'obj-5-action-resumption',
    label: '5. Drive Single-Click Resumption & Completion (KYC / Payment Retry)',
    primary: 'complete_application',
    secondary: 'Clear deadline, acceptable document list, single-tap secure upload link',
    descriptionText: 'Drive fast, frictionless document submission or payment retry with clear deadline and single-click secure action link.',
    pills: ['Complete Onboarding', 'Recover Revenue'],
  },
];

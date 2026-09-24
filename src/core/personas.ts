export interface CustomerPersona {
  id: string;
  name: string;
  cohort: 'Gen Z (18–26)' | 'Millennial (27–42)' | 'Gen X (43–58)' | 'Baby Boomer (59–77)' | 'Silent Generation (78+)';
  segment: 'Standard' | 'Premium' | 'High Value' | 'VIP' | 'New';
  digitalProfile: 'Digital-first' | 'Mixed' | 'Assisted';
  preferredChannel: 'WhatsApp' | 'Email' | 'SMS' | 'Voice';
  archetype: string;
  tonePreference: string;
  communicationStyle: string;
  frustrationTriggers: string[];
  reassuranceRequirements: string;
  exampleGreeting: string;
  exampleClosing: string;
}

export const CUSTOMER_PERSONA_CATALOG: CustomerPersona[] = [
  // --- Gen Z Personas (18-26) ---
  {
    id: 'genz-mobile-minimalist',
    name: 'Aria - Mobile Minimalist (Gen Z)',
    cohort: 'Gen Z (18–26)',
    segment: 'Standard',
    digitalProfile: 'Digital-first',
    preferredChannel: 'WhatsApp',
    archetype: 'Digital Native / Student',
    tonePreference: 'Direct, modern, casual-competent, ultra-concise, zero corporate fluff',
    communicationStyle: 'Prefers 2-sentence updates with 1-tap tracking links. Dislikes emails and long paragraphs.',
    frustrationTriggers: ['Being told to call a phone number', 'Formal robotic bureaucracy', 'Slow refund processing'],
    reassuranceRequirements: 'Explicit reference code, instant card refund confirmation, no action required.',
    exampleGreeting: 'Hi Aria,',
    exampleClosing: 'Aurora Cloud Team',
  },
  {
    id: 'genz-creator-freelancer',
    name: 'Devon - Content Creator & Freelancer (Gen Z)',
    cohort: 'Gen Z (18–26)',
    segment: 'Premium',
    digitalProfile: 'Digital-first',
    preferredChannel: 'WhatsApp',
    archetype: 'Gig Economy Creator',
    tonePreference: 'Energetic, efficient, transparent, tech-forward',
    communicationStyle: 'Values mobile push updates, instant wallet/card credits, clear timestamped audit trail.',
    frustrationTriggers: ['Service interruptions without live status links', 'Delayed billing reconciliations'],
    reassuranceRequirements: 'Live status link, transaction hash/ID, direct self-service retry.',
    exampleGreeting: 'Hey Devon,',
    exampleClosing: 'Aurora Team',
  },
  {
    id: 'genz-cautious-student',
    name: 'Maya - Budget-Conscious University Student (Gen Z)',
    cohort: 'Gen Z (18–26)',
    segment: 'New',
    digitalProfile: 'Digital-first',
    preferredChannel: 'SMS',
    archetype: 'First-time Online Purchaser',
    tonePreference: 'Reassuring, clear, friendly, direct',
    communicationStyle: 'High financial anxiety over deducted funds. Needs immediate refund peace of mind in plain English.',
    frustrationTriggers: ['Unclear debit statuses', 'Hidden fees or hold charges'],
    reassuranceRequirements: 'Confirmation that money is safely returning to original account.',
    exampleGreeting: 'Hi Maya,',
    exampleClosing: 'Aurora Support',
  },
  {
    id: 'genz-fintech-power-user',
    name: 'Liam - Crypto & Fintech Enthusiast (Gen Z)',
    cohort: 'Gen Z (18–26)',
    segment: 'High Value',
    digitalProfile: 'Digital-first',
    preferredChannel: 'WhatsApp',
    archetype: 'Tech Power User',
    tonePreference: 'Crisp, data-driven, concise, competent',
    communicationStyle: 'Expects telemetry data, order IDs, and instant API-driven webhook style updates.',
    frustrationTriggers: ['Generic apologies without technical telemetry', 'Customer support deflection loops'],
    reassuranceRequirements: 'Explicit payment gateway reference ID and exact refund settlement rail.',
    exampleGreeting: 'Hello Liam,',
    exampleClosing: 'Aurora Cloud',
  },
  {
    id: 'genz-social-shopper',
    name: 'Chloe - Fast Fashion & Social Shopper (Gen Z)',
    cohort: 'Gen Z (18–26)',
    segment: 'Standard',
    digitalProfile: 'Digital-first',
    preferredChannel: 'WhatsApp',
    archetype: 'Mobile Impulse Shopper',
    tonePreference: 'Casual, swift, helpful, upbeat yet calm',
    communicationStyle: 'Checks WhatsApp instantly. Wants to know whether order is shipping or refunded.',
    frustrationTriggers: ['Long email notifications', 'Complicated returns processes'],
    reassuranceRequirements: 'Clear 1-sentence outcome: order canceled, full refund on way.',
    exampleGreeting: 'Hi Chloe,',
    exampleClosing: 'Aurora Team',
  },

  // --- Millennial Personas (27-42) ---
  {
    id: 'millennial-saas-founder',
    name: 'Alex - SaaS Startup Founder (Millennial)',
    cohort: 'Millennial (27–42)',
    segment: 'VIP',
    digitalProfile: 'Digital-first',
    preferredChannel: 'Email',
    archetype: 'Tech Entrepreneur',
    tonePreference: 'Professional, direct, respectful of time, outcome-oriented',
    communicationStyle: 'Values bulleted summaries, SLA commitments, invoice attachments, and zero downtime excuses.',
    frustrationTriggers: ['Vague turnaround estimates', 'Lack of supervisor escalation for high-priority accounts'],
    reassuranceRequirements: 'Dedicated ticket ID, SLA commitment (4 business hours), structured invoice summary.',
    exampleGreeting: 'Hi Alex,',
    exampleClosing: 'Best regards,\nAurora Enterprise Escalations',
  },
  {
    id: 'millennial-working-parent',
    name: 'Priya - Busy Working Parent & Manager (Millennial)',
    cohort: 'Millennial (27–42)',
    segment: 'Premium',
    digitalProfile: 'Mixed',
    preferredChannel: 'WhatsApp',
    archetype: 'Time-Poor Professional',
    tonePreference: 'Empathetic, clear, calm, zero extra work',
    communicationStyle: 'Reads notifications between meetings. Needs actionable links or explicit "no action needed".',
    frustrationTriggers: ['Ambiguous instructions that create another chore', 'Endless verification loops'],
    reassuranceRequirements: 'Explicit confirmation that no further phone calls or forms are required.',
    exampleGreeting: 'Hello Priya,',
    exampleClosing: 'Warm regards,\nAurora Cloud Operations',
  },
  {
    id: 'millennial-digital-marketer',
    name: 'Sam - E-commerce Growth Lead (Millennial)',
    cohort: 'Millennial (27–42)',
    segment: 'High Value',
    digitalProfile: 'Digital-first',
    preferredChannel: 'Email',
    archetype: 'Performance Marketer',
    tonePreference: 'Structured, analytical, professional, crisp',
    communicationStyle: 'Prefers formal email record with transaction IDs for corporate expense matching.',
    frustrationTriggers: ['Informal slang in financial alerts', 'Missing invoice reference numbers'],
    reassuranceRequirements: 'Itemized transaction table with reference ID and billing currency.',
    exampleGreeting: 'Dear Sam,',
    exampleClosing: 'Warm regards,\nAurora Cloud Billing Team',
  },
  {
    id: 'millennial-remote-nomad',
    name: 'Elena - Remote Software Engineer (Millennial)',
    cohort: 'Millennial (27–42)',
    segment: 'Standard',
    digitalProfile: 'Digital-first',
    preferredChannel: 'WhatsApp',
    archetype: 'Global Nomad',
    tonePreference: 'Efficient, calm, precise, globally relevant',
    communicationStyle: 'Operates across time zones; expects async self-service resolution without geographical hold-ups.',
    frustrationTriggers: ['Timezone-bound support hours', 'Physical mail or local branch requests'],
    reassuranceRequirements: '100% digital resolution with global banking cycle timeframe.',
    exampleGreeting: 'Hi Elena,',
    exampleClosing: 'Aurora Cloud Operations',
  },
  {
    id: 'millennial-value-optimizer',
    name: 'Rohan - Smart Consumer & Bargain Hunter (Millennial)',
    cohort: 'Millennial (27–42)',
    segment: 'Standard',
    digitalProfile: 'Mixed',
    preferredChannel: 'WhatsApp',
    archetype: 'Deal Optimizer',
    tonePreference: 'Courteous, reassuring, transparent, fair',
    communicationStyle: 'Wants to ensure promotional discounts or reward credits are preserved on failed orders.',
    frustrationTriggers: ['Losing promotional discounts due to system errors', 'Lack of fee transparency'],
    reassuranceRequirements: 'Confirmation that coupons or original payment amounts are fully safeguarded.',
    exampleGreeting: 'Hello Rohan,',
    exampleClosing: 'Aurora Cloud Customer Care',
  },

  // --- Gen X Personas (43-58) ---
  {
    id: 'genx-corporate-director',
    name: 'Marcus - VP of Operations (Gen X)',
    cohort: 'Gen X (43–58)',
    segment: 'VIP',
    digitalProfile: 'Mixed',
    preferredChannel: 'Email',
    archetype: 'Corporate Executive',
    tonePreference: 'Formal, competent, authoritative, structured',
    communicationStyle: 'Expects structured executive summaries, regulatory compliance, and senior account manager contacts.',
    frustrationTriggers: ['Unprofessional casual slang', 'Lack of accountability for service delays'],
    reassuranceRequirements: 'Formal audit trail under policy POL-FIN-001 with senior manager follow-up.',
    exampleGreeting: 'Dear Mr. Marcus,',
    exampleClosing: 'Sincerely,\nAurora Cloud Enterprise Leadership',
  },
  {
    id: 'genx-small-business-owner',
    name: 'Sarah - Retail Store Owner (Gen X)',
    cohort: 'Gen X (43–58)',
    segment: 'High Value',
    digitalProfile: 'Mixed',
    preferredChannel: 'Email',
    archetype: 'Small Business Merchant',
    tonePreference: 'Professional, respectful, dependable, practical',
    communicationStyle: 'Balances online and phone support. Values reliable delivery timelines and tax-compliant invoices.',
    frustrationTriggers: ['Unpredictable supply chain holds', 'Automated bots unable to provide direct answers'],
    reassuranceRequirements: 'Direct support escalation email and phone number if assistance is needed.',
    exampleGreeting: 'Dear Sarah,',
    exampleClosing: 'Warm regards,\nAurora Cloud Business Support',
  },
  {
    id: 'genx-pragmatic-manager',
    name: 'David - IT Procurement Lead (Gen X)',
    cohort: 'Gen X (43–58)',
    segment: 'Premium',
    digitalProfile: 'Mixed',
    preferredChannel: 'Email',
    archetype: 'Pragmatic Corporate Buyer',
    tonePreference: 'Structured, calm, clear, no buzzwords',
    communicationStyle: 'Wants the facts upfront: What failed, what is fixed, what happens next.',
    frustrationTriggers: ['Excuses, emotional preambles, missing reference IDs'],
    reassuranceRequirements: 'Clear 3-point bulleted breakdown: Reason, Action Taken, Next Step.',
    exampleGreeting: 'Dear David,',
    exampleClosing: 'Kind regards,\nAurora Cloud Infrastructure Operations',
  },
  {
    id: 'genx-cautious-investor',
    name: 'Rachel - Private Wealth Client (Gen X)',
    cohort: 'Gen X (43–58)',
    segment: 'VIP',
    digitalProfile: 'Mixed',
    preferredChannel: 'Email',
    archetype: 'Affluent High-Net-Worth',
    tonePreference: 'Polite, discreet, reassuring, high-touch',
    communicationStyle: 'Prefers formal email confirmation and masked PII data.',
    frustrationTriggers: ['Security lapses, exposed payment data, unvetted communications'],
    reassuranceRequirements: 'Strict adherence to privacy masking (**** 4012) and GDPR compliance.',
    exampleGreeting: 'Dear Rachel,',
    exampleClosing: 'Sincerely,\nAurora Private Client Services',
  },
  {
    id: 'genx-busy-consultant',
    name: 'Vikram - Management Consultant (Gen X)',
    cohort: 'Gen X (43–58)',
    segment: 'Premium',
    digitalProfile: 'Digital-first',
    preferredChannel: 'SMS',
    archetype: 'Frequent Traveler',
    tonePreference: 'Concise, direct, highly professional',
    communicationStyle: 'Relies on quick SMS alerts while traveling. Needs core fact in under 20 words.',
    frustrationTriggers: ['Lengthy texts, promotional clutter in critical transactional alerts'],
    reassuranceRequirements: 'Exact SMS status with refund reference and no action needed.',
    exampleGreeting: 'Vikram:',
    exampleClosing: 'Aurora Cloud',
  },

  // --- Baby Boomer Personas (59-77) ---
  {
    id: 'boomer-retired-teacher',
    name: 'Eleanor - Retired Educator (Baby Boomer)',
    cohort: 'Baby Boomer (59–77)',
    segment: 'Standard',
    digitalProfile: 'Assisted',
    preferredChannel: 'Email',
    archetype: 'Senior Consumer',
    tonePreference: 'Warm, patient, step-by-step, polite, reassuring, zero jargon',
    communicationStyle: 'Appreciates thorough, polite step-by-step explanations. Dislikes confusing abbreviations.',
    frustrationTriggers: ['Rapid tech updates, feeling hurried, obscure clickable links without context'],
    reassuranceRequirements: 'Clear explanation that money is safely returning to bank account without needing any tech steps.',
    exampleGreeting: 'Dear Eleanor,',
    exampleClosing: 'Warmest regards,\nAurora Cloud Customer Support Team',
  },
  {
    id: 'boomer-consultant-emeritus',
    name: 'Robert - Senior Consultant (Baby Boomer)',
    cohort: 'Baby Boomer (59–77)',
    segment: 'High Value',
    digitalProfile: 'Mixed',
    preferredChannel: 'Email',
    archetype: 'Established Professional',
    tonePreference: 'Formal, courteous, articulate, respectful',
    communicationStyle: 'Values proper email etiquette, formal salutations, and clear contact phone numbers.',
    frustrationTriggers: ['Casual emojis, slang, missing formal company signatures'],
    reassuranceRequirements: 'Formal confirmation letter style with verified department signature.',
    exampleGreeting: 'Dear Mr. Robert,',
    exampleClosing: 'With kindest regards,\nAurora Cloud Operations Management',
  },
  {
    id: 'boomer-health-conscious',
    name: 'Margaret - Healthcare Volunteer (Baby Boomer)',
    cohort: 'Baby Boomer (59–77)',
    segment: 'Standard',
    digitalProfile: 'Assisted',
    preferredChannel: 'Voice',
    archetype: 'Voice & Assisted Preference',
    tonePreference: 'Calm, gentle, clear enunciation, patient',
    communicationStyle: 'Prefers automated voice call or clear follow-up email confirming no charges occurred.',
    frustrationTriggers: ['Robotic jargon, fast automated voice scripts, confusing portal logins'],
    reassuranceRequirements: 'Paced script explicitly confirming order was cancelled and $49.50 refund is on its way.',
    exampleGreeting: 'Hello Margaret,',
    exampleClosing: 'Thank you for your patience. Have a wonderful day.',
  },
  {
    id: 'boomer-community-leader',
    name: 'Arthur - Community Board Director (Baby Boomer)',
    cohort: 'Baby Boomer (59–77)',
    segment: 'Premium',
    digitalProfile: 'Mixed',
    preferredChannel: 'Email',
    archetype: 'Civic Leader',
    tonePreference: 'Dignified, reassuring, crystal clear, respectful',
    communicationStyle: 'Expects respectful tone, complete transparency, and clear phone support option.',
    frustrationTriggers: ['Vague corporate double-talk, unhelpful chatbots'],
    reassuranceRequirements: 'Documented transaction ID and telephone support availability.',
    exampleGreeting: 'Dear Arthur,',
    exampleClosing: 'Yours sincerely,\nAurora Cloud Support Services',
  },
  {
    id: 'boomer-family-organizer',
    name: 'Susan - Grandparent & Family Organizer (Baby Boomer)',
    cohort: 'Baby Boomer (59–77)',
    segment: 'Standard',
    digitalProfile: 'Assisted',
    preferredChannel: 'Email',
    archetype: 'Cautious Family Buyer',
    tonePreference: 'Kind, supportive, step-by-step, reassuring',
    communicationStyle: 'Wants reassurance that gift orders or family purchases are safely credited back.',
    frustrationTriggers: ['Complex multi-step verification pages, panic over double-charges'],
    reassuranceRequirements: 'Assurance that bank card ending in 4012 is credited with zero penalty.',
    exampleGreeting: 'Dear Susan,',
    exampleClosing: 'Warm regards,\nAurora Cloud Assistance Team',
  },

  // --- Silent Generation & Specialized Personas (78+ & High Touch) ---
  {
    id: 'silent-assisted-senior',
    name: 'Harold - Assisted Senior Veteran (Silent Generation)',
    cohort: 'Silent Generation (78+)',
    segment: 'Standard',
    digitalProfile: 'Assisted',
    preferredChannel: 'Voice',
    archetype: 'Assisted Senior Living',
    tonePreference: 'Gentle, respectful, slow-paced, clear, comforting',
    communicationStyle: 'Requires slow, clear voice synthesis or large-print readable emails with explicit reassurance.',
    frustrationTriggers: ['Small text, fast speech, automated phone trees'],
    reassuranceRequirements: 'Reassuring human-voiced update confirming everything is in order.',
    exampleGreeting: 'Hello Harold, this is Aurora Cloud,',
    exampleClosing: 'We are taking care of everything for you. Have a great day.',
  },
  {
    id: 'vip-enterprise-procurement',
    name: 'Catherine - Global VP of Procurement (Enterprise VIP)',
    cohort: 'Gen X (43–58)',
    segment: 'VIP',
    digitalProfile: 'Digital-first',
    preferredChannel: 'Email',
    archetype: 'Fortune 500 Procurement Lead',
    tonePreference: 'Ultra-professional, contractual, SLA-focused, decisive',
    communicationStyle: 'Manages multi-million dollar annual contracts. Requires formal vendor notification standards.',
    frustrationTriggers: ['Unstructured communications, unvetted compensation claims'],
    reassuranceRequirements: 'Formal Incident Reference and Supervisor Escalation Ticket.',
    exampleGreeting: 'Dear Ms. Catherine,',
    exampleClosing: 'Sincerely,\nAurora Cloud Enterprise Governance',
  },
  {
    id: 'anxious-first-time-cardholder',
    name: 'Zack - First-Time Credit Card User (Gen Z)',
    cohort: 'Gen Z (18–26)',
    segment: 'New',
    digitalProfile: 'Digital-first',
    preferredChannel: 'WhatsApp',
    archetype: 'Novice Financial Consumer',
    tonePreference: 'Reassuring, informative, direct, friendly',
    communicationStyle: 'Panics when card is debited on failed transaction. Needs fast WhatsApp reassurance.',
    frustrationTriggers: ['Waiting 24 hours for acknowledgment, technical banking terms'],
    reassuranceRequirements: 'Instant message: "Your card ending in 4012 is getting full $49.50 refund automatically."',
    exampleGreeting: 'Hi Zack,',
    exampleClosing: 'Aurora Cloud Support',
  },
  {
    id: 'escalation-prone-merchant',
    name: 'Dmitri - Urgent Escalation Merchant (Millennial)',
    cohort: 'Millennial (27–42)',
    segment: 'High Value',
    digitalProfile: 'Digital-first',
    preferredChannel: 'WhatsApp',
    archetype: 'Impatient Merchant',
    tonePreference: 'Decisive, direct, empathetic, calm, solution-first',
    communicationStyle: 'Wants immediate answers. If there is a delay, expects fee waiver confirmation immediately.',
    frustrationTriggers: ['Delay in response, vague timeline commitments'],
    reassuranceRequirements: 'Fee waiver processed ($25.00) and supervisor SLA confirmed.',
    exampleGreeting: 'Hello Dmitri,',
    exampleClosing: 'Aurora Cloud Escalations',
  },
  {
    id: 'multilingual-immigrant-entrepreneur',
    name: 'Fatima - Multilingual Small Business Lead (Millennial)',
    cohort: 'Millennial (27–42)',
    segment: 'Premium',
    digitalProfile: 'Mixed',
    preferredChannel: 'WhatsApp',
    archetype: 'Cross-Border Entrepreneur',
    tonePreference: 'Clear, polite, plain English, structured, reassuring',
    communicationStyle: 'Appreciates clean, international English with clear headings and bulleted action points.',
    frustrationTriggers: ['Colloquial idioms, ambiguous dates, complex compliance forms'],
    reassuranceRequirements: 'Clear numeric dates (e.g. October 15, 2026), explicit upload links.',
    exampleGreeting: 'Hello Fatima,',
    exampleClosing: 'Warm regards,\nAurora Cloud Verification Team',
  },
];

/**
 * Persona Matching Engine based on Customer Profile attributes
 */
export function matchCustomerPersona(
  customerOrAge: any,
  ageGroupArg?: string,
  digitalProfileArg?: string,
  segmentArg?: string,
  sentimentArg?: string,
  preferredChannelArg?: string
): CustomerPersona {
  let age = 34;
  let ageGroup = '25–34';
  let digitalProfile = 'Digital-first';
  let segment = 'Standard';
  let sentiment = 'Neutral';
  let preferredChannel = 'WhatsApp';

  if (typeof customerOrAge === 'object' && customerOrAge !== null) {
    age = customerOrAge.age || 34;
    ageGroup = customerOrAge.ageGroup || '25–34';
    digitalProfile = customerOrAge.digitalProfile || 'Digital-first';
    segment = customerOrAge.segment || 'Standard';
    sentiment = customerOrAge.sentiment || 'Neutral';
    preferredChannel = customerOrAge.preferredChannel || 'WhatsApp';
  } else {
    age = typeof customerOrAge === 'number' ? customerOrAge : 34;
    ageGroup = ageGroupArg || '25–34';
    digitalProfile = digitalProfileArg || 'Digital-first';
    segment = segmentArg || 'Standard';
    sentiment = sentimentArg || 'Neutral';
    preferredChannel = preferredChannelArg || 'WhatsApp';
  }

  // 1. Filter by Cohort / Age
  let matched = CUSTOMER_PERSONA_CATALOG.filter((p) => {
    if (age <= 26 || ageGroup === '18–24') return p.cohort.startsWith('Gen Z');
    if (age <= 42 || ageGroup === '25–34' || ageGroup === '35–44') return p.cohort.startsWith('Millennial');
    if (age <= 58 || ageGroup === '45–54') return p.cohort.startsWith('Gen X');
    return p.cohort.startsWith('Baby Boomer') || p.cohort.startsWith('Silent');
  });

  if (matched.length === 0) matched = CUSTOMER_PERSONA_CATALOG;

  // 2. Filter by digitalProfile
  const digitalMatched = matched.filter((p) => p.digitalProfile === digitalProfile);
  if (digitalMatched.length > 0) matched = digitalMatched;

  // 3. Filter by channel
  const channelMatched = matched.filter((p) => p.preferredChannel === preferredChannel);
  if (channelMatched.length > 0) matched = channelMatched;

  // 4. Filter by sentiment / segment
  if (segment === 'VIP' || segment === 'High Value') {
    const vipMatched = matched.filter((p) => p.segment === 'VIP' || p.segment === 'High Value');
    if (vipMatched.length > 0) return vipMatched[0];
  }

  return matched[0] || CUSTOMER_PERSONA_CATALOG[0];
}

import React, { useState, useEffect } from 'react';
import { StreamlinedBriefPayload, CustomerProfile, BusinessEvent, BusinessObjective } from '@/core/types';
import {
  MATRIX_CUSTOMERS,
  MATRIX_EVENTS,
  MATRIX_OBJECTIVES,
  MatrixCustomerProfile,
  MatrixBusinessEvent,
  MatrixBusinessObjective,
} from '@/core/test-matrix';
import {
  User,
  AlertCircle,
  Target,
  ArrowRight,
  Sparkles,
  Plus,
  Check,
  SlidersHorizontal,
  AlignLeft,
  ShieldCheck,
  Layers,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CommunicationBriefProps {
  onRunOrchestration: (payload: any) => void;
  isLoading?: boolean;
}

interface EventTypeFieldConfig {
  label1: string;
  placeholder1: string;
  label2: string;
  placeholder2: string;
  label3: string;
  placeholder3: string;
  label4: string;
  statusOptions: Array<{ value: string; label: string }>;
  verifiedFactsPlaceholder: string;
}

const EVENT_TYPE_CONFIGS: Record<string, EventTypeFieldConfig> = {
  payment_successful_order_failed: {
    label1: 'Transaction Ref',
    placeholder1: 'e.g. PAY_99482',
    label2: 'Order / App ID',
    placeholder2: 'e.g. ORD-7721',
    label3: 'Amount',
    placeholder3: 'e.g. $49.50',
    label4: 'Resolution Status',
    statusOptions: [
      { value: 'Refund Initiated', label: 'Refund Initiated' },
      { value: 'Requires Customer Action', label: 'Requires Customer Action' },
      { value: 'Pending Approval', label: 'Pending Approval (POL-FIN-001)' },
      { value: 'Resolved', label: 'Resolved' },
    ],
    verifiedFactsPlaceholder: 'e.g. Payment ID: PAY_99482, Refund to card 4012',
  },
  payment_failed: {
    label1: 'Transaction Ref',
    placeholder1: 'e.g. PAY_FAIL_1092',
    label2: 'Order ID',
    placeholder2: 'e.g. ORD-8832',
    label3: 'Declined Amount',
    placeholder3: 'e.g. $120.00',
    label4: 'Failure / Action Status',
    statusOptions: [
      { value: 'Requires Customer Action', label: 'Requires Customer Action (Retry)' },
      { value: 'Payment Declined', label: 'Payment Declined by Bank' },
      { value: 'Card Expired', label: 'Card Expired' },
      { value: 'Pending Retry', label: 'Pending Retry' },
    ],
    verifiedFactsPlaceholder: 'e.g. Card ending 4419 declined, Retry link valid for 2 hours',
  },
  application_incomplete: {
    label1: 'Application Ref',
    placeholder1: 'e.g. KYC_6621',
    label2: 'Application / Account ID',
    placeholder2: 'e.g. APP-9921',
    label3: 'Required Step / Doc',
    placeholder3: 'e.g. Address Proof / Gov ID',
    label4: 'Application Status',
    statusOptions: [
      { value: 'Requires Customer Action', label: 'Requires Customer Action (Upload Doc)' },
      { value: 'Pending Verification', label: 'Pending Verification' },
      { value: 'Under Review', label: 'Under Review' },
      { value: 'Incomplete KYC', label: 'Incomplete KYC' },
    ],
    verifiedFactsPlaceholder: 'e.g. Identity verified, Address proof needed by Oct 15',
  },
  customer_complaint: {
    label1: 'Dispute / Case Ref',
    placeholder1: 'e.g. DISP_5520',
    label2: 'Order / Shipment ID',
    placeholder2: 'e.g. ENT-5520',
    label3: 'Claimed / Credit Amount',
    placeholder3: 'e.g. $250.00',
    label4: 'Escalation Status',
    statusOptions: [
      { value: 'Pending Approval', label: 'Pending Approval (Supervisor Gate)' },
      { value: 'Escalated to Operations', label: 'Escalated to Operations' },
      { value: 'Fee Waiver Applied', label: 'Fee Waiver Applied' },
      { value: 'Resolved', label: 'Resolved' },
    ],
    verifiedFactsPlaceholder: 'e.g. Shipment delayed 48h, $25 fee waived, credit pending approval',
  },
  subscription_expiring: {
    label1: 'Subscription Ref',
    placeholder1: 'e.g. SUB_4410',
    label2: 'Plan / Account ID',
    placeholder2: 'e.g. SUB-4410 (Cloud Pro Tier)',
    label3: 'Renewal Amount',
    placeholder3: 'e.g. $299.00/yr',
    label4: 'Renewal Status',
    statusOptions: [
      { value: 'Resolved', label: 'Resolved (Active / Notice Sent)' },
      { value: 'Renewal Pending', label: 'Renewal Pending (7 Days Remaining)' },
      { value: 'Card Expiring Soon', label: 'Card Expiring Soon' },
      { value: 'Requires Customer Action', label: 'Requires Customer Action (Confirm Plan)' },
    ],
    verifiedFactsPlaceholder: 'e.g. Renews Oct 20, 20% loyalty bonus storage voucher available',
  },
};

export const CommunicationBrief: React.FC<CommunicationBriefProps> = ({
  onRunOrchestration,
  isLoading,
}) => {
  // Scenario Presets Selection State (Unselected and Minimized by default)
  const [isMatrixExpanded, setIsMatrixExpanded] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>('');

  // Column Tabs: Default to 'structured' on the LEFT
  const [customerTab, setCustomerTab] = useState<'structured' | 'text'>('structured');
  const [eventTab, setEventTab] = useState<'structured' | 'text'>('structured');
  const [objectiveTab, setObjectiveTab] = useState<'structured' | 'text'>('structured');

  // Column 1 Structured & Text State (Default Empty)
  const [structCustomerName, setStructCustomerName] = useState('');
  const [structAgeGroup, setStructAgeGroup] = useState<any>('25–34');
  const [structSegment, setStructSegment] = useState<any>('Standard');
  const [structDigitalProfile, setStructDigitalProfile] = useState<any>('Digital-first');
  const [structConsentTx, setStructConsentTx] = useState(true);
  const [structConsentPromo, setStructConsentPromo] = useState(true);
  const [structSentiment, setStructSentiment] = useState<any>('Neutral');
  const [structSupportContacts, setStructSupportContacts] = useState(0);
  const [customerText, setCustomerText] = useState('');
  const [customerPills, setCustomerPills] = useState<string[]>([]);
  const [customCustomerPillInput, setCustomCustomerPillInput] = useState('');
  const [isAddingCustomerPill, setIsAddingCustomerPill] = useState(false);

  // Column 2 Structured & Text State (Default Empty)
  const [structEventType, setStructEventType] = useState<any>('payment_successful_order_failed');
  const [structEventTitle, setStructEventTitle] = useState('');
  const [structTransactionId, setStructTransactionId] = useState('');
  const [structOrderId, setStructOrderId] = useState('');
  const [structAmount, setStructAmount] = useState('');
  const [structVerifiedFacts, setStructVerifiedFacts] = useState('');
  const [structResolutionStatus, setStructResolutionStatus] = useState<any>('Refund Initiated');
  const [eventText, setEventText] = useState('');
  const [eventPills, setEventPills] = useState<string[]>([]);
  const [customEventPillInput, setCustomEventPillInput] = useState('');
  const [isAddingEventPill, setIsAddingEventPill] = useState(false);

  // Column 3 Structured & Text State (Default Empty)
  const [structPrimaryObjective, setStructPrimaryObjective] = useState<any>('resolve_issue');
  const [structSecondaryObjective, setStructSecondaryObjective] = useState('');
  const [objectiveText, setObjectiveText] = useState('');
  const [objectivePills, setObjectivePills] = useState<string[]>([]);
  const [customObjectivePillInput, setCustomObjectivePillInput] = useState('');
  const [isAddingObjectivePill, setIsAddingObjectivePill] = useState(false);

  // Synchronize fields when Customer dropdown changes
  const handleCustomerChange = (custId: string) => {
    setSelectedCustomerId(custId);
    if (!custId) {
      setStructCustomerName('');
      setStructAgeGroup('25–34');
      setStructSegment('Standard');
      setStructDigitalProfile('Digital-first');
      setStructSentiment('Neutral');
      setStructSupportContacts(0);
      setCustomerText('');
      setCustomerPills([]);
      return;
    }
    const cust = MATRIX_CUSTOMERS.find((c) => c.id === custId);
    if (cust) {
      setStructCustomerName(cust.name);
      setStructAgeGroup(cust.ageGroup);
      setStructSegment(cust.segment);
      setStructDigitalProfile(cust.digitalProfile);
      setStructSentiment(cust.sentiment);
      setStructSupportContacts(cust.previousSupportContacts);
      setCustomerText(cust.descriptionText);
      setCustomerPills(cust.pills);
    }
  };

  // Synchronize fields when Event dropdown changes
  const handleEventChange = (evtId: string) => {
    setSelectedEventId(evtId);
    if (!evtId) {
      setStructEventType('payment_successful_order_failed');
      setStructEventTitle('');
      setStructTransactionId('');
      setStructOrderId('');
      setStructAmount('');
      setStructVerifiedFacts('');
      setStructResolutionStatus('Refund Initiated');
      setEventText('');
      setEventPills([]);
      return;
    }
    const evt = MATRIX_EVENTS.find((e) => e.id === evtId);
    if (evt) {
      setStructEventType(evt.eventType);
      setStructEventTitle(evt.title);
      setStructTransactionId(evt.transactionId);
      setStructOrderId(evt.orderId);
      setStructAmount(evt.amount);
      setStructVerifiedFacts(evt.verifiedFacts);
      setStructResolutionStatus(evt.resolutionStatus);
      setEventText(evt.descriptionText);
      setEventPills(evt.pills);
    }
  };

  // Synchronize fields when Objective dropdown changes
  const handleObjectiveChange = (objId: string) => {
    setSelectedObjectiveId(objId);
    if (!objId) {
      setStructPrimaryObjective('resolve_issue');
      setStructSecondaryObjective('');
      setObjectiveText('');
      setObjectivePills([]);
      return;
    }
    const obj = MATRIX_OBJECTIVES.find((o) => o.id === objId);
    if (obj) {
      setStructPrimaryObjective(obj.primary);
      setStructSecondaryObjective(obj.secondary);
      setObjectiveText(obj.descriptionText);
      setObjectivePills(obj.pills);
    }
  };

  // Toggle filter pills
  const togglePill = (pill: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(pill)) {
      setList(list.filter((p) => p !== pill));
    } else {
      setList([...list, pill]);
    }
  };

  const availableCustomerPills = [
    '18–24', '25–34', '35–44', '45–54', '55+',
    'Standard', 'Premium', 'High Value', 'VIP',
    'Digital-first', 'Mixed', 'Assisted-service',
    'New Customer', 'Long-term', 'High LTV',
  ];

  const availableEventPills = [
    'Payment Ok / Order Failed',
    'Payment Failed',
    'Incomplete Application / Pending KYC',
    'Shipment Delayed',
    'Service Disruption / Maintenance',
    'Billing Dispute / Escalation',
  ];

  const availableObjectivePills = [
    'Resolve Issue Proactively',
    'Minimise Support Contacts',
    'Reassure Customer',
    'Retain High-Value Customer',
    'Complete Onboarding',
    'Recover Revenue',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCustomerName = structCustomerName.trim() || 'Customer';
    const finalEventTitle = structEventTitle.trim() || structEventType.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    const finalTxId = structTransactionId.trim();
    const finalOrderId = structOrderId.trim();
    const finalAmount = structAmount.trim();
    
    const finalVerifiedFacts: string[] = [];
    if (structVerifiedFacts.trim().length > 0) {
      finalVerifiedFacts.push(...structVerifiedFacts.split(',').map((f) => f.trim()).filter(Boolean));
    } else {
      if (finalTxId) finalVerifiedFacts.push(`Transaction ID: ${finalTxId}`);
      if (finalOrderId) finalVerifiedFacts.push(`Order ID: ${finalOrderId}`);
      if (finalAmount) finalVerifiedFacts.push(`Amount: ${finalAmount}`);
      if (finalVerifiedFacts.length === 0) {
        finalVerifiedFacts.push(`Event: ${finalEventTitle}`);
        finalVerifiedFacts.push(`Status: ${structResolutionStatus}`);
      }
    }

    const customerPayload: CustomerProfile = {
      id: `CUST-${Date.now()}`,
      name: finalCustomerName,
      age: structAgeGroup === '18–24' ? 22 : structAgeGroup === '55+' ? 66 : structAgeGroup === '45–54' ? 48 : structAgeGroup === '35–44' ? 38 : 34,
      ageGroup: structAgeGroup,
      segment: structSegment,
      digitalProfile: structDigitalProfile,
      preferredLanguage: 'English' as const,
      preferredChannel: structDigitalProfile === 'Assisted' ? 'Email' as const : 'WhatsApp' as const,
      consent: { transactional: structConsentTx, promotional: structConsentPromo, voice: structDigitalProfile === 'Assisted' },
      customerValue: structSegment === 'VIP' ? 'VIP' as const : structSegment === 'High Value' ? 'High' as const : structSegment === 'Premium' ? 'High' as const : 'Standard' as const,
      tenureMonths: 18,
      recentCommunicationCount24h: { transactional: 1, promotional: 0 },
      previousSupportContacts: structSupportContacts,
      sentiment: structSentiment,
      email: `${finalCustomerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com`,
      phone: '+91 98765 43210',
    };

    const eventPayload: BusinessEvent = {
      id: `EVT-${Date.now()}`,
      eventType: structEventType,
      title: finalEventTitle,
      description: eventText.trim() || `${finalEventTitle} status update.`,
      timestamp: 'Just now',
      verifiedFacts: finalVerifiedFacts,
      resolutionStatus: structResolutionStatus,
      transactionId: finalTxId || undefined,
      orderId: finalOrderId || undefined,
      amount: finalAmount || undefined,
    };

    const objectivePayload: BusinessObjective = {
      primary: structPrimaryObjective,
      secondary: structSecondaryObjective.trim() || structPrimaryObjective.replace(/_/g, ' '),
      customNote: objectiveText,
    };

    if (customerTab === 'structured' && eventTab === 'structured' && objectiveTab === 'structured') {
      onRunOrchestration({
        customer: customerPayload,
        event: eventPayload,
        objective: objectivePayload,
        useSamplePolicyTree: true,
      });
    } else {
      onRunOrchestration({
        customerProfileText: customerTab === 'structured' 
          ? `Customer: ${finalCustomerName}, Age: ${structAgeGroup}, Segment: ${structSegment}, Digital: ${structDigitalProfile}, Sentiment: ${structSentiment}` 
          : (customerText.trim() || `Customer: Customer, Age: 25–34, Segment: Standard, Digital: Digital-first, Sentiment: Neutral`),
        customerPills: customerTab === 'structured' ? [structAgeGroup, structSegment, structDigitalProfile] : (customerPills.length > 0 ? customerPills : ['25–34', 'Standard', 'Digital-first']),
        eventHistoryText: eventTab === 'structured' 
          ? `${finalEventTitle}. ${finalVerifiedFacts.join(', ')}` 
          : (eventText.trim() || `${finalEventTitle}. Auto-refund initiated to original payment method.`),
        eventPills: eventTab === 'structured' ? [structEventType.replace(/_/g, ' ')] : (eventPills.length > 0 ? eventPills : [structEventType.replace(/_/g, ' ')]),
        objectiveText: objectiveTab === 'structured' ? `${structPrimaryObjective.replace(/_/g, ' ')}. ${structSecondaryObjective}` : (objectiveText.trim() || 'Resolve issue and reassure customer.'),
        objectivePills: objectiveTab === 'structured' ? [structPrimaryObjective.replace(/_/g, ' ')] : (objectivePills.length > 0 ? objectivePills : ['Resolve issue']),
        useSamplePolicyTree: true,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Eyebrow */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-aurora-neutral-200 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-aurora-primary bg-aurora-primary-light px-2.5 py-1 rounded">
              Communication Brief
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-aurora-neutral-900 tracking-tight">
            Customer Communication Brief
          </h1>
          <p className="text-sm text-aurora-neutral-700 mt-1 max-w-3xl leading-relaxed">
            Enter customer profile details, event information, and business goals—or choose from pre-configured scenarios below. The AI engine automatically adapts tone, channel routing, and policy guardrails.
          </p>
        </div>
      </div>

      {/* SCENARIO PRESETS SELECTOR BAR (Collapsible - Minimized by default) */}
      <div className="bg-aurora-neutral-0 rounded-xl border border-aurora-neutral-200 shadow-aurora overflow-hidden transition-all">
        {/* Toggle Bar / Header */}
        <div
          onClick={() => setIsMatrixExpanded(!isMatrixExpanded)}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-aurora-neutral-50/80 transition select-none"
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-md bg-aurora-primary-light text-aurora-primary">
              <Layers strokeWidth={1.5} className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-aurora-neutral-900">
                  Scenario Presets
                </h3>
                {selectedCustomerId || selectedEventId || selectedObjectiveId ? (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded font-bold">
                    Preset Loaded
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] text-aurora-neutral-500 mt-0.5">
                {selectedCustomerId || selectedEventId || selectedObjectiveId ? (
                  <>
                    Loaded: <strong className="text-aurora-neutral-900">{structCustomerName || 'Custom'}</strong> ({structAgeGroup}) • <span className="text-aurora-neutral-800">{structEventType.replace(/_/g, ' ')}</span> • <span className="text-aurora-neutral-800">{structPrimaryObjective.replace(/_/g, ' ')}</span>
                  </>
                ) : (
                  'Choose a pre-configured customer scenario or fill in details manually below'
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMatrixExpanded(!isMatrixExpanded);
            }}
            className="p-2 bg-aurora-neutral-100 hover:bg-aurora-neutral-200 text-aurora-neutral-700 border border-aurora-neutral-300 rounded-lg shadow-2xs transition"
            aria-label={isMatrixExpanded ? 'Minimize Presets' : 'Expand Presets'}
          >
            {isMatrixExpanded ? (
              <ChevronUp strokeWidth={2} className="w-4 h-4" />
            ) : (
              <ChevronDown strokeWidth={2} className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Expandable Dropdowns Body */}
        {isMatrixExpanded && (
          <div className="p-5 pt-0 space-y-4 border-t border-aurora-neutral-200/70 bg-aurora-neutral-50/40 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
              {/* Dropdown 1: Customer Profile */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-aurora-neutral-700">
                  1. Customer Profile Cohort
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full p-2.5 bg-white border border-aurora-neutral-300 rounded-lg text-xs font-semibold text-aurora-neutral-900 focus:ring-1 focus:ring-aurora-primary shadow-2xs"
                >
                  <option value="">-- Choose Customer Cohort Preset --</option>
                  {MATRIX_CUSTOMERS.map((cust) => (
                    <option key={cust.id} value={cust.id}>
                      {cust.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown 2: Business Event */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-aurora-neutral-700">
                  2. Event & Telemetry
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => handleEventChange(e.target.value)}
                  className="w-full p-2.5 bg-white border border-aurora-neutral-300 rounded-lg text-xs font-semibold text-aurora-neutral-900 focus:ring-1 focus:ring-aurora-primary shadow-2xs"
                >
                  <option value="">-- Choose Event & Telemetry Preset --</option>
                  {MATRIX_EVENTS.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown 3: Business Objective */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-aurora-neutral-700">
                  3. Business Objective
                </label>
                <select
                  value={selectedObjectiveId}
                  onChange={(e) => handleObjectiveChange(e.target.value)}
                  className="w-full p-2.5 bg-white border border-aurora-neutral-300 rounded-lg text-xs font-semibold text-aurora-neutral-900 focus:ring-1 focus:ring-aurora-primary shadow-2xs"
                >
                  <option value="">-- Choose Business Objective Preset --</option>
                  {MATRIX_OBJECTIVES.map((obj) => (
                    <option key={obj.id} value={obj.id}>
                      {obj.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3-COLUMN BRIEF FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUMN 1: CUSTOMER PROFILE */}
          <div className="bg-aurora-neutral-0 rounded-xl border border-aurora-neutral-200 shadow-aurora flex flex-col justify-between overflow-hidden">
            <div>
              {/* Card Header & Tabs (Header followed by Tab in hierarchy) */}
              <div className="p-4 bg-aurora-neutral-50/80 border-b border-aurora-neutral-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <User strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-aurora-neutral-900">1. Customer Profile</h3>
                </div>
                <div className="flex bg-aurora-neutral-200/70 p-0.5 rounded-lg text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setCustomerTab('structured')}
                    className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md transition ${
                      customerTab === 'structured'
                        ? 'bg-white text-aurora-neutral-900 shadow-2xs font-bold'
                        : 'text-aurora-neutral-600 hover:text-aurora-neutral-900'
                    }`}
                  >
                    <SlidersHorizontal strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>Structured Form</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerTab('text')}
                    className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md transition ${
                      customerTab === 'text'
                        ? 'bg-white text-aurora-neutral-900 shadow-2xs font-bold'
                        : 'text-aurora-neutral-600 hover:text-aurora-neutral-900'
                    }`}
                  >
                    <AlignLeft strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>Text & Pills</span>
                  </button>
                </div>
              </div>

              {/* Tab 1 (Default / Left): Structured Form */}
              {customerTab === 'structured' && (
                <div className="p-4 space-y-3 text-xs">
                  <div>
                    <label className="block text-aurora-neutral-700 font-medium mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={structCustomerName}
                      onChange={(e) => setStructCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 font-semibold focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-aurora-neutral-700 font-medium mb-1">Age Group</label>
                      <select
                        value={structAgeGroup}
                        onChange={(e) => setStructAgeGroup(e.target.value)}
                        className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                      >
                        <option value="18–24">18–24 (Gen Z)</option>
                        <option value="25–34">25–34 (Millennial)</option>
                        <option value="35–44">35–44 (Mid Millennial)</option>
                        <option value="45–54">45–54 (Gen X)</option>
                        <option value="55+">55+ (Senior / Boomer)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-aurora-neutral-700 font-medium mb-1">Account Tier</label>
                      <select
                        value={structSegment}
                        onChange={(e) => setStructSegment(e.target.value)}
                        className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                      >
                        <option value="Standard">Standard Tier</option>
                        <option value="Premium">Premium Tier</option>
                        <option value="High Value">High Value VIP</option>
                        <option value="New">New Customer</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-aurora-neutral-700 font-medium mb-1">Digital Maturity</label>
                      <select
                        value={structDigitalProfile}
                        onChange={(e) => setStructDigitalProfile(e.target.value)}
                        className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                      >
                        <option value="Digital-first">Digital-first (App/WA)</option>
                        <option value="Mixed">Mixed (Email/SMS)</option>
                        <option value="Assisted">Assisted (Email/Voice)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-aurora-neutral-700 font-medium mb-1">Sentiment</label>
                      <select
                        value={structSentiment}
                        onChange={(e) => setStructSentiment(e.target.value)}
                        className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                      >
                        <option value="Neutral">Neutral</option>
                        <option value="Frustrated">Frustrated</option>
                        <option value="Anxious">Anxious</option>
                        <option value="Satisfied">Satisfied</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-aurora-neutral-700 font-medium mb-1">Prior Support Contacts (30d)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={structSupportContacts}
                      onChange={(e) => setStructSupportContacts(parseInt(e.target.value) || 0)}
                      className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Text Area & Filter Pills */}
              {customerTab === 'text' && (
                <div className="p-4 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-aurora-neutral-700">Customer Description</label>
                      <span className="text-[10px] text-aurora-neutral-500">{customerText.length} chars</span>
                    </div>
                    <textarea
                      rows={4}
                      value={customerText}
                      onChange={(e) => setCustomerText(e.target.value)}
                      placeholder="Describe customer background, demographic, engagement history..."
                      className="w-full p-3 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded-lg text-xs text-aurora-neutral-900 focus:bg-white focus:ring-1 focus:ring-aurora-primary leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-aurora-neutral-500 mb-2">
                      Filter Pills
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {availableCustomerPills.map((pill) => {
                        const isSelected = customerPills.includes(pill);
                        return (
                          <button
                            key={pill}
                            type="button"
                            onClick={() => togglePill(pill, customerPills, setCustomerPills)}
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition flex items-center space-x-1 ${
                              isSelected
                                ? 'bg-aurora-primary text-white border-aurora-primary shadow-2xs'
                                : 'bg-aurora-neutral-100 text-aurora-neutral-700 border-aurora-neutral-300 hover:bg-aurora-neutral-200'
                            }`}
                          >
                            <span>{pill}</span>
                            {isSelected && <Check strokeWidth={2} className="w-3 h-3 ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-aurora-neutral-100 border-t border-aurora-neutral-200 text-[11px] text-aurora-neutral-600">
              Defines customer identity, demographic cohort, and communication preferences.
            </div>
          </div>

          {/* COLUMN 2: BUSINESS EVENT */}
          <div className="bg-aurora-neutral-0 rounded-xl border border-aurora-neutral-200 shadow-aurora flex flex-col justify-between overflow-hidden">
            <div>
              {/* Card Header & Tabs (Header followed by Tab in hierarchy) */}
              <div className="p-4 bg-aurora-neutral-50/80 border-b border-aurora-neutral-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-aurora-neutral-900">2. Business Event</h3>
                </div>
                <div className="flex bg-aurora-neutral-200/70 p-0.5 rounded-lg text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setEventTab('structured')}
                    className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md transition ${
                      eventTab === 'structured'
                        ? 'bg-white text-aurora-neutral-900 shadow-2xs font-bold'
                        : 'text-aurora-neutral-600 hover:text-aurora-neutral-900'
                    }`}
                  >
                    <SlidersHorizontal strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>Structured Form</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventTab('text')}
                    className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md transition ${
                      eventTab === 'text'
                        ? 'bg-white text-aurora-neutral-900 shadow-2xs font-bold'
                        : 'text-aurora-neutral-600 hover:text-aurora-neutral-900'
                    }`}
                  >
                    <AlignLeft strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>Text & Pills</span>
                  </button>
                </div>
              </div>

              {/* Tab 1 (Default / Left): Structured Form */}
              {eventTab === 'structured' && (() => {
                const currentConfig = EVENT_TYPE_CONFIGS[structEventType] || EVENT_TYPE_CONFIGS.payment_successful_order_failed;
                return (
                  <div className="p-4 space-y-3 text-xs">
                    <div>
                      <label className="block text-aurora-neutral-700 font-medium mb-1">Event Type</label>
                      <select
                        value={structEventType}
                        onChange={(e) => {
                          const nextType = e.target.value;
                          setStructEventType(nextType);
                          const nextConfig = EVENT_TYPE_CONFIGS[nextType];
                          if (nextConfig && !nextConfig.statusOptions.some((opt) => opt.value === structResolutionStatus)) {
                            setStructResolutionStatus(nextConfig.statusOptions[0].value);
                          }
                        }}
                        className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 font-semibold focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                      >
                        <option value="payment_successful_order_failed">Payment Ok / Order Failed</option>
                        <option value="payment_failed">Payment Failed (Card Decline)</option>
                        <option value="application_incomplete">Pending KYC / Incomplete Application</option>
                        <option value="customer_complaint">Delivery Dispute / Compensation Escalation</option>
                        <option value="subscription_expiring">Subscription Renewal / Loyalty Perk</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-aurora-neutral-700 font-medium mb-1">{currentConfig.label1}</label>
                        <input
                          type="text"
                          value={structTransactionId}
                          onChange={(e) => setStructTransactionId(e.target.value)}
                          placeholder={currentConfig.placeholder1}
                          className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-aurora-neutral-700 font-medium mb-1">{currentConfig.label2}</label>
                        <input
                          type="text"
                          value={structOrderId}
                          onChange={(e) => setStructOrderId(e.target.value)}
                          placeholder={currentConfig.placeholder2}
                          className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-aurora-neutral-700 font-medium mb-1">{currentConfig.label3}</label>
                        <input
                          type="text"
                          value={structAmount}
                          onChange={(e) => setStructAmount(e.target.value)}
                          placeholder={currentConfig.placeholder3}
                          className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-aurora-neutral-700 font-medium mb-1">{currentConfig.label4}</label>
                        <select
                          value={structResolutionStatus}
                          onChange={(e) => setStructResolutionStatus(e.target.value)}
                          className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                        >
                          {currentConfig.statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-aurora-neutral-700 font-medium mb-1">Verified System Facts</label>
                      <input
                        type="text"
                        value={structVerifiedFacts}
                        onChange={(e) => setStructVerifiedFacts(e.target.value)}
                        placeholder={currentConfig.verifiedFactsPlaceholder}
                        className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 text-xs focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Tab 2: Text Area & Filter Pills */}
              {eventTab === 'text' && (
                <div className="p-4 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-aurora-neutral-700">Event Description & Telemetry</label>
                      <span className="text-[10px] text-aurora-neutral-500">{eventText.length} chars</span>
                    </div>
                    <textarea
                      rows={4}
                      value={eventText}
                      onChange={(e) => setEventText(e.target.value)}
                      placeholder="Paste event telemetry, transaction details, and system state..."
                      className="w-full p-3 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded-lg text-xs text-aurora-neutral-900 focus:bg-white focus:ring-1 focus:ring-aurora-primary leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-aurora-neutral-500 mb-2">
                      Event Category Pills
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {availableEventPills.map((pill) => {
                        const isSelected = eventPills.includes(pill);
                        return (
                          <button
                            key={pill}
                            type="button"
                            onClick={() => togglePill(pill, eventPills, setEventPills)}
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition flex items-center space-x-1 ${
                              isSelected
                                ? 'bg-aurora-primary text-white border-aurora-primary shadow-2xs'
                                : 'bg-aurora-neutral-100 text-aurora-neutral-700 border-aurora-neutral-300 hover:bg-aurora-neutral-200'
                            }`}
                          >
                            <span>{pill}</span>
                            {isSelected && <Check strokeWidth={2} className="w-3 h-3 ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-aurora-neutral-100 border-t border-aurora-neutral-200 text-[11px] text-aurora-neutral-600">
              Specifies the transaction event and system status to generate an accurate resolution message.
            </div>
          </div>

          {/* COLUMN 3: BUSINESS OBJECTIVE */}
          <div className="bg-aurora-neutral-0 rounded-xl border border-aurora-neutral-200 shadow-aurora flex flex-col justify-between overflow-hidden">
            <div>
              {/* Card Header & Tabs (Header followed by Tab in hierarchy) */}
              <div className="p-4 bg-aurora-neutral-50/80 border-b border-aurora-neutral-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <Target strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-aurora-neutral-900">3. Business Objective</h3>
                </div>
                <div className="flex bg-aurora-neutral-200/70 p-0.5 rounded-lg text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setObjectiveTab('structured')}
                    className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md transition ${
                      objectiveTab === 'structured'
                        ? 'bg-white text-aurora-neutral-900 shadow-2xs font-bold'
                        : 'text-aurora-neutral-600 hover:text-aurora-neutral-900'
                    }`}
                  >
                    <SlidersHorizontal strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>Structured Form</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setObjectiveTab('text')}
                    className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md transition ${
                      objectiveTab === 'text'
                        ? 'bg-white text-aurora-neutral-900 shadow-2xs font-bold'
                        : 'text-aurora-neutral-600 hover:text-aurora-neutral-900'
                    }`}
                  >
                    <AlignLeft strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>Text & Pills</span>
                  </button>
                </div>
              </div>

              {/* Tab 1 (Default / Left): Structured Form */}
              {objectiveTab === 'structured' && (
                <div className="p-4 space-y-3 text-xs">
                  <div>
                    <label className="block text-aurora-neutral-700 font-medium mb-1">Primary Objective</label>
                    <select
                      value={structPrimaryObjective}
                      onChange={(e) => setStructPrimaryObjective(e.target.value)}
                      className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 font-semibold focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                    >
                      <option value="resolve_issue">Resolve issue proactively</option>
                      <option value="reduce_support_contacts">Minimise incoming support contacts (Deflection)</option>
                      <option value="reassure_customer">Reassure customer / Calm anxiety</option>
                      <option value="retain_customer">Retain high-value customer</option>
                      <option value="complete_application">Complete onboarding / KYC upload</option>
                      <option value="recover_payment">Recover failed payment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-aurora-neutral-700 font-medium mb-1">Secondary Guidance Note</label>
                    <textarea
                      rows={5}
                      value={structSecondaryObjective}
                      onChange={(e) => setStructSecondaryObjective(e.target.value)}
                      placeholder="Specific priorities or constraints..."
                      className="w-full p-2.5 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Text Area & Filter Pills */}
              {objectiveTab === 'text' && (
                <div className="p-4 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-aurora-neutral-700">Objective Statement</label>
                      <span className="text-[10px] text-aurora-neutral-500">{objectiveText.length} chars</span>
                    </div>
                    <textarea
                      rows={4}
                      value={objectiveText}
                      onChange={(e) => setObjectiveText(e.target.value)}
                      placeholder="Specify business intent, deflection goals, and reassurance targets..."
                      className="w-full p-3 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded-lg text-xs text-aurora-neutral-900 focus:bg-white focus:ring-1 focus:ring-aurora-primary leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-aurora-neutral-500 mb-2">
                      Objective Goal Pills
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {availableObjectivePills.map((pill) => {
                        const isSelected = objectivePills.includes(pill);
                        return (
                          <button
                            key={pill}
                            type="button"
                            onClick={() => togglePill(pill, objectivePills, setObjectivePills)}
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition flex items-center space-x-1 ${
                              isSelected
                                ? 'bg-aurora-primary text-white border-aurora-primary shadow-2xs'
                                : 'bg-aurora-neutral-100 text-aurora-neutral-700 border-aurora-neutral-300 hover:bg-aurora-neutral-200'
                            }`}
                          >
                            <span>{pill}</span>
                            {isSelected && <Check strokeWidth={2} className="w-3 h-3 ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-aurora-neutral-100 border-t border-aurora-neutral-200 text-[11px] text-aurora-neutral-600">
              Defines the primary communication goal, call-to-action type, and required customer actions.
            </div>
          </div>
        </div>

        {/* PRIMARY SUBMIT CTA */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 bg-aurora-primary hover:bg-aurora-primary-hover text-white rounded-lg text-sm font-bold shadow-aurora-md flex items-center justify-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Generating Governed Communication...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>Generate Communication & Previews</span>
                <ArrowRight strokeWidth={1.75} className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

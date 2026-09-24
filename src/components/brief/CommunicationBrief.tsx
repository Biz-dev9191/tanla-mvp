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
} from 'lucide-react';

interface CommunicationBriefProps {
  onRunOrchestration: (payload: any) => void;
  isLoading?: boolean;
}

export const CommunicationBrief: React.FC<CommunicationBriefProps> = ({
  onRunOrchestration,
  isLoading,
}) => {
  // Test Matrix 5x5x5 Selection State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(MATRIX_CUSTOMERS[0].id);
  const [selectedEventId, setSelectedEventId] = useState<string>(MATRIX_EVENTS[0].id);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>(MATRIX_OBJECTIVES[0].id);

  // Column Tabs: Default to 'structured' on the LEFT
  const [customerTab, setCustomerTab] = useState<'structured' | 'text'>('structured');
  const [eventTab, setEventTab] = useState<'structured' | 'text'>('structured');
  const [objectiveTab, setObjectiveTab] = useState<'structured' | 'text'>('structured');

  // Column 1 Structured & Text State
  const [structCustomerName, setStructCustomerName] = useState(MATRIX_CUSTOMERS[0].name);
  const [structAgeGroup, setStructAgeGroup] = useState<any>(MATRIX_CUSTOMERS[0].ageGroup);
  const [structSegment, setStructSegment] = useState<any>(MATRIX_CUSTOMERS[0].segment);
  const [structDigitalProfile, setStructDigitalProfile] = useState<any>(MATRIX_CUSTOMERS[0].digitalProfile);
  const [structConsentTx, setStructConsentTx] = useState(true);
  const [structConsentPromo, setStructConsentPromo] = useState(true);
  const [structSentiment, setStructSentiment] = useState<any>(MATRIX_CUSTOMERS[0].sentiment);
  const [structSupportContacts, setStructSupportContacts] = useState(MATRIX_CUSTOMERS[0].previousSupportContacts);
  const [customerText, setCustomerText] = useState(MATRIX_CUSTOMERS[0].descriptionText);
  const [customerPills, setCustomerPills] = useState<string[]>(MATRIX_CUSTOMERS[0].pills);
  const [customCustomerPillInput, setCustomCustomerPillInput] = useState('');
  const [isAddingCustomerPill, setIsAddingCustomerPill] = useState(false);

  // Column 2 Structured & Text State
  const [structEventType, setStructEventType] = useState<any>(MATRIX_EVENTS[0].eventType);
  const [structEventTitle, setStructEventTitle] = useState(MATRIX_EVENTS[0].title);
  const [structTransactionId, setStructTransactionId] = useState(MATRIX_EVENTS[0].transactionId);
  const [structOrderId, setStructOrderId] = useState(MATRIX_EVENTS[0].orderId);
  const [structAmount, setStructAmount] = useState(MATRIX_EVENTS[0].amount);
  const [structVerifiedFacts, setStructVerifiedFacts] = useState(MATRIX_EVENTS[0].verifiedFacts);
  const [structResolutionStatus, setStructResolutionStatus] = useState<any>(MATRIX_EVENTS[0].resolutionStatus);
  const [eventText, setEventText] = useState(MATRIX_EVENTS[0].descriptionText);
  const [eventPills, setEventPills] = useState<string[]>(MATRIX_EVENTS[0].pills);
  const [customEventPillInput, setCustomEventPillInput] = useState('');
  const [isAddingEventPill, setIsAddingEventPill] = useState(false);

  // Column 3 Structured & Text State
  const [structPrimaryObjective, setStructPrimaryObjective] = useState<any>(MATRIX_OBJECTIVES[0].primary);
  const [structSecondaryObjective, setStructSecondaryObjective] = useState(MATRIX_OBJECTIVES[0].secondary);
  const [objectiveText, setObjectiveText] = useState(MATRIX_OBJECTIVES[0].descriptionText);
  const [objectivePills, setObjectivePills] = useState<string[]>(MATRIX_OBJECTIVES[0].pills);
  const [customObjectivePillInput, setCustomObjectivePillInput] = useState('');
  const [isAddingObjectivePill, setIsAddingObjectivePill] = useState(false);

  // Policy Tree Mode State (PTGAP-2026)
  const [policyOption, setPolicyOption] = useState<'none' | 'sample' | 'custom'>('none');
  const [customPolicyDocText, setCustomPolicyDocText] = useState<string>('');

  // Synchronize fields when Customer dropdown changes
  const handleCustomerChange = (custId: string) => {
    setSelectedCustomerId(custId);
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

    const customerPayload: CustomerProfile = {
      id: `CUST-${Date.now()}`,
      name: structCustomerName,
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
      email: `${structCustomerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: '+91 98765 43210',
    };

    const eventPayload: BusinessEvent = {
      id: `EVT-${Date.now()}`,
      eventType: structEventType,
      title: structEventTitle,
      description: eventText,
      timestamp: 'Just now',
      verifiedFacts: structVerifiedFacts.split(',').map((f) => f.trim()).filter(Boolean),
      resolutionStatus: structResolutionStatus,
      transactionId: structTransactionId,
      orderId: structOrderId,
      amount: structAmount,
    };

    const objectivePayload: BusinessObjective = {
      primary: structPrimaryObjective,
      secondary: structSecondaryObjective,
      customNote: objectiveText,
    };

    if (customerTab === 'structured' && eventTab === 'structured' && objectiveTab === 'structured') {
      onRunOrchestration({
        customer: customerPayload,
        event: eventPayload,
        objective: objectivePayload,
        useSamplePolicyTree: policyOption === 'sample',
        customPolicyDocText: policyOption === 'custom' ? customPolicyDocText : undefined,
      });
    } else {
      onRunOrchestration({
        customerProfileText: customerTab === 'structured' ? `Customer: ${structCustomerName}, Age: ${structAgeGroup}, Segment: ${structSegment}, Digital: ${structDigitalProfile}, Sentiment: ${structSentiment}` : customerText,
        customerPills: customerTab === 'structured' ? [structAgeGroup, structSegment, structDigitalProfile] : customerPills,
        eventHistoryText: eventTab === 'structured' ? `${structEventTitle}. Verified: ${structVerifiedFacts}` : eventText,
        eventPills: eventTab === 'structured' ? [structEventType.replace(/_/g, ' ')] : eventPills,
        objectiveText: objectiveTab === 'structured' ? `${structPrimaryObjective.replace(/_/g, ' ')}. ${structSecondaryObjective}` : objectiveText,
        objectivePills: objectiveTab === 'structured' ? [structPrimaryObjective.replace(/_/g, ' ')] : objectivePills,
        useSamplePolicyTree: policyOption === 'sample',
        customPolicyDocText: policyOption === 'custom' ? customPolicyDocText : undefined,
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
              5×5×5 Test Case Matrix Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-aurora-neutral-900 tracking-tight">
            AI Customer Communication Orchestrator
          </h1>
          <p className="text-sm text-aurora-neutral-700 mt-1 max-w-3xl leading-relaxed">
            Select any test matrix combination or configure structured fields and text pills below. The multi-agent engine dynamically adapts its persona voice, channel routing, and policy tree for all 125 scenarios.
          </p>
        </div>
      </div>

      {/* 5x5x5 TEST CASE MATRIX SELECTOR BAR */}
      <div className="bg-gradient-to-r from-aurora-primary-light/40 via-white to-purple-50 p-5 rounded-xl border border-aurora-primary/30 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-aurora-neutral-900">
              Test Case Matrix (5×5×5 Combinations)
            </h3>
          </div>
          <span className="text-[11px] font-mono font-bold text-aurora-primary bg-white px-2.5 py-0.5 rounded border border-aurora-primary/30 shadow-2xs">
            125 Dynamic Permutations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Dropdown 1: Customer Profile */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-aurora-neutral-700">
              1. Customer Profile (5 Archetypes)
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full p-2.5 bg-white border border-aurora-neutral-300 rounded-lg text-xs font-semibold text-aurora-neutral-900 focus:ring-1 focus:ring-aurora-primary shadow-2xs"
            >
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
              2. Event & Telemetry (5 Scenarios)
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => handleEventChange(e.target.value)}
              className="w-full p-2.5 bg-white border border-aurora-neutral-300 rounded-lg text-xs font-semibold text-aurora-neutral-900 focus:ring-1 focus:ring-aurora-primary shadow-2xs"
            >
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
              3. Business Objective (5 Goals)
            </label>
            <select
              value={selectedObjectiveId}
              onChange={(e) => handleObjectiveChange(e.target.value)}
              className="w-full p-2.5 bg-white border border-aurora-neutral-300 rounded-lg text-xs font-semibold text-aurora-neutral-900 focus:ring-1 focus:ring-aurora-primary shadow-2xs"
            >
              {MATRIX_OBJECTIVES.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-aurora-neutral-200/80 text-[11px] text-aurora-neutral-600">
          <span>
            Selected Combination: <strong className="text-aurora-neutral-900">{structCustomerName}</strong> (Cohort: <span className="font-mono text-aurora-primary">{structAgeGroup}</span>) • <strong className="text-aurora-neutral-900">{structEventType.replace(/_/g, ' ')}</strong> • <strong className="text-aurora-neutral-900">{structPrimaryObjective.replace(/_/g, ' ')}</strong>
          </span>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
            Live Synced Below
          </span>
        </div>
      </div>

      {/* 3-COLUMN BRIEF FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUMN 1: CUSTOMER PROFILE */}
          <div className="bg-aurora-neutral-0 rounded-xl border border-aurora-neutral-200 shadow-aurora flex flex-col justify-between overflow-hidden">
            <div>
              {/* Card Header & Tabs (Structured on LEFT as Default) */}
              <div className="p-4 bg-aurora-neutral-50/80 border-b border-aurora-neutral-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-aurora-neutral-900">1. Customer Profile</h3>
                </div>
                <div className="flex bg-aurora-neutral-200/70 p-0.5 rounded-lg text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setCustomerTab('structured')}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition ${
                      customerTab === 'structured'
                        ? 'bg-white text-aurora-neutral-900 shadow-2xs font-bold'
                        : 'text-aurora-neutral-600 hover:text-aurora-neutral-900'
                    }`}
                  >
                    <SlidersHorizontal strokeWidth={1.5} className="w-3 h-3" />
                    <span>Structured (Default)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerTab('text')}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition ${
                      customerTab === 'text'
                        ? 'bg-white text-aurora-neutral-900 shadow-2xs font-bold'
                        : 'text-aurora-neutral-600 hover:text-aurora-neutral-900'
                    }`}
                  >
                    <AlignLeft strokeWidth={1.5} className="w-3 h-3" />
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

            <div className="p-3 bg-aurora-neutral-100 border-t border-aurora-neutral-200 text-[11px] text-aurora-neutral-500">
              Evaluates generational persona (1 of 25) and 24h fatigue.
            </div>
          </div>

          {/* COLUMN 2: BUSINESS EVENT */}
          <div className="bg-aurora-neutral-0 rounded-xl border border-aurora-neutral-200 shadow-aurora flex flex-col justify-between overflow-hidden">
            <div>
              {/* Card Header & Tabs */}
              <div className="p-4 bg-aurora-neutral-50/80 border-b border-aurora-neutral-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-aurora-neutral-900">2. Business Event</h3>
                </div>
                <div className="flex bg-aurora-neutral-200/70 p-0.5 rounded-lg text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setEventTab('structured')}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition ${
                      eventTab === 'structured'
                        ? 'bg-white text-aurora-neutral-900 shadow-2xs font-bold'
                        : 'text-aurora-neutral-600 hover:text-aurora-neutral-900'
                    }`}
                  >
                    <SlidersHorizontal strokeWidth={1.5} className="w-3 h-3" />
                    <span>Structured (Default)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventTab('text')}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition ${
                      eventTab === 'text'
                        ? 'bg-white text-aurora-neutral-900 shadow-2xs font-bold'
                        : 'text-aurora-neutral-600 hover:text-aurora-neutral-900'
                    }`}
                  >
                    <AlignLeft strokeWidth={1.5} className="w-3 h-3" />
                    <span>Text & Pills</span>
                  </button>
                </div>
              </div>

              {/* Tab 1 (Default / Left): Structured Form */}
              {eventTab === 'structured' && (
                <div className="p-4 space-y-3 text-xs">
                  <div>
                    <label className="block text-aurora-neutral-700 font-medium mb-1">Event Type</label>
                    <select
                      value={structEventType}
                      onChange={(e) => setStructEventType(e.target.value)}
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
                      <label className="block text-aurora-neutral-700 font-medium mb-1">Transaction Ref</label>
                      <input
                        type="text"
                        value={structTransactionId}
                        onChange={(e) => setStructTransactionId(e.target.value)}
                        placeholder="e.g. PAY_99482"
                        className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 font-mono focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-aurora-neutral-700 font-medium mb-1">Order / App ID</label>
                      <input
                        type="text"
                        value={structOrderId}
                        onChange={(e) => setStructOrderId(e.target.value)}
                        placeholder="e.g. ORD-7721"
                        className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 font-mono focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-aurora-neutral-700 font-medium mb-1">Amount</label>
                      <input
                        type="text"
                        value={structAmount}
                        onChange={(e) => setStructAmount(e.target.value)}
                        placeholder="e.g. $49.50"
                        className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-aurora-neutral-700 font-medium mb-1">Resolution Status</label>
                      <select
                        value={structResolutionStatus}
                        onChange={(e) => setStructResolutionStatus(e.target.value)}
                        className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                      >
                        <option value="Refund Initiated">Refund Initiated</option>
                        <option value="Requires Customer Action">Requires Customer Action</option>
                        <option value="Pending Approval">Pending Approval (POL-FIN-001)</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-aurora-neutral-700 font-medium mb-1">Verified System Facts</label>
                    <input
                      type="text"
                      value={structVerifiedFacts}
                      onChange={(e) => setStructVerifiedFacts(e.target.value)}
                      placeholder="e.g. Payment ID: PAY_99482, Refund to card 4012"
                      className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 text-xs focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                    />
                  </div>
                </div>
              )}

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
                      className="w-full p-3 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded-lg text-xs text-aurora-neutral-900 focus:bg-white focus:ring-1 focus:ring-aurora-primary leading-relaxed font-mono"
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

            <div className="p-3 bg-aurora-neutral-100 border-t border-aurora-neutral-200 text-[11px] text-aurora-neutral-500">
              Triggers root-cause isolation and compliance rules.
            </div>
          </div>

          {/* COLUMN 3: BUSINESS OBJECTIVE */}
          <div className="bg-aurora-neutral-0 rounded-xl border border-aurora-neutral-200 shadow-aurora flex flex-col justify-between overflow-hidden">
            <div>
              {/* Card Header & Tabs */}
              <div className="p-4 bg-aurora-neutral-50/80 border-b border-aurora-neutral-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-aurora-neutral-900">3. Business Objective</h3>
                </div>
                <div className="flex bg-aurora-neutral-200/70 p-0.5 rounded-lg text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setObjectiveTab('structured')}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition ${
                      objectiveTab === 'structured'
                        ? 'bg-white text-aurora-neutral-900 shadow-2xs font-bold'
                        : 'text-aurora-neutral-600 hover:text-aurora-neutral-900'
                    }`}
                  >
                    <SlidersHorizontal strokeWidth={1.5} className="w-3 h-3" />
                    <span>Structured (Default)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setObjectiveTab('text')}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition ${
                      objectiveTab === 'text'
                        ? 'bg-white text-aurora-neutral-900 shadow-2xs font-bold'
                        : 'text-aurora-neutral-600 hover:text-aurora-neutral-900'
                    }`}
                  >
                    <AlignLeft strokeWidth={1.5} className="w-3 h-3" />
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

            <div className="p-3 bg-aurora-neutral-100 border-t border-aurora-neutral-200 text-[11px] text-aurora-neutral-500">
              Directly drives tone, CTA density, and escalation gates.
            </div>
          </div>
        </div>

        {/* POLICY TREE GENERATOR AGENT CONFIGURATION CARD (PTGAP-2026) */}
        <div className="bg-aurora-neutral-0 rounded-xl border border-aurora-neutral-200 shadow-aurora overflow-hidden">
          <div className="p-4 bg-aurora-neutral-50/80 border-b border-aurora-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-aurora-neutral-900">
                Policy Tree Generator Agent (Agent 3 - PTGAP-2026)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-aurora-neutral-500 bg-white px-2 py-0.5 rounded border border-aurora-neutral-200">
              Only created if selected or document shared
            </span>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label
                onClick={() => setPolicyOption('none')}
                className={`p-3.5 rounded-lg border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  policyOption === 'none'
                    ? 'bg-aurora-primary-light/40 border-aurora-primary ring-1 ring-aurora-primary'
                    : 'bg-white border-aurora-neutral-200 hover:border-aurora-neutral-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-bold text-aurora-neutral-900">1. Skip Policy Tree (Empty)</span>
                  <input
                    type="radio"
                    name="policyOption"
                    checked={policyOption === 'none'}
                    onChange={() => setPolicyOption('none')}
                    className="text-aurora-primary mt-0.5"
                  />
                </div>
                <p className="text-[11px] text-aurora-neutral-600 leading-snug">
                  Policy tree remains empty; step is safely bypassed. Critic agent enforces statutory safety rules.
                </p>
              </label>

              <label
                onClick={() => setPolicyOption('sample')}
                className={`p-3.5 rounded-lg border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  policyOption === 'sample'
                    ? 'bg-aurora-primary-light/40 border-aurora-primary ring-1 ring-aurora-primary'
                    : 'bg-white border-aurora-neutral-200 hover:border-aurora-neutral-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-bold text-aurora-neutral-900">2. Load Sample Policy Tree</span>
                  <input
                    type="radio"
                    name="policyOption"
                    checked={policyOption === 'sample'}
                    onChange={() => setPolicyOption('sample')}
                    className="text-aurora-primary mt-0.5"
                  />
                </div>
                <p className="text-[11px] text-aurora-neutral-600 leading-snug">
                  Generates the standard 4-category Enterprise Baseline DAG (Transactional, Privacy, Frequency, Financial).
                </p>
              </label>

              <label
                onClick={() => setPolicyOption('custom')}
                className={`p-3.5 rounded-lg border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  policyOption === 'custom'
                    ? 'bg-aurora-primary-light/40 border-aurora-primary ring-1 ring-aurora-primary'
                    : 'bg-white border-aurora-neutral-200 hover:border-aurora-neutral-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-bold text-aurora-neutral-900">3. Upload / Paste Custom Doc</span>
                  <input
                    type="radio"
                    name="policyOption"
                    checked={policyOption === 'custom'}
                    onChange={() => setPolicyOption('custom')}
                    className="text-aurora-primary mt-0.5"
                  />
                </div>
                <p className="text-[11px] text-aurora-neutral-600 leading-snug">
                  Parses custom uploaded text or compliance guidelines dynamically into a hierarchical decision tree.
                </p>
              </label>
            </div>

            {policyOption === 'custom' && (
              <div className="space-y-2 pt-2 border-t border-aurora-neutral-200">
                <label className="block text-xs font-bold text-aurora-neutral-800">
                  Paste Custom Compliance Document or Rule Text:
                </label>
                <textarea
                  rows={4}
                  value={customPolicyDocText}
                  onChange={(e) => setCustomPolicyDocText(e.target.value)}
                  placeholder="Paste policy document text here (e.g. Section 2.1: Automated refund within 3 days. Section 5.2: Goodwill compensation requires supervisor approval under POL-FIN-001)..."
                  className="w-full p-3 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded-lg text-xs text-aurora-neutral-900 focus:bg-white focus:ring-1 focus:ring-aurora-primary leading-relaxed font-mono"
                />
              </div>
            )}
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
                <span>Agents Orchestrating Live ({structCustomerName})...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>Analyse & Create Governed Communication</span>
                <ArrowRight strokeWidth={1.75} className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

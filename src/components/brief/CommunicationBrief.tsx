import React, { useState } from 'react';
import { StreamlinedBriefPayload, CustomerProfile, BusinessEvent, BusinessObjective } from '@/core/types';
import { PRESET_SCENARIOS, PresetScenario } from '@/core/presets';
import { User, AlertCircle, Target, ArrowRight, Sparkles, Plus, Check, SlidersHorizontal, AlignLeft, ShieldCheck } from 'lucide-react';

interface CommunicationBriefProps {
  onRunOrchestration: (payload: any) => void;
  isLoading?: boolean;
}

export const CommunicationBrief: React.FC<CommunicationBriefProps> = ({
  onRunOrchestration,
  isLoading,
}) => {
  // Column 1 Tab State
  const [customerTab, setCustomerTab] = useState<'text' | 'structured'>('text');
  const [customerText, setCustomerText] = useState(
    "Customer: Rahul Sharma, 24 years old. High-value account with 18 months tenure. Customer is currently flagged with anxious sentiment and has contacted support twice regarding payment inquiries."
  );
  const [customerPills, setCustomerPills] = useState<string[]>([
    "18–24",
    "Premium",
    "Digital-first",
    "High LTV",
  ]);
  const [customCustomerPillInput, setCustomCustomerPillInput] = useState("");
  const [isAddingCustomerPill, setIsAddingCustomerPill] = useState(false);

  // Column 1 Structured Fields State
  const [structCustomerName, setStructCustomerName] = useState("Rahul Sharma");
  const [structAgeGroup, setStructAgeGroup] = useState<any>("18–24");
  const [structSegment, setStructSegment] = useState<any>("Premium");
  const [structDigitalProfile, setStructDigitalProfile] = useState<any>("Digital-first");
  const [structConsentTx, setStructConsentTx] = useState(true);
  const [structConsentPromo, setStructConsentPromo] = useState(true);
  const [structSentiment, setStructSentiment] = useState<any>("Anxious");
  const [structSupportContacts, setStructSupportContacts] = useState(2);

  // Column 2 Tab State
  const [eventTab, setEventTab] = useState<'text' | 'structured'>('text');
  const [eventText, setEventText] = useState(
    "Payment of $49.50 (Payment ID: PAY_99482) succeeded, but the order creation for #ORD-7721 failed due to an inventory provisioning timeout. An automated refund has been initiated to the original card ending in 4012 (Ref: REF_882103)."
  );
  const [eventPills, setEventPills] = useState<string[]>([
    "Payment Ok / Order Failed",
  ]);
  const [customEventPillInput, setCustomEventPillInput] = useState("");
  const [isAddingEventPill, setIsAddingEventPill] = useState(false);

  // Column 2 Structured Fields State
  const [structEventType, setStructEventType] = useState<any>("payment_successful_order_failed");
  const [structEventTitle, setStructEventTitle] = useState("Payment captured but order creation failed");
  const [structTransactionId, setStructTransactionId] = useState("PAY_99482");
  const [structOrderId, setStructOrderId] = useState("ORD-7721");
  const [structAmount, setStructAmount] = useState("$49.50");
  const [structVerifiedFacts, setStructVerifiedFacts] = useState("Payment ID: PAY_99482 ($49.50), Order #ORD-7721 failed inventory allocation, Auto-refund initiated to card ending 4012");
  const [structResolutionStatus, setStructResolutionStatus] = useState<any>("Refund Initiated");

  // Column 3 Tab State
  const [objectiveTab, setObjectiveTab] = useState<'text' | 'structured'>('text');
  const [objectiveText, setObjectiveText] = useState(
    "Resolve the issue proactively, confirm the automated refund, reassure the customer that their funds are completely safe, and minimise incoming support contacts."
  );
  const [objectivePills, setObjectivePills] = useState<string[]>([
    "Resolve Issue Proactively",
    "Minimise Support Contacts",
    "Reassure Customer",
  ]);
  const [customObjectivePillInput, setCustomObjectivePillInput] = useState("");
  const [isAddingObjectivePill, setIsAddingObjectivePill] = useState(false);

  // Column 3 Structured Fields State
  const [structPrimaryObjective, setStructPrimaryObjective] = useState<any>("resolve_issue");
  const [structSecondaryObjective, setStructSecondaryObjective] = useState("Minimise support contacts and reassure customer");

  // Filter Pill Library
  const availableCustomerPills = [
    "18–24", "25–34", "35–44", "45–54", "55+",
    "Standard", "Premium", "High Value", "VIP",
    "Digital-first", "Mixed", "Assisted-service",
    "New Customer", "Long-term", "High LTV",
  ];

  const availableEventPills = [
    "Payment Ok / Order Failed",
    "Payment Failed",
    "Incomplete Application / Pending KYC",
    "Shipment Delayed",
    "Service Disruption / Maintenance",
    "Billing Dispute / Escalation",
  ];

  const availableObjectivePills = [
    "Resolve Issue Proactively",
    "Minimise Support Contacts",
    "Reassure Customer",
    "Retain High-Value Customer",
    "Complete Onboarding",
    "Recover Revenue",
  ];

  // Helper: Toggle pill selection
  const togglePill = (pill: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(pill)) {
      setList(list.filter((p) => p !== pill));
    } else {
      setList([...list, pill]);
    }
  };

  // Helper: Word count
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  // Preset loader
  const handleLoadPreset = (scenario: PresetScenario) => {
    // Sync Text & Pills
    if (scenario.id === "hero-rahul") {
      setCustomerText(`Customer: ${scenario.customer.name}, ${scenario.customer.age} years old. ${scenario.customer.segment} tier account with ${scenario.customer.tenureMonths} months tenure. Customer has contacted support ${scenario.customer.previousSupportContacts} times previously with ${scenario.customer.sentiment} sentiment.`);
      setCustomerPills(["18–24", "Premium", "Digital-first", "High LTV"]);
      setEventText(scenario.event.description + " Verified facts: " + scenario.event.verifiedFacts.join(", "));
      setEventPills(["Payment Ok / Order Failed"]);
      setObjectiveText(scenario.objective.customNote || "Resolve issue proactively and reassure customer.");
      setObjectivePills(["Resolve Issue Proactively", "Minimise Support Contacts", "Reassure Customer"]);

      // Sync Structured
      setStructCustomerName(scenario.customer.name);
      setStructAgeGroup(scenario.customer.ageGroup);
      setStructSegment(scenario.customer.segment);
      setStructDigitalProfile(scenario.customer.digitalProfile);
      setStructSentiment(scenario.customer.sentiment);
      setStructSupportContacts(scenario.customer.previousSupportContacts);
      setStructEventType(scenario.event.eventType);
      setStructEventTitle(scenario.event.title);
      setStructTransactionId(scenario.event.transactionId || "PAY_99482");
      setStructOrderId(scenario.event.orderId || "ORD-7721");
      setStructAmount(scenario.event.amount || "$49.50");
      setStructVerifiedFacts(scenario.event.verifiedFacts.join(", "));
      setStructResolutionStatus(scenario.event.resolutionStatus);
      setStructPrimaryObjective(scenario.objective.primary);
      setStructSecondaryObjective(scenario.objective.secondary || "");
    } else if (scenario.id === "contrasting-meera") {
      setCustomerText(`Customer: ${scenario.customer.name}, ${scenario.customer.age} years old. Standard account with ${scenario.customer.tenureMonths} months tenure. Prefers structured assisted communication.`);
      setCustomerPills(["55+", "Standard", "Assisted-service", "Long-term"]);
      setEventText(scenario.event.description + " Verified facts: " + scenario.event.verifiedFacts.join(", "));
      setEventPills(["Incomplete Application / Pending KYC"]);
      setObjectiveText("Provide clear, step-by-step guidance without technical jargon to complete application.");
      setObjectivePills(["Complete Onboarding", "Reassure Customer"]);

      setStructCustomerName(scenario.customer.name);
      setStructAgeGroup(scenario.customer.ageGroup);
      setStructSegment(scenario.customer.segment);
      setStructDigitalProfile(scenario.customer.digitalProfile);
      setStructSentiment(scenario.customer.sentiment);
      setStructSupportContacts(scenario.customer.previousSupportContacts);
      setStructEventType(scenario.event.eventType);
      setStructEventTitle(scenario.event.title);
      setStructOrderId(scenario.event.orderId || "APP-9921");
      setStructVerifiedFacts(scenario.event.verifiedFacts.join(", "));
      setStructResolutionStatus(scenario.event.resolutionStatus);
      setStructPrimaryObjective(scenario.objective.primary);
    } else if (scenario.id === "fatigue-suppression") {
      setCustomerText(`Customer: ${scenario.customer.name}, ${scenario.customer.age} years old. Standard account. Customer has already received 3 transactional messages and 1 promotional message today.`);
      setCustomerPills(["25–34", "Standard", "Digital-first"]);
      setEventText(scenario.event.description + " (Fatigue threshold test scenario)");
      setEventPills(["Service Disruption / Maintenance"]);
      setObjectiveText("Inform customer of routine update while respecting communication frequency limits.");
      setObjectivePills(["Resolve Issue Proactively"]);

      setStructCustomerName(scenario.customer.name);
      setStructAgeGroup(scenario.customer.ageGroup);
      setStructSegment(scenario.customer.segment);
      setStructDigitalProfile(scenario.customer.digitalProfile);
      setStructEventType(scenario.event.eventType);
      setStructEventTitle(scenario.event.title);
      setStructResolutionStatus(scenario.event.resolutionStatus);
      setStructPrimaryObjective(scenario.objective.primary);
    } else if (scenario.id === "escalation-david") {
      setCustomerText(`Customer: ${scenario.customer.name}, ${scenario.customer.age} years old. VIP High-Value enterprise account. Customer is frustrated and has 4 prior support tickets.`);
      setCustomerPills(["35–44", "VIP", "High Value", "Long-term"]);
      setEventText(scenario.event.description + " Customer requests $150 credit voucher in addition to delivery waiver.");
      setEventPills(["Billing Dispute / Escalation"]);
      setObjectiveText("Retain high-value customer and route $150 compensation request to human supervisor approval.");
      setObjectivePills(["Retain High-Value Customer", "Resolve Issue Proactively"]);

      setStructCustomerName(scenario.customer.name);
      setStructAgeGroup(scenario.customer.ageGroup);
      setStructSegment(scenario.customer.segment);
      setStructDigitalProfile(scenario.customer.digitalProfile);
      setStructSentiment(scenario.customer.sentiment);
      setStructSupportContacts(scenario.customer.previousSupportContacts);
      setStructEventType(scenario.event.eventType);
      setStructEventTitle(scenario.event.title);
      setStructAmount(scenario.event.amount || "$150.00 Credit Request");
      setStructResolutionStatus(scenario.event.resolutionStatus);
      setStructPrimaryObjective(scenario.objective.primary);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare combined payload reflecting active tabs
    const customerPayload = customerTab === 'structured'
      ? {
          id: `CUST-${Date.now()}`,
          name: structCustomerName,
          age: structAgeGroup === '18–24' ? 24 : structAgeGroup === '55+' ? 58 : 34,
          ageGroup: structAgeGroup,
          segment: structSegment,
          digitalProfile: structDigitalProfile,
          preferredLanguage: 'English' as const,
          preferredChannel: structDigitalProfile === 'Assisted' ? 'Email' as const : 'WhatsApp' as const,
          consent: { transactional: structConsentTx, promotional: structConsentPromo, voice: structDigitalProfile === 'Assisted' },
          customerValue: structSegment === 'VIP' ? 'VIP' as const : structSegment === 'High Value' ? 'High' as const : 'Standard' as const,
          tenureMonths: 18,
          recentCommunicationCount24h: { transactional: 1, promotional: 0 },
          previousSupportContacts: structSupportContacts,
          sentiment: structSentiment,
          email: 'customer@example.com',
          phone: '+91 98765 43210',
        }
      : undefined;

    const eventPayload = eventTab === 'structured'
      ? {
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
        }
      : undefined;

    const objectivePayload = objectiveTab === 'structured'
      ? {
          primary: structPrimaryObjective,
          secondary: structSecondaryObjective,
          customNote: objectiveText,
        }
      : undefined;

    if (customerTab === 'structured' && eventTab === 'structured' && objectiveTab === 'structured') {
      onRunOrchestration({
        customer: customerPayload,
        event: eventPayload,
        objective: objectivePayload,
      });
    } else {
      // Build streamlined payload with structured fallbacks
      onRunOrchestration({
        customerProfileText: customerTab === 'structured' ? `Customer: ${structCustomerName}, Age: ${structAgeGroup}, Segment: ${structSegment}, Digital: ${structDigitalProfile}, Sentiment: ${structSentiment}` : customerText,
        customerPills: customerTab === 'structured' ? [structAgeGroup, structSegment, structDigitalProfile] : customerPills,
        eventHistoryText: eventTab === 'structured' ? `${structEventTitle}. Verified: ${structVerifiedFacts}` : eventText,
        eventPills: eventTab === 'structured' ? [structEventType.replace(/_/g, ' ')] : eventPills,
        objectiveText: objectiveTab === 'structured' ? `${structPrimaryObjective.replace(/_/g, ' ')}. ${structSecondaryObjective}` : objectiveText,
        objectivePills: objectiveTab === 'structured' ? [structPrimaryObjective.replace(/_/g, ' ')] : objectivePills,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Eyebrow */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-aurora-neutral-200 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-aurora-primary bg-aurora-primary-light px-2.5 py-1 rounded">
            Communication Brief
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-aurora-neutral-900 mt-2 tracking-tight">
            AI Customer Communication Orchestrator
          </h1>
          <p className="text-sm text-aurora-neutral-700 mt-1 max-w-3xl leading-relaxed">
            Configure each section using either <strong>Text & Filter Pills</strong> or <strong>Structured Dropdowns</strong>. The connected LLM multi-agent backend adapts its strategy, channel, tone, and policy path dynamically based on your inputs.
          </p>
        </div>
      </div>

      {/* Quick 1-Click Preset Bar */}
      <div className="bg-aurora-neutral-0 rounded-lg p-3.5 border border-aurora-neutral-200 shadow-aurora flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-aurora-neutral-900">
          <Sparkles strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
          <span>Quick Enterprise Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleLoadPreset(preset)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-aurora-neutral-100 hover:bg-aurora-primary hover:text-white border border-aurora-neutral-300 transition text-aurora-neutral-900 shadow-sm"
            >
              {preset.name.split(":")[1] || preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3-Column Form with Sub-Tabs */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMN 1: Customer Profile */}
          <div className="bg-aurora-neutral-0 rounded-lg border border-aurora-neutral-200 shadow-aurora flex flex-col justify-between overflow-hidden">
            <div>
              {/* Column Header & Mode Tabs */}
              <div className="p-4 border-b border-aurora-neutral-200 bg-aurora-neutral-100/50">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center space-x-2">
                    <User strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                    <h2 className="text-sm font-bold text-aurora-neutral-900">1. Customer Profile</h2>
                  </div>
                </div>

                {/* Sub-Tabs */}
                <div className="flex bg-aurora-neutral-200 p-0.5 rounded-md text-xs">
                  <button
                    type="button"
                    onClick={() => setCustomerTab('text')}
                    className={`flex-1 py-1 px-2 rounded font-semibold transition flex items-center justify-center space-x-1 ${
                      customerTab === 'text'
                        ? 'bg-aurora-neutral-0 text-aurora-primary shadow-sm'
                        : 'text-aurora-neutral-700 hover:text-aurora-neutral-900'
                    }`}
                  >
                    <AlignLeft strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>Text & Pills</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerTab('structured')}
                    className={`flex-1 py-1 px-2 rounded font-semibold transition flex items-center justify-center space-x-1 ${
                      customerTab === 'structured'
                        ? 'bg-aurora-neutral-0 text-aurora-primary shadow-sm'
                        : 'text-aurora-neutral-700 hover:text-aurora-neutral-900'
                    }`}
                  >
                    <SlidersHorizontal strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>Structured Form</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Text & Pills */}
              {customerTab === 'text' && (
                <div className="p-4 space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-[11px] text-aurora-neutral-500 mb-1">
                      <span>Description / Pasted Details:</span>
                      <span className="font-mono">{getWordCount(customerText)} / 1000 words</span>
                    </div>
                    <textarea
                      rows={5}
                      value={customerText}
                      onChange={(e) => setCustomerText(e.target.value)}
                      placeholder="Type or paste customer details (e.g. name, age, tenure, sentiment, support interaction history)..."
                      className="w-full p-3 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded-md text-xs text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-2 focus:ring-aurora-primary leading-relaxed resize-none"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div>
                    <span className="text-[11px] font-semibold text-aurora-neutral-500 uppercase tracking-wider block mb-2">
                      Profile Filter Pills (Age, Segment, Habits):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {availableCustomerPills.map((pill) => {
                        const isSelected = customerPills.includes(pill);
                        return (
                          <button
                            key={pill}
                            type="button"
                            onClick={() => togglePill(pill, customerPills, setCustomerPills)}
                            className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition ${
                              isSelected
                                ? "bg-aurora-primary text-white border-aurora-primary shadow-sm font-semibold"
                                : "bg-aurora-neutral-100 text-aurora-neutral-700 border-aurora-neutral-300 hover:bg-aurora-neutral-200"
                            }`}
                          >
                            {pill}
                          </button>
                        );
                      })}

                      {/* Custom user pills */}
                      {customerPills
                        .filter((p) => !availableCustomerPills.includes(p))
                        .map((customPill) => (
                          <button
                            key={customPill}
                            type="button"
                            onClick={() => togglePill(customPill, customerPills, setCustomerPills)}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-aurora-primary text-white border-aurora-primary shadow-sm"
                          >
                            {customPill} ✕
                          </button>
                        ))}

                      {/* Add Custom Filter Pill Button */}
                      {isAddingCustomerPill ? (
                        <div className="inline-flex items-center space-x-1">
                          <input
                            type="text"
                            value={customCustomerPillInput}
                            onChange={(e) => setCustomCustomerPillInput(e.target.value)}
                            placeholder="Filter name..."
                            className="p-1 text-[11px] border border-aurora-neutral-300 rounded-md bg-white w-24 focus:ring-1 focus:ring-aurora-primary"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customCustomerPillInput.trim()) {
                                setCustomerPills([...customerPills, customCustomerPillInput.trim()]);
                                setCustomCustomerPillInput("");
                                setIsAddingCustomerPill(false);
                              }
                            }}
                            className="p-1 bg-aurora-primary text-white rounded text-[10px] font-bold"
                          >
                            <Check strokeWidth={1.5} className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsAddingCustomerPill(true)}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-dashed border-aurora-neutral-300 text-aurora-primary hover:bg-aurora-primary-light transition flex items-center space-x-1"
                        >
                          <Plus strokeWidth={1.5} className="w-3 h-3" />
                          <span>Custom Filter</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Structured Dropdowns */}
              {customerTab === 'structured' && (
                <div className="p-4 space-y-3 text-xs">
                  <div>
                    <label className="block text-aurora-neutral-700 font-medium mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={structCustomerName}
                      onChange={(e) => setStructCustomerName(e.target.value)}
                      className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 font-medium focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
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
                        <option value="18–24">18–24</option>
                        <option value="25–34">25–34</option>
                        <option value="35–44">35–44</option>
                        <option value="45–54">45–54</option>
                        <option value="55+">55+</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-aurora-neutral-700 font-medium mb-1">Segment</label>
                      <select
                        value={structSegment}
                        onChange={(e) => setStructSegment(e.target.value)}
                        className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                      >
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                        <option value="High Value">High Value</option>
                        <option value="VIP">VIP</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-aurora-neutral-700 font-medium mb-1">Digital Profile</label>
                      <select
                        value={structDigitalProfile}
                        onChange={(e) => setStructDigitalProfile(e.target.value)}
                        className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                      >
                        <option value="Digital-first">Digital-first</option>
                        <option value="Mixed">Mixed</option>
                        <option value="Assisted">Assisted</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-aurora-neutral-700 font-medium mb-1">Sentiment</label>
                      <select
                        value={structSentiment}
                        onChange={(e) => setStructSentiment(e.target.value)}
                        className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                      >
                        <option value="Anxious">Anxious</option>
                        <option value="Neutral">Neutral</option>
                        <option value="Frustrated">Frustrated</option>
                        <option value="Satisfied">Satisfied</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-aurora-neutral-700 font-medium mb-1">Prior Support Contacts</label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={structSupportContacts}
                      onChange={(e) => setStructSupportContacts(parseInt(e.target.value) || 0)}
                      className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-aurora-neutral-100 border-t border-aurora-neutral-200 text-[11px] text-aurora-neutral-500">
              Channel is decided autonomously by AI agents.
            </div>
          </div>

          {/* COLUMN 2: Customer Event & History */}
          <div className="bg-aurora-neutral-0 rounded-lg border border-aurora-neutral-200 shadow-aurora flex flex-col justify-between overflow-hidden">
            <div>
              {/* Column Header & Mode Tabs */}
              <div className="p-4 border-b border-aurora-neutral-200 bg-aurora-neutral-100/50">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center space-x-2">
                    <AlertCircle strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                    <h2 className="text-sm font-bold text-aurora-neutral-900">2. Event & History</h2>
                  </div>
                </div>

                {/* Sub-Tabs */}
                <div className="flex bg-aurora-neutral-200 p-0.5 rounded-md text-xs">
                  <button
                    type="button"
                    onClick={() => setEventTab('text')}
                    className={`flex-1 py-1 px-2 rounded font-semibold transition flex items-center justify-center space-x-1 ${
                      eventTab === 'text'
                        ? 'bg-aurora-neutral-0 text-aurora-primary shadow-sm'
                        : 'text-aurora-neutral-700 hover:text-aurora-neutral-900'
                    }`}
                  >
                    <AlignLeft strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>Text & Pills</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventTab('structured')}
                    className={`flex-1 py-1 px-2 rounded font-semibold transition flex items-center justify-center space-x-1 ${
                      eventTab === 'structured'
                        ? 'bg-aurora-neutral-0 text-aurora-primary shadow-sm'
                        : 'text-aurora-neutral-700 hover:text-aurora-neutral-900'
                    }`}
                  >
                    <SlidersHorizontal strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>Structured Form</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Text & Pills */}
              {eventTab === 'text' && (
                <div className="p-4 space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-[11px] text-aurora-neutral-500 mb-1">
                      <span>Description / Pasted Situation:</span>
                      <span className="font-mono">{getWordCount(eventText)} / 1000 words</span>
                    </div>
                    <textarea
                      rows={5}
                      value={eventText}
                      onChange={(e) => setEventText(e.target.value)}
                      placeholder="Type or paste what happened (e.g. payment details, order ID, failure reason, support interaction history)..."
                      className="w-full p-3 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded-md text-xs text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-2 focus:ring-aurora-primary leading-relaxed resize-none"
                    />
                  </div>

                  {/* Event Filter Pills */}
                  <div>
                    <span className="text-[11px] font-semibold text-aurora-neutral-500 uppercase tracking-wider block mb-2">
                      Event Category Filter Pills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {availableEventPills.map((pill) => {
                        const isSelected = eventPills.includes(pill);
                        return (
                          <button
                            key={pill}
                            type="button"
                            onClick={() => togglePill(pill, eventPills, setEventPills)}
                            className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition ${
                              isSelected
                                ? "bg-aurora-primary text-white border-aurora-primary shadow-sm font-semibold"
                                : "bg-aurora-neutral-100 text-aurora-neutral-700 border-aurora-neutral-300 hover:bg-aurora-neutral-200"
                            }`}
                          >
                            {pill}
                          </button>
                        );
                      })}

                      {/* Custom event pills */}
                      {eventPills
                        .filter((p) => !availableEventPills.includes(p))
                        .map((customPill) => (
                          <button
                            key={customPill}
                            type="button"
                            onClick={() => togglePill(customPill, eventPills, setEventPills)}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-aurora-primary text-white border-aurora-primary shadow-sm"
                          >
                            {customPill} ✕
                          </button>
                        ))}

                      {/* Add Custom Event Pill Button */}
                      {isAddingEventPill ? (
                        <div className="inline-flex items-center space-x-1">
                          <input
                            type="text"
                            value={customEventPillInput}
                            onChange={(e) => setCustomEventPillInput(e.target.value)}
                            placeholder="Event name..."
                            className="p-1 text-[11px] border border-aurora-neutral-300 rounded-md bg-white w-24 focus:ring-1 focus:ring-aurora-primary"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customEventPillInput.trim()) {
                                setEventPills([...eventPills, customEventPillInput.trim()]);
                                setCustomEventPillInput("");
                                setIsAddingEventPill(false);
                              }
                            }}
                            className="p-1 bg-aurora-primary text-white rounded text-[10px] font-bold"
                          >
                            <Check strokeWidth={1.5} className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsAddingEventPill(true)}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-dashed border-aurora-neutral-300 text-aurora-primary hover:bg-aurora-primary-light transition flex items-center space-x-1"
                        >
                          <Plus strokeWidth={1.5} className="w-3 h-3" />
                          <span>Custom Event</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Structured Dropdowns */}
              {eventTab === 'structured' && (
                <div className="p-4 space-y-3 text-xs">
                  <div>
                    <label className="block text-aurora-neutral-700 font-medium mb-1">Event Category</label>
                    <select
                      value={structEventType}
                      onChange={(e) => setStructEventType(e.target.value)}
                      className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 font-medium focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                    >
                      <option value="payment_successful_order_failed">Payment Successful but Order Failed</option>
                      <option value="payment_failed">Payment Failed</option>
                      <option value="application_incomplete">Application Incomplete / Pending KYC</option>
                      <option value="order_delayed">Order / Shipment Delayed</option>
                      <option value="service_disruption">Service Disruption / Maintenance</option>
                      <option value="customer_complaint">Customer Complaint / Escalation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-aurora-neutral-700 font-medium mb-1">Event Title</label>
                    <input
                      type="text"
                      value={structEventTitle}
                      onChange={(e) => setStructEventTitle(e.target.value)}
                      className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-aurora-neutral-700 font-medium mb-1">Transaction ID</label>
                      <input
                        type="text"
                        value={structTransactionId}
                        onChange={(e) => setStructTransactionId(e.target.value)}
                        className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 font-mono text-[11px] focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-aurora-neutral-700 font-medium mb-1">Amount</label>
                      <input
                        type="text"
                        value={structAmount}
                        onChange={(e) => setStructAmount(e.target.value)}
                        className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 font-mono text-[11px] focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-aurora-neutral-700 font-medium mb-1">Verified Facts</label>
                    <input
                      type="text"
                      value={structVerifiedFacts}
                      onChange={(e) => setStructVerifiedFacts(e.target.value)}
                      className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 text-[11px] focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-aurora-neutral-100 border-t border-aurora-neutral-200 text-[11px] text-aurora-neutral-500">
              Verified facts extracted dynamically by agents.
            </div>
          </div>

          {/* COLUMN 3: Business Objective */}
          <div className="bg-aurora-neutral-0 rounded-lg border border-aurora-neutral-200 shadow-aurora flex flex-col justify-between overflow-hidden">
            <div>
              {/* Column Header & Mode Tabs */}
              <div className="p-4 border-b border-aurora-neutral-200 bg-aurora-neutral-100/50">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center space-x-2">
                    <Target strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                    <h2 className="text-sm font-bold text-aurora-neutral-900">3. Business Objective</h2>
                  </div>
                </div>

                {/* Sub-Tabs */}
                <div className="flex bg-aurora-neutral-200 p-0.5 rounded-md text-xs">
                  <button
                    type="button"
                    onClick={() => setObjectiveTab('text')}
                    className={`flex-1 py-1 px-2 rounded font-semibold transition flex items-center justify-center space-x-1 ${
                      objectiveTab === 'text'
                        ? 'bg-aurora-neutral-0 text-aurora-primary shadow-sm'
                        : 'text-aurora-neutral-700 hover:text-aurora-neutral-900'
                    }`}
                  >
                    <AlignLeft strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>Text & Pills</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setObjectiveTab('structured')}
                    className={`flex-1 py-1 px-2 rounded font-semibold transition flex items-center justify-center space-x-1 ${
                      objectiveTab === 'structured'
                        ? 'bg-aurora-neutral-0 text-aurora-primary shadow-sm'
                        : 'text-aurora-neutral-700 hover:text-aurora-neutral-900'
                    }`}
                  >
                    <SlidersHorizontal strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>Structured Form</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Text & Pills */}
              {objectiveTab === 'text' && (
                <div className="p-4 space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-[11px] text-aurora-neutral-500 mb-1">
                      <span>Description / Goal Guidance:</span>
                      <span className="font-mono">{getWordCount(objectiveText)} / 1000 words</span>
                    </div>
                    <textarea
                      rows={5}
                      value={objectiveText}
                      onChange={(e) => setObjectiveText(e.target.value)}
                      placeholder="Type or paste what the business wants to accomplish (e.g. resolve issue, reassure customer, minimize tickets, retain account)..."
                      className="w-full p-3 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded-md text-xs text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-2 focus:ring-aurora-primary leading-relaxed resize-none"
                    />
                  </div>

                  {/* Objective Filter Pills */}
                  <div>
                    <span className="text-[11px] font-semibold text-aurora-neutral-500 uppercase tracking-wider block mb-2">
                      Goal & Priority Filter Pills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {availableObjectivePills.map((pill) => {
                        const isSelected = objectivePills.includes(pill);
                        return (
                          <button
                            key={pill}
                            type="button"
                            onClick={() => togglePill(pill, objectivePills, setObjectivePills)}
                            className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition ${
                              isSelected
                                ? "bg-aurora-primary text-white border-aurora-primary shadow-sm font-semibold"
                                : "bg-aurora-neutral-100 text-aurora-neutral-700 border-aurora-neutral-300 hover:bg-aurora-neutral-200"
                            }`}
                          >
                            {pill}
                          </button>
                        );
                      })}

                      {/* Custom objective pills */}
                      {objectivePills
                        .filter((p) => !availableObjectivePills.includes(p))
                        .map((customPill) => (
                          <button
                            key={customPill}
                            type="button"
                            onClick={() => togglePill(customPill, objectivePills, setObjectivePills)}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-aurora-primary text-white border-aurora-primary shadow-sm"
                          >
                            {customPill} ✕
                          </button>
                        ))}

                      {/* Add Custom Objective Pill Button */}
                      {isAddingObjectivePill ? (
                        <div className="inline-flex items-center space-x-1">
                          <input
                            type="text"
                            value={customObjectivePillInput}
                            onChange={(e) => setCustomObjectivePillInput(e.target.value)}
                            placeholder="Goal name..."
                            className="p-1 text-[11px] border border-aurora-neutral-300 rounded-md bg-white w-24 focus:ring-1 focus:ring-aurora-primary"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customObjectivePillInput.trim()) {
                                setObjectivePills([...objectivePills, customObjectivePillInput.trim()]);
                                setCustomObjectivePillInput("");
                                setIsAddingObjectivePill(false);
                              }
                            }}
                            className="p-1 bg-aurora-primary text-white rounded text-[10px] font-bold"
                          >
                            <Check strokeWidth={1.5} className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsAddingObjectivePill(true)}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-dashed border-aurora-neutral-300 text-aurora-primary hover:bg-aurora-primary-light transition flex items-center space-x-1"
                        >
                          <Plus strokeWidth={1.5} className="w-3 h-3" />
                          <span>Custom Objective</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Structured Dropdowns */}
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
                      <option value="reduce_support_contacts">Minimise incoming support contacts</option>
                      <option value="reassure_customer">Reassure customer / Calm anxiety</option>
                      <option value="retain_customer">Retain high-value customer</option>
                      <option value="complete_application">Complete onboarding / application</option>
                      <option value="recover_payment">Recover failed payment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-aurora-neutral-700 font-medium mb-1">Secondary Guidance Note</label>
                    <textarea
                      rows={4}
                      value={structSecondaryObjective}
                      onChange={(e) => setStructSecondaryObjective(e.target.value)}
                      placeholder="Specific priorities or constraints..."
                      className="w-full p-2 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-1 focus:ring-aurora-primary leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-aurora-neutral-100 border-t border-aurora-neutral-200 text-[11px] text-aurora-neutral-500">
              Directly drives tone, CTA density, and escalation gates.
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 bg-aurora-primary hover:bg-aurora-primary-hover text-white rounded-lg text-sm font-bold shadow-aurora-md flex items-center justify-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Agents Orchestrating Live...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>Analyse & Create Communication</span>
                <ArrowRight strokeWidth={1.75} className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

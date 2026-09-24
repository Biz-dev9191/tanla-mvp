import React, { useState } from 'react';
import { StreamlinedBriefPayload } from '@/core/types';
import { PRESET_SCENARIOS, PresetScenario } from '@/core/presets';
import { User, AlertCircle, Target, ArrowRight, Sparkles, Plus, Check } from 'lucide-react';

interface CommunicationBriefProps {
  onRunOrchestration: (payload: StreamlinedBriefPayload) => void;
  isLoading?: boolean;
}

export const CommunicationBrief: React.FC<CommunicationBriefProps> = ({
  onRunOrchestration,
  isLoading,
}) => {
  // Column 1 State: Customer Profile
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

  // Column 2 State: Customer Event & History
  const [eventText, setEventText] = useState(
    "Payment of $49.50 (Payment ID: PAY_99482) succeeded, but the order creation for #ORD-7721 failed due to an inventory provisioning timeout. An automated refund has been initiated to the original card ending in 4012 (Ref: REF_882103)."
  );
  const [eventPills, setEventPills] = useState<string[]>([
    "Payment Ok / Order Failed",
  ]);
  const [customEventPillInput, setCustomEventPillInput] = useState("");
  const [isAddingEventPill, setIsAddingEventPill] = useState(false);

  // Column 3 State: Business Objective
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

  // Filter Pill Library
  const availableCustomerPills = [
    // Age Groups
    "18–24", "25–34", "35–44", "45–54", "55+",
    // Segments
    "Standard", "Premium", "High Value", "VIP",
    // Digital Profile
    "Digital-first", "Mixed", "Assisted-service",
    // Tenure / LTV
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
    if (scenario.id === "hero-rahul") {
      setCustomerText(`Customer: ${scenario.customer.name}, ${scenario.customer.age} years old. ${scenario.customer.segment} tier account with ${scenario.customer.tenureMonths} months tenure. Customer has contacted support ${scenario.customer.previousSupportContacts} times previously with ${scenario.customer.sentiment} sentiment.`);
      setCustomerPills(["18–24", "Premium", "Digital-first", "High LTV"]);
      setEventText(scenario.event.description + " Verified facts: " + scenario.event.verifiedFacts.join(", "));
      setEventPills(["Payment Ok / Order Failed"]);
      setObjectiveText(scenario.objective.customNote || "Resolve issue proactively and reassure customer.");
      setObjectivePills(["Resolve Issue Proactively", "Minimise Support Contacts", "Reassure Customer"]);
    } else if (scenario.id === "contrasting-meera") {
      setCustomerText(`Customer: ${scenario.customer.name}, ${scenario.customer.age} years old. Standard account with ${scenario.customer.tenureMonths} months tenure. Prefers structured assisted communication.`);
      setCustomerPills(["55+", "Standard", "Assisted-service", "Long-term"]);
      setEventText(scenario.event.description + " Verified facts: " + scenario.event.verifiedFacts.join(", "));
      setEventPills(["Incomplete Application / Pending KYC"]);
      setObjectiveText("Provide clear, step-by-step guidance without technical jargon to complete application.");
      setObjectivePills(["Complete Onboarding", "Reassure Customer"]);
    } else if (scenario.id === "fatigue-suppression") {
      setCustomerText(`Customer: ${scenario.customer.name}, ${scenario.customer.age} years old. Standard account. Customer has already received 3 transactional messages and 1 promotional message today.`);
      setCustomerPills(["25–34", "Standard", "Digital-first"]);
      setEventText(scenario.event.description + " (Fatigue threshold test scenario)");
      setEventPills(["Service Disruption / Maintenance"]);
      setObjectiveText("Inform customer of routine update while respecting communication frequency limits.");
      setObjectivePills(["Resolve Issue Proactively"]);
    } else if (scenario.id === "escalation-david") {
      setCustomerText(`Customer: ${scenario.customer.name}, ${scenario.customer.age} years old. VIP High-Value enterprise account. Customer is frustrated and has 4 prior support tickets.`);
      setCustomerPills(["35–44", "VIP", "High Value", "Long-term"]);
      setEventText(scenario.event.description + " Customer requests $150 credit voucher in addition to delivery waiver.");
      setEventPills(["Billing Dispute / Escalation"]);
      setObjectiveText("Retain high-value customer and route $150 compensation request to human supervisor approval.");
      setObjectivePills(["Retain High-Value Customer", "Resolve Issue Proactively"]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRunOrchestration({
      customerProfileText: customerText,
      customerPills,
      eventHistoryText: eventText,
      eventPills,
      objectiveText,
      objectivePills,
    });
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
            Enter or paste details across the 3 columns, select or add filter pills, and let the live multi-agent backend determine the optimal communication, channel, tone, policy path, and safety guardrails.
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

      {/* Main 3-Column Streamlined Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMN 1: Customer Profile */}
          <div className="bg-aurora-neutral-0 p-5 rounded-lg border border-aurora-neutral-200 shadow-aurora flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-aurora-neutral-200 mb-3">
                <div className="flex items-center space-x-2">
                  <User strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                  <h2 className="text-sm font-bold text-aurora-neutral-900">1. Customer Profile</h2>
                </div>
                <span className="text-[11px] font-mono text-aurora-neutral-500">
                  {getWordCount(customerText)} / 1000 words
                </span>
              </div>

              {/* Text Description Box */}
              <div className="mb-4">
                <textarea
                  rows={5}
                  value={customerText}
                  onChange={(e) => setCustomerText(e.target.value)}
                  placeholder="Type or paste customer details (e.g. name, age, tenure, sentiment, support interaction history)..."
                  className="w-full p-3 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded-md text-xs text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-2 focus:ring-aurora-primary leading-relaxed resize-none"
                  required
                />
              </div>

              {/* Filter Pills Selection */}
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

            <div className="mt-4 pt-3 border-t border-aurora-neutral-200 text-[11px] text-aurora-neutral-500">
              Channel is decided autonomously by AI agents.
            </div>
          </div>

          {/* COLUMN 2: Customer Event & History */}
          <div className="bg-aurora-neutral-0 p-5 rounded-lg border border-aurora-neutral-200 shadow-aurora flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-aurora-neutral-200 mb-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                  <h2 className="text-sm font-bold text-aurora-neutral-900">2. Event & History</h2>
                </div>
                <span className="text-[11px] font-mono text-aurora-neutral-500">
                  {getWordCount(eventText)} / 1000 words
                </span>
              </div>

              {/* Text Description Box */}
              <div className="mb-4">
                <textarea
                  rows={5}
                  value={eventText}
                  onChange={(e) => setEventText(e.target.value)}
                  placeholder="Type or paste what happened (e.g. payment details, order ID, failure reason, support interaction history)..."
                  className="w-full p-3 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded-md text-xs text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-2 focus:ring-aurora-primary leading-relaxed resize-none"
                  required
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

            <div className="mt-4 pt-3 border-t border-aurora-neutral-200 text-[11px] text-aurora-neutral-500">
              Verified facts extracted dynamically by agents.
            </div>
          </div>

          {/* COLUMN 3: Business Objective */}
          <div className="bg-aurora-neutral-0 p-5 rounded-lg border border-aurora-neutral-200 shadow-aurora flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-aurora-neutral-200 mb-3">
                <div className="flex items-center space-x-2">
                  <Target strokeWidth={1.5} className="w-4 h-4 text-aurora-primary" />
                  <h2 className="text-sm font-bold text-aurora-neutral-900">3. Business Objective</h2>
                </div>
                <span className="text-[11px] font-mono text-aurora-neutral-500">
                  {getWordCount(objectiveText)} / 1000 words
                </span>
              </div>

              {/* Text Description Box */}
              <div className="mb-4">
                <textarea
                  rows={5}
                  value={objectiveText}
                  onChange={(e) => setObjectiveText(e.target.value)}
                  placeholder="Type or paste what the business wants to accomplish (e.g. resolve issue, reassure customer, minimize tickets, retain account)..."
                  className="w-full p-3 bg-aurora-neutral-100 border border-aurora-neutral-300 rounded-md text-xs text-aurora-neutral-900 focus:bg-aurora-neutral-0 focus:ring-2 focus:ring-aurora-primary leading-relaxed resize-none"
                  required
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

            <div className="mt-4 pt-3 border-t border-aurora-neutral-200 text-[11px] text-aurora-neutral-500">
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

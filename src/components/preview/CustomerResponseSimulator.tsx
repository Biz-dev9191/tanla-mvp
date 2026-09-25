import React, { useState } from 'react';
import { CustomerProfile, BusinessEvent, ChannelMessage, SimulationTurn } from '@/core/types';
import {
  MessageSquareText,
  Sparkles,
  User,
  Bot,
  Loader2,
  Send,
  RotateCcw,
  Star,
  CheckCircle2,
  ClipboardPaste,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface CustomerResponseSimulatorProps {
  customer: CustomerProfile;
  event: BusinessEvent;
  message: ChannelMessage;
}

const PERSONAS = [
  {
    id: 'anxious_buyer',
    name: 'Anxious Buyer',
    label: 'Anxious First-Time Buyer',
    description: 'Worries about money loss, values explicit reference IDs and quick confirmation.',
  },
  {
    id: 'vip_exec',
    name: 'VIP Executive',
    label: 'High-Value VIP Executive',
    description: 'Expects instant automated handling, zero hold times, high-priority SLA.',
  },
  {
    id: 'frustrated_senior',
    name: 'Frustrated Senior',
    label: 'Frustrated Senior Citizen',
    description: 'Requires step-by-step clarity, zero technical jargon, patient reassurance.',
  },
  {
    id: 'tech_millennial',
    name: 'Tech Enthusiast',
    label: 'Tech-Savvy Digital-First',
    description: 'Prefers 1-click self-serve links, concise updates without fluff.',
  },
  {
    id: 'urgent_escalator',
    name: 'Urgent Escalator',
    label: 'Escalation-Prone Customer',
    description: 'Demands supervisor sign-off or compensation; watches timelines closely.',
  },
];

export const CustomerResponseSimulator: React.FC<CustomerResponseSimulatorProps> = ({
  customer,
  event,
  message,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<string>('anxious_buyer');
  const [turns, setTurns] = useState<SimulationTurn[]>([]);
  const [customerInput, setCustomerInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingAction, setLoadingAction] = useState<'customer' | 'agent' | null>(null);
  const [sentimentTrajectory, setSentimentTrajectory] = useState<string[]>(['Anxious']);
  const [overallSatisfaction, setOverallSatisfaction] = useState<number | null>(null);
  const [deflectionStatus, setDeflectionStatus] = useState<string | null>(null);
  const threadContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (threadContainerRef.current) {
      if (turns.length === 0) {
        threadContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        threadContainerRef.current.scrollTo({
          top: threadContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [turns, isLoading]);

  // Trigger customer response simulation turn
  const handleSimulateCustomerTurn = async (injectedMsg?: string) => {
    try {
      setIsLoading(true);
      setLoadingAction('customer');
      const geminiKey = typeof window !== 'undefined' ? localStorage.getItem('aurora_gemini_key') || undefined : undefined;
      const openaiKey = typeof window !== 'undefined' ? localStorage.getItem('aurora_openai_key') || undefined : undefined;

      const res = await fetch('/api/simulate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          event,
          message: message?.body || '',
          turns,
          personaId: selectedPersona,
          userInjectedMessage: injectedMsg || undefined,
          action: 'simulate_customer',
          geminiKey,
          openaiKey,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        const newCustomerTurn: SimulationTurn = {
          turnIndex: turns.length + 1,
          speaker: 'customer',
          channel: customer.preferredChannel,
          message: data.reply,
          sentiment: data.sentiment,
          sentimentScore: data.sentimentScore,
          escalationRisk: data.escalationRisk,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setTurns((prev) => [...prev, newCustomerTurn]);
        setSentimentTrajectory((prev) => [...prev, data.sentiment]);
        setOverallSatisfaction(data.satisfactionRating || 5);
        setDeflectionStatus(data.summary || 'Inbound support contact deflected.');
        setCustomerInput('');
      }
    } catch (err) {
      console.error('Customer simulation error:', err);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  // Add custom pasted or typed customer message
  const handleAddCustomCustomerMessage = async () => {
    if (!customerInput.trim()) return;
    const query = customerInput.trim();
    const newCustomerTurn: SimulationTurn = {
      turnIndex: turns.length + 1,
      speaker: 'customer',
      channel: customer.preferredChannel,
      message: query,
      sentiment: 'Neutral',
      sentimentScore: 80,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updatedTurns = [...turns, newCustomerTurn];
    setTurns(updatedTurns);
    setCustomerInput('');
  };

  // Select Quick Roleplay Scenario Pill: Posts the exact query and automatically generates agent reply
  const handleSelectQuickScenario = async (queryText: string) => {
    if (isLoading) return;
    const newCustomerTurn: SimulationTurn = {
      turnIndex: turns.length + 1,
      speaker: 'customer',
      channel: customer.preferredChannel,
      message: queryText,
      sentiment: selectedPersona === 'urgent_escalator' ? 'Frustrated' : 'Anxious',
      sentimentScore: 78,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedTurns = [...turns, newCustomerTurn];
    setTurns(updatedTurns);
    setSentimentTrajectory((prev) => [...prev, selectedPersona === 'urgent_escalator' ? 'Frustrated' : 'Anxious']);

    // Immediately trigger policy-governed agent response
    await handleGenerateAutomatedAgentReply(queryText, updatedTurns);
  };

  // Generate automated agent response for the situation / latest customer query
  const handleGenerateAutomatedAgentReply = async (specificMessage?: string, explicitTurns?: SimulationTurn[]) => {
    try {
      setIsLoading(true);
      setLoadingAction('agent');
      const geminiKey = typeof window !== 'undefined' ? localStorage.getItem('aurora_gemini_key') || undefined : undefined;
      const openaiKey = typeof window !== 'undefined' ? localStorage.getItem('aurora_openai_key') || undefined : undefined;

      const activeTurns = explicitTurns || turns;
      const lastMsg = specificMessage || (activeTurns.length > 0 ? activeTurns[activeTurns.length - 1].message : undefined);

      const res = await fetch('/api/simulate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          event,
          message: message?.body || '',
          turns: activeTurns,
          personaId: selectedPersona,
          userInjectedMessage: lastMsg,
          action: 'simulate_agent',
          geminiKey,
          openaiKey,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        const newAgentTurn: SimulationTurn = {
          turnIndex: activeTurns.length + 1,
          speaker: 'agent',
          channel: customer.preferredChannel,
          message: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setTurns([...activeTurns, newAgentTurn]);
        setSentimentTrajectory((prev) => [...prev, data.sentiment || 'Reassured']);
        setOverallSatisfaction(data.satisfactionRating || 5);
        setDeflectionStatus(data.summary || 'Inbound support contact deflected.');
      }
    } catch (err) {
      console.error('Agent reply simulation error:', err);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleResetSimulation = () => {
    setTurns([]);
    setSentimentTrajectory(['Anxious']);
    setOverallSatisfaction(null);
    setDeflectionStatus(null);
    setCustomerInput('');
  };

  const lastSpeaker = turns.length > 0 ? turns[turns.length - 1].speaker : 'agent';

  return (
    <div className="bg-aurora-neutral-0 rounded-lg p-5 border border-aurora-neutral-200 shadow-aurora space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-aurora-neutral-200 gap-2">
        <div className="flex items-center space-x-2">
          <MessageSquareText strokeWidth={1.5} className="w-5 h-5 text-aurora-primary" />
          <div>
            <h3 className="text-sm font-bold text-aurora-neutral-900">Customer Roleplay & Response Simulator</h3>
            <p className="text-[11px] text-aurora-neutral-500">Simulate how customers react to this message and generate automated follow-up responses in real time</p>
          </div>
        </div>

        {/* Persona Selector & Reset */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-aurora-neutral-500 font-medium hidden sm:inline">Persona:</span>
          <select
            value={selectedPersona}
            onChange={(e) => {
              setSelectedPersona(e.target.value);
              handleResetSimulation();
            }}
            className="text-xs bg-aurora-neutral-100 border border-aurora-neutral-300 rounded px-2.5 py-1.5 font-medium text-aurora-neutral-900 focus:outline-none focus:ring-1 focus:ring-aurora-primary"
          >
            {PERSONAS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          {turns.length > 0 && (
            <button
              type="button"
              onClick={handleResetSimulation}
              title="Reset Simulation"
              className="p-1.5 text-aurora-neutral-500 hover:text-aurora-neutral-900 rounded bg-aurora-neutral-100 border border-aurora-neutral-200 transition"
            >
              <RotateCcw strokeWidth={1.5} className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Trajectory & Metrics Badge */}
      {sentimentTrajectory.length > 1 && (
        <div className="flex flex-wrap items-center justify-between p-3 bg-aurora-neutral-100 rounded-lg border border-aurora-neutral-200 gap-2 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-aurora-neutral-700">Sentiment Trajectory:</span>
            {sentimentTrajectory.map((sent, i) => (
              <React.Fragment key={i}>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    sent === 'Delighted' || sent === 'Relieved' || sent === 'Satisfied' || sent === 'Reassured'
                      ? 'bg-aurora-success-light text-aurora-success border border-aurora-success/20'
                      : sent === 'Frustrated' || sent === 'Anxious'
                      ? 'bg-aurora-warning-light text-aurora-warning border border-aurora-warning/20'
                      : 'bg-aurora-neutral-200 text-aurora-neutral-700'
                  }`}
                >
                  {sent}
                </span>
                {i < sentimentTrajectory.length - 1 && <span className="text-aurora-neutral-400">➔</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Conversation Thread - Fixed Height Window (does not expand or contract) */}
      <div
        ref={threadContainerRef}
        className="space-y-3 bg-aurora-neutral-100/50 p-4 rounded-lg border border-aurora-neutral-200 h-[210px] overflow-y-auto scroll-smooth"
      >
        {/* Initial Orchestrated Outbound Bubble */}
        <div className="flex flex-col items-end space-y-1">
          <div className="flex items-center space-x-1.5 text-[11px] text-aurora-neutral-500 font-medium">
            <Bot strokeWidth={1.5} className="w-3.5 h-3.5 text-aurora-primary" />
            <span>Aurora Orchestrator ({customer.preferredChannel})</span>
          </div>
          <div className="bg-aurora-primary text-white p-3 rounded-2xl rounded-tr-none text-xs leading-relaxed max-w-[85%] shadow-sm whitespace-pre-wrap">
            {message?.body || 'Initial outbound communication dispatched.'}
          </div>
        </div>

        {/* Multi-Turn Thread */}
        {turns.map((turn, idx) => (
          <div
            key={idx}
            className={`flex flex-col space-y-1 ${turn.speaker === 'customer' ? 'items-start' : 'items-end'}`}
          >
            <div className="flex items-center space-x-1.5 text-[11px] text-aurora-neutral-500 font-medium">
              {turn.speaker === 'customer' ? (
                <>
                  <User strokeWidth={1.5} className="w-3.5 h-3.5 text-aurora-neutral-700" />
                  <span>
                    {customer.name} ({PERSONAS.find((p) => p.id === selectedPersona)?.name})
                  </span>
                  {turn.sentiment && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-aurora-success-light text-aurora-success">
                      {turn.sentiment} ({turn.sentimentScore || 85}%)
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Bot strokeWidth={1.5} className="w-3.5 h-3.5 text-aurora-primary" />
                  <span>Aurora Automated Agent Reply</span>
                </>
              )}
              <span className="text-[10px] text-aurora-neutral-400 font-mono">{turn.timestamp}</span>
            </div>

            <div
              className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] shadow-sm ${
                turn.speaker === 'customer'
                  ? 'bg-white text-aurora-neutral-900 border border-neutral-200 rounded-tl-none italic'
                  : 'bg-aurora-neutral-200 text-aurora-neutral-900 rounded-tr-none font-medium'
              }`}
            >
              {turn.message}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-aurora-neutral-500 italic p-2">
            <Loader2 strokeWidth={1.5} className="w-3.5 h-3.5 animate-spin text-aurora-primary" />
            <span>
              {loadingAction === 'customer'
                ? `Simulating ${customer.name}'s response...`
                : 'Generating automated agent response...'}
            </span>
          </div>
        )}
      </div>

      {/* Simulator Action Controls */}
      <div className="space-y-2.5 pt-1">
        {/* Compact Simulation Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Active Persona Badge - Left Aligned */}
          <div className="flex items-center space-x-2 bg-aurora-neutral-100 px-3 py-1.5 rounded-lg border border-aurora-neutral-200 text-xs text-aurora-neutral-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span>Active Persona: <strong className="text-aurora-neutral-900 font-semibold">{PERSONAS.find((p) => p.id === selectedPersona)?.name}</strong></span>
          </div>

          {/* Simulator Action Buttons - Right Aligned */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:justify-end">
            {/* Button 1: Autonomous Persona Simulation */}
            <button
              type="button"
              onClick={() => handleSimulateCustomerTurn()}
              disabled={isLoading}
              className="w-full sm:w-56 h-10 px-4 bg-aurora-primary hover:bg-aurora-primary-dark text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
            >
              {isLoading && loadingAction === 'customer' ? (
                <>
                  <Loader2 strokeWidth={1.5} className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                  <span className="truncate">Simulating Reaction...</span>
                </>
              ) : (
                <>
                  <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5 text-sky-200 flex-shrink-0" />
                  <span className="truncate">
                    {turns.length === 0 ? 'Simulate Customer Response' : 'Simulate Customer Follow-Up'}
                  </span>
                </>
              )}
            </button>

            {/* Button 2: Generate Automated Agent Reply (Black) */}
            <button
              type="button"
              onClick={() => handleGenerateAutomatedAgentReply()}
              disabled={isLoading || lastSpeaker !== 'customer'}
              className="w-full sm:w-56 h-10 px-4 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
            >
              {isLoading && loadingAction === 'agent' ? (
                <>
                  <Loader2 strokeWidth={1.5} className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                  <span className="truncate">Generating Reply...</span>
                </>
              ) : (
                <>
                  <Bot strokeWidth={1.5} className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0" />
                  <span className="truncate">Generate Agent Reply</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Custom Query Inbound Input Box */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={customerInput}
              onChange={(e) => setCustomerInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCustomCustomerMessage();
              }}
              placeholder="Paste or type customer response here to simulate custom roleplay situation..."
              className="flex-1 text-xs bg-white border border-aurora-neutral-300 rounded-lg px-3 py-2 text-aurora-neutral-900 focus:outline-none focus:ring-1 focus:ring-aurora-primary shadow-2xs"
            />
            <button
              type="button"
              onClick={handleAddCustomCustomerMessage}
              disabled={!customerInput.trim() || isLoading}
              className="px-3.5 py-2 bg-aurora-neutral-100 hover:bg-aurora-neutral-200 text-aurora-neutral-900 border border-aurora-neutral-300 rounded-lg text-xs font-bold flex items-center space-x-1.5 disabled:opacity-40 shadow-2xs transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 whitespace-nowrap flex-shrink-0"
            >
              <Send strokeWidth={1.5} className="w-3.5 h-3.5 text-aurora-neutral-600" />
              <span>Post Query</span>
            </button>
          </div>

          {/* Sample Canned Inbound Queries */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-0.5">
            <span className="text-aurora-neutral-500 text-[10px] font-semibold">Quick Roleplay Scenarios:</span>
            <button
              type="button"
              onClick={() => handleSelectQuickScenario('When exactly will the refund reflect in my account?')}
              className="px-2 py-0.5 bg-aurora-neutral-100 hover:bg-aurora-neutral-200 border border-aurora-neutral-300 rounded text-aurora-neutral-700 text-[10px] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-2xs"
            >
              "When will the refund reflect?"
            </button>
            <button
              type="button"
              onClick={() => handleSelectQuickScenario('Can I get a courtesy coupon voucher for the inconvenience?')}
              className="px-2 py-0.5 bg-aurora-neutral-100 hover:bg-aurora-neutral-200 border border-aurora-neutral-300 rounded text-aurora-neutral-700 text-[10px] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-2xs"
            >
              "Can I get a courtesy coupon voucher?"
            </button>
            <button
              type="button"
              onClick={() => handleSelectQuickScenario('What is the transaction reference number for this refund?')}
              className="px-2 py-0.5 bg-aurora-neutral-100 hover:bg-aurora-neutral-200 border border-aurora-neutral-300 rounded text-aurora-neutral-700 text-[10px] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-2xs"
            >
              "What is the reference number?"
            </button>
            <button
              type="button"
              onClick={() => handleSelectQuickScenario('Do I need to take any action or call customer support?')}
              className="px-2 py-0.5 bg-aurora-neutral-100 hover:bg-aurora-neutral-200 border border-aurora-neutral-300 rounded text-aurora-neutral-700 text-[10px] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-2xs"
            >
              "Do I need to call support?"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

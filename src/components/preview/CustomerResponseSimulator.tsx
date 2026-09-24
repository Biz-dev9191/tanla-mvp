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
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertTriangle
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
  const [customInput, setCustomInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sentimentTrajectory, setSentimentTrajectory] = useState<string[]>(['Anxious']);
  const [overallSatisfaction, setOverallSatisfaction] = useState<number | null>(null);
  const [deflectionStatus, setDeflectionStatus] = useState<string | null>(null);

  // Trigger customer response simulation turn
  const handleSimulateTurn = async (customMessage?: string) => {
    try {
      setIsLoading(true);
      const geminiKey = typeof window !== 'undefined' ? localStorage.getItem('aurora_gemini_key') || undefined : undefined;
      const openaiKey = typeof window !== 'undefined' ? localStorage.getItem('aurora_openai_key') || undefined : undefined;

      const res = await fetch('/api/simulate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          event,
          message: message.body,
          turns,
          personaId: selectedPersona,
          userInjectedMessage: customMessage || undefined,
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
        setCustomInput('');
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add agent follow-up reply
  const handleAddAgentReply = () => {
    if (!customInput.trim()) return;
    const newAgentTurn: SimulationTurn = {
      turnIndex: turns.length + 1,
      speaker: 'agent',
      channel: customer.preferredChannel,
      message: customInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setTurns((prev) => [...prev, newAgentTurn]);
    setCustomInput('');
  };

  const handleResetSimulation = () => {
    setTurns([]);
    setSentimentTrajectory(['Anxious']);
    setOverallSatisfaction(null);
    setDeflectionStatus(null);
    setCustomInput('');
  };

  return (
    <div className="bg-aurora-neutral-0 rounded-lg p-5 border border-aurora-neutral-200 shadow-aurora space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-aurora-neutral-200 gap-2">
        <div className="flex items-center space-x-2">
          <MessageSquareText strokeWidth={1.5} className="w-5 h-5 text-aurora-primary" />
          <div>
            <h3 className="text-sm font-bold text-aurora-neutral-900">Customer Roleplay & Multi-Turn Simulator</h3>
            <p className="text-[11px] text-aurora-neutral-500">Observe how different customer personas react to orchestrated outbound communications</p>
          </div>
        </div>

        {/* Persona Selector */}
        <div className="flex items-center space-x-2">
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
                    sent === 'Delighted' || sent === 'Relieved' || sent === 'Satisfied'
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

          <div className="flex items-center space-x-3 text-[11px]">
            {overallSatisfaction && (
              <div className="flex items-center space-x-1 text-aurora-accent font-bold">
                <Star strokeWidth={1.5} className="w-3.5 h-3.5 fill-current" />
                <span>{overallSatisfaction}/5 Satisfaction</span>
              </div>
            )}
            <div className="flex items-center space-x-1 text-aurora-success font-medium">
              <CheckCircle2 strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>Support Ticket Deflected</span>
            </div>
          </div>
        </div>
      )}

      {/* Conversation Thread */}
      <div className="space-y-3 bg-aurora-neutral-100/50 p-4 rounded-lg border border-aurora-neutral-200 min-h-[160px] max-h-[360px] overflow-y-auto">
        {/* Initial Orchestrated Outbound Bubble */}
        <div className="flex flex-col items-end space-y-1">
          <div className="flex items-center space-x-1.5 text-[11px] text-aurora-neutral-500 font-medium">
            <Bot strokeWidth={1.5} className="w-3.5 h-3.5 text-aurora-primary" />
            <span>Aurora Orchestrator ({customer.preferredChannel})</span>
          </div>
          <div className="bg-aurora-primary text-white p-3 rounded-2xl rounded-tr-none text-xs leading-relaxed max-w-[85%] shadow-sm">
            {message.body}
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
                  <span>Aurora Agent</span>
                </>
              )}
              <span className="text-[10px] text-aurora-neutral-400 font-mono">{turn.timestamp}</span>
            </div>

            <div
              className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] shadow-sm ${
                turn.speaker === 'customer'
                  ? 'bg-white text-aurora-neutral-900 border border-neutral-200 rounded-tl-none italic'
                  : 'bg-aurora-neutral-200 text-aurora-neutral-900 rounded-tr-none'
              }`}
            >
              "{turn.message}"
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-aurora-neutral-500 italic p-2">
            <Loader2 strokeWidth={1.5} className="w-3.5 h-3.5 animate-spin text-aurora-primary" />
            <span>Simulating {customer.name}'s multi-turn reaction...</span>
          </div>
        )}
      </div>

      {/* Simulator Action Controls */}
      <div className="space-y-2 pt-1">
        {turns.length === 0 ? (
          <button
            type="button"
            onClick={() => handleSimulateTurn()}
            disabled={isLoading}
            className="w-full py-2.5 bg-aurora-primary hover:bg-aurora-primary-dark text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 strokeWidth={1.5} className="w-4 h-4 animate-spin" />
                <span>Simulating Persona Reaction...</span>
              </>
            ) : (
              <>
                <Sparkles strokeWidth={1.5} className="w-4 h-4" />
                <span>Predict {customer.name}'s Reaction ({PERSONAS.find((p) => p.id === selectedPersona)?.name})</span>
              </>
            )}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddAgentReply();
                }}
                placeholder="Type a follow-up agent response or customer message..."
                className="flex-1 text-xs bg-white border border-aurora-neutral-300 rounded-lg px-3 py-2 text-aurora-neutral-900 focus:outline-none focus:ring-1 focus:ring-aurora-primary"
              />
              <button
                type="button"
                onClick={handleAddAgentReply}
                disabled={!customInput.trim()}
                className="px-3 py-2 bg-aurora-neutral-100 hover:bg-aurora-neutral-200 text-aurora-neutral-900 border border-aurora-neutral-300 rounded-lg text-xs font-semibold flex items-center space-x-1 disabled:opacity-40 transition"
              >
                <Send strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
              <button
                type="button"
                onClick={() => handleSimulateTurn()}
                disabled={isLoading}
                className="px-3 py-2 bg-aurora-primary hover:bg-aurora-primary-dark text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition disabled:opacity-50"
              >
                <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>Simulate Turn {turns.length + 1}</span>
              </button>
            </div>

            {/* Quick Canned Injections */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="text-aurora-neutral-500 self-center text-[10px] font-semibold">Sample Inbound Inquiry:</span>
              <button
                type="button"
                onClick={() => handleSimulateTurn('When exactly will the funds show up in my Citibank app?')}
                className="px-2 py-0.5 bg-aurora-neutral-100 hover:bg-aurora-neutral-200 border border-aurora-neutral-300 rounded text-aurora-neutral-700"
              >
                "When will funds show in Citibank?"
              </button>
              <button
                type="button"
                onClick={() => handleSimulateTurn('Can I also get a 10% coupon for the trouble?')}
                className="px-2 py-0.5 bg-aurora-neutral-100 hover:bg-aurora-neutral-200 border border-aurora-neutral-300 rounded text-aurora-neutral-700"
              >
                "Can I get a coupon voucher?"
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


import { BRAND_VOICE_GUIDELINES, COMPANY_POLICIES, CHANNEL_GUIDELINES } from './knowledge-base';

export interface LLMOrchestrationInput {
  customerProfileText: string;
  customerPills: string[];
  eventHistoryText: string;
  eventPills: string[];
  objectiveText: string;
  objectivePills: string[];
}

export interface LLMAgentDecision {
  customerSummary: {
    name: string;
    segment: string;
    digitalProfile: string;
    sensitivities: string[];
    fatigueRisk: 'Low' | 'Moderate' | 'High';
  };
  objectiveDecision: {
    primaryGoal: string;
    resolutionStatus: string;
    customerActionRequired: boolean;
    recommendedAction: 'None' | 'Upload Document' | 'Retry Payment' | 'Contact Support';
  };
  policyDecision: {
    appliedPath: string[];
    policyRuleCodes: string[];
    allowedActions: string[];
    prohibitedActions: string[];
    humanApprovalRequired: boolean;
    approvalReason?: string;
  };
  strategyDecision: {
    decision: 'SEND' | 'SUPPRESS' | 'ESCALATE';
    selectedChannel: 'WhatsApp' | 'Email' | 'SMS' | 'Voice';
    fallbackChannel?: 'WhatsApp' | 'Email' | 'SMS';
    tone: string;
    formality: 'Conversational' | 'Professional' | 'Reassuring' | 'Direct';
    ctaType: 'None' | 'Click Link' | 'Upload Document' | 'Contact Support' | 'Retry Payment';
    suppressionReason?: string;
  };
  messages: {
    whatsapp: { body: string; characterCount: number };
    sms: { body: string; characterCount: number };
    email: { subject: string; body: string; characterCount: number };
    voice: { script: string; characterCount: number };
  };
  guardrails: {
    status: 'PASS' | 'REVISE' | 'ESCALATE' | 'SUPPRESS';
    factualAccuracyPass: boolean;
    policyCompliancePass: boolean;
    privacyPass: boolean;
    tonePass: boolean;
    channelFitPass: boolean;
    fatiguePass: boolean;
    feedback?: string;
  };
  decisionTrace: string[];
}

export async function callLiveLLM(input: LLMOrchestrationInput): Promise<LLMAgentDecision | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const systemPrompt = `You are the Aurora Cloud AI Customer Communication Orchestrator.
You govern and orchestrate enterprise outbound communications according to the Aurora Cloud Brand & Governance Guidelines:
- Voice & Tone: Direct, Calm, Competent.
- Formatting Rules: ZERO exclamation marks in product/customer messages. Sentence case throughout. Second person ('you').
- Policy Rules: Ground all claims in verified facts. Never invent refund dates or compensation. Enforce opt-in consent and fatigue suppression.

Analyze the input, determine whether to communicate, what to communicate, through which channel, what tone, and generate 4 channel-specific messages. Return a valid JSON object matching the requested schema.`;

  const userPrompt = `
CUSTOMER PROFILE:
Description: ${input.customerProfileText || 'N/A'}
Filter Pills: ${input.customerPills.join(', ') || 'Standard'}

CUSTOMER EVENT & HISTORY:
Description: ${input.eventHistoryText || 'N/A'}
Filter Pills: ${input.eventPills.join(', ') || 'General update'}

BUSINESS OBJECTIVE:
Description: ${input.objectiveText || 'N/A'}
Filter Pills: ${input.objectivePills.join(', ') || 'Resolve issue'}

Determine the customer context, business objective, policy path, communication strategy, multi-channel messages (WhatsApp, SMS, Email, Voice), guardrail verification, and decision trace.`;

  // 1. Try Google Gemini API if key is present
  if (geminiKey) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}\n\nReturn JSON only.` }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return JSON.parse(text) as LLMAgentDecision;
        }
      }
    } catch (err) {
      console.warn('Gemini API call error, continuing to fallback:', err);
    }
  }

  // 2. Try OpenAI API if key is present
  if (openaiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          return JSON.parse(text) as LLMAgentDecision;
        }
      }
    } catch (err) {
      console.warn('OpenAI API call error, continuing to fallback:', err);
    }
  }

  // Return null if no external keys configured (orchestrator will use built-in engine)
  return null;
}

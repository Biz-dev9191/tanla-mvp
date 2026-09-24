import { ClauseCitation, ReflectionLoopIteration } from './types';

export interface LLMOrchestrationInput {
  customerProfileText: string;
  customerPills: string[];
  eventHistoryText: string;
  eventPills: string[];
  objectiveText: string;
  objectivePills: string[];
  customRulesText?: string;
}

export interface LLMAgentDecision {
  customerSummary: {
    name: string;
    segment: string;
    digitalProfile: string;
    sensitivities: string[];
    fatigueRisk: 'Low' | 'Moderate' | 'High';
    fatigueScore: number;
    chainOfThought: string[];
  };
  objectiveDecision: {
    primaryGoal: string;
    resolutionStatus: string;
    customerActionRequired: boolean;
    recommendedAction: 'None' | 'Upload Document' | 'Retry Payment' | 'Contact Support';
    actionFriction: 'Zero Friction' | 'Low (1-Click)' | 'Moderate (Doc Upload)' | 'High (Manual Intervention)';
    chainOfThought: string[];
  };
  policyDecision: {
    appliedPath: string[];
    policyRuleCodes: string[];
    clauseCitations: ClauseCitation[];
    allowedActions: string[];
    prohibitedActions: string[];
    humanApprovalRequired: boolean;
    approvalReason?: string;
    chainOfThought: string[];
  };
  strategyDecision: {
    decision: 'SEND' | 'SUPPRESS' | 'ESCALATE';
    selectedChannel: 'WhatsApp' | 'Email' | 'SMS' | 'Voice';
    fallbackChannel?: 'WhatsApp' | 'Email' | 'SMS';
    tone: string;
    formality: 'Conversational' | 'Professional' | 'Reassuring' | 'Direct';
    ctaType: 'None' | 'Click Link' | 'Upload Document' | 'Contact Support' | 'Retry Payment';
    suppressionReason?: string;
    chainOfThought: string[];
  };
  messages: {
    whatsapp: { body: string; characterCount: number };
    sms: { body: string; characterCount: number };
    email: { subject: string; body: string; characterCount: number };
    voice: { script: string; characterCount: number };
    chainOfThought: string[];
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
    violationCodes?: string[];
    chainOfThought: string[];
  };
  reflectionLoops?: ReflectionLoopIteration[];
  decisionTrace: string[];
}

export async function callLiveLLM(
  input: LLMOrchestrationInput,
  customGeminiKey?: string,
  customOpenaiKey?: string
): Promise<LLMAgentDecision | null> {
  const geminiKey = customGeminiKey?.trim() || process.env.GEMINI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const openaiKey = customOpenaiKey?.trim() || process.env.OPENAI_API_KEY;

  const systemPrompt = `You are the Aurora Cloud AI Customer Communication Orchestrator—an enterprise multi-agent engine powering governed customer communications across WhatsApp, SMS, Email, and Voice.

You execute 6 specialized collaborative AI agents in an autonomous chain-of-thought pipeline:
1. Customer Context Agent: Ingests profile, demographic, digital maturity, 24h message velocity, prior support friction, and emotional sentiment.
2. Objective & Resolution Agent: Performs root-cause analysis on verified telemetry, formulating the primary business objective, friction-minimizing pathway, and support deflection strategy.
3. Policy Agent (RAG): Traverses enterprise governance rules, retrieves clause-level citations with exact excerpts (e.g., Section 3.1: Automated Refund Notification, Section 5.2: Goodwill Credit Gate), evaluates $0 unauthorized financial promises (POL-FIN-001), opt-in consent, and PII masking.
4. Communication Strategy Agent: Synthesizes channel suitability (WhatsApp vs SMS vs Email vs Voice), tone matrix (Direct, Calm, Competent), formality, CTA friction, and dispatch verdict (SEND | SUPPRESS | ESCALATE).
5. Message Generation Agent: Crafts 4 hyper-tailored channel messages complying strictly with the Aurora Brand Voice:
   - ZERO exclamation marks (!) anywhere in customer communications.
   - Sentence case throughout, second person ('you').
   - Grounded solely in verified telemetry (never hallucinate settlement dates or unverified compensation).
6. Critic & Guardrail Agent: Executes rigorous 7-point validation. If any violation occurs (exclamation marks, unmasked cards, length limit overflows), it initiates an autonomous reflection loop to refine the draft before final sign-off.

Return a strictly valid JSON object matching the requested schema.`;

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

${input.customRulesText ? `CUSTOM POLICY DOCUMENT:\n${input.customRulesText}` : ''}

Execute the 6 specialized agents with step-by-step chain of thought, retrieve clause citations with excerpts, synthesize channel strategies, generate 4 compliant messages (NO exclamation marks), run Critic verification, and produce the final decision trace.`;

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

  // 2. Try OpenRouter API if key is present
  if (openrouterKey) {
    try {
      const model = process.env.OPENROUTER_MODEL || 'google/gemini-flash-1.5';
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openrouterKey.trim()}`,
          'HTTP-Referer': 'https://auroracloud.app',
          'X-Title': 'Aurora Cloud Orchestrator',
        },
        body: JSON.stringify({
          model,
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
      console.warn('OpenRouter API call error, continuing to fallback:', err);
    }
  }

  // 3. Try OpenAI API if key is present
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


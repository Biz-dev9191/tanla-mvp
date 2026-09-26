import { ClauseCitation, ReflectionLoopIteration } from './types';

export interface LLMOrchestrationInput {
  customerProfileText?: string;
  customerPills?: string[];
  eventHistoryText?: string;
  eventPills?: string[];
  objectiveText?: string;
  objectivePills?: string[];
  customRulesText?: string;
}

export interface LLMAgentDecision {
  customerSummary: {
    name: string;
    segment: string;
    digitalProfile: string;
    personaCohort?: string;
    personaArchetype?: string;
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
  policyTreeDecision?: {
    status: 'EXECUTED' | 'SKIPPED_BASELINE';
    nodeCount: number;
    summary: string;
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

You execute 7 specialized collaborative AI agents:
1. Customer Context & Persona Agent: Maps customer to demographic/psychographic personas across cohorts (Gen Z, Millennial, Gen X, Baby Boomer, Silent Gen), evaluates 24h message fatigue, and checks channel consent.
2. Objective & Resolution Agent: Extracts verified root causes from telemetry, defines the primary resolution target, and optimizes for zero-friction support deflection.
3. Policy Tree Generator Agent: Extracts dynamic hierarchical decision DAGs from uploaded documents if provided. If NO custom policy document is uploaded, marks status as SKIPPED.
4. Enterprise Policy & Compliance Agent: Enforces privacy and statutory laws (TRAI/GDPR/TCPA), applies PII masking (card last 4 digits only), and ensures safety compliance. Only cites policy documents if custom policy text was explicitly provided in input.
5. Communication Strategy Agent: Calibrates channel routing and tone matrix specifically for the matched Persona (e.g., Casual-competent for Gen Z, Step-by-step reassuring for Baby Boomers, High-efficiency for Millennials).
6. Multi-Channel Message Generation Agent: Drafts messages across WhatsApp, SMS, Email, and Voice.
   - MANDATORY GREETING: WhatsApp and Email messages MUST address the customer explicitly by their first name or full name on line 1 (e.g. 'Hi [FirstName],').
   - ABSOLUTE RAILGUARD: ZERO EXCLAMATION MARKS (!) anywhere in customer communications.
   - Channel Personalization Rules:
     * WhatsApp: Dynamically tailored to customer persona (generational cohort, digital profile, sentiment, segment).
     * Voice: Spoken scripts tailored to customer persona (vocabulary, pacing, and tone matching generational cohort).
     * SMS: Pre-registered DLT-compliant uniform standard template with variables across all customer cohorts (no persona drift), strictly <= 160 characters.
     * Email: Governed by event gravity: Critical events (payment failures, service outages, disputes) use formal institutional standard templates; non-critical events adapt tone to customer persona.
   - Grounded solely in verified telemetry: Never manufacture phone numbers, links, order IDs, or amounts. Direct to official app and web dashboard and direct replies.
7. Critic, Safety Guardrail & Reflection Agent: Executes 7-point validation. If violations (exclamation marks, unmasked cards, length overflows) are detected, executes autonomous reflection loops (up to 2 iterations) to refine the draft before final sign-off.

Return a strictly valid JSON object matching the requested schema.`;

  const userPrompt = `
CUSTOMER PROFILE:
Description: ${input.customerProfileText || 'N/A'}
Filter Pills: ${(input.customerPills || []).join(', ') || 'Standard'}

CUSTOMER EVENT & HISTORY:
Description: ${input.eventHistoryText || 'N/A'}
Filter Pills: ${(input.eventPills || []).join(', ') || 'General update'}

BUSINESS OBJECTIVE:
Description: ${input.objectiveText || 'N/A'}
Filter Pills: ${(input.objectivePills || []).join(', ') || 'Resolve issue'}

${input.customRulesText ? `CUSTOM POLICY DOCUMENT:\n${input.customRulesText}` : 'CUSTOM POLICY DOCUMENT: None uploaded (Skip dynamic policy tree generation and use Enterprise Baseline).'}

Execute the 7 specialized agents with step-by-step chain of thought, retrieve clause citations with excerpts, synthesize channel strategies, generate 4 compliant messages (NO exclamation marks), run Critic verification, and produce the final decision trace.`;

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
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}\n\nProvide the output in pure JSON format only with no markdown backticks around the json.` }]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          return JSON.parse(cleanText) as LLMAgentDecision;
        }
      }
    } catch (e) {
      console.warn("Gemini API call failed, attempting fallback:", e);
    }
  }

  // 2. Try OpenRouter API if available
  if (openrouterKey) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://auroracloud.tanla.com',
          'X-Title': 'Aurora Cloud Orchestrator',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          return JSON.parse(content) as LLMAgentDecision;
        }
      }
    } catch (e) {
      console.warn("OpenRouter API call failed:", e);
    }
  }

  // 3. Try OpenAI API if key is present
  if (openaiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          return JSON.parse(content) as LLMAgentDecision;
        }
      }
    } catch (e) {
      console.warn("OpenAI API call failed:", e);
    }
  }

  return null;
}

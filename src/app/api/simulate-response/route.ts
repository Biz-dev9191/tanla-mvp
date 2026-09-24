import { NextRequest, NextResponse } from 'next/server';
import { SimulationTurn } from '@/core/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer,
      event,
      message,
      turns = [],
      personaId = 'standard',
      userInjectedMessage,
      action = 'simulate_customer_turn', // 'simulate_customer_turn' | 'simulate_agent_reply'
    } = body;

    const geminiKey = body.geminiKey || req.headers.get('x-gemini-key') || process.env.GEMINI_API_KEY;
    const openaiKey = body.openaiKey || req.headers.get('x-openai-key') || process.env.OPENAI_API_KEY;

    const personaDescriptions: { [key: string]: { name: string; traits: string; initialSentiment: string } } = {
      'anxious_buyer': {
        name: 'Anxious First-Time Buyer',
        traits: 'Values immediate reassurance, worried about money loss, asks for confirmation references.',
        initialSentiment: 'Anxious',
      },
      'vip_exec': {
        name: 'High-Value VIP Executive',
        traits: 'Direct, busy, expects high-priority treatment, zero tolerance for delayed resolutions or hold times.',
        initialSentiment: 'Skeptical',
      },
      'frustrated_senior': {
        name: 'Frustrated Senior Citizen',
        traits: 'Prefers simple step-by-step instructions, dislikes technical jargon, values human warmth and clarity.',
        initialSentiment: 'Frustrated',
      },
      'tech_millennial': {
        name: 'Tech-Savvy Digital First User',
        traits: 'Concise, prefers self-service 1-click links, appreciates instant status tracking.',
        initialSentiment: 'Neutral',
      },
      'urgent_escalator': {
        name: 'Urgent Escalation-Prone User',
        traits: 'Ready to file complaints, needs immediate tangible progress, seeks compensation or supervisor confirmation.',
        initialSentiment: 'Frustrated',
      },
    };

    const currentPersona = personaDescriptions[personaId] || personaDescriptions['anxious_buyer'];
    const turnCount = (turns as SimulationTurn[]).length;

    // 1. Try Live LLM simulation if key is available
    if (geminiKey) {
      try {
        const prompt = `You are a Customer Response Simulator for enterprise customer communication testing.
Simulate the next natural message in an ongoing multi-turn customer communication roleplay.

CUSTOMER PROFILE:
- Name: ${customer?.name || 'Customer'}
- Persona: ${currentPersona.name} (${currentPersona.traits})
- Customer Segment: ${customer?.segment || 'Standard'}
- Digital Profile: ${customer?.digitalProfile || 'Digital-first'}

BUSINESS EVENT:
- Event: ${event?.title || 'Payment / Order Update'}
- Resolution: ${event?.resolutionStatus || 'Refund Initiated'}
- Verified Telemetry: ${(event?.verifiedFacts || []).join('; ') || 'PAY_99482, ORD-7721, $49.50'}

INITIAL ORCHESTRATED MESSAGE SENT TO CUSTOMER:
"${message || ''}"

PAST CONVERSATION TURNS:
${turns.map((t: SimulationTurn) => `[${t.speaker.toUpperCase()}]: ${t.message}`).join('\n') || 'None (Initial Outbound Just Received)'}

${userInjectedMessage ? `USER / CUSTOMER INPUT:\n"${userInjectedMessage}"` : ''}

TASK:
Generate the next response in character. If roleplaying as the customer, react authentically to the orchestrated message according to your persona's emotional traits. If this is turn 1 or 2, transition emotional sentiment (e.g. from Anxious to Relieved/Satisfied).

Return a strictly valid JSON object:
{
  "reply": "string (the natural simulated message)",
  "sentiment": "Relieved | Frustrated | Satisfied | Anxious | Skeptical | Neutral | Delighted | Cooperative",
  "sentimentScore": number (0 to 100),
  "escalationRisk": "Low | Moderate | High",
  "followupNeeded": boolean,
  "satisfactionRating": number (1 to 5),
  "summary": "string (brief 1-sentence assessment of customer comprehension and relief)"
}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
          if (parsed.reply) {
            return NextResponse.json({
              reply: parsed.reply,
              sentiment: parsed.sentiment || 'Satisfied',
              sentimentScore: parsed.sentimentScore || 85,
              escalationRisk: parsed.escalationRisk || 'Low',
              followupNeeded: parsed.followupNeeded ?? false,
              satisfactionRating: parsed.satisfactionRating || 5,
              summary: parsed.summary || `Customer responded positively with sentiment ${parsed.sentiment}.`,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (e) {
        console.warn('Live LLM simulation error, falling back to deterministic roleplay:', e);
      }
    }

    // 2. High-Quality Deterministic Multi-Turn Simulation Engine
    let simulatedReply = "";
    let sentiment: 'Relieved' | 'Frustrated' | 'Satisfied' | 'Anxious' | 'Skeptical' | 'Neutral' | 'Delighted' | 'Cooperative' = 'Relieved';
    let sentimentScore = 88;
    let escalationRisk: 'Low' | 'Moderate' | 'High' = 'Low';
    let followupNeeded = false;
    let satisfactionRating = 5;

    if (turnCount === 0) {
      // First reply to the outbound orchestrated message
      if (personaId === 'frustrated_senior') {
        simulatedReply = `Thank you for explaining clearly that the refund is going back to my card ending in 4012. I was worried I had to call a number and wait on hold. This was very straightforward.`;
        sentiment = 'Relieved';
        sentimentScore = 90;
        escalationRisk = 'Low';
        satisfactionRating = 5;
      } else if (personaId === 'vip_exec') {
        simulatedReply = `Appreciate the prompt automated notification and refund initiation reference (PAY_99482). Please ensure the invoice is also updated in our portal.`;
        sentiment = 'Satisfied';
        sentimentScore = 84;
        escalationRisk = 'Low';
        satisfactionRating = 4;
      } else if (personaId === 'urgent_escalator') {
        if (event.eventType === 'customer_complaint') {
          simulatedReply = `Thank you for applying the $25 fee waiver. I will wait for the supervisor to confirm the additional credit within the 4-hour window promised.`;
          sentiment = 'Cooperative';
          sentimentScore = 75;
          escalationRisk = 'Moderate';
          followupNeeded = true;
          satisfactionRating = 4;
        } else {
          simulatedReply = `Glad you caught the provisioning failure and initiated the refund automatically before I had to reach out. Thank you.`;
          sentiment = 'Relieved';
          sentimentScore = 86;
          escalationRisk = 'Low';
          satisfactionRating = 5;
        }
      } else if (personaId === 'tech_millennial') {
        simulatedReply = `Clean update. Thanks for the auto-refund ref and no-action confirmation. Saved me a support ticket.`;
        sentiment = 'Delighted';
        sentimentScore = 95;
        escalationRisk = 'Low';
        satisfactionRating = 5;
      } else {
        // Standard / Anxious Buyer
        simulatedReply = `Thank you so much for the confirmation. I was anxious when the order failed, but seeing the refund already initiated to my card (4012) puts my mind at ease!`;
        sentiment = 'Relieved';
        sentimentScore = 92;
        escalationRisk = 'Low';
        satisfactionRating = 5;
      }
    } else if (turnCount === 1) {
      // Second customer turn (e.g. asking for bank timeline or next purchase)
      simulatedReply = `One quick follow-up: will I receive an SMS notification once my bank deposits the refund back into my account?`;
      sentiment = 'Satisfied';
      sentimentScore = 90;
      escalationRisk = 'Low';
      followupNeeded = false;
      satisfactionRating = 5;
    } else {
      // Turn 2+
      simulatedReply = `Everything looks clear and complete. Thank you for the quick and seamless communication!`;
      sentiment = 'Delighted';
      sentimentScore = 98;
      escalationRisk = 'Low';
      followupNeeded = false;
      satisfactionRating = 5;
    }

    return NextResponse.json({
      reply: simulatedReply,
      sentiment,
      sentimentScore,
      escalationRisk,
      followupNeeded,
      satisfactionRating,
      summary: `Persona '${currentPersona.name}' acknowledged with '${sentiment}' sentiment. Inbound support ticket successfully deflected.`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


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
      personaId = 'anxious_buyer',
      userInjectedMessage,
      action = 'simulate_customer', // 'simulate_customer' | 'simulate_agent'
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
    const customerFirstName = (customer?.name || 'Customer').split(' ')[0];

    // 1. Try Live LLM simulation if key is available
    if (geminiKey) {
      try {
        let prompt = '';
        if (action === 'simulate_agent') {
          prompt = `You are Aurora Cloud's autonomous multi-agent customer communication assistant.
Generate an automated, empathetic, policy-compliant agent reply to the customer's message in the roleplay thread.

CRITICAL GOVERNANCE RULES:
1. Strictly ZERO exclamation marks anywhere in the output.
2. Ground all claims in the verified telemetry and business facts provided.
3. Be calm, polite, and helpful. Address the customer by their first name "${customerFirstName}".

CUSTOMER PROFILE:
- Name: ${customer?.name || 'Customer'}
- Persona: ${currentPersona.name}
- Segment: ${customer?.segment || 'Standard'}

BUSINESS EVENT:
- Event: ${event?.title || 'Payment / Order Update'}
- Status: ${event?.resolutionStatus || 'Refund Initiated'}
- Verified Telemetry: ${(event?.verifiedFacts || []).join('; ') || 'PAY_99482, ORD-7721, $49.50'}

INITIAL ORCHESTRATED MESSAGE:
"${message || ''}"

CONVERSATION THREAD:
${turns.map((t: SimulationTurn) => `[${t.speaker.toUpperCase()}]: ${t.message}`).join('\n')}

${userInjectedMessage ? `LATEST CUSTOMER INBOUND QUERY:\n"${userInjectedMessage}"` : ''}

Generate the agent's automated response in JSON:
{
  "reply": "string (the polite, accurate agent response with zero exclamation marks)",
  "sentiment": "Satisfied | Reassured | Relieved",
  "sentimentScore": 95,
  "summary": "string (agent response resolution summary)"
}`;
        } else {
          prompt = `You are a Customer Response Simulator for enterprise customer communication testing.
Simulate the next natural customer message in an ongoing multi-turn customer communication roleplay.

CUSTOMER PROFILE:
- Name: ${customer?.name || 'Customer'}
- Persona: ${currentPersona.name} (${currentPersona.traits})
- Customer Segment: ${customer?.segment || 'Standard'}

BUSINESS EVENT:
- Event: ${event?.title || 'Payment / Order Update'}
- Resolution: ${event?.resolutionStatus || 'Refund Initiated'}
- Verified Telemetry: ${(event?.verifiedFacts || []).join('; ') || 'PAY_99482, ORD-7721, $49.50'}

INITIAL ORCHESTRATED MESSAGE SENT TO CUSTOMER:
"${message || ''}"

PAST CONVERSATION TURNS:
${turns.map((t: SimulationTurn) => `[${t.speaker.toUpperCase()}]: ${t.message}`).join('\n') || 'None (Initial Outbound Just Received)'}

${userInjectedMessage ? `USER / CUSTOMER TOPIC:\n"${userInjectedMessage}"` : ''}

TASK:
Generate the next response in character. React authentically according to your persona's emotional traits with NO exclamation marks.

Return a strictly valid JSON object:
{
  "reply": "string (the natural simulated message without exclamation marks)",
  "sentiment": "Relieved | Frustrated | Satisfied | Anxious | Skeptical | Neutral | Delighted | Cooperative",
  "sentimentScore": number (0 to 100),
  "escalationRisk": "Low | Moderate | High",
  "followupNeeded": boolean,
  "satisfactionRating": number (1 to 5),
  "summary": "string (brief assessment of customer sentiment)"
}`;
        }

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
            // Enforce zero exclamation marks rule
            const cleanReply = parsed.reply.replace(/!+/g, '.');
            return NextResponse.json({
              reply: cleanReply,
              sentiment: parsed.sentiment || (action === 'simulate_agent' ? 'Reassured' : 'Satisfied'),
              sentimentScore: parsed.sentimentScore || 88,
              escalationRisk: parsed.escalationRisk || 'Low',
              followupNeeded: parsed.followupNeeded ?? false,
              satisfactionRating: parsed.satisfactionRating || 5,
              summary: parsed.summary || `Simulated ${action === 'simulate_agent' ? 'agent response' : 'customer reaction'}.`,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (e) {
        console.warn('Live LLM simulation error, falling back to deterministic roleplay:', e);
      }
    }

    // 2. Deterministic Engine (Zero Exclamation Marks)
    if (action === 'simulate_agent') {
      const lastTurn = turns.length > 0 ? turns[turns.length - 1] : null;
      const lastMsg = (userInjectedMessage || lastTurn?.message || '').toLowerCase();
      let agentReply = '';

      if (lastMsg.includes('when') || lastMsg.includes('time') || lastMsg.includes('bank') || lastMsg.includes('deposit')) {
        agentReply = `Hello ${customerFirstName}, refund deposits typically reflect within 3 to 5 business days depending on your bank's settlement cycle. You will receive an automated SMS confirmation as soon as Citibank completes the posting.`;
      } else if (lastMsg.includes('coupon') || lastMsg.includes('discount') || lastMsg.includes('compensation') || lastMsg.includes('credit')) {
        agentReply = `Hello ${customerFirstName}, we understand the inconvenience. While the primary refund of $49.50 has been processed, we have recorded your request with our senior customer care team for courtesy review.`;
      } else if (lastMsg.includes('reference') || lastMsg.includes('id') || lastMsg.includes('receipt')) {
        agentReply = `Hello ${customerFirstName}, your transaction reference number is PAY_99482 for order ORD-7721. You can track this status anytime directly in your account dashboard.`;
      } else {
        agentReply = `Hello ${customerFirstName}, thank you for checking in. All automated updates have been recorded under reference PAY_99482, and no further action is required from your end.`;
      }

      return NextResponse.json({
        reply: agentReply,
        sentiment: 'Reassured',
        sentimentScore: 92,
        escalationRisk: 'Low',
        followupNeeded: false,
        satisfactionRating: 5,
        summary: `Aurora agent provided an automated grounded response to ${customerFirstName}'s inquiry.`,
        timestamp: new Date().toISOString(),
      });
    }

    // Customer Simulation
    let simulatedReply = '';
    let sentiment: 'Relieved' | 'Frustrated' | 'Satisfied' | 'Anxious' | 'Skeptical' | 'Neutral' | 'Delighted' | 'Cooperative' = 'Relieved';
    let sentimentScore = 88;
    let escalationRisk: 'Low' | 'Moderate' | 'High' = 'Low';
    let followupNeeded = false;
    let satisfactionRating = 5;

    if (turnCount === 0) {
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
        if (event?.eventType === 'customer_complaint') {
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
        simulatedReply = `Thank you so much for the confirmation. I was anxious when the order failed, but seeing the refund already initiated to my card (4012) puts my mind at ease.`;
        sentiment = 'Relieved';
        sentimentScore = 92;
        escalationRisk = 'Low';
        satisfactionRating = 5;
      }
    } else if (turnCount === 1) {
      simulatedReply = `One quick follow-up: will I receive an SMS notification once my bank deposits the refund back into my account?`;
      sentiment = 'Satisfied';
      sentimentScore = 90;
      escalationRisk = 'Low';
      followupNeeded = false;
      satisfactionRating = 5;
    } else {
      simulatedReply = `Everything looks clear and complete. Thank you for the quick and seamless communication.`;
      sentiment = 'Delighted';
      sentimentScore = 98;
      escalationRisk = 'Low';
      followupNeeded = false;
      satisfactionRating = 5;
    }

    // Double-check no exclamation marks
    simulatedReply = simulatedReply.replace(/!+/g, '.');

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

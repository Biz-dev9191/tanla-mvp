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
        traits: 'Prefers simple step-by-step instructions, dislikes technical jargon, values warmth and clarity.',
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
    const rawCustName = (customer?.name || 'Customer').trim();
    const customerFirstName = rawCustName.toLowerCase().startsWith('valued') || !rawCustName
      ? 'Customer'
      : rawCustName.split(' ')[0] || 'Customer';

    const eventTitle = event?.title || 'Transaction & Order Resolution';
    const eventFacts = (event?.verifiedFacts && event.verifiedFacts.length > 0)
      ? event.verifiedFacts.join('; ')
      : 'Automated refund initiated, 3-5 business days banking turnaround';

    // 1. If user injected an explicit message for a customer turn, return it directly
    if (action === 'simulate_customer' && userInjectedMessage && userInjectedMessage.trim().length > 0) {
      const cleanMsg = userInjectedMessage.trim().replace(/!+/g, '.');
      return NextResponse.json({
        reply: cleanMsg,
        sentiment: currentPersona.initialSentiment || 'Anxious',
        sentimentScore: 78,
        escalationRisk: currentPersona.initialSentiment === 'Frustrated' ? 'Moderate' : 'Low',
        followupNeeded: true,
        satisfactionRating: 4,
        summary: `Customer posed query regarding: "${cleanMsg}"`,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Try Live LLM simulation if key is available
    if (geminiKey) {
      try {
        let prompt = '';
        if (action === 'simulate_agent') {
          prompt = `You are Aurora Cloud's autonomous multi-agent customer communication system.
Generate an automated, empathetic, policy-compliant agent reply following the enterprise agentic workflow.

CRITICAL GOVERNANCE RULES:
1. Strictly ZERO exclamation marks anywhere in the output.
2. Ground all facts in the customer context: Customer="${customerFirstName}", Event="${eventTitle}".
3. If the customer asks for a discount/coupon/goodwill compensation, state that discretionary compensation or vouchers require human supervisor authorization.
4. If the customer asks about refund timelines, state 3 to 5 business days banking cycle with zero action required.
5. If the customer asks about reference IDs, cite the verified reference or state that it is recorded in their dashboard.

CUSTOMER: ${customerFirstName} (${currentPersona.name})
EVENT: ${eventTitle} (${eventFacts})
INITIAL OUTBOUND MESSAGE: "${message || ''}"
ROLEPLAY THREAD:
${turns.map((t: SimulationTurn) => `[${t.speaker.toUpperCase()}]: ${t.message}`).join('\n')}

${userInjectedMessage ? `LATEST CUSTOMER QUERY:\n"${userInjectedMessage}"` : ''}

Generate JSON:
{
  "reply": "string (agent response with zero exclamation marks)",
  "sentiment": "Reassured",
  "sentimentScore": 92,
  "summary": "string"
}`;
        } else {
          prompt = `You are simulating a customer response for roleplay testing.
Persona: ${currentPersona.name} (${currentPersona.traits})
Event: ${eventTitle}
INITIAL OUTBOUND MESSAGE: "${message || ''}"
THREAD:
${turns.map((t: SimulationTurn) => `[${t.speaker.toUpperCase()}]: ${t.message}`).join('\n') || 'Initial Outbound Received'}

Generate next natural customer message without exclamation marks:
{
  "reply": "string",
  "sentiment": "Relieved | Satisfied | Anxious | Frustrated | Delighted",
  "sentimentScore": 85,
  "escalationRisk": "Low",
  "satisfactionRating": 5,
  "summary": "string"
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
        console.warn('Live LLM simulation error, falling back to deterministic agentic workflow:', e);
      }
    }

    // 3. Deterministic Policy-Governed Agent Reply Engine (Strict Zero Exclamation Marks)
    if (action === 'simulate_agent') {
      const lastTurn = turns.length > 0 ? turns[turns.length - 1] : null;
      const lastMsg = (userInjectedMessage || lastTurn?.message || '').toLowerCase();
      let agentReply = '';

      if (lastMsg.includes('when') || lastMsg.includes('time') || lastMsg.includes('bank') || lastMsg.includes('deposit') || lastMsg.includes('show') || lastMsg.includes('reflect')) {
        agentReply = `Hello ${customerFirstName}, refund deposits typically reflect in your original payment method within 3 to 5 business days depending on your bank's processing cycle. No further action is required from your side.`;
      } else if (lastMsg.includes('coupon') || lastMsg.includes('discount') || lastMsg.includes('compensation') || lastMsg.includes('credit') || lastMsg.includes('voucher') || lastMsg.includes('waiver')) {
        agentReply = `Hello ${customerFirstName}, while the full refund has been initiated, goodwill compensation and vouchers require supervisor authorization. We have recorded your request and routed it to our supervisor review queue.`;
      } else if (lastMsg.includes('reference') || lastMsg.includes('id') || lastMsg.includes('receipt') || lastMsg.includes('number') || lastMsg.includes('track')) {
        agentReply = `Hello ${customerFirstName}, your transaction refund details have been logged and verified in your account dashboard. You will receive an automated confirmation as soon as settlement completes.`;
      } else if (lastMsg.includes('action') || lastMsg.includes('call') || lastMsg.includes('phone') || lastMsg.includes('need') || lastMsg.includes('step')) {
        agentReply = `Hello ${customerFirstName}, zero action is required on your part. You do not need to call support or submit any forms, as our automated system is handling everything end-to-end.`;
      } else {
        agentReply = `Hello ${customerFirstName}, thank you for reaching out. We have logged your inquiry and confirmed that all automated updates for your transaction are proceeding as scheduled.`;
      }

      return NextResponse.json({
        reply: agentReply,
        sentiment: 'Reassured',
        sentimentScore: 92,
        escalationRisk: 'Low',
        followupNeeded: false,
        satisfactionRating: 5,
        summary: `Aurora agent provided a policy-grounded response to ${customerFirstName}'s inquiry.`,
        timestamp: new Date().toISOString(),
      });
    }

    // 4. Deterministic Customer Reaction Engine
    let simulatedReply = '';
    let sentiment: 'Relieved' | 'Frustrated' | 'Satisfied' | 'Anxious' | 'Skeptical' | 'Neutral' | 'Delighted' | 'Cooperative' = 'Relieved';
    let sentimentScore = 88;
    let escalationRisk: 'Low' | 'Moderate' | 'High' = 'Low';
    let followupNeeded = false;
    let satisfactionRating = 5;

    if (turnCount === 0) {
      if (personaId === 'frustrated_senior') {
        simulatedReply = `Thank you for explaining clearly that the refund is going back to my original account. I was worried I had to call a number and wait on hold. This was very straightforward.`;
        sentiment = 'Relieved';
        sentimentScore = 90;
        escalationRisk = 'Low';
        satisfactionRating = 5;
      } else if (personaId === 'vip_exec') {
        simulatedReply = `Appreciate the prompt automated notification and refund confirmation. Please ensure the transaction status is also updated in our portal.`;
        sentiment = 'Satisfied';
        sentimentScore = 84;
        escalationRisk = 'Low';
        satisfactionRating = 4;
      } else if (personaId === 'urgent_escalator') {
        simulatedReply = `Glad you caught this issue and initiated the refund automatically before I had to reach out. Thank you for the proactive update.`;
        sentiment = 'Relieved';
        sentimentScore = 86;
        escalationRisk = 'Low';
        satisfactionRating = 5;
      } else if (personaId === 'tech_millennial') {
        simulatedReply = `Clean update. Thanks for the auto-refund confirmation and no-action notice. Saved me a support ticket.`;
        sentiment = 'Delighted';
        sentimentScore = 95;
        escalationRisk = 'Low';
        satisfactionRating = 5;
      } else {
        simulatedReply = `Thank you for the confirmation. I was anxious when the transaction failed, but seeing the refund already initiated puts my mind at ease.`;
        sentiment = 'Relieved';
        sentimentScore = 92;
        escalationRisk = 'Low';
        satisfactionRating = 5;
      }
    } else if (turnCount === 1) {
      simulatedReply = `One quick follow-up: will I receive an automated notification once my bank deposits the refund back into my account?`;
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

    // Double-check zero exclamation marks
    simulatedReply = simulatedReply.replace(/!+/g, '.');

    return NextResponse.json({
      reply: simulatedReply,
      sentiment,
      sentimentScore,
      escalationRisk,
      followupNeeded,
      satisfactionRating,
      summary: `Persona '${currentPersona.name}' acknowledged with '${sentiment}' sentiment. Inbound support contact successfully deflected.`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

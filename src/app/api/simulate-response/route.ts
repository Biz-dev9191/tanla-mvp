import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, event, message } = body;

    let customerReply = "";
    let sentimentAnalysis = "Satisfied";
    let followupNeeded = false;

    if (event.eventType === 'payment_successful_order_failed') {
      customerReply = `Thank you for the quick update and for initiating the refund to my card ending in 4012. Glad I didn't need to spend 20 minutes on hold with support.`;
      sentimentAnalysis = "Reassured / Relieved";
      followupNeeded = false;
    } else if (event.eventType === 'application_incomplete') {
      customerReply = `Got it, thank you. I will upload my latest electricity bill to the verification link today.`;
      sentimentAnalysis = "Compliant / Cooperative";
      followupNeeded = false;
    } else if (event.eventType === 'customer_complaint') {
      customerReply = `Thanks for waiving the delivery fee. I look forward to hearing from the supervisor regarding the credit voucher.`;
      sentimentAnalysis = "Cautiously Optimistic";
      followupNeeded = true;
    } else {
      customerReply = `Acknowledged, thank you for the communication.`;
      sentimentAnalysis = "Neutral";
      followupNeeded = false;
    }

    return NextResponse.json({
      reply: customerReply,
      sentiment: sentimentAnalysis,
      followupNeeded,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

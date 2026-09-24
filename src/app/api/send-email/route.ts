import { NextRequest, NextResponse } from 'next/server';
import { sendOutboundEmail } from '@/core/providers/email-provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, body: emailBody, from } = body;

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Missing required parameters: to, subject, or body.' },
        { status: 400 }
      );
    }

    const result = await sendOutboundEmail({
      to,
      subject,
      body: emailBody,
      from,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Email dispatch error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to dispatch outbound email.' },
      { status: 500 }
    );
  }
}

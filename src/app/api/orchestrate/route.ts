import { NextRequest, NextResponse } from 'next/server';
import { orchestrateCommunication } from '@/core/orchestrator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Extract optional client-provided API keys
    const geminiKey = body.geminiKey || req.headers.get('x-gemini-key') || undefined;
    const openaiKey = body.openaiKey || req.headers.get('x-openai-key') || undefined;
    const apiKeys = { geminiKey, openaiKey };
    const customRules = body.customRules;
    const customPolicyDocText = body.customPolicyDocText || body.policyDocumentText || undefined;

    // Check if streamlined 3-column payload
    if ('customerProfileText' in body) {
      const result = await orchestrateCommunication(
        body,
        undefined,
        undefined,
        apiKeys,
        customRules,
        customPolicyDocText,
        body.useSamplePolicyTree
      );
      return NextResponse.json(result);
    }

    // Otherwise standard structured payload
    const { customer, event, objective } = body;
    if (!customer || !event || !objective) {
      return NextResponse.json(
        { error: 'Missing required payload parameters.' },
        { status: 400 }
      );
    }

    const result = await orchestrateCommunication(
      customer,
      event,
      objective,
      apiKeys,
      customRules,
      customPolicyDocText,
      body.useSamplePolicyTree
    );
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Orchestration API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during agent orchestration.' },
      { status: 500 }
    );
  }
}

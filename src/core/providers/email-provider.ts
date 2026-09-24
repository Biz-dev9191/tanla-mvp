export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  from?: string;
  apiKey?: string;
}

export interface EmailDispatchResult {
  success: boolean;
  messageId: string;
  provider: 'resend' | 'simulation';
  deliveredAt: string;
  recipient: string;
  status: 'DELIVERED' | 'SIMULATED' | 'FAILED';
  details: string;
}

export async function sendOutboundEmail(params: SendEmailParams): Promise<EmailDispatchResult> {
  const apiKey = params.apiKey || process.env.RESEND_API_KEY;
  const fromAddress = params.from || process.env.EMAIL_FROM || "Aurora Cloud <onboarding@resend.dev>";

  // If live API key is provided, dispatch via Resend
  if (apiKey && apiKey.trim().length > 5) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [params.to],
          subject: params.subject,
          text: params.body,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          messageId: data.id || `RESEND-${Date.now()}`,
          provider: 'resend',
          deliveredAt: new Date().toISOString(),
          recipient: params.to,
          status: 'DELIVERED',
          details: `Live email successfully delivered via Resend API to ${params.to}. Message ID: ${data.id || 'N/A'}.`,
        };
      } else {
        const errData = await response.json().catch(() => ({}));
        return {
          success: false,
          messageId: `RESEND-ERR-${Date.now()}`,
          provider: 'resend',
          deliveredAt: new Date().toISOString(),
          recipient: params.to,
          status: 'FAILED',
          details: `Resend API Error: ${errData.message || response.statusText}. Please verify your Resend API Key.`,
        };
      }
    } catch (error: any) {
      console.warn("Live email dispatch failed:", error);
      return {
        success: false,
        messageId: `RESEND-ERR-${Date.now()}`,
        provider: 'resend',
        deliveredAt: new Date().toISOString(),
        recipient: params.to,
        status: 'FAILED',
        details: `Network error connecting to Resend API: ${error.message}`,
      };
    }
  }

  // Graceful simulated delivery notice
  return {
    success: true,
    messageId: `SIM-EML-${Date.now()}`,
    provider: 'simulation',
    deliveredAt: new Date().toISOString(),
    recipient: params.to,
    status: 'SIMULATED',
    details: `Simulated Email delivery to ${params.to}. Click "API Keys & Settings" in the header to enter your free Resend API key for live external inbox delivery.`,
  };
}

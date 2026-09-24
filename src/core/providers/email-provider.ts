import nodemailer from 'nodemailer';

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
  provider: 'gmail-smtp' | 'smtp' | 'resend' | 'brevo' | 'simulation';
  deliveredAt: string;
  recipient: string;
  status: 'DELIVERED' | 'SIMULATED' | 'FAILED';
  details: string;
}

export async function sendOutboundEmail(params: SendEmailParams): Promise<EmailDispatchResult> {
  // 1. Check for Gmail / Custom SMTP credentials (ZERO Domain Verification Required!)
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: gmailUser.trim(),
          pass: gmailPass.trim().replace(/\s+/g, ''), // clean any accidental spaces in app password
        },
      });

      const info = await transporter.sendMail({
        from: `Aurora Cloud Notifications <${gmailUser.trim()}>`,
        to: params.to,
        subject: params.subject,
        text: params.body,
      });

      return {
        success: true,
        messageId: info.messageId || `GMAIL-${Date.now()}`,
        provider: smtpHost.includes('gmail') ? 'gmail-smtp' : 'smtp',
        deliveredAt: new Date().toISOString(),
        recipient: params.to,
        status: 'DELIVERED',
        details: `Live email successfully delivered to ${params.to} via SMTP (${gmailUser}). Message ID: ${info.messageId}`,
      };
    } catch (smtpErr: any) {
      console.warn("SMTP delivery error:", smtpErr);
      return {
        success: false,
        messageId: `SMTP-ERR-${Date.now()}`,
        provider: 'smtp',
        deliveredAt: new Date().toISOString(),
        recipient: params.to,
        status: 'FAILED',
        details: `SMTP Authentication Error: ${smtpErr.message || 'Failed to authenticate with SMTP server'}. Please check your Gmail App Password.`,
      };
    }
  }

  // 2. Check for Brevo API (Free 300 emails/day to ANY custom recipient with 0 domain setup)
  const brevoKey = process.env.BREVO_API_KEY;
  if (brevoKey && brevoKey.trim().length > 5) {
    try {
      const senderEmail = process.env.BREVO_SENDER_EMAIL || 'notifications@auroracloud.app';
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': brevoKey.trim(),
        },
        body: JSON.stringify({
          sender: { name: 'Aurora Cloud Notifications', email: senderEmail },
          to: [{ email: params.to }],
          subject: params.subject,
          textContent: params.body,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          messageId: data.messageId || `BREVO-${Date.now()}`,
          provider: 'brevo',
          deliveredAt: new Date().toISOString(),
          recipient: params.to,
          status: 'DELIVERED',
          details: `Live email successfully delivered via Brevo API to ${params.to}. Message ID: ${data.messageId || 'N/A'}.`,
        };
      }
    } catch (brevoErr: any) {
      console.warn("Brevo delivery error:", brevoErr);
    }
  }

  // 3. Check for Resend API
  const resendKey = params.apiKey || process.env.RESEND_API_KEY;
  const fromAddress = params.from || process.env.EMAIL_FROM || "Aurora Cloud <onboarding@resend.dev>";

  if (resendKey && resendKey.trim().length > 5) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey.trim()}`,
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
        const rawMsg = errData.message || response.statusText;
        const isSandboxRestricted = rawMsg.toLowerCase().includes('only send testing emails to your own email');

        return {
          success: false,
          messageId: `RESEND-ERR-${Date.now()}`,
          provider: 'resend',
          deliveredAt: new Date().toISOString(),
          recipient: params.to,
          status: 'FAILED',
          details: isSandboxRestricted
            ? `Resend Sandbox Policy: The free sandbox only delivers to your registered account email (bizmodel9191@gmail.com). To send to custom emails like ${params.to} without a domain, configure Gmail SMTP (GMAIL_USER & GMAIL_APP_PASSWORD) in backend environment.`
            : `Resend API: ${rawMsg}`,
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

  // 4. Graceful simulated delivery notice
  return {
    success: true,
    messageId: `SIM-EML-${Date.now()}`,
    provider: 'simulation',
    deliveredAt: new Date().toISOString(),
    recipient: params.to,
    status: 'SIMULATED',
    details: `Simulated Email delivery to ${params.to}. (Live delivery active when SMTP or RESEND_API_KEY is configured in backend environment).`,
  };
}

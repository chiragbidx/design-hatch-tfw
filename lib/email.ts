import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@pandawork.com";
const APP_NAME = "PandaWork";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export function isEmailConfigured(): boolean {
  return Boolean(SENDGRID_API_KEY);
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<{ ok: boolean; error?: string }> {
  if (!SENDGRID_API_KEY) {
    console.warn("[Email] SENDGRID_API_KEY not set, skipping send");
    return { ok: false, error: "Email not configured" };
  }
  try {
    await sgMail.send({
      to,
      from: { email: FROM_EMAIL, name: APP_NAME },
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Email] Send failed:", message);
    return { ok: false, error: message };
  }
}

export { APP_NAME, APP_URL };

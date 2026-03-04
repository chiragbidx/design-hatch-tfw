import { APP_NAME, APP_URL } from "./email";

function baseWrap(inner: string, title: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f3f4f6;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1);overflow:hidden;">
    <div style="background:linear-gradient(135deg,#059669 0%,#10b981 100%);padding:24px;text-align:center;">
      <span style="color:#fff;font-size:20px;font-weight:700;">${APP_NAME}</span>
    </div>
    <div style="padding:28px 24px;">
      ${inner}
    </div>
    <div style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;font-size:12px;color:#6b7280;">
      You received this email because you use ${APP_NAME}. &copy; ${new Date().getFullYear()} ${APP_NAME}.
    </div>
  </div>
</body>
</html>`.trim();
}

/** Register: welcome email after signup */
export function templateWelcome(params: {
  firstName: string;
  email: string;
  role: "CLIENT" | "FREELANCER";
}): { subject: string; html: string } {
  const roleLabel = params.role === "CLIENT" ? "client" : "freelancer";
  const inner = `
    <h1 style="margin:0 0 12px;font-size:22px;color:#111;">Welcome to ${APP_NAME}</h1>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Hi ${params.firstName},</p>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Your account has been created as a <strong>${roleLabel}</strong>. You can now log in and use ${APP_NAME}.</p>
    <p style="margin:0 0 20px;color:#374151;line-height:1.6;">Log in here:</p>
    <a href="${APP_URL}/auth/login" style="display:inline-block;background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Log in</a>
  `;
  return {
    subject: `Welcome to ${APP_NAME}`,
    html: baseWrap(inner, "Welcome"),
  };
}

/** Send proposal: notify client that a freelancer submitted a proposal */
export function templateProposalReceived(params: {
  clientFirstName: string;
  jobTitle: string;
  freelancerName: string;
  bidAmount: number;
  timeline: string;
}): { subject: string; html: string } {
  const inner = `
    <h1 style="margin:0 0 12px;font-size:22px;color:#111;">New proposal on your job</h1>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Hi ${params.clientFirstName},</p>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;"><strong>${params.freelancerName}</strong> has submitted a proposal for your job:</p>
    <p style="margin:0 0 8px;color:#111;font-weight:600;">${params.jobTitle}</p>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Bid: <strong>$${params.bidAmount}</strong> &middot; Timeline: ${params.timeline}</p>
    <a href="${APP_URL}/client/proposals" style="display:inline-block;background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View proposals</a>
  `;
  return {
    subject: `New proposal: ${params.jobTitle}`,
    html: baseWrap(inner, "New proposal"),
  };
}

/** Invite for job: notify freelancer they were invited */
export function templateJobInvite(params: {
  freelancerFirstName: string;
  jobTitle: string;
  clientName: string;
  message?: string | null;
}): { subject: string; html: string } {
  const msg = params.message
    ? `<p style="margin:0 0 16px;color:#374151;line-height:1.6;">Message from client: &ldquo;${params.message}&rdquo;</p>`
    : "";
  const inner = `
    <h1 style="margin:0 0 12px;font-size:22px;color:#111;">You're invited to a job</h1>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Hi ${params.freelancerFirstName},</p>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;"><strong>${params.clientName}</strong> has invited you to apply for their job:</p>
    <p style="margin:0 0 16px;color:#111;font-weight:600;">${params.jobTitle}</p>
    ${msg}
    <a href="${APP_URL}/freelancer/invites" style="display:inline-block;background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View job</a>
  `;
  return {
    subject: `Invitation: ${params.jobTitle}`,
    html: baseWrap(inner, "Job invitation"),
  };
}

/** Create milestone: notify freelancer a new milestone was added */
export function templateMilestoneCreated(params: {
  freelancerFirstName: string;
  jobTitle: string;
  milestoneTitle: string;
  amount: number;
}): { subject: string; html: string } {
  const inner = `
    <h1 style="margin:0 0 12px;font-size:22px;color:#111;">New milestone added</h1>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Hi ${params.freelancerFirstName},</p>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">A new milestone has been added to the contract for <strong>${params.jobTitle}</strong>:</p>
    <p style="margin:0 0 8px;color:#111;">${params.milestoneTitle}</p>
    <p style="margin:0 0 16px;color:#374151;">Amount: <strong>$${params.amount}</strong></p>
    <a href="${APP_URL}/freelancer/contracts" style="display:inline-block;background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View contract</a>
  `;
  return {
    subject: `New milestone: ${params.milestoneTitle} (${params.jobTitle})`,
    html: baseWrap(inner, "New milestone"),
  };
}

/** Release fund: notify freelancer payment was released */
export function templateFundReleased(params: {
  freelancerFirstName: string;
  jobTitle: string;
  milestoneTitle: string;
  amount: number;
}): { subject: string; html: string } {
  const inner = `
    <h1 style="margin:0 0 12px;font-size:22px;color:#111;">Payment released</h1>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Hi ${params.freelancerFirstName},</p>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">The client has released payment for the following milestone:</p>
    <p style="margin:0 0 8px;color:#111;">Job: <strong>${params.jobTitle}</strong></p>
    <p style="margin:0 0 8px;color:#111;">Milestone: ${params.milestoneTitle}</p>
    <p style="margin:0 0 16px;color:#059669;font-weight:600;">Amount: $${params.amount}</p>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">The funds are now in your available balance. You can request a withdrawal from your dashboard.</p>
    <a href="${APP_URL}/freelancer/withdrawals" style="display:inline-block;background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Withdrawals</a>
  `;
  return {
    subject: `Payment released: $${params.amount} for ${params.milestoneTitle}`,
    html: baseWrap(inner, "Payment released"),
  };
}

/** Withdrawal: confirm withdrawal request to freelancer */
export function templateWithdrawalRequested(params: {
  freelancerFirstName: string;
  amount: number;
  method: string;
}): { subject: string; html: string } {
  const inner = `
    <h1 style="margin:0 0 12px;font-size:22px;color:#111;">Withdrawal request received</h1>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Hi ${params.freelancerFirstName},</p>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">We have received your withdrawal request.</p>
    <p style="margin:0 0 8px;color:#111;">Amount: <strong>$${params.amount}</strong></p>
    <p style="margin:0 0 16px;color:#374151;">Method: ${params.method}</p>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">We will process it as soon as possible. You will be notified when it is completed.</p>
    <a href="${APP_URL}/freelancer/withdrawals" style="display:inline-block;background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View withdrawals</a>
  `;
  return {
    subject: `Withdrawal request: $${params.amount}`,
    html: baseWrap(inner, "Withdrawal request"),
  };
}

/** Add fund (client funded milestone): notify freelancer */
export function templateMilestoneFunded(params: {
  freelancerFirstName: string;
  jobTitle: string;
  milestoneTitle: string;
  amount: number;
}): { subject: string; html: string } {
  const inner = `
    <h1 style="margin:0 0 12px;font-size:22px;color:#111;">Milestone funded</h1>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Hi ${params.freelancerFirstName},</p>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">The client has funded the following milestone for <strong>${params.jobTitle}</strong>:</p>
    <p style="margin:0 0 8px;color:#111;">${params.milestoneTitle}</p>
    <p style="margin:0 0 16px;color:#374151;">Amount: <strong>$${params.amount}</strong> (held in escrow)</p>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Once you submit your work and the client approves it, the payment will be released to your balance.</p>
    <a href="${APP_URL}/freelancer/contracts" style="display:inline-block;background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View contract</a>
  `;
  return {
    subject: `Milestone funded: ${params.milestoneTitle} (${params.jobTitle})`,
    html: baseWrap(inner, "Milestone funded"),
  };
}

/** Forgot password: send reset link with token */
export function templateForgotPassword(params: {
  firstName: string;
  resetUrl: string;
  expiresInMinutes: number;
}): { subject: string; html: string } {
  const inner = `
    <h1 style="margin:0 0 12px;font-size:22px;color:#111;">Reset your password</h1>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Hi ${params.firstName},</p>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">We received a request to reset your ${APP_NAME} password. Click the button below to set a new password.</p>
    <p style="margin:0 0 20px;color:#374151;line-height:1.6;">This link will expire in ${params.expiresInMinutes} minutes.</p>
    <a href="${params.resetUrl}" style="display:inline-block;background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Reset password</a>
    <p style="margin:20px 0 0;color:#6b7280;font-size:12px;line-height:1.5;">If you didn't request this, you can safely ignore this email. Your password will not be changed.</p>
  `;
  return {
    subject: `Reset your ${APP_NAME} password`,
    html: baseWrap(inner, "Reset password"),
  };
}

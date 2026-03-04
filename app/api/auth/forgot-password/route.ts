import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { templateForgotPassword } from "@/lib/emailTemplates";
import { APP_URL } from "@/lib/email";
import crypto from "crypto";

const TOKEN_EXPIRY_HOURS = 1;

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Creates a reset token, stores it, and sends an email with the reset link.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true },
    });

    // Always return success to avoid leaking whether the email exists
    if (!user) {
      return NextResponse.json({ message: "If an account exists with this email, you will receive a reset link." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    const resetUrl = `${APP_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;
    const { subject, html } = templateForgotPassword({
      firstName: user.firstName,
      resetUrl,
      expiresInMinutes: TOKEN_EXPIRY_HOURS * 60,
    });

    await sendEmail({ to: user.email, subject, html });

    return NextResponse.json({
      message: "If an account exists with this email, you will receive a reset link.",
    });
  } catch (error) {
    console.error("[Forgot password]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

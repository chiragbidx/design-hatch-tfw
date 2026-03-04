import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { sendEmail } from "@/lib/email";
import { templateWithdrawalRequested } from "@/lib/emailTemplates";

const MIN_WITHDRAWAL = 1;

/**
 * GET /api/freelancer/withdrawals
 * List withdrawal history for the current freelancer.
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;

  const freelancerId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(freelancerId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const list = await prisma.withdrawal.findMany({
    where: { freelancerId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(list);
}

/**
 * POST /api/freelancer/withdrawals
 * Create a withdrawal request. Body: { amount: number, method?: string, note?: string }
 */
export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;

  const freelancerId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(freelancerId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const amount =
    typeof body.amount === "number"
      ? body.amount
      : parseInt(String(body.amount), 10);
  const method =
    typeof body.method === "string" ? body.method.trim() || null : null;
  const note =
    typeof body.note === "string"
      ? body.note.trim().slice(0, 500) || null
      : null;

  const bankDetails = body.bankDetails ?? null;

  if (method === "bank_transfer") {
    if (
      !bankDetails?.bankName ||
      !bankDetails?.accountName ||
      !bankDetails?.accountNumber ||
      !bankDetails?.ifsc
    ) {
      return NextResponse.json(
        { error: "Bank details are required for bank transfer" },
        { status: 400 },
      );
    }
  }

  if (Number.isNaN(amount) || amount < MIN_WITHDRAWAL) {
    return NextResponse.json(
      { error: `Minimum withdrawal is $${MIN_WITHDRAWAL}` },
      { status: 400 },
    );
  }

  const [milestones, withdrawals] = await Promise.all([
    prisma.milestone.findMany({
      where: { contract: { freelancerId } },
      select: { amount: true, status: true },
    }),
    prisma.withdrawal.findMany({
      where: { freelancerId },
      select: { amount: true, status: true },
    }),
  ]);

  const totalReleased = milestones
    .filter((m) => m.status === "RELEASED")
    .reduce((s, m) => s + m.amount, 0);
  const totalWithdrawn = withdrawals
    .filter((w) => w.status === "COMPLETED")
    .reduce((s, w) => s + w.amount, 0);
  const pendingSum = withdrawals
    .filter((w) => w.status === "PENDING" || w.status === "PROCESSING")
    .reduce((s, w) => s + w.amount, 0);
  const availableBalance = Math.max(
    0,
    totalReleased - totalWithdrawn - pendingSum,
  );

  if (amount > availableBalance) {
    return NextResponse.json(
      {
        error: `Insufficient balance. Available: $${availableBalance.toLocaleString()}`,
      },
      { status: 400 },
    );
  }

  const withdrawal = await prisma.withdrawal.create({
    data: {
      freelancerId,
      amount,
      status: "PENDING",
      method,
      note,

      bankName: bankDetails?.bankName,
      bankAccountName: bankDetails?.accountName,
      bankAccountNumber: bankDetails?.accountNumber,
      bankIfscCode: bankDetails?.ifsc,
    },
  });

  const freelancer = await prisma.user.findUnique({
    where: { id: freelancerId },
    select: { email: true, firstName: true },
  });
  if (freelancer?.email) {
    const { subject, html } = templateWithdrawalRequested({
      freelancerFirstName: freelancer.firstName,
      amount: withdrawal.amount,
      method: withdrawal.method ?? "bank_transfer",
    });
    sendEmail({ to: freelancer.email, subject, html }).catch((e) =>
      console.error("[Withdrawals] Email failed:", e),
    );
  }

  return NextResponse.json(withdrawal);
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/**
 * GET /api/freelancer/balance
 * Returns available balance (released earnings minus completed withdrawals) and totals.
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;

  const freelancerId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(freelancerId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
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
  const pendingWithdrawals = withdrawals
    .filter((w) => w.status === "PENDING" || w.status === "PROCESSING")
    .reduce((s, w) => s + w.amount, 0);
  const availableBalance = Math.max(0, totalReleased - totalWithdrawn - pendingWithdrawals);

  return NextResponse.json({
    availableBalance,
    totalReleased,
    totalWithdrawn,
    pendingWithdrawals,
  });
}

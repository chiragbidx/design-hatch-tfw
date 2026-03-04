import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/**
 * GET /api/freelancer/stats
 * Returns dashboard stats for the current freelancer: proposals, contracts, earnings.
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;

  const freelancerId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(freelancerId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const [proposalList, contractsCount, milestones, withdrawals] =
    await Promise.all([
      prisma.proposal.findMany({
        where: { freelancerId },
        select: { status: true },
      }),
      prisma.contract.count({ where: { freelancerId } }),
      prisma.milestone.findMany({
        where: { contract: { freelancerId } },
        select: { amount: true, status: true },
      }),
      prisma.withdrawal.findMany({
        where: { freelancerId },
        select: { amount: true, status: true },
      }),
    ]);

  const proposalsCount = proposalList.length;
  const pendingProposalsCount = proposalList.filter(
    (p) => p.status === "PENDING"
  ).length;

  const earningsReleased = milestones
    .filter((m) => m.status === "RELEASED")
    .reduce((s, m) => s + m.amount, 0);
  const earningsPending = milestones
    .filter((m) => m.status === "SUBMITTED")
    .reduce((s, m) => s + m.amount, 0);

  const totalWithdrawn = withdrawals
    .filter((w) => w.status === "COMPLETED")
    .reduce((s, w) => s + w.amount, 0);
  const pendingWithdrawalsSum = withdrawals
    .filter((w) => w.status === "PENDING" || w.status === "PROCESSING")
    .reduce((s, w) => s + w.amount, 0);
  const availableBalance = Math.max(
    0,
    earningsReleased - totalWithdrawn - pendingWithdrawalsSum
  );

  return NextResponse.json({
    proposalsCount,
    pendingProposalsCount,
    contractsCount,
    earningsReleased,
    earningsPending,
    availableBalance,
    totalWithdrawn,
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/**
 * GET /api/client/stats
 * Returns dashboard stats for the current client: jobs, proposals, contracts, spending.
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;

  const clientId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const [user, jobsCount, proposalsCount, contractsCount, payments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: clientId },
      select: { firstName: true, lastName: true, username: true },
    }),
    prisma.job.count({ where: { clientId } }),
    prisma.proposal.count({
      where: { job: { clientId } },
    }),
    prisma.contract.count({ where: { clientId } }),
    prisma.payment.findMany({
      where: {
        milestone: {
          contract: { clientId },
        },
      },
      select: {
        amount: true,
        status: true,
      },
    }),
  ]);

  const totalSpent = payments
    .filter((p) => p.status === "RELEASED")
    .reduce((s, p) => s + p.amount, 0);
  const pendingSpent = payments
    .filter((p) => p.status === "HELD")
    .reduce((s, p) => s + p.amount, 0);

  const openJobsCount = await prisma.job.count({
    where: { clientId, status: "OPEN" },
  });
  const jobsWithProposalsCount = await prisma.job.count({
    where: {
      clientId,
      proposals: { some: {} },
    },
  });

  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : user?.username ?? "Client";

  return NextResponse.json({
    userName,
    jobsCount,
    openJobsCount,
    jobsWithProposalsCount,
    proposalsCount,
    contractsCount,
    totalSpent,
    pendingSpent,
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/**
 * GET /api/freelancer/contracts
 * Returns contracts for the current freelancer (with job, client, milestones).
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;

  const freelancerId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(freelancerId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const contracts = await prisma.contract.findMany({
    where: { freelancerId },
    orderBy: { createdAt: "desc" },
    include: {
      job: { select: { id: true, title: true, status: true } },
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      milestones: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json(contracts);
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/**
 * GET /api/client/contracts
 * Returns contracts for the current client (with job, freelancer, milestones).
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;

  const clientId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const contracts = await prisma.contract.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    include: {
      job: { select: { id: true, title: true, status: true } },
      freelancer: {
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

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/**
 * GET /api/client/proposals
 * Returns all proposals on jobs owned by the current client (authenticated user).
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) {
    return authResult.error;
  }

  const clientId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const proposals = await prisma.proposal.findMany({
    where: {
      job: {
        clientId,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          description: true,
          budget: true,
          budgetType: true,
          status: true,
        },
      },
      freelancer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json(proposals);
}

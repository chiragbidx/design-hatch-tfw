import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/**
 * GET /api/freelancer/invites
 * Returns invites received by the current freelancer.
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) {
    return authResult.error;
  }

  const freelancerId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(freelancerId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const invites = await prisma.jobInvite.findMany({
    where: { freelancerId },
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
          experienceLevel: true,
        },
      },
      invitedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return NextResponse.json(invites);
}

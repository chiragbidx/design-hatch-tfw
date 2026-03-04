import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/**
 * GET /api/contracts/[id]
 * Returns a contract if the current user is the client or the freelancer.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;

  const userId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const { id } = await params;
  const contractId = parseInt(id, 10);
  if (Number.isNaN(contractId) || contractId < 1) {
    return NextResponse.json({ error: "Invalid contract id" }, { status: 400 });
  }

  const contract = await prisma.contract.findFirst({
    where: {
      id: contractId,
      OR: [{ clientId: userId }, { freelancerId: userId }],
    },
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

  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  return NextResponse.json(contract);
}

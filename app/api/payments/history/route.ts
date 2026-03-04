import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/**
 * GET /api/payments/history
 * Returns payment history for the authenticated freelancer (released milestones).
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;

  const freelancerId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(freelancerId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const payments = await prisma.payment.findMany({
    where: {
      milestone: {
        contract: { freelancerId },
      },
      status: "RELEASED",
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      amount: true,
      platformFee: true,
      status: true,
      createdAt: true,
      milestone: {
        select: {
          id: true,
          title: true,
          contract: {
            select: {
              job: {
                select: { id: true, title: true },
              },
              client: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return NextResponse.json(payments);
}

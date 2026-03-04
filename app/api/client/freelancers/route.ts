import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/**
 * GET /api/client/freelancers
 * Returns users with role FREELANCER (for client to invite to jobs).
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) {
    return authResult.error;
  }

  const freelancers = await prisma.user.findMany({
    where: { role: "FREELANCER" },
    orderBy: { firstName: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      location: true,
      profile: {
        select: {
          id: true,
          bio: true,
          hourlyRate: true,
          experienceStat: true,
          avatarUrl: true,
          skills: { select: { name: true } },
        },
      },
    },
  });

  return NextResponse.json(freelancers);
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/** GET – returns { count: number } for navbar badge */
export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if ("error" in auth) return auth.error;
  const { userId: rawUserId } = auth;
  const userId = typeof rawUserId === "string" ? parseInt(rawUserId, 10) : rawUserId;
  if (Number.isNaN(userId)) {
    return NextResponse.json({ count: 0 });
  }

  if (prisma.savedJob) {
    const count = await prisma.savedJob.count({
      where: { freelancerId: userId },
    });
    return NextResponse.json({ count });
  }

  try {
    const rows = await prisma.$queryRaw<[{ count: number }]>`
      SELECT COUNT(*)::int as count FROM "SavedJob" WHERE "freelancerId" = ${userId}
    `;
    const count = Number(rows[0]?.count ?? 0);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

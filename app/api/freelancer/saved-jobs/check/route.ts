import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/** GET ?jobId=123 – returns { saved: true | false } */
export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if ("error" in auth) return auth.error;
  const { userId: rawUserId } = auth;
  const userId = typeof rawUserId === "string" ? parseInt(rawUserId, 10) : rawUserId;
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const url = new URL(req.url);
  const jobIdParam = url.searchParams.get("jobId");
  const jobId = jobIdParam != null ? parseInt(jobIdParam, 10) : NaN;
  if (Number.isNaN(jobId) || jobId < 1) {
    return NextResponse.json({ error: "jobId query param required" }, { status: 400 });
  }

  if (prisma.savedJob) {
    const saved = await prisma.savedJob.findUnique({
      where: {
        freelancerId_jobId: { freelancerId: userId, jobId },
      },
      select: { id: true },
    });
    return NextResponse.json({ saved: !!saved });
  }

  try {
    const rows = await prisma.$queryRaw<{ id: number }[]>`
      SELECT "id" FROM "SavedJob" WHERE "freelancerId" = ${userId} AND "jobId" = ${jobId} LIMIT 1
    `;
    return NextResponse.json({ saved: rows.length > 0 });
  } catch {
    return NextResponse.json({ saved: false });
  }
}

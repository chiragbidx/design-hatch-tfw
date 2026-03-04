import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/**
 * GET /api/freelancer/proposals/check?jobId=123
 * Returns { applied: true | false } for the current freelancer and job.
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) {
    return authResult.error;
  }

  const userId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const jobIdParam = searchParams.get("jobId");
  const jobId =
    jobIdParam != null ? parseInt(jobIdParam, 10) : NaN;
  if (Number.isNaN(jobId) || jobId < 1) {
    return NextResponse.json(
      { error: "Missing or invalid jobId" },
      { status: 400 }
    );
  }

  const proposal = await prisma.proposal.findFirst({
    where: { freelancerId: userId, jobId },
    select: { id: true },
  });

  return NextResponse.json({ applied: !!proposal });
}

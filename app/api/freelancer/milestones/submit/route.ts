import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/**
 * POST /api/freelancer/milestones/submit
 * Freelancer submits work for a funded milestone. Body: { milestoneId, submissionNote? }
 */
export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;

  const freelancerId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(freelancerId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const body = await req.json();
  const milestoneId =
    typeof body.milestoneId === "number"
      ? body.milestoneId
      : parseInt(String(body.milestoneId), 10);
  const submissionNote =
    typeof body.submissionNote === "string"
      ? body.submissionNote.trim() || null
      : null;

  if (Number.isNaN(milestoneId) || milestoneId < 1) {
    return NextResponse.json(
      { error: "Valid milestoneId is required" },
      { status: 400 }
    );
  }

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { contract: true },
  });

  if (!milestone) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  if (milestone.contract.freelancerId !== freelancerId) {
    return NextResponse.json(
      { error: "Not authorized to submit this milestone" },
      { status: 403 }
    );
  }

  if (milestone.status !== "FUNDED") {
    return NextResponse.json(
      { error: "Milestone must be funded by client before submission" },
      { status: 400 }
    );
  }

  const updated = await prisma.milestone.update({
    where: { id: milestone.id },
    data: {
      status: "SUBMITTED",
      submissionNote,
      submittedAt: new Date(),
    },
    include: { payment: true },
  });

  return NextResponse.json(updated);
}

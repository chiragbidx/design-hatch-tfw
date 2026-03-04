import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/**
 * PATCH /api/client/jobs/[id]/close
 * Close a job. All payments for the job's contract must be RELEASED before closing.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;

  const clientId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const { id } = await params;
  const jobId = parseInt(id, 10);
  if (Number.isNaN(jobId) || jobId < 1) {
    return NextResponse.json({ error: "Invalid job id" }, { status: 400 });
  }

  const job = await prisma.job.findFirst({
    where: { id: jobId, clientId },
    include: {
      contract: {
        include: {
          milestones: { include: { payment: true } },
        },
      },
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.status === "CLOSED") {
    return NextResponse.json(
      { error: "Job is already closed" },
      { status: 400 }
    );
  }

  // If there is a contract, all payments must be RELEASED before closing
  if (job.contract) {
    const heldPayments = job.contract.milestones.filter(
      (m) => m.payment && m.payment.status === "HELD"
    );
    if (heldPayments.length > 0) {
      return NextResponse.json(
        {
          error:
            "Release all payments before closing this job. Some milestone payments are still held.",
        },
        { status: 400 }
      );
    }
  }

  await prisma.job.update({
    where: { id: jobId },
    data: { status: "CLOSED" },
  });

  return NextResponse.json({
    ok: true,
    message: "Job closed successfully",
    jobId,
  });
}

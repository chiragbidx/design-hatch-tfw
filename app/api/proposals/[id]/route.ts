import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(req);
  if (authResult.error) {
    return authResult.error;
  }

  const clientId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const { id } = await params;
  const proposalId = parseInt(id, 10);
  if (Number.isNaN(proposalId)) {
    return NextResponse.json({ error: "Invalid proposal id" }, { status: 400 });
  }

  const existing = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { job: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (existing.job.clientId !== clientId) {
    return NextResponse.json({ error: "Not authorized to accept this proposal" }, { status: 403 });
  }

  if (existing.status !== "PENDING") {
    return NextResponse.json(
      { error: "Proposal is already accepted or rejected" },
      { status: 400 }
    );
  }

  const jobAlreadyHasContract = await prisma.contract.findUnique({
    where: { jobId: existing.jobId },
  });
  if (jobAlreadyHasContract) {
    return NextResponse.json(
      {
        error:
          "You have already accepted a proposal for this job. Only one freelancer can be hired per job.",
      },
      { status: 400 }
    );
  }

  const proposal = await prisma.proposal.update({
    where: { id: proposalId },
    data: { status: "ACCEPTED" },
    include: { job: true },
  });

  const contract = await prisma.contract.create({
    data: {
      jobId: proposal.jobId,
      clientId,
      freelancerId: proposal.freelancerId,
    },
  });

  return NextResponse.json(contract);
}

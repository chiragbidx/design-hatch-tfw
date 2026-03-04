import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { sendEmail } from "@/lib/email";
import { templateMilestoneCreated } from "@/lib/emailTemplates";

/**
 * POST /api/client/contracts/[id]/milestones
 * Add a milestone to a contract. Body: { title, amount }
 */
export async function POST(
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
  const contractId = parseInt(id, 10);
  if (Number.isNaN(contractId) || contractId < 1) {
    return NextResponse.json({ error: "Invalid contract id" }, { status: 400 });
  }

  const contract = await prisma.contract.findFirst({
    where: { id: contractId, clientId },
    include: { job: { select: { status: true } } },
  });

  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  if (contract.job.status === "CLOSED") {
    return NextResponse.json(
      { error: "Cannot add milestones to a closed job" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const amount = typeof body.amount === "number" ? body.amount : parseInt(String(body.amount), 10);

  if (!title || title.length < 1) {
    return NextResponse.json(
      { error: "Milestone title is required" },
      { status: 400 }
    );
  }
  if (Number.isNaN(amount) || amount < 1) {
    return NextResponse.json(
      { error: "Valid amount is required" },
      { status: 400 }
    );
  }

  const milestone = await prisma.milestone.create({
    data: {
      contractId,
      title,
      amount,
    },
  });

  const contractWithJobAndFreelancer = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      job: { select: { title: true } },
      freelancer: { select: { email: true, firstName: true } },
    },
  });
  if (contractWithJobAndFreelancer?.freelancer?.email) {
    const { subject, html } = templateMilestoneCreated({
      freelancerFirstName: contractWithJobAndFreelancer.freelancer.firstName,
      jobTitle: contractWithJobAndFreelancer.job.title,
      milestoneTitle: milestone.title,
      amount: milestone.amount,
    });
    sendEmail({
      to: contractWithJobAndFreelancer.freelancer.email,
      subject,
      html,
    }).catch((e) => console.error("[Milestones] Email failed:", e));
  }

  return NextResponse.json(milestone);
}

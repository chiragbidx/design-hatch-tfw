import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { sendEmail } from "@/lib/email";
import { templateFundReleased } from "@/lib/emailTemplates";

/**
 * POST /api/client/milestones/release
 * Client approves and releases payment for a submitted milestone. Body: { milestoneId }
 */
export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;

  const clientId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const body = await req.json();
  const milestoneId =
    typeof body.milestoneId === "number"
      ? body.milestoneId
      : parseInt(String(body.milestoneId), 10);

  if (Number.isNaN(milestoneId) || milestoneId < 1) {
    return NextResponse.json(
      { error: "Valid milestoneId is required" },
      { status: 400 }
    );
  }

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      contract: {
        include: {
          job: { select: { title: true } },
          freelancer: { select: { email: true, firstName: true } },
        },
      },
      payment: true,
    },
  });

  if (!milestone) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  if (milestone.contract.clientId !== clientId) {
    return NextResponse.json(
      { error: "Not authorized to release this milestone" },
      { status: 403 }
    );
  }

  if (milestone.status !== "SUBMITTED") {
    return NextResponse.json(
      { error: "Milestone must be submitted by freelancer before release" },
      { status: 400 }
    );
  }

  if (!milestone.payment) {
    return NextResponse.json(
      { error: "No payment found for this milestone" },
      { status: 400 }
    );
  }

  await prisma.payment.update({
    where: { milestoneId: milestone.id },
    data: { status: "RELEASED" },
  });

  await prisma.milestone.update({
    where: { id: milestone.id },
    data: { status: "RELEASED" },
  });

  const updated = await prisma.milestone.findUnique({
    where: { id: milestone.id },
    include: { payment: true },
  });

  if (milestone.contract.freelancer?.email) {
    const { subject, html } = templateFundReleased({
      freelancerFirstName: milestone.contract.freelancer.firstName,
      jobTitle: milestone.contract.job.title,
      milestoneTitle: milestone.title,
      amount: milestone.amount,
    });
    sendEmail({
      to: milestone.contract.freelancer.email,
      subject,
      html,
    }).catch((e) => console.error("[Release] Email failed:", e));
  }

  return NextResponse.json(updated);
}

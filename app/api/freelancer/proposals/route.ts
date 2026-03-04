import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { sendEmail } from "@/lib/email";
import { templateProposalReceived } from "@/lib/emailTemplates";

export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) {
    return authResult.error;
  }
  const user = { id: parseInt(String(authResult.userId), 10) };
  if (Number.isNaN(user.id)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const proposals = await prisma.proposal.findMany({
    where: { freelancerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(proposals);
}

export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) {
    return authResult.error;
  }
  const user = { id: parseInt(String(authResult.userId), 10) };
  if (Number.isNaN(user.id)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }
  const body = await req.json();

  const jobId =
    typeof body.jobId === "number" ? body.jobId : parseInt(String(body.jobId), 10);
  if (Number.isNaN(jobId) || jobId < 1) {
    return NextResponse.json(
      { error: "Invalid job id" },
      { status: 400 }
    );
  }

  const existing = await prisma.proposal.findFirst({
    where: { freelancerId: user.id, jobId },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You have already applied to this job." },
      { status: 409 }
    );
  }

  const proposal = await prisma.proposal.create({
    data: {
      coverLetter: body.coverLetter,
      bidAmount: body.bidAmount,
      timeline: body.timeline,
      jobId,
      freelancerId: user.id,
    },
    include: {
      job: {
        include: {
          client: { select: { email: true, firstName: true } },
        },
      },
      freelancer: { select: { firstName: true, lastName: true } },
    },
  });

  const client = proposal.job.client;
  const freelancerName =
    `${proposal.freelancer.firstName} ${proposal.freelancer.lastName}`.trim() || "A freelancer";
  const { subject, html } = templateProposalReceived({
    clientFirstName: client.firstName,
    jobTitle: proposal.job.title,
    freelancerName,
    bidAmount: proposal.bidAmount,
    timeline: proposal.timeline,
  });
  sendEmail({ to: client.email, subject, html }).catch((e) =>
    console.error("[Proposals] Email failed:", e)
  );

  return NextResponse.json(proposal);
}

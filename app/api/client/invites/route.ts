import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { sendEmail } from "@/lib/email";
import { templateJobInvite } from "@/lib/emailTemplates";

/**
 * GET /api/client/invites
 * Returns invites sent by the current client (for their jobs).
 */
export async function GET(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) {
    return authResult.error;
  }

  const clientId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const invites = await prisma.jobInvite.findMany({
    where: { invitedByClientId: clientId },
    orderBy: { createdAt: "desc" },
    include: {
      job: { select: { id: true, title: true, status: true } },
      freelancer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json(invites);
}

/**
 * POST /api/client/invites
 * Create an invite: client invites a freelancer to a job they own.
 * Body: { jobId, freelancerId, message? }
 */
export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) {
    return authResult.error;
  }

  const clientId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const body = await req.json();
  const jobId = typeof body.jobId === "number" ? body.jobId : parseInt(String(body.jobId), 10);
  const freelancerId =
    typeof body.freelancerId === "number"
      ? body.freelancerId
      : parseInt(String(body.freelancerId), 10);
  const message = typeof body.message === "string" ? body.message.trim() || null : null;

  if (Number.isNaN(jobId) || jobId < 1 || Number.isNaN(freelancerId) || freelancerId < 1) {
    return NextResponse.json(
      { error: "Valid jobId and freelancerId are required" },
      { status: 400 }
    );
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { clientId: true, status: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.clientId !== clientId) {
    return NextResponse.json({ error: "You can only invite freelancers to your own jobs" }, { status: 403 });
  }

  if (job.status !== "OPEN") {
    return NextResponse.json({ error: "You can only invite freelancers to open jobs" }, { status: 400 });
  }

  const freelancer = await prisma.user.findFirst({
    where: { id: freelancerId, role: "FREELANCER" },
  });

  if (!freelancer) {
    return NextResponse.json({ error: "Freelancer not found" }, { status: 404 });
  }

  const existing = await prisma.jobInvite.findUnique({
    where: {
      jobId_freelancerId: { jobId, freelancerId },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "This freelancer has already been invited to this job" },
      { status: 409 }
    );
  }

  const invite = await prisma.jobInvite.create({
    data: {
      jobId,
      freelancerId,
      invitedByClientId: clientId,
      message: message ?? undefined,
    },
    include: {
      job: {
        include: {
          client: { select: { firstName: true, lastName: true } },
        },
      },
      freelancer: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  const clientName =
    `${invite.job.client.firstName} ${invite.job.client.lastName}`.trim() ||
    "A client";
  const { subject, html } = templateJobInvite({
    freelancerFirstName: invite.freelancer.firstName,
    jobTitle: invite.job.title,
    clientName,
    message: invite.message,
  });
  sendEmail({ to: invite.freelancer.email, subject, html }).catch((e) =>
    console.error("[Invites] Email failed:", e)
  );

  return NextResponse.json(invite);
}

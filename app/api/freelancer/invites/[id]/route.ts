import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/**
 * PATCH /api/freelancer/invites/[id]
 * Accept or decline an invite. Body: { action: "ACCEPT" | "DECLINE" }
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(req);
  if (authResult.error) {
    return authResult.error;
  }

  const freelancerId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(freelancerId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const { id } = await params;
  const inviteId = parseInt(id, 10);
  if (Number.isNaN(inviteId) || inviteId < 1) {
    return NextResponse.json({ error: "Invalid invite id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const action = body.action === "ACCEPT" ? "ACCEPT" : body.action === "DECLINE" ? "DECLINE" : null;

  if (!action) {
    return NextResponse.json(
      { error: "action must be ACCEPT or DECLINE" },
      { status: 400 }
    );
  }

  const invite = await prisma.jobInvite.findUnique({
    where: { id: inviteId },
    include: { job: true },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (invite.freelancerId !== freelancerId) {
    return NextResponse.json({ error: "Not authorized to update this invite" }, { status: 403 });
  }

  if (invite.status !== "PENDING") {
    return NextResponse.json(
      { error: "This invite has already been responded to" },
      { status: 400 }
    );
  }

  const newStatus = action === "ACCEPT" ? "ACCEPTED" : "DECLINED";

  const updated = await prisma.jobInvite.update({
    where: { id: inviteId },
    data: { status: newStatus },
    include: {
      job: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json(updated);
}

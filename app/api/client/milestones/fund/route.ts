import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const CURRENCY = (process.env.STRIPE_CURRENCY || "usd").toLowerCase();

/**
 * POST /api/client/milestones/fund
 * Creates a Stripe PaymentIntent for the milestone. Returns clientSecret for in-app payment.
 * No redirect; frontend uses Stripe Elements to collect card and confirm.
 * Body: { milestoneId }
 * Returns: { clientSecret, paymentIntentId, milestoneId } or error.
 */
export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;

  const clientId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
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
    include: { contract: true, payment: true },
  });

  if (!milestone) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  if (milestone.contract.clientId !== clientId) {
    return NextResponse.json(
      { error: "Not authorized to fund this milestone" },
      { status: 403 }
    );
  }

  if (milestone.status !== "PENDING") {
    return NextResponse.json(
      { error: "Milestone is already funded or completed" },
      { status: 400 }
    );
  }

  if (milestone.payment) {
    return NextResponse.json(
      { error: "Payment already exists for this milestone" },
      { status: 400 }
    );
  }

  const amountCents = Math.round(milestone.amount * 100);
  if (amountCents < 50) {
    return NextResponse.json(
      { error: "Amount must be at least $0.50" },
      { status: 400 }
    );
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: CURRENCY,
      payment_method_types: ["card"],
      metadata: {
        milestoneId: String(milestoneId),
        contractId: String(milestone.contractId),
        clientId: String(clientId),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      milestoneId,
    });
  } catch (err) {
    console.error("Stripe PaymentIntent create error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment setup failed" },
      { status: 500 }
    );
  }
}

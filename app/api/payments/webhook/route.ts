import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getPlatformFeeAmount } from "@/lib/platformFee";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * POST /api/payments/webhook
 * Stripe webhook: checkout.session.completed → create Payment (HELD), set milestone to FUNDED.
 * Funds held internally; released to freelancer on client approval (release endpoint).
 */
export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !webhookSecret) {
    console.error("Stripe or webhook secret not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  const headersList = await headers();
  const signature = headersList.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  const body = await req.text();

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const milestoneIdStr = session.metadata?.milestoneId;
  if (!milestoneIdStr) {
    console.error("Webhook: missing milestoneId in session metadata");
    return NextResponse.json({ received: true });
  }

  const milestoneId = parseInt(milestoneIdStr, 10);
  if (Number.isNaN(milestoneId) || milestoneId < 1) {
    console.error("Webhook: invalid milestoneId", milestoneIdStr);
    return NextResponse.json({ received: true });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  try {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { payment: true },
    });

    if (!milestone) {
      console.error("Webhook: milestone not found", milestoneId);
      return NextResponse.json({ received: true });
    }

    if (milestone.status !== "PENDING") {
      return NextResponse.json({ received: true });
    }

    if (milestone.payment) {
      return NextResponse.json({ received: true });
    }

    const amountPaid = session.amount_total ?? milestone.amount * 100;
    const amountInDollars = Math.round(amountPaid / 100);
    const platformFee = getPlatformFeeAmount(amountInDollars);

    await prisma.payment.create({
      data: {
        milestoneId: milestone.id,
        amount: amountInDollars,
        platformFee,
        stripeIntentId: session.payment_intent
          ? String(session.payment_intent)
          : session.id,
        status: "HELD",
      },
    });

    await prisma.milestone.update({
      where: { id: milestone.id },
      data: { status: "FUNDED" },
    });
  } catch (err) {
    console.error("Webhook: error creating payment/milestone", err);
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { getPlatformFeeAmount } from "@/lib/platformFee";
import { sendEmail } from "@/lib/email";
import { templateMilestoneFunded } from "@/lib/emailTemplates";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * POST /api/client/milestones/fund/confirm
 * After client confirms payment in-app, verify PaymentIntent with Stripe and create Payment (HELD) + set milestone to FUNDED.
 * Body: { paymentIntentId }
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
  const paymentIntentId =
    typeof body.paymentIntentId === "string"
      ? body.paymentIntentId.trim()
      : "";

  if (!paymentIntentId) {
    return NextResponse.json(
      { error: "paymentIntentId is required" },
      { status: 400 }
    );
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Payment has not succeeded yet" },
        { status: 400 }
      );
    }

    const milestoneIdStr = paymentIntent.metadata?.milestoneId;
    if (!milestoneIdStr) {
      return NextResponse.json(
        { error: "Invalid payment intent metadata" },
        { status: 400 }
      );
    }

    const milestoneId = parseInt(milestoneIdStr, 10);
    if (Number.isNaN(milestoneId) || milestoneId < 1) {
      return NextResponse.json(
        { error: "Invalid milestone in payment" },
        { status: 400 }
      );
    }

    if (paymentIntent.metadata?.clientId !== String(clientId)) {
      return NextResponse.json(
        { error: "Not authorized for this payment" },
        { status: 403 }
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
        { error: "Not authorized to confirm this milestone" },
        { status: 403 }
      );
    }

    if (milestone.payment) {
      return NextResponse.json({
        success: true,
        message: "Already confirmed",
      });
    }

    const amountPaid = paymentIntent.amount_received ?? paymentIntent.amount;
    const amountInDollars = Math.round(Number(amountPaid) / 100);
    const platformFee = getPlatformFeeAmount(amountInDollars);

    await prisma.payment.create({
      data: {
        milestoneId: milestone.id,
        amount: amountInDollars,
        platformFee,
        stripeIntentId: paymentIntent.id,
        status: "HELD",
      },
    });

    await prisma.milestone.update({
      where: { id: milestone.id },
      data: { status: "FUNDED" },
    });

    const updated = await prisma.milestone.findUnique({
      where: { id: milestone.id },
      include: { payment: true },
    });

    if (milestone.contract.freelancer?.email) {
      const { subject, html } = templateMilestoneFunded({
        freelancerFirstName: milestone.contract.freelancer.firstName,
        jobTitle: milestone.contract.job.title,
        milestoneTitle: milestone.title,
        amount: milestone.amount,
      });
      sendEmail({
        to: milestone.contract.freelancer.email,
        subject,
        html,
      }).catch((e) => console.error("[Fund confirm] Email failed:", e));
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Fund confirm error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Confirmation failed" },
      { status: 500 }
    );
  }
}

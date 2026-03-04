import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/**
 * POST /api/reviews
 * Create a review from a client for a freelancer on a specific contract.
 *
 * Body: { contractId: number; rating: number; comment?: string }
 */
export async function POST(req: Request) {
  const authResult = await requireAuth(req);
  if (authResult.error) return authResult.error;

  const { contractId, rating, comment } = await req.json();

  const parsedContractId = parseInt(String(contractId), 10);
  if (Number.isNaN(parsedContractId) || parsedContractId < 1) {
    return NextResponse.json(
      { error: "Invalid contract id" },
      { status: 400 }
    );
  }

  const parsedRating = parseInt(String(rating), 10);
  if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 }
    );
  }

  const reviewerId = parseInt(String(authResult.userId), 10);
  if (Number.isNaN(reviewerId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  // Ensure this contract belongs to the authenticated client
  const contract = await prisma.contract.findFirst({
    where: {
      id: parsedContractId,
      clientId: reviewerId,
    },
    select: {
      id: true,
      freelancerId: true,
    },
  });

  if (!contract) {
    return NextResponse.json(
      { error: "Contract not found for this client" },
      { status: 404 }
    );
  }

  // Prevent duplicate reviews from the same client on the same contract
  const existing = await prisma.review.findFirst({
    where: {
      contractId: parsedContractId,
      reviewerId,
    },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      { error: "You have already left a review for this contract" },
      { status: 400 }
    );
  }

  const review = await prisma.review.create({
    data: {
      rating: parsedRating,
      comment: comment ? String(comment) : null,
      contractId: parsedContractId,
      reviewerId,
      revieweeId: contract.freelancerId,
    },
  });

  return NextResponse.json(review);
}

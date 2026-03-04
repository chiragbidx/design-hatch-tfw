import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { getSignedFileUrl } from "@/lib/storage";

/**
 * GET /api/client/freelancers/[id]
 * Returns a single freelancer's profile (for client to view and invite),
 * including basic review stats.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(req);
  if (authResult.error) {
    return authResult.error;
  }

  const { id } = await params;
  const freelancerId = parseInt(id, 10);
  if (Number.isNaN(freelancerId) || freelancerId < 1) {
    return NextResponse.json(
      { error: "Invalid freelancer id" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({
    where: { id: freelancerId, role: "FREELANCER" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      location: true,
      profile: {
        select: {
          id: true,
          bio: true,
          hourlyRate: true,
          experienceStat: true,
          completedJobs: true,
          jobSuccess: true,
          availability: true,
          timezone: true,
          responseTime: true,
          avatarUrl: true,
          skills: { select: { name: true } },
          experience: {
            select: {
              id: true,
              title: true,
              org: true,
              period: true,
              details: true,
            },
          },
          portfolio: {
            select: {
              id: true,
              title: true,
              link: true,
              role: true,
              result: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Freelancer not found" },
      { status: 404 }
    );
  }

  // Reviews for this freelancer
  const reviews = await prisma.review.findMany({
    where: { revieweeId: freelancerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      reviewer: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      contract: {
        select: {
          job: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount === 0
      ? null
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

  let avatarUrl: string | null = null;
  if (user.profile?.avatarUrl) {
    try {
      avatarUrl = await getSignedFileUrl(user.profile.avatarUrl);
    } catch {
      // ignore
    }
  }

  return NextResponse.json({
    ...user,
    avatarUrl,
    averageRating,
    reviewCount,
    reviews,
  });
}

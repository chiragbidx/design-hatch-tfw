import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireAuth } from "../../../../lib/requireAuth";
import { getSignedFileUrl } from "../../../../lib/storage";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) {
      return auth.error;
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId as any },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: auth.userId as any },
      include: {
        skills: true,
        experience: true,
        portfolio: true,
      },
    });

    let signedAvatarUrl = null;
    if (profile?.avatarUrl) {
      signedAvatarUrl = await getSignedFileUrl(profile.avatarUrl);
    }

    // Fetch reviews received by this freelancer
    const reviews = await prisma.review.findMany({
      where: { revieweeId: user.id },
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

    return NextResponse.json({
      user,
      profile,
      avatarUrl: signedAvatarUrl,
      reviews,
      averageRating,
      reviewCount,
    });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) {
      return auth.error;
    }

    const body = await req.json();
    const { section, data } = body;

    // Ensure profile exists
    let profile = await prisma.profile.findUnique({
      where: { userId: auth.userId as any },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: { userId: auth.userId as any },
      });
    }

    // Handle different sections
    if (section === "about") {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { bio: data.description },
      });
    } 
    
    else if (section === "skills") {
      // 1. Clear existing skills for this profile
      await prisma.userSkill.deleteMany({
        where: { profileId: profile.id },
      });

      // 2. Create new skills
      if (data.skills && data.skills.length > 0) {
        await prisma.userSkill.createMany({
          data: (data.skills as string[]).map((skillName) => ({
            profileId: profile.id,
            name: skillName,
          })),
        });
      }
    } 
    
    else if (section === "experience") {
      // Replace all experience items
      await prisma.experience.deleteMany({
        where: { profileId: profile.id },
      });

      if (data.items && data.items.length > 0) {
        await prisma.experience.createMany({
          data: data.items.map((item: any) => ({
            profileId: profile.id,
            title: item.title,
            org: item.org,
            period: item.period,
            details: item.details,
          })),
        });
      }
    } 
    
    else if (section === "rate") {
      // Parse rate string "$45 / hour" -> 45
      const rateInt = parseInt(data.hourlyRate.replace(/[^0-9]/g, "")) || 0;
      
      await prisma.profile.update({
        where: { id: profile.id },
        data: {
          hourlyRate: rateInt,
          availability: data.availability,
          timezone: data.timezone,
          responseTime: data.responseTime,
        },
      });
    } 
    
    else if (section === "portfolio") {
      // Replace all portfolio items
      await prisma.portfolioItem.deleteMany({
        where: { profileId: profile.id },
      });

      if (data.items && data.items.length > 0) {
        await prisma.portfolioItem.createMany({
          data: data.items.map((item: any) => ({
            profileId: profile.id,
            title: item.title,
            role: item.role,
            result: item.result,
          })),
        });
      }
    }
    
    else if (section === "avatar") {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { avatarUrl: data.avatarUrl },
      });
    }

    else if (section === "stats") {
      await prisma.profile.update({
        where: { id: profile.id },
        data: {
          experienceStat: data.experience,
          completedJobs: data.jobs,
          jobSuccess: data.success,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

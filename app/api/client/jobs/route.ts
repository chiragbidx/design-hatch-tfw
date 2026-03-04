import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function POST(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.error) {
      return authResult.error;
    }
    const { title, description, budget, experienceLevel, skills } =
      await req.json();
    if (!experienceLevel) {
      return NextResponse.json(
        { error: "Experience level is required" },
        { status: 400 }
      );
    }
    const dataForDb = {
      title,
      description,
      budget,
      experienceLevel: experienceLevel.toUpperCase(),
      requiredSkills: Array.isArray(skills)
        ? skills
        : skills
        ? skills.split(",").map((s: string) => s.trim())
        : [],
      clientId: parseInt(authResult.userId),
    };
    console.log("Creating job with data:", dataForDb);
    try {
      const job = await prisma.job.create({
        data: dataForDb,
      });
      return NextResponse.json(job);
    } catch (dbError) {
      console.error("Prisma error:", dbError);
      return NextResponse.json(
        { error: "Unable to save job to database" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("General error:", error);
    return NextResponse.json(
      { error: "Unable to create job" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const jobs = await prisma.job.findMany({
    where: { status: "OPEN" },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(jobs);
}

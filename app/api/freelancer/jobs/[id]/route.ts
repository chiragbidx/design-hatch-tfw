import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET – single job by id for freelancer view (public job detail) */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const jobId = parseInt(id, 10);
  if (Number.isNaN(jobId) || jobId < 1) {
    return NextResponse.json({ error: "Invalid job id" }, { status: 400 });
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId, status: "OPEN" },
    include: {
      client: {
        include: {
          profile: {
            select: { jobsPosted: true, hireRate: true },
          },
        },
      },
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const formatted = {
    id: String(job.id),
    title: job.title,
    description: job.description,
    category: job.category ?? "Uncategorized",
    budget: job.budget,
    budgetType: job.budgetType.toLowerCase() as "fixed" | "hourly",
    experienceLevel: job.experienceLevel.toLowerCase() as "entry" | "intermediate" | "expert",
    skills: job.requiredSkills,
    createdAt: job.createdAt.toISOString(),
    client: {
      name: [job.client.firstName, job.client.lastName].filter(Boolean).join(" ") || "Client",
      location: job.client.location ?? "",
      jobsPosted: job.client.profile?.jobsPosted ?? 0,
      hireRate: job.client.profile?.hireRate ?? 0,
    },
  };

  return NextResponse.json(formatted);
}

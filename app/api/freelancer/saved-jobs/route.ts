import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

type JobType = "FIXED" | "HOURLY";
type ExperienceLevel = "ENTRY" | "INTERMEDIATE" | "EXPERT";

/** Map DB job + client to the shape expected by JobCard (id as string, budgetType/experienceLevel as lowercase) */
function mapJobToCard(job: {
  id: number;
  title: string;
  description: string;
  category: string | null;
  budget: number;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  requiredSkills: string[];
  createdAt: Date;
  client: {
    id: number;
    firstName: string;
    lastName: string;
    location: string | null;
    profile: { jobsPosted: number | null; hireRate: number | null } | null;
  };
}) {
  return {
    id: String(job.id),
    title: job.title,
    description: job.description,
    category: job.category ?? "Uncategorized",
    budget: job.budget,
    budgetType: job.jobType === "FIXED" ? "fixed" as const : "hourly" as const,
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
}

/** GET – list saved jobs for the current freelancer */
export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if ("error" in auth) return auth.error;
  const { userId: rawUserId } = auth;
  const userId = typeof rawUserId === "string" ? parseInt(rawUserId, 10) : rawUserId;
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  if (prisma.savedJob) {
    const saved = await prisma.savedJob.findMany({
      where: { freelancerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          include: {
            client: {
              include: {
                profile: {
                  select: { jobsPosted: true, hireRate: true },
                },
              },
            },
          },
        },
      },
    });
    const jobs = saved.map((s) => mapJobToCard(s.job as unknown as Parameters<typeof mapJobToCard>[0]));
    return NextResponse.json({ savedJobs: jobs });
  }

  const rows = await prisma.$queryRaw<{ jobId: number }[]>`
    SELECT "jobId" FROM "SavedJob" WHERE "freelancerId" = ${userId} ORDER BY "createdAt" DESC
  `;
  const jobIds = rows.map((r) => r.jobId);
  if (jobIds.length === 0) return NextResponse.json({ savedJobs: [] });

  const jobsFromDb = await prisma.job.findMany({
    where: { id: { in: jobIds }, status: "OPEN" },
    include: {
      client: {
        include: {
          profile: { select: { jobsPosted: true, hireRate: true } },
        },
      },
    },
  });
  const orderMap = new Map(jobIds.map((id, i) => [id, i]));
  const sorted = [...jobsFromDb].sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
  const jobs = sorted.map((job) => mapJobToCard(job as unknown as Parameters<typeof mapJobToCard>[0]));
  return NextResponse.json({ savedJobs: jobs });
}

/** POST – save a job (body: { jobId: number }) */
export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if ("error" in auth) return auth.error;
  const { userId: rawUserId } = auth;
  const userId = typeof rawUserId === "string" ? parseInt(rawUserId, 10) : rawUserId;
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  let body: { jobId?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const jobId = typeof body.jobId === "number" ? body.jobId : parseInt(String(body.jobId ?? ""), 10);
  if (Number.isNaN(jobId) || jobId < 1) {
    return NextResponse.json({ error: "jobId is required and must be a positive number" }, { status: 400 });
  }

  const jobExists = await prisma.job.findUnique({ where: { id: jobId }, select: { id: true } });
  if (!jobExists) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (prisma.savedJob) {
    try {
      await prisma.savedJob.create({
        data: { freelancerId: userId, jobId },
      });
    } catch (e: unknown) {
      const isUniqueViolation = e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002";
      if (isUniqueViolation) {
        return NextResponse.json({ saved: true, message: "Already saved" });
      }
      throw e;
    }
  } else {
    try {
      await prisma.$executeRaw`
        INSERT INTO "SavedJob" ("freelancerId", "jobId")
        VALUES (${userId}, ${jobId})
        ON CONFLICT ("freelancerId", "jobId") DO NOTHING
      `;
    } catch (e) {
      console.error("SavedJob raw insert error:", e);
      return NextResponse.json({ error: "Could not save job" }, { status: 500 });
    }
  }

  return NextResponse.json({ saved: true });
}

/** DELETE – unsave a job (query: ?jobId=123 or body: { jobId: number }) */
export async function DELETE(req: Request) {
  const auth = await requireAuth(req);
  if ("error" in auth) return auth.error;
  const { userId: rawUserId } = auth;
  const userId = typeof rawUserId === "string" ? parseInt(rawUserId, 10) : rawUserId;
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  const url = new URL(req.url);
  let jobId: number;
  const queryJobId = url.searchParams.get("jobId");
  if (queryJobId != null && queryJobId !== "") {
    jobId = parseInt(queryJobId, 10);
  } else {
    try {
      const body = await req.json().catch(() => ({}));
      const id = body.jobId ?? body.id;
      jobId = typeof id === "number" ? id : parseInt(String(id ?? ""), 10);
    } catch {
      return NextResponse.json({ error: "jobId required (query or body)" }, { status: 400 });
    }
  }

  if (Number.isNaN(jobId) || jobId < 1) {
    return NextResponse.json({ error: "jobId must be a positive number" }, { status: 400 });
  }

  if (prisma.savedJob) {
    await prisma.savedJob.deleteMany({
      where: { freelancerId: userId, jobId },
    });
  } else {
    await prisma.$executeRaw`
      DELETE FROM "SavedJob" WHERE "freelancerId" = ${userId} AND "jobId" = ${jobId}
    `;
  }

  return NextResponse.json({ unsaved: true });
}

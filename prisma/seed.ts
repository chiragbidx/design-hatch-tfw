
import { PrismaClient, UserRole, JobType, ExperienceLevel, JobStatus } from '@prisma/client';

const prisma = new PrismaClient();

const jobs = [
  {
    id: "1",
    title: "PandaWork-style landing page for SaaS",
    description:
      "Looking for a frontend developer to build a high-converting landing page inspired by PandaWork and Upwork. Must be fast, responsive and clean.",
    category: "Web Development",
    budget: 1200,
    budgetType: "FIXED",
    experienceLevel: "INTERMEDIATE",
    skills: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    createdAt: "2025-01-28T10:00:00.000Z",
  },
  {
    id: "2",
    title: "Dashboard UI for analytics product",
    description:
      "Need a clean, modern dashboard UI with charts, tables and filters. Figma design is ready, just need pixel-perfect implementation.",
    category: "Web Development",
    budget: 45,
    budgetType: "HOURLY",
    experienceLevel: "EXPERT",
    skills: ["React", "TypeScript", "Tailwind CSS"],
    createdAt: "2025-01-27T16:00:00.000Z",
  },
  {
    id: "3",
    title: "AI assistant MVP for customer support",
    description:
      "Build an MVP of an AI assistant for handling common support questions. We have OpenAI keys and basic flows; need someone to wire UI + API.",
    category: "AI & Data",
    budget: 2500,
    budgetType: "FIXED",
    experienceLevel: "EXPERT",
    skills: ["Node.js", "OpenAI", "Next.js"],
    createdAt: "2025-01-26T09:30:00.000Z",
  },
  {
    id: "4",
    title: "Visual refresh for existing marketing site",
    description:
      "We have an existing marketing site and need a fresh, more premium feel. Prefer designers who can also implement in React or Next.js.",
    category: "Design & Creative",
    budget: 900,
    budgetType: "FIXED",
    experienceLevel: "INTERMEDIATE",
    skills: ["Figma", "UI Design", "Branding"],
    createdAt: "2025-01-23T14:15:00.000Z",
  },
];

async function main() {
  await prisma.user.deleteMany();

  const clientUser = await prisma.user.create({
    data: {
      email: 'client@example.com',
      username: 'clientuser',
      password: 'password', // In a real app, hash this password
      firstName: 'Client',
      lastName: 'User',
      location: 'USA',
      role: UserRole.CLIENT,
      profile: {
        create: {
          hireRate: 90,
          jobsPosted: 4,
        },
      },
    },
  });

  for (const job of jobs) {
    await prisma.job.create({
      data: {
        title: job.title,
        description: job.description,
        category: job.category,
        budget: job.budget,
        budgetType: job.budgetType as JobType,
        experienceLevel: job.experienceLevel as ExperienceLevel,
        requiredSkills: job.skills,
        status: JobStatus.OPEN,
        createdAt: new Date(job.createdAt),
        clientId: clientUser.id,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

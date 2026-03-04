export type BudgetType = "fixed" | "hourly";

export type ExperienceLevel = "entry" | "intermediate" | "expert";

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  budgetType: BudgetType;
  experienceLevel: ExperienceLevel;
  skills: string[];
  createdAt: string;
  client: {
    name: string;
    location: string;
    jobsPosted: number;
    hireRate: number;
  };
}

export const jobs: Job[] = [
  {
    id: "1",
    title: "PandaWork-style landing page for SaaS",
    description:
      "Looking for a frontend developer to build a high-converting landing page inspired by PandaWork and Upwork. Must be fast, responsive and clean.",
    category: "Web Development",
    budget: 1200,
    budgetType: "fixed",
    experienceLevel: "intermediate",
    skills: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    createdAt: "2025-01-28T10:00:00.000Z",
    client: {
      name: "SaaS Studio",
      location: "USA",
      jobsPosted: 18,
      hireRate: 92,
    },
  },
  {
    id: "2",
    title: "Dashboard UI for analytics product",
    description:
      "Need a clean, modern dashboard UI with charts, tables and filters. Figma design is ready, just need pixel-perfect implementation.",
    category: "Web Development",
    budget: 45,
    budgetType: "hourly",
    experienceLevel: "expert",
    skills: ["React", "TypeScript", "Tailwind CSS"],
    createdAt: "2025-01-27T16:00:00.000Z",
    client: {
      name: "Growth Analytics",
      location: "UK",
      jobsPosted: 32,
      hireRate: 88,
    },
  },
  {
    id: "3",
    title: "AI assistant MVP for customer support",
    description:
      "Build an MVP of an AI assistant for handling common support questions. We have OpenAI keys and basic flows; need someone to wire UI + API.",
    category: "AI & Data",
    budget: 2500,
    budgetType: "fixed",
    experienceLevel: "expert",
    skills: ["Node.js", "OpenAI", "Next.js"],
    createdAt: "2025-01-26T09:30:00.000Z",
    client: {
      name: "SupportFlow",
      location: "Remote",
      jobsPosted: 5,
      hireRate: 100,
    },
  },
  {
    id: "4",
    title: "Visual refresh for existing marketing site",
    description:
      "We have an existing marketing site and need a fresh, more premium feel. Prefer designers who can also implement in React or Next.js.",
    category: "Design & Creative",
    budget: 900,
    budgetType: "fixed",
    experienceLevel: "intermediate",
    skills: ["Figma", "UI Design", "Branding"],
    createdAt: "2025-01-23T14:15:00.000Z",
    client: {
      name: "Brand Lift Co.",
      location: "India",
      jobsPosted: 12,
      hireRate: 85,
    },
  },
  {
    id: "12",
    title: "Develop a RESTful API for a mobile app",
    description:
      "We are looking for a backend developer to create a RESTful API for our new mobile application. The API will handle user authentication, data storage, and other core functionalities.",
    category: "Web Development",
    budget: 70,
    budgetType: "hourly",
    experienceLevel: "expert",
    skills: ["Node.js", "Express", "MongoDB", "JWT"],
    createdAt: "2025-01-29T11:00:00.000Z",
    client: {
      name: "MobileFirst Solutions",
      location: "Canada",
      jobsPosted: 8,
      hireRate: 95,
    },
  },
];

export function formatJobDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getUTCMonth()] ?? "";
  const day = date.getUTCDate();
  return `${month} ${day}`;
}

export function getJobById(id: string): Job | undefined {
  return jobs.find((job) => job.id === id);
}


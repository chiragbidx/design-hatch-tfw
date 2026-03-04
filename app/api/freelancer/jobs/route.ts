
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'
export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        status: 'OPEN',
      },
      include: {
        client: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    const formattedJobs = jobs.map((job) => ({
      id: job.id.toString(),
      title: job.title,
      description: job.description,
      budget: job.budget,
      budgetType: job.budgetType.toLowerCase(),
      experienceLevel: job.experienceLevel.toLowerCase(),
      skills: job.requiredSkills,
      createdAt: job.createdAt.toISOString(),
      category: job.category,
      client: {
        name: `${job.client.firstName} ${job.client.lastName}`,
        location: job.client.location,
        jobsPosted: job.client.profile?.jobsPosted,
        hireRate: job.client.profile?.hireRate, 
      },
    }));
    return NextResponse.json(formattedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Unable to fetch jobs' }, { status: 500 });
  }
}

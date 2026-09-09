import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'RECRUITER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized: Recruiter access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {
      OR: [
        { recruiterId: user.id },
        user.companyId ? { companyId: user.companyId } : {},
      ],
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        company: true,
        skills: true,
        _count: {
          select: {
            applications: true,
            savedJobs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error('Error fetching recruiter jobs:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch jobs' }, { status: 500 });
  }
}

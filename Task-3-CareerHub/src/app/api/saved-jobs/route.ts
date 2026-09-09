import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized: Candidate access required' }, { status: 401 });
    }

    const savedJobs = await prisma.savedJob.findMany({
      where: { candidateId: user.id },
      include: {
        job: {
          include: {
            company: true,
            skills: true,
            _count: {
              select: {
                applications: true,
              },
            },
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });

    return NextResponse.json({ savedJobs });
  } catch (error: any) {
    console.error('Error fetching saved jobs:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch saved jobs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized: Only candidates can bookmark jobs' }, { status: 403 });
    }

    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const saved = await prisma.savedJob.upsert({
      where: {
        candidateId_jobId: {
          candidateId: user.id,
          jobId,
        },
      },
      update: {},
      create: {
        candidateId: user.id,
        jobId,
      },
    });

    return NextResponse.json({ message: 'Job saved successfully', saved }, { status: 201 });
  } catch (error: any) {
    console.error('Error saving job:', error);
    return NextResponse.json({ error: error.message || 'Failed to save job' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let jobId = searchParams.get('jobId');

    if (!jobId) {
      try {
        const body = await req.json();
        jobId = body.jobId;
      } catch {}
    }

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    await prisma.savedJob.deleteMany({
      where: {
        candidateId: user.id,
        jobId,
      },
    });

    return NextResponse.json({ message: 'Job removed from bookmarks' });
  } catch (error: any) {
    console.error('Error removing saved job:', error);
    return NextResponse.json({ error: error.message || 'Failed to remove saved job' }, { status: 500 });
  }
}

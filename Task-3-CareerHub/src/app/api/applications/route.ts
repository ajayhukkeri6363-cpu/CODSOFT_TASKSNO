import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please sign in' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');

    let where: any = {};

    if (user.role === 'CANDIDATE') {
      where.candidateId = user.id;
    } else if (user.role === 'RECRUITER') {
      // Find jobs posted by this recruiter or recruiter's company
      where.job = {
        OR: [
          { recruiterId: user.id },
          user.companyId ? { companyId: user.companyId } : {},
        ],
      };
      if (jobId) {
        where.jobId = jobId;
      }
    } else if (user.role === 'ADMIN') {
      if (jobId) where.jobId = jobId;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        job: {
          include: {
            company: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            candidateProfile: true,
          },
        },
        resume: true,
        interview: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ applications });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Forbidden: Only candidates can apply for jobs' }, { status: 403 });
    }

    const body = await req.json();
    const { jobId, resumeId, coverLetter } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Verify job existence & status
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job listing not found' }, { status: 404 });
    }

    if (job.status === 'CLOSED') {
      return NextResponse.json({ error: 'This job posting has been closed by the recruiter' }, { status: 400 });
    }

    // Anti-duplicate application validation
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId: user.id,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Duplicate Application: You have already applied for this job listing.' },
        { status: 409 }
      );
    }

    // If resumeId was not provided, look for candidate's default resume
    let finalResumeId = resumeId;
    if (!finalResumeId) {
      const defaultResume = await prisma.resume.findFirst({
        where: { candidateId: user.id },
        orderBy: [{ isDefault: 'desc' }, { uploadedAt: 'desc' }],
      });
      finalResumeId = defaultResume?.id;
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId: user.id,
        resumeId: finalResumeId || null,
        coverLetter: coverLetter ? coverLetter.trim() : null,
        status: 'APPLIED',
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        resume: true,
      },
    });

    // Create notification for recruiter
    try {
      await prisma.notification.create({
        data: {
          userId: job.recruiterId,
          title: 'New Applicant Received',
          message: `${user.name} submitted an application for ${job.title}`,
          type: 'APPLICATION_UPDATE',
          link: `/recruiter/applications?jobId=${job.id}`,
        },
      });
    } catch {}

    return NextResponse.json(
      { message: 'Application submitted successfully', application },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error submitting application:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit application' }, { status: 500 });
  }
}

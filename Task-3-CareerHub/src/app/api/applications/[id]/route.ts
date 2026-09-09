import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const VALID_STATUSES = [
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'SELECTED',
  'REJECTED',
  'WITHDRAWN',
];

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    const application = await prisma.application.findUnique({
      where: { id },
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
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Access control: Candidate can view own, Recruiter can view for own jobs, Admin can view all
    if (
      user.role === 'CANDIDATE' &&
      application.candidateId !== user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (
      user.role === 'RECRUITER' &&
      application.job.recruiterId !== user.id &&
      application.job.companyId !== user.companyId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ application });
  } catch (error: any) {
    console.error('Error fetching application:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch application' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const body = await req.json();
    const { status, recruiterNotes, rating } = body;

    // Candidate withdrawing their application
    if (user.role === 'CANDIDATE') {
      if (existing.candidateId !== user.id) {
        return NextResponse.json({ error: 'Forbidden: You can only manage your own applications' }, { status: 403 });
      }

      if (status !== 'WITHDRAWN') {
        return NextResponse.json({ error: 'Candidates can only withdraw applications' }, { status: 403 });
      }

      const updated = await prisma.application.update({
        where: { id },
        data: { status: 'WITHDRAWN' },
      });

      return NextResponse.json({ message: 'Application withdrawn', application: updated });
    }

    // Recruiter or Admin managing application
    if (user.role === 'RECRUITER' && existing.job.recruiterId !== user.id && existing.job.companyId !== user.companyId) {
      return NextResponse.json({ error: 'Forbidden: You do not manage this job application' }, { status: 403 });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid application status: ${status}` }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (recruiterNotes !== undefined) updateData.recruiterNotes = recruiterNotes;
    if (rating !== undefined) updateData.rating = rating;

    const updated = await prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        job: {
          include: { company: true },
        },
        candidate: {
          select: { id: true, name: true, email: true },
        },
        resume: true,
        interview: true,
      },
    });

    // Notify candidate if status changed
    if (status && status !== existing.status) {
      try {
        await prisma.notification.create({
          data: {
            userId: existing.candidateId,
            title: `Application Status Updated: ${status.replace('_', ' ')}`,
            message: `Your application status for ${existing.job.title} was updated to ${status.replace('_', ' ')}.`,
            type: 'APPLICATION_UPDATE',
            link: '/candidate/applications',
          },
        });
      } catch {}
    }

    return NextResponse.json({ message: 'Application updated successfully', application: updated });
  } catch (error: any) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: error.message || 'Failed to update application' }, { status: 500 });
  }
}

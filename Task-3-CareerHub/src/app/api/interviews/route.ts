import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let where: any = {};

    if (user.role === 'CANDIDATE') {
      where.application = { candidateId: user.id };
    } else if (user.role === 'RECRUITER') {
      where.application = {
        job: {
          OR: [
            { recruiterId: user.id },
            user.companyId ? { companyId: user.companyId } : {},
          ],
        },
      };
    }

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        application: {
          include: {
            job: {
              include: { company: true },
            },
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    return NextResponse.json({ interviews });
  } catch (error: any) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch interviews' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'RECRUITER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized: Recruiter access required' }, { status: 403 });
    }

    const body = await req.json();
    const { applicationId, scheduledDate, timeSlot, meetingUrl, meetingType = 'TECHNICAL', notes } = body;

    if (!applicationId || !scheduledDate || !timeSlot || !meetingUrl) {
      return NextResponse.json({ error: 'Application ID, date, time slot, and meeting URL are required' }, { status: 400 });
    }

    // Verify application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true, candidate: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Create or update interview
    const interview = await prisma.interview.upsert({
      where: { applicationId },
      update: {
        scheduledDate: new Date(scheduledDate),
        timeSlot,
        meetingUrl,
        meetingType,
        notes: notes || null,
        status: 'SCHEDULED',
      },
      create: {
        applicationId,
        scheduledDate: new Date(scheduledDate),
        timeSlot,
        meetingUrl,
        meetingType,
        notes: notes || null,
        status: 'SCHEDULED',
      },
    });

    // Update application stage to INTERVIEW
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'INTERVIEW' },
    });

    // Notify candidate
    try {
      await prisma.notification.create({
        data: {
          userId: application.candidateId,
          title: `Interview Scheduled: ${application.job.title}`,
          message: `Your interview has been scheduled for ${new Date(scheduledDate).toLocaleDateString()} at ${timeSlot}. Check your dashboard for the meeting link.`,
          type: 'INTERVIEW_SCHEDULED',
          link: '/candidate/applications',
        },
      });
    } catch {}

    return NextResponse.json({ message: 'Interview scheduled successfully', interview }, { status: 201 });
  } catch (error: any) {
    console.error('Error scheduling interview:', error);
    return NextResponse.json({ error: error.message || 'Failed to schedule interview' }, { status: 500 });
  }
}

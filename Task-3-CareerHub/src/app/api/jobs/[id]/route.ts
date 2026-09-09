import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Check if queried by id or slug
    const job = await prisma.job.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        company: true,
        skills: true,
        recruiter: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            applications: true,
            savedJobs: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job listing not found' }, { status: 404 });
    }

    // Increment view count asynchronously
    try {
      await prisma.job.update({
        where: { id: job.id },
        data: { viewsCount: { increment: 1 } },
      });
    } catch {}

    // Find similar jobs in the same category
    const similarJobs = await prisma.job.findMany({
      where: {
        category: job.category,
        id: { not: job.id },
        status: 'PUBLISHED',
      },
      include: {
        company: true,
        skills: true,
      },
      take: 3,
    });

    return NextResponse.json({ job, similarJobs });
  } catch (error: any) {
    console.error('Error fetching job details:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch job' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'RECRUITER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const existingJob = await prisma.job.findUnique({
      where: { id },
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && existingJob.recruiterId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You can only edit your own jobs' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      responsibilities,
      requirements,
      benefits,
      jobType,
      experienceLevel,
      remoteStatus,
      location,
      salaryMin,
      salaryMax,
      salaryCurrency,
      category,
      status,
      deadline,
      isFeatured,
      skills,
    } = body;

    // Update job
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingJob.title,
        description: description !== undefined ? description : existingJob.description,
        responsibilities: responsibilities !== undefined ? responsibilities : existingJob.responsibilities,
        requirements: requirements !== undefined ? requirements : existingJob.requirements,
        benefits: benefits !== undefined ? benefits : existingJob.benefits,
        jobType: jobType !== undefined ? jobType : existingJob.jobType,
        experienceLevel: experienceLevel !== undefined ? experienceLevel : existingJob.experienceLevel,
        remoteStatus: remoteStatus !== undefined ? remoteStatus : existingJob.remoteStatus,
        location: location !== undefined ? location : existingJob.location,
        salaryMin: salaryMin !== undefined ? parseFloat(salaryMin) : existingJob.salaryMin,
        salaryMax: salaryMax !== undefined ? parseFloat(salaryMax) : existingJob.salaryMax,
        salaryCurrency: salaryCurrency !== undefined ? salaryCurrency : existingJob.salaryCurrency,
        category: category !== undefined ? category : existingJob.category,
        status: status !== undefined ? status : existingJob.status,
        deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : existingJob.deadline,
        isFeatured: isFeatured !== undefined ? isFeatured : existingJob.isFeatured,
      },
      include: {
        company: true,
        skills: true,
      },
    });

    // Update skills if provided
    if (Array.isArray(skills)) {
      await prisma.jobSkill.deleteMany({ where: { jobId: id } });
      if (skills.length > 0) {
        await prisma.jobSkill.createMany({
          data: skills.map((s: string) => ({ jobId: id, skillName: s.trim() })),
        });
      }
    }

    return NextResponse.json({ message: 'Job updated successfully', job: updatedJob });
  } catch (error: any) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: error.message || 'Failed to update job' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'RECRUITER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const existingJob = await prisma.job.findUnique({
      where: { id },
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && existingJob.recruiterId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.job.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete job' }, { status: 500 });
  }
}

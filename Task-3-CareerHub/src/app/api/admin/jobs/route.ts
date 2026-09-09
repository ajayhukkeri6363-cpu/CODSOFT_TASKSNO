import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { company: { name: { contains: search } } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        company: true,
        recruiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
    console.error('Error fetching admin jobs:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { jobId, status, isFeatured } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

    const job = await prisma.job.update({
      where: { id: jobId },
      data: updateData,
      include: { company: true },
    });

    return NextResponse.json({ message: 'Job status updated', job });
  } catch (error: any) {
    console.error('Error updating admin job:', error);
    return NextResponse.json({ error: error.message || 'Failed to update job' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('id');

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    await prisma.job.delete({
      where: { id: jobId },
    });

    return NextResponse.json({ message: 'Job removed from platform' });
  } catch (error: any) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete job' }, { status: 500 });
  }
}

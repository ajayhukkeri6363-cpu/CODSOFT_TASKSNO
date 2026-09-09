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

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const applications = await prisma.application.findMany({
      where,
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
          },
        },
        resume: true,
        interview: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ applications });
  } catch (error: any) {
    console.error('Error fetching admin applications:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch applications' }, { status: 500 });
  }
}

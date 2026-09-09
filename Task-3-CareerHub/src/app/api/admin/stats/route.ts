import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const [
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalCompanies,
      totalJobs,
      activeJobs,
      totalApplications,
      selectedApplications,
      recentUsers,
      recentApplications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CANDIDATE' } }),
      prisma.user.count({ where: { role: 'RECRUITER' } }),
      prisma.company.count(),
      prisma.job.count(),
      prisma.job.count({ where: { status: 'PUBLISHED' } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'SELECTED' } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.application.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          job: { select: { title: true, company: { select: { name: true } } } },
          candidate: { select: { name: true, email: true } },
        },
      }),
    ]);

    const placementRate = totalApplications > 0 ? Math.round((selectedApplications / totalApplications) * 100) : 0;

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalCompanies,
        totalJobs,
        activeJobs,
        totalApplications,
        selectedApplications,
        placementRate,
      },
      recentUsers,
      recentApplications,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch admin stats' }, { status: 500 });
  }
}

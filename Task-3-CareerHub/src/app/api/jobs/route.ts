import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const location = searchParams.get('location')?.trim();
    const category = searchParams.get('category')?.trim();
    const jobType = searchParams.get('jobType')?.trim();
    const experienceLevel = searchParams.get('experienceLevel')?.trim();
    const remoteStatus = searchParams.get('remoteStatus')?.trim();
    const minSalary = searchParams.get('minSalary') ? parseFloat(searchParams.get('minSalary')!) : undefined;
    const skill = searchParams.get('skill')?.trim();
    const sort = searchParams.get('sort') || 'newest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '12')));
    const skip = (page - 1) * limit;

    // Filter by status (default to PUBLISHED)
    const statusParam = searchParams.get('status');
    const status = statusParam || 'PUBLISHED';

    const where: any = {};

    if (status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { company: { name: { contains: search } } },
      ];
    }

    if (location) {
      where.location = { contains: location };
    }

    if (category && category !== 'All' && category !== 'all') {
      where.category = { equals: category };
    }

    if (jobType && jobType !== 'ALL') {
      where.jobType = jobType;
    }

    if (experienceLevel && experienceLevel !== 'ALL') {
      where.experienceLevel = experienceLevel;
    }

    if (remoteStatus && remoteStatus !== 'ALL') {
      where.remoteStatus = remoteStatus;
    }

    if (minSalary) {
      where.salaryMax = { gte: minSalary };
    }

    if (skill) {
      where.skills = {
        some: {
          skillName: { contains: skill },
        },
      };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'salary') {
      orderBy = { salaryMax: 'desc' };
    } else if (sort === 'popular') {
      orderBy = { viewsCount: 'desc' };
    }

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
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
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'RECRUITER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized: Only recruiters can post jobs' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      responsibilities,
      requirements,
      benefits,
      jobType = 'FULL_TIME',
      experienceLevel = 'MID',
      remoteStatus = 'HYBRID',
      location = 'San Francisco, CA',
      salaryMin,
      salaryMax,
      salaryCurrency = 'USD',
      category = 'Engineering',
      status = 'PUBLISHED',
      deadline,
      skills = [],
      companyId: customCompanyId,
    } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Job title and description are required' }, { status: 400 });
    }

    // Get company ID
    let finalCompanyId = customCompanyId || user.companyId;
    if (!finalCompanyId) {
      const recruiterProfile = await prisma.recruiterProfile.findUnique({
        where: { userId: user.id },
      });
      finalCompanyId = recruiterProfile?.companyId;
    }

    if (!finalCompanyId) {
      return NextResponse.json({ error: 'Recruiter must be linked to a company before publishing jobs' }, { status: 400 });
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;

    const newJob = await prisma.job.create({
      data: {
        recruiterId: user.id,
        companyId: finalCompanyId,
        title: title.trim(),
        slug,
        description,
        responsibilities,
        requirements,
        benefits,
        jobType,
        experienceLevel,
        remoteStatus,
        location,
        salaryMin: salaryMin ? parseFloat(salaryMin) : null,
        salaryMax: salaryMax ? parseFloat(salaryMax) : null,
        salaryCurrency,
        category,
        status,
        deadline: deadline ? new Date(deadline) : null,
        skills: {
          create: Array.isArray(skills)
            ? skills.map((s: string) => ({ skillName: s.trim() }))
            : [],
        },
      },
      include: {
        company: true,
        skills: true,
      },
    });

    return NextResponse.json({ message: 'Job created successfully', job: newJob }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: error.message || 'Failed to create job' }, { status: 500 });
  }
}

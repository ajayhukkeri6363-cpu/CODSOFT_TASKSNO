import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'RECRUITER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized: Recruiter access required' }, { status: 403 });
    }

    let companyId = user.companyId;
    if (!companyId) {
      const recProfile = await prisma.recruiterProfile.findUnique({
        where: { userId: user.id },
      });
      companyId = recProfile?.companyId;
    }

    if (!companyId) {
      return NextResponse.json({ error: 'No associated company profile found' }, { status: 404 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            jobs: true,
            recruiters: true,
          },
        },
      },
    });

    return NextResponse.json({ company });
  } catch (error: any) {
    console.error('Error fetching company:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch company' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'RECRUITER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized: Recruiter access required' }, { status: 403 });
    }

    let companyId = user.companyId;
    if (!companyId) {
      const recProfile = await prisma.recruiterProfile.findUnique({
        where: { userId: user.id },
      });
      companyId = recProfile?.companyId;
    }

    if (!companyId) {
      return NextResponse.json({ error: 'No associated company profile found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, logo, website, description, industry, location, companySize, foundedYear } = body;

    const updated = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        logo: logo !== undefined ? logo : undefined,
        website: website !== undefined ? website : undefined,
        description: description !== undefined ? description : undefined,
        industry: industry !== undefined ? industry : undefined,
        location: location !== undefined ? location : undefined,
        companySize: companySize !== undefined ? companySize : undefined,
        foundedYear: foundedYear ? parseInt(foundedYear) : undefined,
      },
    });

    return NextResponse.json({ message: 'Company profile updated', company: updated });
  } catch (error: any) {
    console.error('Error updating company:', error);
    return NextResponse.json({ error: error.message || 'Failed to update company' }, { status: 500 });
  }
}

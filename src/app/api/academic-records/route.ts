import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const academicYear = searchParams.get('academicYear');

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (academicYear) where.academicYear = academicYear;

    if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: user.id } });
      if (student) where.studentId = student.id;
    }

    const records = await prisma.academicRecord.findMany({
      where,
      include: {
        student: {
          include: {
            user: true,
            class: true,
          },
        },
      },
      orderBy: [{ academicYear: 'desc' }, { gpa: 'desc' }],
    });

    return NextResponse.json({ records });
  } catch (error: any) {
    console.error('Fetch academic records error:', error);
    return NextResponse.json({ error: 'Failed to fetch academic records' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, academicYear, term, gpa, totalCredits = 20, rank, status = 'PROMOTED', remarks } = body;

    if (!studentId || !academicYear || !term || gpa === undefined) {
      return NextResponse.json({ error: 'Student, Academic Year, Term, and GPA are required' }, { status: 400 });
    }

    const record = await prisma.academicRecord.create({
      data: {
        studentId,
        academicYear,
        term,
        gpa: Number(gpa),
        totalCredits: Number(totalCredits),
        rank: rank ? Number(rank) : null,
        status,
        remarks,
      },
      include: {
        student: {
          include: {
            user: true,
            class: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error: any) {
    console.error('Create academic record error:', error);
    return NextResponse.json({ error: 'Failed to create academic record' }, { status: 500 });
  }
}

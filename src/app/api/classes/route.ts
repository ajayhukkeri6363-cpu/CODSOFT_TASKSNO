import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const classes = await prisma.class.findMany({
      include: {
        classTeacher: {
          include: {
            user: true,
          },
        },
        subjects: {
          include: {
            teacher: { include: { user: true } },
          },
        },
        _count: {
          select: { students: true, subjects: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ classes });
  } catch (error: any) {
    console.error('Fetch classes error:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, section, gradeLevel, roomNumber, capacity = 40, classTeacherId } = body;

    if (!name || !section || !gradeLevel) {
      return NextResponse.json({ error: 'Name, Section, and Grade Level are required' }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        section,
        gradeLevel,
        roomNumber,
        capacity: Number(capacity),
        classTeacherId: classTeacherId || null,
      },
      include: {
        classTeacher: { include: { user: true } },
      },
    });

    return NextResponse.json({ success: true, class: newClass }, { status: 201 });
  } catch (error: any) {
    console.error('Create class error:', error);
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
  }
}

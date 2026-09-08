import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const classData = await prisma.class.findUnique({
      where: { id: params.id },
      include: {
        classTeacher: { include: { user: true } },
        students: {
          include: { user: true },
          orderBy: { rollNumber: 'asc' },
        },
        subjects: {
          include: { teacher: { include: { user: true } } },
        },
      },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({ class: classData });
  } catch (error: any) {
    console.error('Fetch class details error:', error);
    return NextResponse.json({ error: 'Failed to fetch class details' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, section, gradeLevel, roomNumber, capacity, classTeacherId } = body;

    const updatedClass = await prisma.class.update({
      where: { id: params.id },
      data: {
        name: name || undefined,
        section: section || undefined,
        gradeLevel: gradeLevel || undefined,
        roomNumber: roomNumber || undefined,
        capacity: capacity ? Number(capacity) : undefined,
        classTeacherId: classTeacherId !== undefined ? classTeacherId : undefined,
      },
      include: {
        classTeacher: { include: { user: true } },
      },
    });

    return NextResponse.json({ success: true, class: updatedClass });
  } catch (error: any) {
    console.error('Update class error:', error);
    return NextResponse.json({ error: 'Failed to update class' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.class.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Class deleted successfully' });
  } catch (error: any) {
    console.error('Delete class error:', error);
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 });
  }
}

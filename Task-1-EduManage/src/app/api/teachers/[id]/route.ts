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

    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        managedClasses: {
          include: {
            students: { include: { user: true } },
          },
        },
        subjects: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({ teacher });
  } catch (error: any) {
    console.error('Fetch teacher error:', error);
    return NextResponse.json({ error: 'Failed to fetch teacher details' }, { status: 500 });
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
    const { name, employeeId, qualification, specialization, department, phone, address, avatar } = body;

    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: teacher.userId },
      data: {
        name: name || undefined,
        avatar: avatar || undefined,
        phone: phone || undefined,
      },
    });

    const updatedTeacher = await prisma.teacher.update({
      where: { id: params.id },
      data: {
        employeeId: employeeId || undefined,
        qualification: qualification || undefined,
        specialization: specialization || undefined,
        department: department || undefined,
        phone: phone || undefined,
        address: address || undefined,
      },
      include: {
        user: true,
        managedClasses: true,
        subjects: true,
      },
    });

    return NextResponse.json({ success: true, teacher: updatedTeacher });
  } catch (error: any) {
    console.error('Update teacher error:', error);
    return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 });
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

    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: teacher.userId },
    });

    return NextResponse.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error: any) {
    console.error('Delete teacher error:', error);
    return NextResponse.json({ error: 'Failed to delete teacher' }, { status: 500 });
  }
}

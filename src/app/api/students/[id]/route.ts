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

    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        class: {
          include: {
            classTeacher: { include: { user: true } },
            subjects: { include: { teacher: { include: { user: true } } } },
          },
        },
        attendances: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        results: {
          include: {
            subject: true,
            exam: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        fees: {
          orderBy: { dueDate: 'desc' },
        },
        academicRecords: {
          orderBy: { academicYear: 'desc' },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error: any) {
    console.error('Fetch student profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch student details' }, { status: 500 });
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
    const {
      name,
      rollNumber,
      admissionNumber,
      classId,
      gender,
      dateOfBirth,
      bloodGroup,
      address,
      parentName,
      parentPhone,
      parentEmail,
      avatar,
    } = body;

    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Update user record
    await prisma.user.update({
      where: { id: student.userId },
      data: {
        name: name || undefined,
        avatar: avatar || undefined,
        phone: parentPhone || undefined,
      },
    });

    // Update student record
    const updatedStudent = await prisma.student.update({
      where: { id: params.id },
      data: {
        rollNumber: rollNumber || undefined,
        admissionNumber: admissionNumber || undefined,
        classId: classId || undefined,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        bloodGroup: bloodGroup || undefined,
        address: address || undefined,
        parentName: parentName || undefined,
        parentPhone: parentPhone || undefined,
        parentEmail: parentEmail || undefined,
      },
      include: {
        user: true,
        class: true,
      },
    });

    return NextResponse.json({ success: true, student: updatedStudent });
  } catch (error: any) {
    console.error('Update student error:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
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

    const student = await prisma.student.findUnique({
      where: { id: params.id },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Deleting user cascades to student and related records
    await prisma.user.delete({
      where: { id: student.userId },
    });

    return NextResponse.json({ success: true, message: 'Student removed successfully' });
  } catch (error: any) {
    console.error('Delete student error:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}

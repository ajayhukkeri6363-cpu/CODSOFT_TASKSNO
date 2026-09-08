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
    const classId = searchParams.get('classId');
    const dateStr = searchParams.get('date');
    const studentId = searchParams.get('studentId');

    const where: any = {};

    if (classId) {
      where.classId = classId;
    }

    if (studentId) {
      where.studentId = studentId;
    }

    if (dateStr) {
      const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
      const endOfDay = new Date(dateStr + 'T23:59:59.999Z');
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          include: {
            user: true,
            class: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ attendances });
  } catch (error: any) {
    console.error('Fetch attendance error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { classId, date, records } = body;

    if (!classId || !date || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Invalid attendance payload' }, { status: 400 });
    }

    const attendanceDate = new Date(date + 'T09:00:00.000Z');
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');

    const results = [];

    for (const item of records) {
      const { studentId, status, remarks } = item;

      // Find existing record on this day
      const existing = await prisma.attendance.findFirst({
        where: {
          studentId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (existing) {
        const updated = await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            status,
            remarks: remarks || null,
            markedById: user.id,
          },
        });
        results.push(updated);
      } else {
        const created = await prisma.attendance.create({
          data: {
            studentId,
            classId,
            date: attendanceDate,
            status,
            remarks: remarks || null,
            markedById: user.id,
          },
        });
        results.push(created);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully saved attendance for ${results.length} students`,
      records: results,
    });
  } catch (error: any) {
    console.error('Save attendance error:', error);
    return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateGrade } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('examId');
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');
    const studentId = searchParams.get('studentId');

    const where: any = {};

    if (examId) where.examId = examId;
    if (subjectId) where.subjectId = subjectId;
    if (studentId) where.studentId = studentId;
    if (classId) {
      where.student = { classId };
    }

    const results = await prisma.result.findMany({
      where,
      include: {
        student: {
          include: {
            user: true,
            class: true,
          },
        },
        subject: true,
        exam: true,
      },
      orderBy: [{ exam: { startDate: 'desc' } }, { student: { rollNumber: 'asc' } }],
    });

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Fetch results error:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { examId, subjectId, records } = body;

    if (!examId || !subjectId || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Missing required exam, subject or marks records' }, { status: 400 });
    }

    const savedResults = [];

    for (const item of records) {
      const { studentId, marksObtained, totalMarks = 100, remarks } = item;
      const numMarks = Number(marksObtained);
      const numTotal = Number(totalMarks) || 100;
      const percentage = (numMarks / numTotal) * 100;
      const gradeInfo = calculateGrade(percentage);

      const existing = await prisma.result.findFirst({
        where: {
          examId,
          subjectId,
          studentId,
        },
      });

      if (existing) {
        const updated = await prisma.result.update({
          where: { id: existing.id },
          data: {
            marksObtained: numMarks,
            totalMarks: numTotal,
            percentage,
            grade: gradeInfo.grade,
            remarks: remarks || gradeInfo.remark,
          },
        });
        savedResults.push(updated);
      } else {
        const created = await prisma.result.create({
          data: {
            examId,
            subjectId,
            studentId,
            marksObtained: numMarks,
            totalMarks: numTotal,
            percentage,
            grade: gradeInfo.grade,
            remarks: remarks || gradeInfo.remark,
          },
        });
        savedResults.push(created);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully recorded marks for ${savedResults.length} students`,
      results: savedResults,
    });
  } catch (error: any) {
    console.error('Save results error:', error);
    return NextResponse.json({ error: 'Failed to save examination results' }, { status: 500 });
  }
}

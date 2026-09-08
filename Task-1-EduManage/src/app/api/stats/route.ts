import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role === 'ADMIN') {
      const [
        totalStudents,
        totalTeachers,
        totalClasses,
        totalExams,
        fees,
        attendances,
        results,
        recentStudents,
      ] = await Promise.all([
        prisma.student.count(),
        prisma.teacher.count(),
        prisma.class.count(),
        prisma.examination.count(),
        prisma.fee.findMany({ select: { amount: true, paidAmount: true, status: true } }),
        prisma.attendance.findMany({
          take: 200,
          orderBy: { date: 'desc' },
          select: { date: true, status: true },
        }),
        prisma.result.findMany({ select: { grade: true, marksObtained: true, totalMarks: true } }),
        prisma.student.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: true, class: true },
        }),
      ]);

      // Calculate Fee metrics
      let totalFeeAmount = 0;
      let totalFeePaid = 0;
      let pendingCount = 0;
      let paidCount = 0;
      let overdueCount = 0;
      let partialCount = 0;

      fees.forEach((f) => {
        totalFeeAmount += f.amount;
        totalFeePaid += f.paidAmount;
        if (f.status === 'PAID') paidCount++;
        else if (f.status === 'PENDING') pendingCount++;
        else if (f.status === 'OVERDUE') overdueCount++;
        else if (f.status === 'PARTIAL') partialCount++;
      });

      // Calculate Attendance Rate
      const totalAttendanceRecords = attendances.length;
      const presentCount = attendances.filter((a) => a.status === 'PRESENT').length;
      const attendanceRate = totalAttendanceRecords > 0 ? ((presentCount / totalAttendanceRecords) * 100).toFixed(1) : '95.0';

      // Group attendance by date for chart
      const attendanceByDateMap = new Map<string, { date: string; present: number; absent: number; late: number }>();
      attendances.forEach((att) => {
        const dStr = new Date(att.date).toISOString().split('T')[0];
        if (!attendanceByDateMap.has(dStr)) {
          attendanceByDateMap.set(dStr, { date: dStr, present: 0, absent: 0, late: 0 });
        }
        const entry = attendanceByDateMap.get(dStr)!;
        if (att.status === 'PRESENT') entry.present++;
        else if (att.status === 'ABSENT') entry.absent++;
        else if (att.status === 'LATE' || att.status === 'EXCUSED') entry.late++;
      });

      const attendanceChart = Array.from(attendanceByDateMap.values()).slice(0, 7).reverse();

      // Grade distribution
      const gradeCounts: Record<string, number> = { 'A+': 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
      results.forEach((r) => {
        if (gradeCounts[r.grade] !== undefined) {
          gradeCounts[r.grade]++;
        }
      });
      const gradeDistribution = Object.entries(gradeCounts).map(([grade, count]) => ({ grade, count }));

      const feeDistribution = [
        { name: 'Paid', value: paidCount, color: '#10b981' },
        { name: 'Partial', value: partialCount, color: '#3b82f6' },
        { name: 'Pending', value: pendingCount, color: '#f59e0b' },
        { name: 'Overdue', value: overdueCount, color: '#ef4444' },
      ];

      return NextResponse.json({
        totalStudents,
        totalTeachers,
        totalClasses,
        totalExams,
        attendanceRate: `${attendanceRate}%`,
        totalFeeAmount,
        totalFeePaid,
        pendingFeesCount: pendingCount + overdueCount,
        attendanceChart,
        gradeDistribution,
        feeDistribution,
        recentStudents,
      });
    }

    if (user.role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
        include: {
          managedClasses: {
            include: {
              _count: { select: { students: true } },
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
        return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
      }

      const totalAssignedStudents = teacher.managedClasses.reduce(
        (sum, c) => sum + (c._count?.students || 0),
        0
      );

      const recentResults = await prisma.result.findMany({
        where: { subject: { teacherId: teacher.id } },
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { include: { user: true } },
          subject: true,
          exam: true,
        },
      });

      return NextResponse.json({
        managedClasses: teacher.managedClasses,
        subjects: teacher.subjects,
        totalClasses: teacher.managedClasses.length,
        totalSubjects: teacher.subjects.length,
        totalAssignedStudents,
        recentResults,
      });
    }

    if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
        include: {
          user: true,
          class: {
            include: {
              subjects: {
                include: { teacher: { include: { user: true } } },
              },
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
        return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
      }

      const totalAtt = student.attendances.length;
      const presentAtt = student.attendances.filter((a) => a.status === 'PRESENT').length;
      const attendancePercent = totalAtt > 0 ? ((presentAtt / totalAtt) * 100).toFixed(1) : '100.0';

      const latestGPA = student.academicRecords[0]?.gpa || 3.8;
      const pendingFees = student.fees.filter((f) => f.status === 'PENDING' || f.status === 'OVERDUE');
      const totalPendingFeeAmount = pendingFees.reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);

      return NextResponse.json({
        student,
        attendancePercent: `${attendancePercent}%`,
        gpa: latestGPA,
        pendingFeesCount: pendingFees.length,
        totalPendingFeeAmount,
        recentResults: student.results.slice(0, 5),
        feeInvoices: student.fees,
      });
    }

    return NextResponse.json({ message: 'No stats for current role' });
  } catch (error: any) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve analytics' }, { status: 500 });
  }
}

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
    const status = searchParams.get('status');
    const studentId = searchParams.get('studentId');
    const search = searchParams.get('search') || '';

    const where: any = {};

    if (status) where.status = status;
    if (studentId) where.studentId = studentId;

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { title: { contains: search } },
        { student: { user: { name: { contains: search } } } },
        { student: { rollNumber: { contains: search } } },
      ];
    }

    // If student is logged in, restrict to own fees
    if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: user.id } });
      if (student) where.studentId = student.id;
    }

    const fees = await prisma.fee.findMany({
      where,
      include: {
        student: {
          include: {
            user: true,
            class: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json({ fees });
  } catch (error: any) {
    console.error('Fetch fees error:', error);
    return NextResponse.json({ error: 'Failed to fetch fee invoices' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, title, amount, dueDate, remarks } = body;

    if (!studentId || !title || !amount || !dueDate) {
      return NextResponse.json({ error: 'Student, Title, Amount, and Due Date are required' }, { status: 400 });
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const fee = await prisma.fee.create({
      data: {
        studentId,
        invoiceNumber,
        title,
        amount: Number(amount),
        paidAmount: 0,
        dueDate: new Date(dueDate),
        status: 'PENDING',
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

    return NextResponse.json({ success: true, fee }, { status: 201 });
  } catch (error: any) {
    console.error('Create fee error:', error);
    return NextResponse.json({ error: 'Failed to generate fee invoice' }, { status: 500 });
  }
}

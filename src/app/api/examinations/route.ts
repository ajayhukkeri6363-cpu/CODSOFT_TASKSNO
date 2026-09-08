import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const examinations = await prisma.examination.findMany({
      include: {
        _count: {
          select: { results: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json({ examinations });
  } catch (error: any) {
    console.error('Fetch examinations error:', error);
    return NextResponse.json({ error: 'Failed to fetch examinations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, examType, startDate, endDate, term, academicYear = '2024-2025', status = 'UPCOMING' } = body;

    if (!name || !examType || !startDate || !endDate || !term) {
      return NextResponse.json({ error: 'Missing required examination fields' }, { status: 400 });
    }

    const examination = await prisma.examination.create({
      data: {
        name,
        examType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        term,
        academicYear,
        status,
      },
    });

    return NextResponse.json({ success: true, examination }, { status: 201 });
  } catch (error: any) {
    console.error('Create examination error:', error);
    return NextResponse.json({ error: 'Failed to create examination' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, examType, startDate, endDate, term, academicYear, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing exam ID' }, { status: 400 });
    }

    const updated = await prisma.examination.update({
      where: { id },
      data: {
        name: name || undefined,
        examType: examType || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        term: term || undefined,
        academicYear: academicYear || undefined,
        status: status || undefined,
      },
    });

    return NextResponse.json({ success: true, examination: updated });
  } catch (error: any) {
    console.error('Update examination error:', error);
    return NextResponse.json({ error: 'Failed to update examination' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing examination ID' }, { status: 400 });
    }

    await prisma.examination.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Examination deleted' });
  } catch (error: any) {
    console.error('Delete examination error:', error);
    return NextResponse.json({ error: 'Failed to delete examination' }, { status: 500 });
  }
}

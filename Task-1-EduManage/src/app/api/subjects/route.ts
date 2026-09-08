import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const teacherId = searchParams.get('teacherId');

    const where: any = {};
    if (classId) where.classId = classId;
    if (teacherId) where.teacherId = teacherId;

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        class: true,
        teacher: { include: { user: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ subjects });
  } catch (error: any) {
    console.error('Fetch subjects error:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, code, classId, teacherId } = body;

    if (!name || !code || !classId) {
      return NextResponse.json({ error: 'Name, code, and classId are required' }, { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        classId,
        teacherId: teacherId || null,
      },
      include: {
        class: true,
        teacher: { include: { user: true } },
      },
    });

    return NextResponse.json({ success: true, subject }, { status: 201 });
  } catch (error: any) {
    console.error('Create subject error:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: 'Missing subject ID' }, { status: 400 });

    await prisma.subject.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Subject removed' });
  } catch (error: any) {
    console.error('Delete subject error:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}

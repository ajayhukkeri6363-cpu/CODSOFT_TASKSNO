import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { employeeId: { contains: search } },
        { specialization: { contains: search } },
      ];
    }

    if (department) {
      where.department = department;
    }

    const teachers = await prisma.teacher.findMany({
      where,
      include: {
        user: true,
        managedClasses: true,
        subjects: {
          include: {
            class: true,
          },
        },
      },
      orderBy: { employeeId: 'asc' },
    });

    return NextResponse.json({ teachers });
  } catch (error: any) {
    console.error('Fetch teachers error:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      email,
      password = 'teacher123',
      employeeId,
      qualification,
      specialization,
      department,
      phone,
      address,
      avatar,
    } = body;

    if (!name || !email || !employeeId || !department) {
      return NextResponse.json({ error: 'Missing required teacher fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const existingEmployee = await prisma.teacher.findUnique({ where: { employeeId } });
    if (existingEmployee) {
      return NextResponse.json({ error: 'Employee ID already in use' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'TEACHER',
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        phone,
      },
    });

    const newTeacher = await prisma.teacher.create({
      data: {
        userId: newUser.id,
        employeeId,
        qualification: qualification || 'B.Ed, Master Degree',
        specialization: specialization || department,
        department,
        phone,
        address,
      },
      include: {
        user: true,
        managedClasses: true,
        subjects: true,
      },
    });

    return NextResponse.json({ success: true, teacher: newTeacher }, { status: 201 });
  } catch (error: any) {
    console.error('Create teacher error:', error);
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
  }
}

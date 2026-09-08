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
    const classId = searchParams.get('classId') || '';
    const gender = searchParams.get('gender') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { rollNumber: { contains: search } },
        { admissionNumber: { contains: search } },
      ];
    }

    if (classId) {
      where.classId = classId;
    }

    if (gender) {
      where.gender = gender;
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        user: true,
        class: true,
        academicRecords: {
          take: 1,
          orderBy: { academicYear: 'desc' },
        },
        _count: {
          select: { attendances: true, results: true, fees: true },
        },
      },
      orderBy: { rollNumber: 'asc' },
    });

    return NextResponse.json({ students });
  } catch (error: any) {
    console.error('Fetch students error:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
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
      password = 'student123',
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

    if (!name || !email || !rollNumber || !admissionNumber || !classId) {
      return NextResponse.json({ error: 'Missing required student fields' }, { status: 400 });
    }

    // Check if email or admission number already exists
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const existingAdmission = await prisma.student.findUnique({ where: { admissionNumber } });
    if (existingAdmission) {
      return NextResponse.json({ error: 'Admission Number already in use' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'STUDENT',
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        phone: parentPhone,
      },
    });

    const newStudent = await prisma.student.create({
      data: {
        userId: newUser.id,
        rollNumber,
        admissionNumber,
        classId,
        gender: gender || 'MALE',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        bloodGroup,
        address,
        parentName,
        parentPhone,
        parentEmail,
      },
      include: {
        user: true,
        class: true,
      },
    });

    return NextResponse.json({ success: true, student: newStudent }, { status: 201 });
  } catch (error: any) {
    console.error('Create student error:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}

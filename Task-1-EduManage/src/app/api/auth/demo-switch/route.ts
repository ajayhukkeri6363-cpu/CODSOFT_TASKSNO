import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken, TOKEN_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json();

    let targetEmail = 'admin@edumanage.com';
    if (role === 'TEACHER') {
      targetEmail = 'sarah.jenkins@edumanage.com';
    } else if (role === 'STUDENT') {
      targetEmail = 'alex.morgan@edumanage.com';
    }

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        teacherProfile: true,
        studentProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: `Demo user for role ${role} not found` }, { status: 404 });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'TEACHER' | 'STUDENT',
      name: user.name,
      avatar: user.avatar,
      teacherId: user.teacherProfile?.id || null,
      studentId: user.studentProfile?.id || null,
      classId: user.studentProfile?.classId || null,
    };

    const token = signToken(payload);

    const response = NextResponse.json({
      success: true,
      user: payload,
    });

    response.cookies.set({
      name: TOKEN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Demo switch error:', error);
    return NextResponse.json({ error: 'Failed to switch demo account' }, { status: 500 });
  }
}

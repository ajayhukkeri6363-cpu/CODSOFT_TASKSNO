import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        recruiterProfile: {
          select: {
            companyId: true,
            position: true,
            department: true,
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
                industry: true,
              },
            },
          },
        },
      },
    });

    if (!dbUser || !dbUser.isActive) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const userPayload = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as any,
      phone: dbUser.phone,
      avatar: dbUser.avatar,
      companyId: dbUser.recruiterProfile?.companyId || null,
      recruiterProfile: dbUser.recruiterProfile || null,
    };

    return NextResponse.json({ user: userPayload });
  } catch (error: any) {
    return NextResponse.json({ user: null, error: error.message }, { status: 500 });
  }
}

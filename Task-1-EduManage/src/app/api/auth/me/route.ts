import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const fullUser = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      teacherProfile: {
        include: {
          managedClasses: true,
          subjects: true,
        },
      },
      studentProfile: {
        include: {
          class: true,
        },
      },
    },
  });

  if (!fullUser) {
    return NextResponse.json({ user: null }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: fullUser.id,
      email: fullUser.email,
      name: fullUser.name,
      role: fullUser.role,
      avatar: fullUser.avatar,
      phone: fullUser.phone,
      teacherProfile: fullUser.teacherProfile,
      studentProfile: fullUser.studentProfile,
    },
  });
}

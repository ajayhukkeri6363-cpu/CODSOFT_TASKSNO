import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken, TOKEN_COOKIE_NAME } from '@/lib/auth';
import { seedDatabaseIfEmpty } from '@/lib/seed';

export async function POST(request: Request) {
  try {
    await seedDatabaseIfEmpty();

    const { role } = await request.json();

    const targetEmail =
      role === 'ADMIN'
        ? 'admin@dinedesk.com'
        : role === 'STAFF'
        ? 'chef.marco@dinedesk.com'
        : 'sophia.miller@example.com';

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!user) {
      return NextResponse.json({ error: `Demo account for ${role} not found` }, { status: 404 });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role as 'CUSTOMER' | 'STAFF' | 'ADMIN',
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
    };

    const token = signToken(tokenPayload);

    const redirectPath =
      user.role === 'ADMIN'
        ? '/admin'
        : user.role === 'STAFF'
        ? '/staff'
        : '/menu';

    const response = NextResponse.json({
      message: `Switched to ${user.name} (${user.role})`,
      user: tokenPayload,
      redirect: redirectPath,
    });

    response.cookies.set(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Demo switch error:', error);
    return NextResponse.json({ error: 'Failed to switch demo user' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { TOKEN_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  cookies().set(TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return NextResponse.json({ message: 'Logged out successfully' });
}

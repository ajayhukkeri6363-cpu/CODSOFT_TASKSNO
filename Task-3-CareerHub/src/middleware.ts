import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_COOKIE_NAME = 'careerhub_session_token';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

  const isCandidatePath = pathname.startsWith('/candidate');
  const isRecruiterPath = pathname.startsWith('/recruiter');
  const isAdminPath = pathname.startsWith('/admin');

  if (!isCandidatePath && !isRecruiterPath && !isAdminPath) {
    return NextResponse.next();
  }

  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      const userRole = payload.role;

      if (isCandidatePath && userRole !== 'CANDIDATE') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      if (isRecruiterPath && userRole !== 'RECRUITER' && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      if (isAdminPath && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(TOKEN_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/candidate/:path*', '/recruiter/:path*', '/admin/:path*'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('edumanage_session_token')?.value;

  // Public paths
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // If no token and trying to access protected route
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // Parse JWT token payload (base64url decoded)
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      const userRole = payload.role;

      // Role authorization enforcement
      if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
        if (userRole === 'TEACHER') return NextResponse.redirect(new URL('/teacher', request.url));
        if (userRole === 'STUDENT') return NextResponse.redirect(new URL('/student', request.url));
        return NextResponse.redirect(new URL('/login', request.url));
      }

      if (pathname.startsWith('/teacher') && userRole !== 'TEACHER' && userRole !== 'ADMIN') {
        if (userRole === 'STUDENT') return NextResponse.redirect(new URL('/student', request.url));
        return NextResponse.redirect(new URL('/login', request.url));
      }

      if (pathname.startsWith('/student') && userRole !== 'STUDENT' && userRole !== 'ADMIN') {
        if (userRole === 'TEACHER') return NextResponse.redirect(new URL('/teacher', request.url));
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  } catch (err) {
    // If token is invalid, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('edumanage_session_token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/student/:path*'],
};

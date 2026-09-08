import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('dinedesk_session_token')?.value;

  // Protected paths
  const isAdminPath = pathname.startsWith('/admin');
  const isStaffPath = pathname.startsWith('/staff');
  const isProfilePath = pathname.startsWith('/profile');

  // If accessing non-protected path, allow through
  if (!isAdminPath && !isStaffPath && !isProfilePath) {
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

      // Admin path access control
      if (isAdminPath && userRole !== 'ADMIN') {
        if (userRole === 'STAFF') return NextResponse.redirect(new URL('/staff', request.url));
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Staff path access control
      if (isStaffPath && userRole !== 'STAFF' && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  } catch (err) {
    // If token is invalid, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('dinedesk_session_token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/staff/:path*', '/profile/:path*'],
};

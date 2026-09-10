import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from './lib/config';

// Gates everything under /admin and /api/admin behind the single hardcoded
// password (see config.js). The login page/route are excluded — otherwise
// no one could ever reach them to log in.
export function proxy(request) {
  const { pathname } = request.nextUrl;
  const isLoginPath = pathname === '/admin/login' || pathname === '/api/admin/login';
  if (isLoginPath) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(ADMIN_SESSION_COOKIE);
  if (cookie?.value === ADMIN_SESSION_VALUE) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/admin')) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }
  return NextResponse.redirect(new URL('/admin/login', request.url));
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

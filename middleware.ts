import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PASSWORD = 'rereeu';
const PUBLIC_PATHS = ['/api/monitoring/check', '/api/auth/login', '/api/auth/logout', '/api/payment-monitor']; // Allow monitoring checks and auth without auth

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if authenticated
  const authCookie = request.cookies.get('auth');
  
  if (authCookie?.value === PASSWORD) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated (except login page itself)
  if (pathname !== '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login).*)'],
};

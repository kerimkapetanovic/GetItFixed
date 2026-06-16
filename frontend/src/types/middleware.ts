import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Čitaj session cookie (prilagodi naziv svom cookie-u)
  const session = request.cookies.get('session')?.value;
  const user = session ? JSON.parse(atob(session.split('.')[1] || btoa('null'))) : null;
  const role = user?.role; // 'client' | 'handyman' | 'admin'

  // Definiši ko smije gdje
  const adminRoutes = ['/admin'];
  const handymanRoutes = ['/handyman', '/dashboard'];
  const clientRoutes = ['/my-requests', '/new-request'];

  const isAdminRoute = adminRoutes.some(r => pathname.startsWith(r));
  const isHandymanRoute = handymanRoutes.some(r => pathname.startsWith(r));
  const isClientRoute = clientRoutes.some(r => pathname.startsWith(r));

  // Nije ulogovan — pošalji na login
  if (!role && (isAdminRoute || isHandymanRoute || isClientRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Klijent pokušava admin/handyman rutu
  if (role === 'client' && (isAdminRoute || isHandymanRoute)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Handyman pokušava admin rutu
  if (role === 'handyman' && isAdminRoute) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Admin pokušava client rutu (opcionalno)
  // if (role === 'admin' && isClientRoute) { ... }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/handyman/:path*', '/dashboard/:path*', '/my-requests/:path*', '/new-request/:path*'],
};
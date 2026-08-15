import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerComponentClient({
    cookies: () => cookies(),
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/auth/callback',
    '/forgot-password',
    '/reset-password',
  ];

  const pathname = request.nextUrl.pathname;

  if (!publicRoutes.includes(pathname) && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (
    (pathname === '/login' ||
      pathname === '/signup' ||
      pathname === '/forgot-password') &&
    user
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

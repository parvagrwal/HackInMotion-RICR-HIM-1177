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

  const supabase = createServerComponentClient(
    { cookies: () => cookies() }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect routes
  const publicRoutes = ['/login', '/signup', '/'];
  const pathname = request.nextUrl.pathname;

  // If accessing protected route without session, redirect to login
  if (!publicRoutes.includes(pathname) && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If accessing auth routes with session, redirect to dashboard
  if ((pathname === '/login' || pathname === '/signup') && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

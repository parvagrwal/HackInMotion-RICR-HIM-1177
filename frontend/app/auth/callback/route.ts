import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', requestUrl.origin));
  }

  const supabase = createRouteHandlerClient({ cookies });
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL('/login?error=verification_failed', requestUrl.origin),
    );
  }

  return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
}

'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { Suspense } from 'react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (searchParams.get('passwordReset') === 'success') {
      setMessage('Password updated successfully. Please sign in.');
    }
  }, [searchParams]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f8f8] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10172d] text-2xl font-bold text-white">
            F
          </div>

          <h1 className="text-3xl font-semibold text-[#10172d]">
            FinSight
          </h1>

          <p className="mt-2 text-base text-slate-500">
            Your money, made clear.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#10172d]">
            Welcome back
          </h2>

          <p className="mt-2 text-base text-slate-500">
            Sign in to see your financial health.
          </p>

          <form onSubmit={handleLogin} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-teal-700 hover:text-teal-800"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#10172d] px-4 py-3 text-base font-medium text-white transition hover:bg-[#18213d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-teal-700 hover:text-teal-800"
            >
              Sign up
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Your financial data is private and securely protected.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f8f8] flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);

  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      setShowVerificationDialog(true);
    } catch {
      setError('An error occurred during signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    setShowVerificationDialog(false);
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-[#f5f8f8] flex items-center justify-center px-6 py-10">
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
            Create your account
          </h2>

          <p className="mt-2 text-base text-slate-500">
            Start understanding where your money goes.
          </p>

          <form onSubmit={handleSignup} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>

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
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#10172d] px-4 py-3 text-base font-medium text-white transition hover:bg-[#18213d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-teal-700 hover:text-teal-800"
            >
              Login
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Your financial data is private and securely protected.
        </p>
      </div>

      {showVerificationDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="verification-title"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-2xl text-teal-700">
              ✓
            </div>

            <h2
              id="verification-title"
              className="text-2xl font-semibold text-[#10172d]"
            >
              Verify your email address
            </h2>

            <p className="mt-3 text-base leading-6 text-slate-600">
              We&apos;ve sent a verification link to{' '}
              <span className="font-medium text-slate-800">{email}</span>.
              Please check your inbox and follow the link to activate your
              account.
            </p>

            <p className="mt-3 text-sm text-slate-500">
              If you do not see the email, please check your spam or junk
              folder.
            </p>

            <button
              type="button"
              onClick={goToLogin}
              className="mt-7 w-full rounded-xl bg-[#10172d] px-4 py-3 text-base font-medium text-white transition hover:bg-[#18213d]"
            >
              Continue to login
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Navigation() {
  const [isLoading, setIsLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    setLogoutError('');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setLogoutError('Unable to log out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="border-b border-border bg-card shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {logoutError && (
          <p role="alert" className="mb-3 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
            {logoutError}
          </p>
        )}
        {/* Desktop view */}
        <div className="hidden md:flex justify-between items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 text-[#10172d] hover:opacity-80"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10172d] text-lg font-bold text-white">
              F
            </span>
            <span className="text-2xl font-semibold">FinSight</span>
          </Link>
          <div className="flex gap-1 items-center">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/transactions">
              <Button variant="ghost" size="sm">
                Transactions
              </Button>
            </Link>
            <Link href="/budgets">
              <Button variant="ghost" size="sm">
                Budgets
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>

        {/* Mobile view */}
        <div className="md:hidden flex justify-between items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-[#10172d]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10172d] text-sm font-bold text-white">
              F
            </span>
            <span className="text-xl font-semibold">FinSight</span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 hover:bg-muted rounded"
          >
            {mobileOpen ? '×' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4">
            <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Dashboard
              </Button>
            </Link>
            <Link href="/transactions" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Transactions
              </Button>
            </Link>
            <Link href="/budgets" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Budgets
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full justify-start"
            >
              {isLoading ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}

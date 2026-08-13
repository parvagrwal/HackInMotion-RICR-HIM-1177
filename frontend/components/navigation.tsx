'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Navigation() {
  const [isLoading, setIsLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="border-b border-border bg-card shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Desktop view */}
        <div className="hidden md:flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-primary hover:opacity-80">
            💰 Expense Analyzer
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
          <Link href="/dashboard" className="text-xl font-bold text-primary">
            💰 Analyzer
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 hover:bg-muted rounded"
          >
            {mobileOpen ? '✕' : '☰'}
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

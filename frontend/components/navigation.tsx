'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export function Navigation() {
  const [isLoading, setIsLoading] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();
  const pathname = usePathname();

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

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { href: '/transactions', label: 'Transactions', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    )},
    { href: '/budgets', label: 'Budgets', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
  ];

  return (
    <>
      {/* Desktop Sidebar (Left) */}
      <aside className="hidden md:flex flex-col justify-between items-center w-16 bg-white border-r border-slate-100 h-screen sticky top-0 py-6 z-50">
        <div className="flex flex-col items-center gap-8 w-full">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center justify-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10172d] text-lg font-bold text-white shadow-md">
              F
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="flex flex-col items-center gap-4 w-full px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                    isActive
                      ? 'bg-[#10172d] text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-4 w-full px-2">
          {logoutError && (
            <div title={logoutError} className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}

          {/* Settings / Logout Icon */}
          <button
            onClick={handleLogout}
            disabled={isLoading}
            title={logoutError || "Logout"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>

          {/* User Profile Circle */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
            N
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 bg-white border-b border-slate-100 z-50 px-4 py-3 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10172d] text-sm font-bold text-white">
            F
          </span>
          <span className="text-lg font-bold text-[#10172d]">FinSight</span>
        </Link>
        <div className="flex items-center gap-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`p-2 rounded-lg text-xs font-medium ${
                pathname === item.href ? 'bg-[#10172d] text-white' : 'text-slate-600'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="text-xs text-red-600 font-medium ml-2"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

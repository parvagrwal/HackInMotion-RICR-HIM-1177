'use client';

export function Providers({ children }: { children: React.ReactNode }) {
  // Client-side providers setup
  // Auth middleware in middleware.ts handles route protection
  return <>{children}</>;
}

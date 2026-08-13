'use client';

import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert variant="destructive">
          <AlertTitle>Something went wrong!</AlertTitle>
          <AlertDescription>
            <p className="mb-4">We encountered an error. Please try again.</p>
            <p className="text-xs mb-4 font-mono bg-black/20 p-2 rounded break-words">
              {error.message}
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded font-medium hover:opacity-90"
            >
              Try Again
            </button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

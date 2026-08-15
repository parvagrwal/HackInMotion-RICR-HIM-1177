'use client';

import { Navigation } from '@/components/navigation';
import { TransactionsClientContainer } from '@/components/transactions-client-container';

export default function TransactionsPage() {
  return (
    <div className="flex min-h-screen bg-[#f5f8f8]">
      <Navigation />

      <main className="flex-1 px-6 md:px-10 py-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#10172d]">
            Transactions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View, filter, add, and import your transactions
          </p>
        </div>

        <TransactionsClientContainer />
      </main>
    </div>
  );
}


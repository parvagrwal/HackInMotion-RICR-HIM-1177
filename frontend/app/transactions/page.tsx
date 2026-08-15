'use client';

import Link from 'next/link';

interface Transaction {
  id: string;
  merchant?: string;
  description: string;
  category: string;
  date: string;
  amount: number;
  type: string;
}

const MERCHANT_EMOJIS: Record<string, string> = {
  Swiggy: '🍔',
  Zomato: '🍕',
  Amazon: '🛒',
  Netflix: '🎧',
  Uber: '🚗',
  Starbucks: '☕',
};

export function RecentTransactionsCard({ transactions }: { transactions: Transaction[] }) {
  const displayTx = transactions.length > 0
    ? transactions.slice(0, 4)
    : [
        { id: '1', merchant: 'Swiggy', description: 'Swiggy', category: 'Food & Dining', date: 'Today, 2:30 PM', amount: 680, type: 'expense' },
        { id: '2', merchant: 'Amazon', description: 'Amazon', category: 'Shopping', date: 'Yesterday', amount: 2499, type: 'expense' },
        { id: '3', merchant: 'Netflix', description: 'Netflix', category: 'Subscriptions', date: '10 Aug', amount: 649, type: 'expense' },
        { id: '4', merchant: 'Uber', description: 'Uber', category: 'Transport', date: '9 Aug', amount: 320, type: 'expense' },
      ];

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">
            Activity
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#10172d]">
            Recent transactions
          </h3>
        </div>

        <Link
          href="/transactions"
          className="text-xs font-semibold text-slate-500 hover:text-[#10172d] transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {displayTx.map((tx) => {
          const name = tx.merchant || tx.description;
          const emoji = MERCHANT_EMOJIS[name] || '💳';
          const isExpense = tx.type === 'expense';

          return (
            <div key={tx.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-lg">
                  {emoji}
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#10172d]">{name}</div>
                  <div className="text-xs text-slate-400">
                    {tx.category} • {tx.date}
                  </div>
                </div>
              </div>

              <div className="font-serif font-bold text-sm text-[#10172d]">
                {isExpense ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

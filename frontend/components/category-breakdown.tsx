'use client';

import Link from 'next/link';

interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'Food & Dining': '🍔',
  Shopping: '🛒',
  Travel: '✈️',
  Transportation: '🚗',
  'Bills & Utilities': '⚡',
  Subscriptions: '🎧',
  Entertainment: '🍿',
  Health: '💊',
  Housing: '🏠',
  Personal: '👤',
  Uncategorized: '📦',
};

export function CategoryBreakdown({
  categories,
}: {
  categories: CategorySummary[];
}) {
  const displayCategories = categories.length > 0 ? categories : [
    { category: 'Food & Dining', total: 12450, percentage: 32 },
    { category: 'Shopping', total: 8200, percentage: 21 },
    { category: 'Travel', total: 4800, percentage: 12 },
    { category: 'Bills & Utilities', total: 5420, percentage: 14 },
    { category: 'Subscriptions', total: 2190, percentage: 6 },
    { category: 'Entertainment', total: 3200, percentage: 8 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <div className="text-xs font-bold tracking-widest text-[#0d9488] uppercase mb-1">
            Spending Analysis
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#10172d]">
            Where your money goes
          </h2>
        </div>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-slate-500 hover:text-[#10172d] transition-colors flex items-center gap-1"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayCategories.slice(0, 6).map((cat) => {
          const emoji = CATEGORY_EMOJIS[cat.category] || '📦';
          const formattedTotal = cat.total.toLocaleString('en-IN');

          return (
            <div
              key={cat.category}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    {cat.category}
                  </div>
                  <div className="text-2xl font-bold font-serif text-[#10172d] mt-1">
                    ₹{formattedTotal}
                  </div>
                </div>
                <div className="text-3xl bg-slate-50 p-2 rounded-xl">
                  {emoji}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Share of spending</span>
                  <span className="font-semibold text-slate-600">{Math.round(cat.percentage)}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#10172d] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(cat.percentage * 2, 100)}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-400">
                  {cat.percentage > 25 ? 'Higher than usual' : 'Looking healthy'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';

interface BudgetProgress {
  category: string;
  spent: number;
  target: number;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'Food & Dining': '🍔',
  Shopping: '🛒',
  Entertainment: '🍿',
  Travel: '✈️',
  'Bills & Utilities': '⚡',
  Subscriptions: '🎧',
  Housing: '🏠',
};

export function BudgetProgressBars({
  budgets,
}: {
  budgets: BudgetProgress[];
}) {
  const displayBudgets = budgets.length > 0 ? budgets : [
    { category: 'Food & Dining', spent: 12450, target: 15000 },
    { category: 'Shopping', spent: 8200, target: 8000 },
    { category: 'Entertainment', spent: 3200, target: 5000 },
  ];

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-1">
          <div className="text-xs font-bold tracking-widest text-[#0d9488] uppercase">
            Budget
          </div>
          <Link href="/budgets" className="text-slate-400 hover:text-slate-700 text-lg">
            +
          </Link>
        </div>

        <h3 className="text-2xl font-serif font-bold text-[#10172d] mb-6">
          Monthly limits
        </h3>

        <div className="space-y-5">
          {displayBudgets.map((b) => {
            const percentage = Math.round((b.spent / b.target) * 100);
            const isOver = percentage > 100;
            const emoji = CATEGORY_EMOJIS[b.category] || '🎯';

            return (
              <div key={b.category} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{emoji}</span>
                    <div>
                      <span className="font-semibold text-[#10172d] block">{b.category}</span>
                      <span className="text-[11px] text-slate-400">
                        ₹{b.spent.toLocaleString('en-IN')} / ₹{b.target.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <span className={`font-bold ${isOver ? 'text-red-500' : 'text-slate-600'}`}>
                    {percentage}%
                  </span>
                </div>

                {/* Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-red-500' : 'bg-[#0d9488]'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <Link
          href="/budgets"
          className="text-xs font-semibold text-slate-600 hover:text-[#10172d] transition-colors"
        >
          Manage budgets
        </Link>
      </div>
    </div>
  );
}

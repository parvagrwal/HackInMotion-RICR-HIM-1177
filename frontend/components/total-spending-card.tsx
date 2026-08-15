'use client';

interface TotalSpendingProps {
  totalSpending: number;
  monthlyIncome: number;
  savingsAmount: number;
  percentageChange?: number;
}

export function TotalSpendingCard({
  totalSpending = 52480,
  monthlyIncome = 78000,
  savingsAmount = 15520,
  percentageChange = 8.4,
}: TotalSpendingProps) {
  const formattedSpending = totalSpending.toLocaleString('en-IN');
  const formattedIncome = monthlyIncome.toLocaleString('en-IN');
  const formattedSavings = savingsAmount.toLocaleString('en-IN');

  return (
    <div className="rounded-3xl bg-[#10172d] text-white p-7 shadow-lg flex flex-col justify-between h-full min-h-[300px] relative overflow-hidden">
      {/* Background illustration / wallet icon */}
      <div className="absolute top-4 right-4 opacity-80 pointer-events-none">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-2xl">
          💳
        </div>
      </div>

      <div>
        <div className="text-xs text-slate-400 font-medium tracking-wide">
          Total spending
        </div>

        <div className="mt-3 text-4xl font-bold font-serif text-white tracking-tight">
          ₹{formattedSpending}
        </div>

        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
          <span>+{percentageChange}%</span>
          <span className="text-slate-400 font-normal">vs last month</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
        <div>
          <div className="text-xs text-slate-400 font-medium">Income</div>
          <div className="text-xl font-bold text-white mt-1">₹{formattedIncome}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Savings</div>
          <div className="text-xl font-bold text-[#0d9488] mt-1">₹{formattedSavings}</div>
        </div>
      </div>
    </div>
  );
}

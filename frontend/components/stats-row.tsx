'use client';

interface StatsRowProps {
  dailyAverage?: number;
  savingsRate?: number;
  largestCategory?: string;
  largestCategorySpend?: number;
  transactionCount?: number;
}

export function StatsRow({
  dailyAverage = 1749,
  savingsRate = 19.9,
  largestCategory = 'Rent',
  largestCategorySpend = 18000,
  transactionCount = 84,
}: StatsRowProps) {
  const stats = [
    {
      label: 'Daily average',
      value: `₹${dailyAverage.toLocaleString('en-IN')}`,
      change: '+4.2%',
      changeType: 'positive',
    },
    {
      label: 'Savings rate',
      value: `${savingsRate.toFixed(1)}%`,
      change: '+2.1%',
      changeType: 'positive',
    },
    {
      label: 'Largest category',
      value: largestCategory,
      subValue: `₹${largestCategorySpend.toLocaleString('en-IN')}`,
    },
    {
      label: 'Transactions',
      value: transactionCount.toString(),
      change: '+12',
      changeType: 'positive',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-xs text-slate-400 font-medium">{stat.label}</div>

          <div className="mt-2 text-2xl font-bold font-serif text-[#10172d]">
            {stat.value}
          </div>

          {stat.subValue && (
            <div className="mt-1 text-xs text-[#0d9488] font-medium">
              {stat.subValue}
            </div>
          )}

          {stat.change && (
            <div className="mt-1 text-xs font-semibold text-[#0d9488]">
              {stat.change}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

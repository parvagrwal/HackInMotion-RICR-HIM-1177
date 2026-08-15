'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyTrend {
  month: string;
  total: number;
  count: number;
}

export function MonthlyTrendChart({ trends }: { trends: MonthlyTrend[] }) {
  const chartData = trends.length > 0
    ? trends.map((t) => ({
        month: formatMonthLabel(t.month),
        spend: Math.round(t.total),
      }))
    : [
        { month: 'Mar', spend: 15000 },
        { month: 'Apr', spend: 28000 },
        { month: 'May', spend: 32000 },
        { month: 'Jun', spend: 38000 },
        { month: 'Jul', spend: 42000 },
        { month: 'Aug', spend: 45000 },
      ];

  function formatMonthLabel(m: string) {
    if (!m) return '';
    const parts = m.split('-');
    if (parts.length === 2) {
      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
      return date.toLocaleString('default', { month: 'short' });
    }
    return m;
  }

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-1">
          <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            Spending Trend
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
            Last 6 months
          </span>
        </div>

        <h3 className="text-2xl font-serif font-bold text-[#10172d] mb-6">
          This month
        </h3>
      </div>

      <div className="w-full h-48 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(v) => `${v / 1000}k`}
            />
            <Tooltip
              formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Spending']}
              contentStyle={{
                backgroundColor: '#10172d',
                borderRadius: '12px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
              itemStyle={{ color: '#0d9488' }}
            />
            <Area
              type="monotone"
              dataKey="spend"
              stroke="#0d9488"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#tealGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

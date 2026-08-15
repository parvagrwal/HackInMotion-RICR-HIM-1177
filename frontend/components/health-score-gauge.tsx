'use client';

interface HealthScoreProps {
  score: number;
  savingsRate: number;
  budgetAdherence: number;
  breakdown: string;
}

export function HealthScoreGauge({
  score,
  savingsRate,
  budgetAdherence,
  breakdown,
}: HealthScoreProps) {
  const getHeadline = (s: number) => {
    if (s >= 80) return { main: 'Your money is looking', highlight: 'healthy.' };
    if (s >= 60) return { main: 'Your finances are looking', highlight: 'stable.' };
    if (s >= 40) return { main: 'Your finances need', highlight: 'attention.' };
    return { main: 'Your financial health is', highlight: 'at risk.' };
  };

  const getSubtext = (s: number) => {
    if (s >= 70) return "You're saving consistently and staying within most of your monthly budgets.";
    if (s >= 50) return 'Your spending is manageable, but there are areas where you can save more.';
    return 'High spending detected across multiple categories. Review recommendations below.';
  };

  const headline = getHeadline(score);
  const subtext = getSubtext(score);

  // SVG Gauge calculations
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-3xl border border-teal-100 bg-gradient-to-br from-[#e6faf5] via-[#f0fdf9] to-[#f8fafc] p-7 shadow-sm flex flex-col justify-between h-full min-h-[300px]">
      <div>
        <div className="text-xs font-bold tracking-widest text-[#0d9488] uppercase mb-4">
          Financial Health
        </div>

        <h2 className="text-3xl font-serif font-semibold text-[#10172d] leading-tight">
          {headline.main}{' '}
          <span className="text-[#0d9488]">{headline.highlight}</span>
        </h2>

        <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-md">
          {subtext}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          {/* SVG Circular Progress Gauge */}
          <div className="relative flex items-center justify-center w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#e2e8f0"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#0d9488"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold text-[#10172d]">{score}</span>
              <span className="text-[10px] text-slate-400 font-medium">/ 100</span>
            </div>
          </div>

          {/* Labels next to gauge */}
          <div>
            <div className="text-base font-semibold text-[#0d9488]">Healthy</div>
            <div className="text-xs text-slate-500 mt-0.5">+6 points this month</div>
            <button
              title={breakdown}
              className="text-xs font-semibold text-[#10172d] underline mt-1 block hover:text-[#0d9488] transition-colors"
            >
              View score breakdown
            </button>
          </div>
        </div>

        {/* Subtle metrics summary */}
        <div className="flex items-center gap-4 text-xs text-slate-500 border-l border-teal-200/50 pl-4">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Savings</span>
            <span className="font-semibold text-slate-700">{savingsRate.toFixed(1)}%</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Budget</span>
            <span className="font-semibold text-slate-700">{budgetAdherence.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
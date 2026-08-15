'use client';

interface RecommendationsProps {
  recommendations: string[];
}

export function RecommendationsWidget({ recommendations }: RecommendationsProps) {
  const headline = recommendations.length > 0 && recommendations[0].includes('jumped')
    ? recommendations[0]
    : 'Your food spending jumped 40%.';

  const subtext = recommendations.length > 1
    ? recommendations[1]
    : 'Most of the increase came from food delivery. Cutting delivery orders by 25% could save you around ₹1,500 this month.';

  return (
    <div className="rounded-3xl border border-teal-100 bg-gradient-to-r from-[#e6faf5] to-[#f0fdf9] p-7 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="space-y-2 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#0d9488] text-xs font-bold tracking-widest uppercase shadow-2xs">
          <span>✦</span>
          <span>SMART INSIGHT</span>
        </div>

        <h3 className="text-2xl font-serif font-bold text-[#10172d]">
          {headline}
        </h3>

        <p className="text-sm text-slate-600 leading-relaxed">
          {subtext}
        </p>
      </div>

      <button className="px-5 py-3 rounded-full bg-[#10172d] text-white text-xs font-medium hover:bg-[#18213d] transition-colors whitespace-nowrap shadow-sm">
        See how to save →
      </button>
    </div>
  );
}

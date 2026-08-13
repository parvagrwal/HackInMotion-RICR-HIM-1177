'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600 bg-green-50';
    if (s >= 60) return 'text-amber-600 bg-amber-50';
    if (s >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <Card className={getScoreColor(score)}>
      <CardHeader>
        <CardTitle className="text-lg">Financial Health Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score gauge */}
        <div className="flex items-end justify-center gap-2">
          <div className="text-5xl font-bold">{score}</div>
          <div className="text-2xl mb-2">/ 100</div>
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold">{getScoreLabel(score)}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/30 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${score}%`,
              backgroundColor:
                score >= 80
                  ? '#16a34a'
                  : score >= 60
                    ? '#d97706'
                    : score >= 40
                      ? '#ea580c'
                      : '#dc2626',
            }}
          />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs opacity-75">Savings Rate</p>
            <p className="font-semibold">{savingsRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs opacity-75">Budget Adherence</p>
            <p className="font-semibold">{budgetAdherence.toFixed(0)}%</p>
          </div>
        </div>

        {/* Breakdown */}
        <p className="text-xs opacity-75 pt-2 border-t border-current/20">
          {breakdown}
        </p>
      </CardContent>
    </Card>
  );
}
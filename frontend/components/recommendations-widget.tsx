'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RecommendationsWidget({
  recommendations,
}: {
  recommendations: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">💡 Personalized Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            No insights available yet. Track more transactions to get personalized recommendations.
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-muted/50 border border-border text-sm leading-relaxed"
              >
                {rec}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

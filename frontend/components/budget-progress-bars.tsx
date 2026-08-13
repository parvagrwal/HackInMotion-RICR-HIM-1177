'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BudgetProgress {
  category: string;
  spent: number;
  target: number;
}

export function BudgetProgressBars({
  budgets,
}: {
  budgets: BudgetProgress[];
}) {
  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Budget Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground text-sm">
            No budgets set for this month. Go to Budgets page to create one.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Budget Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.target) * 100;
          const isOverBudget = percentage > 100;

          return (
            <div key={budget.category}>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium">{budget.category}</p>
                <p
                  className={`text-sm font-semibold ${
                    isOverBudget ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  ${budget.spent.toFixed(2)} / ${budget.target.toFixed(2)}
                </p>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isOverBudget ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(percentage)}% of budget
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

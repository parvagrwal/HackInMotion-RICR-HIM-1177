'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { BudgetManager } from '@/components/budget-manager';
import { GoalsManager } from '@/components/goals-manager';
import { Input } from '@/components/ui/input';

export default function BudgetsPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2">Budgets & Goals</h1>
            <p className="text-muted-foreground">
              Set monthly budgets and track long-term savings goals.
            </p>
          </div>

          {/* Month selector */}
          <div className="flex items-center gap-4">
            <label htmlFor="month" className="text-sm font-medium">
              Select Month:
            </label>
            <Input
              id="month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-40"
            />
          </div>

          {/* Managers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <BudgetManager month={month} />
            <GoalsManager />
          </div>
        </div>
      </main>
    </div>
  );
}

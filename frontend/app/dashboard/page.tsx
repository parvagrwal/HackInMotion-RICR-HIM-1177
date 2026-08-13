'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { HealthScoreGauge } from '@/components/health-score-gauge';
import { CategoryBreakdown } from '@/components/category-breakdown';
import { MonthlytrendChart } from '@/components/monthly-trend-chart';
import { BudgetProgressBars } from '@/components/budget-progress-bars';
import { RecommendationsWidget } from '@/components/recommendations-widget';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  getTopCategories,
  getMonthlyTrends,
  getFinancialHealthScore,
  getRecommendations,
} from '@/lib/analysis';
import { getBudgetProgress } from '@/app/dashboard/actions';

interface DashboardData {
  topCategories: any[];
  trends: any[];
  healthScore: any;
  recommendations: string[];
  budgetProgress: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const [
          categories,
          trends,
          score,
          recs,
          budgets,
        ] = await Promise.all([
          getTopCategories(),
          getMonthlyTrends(6),
          getFinancialHealthScore(),
          getRecommendations(),
          getBudgetProgress(),
        ]);

        setData({
          topCategories: categories,
          trends,
          healthScore: score,
          recommendations: recs,
          budgetProgress: budgets,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load dashboard'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase.auth, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Loading your financial dashboard...</p>
          <div className="inline-block animate-spin">⏳</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No data yet. Start by adding some transactions.
            </p>
            <Link href="/transactions">
              <Button>Add Your First Transaction</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Financial Health</h1>
          <p className="text-muted-foreground">
            Quick overview of your spending and financial goals
          </p>
        </div>

        {/* Top Row: Score + Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <HealthScoreGauge
              score={data.healthScore.score}
              savingsRate={data.healthScore.savingsRate}
              budgetAdherence={data.healthScore.budgetAdherence}
              breakdown={data.healthScore.breakdown}
            />
          </div>
          <div className="lg:col-span-2">
            <RecommendationsWidget recommendations={data.recommendations} />
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CategoryBreakdown categories={data.topCategories} />
          <MonthlytrendChart trends={data.trends} />
        </div>

        {/* Budget Progress */}
        <div className="mb-8">
          <BudgetProgressBars budgets={data.budgetProgress} />
        </div>

        {/* Call to Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
            <p className="font-semibold mb-2">📊 Transactions</p>
            <p className="text-sm text-muted-foreground mb-3">
              Add or import transactions
            </p>
            <Link href="/transactions">
              <Button size="sm" variant="outline" className="w-full">
                Go to Transactions
              </Button>
            </Link>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
            <p className="font-semibold mb-2">💰 Budgets</p>
            <p className="text-sm text-muted-foreground mb-3">
              Set and track budgets
            </p>
            <Link href="/budgets">
              <Button size="sm" variant="outline" className="w-full">
                Go to Budgets
              </Button>
            </Link>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
            <p className="font-semibold mb-2">🎯 Goals</p>
            <p className="text-sm text-muted-foreground mb-3">
              Track savings goals
            </p>
            <Link href="/budgets">
              <Button size="sm" variant="outline" className="w-full">
                Go to Goals
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

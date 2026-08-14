import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { HealthScoreGauge } from '@/components/health-score-gauge';
import { CategoryBreakdown } from '@/components/category-breakdown';
import { MonthlyTrendChart } from '@/components/monthly-trend-chart';
import { BudgetProgressBars } from '@/components/budget-progress-bars';
import { RecommendationsWidget } from '@/components/recommendations-widget';
import { RecurringPaymentsCard } from '@/components/recurring-payments-card';
import { MonthlyIncomeCard } from '@/components/monthly-income-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  getTopCategories,
  getMonthlyTrends,
  getFinancialHealthScore,
  getRecommendations,
  getRecurringPayments,
} from '@/lib/analysis';
import { getBudgetProgress, getMonthlyIncome } from '@/app/dashboard/actions';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const [
    topCategories,
    trends,
    healthScore,
    recommendations,
    budgetProgress,
    recurringPayments,
    monthlyIncome,
  ] = await Promise.all([
    getTopCategories(),
    getMonthlyTrends(6),
    getFinancialHealthScore(),
    getRecommendations(),
    getBudgetProgress(),
    getRecurringPayments(),
    getMonthlyIncome(),
  ]);

  const hasData = topCategories && topCategories.length > 0;

  if (!hasData) {
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
              score={healthScore?.score || 0}
              savingsRate={healthScore?.savingsRate || 0}
              budgetAdherence={healthScore?.budgetAdherence || 0}
              breakdown={healthScore?.breakdown || ''}
            />
          </div>
          <div className="lg:col-span-2">
            <RecommendationsWidget recommendations={recommendations || []} />
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CategoryBreakdown categories={topCategories || []} />
          <MonthlyTrendChart trends={trends || []} />
        </div>

        <div className="mb-8">
          <RecurringPaymentsCard payments={recurringPayments || []} />
        </div>

        <div className="mb-8">
          <MonthlyIncomeCard initialIncome={monthlyIncome || 0} />
        </div>

        {/* Budget Progress */}
        <div className="mb-8">
          <BudgetProgressBars budgets={budgetProgress || []} />
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

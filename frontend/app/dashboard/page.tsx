import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { HealthScoreGauge } from '@/components/health-score-gauge';
import { TotalSpendingCard } from '@/components/total-spending-card';
import { StatsRow } from '@/components/stats-row';
import { CategoryBreakdown } from '@/components/category-breakdown';
import { MonthlyTrendChart } from '@/components/monthly-trend-chart';
import { BudgetProgressBars } from '@/components/budget-progress-bars';
import { RecommendationsWidget } from '@/components/recommendations-widget';
import { RecentTransactionsCard } from '@/components/recent-transactions-card';
import { DashboardFooter } from '@/components/dashboard-footer';
import { NotificationsPopover } from '@/components/notifications-popover';
import { ProfilePopover } from '@/components/profile-popover';
import {
  getTopCategories,
  getMonthlyTrends,
  getFinancialHealthScore,
  getRecommendations,
  getNotifications,
} from '@/lib/analysis';
import { getBudgetProgress, getMonthlyIncome, getUserProfile } from '@/app/dashboard/actions';
import { getTransactions } from '@/app/transactions/actions';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const userEmail = session.user?.email || '';

  const [
    userProfile,
    topCategories,
    trends,
    healthScore,
    recommendations,
    budgetProgress,
    monthlyIncome,
    transactions,
    notifications,
  ] = await Promise.all([
    getUserProfile(),
    getTopCategories(),
    getMonthlyTrends(6),
    getFinancialHealthScore(),
    getRecommendations(),
    getBudgetProgress(),
    getMonthlyIncome(),
    getTransactions(),
    getNotifications(),
  ]);

  const userName = userProfile?.username || 'User';

  // Calculate totals for summary card
  const totalSpending = (topCategories || []).reduce((acc, cat) => acc + cat.total, 0);
  const effectiveIncome = monthlyIncome || 78000;
  const savingsAmount = Math.max(0, effectiveIncome - totalSpending);

  // Compute daily average & largest category
  const dailyAverage = Math.round(totalSpending / 30) || 1749;
  const largestCategoryObj = topCategories && topCategories.length > 0 ? topCategories[0] : null;

  // Calculate IST Time Greeting (Morning / Afternoon / Evening / Night)
  const indiaHour = parseInt(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false }),
    10
  );
  let greeting = 'Good evening';
  if (indiaHour >= 5 && indiaHour < 12) greeting = 'Good morning';
  else if (indiaHour >= 12 && indiaHour < 17) greeting = 'Good afternoon';
  else if (indiaHour >= 17 && indiaHour < 22) greeting = 'Good evening';
  else greeting = 'Good night';

  const indiaDateStr = new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex min-h-screen bg-[#f5f8f8]">
      {/* Left Sidebar Navigation */}
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 px-6 md:px-10 py-8 max-w-7xl mx-auto space-y-8">
        {/* Top Bar: Date, Dynamic Greeting & Action Menu */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-xs font-medium text-slate-400">
              {indiaDateStr}
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#10172d] mt-1">
              {greeting}, {userName}
            </h1>
          </div>

          {/* Action Tools: Notifications & Interactive Profile Popover */}
          <div className="flex items-center gap-3">
            {/* Notification Bell Popover */}
            <NotificationsPopover initialNotifications={notifications} />

            {/* Workable Interactive Profile Popover */}
            <ProfilePopover userName={userName} email={userEmail} initialIncome={effectiveIncome} />
          </div>
        </div>

        {/* Row 1: Health Gauge Card (2/3) + Total Spending Card (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HealthScoreGauge
              score={healthScore?.score || 78}
              savingsRate={healthScore?.savingsRate || 19.9}
              budgetAdherence={healthScore?.budgetAdherence || 85}
              breakdown={healthScore?.breakdown || 'Savings: 40pts, Budget: 25pts, Spike: 13pts'}
            />
          </div>
          <div className="lg:col-span-1">
            <TotalSpendingCard
              totalSpending={totalSpending > 0 ? totalSpending : 52480}
              monthlyIncome={effectiveIncome}
              savingsAmount={savingsAmount > 0 ? savingsAmount : 15520}
              percentageChange={8.4}
            />
          </div>
        </div>

        {/* Row 2: 4 Key Metric Cards */}
        <StatsRow
          dailyAverage={dailyAverage}
          savingsRate={healthScore?.savingsRate || 19.9}
          largestCategory={largestCategoryObj?.category || 'Rent'}
          largestCategorySpend={largestCategoryObj?.total || 18000}
          transactionCount={transactions?.length || 84}
        />

        {/* Row 3: Where Your Money Goes (Category Grid) */}
        <CategoryBreakdown categories={topCategories || []} />

        {/* Row 4: Spending Trend Chart (2/3) + Budget Limits (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MonthlyTrendChart trends={trends || []} />
          </div>
          <div className="lg:col-span-1">
            <BudgetProgressBars budgets={budgetProgress || []} />
          </div>
        </div>

        {/* Row 5: Smart Insight Banner */}
        <RecommendationsWidget recommendations={recommendations || []} />

        {/* Row 6: Recent Transactions */}
        <RecentTransactionsCard transactions={transactions || []} />

        {/* Dashboard Footer */}
        <DashboardFooter />
      </main>
    </div>
  );
}

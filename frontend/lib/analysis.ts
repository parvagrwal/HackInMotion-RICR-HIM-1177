'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { reportActionError } from '@/lib/action-utils';

export interface CategorySummary {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  total: number;
  count: number;
}

export interface SpikeAlert {
  category: string;
  currentMonth: string;
  currentSpend: number;
  historicalAverage: number;
  percentageAbove: number;
}

export interface FinancialHealthScore {
  score: number;
  savingsRate: number;
  savingsPoints: number;
  budgetAdherence: number;
  budgetPoints: number;
  spikePenalty: number;
  breakdown: string;
}

export interface RecurringPayment {
  merchant: string;
  cadence: 'weekly' | 'monthly' | 'yearly';
  typicalAmount: number;
  monthlyCost: number;
  lastChargeDate: string;
  nextExpectedDate: string;
  transactionIds: string[];
}

type TransactionForRecurrence = {
  id: string;
  date: string;
  amount: number;
  merchant: string | null;
  description: string;
};

function normalizeMerchant(transaction: Pick<TransactionForRecurrence, 'merchant' | 'description'>) {
  return (transaction.merchant || transaction.description)
    .toLowerCase()
    .replace(/\d+/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCadence(days: number): RecurringPayment['cadence'] | null {
  if (days >= 6 && days <= 8) return 'weekly';
  if (days >= 25 && days <= 35) return 'monthly';
  if (days >= 330 && days <= 400) return 'yearly';
  return null;
}

function addDays(date: string, days: number) {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

/** Detect repeated merchant charges and store the current detected subscriptions. */
export async function getRecurringPayments(): Promise<RecurringPayment[]> {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    const { data, error } = await supabase
      .from('transactions')
      .select('id, date, amount, merchant, description')
      .eq('user_id', session.user.id)
      .eq('type', 'expense')
      .gte('date', startDate.toISOString().slice(0, 10))
      .gt('amount', 0)
      .order('date', { ascending: true });
    if (error) throw error;

    const grouped = new Map<string, TransactionForRecurrence[]>();
    for (const transaction of (data || []) as TransactionForRecurrence[]) {
      const normalizedMerchant = normalizeMerchant(transaction);
      if (!normalizedMerchant) continue;
      grouped.set(normalizedMerchant, [...(grouped.get(normalizedMerchant) || []), transaction]);
    }

    const recurring: Array<RecurringPayment & { normalizedMerchant: string }> = [];
    for (const [normalizedMerchant, charges] of grouped) {
      if (charges.length < 3) continue;
      const intervals = charges.slice(1).map((charge, index) =>
        Math.round((Date.parse(charge.date) - Date.parse(charges[index].date)) / 86_400_000),
      );
      const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      const cadence = getCadence(averageInterval);
      const amounts = charges.map((charge) => Math.abs(Number(charge.amount)));
      const typicalAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
      const amountVariance = Math.max(...amounts.map((amount) => Math.abs(amount - typicalAmount) / typicalAmount));
      const intervalVariance = Math.max(...intervals.map((interval) => Math.abs(interval - averageInterval)));
      if (!cadence || amountVariance > 0.15 || intervalVariance > 5) continue;

      const lastCharge = charges[charges.length - 1];
      const intervalDays = cadence === 'weekly' ? 7 : cadence === 'monthly' ? 30 : 365;
      recurring.push({
        merchant: lastCharge.merchant || lastCharge.description,
        normalizedMerchant,
        cadence,
        typicalAmount,
        monthlyCost: cadence === 'weekly' ? typicalAmount * 4.33 : cadence === 'yearly' ? typicalAmount / 12 : typicalAmount,
        lastChargeDate: lastCharge.date,
        nextExpectedDate: addDays(lastCharge.date, intervalDays),
        transactionIds: charges.map((charge) => charge.id),
      });
    }

    const detected = recurring.filter((payment) => payment.transactionIds.length >= 3);
    if (detected.length > 0) {
      const { error: saveError } = await supabase.from('recurring_payments').upsert(
        detected.map(({ normalizedMerchant, ...payment }) => ({
          user_id: session.user.id,
          merchant: payment.merchant,
          normalized_merchant: normalizedMerchant,
          cadence: payment.cadence,
          typical_amount: payment.typicalAmount,
          monthly_cost: payment.monthlyCost,
          last_charge_date: payment.lastChargeDate,
          next_expected_date: payment.nextExpectedDate,
          detection_status: 'detected',
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'user_id,normalized_merchant' },
      );
      if (saveError) throw saveError;

      const { error: markRecurringError } = await supabase.from('transactions').update({ is_recurring: true }).in(
        'id', detected.flatMap((payment) => payment.transactionIds),
      );
      if (markRecurringError) throw markRecurringError;
    }

    return detected.sort((a, b) => b.monthlyCost - a.monthlyCost);
  } catch (error) {
    reportActionError('Get recurring payments', error);
  }
}

/**
 * Get top spending categories for a user
 */
export async function getTopCategories(
  monthFilter?: string
): Promise<CategorySummary[]> {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    let query = supabase
      .from('transactions')
      .select('category, amount')
      .eq('user_id', session.user.id)
      .eq('type', 'expense');

    if (monthFilter) {
      const startDate = `${monthFilter}-01`;
      const endDate = new Date(monthFilter + '-01');
      endDate.setMonth(endDate.getMonth() + 1);
      const endDateStr = endDate.toISOString().split('T')[0];

      query = query.gte('date', startDate).lt('date', endDateStr);
    }

    const { data: transactions, error } = await query;
    if (error) throw error;

    // Group by category
    const categoryTotals = (transactions || []).reduce(
      (acc, tx) => {
        if (!acc[tx.category]) {
          acc[tx.category] = { total: 0, count: 0 };
        }
        acc[tx.category].total += tx.amount;
        acc[tx.category].count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>
    );

    const grandTotal = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.total, 0);

    return Object.entries(categoryTotals)
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: grandTotal > 0 ? (data.total / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  } catch (error) {
    reportActionError('Get top categories', error);
  }
}

/**
 * Get month-over-month spending trends
 */
export async function getMonthlyTrends(
  monthsBack: number = 6
): Promise<MonthlyTrend[]> {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    // Calculate date range
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('date, amount')
      .eq('user_id', session.user.id)
      .eq('type', 'expense')
      .gte('date', startDateStr);

    if (error) throw error;

    // Group by month
    const monthlyTotals = (transactions || []).reduce(
      (acc, tx) => {
        const month = tx.date.substring(0, 7); // YYYY-MM
        if (!acc[month]) {
          acc[month] = { total: 0, count: 0 };
        }
        acc[month].total += tx.amount;
        acc[month].count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>
    );

    return Object.entries(monthlyTotals)
      .map(([month, data]) => ({
        month,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  } catch (error) {
    reportActionError('Get monthly trends', error);
  }
}

/**
 * Detect spending spikes (>30% above historical average)
 */
export async function getSpikes(
  currentMonth: string
): Promise<SpikeAlert[]> {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    // Get historical data (last 6 months excluding current)
    const startDate = new Date(currentMonth + '-01');
    startDate.setMonth(startDate.getMonth() - 6);
    const startDateStr = startDate.toISOString().split('T')[0];

    const currentMonthEnd = new Date(currentMonth + '-01');
    currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
    const currentMonthEndStr = currentMonthEnd.toISOString().split('T')[0];

    // Get historical transactions
    const { data: historicalTx, error: historicalError } = await supabase
      .from('transactions')
      .select('category, amount, date')
      .eq('user_id', session.user.id)
      .eq('type', 'expense')
      .gte('date', startDateStr)
      .lt('date', currentMonth + '-01');

    if (historicalError) throw historicalError;

    // Get current month transactions
    const { data: currentTx, error: currentError } = await supabase
      .from('transactions')
      .select('category, amount, date')
      .eq('user_id', session.user.id)
      .eq('type', 'expense')
      .gte('date', currentMonth + '-01')
      .lt('date', currentMonthEndStr);

    if (currentError) throw currentError;

    // Calculate category averages
    const historicalAvgs = (historicalTx || []).reduce(
      (acc, tx) => {
        if (!acc[tx.category]) {
          acc[tx.category] = { total: 0, count: 0 };
        }
        acc[tx.category].total += tx.amount;
        acc[tx.category].count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>
    );

    // Calculate current month totals
    const currentTotals = (currentTx || []).reduce(
      (acc, tx) => {
        if (!acc[tx.category]) {
          acc[tx.category] = 0;
        }
        acc[tx.category] += tx.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    // Detect spikes
    const spikes: SpikeAlert[] = [];
    for (const [category, currentSpend] of Object.entries(currentTotals)) {
      if (!historicalAvgs[category]) continue;

      const historicalAvg = historicalAvgs[category].total / historicalAvgs[category].count;
      const percentageAbove = ((currentSpend - historicalAvg) / historicalAvg) * 100;

      if (percentageAbove > 30) {
        spikes.push({
          category,
          currentMonth,
          currentSpend,
          historicalAverage: historicalAvg,
          percentageAbove,
        });
      }
    }

    return spikes.sort((a, b) => b.percentageAbove - a.percentageAbove);
  } catch (error) {
    reportActionError('Get spending spikes', error);
  }
}

/**
 * Calculate financial health score (0-100)
 * Formula:
 * - Savings rate: 0-50 pts (0% or negative = 0, ≥20% = 50, linear between)
 * - Budget adherence: 0-30 pts (% of budgeted categories under target)
 * - Spike penalty: 20 pts if none flagged, 10 if one, 0 if two or more
 */
export async function getFinancialHealthScore(): Promise<FinancialHealthScore> {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    // Get monthly income from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('monthly_income')
      .eq('id', session.user.id)
      .single();

    if (profileError) throw profileError;

    const monthlyIncome = profile?.monthly_income || 0;

    // Get current month spending
    const currentMonthEnd = new Date(currentMonth + '-01');
    currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
    const currentMonthEndStr = currentMonthEnd.toISOString().split('T')[0];

    const { data: currentTx, error: txError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', session.user.id)
      .eq('type', 'expense')
      .gte('date', currentMonth + '-01')
      .lt('date', currentMonthEndStr);

    if (txError) throw txError;

    const totalSpending = (currentTx || []).reduce((sum, tx) => sum + tx.amount, 0);

    const { data: incomeTx, error: incomeError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', session.user.id)
      .eq('type', 'income')
      .gte('date', currentMonth + '-01')
      .lt('date', currentMonthEndStr);
    if (incomeError) throw incomeError;

    const importedIncome = (incomeTx || []).reduce((sum, tx) => sum + tx.amount, 0);
    const effectiveIncome = monthlyIncome > 0 ? monthlyIncome : importedIncome;

    // Calculate savings rate (0-50 points)
    const savingsRate = effectiveIncome > 0
      ? ((effectiveIncome - totalSpending) / effectiveIncome) * 100
      : 0;
    let savingsPoints = 0;
    if (savingsRate >= 20) {
      savingsPoints = 50;
    } else if (savingsRate > 0) {
      savingsPoints = (savingsRate / 20) * 50;
    }

    // Get budget adherence (0-30 points)
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('id, category, target_amount')
      .eq('user_id', session.user.id)
      .eq('month', currentMonth + '-01');

    if (budgetError) throw budgetError;

    let budgetPoints = 0;
    if ((budgets || []).length > 0) {
      const topCategories = await getTopCategories(currentMonth);
      const categorySpends = Object.fromEntries(topCategories.map((c) => [c.category, c.total]));

      let underBudget = 0;
      for (const budget of budgets || []) {
        const spent = categorySpends[budget.category] || 0;
        if (spent <= budget.target_amount) {
          underBudget++;
        }
      }

      const budgetAdherence = ((budgets || []).length > 0)
        ? (underBudget / (budgets || []).length) * 100
        : 0;
      budgetPoints = (budgetAdherence / 100) * 30;
    }

    // Get spike penalty (0-20 points, but inverted)
    const spikes = await getSpikes(currentMonth);
    let spikePenalty = 0;
    if (spikes.length === 0) {
      spikePenalty = 20;
    } else if (spikes.length === 1) {
      spikePenalty = 10;
    }

    const totalScore = Math.round(savingsPoints + budgetPoints + spikePenalty);

    return {
      score: Math.min(100, totalScore),
      savingsRate: Math.round(savingsRate * 10) / 10,
      savingsPoints: Math.round(savingsPoints),
      budgetAdherence: Math.round((budgetPoints / 30) * 100),
      budgetPoints: Math.round(budgetPoints),
      spikePenalty,
      breakdown: `Savings: ${Math.round(savingsPoints)}pts, Budget: ${Math.round(budgetPoints)}pts, Spike: ${spikePenalty}pts`,
    };
  } catch (error) {
    reportActionError('Get financial health score', error);
  }
}

/**
 * Generate personalized recommendations based on spending patterns
 */
export async function getRecommendations(): Promise<string[]> {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const recommendations: string[] = [];

    const recurringPayments = await getRecurringPayments();
    if (recurringPayments.length > 0) {
      const monthlyCost = recurringPayments.reduce((sum, payment) => sum + payment.monthlyCost, 0);
      recommendations.push(
        `You have ${recurringPayments.length} recurring payment${recurringPayments.length === 1 ? '' : 's'} costing $${monthlyCost.toFixed(2)} per month. Review subscriptions you no longer use.`,
      );
    }

    // Get top categories
    const topCategories = await getTopCategories(currentMonth);
    if (topCategories.length > 0) {
      const topCat = topCategories[0];
      recommendations.push(
        `Your highest spending category is ${topCat.category} at $${topCat.total.toFixed(2)} (${topCat.percentage.toFixed(1)}% of total). Consider setting a budget to control this.`
      );
    }

    // Get spikes
    const spikes = await getSpikes(currentMonth);
    if (spikes.length > 0) {
      const spike = spikes[0];
      const increase = spike.currentSpend - spike.historicalAverage;
      recommendations.push(
        `Your ${spike.category} spending is ${spike.percentageAbove.toFixed(0)}% above usual (${increase.toFixed(2)} more). Review recent purchases.`
      );
    }

    // Get score
    const score = await getFinancialHealthScore();
    if (score.savingsRate < 5) {
      recommendations.push(
        `You're currently saving less than 5% of income. Try reducing discretionary spending in ${
          topCategories[1]?.category || 'Shopping'
        } or ${topCategories[2]?.category || 'Entertainment'}.`
      );
    }

    // Ensure we have 2-3 recommendations
    if (recommendations.length === 0) {
      recommendations.push('Great job! Your spending is well-balanced. Keep up the good habits.');
    }

    return recommendations.slice(0, 3);
  } catch (error) {
    reportActionError('Get recommendations', error);
  }
}

'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getTopCategories } from '@/lib/analysis';
import { ActionError, reportActionError } from '@/lib/action-utils';

export async function getMonthlyIncome() {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('profiles')
    .select('monthly_income')
    .eq('id', session.user.id)
    .maybeSingle();
    if (error) throw error;
    return Number(data?.monthly_income || 0);
  } catch (error) { reportActionError('Get monthly income', error); }
}

export async function updateMonthlyIncome(monthlyIncome: number) {
  try {
    if (!Number.isFinite(monthlyIncome) || monthlyIncome < 0 || monthlyIncome > 10_000_000) {
      throw new ActionError('Monthly income must be between 0 and 10,000,000.', 'VALIDATION_ERROR');
    }
    monthlyIncome = Math.round(monthlyIncome * 100) / 100;

  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: session.user.id, monthly_income: monthlyIncome }, { onConflict: 'id' });
    if (error) throw error;

    revalidatePath('/dashboard');
  } catch (error) { reportActionError('Update monthly income', error); }
}

export async function getBudgetProgress() {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    // Get budgets for current month
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('month', `${currentMonth}-01`);

    if (budgetError) throw budgetError;

    if (!budgets || budgets.length === 0) {
      return [];
    }

    // Get spending by category
    const topCategories = await getTopCategories(currentMonth);
    const categorySpends = Object.fromEntries(
      topCategories.map((c) => [c.category, c.total])
    );

    // Map to budget progress
    return budgets.map((budget) => ({
      category: budget.category,
      spent: categorySpends[budget.category] || 0,
      target: budget.target_amount,
    }));
  } catch (error) {
    reportActionError('Get budget progress', error);
  }
}

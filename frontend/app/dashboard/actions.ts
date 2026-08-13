'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getTopCategories } from '@/lib/analysis';

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
    console.error('Get budget progress error:', error);
    return [];
  }
}

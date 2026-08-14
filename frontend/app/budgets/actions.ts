'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ActionError, reportActionError, requireDate, requireId, requireNonEmptyString, requirePositiveAmount } from '@/lib/action-utils';

function requireMonth(month: unknown): string {
  if (typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
    throw new ActionError('Month must use YYYY-MM.', 'VALIDATION_ERROR');
  }
  return requireDate(`${month}-01`, 'Month');
}

export async function createBudget(data: {
  category: string;
  month: string;
  target_amount: number;
}) {
  try {
    const category = requireNonEmptyString(data.category, 'Category', 100);
    const month = requireMonth(data.month);
    const targetAmount = requirePositiveAmount(data.target_amount, 'Budget amount');
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('budgets')
      .insert({
        user_id: session.user.id,
        category, month, target_amount: targetAmount,
      });

    if (error) throw error;

    revalidatePath('/budgets');
    return { success: true };
  } catch (error) {
    reportActionError('Create budget', error);
  }
}

export async function deleteBudget(id: string) {
  try {
    id = requireId(id, 'budget ID');
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { data: deleted, error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select('id');

    if (error) throw error;
    if (!deleted || deleted.length !== 1) throw new ActionError('Budget not found or already deleted.', 'NOT_FOUND');

    revalidatePath('/budgets');
    return { success: true };
  } catch (error) {
    reportActionError('Delete budget', error);
  }
}

export async function getBudgets(month: string) {
  try {
    const monthStart = requireMonth(month);
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('month', monthStart)
      .order('category');

    if (error) throw error;

    return data || [];
  } catch (error) {
    reportActionError('Get budgets', error);
  }
}

export async function updateBudget(id: string, target_amount: number) {
  try {
    id = requireId(id, 'budget ID');
    target_amount = requirePositiveAmount(target_amount, 'Budget amount');
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { data: updated, error } = await supabase
      .from('budgets')
      .update({ target_amount })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select('id');

    if (error) throw error;
    if (!updated || updated.length !== 1) throw new ActionError('Budget not found or could not be updated.', 'NOT_FOUND');

    revalidatePath('/budgets');
    return { success: true };
  } catch (error) {
    reportActionError('Update budget', error);
  }
}

// Goals

export async function createGoal(data: {
  name: string;
  target_amount: number;
  deadline?: string;
}) {
  try {
    const name = requireNonEmptyString(data.name, 'Goal name', 150);
    const targetAmount = requirePositiveAmount(data.target_amount, 'Goal amount');
    const deadline = data.deadline ? requireDate(data.deadline, 'Deadline') : null;
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('goals')
      .insert({
        user_id: session.user.id,
        name, target_amount: targetAmount,
        current_amount: 0,
        deadline,
      });

    if (error) throw error;

    revalidatePath('/budgets');
    return { success: true };
  } catch (error) {
    reportActionError('Create goal', error);
  }
}

export async function updateGoal(id: string, current_amount: number) {
  try {
    id = requireId(id, 'goal ID');
    if (typeof current_amount !== 'number' || !Number.isFinite(current_amount) || current_amount < 0 || current_amount > 10_000_000) {
      throw new ActionError('Current amount must be between 0 and 10,000,000.', 'VALIDATION_ERROR');
    }
    current_amount = Math.round(current_amount * 100) / 100;
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { data: updated, error } = await supabase
      .from('goals')
      .update({ current_amount })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select('id');

    if (error) throw error;
    if (!updated || updated.length !== 1) throw new ActionError('Goal not found or could not be updated.', 'NOT_FOUND');

    revalidatePath('/budgets');
    return { success: true };
  } catch (error) {
    reportActionError('Update goal', error);
  }
}

export async function deleteGoal(id: string) {
  try {
    id = requireId(id, 'goal ID');
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { data: deleted, error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select('id');

    if (error) throw error;
    if (!deleted || deleted.length !== 1) throw new ActionError('Goal not found or already deleted.', 'NOT_FOUND');

    revalidatePath('/budgets');
    return { success: true };
  } catch (error) {
    reportActionError('Delete goal', error);
  }
}

export async function getGoals() {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', session.user.id)
      .order('deadline', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    reportActionError('Get goals', error);
  }
}

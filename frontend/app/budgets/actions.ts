'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function createBudget(data: {
  category: string;
  month: string;
  target_amount: number;
}) {
  try {
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
        category: data.category,
        month: `${data.month}-01`,
        target_amount: data.target_amount,
      });

    if (error) throw error;

    revalidatePath('/budgets');
    return { success: true };
  } catch (error) {
    console.error('Create budget error:', error);
    throw error;
  }
}

export async function deleteBudget(id: string) {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) throw error;

    revalidatePath('/budgets');
    return { success: true };
  } catch (error) {
    console.error('Delete budget error:', error);
    throw error;
  }
}

export async function getBudgets(month: string) {
  try {
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
      .eq('month', `${month}-01`)
      .order('category');

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Get budgets error:', error);
    throw error;
  }
}

export async function updateBudget(id: string, target_amount: number) {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('budgets')
      .update({ target_amount })
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) throw error;

    revalidatePath('/budgets');
    return { success: true };
  } catch (error) {
    console.error('Update budget error:', error);
    throw error;
  }
}

// Goals

export async function createGoal(data: {
  name: string;
  target_amount: number;
  deadline?: string;
}) {
  try {
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
        name: data.name,
        target_amount: data.target_amount,
        current_amount: 0,
        deadline: data.deadline || null,
      });

    if (error) throw error;

    revalidatePath('/budgets');
    return { success: true };
  } catch (error) {
    console.error('Create goal error:', error);
    throw error;
  }
}

export async function updateGoal(id: string, current_amount: number) {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('goals')
      .update({ current_amount })
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) throw error;

    revalidatePath('/budgets');
    return { success: true };
  } catch (error) {
    console.error('Update goal error:', error);
    throw error;
  }
}

export async function deleteGoal(id: string) {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) throw error;

    revalidatePath('/budgets');
    return { success: true };
  } catch (error) {
    console.error('Delete goal error:', error);
    throw error;
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
    console.error('Get goals error:', error);
    throw error;
  }
}

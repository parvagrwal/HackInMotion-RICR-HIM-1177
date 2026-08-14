'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { categorizeTransaction } from '@/lib/categorize';
import { revalidatePath } from 'next/cache';

export async function addTransaction(formData: {
  date: string;
  description: string;
  merchant?: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
}) {
  try {
    const supabase = createServerComponentClient({ cookies });

    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    // Categorize the transaction
    const category = categorizeTransaction(formData.merchant, formData.description);

    // Insert transaction
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: session.user.id,
        date: formData.date,
        description: formData.description,
        merchant: formData.merchant,
        amount: formData.amount,
        type: formData.type,
        category,
        source: 'manual',
      });

    if (error) throw error;

    revalidatePath('/transactions');
    return { success: true, category };
  } catch (error) {
    console.error('Add transaction error:', error);
    throw error;
  }
}

export async function deleteTransaction(id: string) {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) throw error;

    revalidatePath('/transactions');
    return { success: true };
  } catch (error) {
    console.error('Delete transaction error:', error);
    throw error;
  }
}

export async function updateTransaction(id: string, updates: any) {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    // If merchant or description changed, recategorize
    if (updates.merchant !== undefined || updates.description !== undefined) {
      const merchant = updates.merchant;
      const description = updates.description;
      updates.category = categorizeTransaction(merchant, description);
    }

    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) throw error;

    revalidatePath('/transactions');
    return { success: true };
  } catch (error) {
    console.error('Update transaction error:', error);
    throw error;
  }
}

export async function getTransactions(filters?: {
  category?: string;
  month?: string;
}) {
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
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false });

    if (filters?.category && filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }

    if (filters?.month) {
      const startDate = `${filters.month}-01`;
      const endDate = new Date(filters.month + '-01');
      endDate.setMonth(endDate.getMonth() + 1);
      const endDateStr = endDate.toISOString().split('T')[0];

      query = query.gte('date', startDate).lt('date', endDateStr);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Get transactions error:', error);
    throw error;
  }
}

/**
 * Batch import transactions from CSV
 * Handles deduplication, error tracking, and auto-categorization
 */
export async function importTransactionsCSV(
  transactions: Array<{
    date: string;
    description: string;
    merchant?: string;
    amount: number;
    type: 'income' | 'expense' | 'transfer';
  }>
) {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    // Validate and categorize all transactions
    const validated = transactions
      .map((tx) => {
        // Validate required fields
        if (!tx.date || !tx.description || tx.amount === undefined || tx.amount === null) {
          return { error: 'Missing required fields: date, description, amount' };
        }

        // Parse date
        const dateObj = new Date(tx.date);
        if (isNaN(dateObj.getTime())) {
          return { error: `Invalid date: ${tx.date}` };
        }

        // Categorize
        const category = categorizeTransaction(tx.merchant, tx.description);

        return {
          user_id: session.user.id,
          date: tx.date,
          description: tx.description,
          merchant: tx.merchant || null,
          amount: tx.amount,
          type: tx.type,
          category,
          source: 'csv',
          created_at: new Date().toISOString(),
        };
      })
      .filter((item): item is any => !('error' in item));

    if (validated.length === 0) {
      throw new Error('No valid transactions to import');
    }

    // Get existing transactions for deduplication
    const { data: existingTx } = await supabase
      .from('transactions')
      .select('date, description, amount')
      .eq('user_id', session.user.id);

    const existingSet = new Set(
      (existingTx || []).map((tx) => `${tx.date}|${tx.description}|${tx.amount}`)
    );

    // Filter out duplicates
    const uniqueTx = validated.filter(
      (tx) => !existingSet.has(`${tx.date}|${tx.description}|${tx.amount}`)
    );

    // Insert transactions in batches
    const batchSize = 500;
    for (let i = 0; i < uniqueTx.length; i += batchSize) {
      const batch = uniqueTx.slice(i, i + batchSize);
      const { error } = await supabase
        .from('transactions')
        .insert(batch);

      if (error) throw error;
    }

    revalidatePath('/transactions');

    return {
      success: true,
      imported: uniqueTx.length,
      duplicates: validated.length - uniqueTx.length,
    };
  } catch (error) {
    console.error('CSV import error:', error);
    throw error;
  }
}

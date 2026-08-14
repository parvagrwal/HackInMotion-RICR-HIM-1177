'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { categorizeTransaction } from '@/lib/categorize';
import { revalidatePath } from 'next/cache';
import { ActionError, reportActionError, requireDate, requireId, requireNonEmptyString, requirePositiveAmount } from '@/lib/action-utils';

const TRANSACTION_TYPES = ['income', 'expense', 'transfer'] as const;

function validateTransaction(input: {
  date: string; description: string; merchant?: string; amount: number; type: string;
}) {
  if (!TRANSACTION_TYPES.includes(input.type as (typeof TRANSACTION_TYPES)[number])) {
    throw new ActionError('Transaction type must be income, expense, or transfer.', 'VALIDATION_ERROR');
  }
  const merchant = input.merchant?.trim();
  if (merchant && merchant.length > 200) throw new ActionError('Merchant must be 200 characters or fewer.', 'VALIDATION_ERROR');
  return {
    date: requireDate(input.date), description: requireNonEmptyString(input.description, 'Description'),
    merchant: merchant || undefined, amount: requirePositiveAmount(input.amount), type: input.type as (typeof TRANSACTION_TYPES)[number],
  };
}

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

    const transaction = validateTransaction(formData);
    const category = categorizeTransaction(transaction.merchant, transaction.description);

    // Insert transaction
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: session.user.id,
        ...transaction,
        category,
        source: 'manual',
      });

    if (error) throw error;

    revalidatePath('/transactions');
    return { success: true, category };
  } catch (error) {
    reportActionError('Add transaction', error);
  }
}

export async function deleteTransaction(id: string) {
  try {
    id = requireId(id, 'transaction ID');
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { data: deleted, error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select('id');

    if (error) throw error;
    if (!deleted || deleted.length !== 1) throw new ActionError('Transaction not found or already deleted.', 'NOT_FOUND');

    revalidatePath('/transactions');
    return { success: true };
  } catch (error) {
    reportActionError('Delete transaction', error);
  }
}

export async function updateTransaction(id: string, updates: Record<string, unknown>) {
  try {
    id = requireId(id, 'transaction ID');
    const allowed = ['date', 'description', 'merchant', 'amount', 'type'];
    const supplied = Object.keys(updates);
    if (!supplied.length || supplied.some((key) => !allowed.includes(key))) {
      throw new ActionError('Provide at least one valid transaction field to update.', 'VALIDATION_ERROR');
    }
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }
    const { data: current, error: currentError } = await supabase
      .from('transactions').select('date, description, merchant, amount, type').eq('id', id).eq('user_id', session.user.id).maybeSingle();
    if (currentError) throw currentError;
    if (!current) throw new ActionError('Transaction not found.', 'NOT_FOUND');
    const candidate = { ...current, ...updates };
    const checked = validateTransaction(candidate as { date: string; description: string; merchant?: string; amount: number; type: string; });
    const safeUpdates: Record<string, unknown> = {};
    for (const key of supplied) safeUpdates[key] = checked[key as keyof typeof checked];
    // If merchant or description changed, recategorize
    if (updates.merchant !== undefined || updates.description !== undefined) {
      safeUpdates.category = categorizeTransaction(checked.merchant, checked.description);
    }

    const { data: updated, error } = await supabase
      .from('transactions')
      .update(safeUpdates)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select('id');

    if (error) throw error;
    if (!updated || updated.length !== 1) throw new ActionError('Transaction not found or could not be updated.', 'NOT_FOUND');

    revalidatePath('/transactions');
    return { success: true };
  } catch (error) {
    reportActionError('Update transaction', error);
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
    reportActionError('Get transactions', error);
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

    if (!Array.isArray(transactions) || transactions.length === 0 || transactions.length > 5_000) {
      throw new ActionError('Upload between 1 and 5,000 transactions at a time.', 'VALIDATION_ERROR');
    }
    const invalidRows: number[] = [];
    const validated = transactions.flatMap((tx, index) => {
      try {
        const safe = validateTransaction(tx);
        return [{
          user_id: session.user.id,
          ...safe, merchant: safe.merchant || null,
          category: categorizeTransaction(safe.merchant, safe.description),
          source: 'csv',
          created_at: new Date().toISOString(),
        }];
      } catch { invalidRows.push(index + 1); return []; }
    });

    if (validated.length === 0) {
      throw new ActionError(`No valid transactions to import. Invalid rows: ${invalidRows.slice(0, 10).join(', ')}.`, 'VALIDATION_ERROR');
    }

    // Get existing transactions for deduplication
    const { data: existingTx, error: existingError } = await supabase
      .from('transactions')
      .select('date, description, amount')
      .eq('user_id', session.user.id);
    if (existingError) throw existingError;

    const existingSet = new Set(
      (existingTx || []).map((tx) => `${tx.date}|${tx.description}|${tx.amount}`)
    );

    // Filter out duplicates
    const uniqueTx = validated.filter(
      (tx) => !existingSet.has(`${tx.date}|${tx.description}|${tx.amount}`)
    );

    // A single database statement is atomic: it either creates all unique rows or none.
    if (uniqueTx.length > 0) {
      const { error } = await supabase.from('transactions').insert(uniqueTx);
      if (error) throw error;
    }

    revalidatePath('/transactions');

    return {
      success: true,
      imported: uniqueTx.length,
      duplicates: validated.length - uniqueTx.length,
      invalid: invalidRows.length,
    };
  } catch (error) {
    reportActionError('CSV import', error);
  }
}

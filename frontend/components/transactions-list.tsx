'use client';

import { useState, useEffect } from 'react';
import { getTransactions, deleteTransaction } from '@/app/transactions/actions';
import { CATEGORIES } from '@/lib/constants';

interface Transaction {
  id: string;
  date: string;
  description: string;
  merchant?: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  is_recurring: boolean;
  source: string;
  created_at: string;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'Food & Dining': '🍔',
  Shopping: '🛒',
  Travel: '✈️',
  Transportation: '🚗',
  'Bills & Utilities': '⚡',
  Subscriptions: '🎧',
  Entertainment: '🍿',
  Health: '💊',
  Housing: '🏠',
  Personal: '👤',
  Uncategorized: '📦',
};

export function TransactionsList({ refresh }: { refresh: boolean }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await getTransactions({
          category: category === 'All' ? undefined : category,
          month,
        });
        setTransactions(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [category, month, refresh]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    setError('');
    setDeletingId(id);

    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
    } finally {
      setDeletingId(null);
    }
  };

  const totalAmount = transactions.reduce(
    (sum, tx) => sum + (tx.type === 'expense' ? -tx.amount : tx.amount),
    0
  );

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">
            Transaction History
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#10172d]">
            All Transactions
          </h3>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Category Select */}
          <select
            value={category}
            disabled={loading || deletingId !== null}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#10172d] outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Month Picker */}
          <input
            type="month"
            value={month}
            disabled={loading || deletingId !== null}
            onChange={(e) => setMonth(e.target.value)}
            className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#10172d] outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Net Total</p>
          <p className={`text-lg sm:text-xl font-bold font-serif ${totalAmount >= 0 ? 'text-[#0d9488]' : 'text-red-500'}`}>
            {totalAmount < 0 ? '-' : '+'}₹{Math.abs(totalAmount).toLocaleString('en-IN')}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Count</p>
          <p className="text-lg sm:text-xl font-bold font-serif text-[#10172d]">{transactions.length}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Average</p>
          <p className="text-lg sm:text-xl font-bold font-serif text-[#10172d]">
            ₹{transactions.length > 0 ? Math.round(Math.abs(totalAmount) / transactions.length).toLocaleString('en-IN') : '0'}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Filtered By</p>
          <p className="text-lg sm:text-xl font-bold font-serif text-[#10172d] truncate">
            {category === 'All' ? 'All' : category}
          </p>
        </div>
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs font-medium">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs font-medium">
          No transactions found for this month/category. Add one above!
        </div>
      ) : (
        <div>
          {/* Mobile Card List */}
          <div className="md:hidden space-y-3">
            {transactions.map((tx) => {
              const isExpense = tx.type === 'expense';
              const emoji = CATEGORY_EMOJIS[tx.category] || '💳';
              return (
                <div key={tx.id} className="p-4 border border-slate-100 rounded-2xl bg-white space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-base">
                        {emoji}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[#10172d]">{tx.merchant || tx.description}</p>
                        <p className="text-[10px] text-slate-400">{tx.date}</p>
                      </div>
                    </div>

                    <p className={`font-serif font-bold text-xs ${isExpense ? 'text-[#10172d]' : 'text-[#0d9488]'}`}>
                      {isExpense ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                    <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold">
                      {tx.category}
                    </span>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      disabled={deletingId !== null}
                      className="text-[10px] text-red-500 hover:text-red-700 font-semibold"
                    >
                      {deletingId === tx.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3 pl-2">Date</th>
                  <th className="pb-3">Merchant / Description</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const isExpense = tx.type === 'expense';
                  const emoji = CATEGORY_EMOJIS[tx.category] || '📦';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pl-2 font-medium text-slate-500">{tx.date}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{emoji}</span>
                          <div>
                            <p className="font-bold text-[#10172d]">{tx.merchant || tx.description}</p>
                            {tx.merchant && tx.description !== tx.merchant && (
                              <p className="text-[10px] text-slate-400">{tx.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 font-bold text-[10px]">
                          {tx.category}
                        </span>
                      </td>
                      <td className={`py-3.5 text-right font-serif font-bold text-xs ${isExpense ? 'text-[#10172d]' : 'text-[#0d9488]'}`}>
                        {isExpense ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          disabled={deletingId !== null}
                          className="text-slate-300 hover:text-red-600 transition-colors text-xs font-semibold px-2 py-1 rounded-lg hover:bg-red-50"
                          title="Delete transaction"
                        >
                          {deletingId === tx.id ? '...' : '🗑️'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

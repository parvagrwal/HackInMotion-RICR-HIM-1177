'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

  const totalAmount = transactions.reduce((sum, tx) => sum + (tx.type === 'expense' ? -tx.amount : tx.amount), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 pb-4 border-b">
          <div className="flex-1 min-w-0">
            <label className="text-sm font-medium mb-1 block">Category</label>
            <select
              value={category}
              disabled={loading || deletingId !== null}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="All">All</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-0">
            <label className="text-sm font-medium mb-1 block">Month</label>
            <Input
              type="month"
              value={month}
              disabled={loading || deletingId !== null}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg sm:text-2xl font-bold">${totalAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Count</p>
            <p className="text-lg sm:text-2xl font-bold">{transactions.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg</p>
            <p className="text-lg sm:text-2xl font-bold">
              ${transactions.length > 0 ? (totalAmount / transactions.length).toFixed(2) : '0.00'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="text-lg sm:text-2xl font-bold">{category === 'All' ? '—' : category}</p>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found. Add one to get started!
          </div>
        ) : (
          <div className="space-y-3 md:space-y-0">
            {/* Mobile card view */}
            <div className="md:hidden space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 border rounded-lg bg-muted/20">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>
                    <p className="font-bold text-sm">{tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="inline-block px-2 py-1 bg-secondary/20 text-secondary-foreground rounded text-xs font-medium">
                      {tx.category}
                    </span>
                    <span className="text-xs capitalize text-muted-foreground">{tx.type}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(tx.id)}
                      className="text-destructive hover:text-destructive text-xs h-8"
                      disabled={deletingId !== null}
                    >
                      {deletingId === tx.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left text-xs font-medium text-muted-foreground">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2">Merchant</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/50">
                      <td className="py-3">{tx.date}</td>
                      <td className="py-3">{tx.description}</td>
                      <td className="py-3 text-muted-foreground">{tx.merchant || '—'}</td>
                      <td className="py-3">
                        <span className="inline-block px-2 py-1 bg-secondary/20 text-secondary-foreground rounded text-xs font-medium">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium">${tx.amount.toFixed(2)}</td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(tx.id)}
                          className="text-destructive hover:text-destructive"
                          disabled={deletingId !== null}
                        >
                          {deletingId === tx.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

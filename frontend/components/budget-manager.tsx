'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CATEGORIES } from '@/lib/constants';
import {
  createBudget,
  getBudgets,
  deleteBudget,
} from '@/app/budgets/actions';

interface Budget {
  id: string;
  category: string;
  target_amount: number;
  month: string;
}

export function BudgetManager({ month }: { month: string }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: 'Food',
    target_amount: '',
  });

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);
        const data = await getBudgets(month);
        setBudgets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load budgets');
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, [month]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const amount = parseFloat(newBudget.target_amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be positive');
      }

      // Check for existing budget
      if (budgets.some((b) => b.category === newBudget.category)) {
        throw new Error('Budget for this category already exists');
      }

      await createBudget({
        category: newBudget.category,
        month,
        target_amount: amount,
      });

      // Refresh
      const data = await getBudgets(month);
      setBudgets(data);

      setNewBudget({ category: 'Food', target_amount: '' });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create budget');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this budget?')) return;

    try {
      await deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete budget');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Monthly Budgets</CardTitle>
        {!showForm && (
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            variant="outline"
          >
            Add Budget
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleAdd} className="space-y-4 pb-4 border-b">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={newBudget.category}
                onChange={(e) =>
                  setNewBudget((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Amount</label>
              <Input
                type="number"
                placeholder="0.00"
                value={newBudget.target_amount}
                onChange={(e) =>
                  setNewBudget((prev) => ({
                    ...prev,
                    target_amount: e.target.value,
                  }))
                }
                step="0.01"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Create
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No budgets yet. Create one to track spending by category.
          </div>
        ) : (
          <div className="space-y-3">
            {budgets.map((budget) => (
              <div key={budget.id} className="flex items-center justify-between p-3 rounded border border-border hover:bg-muted/30">
                <div>
                  <p className="font-medium">{budget.category}</p>
                  <p className="text-sm text-muted-foreground">
                    Budget: ${budget.target_amount.toFixed(2)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(budget.id)}
                  className="text-destructive hover:text-destructive"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

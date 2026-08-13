'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  createGoal,
  getGoals,
  deleteGoal,
  updateGoal,
} from '@/app/budgets/actions';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
}

export function GoalsManager() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    target_amount: '',
    deadline: '',
  });

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const data = await getGoals();
        setGoals(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load goals');
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const amount = parseFloat(newGoal.target_amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be positive');
      }

      if (!newGoal.name.trim()) {
        throw new Error('Goal name is required');
      }

      await createGoal({
        name: newGoal.name,
        target_amount: amount,
        deadline: newGoal.deadline || undefined,
      });

      // Refresh
      const data = await getGoals();
      setGoals(data);

      setNewGoal({ name: '', target_amount: '', deadline: '' });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this goal?')) return;

    try {
      await deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete goal');
    }
  };

  const handleUpdateProgress = async (id: string, currentAmount: number) => {
    try {
      await updateGoal(id, currentAmount);
      const data = await getGoals();
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Savings Goals</CardTitle>
        {!showForm && (
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            variant="outline"
          >
            Add Goal
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
              <label className="text-sm font-medium">Goal Name</label>
              <Input
                type="text"
                placeholder="e.g., Vacation Fund"
                value={newGoal.name}
                onChange={(e) =>
                  setNewGoal((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Amount</label>
              <Input
                type="number"
                placeholder="0.00"
                value={newGoal.target_amount}
                onChange={(e) =>
                  setNewGoal((prev) => ({
                    ...prev,
                    target_amount: e.target.value,
                  }))
                }
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deadline (optional)</label>
              <Input
                type="date"
                value={newGoal.deadline}
                onChange={(e) =>
                  setNewGoal((prev) => ({ ...prev, deadline: e.target.value }))
                }
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
        ) : goals.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No goals yet. Set one to start saving!
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const progress = (goal.current_amount / goal.target_amount) * 100;
              return (
                <div key={goal.id} className="border border-border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{goal.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${goal.current_amount.toFixed(2)} / ${goal.target_amount.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(goal.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {Math.round(progress)}% complete
                    {goal.deadline && ` • Due: ${goal.deadline}`}
                  </div>

                  {/* Quick update */}
                  <div className="mt-3 flex gap-2">
                    <Input
                      type="number"
                      placeholder="Add amount"
                      step="0.01"
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          const input = e.currentTarget;
                          const amount = parseFloat(input.value);
                          if (!isNaN(amount) && amount > 0) {
                            await handleUpdateProgress(
                              goal.id,
                              goal.current_amount + amount
                            );
                            input.value = '';
                          }
                        }
                      }}
                      className="text-sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

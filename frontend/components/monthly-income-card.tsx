'use client';

import { useState } from 'react';
import { updateMonthlyIncome } from '@/app/dashboard/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function MonthlyIncomeCard({ initialIncome }: { initialIncome: number }) {
  const [income, setIncome] = useState(initialIncome ? String(initialIncome) : '');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const value = Number(income);
    if (!Number.isFinite(value) || value < 0) {
      setMessage('Enter zero or a positive amount.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      await updateMonthlyIncome(value);
      setMessage('Monthly income saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save monthly income.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Monthly income</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">Used as the savings-rate baseline. Imported income is used when this is zero.</p>
        <div className="flex gap-2">
          <Input type="number" min="0" step="0.01" value={income} onChange={(event) => setIncome(event.target.value)} placeholder="0.00" aria-label="Monthly income" />
          <Button type="button" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </CardContent>
    </Card>
  );
}

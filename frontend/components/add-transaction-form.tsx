'use client';

import { useState } from 'react';
import { addTransaction } from '@/app/transactions/actions';

export function AddTransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    merchant: '',
    amount: '',
    type: 'expense' as 'income' | 'expense' | 'transfer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be a positive number');
      }

      if (!formData.date || !formData.description) {
        throw new Error('Date and description are required');
      }

      await addTransaction({
        date: formData.date,
        description: formData.description,
        merchant: formData.merchant || undefined,
        amount,
        type: formData.type,
      });

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        merchant: '',
        amount: '',
        type: 'expense',
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-1">
          <div className="text-xs font-bold tracking-widest text-[#0d9488] uppercase">
            Quick Entry
          </div>
          <span className="text-base">📝</span>
        </div>

        <h3 className="text-2xl font-serif font-bold text-[#10172d] mb-6">
          Add Transaction
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100">
              {error}
            </div>
          )}



          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="date" className="text-xs font-bold text-[#10172d]">
                Date
              </label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-[#10172d] outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="amount" className="text-xs font-bold text-[#10172d]">
                Amount (₹)
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#10172d] outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="text-xs font-bold text-[#10172d]">
              Description
            </label>
            <input
              id="description"
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Dinner at Swiggy, Groceries"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-[#10172d] outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="merchant" className="text-xs font-bold text-[#10172d]">
              Merchant / Store (Optional)
            </label>
            <input
              id="merchant"
              type="text"
              name="merchant"
              value={formData.merchant}
              onChange={handleChange}
              placeholder="e.g. Swiggy, Amazon, Netflix"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-[#10172d] outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#10172d] text-white text-xs font-bold hover:bg-[#18213d] transition-colors disabled:opacity-50 shadow-sm mt-2"
          >
            {loading ? 'Adding Transaction...' : 'Add Transaction +'}
          </button>
        </form>
      </div>
    </div>
  );
}

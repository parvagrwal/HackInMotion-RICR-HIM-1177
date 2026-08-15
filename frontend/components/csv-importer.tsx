'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { importTransactionsCSV } from '@/app/transactions/actions';

type CSVRow = Record<string, string | undefined>;

export function CSVImporter({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const normalizeDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const d = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    }
    throw new Error(`Invalid date format: ${dateStr}`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccessCount(null);
    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as CSVRow[];
          const headers = results.meta.fields ?? [];

          if (headers.length === 0) {
            throw new Error('CSV file is empty');
          }

          const dataRows = rows.filter((row) =>
            Object.values(row).some((val) => val !== null && val !== '')
          );

          if (dataRows.length === 0) {
            throw new Error('No data rows found in CSV');
          }

          const findColumn = (keywords: string[]) =>
            headers.find((header) =>
              keywords.some((kw) => header.toLowerCase().includes(kw.toLowerCase()))
            );

          const dateCol = findColumn(['date', 'txn date', 'transaction date', 'posted date']);
          const descCol = findColumn(['description', 'narration', 'note', 'memo']);
          const merchantCol = findColumn(['merchant', 'vendor', 'store', 'payee']);
          const amountCol = findColumn(['amount', 'value']);
          const debitCol = findColumn(['debit', 'withdrawal']);
          const creditCol = findColumn(['credit', 'deposit']);

          if (!dateCol || !descCol || (!amountCol && !debitCol && !creditCol)) {
            throw new Error('CSV must have Date, Description, and Amount columns.');
          }

          const transactions = dataRows
            .map((row) => {
              try {
                const date = normalizeDate(row[dateCol]?.toString().trim() || '');
                const description = row[descCol]?.toString().trim() || '';
                const merchant = merchantCol ? row[merchantCol]?.toString().trim() : undefined;
                const parseAmount = (val: string | undefined) =>
                  parseFloat((val || '').replace(/[^0-9.-]/g, ''));
                const debit = debitCol ? parseAmount(row[debitCol]?.toString().trim()) : NaN;
                const credit = creditCol ? parseAmount(row[creditCol]?.toString().trim()) : NaN;
                const signedAmount = amountCol
                  ? parseAmount(row[amountCol]?.toString().trim())
                  : !isNaN(credit) && credit !== 0
                    ? credit
                    : !isNaN(debit) && debit !== 0
                      ? -debit
                      : NaN;

                if (!date || !description || isNaN(signedAmount) || signedAmount === 0) {
                  return null;
                }

                return {
                  date,
                  description,
                  merchant: merchant || undefined,
                  amount: Math.abs(signedAmount),
                  type: (signedAmount > 0 ? 'income' : 'expense') as 'income' | 'expense' | 'transfer',
                };
              } catch {
                return null;
              }
            })
            .filter((t): t is NonNullable<typeof t> => t !== null);

          if (transactions.length === 0) {
            throw new Error('No valid transaction rows found in CSV file.');
          }

          const imported = await importTransactionsCSV(transactions);
          setSuccessCount(imported.imported);
          onSuccess();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to parse CSV');
        } finally {
          setLoading(false);
        }
      },
      error: (err) => {
        setError(`CSV error: ${err.message}`);
        setLoading(false);
      },
    });
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-1">
          <div className="text-xs font-bold tracking-widest text-[#0d9488] uppercase">
            Bulk Import
          </div>
          <span className="text-base">📂</span>
        </div>

        <h3 className="text-2xl font-serif font-bold text-[#10172d] mb-2">
          CSV Importer
        </h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Upload bank statements or CSV files. Automatically categorized using smart keyword matching.
        </p>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100 mb-4">
            {error}
          </div>
        )}

        {successCount !== null && (
          <div className="p-3 bg-teal-50 text-teal-700 text-xs font-semibold rounded-xl border border-teal-100 mb-4">
            🎉 Successfully imported {successCount} transactions!
          </div>
        )}

        {/* Upload Dropzone */}
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 hover:border-[#0d9488] bg-slate-50/50 hover:bg-teal-50/20 rounded-3xl cursor-pointer transition-all group">
          <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📄</span>
          <span className="text-xs font-bold text-[#10172d] group-hover:text-[#0d9488]">
            {loading ? 'Processing CSV...' : 'Click to choose or drop CSV file'}
          </span>
          <span className="text-[10px] text-slate-400 mt-1">Supports Date, Description, Merchant, Amount</span>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={loading}
            className="hidden"
          />
        </label>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <span className="text-[11px] text-slate-400">
          💡 Expected headers: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">Date, Description, Amount</code>
        </span>
      </div>
    </div>
  );
}

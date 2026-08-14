'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { importTransactionsCSV } from '@/app/transactions/actions';

type CSVRow = Record<string, string | undefined>;

export function CSVImporter({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<any[]>([]);

  const normalizeDate = (dateStr: string): string => {
    // Try various date formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }

    // Try DD/MM/YYYY
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
            throw new Error('No data rows found in CSV (only headers)');
          }

          // Find column mappings (case-insensitive)
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
            throw new Error(
              'CSV must have Date, Description, and Amount columns. Found columns: ' +
              headers.join(', ')
            );
          }

          // Parse and validate
          const skippedRows: Array<{ rowNum: number; reason: string }> = [];
          const transactions = dataRows
            .map((row, idx) => {
              try {
                const date = normalizeDate(row[dateCol]?.toString().trim() || '');
                const description = row[descCol]?.toString().trim() || '';
                const merchant = merchantCol ? row[merchantCol]?.toString().trim() : undefined;
                const parseAmount = (value: string | undefined) =>
                  parseFloat((value || '').replace(/[^0-9.-]/g, ''));
                const debit = debitCol ? parseAmount(row[debitCol]?.toString().trim()) : NaN;
                const credit = creditCol ? parseAmount(row[creditCol]?.toString().trim()) : NaN;
                const signedAmount = amountCol
                  ? parseAmount(row[amountCol]?.toString().trim())
                  : !isNaN(credit) && credit !== 0
                    ? credit
                    : !isNaN(debit) && debit !== 0
                      ? -debit
                      : NaN;

                if (!date) {
                  skippedRows.push({ rowNum: idx + 2, reason: 'Invalid date' });
                  return null;
                }
                if (!description) {
                  skippedRows.push({ rowNum: idx + 2, reason: 'Missing description' });
                  return null;
                }
                if (isNaN(signedAmount) || signedAmount === 0) {
                  skippedRows.push({ rowNum: idx + 2, reason: 'Invalid amount' });
                  return null;
                }

                return {
                  date,
                  description,
                  merchant: merchant || undefined,
                  amount: Math.abs(signedAmount),
                  type: signedAmount > 0 ? 'income' : 'expense',
                };
              } catch (err) {
                skippedRows.push({
                  rowNum: idx + 2,
                  reason: err instanceof Error ? err.message : 'Unknown error',
                });
                return null;
              }
            })
            .filter((tx): tx is any => tx !== null);

          if (transactions.length === 0) {
            throw new Error(
              `No valid transactions found. Skipped rows: ${skippedRows
                .slice(0, 5)
                .map((r) => `${r.rowNum} (${r.reason})`)
                .join(', ')}${skippedRows.length > 5 ? '...' : ''}`
            );
          }

          setPreview(transactions.slice(0, 5));

          // Import
          const result = await importTransactionsCSV(transactions);
          
          let message = `✅ Successfully imported ${result.imported} transactions.`;
          if (result.duplicates > 0) {
            message += ` Skipped ${result.duplicates} duplicates.`;
          }
          if (skippedRows.length > 0) {
            message += ` (${skippedRows.length} rows had errors and were skipped)`;
          }

          setError(message);

          // Clear error message after success display
          setTimeout(() => {
            setError('');
            setPreview([]);
            onSuccess();
          }, 3000);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to parse CSV');
        } finally {
          setLoading(false);
          // Reset file input
          if (e.target) {
            e.target.value = '';
          }
        }
      },
      error: (err) => {
        setError(`CSV parsing error: ${err.message}`);
        setLoading(false);
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Import from CSV</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>📋 CSV Requirements:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Must have: Date, Description, Amount</li>
            <li>Optional: Merchant/Vendor column</li>
            <li>Accepted date formats: YYYY-MM-DD, DD/MM/YYYY, ISO 8601</li>
          </ul>
        </div>

        {error && (
          <div
            className={`p-3 rounded-md text-sm ${
              error.toLowerCase().includes('success')
                ? 'bg-green-50 text-green-900'
                : 'bg-destructive/10 text-destructive'
            }`}
          >
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={loading}
            className="flex-1"
          />
          <Button disabled={loading} variant="outline">
            {loading ? 'Processing...' : 'Select CSV'}
          </Button>
        </div>

        {preview.length > 0 && (
          <div className="border rounded-lg p-3 bg-muted/30">
            <p className="text-sm font-medium mb-2">Preview (first 5 rows):</p>
            <div className="space-y-1 text-sm">
              {preview.map((tx, idx) => (
                <div key={idx} className="text-muted-foreground">
                  {tx.date} • {tx.description} ({tx.merchant || 'N/A'}) • ${tx.amount.toFixed(2)}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

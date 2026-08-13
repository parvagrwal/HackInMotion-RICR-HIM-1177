'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { AddTransactionForm } from '@/components/add-transaction-form';
import { CSVImporter } from '@/components/csv-importer';
import { TransactionsList } from '@/components/transactions-list';

export default function TransactionsPage() {
  const [refresh, setRefresh] = useState(false);

  const handleSuccess = () => {
    setRefresh(!refresh);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2">Transaction Management</h1>
            <p className="text-muted-foreground">
              Add transactions manually or import from CSV. Auto-categorization included.
            </p>
          </div>

          {/* Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AddTransactionForm onSuccess={handleSuccess} />
            <CSVImporter onSuccess={handleSuccess} />
          </div>

          {/* List */}
          <TransactionsList refresh={refresh} />
        </div>
      </main>
    </div>
  );
}

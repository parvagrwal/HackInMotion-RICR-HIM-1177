'use client';

import { useState } from 'react';
import { AddTransactionForm } from '@/components/add-transaction-form';
import { CSVImporter } from '@/components/csv-importer';
import { TransactionsList } from '@/components/transactions-list';

export function TransactionsClientContainer() {
  const [refresh, setRefresh] = useState(false);

  const handleSuccess = () => {
    setRefresh((prev) => !prev);
  };

  return (
    <div className="space-y-8">
      {/* Entry & Import Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AddTransactionForm onSuccess={handleSuccess} />
        <CSVImporter onSuccess={handleSuccess} />
      </div>

      {/* Main Transactions Table */}
      <TransactionsList refresh={refresh} />
    </div>
  );
}

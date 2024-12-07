import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MonthSelector } from './components/MonthSelector';
import { TransactionForm } from './components/TransactionForm';
import { Summary } from './components/Summary';
import { TransactionChart } from './components/TransactionChart';
import { TransactionList } from './components/TransactionList';
import { FileImport } from './components/FileImport';
import { ExportButtons } from './components/ExportButtons';
import { useTransactions } from './hooks/useTransactions';
import { BackupService } from './services/backupService';
import type { Transaction } from './types';

function App() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const {
    transactions,
    addTransaction,
    addTransactions,
    deleteTransaction,
    editTransaction
  } = useTransactions();

  // Handle viewport height for mobile browsers
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  const monthlyTransactions = transactions.filter(t => 
    t.date.startsWith(format(selectedMonth, 'yyyy-MM'))
  );

  const handleBackupImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedTransactions = await BackupService.importBackup(file);
      
      if (window.confirm('既存のデータを上書きしますか？')) {
        addTransactions(importedTransactions);
        setError(null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'バックアップの読み込みに失敗しました');
    } finally {
      // Clear the input value to allow the same file to be selected again
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:py-8 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">月間収支レポート</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
          <div className="flex flex-wrap gap-2">
            <ExportButtons
              transactions={transactions}
              monthlyTransactions={monthlyTransactions}
              selectedMonth={selectedMonth}
              onBackupImport={handleBackupImport}
              error={error}
              onErrorClear={() => setError(null)}
            />
            <FileImport onImport={addTransactions} />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <TransactionForm onSubmit={addTransaction} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">年間概要</h2>
            <Summary transactions={transactions} selectedMonth={selectedMonth} type="yearly" />
          </div>
          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">月間概要</h2>
            <Summary transactions={transactions} selectedMonth={selectedMonth} type="monthly" />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">収支グラフ</h2>
          <TransactionChart transactions={monthlyTransactions} />
        </div>

        <div className="bg-white shadow rounded-lg p-4 sm:p-6 overflow-hidden">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">取引詳細</h2>
          <TransactionList
            transactions={monthlyTransactions}
            onDelete={deleteTransaction}
            onEdit={editTransaction}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
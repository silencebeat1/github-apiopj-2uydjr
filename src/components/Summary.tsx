import React from 'react';
import { format } from 'date-fns';
import type { Transaction } from '../types';

interface SummaryProps {
  transactions: Transaction[];
  selectedMonth: Date;
  type: 'yearly' | 'monthly';
}

export function Summary({ transactions, selectedMonth, type }: SummaryProps) {
  const stats = React.useMemo(() => {
    const year = format(selectedMonth, 'yyyy');
    const month = format(selectedMonth, 'yyyy-MM');
    
    const filteredTransactions = transactions.filter(t => 
      type === 'yearly' ? t.date.startsWith(year) : t.date.startsWith(month)
    );

    const income = filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const balance = income - expense;

    return { income, expense, balance };
  }, [transactions, selectedMonth, type]);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg transition-all hover:shadow-md">
        <h4 className="text-sm font-medium text-blue-800">総収入</h4>
        <p className="text-xl sm:text-2xl font-bold text-blue-600">¥{stats.income.toLocaleString()}</p>
      </div>
      <div className="bg-red-50 p-4 rounded-lg transition-all hover:shadow-md">
        <h4 className="text-sm font-medium text-red-800">総支出</h4>
        <p className="text-xl sm:text-2xl font-bold text-red-600">¥{stats.expense.toLocaleString()}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg transition-all hover:shadow-md">
        <h4 className="text-sm font-medium text-gray-800">残高</h4>
        <p className={`text-xl sm:text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
          ¥{stats.balance.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
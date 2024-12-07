import React, { useState } from 'react';
import type { Transaction } from '../types';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
}

export function TransactionForm({ onSubmit }: TransactionFormProps) {
  const [date, setDate] = useState('');
  const [store, setStore] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !amount) return;

    const storeName = store.trim() || '未指定';
    const roundedAmount = Math.floor(Number(amount) / 100) * 100;

    onSubmit({
      date,
      store: storeName,
      amount: roundedAmount * (type === 'expense' ? -1 : 1),
      type,
    });

    setDate('');
    setStore('');
    setAmount('');
    setType('expense');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">店舗</label>
          <input
            type="text"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            placeholder="未指定"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">金額</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            min="0"
            step="100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">種類</label>
          <div className="flex space-x-4 h-[38px] items-center">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="income"
                checked={type === 'income'}
                onChange={(e) => setType(e.target.value as 'income')}
                className="form-radio text-blue-600"
              />
              <span className="ml-2 text-sm">収入</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="expense"
                checked={type === 'expense'}
                onChange={(e) => setType(e.target.value as 'expense')}
                className="form-radio text-red-600"
              />
              <span className="ml-2 text-sm">支出</span>
            </label>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          追加
        </button>
      </div>
    </form>
  );
}
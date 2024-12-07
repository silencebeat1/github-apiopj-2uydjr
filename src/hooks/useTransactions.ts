import { useState, useEffect } from 'react';
import type { Transaction } from '../types';
import { createTransaction, createTransactions } from '../utils/transactionUtils';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, createTransaction(newTransaction)]);
  };

  const addTransactions = (newTransactions: Omit<Transaction, 'id'>[]) => {
    setTransactions(prev => [...prev, ...createTransactions(newTransactions)]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const editTransaction = (id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { 
        ...t, 
        ...updates,
        amount: updates.amount ? Math.floor(updates.amount / 100) * 100 : t.amount
      } : t
    ));
  };

  return {
    transactions,
    addTransaction,
    addTransactions,
    deleteTransaction,
    editTransaction
  };
}
import type { Transaction } from '../types';

export function roundToHundred(amount: number): number {
  return Math.floor(amount / 100) * 100;
}

export function createTransaction(newTransaction: Omit<Transaction, 'id'>): Transaction {
  return {
    ...newTransaction,
    amount: roundToHundred(newTransaction.amount),
    id: crypto.randomUUID()
  };
}

export function createTransactions(newTransactions: Omit<Transaction, 'id'>[]): Transaction[] {
  return newTransactions.map(t => createTransaction(t));
}
import type { Transaction } from '../types';

interface BackupData {
  version: string;
  timestamp: string;
  transactions: Transaction[];
}

export function validateBackupData(data: unknown): data is BackupData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const backup = data as BackupData;
  return (
    typeof backup.version === 'string' &&
    typeof backup.timestamp === 'string' &&
    Array.isArray(backup.transactions) &&
    backup.transactions.every(isValidTransaction)
  );
}

function isValidTransaction(transaction: unknown): transaction is Transaction {
  if (!transaction || typeof transaction !== 'object') {
    return false;
  }

  const t = transaction as Transaction;
  return (
    typeof t.id === 'string' &&
    typeof t.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(t.date) &&
    typeof t.store === 'string' &&
    typeof t.amount === 'number' &&
    (t.type === 'income' || t.type === 'expense')
  );
}

export function sanitizeTransaction(transaction: Transaction): Transaction {
  return {
    ...transaction,
    store: transaction.store.trim() || '未指定',
    amount: Math.floor(transaction.amount / 100) * 100,
    type: transaction.amount >= 0 ? 'income' : 'expense'
  };
}

export function createBackupData(transactions: Transaction[]): BackupData {
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    transactions: transactions.map(sanitizeTransaction)
  };
}

export function createBackupBlob(data: BackupData): Blob {
  return new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
}

export function createBackupFileName(): string {
  return `finance-backup-${new Date().toISOString().split('T')[0]}.json`;
}
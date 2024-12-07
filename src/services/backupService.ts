import type { Transaction } from '../types';
import {
  validateBackupData,
  sanitizeTransaction,
  createBackupData,
  createBackupBlob,
  createBackupFileName
} from '../utils/backupUtils';
import { downloadFile } from '../utils/downloadUtils';

export class BackupService {
  static async importBackup(file: File): Promise<Transaction[]> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!validateBackupData(data)) {
        throw new Error('バックアップデータの形式が正しくありません');
      }

      return data.transactions.map(sanitizeTransaction);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('バックアップファイルの形式が正しくありません');
      }
      throw error instanceof Error ? error : new Error('バックアップの読み込みに失敗しました');
    }
  }

  static exportBackup(transactions: Transaction[]): void {
    try {
      const backupData = createBackupData(transactions);
      const blob = createBackupBlob(backupData);
      const filename = createBackupFileName();
      downloadFile(blob, filename);
    } catch (error) {
      console.error('Backup export error:', error);
      throw new Error('バックアップの作成に失敗しました');
    }
  }
}
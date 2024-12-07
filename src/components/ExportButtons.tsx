import React from 'react';
import { Download, FileDown, Save, Upload, AlertCircle, XCircle } from 'lucide-react';
import type { Transaction } from '../types';
import { exportMonthlyReport, exportYearlyReport } from '../utils/exportUtils';
import { BackupService } from '../services/backupService';

interface ExportButtonsProps {
  transactions: Transaction[];
  monthlyTransactions: Transaction[];
  selectedMonth: Date;
  onBackupImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error: string | null;
  onErrorClear: () => void;
}

export function ExportButtons({ 
  transactions, 
  monthlyTransactions, 
  selectedMonth, 
  onBackupImport,
  error,
  onErrorClear
}: ExportButtonsProps) {
  const handleBackupExport = () => {
    try {
      BackupService.exportBackup(transactions);
    } catch (error) {
      console.error('Export error:', error);
      alert('バックアップの作成に失敗しました');
    }
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-2 sm:flex flex-wrap gap-2">
        <button
          onClick={() => exportMonthlyReport(monthlyTransactions, selectedMonth)}
          className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">月間</span>出力
        </button>
        <button
          onClick={() => exportYearlyReport(transactions, selectedMonth)}
          className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FileDown className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">年間</span>出力
        </button>
        <button
          onClick={handleBackupExport}
          className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <Save className="h-4 w-4 mr-1 sm:mr-2" />
          保存
        </button>
        <label className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 cursor-pointer">
          <Upload className="h-4 w-4 mr-1 sm:mr-2" />
          復元
          <input
            type="file"
            accept=".json"
            onChange={onBackupImport}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="absolute top-full mt-2 w-96 bg-red-50 border border-red-200 rounded-md p-4 z-50">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
            </div>
            <button
              onClick={onErrorClear}
              className="flex-shrink-0 ml-2"
              type="button"
            >
              <XCircle className="h-5 w-5 text-red-400 hover:text-red-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
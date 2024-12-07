import { format } from 'date-fns';
import type { Transaction } from '../types';
import { downloadFile } from './downloadUtils';

function formatAmount(amount: number): string {
  const roundedAmount = Math.floor(Math.abs(amount) / 100) * 100;
  const sign = amount >= 0 ? '+' : '-';
  return `${sign}¥${roundedAmount.toLocaleString()}`;
}

export function createMonthlyExportContent(transactions: Transaction[], selectedMonth: Date): string {
  const monthStr = format(selectedMonth, 'yyyy-MM');
  
  const incomeTransactions = transactions.filter(t => t.amount > 0);
  const expenseTransactions = transactions.filter(t => t.amount < 0);
  
  const totalIncome = Math.floor(
    incomeTransactions.reduce((sum, t) => sum + t.amount, 0) / 100
  ) * 100;
  const totalExpense = Math.floor(
    expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / 100
  ) * 100;
  const balance = totalIncome - totalExpense;

  const content = [
    `=== ${monthStr} 収支レポート ===`,
    `総収入: ${formatAmount(totalIncome)}`,
    `総支出: ${formatAmount(-totalExpense)}`,
    `残高: ${formatAmount(balance)}`,
    '\n=== 取引詳細 ===',
    ...transactions
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(t => `${t.date}\t${formatAmount(t.amount)}\t${t.store}`)
  ].join('\n');

  return content;
}

export function exportMonthlyReport(transactions: Transaction[], selectedMonth: Date): void {
  const content = createMonthlyExportContent(transactions, selectedMonth);
  const blob = new Blob([content], { type: 'text/plain' });
  const filename = `finance-report-${format(selectedMonth, 'yyyy-MM')}.txt`;
  downloadFile(blob, filename);
}

export function exportYearlyReport(transactions: Transaction[], selectedMonth: Date): void {
  const content = createYearlyExportContent(transactions, selectedMonth);
  const blob = new Blob([content], { type: 'text/plain' });
  const filename = `yearly-finance-report-${format(selectedMonth, 'yyyy')}.txt`;
  downloadFile(blob, filename);
}

export function createYearlyExportContent(transactions: Transaction[], selectedMonth: Date): string {
  const year = format(selectedMonth, 'yyyy');
  const yearlyTransactions = transactions.filter(t => t.date.startsWith(year));

  const monthlyData = new Map<string, Transaction[]>();
  for (let month = 1; month <= 12; month++) {
    const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
    monthlyData.set(monthStr, yearlyTransactions.filter(t => t.date.startsWith(monthStr)));
  }

  let yearlyIncome = 0;
  let yearlyExpense = 0;
  const content: string[] = [`=== ${year}年 年間収支レポート ===\n`];

  monthlyData.forEach((transactions, monthStr) => {
    if (transactions.length === 0) return;

    const incomeTransactions = transactions.filter(t => t.amount > 0);
    const expenseTransactions = transactions.filter(t => t.amount < 0);
    
    const monthlyIncome = Math.floor(
      incomeTransactions.reduce((sum, t) => sum + t.amount, 0) / 100
    ) * 100;
    const monthlyExpense = Math.floor(
      expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / 100
    ) * 100;

    yearlyIncome += monthlyIncome;
    yearlyExpense += monthlyExpense;

    content.push(`=== ${monthStr} ===`);
    content.push(`総収入: ${formatAmount(monthlyIncome)}`);
    content.push(`総支出: ${formatAmount(-monthlyExpense)}`);
    content.push(`残高: ${formatAmount(monthlyIncome - monthlyExpense)}\n`);
    content.push('取引詳細:');
    
    transactions
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach(t => {
        content.push(`${t.date}\t${formatAmount(t.amount)}\t${t.store}`);
      });
    
    content.push('');
  });

  const yearlyBalance = yearlyIncome - yearlyExpense;
  content.unshift('');
  content.unshift(`年間残高: ${formatAmount(yearlyBalance)}`);
  content.unshift(`年間総支出: ${formatAmount(-yearlyExpense)}`);
  content.unshift(`年間総収入: ${formatAmount(yearlyIncome)}`);

  return content.join('\n');
}
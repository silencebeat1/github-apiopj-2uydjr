import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { eachDayOfInterval, format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import type { Transaction } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface TransactionChartProps {
  transactions: Transaction[];
}

export function TransactionChart({ transactions }: TransactionChartProps) {
  const { dates, chartData, options } = useMemo(() => {
    // Get the month range from transactions or use current month if no transactions
    let startDate = new Date();
    let endDate = new Date();
    
    if (transactions.length > 0) {
      const dates = transactions.map(t => parseISO(t.date));
      startDate = startOfMonth(dates[0]);
      endDate = endOfMonth(dates[0]);
    } else {
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(new Date());
    }

    // Generate all dates in the month
    const allDates = eachDayOfInterval({ start: startDate, end: endDate });
    const formattedDates = allDates.map(date => format(date, 'yyyy-MM-dd'));

    // Initialize daily totals for all dates
    const dailyTotals = new Map<string, { income: number; expense: number; balance: number }>();
    formattedDates.forEach(date => {
      dailyTotals.set(date, { income: 0, expense: 0, balance: 0 });
    });

    // Calculate running balance
    let runningBalance = 0;
    transactions.forEach(transaction => {
      const current = dailyTotals.get(transaction.date)!;
      
      if (transaction.amount >= 0) {
        current.income += transaction.amount;
      } else {
        current.expense += Math.abs(transaction.amount);
      }
      
      runningBalance += transaction.amount;
      current.balance = runningBalance;
      
      dailyTotals.set(transaction.date, current);
    });

    // Update running balance for dates without transactions
    let previousBalance = 0;
    formattedDates.forEach(date => {
      const current = dailyTotals.get(date)!;
      if (current.balance === 0 && !transactions.some(t => t.date === date)) {
        current.balance = previousBalance;
      }
      previousBalance = current.balance;
    });

    const incomes = formattedDates.map(date => dailyTotals.get(date)!.income);
    const expenses = formattedDates.map(date => -dailyTotals.get(date)!.expense);
    const balances = formattedDates.map(date => dailyTotals.get(date)!.balance);

    const maxValue = Math.max(...balances, ...incomes);
    const minValue = Math.min(...balances, ...expenses);
    const padding = Math.max(Math.abs(maxValue), Math.abs(minValue)) * 0.1;

    return {
      dates: formattedDates,
      chartData: {
        labels: formattedDates.map(date => format(parseISO(date), 'MM/dd')),
        datasets: [
          {
            type: 'bar' as const,
            label: '収入',
            data: incomes,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
            stack: 'stack0',
          },
          {
            type: 'bar' as const,
            label: '支出',
            data: expenses,
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 1,
            stack: 'stack0',
          },
          {
            type: 'line' as const,
            label: '累積残高',
            data: balances,
            borderColor: 'rgb(75, 85, 99)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 2,
            pointHoverRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
          y: {
            beginAtZero: false,
            min: Math.floor(minValue - padding),
            max: Math.ceil(maxValue + padding),
            grid: {
              color: (context: any) => context.tick.value === 0 ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
              lineWidth: (context: any) => context.tick.value === 0 ? 2 : 1,
            },
          },
        },
        interaction: {
          mode: 'index' as const,
          intersect: false,
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const value = Math.abs(context.raw);
                const sign = context.raw >= 0 ? '+' : '-';
                return `${context.dataset.label}: ${sign}¥${value.toLocaleString()}`;
              },
            },
          },
        },
      },
    };
  }, [transactions]);

  return (
    <div className="w-full h-[400px]">
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
}
import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react';

interface SummaryCardProps {
  label: string;
  amount: number;
  type: 'balance' | 'income' | 'expense';
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ label, amount, type }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getStyles = () => {
    switch (type) {
      case 'income':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          text: 'text-emerald-600 dark:text-emerald-400',
          icon: <ArrowUpCircle className="w-6 h-6 text-emerald-500" />
        };
      case 'expense':
        return {
          bg: 'bg-rose-50 dark:bg-rose-900/20',
          text: 'text-rose-600 dark:text-rose-400',
          icon: <ArrowDownCircle className="w-6 h-6 text-rose-500" />
        };
      default:
        return {
          bg: 'bg-teal-50 dark:bg-teal-900/20',
          text: 'text-teal-600 dark:text-teal-400',
          icon: <Wallet className="w-6 h-6 text-teal-500" />
        };
    }
  };

  const style = getStyles();

  return (
    <div className={`p-4 rounded-2xl shadow-sm ${style.bg} flex flex-col items-start justify-between min-w-[140px] flex-1 border border-transparent dark:border-white/5`}>
      <div className="flex items-center gap-2 mb-2">
        {style.icon}
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <span className={`text-xl font-bold ${style.text} truncate w-full`}>
        {formatCurrency(amount)}
      </span>
    </div>
  );
};
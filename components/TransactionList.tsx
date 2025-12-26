import React from 'react';
import { Trash2, Utensils, Car, Home, ShoppingBag, Gamepad2, Banknote, MoreHorizontal, Shirt, Wifi, Sparkles } from 'lucide-react';
import { Transaction, CATEGORIES } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const IconMap: Record<string, React.ElementType> = {
  Utensils, Car, Home, ShoppingBag, Gamepad2, Banknote, MoreHorizontal, Shirt, Wifi, Sparkles
};

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date().toISOString().split('T')[0];
    if (isoString.startsWith(today)) return 'Hôm nay';
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date);
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-600">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm mb-4 border border-slate-100 dark:border-slate-800 transform rotate-3">
          <Sparkles className="w-10 h-10 text-emerald-200" />
        </div>
        <p className="font-medium text-slate-500">Chưa có giao dịch nào</p>
        <p className="text-xs text-slate-400 mt-1">Hãy bắt đầu ghi chép chi tiêu nhé!</p>
      </div>
    );
  }

  // Sort by date descending
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-3">
      {sortedTransactions.map((t, idx) => {
        const category = CATEGORIES[t.category] || CATEGORIES.other;
        const Icon = IconMap[category.icon] || MoreHorizontal;
        
        // Staggered animation effect can be done with CSS or simple order check
        return (
          <div 
            key={t.id} 
            className="bg-white/60 dark:bg-slate-900/60 p-3 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group relative overflow-hidden backdrop-blur-md border border-white/60 dark:border-white/5 hover:-translate-y-0.5"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex items-center gap-3.5 relative z-10">
              <div 
                className="w-12 h-12 rounded-[1.2rem] flex items-center justify-center text-white shadow-sm shrink-0 transition-transform group-hover:scale-105"
                style={{ backgroundColor: category.color }}
              >
                <Icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">{category.name}</h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span className="font-medium opacity-70">{formatDate(t.date)}</span>
                  {t.note && (
                    <>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="truncate max-w-[100px] text-slate-500 dark:text-slate-400">{t.note}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 relative z-10 pr-2">
              <span className={`font-bold text-sm sm:text-base tracking-tight ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </span>
              <button 
                onClick={() => onDelete(t.id)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all opacity-0 group-hover:opacity-100 -mr-2 group-hover:mr-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
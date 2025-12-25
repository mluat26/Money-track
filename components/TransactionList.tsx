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
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-600">
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-3">
          <MoreHorizontal className="w-8 h-8" />
        </div>
        <p>Chưa có giao dịch nào</p>
      </div>
    );
  }

  // Sort by date descending
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      {sortedTransactions.map((t) => {
        const category = CATEGORIES[t.category] || CATEGORIES.other;
        const Icon = IconMap[category.icon] || MoreHorizontal;

        return (
          <div key={t.id} className="bg-white/70 dark:bg-slate-900/70 p-4 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group relative overflow-hidden backdrop-blur-sm border border-white/50 dark:border-white/5">
            
            {/* Large Watermark Icon */}
            <Icon 
                className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-200 dark:text-slate-800/50 opacity-20 -rotate-12 pointer-events-none transition-transform group-hover:scale-110 duration-500" 
                style={{ color: category.color, opacity: 0.1 }}
            />

            <div className="flex items-center gap-4 relative z-10">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                style={{ backgroundColor: category.color }}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">{category.name}</h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                  <span className="bg-slate-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md backdrop-blur-sm">{formatDate(t.date)}</span>
                  {t.note && <span className="truncate max-w-[120px] text-slate-600 dark:text-slate-400 font-medium">{t.note}</span>}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1 relative z-10">
              <span className={`font-bold text-base ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </span>
              <button 
                onClick={() => onDelete(t.id)}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all"
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
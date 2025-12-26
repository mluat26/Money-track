import React, { useState, useMemo } from 'react';
import { Trash2, Utensils, Car, Home, ShoppingBag, Gamepad2, Banknote, MoreHorizontal, Shirt, Wifi, Sparkles, Filter } from 'lucide-react';
import { Transaction, CATEGORIES, Currency } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  currency: Currency;
}

const IconMap: Record<string, React.ElementType> = {
  Utensils, Car, Home, ShoppingBag, Gamepad2, Banknote, MoreHorizontal, Shirt, Wifi, Sparkles
};

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, currency }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(currency === 'VND' ? 'vi-VN' : (currency === 'USD' ? 'en-US' : 'id-ID'), {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: currency === 'VND' || currency === 'IDR' ? 0 : 2
    }).format(value);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date().toISOString().split('T')[0];
    if (isoString.startsWith(today)) return 'Hôm nay';
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date);
  };

  // Get unique categories present in transactions for the filter list
  const activeCategories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return ['all', ...Array.from(cats)];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let data = transactions;
    if (filterCategory !== 'all') {
      data = data.filter(t => t.category === filterCategory);
    }
    return [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterCategory]);

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

  return (
    <div className="space-y-4">
      
      {/* Filter Chips - Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2">
        {activeCategories.map(catId => {
          const isAll = catId === 'all';
          const catInfo = CATEGORIES[catId];
          const isActive = filterCategory === catId;
          
          return (
            <button
              key={catId}
              onClick={() => setFilterCategory(catId)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                isActive 
                  ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 dark:border-white shadow-md' 
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {isAll ? <Filter className="w-3 h-3" /> : null}
              {isAll ? 'Tất cả' : catInfo?.name || 'Khác'}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filteredTransactions.map((t, idx) => {
          const category = CATEGORIES[t.category] || CATEGORIES.other;
          const Icon = IconMap[category.icon] || MoreHorizontal;
          
          return (
            <div 
              key={t.id} 
              className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group relative overflow-hidden backdrop-blur-md border border-white/60 dark:border-white/5 hover:-translate-y-0.5"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center gap-4 relative z-10 flex-1 min-w-0">
                {/* Icon Box */}
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: category.color }}
                >
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>

                {/* Content - Note Big, Meta Small */}
                <div className="flex flex-col flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base truncate pr-2">
                    {t.note ? t.note : category.name}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 truncate">
                    <span className="font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md shrink-0">
                        {formatDate(t.date)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                    <span className="truncate opacity-80">{category.name}</span>
                  </div>
                </div>
              </div>
              
              {/* Amount & Actions */}
              <div className="flex items-center gap-3 relative z-10 pl-2 shrink-0">
                <span className={`font-bold text-base sm:text-lg tracking-tight whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
                <button 
                  onClick={() => onDelete(t.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Utensils, Edit2, AlertCircle, ChevronRight, Check, Wallet } from 'lucide-react';
import { Transaction, Currency } from '../types';

interface DailyBudgetProps {
  transactions: Transaction[];
  limit: number;
  onSetLimit: (limit: number) => void;
  onClick?: () => void;
  currency: Currency;
}

export const DailyBudget: React.FC<DailyBudgetProps> = ({ transactions, limit, onSetLimit, onClick, currency }) => {
  const [isEditing, setIsEditing] = useState(limit === 0);
  const [tempLimit, setTempLimit] = useState(limit.toString());

  // Calculate today's food spending
  const today = new Date().toISOString().split('T')[0];
  const spentToday = transactions
    .filter(t => t.type === 'expense' && t.category === 'food' && t.date.startsWith(today))
    .reduce((acc, t) => acc + t.amount, 0);

  const remaining = limit - spentToday;
  const percentage = limit > 0 ? Math.min((spentToday / limit) * 100, 100) : 0;
  
  // Color logic based on percentage (Pastel)
  let progressColor = 'bg-emerald-400';
  let trackColor = 'bg-emerald-100 dark:bg-emerald-900/30';
  let gradientBg = 'from-emerald-500 to-teal-500';
  
  if (percentage > 75) {
      progressColor = 'bg-orange-400';
      trackColor = 'bg-orange-100 dark:bg-orange-900/30';
      gradientBg = 'from-orange-400 to-amber-500';
  }
  if (percentage >= 100) {
      progressColor = 'bg-rose-400';
      trackColor = 'bg-rose-100 dark:bg-rose-900/30';
      gradientBg = 'from-rose-500 to-pink-500';
  }

  const handleSave = () => {
    const val = parseFloat(tempLimit);
    if (!isNaN(val) && val >= 0) {
      onSetLimit(val);
      setIsEditing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(currency === 'VND' ? 'vi-VN' : (currency === 'USD' ? 'en-US' : 'id-ID'), {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: currency === 'VND' || currency === 'IDR' ? 0 : 2
    }).format(value);
  };

  if (isEditing) {
    return (
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm animate-fade-in border border-white/60 dark:border-white/5">
        <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400 font-bold">
          <Utensils className="w-5 h-5" />
          <h3>Cài đặt ngân sách</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
          Bạn muốn chi tối đa bao nhiêu cho việc ăn uống mỗi ngày?
        </p>
        <div className="flex gap-2">
          <input 
            type="number" 
            value={tempLimit}
            onChange={(e) => setTempLimit(e.target.value)}
            placeholder="Ví dụ: 150000"
            className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white font-bold text-lg"
            autoFocus
          />
          <button 
            onClick={handleSave}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 rounded-2xl font-bold transition-colors shadow-lg shadow-emerald-200 dark:shadow-none"
          >
            <Check className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
        onClick={onClick}
        className={`bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-sm border border-white/60 dark:border-white/5 relative overflow-hidden group ${onClick ? 'cursor-pointer hover:bg-white/80 transition-all duration-300' : ''}`}
    >
      {/* Top Section: Main Budget Status */}
      <div className={`bg-gradient-to-br ${gradientBg} rounded-[2rem] p-5 text-white shadow-lg relative overflow-hidden mb-5`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-2 bg-black/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white/90">
                  <Utensils className="w-3.5 h-3.5" /> Chi tiêu ăn uống
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setTempLimit(limit.toString()); setIsEditing(true); }}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors backdrop-blur-md"
              >
                  <Edit2 className="w-3.5 h-3.5 text-white" />
              </button>
          </div>

          <div className="mt-4 relative z-10">
              <div className="text-emerald-100 text-xs font-medium uppercase tracking-wider mb-1 opacity-90">Ngân sách mỗi ngày</div>
              <div className="text-4xl font-bold tracking-tight">{formatCurrency(limit)}</div>
          </div>
      </div>

      {/* Grid Stats - Separated Layout to prevent overflow */}
      <div className="grid grid-cols-3 gap-3">
          
          {/* Item 1: Total */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 flex flex-col items-center justify-center text-center border border-slate-100 dark:border-slate-700/50">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Tổng quỹ</span>
             <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate w-full">{formatCurrency(limit)}</span>
          </div>

          {/* Item 2: Spent */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 flex flex-col items-center justify-center text-center border border-slate-100 dark:border-slate-700/50">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Đã ăn</span>
             <span className="text-sm font-bold text-slate-800 dark:text-white truncate w-full">{formatCurrency(spentToday)}</span>
          </div>

          {/* Item 3: Remaining (Highlighted) */}
          <div className={`rounded-2xl p-3 flex flex-col items-center justify-center text-center border ${remaining < 0 ? 'bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30' : 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30'}`}>
             <span className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${remaining < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>Dư ra</span>
             <span className={`text-sm font-bold truncate w-full ${remaining < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {remaining > 0 ? '+' : ''}{formatCurrency(remaining)}
             </span>
          </div>

      </div>

      {/* Progress Bar */}
      <div className="mt-5 relative">
          <div className={`h-2 w-full ${trackColor} rounded-full overflow-hidden`}>
            <div 
            className={`h-full ${progressColor} transition-all duration-700 ease-out rounded-full`} 
            style={{ width: `${percentage}%` }}
            ></div>
        </div>
      </div>

      {remaining < 0 && (
         <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 p-2 rounded-xl animate-pulse text-center">
            <AlertCircle className="w-4 h-4" />
            Vượt ngân sách!
         </div>
      )}
    </div>
  );
};
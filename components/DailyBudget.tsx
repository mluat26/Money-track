import React, { useState, useEffect } from 'react';
import { Utensils, Edit2, AlertCircle, ChevronRight, Check } from 'lucide-react';
import { Transaction } from '../types';

interface DailyBudgetProps {
  transactions: Transaction[];
  limit: number;
  onSetLimit: (limit: number) => void;
  onClick?: () => void;
}

export const DailyBudget: React.FC<DailyBudgetProps> = ({ transactions, limit, onSetLimit, onClick }) => {
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
  
  if (percentage > 75) {
      progressColor = 'bg-orange-400';
      trackColor = 'bg-orange-100 dark:bg-orange-900/30';
  }
  if (percentage >= 100) {
      progressColor = 'bg-rose-400';
      trackColor = 'bg-rose-100 dark:bg-rose-900/30';
  }

  const handleSave = () => {
    const val = parseFloat(tempLimit);
    if (!isNaN(val) && val >= 0) {
      onSetLimit(val);
      setIsEditing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
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
        className={`bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-white/60 dark:border-white/5 relative overflow-hidden group ${onClick ? 'cursor-pointer hover:bg-white/80 transition-all duration-300' : ''}`}
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-slate-800 dark:text-slate-100 font-bold flex items-center gap-2 text-base">
             <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 p-1.5 rounded-lg">
                <Utensils className="w-4 h-4" />
             </span>
             Ngân sách ăn uống
             {remaining < 0 && <AlertCircle className="w-4 h-4 text-rose-500" />}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 pl-9 font-medium">Hôm nay</p>
        </div>
        
        {onClick ? (
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors shadow-sm">
                <ChevronRight className="w-4 h-4" />
            </div>
        ) : (
            <button 
            onClick={(e) => { e.stopPropagation(); setTempLimit(limit.toString()); setIsEditing(true); }}
            className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-colors shadow-sm"
            >
            <Edit2 className="w-4 h-4" />
            </button>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mb-5 pl-9 relative z-10">
        <span className={`text-4xl font-bold tracking-tight ${remaining < 0 ? 'text-rose-500' : 'text-slate-800 dark:text-white'}`}>
          {formatCurrency(spentToday)}
        </span>
        <span className="text-sm text-slate-400 dark:text-slate-500 font-medium opacity-80">
           / {formatCurrency(limit)}
        </span>
      </div>

      {/* Modern Progress Bar */}
      <div className="relative pl-9">
          <div className={`h-3 w-full ${trackColor} rounded-full overflow-hidden`}>
            <div 
            className={`h-full ${progressColor} transition-all duration-700 ease-out rounded-full`} 
            style={{ width: `${percentage}%` }}
            ></div>
        </div>
      </div>
      
      <div className="mt-2 text-xs font-bold text-right relative z-10">
        {remaining >= 0 ? (
            <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">Còn lại: {formatCurrency(remaining)}</span>
        ) : (
            <span className="text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-lg">Vượt quá: {formatCurrency(Math.abs(remaining))}</span>
        )}
      </div>
    </div>
  );
};
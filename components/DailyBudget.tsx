import React, { useState, useEffect } from 'react';
import { Utensils, Edit2, AlertCircle, ChevronRight } from 'lucide-react';
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
  
  // Color logic based on percentage
  let progressColor = 'bg-emerald-500';
  if (percentage > 75) progressColor = 'bg-orange-400';
  if (percentage >= 100) progressColor = 'bg-rose-500';

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
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl shadow-sm animate-fade-in border border-emerald-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400 font-semibold">
          <Utensils className="w-5 h-5" />
          <h3>Thiết lập ngân sách ăn uống/ngày</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Bạn muốn chi tối đa bao nhiêu cho việc ăn uống mỗi ngày?
        </p>
        <div className="flex gap-2">
          <input 
            type="number" 
            value={tempLimit}
            onChange={(e) => setTempLimit(e.target.value)}
            placeholder="Ví dụ: 150000"
            className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white font-medium"
            autoFocus
          />
          <button 
            onClick={handleSave}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 rounded-xl font-medium transition-colors"
          >
            Lưu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
        onClick={onClick}
        className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-emerald-50/50 dark:border-white/5 relative overflow-hidden group ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-300' : ''}`}
    >
      {/* Background decoration */}
      <Utensils className="absolute -right-6 -bottom-6 w-32 h-32 text-emerald-500 opacity-[0.05] dark:opacity-[0.1] -rotate-12 transition-transform duration-500 group-hover:scale-110 pointer-events-none" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-slate-800 dark:text-slate-100 font-bold flex items-center gap-2 text-lg">
             Ngân sách ăn uống
             {remaining < 0 && <AlertCircle className="w-4 h-4 text-rose-500" />}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Hôm nay</p>
        </div>
        
        {onClick ? (
            <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-colors">
                <ChevronRight className="w-5 h-5" />
            </div>
        ) : (
            <button 
            onClick={(e) => { e.stopPropagation(); setTempLimit(limit.toString()); setIsEditing(true); }}
            className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
            >
            <Edit2 className="w-4 h-4" />
            </button>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mb-4 relative z-10">
        <span className={`text-3xl font-bold tracking-tight ${remaining < 0 ? 'text-rose-500' : 'text-slate-800 dark:text-white'}`}>
          {formatCurrency(spentToday)}
        </span>
        <span className="text-sm text-slate-400 dark:text-slate-500 font-medium">
           / {formatCurrency(limit)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative z-10">
        <div 
          className={`h-full ${progressColor} transition-all duration-500 ease-out shadow-[0_2px_10px_rgba(0,0,0,0.1)]`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="mt-3 text-sm font-medium text-right relative z-10">
        {remaining >= 0 ? (
            <span className="text-emerald-600 dark:text-emerald-400">Còn lại: {formatCurrency(remaining)}</span>
        ) : (
            <span className="text-rose-500">Đã lố: {formatCurrency(Math.abs(remaining))}</span>
        )}
      </div>
    </div>
  );
};
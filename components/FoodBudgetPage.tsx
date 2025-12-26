import React, { useState, useMemo, useEffect } from 'react';
import { Utensils, Edit2, TrendingUp, TrendingDown, Receipt, Calendar, Wallet } from 'lucide-react';
import { Transaction, Currency } from '../types';

interface FoodBudgetPageProps {
  transactions: Transaction[];
  dailyLimit: number;
  onSetLimit: (limit: number) => void;
  onAddTransaction: () => void;
  currency: Currency;
}

export const FoodBudgetPage: React.FC<FoodBudgetPageProps> = ({ 
  transactions, 
  dailyLimit, 
  onSetLimit,
  onAddTransaction,
  currency
}) => {
  const [isEditing, setIsEditing] = useState(dailyLimit === 0);
  const [tempLimit, setTempLimit] = useState(dailyLimit.toString());
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll listener for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSaveLimit = () => {
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

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(date);
  };

  // Pre-filter food transactions
  const foodTransactions = useMemo(() => 
    transactions.filter(t => t.type === 'expense' && t.category === 'food'),
  [transactions]);

  // Calculate Accumulative Stats
  const accumulativeStats = useMemo(() => {
    const uniqueDates = new Set(foodTransactions.map(t => t.date.split('T')[0]));
    const daysCount = uniqueDates.size;
    const totalSpent = foodTransactions.reduce((acc, t) => acc + t.amount, 0);
    const totalExpectedBudget = daysCount * dailyLimit;
    const totalSaved = totalExpectedBudget - totalSpent;

    return { daysCount, totalSpent, totalExpectedBudget, totalSaved };
  }, [foodTransactions, dailyLimit]);

  // Group transactions by date
  const dailyData = useMemo(() => {
    const groups: Record<string, { transactions: Transaction[]; total: number }> = {};
    foodTransactions.forEach(t => {
      const dateKey = t.date.split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = { transactions: [], total: 0 };
      }
      groups[dateKey].transactions.push(t);
      groups[dateKey].total += t.amount;
    });

    return Object.entries(groups)
      .map(([date, data]) => ({
        date,
        items: data.transactions,
        total: data.total,
        savings: dailyLimit - data.total
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [foodTransactions, dailyLimit]);

  return (
    <div className="animate-fade-in pb-24 sm:pb-0 relative">
      
      {/* Sticky Header Wrapper */}
      <div className="relative">
          
          {/* Expanded Header - Disappears on Scroll */}
          <div className={`bg-gradient-to-tr from-emerald-400 to-cyan-500 dark:from-emerald-800 dark:to-cyan-800 rounded-[2.5rem] p-6 text-white shadow-xl shadow-emerald-100/50 dark:shadow-none relative overflow-hidden flex flex-col gap-6 transition-all duration-500 origin-top ${isScrolled ? 'opacity-0 scale-95 h-0 p-0 mb-0 overflow-hidden absolute pointer-events-none' : 'opacity-100 scale-100 mb-6'}`}>
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/20 rounded-full blur-3xl mix-blend-overlay"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md shadow-sm border border-white/10">
                        <Utensils className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Chi Tiêu Ăn Uống</h2>
                        <div className="text-xs text-emerald-50 font-medium flex items-center gap-1.5 mt-0.5 opacity-90">
                            <Calendar className="w-3 h-3" />
                            {accumulativeStats.daysCount} ngày hoạt động
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => { setTempLimit(dailyLimit.toString()); setIsEditing(true); }}
                    className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-colors backdrop-blur-md border border-white/10"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
            </div>

            {/* Total Budget Row */}
            <div className="relative z-10">
                {isEditing ? (
                    <div className="w-full bg-white/20 backdrop-blur-md p-2 rounded-[20px] animate-fade-in text-white border border-white/20 flex gap-2">
                        <input 
                            type="number" 
                            value={tempLimit}
                            onChange={(e) => setTempLimit(e.target.value)}
                            className="flex-1 min-w-0 bg-transparent rounded-2xl px-4 py-2 outline-none font-bold text-2xl placeholder-white/30 text-white"
                            placeholder="0"
                            autoFocus
                        />
                        <button onClick={handleSaveLimit} className="shrink-0 bg-white text-emerald-600 px-4 rounded-2xl font-bold hover:bg-emerald-50 transition-colors shadow-sm">Lưu</button>
                    </div>
                ) : (
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                        <p className="text-emerald-50 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80 flex items-center gap-1.5">
                            <Wallet className="w-3 h-3" /> Ngân sách mỗi ngày
                        </p>
                        <div className="text-4xl font-bold tracking-tighter truncate">{formatCurrency(dailyLimit)}</div>
                    </div>
                )}
            </div>

            {/* Split Stats */}
            <div className="relative z-10 grid grid-cols-2 gap-3">
                <div className="bg-black/10 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex flex-col justify-center min-w-0">
                    <span className="block text-[10px] text-emerald-50 uppercase tracking-wider mb-1 opacity-80">Tổng Đã ăn</span>
                    <span className="block font-bold text-xl truncate">{formatCurrency(accumulativeStats.totalSpent)}</span>
                </div>
                <div className={`backdrop-blur-md rounded-2xl p-4 border border-white/5 flex flex-col justify-center min-w-0 ${accumulativeStats.totalSaved >= 0 ? 'bg-emerald-400/20' : 'bg-rose-500/20'}`}>
                    <span className="block text-[10px] text-emerald-50 uppercase tracking-wider mb-1 opacity-80">Tổng Dư ra</span>
                    <div className={`font-bold text-xl flex items-center gap-1 truncate ${accumulativeStats.totalSaved >= 0 ? 'text-white' : 'text-rose-100'}`}>
                        {accumulativeStats.totalSaved >= 0 ? '+' : ''}{formatCurrency(accumulativeStats.totalSaved)}
                    </div>
                </div>
            </div>
          </div>

          {/* Minimized Header (Fixed/Sticky Green Pill) */}
          <div className={`fixed top-4 left-4 right-4 z-40 bg-emerald-600 text-white shadow-xl shadow-emerald-900/20 rounded-full p-2 px-4 flex items-center justify-between transition-all duration-500 transform ${isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
             <div className="flex items-center gap-3">
                <div className="bg-white/20 p-1.5 rounded-full text-white backdrop-blur-sm">
                    <Utensils className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-emerald-100 uppercase">Dư ra</span>
                    <span className={`text-sm font-bold ${accumulativeStats.totalSaved >= 0 ? 'text-white' : 'text-rose-200'}`}>
                        {accumulativeStats.totalSaved >= 0 ? '+' : ''}{formatCurrency(accumulativeStats.totalSaved)}
                    </span>
                </div>
             </div>
             <button onClick={onAddTransaction} className="bg-white text-emerald-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                + Thêm
             </button>
          </div>
      </div>

      {/* Daily List Cards */}
      <div className={`space-y-4 ${isScrolled ? 'pt-2' : 'pt-2'}`}>
        {dailyData.length === 0 ? (
           <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <div className="bg-white dark:bg-slate-900 w-24 h-24 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
                 <Utensils className="w-10 h-10 opacity-20 text-emerald-500" />
              </div>
              <p className="font-medium text-lg">Chưa có dữ liệu ăn uống.</p>
              <button onClick={onAddTransaction} className="mt-4 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-full font-bold hover:bg-emerald-100 transition-colors">
                 + Thêm bữa ăn
              </button>
           </div>
        ) : (
            dailyData.map((day) => (
                <div key={day.date} className="group">
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-white/60 dark:border-white/5 relative overflow-hidden group-hover:-translate-y-1">
                        <Receipt className="absolute -right-6 -bottom-6 w-32 h-32 text-emerald-500/5 rotate-12 pointer-events-none" />
                        <div className="flex justify-between items-start mb-5 relative z-10 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    {formatDate(day.date)}
                                </span>
                            </div>
                            <div className={`flex flex-col items-end ${day.savings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                 <div className="font-bold flex items-center gap-1.5 text-base bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm">
                                    {day.savings >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    {day.savings >= 0 ? '+' : ''}{formatCurrency(day.savings)}
                                 </div>
                            </div>
                        </div>
                        <div className="space-y-3 relative z-10">
                            {day.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center py-1 group/item">
                                    <div className="flex-1 min-w-0 pr-4">
                                         <p className="text-slate-700 dark:text-slate-200 font-bold truncate group-hover/item:text-emerald-600 transition-colors">
                                            {item.note || 'Ăn uống'}
                                         </p>
                                    </div>
                                    <span className="font-bold text-slate-800 dark:text-white text-sm whitespace-nowrap">
                                        {formatCurrency(item.amount)}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 border-dashed">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Tổng chi
                                </span>
                                <span className="text-lg font-bold text-slate-800 dark:text-white">
                                    {formatCurrency(day.total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};
import React, { useState, useMemo } from 'react';
import { Utensils, Edit2, TrendingUp, TrendingDown, PiggyBank, Receipt, DollarSign, Calendar } from 'lucide-react';
import { Transaction } from '../types';

interface FoodBudgetPageProps {
  transactions: Transaction[];
  dailyLimit: number;
  onSetLimit: (limit: number) => void;
  onAddTransaction: () => void;
}

export const FoodBudgetPage: React.FC<FoodBudgetPageProps> = ({ 
  transactions, 
  dailyLimit, 
  onSetLimit,
  onAddTransaction
}) => {
  const [isEditing, setIsEditing] = useState(dailyLimit === 0);
  const [tempLimit, setTempLimit] = useState(dailyLimit.toString());

  const handleSaveLimit = () => {
    const val = parseFloat(tempLimit);
    if (!isNaN(val) && val >= 0) {
      onSetLimit(val);
      setIsEditing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
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
    // Get unique dates to calculate how many days have passed/recorded
    const uniqueDates = new Set(foodTransactions.map(t => t.date.split('T')[0]));
    const daysCount = uniqueDates.size;
    
    const totalSpent = foodTransactions.reduce((acc, t) => acc + t.amount, 0);
    const totalExpectedBudget = daysCount * dailyLimit;
    const totalSaved = totalExpectedBudget - totalSpent;

    return { daysCount, totalSpent, totalExpectedBudget, totalSaved };
  }, [foodTransactions, dailyLimit]);

  // Group transactions by date for the list
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
    <div className="space-y-6 animate-fade-in pb-24 sm:pb-0">
      
      {/* Modern Header / Config Section */}
      <div className="bg-gradient-to-tr from-emerald-400 to-cyan-500 dark:from-emerald-800 dark:to-cyan-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-100/50 dark:shadow-none relative overflow-hidden min-h-[320px] flex flex-col justify-between">
         <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/20 rounded-full blur-3xl mix-blend-overlay"></div>
         <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
         
         <div className="relative z-10">
            {/* Title & Edit Button */}
            <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md shadow-sm border border-white/10">
                        <Utensils className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Chi Tiêu Ăn Uống</h2>
                        <div className="text-sm text-emerald-50 font-medium flex items-center gap-1.5 mt-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {accumulativeStats.daysCount} ngày hoạt động
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => { setTempLimit(dailyLimit.toString()); setIsEditing(true); }}
                    className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-colors backdrop-blur-md border border-white/10"
                >
                    <Edit2 className="w-5 h-5" />
                </button>
            </div>

            {/* Daily Limit Setting */}
            <div className="min-h-[80px] mb-6">
                {isEditing ? (
                    <div className="w-full bg-white/20 backdrop-blur-md p-2 rounded-[20px] animate-fade-in text-white border border-white/20 flex gap-2">
                        <input 
                            type="number" 
                            value={tempLimit}
                            onChange={(e) => setTempLimit(e.target.value)}
                            className="flex-1 min-w-0 bg-transparent rounded-2xl px-4 py-2 outline-none font-bold text-3xl placeholder-white/30 text-white"
                            placeholder="0"
                            autoFocus
                        />
                        <button onClick={handleSaveLimit} className="shrink-0 bg-white text-emerald-600 px-6 rounded-2xl font-bold hover:bg-emerald-50 transition-colors shadow-sm">Lưu</button>
                    </div>
                ) : (
                    <div>
                        <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Ngân sách mỗi ngày</p>
                        <div className="text-5xl font-bold tracking-tighter">{formatCurrency(dailyLimit)}</div>
                    </div>
                )}
            </div>
         </div>

         {/* Accumulated Stats Summary Card - Glassmorphism */}
         <div className="relative z-10 bg-black/10 backdrop-blur-md rounded-[20px] p-5 border border-white/10">
            <div className="flex justify-between divide-x divide-white/10">
                
                {/* Expected Budget */}
                <div className="flex-1 px-2 text-center">
                    <span className="block text-[10px] text-emerald-50 uppercase tracking-wider mb-1 opacity-80">Tổng quỹ</span>
                    <span className="block font-bold text-lg">{formatCurrency(accumulativeStats.totalExpectedBudget)}</span>
                </div>

                {/* Spent */}
                <div className="flex-1 px-2 text-center">
                    <span className="block text-[10px] text-emerald-50 uppercase tracking-wider mb-1 opacity-80">Đã ăn</span>
                    <span className="block font-bold text-lg">{formatCurrency(accumulativeStats.totalSpent)}</span>
                </div>

                {/* Saved */}
                <div className="flex-1 px-2 text-center">
                    <span className="block text-[10px] text-emerald-50 uppercase tracking-wider mb-1 opacity-80">Dư ra</span>
                    <div className={`font-bold text-lg flex items-center justify-center gap-1 ${accumulativeStats.totalSaved >= 0 ? 'text-white' : 'text-rose-200'}`}>
                        {accumulativeStats.totalSaved >= 0 ? <PiggyBank className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                        {accumulativeStats.totalSaved > 0 ? '+' : ''}{formatCurrency(accumulativeStats.totalSaved)}
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* Daily List Cards */}
      <div className="space-y-6 pt-2">
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
                <div key={day.date} className="relative pl-8 group">
                    {/* Timeline Line */}
                    <div className="absolute left-[7px] top-6 bottom-[-24px] w-[2px] bg-slate-200 dark:bg-slate-800 rounded-full group-last:bottom-6"></div>
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-8 w-4 h-4 rounded-full bg-emerald-200 dark:bg-emerald-900 border-4 border-white dark:border-slate-950 z-10 shadow-sm"></div>
                    
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-white/60 dark:border-white/5 relative overflow-hidden group-hover:-translate-y-1">
                        
                        {/* Decorative background icon specific for receipts/food */}
                        <Receipt className="absolute -right-6 -bottom-6 w-32 h-32 text-emerald-500/5 rotate-12 pointer-events-none" />

                        {/* Card Header */}
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

                        {/* Transaction Items */}
                        <div className="space-y-3 relative z-10">
                            {day.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center py-1 group/item">
                                    <span className="text-slate-600 dark:text-slate-300 font-medium group-hover/item:text-emerald-600 transition-colors text-sm">
                                        {item.note || 'Ăn uống'}
                                    </span>
                                    <span className="font-bold text-slate-800 dark:text-white text-sm">
                                        {formatCurrency(item.amount)}
                                    </span>
                                </div>
                            ))}
                            
                            {/* Total Row */}
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
import React, { useState, useMemo } from 'react';
import { Utensils, Edit2, TrendingUp, TrendingDown, PiggyBank, Receipt, DollarSign } from 'lucide-react';
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
    <div className="space-y-8 animate-fade-in pb-24 sm:pb-0">
      
      {/* Modern Header / Config Section */}
      <div className="bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-teal-200/50 dark:shadow-none relative overflow-hidden min-h-[300px] flex flex-col justify-between">
         <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
         <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>
         {/* Large Decorative Icon */}
         <Utensils className="absolute -right-8 -top-8 w-40 h-40 text-white opacity-10 rotate-12 pointer-events-none" />

         <div className="relative z-10">
            {/* Title & Edit Button */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-sm shadow-sm border border-white/10">
                        <Utensils className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Quản lý Ăn uống</h2>
                        <div className="text-sm text-teal-50 opacity-90 font-medium">
                            {accumulativeStats.daysCount} ngày hoạt động
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => { setTempLimit(dailyLimit.toString()); setIsEditing(true); }}
                    className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-colors backdrop-blur-md border border-white/10"
                >
                    <Edit2 className="w-5 h-5" />
                </button>
            </div>

            {/* Daily Limit Setting - Fixed Height Container to prevent jump */}
            <div className="min-h-[88px] mb-6 flex items-center">
                {isEditing ? (
                    <div className="w-full bg-white/20 backdrop-blur-md p-2 rounded-3xl animate-fade-in text-white border border-white/20 flex gap-2">
                        <input 
                            type="number" 
                            value={tempLimit}
                            onChange={(e) => setTempLimit(e.target.value)}
                            className="flex-1 min-w-0 bg-black/10 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:bg-black/20 font-bold text-xl placeholder-white/30 text-white"
                            placeholder="0"
                            autoFocus
                        />
                        <button onClick={handleSaveLimit} className="shrink-0 bg-white text-teal-600 px-4 rounded-2xl font-bold hover:bg-teal-50 transition-colors shadow-sm whitespace-nowrap">Lưu</button>
                    </div>
                ) : (
                    <div>
                        <p className="text-teal-50 text-xs font-bold uppercase tracking-widest mb-1 opacity-70">Ngân sách ngày</p>
                        <div className="text-4xl font-bold tracking-tight">{formatCurrency(dailyLimit)}</div>
                    </div>
                )}
            </div>
         </div>

         {/* Accumulated Stats Summary Card - Glassmorphism */}
         <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10 shadow-lg">
            <div className="flex justify-between divide-x divide-white/10">
                
                {/* Expected Budget */}
                <div className="flex-1 px-2 text-center">
                    <span className="block text-[10px] text-teal-100 uppercase tracking-wider mb-1 opacity-80">Tổng</span>
                    <span className="block font-bold text-lg">{formatCurrency(accumulativeStats.totalExpectedBudget)}</span>
                </div>

                {/* Spent */}
                <div className="flex-1 px-2 text-center">
                    <span className="block text-[10px] text-teal-100 uppercase tracking-wider mb-1 opacity-80">Dùng</span>
                    <span className="block font-bold text-lg">{formatCurrency(accumulativeStats.totalSpent)}</span>
                </div>

                {/* Saved */}
                <div className="flex-1 px-2 text-center">
                    <span className="block text-[10px] text-teal-100 uppercase tracking-wider mb-1 opacity-80">Dư</span>
                    <div className={`font-bold text-lg flex items-center justify-center gap-1 ${accumulativeStats.totalSaved >= 0 ? 'text-white' : 'text-rose-200'}`}>
                        {accumulativeStats.totalSaved >= 0 ? <PiggyBank className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                        {accumulativeStats.totalSaved > 0 ? '+' : ''}{formatCurrency(accumulativeStats.totalSaved)}
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* Daily List Cards */}
      <div className="space-y-6">
        {dailyData.length === 0 ? (
           <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <div className="bg-white dark:bg-slate-900 w-20 h-20 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
                 <Utensils className="w-8 h-8 opacity-30" />
              </div>
              <p className="font-medium">Chưa có dữ liệu ăn uống.</p>
              <button onClick={onAddTransaction} className="mt-4 text-emerald-500 font-bold hover:underline">
                 + Thêm bữa ăn đầu tiên
              </button>
           </div>
        ) : (
            dailyData.map((day) => (
                <div key={day.date} className="relative pl-6 group">
                    {/* Timeline Line */}
                    <div className="absolute left-[3px] top-4 bottom-0 w-[2px] bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-6 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-slate-50 dark:ring-slate-950 z-10"></div>
                    
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-white/50 dark:border-white/5 relative overflow-hidden group-hover:-translate-y-1">
                        
                        {/* Decorative background icon specific for receipts/food */}
                        <Receipt className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-200 dark:text-slate-700/50 rotate-12 pointer-events-none opacity-20" />

                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-lg">
                                    {formatDate(day.date)}
                                </span>
                            </div>
                            <div className={`flex flex-col items-end ${day.savings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                 <span className="text-[10px] font-bold uppercase opacity-60 mb-0.5">Tiết kiệm</span>
                                 <div className="font-bold flex items-center gap-1 text-lg leading-none">
                                    {day.savings >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    {day.savings >= 0 ? '+' : ''}{formatCurrency(day.savings)}
                                 </div>
                            </div>
                        </div>

                        {/* Transaction Items */}
                        <div className="space-y-3 relative z-10">
                            {day.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center py-1">
                                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                                        {item.note || 'Ăn uống'}
                                    </span>
                                    <span className="font-bold text-slate-800 dark:text-white">
                                        {formatCurrency(item.amount)}
                                    </span>
                                </div>
                            ))}
                            
                            {/* Divider */}
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-3"></div>

                            {/* Total Row */}
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
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
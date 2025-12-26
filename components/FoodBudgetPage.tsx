import React, { useState, useMemo } from 'react';
import { Utensils, Edit2, TrendingUp, TrendingDown, Calendar, Wallet, Pencil, Check, X, Trash2, LayoutGrid, List, Receipt } from 'lucide-react';
import { Transaction, Currency } from '../types';
import { vibrate } from '../App';

interface FoodBudgetPageProps {
  transactions: Transaction[];
  dailyLimit: number;
  onSetLimit: (limit: number) => void;
  onAddTransaction: () => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  currency: Currency;
}

export const FoodBudgetPage: React.FC<FoodBudgetPageProps> = ({ 
  transactions, 
  dailyLimit, 
  onSetLimit,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  currency
}) => {
  const [isEditingLimit, setIsEditingLimit] = useState(dailyLimit === 0);
  const [tempLimit, setTempLimit] = useState(dailyLimit.toString());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ note: string; amount: string }>({ note: '', amount: '' });
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const handleSaveLimit = () => {
    vibrate(10);
    const val = parseFloat(tempLimit);
    if (!isNaN(val) && val >= 0) {
      onSetLimit(val);
      setIsEditingLimit(false);
    }
  };

  const formatCurrency = (value: number) => {
    const isNoDecimal = currency === 'VND' || currency === 'IDR' || currency === 'KRW';
     return new Intl.NumberFormat(currency === 'VND' ? 'vi-VN' : (currency === 'USD' ? 'en-US' : (currency === 'KRW' ? 'ko-KR' : 'id-ID')), {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: isNoDecimal ? 0 : 2
     }).format(value);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(date);
  };

  const foodTransactions = useMemo(() => 
    transactions.filter(t => t.type === 'expense' && t.category === 'food').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  [transactions]);

  // Calculate daily totals for quick lookup
  const dailyStatsMap = useMemo(() => {
    const stats: Record<string, number> = {};
    foodTransactions.forEach(t => {
        const dateKey = t.date.split('T')[0];
        stats[dateKey] = (stats[dateKey] || 0) + t.amount;
    });
    return stats;
  }, [foodTransactions]);

  const accumulativeStats = useMemo(() => {
    const uniqueDates = new Set(foodTransactions.map(t => t.date.split('T')[0]));
    const daysCount = uniqueDates.size;
    const totalSpent = foodTransactions.reduce((acc, t) => acc + t.amount, 0);
    const totalExpectedBudget = daysCount * dailyLimit;
    const totalSaved = totalExpectedBudget - totalSpent;

    return { daysCount, totalSpent, totalExpectedBudget, totalSaved };
  }, [foodTransactions, dailyLimit]);

  // Group data for Grid View
  const dailyGroups = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    foodTransactions.forEach(t => {
      const dateKey = t.date.split('T')[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });
    return Object.entries(groups).map(([date, items]) => ({
      date,
      items,
      totalSpent: dailyStatsMap[date] || 0,
      savings: dailyLimit - (dailyStatsMap[date] || 0)
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [foodTransactions, dailyStatsMap, dailyLimit]);


  // Start Inline Editing
  const startEdit = (t: Transaction) => {
    setEditingId(t.id);
    setEditForm({ note: t.note, amount: t.amount.toString() });
  };

  // Cancel Inline Editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ note: '', amount: '' });
  };

  // Save Inline Edit
  const saveEdit = (original: Transaction) => {
      const newAmount = parseFloat(editForm.amount);
      if (!isNaN(newAmount) && newAmount > 0) {
          onUpdateTransaction({
              ...original,
              note: editForm.note,
              amount: newAmount
          });
          setEditingId(null);
          vibrate(10);
      }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      
      {/* Top Section: Stats Cards */}
      <div className="xl:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Budget Config */}
          <div className="bg-gradient-to-tr from-emerald-500 to-teal-600 dark:from-emerald-800 dark:to-teal-800 rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between h-48">
             <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
             <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-2.5 bg-white/20 p-2 rounded-xl backdrop-blur-md">
                    <Utensils className="w-5 h-5" />
                </div>
                <button onClick={() => { vibrate(10); setTempLimit(dailyLimit.toString()); setIsEditingLimit(true); }} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                    <Edit2 className="w-4 h-4" />
                </button>
             </div>
             <div className="relative z-10">
                 <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1 opacity-90">Ngân sách / ngày</p>
                 {isEditingLimit ? (
                    <div className="flex gap-2">
                         <input 
                            type="number" 
                            value={tempLimit}
                            onChange={(e) => setTempLimit(e.target.value)}
                            className="w-full bg-white/20 rounded-xl px-3 py-1 text-xl font-bold text-white placeholder-white/50 outline-none"
                            autoFocus
                        />
                        <button onClick={handleSaveLimit} className="bg-white text-emerald-600 px-3 rounded-xl font-bold hover:bg-emerald-50"><Check className="w-4 h-4"/></button>
                    </div>
                 ) : (
                    <h2 className="text-4xl font-bold tracking-tight">{formatCurrency(dailyLimit)}</h2>
                 )}
             </div>
          </div>

          {/* Card 2: Total Spent */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-48">
              <div className="flex items-center justify-between">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl text-orange-600 dark:text-orange-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="text-slate-400 text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{accumulativeStats.daysCount} ngày</span>
              </div>
              <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Tổng đã ăn</p>
                  <h2 className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight">{formatCurrency(accumulativeStats.totalSpent)}</h2>
              </div>
          </div>

           {/* Card 3: Savings */}
           <div className={`rounded-[2rem] p-6 border shadow-sm flex flex-col justify-between h-48 ${accumulativeStats.totalSaved >= 0 ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800'}`}>
              <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${accumulativeStats.totalSaved >= 0 ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-rose-200 dark:bg-rose-800 text-rose-700 dark:text-rose-300'}`}>
                    {accumulativeStats.totalSaved >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
              </div>
              <div>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${accumulativeStats.totalSaved >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>Tổng Dư ra</p>
                  <h2 className={`text-4xl font-bold tracking-tight ${accumulativeStats.totalSaved >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                      {accumulativeStats.totalSaved >= 0 ? '+' : ''}{formatCurrency(accumulativeStats.totalSaved)}
                  </h2>
              </div>
          </div>
      </div>

      {/* Bottom Section: Transactions */}
      <div className="xl:col-span-12">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[500px]">
            {/* Header Area with Toggle */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        Lịch sử ăn uống
                    </h3>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button 
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button 
                             onClick={() => setViewMode('grid')}
                             className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <button onClick={onAddTransaction} className="text-sm font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-4 py-2 rounded-xl transition-colors">
                    + Thêm mới
                </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/30 dark:bg-slate-900/30">
                {foodTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Utensils className="w-12 h-12 mb-3 opacity-20" />
                        <p>Chưa có dữ liệu</p>
                    </div>
                ) : (
                    <>
                        {/* VIEW MODE: TABLE */}
                        {viewMode === 'table' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Thời gian</th>
                                            <th className="px-6 py-4">Món ăn / Ghi chú</th>
                                            <th className="px-6 py-4 text-right">Số tiền</th>
                                            <th className="px-6 py-4 text-right">Dư trong ngày</th>
                                            <th className="px-6 py-4 text-center">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {foodTransactions.map((t) => {
                                            const isEditing = editingId === t.id;
                                            const dateKey = t.date.split('T')[0];
                                            const dailySpent = dailyStatsMap[dateKey] || 0;
                                            const dailySavings = dailyLimit - dailySpent;

                                            return (
                                                <tr key={t.id} className="group hover:bg-white dark:hover:bg-slate-800 transition-colors rounded-2xl">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{formatDate(t.date)}</span>
                                                            <span className="text-[10px] text-slate-400">{new Date(t.date).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {isEditing ? (
                                                            <input 
                                                                type="text" 
                                                                value={editForm.note}
                                                                onChange={(e) => setEditForm({...editForm, note: e.target.value})}
                                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
                                                                    <Utensils className="w-4 h-4" />
                                                                </div>
                                                                <span className="font-medium text-slate-700 dark:text-slate-200">{t.note || 'Ăn uống'}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {isEditing ? (
                                                            <input 
                                                                type="number" 
                                                                value={editForm.amount}
                                                                onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                                                                className="w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-emerald-500 outline-none"
                                                            />
                                                        ) : (
                                                            <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(t.amount)}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                         <span className={`text-sm font-bold px-2 py-1 rounded-lg ${dailySavings >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                                            {dailySavings >= 0 ? '+' : ''}{formatCurrency(dailySavings)}
                                                         </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {isEditing ? (
                                                                <>
                                                                    <button onClick={() => saveEdit(t)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors" title="Lưu">
                                                                        <Check className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={cancelEdit} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors" title="Hủy">
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button onClick={() => startEdit(t)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Sửa">
                                                                        <Pencil className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => onDeleteTransaction(t.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Xóa">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* VIEW MODE: GRID */}
                        {viewMode === 'grid' && (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {dailyGroups.map((day) => (
                                    <div key={day.date} className="group flex flex-col h-full">
                                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-700 relative overflow-hidden flex-1">
                                            {/* Decorative Background Icon */}
                                            <Receipt className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-100 dark:text-slate-700/50 rotate-12 pointer-events-none" />
                                            
                                            {/* Header of Card */}
                                            <div className="flex justify-between items-start mb-4 relative z-10 border-b border-slate-100 dark:border-slate-700 pb-3">
                                                <div>
                                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                        {formatDate(day.date)}
                                                    </span>
                                                </div>
                                                <div className={`flex flex-col items-end ${day.savings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    <div className={`font-bold flex items-center gap-1.5 text-xs px-2 py-1 rounded-full shadow-sm ${day.savings >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/30'}`}>
                                                        {day.savings >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                                        Dư: {day.savings >= 0 ? '+' : ''}{formatCurrency(day.savings)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* List of items in Grid */}
                                            <div className="space-y-3 relative z-10">
                                                {day.items.map(item => (
                                                    <div key={item.id} className="flex justify-between items-center py-1 group/item">
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <p className="text-slate-700 dark:text-slate-200 font-bold text-sm truncate group-hover/item:text-emerald-600 transition-colors">
                                                                {item.note || 'Ăn uống'}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400">
                                                                {new Date(item.date).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                                            </p>
                                                        </div>
                                                        <span className="font-bold text-slate-800 dark:text-white text-sm whitespace-nowrap">
                                                            {formatCurrency(item.amount)}
                                                        </span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-100 dark:border-slate-700 border-dashed">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                        Tổng chi
                                                    </span>
                                                    <span className="text-lg font-bold text-slate-800 dark:text-white">
                                                        {formatCurrency(day.totalSpent)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        )}
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
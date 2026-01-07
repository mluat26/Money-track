
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PieChart as PieChartIcon, Wallet, Home, Moon, Sun, Utensils, Sparkles, Plus, CloudCog, Download, TrendingUp, TrendingDown, Menu, X, Coins, Settings, LayoutDashboard, ChevronRight, LogOut, ChevronLeft, Globe, HardDrive, Zap, Edit3, Banknote, ArrowUp, Calendar, Filter, PenLine } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import html2canvas from 'html2canvas';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { DailyBudget } from './components/DailyBudget';
import { FoodBudgetPage } from './components/FoodBudgetPage';
import { SheetSyncModal } from './components/SheetSyncModal';
import { DailyTracker } from './components/DailyTracker';
import { DataManagementModal } from './components/DataManagementModal';
import { ShortcutsPage } from './components/ShortcutsPage';
import { Transaction, CATEGORIES, TransactionType, Currency, Shortcut } from './types';

export const vibrate = (pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
};

const IconMap: Record<string, React.ElementType> = {
  Utensils, Home, Zap, Sparkles, Coins, TrendingUp, Banknote
};

type FilterType = 'week' | 'month' | 'year' | 'all' | 'custom';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => {
    const saved = localStorage.getItem('shortcuts');
    return saved ? JSON.parse(saved) : [
        { id: '1', name: 'Cafe sáng', amount: 35000, category: 'food', type: 'expense' },
        { id: '2', name: 'Gửi xe', amount: 5000, category: 'transport', type: 'expense' },
        { id: '3', name: 'Nhận lương', amount: 15000000, category: 'salary', type: 'income' }
    ];
  });

  const [dailyFoodLimit, setDailyFoodLimit] = useState<number>(() => {
    const saved = localStorage.getItem('dailyFoodLimit');
    return saved ? parseFloat(saved) : 0;
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('currency') as Currency) || 'VND';
  });

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [formConfig, setFormConfig] = useState<{ isOpen: boolean; type: TransactionType }>({
    isOpen: false,
    type: 'expense'
  });
  
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'food-budget' | 'shortcuts' | 'settings'>('dashboard');
  const [storageUsed, setStorageUsed] = useState<number>(0);
  const [timeFilter, setTimeFilter] = useState<FilterType>('month');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    calculateStorage();
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
  }, [shortcuts]);

  useEffect(() => {
    localStorage.setItem('dailyFoodLimit', dailyFoodLimit.toString());
  }, [dailyFoodLimit]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const calculateStorage = () => {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += new Blob([localStorage[key]]).size;
        }
    }
    setStorageUsed(total);
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: crypto.randomUUID() };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const useShortcut = (s: Shortcut) => {
    vibrate([20, 40]);
    addTransaction({
        amount: s.amount,
        type: s.type,
        category: s.category,
        note: s.name,
        date: new Date().toISOString()
    });
  };

  const updateTransaction = (updated: Transaction) => {
      setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const deleteTransaction = (id: string) => {
    vibrate(15);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      if (timeFilter === 'all') return true;
      if (timeFilter === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0,0,0,0);
        return tDate >= startOfWeek;
      }
      if (timeFilter === 'month') {
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      }
      if (timeFilter === 'year') {
        return tDate.getFullYear() === now.getFullYear();
      }
      if (timeFilter === 'custom' && customRange.start && customRange.end) {
        const start = new Date(customRange.start);
        const end = new Date(customRange.end);
        end.setHours(23,59,59,999);
        return tDate >= start && tDate <= end;
      }
      return true;
    });
  }, [transactions, timeFilter, customRange]);

  const stats = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  const chartData = useMemo(() => {
    const expenseByCategory: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });
    return Object.entries(expenseByCategory).map(([catId, value]) => ({
      name: CATEGORIES[catId]?.name || 'Khác',
      value,
      color: CATEGORIES[catId]?.color || '#cbd5e1'
    })).filter(item => item.value > 0).sort((a,b) => b.value - a.value);
  }, [filteredTransactions]);

  const formatMoney = (amount: number) => {
     const isNoDecimal = currency === 'VND' || currency === 'IDR' || currency === 'KRW';
     return new Intl.NumberFormat(currency === 'VND' ? 'vi-VN' : (currency === 'USD' ? 'en-US' : (currency === 'KRW' ? 'ko-KR' : 'id-ID')), {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: isNoDecimal ? 0 : 2
     }).format(amount);
  };

  const getFilterLabel = () => {
    switch(timeFilter) {
        case 'week': return 'Tuần này';
        case 'month': return 'Tháng này';
        case 'year': return 'Năm này';
        case 'custom': return 'Tùy chỉnh';
        default: return 'Tất cả';
    }
  };

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans overflow-hidden`}>
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-300/20 dark:bg-emerald-600/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      <aside className={`${isSidebarCollapsed ? 'w-24' : 'w-72'} transition-all duration-300 ease-in-out flex-shrink-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 z-20 flex flex-col justify-between relative`}>
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute -right-3 top-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1.5 shadow-sm text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors z-30">
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <div>
            <div className={`p-8 flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl shadow-lg shrink-0">
                    <Wallet className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                {!isSidebarCollapsed && <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white whitespace-nowrap overflow-hidden">MoneyTracker</h1>}
            </div>
            <nav className="px-4 space-y-2">
                {[
                    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, color: 'emerald' },
                    { id: 'food-budget', label: 'Ăn uống', icon: Utensils, color: 'orange' },
                    { id: 'shortcuts', label: 'Phím tắt', icon: Zap, color: 'amber' }
                ].map((item) => (
                    <button key={item.id} onClick={() => setActiveTab(item.id as any)} title={isSidebarCollapsed ? item.label : ''} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-semibold group relative overflow-hidden ${activeTab === item.id ? `bg-${item.color}-50 text-${item.color}-600 dark:bg-${item.color}-900/20 dark:text-${item.color}-400` : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
                        <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? `text-${item.color}-600 dark:text-${item.color}-400` : ''}`} />
                        {!isSidebarCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                        {activeTab === item.id && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-${item.color}-500 rounded-r-full`}></div>}
                    </button>
                ))}
                 <button onClick={() => setIsSyncModalOpen(true)} title={isSidebarCollapsed ? "Đồng bộ Sheet" : ""} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
                    <CloudCog className="w-5 h-5 shrink-0" />
                    {!isSidebarCollapsed && <span className="whitespace-nowrap">Đồng bộ Sheet</span>}
                </button>
            </nav>
          </div>
          <div className="p-6 space-y-4">
              <div className={`bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 transition-all ${isSidebarCollapsed ? 'px-2 py-4 flex flex-col gap-4 items-center' : ''}`}>
                  {!isSidebarCollapsed && <div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-slate-400 uppercase">Cài đặt nhanh</span></div>}
                  <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'flex-col' : 'justify-between'}`}>
                      <button onClick={() => { vibrate(15); setDarkMode(!darkMode); }} className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm hover:scale-105 transition-transform shrink-0">
                          {darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                      </button>
                      {!isSidebarCollapsed && <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>}
                      <div className="relative group w-full">
                         {isSidebarCollapsed ? <div className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-700 rounded-xl shadow-sm text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">{currency.substring(0,1)}</div> : (
                            <div className="relative">
                                <Globe className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="w-full appearance-none bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold py-2 pl-9 pr-8 rounded-xl shadow-sm outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                                    <option value="VND">VND (₫)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="IDR">IDR (Rp)</option>
                                    <option value="KRW">KRW (₩)</option>
                                </select>
                                <ChevronRight className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                            </div>
                         )}
                      </div>
                  </div>
              </div>
               <button onClick={() => setIsDataModalOpen(true)} className={`w-full bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-3 flex items-center gap-3 group hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all cursor-pointer ${isSidebarCollapsed ? 'flex-col justify-center px-1' : ''}`}>
                   <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0 group-hover:scale-110 transition-transform"><HardDrive className="w-4 h-4" /></div>
                   {!isSidebarCollapsed && <div className="flex-1 min-w-0 text-left"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Lưu trữ máy</p><p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{(storageUsed / 1024).toFixed(1)} KB</p></div>}
               </button>
          </div>
      </aside>

      <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 scroll-smooth">
          <div className="max-w-7xl mx-auto p-8 lg:p-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
                        {activeTab === 'dashboard' ? 'Bảng Điều Khiển' : (activeTab === 'food-budget' ? 'Quỹ Ăn Uống' : 'Quản Lý Phím Tắt')}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">Ghi lại các khoản thu chi một cách thông minh.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setFormConfig({ isOpen: true, type: 'expense' })} 
                        className="bg-emerald-600 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                         <PenLine className="w-5 h-5" /> <span>Ghi chú</span>
                    </button>
                </div>
            </header>

            {activeTab === 'dashboard' && (
                <div className="grid grid-cols-12 gap-8 animate-fade-in">
                    <div className="col-span-12 xl:col-span-8 space-y-8">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-emerald-500/30 relative overflow-hidden group">
                                {/* Pattern Background */}
                                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-yellow-400/30 rounded-full blur-[80px] -mr-20 -mt-20 mix-blend-overlay"></div>
                                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-lime-500/30 rounded-full blur-[60px] -ml-10 -mb-10 mix-blend-overlay"></div>
                                <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>

                                <div className="relative z-10 h-full flex flex-col justify-between min-h-[180px]">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-emerald-100/80 font-medium mb-1 flex items-center gap-2"><Wallet className="w-5 h-5" /> Số dư {getFilterLabel()}</p>
                                            <h2 className="text-5xl font-bold tracking-tighter">{formatMoney(stats.balance)}</h2>
                                        </div>
                                        <div className="relative">
                                            <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-bold transition-all backdrop-blur-md border border-white/10">
                                                <Calendar className="w-4 h-4" /> {getFilterLabel()}
                                            </button>
                                            {showFilterDropdown && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-2 z-50 animate-zoom-in">
                                                    {['all', 'week', 'month', 'year', 'custom'].map((f) => (
                                                        <button key={f} onClick={() => { setTimeFilter(f as FilterType); setShowFilterDropdown(false); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${timeFilter === f ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                                            {f === 'all' ? 'Tất cả' : f === 'week' ? 'Tuần này' : f === 'month' ? 'Tháng này' : f === 'year' ? 'Năm này' : 'Tùy chỉnh'}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {timeFilter === 'custom' && (
                                        <div className="flex gap-2 mt-4 animate-fade-in">
                                            <input type="date" value={customRange.start} onChange={(e) => setCustomRange({...customRange, start: e.target.value})} className="bg-white/10 rounded-lg px-2 py-1 text-xs outline-none text-white placeholder-white/50 border border-white/10" />
                                            <span className="text-white/40 flex items-center">to</span>
                                            <input type="date" value={customRange.end} onChange={(e) => setCustomRange({...customRange, end: e.target.value})} className="bg-white/10 rounded-lg px-2 py-1 text-xs outline-none text-white placeholder-white/50 border border-white/10" />
                                        </div>
                                    )}
                                    <div className="flex gap-4 mt-8">
                                         <div className="bg-black/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/5 flex-1">
                                            <span className="text-[10px] font-bold text-emerald-300 uppercase block mb-0.5 tracking-wide">Thu nhập</span>
                                            <span className="font-bold text-lg text-white">{formatMoney(stats.income)}</span>
                                         </div>
                                         <div className="bg-black/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/5 flex-1">
                                            <span className="text-[10px] font-bold text-rose-300 uppercase block mb-0.5 tracking-wide">Chi tiêu</span>
                                            <span className="font-bold text-lg text-white">{formatMoney(stats.expense)}</span>
                                         </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-80 flex flex-col gap-6">
                                <DailyTracker transactions={transactions} onAddClick={() => setFormConfig({ isOpen: true, type: 'expense' })} />
                                <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-[2rem] p-6 border border-white/60 dark:border-white/5 shadow-sm">
                                     <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Phím tắt nhanh</h3>
                                        <button onClick={() => setActiveTab('shortcuts')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Edit3 className="w-4 h-4" /></button>
                                     </div>
                                     <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1">
                                        {shortcuts.length === 0 ? <div className="text-[10px] text-slate-400 italic py-2">Chưa có phím tắt</div> : shortcuts.map(s => {
                                            const cat = CATEGORIES[s.category] || CATEGORIES.other;
                                            return (
                                                <button key={s.id} onClick={() => useShortcut(s)} className="flex flex-col items-center gap-1.5 shrink-0 group">
                                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm transition-all group-hover:scale-110 group-active:scale-95" style={{ backgroundColor: cat.color }}>
                                                        {React.createElement(IconMap[cat.icon] || Zap, { className: "w-5 h-5" })}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate w-14 text-center">{s.name}</span>
                                                </button>
                                            )
                                        })}
                                     </div>
                                </div>
                            </div>
                        </div>

                        {chartData.length > 0 && (
                            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-[2rem] border border-white/60 dark:border-white/5 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-xl flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-indigo-500" /> Phân bố chi tiêu</h3>
                                    <button onClick={async () => {
                                        if (receiptRef.current) {
                                            const canvas = await html2canvas(receiptRef.current, { backgroundColor: null, scale: 2 });
                                            const link = document.createElement('a');
                                            link.download = `Spending_${new Date().toISOString().split('T')[0]}.png`;
                                            link.href = canvas.toDataURL();
                                            link.click();
                                        }
                                    }} className="text-sm font-bold text-indigo-500 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"><Download className="w-4 h-4" /> Xuất ảnh</button>
                                </div>
                                <div ref={receiptRef} className="flex flex-col md:flex-row items-center">
                                    <div className="h-64 w-full md:w-1/3 min-w-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none" cornerRadius={6}>
                                                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                                </Pie>
                                                <Tooltip formatter={(value: any) => formatMoney(Number(value))} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 pl-0 md:pl-8 mt-6 md:mt-0 w-full">
                                        {chartData.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                    <span className="font-medium text-sm text-slate-600 dark:text-slate-300">{item.name}</span>
                                                </div>
                                                <div className="text-right"><div className="font-bold text-sm text-slate-800 dark:text-white">{formatMoney(item.value)}</div></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 gap-8">
                            <DailyBudget transactions={transactions} limit={dailyFoodLimit} onSetLimit={setDailyFoodLimit} onClick={() => setActiveTab('food-budget')} currency={currency} />
                        </div>
                    </div>

                    <div className="col-span-12 xl:col-span-4 space-y-6">
                        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-[2rem] p-6 border border-white/60 dark:border-white/5 shadow-sm h-full max-h-[calc(100vh-160px)] overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center mb-6 shrink-0">
                                <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">Giao dịch {getFilterLabel()}</h3>
                                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-500 font-medium">{filteredTransactions.length} items</span>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar -mr-2">
                                 <TransactionList transactions={filteredTransactions} onDelete={deleteTransaction} currency={currency} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'food-budget' && <div className="animate-slide-in-right"><FoodBudgetPage transactions={transactions} dailyLimit={dailyFoodLimit} onSetLimit={setDailyFoodLimit} onAddTransaction={() => setFormConfig({ isOpen: true, type: 'expense' })} onUpdateTransaction={updateTransaction} onDeleteTransaction={deleteTransaction} currency={currency} /></div>}
            {activeTab === 'shortcuts' && <div className="animate-slide-in-right"><ShortcutsPage shortcuts={shortcuts} onSave={setShortcuts} currency={currency} onUseShortcut={useShortcut} /></div>}
          </div>
      </main>

      <SheetSyncModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />
      <DataManagementModal isOpen={isDataModalOpen} onClose={() => setIsDataModalOpen(false)} onClearTransactions={() => setTransactions([])} onClearSettings={() => { setDailyFoodLimit(0); setCurrency('VND'); }} />

      {formConfig.isOpen && (
        <TransactionForm onAdd={addTransaction} onClose={() => setFormConfig(prev => ({ ...prev, isOpen: false }))} initialType={formConfig.type} currency={currency} />
      )}
    </div>
  );
}

export default App;

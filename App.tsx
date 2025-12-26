import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PieChart as PieChartIcon, Wallet, Home, Moon, Sun, Utensils, Sparkles, Plus, CloudCog, Download, TrendingUp, TrendingDown, Menu, X, Coins, Settings, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import html2canvas from 'html2canvas';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { DailyBudget } from './components/DailyBudget';
import { FoodBudgetPage } from './components/FoodBudgetPage';
import { SheetSyncModal } from './components/SheetSyncModal';
import { DailyTracker } from './components/DailyTracker';
import { Transaction, CATEGORIES, TransactionType, Currency } from './types';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
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
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [formConfig, setFormConfig] = useState<{ isOpen: boolean; type: TransactionType }>({
    isOpen: false,
    type: 'expense'
  });
  
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'food-budget'>('dashboard');
  const [isScrolled, setIsScrolled] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

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

  // Sticky Header Scroll Listener for Dashboard
  useEffect(() => {
    const handleScroll = () => {
        if (activeTab === 'dashboard') {
            setIsScrolled(window.scrollY > 80); // Adjusted threshold
        } else {
            setIsScrolled(false);
        }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const syncToSheet = async (transaction: Omit<Transaction, 'id'>) => {
    const scriptUrl = localStorage.getItem('googleSheetScriptUrl');
    if (!scriptUrl) return;

    try {
        await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: transaction.date,
                amount: transaction.amount,
                type: transaction.type,
                category: transaction.category,
                categoryName: CATEGORIES[transaction.category]?.name || transaction.category,
                note: transaction.note,
                currency: currency
            })
        });
        console.log("Synced to sheet");
    } catch (e) {
        console.error("Sync failed", e);
    }
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: crypto.randomUUID() };
    setTransactions(prev => [newTransaction, ...prev]);
    syncToSheet(t);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const openForm = (type: TransactionType = 'expense') => {
    setFormConfig({ isOpen: true, type });
  };

  const handleExportReceipt = async () => {
    if (receiptRef.current) {
        try {
            const canvas = await html2canvas(receiptRef.current, {
                backgroundColor: null,
                scale: 2
            });
            const link = document.createElement('a');
            link.download = `Hoa_don_chi_tieu_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.png`;
            link.href = canvas.toDataURL();
            link.click();
        } catch (error) {
            console.error("Export failed", error);
            alert("Không thể xuất hóa đơn lúc này.");
        }
    }
  };

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    const expenseByCategory: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });
    
    return Object.entries(expenseByCategory).map(([catId, value]) => ({
      name: CATEGORIES[catId]?.name || 'Khác',
      value,
      color: CATEGORIES[catId]?.color || '#cbd5e1'
    })).filter(item => item.value > 0).sort((a,b) => b.value - a.value);
  }, [transactions]);

  // Global Helper for Formatting
  const formatMoney = (amount: number) => {
     return new Intl.NumberFormat(currency === 'VND' ? 'vi-VN' : (currency === 'USD' ? 'en-US' : 'id-ID'), {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: currency === 'VND' || currency === 'IDR' ? 0 : 2
     }).format(amount);
  };

  return (
    <div className={`min-h-screen relative overflow-x-hidden bg-[#f0fdf4] dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-32 sm:pb-8 transition-colors duration-500 font-sans`}>
      
      {/* Soft Pastel Background Gradients */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-300/30 dark:bg-emerald-600/10 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-normal"></div>
      <div className="fixed top-[20%] right-[-10%] w-[400px] h-[400px] bg-teal-200/40 dark:bg-teal-600/10 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-normal"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-lime-200/30 dark:bg-lime-900/10 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-normal"></div>

      {/* Main Header */}
      <header className="sticky top-0 z-30 pt-4 pb-1 px-5">
        <div className="max-w-2xl mx-auto flex justify-between items-center bg-white/60 dark:bg-slate-900/60 p-3 rounded-full shadow-sm border border-white/50 dark:border-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-2.5 px-2">
            <div className="bg-emerald-500 p-2 rounded-full shadow-lg shadow-emerald-200 dark:shadow-none">
              <Wallet className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-lg font-bold text-slate-700 dark:text-white tracking-tight">
              MoneyTracker
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Burger Menu Button */}
            <button 
                onClick={() => setIsMenuOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all hover:text-emerald-500"
            >
                <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Burger Menu Sidebar / Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsMenuOpen(false)}></div>
            <div className="relative w-72 bg-white dark:bg-slate-900 h-full shadow-2xl p-6 animate-slide-left flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Settings className="w-5 h-5 text-slate-400" /> Cài đặt
                    </h2>
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6 flex-1">
                    {/* Currency Selector */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block flex items-center gap-2">
                            <Coins className="w-4 h-4" /> Đơn vị tiền tệ
                        </label>
                        <div className="space-y-2">
                            {(['VND', 'USD', 'IDR'] as Currency[]).map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setCurrency(c)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${currency === c ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-600' : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                >
                                    <span className="font-bold">{c}</span>
                                    {currency === c && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-800" />

                    {/* Other Actions */}
                    <div className="space-y-2">
                         <button 
                            onClick={() => { setIsSyncModalOpen(true); setIsMenuOpen(false); }}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-medium"
                         >
                            <span className="flex items-center gap-3"><CloudCog className="w-5 h-5 text-blue-500" /> Đồng bộ Sheet</span>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                         </button>

                         <button 
                            onClick={() => setDarkMode(!darkMode)}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-medium"
                         >
                            <span className="flex items-center gap-3">
                                {darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-400" />} 
                                Giao diện {darkMode ? 'Tối' : 'Sáng'}
                            </span>
                         </button>
                    </div>
                </div>
                
                <div className="text-center text-xs text-slate-400 mt-4">
                    MoneyTracker v1.2
                </div>
            </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-5 py-2 space-y-6">
        
        {/* Dashboard View */}
        <div className={`${activeTab === 'dashboard' ? 'block' : 'hidden'} space-y-6 animate-fade-in`}>
          
          {/* Daily Tracker Banner - ONLY IN DASHBOARD */}
          <DailyTracker transactions={transactions} onAddClick={() => openForm('expense')} />
          
          {/* Total Balance Card Wrapper */}
          <div className="relative">
              
              {/* Main Expanded Card */}
              <div className={`bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-900 dark:to-teal-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-200/50 dark:shadow-none relative overflow-hidden group flex flex-col justify-between transition-all duration-300 origin-top ${isScrolled ? 'opacity-0 scale-95 h-0 p-0 mb-0 pointer-events-none overflow-hidden' : 'opacity-100 scale-100 h-[260px] mb-6'}`}>
                
                {/* Modern Simple Curve Line Pattern */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1440 320' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,133.3C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z' fill='white' fill-opacity='0.1'/%3E%3Cpath d='M0,224L60,213.3C120,203,240,181,360,176C480,171,600,181,720,197.3C840,213,960,235,1080,224C1200,213,1320,171,1380,149.3L1440,128' stroke='white' stroke-width='2' stroke-opacity='0.2' fill='none'/%3E%3C/svg%3E")`, backgroundSize: 'cover', backgroundPosition: 'bottom' }}></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="relative z-10 animate-fade-in">
                    <p className="text-emerald-100 text-sm font-medium mb-1 opacity-90 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Tổng số dư
                    </p>
                    <h2 className="text-5xl font-bold tracking-tighter">
                    {formatMoney(stats.balance)}
                    </h2>
                </div>
                
                <div className="flex gap-3 relative z-10 mt-auto">
                  <div className="bg-white/10 dark:bg-black/20 rounded-2xl p-4 flex-1 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                      <div className="flex items-center gap-1.5 text-emerald-100 text-[10px] uppercase font-bold tracking-wider mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-300"></div> Thu
                      </div>
                      <p className="font-semibold text-lg tracking-tight">{formatMoney(stats.income)}</p>
                  </div>
                  <div className="bg-white/10 dark:bg-black/20 rounded-2xl p-4 flex-1 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                      <div className="flex items-center gap-1.5 text-rose-100 text-[10px] uppercase font-bold tracking-wider mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-300"></div> Chi
                      </div>
                      <p className="font-semibold text-lg tracking-tight">{formatMoney(stats.expense)}</p>
                  </div>
                </div>
              </div>

              {/* Sticky Minimized Card - Green Pill */}
              <div className={`fixed top-4 left-4 right-4 z-40 bg-emerald-600 text-white rounded-full p-2 px-4 shadow-xl shadow-emerald-900/20 flex items-center justify-between transition-all duration-500 transform ${isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
                 <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-1.5 rounded-full text-white backdrop-blur-sm">
                        <Wallet className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-emerald-100 uppercase tracking-wide">Số dư</span>
                        <span className="text-sm font-bold text-white leading-tight">
                            {formatMoney(stats.balance)}
                        </span>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 text-xs font-medium">
                    <span className="text-emerald-100 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{new Intl.NumberFormat('en-US', { notation: "compact" }).format(stats.income)}</span>
                    <span className="w-px h-3 bg-white/30"></span>
                    <span className="text-rose-100 flex items-center gap-1"><TrendingDown className="w-3 h-3" />{new Intl.NumberFormat('en-US', { notation: "compact" }).format(stats.expense)}</span>
                 </div>
              </div>
          </div>
          
          {dailyFoodLimit === 0 && (
            <DailyBudget 
                transactions={transactions} 
                limit={dailyFoodLimit} 
                onSetLimit={setDailyFoodLimit}
                onClick={() => setActiveTab('food-budget')}
                currency={currency}
            />
          )}

          {chartData.length > 0 && (
            <div className="bg-white/60 dark:bg-slate-900/60 p-6 rounded-[2rem] shadow-sm backdrop-blur-xl border border-white/60 dark:border-white/5 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2 relative z-10">
                 <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-lg">
                        <PieChartIcon className="w-4 h-4 text-indigo-500" />
                    </div>
                    Phân bố
                 </h3>
                 <button 
                    onClick={handleExportReceipt}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-indigo-500"
                    title="Xuất hóa đơn"
                 >
                    <Download className="w-4 h-4" />
                 </button>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-48 w-48 relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={6}
                          dataKey="value"
                          stroke="none"
                          cornerRadius={6}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => formatMoney(Number(value))}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', backgroundColor: darkMode ? '#1e293b' : 'rgba(255,255,255,0.95)', color: darkMode ? '#fff' : '#334155', padding: '8px 12px', fontSize: '12px' }}
                          itemStyle={{ color: darkMode ? '#e2e8f0' : '#334155' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-start flex-1">
                     {chartData.map((item, idx) => (
                       <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/50 dark:border-white/5">
                          <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                          {item.name}
                          <span className="opacity-60">{Math.round((item.value / stats.expense) * 100)}%</span>
                       </div>
                     ))}
                  </div>
              </div>
            </div>
          )}

          {/* Recent transactions */}
          <div>
            <div className="flex justify-between items-end mb-4 px-2">
              <h3 className="font-bold text-slate-700 dark:text-slate-200 text-lg">Giao dịch gần đây</h3>
              <span className="text-xs text-slate-400 font-medium">Vuốt để xem thêm</span>
            </div>
            <TransactionList transactions={transactions} onDelete={deleteTransaction} currency={currency} />
          </div>
        </div>

        {/* Food Budget Detail View */}
        {activeTab === 'food-budget' && (
           <FoodBudgetPage 
             transactions={transactions}
             dailyLimit={dailyFoodLimit}
             onSetLimit={setDailyFoodLimit}
             onAddTransaction={() => openForm('expense')}
             currency={currency}
           />
        )}

      </main>

      {/* Hidden Receipt for Export */}
      <div className="fixed top-[-9999px] left-[-9999px]">
         <div ref={receiptRef} className="w-[380px] bg-white p-8 font-mono text-slate-800">
             <div className="text-center mb-6">
                 <div className="flex justify-center mb-2">
                     <div className="bg-emerald-500 p-2 rounded-xl">
                        <Wallet className="w-8 h-8 text-white" />
                     </div>
                 </div>
                 <h2 className="text-2xl font-bold tracking-tight text-slate-900">MONEY TRACKER</h2>
                 <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Hóa đơn tổng hợp</p>
                 <p className="text-xs text-slate-400 mt-1">{new Date().toLocaleString('vi-VN')}</p>
             </div>
             
             <div className="border-t-2 border-dashed border-slate-300 py-4 space-y-2">
                 <div className="flex justify-between font-bold">
                     <span>Tổng thu</span>
                     <span className="text-emerald-600">{formatMoney(stats.income)}</span>
                 </div>
                 <div className="flex justify-between font-bold">
                     <span>Tổng chi</span>
                     <span className="text-rose-600">{formatMoney(stats.expense)}</span>
                 </div>
                 <div className="flex justify-between pt-2 mt-2 border-t border-slate-100">
                     <span>Số dư</span>
                     <span className="font-black text-lg">{formatMoney(stats.balance)}</span>
                 </div>
             </div>

             <div className="border-t-2 border-dashed border-slate-300 pt-4 mb-4">
                 <p className="text-xs font-bold uppercase mb-3 text-slate-500">Top Chi Tiêu</p>
                 <div className="space-y-3">
                     {chartData.slice(0, 3).map((item, idx) => (
                         <div key={idx}>
                             <div className="flex justify-between text-xs font-bold mb-1">
                                 <span>{item.name}</span>
                                 <span>{formatMoney(item.value)}</span>
                             </div>
                             <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full rounded-full" style={{ width: `${(item.value / stats.expense) * 100}%`, backgroundColor: item.color }}></div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
             
             <div className="text-center mt-8 pt-4 border-t-2 border-dashed border-slate-300">
                 <p className="text-[10px] text-slate-400 italic">Cảm ơn bạn đã sử dụng MoneyTracker</p>
                 <p className="text-[10px] text-slate-300 mt-1">Generated by App</p>
             </div>
         </div>
      </div>

      {/* Modern Floating Bottom Navigation Bar */}
      <div className="fixed bottom-6 left-0 right-0 px-4 sm:hidden z-40 pointer-events-none flex justify-center">
        <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-[2.5rem] p-2 flex justify-between items-center pointer-events-auto border border-white/40 dark:border-white/5 min-w-[280px] gap-8">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <Home className="w-6 h-6" strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
          </button>

          {/* Center FAB */}
          <button
             onClick={() => openForm('expense')}
             className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-300/50 dark:shadow-emerald-900/30 hover:scale-105 active:scale-95 transition-all -mt-10 border-4 border-[#f0fdf4] dark:border-slate-950"
          >
             <Plus className="w-8 h-8" strokeWidth={3} />
          </button>

          <button
            onClick={() => setActiveTab('food-budget')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${activeTab === 'food-budget' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <Utensils className="w-6 h-6" strokeWidth={activeTab === 'food-budget' ? 2.5 : 2} />
          </button>
          
        </nav>
      </div>

      <SheetSyncModal 
        isOpen={isSyncModalOpen} 
        onClose={() => setIsSyncModalOpen(false)} 
      />

      {formConfig.isOpen && (
        <TransactionForm 
          onAdd={addTransaction} 
          onClose={() => setFormConfig(prev => ({ ...prev, isOpen: false }))}
          initialType={formConfig.type}
          currency={currency}
        />
      )}
    </div>
  );
}

export default App;
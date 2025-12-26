import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PieChart as PieChartIcon, Wallet, Home, Moon, Sun, Utensils, Sparkles, Plus, CloudCog, Download, TrendingUp, TrendingDown, Menu, X, Coins, Settings, LayoutDashboard, ChevronRight, LogOut, ChevronLeft, Globe } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import html2canvas from 'html2canvas';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { DailyBudget } from './components/DailyBudget';
import { FoodBudgetPage } from './components/FoodBudgetPage';
import { SheetSyncModal } from './components/SheetSyncModal';
import { DailyTracker } from './components/DailyTracker';
import { Transaction, CATEGORIES, TransactionType, Currency } from './types';

// Haptic feedback helper
export const vibrate = (pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
};

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

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [formConfig, setFormConfig] = useState<{ isOpen: boolean; type: TransactionType }>({
    isOpen: false,
    type: 'expense'
  });
  
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'food-budget' | 'settings'>('dashboard');
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

  const updateTransaction = (updated: Transaction) => {
      setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const deleteTransaction = (id: string) => {
    vibrate(15);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const openForm = (type: TransactionType = 'expense') => {
    vibrate(10);
    setFormConfig({ isOpen: true, type });
  };

  const toggleTheme = () => {
      vibrate(15);
      setDarkMode(!darkMode);
  };

  const handleExportReceipt = async () => {
    vibrate(10);
    if (receiptRef.current) {
        try {
            const canvas = await html2canvas(receiptRef.current, {
                backgroundColor: null,
                scale: 2
            });
            const link = document.createElement('a');
            link.download = `Hoa_don_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.png`;
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

  const formatMoney = (amount: number) => {
     const isNoDecimal = currency === 'VND' || currency === 'IDR' || currency === 'KRW';
     return new Intl.NumberFormat(currency === 'VND' ? 'vi-VN' : (currency === 'USD' ? 'en-US' : (currency === 'KRW' ? 'ko-KR' : 'id-ID')), {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: isNoDecimal ? 0 : 2
     }).format(amount);
  };

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans overflow-hidden`}>
      
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-300/20 dark:bg-emerald-600/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Sidebar Navigation */}
      <aside 
        className={`${isSidebarCollapsed ? 'w-24' : 'w-72'} transition-all duration-300 ease-in-out flex-shrink-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 z-20 flex flex-col justify-between relative`}
      >
          {/* Collapse Toggle Button */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1.5 shadow-sm text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors z-30"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <div>
            <div className={`p-8 flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none shrink-0">
                    <Wallet className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                {!isSidebarCollapsed && (
                    <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white whitespace-nowrap overflow-hidden">
                        MoneyTracker
                    </h1>
                )}
            </div>

            <nav className="px-4 space-y-2">
                {[
                    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, color: 'emerald' },
                    { id: 'food-budget', label: 'Ăn uống', icon: Utensils, color: 'orange' }
                ].map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        title={isSidebarCollapsed ? item.label : ''}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-semibold group relative overflow-hidden
                            ${activeTab === item.id 
                                ? `bg-${item.color}-50 text-${item.color}-600 dark:bg-${item.color}-900/20 dark:text-${item.color}-400` 
                                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}
                            ${isSidebarCollapsed ? 'justify-center px-0' : ''}
                        `}
                    >
                        <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? `text-${item.color}-600 dark:text-${item.color}-400` : ''}`} />
                        {!isSidebarCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                        {activeTab === item.id && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-${item.color}-500 rounded-r-full`}></div>}
                    </button>
                ))}

                 <button 
                    onClick={() => setIsSyncModalOpen(true)}
                    title={isSidebarCollapsed ? "Đồng bộ Sheet" : ""}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                >
                    <CloudCog className="w-5 h-5 shrink-0" />
                    {!isSidebarCollapsed && <span className="whitespace-nowrap">Đồng bộ Sheet</span>}
                </button>
            </nav>
          </div>

          <div className="p-6">
              <div className={`bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 transition-all ${isSidebarCollapsed ? 'px-2 py-4 flex flex-col gap-4 items-center' : ''}`}>
                  {!isSidebarCollapsed && (
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase">Cài đặt nhanh</span>
                    </div>
                  )}
                  
                  <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'flex-col' : 'justify-between'}`}>
                      <button onClick={toggleTheme} className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm hover:scale-105 transition-transform shrink-0">
                          {darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                      </button>
                      
                      {!isSidebarCollapsed && <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>}
                      
                      <div className="relative group w-full">
                         {isSidebarCollapsed ? (
                             <div className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-700 rounded-xl shadow-sm text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                                {currency.substring(0,1)}
                             </div>
                         ) : (
                            <div className="relative">
                                <Globe className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select 
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value as Currency)}
                                    className="w-full appearance-none bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold py-2 pl-9 pr-8 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                                >
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
          </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 scroll-smooth">
          <div className="max-w-7xl mx-auto p-8 lg:p-12">
            
            {/* Header Area */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
                        {activeTab === 'dashboard' ? 'Bảng Điều Khiển' : (activeTab === 'food-budget' ? 'Quỹ Ăn Uống' : 'Cài Đặt')}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">Chào mừng trở lại, hôm nay bạn chi tiêu thế nào?</p>
                </div>
                <button 
                    onClick={() => openForm('expense')}
                    className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200/50 dark:shadow-none hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                    <Plus className="w-5 h-5 relative z-10" /> 
                    <span className="relative z-10">Thêm Giao Dịch</span>
                </button>
            </header>

            {activeTab === 'dashboard' && (
                <div className="grid grid-cols-12 gap-8 animate-fade-in">
                    
                    {/* Left Column (8 cols) */}
                    <div className="col-span-12 xl:col-span-8 space-y-8">
                        
                        {/* Big Balance Card */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-200/50 dark:shadow-none relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                                <div className="relative z-10 h-full flex flex-col justify-between min-h-[180px]">
                                    <div>
                                        <p className="text-emerald-100 font-medium mb-1 opacity-90 flex items-center gap-2">
                                            <Wallet className="w-5 h-5" /> Tổng số dư
                                        </p>
                                        <h2 className="text-5xl font-bold tracking-tighter">{formatMoney(stats.balance)}</h2>
                                    </div>
                                    <div className="flex gap-4 mt-4">
                                         <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                                            <span className="text-xs font-bold text-emerald-100 uppercase block mb-0.5">Thu nhập</span>
                                            <span className="font-bold text-lg">{formatMoney(stats.income)}</span>
                                         </div>
                                         <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                                            <span className="text-xs font-bold text-rose-100 uppercase block mb-0.5">Chi tiêu</span>
                                            <span className="font-bold text-lg">{formatMoney(stats.expense)}</span>
                                         </div>
                                    </div>
                                </div>
                            </div>

                            {/* Daily Insight / Quick Stats */}
                            <div className="flex flex-col gap-6">
                                <DailyTracker transactions={transactions} onAddClick={() => openForm('expense')} />
                                
                                <div className="flex-1 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-[2rem] p-6 border border-white/60 dark:border-white/5 flex items-center justify-between shadow-sm">
                                     <div>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-1">Giao dịch gần nhất</p>
                                        <h3 className="font-bold text-xl">{transactions.length > 0 ? transactions[0].note || CATEGORIES[transactions[0].category].name : 'Chưa có'}</h3>
                                        {transactions.length > 0 && (
                                            <span className={`text-sm font-bold ${transactions[0].type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {transactions[0].type === 'income' ? '+' : '-'}{formatMoney(transactions[0].amount)}
                                            </span>
                                        )}
                                     </div>
                                     <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-500">
                                        <Sparkles className="w-6 h-6" />
                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart Section */}
                        {chartData.length > 0 && (
                            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-[2rem] border border-white/60 dark:border-white/5 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-xl flex items-center gap-2">
                                        <PieChartIcon className="w-5 h-5 text-indigo-500" />
                                        Phân bố chi tiêu
                                    </h3>
                                    <button onClick={handleExportReceipt} className="text-sm font-bold text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                        <Download className="w-4 h-4" /> Xuất ảnh
                                    </button>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-64 w-1/3 min-w-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={chartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
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
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: darkMode ? '#1e293b' : 'rgba(255,255,255,0.95)', color: darkMode ? '#fff' : '#334155' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 gap-4 pl-8">
                                        {chartData.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                    <span className="font-medium text-sm text-slate-600 dark:text-slate-300">{item.name}</span>
                                                </div>
                                                <div className="text-right">
                                                     <div className="font-bold text-sm text-slate-800 dark:text-white">{formatMoney(item.value)}</div>
                                                     <div className="text-[10px] text-slate-400">{Math.round((item.value / stats.expense) * 100)}%</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Daily Budget Widget (Inline) */}
                         {dailyFoodLimit === 0 && (
                            <DailyBudget 
                                transactions={transactions} 
                                limit={dailyFoodLimit} 
                                onSetLimit={setDailyFoodLimit}
                                onClick={() => setActiveTab('food-budget')}
                                currency={currency}
                            />
                        )}
                    </div>

                    {/* Right Column (4 cols) - Transactions List */}
                    <div className="col-span-12 xl:col-span-4 space-y-6">
                        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-[2rem] p-6 border border-white/60 dark:border-white/5 shadow-sm h-full max-h-[calc(100vh-160px)] overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center mb-6 shrink-0">
                                <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">Giao dịch gần đây</h3>
                                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-500 font-medium">{transactions.length} items</span>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar -mr-2">
                                 <TransactionList transactions={transactions} onDelete={deleteTransaction} currency={currency} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'food-budget' && (
                <div className="animate-slide-in-right">
                     <FoodBudgetPage 
                        transactions={transactions}
                        dailyLimit={dailyFoodLimit}
                        onSetLimit={setDailyFoodLimit}
                        onAddTransaction={() => openForm('expense')}
                        onUpdateTransaction={updateTransaction}
                        onDeleteTransaction={deleteTransaction}
                        currency={currency}
                    />
                </div>
            )}

          </div>
      </main>

      {/* Hidden Receipt for Export */}
      <div className="fixed top-[-9999px] left-[-9999px]">
         <div ref={receiptRef} className="w-[400px] bg-white p-10 font-mono text-slate-800 border-b-8 border-emerald-500">
             <div className="text-center mb-8">
                 <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">MONEY TRACKER</h2>
                 <p className="text-xs text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-4 inline-block">Báo cáo tài chính cá nhân</p>
                 <p className="text-sm font-bold text-slate-400 mt-4">{new Date().toLocaleString('vi-VN')}</p>
             </div>
             
             <div className="bg-slate-50 p-6 rounded-xl space-y-3 mb-8">
                 <div className="flex justify-between font-bold text-slate-600">
                     <span>Tổng thu</span>
                     <span className="text-emerald-600">{formatMoney(stats.income)}</span>
                 </div>
                 <div className="flex justify-between font-bold text-slate-600">
                     <span>Tổng chi</span>
                     <span className="text-rose-600">{formatMoney(stats.expense)}</span>
                 </div>
                 <div className="flex justify-between pt-3 mt-3 border-t-2 border-slate-200 text-lg">
                     <span className="font-black text-slate-800">SỐ DƯ</span>
                     <span className="font-black text-slate-900">{formatMoney(stats.balance)}</span>
                 </div>
             </div>

             <div className="mb-8">
                 <p className="text-xs font-bold uppercase mb-4 text-slate-400">Phân bổ chi tiêu</p>
                 <div className="space-y-4">
                     {chartData.map((item, idx) => (
                         <div key={idx}>
                             <div className="flex justify-between text-xs font-bold mb-1.5">
                                 <span>{item.name}</span>
                                 <span>{formatMoney(item.value)}</span>
                             </div>
                             <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full rounded-full" style={{ width: `${(item.value / stats.expense) * 100}%`, backgroundColor: item.color }}></div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
             
             <div className="text-center mt-12 pt-6 border-t border-dashed border-slate-300">
                 <p className="text-[10px] text-slate-400 font-medium">Auto-generated by MoneyTracker Desktop</p>
             </div>
         </div>
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
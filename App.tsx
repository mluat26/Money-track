import React, { useState, useEffect, useMemo } from 'react';
import { Plus, PieChart as PieChartIcon, Wallet, Home, Moon, Sun, Utensils, Coins, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { DailyBudget } from './components/DailyBudget';
import { FoodBudgetPage } from './components/FoodBudgetPage';
import { Transaction, CATEGORIES } from './types';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyFoodLimit, setDailyFoodLimit] = useState<number>(() => {
    const saved = localStorage.getItem('dailyFoodLimit');
    return saved ? parseFloat(saved) : 0;
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

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'food-budget'>('dashboard');

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('dailyFoodLimit', dailyFoodLimit.toString());
  }, [dailyFoodLimit]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: crypto.randomUUID() };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
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
    })).filter(item => item.value > 0);
  }, [transactions]);

  return (
    <div className={`min-h-screen relative overflow-x-hidden bg-[#f0fdf4] dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-32 sm:pb-8 transition-colors duration-500 font-sans`}>
      
      {/* Soft Pastel Background Gradients */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-300/30 dark:bg-emerald-600/10 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-normal"></div>
      <div className="fixed top-[20%] right-[-10%] w-[400px] h-[400px] bg-teal-200/40 dark:bg-teal-600/10 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-normal"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-lime-200/30 dark:bg-lime-900/10 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-normal"></div>

      {/* Header */}
      <header className="sticky top-0 z-30 pt-4 pb-2 px-5">
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
            <button 
                onClick={() => setDarkMode(!darkMode)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 transition-all"
            >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button 
                onClick={() => setIsFormOpen(true)}
                className="hidden sm:flex w-10 h-10 items-center justify-center bg-slate-900 dark:bg-white hover:bg-slate-800 text-white dark:text-slate-900 rounded-full shadow-lg transition-all active:scale-95"
            >
                <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-4 space-y-6">
        
        {/* Total Balance Card */}
        {activeTab === 'dashboard' && (
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-900 dark:to-teal-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-200/50 dark:shadow-none relative overflow-hidden group h-[260px] flex flex-col justify-between transform transition-transform hover:scale-[1.01] duration-500">
            {/* Glossy Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-900 opacity-10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

            <div className="relative z-10 animate-fade-in">
                <p className="text-emerald-100 text-sm font-medium mb-1 opacity-90 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Tổng số dư
                </p>
                <h2 className="text-5xl font-bold tracking-tighter">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(stats.balance)}
                </h2>
            </div>
            
            <div className="flex gap-3 relative z-10 mt-auto">
              <div className="bg-white/10 dark:bg-black/20 rounded-2xl p-4 flex-1 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                  <div className="flex items-center gap-1.5 text-emerald-100 text-[10px] uppercase font-bold tracking-wider mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-300"></div> Thu
                  </div>
                  <p className="font-semibold text-lg tracking-tight">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(stats.income)}</p>
              </div>
              <div className="bg-white/10 dark:bg-black/20 rounded-2xl p-4 flex-1 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                  <div className="flex items-center gap-1.5 text-rose-100 text-[10px] uppercase font-bold tracking-wider mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-300"></div> Chi
                  </div>
                  <p className="font-semibold text-lg tracking-tight">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(stats.expense)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard View */}
        <div className={`${activeTab === 'dashboard' ? 'block' : 'hidden'} space-y-6 animate-fade-in`}>
          
          <DailyBudget 
            transactions={transactions} 
            limit={dailyFoodLimit} 
            onSetLimit={setDailyFoodLimit}
            onClick={() => setActiveTab('food-budget')}
          />

          {chartData.length > 0 && (
            <div className="bg-white/60 dark:bg-slate-900/60 p-6 rounded-[2rem] shadow-sm backdrop-blur-xl border border-white/60 dark:border-white/5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2 relative z-10">
                 <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-lg">
                        <PieChartIcon className="w-4 h-4 text-indigo-500" />
                    </div>
                    Phân bố chi tiêu
                 </h3>
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
                          formatter={(value: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))}
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
            <TransactionList transactions={transactions} onDelete={deleteTransaction} />
          </div>
        </div>

        {/* Food Budget Detail View */}
        {activeTab === 'food-budget' && (
           <FoodBudgetPage 
             transactions={transactions}
             dailyLimit={dailyFoodLimit}
             onSetLimit={setDailyFoodLimit}
             onAddTransaction={() => setIsFormOpen(true)}
           />
        )}

      </main>

      {/* Modern Floating Bottom Navigation Bar (Glassmorphism Pill) */}
      <div className="fixed bottom-6 left-0 right-0 px-4 sm:hidden z-40 pointer-events-none flex justify-center">
        <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-[2rem] p-2 flex justify-between items-center pointer-events-auto border border-white/40 dark:border-white/5 min-w-[280px] gap-8">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <Home className="w-5 h-5" strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
          </button>

          {/* ADD BUTTON */}
          <button
            onClick={() => setIsFormOpen(true)}
            className="w-14 h-14 bg-slate-900 dark:bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-slate-300 dark:shadow-emerald-900/30 transition-transform active:scale-90 hover:scale-105"
          >
            <Plus className="w-6 h-6" strokeWidth={3} />
          </button>

          <button
            onClick={() => setActiveTab('food-budget')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${activeTab === 'food-budget' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <Utensils className="w-5 h-5" strokeWidth={activeTab === 'food-budget' ? 2.5 : 2} />
          </button>
          
        </nav>
      </div>

      {isFormOpen && (
        <TransactionForm 
          onAdd={addTransaction} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}

export default App;
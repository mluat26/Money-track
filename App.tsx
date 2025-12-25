import React, { useState, useEffect, useMemo } from 'react';
import { Plus, PieChart as PieChartIcon, Wallet, Home, Moon, Sun, Utensils, Coins } from 'lucide-react';
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
    <div className={`min-h-screen relative overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-32 sm:pb-0 transition-colors duration-500`}>
      
      {/* Decorative Background Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-400/20 dark:bg-emerald-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[10%] right-[-5%] w-[300px] h-[300px] bg-teal-400/20 dark:bg-teal-600/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-30 pt-4 pb-2 px-5 backdrop-blur-md transition-colors">
        <div className="max-w-2xl mx-auto flex justify-between items-center bg-white/70 dark:bg-slate-900/70 p-3 rounded-2xl shadow-sm border border-white/50 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2 rounded-xl shadow-lg shadow-emerald-200/50 dark:shadow-none">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
              MoneyTracker
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
                onClick={() => setDarkMode(!darkMode)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button 
                onClick={() => setIsFormOpen(true)}
                className="hidden sm:flex w-10 h-10 items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95"
            >
                <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-2 space-y-8">
        
        {/* Total Balance Card (Show only on Dashboard) */}
        {activeTab === 'dashboard' && (
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-800 dark:to-teal-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-emerald-200/50 dark:shadow-none relative overflow-hidden group h-[280px] flex flex-col justify-between">
            {/* Decorative Background Icon */}
            <Coins className="absolute -right-10 -top-10 w-64 h-64 text-white opacity-10 rotate-12 group-hover:rotate-[20deg] group-hover:scale-110 transition-all duration-700 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-900/10 rounded-full blur-2xl -ml-10 -mb-5"></div>

            <div className="relative z-10">
                <p className="text-emerald-100 text-sm font-medium mb-1 opacity-90">Tổng số dư hiện tại</p>
                <h2 className="text-5xl font-bold tracking-tight">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(stats.balance)}
                </h2>
            </div>
            
            <div className="flex gap-4 relative z-10 mt-auto">
              <div className="bg-white/10 dark:bg-black/20 rounded-2xl p-4 flex-1 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                  <div className="flex items-center gap-2 text-emerald-100 text-[10px] uppercase font-bold tracking-wider mb-1">
                    Thu nhập
                  </div>
                  <p className="font-bold text-lg">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(stats.income)}</p>
              </div>
              <div className="bg-white/10 dark:bg-black/20 rounded-2xl p-4 flex-1 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                  <div className="flex items-center gap-2 text-rose-100 text-[10px] uppercase font-bold tracking-wider mb-1">
                    Chi tiêu
                  </div>
                  <p className="font-bold text-lg">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(stats.expense)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard View */}
        <div className={`${activeTab === 'dashboard' ? 'block' : 'hidden'} space-y-8 animate-fade-in`}>
          
          <DailyBudget 
            transactions={transactions} 
            limit={dailyFoodLimit} 
            onSetLimit={setDailyFoodLimit}
            onClick={() => setActiveTab('food-budget')}
          />

          {chartData.length > 0 && (
            <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-3xl shadow-sm backdrop-blur-sm border border-white/50 dark:border-white/5 relative overflow-hidden">
               {/* Decorative BG */}
               <PieChartIcon className="absolute -bottom-6 -left-6 w-32 h-32 text-slate-200 dark:text-slate-800/50 opacity-20 rotate-[-15deg] pointer-events-none" />

              <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 relative z-10">
                <PieChartIcon className="w-5 h-5 text-emerald-500" />
                Phân bố chi tiêu
              </h3>
              <div className="h-64 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number | string | Array<number | string>) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#fff' : '#334155' }}
                      itemStyle={{ color: darkMode ? '#e2e8f0' : '#334155' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 justify-center mt-4 relative z-10">
                 {chartData.map((item, idx) => (
                   <div key={idx} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                      {item.name}
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* Recent transactions on dashboard */}
          <div>
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">Giao dịch gần đây</h3>
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

      {/* Modern Floating Bottom Navigation Bar (Mobile Only) */}
      <div className="fixed bottom-6 left-0 right-0 px-6 sm:hidden z-40 pointer-events-none">
        <nav className="max-w-xs mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-full px-2 py-2 flex justify-between items-center pointer-events-auto border border-white/20 dark:border-white/5 h-[72px]">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <Home className="w-6 h-6" strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
          </button>

          {/* BIG CENTRAL ADD BUTTON */}
          <button
            onClick={() => setIsFormOpen(true)}
            className="relative -top-6 w-16 h-16 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-300/50 dark:shadow-none ring-4 ring-slate-50 dark:ring-slate-950 transition-transform active:scale-95"
          >
            <Plus className="w-8 h-8" strokeWidth={3} />
          </button>

          <button
            onClick={() => setActiveTab('food-budget')}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${activeTab === 'food-budget' ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <Utensils className="w-6 h-6" strokeWidth={activeTab === 'food-budget' ? 2.5 : 2} />
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
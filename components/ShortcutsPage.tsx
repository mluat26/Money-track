import React, { useState } from 'react';
import { Plus, Trash2, Zap, Save, Utensils, Car, Home, ShoppingBag, Gamepad2, Banknote, MoreHorizontal, Shirt, Wifi, Sparkles, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { CATEGORIES, Shortcut, TransactionType, Currency } from '../types';
import { vibrate } from '../App';

interface ShortcutsPageProps {
  shortcuts: Shortcut[];
  onSave: (shortcuts: Shortcut[]) => void;
  currency: Currency;
  onUseShortcut: (s: Shortcut) => void;
}

const IconMap: Record<string, React.ElementType> = {
  Utensils, Car, Home, ShoppingBag, Gamepad2, Banknote, MoreHorizontal, Shirt, Wifi, Sparkles, TrendingUp
};

export const ShortcutsPage: React.FC<ShortcutsPageProps> = ({ shortcuts, onSave, currency, onUseShortcut }) => {
  const [newItem, setNewItem] = useState<Omit<Shortcut, 'id'>>({
    name: '',
    amount: 0,
    category: 'food',
    type: 'expense'
  });

  const handleAdd = () => {
    if (!newItem.name || newItem.amount <= 0) return;
    vibrate(10);
    const item: Shortcut = { ...newItem, id: crypto.randomUUID() };
    onSave([...shortcuts, item]);
    setNewItem({ ...newItem, name: '', amount: 0 });
  };

  const handleDelete = (id: string) => {
    vibrate(5);
    onSave(shortcuts.filter(s => s.id !== id));
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat().format(amount);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Quản lý Phím tắt</h2>
          <p className="text-slate-500">Tạo và quản lý các giao dịch nhanh cho các khoản thu chi định kỳ</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Add */}
          <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm sticky top-8">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-500" /> Tạo phím tắt mới
                  </h3>
                  
                  <div className="space-y-4">
                      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4">
                        <button
                          onClick={() => setNewItem({...newItem, type: 'expense', category: 'food'})}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${newItem.type === 'expense' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-400'}`}
                        >
                          Chi tiêu
                        </button>
                        <button
                          onClick={() => setNewItem({...newItem, type: 'income', category: 'salary'})}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${newItem.type === 'income' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-400'}`}
                        >
                          Thu nhập
                        </button>
                      </div>

                      <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tên phím tắt</label>
                          <input 
                              type="text" 
                              value={newItem.name}
                              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                              placeholder="Ví dụ: Tiền nhà, Lương tháng..."
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                          />
                      </div>

                      <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số tiền ({currency})</label>
                          <input 
                              type="number" 
                              value={newItem.amount || ''}
                              onChange={(e) => setNewItem({...newItem, amount: parseFloat(e.target.value) || 0})}
                              placeholder="0"
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                          />
                      </div>

                      <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh mục</label>
                          <select 
                              value={newItem.category}
                              onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                          >
                              {Object.values(CATEGORIES)
                                .filter(cat => cat.type === newItem.type || cat.type === 'both')
                                .map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                          </select>
                      </div>

                      <button 
                          onClick={handleAdd}
                          className="w-full bg-slate-900 dark:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl hover:bg-slate-800 dark:hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none mt-2"
                      >
                          <Plus className="w-5 h-5" /> Thêm phím tắt
                      </button>
                  </div>
              </div>
          </div>

          {/* List Shortcuts */}
          <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200">Danh sách phím tắt hiện có</h3>
                  <span className="text-xs text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{shortcuts.length} phím tắt</span>
              </div>
              
              {shortcuts.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 p-12 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400">
                      <Zap className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="font-medium">Chưa có phím tắt nào được tạo.</p>
                      <p className="text-xs mt-1 text-slate-300">Hãy tạo phím tắt để ghi chép nhanh hơn!</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {shortcuts.map((s) => {
                          const cat = CATEGORIES[s.category] || CATEGORIES.other;
                          const Icon = IconMap[cat.icon] || MoreHorizontal;
                          return (
                              <div key={s.id} className="group bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                                  <div className="flex justify-between items-start mb-4">
                                      <div className="flex items-center gap-3">
                                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm" style={{ backgroundColor: cat.color }}>
                                              <Icon className="w-6 h-6" />
                                          </div>
                                          <div className="min-w-0">
                                              <h4 className="font-bold text-slate-800 dark:text-white truncate pr-2">{s.name}</h4>
                                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat.name}</p>
                                          </div>
                                      </div>
                                      <button 
                                          onClick={() => handleDelete(s.id)}
                                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </div>

                                  <div className="flex items-center justify-between mt-2">
                                      <div className="flex flex-col">
                                          <span className="text-[10px] text-slate-400 font-bold uppercase">Số tiền</span>
                                          <span className={`text-lg font-black tracking-tight ${s.type === 'income' ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>
                                              {s.type === 'income' ? '+' : ''}{formatMoney(s.amount)} {currency}
                                          </span>
                                      </div>
                                      <button 
                                          onClick={() => onUseShortcut(s)}
                                          className="bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 p-3 rounded-2xl text-slate-400 hover:text-amber-600 transition-all active:scale-90"
                                          title="Sử dụng ngay"
                                      >
                                          <Zap className="w-5 h-5 fill-current" />
                                      </button>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
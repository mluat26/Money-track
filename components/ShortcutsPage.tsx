
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Add */}
          <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm sticky top-8">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" /> Tạo phím tắt mới
                  </h3>
                  
                  <div className="space-y-6">
                      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                        <button
                          onClick={() => setNewItem({...newItem, type: 'expense', category: 'food'})}
                          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${newItem.type === 'expense' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-400'}`}
                        >
                          Chi tiêu
                        </button>
                        <button
                          onClick={() => setNewItem({...newItem, type: 'income', category: 'salary'})}
                          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${newItem.type === 'income' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-400'}`}
                        >
                          Thu nhập
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tên phím tắt</label>
                            <input 
                                type="text" 
                                value={newItem.name}
                                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                placeholder="Ví dụ: Cơm trưa, Grab, Cafe..."
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 ring-emerald-500/10 outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Số tiền ({currency})</label>
                            <input 
                                type="number" 
                                value={newItem.amount || ''}
                                onChange={(e) => setNewItem({...newItem, amount: parseFloat(e.target.value) || 0})}
                                placeholder="0"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-2xl font-black text-emerald-600 focus:ring-4 ring-emerald-500/10 outline-none"
                            />
                        </div>
                      </div>

                      <div className="space-y-4">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Chọn danh mục</label>
                          <div className="grid grid-cols-4 gap-3">
                              {Object.values(CATEGORIES)
                                .filter(cat => cat.type === newItem.type || cat.type === 'both')
                                .map(cat => {
                                  const Icon = IconMap[cat.icon] || MoreHorizontal;
                                  const isSelected = newItem.category === cat.id;
                                  return (
                                    <button 
                                      key={cat.id} 
                                      type="button" 
                                      onClick={() => { vibrate(5); setNewItem({...newItem, category: cat.id}); }}
                                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all border-2 ${isSelected ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 scale-105 shadow-md shadow-emerald-500/10' : 'bg-transparent border-transparent opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                                    >
                                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: cat.color }}>
                                          <Icon className="w-5 h-5" />
                                      </div>
                                      <span className="text-[9px] font-black uppercase text-center truncate w-full">{cat.name}</span>
                                    </button>
                                  );
                              })}
                          </div>
                      </div>

                      <button 
                          onClick={handleAdd}
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-200 dark:shadow-none"
                      >
                          Lưu Phím Tắt
                      </button>
                  </div>
              </div>
          </div>

          {/* List Shortcuts */}
          <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200">Danh sách của bạn</h3>
                  <span className="text-xs text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{shortcuts.length} phím tắt</span>
              </div>
              
              {shortcuts.length === 0 ? (
                  <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm p-12 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400">
                      <Zap className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="font-medium">Chưa có phím tắt nào</p>
                      <p className="text-xs mt-1 text-slate-300">Tạo phím tắt để ghi chép nhanh chỉ với 1 chạm!</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {shortcuts.map((s) => {
                          const cat = CATEGORIES[s.category] || CATEGORIES.other;
                          const Icon = IconMap[cat.icon] || MoreHorizontal;
                          return (
                              <div key={s.id} className="group bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between">
                                  <div className="flex justify-between items-start mb-6">
                                      <div className="flex items-center gap-4">
                                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: cat.color }}>
                                              <Icon className="w-7 h-7" />
                                          </div>
                                          <div className="min-w-0">
                                              <h4 className="font-black text-slate-800 dark:text-white truncate text-lg">{s.name}</h4>
                                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded-md">{cat.name}</span>
                                          </div>
                                      </div>
                                      <button 
                                          onClick={() => handleDelete(s.id)}
                                          className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                                      >
                                          <Trash2 className="w-5 h-5" />
                                      </button>
                                  </div>

                                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-50 dark:border-slate-800">
                                      <div className="flex flex-col">
                                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Giá trị</span>
                                          <span className={`text-xl font-black tracking-tight ${s.type === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
                                              {s.type === 'income' ? '+' : ''}{formatMoney(s.amount)} <span className="text-sm font-bold opacity-50">{currency}</span>
                                          </span>
                                      </div>
                                      <button 
                                          onClick={() => onUseShortcut(s)}
                                          className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-600 transition-all active:scale-90 group-hover:rotate-12"
                                          title="Sử dụng ngay"
                                      >
                                          <Zap className="w-6 h-6 fill-current" />
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

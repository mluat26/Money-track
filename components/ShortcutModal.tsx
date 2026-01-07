import React, { useState } from 'react';
import { X, Plus, Trash2, Zap, Save, Utensils, Car, Home, ShoppingBag, Gamepad2, Banknote, MoreHorizontal, Shirt, Wifi, Sparkles } from 'lucide-react';
import { CATEGORIES, Shortcut, TransactionType, Currency } from '../types';
import { vibrate } from '../App';

interface ShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Shortcut[];
  onSave: (shortcuts: Shortcut[]) => void;
  currency: Currency;
}

const IconMap: Record<string, React.ElementType> = {
  Utensils, Car, Home, ShoppingBag, Gamepad2, Banknote, MoreHorizontal, Shirt, Wifi, Sparkles
};

export const ShortcutModal: React.FC<ShortcutModalProps> = ({ isOpen, onClose, shortcuts, onSave, currency }) => {
  const [editingList, setEditingList] = useState<Shortcut[]>(shortcuts);
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
    const newList = [...editingList, item];
    setEditingList(newList);
    setNewItem({ name: '', amount: 0, category: 'food', type: 'expense' });
  };

  const handleDelete = (id: string) => {
    vibrate(5);
    setEditingList(editingList.filter(s => s.id !== id));
  };

  const handleFinalSave = () => {
    vibrate([10, 30]);
    onSave(editingList);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl">
               <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
                <h2 className="font-bold text-lg text-slate-800 dark:text-white">Thiết lập phím tắt</h2>
                <p className="text-xs text-slate-500">Tạo các chi phí lặp lại để nhập nhanh</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8">
            
            {/* Form Add New */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Thêm phím tắt mới</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Tên hiển thị</label>
                        <input 
                            type="text" 
                            placeholder="Ví dụ: Tiền nhà"
                            value={newItem.name}
                            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Số tiền</label>
                        <input 
                            type="number" 
                            placeholder="500000"
                            value={newItem.amount || ''}
                            onChange={(e) => setNewItem({...newItem, amount: parseFloat(e.target.value) || 0})}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Danh mục</label>
                        <select 
                            value={newItem.category}
                            onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            {Object.values(CATEGORIES).map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={handleAdd}
                            className="w-full bg-slate-900 dark:bg-slate-700 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Thêm vào danh sách
                        </button>
                    </div>
                </div>
            </div>

            {/* Current List */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Danh sách hiện tại ({editingList.length})</h3>
                {editingList.length === 0 ? (
                    <p className="text-center py-10 text-slate-400 italic text-sm">Chưa có phím tắt nào được tạo.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {editingList.map((s) => {
                            const cat = CATEGORIES[s.category] || CATEGORIES.other;
                            const Icon = IconMap[cat.icon] || MoreHorizontal;
                            return (
                                <div key={s.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl group shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: cat.color }}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{s.name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">
                                                {new Intl.NumberFormat().format(s.amount)} {currency}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(s.id)}
                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Đóng</button>
            <button onClick={handleFinalSave} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-200 dark:shadow-none transition-all flex items-center gap-2">
                <Save className="w-4 h-4" /> Lưu cấu hình
            </button>
        </div>
      </div>
    </div>
  );
};
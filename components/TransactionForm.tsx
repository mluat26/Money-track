import React, { useState, useEffect } from 'react';
import { Plus, X, Sparkles, Utensils, Car, Home, ShoppingBag, Gamepad2, Banknote, MoreHorizontal, Shirt, Wifi, ArrowUp, ArrowDown } from 'lucide-react';
import { CATEGORIES, Transaction, TransactionType } from '../types';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

// Icon mapping helper
const IconMap: Record<string, React.ElementType> = {
  Utensils, Car, Home, ShoppingBag, Gamepad2, Banknote, MoreHorizontal, Shirt, Sparkles, Wifi
};

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, onClose }) => {
  const [smartInput, setSmartInput] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Logic xử lý nhập nhanh: "Cơm trưa - 120k"
  const handleSmartInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSmartInput(text);

    if (text.includes('-')) {
        const parts = text.split('-');
        if (parts.length >= 2) {
            const rawNote = parts[0].trim();
            let rawAmount = parts[parts.length - 1].trim().toLowerCase();
            
            // Xử lý 'k' = 000
            let multiplier = 1;
            if (rawAmount.endsWith('k')) {
                multiplier = 1000;
                rawAmount = rawAmount.replace('k', '');
            }

            // Xóa dấu chấm/phẩy nếu có
            rawAmount = rawAmount.replace(/[,.]/g, '');
            
            const parsedAmount = parseFloat(rawAmount);
            
            if (!isNaN(parsedAmount)) {
                setAmount((parsedAmount * multiplier).toString());
                setNote(rawNote);
            }
        }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    onAdd({
      amount: parseFloat(amount),
      type,
      category: type === 'income' ? 'salary' : category,
      note,
      date: new Date(date).toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <form onSubmit={handleSubmit} className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up sm:animate-pop flex flex-col max-h-[90vh] ring-1 ring-black/5 dark:ring-white/10">
        
        {/* Handle bar for mobile feel */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden" onClick={onClose}>
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>

        <div className="flex justify-between items-center px-6 pt-4 pb-2">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Thêm Giao Dịch</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar px-6 py-4 space-y-6">
          
          {/* Smart Input - Magic Feel */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-3xl border border-emerald-100 dark:border-emerald-800/30 relative group">
             <label className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider opacity-70">
                <Sparkles className="w-3 h-3" />
                Nhập nhanh thông minh
             </label>
             <input
               type="text"
               value={smartInput}
               onChange={handleSmartInputChange}
               placeholder='Ví dụ: "Cafe sáng - 35k"'
               className="w-full bg-transparent text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
             />
             <div className="absolute top-4 right-4 animate-pulse opacity-50">
                <Sparkles className="w-4 h-4 text-emerald-400" />
             </div>
          </div>

          {/* Amount Input - Big & Bold */}
          <div className="flex flex-col items-center justify-center py-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Số tiền</label>
            <div className="flex items-baseline gap-1 text-slate-800 dark:text-white">
                <span className="text-2xl font-medium opacity-40">₫</span>
                <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full max-w-[200px] text-5xl font-bold text-center bg-transparent placeholder-slate-200 dark:placeholder-slate-800 outline-none caret-emerald-500"
                autoFocus
                required
                />
            </div>
          </div>

          {/* Type Toggle - Pill Shape */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory('food'); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${type === 'expense' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm scale-[1.02]' : 'text-slate-400 dark:text-slate-500'}`}
            >
              <ArrowDown className="w-4 h-4" />
              Chi tiêu
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory('salary'); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${type === 'income' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm scale-[1.02]' : 'text-slate-400 dark:text-slate-500'}`}
            >
              <ArrowUp className="w-4 h-4" />
              Thu nhập
            </button>
          </div>

          {/* Category Select - Soft Grids */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider px-1">Danh mục</label>
            <div className="grid grid-cols-4 gap-3">
              {Object.values(CATEGORIES)
                .filter(cat => type === 'expense' ? cat.id !== 'salary' : cat.id === 'salary' || cat.id === 'other')
                .map((cat) => {
                  const Icon = IconMap[cat.icon] || MoreHorizontal;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all duration-300 ${
                        isSelected
                          ? 'bg-slate-800 text-white shadow-lg shadow-slate-200 dark:shadow-none scale-105'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div 
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform ${isSelected ? 'bg-white/20' : ''}`}
                        style={{ color: isSelected ? 'white' : cat.color }}
                      >
                         <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-semibold truncate w-full text-center">
                        {cat.name}
                      </span>
                    </button>
                  );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Date */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ngày</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent text-slate-700 dark:text-white text-sm font-medium outline-none"
              />
            </div>
            {/* Note */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ghi chú</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Mua gì đó..."
                className="w-full bg-transparent text-slate-700 dark:text-white text-sm font-medium outline-none placeholder-slate-300"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 pb-8 sm:pb-6">
           <button
            type="submit"
            className="w-full py-4 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 dark:shadow-none transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
           >
            <Plus className="w-5 h-5" />
            Lưu Giao Dịch
           </button>
        </div>

      </form>
    </div>
  );
};
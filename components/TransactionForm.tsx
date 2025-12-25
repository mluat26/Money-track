import React, { useState, useEffect } from 'react';
import { Plus, X, Sparkles, Utensils, Car, Home, ShoppingBag, Gamepad2, Banknote, MoreHorizontal, Shirt, Wifi } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up sm:animate-fade-in flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Thêm Giao Dịch</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar p-5 space-y-5">
          
          {/* Smart Input */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
             <label className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2 uppercase tracking-wide">
                <Sparkles className="w-3 h-3" />
                Nhập nhanh
             </label>
             <input
               type="text"
               value={smartInput}
               onChange={handleSmartInputChange}
               placeholder="Vd: Ăn trưa - 120000"
               className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
             />
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Số tiền (VND)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full text-4xl font-bold text-slate-800 dark:text-white border-b-2 border-slate-100 dark:border-slate-700 focus:border-emerald-500 outline-none py-2 bg-transparent placeholder-slate-200 dark:placeholder-slate-700 transition-colors"
              required
            />
          </div>

          {/* Type Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory('food'); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${type === 'expense' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Chi tiêu
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory('salary'); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${type === 'income' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Thu nhập
            </button>
          </div>

          {/* Category Select with Icons */}
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Danh mục</label>
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
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                          : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-200'
                      }`}
                    >
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${isSelected ? 'scale-110 shadow-md' : ''}`}
                        style={{ backgroundColor: isSelected ? cat.color : '#f1f5f9', color: isSelected ? 'white' : '#94a3b8' }}
                      >
                         <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-medium truncate w-full text-center ${isSelected ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                        {cat.name}
                      </span>
                    </button>
                  );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Ngày</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-white text-sm focus:border-emerald-500 outline-none"
              />
            </div>
            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Ghi chú</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Mua gì đó..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-white text-sm focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
           <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
           >
            <Plus className="w-5 h-5" />
            Lưu Giao Dịch
           </button>
        </div>

      </form>
    </div>
  );
};
import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Sparkles, Utensils, Car, Home, ShoppingBag, Gamepad2, Banknote, MoreHorizontal, Shirt, Wifi, ArrowUp, ArrowDown, Calendar, FileText } from 'lucide-react';
import { CATEGORIES, Transaction, TransactionType, Currency } from '../types';
import { vibrate } from '../App';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
  initialType: TransactionType;
  currency?: Currency;
}

const IconMap: Record<string, React.ElementType> = {
  Utensils, Car, Home, ShoppingBag, Gamepad2, Banknote, MoreHorizontal, Shirt, Sparkles, Wifi
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: ['ăn', 'uống', 'cơm', 'bún', 'phở', 'cafe', 'trà', 'nước', 'nhậu', 'bánh', 'kẹo', 'thịt', 'rau', 'siêu thị', 'mart'],
  transport: ['xăng', 'xe', 'grab', 'be', 'gửi xe', 'bảo dưỡng', 'sửa xe', 'vé xe', 'bus'],
  housing: ['điện', 'nước', 'nhà', 'net', 'wifi', 'gas', 'thuê'],
  shopping: ['mua', 'shopee', 'lazada', 'tiki', 'quần', 'áo', 'giày', 'dép', 'mỹ phẩm'],
  entertainment: ['phim', 'vé', 'game', 'netflix', 'spotify', 'du lịch', 'chơi'],
  laundry: ['giặt', 'ủi'],
  beauty: ['tóc', 'spa', 'nail', 'gym'],
  services: ['sim', 'card', 'điện thoại', '4g'],
  salary: ['lương', 'thưởng'],
};

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, onClose, initialType, currency = 'VND' }) => {
  const [smartInput, setSmartInput] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(initialType);
  const [category, setCategory] = useState(initialType === 'income' ? 'salary' : 'food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const smartInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (smartInputRef.current) {
            smartInputRef.current.focus();
        }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const detectCategory = (text: string) => {
      const lowerText = text.toLowerCase();
      if (type === 'income') return;
      for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
          if (keywords.some(k => lowerText.includes(k))) {
              setCategory(catId);
              return;
          }
      }
  };

  const handleSmartInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSmartInput(text);
    detectCategory(text);

    if (text.includes('.')) {
        const parts = text.split('.');
        if (parts.length >= 2) {
            const rawAmountStr = parts[parts.length - 1].trim().toLowerCase();
            const rawNote = parts.slice(0, -1).join('.').trim();
            
            if (rawAmountStr.length > 0) {
                 let rawAmount = rawAmountStr;
                let multiplier = 1;
                if (rawAmount.endsWith('k')) {
                    multiplier = 1000;
                    rawAmount = rawAmount.replace('k', '');
                }
                rawAmount = rawAmount.replace(/[^0-9.]/g, '');
                const parsedAmount = parseFloat(rawAmount);
                if (!isNaN(parsedAmount)) {
                    setAmount((parsedAmount * multiplier).toString());
                    if (rawNote) setNote(rawNote);
                }
            }
        }
    } else {
        setNote(text);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    vibrate([10, 50, 10]);
    onAdd({
      amount: parseFloat(amount),
      type,
      category: type === 'income' ? 'salary' : category,
      note,
      date: new Date(date).toISOString(),
    });
    onClose();
  };

  const handleTypeSwitch = (newType: TransactionType) => {
      vibrate(10);
      setType(newType);
      if (newType === 'income') {
          setCategory('salary');
      } else {
          setCategory('food');
      }
  };
  
  const handleCategorySelect = (catId: string) => {
    if (category !== catId) {
        vibrate(8);
        setCategory(catId);
    }
  };

  const getCurrencySymbol = () => {
    switch (currency) {
      case 'USD': return '$';
      case 'IDR': return 'Rp';
      case 'KRW': return '₩';
      default: return '₫';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Modal Container */}
      <form onSubmit={handleSubmit} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-zoom-in ring-1 ring-black/5 dark:ring-white/10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-2">
           <h2 className="text-xl font-bold text-slate-800 dark:text-white">Thêm giao dịch mới</h2>
           <button type="button" onClick={onClose} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Inputs */}
                <div className="space-y-4">
                     {/* Type Selector */}
                     <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                        type="button"
                        onClick={() => handleTypeSwitch('expense')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${type === 'expense' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
                        >
                        <ArrowDown className="w-4 h-4" /> Chi tiêu
                        </button>
                        <button
                        type="button"
                        onClick={() => handleTypeSwitch('income')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${type === 'income' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
                        >
                        <ArrowUp className="w-4 h-4" /> Thu nhập
                        </button>
                    </div>

                    {/* Smart Input */}
                    <div className="bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/20 dark:to-blue-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 group">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                            <label className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                                Nhập nhanh (Ví dụ: "Cafe. 35k")
                            </label>
                        </div>
                        <input
                        ref={smartInputRef}
                        type="text"
                        value={smartInput}
                        onChange={handleSmartInputChange}
                        placeholder='Gõ nội dung...'
                        className="w-full bg-transparent text-lg font-medium text-slate-800 dark:text-slate-100 placeholder-indigo-300/60 dark:placeholder-indigo-400/30 outline-none"
                        autoComplete="off"
                        />
                    </div>

                    {/* Amount Input */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700/50">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Số tiền</label>
                        <div className="flex items-baseline gap-1 text-slate-800 dark:text-white">
                            <span className="text-2xl font-medium opacity-40">{getCurrencySymbol()}</span>
                            <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className={`w-full max-w-[200px] text-4xl font-bold text-center bg-transparent placeholder-slate-200 dark:placeholder-slate-700 outline-none ${type === 'income' ? 'caret-emerald-500' : 'caret-rose-500'}`}
                            />
                        </div>
                    </div>

                    {/* Date & Note */}
                     <div className="flex gap-3">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 flex items-center gap-2 flex-[2] border border-slate-100 dark:border-slate-700/50">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-transparent text-slate-700 dark:text-white text-sm font-bold outline-none"
                            />
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 flex items-center gap-2 flex-[3] border border-slate-100 dark:border-slate-700/50">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Ghi chú..."
                                className="w-full bg-transparent text-slate-700 dark:text-white text-sm font-medium outline-none placeholder-slate-300"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Categories */}
                <div>
                     <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Danh mục</label>
                     <div className="grid grid-cols-4 gap-3">
                        {Object.values(CATEGORIES)
                            .filter(cat => type === 'expense' ? cat.id !== 'salary' : cat.id === 'salary' || cat.id === 'other')
                            .map((cat) => {
                            const Icon = IconMap[cat.icon] || MoreHorizontal;
                            const isSelected = category === cat.id;
                            
                            const activeStyle = {
                                backgroundColor: cat.color,
                                color: 'white',
                                boxShadow: `0 8px 16px ${cat.color}40`
                            };
                            
                            const inactiveStyle = {
                                backgroundColor: `${cat.color}15`, 
                                color: cat.color
                            };

                            return (
                                <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleCategorySelect(cat.id)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 border border-transparent ${isSelected ? 'scale-105 z-10' : 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-100 dark:hover:border-slate-700'}`}
                                >
                                <div 
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all`}
                                    style={isSelected ? activeStyle : inactiveStyle}
                                >
                                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                                </div>
                                <span 
                                    className={`text-xs font-bold truncate w-full text-center transition-colors ${isSelected ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}
                                >
                                    {cat.name}
                                </span>
                                </button>
                            );
                        })}
                     </div>
                </div>
            </div>

        </div>

        {/* Submit Button */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
           <button
            type="submit"
            className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] ${type === 'income' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 dark:shadow-none' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200 dark:shadow-none'}`}
           >
            {type === 'income' ? <Plus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            Lưu Giao Dịch
           </button>
        </div>

      </form>
    </div>
  );
};
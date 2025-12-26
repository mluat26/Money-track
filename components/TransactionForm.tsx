import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Sparkles, Utensils, Car, Home, ShoppingBag, Gamepad2, Banknote, MoreHorizontal, Shirt, Wifi, ArrowUp, ArrowDown, Calendar, FileText } from 'lucide-react';
import { CATEGORIES, Transaction, TransactionType, Currency } from '../types';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
  initialType: TransactionType;
  currency?: Currency;
}

// Icon mapping helper
const IconMap: Record<string, React.ElementType> = {
  Utensils, Car, Home, ShoppingBag, Gamepad2, Banknote, MoreHorizontal, Shirt, Sparkles, Wifi
};

// Keyword mapping for auto-detection
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
    // Small timeout to allow animation to finish ensuring focus works on mobile
    const timer = setTimeout(() => {
        if (smartInputRef.current) {
            smartInputRef.current.focus();
        }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const detectCategory = (text: string) => {
      const lowerText = text.toLowerCase();
      // Don't override if it's income
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
    
    // Auto-detect category based on keywords
    detectCategory(text);

    // Logic tách chuỗi bằng dấu chấm "."
    // Ví dụ: "Ăn sáng. 12k" -> Note: Ăn sáng, Amount: 12000
    if (text.includes('.')) {
        const parts = text.split('.');
        // Lấy phần cuối cùng làm giá tiền, các phần trước đó nối lại làm ghi chú
        if (parts.length >= 2) {
            const rawAmountStr = parts[parts.length - 1].trim().toLowerCase();
            const rawNote = parts.slice(0, -1).join('.').trim();
            
            // Nếu phần giá tiền rỗng (đang nhập), chưa xử lý
            if (rawAmountStr.length > 0) {
                 let rawAmount = rawAmountStr;
                
                // Xử lý 'k' = 000
                let multiplier = 1;
                if (rawAmount.endsWith('k')) {
                    multiplier = 1000;
                    rawAmount = rawAmount.replace('k', '');
                }

                // Xóa các ký tự không phải số (trừ dấu chấm động nếu có, nhưng ở đây ta đơn giản hóa)
                rawAmount = rawAmount.replace(/[^0-9.]/g, '');
                
                const parsedAmount = parseFloat(rawAmount);
                
                if (!isNaN(parsedAmount)) {
                    setAmount((parsedAmount * multiplier).toString());
                    if (rawNote) setNote(rawNote);
                }
            }
        }
    } else {
        // Nếu chưa có dấu chấm, toàn bộ là ghi chú
        setNote(text);
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

  const handleTypeSwitch = (newType: TransactionType) => {
      setType(newType);
      if (newType === 'income') {
          setCategory('salary');
      } else {
          setCategory('food');
      }
  };

  const getCurrencySymbol = () => {
    switch (currency) {
      case 'USD': return '$';
      case 'IDR': return 'Rp';
      default: return '₫';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <form onSubmit={handleSubmit} className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up sm:animate-pop flex flex-col max-h-[90vh] ring-1 ring-black/5 dark:ring-white/10">
        
        {/* Compact Header with Segmented Control */}
        <div className="flex justify-between items-center px-4 pt-4 pb-2">
           {/* Segmented Control */}
           <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeSwitch('expense')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${type === 'expense' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
            >
              <ArrowDown className="w-3.5 h-3.5" /> Chi tiêu
            </button>
            <button
              type="button"
              onClick={() => handleTypeSwitch('income')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${type === 'income' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
            >
              <ArrowUp className="w-3.5 h-3.5" /> Thu nhập
            </button>
          </div>

          <button type="button" onClick={onClose} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar px-5 py-2 space-y-4">
          
          {/* Smart Input - Prominent */}
          <div className="bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/20 dark:to-blue-900/20 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 relative group">
             <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
                <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider opacity-80">
                    Nhập nhanh
                </label>
             </div>
             <input
               ref={smartInputRef}
               type="text"
               value={smartInput}
               onChange={handleSmartInputChange}
               placeholder='Ví dụ: "Ăn sáng. 12k"'
               className="w-full bg-transparent text-base font-medium text-slate-800 dark:text-slate-100 placeholder-indigo-300/60 dark:placeholder-indigo-400/30 outline-none"
               autoComplete="off"
             />
          </div>

          {/* Amount Input - Big & Clean */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="flex items-baseline gap-1 text-slate-800 dark:text-white">
                <span className="text-2xl font-medium opacity-40">{getCurrencySymbol()}</span>
                <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className={`w-full max-w-[200px] text-5xl font-bold text-center bg-transparent placeholder-slate-200 dark:placeholder-slate-800 outline-none ${type === 'income' ? 'caret-emerald-500' : 'caret-rose-500'}`}
                />
            </div>
          </div>

          {/* Compact Date & Note Row */}
          <div className="flex gap-2">
             <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 flex items-center gap-2 flex-[2]">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-slate-700 dark:text-white text-xs font-bold outline-none"
                />
             </div>
             <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 flex items-center gap-2 flex-[3]">
                <FileText className="w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú..."
                    className="w-full bg-transparent text-slate-700 dark:text-white text-xs font-medium outline-none placeholder-slate-300"
                />
             </div>
          </div>

          {/* Category Select - Compact Grid & Pastel Styles */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider px-1">Danh mục</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.values(CATEGORIES)
                .filter(cat => type === 'expense' ? cat.id !== 'salary' : cat.id === 'salary' || cat.id === 'other')
                .map((cat) => {
                  const Icon = IconMap[cat.icon] || MoreHorizontal;
                  const isSelected = category === cat.id;
                  
                  // Color Logic: 
                  // If selected: Solid color background, White icon/text
                  // If not selected: Pastel background (10% opacity), Color icon
                  const activeStyle = {
                      backgroundColor: cat.color,
                      color: 'white',
                      boxShadow: `0 4px 12px ${cat.color}60`
                  };
                  
                  const inactiveStyle = {
                      backgroundColor: `${cat.color}15`, // ~10% opacity
                      color: cat.color
                  };

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all duration-200 ${isSelected ? 'scale-105 z-10' : 'hover:opacity-80 scale-100'}`}
                    >
                      <div 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all`}
                        style={isSelected ? activeStyle : inactiveStyle}
                      >
                         <Icon className="w-5 h-5" strokeWidth={2.5} />
                      </div>
                      {/* Hide text on very small screens or show small */}
                      <span 
                        className={`text-[9px] font-bold truncate w-full text-center transition-colors ${isSelected ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
              })}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 pb-6 sm:pb-6">
           <button
            type="submit"
            className={`w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${type === 'income' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 dark:shadow-none' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200 dark:shadow-none'}`}
           >
            {type === 'income' ? <Plus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            Lưu
           </button>
        </div>

      </form>
    </div>
  );
};
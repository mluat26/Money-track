import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Sparkles, Utensils, Car, Home, ShoppingBag, Gamepad2, Banknote, MoreHorizontal, Shirt, Wifi, ArrowUp, ArrowDown, Calendar, FileText, TrendingUp, ListPlus, Wand2 } from 'lucide-react';
import { CATEGORIES, Transaction, TransactionType, Currency } from '../types';
import { vibrate } from '../App';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
  initialType: TransactionType;
  currency?: Currency;
}

const IconMap: Record<string, React.ElementType> = {
  Utensils, Car, Home, ShoppingBag, Gamepad2, Banknote, MoreHorizontal, Shirt, Sparkles, Wifi, TrendingUp
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: ['ăn', 'uống', 'cơm', 'bún', 'phở', 'cafe', 'trà', 'nước', 'nhậu', 'bánh', 'kẹo', 'thịt', 'rau', 'siêu thị', 'mart', 'trưa', 'sáng', 'tối'],
  transport: ['xăng', 'xe', 'grab', 'be', 'gửi xe', 'bảo dưỡng', 'sửa xe', 'vé xe', 'bus'],
  housing: ['điện', 'nước', 'nhà', 'net', 'wifi', 'gas', 'thuê', 'phòng'],
  shopping: ['mua', 'shopee', 'lazada', 'tiki', 'quần', 'áo', 'giày', 'dép', 'mỹ phẩm', 'túi'],
  entertainment: ['phim', 'vé', 'game', 'netflix', 'spotify', 'du lịch', 'chơi'],
  laundry: ['giặt', 'ủi'],
  beauty: ['tóc', 'spa', 'nail', 'gym'],
  services: ['sim', 'card', 'điện thoại', '4g'],
  salary: ['lương', 'thưởng', 'income'],
};

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, onClose, initialType, currency = 'VND' }) => {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [bulkInput, setBulkInput] = useState('');
  
  // Single mode states
  const [smartInput, setSmartInput] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(initialType);
  const [category, setCategory] = useState(initialType === 'income' ? 'salary' : 'food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const smartInputRef = useRef<HTMLInputElement>(null);
  const bulkInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (mode === 'single' && smartInputRef.current) smartInputRef.current.focus();
        if (mode === 'bulk' && bulkInputRef.current) bulkInputRef.current.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [mode]);

  const detectCategory = (text: string) => {
      const lowerText = text.toLowerCase();
      for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
          if (keywords.some(k => lowerText.includes(k))) return catId;
      }
      return null;
  };

  const parseLine = (line: string) => {
      if (!line.trim()) return null;
      
      let lineNote = '';
      let lineAmount = 0;
      
      if (line.includes('.')) {
          const parts = line.split('.');
          const rawAmountStr = parts[parts.length - 1].trim().toLowerCase();
          lineNote = parts.slice(0, -1).join('.').trim();
          
          let multiplier = 1;
          let cleanAmount = rawAmountStr;
          if (cleanAmount.endsWith('k')) {
              multiplier = 1000;
              cleanAmount = cleanAmount.replace('k', '');
          }
          cleanAmount = cleanAmount.replace(/[^0-9]/g, '');
          lineAmount = (parseFloat(cleanAmount) || 0) * multiplier;
      } else {
          // Try to split by space if no dot
          const parts = line.trim().split(/\s+/);
          const lastPart = parts[parts.length - 1];
          if (/^\d+(k|K)?$/.test(lastPart)) {
              let multiplier = 1;
              let cleanAmount = lastPart.toLowerCase();
              if (cleanAmount.endsWith('k')) {
                  multiplier = 1000;
                  cleanAmount = cleanAmount.replace('k', '');
              }
              lineAmount = (parseFloat(cleanAmount) || 0) * multiplier;
              lineNote = parts.slice(0, -1).join(' ').trim();
          } else {
              lineNote = line.trim();
          }
      }
      
      const lineCategory = detectCategory(lineNote) || (type === 'income' ? 'salary' : 'food');
      return { note: lineNote, amount: lineAmount, category: lineCategory };
  };

  const handleSmartInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSmartInput(text);
    const cat = detectCategory(text);
    if (cat) setCategory(cat);

    const parsed = parseLine(text);
    if (parsed && parsed.amount > 0) {
        setAmount(parsed.amount.toString());
        setNote(parsed.note);
    } else {
        setNote(text);
    }
  };

  // Fix: Added missing handleCategorySelect function to manage manual category selection
  const handleCategorySelect = (id: string) => {
    vibrate(5);
    setCategory(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    vibrate([10, 50, 10]);

    if (mode === 'single') {
        if (!amount || parseFloat(amount) <= 0) return;
        onAdd({
          amount: parseFloat(amount),
          type,
          category,
          note: note || smartInput,
          date: new Date(date).toISOString(),
        });
    } else {
        const lines = bulkInput.split('\n');
        let count = 0;
        lines.forEach(line => {
            const parsed = parseLine(line);
            if (parsed && parsed.amount > 0) {
                onAdd({
                    amount: parsed.amount,
                    type,
                    category: parsed.category,
                    note: parsed.note,
                    date: new Date(date).toISOString(),
                });
                count++;
            }
        });
        if (count === 0) return;
    }
    onClose();
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
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <form onSubmit={handleSubmit} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-zoom-in flex flex-col max-h-[90vh]">
        
        {/* Header with Mode Toggle */}
        <div className="px-8 pt-8 pb-4">
           <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Thêm Giao Dịch</h2>
                    <p className="text-xs text-slate-400 font-medium">Chọn phương thức nhập liệu thuận tiện nhất</p>
                </div>
                <button type="button" onClick={onClose} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 transition-colors">
                    <X className="w-5 h-5" />
                </button>
           </div>

           <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                <button 
                    type="button" 
                    onClick={() => { vibrate(5); setMode('single'); }}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${mode === 'single' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                >
                    <Sparkles className="w-4 h-4" /> Nhập Thông Minh
                </button>
                <button 
                    type="button" 
                    onClick={() => { vibrate(5); setMode('bulk'); }}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${mode === 'bulk' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                >
                    <ListPlus className="w-4 h-4" /> Nhập Danh Sách
                </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-2 space-y-6">
            
            {/* Type Switcher */}
            <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => { vibrate(5); setType('expense'); }} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${type === 'expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-none' : 'text-slate-400'}`}>Chi tiêu</button>
                <button type="button" onClick={() => { vibrate(5); setType('income'); }} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${type === 'income' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none' : 'text-slate-400'}`}>Thu nhập</button>
            </div>

            {mode === 'single' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nội dung thông minh</label>
                            <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-800/30 group focus-within:ring-4 ring-indigo-500/10 transition-all">
                                <input ref={smartInputRef} type="text" value={smartInput} onChange={handleSmartInputChange} placeholder='Cơm trưa. 35k' className="w-full bg-transparent text-xl font-bold outline-none placeholder:text-indigo-200 dark:placeholder:text-indigo-800" autoComplete="off" />
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 text-center">Số tiền giao dịch</label>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-3xl font-black text-slate-300">{getCurrencySymbol()}</span>
                                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className={`w-full max-w-[180px] text-5xl font-black text-center bg-transparent outline-none ${type === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                             <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent text-sm font-bold outline-none flex-1" />
                            </div>
                        </div>
                    </div>

                    <div>
                         <label className="block text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-widest ml-1">Phân loại danh mục</label>
                         <div className="grid grid-cols-3 gap-3">
                            {Object.values(CATEGORIES)
                                .filter(cat => cat.type === type || cat.type === 'both')
                                .map((cat) => {
                                const Icon = IconMap[cat.icon] || MoreHorizontal;
                                const isSelected = category === cat.id;
                                return (
                                    <button key={cat.id} type="button" onClick={() => handleCategorySelect(cat.id)} className={`flex flex-col items-center gap-2 p-4 rounded-3xl transition-all ${isSelected ? 'bg-white dark:bg-slate-800 shadow-xl ring-2 ring-indigo-500/20' : 'opacity-30 grayscale hover:opacity-60'}`}>
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: cat.color }}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase truncate w-full text-center">{cat.name}</span>
                                    </button>
                                );
                            })}
                         </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Danh sách chi tiêu (Mỗi dòng 1 món)</label>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 focus-within:ring-4 ring-indigo-500/10 transition-all">
                            <textarea 
                                ref={bulkInputRef}
                                value={bulkInput}
                                onChange={(e) => setBulkInput(e.target.value)}
                                placeholder={"Cơm trưa. 35000\nCafe. 25k\nGửi xe. 5000"}
                                className="w-full h-64 bg-transparent text-lg font-bold outline-none resize-none leading-relaxed placeholder:text-slate-300 dark:placeholder:text-slate-700"
                            ></textarea>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                        <Wand2 className="w-6 h-6 text-indigo-500 shrink-0" />
                        <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                            Hệ thống sẽ tự động tách nội dung, số tiền và nhận diện danh mục thông minh cho từng dòng của bạn.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 w-fit">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent text-sm font-bold outline-none" />
                    </div>
                </div>
            )}
        </div>

        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-4">
           <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-4 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
                Hủy bỏ
            </button>
           <button 
                type="submit" 
                className={`flex-[2] py-4 text-white font-bold rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ${type === 'income' ? 'bg-emerald-600 shadow-emerald-200' : 'bg-slate-900 shadow-slate-200'} dark:shadow-none`}
            >
                {mode === 'bulk' ? <ListPlus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>{mode === 'bulk' ? 'Nhập Tất Cả' : 'Lưu Giao Dịch'}</span>
           </button>
        </div>
      </form>
    </div>
  );
};

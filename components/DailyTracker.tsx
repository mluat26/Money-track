import React, { useEffect, useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { Transaction } from '../types';

interface DailyTrackerProps {
  transactions: Transaction[];
  onAddClick?: () => void; // Optional handler to open add form
}

export const DailyTracker: React.FC<DailyTrackerProps> = ({ transactions, onAddClick }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [stats, setStats] = useState({ count: 0, hasData: false });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => t.date.startsWith(today));
    
    setStats({
      count: todayTransactions.length,
      hasData: todayTransactions.length > 0
    });
  }, [transactions]);

  if (!isVisible) return null;

  // Case 1: Has Data (Success / Green Theme - Like Frame 1)
  if (stats.hasData) {
    return (
      <div className="relative z-20 mx-auto max-w-2xl w-full mb-4 animate-slide-down">
        <div className="bg-[#bbf7d0] dark:bg-emerald-900/60 rounded-[3rem] p-3 pr-6 shadow-sm flex items-center gap-4 min-h-[80px]">
            
            {/* Icon Circle */}
            <div className="w-14 h-14 bg-[#86efac] dark:bg-emerald-600 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm">
                <Check className="w-8 h-8" strokeWidth={4} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                 <h4 className="font-bold text-lg text-[#14532d] dark:text-emerald-100 leading-tight">
                    Tuyệt vời
                 </h4>
                 <p className="text-sm text-[#166534] dark:text-emerald-200/90 font-medium truncate mt-0.5">
                    Bạn đã ghi {stats.count} giao dịch hôm nay
                 </p>
            </div>
            
             {/* Close/Hide Button (Optional, implicit in design) */}
             <button 
                onClick={() => setIsVisible(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#14532d]/40 hover:bg-[#14532d]/10 transition-colors"
            >
                <div className="w-1 h-1 bg-current rounded-full" />
                <div className="w-1 h-1 bg-current rounded-full mx-0.5" />
                <div className="w-1 h-1 bg-current rounded-full" />
             </button>
        </div>
      </div>
    );
  }

  // Case 2: No Data (Warning / Yellow Theme - Like Frame 2)
  return (
    <div className="relative z-20 mx-auto max-w-2xl w-full mb-4 animate-slide-down">
      <div className="bg-[#fef08a] dark:bg-yellow-900/40 rounded-[3rem] p-3 pr-3 shadow-sm flex items-center gap-4 min-h-[80px]">
        
        {/* Icon Circle */}
        <div className="w-14 h-14 bg-[#fde047] dark:bg-yellow-600 rounded-full flex items-center justify-center shrink-0 text-[#fefce8] shadow-sm">
            <span className="text-4xl font-black mb-1">!</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
            <h4 className="font-bold text-lg text-[#3f6212] dark:text-yellow-100 leading-tight">
                Chưa có giao dịch
            </h4>
            <p className="text-sm text-[#4d7c0f] dark:text-yellow-200/90 font-medium truncate mt-0.5">
                Ghi lại chi tiêu nhé
            </p>
        </div>

        {/* Action Button (Arrow) */}
        <button 
            onClick={onAddClick}
            className="w-12 h-12 bg-[#fefce8]/60 hover:bg-[#fefce8] dark:bg-black/10 dark:hover:bg-black/20 rounded-full flex items-center justify-center text-[#4d7c0f] dark:text-yellow-100 transition-all active:scale-95 shadow-sm backdrop-blur-sm"
        >
            <ChevronRight className="w-6 h-6" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};
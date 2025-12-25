import React, { useState } from 'react';
import { Sparkles, Loader2, MessageSquareQuote } from 'lucide-react';
import { getFinancialAdvice } from '../services/geminiService';
import { Transaction } from '../types';
import ReactMarkdown from 'react-markdown';

interface AIAdvisorProps {
  transactions: Transaction[];
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleGetAdvice = async () => {
    setLoading(true);
    setIsOpen(true);
    try {
      const result = await getFinancialAdvice(transactions);
      setAdvice(result);
    } catch (e) {
      setAdvice("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleGetAdvice}
        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-yellow-200" />
          </div>
          <div className="text-left">
            <h3 className="font-bold">Phân tích tài chính AI</h3>
            <p className="text-xs text-indigo-100 opacity-90">Nhận lời khuyên từ Gemini</p>
          </div>
        </div>
        <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium group-hover:bg-white/20 transition-colors">
          Khám phá ngay
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white border border-indigo-100 p-5 rounded-xl shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 text-indigo-700">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold">Góc nhìn chuyên gia AI</h3>
        </div>
        {!loading && (
            <button 
                onClick={() => handleGetAdvice()} 
                className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline"
            >
                Phân tích lại
            </button>
        )}
      </div>

      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm">Đang phân tích thói quen chi tiêu của bạn...</p>
        </div>
      ) : (
        <div className="prose prose-indigo prose-sm max-w-none text-slate-700 bg-slate-50 p-4 rounded-lg">
          <ReactMarkdown>{advice || ''}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};
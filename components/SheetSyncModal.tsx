import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Link, Save, HelpCircle, FileSpreadsheet, ExternalLink, Eye, Layout } from 'lucide-react';

interface SheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SheetSyncModal: React.FC<SheetSyncModalProps> = ({ isOpen, onClose }) => {
  const [scriptUrl, setScriptUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Link provided by user
  const SHEET_EDIT_URL = "https://docs.google.com/spreadsheets/d/17Ht7CUqb41aj-mZutAAa2qB0tn2zEgLtcDnYSeEg2Ds/edit?usp=sharing";
  const SHEET_PREVIEW_URL = "https://docs.google.com/spreadsheets/d/17Ht7CUqb41aj-mZutAAa2qB0tn2zEgLtcDnYSeEg2Ds/preview?widget=true&headers=false";

  useEffect(() => {
    const saved = localStorage.getItem('googleSheetScriptUrl');
    if (saved) setScriptUrl(saved);
  }, []);

  const handleSave = () => {
    localStorage.setItem('googleSheetScriptUrl', scriptUrl.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const appScriptCode = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Tạo header nếu chưa có
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Ngày", "Loại", "Danh mục", "Số tiền", "Ghi chú", "Tháng", "Năm"]);
    // Định dạng header đậm
    sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#d1fae5");
  }

  var data = JSON.parse(e.postData.contents);
  var date = new Date(data.date);
  
  // Format ngày tháng cho đẹp
  var formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), "dd/MM/yyyy");
  var month = date.getMonth() + 1;
  var year = date.getFullYear();

  sheet.appendRow([
    formattedDate,
    data.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
    data.categoryName,
    data.amount,
    data.note,
    month,
    year
  ]);

  return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(appScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl">
               <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="font-bold text-lg text-slate-800 dark:text-white">Đồng bộ Google Sheet</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Settings */}
            <div className="space-y-6">
                {/* Input Section */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Link className="w-4 h-4" /> Web App URL (Script):
                    </label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={scriptUrl}
                            onChange={(e) => setScriptUrl(e.target.value)}
                            placeholder="https://script.google.com/..."
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <button 
                            onClick={handleSave}
                            className={`px-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center gap-2 ${isSaved ? 'bg-emerald-500' : 'bg-slate-900 dark:bg-slate-700 hover:bg-slate-800'}`}
                        >
                            {isSaved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Copy URL từ Apps Script (Deploy &rarr; Web app) và dán vào đây để tự động lưu giao dịch.
                    </p>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                 {/* Instructions */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
                        <HelpCircle className="w-4 h-4 text-indigo-500" /> Code mẫu cho Apps Script
                    </h3>
                    
                    <div className="relative group">
                        <pre className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl text-[10px] font-mono overflow-x-auto border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 max-h-[300px]">
                            {appScriptCode}
                        </pre>
                        <button 
                            onClick={copyCode}
                            className="absolute top-2 right-2 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Sheet Preview */}
            <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-1 border border-slate-200 dark:border-slate-700">
                <div className="p-3 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 mb-1">
                     <div className="flex items-center gap-2">
                        <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-lg">
                            <Layout className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Sheet Preview</span>
                     </div>
                     <a 
                        href={SHEET_EDIT_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                    >
                        <ExternalLink className="w-3 h-3" /> Mở để sửa
                    </a>
                </div>
                
                <div className="flex-1 w-full bg-white rounded-xl overflow-hidden min-h-[400px]">
                    <iframe 
                        src={SHEET_PREVIEW_URL}
                        className="w-full h-full"
                        title="Google Sheet Preview"
                        loading="lazy"
                    ></iframe>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
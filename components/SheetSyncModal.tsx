import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Link, Save, HelpCircle, FileSpreadsheet } from 'lucide-react';

interface SheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SheetSyncModal: React.FC<SheetSyncModalProps> = ({ isOpen, onClose }) => {
  const [scriptUrl, setScriptUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

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
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        
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

        {/* Content */}
        <div className="p-6 space-y-6">
            
            {/* Input Section */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Link className="w-4 h-4" /> Dán URL Web App vào đây:
                </label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={scriptUrl}
                        onChange={(e) => setScriptUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/..."
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button 
                        onClick={handleSave}
                        className={`px-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center gap-2 ${isSaved ? 'bg-emerald-500' : 'bg-slate-900 dark:bg-slate-700 hover:bg-slate-800'}`}
                    >
                        {isSaved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sau khi lưu, mọi giao dịch thêm mới sẽ tự động được gửi vào Google Sheet của bạn.
                </p>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Instructions */}
            <div className="space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-500" /> Hướng dẫn cài đặt (Làm 1 lần)
                </h3>
                
                <ol className="space-y-4 text-sm text-slate-600 dark:text-slate-300 list-decimal list-inside marker:font-bold marker:text-emerald-500">
                    <li className="pl-2">
                        Tạo một <strong>Google Sheet</strong> mới.
                    </li>
                    <li className="pl-2">
                        Vào menu <strong>Extensions (Tiện ích mở rộng)</strong> &rarr; <strong>Apps Script</strong>.
                    </li>
                    <li className="pl-2">
                        Xóa code cũ và dán đoạn code dưới đây vào:
                        <div className="mt-2 relative group">
                            <pre className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                                {appScriptCode}
                            </pre>
                            <button 
                                onClick={copyCode}
                                className="absolute top-2 right-2 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                            </button>
                        </div>
                    </li>
                    <li className="pl-2">
                        Nhấn nút <strong>Deploy (Triển khai)</strong> &rarr; <strong>New deployment (Tùy chọn triển khai mới)</strong>.
                    </li>
                    <li className="pl-2">
                        Chọn loại: <strong>Web app</strong>.
                        <ul className="pl-5 mt-1 space-y-1 text-xs text-slate-500 list-disc">
                            <li>Description: Money Tracker Sync</li>
                            <li>Execute as: <strong>Me (Tôi)</strong></li>
                            <li>Who has access: <strong>Anyone (Bất kỳ ai)</strong> <span className="text-rose-500 font-bold">*Quan trọng</span></li>
                        </ul>
                    </li>
                    <li className="pl-2">
                        Nhấn <strong>Deploy</strong>, cấp quyền truy cập, sau đó copy <strong>Web App URL</strong> và dán vào ô bên trên.
                    </li>
                </ol>
            </div>

        </div>
      </div>
    </div>
  );
};
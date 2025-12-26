import React, { useState, useEffect } from 'react';
import { X, HardDrive, FileJson, Trash2, Download, RefreshCw, FolderOpen, Database } from 'lucide-react';
import { vibrate } from '../App';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearTransactions: () => void;
  onClearSettings: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ 
  isOpen, 
  onClose, 
  onClearTransactions,
  onClearSettings 
}) => {
  const [storageData, setStorageData] = useState<{ key: string; size: string; rawSize: number; label: string }[]>([]);
  const [totalSize, setTotalSize] = useState<string>('0 KB');
  const [usagePercent, setUsagePercent] = useState(0);

  const calculateSize = () => {
    const data = [];
    let total = 0;

    // Define keys we care about
    const keys = [
      { id: 'transactions', label: 'danh_sach_giao_dich.json' },
      { id: 'dailyFoodLimit', label: 'cai_dat_ngan_sach.config' },
      { id: 'theme', label: 'giao_dien_he_thong.config' },
      { id: 'currency', label: 'don_vi_tien_te.config' },
      { id: 'googleSheetScriptUrl', label: 'dong_bo_sheet_api.link' }
    ];

    for (const k of keys) {
      const value = localStorage.getItem(k.id);
      if (value) {
        // UTF-16 strings use 2 bytes per character
        const size = new Blob([value]).size;
        total += size;
        data.push({
          key: k.id,
          label: k.label,
          rawSize: size,
          size: (size / 1024).toFixed(2) + ' KB'
        });
      }
    }

    setStorageData(data);
    setTotalSize((total / 1024).toFixed(2) + ' KB');
    // Assume 5MB is typical localStorage quota (approx 5000KB)
    setUsagePercent(Math.min((total / (5 * 1024 * 1024)) * 100, 100));
  };

  useEffect(() => {
    if (isOpen) {
      calculateSize();
    }
  }, [isOpen]);

  const handleDelete = (key: string) => {
    vibrate([10, 10]);
    if (confirm('Bạn có chắc muốn xóa file dữ liệu này không? Hành động này không thể hoàn tác.')) {
        if (key === 'transactions') {
            onClearTransactions();
        } else {
            localStorage.removeItem(key);
            if (key === 'dailyFoodLimit' || key === 'theme' || key === 'currency') {
                onClearSettings();
            }
        }
        calculateSize();
    }
  };

  const handleDownload = (key: string) => {
      vibrate(10);
      const value = localStorage.getItem(key);
      if (!value) return;
      
      const blob = new Blob([value], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${key}_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
               <HardDrive className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                <h2 className="font-bold text-lg text-slate-800 dark:text-white">Bộ nhớ thiết bị</h2>
                <p className="text-xs text-slate-500">Local Storage Explorer</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Storage Visualization */}
        <div className="p-6 bg-white dark:bg-slate-900">
             <div className="flex justify-between items-end mb-2">
                 <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Đã dùng</span>
                 <span className="text-2xl font-black text-slate-800 dark:text-white">{totalSize}</span>
             </div>
             <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                 <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000" 
                    style={{ width: `${Math.max(usagePercent, 2)}%` }} // Min 2% visibility
                ></div>
             </div>
             <p className="text-xs text-slate-400 mt-2 text-right">Dữ liệu được lưu trực tiếp trên trình duyệt của máy này.</p>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3 px-2">
                <FolderOpen className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">/ root / app_data</span>
            </div>

            <div className="space-y-2">
                {storageData.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <Database className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>Trống rỗng</p>
                    </div>
                ) : (
                    storageData.map((file) => (
                        <div key={file.key} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center shrink-0 text-indigo-500">
                                    <FileJson className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate pr-2">{file.label}</p>
                                    <p className="text-[10px] font-mono text-slate-400">{file.size}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => handleDownload(file.key)}
                                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Tải về backup"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(file.key)}
                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                    title="Xóa vĩnh viễn"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
};
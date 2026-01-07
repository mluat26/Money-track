
export type TransactionType = 'income' | 'expense';
export type Currency = 'VND' | 'USD' | 'IDR' | 'KRW';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO Date string
  note: string;
}

export interface Shortcut {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: TransactionType;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  icon: string; // Name of the Lucide icon
  type: TransactionType | 'both';
}

export const CATEGORIES: Record<string, ExpenseCategory> = {
  food: { id: 'food', name: 'Ăn uống', color: '#10b981', icon: 'Utensils', type: 'expense' },
  transport: { id: 'transport', name: 'Di chuyển', color: '#f59e0b', icon: 'Car', type: 'expense' },
  laundry: { id: 'laundry', name: 'Giặt ủi', color: '#06b6d4', icon: 'Shirt', type: 'expense' },
  beauty: { id: 'beauty', name: 'Làm đẹp', color: '#f472b6', icon: 'Sparkles', type: 'expense' },
  services: { id: 'services', name: 'Dịch vụ', color: '#8b5cf6', icon: 'Wifi', type: 'expense' },
  housing: { id: 'housing', name: 'Nhà cửa', color: '#0ea5e9', icon: 'Home', type: 'expense' },
  shopping: { id: 'shopping', name: 'Mua sắm', color: '#6366f1', icon: 'ShoppingBag', type: 'expense' },
  entertainment: { id: 'entertainment', name: 'Giải trí', color: '#ec4899', icon: 'Gamepad2', type: 'expense' },
  salary: { id: 'salary', name: 'Tiền lương', color: '#14b8a6', icon: 'Banknote', type: 'income' },
  bonus: { id: 'bonus', name: 'Thưởng', color: '#f59e0b', icon: 'Sparkles', type: 'income' },
  investment: { id: 'investment', name: 'Đầu tư', color: '#8b5cf6', icon: 'TrendingUp', type: 'income' },
  other: { id: 'other', name: 'Khác', color: '#64748b', icon: 'MoreHorizontal', type: 'both' },
};
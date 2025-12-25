export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO Date string
  note: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  icon: string; // Name of the Lucide icon
}

// Pastel Green & Vibrant Colors for Categories
export const CATEGORIES: Record<string, ExpenseCategory> = {
  food: { id: 'food', name: 'Ăn uống', color: '#10b981', icon: 'Utensils' }, // emerald-500
  transport: { id: 'transport', name: 'Di chuyển', color: '#f59e0b', icon: 'Car' }, // amber-500
  laundry: { id: 'laundry', name: 'Giặt ủi', color: '#06b6d4', icon: 'Shirt' }, // cyan-500
  beauty: { id: 'beauty', name: 'Làm đẹp', color: '#f472b6', icon: 'Sparkles' }, // pink-400
  services: { id: 'services', name: 'Dịch vụ', color: '#8b5cf6', icon: 'Wifi' }, // violet-500 (Sim, In ấn)
  housing: { id: 'housing', name: 'Nhà cửa', color: '#0ea5e9', icon: 'Home' }, // sky-500
  shopping: { id: 'shopping', name: 'Mua sắm', color: '#6366f1', icon: 'ShoppingBag' }, // indigo-500
  entertainment: { id: 'entertainment', name: 'Giải trí', color: '#ec4899', icon: 'Gamepad2' }, // pink-500
  salary: { id: 'salary', name: 'Lương', color: '#14b8a6', icon: 'Banknote' }, // teal-500
  other: { id: 'other', name: 'Khác', color: '#64748b', icon: 'MoreHorizontal' }, // slate-500
};
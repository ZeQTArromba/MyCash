export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom?: boolean;
  customImage?: string; // Base64 string for custom uploaded images
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string; // ISO string YYYY-MM-DD
  categoryId: string;
  // RF-08: Installment fields
  installmentId?: string; // UUID shared among all parts of the installment
  installmentCurrent?: number; // The current installment number (e.g., 1)
  installmentTotal?: number; // Total installments (e.g., 12)
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
  icon: string;
  customImage?: string;
}

export interface MonthlyStats {
  income: number;
  expense: number;
  balance: number;
}

// RF-10, RF-12, RF-21: Currency & Settings Types
export type Currency = 'BRL' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface CurrencyInfo {
  code: Currency;
  name: string;
  symbol: string;
  locale: string; // e.g., 'pt-BR', 'en-US'
}

export interface UserProfile {
  name: string;
  email: string;
  photoUrl?: string; // Could be a blob or predefined avatar id
}

export interface NotificationSettings {
  dailyReminder: boolean;
  dailyReminderTime: string; // "09:00"
  billAlert: boolean; // 2 days before
}

export interface AppSettings {
  currency: Currency;
  financialStartDay: number; // 1 to 28
  theme: 'light' | 'dark' | 'system';
}
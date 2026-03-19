import { Category, CurrencyInfo } from './types';
import { 
  Utensils, Home, Car, Smile, HeartPulse, Shirt, 
  CreditCard, GraduationCap, Briefcase, DollarSign 
} from 'lucide-react';

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$', locale: 'pt-BR' },
  { code: 'USD', name: 'Dólar Americano', symbol: '$', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£', locale: 'en-GB' },
  { code: 'JPY', name: 'Iene Japonês', symbol: '¥', locale: 'ja-JP' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Alimentação', icon: 'Utensils', color: '#F87171' },
  { id: 'cat_2', name: 'Moradia', icon: 'Home', color: '#60A5FA' },
  { id: 'cat_3', name: 'Transporte', icon: 'Car', color: '#FBBF24' },
  { id: 'cat_4', name: 'Lazer', icon: 'Smile', color: '#A78BFA' },
  { id: 'cat_5', name: 'Saúde', icon: 'HeartPulse', color: '#34D399' },
  { id: 'cat_6', name: 'Roupas', icon: 'Shirt', color: '#F472B6' },
  { id: 'cat_7', name: 'Assinaturas', icon: 'CreditCard', color: '#9CA3AF' },
  { id: 'cat_8', name: 'Educação', icon: 'GraduationCap', color: '#818CF8' },
  { id: 'cat_9', name: 'Salário', icon: 'DollarSign', color: '#34D399' }, // Primarily Income
  { id: 'cat_10', name: 'Freelance', icon: 'Briefcase', color: '#2DD4BF' }, // Primarily Income
];

export const COLORS = {
  income: '#10B981', // Green-500
  expense: '#EF4444', // Red-500
  bg: '#F3F4F6',
  white: '#FFFFFF',
};

export const ICON_LIBRARY = [
  'Utensils', 'Coffee', 'Beer', 'Pizza', 'ShoppingBag', 'ShoppingCart', 
  'Gift', 'Tag', 'CreditCard', 'Banknote', 'DollarSign', 'Wallet', 
  'PiggyBank', 'Home', 'Building', 'Tent', 'Hotel', 'Key', 
  'Car', 'Bus', 'Train', 'Plane', 'Bike', 'Fuel', 'Map', 
  'Smile', 'Heart', 'Star', 'Sun', 'Moon', 'Umbrella', 
  'HeartPulse', 'Stethoscope', 'Pill', 'Dumbbell', 
  'Shirt', 'Scissors', 'Watch', 'Smartphone', 'Laptop', 'Tv', 
  'Wifi', 'Zap', 'Droplet', 'Wrench', 'Hammer', 'Briefcase', 
  'GraduationCap', 'Book', 'Music', 'Film', 'Camera', 'Gamepad2', 
  'Baby', 'Dog', 'Cat', 'Ghost', 'Rocket'
];
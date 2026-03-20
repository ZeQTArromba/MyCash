import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, CalendarClock, Minus, Plus } from 'lucide-react';
import { Transaction, Category, TransactionType } from '../types';
import { suggestCategory } from '../services/geminiService';
import { Icon } from './Icon';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Updated onSave to accept installment metadata
  onSave: (transaction: Omit<Transaction, 'id'> | Transaction, isInstallment?: boolean, installmentCount?: number) => void;
  initialData?: Transaction | null;
  categories: Category[];
  // Hooks for onboarding
  onAmountBlur?: () => void;
  onCategorySelect?: () => void;
  defaultDate?: string; // RF-06: Contextual Date
  currency?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  onAmountBlur,
  onCategorySelect,
  defaultDate,
  currency = 'BRL'
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  // RF-08: Installment State
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(2);

  const currencySymbol = currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : '€';

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setAmount(initialData.amount.toString());
        setDescription(initialData.description);
        setType(initialData.type);
        setCategoryId(initialData.categoryId);
        setDate(initialData.date);
        // We generally don't convert back to installment editing for single items easily 
        // without complex logic, so we disable installment toggle on edit of single item 
        // unless we built a specific "Edit Installment Group" feature.
        setIsInstallment(false); 
        setInstallmentCount(2);
      } else {
        // Reset form
        setAmount('');
        setDescription('');
        setType('expense');
        setCategoryId('');
        setIsInstallment(false);
        setInstallmentCount(2);
        
        // RF-06: Use defaultDate (contextual) if provided, otherwise today
        if (defaultDate) {
          setDate(defaultDate);
        } else {
          // Fallback to today (local time logic correction to avoid UTC issues)
          const now = new Date();
          const offset = now.getTimezoneOffset() * 60000;
          const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 10);
          setDate(localISOTime);
        }
      }
    }
  }, [isOpen, initialData, defaultDate]);

  const handleSuggestCategory = async () => {
    if (!description) return;
    setIsSuggesting(true);
    const suggestedName = await suggestCategory(description, categories);
    setIsSuggesting(false);

    if (suggestedName) {
      const category = categories.find(c => c.name.toLowerCase() === suggestedName.toLowerCase());
      if (category) {
        setCategoryId(category.id);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    const payload = {
      ...(initialData ? { id: initialData.id } : {}),
      amount: parseFloat(amount),
      description,
      type,
      categoryId,
      date,
    };
    
    // Pass installment flags to parent handler
    onSave(payload, isInstallment, installmentCount);
    onClose();
  };

  const incrementInstallments = () => setInstallmentCount(prev => Math.min(prev + 1, 120));
  const decrementInstallments = () => setInstallmentCount(prev => Math.max(prev - 1, 2));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom duration-200 overflow-y-auto max-h-[90vh] no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-lg text-sm font-medium transition-all ${
                type === 'income' 
                  ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Receita
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-lg text-sm font-medium transition-all ${
                type === 'expense' 
                  ? 'bg-white dark:bg-gray-600 text-red-600 dark:text-red-400 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Despesa
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor {isInstallment ? 'Total' : ''}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">{currencySymbol}</span>
              <input
                id="input-trans-amount"
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onBlur={() => {
                   if (amount && onAmountBlur) onAmountBlur();
                }}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg font-semibold text-gray-900 dark:text-white"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Description & AI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
            <div className="relative">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white"
                placeholder="Ex: Almoço com amigos"
              />
              <button
                type="button"
                onClick={handleSuggestCategory}
                disabled={!description || isSuggesting}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg disabled:opacity-50 transition-colors"
                title="Categorizar com IA"
              >
                {isSuggesting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Sparkles size={18} />
                )}
              </button>
            </div>
            {isSuggesting && <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 ml-1">IA está pensando...</p>}
          </div>

          {/* Date */}
          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data {isInstallment ? '(1ª Parcela)' : ''}</label>
             <input 
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white"
             />
          </div>

          {/* RF-08: Installment Toggle & Configuration */}
          {!initialData && (
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className={`p-1.5 rounded-lg ${isInstallment ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400'}`}>
                      <CalendarClock size={16} />
                   </div>
                   <span className="text-sm font-medium text-gray-700 dark:text-gray-200">É uma compra parcelada?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInstallment(!isInstallment)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isInstallment ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isInstallment ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              {isInstallment && (
                <div className="animate-in slide-in-from-top-2 duration-200 pt-1">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Número de Parcelas</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={decrementInstallments} className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Minus size={16} />
                    </button>
                    <div className="flex-1 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg h-10 flex items-center justify-center font-bold text-gray-800 dark:text-white">
                      {installmentCount}x
                    </div>
                    <button type="button" onClick={incrementInstallments} className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Plus size={16} />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2">
                    Serão criadas {installmentCount} transações de {currencySymbol} {(parseFloat(amount || '0') / installmentCount).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
            <div id="select-trans-category" className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto no-scrollbar py-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(cat.id);
                    if (onCategorySelect) onCategorySelect();
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    categoryId === cat.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-white dark:bg-gray-700 border-gray-100 dark:border-gray-600 hover:border-gray-200 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center mb-1 text-white overflow-hidden bg-cover bg-center"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.customImage ? (
                      <img src={cat.customImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Icon name={cat.icon} size={14} />
                    )}
                  </div>
                  <span className="text-[10px] text-gray-600 dark:text-gray-300 truncate w-full text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            id="btn-save-transaction"
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/50 transition-all active:scale-[0.98] mt-4"
          >
            {initialData ? 'Atualizar' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  );
};
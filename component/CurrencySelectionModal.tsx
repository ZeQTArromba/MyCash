import React, { useState, useEffect } from 'react';
import { Search, Globe, Check } from 'lucide-react';
import { Currency } from '../types';
import { SUPPORTED_CURRENCIES } from '../constants';

interface CurrencySelectionModalProps {
  isOpen: boolean;
  onConfirm: (currency: Currency) => void;
}

export const CurrencySelectionModal: React.FC<CurrencySelectionModalProps> = ({ isOpen, onConfirm }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Currency>('BRL');

  useEffect(() => {
    // Try to guess based on locale
    const locale = navigator.language;
    if (locale.includes('US')) setSelected('USD');
    else if (locale.includes('BR') || locale.includes('PT')) setSelected('BRL');
    else if (locale.includes('DE') || locale.includes('FR') || locale.includes('ES')) setSelected('EUR');
    else if (locale.includes('GB')) setSelected('GBP');
    else if (locale.includes('JP')) setSelected('JPY');
  }, []);

  const filtered = SUPPORTED_CURRENCIES.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-gray-900 px-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-4">
            <Globe size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bem-vindo!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Para começar, qual será sua moeda principal?
          </p>
        </div>

        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </span>
          <input 
            type="text"
            placeholder="Buscar moeda (ex: Real, USD)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
          />
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 mb-6 no-scrollbar">
          {filtered.map((curr) => (
            <button
              key={curr.code}
              onClick={() => setSelected(curr.code)}
              className={`w-full p-3 rounded-xl flex items-center justify-between border transition-all ${
                selected === curr.code
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 ring-1 ring-blue-500'
                  : 'bg-white dark:bg-gray-750 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-lg font-bold text-gray-700 dark:text-gray-200">
                  {curr.symbol}
                </span>
                <div className="text-left">
                  <p className="font-bold text-gray-800 dark:text-white">{curr.code}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{curr.name}</p>
                </div>
              </div>
              {selected === curr.code && (
                <Check size={20} className="text-blue-600 dark:text-blue-400" />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => onConfirm(selected)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/50 transition-all active:scale-[0.98]"
        >
          Confirmar Moeda
        </button>

      </div>
    </div>
  );
};
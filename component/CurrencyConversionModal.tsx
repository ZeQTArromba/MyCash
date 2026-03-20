import React, { useState } from 'react';
import { AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { Currency } from '../types';

interface CurrencyConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromCurrency: Currency;
  toCurrency: Currency;
  isConverting: boolean;
}

export const CurrencyConversionModal: React.FC<CurrencyConversionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fromCurrency,
  toCurrency,
  isConverting
}) => {
  const [confirmationText, setConfirmationText] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl p-6 shadow-xl animate-in zoom-in-95 duration-200 border border-red-100 dark:border-red-900/50">
        
        {isConverting ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Convertendo...</h2>
            <p className="text-sm text-gray-500 text-center">
              Atualizando seu histórico financeiro com a taxa de câmbio atual.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4 animate-pulse">
                <AlertTriangle size={28} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                Atenção: Conversão de Moeda
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Você está prestes a converter todo o seu histórico de <strong>{fromCurrency}</strong> para <strong>{toCurrency}</strong>.
              </p>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30 w-full mb-4">
                <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                  Esta ação usará a taxa de câmbio de hoje para recalcular transações passadas. Isso é irreversível.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-4">
                <span>{fromCurrency}</span>
                <ArrowRight size={16} />
                <span className="text-blue-600 dark:text-blue-400">{toCurrency}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Digite "CONVERTER" para confirmar
              </label>
              <input 
                type="text" 
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="CONVERTER"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none font-bold text-center text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3 text-gray-600 dark:text-gray-300 font-medium bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={onConfirm}
                disabled={confirmationText !== 'CONVERTER'}
                className="flex-1 py-3 text-white font-medium bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900 disabled:cursor-not-allowed rounded-xl transition-colors shadow-lg shadow-red-200 dark:shadow-red-900/50"
              >
                Converter
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
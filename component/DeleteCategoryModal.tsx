import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Category } from '../types';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (categoryId: string, reassignTo: string | null) => void;
  category: Category | null;
  categories: Category[]; // To show options for reassignment
  transactionCount: number;
}

export const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  category,
  categories,
  transactionCount,
}) => {
  const [action, setAction] = useState<'reassign' | 'uncategorized'>('reassign');
  const [targetCategoryId, setTargetCategoryId] = useState<string>('');

  if (!isOpen || !category) return null;

  // Filter out the category being deleted
  const availableCategories = categories.filter(c => c.id !== category.id);

  const handleSubmit = () => {
    if (transactionCount > 0) {
       if (action === 'reassign' && !targetCategoryId) return; // Must pick one
       onDelete(category.id, action === 'reassign' ? targetCategoryId : 'uncategorized');
    } else {
       onDelete(category.id, null);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Excluir Categoria?</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Você está prestes a excluir <strong>{category.name}</strong>.
          </p>
        </div>

        {transactionCount > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800 mb-6 text-left">
            <p className="text-sm text-orange-800 dark:text-orange-200 font-medium mb-3">
              Existem <strong>{transactionCount}</strong> transações nesta categoria. O que deseja fazer com elas?
            </p>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="deleteAction" 
                  checked={action === 'reassign'} 
                  onChange={() => setAction('reassign')}
                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
                />
                <span className="text-sm text-gray-800 dark:text-gray-200">Mover para outra categoria</span>
              </label>

              {action === 'reassign' && (
                <select 
                  value={targetCategoryId}
                  onChange={(e) => setTargetCategoryId(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 dark:text-white"
                >
                  <option value="">Selecione uma categoria...</option>
                  {availableCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="deleteAction" 
                  checked={action === 'uncategorized'} 
                  onChange={() => setAction('uncategorized')}
                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
                />
                <span className="text-sm text-gray-800 dark:text-gray-200">Deixar sem categoria</span>
              </label>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-gray-600 dark:text-gray-300 font-medium bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-1 py-3 text-white font-medium bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 rounded-xl transition-colors shadow-lg shadow-red-200 dark:shadow-red-900/50"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};
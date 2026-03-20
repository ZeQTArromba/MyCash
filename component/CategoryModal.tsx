import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Category } from '../types';
import { ICON_LIBRARY } from '../constants';
import { Icon } from './Icon';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, 'id'> | Category) => void;
  initialData?: Category | null;
  // Hooks for onboarding
  onNameBlur?: () => void;
  onIconSelect?: () => void;
}

const COLORS = [
  '#F87171', '#FB923C', '#FBBF24', '#A3E635', '#34D399', 
  '#2DD4BF', '#38BDF8', '#60A5FA', '#818CF8', '#A78BFA', 
  '#F472B6', '#FB7185', '#9CA3AF', '#64748B'
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  onNameBlur,
  onIconSelect
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState(COLORS[0]);
  const [customImage, setCustomImage] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setIcon(initialData.icon);
        setColor(initialData.color);
        setCustomImage(initialData.customImage);
      } else {
        setName('');
        setIcon('Tag');
        setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
        setCustomImage(undefined);
      }
    }
  }, [isOpen, initialData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onSave({
      ...(initialData ? { id: initialData.id } : {}),
      name,
      icon,
      color,
      isCustom: true,
      customImage,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom duration-200 h-[90vh] sm:h-auto overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Categoria</label>
            <input
              id="input-cat-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                if (name && onNameBlur) onNameBlur();
              }}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white"
              placeholder="Ex: Viagens"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cor</label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-110 ring-2 ring-offset-2 ring-blue-500' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Image Upload vs Icon Toggle */}
          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ícone ou Imagem</label>
             
             {/* Upload Button */}
             <div className="mb-4">
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleImageUpload} 
                 accept="image/*" 
                 className="hidden" 
               />
               <button 
                 type="button"
                 onClick={() => fileInputRef.current?.click()}
                 className="w-full py-3 bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
               >
                 {customImage ? <ImageIcon size={20} /> : <Upload size={20} />}
                 {customImage ? 'Alterar Imagem' : 'Enviar Imagem Personalizada'}
               </button>
               {customImage && (
                 <div className="mt-2 flex items-center gap-2">
                   <div className="w-10 h-10 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-600" style={{ backgroundImage: `url(${customImage})` }}></div>
                   <button 
                    type="button" 
                    onClick={() => setCustomImage(undefined)}
                    className="text-xs text-red-500 hover:underline"
                   >
                     Remover imagem
                   </button>
                 </div>
               )}
             </div>

             {/* Icon Library (Disabled if custom image is set) */}
             <div id="list-cat-icons" className={`grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 ${customImage ? 'opacity-40 pointer-events-none' : ''}`}>
               {ICON_LIBRARY.map((iconName) => (
                 <button
                   key={iconName}
                   type="button"
                   onClick={() => {
                     setIcon(iconName);
                     if (onIconSelect) onIconSelect();
                   }}
                   className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                     icon === iconName && !customImage
                       ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 ring-2 ring-blue-500'
                       : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                   }`}
                 >
                   <Icon name={iconName} size={20} />
                 </button>
               ))}
             </div>
          </div>

          <button
            id="btn-save-category"
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/50 transition-all active:scale-[0.98]"
          >
            {initialData ? 'Salvar Alterações' : 'Criar Categoria'}
          </button>
        </form>
      </div>
    </div>
  );
};
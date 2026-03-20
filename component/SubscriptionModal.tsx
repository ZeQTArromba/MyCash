import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Rocket, ShieldCheck, Loader2, ArrowRight, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { UserProfile } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, user }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  
  // Se o usuário cair aqui com payment_status=rejected, podemos mostrar um erro
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment_status') === 'rejected') {
        setErrorMessage('O pagamento anterior não foi concluído. Tente novamente.');
      } else {
        setErrorMessage('');
      }
    }
  }, [isOpen]);

  const handleCheckoutPro = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // RF-24: Cria a preferência no backend
      const { sandbox_init_point } = await api.payment.createPreference(selectedPlan, user);
      
      // RF-24 Redirecionamento: Leva o usuário para o Mercado Pago
      // O MP vai redirecionar de volta para window.location.origin + /?payment_status=approved
      window.location.href = sandbox_init_point;

    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setErrorMessage('Erro ao conectar com o Mercado Pago. Tente novamente.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-900 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto no-scrollbar">
      
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="w-10" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Seja Premium
        </h2>
        {/* RF-20: Prevent closing if mandatory (logic controlled by parent), 
            but keeping UI consistent. If parent forbids close, this might do nothing or show alert. 
            Here we assume strict flow means user stays until paid. */}
         <div className="w-10" /> 
      </div>

      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full flex flex-col justify-center">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
             <Loader2 size={64} className="text-blue-600 animate-spin mb-6" />
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Redirecionando...</h2>
             <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
               Estamos te levando para o ambiente seguro do Mercado Pago para concluir sua assinatura.
             </p>
             <div className="mt-8 flex items-center gap-2 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
                <ShieldCheck size={14} /> Pagamento 100% Seguro
             </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right duration-300">
             <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                <Rocket size={32} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Desbloqueie o Potencial Total
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Escolha o plano ideal e organize sua vida financeira como um profissional.
              </p>
            </div>

            {errorMessage && (
               <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-xl text-center text-sm font-medium border border-red-100 dark:border-red-800">
                 {errorMessage}
               </div>
            )}

            <div className="grid grid-cols-1 gap-4 mb-8">
              {/* Monthly */}
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
                  selectedPlan === 'monthly'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-900 dark:text-white">Mensal</span>
                  {selectedPlan === 'monthly' && <CheckCircle size={20} className="text-blue-600" />}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">R$ 20</span>
                  <span className="text-xs text-gray-500">/mês</span>
                </div>
              </button>

              {/* Yearly */}
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
                  selectedPlan === 'yearly'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
                }`}
              >
                <div className="absolute -top-3 left-4 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Economize 27%
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-900 dark:text-white">Anual</span>
                  {selectedPlan === 'yearly' && <CheckCircle size={20} className="text-blue-600" />}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">R$ 175</span>
                  <span className="text-xs text-gray-500">/ano</span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Em até 6x sem juros
                </p>
              </button>
            </div>

            <button
              onClick={handleCheckoutPro}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-200 dark:shadow-blue-900/50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Assinar com Mercado Pago <ExternalLink size={18} />
            </button>
            
            <p className="text-center text-[10px] text-gray-400 mt-6 max-w-[250px] mx-auto">
               Você será redirecionado para uma página segura. Nenhuma cobrança será feita antes da confirmação.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
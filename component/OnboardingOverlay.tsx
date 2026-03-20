import React, { useEffect, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export interface OnboardingStep {
  targetId?: string;
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'center';
  type: 'passive' | 'active' | 'auto'; // Auto = no buttons, auto-advance
  buttonText?: string;
}

interface OnboardingOverlayProps {
  step: OnboardingStep;
  onNext: () => void;
  onSkip: () => void; // Kept for interface compatibility but ignored in UI
  totalSteps: number;
  currentStepIndex: number;
}

// RF-28.1: Padding around the highlighted element
const SPOTLIGHT_PADDING = 10;

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  step,
  onNext,
  totalSteps,
  currentStepIndex,
}) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [progress, setProgress] = useState(0);
  const isLastStep = currentStepIndex === totalSteps - 1;

  useEffect(() => {
    if (step.type === 'auto') {
      setProgress(0);
      const timer = setTimeout(() => setProgress(100), 50);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (!step.targetId) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.getElementById(step.targetId!);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const timer = setTimeout(updateRect, 300);
    window.addEventListener('resize', updateRect);
    return () => {
      window.removeEventListener('resize', updateRect);
      clearTimeout(timer);
    };
  }, [step.targetId]);

  // Center mode (No target)
  if (!step.targetId) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm text-center shadow-2xl border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-300">
            <span className="text-2xl font-bold">✨</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{step.title}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            {step.description}
          </p>
          <div className="flex flex-col gap-3">
             <button 
               onClick={onNext}
               className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/50 transition-all active:scale-[0.98]"
             >
               {step.buttonText || (step.type === 'active' ? 'Entendi' : 'Vamos começar!')}
             </button>
          </div>
        </div>
      </div>
    );
  }

  // Spotlight Mode
  if (!targetRect) return null;

  // RF-28.2: Smart Positioning Logic
  const isTopHalf = targetRect.top < window.innerHeight / 2;
  const tooltipPlacement = step.placement === 'center' ? 'center' : (isTopHalf ? 'bottom' : 'top');

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none animate-in fade-in duration-300">
       {/* Highlighting Backdrop - Harder opacity for focus, adjusting for Padding */}
       <div className="absolute top-0 left-0 right-0 bg-black/80 transition-all duration-300 ease-out pointer-events-auto" style={{ height: targetRect.top - SPOTLIGHT_PADDING }} />
       <div className="absolute left-0 right-0 bottom-0 bg-black/80 transition-all duration-300 ease-out pointer-events-auto" style={{ top: targetRect.bottom + SPOTLIGHT_PADDING }} />
       <div className="absolute left-0 bg-black/80 transition-all duration-300 ease-out pointer-events-auto" style={{ top: targetRect.top - SPOTLIGHT_PADDING, height: targetRect.height + (SPOTLIGHT_PADDING * 2), width: targetRect.left - SPOTLIGHT_PADDING }} />
       <div className="absolute right-0 bg-black/80 transition-all duration-300 ease-out pointer-events-auto" style={{ top: targetRect.top - SPOTLIGHT_PADDING, height: targetRect.height + (SPOTLIGHT_PADDING * 2), left: targetRect.right + SPOTLIGHT_PADDING }} />
       
       {/* Spotlight Border */}
       <div 
         className="absolute border-2 border-white/50 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.0)] transition-all duration-300 ease-out pointer-events-none animate-pulse"
         style={{
           top: targetRect.top - SPOTLIGHT_PADDING,
           left: targetRect.left - SPOTLIGHT_PADDING,
           width: targetRect.width + (SPOTLIGHT_PADDING * 2),
           height: targetRect.height + (SPOTLIGHT_PADDING * 2),
         }}
       />

       {/* Tooltip */}
       <div 
         className="absolute pointer-events-auto transition-all duration-300 ease-out max-w-xs w-full"
         style={{
           top: tooltipPlacement === 'bottom' ? targetRect.bottom + SPOTLIGHT_PADDING + 16 : 'auto',
           bottom: tooltipPlacement === 'top' ? window.innerHeight - targetRect.top + SPOTLIGHT_PADDING + 16 : 'auto',
           left: Math.max(20, Math.min(window.innerWidth - 340, targetRect.left + (targetRect.width / 2) - 160)),
         }}
       >
         <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 relative">
            {/* Arrow */}
            <div 
              className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 rotate-45 transform border-gray-100 dark:border-gray-700 ${tooltipPlacement === 'top' ? 'bottom-[-8px] border-r border-b' : 'top-[-8px] border-l border-t'}`}
            ></div>

            {/* Header */}
            <div className="flex justify-between items-start mb-3">
               {step.type !== 'auto' ? (
                 <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                   Passo {currentStepIndex + 1} de {totalSteps}
                 </span>
               ) : (
                 <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                   <Check size={10} /> Destaque
                 </span>
               )}
            </div>
            
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{step.title}</h3>
            {/* RF-28.3: Text Wrapping */}
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed break-words">
              {step.description}
            </p>

            {step.type === 'auto' ? (
               <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 mt-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ 
                      width: `${progress}%`, 
                      transition: 'width 4000ms linear' 
                    }} 
                  />
               </div>
            ) : step.type === 'passive' ? (
              <button 
                onClick={onNext}
                className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                 {step.buttonText || (isLastStep ? 'Concluir Tutorial' : 'Próximo')} <ArrowRight size={14} />
              </button>
            ) : (
               <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 italic">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                  Interaja com o item destacado para continuar
               </div>
            )}
         </div>
       </div>
    </div>
  );
};
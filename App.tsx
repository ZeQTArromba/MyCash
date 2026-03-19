import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, List, PieChart as PieChartIcon, 
  Settings, Plus, Trash2, Edit2, ChevronLeft, ChevronRight, Moon, Sun, CreditCard, User, Download, DollarSign, ArrowRight, ShieldCheck, Sparkles, Pencil
} from 'lucide-react';
import { Transaction, Category, MonthlyStats, ChartData, Currency, UserProfile, NotificationSettings } from './types';
import { DEFAULT_CATEGORIES, SUPPORTED_CURRENCIES } from './constants';
import { ExpensesPieChart, HistoryBarChart } from './components/Charts';
import { TransactionModal } from './components/TransactionModal';
import { CategoryModal } from './components/CategoryModal';
import { DeleteCategoryModal } from './components/DeleteCategoryModal';
import { DeleteTransactionModal } from './components/DeleteTransactionModal';
import { CurrencySelectionModal } from './components/CurrencySelectionModal';
import { CurrencyConversionModal } from './components/CurrencyConversionModal';
import { Icon } from './components/Icon';
import { OnboardingOverlay, OnboardingStep } from './components/OnboardingOverlay';

interface TransactionItemProps {
  t: Transaction;
  category: Category;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  currency: string;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ t, category, onEdit, onDelete, currency }) => {
  const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currency) || SUPPORTED_CURRENCIES[0];
  const currencySymbol = currencyInfo.symbol;
  
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 mb-3 hover:shadow-md transition-all group">
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 bg-cover bg-center overflow-hidden"
          style={{ backgroundColor: category.color }}
        >
          {category.customImage ? (
             <img src={category.customImage} alt="" className="w-full h-full object-cover" />
          ) : (
             <Icon name={category.icon} size={18} />
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{t.description}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(t.date).toLocaleDateString('pt-BR')} • {category.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {t.type === 'income' ? '+' : '-'}{currencySymbol}{t.amount.toFixed(2)}
        </span>
        <div className="hidden group-hover:flex gap-1">
           <button onClick={() => onEdit(t)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg">
              <Edit2 size={16} />
           </button>
           <button onClick={() => onDelete(t.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg">
              <Trash2 size={16} />
           </button>
        </div>
      </div>
    </div>
  );
};

// Onboarding Steps Configuration (Revised RF-03)
const ONBOARDING_STEPS: OnboardingStep[] = [
  // Etapa 1: Boas-vindas (Passiva)
  {
    targetId: undefined, 
    title: "Bem-vindo ao MyCash",
    description: "Vamos configurar sua primeira categoria e registrar seu primeiro gasto em menos de 2 minutos.",
    placement: "center",
    type: "passive"
  },
  // Etapa 2: Navegando para Categorias (Ativa)
  {
    targetId: "nav-categories",
    title: "Organização é tudo",
    description: "Tudo começa com a organização. Toque aqui para criar sua primeira categoria.",
    placement: "top",
    type: "active"
  },
  // Etapa 3: Criando a Categoria (Ativa)
  {
    targetId: "btn-add-category",
    title: "Criar Categoria",
    description: "Toque aqui para começar a criar sua categoria 'Almoço'.",
    placement: "top",
    type: "active"
  },
  // Etapa 3.1: Preenchendo o Nome (Ativa - Blur)
  {
    targetId: "input-cat-name",
    title: "Nome da Categoria",
    description: "Digite 'Almoço' neste campo e confirme no seu teclado (ou toque fora).",
    placement: "bottom",
    type: "active"
  },
  // Etapa 3.2: Escolha um ícone (Ativa - Select)
  {
    targetId: "list-cat-icons",
    title: "Escolha um Ícone",
    description: "Selecione um ícone que represente comida para continuar.",
    placement: "top",
    type: "active"
  },
  // Etapa 3.3: Salvar (Ativa)
  {
    targetId: "btn-save-category",
    title: "Salvar",
    description: "Ótimo! Agora salve sua nova categoria.",
    placement: "top",
    type: "active"
  },
  // Etapa 4: Navegando para Registrar Transação (Ativa)
  {
    targetId: "btn-add-transaction",
    title: "Registrar Gasto",
    description: "Perfeito! Agora vamos registrar seu primeiro gasto. Toque aqui.",
    placement: "top",
    type: "active"
  },
  // Etapa 5.1: Valor (Ativa - Blur)
  {
    targetId: "input-trans-amount",
    title: "Valor",
    description: "Digite o valor do seu último almoço.",
    placement: "bottom",
    type: "active"
  },
  // Etapa 5.2: Categoria (Ativa - Select)
  {
    targetId: "select-trans-category",
    title: "Categorizar",
    description: "Agora, selecione a categoria 'Almoço' que criamos.",
    placement: "top",
    type: "active"
  },
  // Etapa 5.3: Salvar (Ativa)
  {
    targetId: "btn-save-transaction",
    title: "Finalizar",
    description: "Tudo pronto! Toque para registrar seu primeiro gasto.",
    placement: "top",
    type: "active"
  }
];

const POST_TUTORIAL_STEPS: OnboardingStep[] = [
  {
    targetId: "dashboard-chart",
    title: "O Gráfico de Despesas",
    description: "Este é o seu Gráfico de Gastos. Ele atualiza automaticamente a cada transação, mostrando para onde seu dinheiro vai.",
    placement: "bottom",
    type: "passive",
    buttonText: "Próximo"
  },
  {
    targetId: "dashboard-summary",
    title: "O Saldo e Receitas",
    description: "Aqui você acompanha o impacto no seu Saldo e o total das Receitas e Despesas em tempo real.",
    placement: "bottom",
    type: "passive",
    buttonText: "Próximo"
  },
  {
    targetId: "dashboard-recents",
    title: "O Histórico de Transações",
    description: "Todas as suas movimentações aparecerão aqui. Toque em 'Ver tudo' para acessar o histórico completo.",
    placement: "top",
    type: "passive",
    buttonText: "Concluir"
  }
];

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<'dashboard' | 'transactions' | 'installments' | 'categories' | 'profile' | 'categoryDetails'>('dashboard');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  
  // Settings State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Visitante',
    email: ''
  });
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [financialStartDay, setFinancialStartDay] = useState<number>(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    dailyReminder: false,
    dailyReminderTime: '20:00',
    billAlert: true
  });

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleteTransactionModalOpen, setIsDeleteTransactionModalOpen] = useState(false);
  const [transactionToDeleteId, setTransactionToDeleteId] = useState<string | null>(null);
  
  // RF-21 & RF-22 Currency Modals
  const [isCurrencySetupOpen, setIsCurrencySetupOpen] = useState(false);
  const [isCurrencyConversionModalOpen, setIsCurrencyConversionModalOpen] = useState(false);
  const [targetConversionCurrency, setTargetConversionCurrency] = useState<Currency | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  // Onboarding State
  const [onboardingStep, setOnboardingStep] = useState(0); 
  const [postTutorialStep, setPostTutorialStep] = useState(0); 
  
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // --- Initialization & Persistance (RF-03.5) ---
  useEffect(() => {
    const storedTrans = localStorage.getItem('transactions');
    const storedCats = localStorage.getItem('categories');
    const isComplete = localStorage.getItem('onboarding_complete') === 'true';
    const storedStep = parseInt(localStorage.getItem('onboarding_step') || '0');
    
    const storedTheme = localStorage.getItem('isDarkMode');
    const storedProfile = localStorage.getItem('userProfile');
    const storedCurrency = localStorage.getItem('currency');
    const storedFinStart = localStorage.getItem('financialStartDay');
    const storedNotifs = localStorage.getItem('notificationSettings');

    if (storedTrans) setTransactions(JSON.parse(storedTrans));
    if (storedCats) setCategories(JSON.parse(storedCats));
    if (storedTheme) setIsDarkMode(JSON.parse(storedTheme));
    if (storedProfile) setUserProfile(JSON.parse(storedProfile));
    if (storedFinStart) setFinancialStartDay(JSON.parse(storedFinStart));
    if (storedNotifs) setNotificationSettings(JSON.parse(storedNotifs));
    
    if (storedCurrency) {
      setCurrency(JSON.parse(storedCurrency) as Currency);
      if (!isComplete) {
        if (storedStep > 0) {
            let resumeStep = storedStep;
            // Skip steps that are no longer relevant if we removed auth steps
            if (resumeStep >= 12) {
              setOnboardingStep(0);
            } else {
              if (resumeStep >= 3 && resumeStep <= 6) {
                  setView('categories');
                  if (resumeStep >= 4) setIsCategoryModalOpen(true);
              }
              if (resumeStep >= 8 && resumeStep <= 10) {
                  setIsModalOpen(true);
              }
              setOnboardingStep(resumeStep);
            }
        } else {
            setOnboardingStep(1);
        }
      }
    } else {
      setIsCurrencySetupOpen(true);
    }
  }, []);

  // ... (Rest of component remains same)
  // Persist Onboarding Step whenever it changes
  useEffect(() => {
    if (onboardingStep > 0) {
      localStorage.setItem('onboarding_step', onboardingStep.toString());
    }
  }, [onboardingStep]);

  // --- Persistence ---
  useEffect(() => { localStorage.setItem('transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode)); }, [isDarkMode]);
  useEffect(() => { localStorage.setItem('userProfile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('currency', JSON.stringify(currency)); }, [currency]);
  useEffect(() => { localStorage.setItem('financialStartDay', JSON.stringify(financialStartDay)); }, [financialStartDay]);
  useEffect(() => { localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings)); }, [notificationSettings]);

  // --- Derived State ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const targetYear = selectedMonth.getFullYear();
      const targetMonth = selectedMonth.getMonth(); 
      let startDate: Date;
      let endDate: Date;

      if (financialStartDay === 1) {
        startDate = new Date(targetYear, targetMonth, 1);
        endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
      } else {
        startDate = new Date(targetYear, targetMonth, financialStartDay);
        endDate = new Date(targetYear, targetMonth + 1, financialStartDay - 1, 23, 59, 59);
      }

      const [y, m, d] = t.date.split('-').map(Number);
      const transDate = new Date(y, m - 1, d, 12, 0, 0); 
      return transDate >= startDate && transDate <= endDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedMonth, financialStartDay]);

  const stats: MonthlyStats = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => {
      if (curr.type === 'income') acc.income += curr.amount;
      else acc.expense += curr.amount;
      return acc;
    }, { income: 0, expense: 0, balance: 0 });
  }, [filteredTransactions]);
  stats.balance = stats.income - stats.expense;

  const getCategoryById = (id: string): Category => {
    const cat = categories.find(c => c.id === id);
    if (cat) return cat;
    return { id: 'uncategorized', name: 'Sem Categoria', icon: 'HelpCircle', color: '#9CA3AF' };
  };

  const pieData: ChartData[] = useMemo(() => {
    const expenseMap = new Map<string, number>();
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      expenseMap.set(t.categoryId, (expenseMap.get(t.categoryId) || 0) + t.amount);
    });
    const data: ChartData[] = [];
    expenseMap.forEach((value, key) => {
      const cat = getCategoryById(key);
      data.push({ name: cat.name, value, color: cat.color, icon: cat.icon, customImage: cat.customImage });
    });
    return data;
  }, [filteredTransactions, categories]);

  const historyData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedMonth); 
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString('pt-BR', { month: 'short' });
      const monthTrans = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
      });
      const inc = monthTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = monthTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      data.push({ name: monthName, income: inc, expense: exp });
    }
    return data; 
  }, [transactions, selectedMonth]); 

  const defaultTransactionDate = useMemo(() => {
    const now = new Date();
    const isCurrentView = selectedMonth.getMonth() === now.getMonth() && selectedMonth.getFullYear() === now.getFullYear();
    if (isCurrentView) {
      const offset = now.getTimezoneOffset() * 60000;
      return new Date(now.getTime() - offset).toISOString().slice(0, 10);
    } else {
      const year = selectedMonth.getFullYear();
      const month = String(selectedMonth.getMonth() + 1).padStart(2, '0');
      const day = String(financialStartDay).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }, [selectedMonth, financialStartDay]);

  const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currency) || SUPPORTED_CURRENCIES[0];
  const currencySymbol = currencyInfo.symbol;

  // --- Handlers ---
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const nextOnboardingStep = () => {
    if (onboardingStep > 0 && onboardingStep < ONBOARDING_STEPS.length) {
      setOnboardingStep(prev => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const nextPostTutorialStep = () => {
    if (postTutorialStep < POST_TUTORIAL_STEPS.length) {
      setPostTutorialStep(prev => prev + 1);
    } else {
      setPostTutorialStep(0);
      localStorage.setItem('onboarding_complete', 'true');
    }
  }

  const finishOnboarding = () => {
    setOnboardingStep(0);
    setView('dashboard');
    // Pequeno atraso para garantir que a interface renderizou completamente
    setTimeout(() => setPostTutorialStep(1), 500);
  };

  const skipOnboarding = () => {};

  const handleCurrencySetupConfirm = (selected: Currency) => {
    setCurrency(selected);
    setIsCurrencySetupOpen(false);
    setOnboardingStep(1);
  };

  const handleCurrencyChangeRequest = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value as Currency;
    if (newCurrency !== currency) {
      setTargetConversionCurrency(newCurrency);
      setIsCurrencyConversionModalOpen(true);
    }
  };

  const handleConversionConfirm = async () => {
    if (!targetConversionCurrency) return;
    setIsConverting(true);
    try {
      let rate = 1;
      try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`);
        const data = await response.json();
        if (data && data.rates && data.rates[targetConversionCurrency]) {
           rate = data.rates[targetConversionCurrency];
        } else {
           throw new Error("Rate not found");
        }
      } catch (err) {
        console.error("Failed to fetch rates, using mock rate", err);
        const mockRates: any = { 'BRL-USD': 0.18, 'USD-BRL': 5.50 };
        const key = `${currency}-${targetConversionCurrency}`;
        rate = mockRates[key] || 1;
      }

      const newTransactions = transactions.map(t => ({
        ...t,
        amount: parseFloat((t.amount * rate).toFixed(2))
      }));

      setTransactions(newTransactions);
      setCurrency(targetConversionCurrency);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsCurrencyConversionModalOpen(false);
      setTargetConversionCurrency(null);
    } catch (error) {
      alert("Erro ao converter moeda.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleSaveTransaction = (
    t: Transaction | Omit<Transaction, 'id'>, 
    isInstallment?: boolean, 
    installmentCount?: number
  ) => {
    if ('id' in t) {
      setTransactions(prev => prev.map(tr => tr.id === t.id ? t as Transaction : tr));
    } else {
      if (isInstallment && installmentCount && installmentCount > 1) {
        const groupId = crypto.randomUUID();
        const baseAmount = t.amount / installmentCount;
        const newTransactions: Transaction[] = [];
        const baseDate = new Date(t.date);

        for (let i = 0; i < installmentCount; i++) {
          const partDate = new Date(baseDate);
          partDate.setMonth(baseDate.getMonth() + i);
          const offset = partDate.getTimezoneOffset() * 60000;
          const dateString = new Date(partDate.getTime() - offset).toISOString().split('T')[0];

          newTransactions.push({
            ...t,
            id: crypto.randomUUID(),
            description: `${t.description} (${i + 1}/${installmentCount})`,
            amount: baseAmount,
            date: dateString,
            installmentId: groupId,
            installmentCurrent: i + 1,
            installmentTotal: installmentCount
          } as Transaction);
        }
        setTransactions(prev => [...newTransactions, ...prev]);

      } else {
        const newT = { ...t, id: crypto.randomUUID() } as Transaction;
        setTransactions(prev => [newT, ...prev]);
      }
    }
    setEditingTransaction(null);
    if (onboardingStep === 10) nextOnboardingStep();
  };

  const handleTriggerDeleteTransaction = (id: string) => {
    setTransactionToDeleteId(id);
    setIsDeleteTransactionModalOpen(true);
  };

  const handleConfirmDeleteTransaction = () => {
    if (transactionToDeleteId) {
      setTransactions(prev => prev.filter(t => t.id !== transactionToDeleteId));
      setTransactionToDeleteId(null);
    }
  };

  const handleEditTransaction = (t: Transaction) => {
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  const handleSaveCategory = (c: Category | Omit<Category, 'id'>) => {
    if ('id' in c) {
      setCategories(prev => prev.map(cat => cat.id === c.id ? c as Category : cat));
    } else {
      const newC = { ...c, id: crypto.randomUUID() } as Category;
      setCategories(prev => [...prev, newC]);
    }
    setEditingCategory(null);
    if (onboardingStep === 6) nextOnboardingStep();
  };

  const openDeleteCategoryModal = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    setCategoryToDelete(category);
    setIsDeleteCategoryModalOpen(true);
  };

  const handleDeleteCategory = (categoryId: string, reassignTo: string | null) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    setTransactions(prev => prev.map(t => {
      if (t.categoryId === categoryId) {
        return { ...t, categoryId: reassignTo || 'uncategorized' };
      }
      return t;
    }));
  };
  
  const handleDeleteInstallmentGroup = (installmentId: string) => {
    if (confirm("Deseja excluir todas as parcelas restantes desta compra?")) {
       setTransactions(prev => prev.filter(t => t.installmentId !== installmentId));
    }
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedMonth(newDate);
  };

  const exportToCSV = () => {
    const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor", "Parcela"];
    const rows = transactions.map(t => {
      const catName = categories.find(c => c.id === t.categoryId)?.name || 'Sem Categoria';
      const installmentInfo = t.installmentId ? `${t.installmentCurrent}/${t.installmentTotal}` : '-';
      return [
        t.date,
        `"${t.description}"`, // Escape quotes
        `"${catName}"`,
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.amount.toFixed(2),
        installmentInfo
      ].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mycash_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAccount = () => {
    const confirmation = prompt('Para apagar todos os dados do app, digite "LIMPAR" abaixo. Esta ação é irreversível.');
    if (confirmation === 'LIMPAR') {
      localStorage.clear();
      window.location.reload();
    } else if (confirmation !== null) {
      alert('Texto incorreto.');
    }
  };
  
  const handleEditName = () => {
    const newName = prompt("Como você gostaria de ser chamado?", userProfile.name);
    if (newName && newName.trim()) {
      setUserProfile(prev => ({ ...prev, name: newName.trim() }));
    }
  };

  // --- Views ---

  const Header = () => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm border border-emerald-100">
         <img 
           src="/logo.png" 
           alt="MyCash Logo" 
           className="w-full h-full object-cover" 
           onError={(e) => {
             e.currentTarget.style.display = 'none';
             e.currentTarget.parentElement!.classList.add('bg-emerald-100');
             e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dollar-sign text-emerald-600"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
           }}
         />
      </div>
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-500 transition-colors">MyCash</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">Controle seu dinheiro com sabedoria</p>
      </div>
      <div 
        onClick={() => setView('profile')}
        className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800 shadow-sm transition-colors cursor-pointer overflow-hidden"
      >
        {userProfile.photoUrl ? (
          <img src={userProfile.photoUrl} alt="User" className="w-full h-full object-cover" />
        ) : (
          userProfile.name ? userProfile.name.charAt(0).toUpperCase() : <User size={20} />
        )}
      </div>
    </div>
  );

  const MonthSelector = () => {
    const monthYear = selectedMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    const formattedDate = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
    
    return (
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm mb-6 border border-gray-100 dark:border-gray-700 transition-colors">
        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
          <ChevronLeft size={20} />
        </button>
        <span className="font-semibold text-gray-800 dark:text-white text-lg transition-colors">
          {formattedDate}
        </span>
        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  const SummaryCards = () => (
    <div id="dashboard-summary" className="flex flex-col gap-3 mb-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-all">
         <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                 <Icon name="TrendingUp" size={20} />
             </div>
             <div>
                 <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Receitas</p>
             </div>
         </div>
         <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">+{currencySymbol} {stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-all">
         <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                 <Icon name="Wallet" size={20} />
             </div>
             <div>
                 <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Saldo Líquido</p>
             </div>
         </div>
         <p className={`text-lg font-bold ${stats.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
             {currencySymbol} {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
         </p>
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="pb-24 animate-in fade-in duration-500">
      <Header />
      <MonthSelector />
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 transition-colors">
          <h3 className="font-bold text-gray-800 dark:text-white mb-2 transition-colors">Visão Geral de Gastos</h3>
          <ExpensesPieChart data={pieData} totalExpense={stats.expense} isDarkMode={isDarkMode} currency={currency} />
      </div>

      <SummaryCards />
      
      <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 transition-colors">
        <h3 className="font-bold text-gray-800 dark:text-white mb-4 transition-colors">Histórico (6 Meses)</h3>
        <HistoryBarChart data={historyData} isDarkMode={isDarkMode} currency={currency} />
      </div>

      <div id="dashboard-recents" className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 dark:text-white text-lg transition-colors">Recentes</h3>
          <button 
            onClick={() => setView('transactions')} 
            className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            Ver tudo
          </button>
        </div>
        <div>
          {filteredTransactions.length === 0 ? (
            <p className="text-center text-gray-400 dark:text-gray-500 py-8">Nenhuma transação ainda.</p>
          ) : (
            filteredTransactions.slice(0, 3).map(t => (
              <TransactionItem 
                key={t.id} 
                t={t} 
                category={getCategoryById(t.categoryId)}
                onEdit={handleEditTransaction}
                onDelete={handleTriggerDeleteTransaction}
                currency={currency}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );

  const InstallmentsView = () => {
    // Logic to group installments
    const installmentGroups = useMemo(() => {
      const groups: Record<string, Transaction[]> = {};
      transactions.filter(t => t.installmentId).forEach(t => {
        if (!groups[t.installmentId!]) groups[t.installmentId!] = [];
        groups[t.installmentId!].push(t);
      });
      return Object.values(groups).map(group => {
         const first = group[0]; 
         const sorted = group.sort((a,b) => (a.installmentCurrent || 0) - (b.installmentCurrent || 0));
         const totalAmount = sorted.reduce((sum, t) => sum + t.amount, 0);
         const paidCount = sorted.filter(t => new Date(t.date) <= new Date()).length;
         const cat = getCategoryById(first.categoryId);
         
         return {
           id: first.installmentId!,
           description: first.description.replace(/\s\(\d+\/\d+\)$/, ''), 
           category: cat,
           totalAmount,
           totalInstallments: first.installmentTotal!,
           paidInstallments: paidCount,
           amountPerInstallment: first.amount
         };
      });
    }, [transactions]);

    return (
      <div className="pb-24 animate-in fade-in duration-300">
         <div className="flex items-center gap-3 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Compras Parceladas</h1>
         </div>

         {installmentGroups.length === 0 ? (
            <div className="text-center py-20">
               <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500">
                  <CreditCard size={32} />
               </div>
               <p className="text-gray-500 dark:text-gray-400">Nenhuma compra parcelada ativa.</p>
            </div>
         ) : (
            <div className="space-y-4">
               {installmentGroups.map(group => (
                  <div key={group.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                     <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: group.category.color }}>
                              <Icon name={group.category.icon} size={18} />
                           </div>
                           <div>
                              <h3 className="font-bold text-gray-800 dark:text-white text-sm">{group.description}</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{group.category.name}</p>
                           </div>
                        </div>
                        <button 
                           onClick={() => handleDeleteInstallmentGroup(group.id)}
                           className="text-gray-400 hover:text-red-500 p-1"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                     
                     <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                           <span className="text-gray-600 dark:text-gray-300 font-medium">Progresso</span>
                           <span className="text-gray-600 dark:text-gray-300 font-medium">{group.paidInstallments}/{group.totalInstallments}</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(group.paidInstallments / group.totalInstallments) * 100}%` }} />
                        </div>
                     </div>

                     <div className="flex justify-between items-end mt-3">
                        <div>
                           <p className="text-[10px] text-gray-400 uppercase font-bold">Total</p>
                           <p className="text-sm font-bold text-gray-800 dark:text-white">{currencySymbol} {group.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                         <div className="text-right">
                           <p className="text-[10px] text-gray-400 uppercase font-bold">Parcela</p>
                           <p className="text-sm font-bold text-gray-800 dark:text-white">{currencySymbol} {group.amountPerInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
    );
  };

  const CategoriesView = () => (
    <div className="pb-24 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Categorias</h1>
        <button 
           id="btn-add-category"
           onClick={() => {
              setEditingCategory(null);
              setIsCategoryModalOpen(true);
              if (onboardingStep === 3) nextOnboardingStep();
           }}
           className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-sm"
        >
           + Nova
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map(cat => (
          <div 
             key={cat.id} 
             onClick={() => {
                setSelectedCategoryId(cat.id);
                setView('categoryDetails');
             }}
             className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
          >
             <div className="flex justify-between items-start mb-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-cover bg-center overflow-hidden" 
                  style={{ backgroundColor: cat.color }}
                >
                   {cat.customImage ? (
                      <img src={cat.customImage} alt="" className="w-full h-full object-cover" />
                   ) : (
                      <Icon name={cat.icon} size={20} />
                   )}
                </div>
                <div className="flex gap-1">
                   <button 
                      onClick={(e) => { e.stopPropagation(); setEditingCategory(cat); setIsCategoryModalOpen(true); }}
                      className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                   >
                      <Edit2 size={14} />
                   </button>
                   <button 
                      onClick={(e) => openDeleteCategoryModal(e, cat)}
                      className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg hover:text-red-500"
                   >
                      <Trash2 size={14} />
                   </button>
                </div>
             </div>
             <p className="font-bold text-gray-800 dark:text-white">{cat.name}</p>
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {transactions.filter(t => t.categoryId === cat.id).length} transações
             </p>
          </div>
        ))}
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="pb-24 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Ajustes</h1>
      </div>

      <div className="space-y-6">
         {/* Profile Card */}
         <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl font-bold">
               {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : <User size={28} />}
            </div>
            <div className="flex-1">
               <h3 className="font-bold text-gray-900 dark:text-white text-lg">{userProfile.name || 'Visitante'}</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400">Conta Gratuita</p>
            </div>
            <button 
               onClick={handleEditName}
               className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
               title="Editar Nome"
            >
               <Pencil size={18} />
            </button>
         </div>

         {/* General Settings */}
         <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                     {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                  </div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">Modo Escuro</span>
               </div>
               <button 
                  onClick={toggleTheme}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
               >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isDarkMode ? 'translate-x-5' : ''}`} />
               </button>
            </div>

            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                     <DollarSign size={18} />
                  </div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">Moeda</span>
               </div>
               <select 
                  value={currency} 
                  onChange={handleCurrencyChangeRequest}
                  className="bg-transparent text-gray-600 dark:text-gray-300 font-medium outline-none text-right"
               >
                  {SUPPORTED_CURRENCIES.map(c => (
                     <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                  ))}
               </select>
            </div>

            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={exportToCSV}>
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                     <Download size={18} />
                  </div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">Exportar CSV</span>
               </div>
               <ArrowRight size={16} className="text-gray-400" />
            </div>
         </div>
         
         {/* Danger Zone */}
         <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 p-4">
             <button 
                onClick={handleDeleteAccount} 
                className="w-full flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm py-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors"
             >
                <Trash2 size={16} /> Resetar Dados do App
             </button>
         </div>
         
         <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
            <p>MyCash v1.3.0</p>
            <p>Feito com 💚</p>
         </div>
      </div>
    </div>
  );

  // --- Main Render ---
  return (
    <div className={`min-h-screen flex justify-center transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full md:max-w-md bg-white dark:bg-gray-900 min-h-screen shadow-2xl relative overflow-hidden transition-colors duration-300">
        
        <div className="h-full overflow-y-auto no-scrollbar p-6 bg-[#F9FAFB] dark:bg-gray-900 transition-colors duration-300">
          {view === 'dashboard' && <DashboardView />}
          
          {view === 'transactions' && (
            <div className="pb-24 animate-in slide-in-from-right duration-300">
               <div className="flex items-center gap-3 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Transações</h1>
              </div>
              <MonthSelector />
              <div className="space-y-1">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500">
                        <List size={32} />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">Nenhuma transação encontrada neste mês.</p>
                    </div>
                  ) : (
                    filteredTransactions.map(t => (
                      <TransactionItem 
                        key={t.id} 
                        t={t} 
                        category={getCategoryById(t.categoryId)}
                        onEdit={handleEditTransaction}
                        onDelete={handleTriggerDeleteTransaction}
                        currency={currency}
                      />
                    ))
                  )}
              </div>
            </div>
          )}

          {view === 'installments' && <InstallmentsView />}
          {view === 'categories' && <CategoriesView />}
          {view === 'profile' && <SettingsView />}
          
          {view === 'categoryDetails' && (() => {
             const category = getCategoryById(selectedCategoryId || '');
             if (!category || category.id === 'uncategorized' && !selectedCategoryId) return <div className="dark:text-white">Categoria não encontrada</div>;
             const categoryTransactions = transactions.filter(t => t.categoryId === category.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
             const grouped = categoryTransactions.reduce((acc, t) => {
                 const d = new Date(t.date);
                 const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                 if (!acc[key]) acc[key] = [];
                 acc[key].push(t);
                 return acc;
             }, {} as Record<string, Transaction[]>);
             const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

             return (
              <div className="pb-24 animate-in slide-in-from-right duration-300">
                 <div className="flex items-center gap-3 mb-6">
                  <button 
                    onClick={() => setView('categories')} 
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white overflow-hidden bg-cover bg-center" 
                    style={{ backgroundColor: category.color }}
                  >
                    {category.customImage ? (
                        <img src={category.customImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <Icon name={category.icon} size={20} />
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{category.name}</h1>
                </div>
                {sortedMonths.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 dark:text-gray-500">
                        <Icon name={category.icon} size={24} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Nenhuma transação nesta categoria.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sortedMonths.map(monthKey => {
                        const [year, month] = monthKey.split('-');
                        const dateObj = new Date(parseInt(year), parseInt(month) - 1);
                        const monthName = dateObj.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
                        const displayMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                        return (
                            <div key={monthKey}>
                                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wider ml-2">{displayMonth}</h3>
                                <div className="space-y-1">
                                    {grouped[monthKey].map(t => (
                                      <TransactionItem 
                                        key={t.id} 
                                        t={t} 
                                        category={category} 
                                        onEdit={handleEditTransaction}
                                        onDelete={handleTriggerDeleteTransaction}
                                        currency={currency}
                                      />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                  </div>
                )}
              </div>
             );
          })()}
        </div>

        {view !== 'categoryDetails' && (
          <button
            id="btn-add-transaction"
            onClick={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
              if (onboardingStep === 7) nextOnboardingStep();
            }}
            className="absolute bottom-24 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-full shadow-lg shadow-emerald-300 dark:shadow-emerald-900/50 flex items-center justify-center text-white hover:scale-105 transition-all z-40 active:scale-95"
          >
            <Plus size={28} />
          </button>
        )}

        <div className="absolute bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-3 flex justify-between items-center z-30 transition-colors">
           {/* Navigation buttons */}
           <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 transition-colors ${view === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <LayoutDashboard size={22} />
            <span className="text-[10px] font-medium">Início</span>
          </button>
          <button onClick={() => setView('transactions')} className={`flex flex-col items-center gap-1 transition-colors ${view === 'transactions' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <List size={22} />
            <span className="text-[10px] font-medium">Hist.</span>
          </button>
          <button onClick={() => setView('installments')} className={`flex flex-col items-center gap-1 transition-colors ${view === 'installments' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <CreditCard size={22} />
            <span className="text-[10px] font-medium">Faturas</span>
          </button>
          <button id="nav-categories" onClick={() => { setView('categories'); if (onboardingStep === 2) nextOnboardingStep(); }} className={`flex flex-col items-center gap-1 transition-colors ${view === 'categories' || view === 'categoryDetails' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <PieChartIcon size={22} />
            <span className="text-[10px] font-medium">Categ.</span>
          </button>
          <button onClick={() => setView('profile')} className={`flex flex-col items-center gap-1 transition-colors ${view === 'profile' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <Settings size={22} />
            <span className="text-[10px] font-medium">Ajustes</span>
          </button>
        </div>

        {/* Modals */}
        <TransactionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveTransaction}
          initialData={editingTransaction}
          categories={categories}
          onAmountBlur={() => { if (onboardingStep === 8) nextOnboardingStep(); }}
          onCategorySelect={() => { if (onboardingStep === 9) nextOnboardingStep(); }}
          defaultDate={defaultTransactionDate}
          currency={currency}
        />

        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={handleSaveCategory}
          initialData={editingCategory}
          onNameBlur={() => { if (onboardingStep === 4) nextOnboardingStep(); }}
          onIconSelect={() => { if (onboardingStep === 5) nextOnboardingStep(); }}
        />

        <DeleteCategoryModal
          isOpen={isDeleteCategoryModalOpen}
          onClose={() => setIsDeleteCategoryModalOpen(false)}
          onDelete={handleDeleteCategory}
          category={categoryToDelete}
          categories={categories}
          transactionCount={transactions.filter(t => t.categoryId === categoryToDelete?.id).length}
        />
        
        <DeleteTransactionModal 
          isOpen={isDeleteTransactionModalOpen}
          onClose={() => setIsDeleteTransactionModalOpen(false)}
          onConfirm={handleConfirmDeleteTransaction}
        />

        <CurrencySelectionModal
          isOpen={isCurrencySetupOpen}
          onConfirm={handleCurrencySetupConfirm}
        />

        <CurrencyConversionModal
           isOpen={isCurrencyConversionModalOpen}
           onClose={() => {
              setIsCurrencyConversionModalOpen(false);
              setTargetConversionCurrency(null);
           }}
           onConfirm={handleConversionConfirm}
           fromCurrency={currency}
           toCurrency={targetConversionCurrency || 'USD'}
           isConverting={isConverting}
        />

        {onboardingStep > 0 && (
          <OnboardingOverlay 
            step={ONBOARDING_STEPS[onboardingStep - 1]}
            onNext={nextOnboardingStep}
            onSkip={skipOnboarding}
            totalSteps={ONBOARDING_STEPS.length}
            currentStepIndex={onboardingStep - 1}
          />
        )}
        
        {postTutorialStep > 0 && !isCurrencySetupOpen && (
          <OnboardingOverlay 
            step={POST_TUTORIAL_STEPS[postTutorialStep - 1]}
            onNext={nextPostTutorialStep}
            onSkip={() => {}} 
            totalSteps={POST_TUTORIAL_STEPS.length}
            currentStepIndex={postTutorialStep - 1}
          />
        )}
      </div>
    </div>
  );
};

export default App;
import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { ChartData } from '../types';
import { Icon } from './Icon';

interface ExpensesPieChartProps {
  data: ChartData[];
  totalExpense: number;
  isDarkMode: boolean;
  currency: string;
}

export const ExpensesPieChart: React.FC<ExpensesPieChartProps> = ({ data, totalExpense, isDarkMode, currency }) => {
  if (data.length === 0) {
    return (
      <div id="dashboard-chart" className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm italic border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
        <p>Sem despesas este mês</p>
        <p className="text-xs mt-1">Comece a registrar para ver o gráfico</p>
      </div>
    );
  }

  const currencySymbol = currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : '€';

  return (
    <div id="dashboard-chart" className="relative h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
            cornerRadius={8}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
             formatter={(value: number) => `${currencySymbol} ${value.toFixed(2)}`}
             contentStyle={{ 
               borderRadius: '12px', 
               border: 'none', 
               boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
               padding: '8px 12px',
               backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
               color: isDarkMode ? '#F3F4F6' : '#374151'
             }}
             itemStyle={{ color: isDarkMode ? '#F3F4F6' : '#374151', fontWeight: 600 }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Central Label for Donut Chart */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Total Gasto</span>
        <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          {currencySymbol} {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      
      {/* Legend below chart */}
      <div className="flex flex-wrap justify-center gap-3 mt-[-10px]">
        {data.slice(0, 4).map((entry, i) => (
          <div key={i} className="flex items-center text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-full pr-3">
             <div className="w-5 h-5 rounded-full mr-1.5 flex items-center justify-center overflow-hidden" style={{ backgroundColor: entry.color }}>
                {entry.customImage ? (
                  <img src={entry.customImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-white transform scale-75">
                    <Icon name={entry.icon} size={14} />
                  </div>
                )}
             </div>
            {entry.name}
          </div>
        ))}
      </div>
    </div>
  );
};

interface HistoryBarChartProps {
  data: any[];
  isDarkMode: boolean;
  currency: string;
}

export const HistoryBarChart: React.FC<HistoryBarChartProps> = ({ data, isDarkMode, currency }) => {
  const currencySymbol = currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : '€';

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#374151" : "#E5E7EB"} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: isDarkMode ? '#9CA3AF' : '#6B7280' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: isDarkMode ? '#9CA3AF' : '#6B7280' }} 
            tickFormatter={(value) => `${currencySymbol}${value}`}
          />
          <Tooltip 
             formatter={(value: number) => `${currencySymbol} ${value}`}
             cursor={{ fill: isDarkMode ? '#374151' : '#F3F4F6' }}
             contentStyle={{ 
               borderRadius: '8px', 
               border: 'none', 
               boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
               backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
               color: isDarkMode ? '#F3F4F6' : '#374151'
             }}
             itemStyle={{ color: isDarkMode ? '#F3F4F6' : '#374151' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
          <Bar dataKey="income" name="Receitas" fill="#10B981" radius={[4, 4, 0, 0]} barSize={12} />
          <Bar dataKey="expense" name="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/currencyUtils';
import Chart from 'chart.js/auto';

const Dashboard = () => {
  const { accounts, expenses, fetchExpenses, fetchSummary, currency } = useAppContext();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    expensesByCategory: {},
    expenseCount: 0
  });
  
  const expenseChartRef = useRef(null);
  const expenseChartInstance = useRef(null);
  const categoryChartRef = useRef(null);
  const categoryChartInstance = useRef(null);

  useEffect(() => {
    fetchExpenses({ month, year });
    
    const getSummary = async () => {
      try {
        const data = await fetchSummary(month, year);
        setSummary(data);
      } catch (error) {
        console.error('Error fetching summary:', error);
      }
    };
    
    getSummary();
  }, [month, year]);

  useEffect(() => {
    if (expenses.length > 0 && expenseChartRef.current) {
      // Clean up previous chart
      if (expenseChartInstance.current) {
        expenseChartInstance.current.destroy();
      }
      
      // Group expenses by date for trend chart
      const expensesByDate = expenses.reduce((acc, expense) => {
        const date = new Date(expense.date).toLocaleDateString('es-ES');
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += expense.amount;
        return acc;
      }, {});
      
      // Sort dates for chart
      const sortedDates = Object.keys(expensesByDate).sort((a, b) => {
        return new Date(a) - new Date(b);
      });
      
      const expenseTrendData = sortedDates.map(date => ({
        date,
        amount: expensesByDate[date]
      }));
      
      // Create expense trend chart
      const ctx = expenseChartRef.current.getContext('2d');
      expenseChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: expenseTrendData.map(data => data.date),
          datasets: [{
            label: 'Gastos Diarios',
            data: expenseTrendData.map(data => data.amount),
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            tension: 0.1,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return formatCurrency(context.raw, currency);
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return formatCurrency(value, currency, 0);
                }
              }
            }
          }
        }
      });
    }
    
    // Create category pie chart
    if (Object.keys(summary.expensesByCategory).length > 0 && categoryChartRef.current) {
      // Clean up previous chart
      if (categoryChartInstance.current) {
        categoryChartInstance.current.destroy();
      }
      
      const categories = Object.keys(summary.expensesByCategory);
      const amounts = Object.values(summary.expensesByCategory);
      
      const backgroundColors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(199, 199, 199, 0.7)',
        'rgba(83, 102, 255, 0.7)',
        'rgba(40, 159, 64, 0.7)',
        'rgba(210, 199, 199, 0.7)'
      ];
      
      const ctx = categoryChartRef.current.getContext('2d');
      categoryChartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: categories,
          datasets: [{
            data: amounts,
            backgroundColor: backgroundColors.slice(0, categories.length),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw;
                  const percentage = ((value / summary.totalExpenses) * 100).toFixed(1);
                  return `${label}: ${formatCurrency(value, currency)} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
    
    // Cleanup function
    return () => {
      if (expenseChartInstance.current) {
        expenseChartInstance.current.destroy();
      }
      if (categoryChartInstance.current) {
        categoryChartInstance.current.destroy();
      }
    };
  }, [expenses, summary, currency]);

  // Generate options for months
  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  // Generate options for years (last 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Panel de Control</h2>
      
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <div className="md:w-1/4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="md:w-1/4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map(y => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <i className="fas fa-wallet text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Balance Total</p>
              <p className="text-xl font-bold">
                {formatCurrency(accounts.reduce((sum, account) => sum + account.balance, 0), currency)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              <i className="fas fa-receipt text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gastos del Mes</p>
              <p className="text-xl font-bold">
                {formatCurrency(summary.totalExpenses, currency)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <i className="fas fa-list text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Transacciones</p>
              <p className="text-xl font-bold">{summary.expenseCount}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Tendencia de Gastos</h3>
          <div className="h-64">
            {expenses.length > 0 ? (
              <canvas ref={expenseChartRef}></canvas>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No hay datos de gastos para mostrar
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Gastos por Categoría</h3>
          <div className="h-64">
            {Object.keys(summary.expensesByCategory).length > 0 ? (
              <canvas ref={categoryChartRef}></canvas>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No hay datos de categorías para mostrar
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Cuentas</h3>
        </div>
        
        {accounts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hay cuentas registradas. Cree una cuenta para comenzar a gestionar sus finanzas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Moneda
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map(account => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{account.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(account.balance, account.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{account.currency}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

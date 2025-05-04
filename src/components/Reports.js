import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/currencyUtils';
import { generateExcel } from '../utils/excelUtils';

const Reports = () => {
  const { expenses, accounts, fetchExpenses, currency } = useAppContext();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

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

  useEffect(() => {
    const getReportData = async () => {
      setLoading(true);
      try {
        await fetchExpenses({ month, year });
        
        // Process data for report
        const expensesByCategory = expenses.reduce((acc, expense) => {
          const category = expense.category;
          if (!acc[category]) {
            acc[category] = 0;
          }
          acc[category] += expense.amount;
          return acc;
        }, {});
        
        const expensesByAccount = expenses.reduce((acc, expense) => {
          const accountId = expense.accountId;
          if (!acc[accountId]) {
            acc[accountId] = 0;
          }
          acc[accountId] += expense.amount;
          return acc;
        }, {});
        
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        setReportData({
          expenses,
          expensesByCategory,
          expensesByAccount,
          totalExpenses
        });
      } catch (error) {
        console.error('Error loading report data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getReportData();
  }, [month, year]);

  const handleGenerateExcel = () => {
    if (!reportData) return;
    
    const monthName = months.find(m => m.value === month)?.label || '';
    const fileName = `Reporte_Financiero_${monthName}_${year}.xlsx`;
    
    generateExcel(reportData, accounts, month, year, currency, fileName);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Informes Financieros</h2>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Generar Informe Excel</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
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
          
          <div>
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
          
          <div className="flex items-end">
            <button
              onClick={handleGenerateExcel}
              disabled={loading || !reportData || expenses.length === 0}
              className={`w-full py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                loading || !reportData || expenses.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <i className="fas fa-file-excel mr-2"></i>
              Descargar Excel
            </button>
          </div>
        </div>
        
        {loading && (
          <div className="mt-4 text-center text-gray-600">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600 mr-2"></div>
            Cargando datos del informe...
          </div>
        )}
        
        {!loading && reportData && expenses.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 text-yellow-700 rounded">
            No hay gastos registrados para el período seleccionado. Seleccione otro período o agregue gastos.
          </div>
        )}
      </div>
      
      {reportData && expenses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Resumen de Gastos</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded">
                <p className="text-sm text-gray-600">Gastos Totales del Período</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(reportData.totalExpenses, currency)}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Gastos por Categoría</p>
                <div className="space-y-2">
                  {Object.entries(reportData.expensesByCategory)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center p-2 border-b">
                        <span>{category}</span>
                        <span className="font-medium">{formatCurrency(amount, currency)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Detalle del Informe</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Gastos por Cuenta</p>
                <div className="space-y-2">
                  {Object.entries(reportData.expensesByAccount)
                    .sort((a, b) => b[1] - a[1])
                    .map(([accountId, amount]) => {
                      const account = accounts.find(a => a.id === parseInt(accountId));
                      return (
                        <div key={accountId} className="flex justify-between items-center p-2 border-b">
                          <span>{account ? account.name : 'Cuenta Desconocida'}</span>
                          <span className="font-medium">{formatCurrency(amount, currency)}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Contenido del Informe Excel</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Resumen mensual de gastos</li>
                  <li>Desglose por categorías</li>
                  <li>Desglose por cuentas</li>
                  <li>Listado detallado de transacciones</li>
                  <li>Gráficos de distribución</li>
                  <li>Balance de cuentas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {reportData && expenses.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Vista Previa de Datos</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuenta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.slice(0, 5).map(expense => {
                  const account = accounts.find(a => a.id === expense.accountId);
                  return (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(expense.date).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {formatCurrency(expense.amount, expense.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {account ? account.name : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 truncate max-w-xs">
                          {expense.description || '-'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {expenses.length > 5 && (
            <div className="p-2 text-center text-sm text-gray-500">
              Mostrando 5 de {expenses.length} transacciones
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;

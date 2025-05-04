import * as XLSX from 'xlsx';
import { formatCurrency } from './currencyUtils';
import { getMonthName } from './dateUtils';

/**
 * Generates and downloads an Excel report
 * @param {Object} reportData - Data for the report
 * @param {Array} accounts - List of accounts
 * @param {number} month - Month number (1-12)
 * @param {number} year - Year (e.g., 2023)
 * @param {string} currency - Currency code
 * @param {string} fileName - Name of the file to download
 */
export const generateExcel = (reportData, accounts, month, year, currency, fileName) => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Generate the summary sheet
  const summaryData = generateSummarySheet(reportData, accounts, month, year, currency);
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumen');
  
  // Generate the expenses sheet
  const expensesData = generateExpensesSheet(reportData.expenses, accounts, currency);
  const expensesSheet = XLSX.utils.aoa_to_sheet(expensesData);
  XLSX.utils.book_append_sheet(wb, expensesSheet, 'Gastos');
  
  // Generate the accounts sheet
  const accountsData = generateAccountsSheet(accounts, currency);
  const accountsSheet = XLSX.utils.aoa_to_sheet(accountsData);
  XLSX.utils.book_append_sheet(wb, accountsSheet, 'Cuentas');
  
  // Generate the categories sheet
  const categoriesData = generateCategoriesSheet(reportData.expensesByCategory, currency);
  const categoriesSheet = XLSX.utils.aoa_to_sheet(categoriesData);
  XLSX.utils.book_append_sheet(wb, categoriesSheet, 'Categorías');
  
  // Save the file
  XLSX.writeFile(wb, fileName);
};

/**
 * Generates data for the summary sheet
 */
const generateSummarySheet = (reportData, accounts, month, year, currency) => {
  const monthName = getMonthName(month);
  
  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  
  const summaryData = [
    ['INFORME FINANCIERO MENSUAL'],
    [`Período: ${monthName} ${year}`],
    [''],
    ['RESUMEN GENERAL'],
    [''],
    ['Gastos Totales:', formatCurrency(reportData.totalExpenses, currency)],
    ['Balance Total:', formatCurrency(totalBalance, currency)],
    ['Número de Transacciones:', reportData.expenses.length.toString()],
    [''],
    ['DISTRIBUCIÓN POR CATEGORÍA'],
    ['Categoría', 'Monto', 'Porcentaje'],
  ];
  
  // Add categories
  Object.entries(reportData.expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, amount]) => {
      const percentage = ((amount / reportData.totalExpenses) * 100).toFixed(2) + '%';
      summaryData.push([category, formatCurrency(amount, currency), percentage]);
    });
  
  summaryData.push(['']);
  summaryData.push(['DISTRIBUCIÓN POR CUENTA']);
  summaryData.push(['Cuenta', 'Gastos', 'Balance Actual']);
  
  // Add accounts
  Object.entries(reportData.expensesByAccount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([accountId, amount]) => {
      const account = accounts.find(a => a.id === parseInt(accountId));
      if (account) {
        summaryData.push([
          account.name, 
          formatCurrency(amount, currency),
          formatCurrency(account.balance, account.currency)
        ]);
      }
    });
  
  return summaryData;
};

/**
 * Generates data for the expenses sheet
 */
const generateExpensesSheet = (expenses, accounts, currency) => {
  const expensesData = [
    ['LISTADO DETALLADO DE GASTOS'],
    [''],
    ['Fecha', 'Monto', 'Categoría', 'Cuenta', 'Descripción']
  ];
  
  // Sort expenses by date
  expenses
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach(expense => {
      const account = accounts.find(a => a.id === expense.accountId);
      expensesData.push([
        new Date(expense.date).toLocaleDateString('es-CO'),
        formatCurrency(expense.amount, expense.currency),
        expense.category,
        account ? account.name : 'N/A',
        expense.description || ''
      ]);
    });
  
  return expensesData;
};

/**
 * Generates data for the accounts sheet
 */
const generateAccountsSheet = (accounts, currency) => {
  const accountsData = [
    ['BALANCE DE CUENTAS'],
    [''],
    ['Nombre de la Cuenta', 'Balance Actual', 'Moneda']
  ];
  
  accounts.forEach(account => {
    accountsData.push([
      account.name,
      formatCurrency(account.balance, account.currency),
      account.currency
    ]);
  });
  
  return accountsData;
};

/**
 * Generates data for the categories sheet
 */
const generateCategoriesSheet = (expensesByCategory, currency) => {
  const categoriesData = [
    ['GASTOS POR CATEGORÍA'],
    [''],
    ['Categoría', 'Monto Total', 'Porcentaje']
  ];
  
  const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
  
  Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, amount]) => {
      const percentage = ((amount / totalExpenses) * 100).toFixed(2) + '%';
      categoriesData.push([
        category,
        formatCurrency(amount, currency),
        percentage
      ]);
    });
  
  return categoriesData;
};

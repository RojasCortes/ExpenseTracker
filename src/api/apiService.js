const xlsx = require('xlsx');

// Simulación de almacenamiento de datos en memoria
let accounts = [];
let expenses = [];
let incomes = [];

// Constantes para conversión de monedas (valores por defecto si la API falla)
let EXCHANGE_RATES = {
  USD_TO_COP: 4000, // 1 USD = 4000 COP
  COP_TO_USD: 0.00025 // 1 COP = 0.00025 USD
};

// Función para actualizar las tasas de cambio desde una API externa
async function updateExchangeRates() {
  try {
    // Usamos la API gratuita de Exchange Rates Data 
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    
    if (!response.ok) {
      console.error('Error al obtener tasas de cambio:', response.statusText);
      return;
    }
    
    const data = await response.json();
    
    // Verificar si tenemos la tasa para COP
    if (data.rates && data.rates.COP) {
      // Actualizar las constantes con los nuevos valores
      EXCHANGE_RATES.USD_TO_COP = data.rates.COP;
      EXCHANGE_RATES.COP_TO_USD = 1 / data.rates.COP;
      
      console.log('Tasas de cambio actualizadas:', EXCHANGE_RATES);
    }
  } catch (error) {
    console.error('Error al actualizar tasas de cambio:', error);
    // En caso de error, mantenemos los valores por defecto
  }
}

// Intentar actualizar las tasas al iniciar la aplicación
updateExchangeRates();

// Programar actualización diaria (cada 24 horas)
setInterval(updateExchangeRates, 24 * 60 * 60 * 1000);

// Función para generar IDs únicos
const generateId = () => Math.random().toString(36).substring(2, 15);

// Función para inicializar datos de ejemplo
const initializeData = () => {
  // Cuentas de ejemplo
  accounts = [
    {
      id: 'acc1',
      name: 'Cuenta Corriente',
      balance: 2500000,
      currency: 'COP',
      description: 'Cuenta principal para gastos diarios',
      createdAt: new Date().toISOString()
    },
    {
      id: 'acc2',
      name: 'Ahorros',
      balance: 5000000,
      currency: 'COP',
      description: 'Cuenta de ahorros a largo plazo',
      createdAt: new Date().toISOString()
    },
    {
      id: 'acc3',
      name: 'Inversiones',
      balance: 2000,
      currency: 'USD',
      description: 'Cuenta para inversiones en dólares',
      createdAt: new Date().toISOString()
    }
  ];

  // Gastos de ejemplo
  const categories = ['Alimentación', 'Vivienda', 'Transporte', 'Servicios', 'Salud', 'Entretenimiento', 'Educación'];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  expenses = [];
  incomes = [];

  // Tipos de ingresos
  const incomeTypes = ['Salario', 'Freelance', 'Inversiones', 'Regalo', 'Reembolso', 'Otro'];

  // Crear algunos gastos para el mes actual
  for (let i = 1; i <= 20; i++) {
    const day = Math.min(i, 28);
    const date = new Date(currentYear, currentMonth - 1, day);
    
    const category = categories[i % categories.length];
    const account = accounts[i % accounts.length];
    const amount = (i + 1) * 50000;
    
    expenses.push({
      id: `exp${i}`,
      amount,
      currency: account.currency,
      date: date.toISOString(),
      category,
      description: `Gasto de prueba ${i}`,
      accountId: account.id,
      createdAt: new Date().toISOString()
    });
  }
  
  // Crear algunos ingresos para el mes actual
  for (let i = 1; i <= 5; i++) {
    const day = Math.min(i * 5, 28); // Distribuir los ingresos a lo largo del mes
    const date = new Date(currentYear, currentMonth - 1, day);
    
    const type = incomeTypes[i % incomeTypes.length];
    const account = accounts[i % accounts.length];
    const amount = (i + 1) * 500000; // Ingresos más altos que gastos
    
    incomes.push({
      id: `inc${i}`,
      amount,
      currency: account.currency,
      date: date.toISOString(),
      type,
      description: `Ingreso de prueba ${i}`,
      accountId: account.id,
      createdAt: new Date().toISOString()
    });
  }
};

// Funciones para manipulación de cuentas
const getAccounts = () => accounts;

const addAccount = (accountData) => {
  const { name, balance, currency, description } = accountData;
  
  if (!name || balance === undefined || !currency) {
    throw new Error('Faltan campos obligatorios');
  }
  
  const newAccount = {
    id: generateId(),
    name,
    balance: parseFloat(balance),
    currency,
    description,
    createdAt: new Date().toISOString()
  };
  
  accounts.push(newAccount);
  return newAccount;
};

const updateAccount = (id, accountData) => {
  const index = accounts.findIndex(acc => acc.id === id);
  if (index === -1) {
    throw new Error('Cuenta no encontrada');
  }
  
  const { name, balance, currency, description } = accountData;
  
  if (name) accounts[index].name = name;
  if (balance !== undefined) accounts[index].balance = parseFloat(balance);
  if (currency) accounts[index].currency = currency;
  if (description !== undefined) accounts[index].description = description;
  
  return accounts[index];
};

const deleteAccount = (id) => {
  // Verificar si hay gastos asociados a esta cuenta
  const hasExpenses = expenses.some(exp => exp.accountId === id);
  if (hasExpenses) {
    throw new Error('No se puede eliminar una cuenta con gastos asociados');
  }
  
  const index = accounts.findIndex(acc => acc.id === id);
  if (index === -1) {
    throw new Error('Cuenta no encontrada');
  }
  
  accounts.splice(index, 1);
};

// Funciones para manipulación de gastos
const getExpenses = (filters = {}) => {
  let filteredExpenses = [...expenses];
  
  // Filtrar por mes y año
  if (filters.month && filters.year) {
    const startDate = new Date(parseInt(filters.year), parseInt(filters.month) - 1, 1);
    const endDate = new Date(parseInt(filters.year), parseInt(filters.month), 0); // Último día del mes
    
    filteredExpenses = filteredExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  }
  
  // Filtrar por categoría
  if (filters.category) {
    filteredExpenses = filteredExpenses.filter(expense => 
      expense.category === filters.category
    );
  }
  
  // Filtrar por cuenta
  if (filters.accountId) {
    filteredExpenses = filteredExpenses.filter(expense => 
      expense.accountId === filters.accountId
    );
  }
  
  // Ordenar por fecha (más recientes primero)
  return filteredExpenses.sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
};

const addExpense = (expenseData) => {
  const { amount, currency, date, category, description, accountId } = expenseData;
  
  if (!amount || !currency || !date || !category) {
    throw new Error('Faltan campos obligatorios');
  }
  
  const newExpense = {
    id: generateId(),
    amount: parseFloat(amount),
    currency,
    date: new Date(date).toISOString(),
    category,
    description,
    accountId,
    createdAt: new Date().toISOString()
  };
  
  // Actualizar el saldo de la cuenta si se proporciona una
  if (accountId) {
    const account = accounts.find(acc => acc.id === accountId);
    if (account) {
      // Convertir la cantidad a la moneda de la cuenta si es necesario
      let expenseAmount = parseFloat(amount);
      if (currency !== account.currency) {
        expenseAmount = convertCurrency(expenseAmount, currency, account.currency);
      }
      
      // Restar del saldo
      account.balance -= expenseAmount;
    }
  }
  
  expenses.push(newExpense);
  return newExpense;
};

const updateExpense = (id, expenseData) => {
  const index = expenses.findIndex(exp => exp.id === id);
  if (index === -1) {
    throw new Error('Gasto no encontrado');
  }
  
  const oldExpense = expenses[index];
  const { amount, currency, date, category, description, accountId } = expenseData;
  
  // Si la cuenta cambió o el monto cambió, actualizar saldos
  if (oldExpense.accountId && (accountId !== oldExpense.accountId || amount !== oldExpense.amount || currency !== oldExpense.currency)) {
    // Restaurar el saldo de la cuenta antigua
    const oldAccount = accounts.find(acc => acc.id === oldExpense.accountId);
    if (oldAccount) {
      let oldAmount = oldExpense.amount;
      if (oldExpense.currency !== oldAccount.currency) {
        oldAmount = convertCurrency(oldAmount, oldExpense.currency, oldAccount.currency);
      }
      oldAccount.balance += oldAmount;
    }
    
    // Actualizar el saldo de la nueva cuenta
    if (accountId) {
      const newAccount = accounts.find(acc => acc.id === accountId);
      if (newAccount) {
        let newAmount = parseFloat(amount);
        if (currency !== newAccount.currency) {
          newAmount = convertCurrency(newAmount, currency, newAccount.currency);
        }
        newAccount.balance -= newAmount;
      }
    }
  }
  
  // Actualizar campos del gasto
  if (amount !== undefined) expenses[index].amount = parseFloat(amount);
  if (currency) expenses[index].currency = currency;
  if (date) expenses[index].date = new Date(date).toISOString();
  if (category) expenses[index].category = category;
  if (description !== undefined) expenses[index].description = description;
  if (accountId !== undefined) expenses[index].accountId = accountId;
  
  return expenses[index];
};

const deleteExpense = (id) => {
  const index = expenses.findIndex(exp => exp.id === id);
  if (index === -1) {
    throw new Error('Gasto no encontrado');
  }
  
  const expense = expenses[index];
  
  // Restaurar el saldo de la cuenta
  if (expense.accountId) {
    const account = accounts.find(acc => acc.id === expense.accountId);
    if (account) {
      let amount = expense.amount;
      if (expense.currency !== account.currency) {
        amount = convertCurrency(amount, expense.currency, account.currency);
      }
      account.balance += amount;
    }
  }
  
  expenses.splice(index, 1);
};

// Funciones de utilidad
const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  if (fromCurrency === 'USD' && toCurrency === 'COP') {
    return amount * EXCHANGE_RATES.USD_TO_COP;
  }
  
  if (fromCurrency === 'COP' && toCurrency === 'USD') {
    return amount * EXCHANGE_RATES.COP_TO_USD;
  }
  
  return amount; // Moneda no soportada, devolver monto original
};

const formatCurrency = (amount, currency) => {
  if (currency === 'USD') {
    // Usar toLocaleString también para USD para tener separadores de miles
    return `$${parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    })} USD`;
  }
  
  if (currency === 'COP') {
    // Usar toLocaleString con opciones específicas para evitar problemas con números grandes
    return `$${Math.round(amount).toLocaleString('es-CO', {
      maximumFractionDigits: 0, 
      useGrouping: true
    })} COP`;
  }
  
  return `${amount}`;
};

// Función para obtener resumen mensual
const getMonthlySummary = (month, year) => {
  // Filtrar gastos del mes
  const monthlyExpenses = getExpenses({ month, year });
  
  // Calcular gastos totales en COP y USD
  let totalExpenses = 0;
  let totalExpensesUSD = 0;
  
  // Agrupar gastos por categoría (COP y USD por separado)
  const expensesByCategory = {};
  const expensesByCategoryUSD = {};
  
  // Agrupar gastos por día (COP y USD por separado)
  const expensesByDay = {};
  const expensesByDayUSD = {};
  
  // Procesar todos los gastos
  monthlyExpenses.forEach(expense => {
    const amount = expense.amount;
    const category = expense.category;
    const date = new Date(expense.date);
    const day = date.getDate();
    
    if (expense.currency === 'COP') {
      // Sumar al total en COP
      totalExpenses += amount;
      
      // Actualizar categoría en COP
      if (expensesByCategory[category]) {
        expensesByCategory[category] += amount;
      } else {
        expensesByCategory[category] = amount;
      }
      
      // Actualizar día en COP
      if (expensesByDay[day]) {
        expensesByDay[day] += amount;
      } else {
        expensesByDay[day] = amount;
      }
    } 
    else if (expense.currency === 'USD') {
      // Sumar al total en USD
      totalExpensesUSD += amount;
      
      // Convertir para el total en COP
      const amountInCOP = convertCurrency(amount, 'USD', 'COP');
      totalExpenses += amountInCOP;
      
      // Actualizar categoría en USD
      if (expensesByCategoryUSD[category]) {
        expensesByCategoryUSD[category] += amount;
      } else {
        expensesByCategoryUSD[category] = amount;
      }
      
      // Actualizar categoría en COP convertido
      if (expensesByCategory[category]) {
        expensesByCategory[category] += amountInCOP;
      } else {
        expensesByCategory[category] = amountInCOP;
      }
      
      // Actualizar día en USD
      if (expensesByDayUSD[day]) {
        expensesByDayUSD[day] += amount;
      } else {
        expensesByDayUSD[day] = amount;
      }
      
      // Actualizar día en COP convertido
      if (expensesByDay[day]) {
        expensesByDay[day] += amountInCOP;
      } else {
        expensesByDay[day] = amountInCOP;
      }
    }
  });
  
  return {
    totalExpenses,
    totalExpensesUSD,
    expenseCount: monthlyExpenses.length,
    expensesByCategory,
    expensesByCategoryUSD,
    expensesByDay,
    expensesByDayUSD
  };
};

// Función para generar reporte Excel
const generateExcel = (month, year) => {
  const summary = getMonthlySummary(month, year);
  const monthExpenses = getExpenses({ month, year });
  
  // Crear un nuevo libro
  const workbook = xlsx.utils.book_new();
  
  // Crear hoja de resumen
  const summaryData = [
    ['RESUMEN FINANCIERO', ''],
    ['', ''],
    ['Mes', `${month}/${year}`],
    ['Total de gastos', formatCurrency(summary.totalExpenses, 'COP')],
    ['Número de transacciones', summary.expenseCount],
    ['', ''],
    ['GASTOS POR CATEGORÍA', ''],
  ];
  
  // Agregar datos por categoría
  Object.entries(summary.expensesByCategory).forEach(([category, amount]) => {
    summaryData.push([category, formatCurrency(amount, 'COP')]);
  });
  
  // Crear hoja de resumen
  const summarySheet = xlsx.utils.aoa_to_sheet(summaryData);
  xlsx.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
  
  // Crear hoja de gastos
  const expensesData = [
    ['DETALLE DE GASTOS', '', '', '', ''],
    ['Fecha', 'Categoría', 'Descripción', 'Cuenta', 'Monto']
  ];
  
  // Agregar datos de gastos
  monthExpenses.forEach(expense => {
    const account = accounts.find(acc => acc.id === expense.accountId);
    const accountName = account ? account.name : 'N/A';
    
    expensesData.push([
      new Date(expense.date).toLocaleDateString('es-CO'),
      expense.category,
      expense.description || '-',
      accountName,
      formatCurrency(expense.amount, expense.currency)
    ]);
  });
  
  // Crear hoja de gastos
  const expensesSheet = xlsx.utils.aoa_to_sheet(expensesData);
  xlsx.utils.book_append_sheet(workbook, expensesSheet, 'Gastos');
  
  // Crear hoja de cuentas
  const accountsData = [
    ['CUENTAS', '', '', ''],
    ['Nombre', 'Saldo', 'Moneda', 'Descripción']
  ];
  
  // Agregar datos de cuentas
  accounts.forEach(account => {
    accountsData.push([
      account.name,
      formatCurrency(account.balance, account.currency),
      account.currency,
      account.description || '-'
    ]);
  });
  
  // Crear hoja de cuentas
  const accountsSheet = xlsx.utils.aoa_to_sheet(accountsData);
  xlsx.utils.book_append_sheet(workbook, accountsSheet, 'Cuentas');
  
  // Convertir libro a buffer
  const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  return excelBuffer;
};

// Función para obtener las tasas de cambio actuales
const getExchangeRates = () => {
  return {
    USD_TO_COP: EXCHANGE_RATES.USD_TO_COP,
    COP_TO_USD: EXCHANGE_RATES.COP_TO_USD
  };
};

// Funciones para manejar los ingresos
const getIncomes = (filters = {}) => {
  let filteredIncomes = [...incomes];
  
  // Filtrar por mes y año
  if (filters.month && filters.year) {
    const startDate = new Date(parseInt(filters.year), parseInt(filters.month) - 1, 1);
    const endDate = new Date(parseInt(filters.year), parseInt(filters.month), 0); // Último día del mes
    
    filteredIncomes = filteredIncomes.filter(income => {
      const incomeDate = new Date(income.date);
      return incomeDate >= startDate && incomeDate <= endDate;
    });
  }
  
  // Filtrar por tipo de ingreso
  if (filters.type) {
    filteredIncomes = filteredIncomes.filter(income => 
      income.type === filters.type
    );
  }
  
  // Filtrar por cuenta
  if (filters.accountId) {
    filteredIncomes = filteredIncomes.filter(income => 
      income.accountId === filters.accountId
    );
  }
  
  // Ordenar por fecha (más recientes primero)
  return filteredIncomes.sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
};

const addIncome = (incomeData) => {
  const { amount, currency, date, type, description, accountId } = incomeData;
  
  if (!amount || !currency || !date || !type) {
    throw new Error('Faltan campos obligatorios');
  }
  
  const newIncome = {
    id: generateId(),
    amount: parseFloat(amount),
    currency,
    date: new Date(date).toISOString(),
    type,
    description,
    accountId,
    createdAt: new Date().toISOString()
  };
  
  // Actualizar el saldo de la cuenta si se proporciona una
  if (accountId) {
    const account = accounts.find(acc => acc.id === accountId);
    if (account) {
      // Convertir la cantidad a la moneda de la cuenta si es necesario
      let incomeAmount = parseFloat(amount);
      if (currency !== account.currency) {
        incomeAmount = convertCurrency(incomeAmount, currency, account.currency);
      }
      
      // Sumar al saldo (a diferencia de un gasto que resta)
      account.balance += incomeAmount;
    }
  }
  
  incomes.push(newIncome);
  return newIncome;
};

const updateIncome = (id, incomeData) => {
  const index = incomes.findIndex(inc => inc.id === id);
  if (index === -1) {
    throw new Error('Ingreso no encontrado');
  }
  
  const oldIncome = incomes[index];
  const { amount, currency, date, type, description, accountId } = incomeData;
  
  // Si la cuenta cambió o el monto cambió, actualizar saldos
  if (oldIncome.accountId && (accountId !== oldIncome.accountId || amount !== oldIncome.amount || currency !== oldIncome.currency)) {
    // Restaurar el saldo de la cuenta antigua (restar el ingreso anterior)
    const oldAccount = accounts.find(acc => acc.id === oldIncome.accountId);
    if (oldAccount) {
      let oldAmount = oldIncome.amount;
      if (oldIncome.currency !== oldAccount.currency) {
        oldAmount = convertCurrency(oldAmount, oldIncome.currency, oldAccount.currency);
      }
      oldAccount.balance -= oldAmount;
    }
    
    // Actualizar el saldo de la nueva cuenta (sumar el nuevo ingreso)
    if (accountId) {
      const newAccount = accounts.find(acc => acc.id === accountId);
      if (newAccount) {
        let newAmount = parseFloat(amount);
        if (currency !== newAccount.currency) {
          newAmount = convertCurrency(newAmount, currency, newAccount.currency);
        }
        newAccount.balance += newAmount;
      }
    }
  }
  
  // Actualizar campos del ingreso
  if (amount !== undefined) incomes[index].amount = parseFloat(amount);
  if (currency) incomes[index].currency = currency;
  if (date) incomes[index].date = new Date(date).toISOString();
  if (type) incomes[index].type = type;
  if (description !== undefined) incomes[index].description = description;
  if (accountId !== undefined) incomes[index].accountId = accountId;
  
  return incomes[index];
};

const deleteIncome = (id) => {
  const index = incomes.findIndex(inc => inc.id === id);
  if (index === -1) {
    throw new Error('Ingreso no encontrado');
  }
  
  const income = incomes[index];
  
  // Actualizar el saldo de la cuenta (restar el ingreso)
  if (income.accountId) {
    const account = accounts.find(acc => acc.id === income.accountId);
    if (account) {
      let amount = income.amount;
      if (income.currency !== account.currency) {
        amount = convertCurrency(amount, income.currency, account.currency);
      }
      account.balance -= amount;
    }
  }
  
  incomes.splice(index, 1);
};

module.exports = {
  initializeData,
  getAccounts,
  getExpenses,
  getIncomes,
  addAccount,
  addExpense,
  addIncome,
  updateAccount,
  updateExpense,
  updateIncome,
  deleteAccount,
  deleteExpense,
  deleteIncome,
  getMonthlySummary,
  generateExcel,
  convertCurrency,
  formatCurrency,
  getExchangeRates,
  updateExchangeRates
};
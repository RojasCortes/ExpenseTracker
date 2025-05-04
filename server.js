const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// In-memory database
const db = {
  expenses: [],
  accounts: [],
  nextExpenseId: 1,
  nextAccountId: 1,
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes for expenses
app.get('/api/expenses', (req, res) => {
  const { month, year, category, accountId } = req.query;
  
  let filteredExpenses = [...db.expenses];
  
  if (month && year) {
    filteredExpenses = filteredExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() + 1 === parseInt(month) && 
             expenseDate.getFullYear() === parseInt(year);
    });
  }
  
  if (category) {
    filteredExpenses = filteredExpenses.filter(expense => 
      expense.category === category
    );
  }
  
  if (accountId) {
    filteredExpenses = filteredExpenses.filter(expense => 
      expense.accountId === parseInt(accountId)
    );
  }
  
  res.json(filteredExpenses);
});

app.post('/api/expenses', (req, res) => {
  const { amount, currency, date, category, description, accountId } = req.body;
  
  if (!amount || !date || !category || !accountId) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  
  const newExpense = {
    id: db.nextExpenseId++,
    amount: parseFloat(amount),
    currency: currency || 'COP',
    date,
    category,
    description,
    accountId: parseInt(accountId),
    createdAt: new Date().toISOString()
  };
  
  db.expenses.push(newExpense);
  
  // Update account balance
  const account = db.accounts.find(acc => acc.id === parseInt(accountId));
  if (account) {
    account.balance -= parseFloat(amount);
  }
  
  res.status(201).json(newExpense);
});

app.put('/api/expenses/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { amount, currency, date, category, description, accountId } = req.body;
  
  const expenseIndex = db.expenses.findIndex(expense => expense.id === id);
  
  if (expenseIndex === -1) {
    return res.status(404).json({ error: 'Gasto no encontrado' });
  }
  
  const oldExpense = db.expenses[expenseIndex];
  
  // Revert old account balance
  const oldAccount = db.accounts.find(acc => acc.id === oldExpense.accountId);
  if (oldAccount) {
    oldAccount.balance += oldExpense.amount;
  }
  
  // Update expense
  db.expenses[expenseIndex] = {
    ...oldExpense,
    amount: parseFloat(amount),
    currency: currency || oldExpense.currency,
    date: date || oldExpense.date,
    category: category || oldExpense.category,
    description: description || oldExpense.description,
    accountId: accountId ? parseInt(accountId) : oldExpense.accountId,
    updatedAt: new Date().toISOString()
  };
  
  // Update new account balance
  const newAccount = db.accounts.find(acc => acc.id === db.expenses[expenseIndex].accountId);
  if (newAccount) {
    newAccount.balance -= parseFloat(amount);
  }
  
  res.json(db.expenses[expenseIndex]);
});

app.delete('/api/expenses/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const expenseIndex = db.expenses.findIndex(expense => expense.id === id);
  
  if (expenseIndex === -1) {
    return res.status(404).json({ error: 'Gasto no encontrado' });
  }
  
  const expense = db.expenses[expenseIndex];
  
  // Restore account balance
  const account = db.accounts.find(acc => acc.id === expense.accountId);
  if (account) {
    account.balance += expense.amount;
  }
  
  db.expenses.splice(expenseIndex, 1);
  
  res.json({ message: 'Gasto eliminado correctamente' });
});

// Routes for accounts
app.get('/api/accounts', (req, res) => {
  res.json(db.accounts);
});

app.post('/api/accounts', (req, res) => {
  const { name, initialBalance, currency } = req.body;
  
  if (!name || initialBalance === undefined) {
    return res.status(400).json({ error: 'Nombre y balance inicial son obligatorios' });
  }
  
  const newAccount = {
    id: db.nextAccountId++,
    name,
    balance: parseFloat(initialBalance),
    currency: currency || 'COP',
    createdAt: new Date().toISOString()
  };
  
  db.accounts.push(newAccount);
  
  res.status(201).json(newAccount);
});

app.put('/api/accounts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, balance, currency } = req.body;
  
  const accountIndex = db.accounts.findIndex(account => account.id === id);
  
  if (accountIndex === -1) {
    return res.status(404).json({ error: 'Cuenta no encontrada' });
  }
  
  db.accounts[accountIndex] = {
    ...db.accounts[accountIndex],
    name: name || db.accounts[accountIndex].name,
    balance: balance !== undefined ? parseFloat(balance) : db.accounts[accountIndex].balance,
    currency: currency || db.accounts[accountIndex].currency,
    updatedAt: new Date().toISOString()
  };
  
  res.json(db.accounts[accountIndex]);
});

app.delete('/api/accounts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const accountIndex = db.accounts.findIndex(account => account.id === id);
  
  if (accountIndex === -1) {
    return res.status(404).json({ error: 'Cuenta no encontrada' });
  }
  
  // Check if account has expenses
  const hasExpenses = db.expenses.some(expense => expense.accountId === id);
  
  if (hasExpenses) {
    return res.status(400).json({ 
      error: 'No se puede eliminar una cuenta con gastos. Elimine los gastos primero' 
    });
  }
  
  db.accounts.splice(accountIndex, 1);
  
  res.json({ message: 'Cuenta eliminada correctamente' });
});

// Route for monthly summary
app.get('/api/summary', (req, res) => {
  const { month, year } = req.query;
  
  if (!month || !year) {
    return res.status(400).json({ error: 'Mes y año son obligatorios' });
  }
  
  const filteredExpenses = db.expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() + 1 === parseInt(month) && 
           expenseDate.getFullYear() === parseInt(year);
  });
  
  // Group by category
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {});
  
  // Total expenses
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  res.json({
    totalExpenses,
    expensesByCategory,
    expenseCount: filteredExpenses.length
  });
});

// Default route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

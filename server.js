const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Carga de datos (simulando una base de datos)
const { 
  initializeData, 
  getAccounts, 
  getExpenses, 
  addAccount, 
  addExpense, 
  updateAccount, 
  updateExpense, 
  deleteAccount, 
  deleteExpense, 
  getMonthlySummary, 
  generateExcel 
} = require('./src/api/apiService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar datos de ejemplo
initializeData();

// Rutas de API para cuentas
app.get('/api/accounts', (req, res) => {
  res.json(getAccounts());
});

app.post('/api/accounts', (req, res) => {
  try {
    const newAccount = addAccount(req.body);
    res.status(201).json(newAccount);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/accounts/:id', (req, res) => {
  try {
    const updatedAccount = updateAccount(req.params.id, req.body);
    res.json(updatedAccount);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.delete('/api/accounts/:id', (req, res) => {
  try {
    deleteAccount(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rutas de API para gastos
app.get('/api/expenses', (req, res) => {
  const { month, year, category, accountId } = req.query;
  res.json(getExpenses({ month, year, category, accountId }));
});

app.post('/api/expenses', (req, res) => {
  try {
    const newExpense = addExpense(req.body);
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/expenses/:id', (req, res) => {
  try {
    const updatedExpense = updateExpense(req.params.id, req.body);
    res.json(updatedExpense);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.delete('/api/expenses/:id', (req, res) => {
  try {
    deleteExpense(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta para resumen mensual
app.get('/api/summary', (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) {
    return res.status(400).json({ error: 'Se requieren mes y año' });
  }
  
  res.json(getMonthlySummary(parseInt(month), parseInt(year)));
});

// Ruta para generar Excel
app.get('/api/export/excel', (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) {
    return res.status(400).json({ error: 'Se requieren mes y año' });
  }
  
  const excelBuffer = generateExcel(parseInt(month), parseInt(year));
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=reporte_financiero_${month}_${year}.xlsx`);
  res.send(excelBuffer);
});

// Entregar la aplicación web
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
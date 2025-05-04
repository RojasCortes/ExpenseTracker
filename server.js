const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiService = require('./src/api/apiService');

// Inicializar datos de ejemplo
apiService.initializeData();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración del servidor
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas para la API
app.get('/api/accounts', (req, res) => {
  try {
    const accounts = apiService.getAccounts();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/accounts', (req, res) => {
  try {
    const account = apiService.addAccount(req.body);
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/accounts/:id', (req, res) => {
  try {
    const account = apiService.updateAccount(req.params.id, req.body);
    res.json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/accounts/:id', (req, res) => {
  try {
    apiService.deleteAccount(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/expenses', (req, res) => {
  try {
    const { month, year, category, accountId } = req.query;
    const filters = {};
    
    if (month && year) {
      filters.month = month;
      filters.year = year;
    }
    
    if (category) {
      filters.category = category;
    }
    
    if (accountId) {
      filters.accountId = accountId;
    }
    
    const expenses = apiService.getExpenses(filters);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/expenses', (req, res) => {
  try {
    const expense = apiService.addExpense(req.body);
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/expenses/:id', (req, res) => {
  try {
    const expense = apiService.updateExpense(req.params.id, req.body);
    res.json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/expenses/:id', (req, res) => {
  try {
    apiService.deleteExpense(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/summary', (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      throw new Error('Se requiere mes y año para el resumen');
    }
    
    const summary = apiService.getMonthlySummary(month, year);
    res.json(summary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta para obtener la tasa de cambio actual
app.get('/api/exchange-rate', (req, res) => {
  try {
    // Devolver las tasas de cambio actuales
    res.json({
      USD_TO_COP: apiService.getExchangeRates().USD_TO_COP,
      COP_TO_USD: apiService.getExchangeRates().COP_TO_USD,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/export/excel', (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      throw new Error('Se requiere mes y año para exportar');
    }
    
    const buffer = apiService.generateExcel(month, year);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=informe_financiero_${month}_${year}.xlsx`);
    res.send(buffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta para HTML (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// IndexedDB para almacenamiento local
// Este archivo maneja la capa de persistencia local usando IndexedDB

class IndexedDBStorage {
  constructor() {
    this.dbName = 'financialTrackerDB';
    this.dbVersion = 1;
    this.db = null;

    // Iniciar la base de datos
    this.init();
  }

  // Inicializar la base de datos
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      // Se ejecuta cuando es necesario crear o actualizar la estructura de la BD
      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Crear almacenes de objetos (tablas) si no existen
        if (!db.objectStoreNames.contains('accounts')) {
          const accountsStore = db.createObjectStore('accounts', { keyPath: 'id', autoIncrement: true });
          accountsStore.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains('expenses')) {
          const expensesStore = db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
          expensesStore.createIndex('date', 'date', { unique: false });
          expensesStore.createIndex('category', 'category', { unique: false });
          expensesStore.createIndex('accountId', 'accountId', { unique: false });
        }

        if (!db.objectStoreNames.contains('incomes')) {
          const incomesStore = db.createObjectStore('incomes', { keyPath: 'id', autoIncrement: true });
          incomesStore.createIndex('date', 'date', { unique: false });
          incomesStore.createIndex('type', 'type', { unique: false });
          incomesStore.createIndex('accountId', 'accountId', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('IndexedDB inicializada correctamente');
        resolve();
      };

      request.onerror = (event) => {
        console.error('Error al inicializar IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // Método genérico para realizar una operación en la base de datos
  async dbOperation(storeName, mode, operation) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);

      const request = operation(store);

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  // Métodos para cuentas
  async getAccounts() {
    return this.dbOperation('accounts', 'readonly', (store) => {
      return store.getAll();
    });
  }

  async getAccount(id) {
    return this.dbOperation('accounts', 'readonly', (store) => {
      return store.get(id);
    });
  }

  async addAccount(account) {
    return this.dbOperation('accounts', 'readwrite', (store) => {
      return store.add(account);
    });
  }

  async updateAccount(account) {
    return this.dbOperation('accounts', 'readwrite', (store) => {
      return store.put(account);
    });
  }

  async deleteAccount(id) {
    return this.dbOperation('accounts', 'readwrite', (store) => {
      return store.delete(id);
    });
  }

  // Métodos para gastos
  async getExpenses() {
    return this.dbOperation('expenses', 'readonly', (store) => {
      return store.getAll();
    });
  }

  async getExpensesByDateRange(startDate, endDate) {
    return this.dbOperation('expenses', 'readonly', (store) => {
      const index = store.index('date');
      const range = IDBKeyRange.bound(startDate, endDate);
      return index.getAll(range);
    });
  }

  async getExpensesByCategory(category) {
    return this.dbOperation('expenses', 'readonly', (store) => {
      const index = store.index('category');
      return index.getAll(category);
    });
  }

  async addExpense(expense) {
    return this.dbOperation('expenses', 'readwrite', (store) => {
      return store.add(expense);
    });
  }

  async updateExpense(expense) {
    return this.dbOperation('expenses', 'readwrite', (store) => {
      return store.put(expense);
    });
  }

  async deleteExpense(id) {
    return this.dbOperation('expenses', 'readwrite', (store) => {
      return store.delete(id);
    });
  }

  // Métodos para ingresos
  async getIncomes() {
    return this.dbOperation('incomes', 'readonly', (store) => {
      return store.getAll();
    });
  }

  async getIncomesByDateRange(startDate, endDate) {
    return this.dbOperation('incomes', 'readonly', (store) => {
      const index = store.index('date');
      const range = IDBKeyRange.bound(startDate, endDate);
      return index.getAll(range);
    });
  }

  async getIncomesByType(type) {
    return this.dbOperation('incomes', 'readonly', (store) => {
      const index = store.index('type');
      return index.getAll(type);
    });
  }

  async addIncome(income) {
    return this.dbOperation('incomes', 'readwrite', (store) => {
      return store.add(income);
    });
  }

  async updateIncome(income) {
    return this.dbOperation('incomes', 'readwrite', (store) => {
      return store.put(income);
    });
  }

  async deleteIncome(id) {
    return this.dbOperation('incomes', 'readwrite', (store) => {
      return store.delete(id);
    });
  }

  // Métodos para configuraciones
  async getSetting(id) {
    return this.dbOperation('settings', 'readonly', (store) => {
      return store.get(id);
    });
  }

  async updateSetting(setting) {
    return this.dbOperation('settings', 'readwrite', (store) => {
      return store.put(setting);
    });
  }

  // Guardar la tasa de cambio
  async saveExchangeRate(data) {
    return this.updateSetting({
      id: 'exchangeRate',
      value: data,
      updatedAt: new Date().toISOString()
    });
  }

  // Obtener la tasa de cambio guardada
  async getExchangeRate() {
    try {
      const setting = await this.getSetting('exchangeRate');
      return setting ? setting.value : null;
    } catch (error) {
      console.error('Error al obtener tasa de cambio:', error);
      return null;
    }
  }
}

// Exportar la instancia para usar en toda la aplicación
const dbStorage = new IndexedDBStorage();
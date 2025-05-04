/**
 * Financial Tracker App
 * Versión: 1.0.0
 * 
 * Aplicación web progresiva para el seguimiento de finanzas personales
 * Funciona en Android, iOS y navegadores web
 */

// Constantes de categorías y tipos
const CATEGORIES = ['Alimentación', 'Vivienda', 'Transporte', 'Entretenimiento', 'Salud', 'Educación', 'Ropa', 'Servicios', 'Otros'];
const INCOME_TYPES = ['Salario', 'Freelance', 'Inversiones', 'Regalo', 'Reembolso', 'Otro'];

// Estado global de la aplicación
const state = {
  currentView: 'dashboard',
  accounts: [],
  expenses: [],
  incomes: [],
  summary: null,
  selectedCurrency: 'COP',
  isOnline: navigator.onLine, // Verifica si hay conexión a internet
  currentMonth: new Date().getMonth() + 1,
  currentYear: new Date().getFullYear(),
  loading: false,
  exchangeRate: {
    USD_TO_COP: 4000,
    COP_TO_USD: 0.00025,
    lastUpdated: null
  },
  modals: {
    addExpense: false,
    addIncome: false,
    addAccount: false
  }
};



// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
  initApp();
});

// Función principal de inicialización
async function initApp() {
  renderApp();
  setupEventListeners();
  
  // Inicializar IndexedDB
  const dbStorage = new IndexedDBStorage();
  await dbStorage.init();
  
  // Configurar listeners para el estado de conexión
  window.addEventListener('online', handleOnlineStatus);
  window.addEventListener('offline', handleOnlineStatus);
  
  // Cargar datos iniciales
  await fetchExchangeRate();
  await fetchAccounts();
  await fetchExpenses();
  await fetchIncomes();
  await fetchSummary();
  
  updateUI();
}

// Maneja el cambio de estado de conexión
function handleOnlineStatus() {
  const previousState = state.isOnline;
  state.isOnline = navigator.onLine;
  
  // Si cambia de offline a online, intentar sincronizar
  if (!previousState && state.isOnline) {
    console.log('Conexión restaurada. Sincronizando datos...');
    syncDataWithServer();
  }
  
  // Si cambia de online a offline, mostrar un mensaje
  if (previousState && !state.isOnline) {
    console.log('Sin conexión. La aplicación funcionará en modo sin conexión.');
    // Se podría mostrar un toast o notificación al usuario
  }
  
  // Actualizar indicador de conexión en la UI
  updateConnectionIndicator();
}

// Sincronizar datos locales con el servidor cuando se recupera la conexión
async function syncDataWithServer() {
  try {
    // Implementar la lógica de sincronización aquí
    // Por ejemplo, enviar cambios pendientes al servidor
    console.log('Datos sincronizados con el servidor');
  } catch (error) {
    console.error('Error al sincronizar datos:', error);
  }
}

// Actualiza el indicador de estado de conexión en la UI
function updateConnectionIndicator() {
  const indicator = document.getElementById('connection-status');
  if (indicator) {
    indicator.className = state.isOnline ? 'connection-online' : 'connection-offline';
    indicator.title = state.isOnline ? 'En línea' : 'Sin conexión';
  }
}

// Renderiza la estructura básica de la aplicación
function renderApp() {
  const appEl = document.getElementById('app');
  
  appEl.innerHTML = `
    <style>
      /* Estilos para botones bonitos */
      .add-button-pretty {
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 20px;
        padding: 8px 15px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.12);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .add-button-pretty:hover {
        background-color: #0069d9;
        transform: translateY(-2px);
        box-shadow: 0 5px 10px rgba(0,0,0,0.2);
      }
      
      .add-button-pretty.green {
        background-color: #28a745;
      }
      
      .add-button-pretty.green:hover {
        background-color: #218838;
      }
      
      .tab-btn {
        border: none;
        background: transparent;
        padding: 10px 15px;
        cursor: pointer;
        font-weight: 500;
        color: #6c757d;
        border-bottom: 2px solid transparent;
        transition: all 0.3s ease;
      }
      
      .tab-btn.active {
        color: #007bff;
        border-bottom: 2px solid #007bff;
        font-weight: 600;
      }
      
      .section-add-btn {
        background-color: #f8f9fa;
        border: 2px dashed #dee2e6;
        border-radius: 8px;
        color: #6c757d;
        font-weight: 600;
        padding: 12px;
        width: 100%;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .section-add-btn:hover {
        background-color: #e9ecef;
        border-color: #adb5bd;
        color: #495057;
      }
      
      /* Indicador de conexión */
      .connection-status {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-left: 10px;
      }
      
      .connection-online {
        background-color: #28a745;
      }
      
      .connection-offline {
        background-color: #dc3545;
      }
    </style>
    <div class="app-container">
      <nav class="navbar">
        <div class="navbar-title">
          Financial Tracker
          <span id="connection-status" class="${state.isOnline ? 'connection-online' : 'connection-offline'}" 
                title="${state.isOnline ? 'En línea' : 'Sin conexión'}"></span>
        </div>
        <button id="theme-toggle" aria-label="Cambiar tema">
          <i class="fas fa-moon"></i>
        </button>
      </nav>
      
      <main class="main-content">
        <div id="view-container"></div>
      </main>
      
      <!-- Ya no usamos el botón flotante global, ahora están integrados en cada sección -->
      
      <nav class="bottom-nav">
        <a href="#" class="nav-item" data-view="dashboard">
          <i class="nav-icon fas fa-chart-line"></i>
          <span>Dashboard</span>
        </a>
        <a href="#" class="nav-item" data-view="expenses">
          <i class="nav-icon fas fa-money-bill-wave"></i>
          <span>Gastos</span>
        </a>
        <a href="#" class="nav-item" data-view="accounts">
          <i class="nav-icon fas fa-wallet"></i>
          <span>Cuentas</span>
        </a>
        <a href="#" class="nav-item" data-view="reports">
          <i class="nav-icon fas fa-file-invoice-dollar"></i>
          <span>Informes</span>
        </a>
      </nav>
      
      <div id="modal-container"></div>
    </div>
  `;
  
  // Cargar Font Awesome para los íconos
  const fontAwesome = document.createElement('link');
  fontAwesome.rel = 'stylesheet';
  fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';
  document.head.appendChild(fontAwesome);
}

// Configura los listeners de eventos
function setupEventListeners() {
  // Navegación entre tabs
  document.querySelectorAll('.nav-item').forEach(navItem => {
    navItem.addEventListener('click', (e) => {
      e.preventDefault();
      const view = e.currentTarget.dataset.view;
      navigateTo(view);
    });
  });
  
  // Otras interacciones globales
  document.addEventListener('click', (e) => {
    // Cerrar modales con overlay
    if (e.target.classList.contains('modal-overlay')) {
      closeAllModals();
    }
    
    // Cambio de moneda
    if (e.target.classList.contains('currency-option')) {
      const currency = e.target.dataset.currency;
      changeCurrency(currency);
    }
    
    // Botones para agregar cuentas
    if (e.target.id === 'add-account-dashboard-btn' || 
        e.target.closest('#add-account-dashboard-btn') ||
        e.target.id === 'add-account-empty-btn' ||
        e.target.id === 'accounts-view-add-btn' ||
        e.target.closest('#accounts-view-add-btn') ||
        e.target.id === 'add-first-account-btn') {
      showAddAccountModal();
    }
    
    // Botones para agregar gastos
    if (e.target.id === 'add-expense-dashboard-btn' || 
        e.target.closest('#add-expense-dashboard-btn') ||
        e.target.id === 'add-expense-empty-btn' ||
        e.target.id === 'add-expense-btn' ||
        e.target.id === 'expenses-view-add-btn' ||
        e.target.closest('#expenses-view-add-btn')) {
      showAddExpenseModal();
    }
    
    // Botones para agregar ingresos
    if (e.target.id === 'add-income-btn' ||
        e.target.id === 'add-income-empty-btn' ||
        e.target.id === 'add-income-dashboard-btn' ||
        e.target.closest('#add-income-dashboard-btn')) {
      showAddIncomeModal();
    }
    
    // Tab switching en el dashboard para ajustar botón de añadir
    if (e.target.id === 'expenses-tab') {
      if (document.getElementById('transaction-add-btn-container')) {
        const btnContainer = document.getElementById('transaction-add-btn-container');
        btnContainer.innerHTML = `
          <button class="btn-edit-account" id="add-expense-dashboard-btn" style="background: none; border: none; cursor: pointer;">
            <i class="fas fa-plus-circle" style="color: var(--primary-color);"></i>
          </button>
        `;
      }
      if (document.getElementById('transaction-add-section')) {
        document.getElementById('transaction-add-section').innerHTML = state.expenses.length === 0 ? 
          `<button class="section-add-btn" id="add-expense-empty-btn">
            <i class="fas fa-plus mr-2"></i> Agregar mi primer gasto
          </button>` : '';
      }
    }
    
    if (e.target.id === 'incomes-tab') {
      if (document.getElementById('transaction-add-btn-container')) {
        const btnContainer = document.getElementById('transaction-add-btn-container');
        btnContainer.innerHTML = `
          <button class="btn-edit-account" id="add-income-dashboard-btn" style="background: none; border: none; cursor: pointer;">
            <i class="fas fa-plus-circle" style="color: var(--success-color);"></i>
          </button>
        `;
        
        // Agregar evento al botón de ingreso
        setTimeout(() => {
          const incomeBtn = document.getElementById('add-income-dashboard-btn');
          if (incomeBtn) {
            incomeBtn.addEventListener('click', showAddIncomeModal);
          }
        }, 0);
      }
      
      if (document.getElementById('transaction-add-section')) {
        document.getElementById('transaction-add-section').innerHTML = state.incomes.length === 0 ? 
          `<button class="section-add-btn" id="add-income-empty-btn">
            <i class="fas fa-plus mr-2"></i> Agregar mi primer ingreso
          </button>` : '';
      }
    }
    
    // Mostrar/ocultar botones correspondientes en el tab de resumen
    if (e.target.id === 'expense-summary-tab') {
      if (document.getElementById('expense-summary-content')) {
        document.getElementById('expense-summary-content').style.display = 'block';
        document.getElementById('income-summary-content').style.display = 'none';
        e.target.classList.add('active');
        document.getElementById('income-summary-tab')?.classList.remove('active');
      }
    }
    
    if (e.target.id === 'income-summary-tab') {
      if (document.getElementById('income-summary-content')) {
        document.getElementById('income-summary-content').style.display = 'block';
        document.getElementById('expense-summary-content').style.display = 'none';
        e.target.classList.add('active');
        document.getElementById('expense-summary-tab')?.classList.remove('active');
      }
    }
  });
}

// Función para navegar entre vistas
function navigateTo(view) {
  state.currentView = view;
  
  // Actualizar navegación activa
  document.querySelectorAll('.nav-item').forEach(navItem => {
    if (navItem.dataset.view === view) {
      navItem.classList.add('active');
    } else {
      navItem.classList.remove('active');
    }
  });
  
  // Ya no usamos el botón flotante global
  
  // Renderizar la vista actual
  renderCurrentView();
}

// Renderiza la vista actual
function renderCurrentView() {
  const viewContainer = document.getElementById('view-container');
  
  // Mostrar spinner mientras carga
  viewContainer.innerHTML = '<div class="spinner"></div>';
  
  // Renderizar vista según estado actual
  setTimeout(() => {
    switch (state.currentView) {
      case 'dashboard':
        renderDashboardView();
        break;
      case 'expenses':
        renderExpensesView();
        break;
      case 'accounts':
        renderAccountsView();
        break;
      case 'reports':
        renderReportsView();
        break;
      default:
        renderDashboardView();
    }
  }, 100);
}

// RENDERIZADO DE VISTAS

// Vista de Dashboard
function renderDashboardView() {
  const viewContainer = document.getElementById('view-container');
  
  if (!state.summary) {
    viewContainer.innerHTML = '<div class="text-center mt-4">Cargando datos...</div>';
    return;
  }
  
  // Formateo de datos para la moneda seleccionada
  const formatAmount = (amount) => {
    if (state.selectedCurrency === 'USD') {
      // Usar tasa de cambio actualizada
      const usdAmount = amount * state.exchangeRate.COP_TO_USD;
      return `$${usdAmount.toFixed(2)}`;
    } else {
      return `$${Math.round(amount).toLocaleString('es-CO')}`;
    }
  };
  
  // Obtener total de balances separado por moneda
  let totalBalanceCOP = 0;
  let totalBalanceUSD = 0;
  
  state.accounts.forEach(account => {
    if (account.currency === 'COP') {
      totalBalanceCOP += account.balance;
    } else if (account.currency === 'USD') {
      totalBalanceUSD += account.balance;
    }
  });
  
  // Seleccionar el balance en la moneda correcta
  const totalBalance = state.selectedCurrency === 'USD' ? totalBalanceUSD : totalBalanceCOP;
  
  // Usar el total de gastos correcto según la moneda seleccionada
  let totalExpenses = state.selectedCurrency === 'USD' ?
    state.summary?.totalExpensesUSD || 0 :
    state.summary?.totalExpenses || 0;
  
  // Construir el HTML
  viewContainer.innerHTML = `
    <div class="card balance-card">
      <div class="balance-title">Balance Total</div>
      <div class="balance-amount">
        ${state.selectedCurrency === 'USD' ? 
          formatMoney(totalBalance, 'USD') : 
          formatMoney(totalBalance, 'COP')
        }
      </div>
      
      <div class="currency-selector">
        <div class="currency-option ${state.selectedCurrency === 'COP' ? 'active' : ''}" data-currency="COP">COP</div>
        <div class="currency-option ${state.selectedCurrency === 'USD' ? 'active' : ''}" data-currency="USD">USD</div>
      </div>
    </div>
    
    <div class="stats-container">
      <div class="stat-card">
        <i class="fas fa-money-bill-wave" style="color: var(--danger-color)"></i>
        <div class="stat-value">${formatMoney(totalExpenses, state.selectedCurrency)}</div>
        <div class="stat-label">Gastos Mes</div>
      </div>
      
      <div class="stat-card">
        <i class="fas fa-hand-holding-usd" style="color: var(--success-color)"></i>
        <div class="stat-value">${
          state.selectedCurrency === 'USD'
          ? formatMoney(state.summary?.totalIncomesUSD || 0, 'USD')
          : formatMoney(state.summary?.totalIncomes || 0, 'COP')
        }</div>
        <div class="stat-label">Ingresos Mes</div>
      </div>
      
      <div class="stat-card">
        <i class="fas fa-wallet" style="color: var(--primary-color)"></i>
        <div class="stat-value">${state.accounts.length}</div>
        <div class="stat-label">Cuentas</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-title">
        Mis Cuentas
      </div>
      <div class="list-container">
        ${state.accounts.length === 0 ? 
          '<div class="text-center my-4">No hay cuentas registradas</div>' : 
          renderAccountsListItems(state.accounts.slice(0, 3))}
      </div>
      ${state.accounts.length === 0 ? 
        `<button class="section-add-btn" id="add-account-empty-btn">
          <i class="fas fa-plus mr-2"></i> Agregar mi primera cuenta
        </button>` : ''}
    </div>
    
    <div class="card">
      <div class="card-title">
        <div class="transaction-tabs" style="margin: -10px 0;">
          <button class="tab-btn active" id="expenses-chart-tab">Gastos por Categoría</button>
          <button class="tab-btn" id="incomes-chart-tab">Ingresos por Tipo</button>
        </div>
      </div>
      <div class="chart-container" id="expense-chart-container">
        <canvas id="categories-chart"></canvas>
      </div>
      <div class="chart-container" id="income-chart-container" style="display: none;">
        <canvas id="income-types-chart"></canvas>
      </div>
    </div>
    
    <div class="card">
      <div class="card-title">
        Transacciones Recientes
      </div>
      <div class="transaction-tabs">
        <button class="tab-btn active" id="expenses-tab">Gastos</button>
        <button class="tab-btn" id="incomes-tab">Ingresos</button>
      </div>
      <div class="list-container" id="transactions-list">
        ${state.expenses.length === 0 ? 
          '<div class="text-center my-4">No hay gastos registrados</div>' : 
          renderExpensesListItems(state.expenses.slice(0, 5))}
      </div>
      <div id="transaction-add-section">
        ${state.expenses.length === 0 ? 
          `<button class="section-add-btn" id="add-expense-empty-btn">
            <i class="fas fa-plus mr-2"></i> Agregar mi primer gasto
          </button>` : ''}
      </div>
    </div>
  `;
  
  // Inicializar gráficos después de que el DOM esté actualizado
  setTimeout(() => {
    renderCategoriesChart();
    renderIncomeTypesChart();
    
    // Configurar eventos para cambiar entre gráficos de gastos e ingresos
    const expensesChartTab = document.getElementById('expenses-chart-tab');
    const incomesChartTab = document.getElementById('incomes-chart-tab');
    const expenseChartContainer = document.getElementById('expense-chart-container');
    const incomeChartContainer = document.getElementById('income-chart-container');
    
    if (expensesChartTab && incomesChartTab) {
      expensesChartTab.addEventListener('click', () => {
        expensesChartTab.classList.add('active');
        incomesChartTab.classList.remove('active');
        expenseChartContainer.style.display = 'block';
        incomeChartContainer.style.display = 'none';
      });
      
      incomesChartTab.addEventListener('click', () => {
        incomesChartTab.classList.add('active');
        expensesChartTab.classList.remove('active');
        incomeChartContainer.style.display = 'block';
        expenseChartContainer.style.display = 'none';
      });
    }
    
    // Configurar eventos para cambiar entre gastos e ingresos en transacciones
    const expensesTab = document.getElementById('expenses-tab');
    const incomesTab = document.getElementById('incomes-tab');
    const transactionsList = document.getElementById('transactions-list');
    
    if (expensesTab && incomesTab && transactionsList) {
      expensesTab.addEventListener('click', () => {
        expensesTab.classList.add('active');
        incomesTab.classList.remove('active');
        transactionsList.innerHTML = state.expenses.length === 0 ? 
          '<div class="text-center my-4">No hay gastos registrados</div>' : 
          renderExpensesListItems(state.expenses.slice(0, 5));
      });
      
      incomesTab.addEventListener('click', () => {
        incomesTab.classList.add('active');
        expensesTab.classList.remove('active');
        transactionsList.innerHTML = state.incomes.length === 0 ? 
          '<div class="text-center my-4">No hay ingresos registrados</div>' : 
          renderIncomesListItems(state.incomes.slice(0, 5));
      });
    }
  }, 100);
}

// Vista de Gastos y Ingresos
function renderExpensesView() {
  const viewContainer = document.getElementById('view-container');
  
  viewContainer.innerHTML = `
    <div class="card">
      <div class="transaction-tabs">
        <button class="tab-btn active" id="expenses-main-tab">Gastos</button>
        <button class="tab-btn" id="incomes-main-tab">Ingresos</button>
        <span style="flex-grow: 1;"></span>
        <div id="expenses-view-button-container">
          <button class="add-button-pretty" id="expenses-view-add-btn">
            <i class="fas fa-plus mr-1"></i> Agregar
          </button>
        </div>
      </div>
      
      <div id="expenses-content">
        <div class="card-title">Filtros</div>
        
        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
          <select id="month-filter" class="form-control">
            ${generateMonthOptions()}
          </select>
          
          <select id="year-filter" class="form-control">
            ${generateYearOptions()}
          </select>
          
          <select id="currency-filter" class="form-control">
            <option value="all">Todas las monedas</option>
            <option value="COP">Solo COP</option>
            <option value="USD">Solo USD</option>
          </select>
          
          <button id="apply-filter" class="btn btn-primary">Aplicar</button>
        </div>
        
        <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px;">
          <button class="btn" data-filter="all">Todos</button>
          <button class="btn" data-filter="category-Alimentación">Alimentación</button>
          <button class="btn" data-filter="category-Vivienda">Vivienda</button>
          <button class="btn" data-filter="category-Transporte">Transporte</button>
          <button class="btn" data-filter="category-Servicios">Servicios</button>
          <button class="btn" data-filter="category-Otros">Otros</button>
        </div>
      
        <div class="card-title">Listado de Gastos</div>
        <div class="list-container" id="expenses-list">
          ${state.expenses.length === 0 ? 
            '<div class="text-center my-4">No hay gastos registrados</div>' : 
            renderExpensesListItems(state.expenses)}
        </div>
      </div>
      
      <div id="incomes-content" style="display: none;">
        <div class="card-title">Filtros</div>
        
        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
          <select id="income-month-filter" class="form-control">
            ${generateMonthOptions()}
          </select>
          
          <select id="income-year-filter" class="form-control">
            ${generateYearOptions()}
          </select>
          
          <select id="income-currency-filter" class="form-control">
            <option value="all">Todas las monedas</option>
            <option value="COP">Solo COP</option>
            <option value="USD">Solo USD</option>
          </select>
          
          <button id="apply-income-filter" class="btn btn-primary">Aplicar</button>
        </div>
        
        <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px;">
          <button class="btn" data-income-filter="all">Todos</button>
          <button class="btn" data-income-filter="type-Salario">Salario</button>
          <button class="btn" data-income-filter="type-Freelance">Freelance</button>
          <button class="btn" data-income-filter="type-Inversiones">Inversiones</button>
          <button class="btn" data-income-filter="type-Regalo">Regalo</button>
          <button class="btn" data-income-filter="type-Reembolso">Reembolso</button>
          <button class="btn" data-income-filter="type-Otro">Otro</button>
        </div>
      
        <div class="card-title">Listado de Ingresos</div>
        <div class="list-container" id="incomes-list">
          ${state.incomes.length === 0 ? 
            '<div class="text-center my-4">No hay ingresos registrados</div>' : 
            renderIncomesListItems(state.incomes)}
        </div>
      </div>
    </div>
  `;
  
  // Configurar tabs de gastos e ingresos
  const expensesMainTab = document.getElementById('expenses-main-tab');
  const incomesMainTab = document.getElementById('incomes-main-tab');
  const expensesContent = document.getElementById('expenses-content');
  const incomesContent = document.getElementById('incomes-content');
  const buttonContainer = document.getElementById('expenses-view-button-container');
  
  expensesMainTab.addEventListener('click', () => {
    expensesMainTab.classList.add('active');
    incomesMainTab.classList.remove('active');
    expensesContent.style.display = 'block';
    incomesContent.style.display = 'none';
    
    // Cambiar el botón para agregar gastos
    buttonContainer.innerHTML = `
      <button class="add-button-pretty" id="expenses-view-add-btn">
        <i class="fas fa-plus mr-1"></i> Agregar
      </button>
    `;
    
    // Asignar el evento
    document.getElementById('expenses-view-add-btn').addEventListener('click', showAddExpenseModal);
  });
  
  incomesMainTab.addEventListener('click', () => {
    incomesMainTab.classList.add('active');
    expensesMainTab.classList.remove('active');
    incomesContent.style.display = 'block';
    expensesContent.style.display = 'none';
    
    // Cambiar el botón para agregar ingresos
    buttonContainer.innerHTML = `
      <button class="add-button-pretty green" id="incomes-view-add-btn">
        <i class="fas fa-plus mr-1"></i> Agregar
      </button>
    `;
    
    // Asignar el evento
    document.getElementById('incomes-view-add-btn').addEventListener('click', showAddIncomeModal);
  });
  
  // Configurar eventos de filtro para gastos
  document.getElementById('apply-filter').addEventListener('click', () => {
    const month = document.getElementById('month-filter').value;
    const year = document.getElementById('year-filter').value;
    const currency = document.getElementById('currency-filter').value;
    
    state.currentMonth = parseInt(month);
    state.currentYear = parseInt(year);
    
    fetchExpenses(null, currency).then(() => {
      document.getElementById('expenses-list').innerHTML = 
        state.expenses.length === 0 ? 
        '<div class="text-center my-4">No hay gastos para el período seleccionado</div>' : 
        renderExpensesListItems(state.expenses);
    });
  });
  
  // Configurar eventos de filtro para ingresos
  document.getElementById('apply-income-filter').addEventListener('click', () => {
    const month = document.getElementById('income-month-filter').value;
    const year = document.getElementById('income-year-filter').value;
    const currency = document.getElementById('income-currency-filter').value;
    
    state.currentMonth = parseInt(month);
    state.currentYear = parseInt(year);
    
    fetchIncomes(null, currency).then(() => {
      document.getElementById('incomes-list').innerHTML = 
        state.incomes.length === 0 ? 
        '<div class="text-center my-4">No hay ingresos para el período seleccionado</div>' : 
        renderIncomesListItems(state.incomes);
    });
  });
  
  // Preseleccionar el mes y año actual para gastos e ingresos
  document.getElementById('month-filter').value = state.currentMonth;
  document.getElementById('year-filter').value = state.currentYear;
  document.getElementById('income-month-filter').value = state.currentMonth;
  document.getElementById('income-year-filter').value = state.currentYear;
  
  // Configurar botones de filtro de categoría para gastos
  document.querySelectorAll('button[data-filter]').forEach(button => {
    button.addEventListener('click', async () => {
      const filter = button.dataset.filter;
      
      // Aplicar estilos de selección
      document.querySelectorAll('button[data-filter]').forEach(btn => {
        btn.classList.remove('btn-primary');
      });
      button.classList.add('btn-primary');
      
      const currency = document.getElementById('currency-filter').value;
      
      if (filter === 'all') {
        await fetchExpenses(null, currency);
      } else if (filter.startsWith('category-')) {
        const category = filter.replace('category-', '');
        await fetchExpenses(category, currency);
      }
      
      document.getElementById('expenses-list').innerHTML = 
        state.expenses.length === 0 ? 
        '<div class="text-center my-4">No hay gastos para el filtro seleccionado</div>' : 
        renderExpensesListItems(state.expenses);
    });
  });
  
  // Configurar botones de filtro de tipo para ingresos
  document.querySelectorAll('button[data-income-filter]').forEach(button => {
    button.addEventListener('click', async () => {
      const filter = button.dataset.incomeFilter;
      
      // Aplicar estilos de selección
      document.querySelectorAll('button[data-income-filter]').forEach(btn => {
        btn.classList.remove('btn-primary');
      });
      button.classList.add('btn-primary');
      
      const currency = document.getElementById('income-currency-filter').value;
      
      if (filter === 'all') {
        await fetchIncomes(null, currency);
      } else if (filter.startsWith('type-')) {
        const type = filter.replace('type-', '');
        await fetchIncomes(type, currency);
      }
      
      document.getElementById('incomes-list').innerHTML = 
        state.incomes.length === 0 ? 
        '<div class="text-center my-4">No hay ingresos para el filtro seleccionado</div>' : 
        renderIncomesListItems(state.incomes);
    });
  });
}

// Vista de Cuentas
function renderAccountsView() {
  const viewContainer = document.getElementById('view-container');
  
  // Formateo de datos para la moneda correcta
  const formatAmount = (amount, currency) => {
    return formatMoney(amount, currency);
  };
  
  // Obtener total de balances para todas las cuentas
  let totalBalanceCOP = 0;
  let totalBalanceUSD = 0;
  
  state.accounts.forEach(account => {
    if (account.currency === 'COP') {
      totalBalanceCOP += account.balance;
    } else if (account.currency === 'USD') {
      totalBalanceUSD += account.balance;
    }
  });
  
  viewContainer.innerHTML = `
    <div class="card balance-card">
      <div class="balance-title">Balance Total</div>
      <div class="balance-amount">
        ${state.selectedCurrency === 'USD' ? 
          formatMoney(totalBalanceUSD, 'USD') : 
          formatMoney(totalBalanceCOP, 'COP')}
      </div>
      
      <div class="currency-selector">
        <div class="currency-option ${state.selectedCurrency === 'COP' ? 'active' : ''}" data-currency="COP">COP</div>
        <div class="currency-option ${state.selectedCurrency === 'USD' ? 'active' : ''}" data-currency="USD">USD</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-title">
        Mis Cuentas
        <span style="float: right;">
          <button class="add-button-pretty" id="accounts-view-add-btn">
            <i class="fas fa-plus mr-1"></i> Agregar
          </button>
        </span>
      </div>
      
      ${state.accounts.length === 0 ? 
        `<div class="text-center my-4">No hay cuentas registradas.</div>
         <button class="section-add-btn" id="add-first-account-btn">
           <i class="fas fa-plus mr-2"></i> Agregar cuenta
         </button>` : 
        state.accounts.map(account => `
          <div class="card mb-3">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background-color: ${getAccountColor(account.name)}; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                <i class="fas fa-${getAccountIcon(account.name)}" style="color: white;"></i>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 18px;">${account.name}</div>
                <div style="font-size: 12px; color: #777;">${account.description || 'Sin descripción'}</div>
              </div>
              <div class="account-actions">
                <button class="btn-edit-account" data-id="${account.id}">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete-account" data-id="${account.id}">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <div style="font-size: 24px; font-weight: bold; margin-top: 10px; ${account.balance < 0 ? 'color: var(--danger-color);' : 'color: var(--success-color);'}">
              ${formatAmount(account.balance, account.currency)}
            </div>
          </div>
        `).join('')
      }
    </div>
  `;
  
  // Configurar eventos de editar y eliminar
  document.querySelectorAll('.btn-edit-account').forEach(btn => {
    btn.addEventListener('click', () => {
      const accountId = btn.dataset.id;
      const account = state.accounts.find(acc => acc.id === accountId);
      if (account) {
        showEditAccountModal(account);
      }
    });
  });
  
  document.querySelectorAll('.btn-delete-account').forEach(btn => {
    btn.addEventListener('click', async () => {
      const accountId = btn.dataset.id;
      if (confirm('¿Estás seguro de que deseas eliminar esta cuenta?')) {
        try {
          await deleteAccount(accountId);
          await fetchAccounts();
          renderAccountsView();
        } catch (error) {
          alert(error.message || 'No se pudo eliminar la cuenta. Es posible que tenga gastos asociados.');
        }
      }
    });
  });
}

// Vista de Informes
function renderReportsView() {
  const viewContainer = document.getElementById('view-container');
  
  const currentDate = new Date();
  const currentMonth = state.currentMonth;
  const currentYear = state.currentYear;
  
  // Obtener nombre del mes
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const monthName = monthNames[currentMonth - 1];
  
  // Formatear la tasa de cambio actual
  const exchangeRateFormatted = `$${state.exchangeRate.USD_TO_COP.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} COP`;
  
  // Formatear fecha de actualización
  let lastUpdated = 'Sin datos';
  if (state.exchangeRate.lastUpdated) {
    const date = new Date(state.exchangeRate.lastUpdated);
    lastUpdated = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }
  
  viewContainer.innerHTML = `
    <div class="card">
      <div class="month-selector">
        <button id="prev-month" class="month-nav-btn">
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <div class="month-display">
          <div class="month-name">${monthName}</div>
          <div class="year-display">${currentYear}</div>
          
          <div class="month-dropdown" style="display: none;">
            <div class="month-grid">
              ${monthNames.map((name, index) => `
                <div class="month-item ${(index + 1) === currentMonth ? 'active' : ''}" data-month="${index + 1}">
                  ${name.substring(0, 3)}
                </div>
              `).join('')}
            </div>
            
            <div class="year-selector">
              <button id="prev-year" class="year-nav-btn"><i class="fas fa-chevron-left"></i></button>
              <span id="year-display">${currentYear}</span>
              <button id="next-year" class="year-nav-btn"><i class="fas fa-chevron-right"></i></button>
            </div>
          </div>
        </div>
        
        <button id="next-month" class="month-nav-btn">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
    
    <div class="card">
      <div class="card-title">Tasa de Cambio Actual</div>
      <div style="text-align: center; margin-bottom: 15px;">
        <div style="font-size: 14px; color: #777;">1 USD =</div>
        <div style="font-size: 24px; font-weight: bold; color: var(--primary-color);">
          ${exchangeRateFormatted}
        </div>
        <div style="font-size: 12px; color: #777; margin-top: 5px;">
          Última actualización: ${lastUpdated}
        </div>
      </div>
      <button id="refresh-rate" class="btn btn-primary btn-block">
        <i class="fas fa-sync-alt mr-2"></i> Actualizar Tasa de Cambio
      </button>
    </div>
    
    <div class="card">
      <div class="card-title">Resumen del Mes</div>
      
      <div class="transaction-tabs">
        <button class="tab-btn active" id="expense-summary-tab">Gastos</button>
        <button class="tab-btn" id="income-summary-tab">Ingresos</button>
      </div>
      
      <div id="expense-summary-content">
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <div style="font-size: 14px; color: #777;">Total Gastos</div>
            <div style="font-size: 24px; font-weight: bold; color: var(--danger-color);">
              ${
                state.selectedCurrency === 'USD'
                ? formatMoney(state.summary?.totalExpensesUSD || 0, 'USD')
                : formatMoney(state.summary?.totalExpenses || 0, 'COP')
              }
            </div>
          </div>
          
          <div>
            <div style="font-size: 14px; color: #777;">Transacciones</div>
            <div style="font-size: 24px; font-weight: bold;">
              ${state.summary?.expenseCount || 0}
            </div>
          </div>
        </div>
        <button class="btn btn-primary add-button" id="add-expense-btn">
          <i class="fas fa-plus mr-2"></i> Agregar
        </button>
      </div>
      
      <div id="income-summary-content" style="display: none;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <div style="font-size: 14px; color: #777;">Total Ingresos</div>
            <div style="font-size: 24px; font-weight: bold; color: var(--success-color);">
              ${
                state.selectedCurrency === 'USD'
                ? formatMoney(state.summary?.totalIncomesUSD || 0, 'USD')
                : formatMoney(state.summary?.totalIncomes || 0, 'COP')
              }
            </div>
          </div>
          
          <div>
            <div style="font-size: 14px; color: #777;">Transacciones</div>
            <div style="font-size: 24px; font-weight: bold;">
              ${state.summary?.incomeCount || 0}
            </div>
          </div>
        </div>
        <button class="btn btn-success add-button" id="add-income-btn">
          <i class="fas fa-plus mr-2"></i> Agregar
        </button>
      </div>
      
      <div class="currency-selector" style="margin-bottom: 20px; margin-top: 20px;">
        <div class="currency-option ${state.selectedCurrency === 'COP' ? 'active' : ''}" data-currency="COP">COP</div>
        <div class="currency-option ${state.selectedCurrency === 'USD' ? 'active' : ''}" data-currency="USD">USD</div>
      </div>
    </div>
    
    <div class="card">
      <div class="transaction-tabs">
        <button class="tab-btn active" id="expense-chart-tab">Gastos</button>
        <button class="tab-btn" id="income-chart-tab">Ingresos</button>
      </div>
      
      <div id="expense-chart-content">
        <div class="tab-container">
          <div class="tab-buttons">
            <button class="tab-button active" data-tab="chart-categories">Por Categoría</button>
            <button class="tab-button" data-tab="chart-daily">Por Día</button>
          </div>
          
          <div class="tab-content">
            <div id="chart-categories" class="tab-pane active">
              <div class="chart-container">
                <canvas id="categories-pie-chart"></canvas>
              </div>
            </div>
            
            <div id="chart-daily" class="tab-pane" style="display: none;">
              <div class="chart-container">
                <canvas id="daily-expenses-chart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div id="income-chart-content" style="display: none;">
        <div class="chart-container">
          <canvas id="income-pie-chart"></canvas>
        </div>
      </div>
    </div>
    
    <button id="generate-excel" class="btn btn-primary btn-block mt-4">
      <i class="fas fa-file-excel mr-2"></i> Generar Reporte Excel
    </button>
  `;
  
  // Configurar eventos de navegación de mes
  document.getElementById('prev-month').addEventListener('click', async () => {
    state.currentMonth--;
    if (state.currentMonth < 1) {
      state.currentMonth = 12;
      state.currentYear--;
    }
    
    await fetchSummary();
    renderReportsView();
  });
  
  document.getElementById('next-month').addEventListener('click', async () => {
    state.currentMonth++;
    if (state.currentMonth > 12) {
      state.currentMonth = 1;
      state.currentYear++;
    }
    
    await fetchSummary();
    renderReportsView();
  });
  
  // Configurar el selector de mes dropdown
  const monthDisplay = document.querySelector('.month-display');
  const monthDropdown = document.querySelector('.month-dropdown');
  
  // Mostrar dropdown al hacer clic en el mes
  monthDisplay.addEventListener('click', () => {
    monthDropdown.style.display = monthDropdown.style.display === 'none' ? 'block' : 'none';
  });
  
  // Configurar selección de mes en el grid
  document.querySelectorAll('.month-item').forEach(item => {
    item.addEventListener('click', async () => {
      const month = parseInt(item.dataset.month);
      if (month !== state.currentMonth) {
        state.currentMonth = month;
        await fetchSummary();
        renderReportsView();
      } else {
        monthDropdown.style.display = 'none';
      }
    });
  });
  
  // Configurar botones de navegación del año
  document.getElementById('prev-year').addEventListener('click', async () => {
    state.currentYear--;
    document.getElementById('year-display').textContent = state.currentYear;
    // No cerramos el dropdown para permitir seleccionar un mes del año anterior
  });
  
  document.getElementById('next-year').addEventListener('click', async () => {
    state.currentYear++;
    document.getElementById('year-display').textContent = state.currentYear;
    // No cerramos el dropdown para permitir seleccionar un mes del año siguiente
  });
  
  // Cerrar dropdown cuando se hace clic fuera de él
  document.addEventListener('click', (e) => {
    if (monthDropdown.style.display === 'block' && 
        !monthDisplay.contains(e.target) && 
        !monthDropdown.contains(e.target)) {
      monthDropdown.style.display = 'none';
    }
  });
  
  // Configurar evento para actualizar tasa de cambio
  document.getElementById('refresh-rate').addEventListener('click', async () => {
    const button = document.getElementById('refresh-rate');
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Actualizando...';
    
    try {
      await fetchExchangeRate();
      renderReportsView();
    } catch (error) {
      console.error('Error al actualizar tasa de cambio:', error);
      alert('Error al actualizar tasa de cambio. Intente de nuevo más tarde.');
    } finally {
      button.disabled = false;
    }
  });
  
  // Configurar navegación de tabs
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      
      // Actualizar botones
      document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
      });
      button.classList.add('active');
      
      // Actualizar paneles
      document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.style.display = 'none';
      });
      document.getElementById(tabId).style.display = 'block';
      
      // Renderizar gráfico correspondiente
      if (tabId === 'chart-categories') {
        renderCategoriesPieChart();
      } else if (tabId === 'chart-daily') {
        renderDailyExpensesChart();
      }
    });
  });
  
  // Configurar evento de generar Excel
  document.getElementById('generate-excel').addEventListener('click', () => {
    generateExcelReport();
  });
  
  // Configurar tabs de gastos e ingresos
  const expenseChartTab = document.getElementById('expense-chart-tab');
  const incomeChartTab = document.getElementById('income-chart-tab');
  const expenseChartContent = document.getElementById('expense-chart-content');
  const incomeChartContent = document.getElementById('income-chart-content');
  
  if (expenseChartTab && incomeChartTab) {
    expenseChartTab.addEventListener('click', () => {
      expenseChartTab.classList.add('active');
      incomeChartTab.classList.remove('active');
      expenseChartContent.style.display = 'block';
      incomeChartContent.style.display = 'none';
    });
    
    incomeChartTab.addEventListener('click', () => {
      incomeChartTab.classList.add('active');
      expenseChartTab.classList.remove('active');
      incomeChartContent.style.display = 'block';
      expenseChartContent.style.display = 'none';
    });
  }
  
  // Inicializar gráficos
  setTimeout(() => {
    renderCategoriesPieChart();
    renderIncomesPieChart();
  }, 100);
}

// COMPONENTES REUTILIZABLES

// Renderizar lista de cuentas
function renderAccountsListItems(accounts) {
  if (!accounts || accounts.length === 0) {
    return '<div class="text-center my-4">No hay cuentas disponibles</div>';
  }
  
  return accounts.map(account => `
    <div class="list-item">
      <div class="item-icon" style="background-color: ${getAccountColor(account.name)}">
        <i class="fas fa-${getAccountIcon(account.name)}"></i>
      </div>
      <div class="item-details">
        <div class="item-title">${account.name}</div>
        <div class="item-subtitle">${account.description || 'Sin descripción'}</div>
      </div>
      <div class="item-amount ${account.balance >= 0 ? 'amount-positive' : 'amount-negative'}">
        ${formatMoney(account.balance, account.currency)}
      </div>
    </div>
  `).join('');
}

// Renderizar lista de gastos
function renderExpensesListItems(expenses) {
  if (!expenses || expenses.length === 0) {
    return '<div class="text-center my-4">No hay gastos disponibles</div>';
  }
  
  return expenses.map(expense => {
    const account = state.accounts.find(acc => acc.id === expense.accountId);
    const accountName = account ? account.name : 'Sin cuenta';
    
    return `
      <div class="list-item expense-item" data-id="${expense.id}">
        <div class="item-icon" style="background-color: ${getCategoryColor(expense.category)}">
          <i class="fas fa-${getCategoryIcon(expense.category)}"></i>
        </div>
        <div class="item-details">
          <div class="item-title">${expense.category}</div>
          <div class="item-subtitle">
            ${new Date(expense.date).toLocaleDateString()} · ${accountName}
          </div>
          <div class="item-description">${expense.description || ''}</div>
        </div>
        <div class="item-amount amount-negative">
          ${formatMoney(expense.amount, expense.currency)}
        </div>
      </div>
    `;
  }).join('');
}

// Renderizar elementos de la lista de ingresos
function renderIncomesListItems(incomes) {
  if (!incomes || incomes.length === 0) {
    return '<div class="text-center my-4">No hay ingresos disponibles</div>';
  }
  
  return incomes.map(income => {
    const account = state.accounts.find(acc => acc.id === income.accountId);
    const accountName = account ? account.name : 'Sin cuenta';
    
    return `
      <div class="list-item income-item" data-id="${income.id}">
        <div class="item-icon" style="background-color: ${getIncomeTypeColor(income.type)}">
          <i class="fas fa-${getIncomeTypeIcon(income.type)}"></i>
        </div>
        <div class="item-details">
          <div class="item-title">${income.type}</div>
          <div class="item-subtitle">
            ${new Date(income.date).toLocaleDateString()} · ${accountName}
          </div>
          <div class="item-description">${income.description || ''}</div>
        </div>
        <div class="item-amount amount-positive">
          +${formatMoney(income.amount, income.currency)}
        </div>
      </div>
    `;
  }).join('');
}

// Modal para agregar gasto
function showAddExpenseModal() {
  const modalContainer = document.getElementById('modal-container');
  
  modalContainer.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Agregar Gasto</h2>
          <button class="modal-close" id="close-modal">&times;</button>
        </div>
        
        <div class="modal-body">
          <form id="add-expense-form">
            <div class="form-group">
              <label class="form-label" for="expense-amount">Monto</label>
              <input type="number" id="expense-amount" class="form-control" placeholder="0.00" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">Moneda</label>
              <div style="display: flex; gap: 10px;">
                <label style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; text-align: center;">
                  <input type="radio" name="expense-currency" value="COP" checked style="margin-right: 5px;">
                  COP
                </label>
                <label style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; text-align: center;">
                  <input type="radio" name="expense-currency" value="USD" style="margin-right: 5px;">
                  USD
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="expense-date">Fecha</label>
              <input type="date" id="expense-date" class="form-control" required>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="expense-category">Categoría</label>
              <select id="expense-category" class="form-control form-select" required>
                <option value="">Seleccionar categoría</option>
                ${CATEGORIES.map(category => `<option value="${category}">${category}</option>`).join('')}
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="expense-account">Cuenta</label>
              <select id="expense-account" class="form-control form-select">
                <option value="">Sin cuenta asociada</option>
                ${state.accounts.map(account => `<option value="${account.id}">${account.name} (${formatMoney(account.balance, account.currency)})</option>`).join('')}
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="expense-description">Descripción (opcional)</label>
              <input type="text" id="expense-description" class="form-control" placeholder="Descripción del gasto">
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button class="btn" id="cancel-expense">Cancelar</button>
          <button class="btn btn-primary" id="save-expense">Guardar</button>
        </div>
      </div>
    </div>
  `;
  
  // Configurar fecha actual por defecto
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('expense-date').value = today;
  
  // Configurar eventos de botones
  document.getElementById('close-modal').addEventListener('click', closeAllModals);
  document.getElementById('cancel-expense').addEventListener('click', closeAllModals);
  
  document.getElementById('save-expense').addEventListener('click', async () => {
    const amount = document.getElementById('expense-amount').value;
    const currency = document.querySelector('input[name="expense-currency"]:checked').value;
    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;
    const accountId = document.getElementById('expense-account').value || null;
    const description = document.getElementById('expense-description').value;
    
    if (!amount || !date || !category) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }
    
    try {
      await addExpense({
        amount: parseFloat(amount),
        currency,
        date,
        category,
        accountId,
        description
      });
      
      closeAllModals();
      await fetchExpenses();
      await fetchAccounts();
      await fetchSummary();
      renderCurrentView();
    } catch (error) {
      alert('Error al agregar el gasto: ' + error.message);
    }
  });
}

// Modal para agregar cuenta
function showAddAccountModal() {
  const modalContainer = document.getElementById('modal-container');
  
  modalContainer.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Agregar Cuenta</h2>
          <button class="modal-close" id="close-modal">&times;</button>
        </div>
        
        <div class="modal-body">
          <form id="add-account-form">
            <div class="form-group">
              <label class="form-label" for="account-name">Nombre de la Cuenta</label>
              <input type="text" id="account-name" class="form-control" placeholder="ej. Cuenta Corriente" required>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="account-balance">Saldo Inicial</label>
              <input type="number" id="account-balance" class="form-control" placeholder="0.00" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">Moneda</label>
              <div style="display: flex; gap: 10px;">
                <label style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; text-align: center;">
                  <input type="radio" name="account-currency" value="COP" checked style="margin-right: 5px;">
                  COP
                </label>
                <label style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; text-align: center;">
                  <input type="radio" name="account-currency" value="USD" style="margin-right: 5px;">
                  USD
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="account-description">Descripción (opcional)</label>
              <input type="text" id="account-description" class="form-control" placeholder="Descripción de la cuenta">
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button class="btn" id="cancel-account">Cancelar</button>
          <button class="btn btn-primary" id="save-account">Guardar</button>
        </div>
      </div>
    </div>
  `;
  
  // Configurar eventos de botones
  document.getElementById('close-modal').addEventListener('click', closeAllModals);
  document.getElementById('cancel-account').addEventListener('click', closeAllModals);
  
  document.getElementById('save-account').addEventListener('click', async () => {
    const name = document.getElementById('account-name').value;
    const balance = document.getElementById('account-balance').value;
    const currency = document.querySelector('input[name="account-currency"]:checked').value;
    const description = document.getElementById('account-description').value;
    
    if (!name || balance === '') {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }
    
    try {
      await addAccount({
        name,
        balance: parseFloat(balance),
        currency,
        description
      });
      
      closeAllModals();
      await fetchAccounts();
      renderCurrentView();
    } catch (error) {
      alert('Error al agregar la cuenta: ' + error.message);
    }
  });
}

// Modal para agregar ingreso
function showAddIncomeModal() {
  const modalContainer = document.getElementById('modal-container');
  
  modalContainer.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Agregar Ingreso</h2>
          <button class="modal-close" id="close-modal">&times;</button>
        </div>
        
        <div class="modal-body">
          <form id="add-income-form">
            <div class="form-group">
              <label class="form-label" for="income-amount">Monto</label>
              <input type="number" id="income-amount" class="form-control" placeholder="0.00" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">Moneda</label>
              <div style="display: flex; gap: 10px;">
                <label style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; text-align: center;">
                  <input type="radio" name="income-currency" value="COP" checked style="margin-right: 5px;">
                  COP
                </label>
                <label style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; text-align: center;">
                  <input type="radio" name="income-currency" value="USD" style="margin-right: 5px;">
                  USD
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="income-date">Fecha</label>
              <input type="date" id="income-date" class="form-control" required>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="income-type">Tipo de Ingreso</label>
              <select id="income-type" class="form-control form-select" required>
                <option value="">Seleccionar tipo</option>
                ${INCOME_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="income-account">Cuenta</label>
              <select id="income-account" class="form-control form-select">
                <option value="">Sin cuenta asociada</option>
                ${state.accounts.map(account => `<option value="${account.id}">${account.name} (${formatMoney(account.balance, account.currency)})</option>`).join('')}
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="income-description">Descripción (opcional)</label>
              <input type="text" id="income-description" class="form-control" placeholder="Descripción del ingreso">
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button class="btn" id="cancel-income">Cancelar</button>
          <button class="btn btn-success" id="save-income">Guardar</button>
        </div>
      </div>
    </div>
  `;
  
  // Configurar fecha actual por defecto
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('income-date').value = today;
  
  // Configurar eventos de botones
  document.getElementById('close-modal').addEventListener('click', closeAllModals);
  document.getElementById('cancel-income').addEventListener('click', closeAllModals);
  
  document.getElementById('save-income').addEventListener('click', async () => {
    const amount = document.getElementById('income-amount').value;
    const currency = document.querySelector('input[name="income-currency"]:checked').value;
    const date = document.getElementById('income-date').value;
    const type = document.getElementById('income-type').value;
    const accountId = document.getElementById('income-account').value || null;
    const description = document.getElementById('income-description').value;
    
    if (!amount || !date || !type) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }
    
    try {
      await addIncome({
        amount: parseFloat(amount),
        currency,
        date,
        type,
        accountId,
        description
      });
      
      closeAllModals();
      await fetchIncomes();
      await fetchAccounts();
      await fetchSummary();
      renderCurrentView();
    } catch (error) {
      alert('Error al agregar el ingreso: ' + error.message);
    }
  });
}

// Modal para editar cuenta
function showEditAccountModal(account) {
  const modalContainer = document.getElementById('modal-container');
  
  modalContainer.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Editar Cuenta</h2>
          <button class="modal-close" id="close-modal">&times;</button>
        </div>
        
        <div class="modal-body">
          <form id="edit-account-form">
            <div class="form-group">
              <label class="form-label" for="account-name">Nombre de la Cuenta</label>
              <input type="text" id="account-name" class="form-control" value="${account.name}" required>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="account-balance">Saldo</label>
              <input type="number" id="account-balance" class="form-control" value="${account.balance}" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">Moneda</label>
              <div style="display: flex; gap: 10px;">
                <label style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; text-align: center;">
                  <input type="radio" name="account-currency" value="COP" ${account.currency === 'COP' ? 'checked' : ''} style="margin-right: 5px;">
                  COP
                </label>
                <label style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; text-align: center;">
                  <input type="radio" name="account-currency" value="USD" ${account.currency === 'USD' ? 'checked' : ''} style="margin-right: 5px;">
                  USD
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="account-description">Descripción (opcional)</label>
              <input type="text" id="account-description" class="form-control" value="${account.description || ''}">
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button class="btn" id="cancel-account">Cancelar</button>
          <button class="btn btn-primary" id="save-account">Guardar</button>
        </div>
      </div>
    </div>
  `;
  
  // Configurar eventos de botones
  document.getElementById('close-modal').addEventListener('click', closeAllModals);
  document.getElementById('cancel-account').addEventListener('click', closeAllModals);
  
  document.getElementById('save-account').addEventListener('click', async () => {
    const name = document.getElementById('account-name').value;
    const balance = document.getElementById('account-balance').value;
    const currency = document.querySelector('input[name="account-currency"]:checked').value;
    const description = document.getElementById('account-description').value;
    
    if (!name || balance === '') {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }
    
    try {
      await updateAccount(account.id, {
        name,
        balance: parseFloat(balance),
        currency,
        description
      });
      
      closeAllModals();
      await fetchAccounts();
      renderCurrentView();
    } catch (error) {
      alert('Error al actualizar la cuenta: ' + error.message);
    }
  });
}

// Cerrar todos los modales
function closeAllModals() {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = '';
}

// GRÁFICOS

// Gráfico de categorías (Dashboard)
function renderCategoriesChart() {
  const canvas = document.getElementById('categories-chart');
  if (!canvas) return;
  
  if (!state.summary) {
    return;
  }
  
  const expensesByCategory = state.summary.expensesByCategory;
  if (!expensesByCategory || Object.keys(expensesByCategory).length === 0) {
    return;
  }
  
  const categories = Object.keys(expensesByCategory);
  const amounts = Object.values(expensesByCategory);
  
  // Convertir montos a la moneda seleccionada usando tasa de cambio actualizada
  const convertedAmounts = amounts.map(amount => {
    if (state.selectedCurrency === 'USD') {
      return amount * state.exchangeRate.COP_TO_USD; // COP a USD con tasa actualizada
    }
    return amount;
  });
  
  const backgroundColors = categories.map(category => getCategoryColor(category));
  
  // Crear gráfico
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{
        data: convertedAmounts,
        backgroundColor: backgroundColors,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: ${formatMoney(value, state.selectedCurrency)}`;
            }
          }
        }
      }
    }
  });
}

// Función para renderizar el gráfico de ingresos por tipo
function renderIncomeTypesChart() {
  const canvas = document.getElementById('income-types-chart');
  if (!canvas) return;
  
  // Verificar si hay datos
  if (!state.incomes || state.incomes.length === 0) {
    canvas.parentNode.innerHTML = '<div class="text-center my-4">No hay datos de ingresos para mostrar</div>';
    return;
  }
  
  // Agrupar ingresos por tipo
  const incomeByType = {};
  
  state.incomes.forEach(income => {
    if (!incomeByType[income.type]) {
      incomeByType[income.type] = 0;
    }
    
    // Convertir a la moneda seleccionada si es necesario
    let amount = income.amount;
    if (income.currency !== state.selectedCurrency) {
      if (state.selectedCurrency === 'USD' && income.currency === 'COP') {
        amount = amount * state.exchangeRate.COP_TO_USD;
      } else if (state.selectedCurrency === 'COP' && income.currency === 'USD') {
        amount = amount * state.exchangeRate.USD_TO_COP;
      }
    }
    
    incomeByType[income.type] += amount;
  });
  
  const types = Object.keys(incomeByType);
  const amounts = Object.values(incomeByType);
  const backgroundColors = types.map(type => getIncomeTypeColor(type));
  
  // Crear gráfico
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: types,
      datasets: [{
        data: amounts,
        backgroundColor: backgroundColors,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: ${formatMoney(value, state.selectedCurrency)}`;
            }
          }
        }
      }
    }
  });
}

// Gráfico de pastel para categorías (Informes)
function renderCategoriesPieChart() {
  const canvas = document.getElementById('categories-pie-chart');
  if (!canvas) return;
  
  if (!state.summary) {
    return;
  }
  
  const expensesByCategory = state.summary.expensesByCategory;
  if (!expensesByCategory || Object.keys(expensesByCategory).length === 0) {
    return;
  }
  
  const categories = Object.keys(expensesByCategory);
  const amounts = Object.values(expensesByCategory);
  
  // Usar los datos en la moneda correcta
  const expensesByCategoryUSD = state.summary.expensesByCategoryUSD || {};
  
  // Obtener los valores según la moneda seleccionada
  const convertedAmounts = state.selectedCurrency === 'USD' 
    ? categories.map(category => expensesByCategoryUSD[category] || 0)
    : amounts;
  
  const backgroundColors = categories.map(category => getCategoryColor(category));
  
  // Crear gráfico
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{
        data: convertedAmounts,
        backgroundColor: backgroundColors,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: ${formatMoney(value, state.selectedCurrency)}`;
            }
          }
        }
      }
    }
  });
}

// Gráfico de ingresos por tipo para informes
function renderIncomesPieChart() {
  const canvas = document.getElementById('income-pie-chart');
  if (!canvas) return;
  
  // Verificar si hay datos
  if (!state.incomes || state.incomes.length === 0) {
    canvas.parentNode.innerHTML = '<div class="text-center my-4">No hay datos de ingresos para mostrar</div>';
    return;
  }
  
  // Agrupar ingresos por tipo
  const incomeByType = {};
  let totalAmount = 0;
  
  state.incomes.forEach(income => {
    if (!incomeByType[income.type]) {
      incomeByType[income.type] = 0;
    }
    
    // Convertir a la moneda seleccionada si es necesario
    let amount = income.amount;
    if (income.currency !== state.selectedCurrency) {
      if (state.selectedCurrency === 'USD' && income.currency === 'COP') {
        amount = amount * state.exchangeRate.COP_TO_USD;
      } else if (state.selectedCurrency === 'COP' && income.currency === 'USD') {
        amount = amount * state.exchangeRate.USD_TO_COP;
      }
    }
    
    incomeByType[income.type] += amount;
    totalAmount += amount;
  });
  
  const types = Object.keys(incomeByType);
  const amounts = Object.values(incomeByType);
  const backgroundColors = types.map(type => getIncomeTypeColor(type));
  
  // Crear gráfico
  if (window.incomePieChart) {
    window.incomePieChart.destroy();
  }
  
  const ctx = canvas.getContext('2d');
  window.incomePieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: types,
      datasets: [{
        data: amounts,
        backgroundColor: backgroundColors,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const percentage = Math.round((value / totalAmount) * 100);
              return `${label}: ${formatMoney(value, state.selectedCurrency)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Gráfico de barras para gastos diarios (Informes)
function renderDailyExpensesChart() {
  const canvas = document.getElementById('daily-expenses-chart');
  if (!canvas) return;
  
  if (!state.summary) {
    return;
  }
  
  const expensesByDay = state.summary.expensesByDay;
  if (!expensesByDay || Object.keys(expensesByDay).length === 0) {
    return;
  }
  
  // Obtener días del mes actual
  const daysInMonth = new Date(state.currentYear, state.currentMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Obtener gastos diarios en USD si existen
  const expensesByDayUSD = state.summary.expensesByDayUSD || {};
  
  // Preparar datos para gráfico según la moneda seleccionada
  const expensesData = days.map(day => {
    if (state.selectedCurrency === 'USD') {
      return expensesByDayUSD[day] || 0;
    } else {
      return expensesByDay[day] || 0;
    }
  });
  
  // Crear gráfico
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [{
        label: 'Gastos por día',
        data: expensesData,
        backgroundColor: 'rgba(0, 71, 255, 0.6)',
        borderColor: 'rgba(0, 71, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatMoney(value, state.selectedCurrency, true);
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw || 0;
              return `${formatMoney(value, state.selectedCurrency)}`;
            }
          }
        }
      }
    }
  });
}

// FUNCIONES DE API

// Obtener tasa de cambio actualizada
async function fetchExchangeRate() {
  try {
    state.loading = true;
    
    // Primero intenta obtener las tasas de cambio desde IndexedDB
    const dbStorage = new IndexedDBStorage();
    const storedRates = await dbStorage.getExchangeRate();
    
    if (storedRates) {
      // Si existen tasas almacenadas localmente, úsalas
      state.exchangeRate = storedRates;
      console.log('Tasa de cambio cargada desde almacenamiento local:', state.exchangeRate);
      
      // Si estamos online, verifica si necesitamos actualizar (más de 24 horas)
      if (state.isOnline && storedRates.lastUpdated) {
        const lastUpdated = new Date(storedRates.lastUpdated);
        const now = new Date();
        const hoursSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60);
        
        // Si han pasado más de 24 horas, actualiza en segundo plano
        if (hoursSinceUpdate > 24) {
          updateExchangeRateFromServer();
        }
      }
    } else if (state.isOnline) {
      // Si no hay datos locales y estamos online, obtén del servidor
      await updateExchangeRateFromServer();
    } else {
      // Sin conexión y sin datos locales, usa valores predeterminados
      state.exchangeRate = {
        USD_TO_COP: 4234.19,
        COP_TO_USD: 1 / 4234.19,
        lastUpdated: new Date().toISOString()
      };
      console.warn('Sin conexión: usando tasas de cambio predeterminadas');
    }
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    // Usa valores predeterminados en caso de error
    state.exchangeRate = {
      USD_TO_COP: 4234.19,
      COP_TO_USD: 1 / 4234.19,
      lastUpdated: new Date().toISOString()
    };
  } finally {
    state.loading = false;
  }
}

// Función auxiliar para actualizar tasas de cambio desde el servidor
async function updateExchangeRateFromServer() {
  try {
    const response = await fetch('/api/exchange-rate');
    if (!response.ok) {
      throw new Error('Error al cargar tasa de cambio desde el servidor');
    }
    
    const exchangeRateData = await response.json();
    
    state.exchangeRate = {
      USD_TO_COP: exchangeRateData.USD_TO_COP,
      COP_TO_USD: exchangeRateData.COP_TO_USD,
      lastUpdated: new Date().toISOString()
    };
    
    // Guardar en IndexedDB
    const dbStorage = new IndexedDBStorage();
    await dbStorage.saveExchangeRate(state.exchangeRate);
    
    console.log('Tasa de cambio actualizada desde el servidor:', state.exchangeRate);
  } catch (error) {
    console.error('Error al actualizar tasa de cambio desde el servidor:', error);
    throw error;
  }
}

// Obtener cuentas
async function fetchAccounts() {
  try {
    state.loading = true;
    
    const response = await fetch('/api/accounts');
    if (!response.ok) {
      throw new Error('Error al cargar cuentas');
    }
    
    state.accounts = await response.json();
  } catch (error) {
    console.error('Error fetching accounts:', error);
  } finally {
    state.loading = false;
  }
}

// Obtener gastos
async function fetchExpenses(category = null, currency = null) {
  try {
    state.loading = true;
    
    let url = `/api/expenses?month=${state.currentMonth}&year=${state.currentYear}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error al cargar gastos');
    }
    
    let expenses = await response.json();
    
    // Filtrar por moneda si se especifica
    if (currency && currency !== 'all') {
      expenses = expenses.filter(expense => expense.currency === currency);
    }
    
    state.expenses = expenses;
  } catch (error) {
    console.error('Error fetching expenses:', error);
  } finally {
    state.loading = false;
  }
}

// Obtener ingresos
async function fetchIncomes(type = null, currency = null) {
  try {
    state.loading = true;
    
    let url = `/api/incomes?month=${state.currentMonth}&year=${state.currentYear}`;
    if (type) {
      url += `&type=${encodeURIComponent(type)}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error al cargar ingresos');
    }
    
    let incomes = await response.json();
    
    // Filtrar por moneda si se especifica
    if (currency && currency !== 'all') {
      incomes = incomes.filter(income => income.currency === currency);
    }
    
    state.incomes = incomes;
  } catch (error) {
    console.error('Error fetching incomes:', error);
  } finally {
    state.loading = false;
  }
}

// Obtener resumen mensual
async function fetchSummary() {
  try {
    state.loading = true;
    
    const response = await fetch(`/api/summary?month=${state.currentMonth}&year=${state.currentYear}`);
    if (!response.ok) {
      throw new Error('Error al cargar resumen');
    }
    
    const summaryData = await response.json();
    
    // Calcular el total real considerando ambas monedas para gastos
    let totalExpensesCOP = 0;
    let totalExpensesUSD = 0;
    
    // Calcular el total real considerando ambas monedas para ingresos
    let totalIncomesCOP = 0;
    let totalIncomesUSD = 0;
    
    // Obtenemos todos los gastos del mes
    const expensesResponse = await fetch(`/api/expenses?month=${state.currentMonth}&year=${state.currentYear}`);
    if (expensesResponse.ok) {
      const expenses = await expensesResponse.json();
      
      // Calculamos los totales en cada moneda
      expenses.forEach(expense => {
        if (expense.currency === 'COP') {
          totalExpensesCOP += expense.amount;
        } else if (expense.currency === 'USD') {
          totalExpensesUSD += expense.amount;
          // También sumamos el equivalente en COP
          totalExpensesCOP += expense.amount * state.exchangeRate.USD_TO_COP;
        }
      });
    }
    
    // Obtenemos todos los ingresos del mes
    const incomesResponse = await fetch(`/api/incomes?month=${state.currentMonth}&year=${state.currentYear}`);
    if (incomesResponse.ok) {
      const incomes = await incomesResponse.json();
      
      // Calculamos los totales en cada moneda para ingresos
      incomes.forEach(income => {
        if (income.currency === 'COP') {
          totalIncomesCOP += income.amount;
        } else if (income.currency === 'USD') {
          totalIncomesUSD += income.amount;
          // También sumamos el equivalente en COP
          totalIncomesCOP += income.amount * state.exchangeRate.USD_TO_COP;
        }
      });
    }
    
    // Actualizamos el resumen con los nuevos valores para gastos
    summaryData.totalExpenses = totalExpensesCOP;
    summaryData.totalExpensesUSD = totalExpensesUSD;
    
    // Actualizamos el resumen con los nuevos valores para ingresos
    summaryData.totalIncomes = totalIncomesCOP;
    summaryData.totalIncomesUSD = totalIncomesUSD;
    summaryData.incomeCount = state.incomes.length;
    
    state.summary = summaryData;
  } catch (error) {
    console.error('Error fetching summary:', error);
  } finally {
    state.loading = false;
  }
}

// Agregar cuenta
async function addAccount(accountData) {
  const response = await fetch('/api/accounts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(accountData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear cuenta');
  }
  
  return response.json();
}

// Actualizar cuenta
async function updateAccount(id, accountData) {
  const response = await fetch(`/api/accounts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(accountData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar cuenta');
  }
  
  return response.json();
}

// Eliminar cuenta
async function deleteAccount(id) {
  const response = await fetch(`/api/accounts/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar cuenta');
  }
  
  return true;
}

// Agregar gasto
async function addExpense(expenseData) {
  const response = await fetch('/api/expenses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(expenseData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear gasto');
  }
  
  return response.json();
}

// Actualizar gasto
async function updateExpense(id, expenseData) {
  const response = await fetch(`/api/expenses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(expenseData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar gasto');
  }
  
  return response.json();
}

// Eliminar gasto
async function deleteExpense(id) {
  const response = await fetch(`/api/expenses/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar gasto');
  }
  
  return true;
}

// Agregar ingreso
async function addIncome(incomeData) {
  const response = await fetch('/api/incomes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(incomeData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear ingreso');
  }
  
  return response.json();
}

// Actualizar ingreso
async function updateIncome(id, incomeData) {
  const response = await fetch(`/api/incomes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(incomeData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar ingreso');
  }
  
  return response.json();
}

// Eliminar ingreso
async function deleteIncome(id) {
  const response = await fetch(`/api/incomes/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar ingreso');
  }
  
  return true;
}

// Generar reporte Excel
function generateExcelReport() {
  const url = `/api/export/excel?month=${state.currentMonth}&year=${state.currentYear}`;
  window.location.href = url;
}

// FUNCIONES DE UTILIDAD

// Cambiar moneda seleccionada
function changeCurrency(currency) {
  if (currency !== state.selectedCurrency) {
    state.selectedCurrency = currency;
    updateUI();
  }
}

// Actualizar UI tras cambios
function updateUI() {
  renderCurrentView();
}

// Formatear moneda
function formatMoney(amount, currency, simplified = false) {
  if (currency === 'USD') {
    // Para la versión simplificada (gráficos)
    if (simplified) {
      if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M USD`;
      } else if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(0)}k USD`;
      } else {
        return `$${amount.toFixed(0)} USD`;
      }
    }
    // Versión completa con separadores de miles para USD
    return `$${parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    })} USD`;
  } else {
    // Para la versión simplificada (gráficos)
    if (simplified) {
      if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M COP`;
      } else if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(0)}k COP`;
      } else {
        return `$${Math.round(amount)} COP`;
      }
    }
    // Versión completa con formato adecuado para números grandes
    return `$${Math.round(amount).toLocaleString('es-CO', {
      maximumFractionDigits: 0,
      useGrouping: true
    })} COP`;
  }
}

// Generar opciones de mes para selects
function generateMonthOptions() {
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
  
  return months.map(month => 
    `<option value="${month.value}">${month.label}</option>`
  ).join('');
}

// Generar opciones de año para selects
function generateYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];
  
  return years.map(year => 
    `<option value="${year}">${year}</option>`
  ).join('');
}

// Obtener color para categoría
function getCategoryColor(category) {
  const colors = {
    'Alimentación': '#FF9500',
    'Vivienda': '#34C759',
    'Transporte': '#007AFF',
    'Servicios': '#5856D6',
    'Salud': '#FF2D55',
    'Entretenimiento': '#AF52DE',
    'Educación': '#5AC8FA',
    'Otros': '#8E8E93'
  };
  
  return colors[category] || '#8E8E93';
}

// Obtener ícono para categoría
function getCategoryIcon(category) {
  const icons = {
    'Alimentación': 'utensils',
    'Vivienda': 'home',
    'Transporte': 'car',
    'Servicios': 'bolt',
    'Salud': 'heartbeat',
    'Entretenimiento': 'film',
    'Educación': 'graduation-cap',
    'Otros': 'shopping-bag'
  };
  
  return icons[category] || 'tag';
}

// Obtener color para cuenta
function getAccountColor(accountName) {
  if (accountName.toLowerCase().includes('ahorro')) {
    return '#34C759'; // Verde
  } else if (accountName.toLowerCase().includes('invers')) {
    return '#AF52DE'; // Púrpura
  } else if (accountName.toLowerCase().includes('corriente')) {
    return '#007AFF'; // Azul
  } else {
    return '#FF9500'; // Naranja
  }
}

// Obtener ícono para cuenta
function getAccountIcon(accountName) {
  if (accountName.toLowerCase().includes('ahorro')) {
    return 'piggy-bank';
  } else if (accountName.toLowerCase().includes('invers')) {
    return 'chart-line';
  } else if (accountName.toLowerCase().includes('corriente')) {
    return 'wallet';
  } else {
    return 'credit-card';
  }
}

// Obtener color para tipo de ingreso
function getIncomeTypeColor(type) {
  const colors = {
    'Salario': '#34C759',        // Verde
    'Freelance': '#5AC8FA',      // Azul claro
    'Inversiones': '#AF52DE',    // Púrpura
    'Regalo': '#FF9500',         // Naranja
    'Reembolso': '#007AFF',      // Azul
    'Otro': '#8E8E93'            // Gris
  };
  
  return colors[type] || '#8E8E93';
}

// Obtener ícono para tipo de ingreso
function getIncomeTypeIcon(type) {
  const icons = {
    'Salario': 'money-check-alt',
    'Freelance': 'laptop-code',
    'Inversiones': 'chart-line',
    'Regalo': 'gift',
    'Reembolso': 'undo',
    'Otro': 'hand-holding-usd'
  };
  
  return icons[type] || 'hand-holding-usd';
}

// Cargar Chart.js para los gráficos
(function loadChartJS() {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
  document.head.appendChild(script);
})();
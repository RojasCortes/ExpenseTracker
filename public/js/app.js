/**
 * Financial Tracker App
 * Versión: 1.0.0
 * 
 * Aplicación web progresiva para el seguimiento de finanzas personales
 * Funciona en Android, iOS y navegadores web
 */

// Estado global de la aplicación
const state = {
  currentView: 'dashboard',
  accounts: [],
  expenses: [],
  summary: null,
  selectedCurrency: 'COP',
  currentMonth: new Date().getMonth() + 1,
  currentYear: new Date().getFullYear(),
  loading: false,
  modals: {
    addExpense: false,
    addAccount: false
  }
};

// Constantes de la aplicación
const CATEGORIES = [
  'Alimentación',
  'Vivienda',
  'Transporte',
  'Servicios',
  'Salud',
  'Entretenimiento',
  'Educación',
  'Otros'
];

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
  initApp();
});

// Función principal de inicialización
async function initApp() {
  renderApp();
  setupEventListeners();
  
  // Cargar datos iniciales
  await fetchAccounts();
  await fetchExpenses();
  await fetchSummary();
  
  updateUI();
}

// Renderiza la estructura básica de la aplicación
function renderApp() {
  const appEl = document.getElementById('app');
  
  appEl.innerHTML = `
    <div class="app-container">
      <nav class="navbar">
        <div class="navbar-title">Financial Tracker</div>
        <button id="theme-toggle" aria-label="Cambiar tema">
          <i class="fas fa-moon"></i>
        </button>
      </nav>
      
      <main class="main-content">
        <div id="view-container"></div>
      </main>
      
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
      
      <button id="add-button" class="fab">
        <i class="fas fa-plus"></i>
      </button>
      
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
  
  // Botón de agregar (FAB)
  document.getElementById('add-button').addEventListener('click', () => {
    if (state.currentView === 'expenses') {
      showAddExpenseModal();
    } else if (state.currentView === 'accounts') {
      showAddAccountModal();
    }
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
  
  // Mostrar u ocultar FAB según la vista
  const addButton = document.getElementById('add-button');
  if (view === 'expenses' || view === 'accounts') {
    addButton.style.display = 'flex';
  } else {
    addButton.style.display = 'none';
  }
  
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
      const usdAmount = amount / 4000; // Convertir de COP a USD
      return `$${usdAmount.toFixed(2)}`;
    } else {
      return `$${Math.round(amount).toLocaleString('es-CO')}`;
    }
  };
  
  // Obtener total de balances en la moneda seleccionada
  let totalBalance = 0;
  state.accounts.forEach(account => {
    let accountBalance = account.balance;
    if (account.currency !== state.selectedCurrency) {
      accountBalance = state.selectedCurrency === 'USD' ? 
        accountBalance * 0.00025 : // COP a USD
        accountBalance * 4000;     // USD a COP
    }
    totalBalance += accountBalance;
  });
  
  // Calcular el total de gastos en la moneda seleccionada
  let totalExpenses = state.summary.totalExpenses;
  if (state.selectedCurrency === 'USD') {
    totalExpenses = totalExpenses * 0.00025; // Convertir de COP a USD
  }
  
  // Construir el HTML
  viewContainer.innerHTML = `
    <div class="card balance-card">
      <div class="balance-title">Balance Total</div>
      <div class="balance-amount">${formatAmount(totalBalance)}</div>
      
      <div class="currency-selector">
        <div class="currency-option ${state.selectedCurrency === 'COP' ? 'active' : ''}" data-currency="COP">COP</div>
        <div class="currency-option ${state.selectedCurrency === 'USD' ? 'active' : ''}" data-currency="USD">USD</div>
      </div>
    </div>
    
    <div class="stats-container">
      <div class="stat-card">
        <i class="fas fa-money-bill-wave" style="color: var(--danger-color)"></i>
        <div class="stat-value">${formatAmount(totalExpenses)}</div>
        <div class="stat-label">Gastos Mes</div>
      </div>
      
      <div class="stat-card">
        <i class="fas fa-exchange-alt" style="color: var(--success-color)"></i>
        <div class="stat-value">${state.summary.expenseCount}</div>
        <div class="stat-label">Transacciones</div>
      </div>
      
      <div class="stat-card">
        <i class="fas fa-wallet" style="color: var(--primary-color)"></i>
        <div class="stat-value">${state.accounts.length}</div>
        <div class="stat-label">Cuentas</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-title">Mis Cuentas</div>
      <div class="list-container">
        ${state.accounts.length === 0 ? 
          '<div class="text-center my-4">No hay cuentas registradas</div>' : 
          renderAccountsListItems(state.accounts.slice(0, 3))}
      </div>
    </div>
    
    <div class="card">
      <div class="card-title">Gastos por Categoría</div>
      <div class="chart-container">
        <canvas id="categories-chart"></canvas>
      </div>
    </div>
    
    <div class="card">
      <div class="card-title">Gastos Recientes</div>
      <div class="list-container">
        ${state.expenses.length === 0 ? 
          '<div class="text-center my-4">No hay gastos registrados</div>' : 
          renderExpensesListItems(state.expenses.slice(0, 5))}
      </div>
    </div>
  `;
  
  // Inicializar gráficos después de que el DOM esté actualizado
  setTimeout(() => {
    renderCategoriesChart();
  }, 100);
}

// Vista de Gastos
function renderExpensesView() {
  const viewContainer = document.getElementById('view-container');
  
  viewContainer.innerHTML = `
    <div class="card">
      <div class="card-title">Filtros</div>
      
      <div style="display: flex; gap: 10px; margin-bottom: 10px;">
        <select id="month-filter" class="form-control">
          ${generateMonthOptions()}
        </select>
        
        <select id="year-filter" class="form-control">
          ${generateYearOptions()}
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
    </div>
    
    <div class="card">
      <div class="card-title">Listado de Gastos</div>
      <div class="list-container" id="expenses-list">
        ${state.expenses.length === 0 ? 
          '<div class="text-center my-4">No hay gastos registrados</div>' : 
          renderExpensesListItems(state.expenses)}
      </div>
    </div>
  `;
  
  // Configurar eventos de filtro
  document.getElementById('apply-filter').addEventListener('click', () => {
    const month = document.getElementById('month-filter').value;
    const year = document.getElementById('year-filter').value;
    
    state.currentMonth = parseInt(month);
    state.currentYear = parseInt(year);
    
    fetchExpenses().then(() => {
      document.getElementById('expenses-list').innerHTML = 
        state.expenses.length === 0 ? 
        '<div class="text-center my-4">No hay gastos para el período seleccionado</div>' : 
        renderExpensesListItems(state.expenses);
    });
  });
  
  // Preseleccionar el mes y año actual
  document.getElementById('month-filter').value = state.currentMonth;
  document.getElementById('year-filter').value = state.currentYear;
  
  // Configurar botones de filtro de categoría
  document.querySelectorAll('button[data-filter]').forEach(button => {
    button.addEventListener('click', async () => {
      const filter = button.dataset.filter;
      
      // Aplicar estilos de selección
      document.querySelectorAll('button[data-filter]').forEach(btn => {
        btn.classList.remove('btn-primary');
      });
      button.classList.add('btn-primary');
      
      if (filter === 'all') {
        await fetchExpenses();
      } else if (filter.startsWith('category-')) {
        const category = filter.replace('category-', '');
        await fetchExpenses(category);
      }
      
      document.getElementById('expenses-list').innerHTML = 
        state.expenses.length === 0 ? 
        '<div class="text-center my-4">No hay gastos para el filtro seleccionado</div>' : 
        renderExpensesListItems(state.expenses);
    });
  });
}

// Vista de Cuentas
function renderAccountsView() {
  const viewContainer = document.getElementById('view-container');
  
  // Formateo de datos para la moneda correcta
  const formatAmount = (amount, currency) => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)} USD`;
    } else {
      return `$${Math.round(amount).toLocaleString('es-CO')} COP`;
    }
  };
  
  // Obtener total de balances para todas las cuentas
  let totalBalance = 0;
  let totalBalanceCOP = 0;
  let totalBalanceUSD = 0;
  
  state.accounts.forEach(account => {
    if (account.currency === 'COP') {
      totalBalanceCOP += account.balance;
      totalBalanceUSD += account.balance * 0.00025; // COP a USD
    } else {
      totalBalanceCOP += account.balance * 4000; // USD a COP
      totalBalanceUSD += account.balance;
    }
    
    // Sumar al total según la moneda seleccionada
    if (state.selectedCurrency === account.currency) {
      totalBalance += account.balance;
    } else {
      totalBalance += state.selectedCurrency === 'USD' ? 
        account.balance * 0.00025 : // COP a USD
        account.balance * 4000;     // USD a COP
    }
  });
  
  viewContainer.innerHTML = `
    <div class="card balance-card">
      <div class="balance-title">Balance Total</div>
      <div class="balance-amount">
        ${state.selectedCurrency === 'USD' ? 
          `$${totalBalanceUSD.toFixed(2)}` : 
          `$${Math.round(totalBalanceCOP).toLocaleString('es-CO')}`}
      </div>
      
      <div class="currency-selector">
        <div class="currency-option ${state.selectedCurrency === 'COP' ? 'active' : ''}" data-currency="COP">COP</div>
        <div class="currency-option ${state.selectedCurrency === 'USD' ? 'active' : ''}" data-currency="USD">USD</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-title">Mis Cuentas</div>
      
      ${state.accounts.length === 0 ? 
        '<div class="text-center my-4">No hay cuentas registradas.<br>¡Agrega tu primera cuenta con el botón +!</div>' : 
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
  
  viewContainer.innerHTML = `
    <div class="card">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
        <button id="prev-month" class="btn">
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <div style="text-align: center;">
          <div style="font-size: 20px; font-weight: bold;">${monthName}</div>
          <div>${currentYear}</div>
        </div>
        
        <button id="next-month" class="btn">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
    
    <div class="card">
      <div class="card-title">Resumen del Mes</div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div>
          <div style="font-size: 14px; color: #777;">Total Gastos</div>
          <div style="font-size: 24px; font-weight: bold; color: var(--danger-color);">
            ${formatMoney(state.summary?.totalExpenses || 0, state.selectedCurrency)}
          </div>
        </div>
        
        <div>
          <div style="font-size: 14px; color: #777;">Transacciones</div>
          <div style="font-size: 24px; font-weight: bold;">
            ${state.summary?.expenseCount || 0}
          </div>
        </div>
      </div>
      
      <div class="currency-selector" style="margin-bottom: 20px;">
        <div class="currency-option ${state.selectedCurrency === 'COP' ? 'active' : ''}" data-currency="COP">COP</div>
        <div class="currency-option ${state.selectedCurrency === 'USD' ? 'active' : ''}" data-currency="USD">USD</div>
      </div>
    </div>
    
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
  
  // Inicializar gráficos
  setTimeout(() => {
    renderCategoriesPieChart();
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
  
  // Convertir montos a la moneda seleccionada
  const convertedAmounts = amounts.map(amount => {
    if (state.selectedCurrency === 'USD') {
      return amount * 0.00025; // COP a USD
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
  
  // Convertir montos a la moneda seleccionada
  const convertedAmounts = amounts.map(amount => {
    if (state.selectedCurrency === 'USD') {
      return amount * 0.00025; // COP a USD
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
  
  // Preparar datos para gráfico
  const expensesData = days.map(day => {
    const dayExpenses = expensesByDay[day] || 0;
    return state.selectedCurrency === 'USD' ? dayExpenses * 0.00025 : dayExpenses;
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
async function fetchExpenses(category = null) {
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
    
    state.expenses = await response.json();
  } catch (error) {
    console.error('Error fetching expenses:', error);
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
    
    state.summary = await response.json();
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
    return simplified ? `$${amount.toFixed(0)}` : `$${amount.toFixed(2)}`;
  } else {
    return simplified ? `$${Math.round(amount / 1000)}k` : `$${Math.round(amount).toLocaleString('es-CO')}`;
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

// Cargar Chart.js para los gráficos
(function loadChartJS() {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
  document.head.appendChild(script);
})();
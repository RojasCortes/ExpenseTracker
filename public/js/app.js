// Simple React app to demonstrate functionality

// Create a temporary database for the demo
const initialAccounts = [
  { id: 1, name: 'Cuenta de Ahorros', balance: 2500000, currency: 'COP' },
  { id: 2, name: 'Cuenta Corriente', balance: 1200000, currency: 'COP' },
  { id: 3, name: 'Inversiones', balance: 500, currency: 'USD' }
];

const initialExpenses = [
  { id: 1, amount: 150000, currency: 'COP', date: '2025-05-01', category: 'Alimentación', description: 'Compras semanales', accountId: 1 },
  { id: 2, amount: 250000, currency: 'COP', date: '2025-05-02', category: 'Vivienda', description: 'Pago de arriendo', accountId: 2 },
  { id: 3, amount: 100, currency: 'USD', date: '2025-05-03', category: 'Entretenimiento', description: 'Suscripciones', accountId: 3 }
];

// Main App
document.addEventListener('DOMContentLoaded', function() {
  const root = document.getElementById('root');
  
  // Create a simple UI
  root.innerHTML = `
    <div class="min-h-screen bg-gray-100">
      <header class="bg-blue-600 text-white shadow-md">
        <div class="container mx-auto px-4 py-4">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <div class="flex items-center mb-4 md:mb-0">
              <h1 class="text-2xl font-bold">
                <i class="fas fa-money-bill-wave mr-2"></i>
                Control Financiero
              </h1>
            </div>
            
            <div class="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <div class="text-center md:text-right">
                <p class="text-sm opacity-80">Balance Total</p>
                <p class="text-xl font-bold">$3,700,000</p>
              </div>
              
              <div class="flex items-center bg-blue-700 rounded-lg p-2">
                <span class="text-white mr-2 text-sm">Moneda:</span>
                <select
                  id="currency-selector"
                  class="bg-blue-800 text-white rounded border-none focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm py-1 px-2"
                >
                  <option value="COP">COP (Peso Colombiano)</option>
                  <option value="USD">USD (Dólar Estadounidense)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div class="container mx-auto px-4 py-6">
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="flex flex-wrap border-b">
            <button
              id="tab-dashboard"
              class="px-4 py-3 font-medium text-sm text-blue-600 border-b-2 border-blue-600"
            >
              <i class="fas fa-chart-line mr-2"></i>
              Dashboard
            </button>
            <button
              id="tab-expenses"
              class="px-4 py-3 font-medium text-sm text-gray-500 hover:text-blue-600"
            >
              <i class="fas fa-receipt mr-2"></i>
              Gastos
            </button>
            <button
              id="tab-accounts"
              class="px-4 py-3 font-medium text-sm text-gray-500 hover:text-blue-600"
            >
              <i class="fas fa-wallet mr-2"></i>
              Cuentas
            </button>
            <button
              id="tab-reports"
              class="px-4 py-3 font-medium text-sm text-gray-500 hover:text-blue-600"
            >
              <i class="fas fa-file-excel mr-2"></i>
              Informes
            </button>
          </div>
          <div class="p-4" id="content-area">
            <!-- Content will be loaded here -->
          </div>
        </div>
      </div>
      
      <footer class="text-center py-4 text-gray-500 text-sm">
        <p>© 2025 Control Financiero - Todos los derechos reservados</p>
      </footer>
    </div>
  `;
  
  // Initialize the UI
  showDashboard();
  
  // Add event listeners
  document.getElementById('tab-dashboard').addEventListener('click', function() {
    setActiveTab('tab-dashboard');
    showDashboard();
  });
  
  document.getElementById('tab-expenses').addEventListener('click', function() {
    setActiveTab('tab-expenses');
    showExpenses();
  });
  
  document.getElementById('tab-accounts').addEventListener('click', function() {
    setActiveTab('tab-accounts');
    showAccounts();
  });
  
  document.getElementById('tab-reports').addEventListener('click', function() {
    setActiveTab('tab-reports');
    showReports();
  });
  
  document.getElementById('currency-selector').addEventListener('change', function() {
    // In a real app, this would update all currency-related displays
    alert('La moneda ha sido cambiada a ' + this.value);
  });
});

function setActiveTab(activeTabId) {
  const tabs = ['tab-dashboard', 'tab-expenses', 'tab-accounts', 'tab-reports'];
  tabs.forEach(tabId => {
    const tab = document.getElementById(tabId);
    if (tabId === activeTabId) {
      tab.className = 'px-4 py-3 font-medium text-sm text-blue-600 border-b-2 border-blue-600';
    } else {
      tab.className = 'px-4 py-3 font-medium text-sm text-gray-500 hover:text-blue-600';
    }
  });
}

function showDashboard() {
  const contentArea = document.getElementById('content-area');
  
  contentArea.innerHTML = `
    <div>
      <h2 class="text-2xl font-bold mb-6">Panel de Control</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <i class="fas fa-wallet text-xl"></i>
            </div>
            <div>
              <p class="text-sm text-gray-600">Balance Total</p>
              <p class="text-xl font-bold">$3,700,000 COP</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              <i class="fas fa-receipt text-xl"></i>
            </div>
            <div>
              <p class="text-sm text-gray-600">Gastos del Mes</p>
              <p class="text-xl font-bold">$400,000 COP</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <i class="fas fa-list text-xl"></i>
            </div>
            <div>
              <p class="text-sm text-gray-600">Transacciones</p>
              <p class="text-xl font-bold">3</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="p-4 border-b">
          <h3 class="text-lg font-semibold">Cuentas</h3>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Moneda
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${initialAccounts.map(account => `
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${account.name}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}">
                      ${formatCurrency(account.balance, account.currency)}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${account.currency}</div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  // In a real app, this would initialize charts using Chart.js
  const placeholder = document.createElement('div');
  placeholder.innerHTML = '<div class="mt-6 p-4 bg-blue-50 text-blue-700 rounded text-center">Los gráficos de tendencias de gastos y categorías aparecerán aquí.</div>';
  contentArea.appendChild(placeholder);
}

function showExpenses() {
  const contentArea = document.getElementById('content-area');
  
  contentArea.innerHTML = `
    <div>
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 class="text-2xl font-bold mb-4 md:mb-0">Gestión de Gastos</h2>
        <button
          id="btn-new-expense"
          class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors"
        >
          <i class="fas fa-plus mr-2"></i>Nuevo Gasto
        </button>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="p-4 border-b">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">Lista de Gastos</h3>
            <div class="text-right">
              <p class="text-sm text-gray-600">Total:</p>
              <p class="text-xl font-bold text-blue-600">$400,000 COP</p>
            </div>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cuenta
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${initialExpenses.map(expense => {
                const account = initialAccounts.find(a => a.id === expense.accountId);
                return `
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      ${formatDate(expense.date)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap font-medium">
                      ${formatCurrency(expense.amount, expense.currency)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        ${expense.category}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      ${account ? account.name : 'N/A'}
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-gray-900 truncate max-w-xs">
                        ${expense.description || '-'}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        class="text-blue-600 hover:text-blue-900 mr-3"
                        data-id="${expense.id}"
                        onclick="alert('Editar gasto: ${expense.id}')"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        class="text-red-600 hover:text-red-900"
                        data-id="${expense.id}"
                        onclick="alert('Eliminar gasto: ${expense.id}')"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('btn-new-expense').addEventListener('click', function() {
    alert('Esta función abrirá el formulario para crear un nuevo gasto.');
  });
}

function showAccounts() {
  const contentArea = document.getElementById('content-area');
  
  contentArea.innerHTML = `
    <div>
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 class="text-2xl font-bold mb-4 md:mb-0">Gestión de Cuentas</h2>
        <button
          id="btn-new-account"
          class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors"
        >
          <i class="fas fa-plus mr-2"></i>Nueva Cuenta
        </button>
      </div>

      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-gray-600 text-sm">Balance Total en Todas las Cuentas</p>
            <p class="text-3xl font-bold">$3,700,000 COP</p>
          </div>
          <div class="text-right">
            <p class="text-gray-600 text-sm">Cuentas Activas</p>
            <p class="text-2xl font-semibold">${initialAccounts.length}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${initialAccounts.map(account => `
          <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
            <div class="p-4 border-b">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold">${account.name}</h3>
                <div class="flex space-x-2">
                  <button
                    class="text-blue-600 hover:text-blue-800"
                    data-id="${account.id}"
                    onclick="alert('Editar cuenta: ${account.id}')"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    class="text-red-600 hover:text-red-800"
                    data-id="${account.id}"
                    onclick="alert('Eliminar cuenta: ${account.id}')"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="p-4">
              <div class="flex flex-col">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-gray-600">Balance Actual:</span>
                  <span class="text-xl font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}">
                    ${formatCurrency(account.balance, account.currency)}
                  </span>
                </div>
                <div class="text-sm text-gray-500">
                  <span>Moneda: ${account.currency}</span>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  document.getElementById('btn-new-account').addEventListener('click', function() {
    alert('Esta función abrirá el formulario para crear una nueva cuenta.');
  });
}

function showReports() {
  const contentArea = document.getElementById('content-area');
  
  contentArea.innerHTML = `
    <div>
      <h2 class="text-2xl font-bold mb-6">Informes Financieros</h2>
      
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Generar Informe Excel</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <select
              id="report-month"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="5">Mayo</option>
              <option value="4">Abril</option>
              <option value="3">Marzo</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <select
              id="report-year"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
          
          <div class="flex items-end">
            <button
              id="btn-download-excel"
              class="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <i class="fas fa-file-excel mr-2"></i>
              Descargar Excel
            </button>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="text-lg font-semibold mb-4">Resumen de Gastos</h3>
          <div class="space-y-4">
            <div class="p-4 bg-blue-50 rounded">
              <p class="text-sm text-gray-600">Gastos Totales del Período</p>
              <p class="text-2xl font-bold text-blue-600">
                $400,000 COP
              </p>
            </div>
            
            <div>
              <p class="text-sm font-medium text-gray-700 mb-2">Gastos por Categoría</p>
              <div class="space-y-2">
                <div class="flex justify-between items-center p-2 border-b">
                  <span>Alimentación</span>
                  <span class="font-medium">$150,000 COP</span>
                </div>
                <div class="flex justify-between items-center p-2 border-b">
                  <span>Vivienda</span>
                  <span class="font-medium">$250,000 COP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="text-lg font-semibold mb-4">Detalle del Informe</h3>
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium text-gray-700 mb-2">Contenido del Informe Excel</p>
              <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
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
    </div>
  `;
  
  document.getElementById('btn-download-excel').addEventListener('click', function() {
    const month = document.getElementById('report-month').value;
    const year = document.getElementById('report-year').value;
    alert(`Descargando informe de ${month}/${year}. En una aplicación real, esto generaría un archivo Excel.`);
  });
}

// Helper functions
function formatCurrency(amount, currency = 'COP') {
  if (currency === 'COP') {
    return `$${amount.toLocaleString('es-CO')} COP`;
  } else {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO');
}
import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import AccountManager from './components/AccountManager';
import Reports from './components/Reports';
import { useAppContext } from './context/AppContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { loading } = useAppContext();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'expenses':
        return <ExpenseList />;
      case 'accounts':
        return <AccountManager />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex flex-wrap border-b">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-3 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                <i className="fas fa-chart-line mr-2"></i>
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`px-4 py-3 font-medium text-sm ${
                  activeTab === 'expenses'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                <i className="fas fa-receipt mr-2"></i>
                Gastos
              </button>
              <button
                onClick={() => setActiveTab('accounts')}
                className={`px-4 py-3 font-medium text-sm ${
                  activeTab === 'accounts'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                <i className="fas fa-wallet mr-2"></i>
                Cuentas
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-3 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                <i className="fas fa-file-excel mr-2"></i>
                Informes
              </button>
            </div>
            <div className="p-4">{renderActiveTab()}</div>
          </div>
        </div>
      )}
      
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>© 2023 Control Financiero - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}

export default App;

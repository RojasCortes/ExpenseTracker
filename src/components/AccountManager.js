import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import AccountForm from './AccountForm';
import { formatCurrency } from '../utils/currencyUtils';

const AccountManager = () => {
  const { accounts, deleteAccount } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar esta cuenta? Esta acción no se puede deshacer.')) {
      try {
        await deleteAccount(id);
      } catch (error) {
        console.error('Error al eliminar la cuenta:', error);
        alert(error.message || 'No se puede eliminar la cuenta. Asegúrese de que no tenga gastos asociados.');
      }
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setSelectedAccount(null);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold mb-4 md:mb-0">Gestión de Cuentas</h2>
        <button
          onClick={() => {
            setSelectedAccount(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>Nueva Cuenta
        </button>
      </div>

      {showForm ? (
        <AccountForm
          account={selectedAccount}
          onClose={() => {
            setShowForm(false);
            setSelectedAccount(null);
          }}
          onSave={handleFormSave}
        />
      ) : (
        <>
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Balance Total en Todas las Cuentas</p>
                <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-sm">Cuentas Activas</p>
                <p className="text-2xl font-semibold">{accounts.length}</p>
              </div>
            </div>
          </div>

          {accounts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <i className="fas fa-wallet text-gray-400 text-5xl mb-4"></i>
              <h3 className="text-xl font-bold mb-2">No hay cuentas</h3>
              <p className="text-gray-600 mb-4">
                No tiene cuentas registradas. Comience creando una nueva cuenta para gestionar sus finanzas.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Crear Primera Cuenta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map(account => (
                <div
                  key={account.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">{account.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(account)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(account.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Balance Actual:</span>
                        <span className={`text-xl font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(account.balance, account.currency)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        <span>Moneda: {account.currency}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AccountManager;

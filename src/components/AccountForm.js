import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const AccountForm = ({ account = null, onClose, onSave }) => {
  const { createAccount, updateAccount, currency } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    initialBalance: '',
    currency: currency
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        initialBalance: account.balance.toString(),
        currency: account.currency
      });
    } else {
      // Default to current global currency for new accounts
      setFormData(prevState => ({
        ...prevState,
        currency
      }));
    }
  }, [account, currency]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || formData.initialBalance === '') {
      setError('Todos los campos obligatorios deben ser completados');
      return;
    }

    try {
      if (account) {
        // Update existing account
        await updateAccount(account.id, {
          name: formData.name,
          balance: parseFloat(formData.initialBalance),
          currency: formData.currency
        });
      } else {
        // Create new account
        await createAccount({
          name: formData.name,
          initialBalance: parseFloat(formData.initialBalance),
          currency: formData.currency
        });
      }
      
      onSave();
    } catch (err) {
      setError(err.message || 'Ocurrió un error al guardar la cuenta');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">
        {account ? 'Editar Cuenta' : 'Crear Nueva Cuenta'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Nombre de la Cuenta *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Cuenta de Ahorros, Tarjeta de Crédito"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="initialBalance">
            {account ? 'Balance Actual *' : 'Balance Inicial *'}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
              {formData.currency === 'COP' ? '$' : 'US$'}
            </span>
            <input
              type="number"
              id="initialBalance"
              name="initialBalance"
              value={formData.initialBalance}
              onChange={handleChange}
              className="w-full pl-10 py-2 px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.01"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currency">
            Moneda *
          </label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="COP">COP (Peso Colombiano)</option>
            <option value="USD">USD (Dólar Estadounidense)</option>
          </select>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {account ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountForm;

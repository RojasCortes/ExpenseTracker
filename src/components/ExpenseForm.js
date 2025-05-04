import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDateForInput } from '../utils/dateUtils';

const ExpenseForm = ({ expense = null, onClose, onSave }) => {
  const { accounts, currency, createExpense, updateExpense } = useAppContext();
  const [formData, setFormData] = useState({
    amount: '',
    date: formatDateForInput(new Date()),
    category: '',
    description: '',
    accountId: ''
  });
  const [error, setError] = useState('');

  const categories = [
    'Alimentación',
    'Transporte',
    'Vivienda',
    'Servicios',
    'Educación',
    'Salud',
    'Entretenimiento',
    'Ropa',
    'Tecnología',
    'Otros'
  ];

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount.toString(),
        date: formatDateForInput(new Date(expense.date)),
        category: expense.category,
        description: expense.description || '',
        accountId: expense.accountId.toString()
      });
    } else if (accounts.length > 0) {
      setFormData(prevState => ({
        ...prevState,
        accountId: accounts[0].id.toString()
      }));
    }
  }, [expense, accounts]);

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
    if (!formData.amount || !formData.date || !formData.category || !formData.accountId) {
      setError('Todos los campos obligatorios deben ser completados');
      return;
    }

    try {
      if (expense) {
        // Update existing expense
        await updateExpense(expense.id, {
          ...formData,
          amount: parseFloat(formData.amount),
          accountId: parseInt(formData.accountId),
          currency
        });
      } else {
        // Create new expense
        await createExpense({
          ...formData,
          amount: parseFloat(formData.amount),
          accountId: parseInt(formData.accountId),
          currency
        });
      }
      
      onSave();
    } catch (err) {
      setError(err.message || 'Ocurrió un error al guardar el gasto');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">
        {expense ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
              Monto *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                {currency === 'COP' ? '$' : 'US$'}
              </span>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full pl-10 py-2 px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
              Fecha *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
              Categoría *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="accountId">
              Cuenta *
            </label>
            <select
              id="accountId"
              name="accountId"
              value={formData.accountId}
              onChange={handleChange}
              className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar cuenta</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.balance.toLocaleString('es-CO', { 
                    style: 'currency', 
                    currency: account.currency,
                    minimumFractionDigits: 0
                  })})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          ></textarea>
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
            {expense ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;

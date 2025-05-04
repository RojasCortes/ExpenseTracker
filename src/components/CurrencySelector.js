import React from 'react';
import { useAppContext } from '../context/AppContext';

const CurrencySelector = () => {
  const { currency, setCurrency } = useAppContext();

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  return (
    <div className="flex items-center bg-blue-700 rounded-lg p-2">
      <span className="text-white mr-2 text-sm">Moneda:</span>
      <select
        value={currency}
        onChange={handleCurrencyChange}
        className="bg-blue-800 text-white rounded border-none focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm py-1 px-2"
      >
        <option value="COP">COP (Peso Colombiano)</option>
        <option value="USD">USD (Dólar Estadounidense)</option>
      </select>
    </div>
  );
};

export default CurrencySelector;

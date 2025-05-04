import React from 'react';
import CurrencySelector from './CurrencySelector';
import { useAppContext } from '../context/AppContext';

const Header = () => {
  const { accounts } = useAppContext();
  
  // Calculate total balance across all accounts
  const totalBalance = accounts.reduce((total, account) => {
    return total + account.balance;
  }, 0);

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <h1 className="text-2xl font-bold">
              <i className="fas fa-money-bill-wave mr-2"></i>
              Control Financiero
            </h1>
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <div className="text-center md:text-right">
              <p className="text-sm opacity-80">Balance Total</p>
              <p className="text-xl font-bold">
                {totalBalance.toLocaleString('es-CO', { 
                  style: 'currency', 
                  currency: 'COP',
                  minimumFractionDigits: 0
                })}
              </p>
            </div>
            
            <CurrencySelector />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

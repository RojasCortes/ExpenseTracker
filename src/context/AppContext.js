import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getExpenses, 
  createExpense, 
  updateExpense, 
  deleteExpense,
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getSummary
} from '../api/apiService';
import { convertCurrency } from '../utils/currencyUtils';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [currency, setCurrency] = useState('COP'); // Default currency
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const accountsData = await getAccounts();
        setAccounts(accountsData);
        
        const expensesData = await getExpenses();
        setExpenses(expensesData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Fetch expenses with optional filters
  const fetchExpenses = async (filters = {}) => {
    setLoading(true);
    try {
      const expensesData = await getExpenses(filters);
      setExpenses(expensesData);
      return expensesData;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // CRUD operations for expenses
  const addExpense = async (expenseData) => {
    setLoading(true);
    try {
      const newExpense = await createExpense(expenseData);
      setExpenses(prev => [...prev, newExpense]);
      
      // Update accounts
      const updatedAccounts = await getAccounts();
      setAccounts(updatedAccounts);
      
      return newExpense;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const editExpense = async (id, expenseData) => {
    setLoading(true);
    try {
      const updatedExpense = await updateExpense(id, expenseData);
      setExpenses(prev => 
        prev.map(expense => expense.id === id ? updatedExpense : expense)
      );
      
      // Update accounts
      const updatedAccounts = await getAccounts();
      setAccounts(updatedAccounts);
      
      return updatedExpense;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeExpense = async (id) => {
    setLoading(true);
    try {
      await deleteExpense(id);
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      
      // Update accounts
      const updatedAccounts = await getAccounts();
      setAccounts(updatedAccounts);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch accounts
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const accountsData = await getAccounts();
      setAccounts(accountsData);
      return accountsData;
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // CRUD operations for accounts
  const addAccount = async (accountData) => {
    setLoading(true);
    try {
      const newAccount = await createAccount(accountData);
      setAccounts(prev => [...prev, newAccount]);
      return newAccount;
    } catch (error) {
      console.error('Error adding account:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const editAccount = async (id, accountData) => {
    setLoading(true);
    try {
      const updatedAccount = await updateAccount(id, accountData);
      setAccounts(prev => 
        prev.map(account => account.id === id ? updatedAccount : account)
      );
      return updatedAccount;
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeAccount = async (id) => {
    setLoading(true);
    try {
      await deleteAccount(id);
      setAccounts(prev => prev.filter(account => account.id !== id));
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary for dashboard
  const fetchSummary = async (month, year) => {
    try {
      const summaryData = await getSummary(month, year);
      return summaryData;
    } catch (error) {
      console.error('Error fetching summary:', error);
      throw error;
    }
  };

  // Format expenses and accounts based on selected currency
  const formattedExpenses = expenses.map(expense => ({
    ...expense,
    amount: convertCurrency(expense.amount, expense.currency, currency)
  }));

  const formattedAccounts = accounts.map(account => ({
    ...account,
    balance: convertCurrency(account.balance, account.currency, currency)
  }));

  const value = {
    expenses: formattedExpenses,
    accounts: formattedAccounts,
    currency,
    loading,
    setCurrency,
    fetchExpenses,
    createExpense: addExpense,
    updateExpense: editExpense,
    deleteExpense: removeExpense,
    fetchAccounts,
    createAccount: addAccount,
    updateAccount: editAccount,
    deleteAccount: removeAccount,
    fetchSummary
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

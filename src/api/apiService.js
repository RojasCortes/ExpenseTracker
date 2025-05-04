// API service for interacting with the backend

// Base URL for API requests
const API_BASE_URL = '/api';

// Error handling helper
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = (errorData && errorData.error) || 'Ocurrió un error en la solicitud';
    throw new Error(errorMessage);
  }
  return response.json();
};

// Expense API calls
export const getExpenses = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  if (filters.month) {
    queryParams.append('month', filters.month);
  }
  
  if (filters.year) {
    queryParams.append('year', filters.year);
  }
  
  if (filters.category) {
    queryParams.append('category', filters.category);
  }
  
  if (filters.accountId) {
    queryParams.append('accountId', filters.accountId);
  }
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  try {
    const response = await fetch(`${API_BASE_URL}/expenses${queryString}`);
    return handleResponse(response);
  } catch (error) {
    console.error('API Error in getExpenses:', error);
    throw error;
  }
};

export const createExpense = async (expenseData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(expenseData)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('API Error in createExpense:', error);
    throw error;
  }
};

export const updateExpense = async (id, expenseData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(expenseData)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('API Error in updateExpense:', error);
    throw error;
  }
};

export const deleteExpense = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('API Error in deleteExpense:', error);
    throw error;
  }
};

// Account API calls
export const getAccounts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/accounts`);
    return handleResponse(response);
  } catch (error) {
    console.error('API Error in getAccounts:', error);
    throw error;
  }
};

export const createAccount = async (accountData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(accountData)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('API Error in createAccount:', error);
    throw error;
  }
};

export const updateAccount = async (id, accountData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(accountData)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('API Error in updateAccount:', error);
    throw error;
  }
};

export const deleteAccount = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('API Error in deleteAccount:', error);
    throw error;
  }
};

// Summary API calls
export const getSummary = async (month, year) => {
  try {
    const response = await fetch(`${API_BASE_URL}/summary?month=${month}&year=${year}`);
    return handleResponse(response);
  } catch (error) {
    console.error('API Error in getSummary:', error);
    throw error;
  }
};

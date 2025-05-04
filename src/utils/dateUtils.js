/**
 * Formats a date for display in the UI
 * @param {string|Date} date - Date string or object
 * @returns {string} - Formatted date string (DD/MM/YYYY)
 */
export const formatDateForDisplay = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if valid date
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formats a date for use in input[type="date"] fields
 * @param {string|Date} date - Date string or object
 * @returns {string} - Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if valid date
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Gets the start and end dates for a month
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2023)
 * @returns {Object} - Object with startDate and endDate
 */
export const getMonthDateRange = (month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  return {
    startDate,
    endDate
  };
};

/**
 * Get an array of date strings for each day in the month
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2023)
 * @returns {string[]} - Array of dates in YYYY-MM-DD format
 */
export const getMonthDays = (month, year) => {
  const { startDate, endDate } = getMonthDateRange(month, year);
  const days = [];
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    days.push(formatDateForInput(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

/**
 * Returns the name of the month in Spanish
 * @param {number} month - Month (1-12)
 * @returns {string} - Month name in Spanish
 */
export const getMonthName = (month) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  return months[month - 1] || '';
};

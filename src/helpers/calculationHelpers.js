// src/helpers/calculationHelpers.js

/**
 * Calculation and formatting utility functions
 * 
 * This module contains reusable helper functions for common operations
 * used throughout the application.
 */

/**
 * Format a number as currency (USD)
 * @param {number} amount - The amount to format
 * @param {boolean} includeSymbol - Whether to include the $ symbol
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, includeSymbol = true) => {
  // Ensure amount is a number, defaulting to 0 if invalid
  const validAmount = Math.min(
    Math.max(0, isNaN(amount) ? 0 : amount),
    100000 // Reasonable maximum to prevent display issues
  );

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  const formatted = formatter.format(validAmount);
  
  // Optionally remove the currency symbol
  return includeSymbol ? formatted : formatted.replace(/^\$/, '');
};

/**
 * Calculate savings percentage safely
 * @param {number} savings - Amount saved
 * @param {number} originalPrice - Original price
 * @param {number} maxPercent - Maximum percentage to display (defaults to 90)
 * @returns {number} Savings percentage capped at maxPercent
 */
export const calculateSavingsPercentage = (savings, originalPrice, maxPercent = 90) => {
  if (!originalPrice || originalPrice <= 0 || !savings || savings <= 0) {
    return 0;
  }
  
  return Math.min(maxPercent, Math.round((savings / originalPrice) * 100));
};

/**
 * Safely get total price from components
 * @param {Object} costs - Object containing different cost components
 * @returns {number} Total price
 */
export const calculateTotalPrice = (costs) => {
  if (!costs) return 0;
  
  // Extract cost components with defaults
  const { 
    baseCost = 0, 
    additionalCosts = [], 
    discounts = [], 
    taxRate = 0 
  } = costs;
  
  // Sum additional costs
  const totalAdditional = Array.isArray(additionalCosts)
    ? additionalCosts.reduce((sum, item) => sum + (item.cost || 0), 0)
    : 0;
  
  // Sum discounts (expressed as positive numbers)
  const totalDiscounts = Array.isArray(discounts)
    ? discounts.reduce((sum, item) => sum + (item.amount || 0), 0)
    : 0;
  
  // Calculate subtotal
  const subtotal = baseCost + totalAdditional - totalDiscounts;
  
  // Apply tax if specified
  const tax = taxRate > 0 ? subtotal * taxRate : 0;
  
  // Return total, ensuring it's not negative
  return Math.max(0, subtotal + tax);
};

/**
 * Calculate the best value option from multiple choices
 * @param {Array} options - Array of options with price and value properties
 * @returns {Object} The option with the best value
 */
export const findBestValueOption = (options) => {
  if (!Array.isArray(options) || options.length === 0) {
    return null;
  }
  
  // Calculate value ratio (lower is better)
  const withRatios = options.map(option => {
    const price = option.price || 0;
    const value = option.value || 0;
    // Avoid division by zero
    const ratio = value > 0 ? price / value : Infinity;
    return { ...option, ratio };
  });
  
  // Sort by ratio (ascending)
  withRatios.sort((a, b) => a.ratio - b.ratio);
  
  // Return the option with the best ratio
  return withRatios[0];
};

/**
 * Cap a number between minimum and maximum values
 * @param {number} value - The value to cap
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} The capped value
 */
export const capValue = (value, min, max) => {
  const numValue = Number(value);
  if (isNaN(numValue)) return min;
  return Math.min(Math.max(numValue, min), max);
};

/**
 * Check if array elements are all valid (not empty, not null, etc.)
 * @param {Array} array - Array to check
 * @param {Function} validationFn - Validation function for elements
 * @returns {boolean} Whether all elements are valid
 */
export const areAllValid = (array, validationFn = Boolean) => {
  if (!Array.isArray(array)) return false;
  return array.every(item => validationFn(item));
};

/**
 * Group array items by a specific key or property
 * @param {Array} array - Array to group
 * @param {string|Function} keyGetter - Property name or function to get group key
 * @returns {Object} Grouped object with keys as group names
 */
export const groupBy = (array, keyGetter) => {
  if (!Array.isArray(array)) return {};
  
  return array.reduce((acc, item) => {
    const key = typeof keyGetter === 'function' 
      ? keyGetter(item) 
      : item[keyGetter];
    
    if (!acc[key]) {
      acc[key] = [];
    }
    
    acc[key].push(item);
    return acc;
  }, {});
};

/**
 * Safely access nested object properties
 * @param {Object} obj - Object to access
 * @param {string} path - Dot-notation path to property
 * @param {any} defaultValue - Default value if property doesn't exist
 * @returns {any} Property value or default
 */
export const getPropSafely = (obj, path, defaultValue = null) => {
  if (!obj || !path) return defaultValue;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || !Object.prototype.hasOwnProperty.call(current, key)) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current === undefined ? defaultValue : current;
};

/**
 * Create a debounced function that delays invoking func
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Get a readable duration string from minutes
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '0 minutes';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  }
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
};

/**
 * Generate a simple unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return '_' + Math.random().toString(36).substr(2, 9);
};

// Export all utility functions as a default object
export default {
  formatCurrency,
  calculateSavingsPercentage,
  calculateTotalPrice,
  findBestValueOption,
  capValue,
  areAllValid,
  groupBy,
  getPropSafely,
  debounce,
  formatDuration,
  generateId
};
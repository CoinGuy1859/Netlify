// src/helpers/calculationHelpers.js

/**
 * Enhanced Calculation and formatting utility functions
 * 
 * This module contains reusable helper functions for common operations
 * used throughout the application, with enhanced error handling and validation.
 */

/**
 * Format a number as currency (USD) with enhanced validation
 * @param {number} amount - The amount to format
 * @param {boolean} includeSymbol - Whether to include the $ symbol
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, includeSymbol = true) => {
  // Enhanced input validation
  let validAmount = 0;
  
  if (typeof amount === 'string') {
    // Handle string inputs by parsing
    const parsed = parseFloat(amount.replace(/[^0-9.-]/g, ''));
    validAmount = isNaN(parsed) ? 0 : parsed;
  } else if (typeof amount === 'number' && !isNaN(amount)) {
    validAmount = amount;
  }
  
  // Ensure amount is within reasonable bounds
  validAmount = Math.min(
    Math.max(0, validAmount), // No negative amounts
    999999 // Reasonable maximum to prevent display issues
  );

  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    
    const formatted = formatter.format(validAmount);
    
    // Optionally remove the currency symbol
    return includeSymbol ? formatted : formatted.replace(/^\$/, '');
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    console.warn('Currency formatting error, using fallback:', error);
    const fallback = validAmount.toFixed(2);
    return includeSymbol ? `$${fallback}` : fallback;
  }
};

/**
 * Calculate savings percentage safely with comprehensive validation
 * @param {number} savings - Amount saved
 * @param {number} originalPrice - Original price
 * @param {number} maxPercent - Maximum percentage to display (defaults to 90)
 * @returns {number} Savings percentage capped at maxPercent
 */
export const calculateSavingsPercentage = (savings, originalPrice, maxPercent = 90) => {
  // Enhanced input validation
  const savingsNum = typeof savings === 'number' && !isNaN(savings) ? savings : 0;
  const originalNum = typeof originalPrice === 'number' && !isNaN(originalPrice) ? originalPrice : 0;
  const maxNum = typeof maxPercent === 'number' && !isNaN(maxPercent) ? Math.max(0, Math.min(100, maxPercent)) : 90;
  
  // Guard against division by zero or negative/zero values
  if (originalNum <= 0 || savingsNum <= 0) {
    return 0;
  }
  
  // Calculate percentage with bounds checking
  const rawPercentage = (savingsNum / originalNum) * 100;
  
  // Ensure percentage is within reasonable bounds
  if (rawPercentage < 0) return 0;
  if (rawPercentage > maxNum) return maxNum;
  
  // Round to nearest whole number
  return Math.round(rawPercentage);
};

/**
 * Safely get total price from components with enhanced validation
 * @param {Object} costs - Object containing different cost components
 * @returns {number} Total price (never negative)
 */
export const calculateTotalPrice = (costs) => {
  // Handle null/undefined input
  if (!costs || typeof costs !== 'object') {
    return 0;
  }
  
  try {
    // Extract cost components with robust defaults
    const { 
      baseCost = 0, 
      additionalCosts = [], 
      discounts = [], 
      taxRate = 0,
      fees = []
    } = costs;
    
    // Validate and convert base cost
    const validBaseCost = typeof baseCost === 'number' && !isNaN(baseCost) ? Math.max(0, baseCost) : 0;
    
    // Sum additional costs with validation
    const totalAdditional = Array.isArray(additionalCosts)
      ? additionalCosts.reduce((sum, item) => {
          if (!item || typeof item !== 'object') return sum;
          const cost = typeof item.cost === 'number' && !isNaN(item.cost) ? Math.max(0, item.cost) : 0;
          return sum + cost;
        }, 0)
      : 0;
    
    // Sum fees with validation
    const totalFees = Array.isArray(fees)
      ? fees.reduce((sum, fee) => {
          const feeAmount = typeof fee === 'number' ? fee : (fee?.amount || 0);
          return sum + (typeof feeAmount === 'number' && !isNaN(feeAmount) ? Math.max(0, feeAmount) : 0);
        }, 0)
      : 0;
    
    // Sum discounts with validation (expressed as positive numbers)
    const totalDiscounts = Array.isArray(discounts)
      ? discounts.reduce((sum, item) => {
          if (!item || typeof item !== 'object') return sum;
          const discount = typeof item.amount === 'number' && !isNaN(item.amount) ? Math.max(0, item.amount) : 0;
          return sum + discount;
        }, 0)
      : 0;
    
    // Calculate subtotal
    const subtotal = validBaseCost + totalAdditional + totalFees - totalDiscounts;
    
    // Validate and apply tax rate
    const validTaxRate = typeof taxRate === 'number' && !isNaN(taxRate) && taxRate >= 0 && taxRate <= 1 
      ? taxRate 
      : 0;
    const tax = validTaxRate > 0 ? subtotal * validTaxRate : 0;
    
    // Return total, ensuring it's not negative and within reasonable bounds
    const total = subtotal + tax;
    return Math.max(0, Math.min(999999, total)); // Cap at reasonable maximum
    
  } catch (error) {
    console.warn('Error calculating total price, returning 0:', error);
    return 0;
  }
};

/**
 * Calculate the best value option from multiple choices with enhanced comparison
 * @param {Array} options - Array of options with price and value properties
 * @param {string} sortBy - Sort criteria: 'price', 'value', or 'ratio' (default)
 * @returns {Object|null} The option with the best value
 */
export const findBestValueOption = (options, sortBy = 'ratio') => {
  if (!Array.isArray(options) || options.length === 0) {
    return null;
  }
  
  try {
    // Filter out invalid options
    const validOptions = options.filter(option => 
      option && typeof option === 'object' && 
      typeof option.price === 'number' && !isNaN(option.price) &&
      typeof option.value === 'number' && !isNaN(option.value)
    );
    
    if (validOptions.length === 0) {
      return null;
    }
    
    // Calculate value ratios and sort based on criteria
    const withMetrics = validOptions.map(option => {
      const price = Math.max(0, option.price);
      const value = Math.max(0, option.value);
      
      // Calculate value ratio (lower is better for cost efficiency)
      const ratio = value > 0 ? price / value : Infinity;
      
      return { 
        ...option, 
        ratio,
        efficiency: ratio === 0 ? 0 : 1 / ratio // Higher efficiency is better
      };
    });
    
    // Sort based on criteria
    let sorted;
    switch (sortBy) {
      case 'price':
        sorted = withMetrics.sort((a, b) => a.price - b.price);
        break;
      case 'value':
        sorted = withMetrics.sort((a, b) => b.value - a.value);
        break;
      case 'ratio':
      default:
        sorted = withMetrics.sort((a, b) => a.ratio - b.ratio);
        break;
    }
    
    return sorted[0];
    
  } catch (error) {
    console.warn('Error finding best value option:', error);
    return options[0] || null; // Fallback to first option
  }
};

/**
 * Cap a number between minimum and maximum values with enhanced validation
 * @param {number|string} value - The value to cap
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} The capped value
 */
export const capValue = (value, min, max) => {
  // Enhanced input validation
  let numValue;
  
  if (typeof value === 'string') {
    numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
  } else {
    numValue = Number(value);
  }
  
  // Handle invalid inputs
  if (isNaN(numValue)) {
    console.warn('Invalid value provided to capValue, using minimum:', value);
    return typeof min === 'number' && !isNaN(min) ? min : 0;
  }
  
  // Validate min and max
  const validMin = typeof min === 'number' && !isNaN(min) ? min : -Infinity;
  const validMax = typeof max === 'number' && !isNaN(max) ? max : Infinity;
  
  // Ensure min <= max
  const actualMin = Math.min(validMin, validMax);
  const actualMax = Math.max(validMin, validMax);
  
  return Math.min(Math.max(numValue, actualMin), actualMax);
};

/**
 * Check if array elements are all valid with enhanced validation
 * @param {Array} array - Array to check
 * @param {Function} validationFn - Validation function for elements
 * @returns {boolean} Whether all elements are valid
 */
export const areAllValid = (array, validationFn = Boolean) => {
  // Input validation
  if (!Array.isArray(array)) {
    return false;
  }
  
  if (typeof validationFn !== 'function') {
    console.warn('Invalid validation function provided to areAllValid, using Boolean');
    validationFn = Boolean;
  }
  
  try {
    return array.every(item => {
      try {
        return validationFn(item);
      } catch (error) {
        console.warn('Validation function error for item:', item, error);
        return false;
      }
    });
  } catch (error) {
    console.warn('Error in areAllValid:', error);
    return false;
  }
};

/**
 * Group array items by a specific key or property with enhanced error handling
 * @param {Array} array - Array to group
 * @param {string|Function} keyGetter - Property name or function to get group key
 * @returns {Object} Grouped object with keys as group names
 */
export const groupBy = (array, keyGetter) => {
  // Input validation
  if (!Array.isArray(array)) {
    console.warn('Invalid array provided to groupBy');
    return {};
  }
  
  if (typeof keyGetter !== 'string' && typeof keyGetter !== 'function') {
    console.warn('Invalid keyGetter provided to groupBy');
    return {};
  }
  
  try {
    return array.reduce((acc, item) => {
      // Handle null/undefined items
      if (item == null) {
        return acc;
      }
      
      let key;
      try {
        if (typeof keyGetter === 'function') {
          key = keyGetter(item);
        } else {
          key = item[keyGetter];
        }
      } catch (error) {
        console.warn('Error getting key for groupBy:', error);
        key = 'unknown';
      }
      
      // Convert key to string for consistency
      const stringKey = String(key);
      
      // Initialize group if it doesn't exist
      if (!acc[stringKey]) {
        acc[stringKey] = [];
      }
      
      acc[stringKey].push(item);
      return acc;
    }, {});
  } catch (error) {
    console.warn('Error in groupBy:', error);
    return {};
  }
};

/**
 * Safely round a number to specified decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places (default 2)
 * @returns {number} Rounded value
 */
export const safeRound = (value, decimals = 2) => {
  const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const numDecimals = typeof decimals === 'number' && !isNaN(decimals) ? Math.max(0, Math.min(10, decimals)) : 2;
  
  try {
    return Math.round(numValue * Math.pow(10, numDecimals)) / Math.pow(10, numDecimals);
  } catch (error) {
    console.warn('Error in safeRound, returning original value:', error);
    return numValue;
  }
};

/**
 * Calculate percentage change between two values safely
 * @param {number} oldValue - Original value
 * @param {number} newValue - New value
 * @returns {number} Percentage change (positive for increase, negative for decrease)
 */
export const calculatePercentageChange = (oldValue, newValue) => {
  const oldNum = typeof oldValue === 'number' && !isNaN(oldValue) ? oldValue : 0;
  const newNum = typeof newValue === 'number' && !isNaN(newValue) ? newValue : 0;
  
  // Handle division by zero
  if (oldNum === 0) {
    return newNum === 0 ? 0 : 100; // If both are 0, no change; if old is 0 and new isn't, 100% increase
  }
  
  const change = newNum - oldNum;
  const percentageChange = (change / Math.abs(oldNum)) * 100;
  
  return safeRound(percentageChange, 1);
};

/**
 * Validate and sanitize numerical input
 * @param {any} input - Input value to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with sanitized value
 */
export const validateNumericalInput = (input, options = {}) => {
  const {
    min = -Infinity,
    max = Infinity,
    allowDecimals = true,
    defaultValue = 0
  } = options;
  
  let value = defaultValue;
  let isValid = true;
  const errors = [];
  
  try {
    // Handle different input types
    if (typeof input === 'number') {
      value = input;
    } else if (typeof input === 'string') {
      // Clean string input
      const cleaned = input.replace(/[^0-9.-]/g, '');
      value = parseFloat(cleaned);
    } else {
      errors.push('Input must be a number or string');
      isValid = false;
      value = defaultValue;
    }
    
    // Check if value is valid number
    if (isNaN(value)) {
      errors.push('Input is not a valid number');
      isValid = false;
      value = defaultValue;
    } else {
      // Check bounds
      if (value < min) {
        errors.push(`Value is below minimum (${min})`);
        value = min;
        isValid = false;
      }
      
      if (value > max) {
        errors.push(`Value is above maximum (${max})`);
        value = max;
        isValid = false;
      }
      
      // Check decimal constraint
      if (!allowDecimals && value % 1 !== 0) {
        errors.push('Decimals are not allowed');
        value = Math.round(value);
        isValid = false;
      }
    }
    
  } catch (error) {
    console.warn('Error validating numerical input:', error);
    errors.push('Validation error occurred');
    isValid = false;
    value = defaultValue;
  }
  
  return {
    value,
    isValid,
    errors,
    originalInput: input
  };
};

/**
 * Calculate compound savings over time
 * @param {number} monthlySavings - Monthly savings amount
 * @param {number} months - Number of months
 * @param {number} interestRate - Annual interest rate (as decimal, e.g., 0.05 for 5%)
 * @returns {Object} Compound savings calculation result
 */
export const calculateCompoundSavings = (monthlySavings, months, interestRate = 0) => {
  const validMonthlySavings = validateNumericalInput(monthlySavings, { min: 0, defaultValue: 0 });
  const validMonths = validateNumericalInput(months, { min: 0, allowDecimals: false, defaultValue: 0 });
  const validInterestRate = validateNumericalInput(interestRate, { min: 0, max: 1, defaultValue: 0 });
  
  if (!validMonthlySavings.isValid || !validMonths.isValid) {
    return {
      totalSaved: 0,
      totalInterest: 0,
      finalAmount: 0,
      errors: [...validMonthlySavings.errors, ...validMonths.errors, ...validInterestRate.errors]
    };
  }
  
  const monthly = validMonthlySavings.value;
  const numMonths = validMonths.value;
  const rate = validInterestRate.value;
  
  if (rate === 0) {
    // Simple savings without interest
    const totalSaved = monthly * numMonths;
    return {
      totalSaved,
      totalInterest: 0,
      finalAmount: totalSaved,
      errors: []
    };
  }
  
  // Compound interest calculation
  const monthlyRate = rate / 12;
  let totalAmount = 0;
  
  for (let i = 0; i < numMonths; i++) {
    totalAmount = (totalAmount + monthly) * (1 + monthlyRate);
  }
  
  const totalSaved = monthly * numMonths;
  const totalInterest = totalAmount - totalSaved;
  
  return {
    totalSaved: safeRound(totalSaved),
    totalInterest: safeRound(totalInterest),
    finalAmount: safeRound(totalAmount),
    errors: []
  };
};

// src/utils/ErrorHandling.js

/**
 * Centralized error handling utility
 * Provides standardized error logging, formatting, and user-friendly messages
 */
const ErrorHandling = {
  /**
   * Log an error with context information
   * @param {Error} error - The error object
   * @param {string} context - Where the error occurred (component/function name)
   * @param {Object} additionalInfo - Any additional information about the error
   */
  logError(error, context, additionalInfo = {}) {
    console.error(`Error in ${context}:`, error);

    // Combine all information for logging
    const errorDetails = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context,
      ...additionalInfo,
    };

    // Log to console in development
    if (process.env.NODE_ENV !== "production") {
      console.group(`🔴 Error Details (${context})`);
      console.log(JSON.stringify(errorDetails, null, 2));
      console.groupEnd();
    }

    // In a real application, you would send this to a monitoring service
    // Example: MonitoringService.reportError(errorDetails);
  },

  /**
   * Get a user-friendly error message based on error type
   * @param {Error} error - The error object
   * @param {string} fallbackMessage - Default message if no specific one is found
   * @returns {string} User-friendly error message
   */
  getUserFriendlyMessage(
    error,
    fallbackMessage = "Something went wrong. Please try again."
  ) {
    // Common error types and their user-friendly messages
    const errorMessages = {
      TypeError:
        "There was a problem with the data format. Please check your inputs.",
      ReferenceError:
        "There was a problem with the application. Please refresh the page.",
      RangeError:
        "One of the values is outside the acceptable range. Please check your inputs.",
      NetworkError:
        "There was a problem connecting to the server. Please check your internet connection.",
      ValidationError:
        "Please check the highlighted fields and correct the errors.",
    };

    // Return specific message if available, otherwise use fallback
    if (error.name && errorMessages[error.name]) {
      return errorMessages[error.name];
    }

    // Check for validation errors in message
    if (error.message && error.message.toLowerCase().includes("validation")) {
      return errorMessages.ValidationError;
    }

    return fallbackMessage;
  },

  /**
   * Create a validation error
   * @param {string} message - Error message
   * @param {Object} validationResults - Field validation results
   * @returns {Error} Custom validation error
   */
  createValidationError(message, validationResults = {}) {
    const error = new Error(message);
    error.name = "ValidationError";
    error.validationResults = validationResults;
    return error;
  },

  /**
   * Validate input data with given validation rules
   * @param {Object} data - Data to validate
   * @param {Object} validationRules - Rules for validation
   * @returns {Object} Validation result with isValid flag and errors
   */
  validateInput(data, validationRules) {
    const errors = {};
    let hasErrors = false;

    // Apply each validation rule
    Object.entries(validationRules).forEach(([field, rules]) => {
      if (!data[field]) {
        // Handle missing field
        if (rules.required) {
          errors[field] = "This field is required";
          hasErrors = true;
        }
        return;
      }

      // Apply specific validation rules
      if (rules.min && data[field] < rules.min) {
        errors[field] = `Value must be at least ${rules.min}`;
        hasErrors = true;
      }

      if (rules.max && data[field] > rules.max) {
        errors[field] = `Value must be at most ${rules.max}`;
        hasErrors = true;
      }

      if (rules.pattern && !rules.pattern.test(data[field])) {
        errors[field] = rules.message || "Invalid format";
        hasErrors = true;
      }

      if (rules.custom && typeof rules.custom === "function") {
        const customResult = rules.custom(data[field], data);
        if (customResult !== true) {
          errors[field] = customResult;
          hasErrors = true;
        }
      }
    });

    return {
      isValid: !hasErrors,
      errors,
    };
  },

  /**
   * Safely execute a function with proper error handling
   * @param {Function} fn - Function to execute
   * @param {Array} args - Arguments to pass to the function
   * @param {string} context - Context for error reporting
   * @param {Function} onError - Optional error handler
   * @returns {any} Function result or undefined on error
   */
  tryCatch(fn, args = [], context = "unknown", onError = null) {
    try {
      return fn(...args);
    } catch (error) {
      this.logError(error, context);

      if (onError && typeof onError === "function") {
        onError(error);
      }

      return undefined;
    }
  },

  /**
   * Format error for screen reader announcements
   * @param {Error|string} error - Error object or message
   * @returns {string} Formatted message for screen readers
   */
  formatForScreenReader(error) {
    const message =
      typeof error === "string" ? error : this.getUserFriendlyMessage(error);

    return `Error: ${message}. Please review the form for details.`;
  },
};

export default ErrorHandling;

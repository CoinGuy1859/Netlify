// src/utils/AccessibilityUtils.js

/**
 * Accessibility utility functions
 * Centralizes accessibility-focused features for a better user experience
 */
const AccessibilityUtils = {
  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - 'polite' (default) or 'assertive'
   * @param {number} timeout - Time in ms before clearning the announcement
   */
  announceToScreenReader(message, priority = "polite", timeout = 5000) {
    if (!message) return;

    try {
      // Get or create the appropriate region based on priority
      const regionId =
        priority === "assertive"
          ? "assertive-announcements"
          : "polite-announcements";

      let region = document.getElementById(regionId);

      // Create region if it doesn't exist
      if (!region) {
        region = document.createElement("div");
        region.id = regionId;
        region.setAttribute("aria-live", priority);
        region.setAttribute("aria-atomic", "true");
        region.className = "sr-only";
        document.body.appendChild(region);
      }

      // Update announcement
      region.textContent = message;

      // Clear after timeout to prevent stale announcements
      if (timeout > 0) {
        setTimeout(() => {
          if (region.textContent === message) {
            region.textContent = "";
          }
        }, timeout);
      }
    } catch (error) {
      console.error("Error announcing to screen reader:", error);
    }
  },

  /**
   * Apply enhanced focus management
   * @param {string} targetId - ID of element to focus
   * @param {Object} options - Configuration options
   */
  focusElement(targetId, options = {}) {
    const {
      scrollToView = true,
      preventScroll = false,
      announceContext = false,
      delay = 0,
    } = options;

    try {
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (!element) return;

        // Set focus with browser's native focus
        element.focus({ preventScroll });

        // Optionally scroll into view (useful for mobile/responsive layouts)
        if (scrollToView && !preventScroll) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }

        // Optionally announce what was focused for added context
        if (announceContext) {
          const elementLabel =
            element.getAttribute("aria-label") ||
            element.textContent ||
            element.placeholder ||
            element.name ||
            targetId;

          this.announceToScreenReader(`Focused: ${elementLabel}`, "polite");
        }
      }, delay);
    } catch (error) {
      console.error("Error focusing element:", error);
    }
  },

  /**
   * Create accessible keyboard shortcuts
   * @param {Object} shortcutMap - Map of key combinations to handler functions
   * @returns {Function} Event handler to attach to keydown events
   */
  createKeyboardShortcuts(shortcutMap) {
    return (event) => {
      // Ignore if in an input field or textarea
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA" ||
        event.target.isContentEditable
      ) {
        return;
      }

      // Generate key signature (e.g., "Ctrl+Alt+K")
      const keySignature = [
        event.ctrlKey ? "Ctrl" : "",
        event.altKey ? "Alt" : "",
        event.shiftKey ? "Shift" : "",
        event.metaKey ? "Meta" : "",
        event.key,
      ]
        .filter(Boolean)
        .join("+");

      // Execute handler if it exists
      if (
        shortcutMap[keySignature] &&
        typeof shortcutMap[keySignature] === "function"
      ) {
        event.preventDefault();
        shortcutMap[keySignature](event);
        return true;
      }

      return false;
    };
  },

  /**
   * Enhance a component with consistent aria attributes
   * @param {Object} component - Component properties
   * @returns {Object} Component with enhanced aria attributes
   */
  enhanceAriaLabels(component) {
    const { label, description, id, type } = component;

    if (!label) return component;

    const enhancedProps = { ...component };

    // Generate ID if not provided
    const elementId =
      id || `${type}-${Math.random().toString(36).substr(2, 9)}`;

    // Set up attributes
    enhancedProps.id = elementId;
    enhancedProps.ariaLabel = enhancedProps.ariaLabel || label;

    // If there's a description, create a unique description ID
    if (description) {
      const descriptionId = `${elementId}-description`;
      enhancedProps.ariaDescribedby = descriptionId;
      enhancedProps.descriptionId = descriptionId;
    }

    return enhancedProps;
  },

  /**
   * Check if reduced motion is preferred by the user
   * @returns {boolean} True if user prefers reduced motion
   */
  prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },

  /**
   * Generate a descriptive alt text for an image
   * @param {string} imageName - Base name of the image
   * @param {Object} context - Additional context information
   * @returns {string} Descriptive alt text
   */
  generateDescriptiveAlt(imageName, context = {}) {
    const altTextTemplates = {
      logo: "Discovery Place logo",
      science_icon: "Discovery Place Science icon",
      kids_icon: "Discovery Place Kids icon",
      welcome_icon: "Discovery Place Welcome Program icon",
    };

    // Use template if available, otherwise generate based on name
    const baseAlt =
      altTextTemplates[imageName] ||
      imageName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    // Add context if available
    if (context.location) {
      return `${baseAlt} for ${context.location}`;
    }

    return baseAlt;
  },

  /**
   * Create accessible error message ID for form controls
   * @param {string} inputId - ID of the input element
   * @returns {string} ID for error message element
   */
  createErrorMessageId(inputId) {
    return `${inputId}-error`;
  },
};

export default AccessibilityUtils;

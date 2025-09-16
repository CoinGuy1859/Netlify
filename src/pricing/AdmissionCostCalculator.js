// pricing/AdmissionCostCalculator.js
import { PricingConfig } from "./PricingConfig";

/**
 * Enhanced Admission Cost Calculator
 * Handles calculations related to general admission costs
 * Enhanced with comprehensive error handling, validation, and edge case management
 */
export const AdmissionCostCalculator = {
  /**
   * Calculate admission cost for a single visit to a specific location with enhanced validation
   * @param {Object} options - Calculation options
   * @returns {number} Total admission cost for one visit
   */
  calculateSingleVisitCost(options) {
    try {
      // Enhanced input validation and defaults
      const {
        location,
        adultCount = 0,
        childAges = [],
        isRichmondResident = false,
      } = options || {};

      // Validate required parameters
      if (!location || typeof location !== 'string') {
        console.error("Invalid or missing location in calculateSingleVisitCost:", location);
        return 0;
      }

      // Validate and sanitize adult count
      const validAdultCount = this.validateAdultCount(adultCount);
      if (validAdultCount < 0) {
        console.error("Invalid adult count:", adultCount);
        return 0;
      }

      // Validate and sanitize child ages
      const validChildAges = this.validateChildAges(childAges);

      // Get location pricing data
      const locationPrices = this.getLocationPrices(location);
      if (!locationPrices) {
        console.error("No pricing data found for location:", location);
        return 0;
      }

      // Count eligible children based on age thresholds
      const eligibleChildrenCount = this.countEligibleChildren(
        validChildAges,
        locationPrices.childAgeThreshold
      );

      // Get appropriate pricing based on location and residency
      const { adultPrice, childPrice } = this.getPricing(
        location,
        locationPrices,
        isRichmondResident
      );

      // Calculate total cost with bounds checking
      const totalCost = (validAdultCount * adultPrice) + (eligibleChildrenCount * childPrice);
      
      // Ensure result is valid and within reasonable bounds
      return Math.max(0, Math.min(totalCost, 10000)); // Cap at $10,000 to prevent extreme values

    } catch (error) {
      console.error("Error in calculateSingleVisitCost:", error);
      return 0;
    }
  },

  /**
   * Validate adult count with enhanced error handling
   * @param {any} adultCount - Adult count to validate
   * @returns {number} Valid adult count
   */
  validateAdultCount(adultCount) {
    if (typeof adultCount === 'string') {
      const parsed = parseInt(adultCount, 10);
      if (isNaN(parsed)) return 0;
      adultCount = parsed;
    }
    
    if (typeof adultCount !== 'number' || isNaN(adultCount)) {
      return 0;
    }
    
    // Ensure within reasonable bounds
    return Math.max(0, Math.min(20, Math.floor(adultCount)));
  },

  /**
   * Validate and sanitize child ages array
   * @param {any} childAges - Child ages to validate
   * @returns {Array} Valid child ages array
   */
  validateChildAges(childAges) {
    if (!Array.isArray(childAges)) {
      return [];
    }
    
    return childAges.filter(age => {
      // Convert to number if it's a string
      const numAge = typeof age === 'string' ? parseInt(age, 10) : age;
      
      // Check if it's a valid number within reasonable bounds
      return typeof numAge === 'number' && 
             !isNaN(numAge) && 
             numAge >= 0 && 
             numAge <= 18;
    }).map(age => typeof age === 'string' ? parseInt(age, 10) : age);
  },

  /**
   * Get pricing data for a specific location with enhanced validation
   * @param {string} location - Location code
   * @returns {Object|null} Location pricing data or null if invalid
   */
  getLocationPrices(location) {
    try {
      if (!location || typeof location !== 'string') {
        console.error("Invalid location parameter:", location);
        return null;
      }

      const normalizedLocation = location.trim().toUpperCase();
      
      // Map common variations to standard location codes
      const locationMap = {
        'SCIENCE': 'Science',
        'DPS': 'Science',
        'DPKH': 'DPKH',
        'HUNTERSVILLE': 'DPKH',
        'KIDS-HUNTERSVILLE': 'DPKH',
        'DPKR': 'DPKR',
        'ROCKINGHAM': 'DPKR',
        'KIDS-ROCKINGHAM': 'DPKR'
      };

      const standardLocation = locationMap[normalizedLocation] || location;
      const locationPrices = PricingConfig.AdmissionPrices[standardLocation];

      if (!locationPrices) {
        console.error(`Invalid location: ${location}. Available locations:`, Object.keys(PricingConfig.AdmissionPrices));
        return null;
      }

      // Validate pricing structure
      if (typeof locationPrices.adult !== 'number' || 
          typeof locationPrices.child !== 'number' || 
          typeof locationPrices.childAgeThreshold !== 'number') {
        console.error("Invalid pricing structure for location:", standardLocation, locationPrices);
        return null;
      }

      return locationPrices;

    } catch (error) {
      console.error("Error getting location prices:", error);
      return null;
    }
  },

  /**
   * Count eligible children based on age threshold with enhanced validation
   * @param {Array} childAges - Array of child ages
   * @param {number} ageThreshold - Minimum age for paid admission
   * @returns {number} Count of eligible children
   */
  countEligibleChildren(childAges, ageThreshold) {
    try {
      if (!Array.isArray(childAges)) {
        console.warn("Child ages is not an array:", childAges);
        return 0;
      }

      if (typeof ageThreshold !== 'number' || isNaN(ageThreshold)) {
        console.warn("Invalid age threshold:", ageThreshold);
        return 0;
      }

      const validThreshold = Math.max(0, Math.min(18, ageThreshold));

      return childAges.filter(age => {
        const numAge = typeof age === 'number' ? age : parseInt(age, 10);
        return !isNaN(numAge) && numAge >= validThreshold && numAge <= 18;
      }).length;

    } catch (error) {
      console.error("Error counting eligible children:", error);
      return 0;
    }
  },

  /**
   * Get appropriate pricing based on location and residency with enhanced validation
   * @param {string} location - Location code
   * @param {Object} locationPrices - Location pricing data
   * @param {boolean} isRichmondResident - Whether visitor is Richmond resident
   * @returns {Object} Adult and child prices
   */
  getPricing(location, locationPrices, isRichmondResident) {
    try {
      // Default pricing structure
      let adultPrice = 0;
      let childPrice = 0;

      // Handle special case for Rockingham with resident pricing
      if (location === "DPKR" && locationPrices.standard && locationPrices.resident) {
        const priceCategory = isRichmondResident ? locationPrices.resident : locationPrices.standard;
        
        // Validate pricing structure
        if (typeof priceCategory.adult === 'number' && typeof priceCategory.child === 'number') {
          adultPrice = Math.max(0, priceCategory.adult);
          childPrice = Math.max(0, priceCategory.child);
        } else {
          console.error("Invalid DPKR pricing structure:", priceCategory);
        }
      } else {
        // Standard pricing for other locations
        if (typeof locationPrices.adult === 'number' && typeof locationPrices.child === 'number') {
          adultPrice = Math.max(0, locationPrices.adult);
          childPrice = Math.max(0, locationPrices.child);
        } else {
          console.error("Invalid standard pricing structure:", locationPrices);
        }
      }

      // Ensure prices are within reasonable bounds
      return {
        adultPrice: Math.min(adultPrice, 100), // Cap at $100 per adult
        childPrice: Math.min(childPrice, 100)  // Cap at $100 per child
      };

    } catch (error) {
      console.error("Error getting pricing:", error);
      return { adultPrice: 0, childPrice: 0 };
    }
  },

  /**
   * Calculate total regular admission costs for multiple visits with enhanced validation
   * @param {Object} options - Calculation options
   * @returns {number} Total regular admission cost
   */
  calculateRegularAdmissionCost(options) {
    try {
      const {
        adultCount = 0,
        childAges = [],
        scienceVisits = 0,
        dpkhVisits = 0,
        dpkrVisits = 0,
        isRichmondResident = false,
        includeParking = true,
      } = options || {};

      // Validate inputs
      const validOptions = this.validateRegularAdmissionInputs({
        adultCount,
        childAges,
        scienceVisits,
        dpkhVisits,
        dpkrVisits,
        isRichmondResident,
        includeParking
      });

      if (!validOptions.isValid) {
        console.warn("Invalid inputs for regular admission calculation:", validOptions.errors);
        return 0;
      }

      // Calculate costs by location
      const costsByLocation = this.calculateCostsByLocation({
        adultCount: validOptions.adultCount,
        childAges: validOptions.childAges,
        scienceVisits: validOptions.scienceVisits,
        dpkhVisits: validOptions.dpkhVisits,
        dpkrVisits: validOptions.dpkrVisits,
        isRichmondResident: validOptions.isRichmondResident,
      });

      // Calculate parking costs
      const parkingCost = validOptions.includeParking
        ? this.calculateParkingCost(validOptions.scienceVisits, false)
        : 0;

      // Calculate total cost
      const totalCost = costsByLocation.scienceCost + 
                       costsByLocation.dpkhCost + 
                       costsByLocation.dpkrCost + 
                       parkingCost;

      // Log calculation details for debugging
      if (process.env.NODE_ENV === 'development') {
        this.logCalculationDetails(costsByLocation, parkingCost, totalCost);
      }

      return Math.max(0, totalCost);

    } catch (error) {
      console.error("Error calculating regular admission cost:", error);
      return 0;
    }
  },

  /**
   * Validate regular admission calculation inputs
   * @param {Object} inputs - Input parameters
   * @returns {Object} Validation result with sanitized inputs
   */
  validateRegularAdmissionInputs(inputs) {
    const errors = [];
    let isValid = true;

    // Validate adult count
    const adultCount = this.validateAdultCount(inputs.adultCount);
    if (adultCount !== inputs.adultCount) {
      errors.push(`Adult count adjusted from ${inputs.adultCount} to ${adultCount}`);
    }

    // Validate child ages
    const childAges = this.validateChildAges(inputs.childAges);
    if (childAges.length !== (inputs.childAges?.length || 0)) {
      errors.push(`Some child ages were invalid and removed`);
    }

    // Validate visit counts
    const scienceVisits = this.validateVisitCount(inputs.scienceVisits, 'Science');
    const dpkhVisits = this.validateVisitCount(inputs.dpkhVisits, 'DPKH');
    const dpkrVisits = this.validateVisitCount(inputs.dpkrVisits, 'DPKR');

    // Check if any visits are planned
    if (scienceVisits + dpkhVisits + dpkrVisits === 0) {
      errors.push('At least one visit must be planned');
      isValid = false;
    }

    // Validate boolean inputs
    const isRichmondResident = Boolean(inputs.isRichmondResident);
    const includeParking = Boolean(inputs.includeParking);

    return {
      isValid,
      errors,
      adultCount,
      childAges,
      scienceVisits,
      dpkhVisits,
      dpkrVisits,
      isRichmondResident,
      includeParking
    };
  },

  /**
   * Validate visit count input
   * @param {any} visitCount - Visit count to validate
   * @param {string} location - Location name for error reporting
   * @returns {number} Valid visit count
   */
  validateVisitCount(visitCount, location) {
    if (typeof visitCount === 'string') {
      const parsed = parseInt(visitCount, 10);
      if (isNaN(parsed)) return 0;
      visitCount = parsed;
    }
    
    if (typeof visitCount !== 'number' || isNaN(visitCount)) {
      return 0;
    }
    
    // Ensure within reasonable bounds
    const maxVisits = PricingConfig.Constraints?.MAX_VISITS_PER_LOCATION || 50;
    return Math.max(0, Math.min(maxVisits, Math.floor(visitCount)));
  },

  /**
   * Calculate costs by location with enhanced error handling
   * @param {Object} options - Calculation options
   * @returns {Object} Costs broken down by location
   */
  calculateCostsByLocation(options) {
    try {
      const {
        adultCount,
        childAges,
        scienceVisits,
        dpkhVisits,
        dpkrVisits,
        isRichmondResident,
      } = options;

      const scienceCost = scienceVisits > 0
        ? this.calculateSingleVisitCost({
            location: "Science",
            adultCount,
            childAges,
            isRichmondResident,
          }) * scienceVisits
        : 0;

      const dpkhCost = dpkhVisits > 0
        ? this.calculateSingleVisitCost({
            location: "DPKH",
            adultCount,
            childAges,
            isRichmondResident,
          }) * dpkhVisits
        : 0;

      const dpkrCost = dpkrVisits > 0
        ? this.calculateSingleVisitCost({
            location: "DPKR",
            adultCount,
            childAges,
            isRichmondResident,
          }) * dpkrVisits
        : 0;

      return {
        scienceCost: Math.max(0, scienceCost),
        dpkhCost: Math.max(0, dpkhCost),
        dpkrCost: Math.max(0, dpkrCost),
      };

    } catch (error) {
      console.error("Error calculating costs by location:", error);
      return {
        scienceCost: 0,
        dpkhCost: 0,
        dpkrCost: 0,
      };
    }
  },

  /**
   * Log calculation details for debugging with enhanced formatting
   * @param {Object} costsByLocation - Costs by location
   * @param {number} parkingCost - Parking cost
   * @param {number} totalCost - Total cost
   */
  logCalculationDetails(costsByLocation, parkingCost, totalCost) {
    if (process.env.NODE_ENV !== 'development') return;

    try {
      console.group("🧮 Regular Admission Calculation Details");
      console.log("📍 Science visits cost:", this.formatCurrency(costsByLocation.scienceCost));
      console.log("📍 DPKH visits cost:", this.formatCurrency(costsByLocation.dpkhCost));
      console.log("📍 DPKR visits cost:", this.formatCurrency(costsByLocation.dpkrCost));
      console.log("🚗 Parking cost:", this.formatCurrency(parkingCost));
      console.log("💰 Total regular admission cost:", this.formatCurrency(totalCost));
      console.groupEnd();
    } catch (error) {
      console.warn("Error logging calculation details:", error);
    }
  },

  /**
   * Format currency for logging
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  formatCurrency(amount) {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount || 0);
    } catch (error) {
      return `$${(amount || 0).toFixed(2)}`;
    }
  },

  /**
   * Calculate parking costs with enhanced validation
   * @param {number} visitCount - Number of visits
   * @param {boolean} hasMembershipAccess - Whether visitor has membership or Welcome Program access
   * @returns {number} Total parking cost
   */
  calculateParkingCost(visitCount, hasMembershipAccess = false) {
    try {
      // Input validation
      const validVisitCount = this.validateVisitCount(visitCount, 'parking');
      if (validVisitCount <= 0) return 0;

      // Get parking rates from configuration
      const parkingRates = PricingConfig.ParkingRates;
      if (!parkingRates) {
        console.error("Parking rates not found in configuration");
        return 0;
      }

      // Get appropriate parking rate
      const parkingRate = hasMembershipAccess
        ? (parkingRates.member || parkingRates.welcome || 8) // Fallback to $8
        : (parkingRates.standard || 18); // Fallback to $18

      // Ensure parking rate is valid
      const validParkingRate = Math.max(0, Math.min(50, parkingRate)); // Cap at $50

      // Get constraints from configuration
      const maxVisits = PricingConfig.Constraints?.MAX_VISITS_PER_LOCATION || 50;
      const cappedVisits = Math.min(validVisitCount, maxVisits);

      return cappedVisits * validParkingRate;

    } catch (error) {
      console.error("Error calculating parking cost:", error);
      return 0;
    }
  },

  /**
   * Cap visits to maximum allowed value with enhanced validation
   * @param {number} visits - Visit count to cap
   * @param {number} maxVisits - Maximum allowed visits
   * @returns {number} Capped visit count
   */
  capVisits(visits, maxVisits) {
    try {
      const validVisits = this.validateVisitCount(visits, 'cap');
      const validMax = typeof maxVisits === 'number' && !isNaN(maxVisits) && maxVisits > 0 
        ? maxVisits 
        : (PricingConfig.Constraints?.MAX_VISITS_PER_LOCATION || 50);

      return Math.min(validVisits, validMax);

    } catch (error) {
      console.error("Error capping visits:", error);
      return 0;
    }
  },

  /**
   * Count total visits across all locations with validation
   * @param {number} scienceVisits - Science visits
   * @param {number} dpkhVisits - DPKH visits
   * @param {number} dpkrVisits - DPKR visits
   * @returns {number} Total visit count
   */
  countTotalVisits(scienceVisits, dpkhVisits, dpkrVisits) {
    try {
      const validScienceVisits = this.validateVisitCount(scienceVisits, 'Science');
      const validDpkhVisits = this.validateVisitCount(dpkhVisits, 'DPKH');
      const validDpkrVisits = this.validateVisitCount(dpkrVisits, 'DPKR');

      return validScienceVisits + validDpkhVisits + validDpkrVisits;

    } catch (error) {
      console.error("Error counting total visits:", error);
      return 0;
    }
  },

  /**
   * Determine primary location based on visit distribution with enhanced logic
   * @param {number} scienceVisits - Science visits
   * @param {number} dpkhVisits - DPKH visits  
   * @param {number} dpkrVisits - DPKR visits
   * @returns {string} Primary location code
   */
  determinePrimaryLocation(scienceVisits, dpkhVisits, dpkrVisits) {
    try {
      const validScienceVisits = this.validateVisitCount(scienceVisits, 'Science');
      const validDpkhVisits = this.validateVisitCount(dpkhVisits, 'DPKH');
      const validDpkrVisits = this.validateVisitCount(dpkrVisits, 'DPKR');

      // If no visits, default to Science
      if (validScienceVisits + validDpkhVisits + validDpkrVisits === 0) {
        return "Science";
      }

      // Find location with most visits
      const visitCounts = [
        { location: "Science", visits: validScienceVisits },
        { location: "DPKH", visits: validDpkhVisits },
        { location: "DPKR", visits: validDpkrVisits }
      ];

      // Sort by visit count (descending)
      visitCounts.sort((a, b) => b.visits - a.visits);

      // Return location with most visits, prefer Science in case of tie
      if (visitCounts[0].visits === visitCounts[1].visits && visitCounts.some(v => v.location === "Science")) {
        return "Science";
      }

      return visitCounts[0].location;

    } catch (error) {
      console.error("Error determining primary location:", error);
      return "Science"; // Safe fallback
    }
  },

  /**
   * Get location display name for user-friendly output
   * @param {string} locationCode - Location code
   * @returns {string} Display name
   */
  getLocationDisplayName(locationCode) {
    const displayNames = {
      'Science': 'Discovery Place Science',
      'DPKH': 'Discovery Place Kids-Huntersville',
      'DPKR': 'Discovery Place Kids-Rockingham'
    };

    return displayNames[locationCode] || locationCode;
  }
};

export default AdmissionCostCalculator;

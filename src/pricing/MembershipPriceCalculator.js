// pricing/MembershipPriceCalculator.js
import { PricingConfig } from "./PricingConfig";
import { DiscountService } from "./DiscountService";
import { AdmissionCostCalculator } from "./AdmissionCostCalculator";

/**
 * Membership Price Calculator
 * Handles calculations related to membership pricing and recommendations
 * Enhanced with comprehensive error handling and validation
 */
export const MembershipPriceCalculator = {
  /**
   * Get base membership price with enhanced validation
   * @param {string} type - Membership type
   * @param {number} memberCount - Number of family members
   * @returns {number} Base price for the membership
   */
  getMembershipPrice(type, memberCount) {
    // Enhanced input validation
    if (!type || typeof memberCount !== 'number' || memberCount <= 0) {
      console.warn('Invalid input to getMembershipPrice:', { type, memberCount });
      return 0;
    }

    // Check if membership type exists
    if (!PricingConfig.MembershipPrices[type]) {
      console.warn('Unknown membership type:', type);
      return 0;
    }

    const priceArray = PricingConfig.MembershipPrices[type];
    
    // Cap memberCount to avoid array out-of-bounds
    const cappedMemberCount = Math.min(memberCount, priceArray.length);

    // Special case: DPKH, DPKR, and ScienceKids don't offer 1-person memberships
    if (["DPKH", "DPKR", "ScienceKids"].includes(type) && memberCount === 1) {
      // Return the 2-person price if it exists
      return priceArray.length > 1 ? priceArray[1] : 0;
    }

    // ScienceBasic is only available for 1 person
    if (type === "ScienceBasic" && memberCount > 1) {
      console.warn('ScienceBasic membership is only available for 1 person');
      return 0; // Invalid configuration
    }

    // Safe array access
    const arrayIndex = cappedMemberCount - 1;
    if (arrayIndex >= 0 && arrayIndex < priceArray.length) {
      return priceArray[arrayIndex];
    }

    console.warn('Price not found for membership type:', type, 'member count:', memberCount);
    return 0;
  },

  /**
   * Calculate comprehensive membership costs and determine recommendation
   * @param {Object} options - Calculation options
   * @returns {Object} Detailed membership calculation results
   */
  calculateMembershipCosts(options) {
    try {
      const {
        adultCount = 0,
        childrenCount = 0,
        childAges = [],
        scienceVisits = 0,
        dpkhVisits = 0,
        dpkrVisits = 0,
        isRichmondResident = false,
        needsFlexibility = false,
        isWelcomeEligible = false,
        includeParking = true,
      } = options;

      // Enhanced input validation
      const validatedInputs = this.validateCalculationInputs({
        adultCount,
        childrenCount,
        childAges,
        scienceVisits,
        dpkhVisits,
        dpkrVisits
      });

      if (!validatedInputs.isValid) {
        console.warn(`Invalid calculation inputs: ${validatedInputs.errors.join(', ')}`);
        // Continue with validated values rather than failing completely
      }

      // Use validated inputs
      const {
        validAdultCount,
        validChildrenCount,
        validChildAges,
        validScienceVisits,
        validDpkhVisits,
        validDpkrVisits
      } = validatedInputs;

      // Calculate eligible family members with proper filtering
      const eligibleChildrenCount = validChildAges.filter((age) => 
        typeof age === 'number' && age >= 2 && age <= 18
      ).length;
      
      const totalFamilyMembers = Math.min(
        PricingConfig.Constraints?.MAX_ADULTS + PricingConfig.Constraints?.MAX_CHILDREN || 10,
        validAdultCount + eligibleChildrenCount
      );

      // Determine primary location
      const primaryLocation = AdmissionCostCalculator.determinePrimaryLocation(
        validScienceVisits,
        validDpkhVisits,
        validDpkrVisits
      );

      // Calculate guest admission savings with detailed breakdown
      const guestAdmissionSavingsData = DiscountService.calculateGuestAdmissionSavings({
        adultCount: validAdultCount,
        childAges: validChildAges,
        scienceVisits: validScienceVisits,
        dpkhVisits: validDpkhVisits,
        dpkrVisits: validDpkrVisits,
        isRichmondResident,
        primaryLocation,
      });

      const guestAdmissionSavings = guestAdmissionSavingsData?.total || 0;
      const guestSavingsBreakdown = guestAdmissionSavingsData?.breakdown || [];

      // Cap visits to prevent calculation overflow
      const cappedScienceVisits = Math.min(
        validScienceVisits,
        PricingConfig.Constraints?.MAX_VISITS_PER_LOCATION || 50
      );
      const cappedDpkhVisits = Math.min(
        validDpkhVisits,
        PricingConfig.Constraints?.MAX_VISITS_PER_LOCATION || 50
      );
      const cappedDpkrVisits = Math.min(
        validDpkrVisits,
        PricingConfig.Constraints?.MAX_VISITS_PER_LOCATION || 50
      );

      const totalVisits = AdmissionCostCalculator.countTotalVisits(
        cappedScienceVisits,
        cappedDpkhVisits,
        cappedDpkrVisits
      );

      // Calculate regular admission cost (what they would pay without membership)
      const regularAdmissionCost = AdmissionCostCalculator.calculateRegularAdmissionCost({
        adultCount: validAdultCount,
        childAges: validChildAges,
        scienceVisits: cappedScienceVisits,
        dpkhVisits: cappedDpkhVisits,
        dpkrVisits: cappedDpkrVisits,
        isRichmondResident,
        includeParking,
      });

      // Calculate membership costs for different options
      const scienceMembershipCost = this.getMembershipPrice("Science", totalFamilyMembers);
      const scienceBasicMembershipCost = totalFamilyMembers === 1 ? this.getMembershipPrice("ScienceBasic", 1) : 0;
      const dpkhMembershipCost = this.getMembershipPrice("DPKH", totalFamilyMembers);
      const dpkrMembershipCost = this.getMembershipPrice("DPKR", totalFamilyMembers);
      const scienceKidsMembershipCost = this.getMembershipPrice("ScienceKids", totalFamilyMembers);

      // Apply promotional discounts
      const scienceDiscountInfo = DiscountService.applyDiscount("Science", scienceMembershipCost);
      const scienceDiscountEligible = scienceDiscountInfo.discountApplied;
      const sciencePromoCost = scienceDiscountInfo.finalPrice;

      // ScienceBasic is not eligible for promotional discounts
      const scienceBasicDiscountInfo = { discountApplied: false, finalPrice: scienceBasicMembershipCost };
      const scienceBasicDiscountEligible = false;
      const scienceBasicPromoCost = scienceBasicMembershipCost;

      const dpkhDiscountInfo = DiscountService.applyDiscount("DPKH", dpkhMembershipCost);
      const dpkhDiscountEligible = dpkhDiscountInfo.discountApplied;
      const dpkhMembershipPromoCost = dpkhDiscountInfo.finalPrice;

      const dpkrDiscountInfo = DiscountService.applyDiscount("DPKR", dpkrMembershipCost);
      const dpkrDiscountEligible = dpkrDiscountInfo.discountApplied;
      const dpkrMembershipPromoCost = dpkrDiscountInfo.finalPrice;

      const scienceKidsDiscountInfo = DiscountService.applyDiscount("ScienceKids", scienceKidsMembershipCost);
      const scienceKidsDiscountEligible = scienceKidsDiscountInfo.discountApplied;
      const scienceKidsPromoCost = scienceKidsDiscountInfo.finalPrice;

      // Calculate parking costs (only for Science visits)
      const parkingCost = includeParking && cappedScienceVisits > 0
        ? AdmissionCostCalculator.calculateParkingCost(cappedScienceVisits, true)
        : 0;

      // Calculate cross-location costs for each membership type
      const scienceCrossLocationCosts = this.calculateCrossLocationCosts({
        adultCount: validAdultCount,
        childAges: validChildAges,
        membershipType: "Science",
        scienceVisits: 0, // Don't include visits to home location
        dpkhVisits: cappedDpkhVisits,
        dpkrVisits: cappedDpkrVisits,
        isRichmondResident,
      });

      // ScienceBasic has NO cross-location discounts - pays full price
      const scienceBasicCrossLocationCosts = this.calculateCrossLocationCosts({
        adultCount: validAdultCount,
        childAges: validChildAges,
        membershipType: "ScienceBasic",
        scienceVisits: 0,
        dpkhVisits: cappedDpkhVisits,
        dpkrVisits: cappedDpkrVisits,
        isRichmondResident,
      });

      const dpkhCrossLocationCosts = this.calculateCrossLocationCosts({
        adultCount: validAdultCount,
        childAges: validChildAges,
        membershipType: "DPKH",
        scienceVisits: cappedScienceVisits,
        dpkhVisits: 0, // Don't include visits to home location
        dpkrVisits: cappedDpkrVisits,
        isRichmondResident,
      });

      const dpkrCrossLocationCosts = this.calculateCrossLocationCosts({
        adultCount: validAdultCount,
        childAges: validChildAges,
        membershipType: "DPKR",
        scienceVisits: cappedScienceVisits,
        dpkhVisits: cappedDpkhVisits,
        dpkrVisits: 0, // Don't include visits to home location
        isRichmondResident,
      });

      // ScienceKids membership has no cross-location costs (covers all locations)
      const scienceKidsCrossLocationCosts = 0;

      // Calculate total costs for all membership types (with parking and cross-location costs)
      const scienceTotalCost = sciencePromoCost + parkingCost + scienceCrossLocationCosts;
      const scienceBasicTotalCost = scienceBasicPromoCost + parkingCost + scienceBasicCrossLocationCosts;
      const dpkhTotalCost = dpkhMembershipPromoCost + parkingCost + dpkhCrossLocationCosts;
      const dpkrTotalCost = dpkrMembershipPromoCost + parkingCost + dpkrCrossLocationCosts;
      const scienceKidsTotalCost = scienceKidsPromoCost + parkingCost;

      // Calculate Welcome Program costs if eligible
      let welcomeProgramOption = null;
      if (isWelcomeEligible) {
        try {
          welcomeProgramOption = DiscountService.calculateWelcomeProgramPricing({
            people: validAdultCount + validChildrenCount,
            adultCount: validAdultCount,
            childrenCount: validChildrenCount,
            type: "membership",
            location: primaryLocation,
            scienceVisits: cappedScienceVisits,
            dpkhVisits: cappedDpkhVisits,
            dpkrVisits: cappedDpkrVisits,
            includeParking,
          });
        } catch (error) {
          console.warn('Error calculating Welcome Program pricing:', error);
          welcomeProgramOption = null;
        }
      }

      // Determine the best option by comparing all costs
      let bestOption = null;
      let minCost = Infinity;

      // Create array of all viable options
      const membershipOptions = [];

      // Add ScienceBasic if available (only for 1 person)
      if (totalFamilyMembers === 1 && scienceBasicMembershipCost > 0) {
        membershipOptions.push({
          type: "ScienceBasic",
          cost: scienceBasicTotalCost,
          baseCost: scienceBasicMembershipCost,
          discountedCost: scienceBasicPromoCost,
          isDiscountEligible: scienceBasicDiscountEligible,
          parkingCost: parkingCost,
          crossLocationCosts: scienceBasicCrossLocationCosts,
        });
      }

      // Add Science membership
      if (scienceMembershipCost > 0) {
        membershipOptions.push({
          type: "Science",
          cost: scienceTotalCost,
          baseCost: scienceMembershipCost,
          discountedCost: sciencePromoCost,
          isDiscountEligible: scienceDiscountEligible,
          parkingCost: parkingCost,
          crossLocationCosts: scienceCrossLocationCosts,
        });
      }

      // Add DPKH membership
      if (dpkhMembershipCost > 0) {
        membershipOptions.push({
          type: "DPKH",
          cost: dpkhTotalCost,
          baseCost: dpkhMembershipCost,
          discountedCost: dpkhMembershipPromoCost,
          isDiscountEligible: dpkhDiscountEligible,
          parkingCost: parkingCost,
          crossLocationCosts: dpkhCrossLocationCosts,
        });
      }

      // Add DPKR membership
      if (dpkrMembershipCost > 0) {
        membershipOptions.push({
          type: "DPKR",
          cost: dpkrTotalCost,
          baseCost: dpkrMembershipCost,
          discountedCost: dpkrMembershipPromoCost,
          isDiscountEligible: dpkrDiscountEligible,
          parkingCost: parkingCost,
          crossLocationCosts: dpkrCrossLocationCosts,
        });
      }

      // Add ScienceKids membership
      if (scienceKidsMembershipCost > 0) {
        membershipOptions.push({
          type: "ScienceKids",
          cost: scienceKidsTotalCost,
          baseCost: scienceKidsMembershipCost,
          discountedCost: scienceKidsPromoCost,
          isDiscountEligible: scienceKidsDiscountEligible,
          parkingCost: parkingCost,
          crossLocationCosts: scienceKidsCrossLocationCosts,
        });
      }

      // Find the cheapest option
      membershipOptions.forEach(option => {
        if (option.cost < minCost) {
          minCost = option.cost;
          bestOption = option;
        }
      });

      // Enhanced logic for Science+Kids preference
      const hasMultipleLocationVisits = (cappedScienceVisits > 0 && (cappedDpkhVisits > 0 || cappedDpkrVisits > 0)) || 
                                       (cappedDpkhVisits > 0 && cappedDpkrVisits > 0);
      
      // If visiting multiple locations significantly, prefer Science+Kids
      if (hasMultipleLocationVisits && totalVisits >= 8) {
        const scienceKidsOption = membershipOptions.find(opt => opt.type === "ScienceKids");
        if (scienceKidsOption && bestOption) {
          const PREFERENCE_MARGIN = 30; // $30 preference margin
          const PREFERENCE_PERCENT = 0.1; // Or 10% of the cheaper option
          
          const costDifference = scienceKidsOption.cost - bestOption.cost;
          const percentDifference = bestOption.cost > 0 ? costDifference / bestOption.cost : 0;
          
          if (scienceKidsOption.cost < bestOption.cost || 
              ((costDifference <= PREFERENCE_MARGIN) || 
               (percentDifference <= PREFERENCE_PERCENT))) {
            bestOption = scienceKidsOption;
          }
        }
      }

      // Consider Welcome Program if eligible
      if (isWelcomeEligible && welcomeProgramOption) {
        // If Welcome Program is significantly cheaper (at least 20% savings)
        if (welcomeProgramOption.totalPrice < (bestOption?.cost || Infinity) * 0.8) {
          bestOption = {
            type: "Welcome",
            cost: welcomeProgramOption.totalPrice,
            baseCost: welcomeProgramOption.basePrice || welcomeProgramOption.totalPrice,
            discountedCost: welcomeProgramOption.totalPrice,
            isDiscountEligible: false,
            parkingCost: welcomeProgramOption.parkingCost || 0,
            crossLocationCosts: welcomeProgramOption.crossLocationCost || 0,
            description: `Discovery Place Welcome Program Membership for ${welcomeProgramOption.locationLabel}`,
            welcomeDetails: welcomeProgramOption,
          };
        }
      }

      // For very few visits, regular admission might be best
      if (totalVisits <= 3) {
        if (regularAdmissionCost < (bestOption?.cost || Infinity)) {
          bestOption = {
            type: "PayAsYouGo",
            cost: regularAdmissionCost,
            baseCost: regularAdmissionCost,
            discountedCost: regularAdmissionCost,
            isDiscountEligible: false,
            parkingCost: includeParking && cappedScienceVisits > 0
              ? AdmissionCostCalculator.calculateParkingCost(cappedScienceVisits, false)
              : 0,
            crossLocationCosts: 0,
            description: `Pay As You Go (Regular Admission)`,
          };
        }
      }

      // Fallback if no best option found
      if (!bestOption) {
        bestOption = {
          type: "Science",
          cost: scienceTotalCost,
          baseCost: scienceMembershipCost,
          discountedCost: sciencePromoCost,
          isDiscountEligible: scienceDiscountEligible,
          parkingCost: parkingCost,
          crossLocationCosts: scienceCrossLocationCosts,
        };
      }

      // Get membership details
      const membershipDetails = this.getMembershipDetails(bestOption.type);

      // Build cost breakdown items
      let costBreakdownItems = [];

      if (bestOption.type === "Welcome" && bestOption.welcomeDetails) {
        // Use the Welcome Program breakdown
        costBreakdownItems = bestOption.welcomeDetails.costBreakdown?.items || [];
      } else if (bestOption.type === "PayAsYouGo") {
        // Regular admission breakdown
        const admissionCostWithoutParking = regularAdmissionCost - (includeParking && cappedScienceVisits > 0 
          ? AdmissionCostCalculator.calculateParkingCost(cappedScienceVisits, false)
          : 0);

        costBreakdownItems.push({
          label: "Regular Admission",
          cost: admissionCostWithoutParking,
          details: `${totalVisits} total visits`,
        });

        if (includeParking && cappedScienceVisits > 0) {
          costBreakdownItems.push({
            label: "Parking at Science",
            cost: AdmissionCostCalculator.calculateParkingCost(cappedScienceVisits, false),
            details: `${cappedScienceVisits} visits × $18 per visit`,
          });
        }
      } else {
        // Standard membership breakdown
        costBreakdownItems.push({
          label: membershipDetails.label,
          cost: bestOption.discountedCost,
          details: bestOption.isDiscountEligible
            ? `Original price: $${bestOption.baseCost}, after 20% discount`
            : null,
        });

        if (includeParking && cappedScienceVisits > 0) {
          costBreakdownItems.push({
            label: "Parking at Science",
            cost: bestOption.parkingCost,
            details: `${cappedScienceVisits} visits × $8 per visit`,
          });
        }

        if (bestOption.crossLocationCosts > 0) {
          // Determine which locations are not covered by the membership
          let crossLocations = [];
          if (bestOption.type === "Science" || bestOption.type === "ScienceBasic") {
            if (cappedDpkhVisits > 0)
              crossLocations.push({
                name: "Kids-Huntersville",
                visits: cappedDpkhVisits,
              });
            if (cappedDpkrVisits > 0)
              crossLocations.push({
                name: "Kids-Rockingham",
                visits: cappedDpkrVisits,
              });
          } else if (bestOption.type === "DPKH") {
            if (cappedScienceVisits > 0)
              crossLocations.push({
                name: "Science",
                visits: cappedScienceVisits,
              });
            if (cappedDpkrVisits > 0)
              crossLocations.push({
                name: "Kids-Rockingham",
                visits: cappedDpkrVisits,
              });
          } else if (bestOption.type === "DPKR") {
            if (cappedScienceVisits > 0)
              crossLocations.push({
                name: "Science",
                visits: cappedScienceVisits,
              });
            if (cappedDpkhVisits > 0)
              crossLocations.push({
                name: "Kids-Huntersville",
                visits: cappedDpkhVisits,
              });
          }

          // Create a description of the cross-location visits
          const crossLocationDetails = crossLocations
            .map((loc) => `${loc.visits} visits to ${loc.name}`)
            .join(", ");

          const discountLabel = bestOption.type === "ScienceBasic" 
            ? "Cross-Location Admission (Full Price)" 
            : "Cross-Location Admission (Member Discounted)";

          costBreakdownItems.push({
            label: discountLabel,
            cost: bestOption.crossLocationCosts,
            details: crossLocationDetails,
          });
        }
      }

      // Add guest savings breakdown items separately
      const savingsBreakdownItems = guestSavingsBreakdown;

      // Calculate total savings compared to regular admission
      const totalSavings = this.calculateSafeSavings(regularAdmissionCost, bestOption.cost);
      const savingsPercentage = this.calculateSafeSavingsPercentage(totalSavings, regularAdmissionCost);

      // Generate explanation
      const explanation = this.generateEnhancedExplanation(bestOption, totalVisits, totalFamilyMembers);

      // Build comprehensive result object
      const result = {
        bestMembershipType: bestOption.type,
        bestMembershipLabel: membershipDetails.label,
        bestMembershipPromoCost: bestOption.discountedCost,
        bestMembershipBaseCost: bestOption.baseCost,
        isDiscountEligible: bestOption.isDiscountEligible,
        parkingCost: bestOption.parkingCost || 0,
        guestDiscountDetails: guestSavingsBreakdown,
        costBreakdown: {
          items: costBreakdownItems,
          guestSavingsDetails: guestSavingsBreakdown.flatMap(
            (item) => item.fullDetails || []
          ),
        },
        savingsBreakdown: savingsBreakdownItems,
        bestMembershipSavings: totalSavings,
        savingsPercentage: savingsPercentage,
        bestMembershipExplanation: explanation,
        iconType: membershipDetails.iconType,
        primaryLocation: primaryLocation,
        totalVisits: totalVisits,
        totalFamilyMembers: totalFamilyMembers,
        scienceDiscountEligible: scienceDiscountEligible,
        dpkhDiscountEligible: dpkhDiscountEligible,
        dpkrDiscountEligible: dpkrDiscountEligible,
        scienceKidsDiscountEligible: scienceKidsDiscountEligible,
        purchaseLink: bestOption.type === "Welcome" && bestOption.welcomeDetails
          ? bestOption.welcomeDetails.purchaseLink
          : membershipDetails.purchaseLink,
        isWelcomeEligible: isWelcomeEligible,
        welcomeProgramOption: isWelcomeEligible ? welcomeProgramOption : null,
        regularAdmissionCost: regularAdmissionCost,
        guestAdmissionSavings: guestAdmissionSavings,
        crossLocationCosts: bestOption.crossLocationCosts || 0,
      };

      return result;

    } catch (error) {
      console.error('Error in calculateMembershipCosts:', error);
      // Return a safe fallback result
      return this.getFallbackResult(options);
    }
  },

  /**
   * Validate calculation inputs with comprehensive checks
   * @param {Object} inputs - Raw inputs to validate
   * @returns {Object} Validation result with cleaned inputs
   */
  validateCalculationInputs(inputs) {
    const errors = [];
    const {
      adultCount,
      childrenCount,
      childAges,
      scienceVisits,
      dpkhVisits,
      dpkrVisits
    } = inputs;

    // Validate adult count
    const validAdultCount = Math.max(0, Math.min(10, Math.floor(Number(adultCount) || 0)));
    if (validAdultCount !== adultCount) {
      errors.push('Adult count adjusted to valid range (0-10)');
    }

    // Validate children count
    const validChildrenCount = Math.max(0, Math.min(10, Math.floor(Number(childrenCount) || 0)));
    if (validChildrenCount !== childrenCount) {
      errors.push('Children count adjusted to valid range (0-10)');
    }

    // Validate child ages
    const validChildAges = Array.isArray(childAges) ? 
      childAges.filter(age => typeof age === 'number' && age >= 0 && age <= 18) : [];
    
    if (validChildAges.length !== (childAges?.length || 0)) {
      errors.push('Some child ages were invalid and removed');
    }

    // Validate visit counts
    const validScienceVisits = Math.max(0, Math.min(50, Math.floor(Number(scienceVisits) || 0)));
    const validDpkhVisits = Math.max(0, Math.min(50, Math.floor(Number(dpkhVisits) || 0)));
    const validDpkrVisits = Math.max(0, Math.min(50, Math.floor(Number(dpkrVisits) || 0)));

    if (validScienceVisits + validDpkhVisits + validDpkrVisits === 0) {
      errors.push('At least one visit is required for meaningful calculations');
    }

    return {
      isValid: errors.length === 0 || errors.every(error => !error.includes('required')),
      errors,
      validAdultCount,
      validChildrenCount,
      validChildAges,
      validScienceVisits,
      validDpkhVisits,
      validDpkrVisits
    };
  },

  /**
   * Calculate costs for cross-location visits with enhanced validation
   * @param {Object} options - Calculation options
   * @returns {number} Total cross-location costs
   */
  calculateCrossLocationCosts(options) {
    try {
      const {
        adultCount = 0,
        childAges = [],
        membershipType,
        scienceVisits = 0,
        dpkhVisits = 0,
        dpkrVisits = 0,
        isRichmondResident = false,
      } = options;

      // ScienceBasic members pay full price for other locations (no discounts)
      if (membershipType === "ScienceBasic") {
        let totalCost = 0;

        // DPKH visits - full price
        if (dpkhVisits > 0) {
          const singleVisitCost = AdmissionCostCalculator.calculateSingleVisitCost({
            location: "DPKH",
            adultCount,
            childAges,
            isRichmondResident,
          });
          totalCost += singleVisitCost * dpkhVisits;
        }

        // DPKR visits - full price
        if (dpkrVisits > 0) {
          const singleVisitCost = AdmissionCostCalculator.calculateSingleVisitCost({
            location: "DPKR",
            adultCount,
            childAges,
            isRichmondResident,
          });
          totalCost += singleVisitCost * dpkrVisits;
        }

        return Math.max(0, totalCost);
      }

      // For other membership types, calculate with member discounts
      let totalCost = 0;

      // Get the discount rates based on membership type
      const discountMap = PricingConfig.GuestDiscounts?.discountMap?.[membershipType] || {};

      // Get discount limits from configuration
      const discountLimits = PricingConfig.GuestDiscounts?.discountLimits || {
        homeMuseum: 6,
        otherMuseums: 4
      };

      // Admission prices
      const admissionPrices = PricingConfig.AdmissionPrices;

      // Count eligible children by age
      const eligibleChildrenForScience = childAges.filter(
        (age) => age >= (admissionPrices.Science?.childAgeThreshold || 2)
      ).length;
      const eligibleChildrenForDPKH = childAges.filter(
        (age) => age >= (admissionPrices.DPKH?.childAgeThreshold || 1)
      ).length;
      const eligibleChildrenForDPKR = childAges.filter(
        (age) => age >= (admissionPrices.DPKR?.childAgeThreshold || 1)
      ).length;

      // Calculate Science visit costs with member discount
      if (scienceVisits > 0 && discountMap.Science) {
        const discountRate = discountMap.Science;
        const isHomeMuseum = membershipType === "Science" || membershipType === "ScienceKids";
        const maxDiscountedGuests = isHomeMuseum ? discountLimits.homeMuseum : discountLimits.otherMuseums;

        // Calculate discounted and full-price guests
        const totalGuests = adultCount + eligibleChildrenForScience;
        const discountedGuests = Math.min(totalGuests, maxDiscountedGuests);
        const fullPriceGuests = Math.max(0, totalGuests - maxDiscountedGuests);

        // Get admission prices
        const adultPrice = admissionPrices.Science?.adult || 0;
        const childPrice = admissionPrices.Science?.child || 0;

        // Calculate average price per person (simplified)
        const avgPricePerGuest = totalGuests > 0 
          ? (adultCount * adultPrice + eligibleChildrenForScience * childPrice) / totalGuests 
          : 0;

        const discountedCost = discountedGuests * avgPricePerGuest * (1 - discountRate);
        const fullPriceCost = fullPriceGuests * avgPricePerGuest;

        totalCost += (discountedCost + fullPriceCost) * scienceVisits;
      }

      // Calculate DPKH visit costs with member discount
      if (dpkhVisits > 0 && discountMap.DPKH) {
        const discountRate = discountMap.DPKH;
        const isHomeMuseum = membershipType === "DPKH";
        const maxDiscountedGuests = isHomeMuseum ? discountLimits.homeMuseum : discountLimits.otherMuseums;

        const totalGuests = adultCount + eligibleChildrenForDPKH;
        const discountedGuests = Math.min(totalGuests, maxDiscountedGuests);
        const fullPriceGuests = Math.max(0, totalGuests - maxDiscountedGuests);

        const adultPrice = admissionPrices.DPKH?.adult || 0;
        const childPrice = admissionPrices.DPKH?.child || 0;

        const avgPricePerGuest = totalGuests > 0 
          ? (adultCount * adultPrice + eligibleChildrenForDPKH * childPrice) / totalGuests 
          : 0;

        const discountedCost = discountedGuests * avgPricePerGuest * (1 - discountRate);
        const fullPriceCost = fullPriceGuests * avgPricePerGuest;

        totalCost += (discountedCost + fullPriceCost) * dpkhVisits;
      }

      // Calculate DPKR visit costs with member discount
      if (dpkrVisits > 0 && discountMap.DPKR) {
        const discountRate = discountMap.DPKR;
        const isHomeMuseum = membershipType === "DPKR";
        const maxDiscountedGuests = isHomeMuseum ? discountLimits.homeMuseum : discountLimits.otherMuseums;

        const totalGuests = adultCount + eligibleChildrenForDPKR;
        const discountedGuests = Math.min(totalGuests, maxDiscountedGuests);
        const fullPriceGuests = Math.max(0, totalGuests - maxDiscountedGuests);

        // Get appropriate pricing (resident vs non-resident)
        const priceCategory = isRichmondResident 
          ? (admissionPrices.DPKR?.resident || admissionPrices.DPKR?.standard)
          : admissionPrices.DPKR?.standard;
        
        const adultPrice = priceCategory?.adult || 0;
        const childPrice = priceCategory?.child || 0;

        const avgPricePerGuest = totalGuests > 0 
          ? (adultCount * adultPrice + eligibleChildrenForDPKR * childPrice) / totalGuests 
          : 0;

        const discountedCost = discountedGuests * avgPricePerGuest * (1 - discountRate);
        const fullPriceCost = fullPriceGuests * avgPricePerGuest;

        totalCost += (discountedCost + fullPriceCost) * dpkrVisits;
      }

      return Math.max(0, totalCost);

    } catch (error) {
      console.error('Error calculating cross-location costs:', error);
      return 0;
    }
  },

  /**
   * Calculate safe savings amount (never negative)
   * @param {number} regularCost - Regular admission cost
   * @param {number} membershipCost - Membership cost
   * @returns {number} Safe savings amount
   */
  calculateSafeSavings(regularCost, membershipCost) {
    const regular = Number(regularCost) || 0;
    const membership = Number(membershipCost) || 0;
    return Math.max(0, regular - membership);
  },

  /**
   * Calculate safe savings percentage with bounds checking
   * @param {number} savings - Savings amount
   * @param {number} regularCost - Regular cost
   * @returns {number} Safe savings percentage (0-90)
   */
  calculateSafeSavingsPercentage(savings, regularCost) {
    const savingsNum = Number(savings) || 0;
    const regularNum = Number(regularCost) || 0;
    
    if (regularNum <= 0 || savingsNum <= 0) return 0;
    
    const percentage = (savingsNum / regularNum) * 100;
    return Math.min(90, Math.max(0, Math.round(percentage)));
  },

  /**
   * Generate enhanced explanation for the recommendation
   * @param {Object} bestOption - Best membership option
   * @param {number} totalVisits - Total visits
   * @param {number} totalMembers - Total family members
   * @returns {string} Enhanced explanation
   */
  generateEnhancedExplanation(bestOption, totalVisits, totalMembers) {
    const memberText = totalMembers === 1 ? "person" : "people";
    const visitText = totalVisits === 1 ? "visit" : "visits";
    
    if (bestOption.type === "PayAsYouGo") {
      return `With only ${totalVisits} planned ${visitText}, individual tickets are more cost-effective than a membership.`;
    }
    
    if (bestOption.type === "ScienceBasic") {
      return `For ${totalMembers} ${memberText} with ${totalVisits} ${visitText}, the ScienceBasic membership offers the best value with unlimited Science access.`;
    }
    
    if (bestOption.type === "ScienceKids") {
      return `With visits to multiple locations, the Science + Kids membership provides the best value and maximum flexibility for ${totalMembers} ${memberText}.`;
    }
    
    if (bestOption.type === "Welcome") {
      return `The Welcome Program membership offers exceptional value for eligible families with ${totalVisits} planned ${visitText}.`;
    }
    
    return `Based on ${totalVisits} planned ${visitText} for ${totalMembers} ${memberText}, this membership offers the best combination of value and benefits.`;
  },

  /**
   * Get fallback result for error cases
   * @param {Object} options - Original options
   * @returns {Object} Safe fallback result
   */
  getFallbackResult(options) {
    return {
      bestMembershipType: "Science",
      bestMembershipLabel: "Discovery Place Science Membership",
      bestMembershipPromoCost: 209,
      bestMembershipBaseCost: 209,
      isDiscountEligible: false,
      parkingCost: 0,
      guestDiscountDetails: [],
      costBreakdown: { items: [] },
      savingsBreakdown: [],
      bestMembershipSavings: 0,
      savingsPercentage: 0,
      bestMembershipExplanation: "Unable to calculate recommendation due to invalid inputs. Please check your information and try again.",
      iconType: "science",
      primaryLocation: "Science",
      totalVisits: 0,
      totalFamilyMembers: 2,
      purchaseLink: "https://discoveryplace.org",
      isWelcomeEligible: false,
      welcomeProgramOption: null,
      regularAdmissionCost: 0,
      guestAdmissionSavings: 0,
      crossLocationCosts: 0,
      hasError: true
    };
  },

  /**
   * Get membership details with enhanced error handling
   * @param {string} membershipType - Membership type
   * @returns {Object} Membership details
   */
  getMembershipDetails(membershipType) {
    const details = {
      Science: {
        label: "Discovery Place Science Membership",
        iconType: "science",
        purchaseLink: "https://visit.discoveryplace.org/science/events/36a58ae8-155d-8116-9188-7d0b6fae199c",
        description: "Access to Discovery Place Science for all named members, plus guest discounts at other locations",
      },
      ScienceBasic: {
        label: "Discovery Place Science Basic Membership",
        iconType: "science-basic",
        purchaseLink: "https://visit.discoveryplace.org/science/events/36a58ae8-155d-8116-9188-7d0b6fae199c",
        description: "Access to Discovery Place Science for one adult, with 50% off guest admission for family members",
      },
      DPKH: {
        label: "Discovery Place Kids-Huntersville Membership",
        iconType: "kids-huntersville",
        purchaseLink: "https://visit.discoveryplace.org/huntersville/events/7877bc4b-7702-fb6d-b750-01a851e506db",
        description: "Access to Discovery Place Kids-Huntersville for all named members, plus guest discounts at other locations",
      },
      DPKHBasic: {
        label: "Discovery Place Kids-Huntersville Basic Membership",
        iconType: "kids-huntersville-basic",
        purchaseLink: "https://visit.discoveryplace.org/huntersville/events/7877bc4b-7702-fb6d-b750-01a851e506db",
        description: "Access to Discovery Place Kids-Huntersville for one adult and one child, with 50% off guest admission for other family members",
      },
      DPKR: {
        label: "Discovery Place Kids-Rockingham Membership",
        iconType: "kids-rockingham",
        purchaseLink: "https://visit.discoveryplace.org/rockingham/events/b3422931-4d69-406e-3cdc-39e7081a9f41",
        description: "Access to Discovery Place Kids-Rockingham for all named members, plus guest discounts at other locations",
      },
      DPKRBasic: {
        label: "Discovery Place Kids-Rockingham Basic Membership",
        iconType: "kids-rockingham-basic", 
        purchaseLink: "https://visit.discoveryplace.org/rockingham/events/b3422931-4d69-406e-3cdc-39e7081a9f41",
        description: "Access to Discovery Place Kids-Rockingham for one adult and one child, with 50% off guest admission for other family members",
      },
      ScienceKids: {
        label: "Discovery Place Science + Kids Membership",
        iconType: "science-kids",
        purchaseLink: "https://visit.discoveryplace.org/science/events/36a58ae8-155d-8116-9188-7d0b6fae199c",
        description: "Access to all Discovery Place locations with full benefits",
      },
      Welcome: {
        label: "Discovery Place Welcome Program",
        iconType: "welcome",
        purchaseLink: "https://visit.discoveryplace.org/science/events/36a58ae8-155d-8116-9188-7d0b6fae199c?tg=d99160b3-94fd-9362-978e-44607faf4b03",
        description: "$3 admission per person at other locations. Unlimited access to home museum for NC/SC EBT/WIC cardholders and their guests (up to 6 people)",
      },
      PayAsYouGo: {
        label: "Pay As You Go (Regular Admission)",
        iconType: "ticket",
        purchaseLink: "https://discoveryplace.org/visit/buy-tickets/",
        description: "Regular admission tickets purchased for each visit",
      },
    };

    return details[membershipType] || details["Science"];
  },

  /**
   * Determine best membership type based on visit pattern and family composition
   * @param {Object} options - Calculation options
   * @returns {string} Best membership type code
   */
  determineBestMembershipType(options) {
    // NOTE: This method is maintained for backward compatibility
    // The actual decision logic is now entirely in calculateMembershipCosts
    // based on pure cost comparison

    const {
      scienceVisits,
      dpkhVisits,
      dpkrVisits,
      totalFamilyMembers,
      needsFlexibility = false,
    } = options;

    const totalVisits = scienceVisits + dpkhVisits + dpkrVisits;

    // For very few visits, recommend pay-as-you-go
    if (totalVisits <= 3) {
      return "PayAsYouGo";
    }

    // For Rockingham-only visits
    if (dpkrVisits > 0 && scienceVisits === 0 && dpkhVisits === 0) {
      return "DPKR";
    }

    // For significant visits to multiple locations
    if (
      scienceVisits > 0 &&
      (dpkhVisits > 0 || dpkrVisits > 0) &&
      totalVisits >= 10
    ) {
      return "ScienceKids";
    }

    // For primarily Science visits
    if (scienceVisits >= dpkhVisits && scienceVisits >= dpkrVisits) {
      return totalFamilyMembers === 1 && !needsFlexibility
        ? "ScienceBasic"
        : "Science";
    }

    // For primarily DPKH visits
    if (dpkhVisits >= scienceVisits && dpkhVisits >= dpkrVisits) {
      return "DPKH";
    }

    // For primarily DPKR visits
    return "DPKR";
  },
};

export default MembershipPriceCalculator;

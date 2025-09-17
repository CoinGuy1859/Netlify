// pricing/MembershipPriceCalculator.js
import { PricingConfig } from "./PricingConfig";
import { DiscountService } from "./DiscountService";
import { AdmissionCostCalculator } from "./AdmissionCostCalculator";

/**
 * Membership Price Calculator
 * Handles calculations related to membership pricing and recommendations
 * Updated to use fixed discounts and improved Science+Kids recommendation logic
 */
export const MembershipPriceCalculator = {
  /**
   * Get base membership price
   * @param {string} type - Membership type
   * @param {number} memberCount - Number of family members
   * @returns {number} Base price for the membership
   */
  getMembershipPrice(type, memberCount) {
    // Add input validation
    if (memberCount <= 0) return 0;

    // Cap memberCount to avoid array out-of-bounds
    memberCount = Math.min(
      memberCount,
      PricingConfig.MembershipPrices[type].length
    );

    // Special case: DPKH, DPKR, and ScienceKids don't offer 1-person memberships
    if (["DPKH", "DPKR", "ScienceKids"].includes(type) && memberCount === 1) {
      // Return the 2-person price
      return PricingConfig.MembershipPrices[type][1];
    }

    return PricingConfig.MembershipPrices[type][memberCount - 1];
  },

  /**
   * Calculate comprehensive membership costs and determine recommendation
   * @param {Object} options - Calculation options
   * @returns {Object} Detailed membership calculation results
   */
  calculateMembershipCosts(options) {
    try {
      console.log("🟢 MembershipPriceCalculator.calculateMembershipCosts called with:", options);

      const {
        adultCount,
        childrenCount,
        childAges,
        scienceVisits,
        dpkhVisits,
        dpkrVisits,
        isRichmondResident = false,
        needsFlexibility = false,
        isWelcomeEligible = false,
        includeParking = true,
        discountType = null,
      } = options;

      // Calculate eligible family members
      const eligibleChildrenCount = childAges.filter((age) => age >= 2).length;
      const totalFamilyMembers = Math.min(
        PricingConfig.Constraints.MAX_ADULTS + PricingConfig.Constraints.MAX_CHILDREN,
        adultCount + eligibleChildrenCount
      );

      // Determine primary location
      const primaryLocation = AdmissionCostCalculator.determinePrimaryLocation(
        scienceVisits,
        dpkhVisits,
        dpkrVisits
      );

      // Calculate regular admission cost
      const regularAdmissionCost = AdmissionCostCalculator.calculateRegularAdmissionCost({
        adultCount,
        childAges,
        scienceVisits,
        dpkhVisits,
        dpkrVisits,
        isRichmondResident,
        includeParking,
      });

      console.log("🟢 Regular admission cost:", regularAdmissionCost);

      // Calculate membership costs for different options
      const scienceMembershipCost = this.getMembershipPrice("Science", totalFamilyMembers);
      const dpkhMembershipCost = this.getMembershipPrice("DPKH", totalFamilyMembers);
      const dpkrMembershipCost = this.getMembershipPrice("DPKR", totalFamilyMembers);

      // Apply discounts if applicable
      const membershipOptions = [];

      // Science membership
      membershipOptions.push({
        type: "Science",
        baseCost: scienceMembershipCost,
        discountedCost: discountType ? 
          DiscountService.applyDiscount(scienceMembershipCost, discountType, "Science") : 
          scienceMembershipCost,
        label: "Discovery Place Science Membership",
        primaryLocation: "Science",
        totalVisits: scienceVisits + dpkhVisits + dpkrVisits,
        isDiscountEligible: discountType && DiscountService.isEligibleForDiscount(discountType, "Science"),
      });

      // DPKH membership (if they visit Kids locations)
      if (dpkhVisits > 0 || dpkrVisits > 0) {
        membershipOptions.push({
          type: "DPKH",
          baseCost: dpkhMembershipCost,
          discountedCost: discountType ? 
            DiscountService.applyDiscount(dpkhMembershipCost, discountType, "DPKH") : 
            dpkhMembershipCost,
          label: "Discovery Place Kids-Huntersville Membership",
          primaryLocation: "DPKH",
          totalVisits: scienceVisits + dpkhVisits + dpkrVisits,
          isDiscountEligible: discountType && DiscountService.isEligibleForDiscount(discountType, "DPKH"),
        });
      }

      // Find the best membership option based on total cost
      let bestOption = membershipOptions[0];
      let bestTotalCost = this.calculateTotalMembershipCost(bestOption, {
        scienceVisits,
        dpkhVisits,
        dpkrVisits,
        adultCount,
        childAges,
        isRichmondResident,
        includeParking,
      });

      for (const option of membershipOptions) {
        const totalCost = this.calculateTotalMembershipCost(option, {
          scienceVisits,
          dpkhVisits,
          dpkrVisits,
          adultCount,
          childAges,
          isRichmondResident,
          includeParking,
        });

        if (totalCost < bestTotalCost) {
          bestOption = option;
          bestTotalCost = totalCost;
        }
      }

      console.log("🟢 Best membership option:", bestOption);

      // Calculate additional costs (parking, cross-location visits)
      const additionalCosts = this.calculateAdditionalCosts(bestOption, {
        scienceVisits,
        dpkhVisits,
        dpkrVisits,
        adultCount,
        childAges,
        isRichmondResident,
        includeParking,
      });

      // Calculate cost breakdown
      const costBreakdown = this.generateCostBreakdown(bestOption, additionalCosts, discountType);

      // Calculate savings
      const totalSavings = Math.max(0, regularAdmissionCost - bestTotalCost);

      const result = {
        bestMembershipType: bestOption.type,
        bestMembershipLabel: bestOption.label,
        bestMembershipExplanation: this.generateExplanation(bestOption, {
          scienceVisits,
          dpkhVisits,
          dpkrVisits,
          adultCount: adultCount + eligibleChildrenCount,
          totalSavings,
        }),
        baseMembershipPrice: bestOption.baseCost,
        baseMembershipDiscount: bestOption.discountedCost,
        bestMembershipPromoCost: bestTotalCost,
        regularAdmissionCost,
        totalSavings,
        additionalCosts,
        costBreakdown,
        totalVisits: scienceVisits + dpkhVisits + dpkrVisits,
        primaryLocationIcon: primaryLocation.toLowerCase(),
        isDiscountApplied: bestOption.isDiscountEligible && discountType,
        discountType: discountType,
        discountAmount: bestOption.isDiscountEligible && discountType ? 
          bestOption.baseCost - bestOption.discountedCost : 0,
      };

      console.log("🟢 Final recommendation result:", result);
      return result;

    } catch (error) {
      console.error("🔴 Error in calculateMembershipCosts:", error);
      return null;
    }
  },

  /**
   * Calculate total membership cost including additional fees
   */
  calculateTotalMembershipCost(membershipOption, visitData) {
    try {
      let totalCost = membershipOption.discountedCost;

      const { scienceVisits, dpkhVisits, dpkrVisits, adultCount, childAges, isRichmondResident, includeParking } = visitData;

      // Add parking costs for Science visits
      if (includeParking && scienceVisits > 0) {
        const parkingCost = AdmissionCostCalculator.calculateParkingCost(scienceVisits, true); // true = has membership
        totalCost += parkingCost;
      }

      // Add cross-location visit costs
      if (membershipOption.type === "Science") {
        // DPKH cross-location costs
        if (dpkhVisits > 0) {
          const crossLocationCost = AdmissionCostCalculator.calculateSingleVisitCost({
            location: "DPKH",
            adultCount,
            childAges,
            isRichmondResident,
          }) * dpkhVisits * 0.5; // 50% discount for members
          totalCost += crossLocationCost;
        }

        // DPKR cross-location costs
        if (dpkrVisits > 0) {
          const crossLocationCost = AdmissionCostCalculator.calculateSingleVisitCost({
            location: "DPKR",
            adultCount,
            childAges,
            isRichmondResident,
          }) * dpkrVisits * 0.5; // 50% discount for members
          totalCost += crossLocationCost;
        }
      }

      return Math.max(0, totalCost);
    } catch (error) {
      console.error("Error calculating total membership cost:", error);
      return membershipOption.discountedCost || 0;
    }
  },

  /**
   * Calculate additional costs like parking and cross-location visits
   */
  calculateAdditionalCosts(membershipOption, visitData) {
    const additionalCosts = [];
    const { scienceVisits, dpkhVisits, dpkrVisits, adultCount, childAges, isRichmondResident, includeParking } = visitData;

    try {
      // Parking costs
      if (includeParking && scienceVisits > 0) {
        const parkingCost = AdmissionCostCalculator.calculateParkingCost(scienceVisits, true);
        if (parkingCost > 0) {
          additionalCosts.push({
            label: "Parking at Science",
            cost: parkingCost,
            details: `${scienceVisits} visits × $8 per visit`,
          });
        }
      }

      // Cross-location costs
      if (membershipOption.type === "Science") {
        if (dpkhVisits > 0) {
          const singleVisitCost = AdmissionCostCalculator.calculateSingleVisitCost({
            location: "DPKH",
            adultCount,
            childAges,
            isRichmondResident,
          });
          const crossLocationCost = singleVisitCost * dpkhVisits * 0.5;
          additionalCosts.push({
            label: "Cross-Location Admission (Member Discounted)",
            cost: crossLocationCost,
            details: `${dpkhVisits} visits to Kids-Huntersville`,
          });
        }

        if (dpkrVisits > 0) {
          const singleVisitCost = AdmissionCostCalculator.calculateSingleVisitCost({
            location: "DPKR",
            adultCount,
            childAges,
            isRichmondResident,
          });
          const crossLocationCost = singleVisitCost * dpkrVisits * 0.5;
          additionalCosts.push({
            label: "Cross-Location Admission (Member Discounted)",
            cost: crossLocationCost,
            details: `${dpkrVisits} visits to Kids-Rockingham`,
          });
        }
      }

      return additionalCosts;
    } catch (error) {
      console.error("Error calculating additional costs:", error);
      return [];
    }
  },

  /**
   * Generate cost breakdown for display
   */
  generateCostBreakdown(membershipOption, additionalCosts, discountType) {
    const breakdown = [];

    try {
      // Base membership cost
      breakdown.push({
        description: membershipOption.label,
        cost: membershipOption.discountedCost,
        details: membershipOption.isDiscountEligible && discountType ? 
          `Original: $${membershipOption.baseCost}, ${discountType} discount applied` : null,
      });

      // Add additional costs
      additionalCosts.forEach(item => {
        breakdown.push({
          description: item.label,
          cost: item.cost,
          details: item.details,
        });
      });

      return breakdown;
    } catch (error) {
      console.error("Error generating cost breakdown:", error);
      return [];
    }
  },

  /**
   * Generate explanation text for the recommendation
   */
  generateExplanation(membershipOption, visitData) {
    try {
      const { scienceVisits, dpkhVisits, dpkrVisits, adultCount, totalSavings } = visitData;
      const totalVisits = scienceVisits + dpkhVisits + dpkrVisits;
      
      let explanation = `Based on ${totalVisits} planned visits for ${adultCount} people, this membership offers the best combination of value and benefits.`;
      
      if (totalSavings > 0) {
        explanation += ` You'll save $${totalSavings.toFixed(2)} compared to paying per visit.`;
      }

      return explanation;
    } catch (error) {
      console.error("Error generating explanation:", error);
      return "This membership offers good value for your planned visits.";
    }
  },
};

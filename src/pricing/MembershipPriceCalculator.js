// pricing/MembershipPriceCalculator.js
import { PricingConfig } from "./PricingConfig";

/**
 * Membership Price Calculator - SIMPLIFIED VERSION
 * This version removes circular dependencies and infinite loops
 */
export const MembershipPriceCalculator = {
  /**
   * Get base membership price
   */
  getMembershipPrice(type, memberCount) {
    if (memberCount <= 0 || !PricingConfig.MembershipPrices[type]) return 0;
    
    const priceArray = PricingConfig.MembershipPrices[type];
    const index = Math.min(memberCount - 1, priceArray.length - 1);
    return Math.max(0, priceArray[index] || 0);
  },

  /**
   * Calculate membership costs and recommendation - SIMPLIFIED
   */
  calculateMembershipCosts(options) {
    try {
      console.log("🟡 Starting simplified calculation...");

      const {
        adultCount = 0,
        childrenCount = 0,
        childAges = [],
        scienceVisits = 0,
        dpkhVisits = 0,
        dpkrVisits = 0,
        isRichmondResident = false,
        includeParking = true,
        discountType = null,
      } = options;

      // Basic validation
      const totalVisits = scienceVisits + dpkhVisits + dpkrVisits;
      if (totalVisits === 0) {
        console.log("No visits planned, returning null");
        return null;
      }

      // Calculate family size
      const eligibleChildren = childAges.filter(age => age >= 2).length;
      const familySize = adultCount + eligibleChildren;

      // Determine best membership type based on primary visits
      let membershipType = "Science";
      let membershipLabel = "Discovery Place Science Membership";
      
      if (dpkhVisits > scienceVisits && dpkhVisits > dpkrVisits) {
        membershipType = "DPKH";
        membershipLabel = "Discovery Place Kids-Huntersville Membership";
      } else if (dpkrVisits > scienceVisits && dpkrVisits > dpkhVisits) {
        membershipType = "DPKR"; 
        membershipLabel = "Discovery Place Kids-Rockingham Membership";
      }

      // Get membership cost
      const membershipCost = this.getMembershipPrice(membershipType, familySize);

      // Calculate additional costs (simplified)
      let additionalCosts = [];
      let totalAdditionalCost = 0;

      // Parking costs for Science visits
      if (includeParking && scienceVisits > 0) {
        const parkingCost = scienceVisits * 8; // $8 per visit for members
        additionalCosts.push({
          label: "Parking at Science",
          cost: parkingCost,
          details: `${scienceVisits} visits × $8 per visit`
        });
        totalAdditionalCost += parkingCost;
      }

      // Cross-location costs (simplified - assume 50% discount for members)
      if (membershipType === "Science") {
        if (dpkhVisits > 0) {
          const crossCost = dpkhVisits * adultCount * 8 + dpkhVisits * eligibleChildren * 6; // Simplified rates
          additionalCosts.push({
            label: "Cross-Location Admission (Member Discounted)",
            cost: crossCost,
            details: `${dpkhVisits} visits to Kids-Huntersville`
          });
          totalAdditionalCost += crossCost;
        }
        if (dpkrVisits > 0) {
          const crossCost = dpkrVisits * adultCount * 5 + dpkrVisits * eligibleChildren * 3; // Simplified rates  
          additionalCosts.push({
            label: "Cross-Location Admission (Member Discounted)",
            cost: crossCost,
            details: `${dpkrVisits} visits to Kids-Rockingham`
          });
          totalAdditionalCost += crossCost;
        }
      }

      // Calculate regular admission cost (simplified)
      let regularAdmissionCost = 0;
      
      // Science visits
      if (scienceVisits > 0) {
        const adultPrice = isRichmondResident ? 18.95 : 23.95;
        const childPrice = adultPrice; // Simplified
        regularAdmissionCost += scienceVisits * (adultCount * adultPrice + eligibleChildren * childPrice);
        
        if (includeParking) {
          regularAdmissionCost += scienceVisits * 18; // $18 regular parking
        }
      }

      // DPKH visits
      if (dpkhVisits > 0) {
        regularAdmissionCost += dpkhVisits * (adultCount * 15.95 + eligibleChildren * 15.95);
      }

      // DPKR visits  
      if (dpkrVisits > 0) {
        const adultPrice = isRichmondResident ? 5.95 : 9.95;
        const childPrice = adultPrice;
        regularAdmissionCost += dpkrVisits * (adultCount * adultPrice + eligibleChildren * childPrice);
      }

      // Calculate totals
      const totalMembershipCost = membershipCost + totalAdditionalCost;
      const totalSavings = Math.max(0, regularAdmissionCost - totalMembershipCost);

      // Generate cost breakdown
      const costBreakdown = [
        {
          description: membershipLabel,
          cost: membershipCost,
          details: "Annual membership"
        },
        ...additionalCosts
      ];

      const result = {
        bestMembershipType: membershipType,
        bestMembershipLabel: membershipLabel,
        bestMembershipExplanation: `Based on ${totalVisits} planned visits for ${familySize} people, this membership offers the best combination of value and benefits.`,
        baseMembershipPrice: membershipCost,
        baseMembershipDiscount: membershipCost,
        bestMembershipPromoCost: totalMembershipCost,
        regularAdmissionCost: regularAdmissionCost,
        totalSavings: totalSavings,
        additionalCosts: additionalCosts,
        costBreakdown: costBreakdown,
        totalVisits: totalVisits,
        primaryLocationIcon: membershipType.toLowerCase(),
        isDiscountApplied: false,
        discountType: discountType,
        discountAmount: 0,
      };

      console.log("🟢 Calculation completed successfully:", result);
      return result;

    } catch (error) {
      console.error("🔴 Error in calculateMembershipCosts:", error);
      return null;
    }
  }
};

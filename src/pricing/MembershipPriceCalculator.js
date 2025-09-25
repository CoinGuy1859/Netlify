// pricing/MembershipPriceCalculator.js
import { PricingConfig } from "./PricingConfig";
import { AdmissionCostCalculator } from "./AdmissionCostCalculator";

/**
 * Membership Price Calculator - ENHANCED VERSION WITH MULTI-MUSEUM LOGIC
 * This version properly evaluates Science+Kids memberships when visiting multiple locations
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
   * Calculate membership costs and recommendation - ENHANCED WITH MULTI-MUSEUM LOGIC
   */
  calculateMembershipCosts(options) {
    try {
      console.log("🟡 Starting enhanced calculation with multi-museum logic...");

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
        isWelcomeEligible = false,
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

      // If family size is 0, return null
      if (familySize === 0) {
        console.log("No eligible family members, returning null");
        return null;
      }

      // Calculate how many different locations are being visited
      const locationsVisited = [
        scienceVisits > 0 ? 1 : 0,
        dpkhVisits > 0 ? 1 : 0,
        dpkrVisits > 0 ? 1 : 0
      ].reduce((a, b) => a + b, 0);

      console.log("🔍 Visit analysis:", {
        scienceVisits,
        dpkhVisits,
        dpkrVisits,
        locationsVisited,
        totalVisits,
        familySize
      });

      // Calculate regular admission costs for comparison
      const regularAdmissionCost = AdmissionCostCalculator.calculateRegularAdmissionCost({
        adultCount,
        childrenCount,
        childAges,
        scienceVisits,
        dpkhVisits,
        dpkrVisits,
        isRichmondResident,
        includeParking
      });

      // Initialize variables for best membership option
      let bestMembershipType = "Science";
      let bestMembershipLabel = "Discovery Place Science Membership";
      let bestMembershipCost = Number.MAX_VALUE;
      let bestTotalCost = Number.MAX_VALUE;
      let bestAdditionalCosts = [];

      // Helper function to calculate total cost for a membership type
      const calculateTotalCostForMembership = (type, label) => {
        // Skip if membership not available for family size
        if (type === "ScienceBasic" && familySize > 1) return null;
        if ((type === "DPKH" || type === "DPKR" || type === "ScienceKids") && familySize < 2) return null;

        const baseCost = this.getMembershipPrice(type, familySize);
        if (baseCost === 0) return null;

        let additionalCosts = [];
        let totalAdditional = 0;

        // Calculate parking costs
        if (includeParking && scienceVisits > 0) {
          const parkingCost = scienceVisits * 8; // $8 per visit for members
          additionalCosts.push({
            label: "Parking at Science",
            cost: parkingCost,
            details: `${scienceVisits} visits × $8`
          });
          totalAdditional += parkingCost;
        }

        // Calculate guest admission costs for visits to non-covered locations
        // (Only applies to single-location memberships)
        if (type !== "ScienceKids") {
          // For Science membership, add guest costs for Kids locations
          if (type === "Science" || type === "ScienceBasic") {
            if (dpkhVisits > 0) {
              const dpkhGuestCost = dpkhVisits * familySize * PricingConfig.AdmissionPrices.DPKH.adult * 0.75;
              additionalCosts.push({
                label: "Guest admission at Kids-Huntersville (25% off)",
                cost: dpkhGuestCost,
                details: `${dpkhVisits} visits × ${familySize} people`
              });
              totalAdditional += dpkhGuestCost;
            }
            if (dpkrVisits > 0) {
              const dpkrPrice = isRichmondResident ? 
                PricingConfig.AdmissionPrices.DPKR.richmondResident : 
                PricingConfig.AdmissionPrices.DPKR.adult;
              const dpkrGuestCost = dpkrVisits * familySize * dpkrPrice * 0.75;
              additionalCosts.push({
                label: "Guest admission at Kids-Rockingham (25% off)",
                cost: dpkrGuestCost,
                details: `${dpkrVisits} visits × ${familySize} people`
              });
              totalAdditional += dpkrGuestCost;
            }
          }
          // For DPKH membership, add guest costs for Science and DPKR
          else if (type === "DPKH") {
            if (scienceVisits > 0) {
              const scienceGuestCost = scienceVisits * familySize * PricingConfig.AdmissionPrices.Science.adult * 0.5;
              additionalCosts.push({
                label: "Guest admission at Science (50% off)",
                cost: scienceGuestCost,
                details: `${scienceVisits} visits × ${familySize} people`
              });
              totalAdditional += scienceGuestCost;
            }
            if (dpkrVisits > 0) {
              const dpkrPrice = isRichmondResident ? 
                PricingConfig.AdmissionPrices.DPKR.richmondResident : 
                PricingConfig.AdmissionPrices.DPKR.adult;
              const dpkrGuestCost = dpkrVisits * familySize * dpkrPrice * 0.75;
              additionalCosts.push({
                label: "Guest admission at Kids-Rockingham (25% off)",
                cost: dpkrGuestCost,
                details: `${dpkrVisits} visits × ${familySize} people`
              });
              totalAdditional += dpkrGuestCost;
            }
          }
          // For DPKR membership, add guest costs for Science and DPKH
          else if (type === "DPKR") {
            if (scienceVisits > 0) {
              const scienceGuestCost = scienceVisits * familySize * PricingConfig.AdmissionPrices.Science.adult * 0.5;
              additionalCosts.push({
                label: "Guest admission at Science (50% off)",
                cost: scienceGuestCost,
                details: `${scienceVisits} visits × ${familySize} people`
              });
              totalAdditional += scienceGuestCost;
            }
            if (dpkhVisits > 0) {
              const dpkhGuestCost = dpkhVisits * familySize * PricingConfig.AdmissionPrices.DPKH.adult * 0.75;
              additionalCosts.push({
                label: "Guest admission at Kids-Huntersville (25% off)",
                cost: dpkhGuestCost,
                details: `${dpkhVisits} visits × ${familySize} people`
              });
              totalAdditional += dpkhGuestCost;
            }
          }
        }

        return {
          type,
          label,
          baseCost,
          additionalCosts,
          totalCost: baseCost + totalAdditional
        };
      };

      // ENHANCED MULTI-MUSEUM LOGIC: Prioritize Science+Kids when visiting multiple locations
      const membershipOptions = [];

      // If visiting 2+ locations, prioritize Science+Kids membership
      if (locationsVisited >= 2) {
        const scienceKidsOption = calculateTotalCostForMembership("ScienceKids", "Discovery Place Science + Kids Membership");
        if (scienceKidsOption) {
          membershipOptions.push(scienceKidsOption);
          console.log("✅ Multi-museum detected - evaluating Science+Kids membership");
        }
      }

      // Always evaluate single-location memberships for comparison
      // Determine primary location (most visits)
      let primaryLocation = "Science";
      if (dpkhVisits > scienceVisits && dpkhVisits >= dpkrVisits) {
        primaryLocation = "DPKH";
      } else if (dpkrVisits > scienceVisits && dpkrVisits > dpkhVisits) {
        primaryLocation = "DPKR";
      }

      // Add Science Basic option if eligible (single adult only)
      if (familySize === 1 && primaryLocation === "Science") {
        const basicOption = calculateTotalCostForMembership("ScienceBasic", "Discovery Place Science Basic Membership");
        if (basicOption) membershipOptions.push(basicOption);
      }

      // Add regular Science membership
      if (primaryLocation === "Science" || scienceVisits > 0) {
        const scienceOption = calculateTotalCostForMembership("Science", "Discovery Place Science Membership");
        if (scienceOption) membershipOptions.push(scienceOption);
      }

      // Add DPKH membership
      if (primaryLocation === "DPKH" || dpkhVisits > 0) {
        const dpkhOption = calculateTotalCostForMembership("DPKH", "Discovery Place Kids-Huntersville Membership");
        if (dpkhOption) membershipOptions.push(dpkhOption);
      }

      // Add DPKR membership
      if (primaryLocation === "DPKR" || dpkrVisits > 0) {
        const dpkrOption = calculateTotalCostForMembership("DPKR", "Discovery Place Kids-Rockingham Membership");
        if (dpkrOption) membershipOptions.push(dpkrOption);
      }

      // Find the best option
      console.log("📊 Evaluating", membershipOptions.length, "membership options");
      
      membershipOptions.forEach(option => {
        console.log(`  - ${option.label}: Base $${option.baseCost}, Total $${option.totalCost}`);
        if (option.totalCost < bestTotalCost) {
          bestMembershipType = option.type;
          bestMembershipLabel = option.label;
          bestMembershipCost = option.baseCost;
          bestTotalCost = option.totalCost;
          bestAdditionalCosts = option.additionalCosts;
        }
      });

      // Apply discounts if applicable
      let finalMembershipCost = bestMembershipCost;
      if (discountType && (discountType === 'educator' || discountType === 'military')) {
        const discountAmount = discountType === 'military' ? 30 : 20;
        finalMembershipCost = Math.max(0, bestMembershipCost - discountAmount);
        bestMembershipLabel += discountType === 'military' ? " (Military Discount)" : " (Educator Discount)";
      }

      // Calculate final total cost
      const finalTotalCost = finalMembershipCost + bestAdditionalCosts.reduce((sum, item) => sum + item.cost, 0);

      // Calculate savings
      const totalSavings = Math.max(0, regularAdmissionCost - finalTotalCost);
      const savingsPercentage = regularAdmissionCost > 0 ? 
        Math.round((totalSavings / regularAdmissionCost) * 100) : 0;

      // Build the recommendation object
      const recommendation = {
        bestMembershipType,
        bestMembershipLabel,
        bestMembershipCost: finalMembershipCost,
        regularAdmissionCost,
        bestMembershipSavings: totalSavings,
        savingsPercentage,
        totalFamilyMembers: familySize,
        primaryLocation,
        additionalCosts: bestAdditionalCosts,
        totalPrice: finalTotalCost,
        locationsVisited,
        visitBreakdown: {
          science: scienceVisits,
          dpkh: dpkhVisits,
          dpkr: dpkrVisits,
          total: totalVisits
        },
        isMultiMuseumRecommended: bestMembershipType === "ScienceKids",
        costBreakdown: {
          membership: finalMembershipCost,
          parking: bestAdditionalCosts.find(c => c.label.includes("Parking"))?.cost || 0,
          guestAdmissions: bestAdditionalCosts
            .filter(c => c.label.includes("Guest admission"))
            .reduce((sum, c) => sum + c.cost, 0)
        }
      };

      console.log("💰 Final recommendation:", recommendation);
      return recommendation;

    } catch (error) {
      console.error("Error in calculateMembershipCosts:", error);
      // Return a safe default recommendation
      return {
        bestMembershipType: "Science",
        bestMembershipLabel: "Discovery Place Science Membership",
        bestMembershipCost: this.getMembershipPrice("Science", 4),
        regularAdmissionCost: 0,
        bestMembershipSavings: 0,
        savingsPercentage: 0,
        totalFamilyMembers: 4,
        primaryLocation: "Science",
        additionalCosts: [],
        totalPrice: this.getMembershipPrice("Science", 4),
        error: true,
        errorMessage: error.message
      };
    }
  }
};

export default MembershipPriceCalculator;

// pricing/MembershipPriceCalculator.js
import { PricingConfig } from "./PricingConfig";
import AdmissionCostCalculator from "./AdmissionCostCalculator";

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
      const regularAdmissionCost = AdmissionCostCalculator.calculateRegularAdmission({
        adultCount,
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
          if (type === "Science") {
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
                PricingConfig.AdmissionPrices.DPKR.resident.adult :
                PricingConfig.AdmissionPrices.DPKR.standard.adult;
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
              const scienceAdultCost = scienceVisits * adultCount * PricingConfig.AdmissionPrices.Science.adult * 0.75;
              const scienceChildCost = scienceVisits * eligibleChildren * PricingConfig.AdmissionPrices.Science.child * 0.75;
              additionalCosts.push({
                label: "Guest admission at Science (25% off)",
                cost: scienceAdultCost + scienceChildCost,
                details: `${scienceVisits} visits × ${familySize} people`
              });
              totalAdditional += scienceAdultCost + scienceChildCost;
            }
            if (dpkrVisits > 0) {
              const dpkrPrice = isRichmondResident ?
                PricingConfig.AdmissionPrices.DPKR.resident.adult :
                PricingConfig.AdmissionPrices.DPKR.standard.adult;
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
              const scienceAdultCost = scienceVisits * adultCount * PricingConfig.AdmissionPrices.Science.adult * 0.75;
              const scienceChildCost = scienceVisits * eligibleChildren * PricingConfig.AdmissionPrices.Science.child * 0.75;
              additionalCosts.push({
                label: "Guest admission at Science (25% off)",
                cost: scienceAdultCost + scienceChildCost,
                details: `${scienceVisits} visits × ${familySize} people`
              });
              totalAdditional += scienceAdultCost + scienceChildCost;
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
          totalAdditional,
          totalCost: baseCost + totalAdditional
        };
      };

      // Determine primary location for single-location membership
      let primaryLocation = "Science";
      if (dpkhVisits > scienceVisits && dpkhVisits > dpkrVisits) {
        primaryLocation = "DPKH";
      } else if (dpkrVisits > scienceVisits && dpkrVisits > dpkhVisits) {
        primaryLocation = "DPKR";
      }

      // Evaluate single-location membership based on primary visits
      const singleLocationResult = calculateTotalCostForMembership(
        primaryLocation,
        primaryLocation === "Science" ? "Discovery Place Science Membership" :
        primaryLocation === "DPKH" ? "Discovery Place Kids-Huntersville Membership" :
        "Discovery Place Kids-Rockingham Membership"
      );

      if (singleLocationResult) {
        bestMembershipType = singleLocationResult.type;
        bestMembershipLabel = singleLocationResult.label;
        bestMembershipCost = singleLocationResult.baseCost;
        bestTotalCost = singleLocationResult.totalCost;
        bestAdditionalCosts = singleLocationResult.additionalCosts;
        
        console.log("✅ Single-location option:", {
          type: bestMembershipType,
          totalCost: bestTotalCost
        });
      }

      // CRITICAL: Always evaluate Science+Kids if visiting multiple locations
      if (locationsVisited >= 2 && familySize >= 2) {
        const multiMuseumResult = calculateTotalCostForMembership(
          "ScienceKids",
          "Discovery Place Science + Kids Membership"
        );

        if (multiMuseumResult) {
          console.log("✅ Multi-museum option:", {
            type: "ScienceKids",
            totalCost: multiMuseumResult.totalCost,
            vs_single: bestTotalCost
          });

          // Recommend Science+Kids if it's cheaper OR if the difference is small
          // but provides significantly more flexibility
          const costDifference = multiMuseumResult.totalCost - bestTotalCost;
          const percentDifference = Math.abs(costDifference / bestTotalCost) * 100;

          // Recommend Science+Kids if:
          // 1. It's cheaper
          // 2. It's within 10% more expensive but visiting 3 locations
          // 3. It's within 20% more expensive but total visits > 10
          if (multiMuseumResult.totalCost < bestTotalCost ||
              (locationsVisited === 3 && percentDifference < 10) ||
              (totalVisits > 10 && percentDifference < 20)) {
            bestMembershipType = "ScienceKids";
            bestMembershipLabel = multiMuseumResult.label;
            bestMembershipCost = multiMuseumResult.baseCost;
            bestTotalCost = multiMuseumResult.totalCost;
            bestAdditionalCosts = multiMuseumResult.additionalCosts;
            
            console.log("🎯 Recommending Science+Kids membership!");
          }
        }
      }

      // Apply discounts if applicable
      let finalMembershipCost = bestMembershipCost;
      
      // Apply Welcome Program if eligible (flat $75 rate)
      if (isWelcomeEligible) {
        finalMembershipCost = 75;
        bestMembershipLabel += " (Welcome Program)";
      }
      // Apply educator/military discounts
      else if (discountType) {
        const discountAmount = discountType === 'military' && primaryLocation === 'DPKR' ? 30 : 20;
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

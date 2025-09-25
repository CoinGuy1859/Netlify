// src/pricing/MembershipPriceCalculator.js
import PricingConfig from "./PricingConfig";
import AdmissionCostCalculator from "./AdmissionCostCalculator";
import DiscountService from "../services/DiscountService";

/**
 * MembershipPriceCalculator - Enhanced with Multi-Museum Logic
 * Handles all membership pricing calculations with proper multi-location support
 */
const MembershipPriceCalculator = {
  /**
   * Get base membership price based on type and family size
   */
  getMembershipPrice(membershipType, familySize) {
    const prices = PricingConfig.membershipPrices[membershipType];
    if (!prices) return 0;

    if (familySize <= 4) return prices.family4;
    if (familySize <= 6) return prices.family6;
    return prices.family7plus;
  },

  /**
   * Calculate membership costs with multi-museum logic
   */
  calculateMembershipCosts(visitData) {
    console.log("🟡 Starting enhanced calculation with multi-museum logic...");
    
    try {
      const {
        adultCount = 0,
        childrenCount = 0,
        childAges = [],
        scienceVisits = 0,
        dpkhVisits = 0,
        dpkrVisits = 0,
        includeParking = true,
        discountType = null,
        isRichmondResident = false,
        welcomeEligible = false,
        hasEBT = false
      } = visitData;

      // Calculate family size
      const familySize = adultCount + childrenCount;
      const totalVisits = scienceVisits + dpkhVisits + dpkrVisits;

      // Determine locations visited
      const locationsVisited = [
        scienceVisits > 0 ? "Science" : null,
        dpkhVisits > 0 ? "DPKH" : null,
        dpkrVisits > 0 ? "DPKR" : null
      ].filter(Boolean).length;

      // Log visit pattern analysis
      console.log("🔍 Visit analysis:", {
        scienceVisits,
        dpkhVisits,
        dpkrVisits,
        locationsVisited,
        totalVisits,
        familySize
      });

      // Calculate regular admission costs for comparison
      const regularAdmissionCost = AdmissionCostCalculator.calculateTotalAdmissionCosts({
        adultCount,
        childrenCount,
        childAges,
        scienceVisits,
        dpkhVisits,
        dpkrVisits,
        includeParking
      });

      // Early returns for special cases
      if (totalVisits === 0) {
        return {
          bestMembershipType: "None",
          bestMembershipLabel: "No visits planned",
          bestMembershipCost: 0,
          regularAdmissionCost: 0,
          bestMembershipSavings: 0,
          savingsPercentage: 0,
          totalFamilyMembers: familySize,
          primaryLocation: "None",
          additionalCosts: [],
          totalPrice: 0,
          error: true,
          errorMessage: "No visits planned"
        };
      }

      // Handle Welcome Program eligibility
      if (welcomeEligible || hasEBT) {
        return this.calculateWelcomeProgramCosts(visitData);
      }

      // Initialize variables for comparison
      let bestMembershipType = null;
      let bestMembershipCost = Infinity;
      let bestAdditionalCosts = [];
      let bestMembershipLabel = "";
      let primaryLocation = "Science";

      // Determine primary location for single-location memberships
      if (scienceVisits >= dpkhVisits && scienceVisits >= dpkrVisits) {
        primaryLocation = "Science";
      } else if (dpkhVisits >= dpkrVisits) {
        primaryLocation = "DPKH";
      } else {
        primaryLocation = "DPKR";
      }

      // Calculate costs for each membership option
      const membershipOptions = [];

      // Option 1: Science + Kids membership (covers all locations)
      if (locationsVisited >= 2 || (scienceVisits > 0 && (dpkhVisits > 0 || dpkrVisits > 0))) {
        const scienceKidsPrice = this.getMembershipPrice("ScienceKids", familySize);
        const scienceKidsParking = includeParking && scienceVisits > 0 ? 
          scienceVisits * PricingConfig.parkingCosts.memberRate : 0;
        
        const scienceKidsTotalCost = scienceKidsPrice + scienceKidsParking;
        
        membershipOptions.push({
          type: "ScienceKids",
          label: "Discovery Place Science + Kids Membership",
          baseCost: scienceKidsPrice,
          additionalCosts: [{
            label: "Parking at Science (member rate)",
            cost: scienceKidsParking
          }].filter(item => item.cost > 0),
          totalCost: scienceKidsTotalCost
        });
        
        console.log("✅ Multi-museum detected - evaluating Science+Kids membership");
      }

      // Option 2: Science membership only
      if (scienceVisits > 0) {
        const sciencePrice = this.getMembershipPrice("Science", familySize);
        const scienceParking = includeParking ? 
          scienceVisits * PricingConfig.parkingCosts.memberRate : 0;
        
        // Calculate cross-location visit costs for Science membership
        const crossLocationCosts = [];
        if (dpkhVisits > 0) {
          const dpkhAdmission = AdmissionCostCalculator.calculateDPKHAdmission(
            adultCount, childrenCount, childAges, dpkhVisits
          );
          crossLocationCosts.push({
            label: "Cross-location visits to DPKH",
            cost: dpkhAdmission
          });
        }
        if (dpkrVisits > 0) {
          const dpkrAdmission = AdmissionCostCalculator.calculateDPKRAdmission(
            adultCount, childrenCount, childAges, dpkrVisits, isRichmondResident
          );
          crossLocationCosts.push({
            label: "Cross-location visits to DPKR",
            cost: dpkrAdmission
          });
        }
        
        const scienceTotalCost = sciencePrice + scienceParking + 
          crossLocationCosts.reduce((sum, item) => sum + item.cost, 0);
        
        membershipOptions.push({
          type: "Science",
          label: "Discovery Place Science Membership",
          baseCost: sciencePrice,
          additionalCosts: [
            { label: "Parking at Science (member rate)", cost: scienceParking },
            ...crossLocationCosts
          ].filter(item => item.cost > 0),
          totalCost: scienceTotalCost
        });
      }

      // Option 3: Kids-Huntersville membership
      if (dpkhVisits > 0) {
        const dpkhPrice = this.getMembershipPrice("DPKH", familySize);
        
        // Calculate cross-location visit costs for DPKH membership
        const crossLocationCosts = [];
        if (scienceVisits > 0) {
          const scienceAdmission = AdmissionCostCalculator.calculateScienceAdmission(
            adultCount, childrenCount, childAges, scienceVisits
          );
          const scienceParking = includeParking ? 
            scienceVisits * PricingConfig.parkingCosts.nonMemberRate : 0;
          crossLocationCosts.push({
            label: "Cross-location visits to Science",
            cost: scienceAdmission + scienceParking
          });
        }
        if (dpkrVisits > 0) {
          const dpkrAdmission = AdmissionCostCalculator.calculateDPKRAdmission(
            adultCount, childrenCount, childAges, dpkrVisits, isRichmondResident
          );
          crossLocationCosts.push({
            label: "Cross-location visits to DPKR",
            cost: dpkrAdmission
          });
        }
        
        const dpkhTotalCost = dpkhPrice + 
          crossLocationCosts.reduce((sum, item) => sum + item.cost, 0);
        
        membershipOptions.push({
          type: "DPKH",
          label: "Discovery Place Kids-Huntersville Membership",
          baseCost: dpkhPrice,
          additionalCosts: crossLocationCosts.filter(item => item.cost > 0),
          totalCost: dpkhTotalCost
        });
      }

      // Option 4: Kids-Rockingham membership
      if (dpkrVisits > 0) {
        const dpkrPrice = this.getMembershipPrice("DPKR", familySize);
        
        // Calculate cross-location visit costs for DPKR membership
        const crossLocationCosts = [];
        if (scienceVisits > 0) {
          const scienceAdmission = AdmissionCostCalculator.calculateScienceAdmission(
            adultCount, childrenCount, childAges, scienceVisits
          );
          const scienceParking = includeParking ? 
            scienceVisits * PricingConfig.parkingCosts.nonMemberRate : 0;
          crossLocationCosts.push({
            label: "Cross-location visits to Science",
            cost: scienceAdmission + scienceParking
          });
        }
        if (dpkhVisits > 0) {
          const dpkhAdmission = AdmissionCostCalculator.calculateDPKHAdmission(
            adultCount, childrenCount, childAges, dpkhVisits
          );
          crossLocationCosts.push({
            label: "Cross-location visits to DPKH",
            cost: dpkhAdmission
          });
        }
        
        const dpkrTotalCost = dpkrPrice + 
          crossLocationCosts.reduce((sum, item) => sum + item.cost, 0);
        
        membershipOptions.push({
          type: "DPKR",
          label: "Discovery Place Kids-Rockingham Membership",
          baseCost: dpkrPrice,
          additionalCosts: crossLocationCosts.filter(item => item.cost > 0),
          totalCost: dpkrTotalCost
        });
      }

      // Find the best option
      console.log("📊 Evaluating", membershipOptions.length, "membership options");
      
      membershipOptions.forEach(option => {
        console.log(`  - ${option.label}: Base $${option.baseCost}, Total $${option.totalCost}`);
        if (option.totalCost < bestMembershipCost) {
          bestMembershipCost = option.totalCost;
          bestMembershipType = option.type;
          bestMembershipLabel = option.label;
          bestAdditionalCosts = option.additionalCosts;
        }
      });

      // Apply discount if applicable
      let finalMembershipCost = membershipOptions.find(o => o.type === bestMembershipType)?.baseCost || 0;
      
      if (discountType && (discountType === 'educator' || discountType === 'military')) {
        const discountAmount = (bestMembershipType === "DPKR" && discountType === 'military') ? 30 : 20;
        finalMembershipCost = Math.max(0, bestMembershipCost - discountAmount);
        bestMembershipLabel += discountType === 'military' ? " (Military Discount)" : " (Educator Discount)";
      }

      // Calculate final total cost
      const finalTotalCost = finalMembershipCost + bestAdditionalCosts.reduce((sum, item) => sum + item.cost, 0);

      // Calculate savings
      const totalSavings = Math.max(0, regularAdmissionCost - finalTotalCost);
      const savingsPercentage = regularAdmissionCost > 0 ? 
        Math.round((totalSavings / regularAdmissionCost) * 100) : 0;

      // Build cost breakdown as an array for the component
      const costBreakdownArray = [];
      
      // Add membership cost
      costBreakdownArray.push({
        label: bestMembershipLabel,
        description: `Annual membership for ${familySize} family members`,
        cost: finalMembershipCost
      });
      
      // Add parking costs if any
      const parkingCost = bestAdditionalCosts.find(c => c.label.includes("Parking"));
      if (parkingCost && parkingCost.cost > 0) {
        costBreakdownArray.push({
          label: parkingCost.label,
          description: parkingCost.label,
          cost: parkingCost.cost
        });
      }
      
      // Add guest admission costs if any
      const guestAdmissions = bestAdditionalCosts.filter(c => c.label.includes("Guest admission"));
      if (guestAdmissions.length > 0) {
        const totalGuestCost = guestAdmissions.reduce((sum, c) => sum + c.cost, 0);
        if (totalGuestCost > 0) {
          costBreakdownArray.push({
            label: "Guest Admissions",
            description: "Additional guest admission costs",
            cost: totalGuestCost
          });
        }
      }
      
      // Add cross-location visit costs if any
      const crossLocationCosts = bestAdditionalCosts.filter(c => 
        c.label.includes("Cross-location") || c.label.includes("cross-location")
      );
      if (crossLocationCosts.length > 0) {
        const totalCrossLocationCost = crossLocationCosts.reduce((sum, c) => sum + c.cost, 0);
        if (totalCrossLocationCost > 0) {
          costBreakdownArray.push({
            label: "Cross-Location Visits",
            description: "Visits to non-covered locations",
            cost: totalCrossLocationCost
          });
        }
      }

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
        costBreakdown: costBreakdownArray
      };

      console.log("💰 Final recommendation:", recommendation);
      return recommendation;

    } catch (error) {
      console.error("Error in calculateMembershipCosts:", error);
      // Return a safe default recommendation
      const defaultMembershipCost = this.getMembershipPrice("Science", 4);
      return {
        bestMembershipType: "Science",
        bestMembershipLabel: "Discovery Place Science Membership",
        bestMembershipCost: defaultMembershipCost,
        regularAdmissionCost: 0,
        bestMembershipSavings: 0,
        savingsPercentage: 0,
        totalFamilyMembers: 4,
        primaryLocation: "Science",
        additionalCosts: [],
        totalPrice: defaultMembershipCost,
        costBreakdown: [
          {
            label: "Discovery Place Science Membership",
            description: "Annual membership for 4 family members",
            cost: defaultMembershipCost
          }
        ],
        error: true,
        errorMessage: error.message
      };
    }
  },

  /**
   * Calculate Welcome Program costs
   */
  calculateWelcomeProgramCosts(visitData) {
    const {
      adultCount = 0,
      childrenCount = 0,
      scienceVisits = 0,
      dpkhVisits = 0,
      dpkrVisits = 0,
      includeParking = true
    } = visitData;

    const familySize = adultCount + childrenCount;
    const totalVisits = scienceVisits + dpkhVisits + dpkrVisits;

    // Welcome Program is $75 flat rate for eligible families
    const welcomePrice = 75;
    
    // Calculate parking if needed
    const parkingCost = includeParking && scienceVisits > 0 ? 
      scienceVisits * PricingConfig.parkingCosts.memberRate : 0;

    const totalCost = welcomePrice + parkingCost;

    return {
      bestMembershipType: "Welcome",
      bestMembershipLabel: "Welcome Program Membership",
      bestMembershipCost: welcomePrice,
      regularAdmissionCost: AdmissionCostCalculator.calculateTotalAdmissionCosts(visitData),
      bestMembershipSavings: Math.max(0, AdmissionCostCalculator.calculateTotalAdmissionCosts(visitData) - totalCost),
      savingsPercentage: 0,
      totalFamilyMembers: familySize,
      primaryLocation: scienceVisits > 0 ? "Science" : dpkhVisits > 0 ? "DPKH" : "DPKR",
      additionalCosts: parkingCost > 0 ? [{ label: "Parking", cost: parkingCost }] : [],
      totalPrice: totalCost,
      locationsVisited: [scienceVisits > 0, dpkhVisits > 0, dpkrVisits > 0].filter(Boolean).length,
      visitBreakdown: {
        science: scienceVisits,
        dpkh: dpkhVisits,
        dpkr: dpkrVisits,
        total: totalVisits
      },
      isWelcomeProgram: true,
      costBreakdown: [
        {
          label: "Welcome Program Membership",
          description: "Discounted membership for eligible families",
          cost: welcomePrice
        },
        parkingCost > 0 ? {
          label: "Parking at Science",
          description: "Member rate parking",
          cost: parkingCost
        } : null
      ].filter(Boolean)
    };
  }
};

export default MembershipPriceCalculator;

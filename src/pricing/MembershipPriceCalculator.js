// pricing/MembershipPriceCalculator.js
import { PricingConfig } from "./PricingConfig";
import { DiscountService } from "./DiscountService";
import { AdmissionCostCalculator } from "./AdmissionCostCalculator";

/**
 * Membership Price Calculator
 * Handles calculations related to membership pricing and recommendations
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

    // Check if membership type exists
    if (!PricingConfig.MembershipPrices[type]) {
      console.error(`Invalid membership type: ${type}`);
      return 0;
    }

    // Cap memberCount to avoid array out-of-bounds
    memberCount = Math.min(
      memberCount,
      PricingConfig.MembershipPrices[type].length
    );

    // Special handling for ScienceBasic - only offers 1-person membership
    if (type === "ScienceBasic" && memberCount > 1) {
      return 0; // No multi-person ScienceBasic memberships
    }

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
    } = options;

    // Calculate eligible family members
    const eligibleChildrenCount = childAges.filter((age) => age >= 2).length;
    const totalFamilyMembers = Math.min(
      PricingConfig.Constraints.MAX_ADULTS +
        PricingConfig.Constraints.MAX_CHILDREN,
      adultCount + eligibleChildrenCount
    );

    // Determine primary location
    const primaryLocation = AdmissionCostCalculator.determinePrimaryLocation(
      scienceVisits,
      dpkhVisits,
      dpkrVisits
    );

    // Calculate guest admission savings with detailed breakdown
    const guestAdmissionSavingsData =
      DiscountService.calculateGuestAdmissionSavings({
        adultCount,
        childAges,
        scienceVisits,
        dpkhVisits,
        dpkrVisits,
        isRichmondResident,
        primaryLocation,
      });

    const guestAdmissionSavings = guestAdmissionSavingsData.total;
    const guestSavingsBreakdown = guestAdmissionSavingsData.breakdown;

    // Cap visits
    const cappedScienceVisits = Math.min(
      scienceVisits,
      PricingConfig.Constraints.MAX_VISITS_PER_LOCATION
    );
    const cappedDpkhVisits = Math.min(
      dpkhVisits,
      PricingConfig.Constraints.MAX_VISITS_PER_LOCATION
    );
    const cappedDpkrVisits = Math.min(
      dpkrVisits,
      PricingConfig.Constraints.MAX_VISITS_PER_LOCATION
    );

    const totalVisits = AdmissionCostCalculator.countTotalVisits(
      scienceVisits,
      dpkhVisits,
      dpkrVisits
    );

    // Calculate regular admission cost (what they would pay without membership)
    const regularAdmissionCost =
      AdmissionCostCalculator.calculateRegularAdmissionCost({
        adultCount,
        childAges,
        scienceVisits,
        dpkhVisits,
        dpkrVisits,
        isRichmondResident,
        includeParking,
      });

    // Calculate membership costs for different options
    const scienceMembershipCost = this.getMembershipPrice(
      "Science",
      totalFamilyMembers
    );
    const scienceBasicMembershipCost = this.getMembershipPrice(
      "ScienceBasic",
      totalFamilyMembers
    );
    const dpkhMembershipCost = this.getMembershipPrice(
      "DPKH",
      totalFamilyMembers
    );
    const dpkrMembershipCost = this.getMembershipPrice(
      "DPKR",
      totalFamilyMembers
    );
    const scienceKidsMembershipCost = this.getMembershipPrice(
      "ScienceKids",
      totalFamilyMembers
    );

    // Check if Rockingham-only (no visits to other locations)
    const isRockinghamOnlyMembership =
      primaryLocation === "DPKR" && dpkhVisits === 0 && scienceVisits === 0;

    // Apply promotional discounts if eligible
    const scienceMembershipPromoCost = DiscountService.applyDiscount(
      scienceMembershipCost,
      totalFamilyMembers,
      "Science"
    );

    // ScienceBasic is not eligible for promotional discounts
    const scienceBasicMembershipPromoCost = scienceBasicMembershipCost;

    const dpkhMembershipPromoCost = DiscountService.applyDiscount(
      dpkhMembershipCost,
      totalFamilyMembers,
      "DPKH"
    );

    const dpkrMembershipPromoCost = DiscountService.applyDiscount(
      dpkrMembershipCost,
      totalFamilyMembers,
      "DPKR"
    );

    const scienceKidsPromoCost = DiscountService.applyDiscount(
      scienceKidsMembershipCost,
      totalFamilyMembers,
      primaryLocation,
      "ScienceKids"
    );

    // Check discount eligibility for each membership type
    const scienceDiscountEligible = DiscountService.isEligibleForDiscount(
      totalFamilyMembers,
      "Science"
    );

    const scienceBasicDiscountEligible = false; // ScienceBasic never eligible for discounts

    const dpkhDiscountEligible = DiscountService.isEligibleForDiscount(
      totalFamilyMembers,
      "DPKH"
    );

    const dpkrDiscountEligible = false; // Rockingham memberships never eligible

    const scienceKidsDiscountEligible = DiscountService.isEligibleForDiscount(
      totalFamilyMembers,
      primaryLocation,
      "ScienceKids"
    );

    // Calculate parking costs
    const parkingCost = includeParking
      ? AdmissionCostCalculator.calculateParkingCost(cappedScienceVisits, true)
      : 0;

    // Calculate cross-location costs for each membership type
    // For Science membership - calculate discounted costs for DPKH and DPKR
    let scienceCrossLocationCosts = this.calculateCrossLocationCosts({
      adultCount,
      childAges,
      membershipType: "Science",
      scienceVisits: 0, // Don't include visits to home location
      dpkhVisits: cappedDpkhVisits,
      dpkrVisits: cappedDpkrVisits,
      isRichmondResident,
    });

    // For ScienceBasic membership - NO cross-location discounts, pay full price
    let scienceBasicCrossLocationCosts = this.calculateCrossLocationCosts({
      adultCount,
      childAges,
      membershipType: "ScienceBasic", // This will result in no discounts
      scienceVisits: 0, // Don't include visits to home location
      dpkhVisits: cappedDpkhVisits,
      dpkrVisits: cappedDpkrVisits,
      isRichmondResident,
    });

    // For DPKH membership - calculate discounted costs for Science and DPKR
    let dpkhCrossLocationCosts = this.calculateCrossLocationCosts({
      adultCount,
      childAges,
      membershipType: "DPKH",
      scienceVisits: cappedScienceVisits,
      dpkhVisits: 0, // Don't include visits to home location
      dpkrVisits: cappedDpkrVisits,
      isRichmondResident,
    });

    // For DPKR membership - calculate discounted costs for Science and DPKH
    let dpkrCrossLocationCosts = this.calculateCrossLocationCosts({
      adultCount,
      childAges,
      membershipType: "DPKR",
      scienceVisits: cappedScienceVisits,
      dpkhVisits: cappedDpkhVisits,
      dpkrVisits: 0, // Don't include visits to home location
      isRichmondResident,
    });

    // ScienceKids membership has no cross-location costs (covers all locations)
    let scienceKidsCrossLocationCosts = 0;

    // Calculate total costs for all membership types (with parking and cross-location costs)
    const scienceTotalCost =
      scienceMembershipPromoCost + parkingCost + scienceCrossLocationCosts;
    const scienceBasicTotalCost =
      scienceBasicMembershipPromoCost + parkingCost + scienceBasicCrossLocationCosts;
    const dpkhTotalCost =
      dpkhMembershipPromoCost + parkingCost + dpkhCrossLocationCosts;
    const dpkrTotalCost =
      dpkrMembershipPromoCost + parkingCost + dpkrCrossLocationCosts;
    const scienceKidsTotalCost = scienceKidsPromoCost + parkingCost;

    // Calculate Welcome Program costs if eligible
    let welcomeProgramOption = null;
    if (isWelcomeEligible) {
      welcomeProgramOption = DiscountService.calculateWelcomeProgramPricing({
        people: adultCount + childrenCount,
        adultCount,
        childrenCount,
        type: "membership",
        location: primaryLocation,
        scienceVisits,
        dpkhVisits,
        dpkrVisits,
        includeParking,
      });
    }

    // Create membership options array
    const membershipOptions = [
      {
        type: "Science",
        basePrice: scienceMembershipCost,
        discountedCost: scienceMembershipPromoCost,
        totalCost: scienceTotalCost,
        isDiscountEligible: scienceDiscountEligible,
        parkingCost: parkingCost,
        crossLocationCosts: scienceCrossLocationCosts,
        isAvailable: scienceMembershipCost > 0, // Available if there's a valid price
      },
      {
        type: "ScienceBasic",
        basePrice: scienceBasicMembershipCost,
        discountedCost: scienceBasicMembershipPromoCost,
        totalCost: scienceBasicTotalCost,
        isDiscountEligible: scienceBasicDiscountEligible,
        parkingCost: parkingCost,
        crossLocationCosts: scienceBasicCrossLocationCosts,
        isAvailable: scienceBasicMembershipCost > 0 && totalFamilyMembers === 1, // Only for 1-person
      },
      {
        type: "DPKH",
        basePrice: dpkhMembershipCost,
        discountedCost: dpkhMembershipPromoCost,
        totalCost: dpkhTotalCost,
        isDiscountEligible: dpkhDiscountEligible,
        parkingCost: parkingCost,
        crossLocationCosts: dpkhCrossLocationCosts,
        isAvailable: dpkhMembershipCost > 0,
      },
      {
        type: "DPKR",
        basePrice: dpkrMembershipCost,
        discountedCost: dpkrMembershipPromoCost,
        totalCost: dpkrTotalCost,
        isDiscountEligible: dpkrDiscountEligible,
        parkingCost: parkingCost,
        crossLocationCosts: dpkrCrossLocationCosts,
        isAvailable: dpkrMembershipCost > 0,
      },
      {
        type: "ScienceKids",
        basePrice: scienceKidsMembershipCost,
        discountedCost: scienceKidsPromoCost,
        totalCost: scienceKidsTotalCost,
        isDiscountEligible: scienceKidsDiscountEligible,
        parkingCost: parkingCost,
        crossLocationCosts: scienceKidsCrossLocationCosts,
        isAvailable: scienceKidsMembershipCost > 0,
      },
    ];

    // Add Welcome Program if eligible
    if (isWelcomeEligible && welcomeProgramOption) {
      membershipOptions.push({
        type: "Welcome",
        basePrice: welcomeProgramOption.totalPrice,
        discountedCost: welcomeProgramOption.totalPrice,
        totalCost: welcomeProgramOption.totalPrice,
        isDiscountEligible: false,
        parkingCost: 0, // Included in Welcome Program
        crossLocationCosts: 0, // Included in Welcome Program
        isAvailable: true,
        welcomeDetails: welcomeProgramOption,
      });
    }

    // Filter available options and find the best one
    const availableOptions = membershipOptions.filter(option => option.isAvailable);
    const bestOption = availableOptions.reduce((best, current) => 
      current.totalCost < best.totalCost ? current : best
    );

    // Add PayAsYouGo option for comparison
    const payAsYouGoOption = {
      type: "PayAsYouGo",
      basePrice: regularAdmissionCost,
      discountedCost: regularAdmissionCost,
      totalCost: regularAdmissionCost,
      isDiscountEligible: false,
      parkingCost: 0, // Included in regular admission cost
      crossLocationCosts: 0, // Included in regular admission cost
      isAvailable: true,
    };

    // Compare with pay-as-you-go
    const finalBestOption = regularAdmissionCost < bestOption.totalCost 
      ? payAsYouGoOption 
      : bestOption;

    // Get membership details using new structure
    const membershipDetails = PricingConfig.MembershipDetails[finalBestOption.type] || PricingConfig.MembershipDetails["Science"];

    // Calculate savings
    const totalSavings = regularAdmissionCost - finalBestOption.totalCost;
    const savingsPercentage = regularAdmissionCost > 0 
      ? Math.round((totalSavings / regularAdmissionCost) * 100) 
      : 0;

    // Generate explanation
    const explanation = this.generateMembershipExplanation({
      bestMembershipType: finalBestOption.type,
      totalVisits,
      primaryLocation,
      totalFamilyMembers,
      totalSavings,
      regularAdmissionCost,
      bestOption: finalBestOption,
    });

    // Build cost breakdown items
    let costBreakdownItems = [];
    let savingsBreakdownItems = [];

    if (finalBestOption.type === "PayAsYouGo") {
      costBreakdownItems = [
        {
          label: "Regular Admission",
          cost: finalBestOption.totalCost - (includeParking && cappedScienceVisits > 0 
            ? AdmissionCostCalculator.calculateParkingCost(cappedScienceVisits, false) 
            : 0),
          details: `${totalVisits} total visits`,
        },
      ];

      if (includeParking && cappedScienceVisits > 0) {
        costBreakdownItems.push({
          label: "Parking at Science",
          cost: AdmissionCostCalculator.calculateParkingCost(cappedScienceVisits, false),
          details: `${cappedScienceVisits} visits × $18 per visit`,
        });
      }
    } else {
      // Standard membership breakdown
      costBreakdownItems = [
        {
          label: membershipDetails.label,
          cost: finalBestOption.discountedCost,
          details: finalBestOption.isDiscountEligible
            ? `${finalBestOption.basePrice} - 20% discount = ${finalBestOption.discountedCost}`
            : `Base membership fee`,
        },
        ...(finalBestOption.parkingCost > 0
          ? [{ label: "Parking at Science", cost: finalBestOption.parkingCost }]
          : []),
        ...(finalBestOption.crossLocationCosts > 0
          ? [
              {
                label: "Cross-Location Admission",
                cost: finalBestOption.crossLocationCosts,
              },
            ]
          : []),
      ];
    }

    // Build result object
    const result = {
      bestMembershipType: finalBestOption.type,
      bestMembershipLabel: membershipDetails.label,
      baseMembershipPrice: finalBestOption.discountedCost,
      totalMembershipCost: finalBestOption.totalCost,
      additionalCosts: costBreakdownItems.slice(1), // Exclude base membership
      getTotalPrice: () => finalBestOption.totalCost,
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
      scienceBasicDiscountEligible: scienceBasicDiscountEligible,
      dpkhDiscountEligible: dpkhDiscountEligible,
      dpkrDiscountEligible: dpkrDiscountEligible,
      scienceKidsDiscountEligible: scienceKidsDiscountEligible,
      purchaseLink:
        finalBestOption.type === "Welcome" && finalBestOption.welcomeDetails
          ? finalBestOption.welcomeDetails.purchaseLink
          : membershipDetails.purchaseLink,
      isWelcomeEligible: isWelcomeEligible,
      welcomeProgramOption: isWelcomeEligible ? welcomeProgramOption : null,
      regularAdmissionCost: regularAdmissionCost,
      guestAdmissionSavings: guestAdmissionSavings,
      crossLocationCosts: finalBestOption.crossLocationCosts || 0,
    };

    return result;
  },

  /**
   * Calculate costs for cross-location visits (visits to locations not covered by primary membership)
   * Updated to include per-visit guest discount limits
   *
   * @param {Object} options - Calculation options
   * @returns {number} Total cross-location costs with member discounts applied
   */
  calculateCrossLocationCosts(options) {
    const {
      adultCount,
      childAges,
      membershipType,
      scienceVisits,
      dpkhVisits,
      dpkrVisits,
      isRichmondResident,
    } = options;

    let totalCost = 0;

    // Get the discount rates based on membership type
    const discountMap =
      PricingConfig.GuestDiscounts.discountMap[membershipType] || {};

    // Get discount limits from configuration
    const { homeMuseum: homeMuseumLimit, otherMuseums: otherMuseumsLimit } =
      PricingConfig.GuestDiscounts.discountLimits;

    // Admission prices
    const admissionPrices = PricingConfig.AdmissionPrices;

    // Count eligible children by age
    const eligibleChildrenForScience = childAges.filter(
      (age) => age >= admissionPrices.Science.childAgeThreshold
    ).length;
    const eligibleChildrenForDPKH = childAges.filter(
      (age) => age >= admissionPrices.DPKH.childAgeThreshold
    ).length;
    const eligibleChildrenForDPKR = childAges.filter(
      (age) => age >= admissionPrices.DPKR.childAgeThreshold
    ).length;

    // Calculate Science visit costs with member discount
    if (scienceVisits > 0 && discountMap.Science) {
      const discountRate = discountMap.Science;
      const isHomeMuseum =
        membershipType === "Science" || membershipType === "ScienceKids";
      const maxDiscountedGuests = isHomeMuseum
        ? homeMuseumLimit
        : otherMuseumsLimit;

      // Calculate total guests
      const totalGuests = adultCount + eligibleChildrenForScience;

      // Calculate how many guests get the discount
      const discountedGuests = Math.min(totalGuests, maxDiscountedGuests);
      const nonDiscountedGuests = totalGuests - discountedGuests;

      // Adult calculations
      const discountedAdults = Math.min(adultCount, discountedGuests);
      const nonDiscountedAdults = adultCount - discountedAdults;

      const adultPriceWithDiscount =
        admissionPrices.Science.adult * (1 - discountRate);
      const adultFullPrice = admissionPrices.Science.adult;

      // Child calculations
      const discountedChildren = Math.min(
        eligibleChildrenForScience,
        discountedGuests - discountedAdults
      );
      const nonDiscountedChildren =
        eligibleChildrenForScience - discountedChildren;

      const childPriceWithDiscount =
        admissionPrices.Science.child * (1 - discountRate);
      const childFullPrice = admissionPrices.Science.child;

      // Calculate total costs
      const discountedAdultCost =
        scienceVisits * discountedAdults * adultPriceWithDiscount;
      const fullPriceAdultCost =
        scienceVisits * nonDiscountedAdults * adultFullPrice;
      const discountedChildCost =
        scienceVisits * discountedChildren * childPriceWithDiscount;
      const fullPriceChildCost =
        scienceVisits * nonDiscountedChildren * childFullPrice;

      totalCost +=
        discountedAdultCost +
        fullPriceAdultCost +
        discountedChildCost +
        fullPriceChildCost;
    }

    // Calculate DPKH visit costs with member discount
    if (dpkhVisits > 0 && discountMap.DPKH) {
      const discountRate = discountMap.DPKH;
      const isHomeMuseum =
        membershipType === "DPKH" || membershipType === "ScienceKids";
      const maxDiscountedGuests = isHomeMuseum
        ? homeMuseumLimit
        : otherMuseumsLimit;

      // Calculate total guests
      const totalGuests = adultCount + eligibleChildrenForDPKH;

      // Calculate how many guests get the discount
      const discountedGuests = Math.min(totalGuests, maxDiscountedGuests);
      const nonDiscountedGuests = totalGuests - discountedGuests;

      // Adult calculations
      const discountedAdults = Math.min(adultCount, discountedGuests);
      const nonDiscountedAdults = adultCount - discountedAdults;

      const adultPriceWithDiscount =
        admissionPrices.DPKH.adult * (1 - discountRate);
      const adultFullPrice = admissionPrices.DPKH.adult;

      // Child calculations
      const discountedChildren = Math.min(
        eligibleChildrenForDPKH,
        discountedGuests - discountedAdults
      );
      const nonDiscountedChildren =
        eligibleChildrenForDPKH - discountedChildren;

      const childPriceWithDiscount =
        admissionPrices.DPKH.child * (1 - discountRate);
      const childFullPrice = admissionPrices.DPKH.child;

      // Calculate total costs
      const discountedAdultCost =
        dpkhVisits * discountedAdults * adultPriceWithDiscount;
      const fullPriceAdultCost =
        dpkhVisits * nonDiscountedAdults * adultFullPrice;
      const discountedChildCost =
        dpkhVisits * discountedChildren * childPriceWithDiscount;
      const fullPriceChildCost =
        dpkhVisits * nonDiscountedChildren * childFullPrice;

      totalCost +=
        discountedAdultCost +
        fullPriceAdultCost +
        discountedChildCost +
        fullPriceChildCost;
    }

    // Calculate DPKR visit costs with member discount
    if (dpkrVisits > 0 && discountMap.DPKR) {
      const discountRate = discountMap.DPKR;
      const isHomeMuseum =
        membershipType === "DPKR" || membershipType === "ScienceKids";
      const maxDiscountedGuests = isHomeMuseum
        ? homeMuseumLimit
        : otherMuseumsLimit;

      // Calculate total guests
      const totalGuests = adultCount + eligibleChildrenForDPKR;

      // Calculate how many guests get the discount
      const discountedGuests = Math.min(totalGuests, maxDiscountedGuests);
      const nonDiscountedGuests = totalGuests - discountedGuests;

      // Get prices based on Richmond residency status
      const priceCategory = isRichmondResident ? "resident" : "standard";
      const adultFullPrice = admissionPrices.DPKR[priceCategory].adult;
      const childFullPrice = admissionPrices.DPKR[priceCategory].child;

      // Apply discount rate to get discounted prices
      const adultPriceWithDiscount = adultFullPrice * (1 - discountRate);
      const childPriceWithDiscount = childFullPrice * (1 - discountRate);

      // Adult calculations
      const discountedAdults = Math.min(adultCount, discountedGuests);
      const nonDiscountedAdults = adultCount - discountedAdults;

      // Child calculations
      const discountedChildren = Math.min(
        eligibleChildrenForDPKR,
        discountedGuests - discountedAdults
      );
      const nonDiscountedChildren =
        eligibleChildrenForDPKR - discountedChildren;

      // Calculate total costs
      const discountedAdultCost =
        dpkrVisits * discountedAdults * adultPriceWithDiscount;
      const fullPriceAdultCost =
        dpkrVisits * nonDiscountedAdults * adultFullPrice;
      const discountedChildCost =
        dpkrVisits * discountedChildren * childPriceWithDiscount;
      const fullPriceChildCost =
        dpkrVisits * nonDiscountedChildren * childFullPrice;

      totalCost +=
        discountedAdultCost +
        fullPriceAdultCost +
        discountedChildCost +
        fullPriceChildCost;
    }

    return Math.round(totalCost);
  },

  /**
   * Get membership details for a specific type
   * @param {string} membershipType - Membership type code
   * @returns {Object} Membership details
   */
  getMembershipDetails(membershipType) {
    return PricingConfig.MembershipDetails[membershipType] || PricingConfig.MembershipDetails["Science"];
  },

  /**
   * Generate explanation for the recommended membership
   * @param {Object} options - Explanation options
   * @returns {string} Explanation text
   */
  generateMembershipExplanation(options) {
    const {
      bestMembershipType,
      totalVisits,
      totalSavings,
      regularAdmissionCost,
    } = options;

    if (bestMembershipType === "PayAsYouGo") {
      return `With ${totalVisits} planned visits, paying for individual admissions is more cost-effective than purchasing a membership.`;
    } else if (bestMembershipType === "Welcome") {
      return `As an EBT/WIC cardholder, you qualify for our Welcome Program, which offers the best value for your family.`;
    } else if (bestMembershipType === "ScienceBasic") {
      return `The Science Basic membership is perfect for individual visitors who primarily visit Discovery Place Science. You'll save $${totalSavings.toFixed(2)} compared to regular admission.`;
    } else {
      return `Based on your visit pattern, the ${this.getMembershipDetails(bestMembershipType).label} offers the best value, saving you $${totalSavings.toFixed(2)} compared to regular admission.`;
    }
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

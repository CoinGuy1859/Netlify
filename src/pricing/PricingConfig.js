// pricing/PricingConfig.js
/**
 * Centralized Pricing Configuration
 *
 * This file serves as the single source of truth for all pricing structures
 * across the application. It contains:
 *
 * - Admission prices for each location
 * - Membership pricing tiers by number of people
 * - Parking rates
 * - Guest discount percentages
 * - Promotional discounts and eligibility rules
 * - Welcome Program pricing
 * - System constraints
 *
 * All prices are in USD and should be updated when official pricing changes.
 */

export const PricingConfig = {
  /**
   * Admission Prices
   *
   * Contains standard admission prices for each Discovery Place location
   * including adult and child pricing, plus age thresholds for free admission
   */
  AdmissionPrices: {
    // Discovery Place Science (Charlotte)
    Science: {
      adult: 23.95, // Adult admission price (14-59 for GA, 19+ for memberships)
      child: 18.95, // Child admission price (2-13 for GA, 2-18 for membership)
      childAgeThreshold: 2, // Children under 2 are free
      description:
        "Our flagship science museum in Uptown Charlotte featuring interactive exhibits for all ages",
    },

    // Discovery Place Kids-Huntersville
    DPKH: {
      adult: 15.95, // Adult admission price
      child: 15.95, // Child admission price (everyone 1+ pays same price)
      childAgeThreshold: 1, // Children under 1 are free
      description:
        "Children's museum in Huntersville designed for children 10 and under",
    },

    // Discovery Place Kids-Rockingham
    DPKR: {
      // Standard pricing for non-residents
      standard: {
        adult: 9.95,
        child: 9.95,
      },
      // Discounted pricing for Richmond County residents and military
      resident: {
        adult: 5.95,
        child: 5.95,
      },
      childAgeThreshold: 1, // Children under 1 are free
      description:
        "Children's museum in Rockingham designed for children 10 and under",
    },
  },

  /**
   * Membership Base Prices
   *
   * Prices are indexed by number of people:
   * - Index 0 = 1 person
   * - Index 1 = 2 people
   * - Index 2 = 3 people
   * And so on...
   *
   * Note: DPKH, DPKR, and ScienceKids do not offer 1-person memberships
   * Note: ScienceBasic only offers 1-person memberships
   */
  MembershipPrices: {
    // Discovery Place Science - Full membership with all benefits
    Science: [189, 209, 229, 249, 269, 289, 309, 329, 349, 369],

    // Discovery Place Science - Basic membership (limited benefits, 1-person only)
    ScienceBasic: [109, 0, 0, 0, 0, 0, 0, 0, 0, 0],

    // Discovery Place Kids-Huntersville
    DPKH: [0, 209, 229, 249, 269, 289, 309, 329, 349, 369], // No 1-person memberships

    // Discovery Place Kids-Rockingham
    DPKR: [0, 129, 139, 149, 159, 169, 179, 189, 199, 209], // No 1-person memberships

    // Science + Kids Membership (access to all locations)
    ScienceKids: [0, 309, 329, 349, 369, 389, 409, 429, 449, 469], // No 1-person memberships
  },

  /**
   * Membership Types and Details
   * 
   * Contains metadata about each membership type including labels,
   * purchase links, and descriptions of benefits
   */
  MembershipDetails: {
    Science: {
      label: "Discovery Place Science Membership",
      iconType: "science",
      purchaseLink:
        "https://visit.discoveryplace.org/science/events/36a58ae8-155d-8116-9188-7d0b6fae199c",
      description:
        "Access to Discovery Place Science for all named members, plus guest discounts and cross-location visit benefits",
    },
    ScienceBasic: {
      label: "Discovery Place Science Basic Membership",
      iconType: "science-basic",
      purchaseLink:
        "https://visit.discoveryplace.org/science/events/36a58ae8-155d-8116-9188-7d0b6fae199c",
      description:
        "Access to Discovery Place Science for one adult only. No guest discounts or cross-location visit benefits included.",
    },
    DPKH: {
      label: "Discovery Place Kids-Huntersville Membership",
      iconType: "kids-huntersville",
      purchaseLink:
        "https://visit.discoveryplace.org/huntersville/events/7877bc4b-7702-fb6d-b750-01a851e506db",
      description:
        "Access to Discovery Place Kids-Huntersville for all named members, plus guest discounts at other locations",
    },
    DPKR: {
      label: "Discovery Place Kids-Rockingham Membership",
      iconType: "kids-rockingham",
      purchaseLink:
        "https://visit.discoveryplace.org/rockingham/events/fb6d6074-79dd-d53a-a5c9-84b7c12ae844",
      description:
        "Access to Discovery Place Kids-Rockingham for all named members, plus guest discounts at other locations",
    },
    ScienceKids: {
      label: "Discovery Place Science + Kids Membership", 
      iconType: "science-kids",
      purchaseLink:
        "https://visit.discoveryplace.org/science/events/36a58ae8-155d-8116-9188-7d0b6fae199c",
      description:
        "Access to ALL Discovery Place locations for all named members, with guest discounts at all locations",
    },
    Welcome: {
      label: "Discovery Place Welcome Program",
      iconType: "welcome",
      purchaseLink:
        "https://visit.discoveryplace.org/science/events/36a58ae8-155d-8116-9188-7d0b6fae199c?tg=d99160b3-94fd-9362-978e-44607faf4b03",
      description:
        "$75 per year for NC/SC EBT/WIC cardholders - includes admission for up to 8 people and parking",
    },
    PayAsYouGo: {
      label: "Pay As You Go (Regular Admission)",
      iconType: "ticket",
      purchaseLink: "https://discoveryplace.org/visit/buy-tickets/",
      description: "Regular admission tickets purchased for each visit",
    },
  },

  /**
   * Parking Rates
   *
   * Different parking rates based on membership status
   */
  ParkingRates: {
    member: 8, // Flat rate for members
    welcome: 8, // Flat rate for Welcome Program participants
    standard: 18, // Estimated average for non-members (3hr visit)
  },

  /**
   * Guest Discounts
   *
   * Percentage discounts applied when visiting with a member
   * Format: memberLocation -> visitLocation -> discount percentage
   * 
   * Note: ScienceBasic memberships do not include guest discounts
   */
  GuestDiscounts: {
    discountMap: {
      // For Science members (full membership)
      Science: {
        Science: 0.5, // 50% off at home location
        DPKH: 0.25, // 25% off at other locations
        DPKR: 0.25,
      },

      // For Science Basic members (no guest discounts)
      ScienceBasic: {
        Science: 0, // No guest discounts
        DPKH: 0,
        DPKR: 0,
      },

      // For DPKH members
      DPKH: {
        Science: 0.25,
        DPKH: 0.5, // 50% off at home location
        DPKR: 0.25,
      },

      // For DPKR members
      DPKR: {
        Science: 0.25,
        DPKH: 0.25,
        DPKR: 0.5, // 50% off at home location
      },

      // For Science+Kids members
      ScienceKids: {
        Science: 0.5,
        DPKH: 0.5,
        DPKR: 0.5, // 50% off at all locations with ScienceKids membership
      },
    },

    /**
     * Guest Discount Limits
     *
     * Maximum number of guests that can receive the discount per visit
     */
    discountLimits: {
      homeMuseum: 6, // Maximum number of discounted guests at home museum (50% off)
      otherMuseums: 4, // Maximum number of discounted guests at other museums (25% off)
    },
  },

  /**
   * Discount Configurations
   *
   * Contains settings for promotional and special discounts
   */
  Discounts: {
    /**
     * Current membership discount promotion
     *
     * Controls eligibility and rates for promotional discounts
     */
    membershipDiscount: {
      minimumMembers: 3, // Minimum number of people required for discount
      eligibleLocations: ["Science", "DPKH", "ScienceKids"], // Eligible membership types
      currentRate: 0.0, // Set to 0.0 - No discount currently offered (previously 0.2 for 20%)
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-06-30"),

      // Display content for promotional banner - Set to empty since no promotion is active
      promoBanner: {
        title: "",
        description: "",
      },
    },

    /**
     * Military Discounts
     * 
     * Special discounts for military families
     */
    militaryDiscount: {
      dpkrDiscount: 30, // $30 discount on DPKR memberships for military
      otherLocationsDiscount: 20, // $20 discount on other location memberships for military
    },

    /**
     * Welcome Program configuration
     *
     * Special pricing for NC/SC EBT and WIC cardholders
     */
    welcomeProgram: {
      membershipPrice: 75, // Base price for Welcome Program membership
      maxPeople: 8, // Maximum number of people on a membership
      maxAdults: 2, // Maximum number of adults
      maxChildren: 6, // Maximum number of children
      singleVisitPrice: 3, // Per-person price for single visits
      maxSingleVisitGroup: 6, // Maximum group size for single visits (2 adults + 4 children)

      // Purchase links
      purchaseLinks: {
        Science:
          "https://visit.discoveryplace.org/science/events/36a58ae8-155d-8116-9188-7d0b6fae199c?tg=d99160b3-94fd-9362-978e-44607faf4b03",
        DPKH: "https://visit.discoveryplace.org/huntersville/events/7877bc4b-7702-fb6d-b750-01a851e506db?tg=d99160b3-94fd-9362-978e-44607faf4b03",
        DPKR: "https://visit.discoveryplace.org/rockingham/events/fb6d6074-79dd-d53a-a5c9-84b7c12ae844?tg=d99160b3-94fd-9362-978e-44607faf4b03",
      },

      // Information links
      infoLinks: {
        Science: "https://discoveryplace.org/visit/welcome-program/",
        DPKH: "https://discoveryplacekids.org/welcome-program/",
        DPKR: "https://dpkidsrockingham.org/welcome-program/",
      },

      // Eligibility requirements (for display purposes)
      eligibilityRequirements: [
        "Must be a current North Carolina or South Carolina EBT or WIC cardholder",
        "Must present valid ID and EBT/WIC card when purchasing or using membership",
        "Available for purchase online or at any Discovery Place location",
      ],
    },
  },

  /**
   * System Constraints
   *
   * Limits and validation rules for the application
   */
  Constraints: {
    MAX_ADULTS: 8,
    MAX_CHILDREN: 12,
    MAX_CHILD_AGE: 21,
    MAX_VISITS_PER_LOCATION: 20,
    MAX_TOTAL_VISITS: 40,
  },

  /**
   * Location Information
   *
   * Details about each Discovery Place location
   */
  LocationInfo: {
    Science: {
      name: "Discovery Place Science",
      address: "301 N Tryon St, Charlotte, NC 28202",
      hours: "9:30 AM - 4:30 PM (Mon-Fri), 9:30 AM - 5:30 PM (Sat-Sun)",
      phone: "(704) 372-6261",
      coordinates: { lat: 35.229, lng: -80.839 },
      description:
        "Discovery Place Science offers interactive exhibits and innovative STEM programming that inspires learning for visitors of all ages.",
    },
    DPKH: {
      name: "Discovery Place Kids-Huntersville",
      address: "105 Gilead Rd, Huntersville, NC 28078",
      hours:
        "9:30 AM - 4:30 PM (Tue-Sat), 12:00 PM - 5:00 PM (Sun), Closed Monday",
      phone: "(704) 372-6261",
      coordinates: { lat: 35.41, lng: -80.858 },
      description:
        "Discovery Place Kids in Huntersville is a children's museum designed for kids 10 and under that encourages learning through play.",
    },
    DPKR: {
      name: "Discovery Place Kids-Rockingham",
      address: "233 E Washington St, Rockingham, NC 28379",
      hours:
        "9:30 AM - 4:30 PM (Tue-Sat), 12:00 PM - 5:00 PM (Sun), Closed Monday",
      phone: "(704) 372-6261",
      coordinates: { lat: 34.94, lng: -79.751 },
      description:
        "Discovery Place Kids in Rockingham offers playful learning experiences for children and families in Richmond County and surrounding areas.",
    },
  },
};

// App.js - FIXED VERSION TO PREVENT INFINITE LOOP
import React, { useReducer, useCallback, useEffect, useRef } from "react";
import { formatCurrency, capValue } from "./helpers/calculationHelpers";
import {
  PricingConfig,
  AdmissionCostCalculator,
  MembershipPriceCalculator,
} from "./pricing/pricing-module";

// Import MembershipTools and other components
import MembershipTools from "./components/MembershipTools";
import WelcomeNotification from "./components/WelcomeNotification";
import SituationBreakdown from "./components/SituationBreakdown";
import ErrorBoundary from "./components/ErrorBoundary";

/**
 * Initial state for the application
 */
const initialState = {
  // Navigation state
  currentStep: 1,

  // Family composition state
  adultCount: 2,
  childrenCount: 2,
  childAges: [5, 7],

  // Visit frequency state
  scienceVisits: 4,
  dpkhVisits: 2,
  dpkrVisits: 0,

  // Special considerations
  isRichmondResident: false,
  needsFlexibility: false,
  isWelcomeEligible: false,
  includeParking: true,
  discountType: null, // Can be 'educator', 'military', or null

  // UI state
  errors: {
    childAges: ["", ""],
  },
  announcement: "",
  isCalculating: false, // New state for tracking calculation progress

  // Computed data
  membershipRecommendation: null,
  primaryLocationIcon: "science",
  visitDistributionData: [],

  // New flag to control recommendation calculation
  needsRecommendationUpdate: false,
};

/**
 * Action types for the reducer
 */
const ACTION_TYPES = {
  SET_STEP: "SET_STEP",
  SET_ADULT_COUNT: "SET_ADULT_COUNT",
  SET_CHILDREN_COUNT: "SET_CHILDREN_COUNT",
  SET_CHILD_AGE: "SET_CHILD_AGE",
  UPDATE_CHILD_AGES_ARRAY: "UPDATE_CHILD_AGES_ARRAY",
  SET_SCIENCE_VISITS: "SET_SCIENCE_VISITS",
  SET_DPKH_VISITS: "SET_DPKH_VISITS",
  SET_DPKR_VISITS: "SET_DPKR_VISITS",
  SET_RICHMOND_RESIDENT: "SET_RICHMOND_RESIDENT",
  SET_NEEDS_FLEXIBILITY: "SET_NEEDS_FLEXIBILITY",
  SET_WELCOME_ELIGIBLE: "SET_WELCOME_ELIGIBLE",
  SET_INCLUDE_PARKING: "SET_INCLUDE_PARKING",
  SET_DISCOUNT_TYPE: "SET_DISCOUNT_TYPE",
  SET_ERRORS: "SET_ERRORS",
  SET_ANNOUNCEMENT: "SET_ANNOUNCEMENT",
  SET_IS_CALCULATING: "SET_IS_CALCULATING", // New action for calculation state
  UPDATE_RECOMMENDATION: "UPDATE_RECOMMENDATION",
  REQUEST_RECOMMENDATION_UPDATE: "REQUEST_RECOMMENDATION_UPDATE",
  RESET_CALCULATOR: "RESET_CALCULATOR",
};

/**
 * Reducer function to handle all state updates
 */
function appReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_STEP: {
      // When moving to step 3, set the flag to trigger recommendation calculation
      const needsUpdate = action.payload === 3 && state.currentStep !== 3;
      return {
        ...state,
        currentStep: action.payload,
        needsRecommendationUpdate: needsUpdate
          ? true
          : state.needsRecommendationUpdate,
        // Start calculating when moving to recommendation step
        isCalculating: needsUpdate ? true : state.isCalculating,
      };
    }

    case ACTION_TYPES.SET_ADULT_COUNT: {
      const newCount = capValue(
        action.payload,
        1,
        PricingConfig.Constraints.MAX_ADULTS
      );
      return {
        ...state,
        adultCount: newCount,
        needsRecommendationUpdate: state.currentStep === 3,
      };
    }

    case ACTION_TYPES.SET_CHILDREN_COUNT: {
      const newCount = capValue(
        action.payload,
        0,
        PricingConfig.Constraints.MAX_CHILDREN
      );
      const newChildAges = Array(newCount)
        .fill(null)
        .map((_, index) => state.childAges[index] || 5);
      const newErrors = Array(newCount).fill("");
      return {
        ...state,
        childrenCount: newCount,
        childAges: newChildAges,
        errors: { ...state.errors, childAges: newErrors },
        needsRecommendationUpdate: state.currentStep === 3,
      };
    }

    case ACTION_TYPES.SET_CHILD_AGE: {
      const { index, age } = action.payload;
      const cappedAge = capValue(
        age,
        0,
        PricingConfig.Constraints.MAX_AGE_FOR_CHILD
      );
      const newChildAges = [...state.childAges];
      newChildAges[index] = cappedAge;
      const newErrors = [...state.errors.childAges];
      newErrors[index] = "";
      return {
        ...state,
        childAges: newChildAges,
        errors: { ...state.errors, childAges: newErrors },
        needsRecommendationUpdate: state.currentStep === 3,
      };
    }

    case ACTION_TYPES.UPDATE_CHILD_AGES_ARRAY: {
      return {
        ...state,
        childAges: action.payload,
        needsRecommendationUpdate: state.currentStep === 3,
      };
    }

    case ACTION_TYPES.SET_SCIENCE_VISITS: {
      const newVisits = capValue(
        action.payload,
        0,
        PricingConfig.Constraints.MAX_VISITS_PER_LOCATION
      );
      return {
        ...state,
        scienceVisits: newVisits,
        needsRecommendationUpdate: state.currentStep === 3,
      };
    }

    case ACTION_TYPES.SET_DPKH_VISITS: {
      const newVisits = capValue(
        action.payload,
        0,
        PricingConfig.Constraints.MAX_VISITS_PER_LOCATION
      );
      return {
        ...state,
        dpkhVisits: newVisits,
        needsRecommendationUpdate: state.currentStep === 3,
      };
    }

    case ACTION_TYPES.SET_DPKR_VISITS: {
      const newVisits = capValue(
        action.payload,
        0,
        PricingConfig.Constraints.MAX_VISITS_PER_LOCATION
      );
      return {
        ...state,
        dpkrVisits: newVisits,
        needsRecommendationUpdate: state.currentStep === 3,
      };
    }

    case ACTION_TYPES.SET_RICHMOND_RESIDENT: {
      return {
        ...state,
        isRichmondResident: action.payload,
        needsRecommendationUpdate: state.currentStep === 3,
      };
    }

    case ACTION_TYPES.SET_NEEDS_FLEXIBILITY: {
      return {
        ...state,
        needsFlexibility: action.payload,
        needsRecommendationUpdate: state.currentStep === 3,
      };
    }

    case ACTION_TYPES.SET_WELCOME_ELIGIBLE: {
      return {
        ...state,
        isWelcomeEligible: action.payload,
        needsRecommendationUpdate: state.currentStep === 3,
      };
    }

    case ACTION_TYPES.SET_INCLUDE_PARKING: {
      return {
        ...state,
        includeParking: action.payload,
        needsRecommendationUpdate: state.currentStep === 3,
      };
    }

    case ACTION_TYPES.SET_DISCOUNT_TYPE: {
      return {
        ...state,
        discountType: action.payload,
        needsRecommendationUpdate: state.currentStep === 3,
      };
    }

    case ACTION_TYPES.SET_ERRORS: {
      return {
        ...state,
        errors: action.payload,
      };
    }

    case ACTION_TYPES.SET_ANNOUNCEMENT: {
      return {
        ...state,
        announcement: action.payload,
      };
    }

    case ACTION_TYPES.SET_IS_CALCULATING: {
      return {
        ...state,
        isCalculating: action.payload,
      };
    }

    case ACTION_TYPES.UPDATE_RECOMMENDATION: {
      return {
        ...state,
        membershipRecommendation: action.payload.recommendation,
        primaryLocationIcon: action.payload.primaryLocationIcon,
        visitDistributionData: action.payload.visitDistributionData,
        needsRecommendationUpdate: false,
        isCalculating: false,
      };
    }

    case ACTION_TYPES.REQUEST_RECOMMENDATION_UPDATE: {
      return {
        ...state,
        needsRecommendationUpdate: true,
      };
    }

    case ACTION_TYPES.RESET_CALCULATOR: {
      return initialState;
    }

    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Create a ref to track mounted state
  const isMounted = useRef(true);

  // Effect to clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // REAL FIX: Only depend on the trigger flag, read current values inside effect
  useEffect(() => {
    if (state.needsRecommendationUpdate && state.currentStep === 3) {
      console.log("🟡 useEffect triggered! Starting recommendation calculation...");
      // Set calculating state
      dispatch({ type: ACTION_TYPES.SET_IS_CALCULATING, payload: true });

      // Use a small delay to ensure UI updates
      const timeoutId = setTimeout(() => {
        console.log("🟡 setTimeout started, about to calculate...");
        try {
          // Read current state values at calculation time
          console.log("🟡 Starting calculation with current data:", {
            adultCount: state.adultCount, 
            childrenCount: state.childrenCount,
            scienceVisits: state.scienceVisits, 
            dpkhVisits: state.dpkhVisits, 
            dpkrVisits: state.dpkrVisits
          });
          
          const recommendation = MembershipPriceCalculator.calculateMembershipCosts({
            adultCount: state.adultCount,
            childrenCount: state.childrenCount,
            childAges: state.childAges,
            scienceVisits: state.scienceVisits,
            dpkhVisits: state.dpkhVisits,
            dpkrVisits: state.dpkrVisits,
            isRichmondResident: state.isRichmondResident,
            needsFlexibility: state.needsFlexibility,
            isWelcomeEligible: state.isWelcomeEligible,
            includeParking: state.includeParking,
            discountType: state.discountType,
          });

          console.log("🟢 Calculation completed! Result:", recommendation);
          
          // Calculate primary location icon
          const primaryLocationIcon =
            AdmissionCostCalculator.determinePrimaryLocation(
              state.scienceVisits,
              state.dpkhVisits,
              state.dpkrVisits
            );

          // Calculate visit distribution data
          const visitDistributionData = [];
          if (state.scienceVisits > 0) {
            visitDistributionData.push({
              name: "Science",
              value: state.scienceVisits,
              color: "#00369e",
            });
          }
          if (state.dpkhVisits > 0) {
            visitDistributionData.push({
              name: "Kids-Huntersville",
              value: state.dpkhVisits,
              color: "#f5821f",
            });
          }
          if (state.dpkrVisits > 0) {
            visitDistributionData.push({
              name: "Kids-Rockingham",
              value: state.dpkrVisits,
              color: "#8dc63f",
            });
          }

          // Only update state if component is still mounted
          if (isMounted.current) {
            dispatch({
              type: ACTION_TYPES.UPDATE_RECOMMENDATION,
              payload: {
                recommendation,
                primaryLocationIcon,
                visitDistributionData,
              },
            });
          }
        } catch (error) {
          console.error("🔴 CALCULATION ERROR:", error);
          // Handle error appropriately
          if (isMounted.current) {
            dispatch({
              type: ACTION_TYPES.SET_IS_CALCULATING,
              payload: false,
            });
            dispatch({
              type: ACTION_TYPES.SET_ANNOUNCEMENT,
              payload: "An error occurred while calculating your recommendation. Please check your inputs and try again.",
            });
          }
        }
      }, 100); // Small delay to ensure UI responsiveness

      // Cleanup timeout on unmount or when effect re-runs
      return () => clearTimeout(timeoutId);
    }
  }, [
    // SIMPLIFIED: Only depend on the flag that triggers calculation
    // This prevents infinite loops from array references and other state changes
    state.needsRecommendationUpdate, 
    state.currentStep
  ]);

  // Handler functions
  const handleNextStep = useCallback(() => {
    const nextStep = Math.min(state.currentStep + 1, 3);
    dispatch({ type: ACTION_TYPES.SET_STEP, payload: nextStep });
  }, [state.currentStep]);

  const handlePrevStep = useCallback(() => {
    const prevStep = Math.max(state.currentStep - 1, 1);
    dispatch({ type: ACTION_TYPES.SET_STEP, payload: prevStep });
  }, [state.currentStep]);

  const handleAdultCountChange = useCallback((value) => {
    dispatch({ type: ACTION_TYPES.SET_ADULT_COUNT, payload: value });
  }, []);

  const handleChildrenCountChange = useCallback((value) => {
    dispatch({ type: ACTION_TYPES.SET_CHILDREN_COUNT, payload: value });
  }, []);

  const handleChildAgeChange = useCallback((index, value) => {
    dispatch({ type: ACTION_TYPES.SET_CHILD_AGE, payload: { index, age: value } });
  }, []);

  const handleScienceVisitsChange = useCallback((value) => {
    dispatch({ type: ACTION_TYPES.SET_SCIENCE_VISITS, payload: value });
  }, []);

  const handleDpkhVisitsChange = useCallback((value) => {
    dispatch({ type: ACTION_TYPES.SET_DPKH_VISITS, payload: value });
  }, []);

  const handleDpkrVisitsChange = useCallback((value) => {
    dispatch({ type: ACTION_TYPES.SET_DPKR_VISITS, payload: value });
  }, []);

  const handleRichmondResidentChange = useCallback((value) => {
    dispatch({ type: ACTION_TYPES.SET_RICHMOND_RESIDENT, payload: value });
  }, []);

  const handleNeedsFlexibilityChange = useCallback((value) => {
    dispatch({ type: ACTION_TYPES.SET_NEEDS_FLEXIBILITY, payload: value });
  }, []);

  const handleWelcomeEligibleChange = useCallback((value) => {
    dispatch({ type: ACTION_TYPES.SET_WELCOME_ELIGIBLE, payload: value });
  }, []);

  const handleIncludeParkingChange = useCallback((value) => {
    dispatch({ type: ACTION_TYPES.SET_INCLUDE_PARKING, payload: value });
  }, []);

  const handleDiscountTypeChange = useCallback((value) => {
    dispatch({ type: ACTION_TYPES.SET_DISCOUNT_TYPE, payload: value });
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: ACTION_TYPES.RESET_CALCULATOR });
  }, []);

  return (
    <ErrorBoundary
      componentName="MembershipCalculatorApp"
      onError={(error) =>
        console.error("Error in MembershipCalculatorApp:", error)
      }
      showDetails={false}
    >
      <div
        className="App"
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        {/* Show Welcome notification if eligible */}
        {state.isWelcomeEligible && (
          <WelcomeNotification
            welcomeOption={state.membershipRecommendation?.welcomeProgramOption}
            formatCurrency={formatCurrency}
          />
        )}

        {/* Main membership tools component */}
        <MembershipTools
          currentStep={state.currentStep}
          adultCount={state.adultCount}
          childrenCount={state.childrenCount}
          childAges={state.childAges}
          scienceVisits={state.scienceVisits}
          dpkhVisits={state.dpkhVisits}
          dpkrVisits={state.dpkrVisits}
          isRichmondResident={state.isRichmondResident}
          needsFlexibility={state.needsFlexibility}
          isWelcomeEligible={state.isWelcomeEligible}
          includeParking={state.includeParking}
          discountType={state.discountType}
          errors={state.errors}
          announcement={state.announcement}
          isCalculating={state.isCalculating}
          membershipRecommendation={state.membershipRecommendation}
          primaryLocationIcon={state.primaryLocationIcon}
          visitDistributionData={state.visitDistributionData}
          onNextStep={handleNextStep}
          onPrevStep={handlePrevStep}
          onAdultCountChange={handleAdultCountChange}
          onChildrenCountChange={handleChildrenCountChange}
          onChildAgeChange={handleChildAgeChange}
          onScienceVisitsChange={handleScienceVisitsChange}
          onDpkhVisitsChange={handleDpkhVisitsChange}
          onDpkrVisitsChange={handleDpkrVisitsChange}
          onRichmondResidentChange={handleRichmondResidentChange}
          onFlexibilityChange={handleNeedsFlexibilityChange}
          onWelcomeEligibleChange={handleWelcomeEligibleChange}
          onIncludeParkingChange={handleIncludeParkingChange}
          onDiscountTypeChange={handleDiscountTypeChange}
          onReset={handleReset}
          formatCurrency={formatCurrency}
        />

        {/* Bottom situation breakdown */}
        {state.membershipRecommendation && (
          <SituationBreakdown
            adultCount={state.adultCount}
            childrenCount={state.childrenCount}
            childAges={state.childAges}
            scienceVisits={state.scienceVisits}
            dpkhVisits={state.dpkhVisits}
            dpkrVisits={state.dpkrVisits}
            isRichmondResident={state.isRichmondResident}
            membershipRecommendation={state.membershipRecommendation}
            formatCurrency={formatCurrency}
            primaryLocationIcon={state.primaryLocationIcon}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;

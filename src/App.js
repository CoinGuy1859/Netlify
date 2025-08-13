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

    case ACTION_TYPES.SET_ADULT_COUNT:
      return {
        ...state,
        adultCount: capValue(
          action.payload,
          1,
          PricingConfig.Constraints.MAX_ADULTS
        ),
      };

    case ACTION_TYPES.SET_CHILDREN_COUNT:
      return {
        ...state,
        childrenCount: capValue(
          action.payload,
          0,
          PricingConfig.Constraints.MAX_CHILDREN
        ),
      };

    case ACTION_TYPES.SET_CHILD_AGE: {
      const newChildAges = [...state.childAges];
      newChildAges[action.payload.index] = action.payload.age;
      return { ...state, childAges: newChildAges };
    }

    case ACTION_TYPES.UPDATE_CHILD_AGES_ARRAY:
      return { ...state, childAges: action.payload };

    case ACTION_TYPES.SET_SCIENCE_VISITS:
      return {
        ...state,
        scienceVisits: capValue(
          action.payload,
          0,
          PricingConfig.Constraints.MAX_VISITS_PER_LOCATION
        ),
      };

    case ACTION_TYPES.SET_DPKH_VISITS:
      return {
        ...state,
        dpkhVisits: capValue(
          action.payload,
          0,
          PricingConfig.Constraints.MAX_VISITS_PER_LOCATION
        ),
      };

    case ACTION_TYPES.SET_DPKR_VISITS:
      return {
        ...state,
        dpkrVisits: capValue(
          action.payload,
          0,
          PricingConfig.Constraints.MAX_VISITS_PER_LOCATION
        ),
      };

    case ACTION_TYPES.SET_RICHMOND_RESIDENT:
      return { ...state, isRichmondResident: Boolean(action.payload) };

    case ACTION_TYPES.SET_NEEDS_FLEXIBILITY:
      return { ...state, needsFlexibility: Boolean(action.payload) };

    case ACTION_TYPES.SET_WELCOME_ELIGIBLE:
      return { ...state, isWelcomeEligible: Boolean(action.payload) };

    case ACTION_TYPES.SET_INCLUDE_PARKING:
      return { ...state, includeParking: Boolean(action.payload) };

    case ACTION_TYPES.SET_ERRORS:
      return { ...state, errors: action.payload };

    case ACTION_TYPES.SET_ANNOUNCEMENT:
      return { ...state, announcement: action.payload };

    case ACTION_TYPES.SET_IS_CALCULATING:
      return { ...state, isCalculating: action.payload };

    case ACTION_TYPES.UPDATE_RECOMMENDATION:
      return {
        ...state,
        membershipRecommendation: action.payload.recommendation,
        primaryLocationIcon: action.payload.primaryLocationIcon,
        visitDistributionData: action.payload.visitDistributionData,
        needsRecommendationUpdate: false,
        isCalculating: false, // Stop calculating when recommendation is updated
      };

    case ACTION_TYPES.REQUEST_RECOMMENDATION_UPDATE:
      return {
        ...state,
        needsRecommendationUpdate: true,
        isCalculating: true, // Start calculating when update is requested
      };

    case ACTION_TYPES.RESET_CALCULATOR:
      return { ...initialState };

    default:
      return state;
  }
}

/**
 * Main Application Component
 */
const DiscoveryPlaceMembershipCalculator = () => {
  // Use reducer for state management
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Track if initial render has completed
  const initialRenderRef = useRef(true);

  const {
    currentStep,
    adultCount,
    childrenCount,
    childAges,
    scienceVisits,
    dpkhVisits,
    dpkrVisits,
    isRichmondResident,
    needsFlexibility,
    isWelcomeEligible,
    includeParking,
    errors,
    announcement,
    membershipRecommendation,
    primaryLocationIcon,
    visitDistributionData,
    needsRecommendationUpdate,
    isCalculating, // Extract the calculating state
  } = state;

  // Helper function to create action dispatchers
  const createActionDispatcher = (type) => (payload) => {
    dispatch({ type, payload });
  };

  // Create action dispatchers for common actions
  const setStep = createActionDispatcher(ACTION_TYPES.SET_STEP);
  const setAdultCount = createActionDispatcher(ACTION_TYPES.SET_ADULT_COUNT);
  const setChildrenCount = createActionDispatcher(
    ACTION_TYPES.SET_CHILDREN_COUNT
  );
  const setErrors = createActionDispatcher(ACTION_TYPES.SET_ERRORS);
  const setAnnouncement = createActionDispatcher(ACTION_TYPES.SET_ANNOUNCEMENT);
  const setIsCalculating = createActionDispatcher(
    ACTION_TYPES.SET_IS_CALCULATING
  );
  const resetCalculator = createActionDispatcher(ACTION_TYPES.RESET_CALCULATOR);

  /**
   * Handle initial render effects
   */
  useEffect(() => {
    // Skip effects on initial render
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
  }, []);

  /**
   * Update child ages array when child count changes
   */
  useEffect(() => {
    // Skip initial render
    if (initialRenderRef.current) {
      return;
    }

    if (childrenCount > childAges.length) {
      // Add new children with default age 5
      const newChildAges = [...childAges];
      for (let i = childAges.length; i < childrenCount; i++) {
        newChildAges.push(5);
      }
      // Execute in the next tick to avoid batched updates
      setTimeout(() => {
        dispatch({
          type: ACTION_TYPES.UPDATE_CHILD_AGES_ARRAY,
          payload: newChildAges,
        });
      }, 0);
    } else if (childrenCount < childAges.length) {
      // Remove extra children
      setTimeout(() => {
        dispatch({
          type: ACTION_TYPES.UPDATE_CHILD_AGES_ARRAY,
          payload: childAges.slice(0, childrenCount),
        });
      }, 0);
    }
  }, [childrenCount, childAges]);

  /**
   * Update validation errors array size when child count changes
   */
  useEffect(() => {
    // Skip initial render
    if (initialRenderRef.current) {
      return;
    }

    // Only update errors if lengths don't match
    if (errors.childAges.length !== childrenCount) {
      setTimeout(() => {
        setErrors({
          ...errors,
          childAges: Array(childrenCount).fill(""),
        });
      }, 0);
    }
  }, [childrenCount, errors]);

  /**
   * Calculate membership recommendation when the flag is set
   */
  useEffect(() => {
    // Skip if not on step 3 or no update needed
    if (currentStep !== 3 || !needsRecommendationUpdate) {
      return;
    }

    // Set loading state at the start of calculation
    setIsCalculating(true);

    // Add an artificial delay to make the loading state visible (can be removed in production)
    setTimeout(() => {
      try {
        // Calculate recommendation
        const newRecommendation =
          MembershipPriceCalculator.calculateMembershipCosts({
            adultCount,
            childrenCount,
            childAges,
            scienceVisits,
            dpkhVisits,
            dpkrVisits,
            isRichmondResident,
            needsFlexibility,
            isWelcomeEligible,
            includeParking,
          });

        // Determine primary location icon based on visit frequency
        const primaryLocation =
          AdmissionCostCalculator.determinePrimaryLocation(
            scienceVisits,
            dpkhVisits,
            dpkrVisits
          );
        let newPrimaryLocationIcon = "science";
        switch (primaryLocation) {
          case "Science":
            newPrimaryLocationIcon = "science";
            break;
          case "DPKH":
            newPrimaryLocationIcon = "kids-huntersville";
            break;
          case "DPKR":
            newPrimaryLocationIcon = "kids-rockingham";
            break;
        }

        // Generate visit distribution data for charts
        const totalVisits = scienceVisits + dpkhVisits + dpkrVisits;
        const newVisitDistributionData =
          totalVisits === 0
            ? []
            : [
                {
                  name: "Discovery Place Science",
                  shortName: "Science",
                  value: scienceVisits,
                  fill: "#3182CE", // Blue
                },
                {
                  name: "Discovery Place Kids-Huntersville",
                  shortName: "Kids-H",
                  value: dpkhVisits,
                  fill: "#9F7AEA", // Purple
                },
                {
                  name: "Discovery Place Kids-Rockingham",
                  shortName: "Kids-R",
                  value: dpkrVisits,
                  fill: "#ED8936", // Orange
                },
              ].filter((item) => item.value > 0);

        // Update the recommendation in the next tick to avoid batched updates
        setTimeout(() => {
          dispatch({
            type: ACTION_TYPES.UPDATE_RECOMMENDATION,
            payload: {
              recommendation: newRecommendation,
              primaryLocationIcon: newPrimaryLocationIcon,
              visitDistributionData: newVisitDistributionData,
            },
          });

          // Announce completion for screen readers
          announceToScreenReader(
            "Your membership recommendation is ready.",
            "polite"
          );
        }, 0);
      } catch (error) {
        console.error("Error calculating recommendation:", error);
        // Set an error state or show a notification to the user
        setAnnouncement(
          "An error occurred while calculating your recommendation. Please try again."
        );
        // End calculation state
        setIsCalculating(false);
      }
    }, 800); // Small delay to make loading state visible (can be adjusted or removed)
  }, [
    needsRecommendationUpdate,
    currentStep,
    adultCount,
    childrenCount,
    childAges,
    scienceVisits,
    dpkhVisits,
    dpkrVisits,
    isRichmondResident,
    needsFlexibility,
    isWelcomeEligible,
    includeParking,
  ]);

  /**
   * Navigation functions
   */
  const nextStep = useCallback(() => {
    if (currentStep === 1) {
      // Validate family composition
      if (!validateChildAges()) {
        announceToScreenReader(
          "Please fix the errors before continuing.",
          "assertive"
        );
        return;
      }
    } else if (currentStep === 2) {
      // Validate visits
      if (!validateVisits()) {
        return;
      }
    }

    // Proceed to next step
    const newStep = currentStep + 1;
    setStep(newStep);

    // Announce step change for screen readers
    let stepName = "";
    if (newStep === 2) stepName = "Your Visits";
    if (newStep === 3) stepName = "Your Recommendation";

    announceToScreenReader(
      `Moving to step ${newStep} of 3: ${stepName}.`,
      "assertive"
    );
  }, [currentStep]);

  const prevStep = useCallback(() => {
    const newStep = currentStep - 1;
    setStep(newStep);

    // Announce step change for screen readers
    let stepName = "";
    if (newStep === 1) stepName = "Your Family";
    if (newStep === 2) stepName = "Your Visits";

    announceToScreenReader(
      `Moving back to step ${newStep} of 3: ${stepName}.`,
      "assertive"
    );
  }, [currentStep]);

  /**
   * Form validation functions
   */
  const validateChildAges = useCallback(() => {
    const newErrors = {
      childAges: Array(childrenCount).fill(""),
    };
    let isValid = true;

    // Validate each child's age
    childAges.slice(0, childrenCount).forEach((age, index) => {
      if (age === "" || age < 0 || age > 17 || isNaN(age)) {
        newErrors.childAges[
          index
        ] = `Please enter a valid age between 0 and 17`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [childAges, childrenCount]);

  const validateVisits = useCallback(() => {
    const totalVisits = scienceVisits + dpkhVisits + dpkrVisits;

    if (totalVisits === 0) {
      announceToScreenReader(
        "Please select at least one visit to generate a recommendation.",
        "assertive"
      );
      return false;
    }
    return true;
  }, [scienceVisits, dpkhVisits, dpkrVisits]);

  /**
   * Accessibility announcement function
   */
  const announceToScreenReader = useCallback(
    (message, importance = "polite") => {
      // Set the announcement message in state
      setAnnouncement(message);

      // For critical announcements, try to use the assertive region
      if (importance === "assertive") {
        try {
          const assertiveRegion = document.getElementById(
            "assertive-announcements"
          );
          if (assertiveRegion) {
            assertiveRegion.textContent = message;
          }
        } catch (error) {
          console.error("Error updating assertive announcement region:", error);
        }
      }
    },
    []
  );

  /**
   * Event handler for child age change
   */
  const handleChildAgeChange = useCallback(
    (index, age) => {
      // Handle empty string case by not validating immediately
      if (age === "") {
        dispatch({
          type: ACTION_TYPES.SET_CHILD_AGE,
          payload: { index, age: "" },
        });
        return;
      }

      // Parse to number and validate
      const numAge = Number(age);
      dispatch({
        type: ACTION_TYPES.SET_CHILD_AGE,
        payload: { index, age: numAge },
      });

      // Validate on change
      const newErrors = { ...errors };
      if (isNaN(numAge) || numAge < 0 || numAge > 17) {
        newErrors.childAges[
          index
        ] = `Please enter a valid age between 0 and 17`;
      } else {
        newErrors.childAges[index] = "";
      }
      setErrors(newErrors);
    },
    [errors]
  );

  // Handle various form changes with action creators
  const handleScienceVisitsChange = createActionDispatcher(
    ACTION_TYPES.SET_SCIENCE_VISITS
  );
  const handleDpkhVisitsChange = createActionDispatcher(
    ACTION_TYPES.SET_DPKH_VISITS
  );
  const handleDpkrVisitsChange = createActionDispatcher(
    ACTION_TYPES.SET_DPKR_VISITS
  );
  const handleRichmondResidentChange = createActionDispatcher(
    ACTION_TYPES.SET_RICHMOND_RESIDENT
  );
  const handleFlexibilityChange = createActionDispatcher(
    ACTION_TYPES.SET_NEEDS_FLEXIBILITY
  );
  const handleWelcomeEligibleChange = createActionDispatcher(
    ACTION_TYPES.SET_WELCOME_ELIGIBLE
  );
  const handleIncludeParkingChange = createActionDispatcher(
    ACTION_TYPES.SET_INCLUDE_PARKING
  );

  /**
   * Reset calculator function
   */
  const handleResetCalculator = useCallback(() => {
    resetCalculator();

    // Reset the initialRender ref so the next render is treated as initial
    initialRenderRef.current = true;

    // Announce for screen readers
    announceToScreenReader(
      "Calculator has been reset to defaults.",
      "assertive"
    );
  }, [announceToScreenReader]);

  // Handle error logging
  const handleError = useCallback(
    (error, errorInfo) => {
      // Log the error to console
      console.error("Error caught by ErrorBoundary:", error, errorInfo);

      // Here you would typically send to an error logging service
      // Example: errorLoggingService.logError(error, errorInfo);

      // Display a user-friendly message
      announceToScreenReader(
        "Sorry, something went wrong with the calculator. We've been notified and will fix it soon.",
        "assertive"
      );
    },
    [announceToScreenReader]
  );

  return (
    <div className="calculator-container bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Skip navigation for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>
      <div
        id="assertive-announcements"
        className="sr-only"
        aria-live="assertive"
      ></div>

      <main id="main-content">
        {/* Wrap with ErrorBoundary for better error handling */}
        <ErrorBoundary
          componentName="Membership Calculator"
          showDetails={false}
          onError={handleError}
        >
          {/* Loading indicator for calculation */}
          {isCalculating && currentStep === 3 && (
            <div
              className="calculation-loading"
              style={{
                padding: "20px",
                margin: "20px 0",
                backgroundColor: "#ebf8ff",
                borderRadius: "8px",
                border: "1px solid #bee3f8",
                textAlign: "center",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
              aria-live="polite"
            >
              <div
                className="loading-spinner"
                style={{
                  display: "inline-block",
                  width: "30px",
                  height: "30px",
                  border: "3px solid rgba(66, 153, 225, 0.3)",
                  borderRadius: "50%",
                  borderTop: "3px solid #4299e1",
                  animation: "spin 1s linear infinite",
                  marginRight: "10px",
                  verticalAlign: "middle",
                }}
                role="progressbar"
                aria-label="Loading recommendation"
              />
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#2b6cb0",
                  display: "inline-block",
                  verticalAlign: "middle",
                }}
              >
                Calculating your personalized membership recommendation...
              </span>
              <style>
                {`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}
              </style>
            </div>
          )}

          {/* Use MembershipTools component instead of directly rendering calculator components */}
          <MembershipTools
            currentStep={currentStep}
            adultCount={adultCount}
            childrenCount={childrenCount}
            childAges={childAges}
            scienceVisits={scienceVisits}
            dpkhVisits={dpkhVisits}
            dpkrVisits={dpkrVisits}
            isRichmondResident={isRichmondResident}
            needsFlexibility={needsFlexibility}
            isWelcomeEligible={isWelcomeEligible}
            includeParking={includeParking}
            errors={errors}
            membershipRecommendation={membershipRecommendation}
            isCalculating={isCalculating} // Pass down calculating state
            formatCurrency={formatCurrency}
            onNextStep={nextStep}
            onPrevStep={prevStep}
            onAdultCountChange={setAdultCount}
            onChildrenCountChange={setChildrenCount}
            onChildAgeChange={handleChildAgeChange}
            onRichmondResidentChange={handleRichmondResidentChange}
            onFlexibilityChange={handleFlexibilityChange}
            onWelcomeEligibleChange={handleWelcomeEligibleChange}
            onScienceVisitsChange={handleScienceVisitsChange}
            onDpkhVisitsChange={handleDpkhVisitsChange}
            onDpkrVisitsChange={handleDpkrVisitsChange}
            onIncludeParkingChange={handleIncludeParkingChange}
          />
        </ErrorBoundary>

        {/* This section appears below both calculators */}
        {currentStep === 3 && !isCalculating && (
          <div>
            {/* Welcome Program Notification (only show if relevant) */}
            {isWelcomeEligible &&
              membershipRecommendation?.bestMembershipType !== "Welcome" &&
              membershipRecommendation?.welcomeProgramOption && (
                <ErrorBoundary componentName="Welcome Notification">
                  <WelcomeNotification
                    welcomeOption={
                      membershipRecommendation.welcomeProgramOption
                    }
                    formatCurrency={formatCurrency}
                  />
                </ErrorBoundary>
              )}

            {/* Situation Breakdown */}
            <ErrorBoundary componentName="Situation Breakdown">
              <SituationBreakdown primaryLocationIcon={primaryLocationIcon} />
            </ErrorBoundary>

            {/* Navigation Buttons */}
            <div className="button-group">
              <button
                onClick={prevStep}
                className="secondary-button"
                aria-label="Go back to adjust your visit plans"
              >
                Adjust My Visit Plans
              </button>
              <button
                onClick={handleResetCalculator}
                className="secondary-button"
                aria-label="Start over from the beginning"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DiscoveryPlaceMembershipCalculator;

// src/components/MembershipRecommendation.js
import React, { useState, useMemo, useCallback } from "react";
import { PricingConfig } from "../pricing/pricing-module";
import Logos from "../components/Logos";
import ErrorBoundary from "../components/ErrorBoundary";

/**
 * MembershipRecommendation component
 * Displays the recommended membership option and related details
 * Enhanced with error boundaries and comprehensive error handling
 */
const MembershipRecommendation = React.memo(
  ({
    recommendation,
    formatCurrency,
    scienceVisits = 0,
    dpkhVisits = 0,
    dpkrVisits = 0,
    adultCount = 0,
    childAges = [],
    isRichmondResident = false,
    includeParking = true,
    isCalculating = false,
  }) => {
    // Local state for showing/hiding additional sections
    const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);
    const [showMembershipComparison, setShowMembershipComparison] = useState(false);

    // DEBUG: Log what we're receiving
    console.log("=== MembershipRecommendation DEBUG ===");
    console.log("recommendation:", recommendation);
    console.log("isCalculating:", isCalculating);
    console.log("visits:", { scienceVisits, dpkhVisits, dpkrVisits });
    console.log("family:", { adultCount, childAges });

    // Show loading state
    if (isCalculating) {
      console.log("SHOWING LOADING STATE");
      return <LoadingPlaceholder />;
    }

    // Safety check for recommendation
    if (!recommendation) {
      console.log("NO RECOMMENDATION - SHOWING ERROR MESSAGE");
      return (
        <div style={{ 
          padding: "20px", 
          textAlign: "center",
          backgroundColor: "#fff5f5",
          border: "1px solid #fed7d7",
          borderRadius: "8px",
          margin: "20px 0"
        }}>
          <p style={{ color: "#e53e3e", fontSize: "16px", margin: "0" }}>
            Unable to generate membership recommendation. Please check your inputs and try again.
          </p>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "10px" }}>
            Debug: recommendation is {recommendation === null ? 'null' : 'undefined'}
          </p>
        </div>
      );
    }

    console.log("RENDERING RECOMMENDATION CONTENT");

    // Helper function to get total price - memoized to avoid recalculation on every render
    const getTotalPrice = useCallback(() => {
      if (!recommendation) return 0;

      try {
        const membershipCost = recommendation?.baseMembershipDiscount || 0;
        const additionalCost =
          recommendation?.additionalCosts &&
          recommendation.additionalCosts.length > 0
            ? recommendation.additionalCosts.reduce((sum, item) => sum + (item.cost || 0), 0)
            : 0;
        return membershipCost + additionalCost;
      } catch (error) {
        console.error("Error calculating total price:", error);
        return 0;
      }
    }, [recommendation]);

    // Calculate total visits for display
    const totalVisits = useMemo(() => {
      return (scienceVisits || 0) + (dpkhVisits || 0) + (dpkrVisits || 0);
    }, [scienceVisits, dpkhVisits, dpkrVisits]);

    // Handle toggle functions with error boundaries
    const handleToggleAdvancedAnalysis = useCallback(() => {
      setShowAdvancedAnalysis(prev => !prev);
    }, []);

    const handleToggleMembershipComparison = useCallback(() => {
      setShowMembershipComparison(prev => !prev);
    }, []);

    // Show loading state
    if (isCalculating) {
      return <LoadingPlaceholder />;
    }

    return (
      <ErrorBoundary componentName="Membership Recommendation">
        <section
          className="membership-recommendation"
          role="main"
          aria-labelledby="recommendation-title"
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "20px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* Page Title */}
          <h1
            id="recommendation-title"
            style={{
              fontSize: "32px",
              fontWeight: "700",
              textAlign: "center",
              color: "#2d3748",
              marginBottom: "40px",
            }}
          >
            Your Personalized Recommendation
          </h1>

          {/* Promotion Banner if applicable */}
          {recommendation.welcomeProgramOption && (
            <PromotionBanner 
              welcomeOption={recommendation.welcomeProgramOption} 
              formatCurrency={formatCurrency} 
            />
          )}

          {/* Eligibility Information */}
          <EligibilityInfo recommendation={recommendation} />

          {/* Main Recommendation Card */}
          <RecommendationCard
            recommendation={recommendation}
            formatCurrency={formatCurrency}
            getTotalPrice={getTotalPrice}
            scienceVisits={scienceVisits}
            dpkhVisits={dpkhVisits}
            dpkrVisits={dpkrVisits}
            adultCount={adultCount}
            childAges={childAges}
            isRichmondResident={isRichmondResident}
            includeParking={includeParking}
          />

          {/* Cost Breakdown */}
          <CostBreakdownSection
            recommendation={recommendation}
            formatCurrency={formatCurrency}
            getTotalPrice={getTotalPrice}
            scienceVisits={scienceVisits}
            dpkhVisits={dpkhVisits}
            dpkrVisits={dpkrVisits}
            adultCount={adultCount}
            childAges={childAges}
            isRichmondResident={isRichmondResident}
            includeParking={includeParking}
          />

          {/* Detailed Admission Comparison */}
          <DetailedAdmissionComparison
            recommendation={recommendation}
            scienceVisits={scienceVisits}
            dpkhVisits={dpkhVisits}
            dpkrVisits={dpkrVisits}
            adultCount={adultCount}
            childAges={childAges}
            isRichmondResident={isRichmondResident}
            includeParking={includeParking}
            formatCurrency={formatCurrency}
          />

          {/* Toggle buttons for additional analysis */}
          <ToggleButtonsContainer
            showAdvancedAnalysis={showAdvancedAnalysis}
            showMembershipComparison={showMembershipComparison}
            onToggleAdvancedAnalysis={handleToggleAdvancedAnalysis}
            onToggleMembershipComparison={handleToggleMembershipComparison}
          />

          {/* Additional Analysis Sections */}
          {showAdvancedAnalysis && (
            <ErrorBoundary componentName="Advanced Analysis">
              <div>
                <VisitorVisualization
                  scienceVisits={scienceVisits}
                  dpkhVisits={dpkhVisits}
                  dpkrVisits={dpkrVisits}
                />
                <VisitPatternVisualization
                  scienceVisits={scienceVisits}
                  dpkhVisits={dpkhVisits}
                  dpkrVisits={dpkrVisits}
                  recommendation={recommendation}
                />
              </div>
            </ErrorBoundary>
          )}

          {showMembershipComparison && (
            <ErrorBoundary componentName="Membership Comparison">
              <MembershipComparator
                recommendation={recommendation}
                formatCurrency={formatCurrency}
                totalVisits={totalVisits}
              />
            </ErrorBoundary>
          )}

          {/* FAQ Section */}
          <div style={{ marginTop: "30px" }}>
            <MembershipFAQ recommendation={recommendation} />
          </div>
        </section>
      </ErrorBoundary>
    );
  }
);

// Loading Placeholder Component
const LoadingPlaceholder = React.memo(() => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px",
        backgroundColor: "#f7fafc",
        borderRadius: "8px",
        margin: "20px 0",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #e2e8f0",
            borderTop: "4px solid #4299e1",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p style={{ color: "#4a5568", fontSize: "16px", margin: "0" }}>
          Calculating your personalized recommendation...
        </p>
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
});

// Simple Fallback Components (these replace complex imports that might be missing)

const PromotionBanner = React.memo(({ welcomeOption, formatCurrency }) => {
  if (!welcomeOption) return null;
  
  return (
    <div style={{
      backgroundColor: "#f0fff4",
      border: "2px solid #38a169",
      borderRadius: "8px",
      padding: "16px",
      margin: "20px 0",
      textAlign: "center"
    }}>
      <h3 style={{ color: "#38a169", margin: "0 0 8px 0" }}>
        🎉 Welcome Program Eligible!
      </h3>
      <p style={{ margin: "0", color: "#2d3748" }}>
        First-time member discount: {formatCurrency(welcomeOption.savings)} off
      </p>
    </div>
  );
});

const EligibilityInfo = React.memo(({ recommendation }) => {
  if (!recommendation?.eligibilityInfo) return null;
  
  return (
    <div style={{
      backgroundColor: "#ebf8ff",
      border: "1px solid #bee3f8",
      borderRadius: "6px",
      padding: "12px",
      margin: "20px 0",
      fontSize: "14px",
      color: "#2b6cb0"
    }}>
      {recommendation.eligibilityInfo}
    </div>
  );
});

const RecommendationCard = React.memo(({ 
  recommendation, 
  formatCurrency, 
  getTotalPrice 
}) => {
  console.log("=== RecommendationCard DEBUG ===");
  console.log("recommendation.bestMembershipType:", recommendation?.bestMembershipType);
  console.log("recommendation.bestMembershipLabel:", recommendation?.bestMembershipLabel);
  console.log("recommendation.bestMembershipExplanation:", recommendation?.bestMembershipExplanation);
  console.log("getTotalPrice():", getTotalPrice());

  if (!recommendation) {
    console.log("RecommendationCard: NO RECOMMENDATION");
    return <div style={{ padding: "20px", backgroundColor: "#ffebee", color: "#c62828" }}>
      No recommendation data available
    </div>;
  }

  const membershipType = recommendation.bestMembershipType || "Science";
  const membershipLabel = recommendation.bestMembershipLabel || "Discovery Place Membership";
  const explanation = recommendation.bestMembershipExplanation || "Based on your visit patterns, this membership offers the best value.";
  const totalPrice = getTotalPrice();

  console.log("RecommendationCard: RENDERING with:", { membershipType, membershipLabel, totalPrice });

  return (
    <div style={{
      border: "2px solid #4299e1",
      borderRadius: "12px",
      overflow: "hidden",
      marginBottom: "30px",
      backgroundColor: "white",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: "#ebf8ff",
        padding: "24px",
        borderBottom: "1px solid #bee3f8",
        display: "flex",
        alignItems: "center"
      }}>
        <div style={{
          marginRight: "20px",
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "60px",
          minHeight: "60px"
        }}>
          {/* Simple logo fallback */}
          <div style={{
            width: "40px",
            height: "40px",
            backgroundColor: "#4299e1",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold"
          }}>
            DP
          </div>
        </div>
        <div>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#2d3748", marginBottom: "4px" }}>
            WE RECOMMEND
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#3182ce" }}>
            {membershipLabel}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px" }}>
        <p style={{ fontSize: "16px", lineHeight: "1.6", margin: "0 0 20px 0", color: "#4a5568" }}>
          {explanation}
        </p>

        <div style={{
          backgroundColor: "#f7fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
          padding: "16px"
        }}>
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#2d3748" }}>
            Total Annual Cost: {formatCurrency(totalPrice)}
          </div>
          {recommendation.totalSavings > 0 && (
            <div style={{ fontSize: "16px", color: "#38a169", marginTop: "4px" }}>
              You save {formatCurrency(recommendation.totalSavings)} per year!
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const CostBreakdownSection = React.memo(({ 
  recommendation, 
  formatCurrency, 
  getTotalPrice 
}) => {
  if (!recommendation.costBreakdown) return null;

  return (
    <div style={{
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      padding: "20px",
      margin: "20px 0"
    }}>
      <h3 style={{ fontSize: "20px", fontWeight: "600", margin: "0 0 16px 0" }}>
        Cost Breakdown
      </h3>
      {recommendation.costBreakdown.map((item, index) => (
        <div key={index} style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 0",
          borderBottom: index < recommendation.costBreakdown.length - 1 ? "1px solid #f7fafc" : "none"
        }}>
          <span>{item.description}</span>
          <span style={{ fontWeight: "600" }}>{formatCurrency(item.cost)}</span>
        </div>
      ))}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0 0 0",
        fontSize: "18px",
        fontWeight: "700",
        borderTop: "2px solid #e2e8f0",
        marginTop: "8px"
      }}>
        <span>Total</span>
        <span>{formatCurrency(getTotalPrice())}</span>
      </div>
    </div>
  );
});

const DetailedAdmissionComparison = React.memo(({ 
  recommendation, 
  formatCurrency 
}) => {
  if (!recommendation) return null;

  return (
    <div style={{
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      padding: "20px",
      margin: "20px 0"
    }}>
      <h3 style={{ fontSize: "20px", fontWeight: "600", margin: "0 0 16px 0" }}>
        Membership vs. Pay-Per-Visit
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div style={{
          backgroundColor: "#fff5f5",
          padding: "16px",
          borderRadius: "6px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
            Pay Per Visit
          </div>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#e53e3e" }}>
            {formatCurrency(recommendation.regularAdmissionCost || 0)}
          </div>
        </div>
        <div style={{
          backgroundColor: "#f0fff4",
          padding: "16px",
          borderRadius: "6px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
            With Membership
          </div>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#38a169" }}>
            {formatCurrency(recommendation.baseMembershipDiscount || 0)}
          </div>
        </div>
      </div>
      {recommendation.totalSavings > 0 && (
        <div style={{
          textAlign: "center",
          marginTop: "16px",
          fontSize: "18px",
          fontWeight: "600",
          color: "#38a169"
        }}>
          Save {formatCurrency(recommendation.totalSavings)} with membership!
        </div>
      )}
    </div>
  );
});

const ToggleButtonsContainer = React.memo(({ 
  showAdvancedAnalysis, 
  showMembershipComparison,
  onToggleAdvancedAnalysis,
  onToggleMembershipComparison 
}) => {
  return (
    <div style={{
      display: "flex",
      gap: "12px",
      justifyContent: "center",
      margin: "30px 0",
      flexWrap: "wrap"
    }}>
      <button
        onClick={onToggleAdvancedAnalysis}
        style={{
          backgroundColor: showAdvancedAnalysis ? "#3182ce" : "#f7fafc",
          color: showAdvancedAnalysis ? "white" : "#4a5568",
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
          padding: "10px 16px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500"
        }}
      >
        {showAdvancedAnalysis ? "Hide" : "Show"} Advanced Analysis
      </button>
      <button
        onClick={onToggleMembershipComparison}
        style={{
          backgroundColor: showMembershipComparison ? "#3182ce" : "#f7fafc",
          color: showMembershipComparison ? "white" : "#4a5568",
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
          padding: "10px 16px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500"
        }}
      >
        {showMembershipComparison ? "Hide" : "Show"} Membership Comparison
      </button>
    </div>
  );
});

// Simple fallback components for missing imports
const VisitorVisualization = React.memo(({ scienceVisits, dpkhVisits, dpkrVisits }) => {
  const totalVisits = scienceVisits + dpkhVisits + dpkrVisits;
  return (
    <div style={{ padding: "20px", backgroundColor: "#f7fafc", borderRadius: "8px", margin: "20px 0" }}>
      <h4>Visit Distribution</h4>
      <p>Science: {scienceVisits} visits</p>
      <p>Kids-Huntersville: {dpkhVisits} visits</p>
      <p>Kids-Rockingham: {dpkrVisits} visits</p>
      <p><strong>Total: {totalVisits} visits</strong></p>
    </div>
  );
});

const VisitPatternVisualization = React.memo(() => (
  <div style={{ padding: "20px", backgroundColor: "#f7fafc", borderRadius: "8px", margin: "20px 0" }}>
    <h4>Visit Pattern Analysis</h4>
    <p>Your visit pattern has been analyzed to provide the best membership recommendation.</p>
  </div>
));

const MembershipComparator = React.memo(({ recommendation, formatCurrency }) => (
  <div style={{ padding: "20px", backgroundColor: "#f7fafc", borderRadius: "8px", margin: "20px 0" }}>
    <h4>Membership Options Comparison</h4>
    <p>Recommended: {recommendation.bestMembershipLabel}</p>
    <p>Annual Cost: {formatCurrency(recommendation.baseMembershipDiscount || 0)}</p>
  </div>
));

const MembershipFAQ = React.memo(() => (
  <div style={{ padding: "20px", backgroundColor: "#f7fafc", borderRadius: "8px", margin: "20px 0" }}>
    <h4>Frequently Asked Questions</h4>
    <p><strong>Q: When does my membership begin?</strong></p>
    <p>A: Your membership begins on the date of purchase and is valid for 12 months.</p>
    <p><strong>Q: Can I upgrade my membership later?</strong></p>
    <p>A: Yes, you can upgrade at any time by paying the difference in membership fees.</p>
  </div>
));

// Add display name for debugging
MembershipRecommendation.displayName = 'MembershipRecommendation';

export default MembershipRecommendation;

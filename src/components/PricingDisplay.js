// components/PricingDisplay.js
import React from "react";
import { PricingConfig } from "../pricing/pricing-module";

/**
 * PricingDisplay component - Shows pricing information for the recommended membership
 * Redesigned to emphasize the upfront membership cost over annual projected expenses
 * All discount references removed as per requirements
 */
const PricingDisplay = ({ recommendation, formatCurrency, getTotalPrice }) => {
  // Check if recommendation is valid to prevent errors
  if (!recommendation) {
    console.error("PricingDisplay: No recommendation data provided");
    return null;
  }
  
  // Calculate total additional costs - use null check before accessing properties
  const totalAdditionalCosts = getTotalAdditionalCosts(recommendation);
  
  // Use the baseMembershipPrice value (without any discount)
  const baseMembershipPrice = recommendation?.baseMembershipPrice || 0;
  
  // Calculate tax (7.25%)
  const membershipTax = baseMembershipPrice * 0.0725;
  const totalUpfrontCost = baseMembershipPrice + membershipTax;
  
  return (
    <div className="recommendation-pricing">
      <div className="pricing-breakdown" style={{ textAlign: "center" }}>
        {/* Main Membership Cost (Day 1 Cost) - Prominently displayed */}
        <MainMembershipSection
          recommendation={recommendation}
          formatCurrency={formatCurrency}
          membershipTax={membershipTax}
          totalUpfrontCost={totalUpfrontCost}
          baseMembershipPrice={baseMembershipPrice}
        />

        {/* Divider */}
        <div style={{ 
          margin: "20px auto", 
          width: "70%", 
          borderBottom: "1px dashed #e2e8f0",
          opacity: 0.7
        }}></div>

        {/* Additional Costs Section (like parking) - Less prominently displayed */}
        <ProjectedCostsSection
          recommendation={recommendation}
          totalAdditionalCosts={totalAdditionalCosts}
          getTotalPrice={getTotalPrice}
          formatCurrency={formatCurrency}
        />

        {/* Enhanced Savings Display - More prominent */}
        <EnhancedSavingsSection
          recommendation={recommendation}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  );
};

/**
 * Helper function to check if recommendation has additional costs
 */
const hasAdditionalCosts = (recommendation) => {
  return (
    recommendation?.additionalCosts && recommendation.additionalCosts.length > 0
  );
};

/**
 * Helper function to check if recommendation has general admission costs
 */
const hasGeneralAdmissionCosts = (recommendation) => {
  return recommendation?.generalAdmissionCosts > 0;
};

/**
 * Helper function to calculate total additional costs
 */
const getTotalAdditionalCosts = (recommendation) => {
  if (!recommendation || !recommendation.additionalCosts) {
    return 0;
  }
  
  return hasAdditionalCosts(recommendation)
    ? recommendation.additionalCosts.reduce((sum, item) => sum + item.cost, 0)
    : 0;
};

/**
 * Main Membership Section Component - Prominently displays the upfront cost
 */
const MainMembershipSection = ({
  recommendation,
  formatCurrency,
  membershipTax,
  totalUpfrontCost,
  baseMembershipPrice
}) => {
  const membershipLabel = getMembershipLabel(recommendation);

  return (
    <div className="main-membership-section" style={{ marginBottom: "25px" }}>
      <div
        className="today-cost-label"
        style={{
          fontSize: "17px",
          fontWeight: "600",
          color: "#2d3748",
          marginBottom: "10px",
          backgroundColor: "#f7fafc",
          padding: "8px 16px",
          borderRadius: "8px",
          display: "inline-block",
        }}
      >
        Today's Membership Cost
      </div>
      
      {/* Primary Membership Cost */}
      <div className="upfront-cost-container" style={{ marginBottom: "5px" }}>
        <div className="membership-type" style={{ 
          fontSize: "18px",
          fontWeight: "500",
          color: "#4a5568",
          marginBottom: "8px"
        }}>
          {membershipLabel}
        </div>
        <div className="price-values">
          {/* Main Membership Price */}
          <div
            className="main-price"
            style={{
              fontSize: "34px",
              fontWeight: "700",
              color: "#2c5282", // Stronger blue color
              lineHeight: "1.2",
            }}
          >
            {formatCurrency(baseMembershipPrice || 0)}
          </div>
        </div>
      </div>
      
      {/* Tax display */}
      <div style={{
        fontSize: "15px", 
        color: "#718096",
        marginTop: "10px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px"
      }}>
        <div>
          <span style={{fontWeight: "500"}}>+ Tax (7.25%):</span> {formatCurrency(membershipTax)}
        </div>
        <div>•</div>
        <div>
          <span style={{fontWeight: "500"}}>Today's Total:</span> {formatCurrency(totalUpfrontCost)}
        </div>
      </div>
    </div>
  );
};

/**
 * Helper function to get membership label
 */
const getMembershipLabel = (recommendation) => {
  if (!recommendation) return "Membership";
  
  if (recommendation.bestMembershipType && recommendation.bestMembershipType.includes("Basic")) {
    return "Basic Membership";
  } else if (recommendation.bestMembershipType === "Welcome") {
    return "Welcome Program";
  } else if (recommendation.bestMembershipType === "PayAsYouGo") {
    return "Regular Admission";
  } else {
    return recommendation.bestMembershipLabel || "Membership";
  }
};

/**
 * Projected Costs Section - Shows annual costs in a less prominent way
 */
const ProjectedCostsSection = ({
  recommendation,
  totalAdditionalCosts,
  getTotalPrice,
  formatCurrency,
}) => {
  if (!recommendation) return null;
  
  return (
    <div
      className="projected-costs-section"
      style={{
        marginBottom: "25px",
        backgroundColor: "#f7fafc",
        padding: "18px",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        className="projected-costs-label"
        style={{
          fontSize: "16px",
          fontWeight: "500",
          color: "#4a5568",
          marginBottom: "16px",
        }}
      >
        Projected Annual Costs
      </div>

      {/* Additional costs breakdown */}
      {hasAdditionalCosts(recommendation) && (
        <div style={{ marginBottom: "16px" }}>
          <AdditionalCostsBreakdown
            additionalCosts={recommendation.additionalCosts}
            formatCurrency={formatCurrency}
          />
        </div>
      )}

      {/* General Admission Costs for other locations */}
      {hasGeneralAdmissionCosts(recommendation) && (
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "15px",
              marginBottom: "8px",
            }}
          >
            <span>Cross-location admission:</span>
            <span style={{ fontWeight: "500" }}>
              {formatCurrency(recommendation.generalAdmissionCosts || 0)}
            </span>
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#718096",
            }}
          >
            {recommendation.generalAdmissionNote ||
              "Discounted admission to other Discovery Place locations"}
          </div>
        </div>
      )}

      {/* Annual Total */}
      <div
        style={{
          borderTop: "1px solid #e2e8f0",
          paddingTop: "12px",
          marginTop: "8px",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        <span>Estimated Annual Total:</span>
        <span>{formatCurrency(getTotalPrice ? getTotalPrice() : 0)}</span>
      </div>
      <div style={{ fontSize: "13px", color: "#718096", textAlign: "right" }}>
        per {recommendation.bestMembershipType === "PayAsYouGo" ? "year" : "membership year"}
      </div>
    </div>
  );
};

/**
 * Additional Costs Breakdown Component
 */
const AdditionalCostsBreakdown = ({ additionalCosts, formatCurrency }) => {
  if (!additionalCosts || additionalCosts.length === 0) return null;
  
  return (
    <div>
      {additionalCosts.map((item, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "15px",
            marginBottom: "8px",
          }}
        >
          <span>{item.label}:</span>
          <span style={{ fontWeight: "500" }}>{formatCurrency(item.cost)}</span>
        </div>
      ))}
    </div>
  );
};

/**
 * Enhanced Savings Section - More prominently displays savings
 */
const EnhancedSavingsSection = ({ recommendation, formatCurrency }) => {
  if (!recommendation || !recommendation.regularAdmissionCost) return null;
  
  // Calculate savings based on non-discounted price
  const savings = recommendation.regularAdmissionCost - (recommendation.baseMembershipPrice || 0);
  const savingsPercentage = recommendation.regularAdmissionCost > 0
    ? Math.min(90, Math.round((savings / recommendation.regularAdmissionCost) * 100))
    : 0;
  
  // Only show if there are actual savings
  if (savings <= 0) return null;
  
  return (
    <div
      className="enhanced-savings-section"
      style={{
        backgroundColor: "#276749", // Darker green background
        color: "white",
        padding: "20px",
        borderRadius: "8px",
        marginTop: "10px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)"
      }}
    >
      <div
        style={{
          fontSize: "18px",
          fontWeight: "600",
          marginBottom: "8px",
        }}
      >
        Your Membership Savings
      </div>
      <div
        style={{
          fontSize: "32px",
          fontWeight: "700",
          marginBottom: "5px",
        }}
      >
        {formatCurrency(savings)}
      </div>
      <div
        style={{
          fontSize: "17px",
          fontWeight: "500",
        }}
      >
        That's {savingsPercentage}% off regular admission!
      </div>
      
      <div style={{ 
        marginTop: "12px", 
        fontSize: "15px",
        fontWeight: "500",
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        padding: "8px",
        borderRadius: "4px"
      }}>
        Regular admission cost: {formatCurrency(recommendation.regularAdmissionCost)}
      </div>
    </div>
  );
};

export default PricingDisplay;
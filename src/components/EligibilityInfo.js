// components/EligibilityInfo.js
import React from "react";
import { PricingConfig } from "../pricing/pricing-module";

/**
 * EligibilityInfo component
 * Displays information about special eligibility (Welcome Program only)
 * Removed all discount-related information
 */
const EligibilityInfo = ({ recommendation }) => {
  // If no recommendation data, don't render
  if (!recommendation) return null;

  // Only show for Welcome Program
  const isWelcomeProgram = recommendation.bestMembershipType === "Welcome";
  
  // If not Welcome Program, don't render
  if (!isWelcomeProgram) return null;

  return (
    <EligibilityContainer
      isEligible={true}
      membershipType={recommendation.bestMembershipType}
    >
      <EligibilityHeader isEligible={true} />
      <EligibilityMessage message="✓ Eligible for Welcome Program pricing" isEligible={true} />
    </EligibilityContainer>
  );
};

/**
 * Eligibility Container Component
 */
const EligibilityContainer = ({ children, isEligible, membershipType }) => {
  // Welcome Program is always shown with success styling
  const isWelcomeProgram = membershipType === "Welcome";
  const showSuccessStyling = isEligible || isWelcomeProgram;

  return (
    <div
      className="eligibility-info"
      style={{
        padding: "15px",
        marginTop: "10px",
        marginBottom: "20px",
        backgroundColor: showSuccessStyling ? "#f0fff4" : "#fff5f5",
        borderRadius: "6px",
        borderLeft: `4px solid ${showSuccessStyling ? "#38a169" : "#e53e3e"}`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Eligibility Header Component
 */
const EligibilityHeader = ({ isEligible }) => (
  <h4
    style={{
      marginTop: 0,
      marginBottom: "10px",
      fontWeight: "600",
    }}
  >
    <span role="img" aria-hidden="true">
      {isEligible ? "✓ " : "! "}
    </span>
    Special Program Eligibility
  </h4>
);

/**
 * Eligibility Message Component
 */
const EligibilityMessage = ({ message, isEligible }) => (
  <p
    style={{
      margin: 0,
      color: isEligible ? "#2f855a" : "#c53030",
      fontWeight: "500",
    }}
  >
    {message}
  </p>
);

export default EligibilityInfo;
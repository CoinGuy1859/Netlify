// src/components/MembershipRecommendation.js
import React, { useState, useMemo, useCallback } from "react";

/**
 * MembershipRecommendation component - SIMPLIFIED VERSION
 * This version removes all complex imports to fix the blank page issue
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
    // DEBUG: Log what we're receiving
    console.log("=== MembershipRecommendation DEBUG ===");
    console.log("recommendation:", recommendation);
    console.log("isCalculating:", isCalculating);
    console.log("visits:", { scienceVisits, dpkhVisits, dpkrVisits });
    console.log("family:", { adultCount, childAges });

    // Show loading state
    if (isCalculating) {
      console.log("SHOWING LOADING STATE");
      return (
        <div className="recommendation-container" style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
          backgroundColor: "#f7fafc",
          borderRadius: "8px",
          margin: "20px 0",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "4px solid #e2e8f0",
              borderTop: "4px solid #4299e1",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }} />
            <p style={{ color: "#4a5568", fontSize: "16px", margin: "0" }}>
              Calculating your personalized recommendation...
            </p>
          </div>
          <style>
            {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
          </style>
        </div>
      );
    }

    // Safety check for recommendation
    if (!recommendation) {
      console.log("NO RECOMMENDATION - SHOWING ERROR MESSAGE");
      return (
        <div className="recommendation-container" style={{ 
          padding: "40px", 
          textAlign: "center",
          backgroundColor: "#fff5f5",
          border: "2px solid #fed7d7",
          borderRadius: "12px",
          margin: "20px 0"
        }}>
          <h2 style={{ color: "#e53e3e", fontSize: "24px", margin: "0 0 16px 0" }}>
            Unable to Generate Recommendation
          </h2>
          <p style={{ color: "#e53e3e", fontSize: "16px", margin: "0 0 16px 0" }}>
            We couldn't calculate a membership recommendation with the current information.
          </p>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "10px" }}>
            Debug: recommendation is {recommendation === null ? 'null' : 'undefined'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              backgroundColor: "#e53e3e",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "16px"
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    console.log("RENDERING RECOMMENDATION CONTENT");

    // Helper function to get total price
    const getTotalPrice = useCallback(() => {
      if (!recommendation) return 0;

      try {
        const membershipCost = recommendation?.baseMembershipDiscount || recommendation?.baseMembershipPrice || 0;
        const additionalCost = recommendation?.additionalCosts && recommendation.additionalCosts.length > 0
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

    const totalPrice = getTotalPrice();

    return (
      <div className="recommendation-container" style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}>
        {/* Page Title */}
        <h1 style={{
          fontSize: "32px",
          fontWeight: "700",
          textAlign: "center",
          color: "#2d3748",
          marginBottom: "40px",
        }}>
          Your Personalized Recommendation
        </h1>

        {/* Main Recommendation Card */}
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
              {/* Simple Discovery Place logo */}
              <div style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#4299e1",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "14px",
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
                {recommendation.bestMembershipLabel || "Discovery Place Membership"}
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: "24px" }}>
            <p style={{ fontSize: "16px", lineHeight: "1.6", margin: "0 0 20px 0", color: "#4a5568" }}>
              {recommendation.bestMembershipExplanation || 
               `Based on your ${totalVisits} planned visits for ${adultCount + childAges.length} people, this membership offers the best value.`}
            </p>

            <div style={{
              backgroundColor: "#f7fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "20px"
            }}>
              <div style={{ fontSize: "18px", fontWeight: "600", color: "#2d3748", marginBottom: "8px" }}>
                Annual Membership Cost: {formatCurrency(totalPrice)}
              </div>
              {recommendation.totalSavings > 0 && (
                <div style={{ fontSize: "16px", color: "#38a169" }}>
                  💰 You save {formatCurrency(recommendation.totalSavings)} per year!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        {recommendation.costBreakdown && recommendation.costBreakdown.length > 0 && (
          <div style={{
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "24px",
            margin: "20px 0"
          }}>
            <h3 style={{ fontSize: "20px", fontWeight: "600", margin: "0 0 20px 0", color: "#2d3748" }}>
              Cost Breakdown
            </h3>
            {recommendation.costBreakdown.map((item, index) => (
              <div key={index} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: index < recommendation.costBreakdown.length - 1 ? "1px solid #f7fafc" : "none",
                fontSize: "16px"
              }}>
                <span style={{ color: "#4a5568" }}>{item.description}</span>
                <span style={{ fontWeight: "600", color: "#2d3748" }}>
                  {formatCurrency(item.cost)}
                </span>
              </div>
            ))}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 0 0 0",
              fontSize: "18px",
              fontWeight: "700",
              borderTop: "2px solid #e2e8f0",
              marginTop: "12px",
              color: "#2d3748"
            }}>
              <span>Total Annual Cost</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        )}

        {/* Comparison */}
        <div style={{
          backgroundColor: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "24px",
          margin: "20px 0"
        }}>
          <h3 style={{ fontSize: "20px", fontWeight: "600", margin: "0 0 20px 0", color: "#2d3748" }}>
            Membership vs. Pay-Per-Visit
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{
              backgroundColor: "#fff5f5",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              border: "1px solid #fed7d7"
            }}>
              <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#4a5568" }}>
                Pay Per Visit
              </div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: "#e53e3e" }}>
                {formatCurrency(recommendation.regularAdmissionCost || 0)}
              </div>
              <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                for {totalVisits} visits
              </div>
            </div>
            <div style={{
              backgroundColor: "#f0fff4",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              border: "1px solid #c6f6d5"
            }}>
              <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#4a5568" }}>
                With Membership
              </div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: "#38a169" }}>
                {formatCurrency(totalPrice)}
              </div>
              <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                annual membership
              </div>
            </div>
          </div>
          {recommendation.totalSavings > 0 && (
            <div style={{
              textAlign: "center",
              marginTop: "20px",
              padding: "16px",
              backgroundColor: "#f0fff4",
              borderRadius: "8px",
              border: "1px solid #c6f6d5"
            }}>
              <div style={{ fontSize: "18px", fontWeight: "600", color: "#38a169" }}>
                🎉 You save {formatCurrency(recommendation.totalSavings)} with membership!
              </div>
              <div style={{ fontSize: "14px", color: "#4a5568", marginTop: "4px" }}>
                That's {Math.round((recommendation.totalSavings / (recommendation.regularAdmissionCost || 1)) * 100)}% off regular admission
              </div>
            </div>
          )}
        </div>

        {/* Simple FAQ */}
        <div style={{
          backgroundColor: "#f7fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "24px",
          margin: "20px 0"
        }}>
          <h4 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 16px 0", color: "#2d3748" }}>
            Next Steps
          </h4>
          <div style={{ fontSize: "16px", lineHeight: "1.6", color: "#4a5568" }}>
            <p style={{ margin: "0 0 12px 0" }}>
              <strong>Ready to join?</strong> Visit any Discovery Place location or call <strong>(704) 372-6261</strong> to purchase your membership.
            </p>
            <p style={{ margin: "0 0 12px 0" }}>
              <strong>Have questions?</strong> Our staff can help you choose the perfect membership for your family's needs.
            </p>
            <p style={{ margin: "0" }}>
              <strong>Member benefits start immediately</strong> and include free admission, guest discounts, and special member events.
            </p>
          </div>
        </div>
      </div>
    );
  }
);

// Add display name for debugging
MembershipRecommendation.displayName = 'MembershipRecommendation';

export default MembershipRecommendation;

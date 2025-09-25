// src/components/MembershipRecommendation.js
import React, { useState, useMemo, useCallback } from "react";

/**
 * MembershipRecommendation component - Full-featured version
 * Provides comprehensive information families need to make membership decisions
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
    // Show loading state
    if (isCalculating) {
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
            We couldn't calculate a membership recommendation. Please check your visit information and try again.
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

    // Calculate total visits and family info
    const totalVisits = scienceVisits + dpkhVisits + dpkrVisits;
    const familySize = adultCount + childAges.filter(age => age >= 2).length;

    return (
      <div className="recommendation-container" style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "0 20px",
        fontFamily: "Arial, sans-serif",
      }}>
        {/* Page Title */}
        <h1 style={{
          fontSize: "32px",
          fontWeight: "700",
          textAlign: "center",
          color: "#2d3748",
          marginBottom: "40px",
          marginTop: "40px",
        }}>
          Your Personalized Recommendation
        </h1>

        {/* Main Recommendation Card */}
        <RecommendationCard 
          recommendation={recommendation}
          totalVisits={totalVisits}
          familySize={familySize}
          formatCurrency={formatCurrency}
        />

        {/* Why This Membership Section */}
        <WhyThisMembership 
          recommendation={recommendation}
          scienceVisits={scienceVisits}
          dpkhVisits={dpkhVisits}
          dpkrVisits={dpkrVisits}
          totalVisits={totalVisits}
          familySize={familySize}
        />

        {/* What's Included Section */}
        <WhatsIncluded 
          recommendation={recommendation}
          familySize={familySize}
        />

        {/* Cost Analysis Section */}
        <CostAnalysis 
          recommendation={recommendation}
          totalVisits={totalVisits}
          formatCurrency={formatCurrency}
        />

        {/* Additional Savings Section */}
        <AdditionalSavings 
          recommendation={recommendation}
          formatCurrency={formatCurrency}
        />

        {/* How to Purchase Section */}
        <HowToPurchase 
          recommendation={recommendation}
        />
      </div>
    );
  }
);

/**
 * Main Recommendation Card Component
 */
const RecommendationCard = ({ recommendation, totalVisits, familySize, formatCurrency }) => {
  const membershipCost = recommendation.bestMembershipPromoCost || 
                        recommendation.baseMembershipPrice || 
                        recommendation.bestMembershipCost || 0;
  const savings = recommendation.bestMembershipSavings || 0;

  return (
    <div style={{
      border: "2px solid #4299e1",
      borderRadius: "16px",
      overflow: "hidden",
      marginBottom: "32px",
      backgroundColor: "white",
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)"
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: "#4299e1",
        color: "white",
        padding: "24px",
        display: "flex",
        alignItems: "center"
      }}>
        <div style={{
          marginRight: "20px",
          backgroundColor: "rgba(255,255,255,0.2)",
          borderRadius: "12px",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "60px",
          height: "60px"
        }}>
          <span style={{ fontSize: "32px" }}>⭐</span>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ 
            fontSize: "24px", 
            fontWeight: "700", 
            margin: "0 0 8px 0" 
          }}>
            {recommendation.bestMembershipLabel || "Membership Recommendation"}
          </h2>
          <p style={{ 
            fontSize: "16px", 
            margin: "0", 
            opacity: "0.95" 
          }}>
            Perfect for your family of {familySize} with {totalVisits} annual visits
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "32px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "24px",
          textAlign: "center"
        }}>
          <div>
            <div style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#2d3748",
              marginBottom: "8px",
              fontFamily: "monospace"
            }}>
              {formatCurrency(membershipCost)}
            </div>
            <div style={{
              fontSize: "14px",
              color: "#718096",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              Annual Cost
            </div>
          </div>
          
          <div>
            <div style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#38a169",
              marginBottom: "8px",
              fontFamily: "monospace"
            }}>
              {formatCurrency(savings)}
            </div>
            <div style={{
              fontSize: "14px",
              color: "#718096",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              You Save
            </div>
          </div>
          
          <div>
            <div style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#4299e1",
              marginBottom: "8px"
            }}>
              {recommendation.savingsPercentage || 0}%
            </div>
            <div style={{
              fontSize: "14px",
              color: "#718096",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              Discount
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Why This Membership Section
 */
const WhyThisMembership = ({ recommendation, scienceVisits, dpkhVisits, dpkrVisits, totalVisits, familySize }) => {
  const getVisitInsight = () => {
    if (recommendation.bestMembershipType === "ScienceKids") {
      return `You visit multiple Discovery Place locations regularly (${scienceVisits} Science visits, ${dpkhVisits} Kids-Huntersville visits${dpkrVisits > 0 ? `, ${dpkrVisits} Kids-Rockingham visits` : ''})`;
    } else if (scienceVisits > dpkhVisits && scienceVisits > dpkrVisits) {
      return `Science is your primary destination with ${scienceVisits} planned annual visits`;
    } else if (dpkhVisits > dpkrVisits) {
      return `Kids-Huntersville is your favorite with ${dpkhVisits} visits planned`;
    } else {
      return `Kids-Rockingham is your go-to location with ${dpkrVisits} visits across our locations.`;
    }
  };

  return (
    <div style={{
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "24px"
    }}>
      <h3 style={{ 
        fontSize: "20px", 
        fontWeight: "600", 
        margin: "0 0 16px 0", 
        color: "#2d3748" 
      }}>
        Why This Membership Makes Sense
      </h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          <div style={{ 
            fontSize: "16px", 
            fontWeight: "500", 
            color: "#4299e1", 
            marginBottom: "8px" 
          }}>
            Your Visit Pattern
          </div>
          <p style={{ 
            fontSize: "14px", 
            color: "#4a5568", 
            lineHeight: "1.5", 
            margin: "0" 
          }}>
            {getVisitInsight()} This membership covers your primary location 
            with added benefits at our other locations.
          </p>
        </div>
        
        <div>
          <div style={{ 
            fontSize: "16px", 
            fontWeight: "500", 
            color: "#4299e1", 
            marginBottom: "8px" 
          }}>
            Family Size
          </div>
          <p style={{ 
            fontSize: "14px", 
            color: "#4a5568", 
            lineHeight: "1.5", 
            margin: "0" 
          }}>
            This membership covers all {familySize} family members and includes 
            guest discounts when you bring friends along.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * What's Included Section
 */
const WhatsIncluded = ({ recommendation, familySize }) => {
  const getMembershipBenefits = () => {
    const membershipType = recommendation.bestMembershipType;
    
    if (membershipType === "Science") {
      return [
        `Unlimited admission for all ${familySize} family members to Discovery Place Science`,
        "50% off guest admission when you bring friends",
        "$8 flat-rate parking (save $10 per visit)",
        "ASTC reciprocal benefits at 300+ science centers nationwide",
        "25% off admission at Kids-Huntersville and Kids-Rockingham",
        "Member-exclusive events and activities",
        "Priority registration for camps and programs",
        "10% discount on birthday parties"
      ];
    } else if (membershipType === "DPKH" || membershipType === "DPKR") {
      return [
        `Unlimited admission for all ${familySize} family members to ${membershipType === "DPKH" ? "Kids-Huntersville" : "Kids-Rockingham"}`,
        "50% off guest admission when you bring friends",
        "25% off admission at Science and Kids-Huntersville",
        "Member-exclusive events and activities",
        "Priority registration for camps and programs",
        "10% discount on birthday parties"
      ];
    } else if (membershipType === "ScienceKids") {
      return [
        `Unlimited admission for all ${familySize} family members to ALL locations`,
        "50% off guest admission at all Discovery Place locations",
        "$8 flat-rate parking at Discovery Place Science",
        "ASTC reciprocal benefits at 300+ science centers nationwide",
        "Member-exclusive events at all locations",
        "Priority registration for camps and programs",
        "10% discount on birthday parties and camps"
      ];
    }
    
    return [
      `Unlimited admission for all ${familySize} family members`,
      "Guest discounts when you bring friends",
      "Member-exclusive events and benefits",
      "Discounts on additional programs and camps"
    ];
  };

  return (
    <div style={{
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "24px"
    }}>
      <h3 style={{ 
        fontSize: "20px", 
        fontWeight: "600", 
        margin: "0 0 20px 0", 
        color: "#2d3748" 
      }}>
        What's Included with Your Membership
      </h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
        {getMembershipBenefits().map((benefit, index) => (
          <div key={index} style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px"
          }}>
            <div style={{
              backgroundColor: "#48bb78",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: "2px"
            }}>
              <span style={{ color: "white", fontSize: "12px", fontWeight: "bold" }}>✓</span>
            </div>
            <span style={{ 
              fontSize: "15px", 
              color: "#2d3748", 
              lineHeight: "1.4" 
            }}>
              {benefit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Cost Analysis Section with Safety Checks
 */
const CostAnalysis = ({ recommendation, totalVisits, formatCurrency }) => {
  const membershipCost = recommendation.bestMembershipPromoCost || 
                         recommendation.baseMembershipPrice || 
                         recommendation.bestMembershipCost || 0;
  const regularCost = recommendation.regularAdmissionCost || 0;
  const savings = recommendation.bestMembershipSavings || 0;
  const savingsPercent = regularCost > 0 ? Math.round((savings / regularCost) * 100) : 0;

  // Safety check and normalization for costBreakdown
  let costBreakdownArray = [];
  
  if (recommendation.costBreakdown) {
    if (Array.isArray(recommendation.costBreakdown)) {
      // It's already an array
      costBreakdownArray = recommendation.costBreakdown;
    } else if (recommendation.costBreakdown.items && Array.isArray(recommendation.costBreakdown.items)) {
      // It has an items property that's an array
      costBreakdownArray = recommendation.costBreakdown.items;
    } else if (typeof recommendation.costBreakdown === 'object') {
      // It's an object, convert it to array format
      // Handle the old object format
      if (recommendation.costBreakdown.membership !== undefined) {
        costBreakdownArray.push({
          label: recommendation.bestMembershipLabel || "Membership",
          description: "Annual membership",
          cost: recommendation.costBreakdown.membership
        });
      }
      if (recommendation.costBreakdown.parking && recommendation.costBreakdown.parking > 0) {
        costBreakdownArray.push({
          label: "Parking",
          description: "Annual parking costs",
          cost: recommendation.costBreakdown.parking
        });
      }
      if (recommendation.costBreakdown.guestAdmissions && recommendation.costBreakdown.guestAdmissions > 0) {
        costBreakdownArray.push({
          label: "Guest Admissions",
          description: "Additional guest costs",
          cost: recommendation.costBreakdown.guestAdmissions
        });
      }
    }
  }
  
  // If we still don't have a breakdown, create a minimal one
  if (costBreakdownArray.length === 0 && membershipCost > 0) {
    costBreakdownArray.push({
      label: recommendation.bestMembershipLabel || "Membership",
      description: "Annual membership cost",
      cost: membershipCost
    });
  }

  // Don't render if there's no breakdown
  if (costBreakdownArray.length === 0) {
    return null;
  }

  return (
    <div style={{
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "24px"
    }}>
      <h3 style={{ 
        fontSize: "20px", 
        fontWeight: "600", 
        margin: "0 0 20px 0", 
        color: "#2d3748" 
      }}>
        Cost Analysis for {totalVisits} Annual Visits
      </h3>
      
      {/* Detailed Breakdown */}
      <div style={{ marginBottom: "24px" }}>
        <h4 style={{
          fontSize: "16px",
          fontWeight: "500",
          color: "#4a5568",
          margin: "0 0 12px 0"
        }}>
          Membership Cost Breakdown:
        </h4>
        {costBreakdownArray.map((item, index) => (
          <div key={index} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 0",
            borderBottom: index < costBreakdownArray.length - 1 ? "1px solid #f7fafc" : "none",
          }}>
            <span style={{ 
              color: "#4a5568", 
              fontSize: "14px" 
            }}>
              {item.description || item.label}
            </span>
            <span style={{ 
              fontWeight: "500", 
              color: "#2d3748",
              fontSize: "14px",
              fontFamily: "monospace"
            }}>
              {formatCurrency(item.cost)}
            </span>
          </div>
        ))}
      </div>
      
      {/* Comparison Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "16px",
        marginTop: "20px"
      }}>
        <div style={{
          backgroundColor: "#fff5f5",
          border: "1px solid #fed7d7",
          borderRadius: "8px",
          padding: "16px",
          textAlign: "center"
        }}>
          <div style={{
            fontSize: "12px",
            fontWeight: "500",
            color: "#e53e3e",
            marginBottom: "4px",
            textTransform: "uppercase"
          }}>
            Pay Per Visit
          </div>
          <div style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#e53e3e",
            fontFamily: "monospace"
          }}>
            {formatCurrency(regularCost)}
          </div>
        </div>
        
        <div style={{
          backgroundColor: "#f0fff4",
          border: "1px solid #9ae6b4",
          borderRadius: "8px",
          padding: "16px",
          textAlign: "center"
        }}>
          <div style={{
            fontSize: "12px",
            fontWeight: "500",
            color: "#38a169",
            marginBottom: "4px",
            textTransform: "uppercase"
          }}>
            With Membership
          </div>
          <div style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#38a169",
            fontFamily: "monospace"
          }}>
            {formatCurrency(membershipCost)}
          </div>
        </div>
        
        <div style={{
          backgroundColor: "#ebf8ff",
          border: "1px solid #90cdf4",
          borderRadius: "8px",
          padding: "16px",
          textAlign: "center"
        }}>
          <div style={{
            fontSize: "12px",
            fontWeight: "500",
            color: "#3182ce",
            marginBottom: "4px",
            textTransform: "uppercase"
          }}>
            Your Savings
          </div>
          <div style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#3182ce",
            fontFamily: "monospace"
          }}>
            {formatCurrency(savings)}
          </div>
          {savingsPercent > 0 && (
            <div style={{
              fontSize: "12px",
              color: "#3182ce",
              marginTop: "4px"
            }}>
              ({savingsPercent}% saved)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Additional Savings Section
 */
const AdditionalSavings = ({ recommendation, formatCurrency }) => {
  return (
    <div style={{
      backgroundColor: "#f0fff4",
      border: "1px solid #9ae6b4",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "24px"
    }}>
      <h3 style={{ 
        fontSize: "20px", 
        fontWeight: "600", 
        margin: "0 0 20px 0", 
        color: "#22543d" 
      }}>
        Additional Ways You'll Save
      </h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
        <div>
          <div style={{
            fontSize: "16px",
            fontWeight: "500",
            color: "#2f855a",
            marginBottom: "8px"
          }}>
            🎟️ Guest Discounts
          </div>
          <p style={{
            fontSize: "14px",
            color: "#276749",
            lineHeight: "1.4",
            margin: "0"
          }}>
            Save 50% when bringing friends and family. Perfect for playdates and birthday celebrations!
          </p>
        </div>
        
        <div>
          <div style={{
            fontSize: "16px",
            fontWeight: "500",
            color: "#2f855a",
            marginBottom: "8px"
          }}>
            🎂 Birthday Party Savings
          </div>
          <p style={{
            fontSize: "14px",
            color: "#276749",
            lineHeight: "1.4",
            margin: "0"
          }}>
            Get 10% off birthday party packages at any location. Great for birthday parties and special occasions!
          </p>
        </div>
        
        <div>
          <div style={{
            fontSize: "16px",
            fontWeight: "500",
            color: "#2f855a",
            marginBottom: "8px"
          }}>
          🚗 Parking Savings
          </div>
          <p style={{
            fontSize: "14px",
            color: "#276749",
            lineHeight: "1.4",
            margin: "0"
          }}>
            Pay just $8 for parking at Science (vs $18 for non-members). That's $10 saved every visit!
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * How to Purchase Section
 */
const HowToPurchase = ({ recommendation }) => {
  return (
    <div style={{
      backgroundColor: "white",
      border: "2px solid #4299e1",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "24px",
      textAlign: "center"
    }}>
      <h3 style={{ 
        fontSize: "20px", 
        fontWeight: "600", 
        margin: "0 0 20px 0", 
        color: "#2d3748" 
      }}>
        Ready to Join?
      </h3>
      
      <div style={{ marginBottom: "20px" }}>
        <a
          href={recommendation.purchaseLink || "https://discoveryplace.org"}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "#4299e1",
            color: "white",
            padding: "16px 32px",
            borderRadius: "8px",
            fontSize: "18px",
            fontWeight: "600",
            textDecoration: "none",
            display: "inline-block",
            marginRight: "16px",
            marginBottom: "16px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Purchase Online
        </a>
      </div>
      
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginTop: "16px",
        textAlign: "left"
      }}>
        <div>
          <div style={{
            fontSize: "16px",
            fontWeight: "500",
            color: "#2d3748",
            marginBottom: "8px"
          }}>
            📞 Call Us
          </div>
          <p style={{
            fontSize: "14px",
            color: "#4a5568",
            margin: "0"
          }}>
            (704) 337-2661<br/>
            Mon-Fri, 9am-5pm
          </p>
        </div>
        
        <div>
          <div style={{
            fontSize: "16px",
            fontWeight: "500",
            color: "#2d3748",
            marginBottom: "8px"
          }}>
            ✉️ Email Us
          </div>
          <p style={{
            fontSize: "14px",
            color: "#4a5568",
            margin: "0"
          }}>
            members@discoveryplace.org
          </p>
        </div>
        
        <div>
          <div style={{
            fontSize: "16px",
            fontWeight: "500",
            color: "#2d3748",
            marginBottom: "8px"
          }}>
            🏢 Visit In Person
          </div>
          <p style={{
            fontSize: "14px",
            color: "#4a5568",
            margin: "0"
          }}>
            Any Discovery Place location<br/>
            during regular hours
          </p>
        </div>
      </div>
    </div>
  );
};

export default MembershipRecommendation;

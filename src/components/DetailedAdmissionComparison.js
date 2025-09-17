// components/DetailedAdmissionComparison.js
import React, { useState } from "react";
import CheckIcon from "./CheckIcon";

/**
 * DetailedAdmissionComparison component - Shows detailed comparison between admission and membership
 * Refactored to remove duplication, improve readability, and enhance maintainability
 */
const DetailedAdmissionComparison = ({
  recommendation,
  scienceVisits,
  dpkhVisits,
  dpkrVisits,
  adultCount,
  childAges,
  isRichmondResident,
  includeParking,
  formatCurrency,
}) => {
  const [showAdmissionDetails, setShowAdmissionDetails] = useState(false);

  // Calculate the actual membership costs (membership + parking + cross-location)
  const getMembershipEstimatedCost = () => {
    if (!recommendation) {
      console.warn("DetailedAdmissionComparison: No recommendation provided");
      return 0;
    }
    
    // Debug logging to help identify the issue
    console.log("Recommendation object:", recommendation);
    console.log("baseMembershipPrice:", recommendation.baseMembershipPrice);
    console.log("baseMembershipDiscount:", recommendation.baseMembershipDiscount);
    console.log("bestMembershipPromoCost:", recommendation.bestMembershipPromoCost);
    console.log("bestMembershipType:", recommendation.bestMembershipType);
    console.log("additionalCosts:", recommendation.additionalCosts);
    console.log("costBreakdown:", recommendation.costBreakdown);
    
    // Handle different recommendation types
    if (recommendation.bestMembershipType === "PayAsYouGo") {
      // For Pay As You Go, the cost is just the regular admission cost
      return recommendation.regularAdmissionCost || 0;
    }
    
    if (recommendation.bestMembershipType === "Welcome" && recommendation.welcomeProgramOption) {
      // For Welcome Program, use the total price from the welcome option
      const welcomeTotal = recommendation.welcomeProgramOption.totalPrice || 
                          recommendation.welcomeProgramOption.basePrice || 0;
      return welcomeTotal;
    }
    
    // For regular memberships, use the base membership price
    // Fall back through different fields to ensure we get a value
    let membershipCost = recommendation.baseMembershipPrice || 
                        recommendation.baseMembershipDiscount || 
                        recommendation.bestMembershipPromoCost || 0;
    
    // If membership cost is still 0, try to calculate from costBreakdown items
    if (membershipCost === 0 && recommendation.costBreakdown?.items) {
      console.log("Attempting to calculate from costBreakdown items");
      const membershipItem = recommendation.costBreakdown.items.find(item => 
        item.label && (
          item.label.includes("Membership") || 
          item.label.includes("Science") ||
          item.label.includes("DPKH") ||
          item.label.includes("DPKR") ||
          item.label.includes("Kids")
        ) && !item.label.includes("Parking") && !item.label.includes("Cross")
      );
      if (membershipItem) {
        membershipCost = membershipItem.cost || 0;
        console.log("Found membership cost from breakdown:", membershipCost);
      }
    }
    
    if (membershipCost === 0) {
      console.error("Warning: Membership cost is $0. This may indicate a data issue.");
      console.error("Full recommendation object:", JSON.stringify(recommendation, null, 2));
    }
    
    // Start with membership cost
    let totalCost = membershipCost;
    
    // Add additional costs (parking and cross-location visits)
    if (recommendation.additionalCosts && recommendation.additionalCosts.length > 0) {
      recommendation.additionalCosts.forEach(item => {
        console.log(`Adding additional cost: ${item.label} = ${item.cost}`);
        totalCost += item.cost || 0;
      });
    }
    
    // Final fallback: if we still have $0, something is wrong
    // Use the total promotional cost as a last resort
    if (totalCost === 0 && recommendation.bestMembershipPromoCost > 0) {
      console.log("Using bestMembershipPromoCost as fallback:", recommendation.bestMembershipPromoCost);
      totalCost = recommendation.bestMembershipPromoCost;
    }
    
    console.log("Total estimated membership cost:", totalCost);
    return totalCost;
  };
  
  // Get the actual estimated membership cost
  const membershipEstimatedCost = getMembershipEstimatedCost();
  const regularAdmissionCost = recommendation.regularAdmissionCost || 0;

  // Calculate savings based on the actual costs
  const totalSavings = Math.max(0, regularAdmissionCost - membershipEstimatedCost);

  // Safeguard against impossible savings percentages
  const savingsPercentage =
    regularAdmissionCost > 0
      ? Math.min(90, Math.round((totalSavings / regularAdmissionCost) * 100))
      : 0;

  // Get the admission breakdown
  const admissionBreakdown = getAdmissionBreakdown({
    scienceVisits,
    dpkhVisits,
    dpkrVisits,
    adultCount,
    childAges,
    isRichmondResident,
    includeParking,
  });

  if (!admissionBreakdown) return null;

  return (
    <div
      className="admission-comparison-section"
      style={{
        marginTop: "30px",
        padding: "20px 15px",
        backgroundColor: "#f8fafc",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
      }}
    >
      <SectionHeader />

      <ComparisonCards
        regularAdmissionCost={regularAdmissionCost}
        totalCost={membershipEstimatedCost}
        totalSavings={totalSavings}
        savingsPercentage={savingsPercentage}
        totalVisits={scienceVisits + dpkhVisits + dpkrVisits}
        formatCurrency={formatCurrency}
        recommendation={recommendation}
      />

      <ToggleButton
        showDetails={showAdmissionDetails}
        setShowDetails={setShowAdmissionDetails}
      />

      {showAdmissionDetails && (
        <DetailedBreakdown
          admissionBreakdown={admissionBreakdown}
          totalCost={membershipEstimatedCost}
          totalSavings={totalSavings}
          savingsPercentage={savingsPercentage}
          formatCurrency={formatCurrency}
          recommendation={recommendation}
        />
      )}
    </div>
  );
};

/**
 * Section Header Component
 */
const SectionHeader = () => (
  <h4
    style={{
      margin: "0 0 15px 0",
      padding: "0 0 10px 0",
      borderBottom: "1px solid #e2e8f0",
      fontSize: "18px",
      fontWeight: "600",
      color: "#2d3748",
    }}
  >
    Detailed Admission vs. Membership Comparison
  </h4>
);

/**
 * Comparison Cards Component
 */
const ComparisonCards = ({
  regularAdmissionCost,
  totalCost,
  totalSavings,
  savingsPercentage,
  totalVisits,
  formatCurrency,
  recommendation,  // Add recommendation prop
}) => {
  const isPayAsYouGo = recommendation?.bestMembershipType === "PayAsYouGo";
  
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "15px",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#feebc8",
          padding: "15px",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            color: "#744210",
            marginBottom: "5px",
            fontWeight: "500",
          }}
        >
          Regular Admission
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#c05621",
          }}
        >
          {formatCurrency(regularAdmissionCost)}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#744210",
            marginTop: "5px",
          }}
        >
          for {totalVisits} visits
        </div>
      </div>

      <div
        style={{
          backgroundColor: isPayAsYouGo ? "#fff3cd" : "#c6f6d5",
          padding: "15px",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            color: isPayAsYouGo ? "#856404" : "#22543d",
            marginBottom: "5px",
            fontWeight: "500",
          }}
        >
          {isPayAsYouGo ? "Recommended Option" : "With Membership"}
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: isPayAsYouGo ? "#856404" : "#22863a",
          }}
        >
          {formatCurrency(totalCost)}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: isPayAsYouGo ? "#856404" : "#22543d",
            marginTop: "5px",
            fontWeight: "600",
          }}
        >
          {isPayAsYouGo ? "Pay As You Go" : 
           totalSavings > 0 ? `You save ${formatCurrency(totalSavings)}!` : "Annual total"
          }
        </div>
      </div>
    </div>
  );
};

/**
 * Toggle Button Component
 */
const ToggleButton = ({ showDetails, setShowDetails }) => (
  <button
    onClick={() => setShowDetails(!showDetails)}
    style={{
      width: "100%",
      padding: "10px",
      backgroundColor: "#ffffff",
      border: "1px solid #cbd5e0",
      borderRadius: "6px",
      fontSize: "14px",
      color: "#4a5568",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      transition: "background-color 0.2s",
    }}
    onMouseEnter={(e) => (e.target.style.backgroundColor = "#f7fafc")}
    onMouseLeave={(e) => (e.target.style.backgroundColor = "#ffffff")}
  >
    {showDetails ? "Hide" : "Show"} Detailed Breakdown
    <span style={{ fontSize: "12px" }}>{showDetails ? "▲" : "▼"}</span>
  </button>
);

/**
 * Detailed Breakdown Component
 */
const DetailedBreakdown = ({
  admissionBreakdown,
  totalCost,
  totalSavings,
  savingsPercentage,
  formatCurrency,
  recommendation,  // Add recommendation prop
}) => (
  <div
    className="detailed-breakdown"
    style={{
      marginTop: "15px",
      backgroundColor: "#fff",
      padding: "15px",
      borderRadius: "6px",
      border: "1px solid #e2e8f0",
    }}
  >
    <LocationBreakdownTable
      breakdown={admissionBreakdown.breakdown}
      formatCurrency={formatCurrency}
    />
    <AdmissionTotal
      grandTotal={admissionBreakdown.grandTotal}
      formatCurrency={formatCurrency}
    />
    <MembershipComparison 
      totalCost={totalCost} 
      recommendation={recommendation}  // Pass recommendation prop
      formatCurrency={formatCurrency} 
    />
    <SavingsCallout
      totalSavings={totalSavings}
      savingsPercentage={savingsPercentage}
      formatCurrency={formatCurrency}
      recommendation={recommendation}
    />
  </div>
);

/**
 * Location Breakdown Table Component
 */
const LocationBreakdownTable = ({ breakdown, formatCurrency }) => (
  <div className="location-breakdown">
    <h5
      style={{
        fontSize: "16px",
        fontWeight: "600",
        color: "#2d3748",
        marginBottom: "10px",
      }}
    >
      Regular Admission Breakdown by Location
    </h5>
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "10px",
      }}
    >
      <thead>
        <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
          <th
            style={{
              textAlign: "left",
              padding: "8px 0",
              fontSize: "14px",
              color: "#718096",
            }}
          >
            Location
          </th>
          <th
            style={{
              textAlign: "right",
              padding: "8px 0",
              fontSize: "14px",
              color: "#718096",
            }}
          >
            Cost
          </th>
        </tr>
      </thead>
      <tbody>
        {breakdown.map((location, index) => (
          <tr key={index}>
            <td
              style={{
                padding: "8px 0",
                fontSize: "14px",
              }}
            >
              <div style={{ fontWeight: "500" }}>{location.location}</div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#718096",
                  marginTop: "2px",
                }}
              >
                {location.details.map((detail, idx) => (
                  <div key={idx}>{detail.description}</div>
                ))}
              </div>
            </td>
            <td
              style={{
                textAlign: "right",
                padding: "8px 0",
                fontSize: "15px",
                fontWeight: "500",
                fontFamily: "monospace",
              }}
            >
              {formatCurrency(location.subtotal)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * Admission Total Component
 */
const AdmissionTotal = ({ grandTotal, formatCurrency }) => (
  <div
    className="admission-total"
    style={{
      marginTop: "15px",
      paddingTop: "15px",
      borderTop: "2px solid #e2e8f0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <div
      style={{
        fontSize: "16px",
        fontWeight: "700",
        color: "#2d3748",
      }}
    >
      Total Admission Cost
    </div>
    <div
      style={{
        fontFamily: "monospace",
        fontSize: "18px",
        fontWeight: "700",
        color: "#e53e3e",
      }}
    >
      {formatCurrency(grandTotal)}
    </div>
  </div>
);

/**
 * Membership Comparison Component - Enhanced to show cost breakdown
 */
const MembershipComparison = ({ totalCost, recommendation, formatCurrency }) => {
  // Check if this is a "Pay As You Go" recommendation
  const isPayAsYouGo = recommendation?.bestMembershipType === "PayAsYouGo";
  
  if (isPayAsYouGo) {
    // For Pay As You Go, there's no membership - just show regular admission
    return (
      <div
        className="membership-comparison"
        style={{
          marginTop: "15px",
          paddingTop: "15px",
          borderTop: "1px dashed #e2e8f0",
          backgroundColor: "#fff3cd",
          padding: "15px",
          borderRadius: "6px",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: "700",
            color: "#856404",
            marginBottom: "10px",
          }}
        >
          Pay As You Go (No Membership)
        </div>
        
        <div style={{ fontSize: "14px", color: "#856404", marginBottom: "8px" }}>
          Continue paying regular admission prices
        </div>
        
        <div
          style={{
            fontFamily: "monospace",
            fontSize: "18px",
            fontWeight: "700",
            color: "#856404",
            borderTop: "1px solid #ffc107",
            paddingTop: "8px",
          }}
        >
          {formatCurrency(totalCost)}
        </div>
      </div>
    );
  }
  
  // Get the breakdown of membership costs
  // Handle different membership types appropriately
  let membershipBase = 0;
  
  if (recommendation?.bestMembershipType === "Welcome" && recommendation?.welcomeProgramOption) {
    // For Welcome Program, use the basePrice from welcomeProgramOption
    membershipBase = recommendation.welcomeProgramOption.basePrice || 75; // Welcome is typically $75
  } else {
    // For regular memberships, use baseMembershipPrice first, then fall back to other fields
    membershipBase = recommendation?.baseMembershipPrice || 
                    recommendation?.baseMembershipDiscount || 
                    recommendation?.bestMembershipPromoCost || 0;
    
    // If still 0, try to find from costBreakdown
    if (membershipBase === 0 && recommendation?.costBreakdown?.items) {
      const membershipItem = recommendation.costBreakdown.items.find(item => 
        item.label && (
          item.label.includes("Membership") || 
          item.label.includes("Science") ||
          item.label.includes("DPKH") ||
          item.label.includes("DPKR") ||
          item.label.includes("Kids")
        ) && !item.label.includes("Parking") && !item.label.includes("Cross")
      );
      if (membershipItem) {
        membershipBase = membershipItem.cost || 0;
      }
    }
  }
  
  const parkingCost = recommendation?.additionalCosts?.find(item => 
    item.label && item.label.includes("Parking"))?.cost || 0;
  const crossLocationCost = recommendation?.additionalCosts?.find(item => 
    item.label && item.label.includes("Cross-Location"))?.cost || 0;
  
  return (
    <div
      className="membership-comparison"
      style={{
        marginTop: "15px",
        paddingTop: "15px",
        borderTop: "1px dashed #e2e8f0",
        backgroundColor: "#f0fff4",
        padding: "15px",
        borderRadius: "6px",
      }}
    >
      <div
        style={{
          fontSize: "16px",
          fontWeight: "700",
          color: "#2f855a",
          marginBottom: "10px",
        }}
      >
        With {recommendation?.bestMembershipLabel || "Membership"}
      </div>
      
      {/* Show breakdown of membership costs */}
      <div style={{ fontSize: "14px", color: "#2f855a", marginBottom: "8px" }}>
        {membershipBase > 0 ? (
          <div>Membership: {formatCurrency(membershipBase)}</div>
        ) : (
          totalCost > 0 && (
            <div>Total Membership Package: {formatCurrency(totalCost - parkingCost - crossLocationCost)}</div>
          )
        )}
        {parkingCost > 0 && (
          <div>Parking: {formatCurrency(parkingCost)}</div>
        )}
        {crossLocationCost > 0 && (
          <div>Cross-location visits: {formatCurrency(crossLocationCost)}</div>
        )}
        {totalCost === 0 && (
          <div style={{ color: "#e53e3e", fontStyle: "italic" }}>
            Error: Unable to calculate membership costs. Please check console for details.
          </div>
        )}
      </div>
      
      <div
        style={{
          fontFamily: "monospace",
          fontSize: "18px",
          fontWeight: "700",
          color: "#38a169",
          borderTop: "1px solid #9ae6b4",
          paddingTop: "8px",
        }}
      >
        {formatCurrency(totalCost)}
      </div>
    </div>
  );
};

/**
 * Savings Callout Component
 */
const SavingsCallout = ({
  totalSavings,
  savingsPercentage,
  formatCurrency,
  recommendation,  // Add recommendation prop
}) => {
  const isPayAsYouGo = recommendation?.bestMembershipType === "PayAsYouGo";
  
  if (isPayAsYouGo) {
    return (
      <div
        className="savings-callout"
        style={{
          marginTop: "15px",
          textAlign: "center",
          backgroundColor: "#fff3cd",
          padding: "15px",
          borderRadius: "6px",
          border: "1px solid #ffc107",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#856404",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckIcon color="#856404" size={20} style={{ marginRight: "6px" }} />
          Pay As You Go is Your Best Option
        </div>
        <div
          style={{
            fontSize: "14px",
            color: "#856404",
            marginTop: "5px",
          }}
        >
          With your planned visit frequency, regular admission is more economical than membership.
        </div>
      </div>
    );
  }
  
  if (totalSavings <= 0) {
    return null; // Don't show savings callout if no savings
  }
  
  return (
    <div
      className="savings-callout"
      style={{
        marginTop: "15px",
        textAlign: "center",
        backgroundColor: "#ebf8ff",
        padding: "15px",
        borderRadius: "6px",
        border: "1px solid #bee3f8",
      }}
    >
      <div
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#2b6cb0",
          marginBottom: "5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CheckIcon color="#2b6cb0" size={20} style={{ marginRight: "6px" }} />
        Your Total Savings with Membership
      </div>
      <div
        style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "#2c5282",
        }}
      >
        {formatCurrency(totalSavings)}
      </div>
      <div
        style={{
          fontSize: "16px",
          color: "#4299e1",
          marginTop: "5px",
        }}
      >
        That's {savingsPercentage}% off regular admission prices!
      </div>
    </div>
  );
};

/**
 * Helper function to generate detailed admission breakdown
 */
const getAdmissionBreakdown = ({
  scienceVisits,
  dpkhVisits,
  dpkrVisits,
  adultCount,
  childAges,
  isRichmondResident,
  includeParking,
}) => {
  // Make sure we have the needed props
  if (
    typeof scienceVisits === "undefined" ||
    typeof dpkhVisits === "undefined" ||
    typeof dpkrVisits === "undefined" ||
    typeof adultCount === "undefined" ||
    !Array.isArray(childAges)
  ) {
    return null;
  }

  // Count eligible children by age
  const eligibleChildrenForScience = childAges.filter((age) => age >= 2).length;
  const eligibleChildrenForDPKH = childAges.filter((age) => age >= 1).length;
  const eligibleChildrenForDPKR = childAges.filter((age) => age >= 1).length;

  // Define admission prices
  const admissionPrices = {
    Science: { adult: 24, child: 18 },
    DPKH: { adult: 15, child: 12 },
    DPKR: {
      adult: isRichmondResident ? 6 : 8,
      child: isRichmondResident ? 6 : 8,
    },
  };

  // Calculate parking costs per visit
  const parkingCostPerVisit = includeParking ? 18 : 0; // $18 for regular visitors

  // Initialize arrays for breakdown
  const breakdown = [];

  // Add Science visits
  if (scienceVisits > 0) {
    const adultTotal =
      scienceVisits * adultCount * admissionPrices.Science.adult;
    const childTotal =
      scienceVisits *
      eligibleChildrenForScience *
      admissionPrices.Science.child;
    const parkingTotal = scienceVisits * parkingCostPerVisit;

    breakdown.push({
      location: "Discovery Place Science",
      visits: scienceVisits,
      details: [
        {
          description: `Adult admission (${adultCount} adults × ${scienceVisits} visits)`,
          cost: adultTotal,
        },
        {
          description: `Child admission (${eligibleChildrenForScience} children × ${scienceVisits} visits)`,
          cost: childTotal,
        },
        ...(includeParking
          ? [
              {
                description: `Parking (${scienceVisits} visits)`,
                cost: parkingTotal,
              },
            ]
          : []),
      ],
      subtotal: adultTotal + childTotal + parkingTotal,
    });
  }

  // Add DPKH visits
  if (dpkhVisits > 0) {
    const adultTotal = dpkhVisits * adultCount * admissionPrices.DPKH.adult;
    const childTotal =
      dpkhVisits * eligibleChildrenForDPKH * admissionPrices.DPKH.child;

    breakdown.push({
      location: "Discovery Place Kids-Huntersville",
      visits: dpkhVisits,
      details: [
        {
          description: `Adult admission (${adultCount} adults × ${dpkhVisits} visits)`,
          cost: adultTotal,
        },
        {
          description: `Child admission (${eligibleChildrenForDPKH} children × ${dpkhVisits} visits)`,
          cost: childTotal,
        },
      ],
      subtotal: adultTotal + childTotal,
    });
  }

  // Add DPKR visits
  if (dpkrVisits > 0) {
    const adultTotal = dpkrVisits * adultCount * admissionPrices.DPKR.adult;
    const childTotal =
      dpkrVisits * eligibleChildrenForDPKR * admissionPrices.DPKR.child;

    breakdown.push({
      location: "Discovery Place Kids-Rockingham",
      visits: dpkrVisits,
      details: [
        {
          description: `Adult admission (${adultCount} adults × ${dpkrVisits} visits)`,
          cost: adultTotal,
        },
        {
          description: `Child admission (${eligibleChildrenForDPKR} children × ${dpkrVisits} visits)`,
          cost: childTotal,
        },
      ],
      subtotal: adultTotal + childTotal,
    });
  }

  // Calculate grand total
  const grandTotal = breakdown.reduce(
    (sum, location) => sum + location.subtotal,
    0
  );

  return {
    breakdown,
    grandTotal,
  };
};

export default DetailedAdmissionComparison;

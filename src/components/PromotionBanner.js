// components/PromotionBanner.js
import React from "react";

/**
 * PromotionBanner component
 * Updated to handle no active promotions gracefully
 * Currently returns null since no promotions are active
 */
const PromotionBanner = () => {
  // Since we're not running percentage-based promotions anymore,
  // this component returns null
  // You can update this when you have new promotions to announce
  return null;
  
  // When you have a promotion to display, uncomment and update this:
  /*
  return (
    <div
      className="promo-banner"
      role="complementary"
      aria-label="Special offer information"
      style={{
        background: "linear-gradient(135deg, #00369e, #002b7a)",
        borderRadius: "8px",
        padding: "15px",
        marginBottom: "20px",
        color: "white",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        className="promo-badge"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          color: "white",
          padding: "3px 8px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "bold",
          marginRight: "15px",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        Special Offer
      </div>
      <div className="promo-content">
        <h3
          style={{
            margin: "0 0 5px 0",
            color: "white",
            fontSize: "18px",
            fontWeight: "600",
          }}
        >
          Military & Educator Discounts Available
        </h3>
        <div
          className="promo-subtitle"
          style={{
            fontSize: "14px",
            opacity: "0.9",
            lineHeight: "1.4",
            color: "white",
          }}
        >
          Save $20-$30 on memberships with valid military or educator ID.
        </div>
      </div>
    </div>
  );
  */
};

export default PromotionBanner;

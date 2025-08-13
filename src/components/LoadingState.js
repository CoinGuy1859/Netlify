// src/components/LoadingState.js
import React from "react";

/**
 * LoadingState Component
 *
 * A reusable component to display loading indicators and messages
 * for various loading/calculation states in the application.
 *
 * @param {Object} props - Component props
 * @param {string} props.message - Message to display during loading
 * @param {string} props.type - Type of loading state ('calculation', 'content', 'skeleton')
 * @param {number} props.height - Optional height for the loading container
 * @param {string} props.bgColor - Optional background color override
 * @param {boolean} props.fullWidth - Whether component should take full width
 */
const LoadingState = ({
  message = "Loading...",
  type = "calculation", // 'calculation', 'content', or 'skeleton'
  height = null,
  bgColor = null,
  fullWidth = false,
}) => {
  // Different stylings based on loading type
  const getContainerStyle = () => {
    const baseStyle = {
      padding: "20px",
      margin: "20px 0",
      borderRadius: "8px",
      border: "1px solid",
      textAlign: "center",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      width: fullWidth ? "100%" : "auto",
    };

    // Apply optional height if provided
    if (height) {
      baseStyle.height = height;
    }

    // Different styling based on loading type
    switch (type) {
      case "content":
        return {
          ...baseStyle,
          backgroundColor: bgColor || "#f8fafc",
          borderColor: "#e2e8f0",
        };
      case "skeleton":
        return {
          ...baseStyle,
          backgroundColor: bgColor || "white",
          borderColor: "#e2e8f0",
        };
      case "calculation":
      default:
        return {
          ...baseStyle,
          backgroundColor: bgColor || "#ebf8ff",
          borderColor: "#bee3f8",
        };
    }
  };

  // Render spinner for calculation type
  if (type === "calculation") {
    return (
      <div
        className="calculation-loading"
        style={getContainerStyle()}
        aria-live="polite"
        role="status"
      >
        <div
          className="loading-spinner"
          role="progressbar"
          aria-label="Loading indicator"
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
          {message}
        </span>

        {/* For screenreaders */}
        <div className="sr-only">{message}</div>
      </div>
    );
  }

  // Render skeleton loading for skeleton type
  if (type === "skeleton") {
    return (
      <div
        className="skeleton-loading"
        style={getContainerStyle()}
        aria-live="polite"
        role="status"
      >
        <div className="skeleton-line short"></div>
        <div className="skeleton-line medium"></div>
        <div className="skeleton-line long"></div>
        <div className="skeleton-line medium"></div>

        {/* For screenreaders */}
        <div className="sr-only">{message}</div>
      </div>
    );
  }

  // Render content placeholder for content type
  return (
    <div
      className="content-loading"
      style={getContainerStyle()}
      aria-live="polite"
      role="status"
    >
      <div
        className="placeholder-content"
        style={{ height: "200px", margin: "20px 0" }}
      >
        <div
          className="skeleton-line"
          style={{ width: "60%", margin: "0 auto 12px" }}
        ></div>
        <div
          className="skeleton-line"
          style={{ width: "80%", margin: "0 auto 12px" }}
        ></div>
        <div
          className="skeleton-line"
          style={{ width: "70%", margin: "0 auto" }}
        ></div>
      </div>

      {/* For screenreaders */}
      <div className="sr-only">{message}</div>
    </div>
  );
};

export default LoadingState;

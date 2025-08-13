// src/components/ErrorBoundary.js
import React from "react";

/**
 * ErrorBoundary component
 *
 * This component catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });

    // Send to error logging service if available
    if (typeof this.props.onError === "function") {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback ? (
        this.props.fallback(this.state.error, this.resetError)
      ) : (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetError}
          componentName={this.props.componentName}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default error fallback UI component
 */
const DefaultErrorFallback = ({
  error,
  resetError,
  componentName,
  showDetails = false,
}) => {
  // Define styles inline since we can't rely on shared styles here
  const styles = {
    container: {
      padding: "20px",
      margin: "20px 0",
      backgroundColor: "#fff5f5",
      border: "1px solid #e53e3e",
      borderRadius: "8px",
      color: "#2d3748",
    },
    heading: {
      color: "#e53e3e",
      fontSize: "18px",
      fontWeight: "600",
      marginTop: "0",
      marginBottom: "12px",
    },
    text: {
      fontSize: "16px",
      lineHeight: "1.5",
      marginBottom: "16px",
    },
    detailsBox: {
      padding: "12px",
      backgroundColor: "#fff5f5",
      borderLeft: "4px solid #e53e3e",
      fontFamily: "monospace",
      fontSize: "14px",
      overflowX: "auto",
      margin: "16px 0",
    },
    button: {
      backgroundColor: "#4299e1",
      color: "white",
      border: "none",
      padding: "8px 16px",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "500",
    },
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>
        Something went wrong {componentName ? `in ${componentName}` : ""}
      </h3>

      <p style={styles.text}>
        We're sorry, but an error occurred while rendering this component. You
        can try refreshing the page or resetting the component below.
      </p>

      {showDetails && error && (
        <div style={styles.detailsBox}>
          <strong>Error:</strong> {error.toString()}
        </div>
      )}

      <div style={{ marginTop: "16px" }}>
        <button onClick={resetError} style={styles.button}>
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorBoundary;

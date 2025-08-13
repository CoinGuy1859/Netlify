import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import DiscoveryPlaceMembershipCalculator from "./App";
import CenteredHeader from "./CenteredHeader"; // Import the header component
import ErrorBoundary from "./components/ErrorBoundary"; // Import the ErrorBoundary

// Create a wrapper component that adds Tailwind CSS classes to the body
const App = () => {
  // Add Tailwind classes to body on mount
  React.useEffect(() => {
    // Add base Tailwind classes to body
    document.body.classList.add("bg-gray-100", "font-sans", "antialiased");

    // Clean up on unmount
    return () => {
      document.body.classList.remove("bg-gray-100", "font-sans", "antialiased");
    };
  }, []);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <CenteredHeader />

        {/* Wrap the entire application with an ErrorBoundary */}
        <ErrorBoundary
          componentName="Application Root"
          showDetails={false}
          onError={(error) => {
            console.error("Critical application error:", error);
            // You could add more robust error reporting here
          }}
        >
          <DiscoveryPlaceMembershipCalculator />
        </ErrorBoundary>

        <footer className="text-center mt-12 text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} Discovery Place. All pricing and
            benefits are subject to change.
          </p>
        </footer>
      </div>
    </div>
  );
};

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

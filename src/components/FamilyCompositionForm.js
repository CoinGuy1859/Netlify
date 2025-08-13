// components/FamilyCompositionForm.js
import React, { useEffect } from "react";
import { PricingConfig } from "../pricing/pricing-module";
import Logos from "../components/Logos";
// Import the new utilities
import AccessibilityUtils from "../utils/AccessibilityUtils";
import ErrorHandling from "../utils/ErrorHandling";

/**
 * FamilyCompositionForm component
 * Collects information about family composition
 * Enhanced with improved accessibility and error handling
 */
const FamilyCompositionForm = ({
  adultCount,
  childrenCount,
  childAges,
  isRichmondResident,
  needsFlexibility,
  isWelcomeEligible,
  errors,
  onAdultCountChange,
  onChildrenCountChange,
  onChildAgeChange,
  onRichmondResidentChange,
  onFlexibilityChange,
  onWelcomeEligibleChange,
  onNextStep,
}) => {
  const MAX_ADULTS = PricingConfig.Constraints.MAX_ADULTS;
  const MAX_CHILDREN = PricingConfig.Constraints.MAX_CHILDREN;

  // Announce page load for screen readers
  useEffect(() => {
    AccessibilityUtils.announceToScreenReader(
      "Family composition form loaded. Enter information about your family members.",
      "polite"
    );

    // Set focus to the heading when first loaded
    AccessibilityUtils.focusElement("family-step-heading", {
      preventScroll: false,
      delay: 100,
    });

    // Set up keyboard shortcuts
    const handleKeyboardShortcuts = AccessibilityUtils.createKeyboardShortcuts({
      "Alt+n": onNextStep,
      "Alt+a": () => onAdultCountChange(Math.min(adultCount + 1, MAX_ADULTS)),
      "Alt+Shift+a": () => onAdultCountChange(Math.max(adultCount - 1, 1)),
      "Alt+c": () =>
        onChildrenCountChange(Math.min(childrenCount + 1, MAX_CHILDREN)),
      "Alt+Shift+c": () =>
        onChildrenCountChange(Math.max(childrenCount - 1, 0)),
    });

    window.addEventListener("keydown", handleKeyboardShortcuts);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyboardShortcuts);
    };
  }, [
    adultCount,
    childrenCount,
    MAX_ADULTS,
    MAX_CHILDREN,
    onAdultCountChange,
    onChildrenCountChange,
    onNextStep,
  ]);

  return (
    <section
      className="step-container"
      role="form"
      aria-labelledby="family-step-heading"
      style={{
        backgroundColor: "#fff",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        border: "1px solid #e2e8f0",
      }}
    >
      <FormHeader />

      <AdultCountSelector
        adultCount={adultCount}
        maxAdults={MAX_ADULTS}
        onAdultCountChange={onAdultCountChange}
      />

      <ChildrenCountSelector
        childrenCount={childrenCount}
        maxChildren={MAX_CHILDREN}
        onChildrenCountChange={onChildrenCountChange}
      />

      {childrenCount > 0 && (
        <ChildAgesInput
          childrenCount={childrenCount}
          childAges={childAges}
          errors={errors}
          onChildAgeChange={onChildAgeChange}
        />
      )}

      <SpecialOptions
        needsFlexibility={needsFlexibility}
        isRichmondResident={isRichmondResident}
        isWelcomeEligible={isWelcomeEligible}
        onFlexibilityChange={onFlexibilityChange}
        onRichmondResidentChange={onRichmondResidentChange}
        onWelcomeEligibleChange={onWelcomeEligibleChange}
      />

      <NavigationButtons onNextStep={onNextStep} />

      {/* Keyboard shortcuts help - hidden by default */}
      <div className="sr-only" id="keyboard-shortcuts">
        <h3>Keyboard Shortcuts</h3>
        <ul>
          <li>Alt+N: Continue to next step</li>
          <li>Alt+A: Increase adult count</li>
          <li>Alt+Shift+A: Decrease adult count</li>
          <li>Alt+C: Increase children count</li>
          <li>Alt+Shift+C: Decrease children count</li>
        </ul>
      </div>

      {/* Add a button to show keyboard shortcuts */}
      <div style={{ textAlign: "center", marginTop: "16px" }}>
        <button
          type="button"
          className="keyboard-shortcuts-toggle"
          onClick={() => {
            const shortcutsDialog = document.getElementById(
              "keyboard-shortcuts-dialog"
            );
            if (shortcutsDialog) {
              shortcutsDialog.showModal();
            }
          }}
          style={{
            background: "none",
            border: "none",
            color: "#4299e1",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Show Keyboard Shortcuts
        </button>
      </div>

      {/* Dialog for keyboard shortcuts */}
      <dialog
        id="keyboard-shortcuts-dialog"
        style={{
          padding: "24px",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          maxWidth: "400px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Keyboard Shortcuts</h3>
        <ul>
          <li>Alt+N: Continue to next step</li>
          <li>Alt+A: Increase adult count</li>
          <li>Alt+Shift+A: Decrease adult count</li>
          <li>Alt+C: Increase children count</li>
          <li>Alt+Shift+C: Decrease children count</li>
        </ul>
        <div style={{ textAlign: "right", marginTop: "16px" }}>
          <button
            onClick={() => {
              const shortcutsDialog = document.getElementById(
                "keyboard-shortcuts-dialog"
              );
              if (shortcutsDialog) {
                shortcutsDialog.close();
              }
            }}
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              backgroundColor: "#4299e1",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </dialog>
    </section>
  );
};

/**
 * Form Header Component
 */
const FormHeader = () => (
  <div style={{ marginBottom: "30px", textAlign: "center" }}>
    <div className="header-logo" style={{ marginBottom: "20px" }}>
      <Logos.MainHeader />
    </div>

    <h2
      id="family-step-heading"
      tabIndex="-1"
      style={{
        fontSize: "24px",
        fontWeight: "600",
        color: "#1a202c",
        margin: "0 0 10px 0",
      }}
    >
      Tell Us About Your Family
    </h2>
    <p
      className="step-description"
      style={{
        color: "#4a5568",
        fontSize: "16px",
        marginTop: "0",
      }}
    >
      Help us understand your family's composition so we can find the right
      membership option for you.
    </p>
  </div>
);

/**
 * Adult Count Selector Component - Improved with ARIA attributes
 */
const AdultCountSelector = ({ adultCount, maxAdults, onAdultCountChange }) => {
  // Create unique IDs for accessibility
  const groupId = "adult-count-group";
  const labelId = "adult-count-label";
  const descriptionId = "adult-count-description";
  const valueId = "adultCount";

  return (
    <div
      className="form-group"
      style={{
        marginBottom: "30px",
        backgroundColor: "#f8fafc",
        padding: "24px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
      }}
      role="group"
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
      id={groupId}
    >
      <label
        id={labelId}
        htmlFor={valueId}
        style={{
          display: "block",
          fontSize: "18px",
          fontWeight: "600",
          color: "#1a202c",
          marginBottom: "16px",
        }}
      >
        How many adults (14+) are in your family?
      </label>
      <div
        className="number-input"
        role="spinbutton"
        aria-valuemin="1"
        aria-valuemax={maxAdults}
        aria-valuenow={adultCount}
        aria-valuetext={`${adultCount} adult${adultCount !== 1 ? "s" : ""}`}
      >
        <button
          onClick={() => onAdultCountChange(adultCount - 1)}
          className="number-btn"
          aria-label="Decrease adult count"
          disabled={adultCount <= 1}
        >
          −
        </button>
        <span id={valueId} aria-live="polite">
          {adultCount}
        </span>
        <button
          onClick={() => onAdultCountChange(adultCount + 1)}
          className="number-btn"
          aria-label="Increase adult count"
          disabled={adultCount >= maxAdults}
        >
          +
        </button>
      </div>
      <div id={descriptionId} className="sr-only">
        Select the number of adults (ages 14 and older) who will be included in
        your membership. The minimum is 1 and the maximum is {maxAdults}.
      </div>
    </div>
  );
};

/**
 * Children Count Selector Component - Improved with ARIA attributes
 */
const ChildrenCountSelector = ({
  childrenCount,
  maxChildren,
  onChildrenCountChange,
}) => {
  // Create unique IDs for accessibility
  const groupId = "children-count-group";
  const labelId = "children-count-label";
  const descriptionId = "children-count-description";
  const valueId = "childrenCount";

  return (
    <div
      className="form-group"
      style={{
        marginBottom: "30px",
        backgroundColor: "#f8fafc",
        padding: "24px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
      }}
      role="group"
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
      id={groupId}
    >
      <label
        id={labelId}
        htmlFor={valueId}
        style={{
          display: "block",
          fontSize: "18px",
          fontWeight: "600",
          color: "#1a202c",
          marginBottom: "16px",
        }}
      >
        How many children (0-13) are in your family?
      </label>
      <div
        className="number-input"
        role="spinbutton"
        aria-valuemin="0"
        aria-valuemax={maxChildren}
        aria-valuenow={childrenCount}
        aria-valuetext={`${childrenCount} ${
          childrenCount === 1 ? "child" : "children"
        }`}
      >
        <button
          onClick={() => onChildrenCountChange(childrenCount - 1)}
          className="number-btn"
          aria-label="Decrease children count"
          disabled={childrenCount <= 0}
        >
          −
        </button>
        <span id={valueId} aria-live="polite">
          {childrenCount}
        </span>
        <button
          onClick={() => onChildrenCountChange(childrenCount + 1)}
          className="number-btn"
          aria-label="Increase children count"
          disabled={childrenCount >= maxChildren}
        >
          +
        </button>
      </div>
      <div id={descriptionId} className="sr-only">
        Select the number of children (ages 0 to 13) who will be included in
        your membership. The minimum is 0 and the maximum is {maxChildren}.
      </div>
    </div>
  );
};

/**
 * Child Ages Input Component - Improved with ARIA attributes and error handling
 */
const ChildAgesInput = ({
  childrenCount,
  childAges,
  errors,
  onChildAgeChange,
}) => {
  // Create unique IDs for accessibility
  const fieldsetId = "child-ages-fieldset";
  const legendId = "child-ages-legend";

  return (
    <div
      className="form-group"
      style={{
        marginBottom: "30px",
        backgroundColor: "#f8fafc",
        padding: "24px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
      }}
    >
      <fieldset
        id={fieldsetId}
        style={{ border: "none", margin: "0", padding: "0" }}
      >
        <legend
          id={legendId}
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#1a202c",
            marginBottom: "16px",
            padding: "0",
          }}
        >
          How old are your children?
        </legend>
        {childAges.slice(0, childrenCount).map((age, index) => (
          <ChildAgeInput
            key={index}
            index={index}
            age={age}
            error={errors.childAges[index]}
            onChildAgeChange={onChildAgeChange}
          />
        ))}
        <div className="sr-only" id="child-ages-help">
          Enter the age of each child. Ages must be between 0 and 17. Children
          under 1 are free at all locations. Children 1-2 are free at Science
          but need a spot at Kids locations.
        </div>
      </fieldset>
    </div>
  );
};

/**
 * Individual Child Age Input Component - Improved with ARIA attributes and error handling
 */
const ChildAgeInput = ({ index, age, error, onChildAgeChange }) => {
  // Create unique IDs for accessibility
  const inputId = `child-age-${index}`;
  const labelId = `child-age-label-${index}`;
  const errorId = `child-age-error-${index}`;
  const noteId = `child-age-note-${index}`;

  return (
    <div
      className="child-age"
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "16px",
        flexWrap: "wrap",
      }}
    >
      <label
        id={labelId}
        htmlFor={inputId}
        style={{
          fontWeight: "500",
          color: "#2d3748",
          marginRight: "12px",
          width: "80px",
        }}
      >
        Child {index + 1}:
      </label>
      <input
        id={inputId}
        type="number"
        min="0"
        max="17"
        value={age}
        onChange={(e) => {
          const newValue = e.target.value === "" ? "" : Number(e.target.value);
          onChildAgeChange(index, newValue);
        }}
        aria-label={`Age of child ${index + 1}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : noteId}
        className={error ? "error-input" : ""}
        style={{
          width: "70px",
          padding: "10px",
          fontSize: "16px",
          borderRadius: "6px",
          border: error ? "2px solid #e53e3e" : "1px solid #cbd5e1",
          backgroundColor: error ? "#fff5f5" : "#fff",
          textAlign: "center",
        }}
      />
      <span
        id={noteId}
        className="age-note"
        style={{
          fontSize: "14px",
          color: "#718096",
          marginLeft: "12px",
          fontStyle: "italic",
          flexGrow: "1",
          marginTop: window.innerWidth <= 640 ? "8px" : "0",
        }}
      >
        {age < 1
          ? "Free at all locations"
          : age < 2
          ? "Free at Discovery Place Science"
          : "Needs membership at all locations"}
      </span>
      {error && (
        <div
          id={errorId}
          className="error-message"
          role="alert"
          aria-live="assertive"
          style={{
            color: "#e53e3e",
            fontSize: "14px",
            fontWeight: "500",
            marginTop: "4px",
            marginLeft: "92px",
            width: "100%",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

/**
 * Special Options Component - Improved with ARIA attributes
 */
const SpecialOptions = ({
  needsFlexibility,
  isRichmondResident,
  isWelcomeEligible,
  onFlexibilityChange,
  onRichmondResidentChange,
  onWelcomeEligibleChange,
}) => {
  // Create unique IDs for accessibility
  const sectionId = "special-options-section";
  const headingId = "special-options-heading";

  return (
    <div
      id={sectionId}
      style={{
        marginBottom: "30px",
        backgroundColor: "#f8fafc",
        padding: "24px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
      }}
      role="region"
      aria-labelledby={headingId}
    >
      <h3
        id={headingId}
        style={{
          fontSize: "18px",
          fontWeight: "600",
          color: "#1a202c",
          marginBottom: "16px",
          margin: "0 0 16px 0",
        }}
      >
        Special Options & Eligibility
      </h3>

      <CheckboxOption
        id="needsFlexibility"
        label="Different adults will take children on different days"
        checked={needsFlexibility}
        onChange={onFlexibilityChange}
        helpText="Check this if you need the flexibility for different adults to visit with children on different days."
      />

      <CheckboxOption
        id="isRichmondResident"
        label="Richmond County resident"
        checked={isRichmondResident}
        onChange={onRichmondResidentChange}
        helpText="Check this if you are a Richmond County resident for special pricing at Kids-Rockingham."
      />

      <CheckboxOption
        id="isWelcomeEligible"
        label="NC/SC EBT or WIC cardholder (Welcome Program)"
        checked={isWelcomeEligible}
        onChange={onWelcomeEligibleChange}
        helpText="Check this if you are a North Carolina or South Carolina EBT/WIC recipient to see Welcome Program options."
      />
    </div>
  );
};

/**
 * Reusable Checkbox Option Component - Improved with ARIA attributes
 */
const CheckboxOption = ({ id, label, checked, onChange, helpText }) => {
  // Create unique IDs for accessibility
  const helpId = `${id}-help`;

  return (
    <div className="form-group checkbox" style={{ marginBottom: "16px" }}>
      <label
        htmlFor={id}
        style={{
          display: "flex",
          alignItems: "flex-start",
          cursor: "pointer",
        }}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-describedby={helpId}
          style={{
            width: "22px",
            height: "22px",
            marginRight: "12px",
            marginTop: "2px",
            accentColor: "#3182ce",
            cursor: "pointer",
          }}
        />
        <span style={{ fontSize: "16px", color: "#2d3748" }}>{label}</span>
      </label>
      <div
        className="checkbox-help"
        id={helpId}
        style={{
          fontSize: "14px",
          color: "#718096",
          marginTop: "5px",
          marginLeft: "34px",
        }}
      >
        {helpText}
      </div>
    </div>
  );
};

/**
 * Navigation Buttons Component - Improved with ARIA attributes
 */
const NavigationButtons = ({ onNextStep }) => (
  <div className="button-group">
    <button
      onClick={onNextStep}
      className="primary-button"
      aria-label="Continue to step 2: Your Visits"
      style={{
        width: "100%",
        maxWidth: "400px",
        margin: "0 auto",
        fontSize: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      Continue to Your Visits
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginLeft: "8px" }}
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </button>
  </div>
);

export default FamilyCompositionForm;

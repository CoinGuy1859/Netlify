// components/FamilyCompositionForm.js
import React, { useEffect } from "react";
import { PricingConfig } from "../pricing/pricing-module";
import Logos from "../components/Logos";
// Import the new utilities if you have them
// import AccessibilityUtils from "../utils/AccessibilityUtils";
// import ErrorHandling from "../utils/ErrorHandling";

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
  discountType, // ADD THIS NEW PROP
  errors,
  onAdultCountChange,
  onChildrenCountChange,
  onChildAgeChange,
  onRichmondResidentChange,
  onFlexibilityChange,
  onWelcomeEligibleChange,
  onDiscountTypeChange, // ADD THIS NEW HANDLER
  onNextStep,
}) => {
  const MAX_ADULTS = PricingConfig.Constraints.MAX_ADULTS;
  const MAX_CHILDREN = PricingConfig.Constraints.MAX_CHILDREN;

  // Announce page load for screen readers
  useEffect(() => {
    // If you have AccessibilityUtils, uncomment:
    // AccessibilityUtils.announceToScreenReader(
    //   "Family composition form loaded. Enter information about your family members."
    // );
  }, []);

  return (
    <section
      aria-labelledby="family-step-heading"
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
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
        <ChildAgeInputs
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

      <SpecialDiscountSection 
        discountType={discountType}
        onDiscountTypeChange={onDiscountTypeChange}
      />

      <NavigationButtons onNextStep={onNextStep} />
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
 * Adult Count Selector Component
 */
const AdultCountSelector = ({ adultCount, maxAdults, onAdultCountChange }) => {
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
      <label
        htmlFor="adultCount"
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
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <button
          onClick={() => onAdultCountChange(Math.max(1, adultCount - 1))}
          className="number-btn"
          aria-label="Decrease adult count"
          disabled={adultCount <= 1}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            backgroundColor: adultCount <= 1 ? "#f7fafc" : "#fff",
            cursor: adultCount <= 1 ? "not-allowed" : "pointer",
            fontSize: "20px",
          }}
        >
          −
        </button>
        <span
          id="adultCount"
          style={{
            fontSize: "24px",
            fontWeight: "600",
            minWidth: "40px",
            textAlign: "center",
          }}
        >
          {adultCount}
        </span>
        <button
          onClick={() => onAdultCountChange(Math.min(maxAdults, adultCount + 1))}
          className="number-btn"
          aria-label="Increase adult count"
          disabled={adultCount >= maxAdults}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            backgroundColor: adultCount >= maxAdults ? "#f7fafc" : "#fff",
            cursor: adultCount >= maxAdults ? "not-allowed" : "pointer",
            fontSize: "20px",
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};

/**
 * Children Count Selector Component
 */
const ChildrenCountSelector = ({
  childrenCount,
  maxChildren,
  onChildrenCountChange,
}) => {
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
      <label
        htmlFor="childrenCount"
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
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <button
          onClick={() => onChildrenCountChange(Math.max(0, childrenCount - 1))}
          className="number-btn"
          aria-label="Decrease children count"
          disabled={childrenCount <= 0}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            backgroundColor: childrenCount <= 0 ? "#f7fafc" : "#fff",
            cursor: childrenCount <= 0 ? "not-allowed" : "pointer",
            fontSize: "20px",
          }}
        >
          −
        </button>
        <span
          id="childrenCount"
          style={{
            fontSize: "24px",
            fontWeight: "600",
            minWidth: "40px",
            textAlign: "center",
          }}
        >
          {childrenCount}
        </span>
        <button
          onClick={() => onChildrenCountChange(Math.min(maxChildren, childrenCount + 1))}
          className="number-btn"
          aria-label="Increase children count"
          disabled={childrenCount >= maxChildren}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            backgroundColor: childrenCount >= maxChildren ? "#f7fafc" : "#fff",
            cursor: childrenCount >= maxChildren ? "not-allowed" : "pointer",
            fontSize: "20px",
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};

/**
 * Child Age Inputs Component
 */
const ChildAgeInputs = ({
  childrenCount,
  childAges,
  errors,
  onChildAgeChange,
}) => {
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
      <fieldset>
        <legend
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#1a202c",
            marginBottom: "16px",
          }}
        >
          Ages of Children
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
      </fieldset>
    </div>
  );
};

/**
 * Individual Child Age Input Component
 */
const ChildAgeInput = ({ index, age, error, onChildAgeChange }) => {
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
        htmlFor={`child-age-${index}`}
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
        id={`child-age-${index}`}
        type="number"
        min="0"
        max="17"
        value={age}
        onChange={(e) => {
          const newValue = e.target.value === "" ? "" : Number(e.target.value);
          onChildAgeChange(index, newValue);
        }}
        aria-label={`Age of child ${index + 1}`}
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
        className="age-note"
        style={{
          fontSize: "14px",
          color: "#718096",
          marginLeft: "12px",
          fontStyle: "italic",
          flexGrow: "1",
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
          className="error-message"
          role="alert"
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
 * Special Options Component
 */
const SpecialOptions = ({
  needsFlexibility,
  isRichmondResident,
  isWelcomeEligible,
  onFlexibilityChange,
  onRichmondResidentChange,
  onWelcomeEligibleChange,
}) => {
  return (
    <div
      style={{
        marginBottom: "30px",
        backgroundColor: "#f8fafc",
        padding: "24px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
      }}
    >
      <h3
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
 * Special Discount Section Component - NEW COMPONENT
 */
const SpecialDiscountSection = ({ discountType, onDiscountTypeChange }) => {
  return (
    <div 
      className="special-discounts" 
      style={{ 
        marginBottom: "30px",
        backgroundColor: "#f8fafc",
        padding: "24px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
      }}
    >
      <h3 style={{ 
        fontSize: "18px", 
        fontWeight: "600",
        color: "#1a202c",
        marginTop: "0",
        marginBottom: "16px" 
      }}>
        Special Discounts
      </h3>
      
      <div style={{ marginBottom: "15px" }}>
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            cursor: "pointer",
          }}
        >
          <input
            type="radio"
            name="discountType"
            value="educator"
            checked={discountType === 'educator'}
            onChange={(e) => onDiscountTypeChange(e.target.checked ? 'educator' : null)}
            style={{ marginRight: "12px", marginTop: "4px" }}
          />
          <div>
            <div style={{ fontWeight: "500", color: "#2d3748" }}>Educator Discount</div>
            <div style={{ fontSize: "14px", color: "#718096", marginTop: "2px" }}>
              $20 off membership for educators (verification required)
            </div>
          </div>
        </label>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            cursor: "pointer",
          }}
        >
          <input
            type="radio"
            name="discountType"
            value="military"
            checked={discountType === 'military'}
            onChange={(e) => onDiscountTypeChange(e.target.checked ? 'military' : null)}
            style={{ marginRight: "12px", marginTop: "4px" }}
          />
          <div>
            <div style={{ fontWeight: "500", color: "#2d3748" }}>Military/Veteran Discount</div>
            <div style={{ fontSize: "14px", color: "#718096", marginTop: "2px" }}>
              $20 off membership (Science/DPKH), $30 off (Rockingham) - verification required
            </div>
          </div>
        </label>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            cursor: "pointer",
          }}
        >
          <input
            type="radio"
            name="discountType"
            value=""
            checked={!discountType}
            onChange={() => onDiscountTypeChange(null)}
            style={{ marginRight: "12px", marginTop: "4px" }}
          />
          <div>
            <div style={{ fontWeight: "500", color: "#2d3748" }}>No Special Discount</div>
            <div style={{ fontSize: "14px", color: "#718096", marginTop: "2px" }}>
              Continue without special discount
            </div>
          </div>
        </label>
      </div>

      {discountType && (
        <div
          style={{
            backgroundColor: "#e6fffa",
            border: "1px solid #81e6d9",
            borderRadius: "6px",
            padding: "12px",
            marginTop: "10px",
            fontSize: "14px",
          }}
        >
          <strong>
            {discountType === 'educator' ? 'Educator' : 'Military/Veteran'} discount selected
          </strong>
          <br />
          You'll receive ${discountType === 'military' ? '20-30' : '20'} off your membership.
          Please have your {discountType === 'educator' ? 'educator credentials' : 'military/veteran ID'} ready when purchasing.
        </div>
      )}
    </div>
  );
};

/**
 * Reusable Checkbox Option Component
 */
const CheckboxOption = ({ id, label, checked, onChange, helpText }) => {
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
 * Navigation Buttons Component
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
        backgroundColor: "#3182ce",
        color: "white",
        padding: "12px 24px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
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

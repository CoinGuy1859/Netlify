# Discovery Place Membership Calculator Components

This document provides an overview of the key components in the Discovery Place Membership Calculator application, explaining their purpose, props, and usage patterns.

## Table of Contents

1. [Core Components](#core-components)
   - [DiscoveryPlaceMembershipCalculator](#discoveryplacemembershipcalculator)
   - [MembershipTools](#membershiptools)
   - [ProgressBar](#progressbar)

2. [Form Components](#form-components)
   - [FamilyCompositionForm](#familycompositionform)
   - [VisitFrequencyForm](#visitfrequencyform)

3. [Calculation Components](#calculation-components)
   - [MembershipRecommendation](#membershiprecommendation)
   - [DetailedAdmissionComparison](#detailedadmissioncomparison)
   - [SavingsBreakdown](#savingsbreakdown)
   - [PricingDisplay](#pricingdisplay)

4. [Decision Tree Components](#decision-tree-components)
   - [MembershipDecisionTree](#membershipdecisiontree)

5. [Visualization Components](#visualization-components)
   - [VisitPatternVisualization](#visitpatternvisualization)
   - [MembershipComparator](#membershipcomparator)

6. [Utility Components](#utility-components)
   - [CopyToClipboard](#copytoclipboard)
   - [PrintMembershipInfo](#printmembershipinfo)
   - [ErrorBoundary](#errorboundary)

7. [UI Components](#ui-components)
   - [PromotionBanner](#promotionbanner)
   - [EligibilityInfo](#eligibilityinfo)
   - [SavingsHighlight](#savingshighlight)
   - [WelcomeNotification](#welcomenotification)
   - [SituationBreakdown](#situationbreakdown)

---

## Core Components

### DiscoveryPlaceMembershipCalculator

**Purpose**: Main application component that orchestrates the entire membership calculator experience.

**Props**: None - this is the root component.

**State Management**: Uses `useReducer` to manage the application state, including:
- Current step (family, visits, recommendation)
- Family composition data
- Visit frequency data
- Special considerations
- Calculated recommendation

**Usage Example**:
```jsx
import React from 'react';
import DiscoveryPlaceMembershipCalculator from './App';

const App = () => {
  return (
    <div className="app-container">
      <DiscoveryPlaceMembershipCalculator />
    </div>
  );
};
```

### MembershipTools

**Purpose**: Container component that provides UI for switching between Quick Quiz and Detailed Calculator modes.

**Props**:
- `currentStep` - Current step in the calculation process
- Form-related props for family composition and visit frequency
- Handler functions for updates

**Usage Example**:
```jsx
<MembershipTools
  currentStep={currentStep}
  adultCount={adultCount}
  childrenCount={childrenCount}
  // Additional props...
  onNextStep={handleNextStep}
  onPrevStep={handlePrevStep}
/>
```

### ProgressBar

**Purpose**: Displays the multi-step progress indicator for the membership calculator.

**Props**:
- `currentStep` - Number indicating the current active step

**Usage Example**:
```jsx
<ProgressBar currentStep={2} />
```

---

## Form Components

### FamilyCompositionForm

**Purpose**: Collects information about the user's family composition, including adults, children, and special eligibility.

**Props**:
- `adultCount` - Number of adults
- `childrenCount` - Number of children
- `childAges` - Array of child ages
- `isRichmondResident` - Boolean flag
- `needsFlexibility` - Boolean flag
- `isWelcomeEligible` - Boolean flag
- Handler functions for updates

**Usage Example**:
```jsx
<FamilyCompositionForm
  adultCount={2}
  childrenCount={3}
  childAges={[4, 7, 10]}
  isRichmondResident={false}
  needsFlexibility={true}
  isWelcomeEligible={false}
  errors={{childAges: ["", "", ""]}}
  onAdultCountChange={handleAdultCountChange}
  // Additional handler props...
  onNextStep={handleNextStep}
/>
```

### VisitFrequencyForm

**Purpose**: Collects information about how often the user plans to visit different Discovery Place locations.

**Props**:
- `scienceVisits` - Number of visits to Science location
- `dpkhVisits` - Number of visits to Kids-Huntersville
- `dpkrVisits` - Number of visits to Kids-Rockingham
- `includeParking` - Whether to include parking costs
- Handler functions for updates

**Usage Example**:
```jsx
<VisitFrequencyForm
  scienceVisits={5}
  dpkhVisits={3}
  dpkrVisits={0}
  includeParking={true}
  onScienceVisitsChange={handleScienceVisitsChange}
  // Additional handler props...
  onNextStep={handleNextStep}
  onPrevStep={handlePrevStep}
/>
```

---

## Calculation Components

### MembershipRecommendation

**Purpose**: Displays the recommended membership option based on the user's inputs, with detailed cost information.

**Props**:
- `recommendation` - Recommendation object with pricing and membership details
- `formatCurrency` - Function to format currency values
- Visit and family data props

**Usage Example**:
```jsx
<MembershipRecommendation
  recommendation={membershipRecommendation}
  formatCurrency={formatCurrency}
  scienceVisits={5}
  dpkhVisits={3}
  dpkrVisits={0}
  adultCount={2}
  childAges={[4, 7]}
  isRichmondResident={false}
  includeParking={true}
/>
```

### DetailedAdmissionComparison

**Purpose**: Shows a detailed comparison between regular admission costs and membership costs.

**Props**:
- `recommendation` - Recommendation object
- Visit and family data props
- `formatCurrency` - Function to format currency values

**Usage Example**:
```jsx
<DetailedAdmissionComparison
  recommendation={recommendation}
  scienceVisits={5}
  dpkhVisits={3}
  dpkrVisits={0}
  adultCount={2}
  childAges={[4, 7]}
  isRichmondResident={false}
  includeParking={true}
  formatCurrency={formatCurrency}
/>
```

### SavingsBreakdown

**Purpose**: Shows a breakdown of the savings compared to regular admission.

**Props**:
- `breakdown` - Cost breakdown object
- `formatCurrency` - Function to format currency values
- `regularAdmissionCost` - Regular admission cost
- `totalMembershipCost` - Total membership cost

**Usage Example**:
```jsx
<SavingsBreakdown
  breakdown={recommendation.costBreakdown}
  formatCurrency={formatCurrency}
  regularAdmissionCost={recommendation.regularAdmissionCost}
  totalMembershipCost={totalPrice}
/>
```

### PricingDisplay

**Purpose**: Displays pricing information for the recommended membership.

**Props**:
- `recommendation` - Recommendation object
- `formatCurrency` - Function to format currency values
- `getTotalPrice` - Function to calculate total price

**Usage Example**:
```jsx
<PricingDisplay
  recommendation={recommendation}
  formatCurrency={formatCurrency}
  getTotalPrice={getTotalPrice}
/>
```

---

## Decision Tree Components

### MembershipDecisionTree

**Purpose**: Provides a guided quiz approach to help users find the best membership option.

**Props**:
- `formatCurrency` - Function to format currency values
- `recommendation` - (Optional) Recommendation object for comparison

**Usage Example**:
```jsx
<MembershipDecisionTree
  formatCurrency={formatCurrency}
  recommendation={membershipRecommendation}
/>
```

---

## Visualization Components

### VisitPatternVisualization

**Purpose**: Visualizes the user's visit patterns across different locations.

**Props**:
- `scienceVisits` - Number of visits to Science location
- `dpkhVisits` - Number of visits to Kids-Huntersville
- `dpkrVisits` - Number of visits to Kids-Rockingham
- `recommendation` - Recommendation object

**Usage Example**:
```jsx
<VisitPatternVisualization
  scienceVisits={5}
  dpkhVisits={3}
  dpkrVisits={0}
  recommendation={membershipRecommendation}
/>
```

### MembershipComparator

**Purpose**: Provides a side-by-side comparison of different membership options.

**Props**:
- `recommendation` - Recommendation object
- `formatCurrency` - Function to format currency values
- `totalVisits` - Total number of visits

**Usage Example**:
```jsx
<MembershipComparator
  recommendation={recommendation}
  formatCurrency={formatCurrency}
  totalVisits={8}
/>
```

---

## Utility Components

### CopyToClipboard

**Purpose**: Formats and copies membership recommendation data to the clipboard.

**Props**:
- `results` - Recommendation object
- `formatCurrency` - Function to format currency values

**Usage Example**:
```jsx
<CopyToClipboard
  results={recommendation}
  formatCurrency={formatCurrency}
/>
```

### PrintMembershipInfo

**Purpose**: Provides a printable version of the membership recommendation.

**Props**:
- `recommendation` - Recommendation object
- `formatCurrency` - Function to format currency values

**Usage Example**:
```jsx
<PrintMembershipInfo
  recommendation={recommendation}
  formatCurrency={formatCurrency}
/>
```

### ErrorBoundary

**Purpose**: Catches JavaScript errors in child components to prevent app crashes.

**Props**:
- `componentName` - Name of the wrapped component (for error messages)
- `fallback` - Custom fallback UI component
- `showDetails` - Whether to show detailed error information
- `onError` - Error callback function
- `children` - Components to wrap

**Usage Example**:
```jsx
<ErrorBoundary componentName="MembershipCalculator" showDetails={false}>
  <MembershipRecommendation recommendation={recommendation} />
</ErrorBoundary>
```

---

## UI Components

### PromotionBanner

**Purpose**: Displays a promotional banner for current discounts and special offers.

**Props**: None - reads from PricingConfig

**Usage Example**:
```jsx
<PromotionBanner />
```

### EligibilityInfo

**Purpose**: Displays information about discount eligibility.

**Props**:
- `recommendation` - Recommendation object

**Usage Example**:
```jsx
<EligibilityInfo recommendation={recommendation} />
```

### SavingsHighlight

**Purpose**: Displays savings information compared to regular admission.

**Props**:
- `recommendation` - Recommendation object
- `formatCurrency` - Function to format currency values

**Usage Example**:
```jsx
<SavingsHighlight
  recommendation={recommendation}
  formatCurrency={formatCurrency}
/>
```

### WelcomeNotification

**Purpose**: Displays information about the Welcome Program alternative.

**Props**:
- `welcomeOption` - Welcome Program option object
- `formatCurrency` - Function to format currency values

**Usage Example**:
```jsx
<WelcomeNotification
  welcomeOption={recommendation.welcomeProgramOption}
  formatCurrency={formatCurrency}
/>
```

### SituationBreakdown

**Purpose**: Displays information about different membership options based on visit frequency.

**Props**:
- `primaryLocationIcon` - Icon type for the primary location

**Usage Example**:
```jsx
<SituationBreakdown primaryLocationIcon="science" />
```

---

## Using Components with Error Boundaries

To enhance error handling, wrap complex components with ErrorBoundary:

```jsx
import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import MembershipRecommendation from './components/MembershipRecommendation';

const App = ({ recommendation, formatCurrency }) => {
  return (
    <div>
      <ErrorBoundary componentName="Membership Recommendation" showDetails={false}>
        <MembershipRecommendation
          recommendation={recommendation}
          formatCurrency={formatCurrency}
          // Additional props...
        />
      </ErrorBoundary>
    </div>
  );
};
```

## Component Testing

Most components can be tested using React Testing Library. Example test structure:

```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MembershipRecommendation from './MembershipRecommendation';

describe('MembershipRecommendation', () => {
  const mockRecommendation = {
    // Mock recommendation data...
  };
  
  const formatCurrency = (amount) => `$${amount}`;
  
  test('renders component correctly', () => {
    render(
      <MembershipRecommendation
        recommendation={mockRecommendation}
        formatCurrency={formatCurrency}
        // Additional props...
      />
    );
    
    // Test assertions...
    expect(screen.getByText(/your personalized recommendation/i)).toBeInTheDocument();
  });
  
  // Additional tests...
});
```
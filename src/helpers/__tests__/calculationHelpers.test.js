// src/helpers/__tests__/calculationHelpers.test.js

import {
  formatCurrency,
  calculateSavingsPercentage,
  calculateTotalPrice,
  findBestValueOption,
  capValue,
  areAllValid,
  groupBy,
  getPropSafely,
} from "../calculationHelpers";

describe("formatCurrency", () => {
  test("formats numbers correctly", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
    expect(formatCurrency(1000)).toBe("$1,000");
    expect(formatCurrency(0)).toBe("$0");
  });

  test("handles invalid inputs", () => {
    expect(formatCurrency(null)).toBe("$0");
    expect(formatCurrency(undefined)).toBe("$0");
    expect(formatCurrency("not a number")).toBe("$0");
  });

  test("respects the includeSymbol parameter", () => {
    expect(formatCurrency(100, false)).toBe("100");
    expect(formatCurrency(1234.56, false)).toBe("1,234.56");
  });

  test("caps at maximum value", () => {
    expect(formatCurrency(999999)).toBe("$100,000");
  });
});

describe("calculateSavingsPercentage", () => {
  test("calculates correct percentage", () => {
    expect(calculateSavingsPercentage(25, 100)).toBe(25);
    expect(calculateSavingsPercentage(50, 100)).toBe(50);
    expect(calculateSavingsPercentage(75, 100)).toBe(75);
  });

  test("rounds to nearest integer", () => {
    expect(calculateSavingsPercentage(33.33, 100)).toBe(33);
    expect(calculateSavingsPercentage(66.66, 100)).toBe(67);
  });

  test("caps at maxPercent", () => {
    expect(calculateSavingsPercentage(95, 100)).toBe(90); // Default max is 90
    expect(calculateSavingsPercentage(95, 100, 80)).toBe(80);
  });

  test("handles invalid inputs", () => {
    expect(calculateSavingsPercentage(0, 100)).toBe(0);
    expect(calculateSavingsPercentage(50, 0)).toBe(0);
    expect(calculateSavingsPercentage(null, 100)).toBe(0);
    expect(calculateSavingsPercentage(50, null)).toBe(0);
  });
});

describe("calculateTotalPrice", () => {
  test("calculates total price correctly", () => {
    const costs = {
      baseCost: 100,
      additionalCosts: [
        { description: "Fee 1", cost: 10 },
        { description: "Fee 2", cost: 20 },
      ],
      discounts: [{ description: "Promo", amount: 15 }],
    };

    expect(calculateTotalPrice(costs)).toBe(115); // 100 + 10 + 20 - 15
  });

  test("handles missing properties", () => {
    expect(calculateTotalPrice({ baseCost: 100 })).toBe(100);
    expect(calculateTotalPrice({ additionalCosts: [{ cost: 50 }] })).toBe(50);
    expect(calculateTotalPrice({})).toBe(0);
    expect(calculateTotalPrice(null)).toBe(0);
  });

  test("handles tax calculation", () => {
    const costs = {
      baseCost: 100,
      taxRate: 0.07, // 7% tax
    };

    expect(calculateTotalPrice(costs)).toBe(107);
  });

  test("never returns negative values", () => {
    const costs = {
      baseCost: 50,
      discounts: [{ amount: 100 }], // Discount greater than total
    };

    expect(calculateTotalPrice(costs)).toBe(0);
  });
});

describe("findBestValueOption", () => {
  test("finds the option with the best value ratio", () => {
    const options = [
      { name: "Option A", price: 100, value: 10 }, // Ratio: 10
      { name: "Option B", price: 150, value: 20 }, // Ratio: 7.5 (best)
      { name: "Option C", price: 200, value: 15 }, // Ratio: 13.33
    ];

    expect(findBestValueOption(options).name).toBe("Option B");
  });

  test("handles empty array", () => {
    expect(findBestValueOption([])).toBe(null);
  });

  test("handles non-array input", () => {
    expect(findBestValueOption(null)).toBe(null);
    expect(findBestValueOption(undefined)).toBe(null);
    expect(findBestValueOption({})).toBe(null);
  });

  test("handles zero value", () => {
    const options = [
      { name: "Option A", price: 100, value: 0 },
      { name: "Option B", price: 150, value: 10 },
    ];

    expect(findBestValueOption(options).name).toBe("Option B");
  });
});

describe("capValue", () => {
  test("caps values correctly", () => {
    expect(capValue(5, 0, 10)).toBe(5); // Within range
    expect(capValue(15, 0, 10)).toBe(10); // Above max
    expect(capValue(-5, 0, 10)).toBe(0); // Below min
  });

  test("handles string inputs", () => {
    expect(capValue("5", 0, 10)).toBe(5);
    expect(capValue("15", 0, 10)).toBe(10);
  });

  test("handles invalid inputs", () => {
    expect(capValue("not a number", 0, 10)).toBe(0);
    expect(capValue(null, 0, 10)).toBe(0);
    expect(capValue(undefined, 0, 10)).toBe(0);
  });
});

describe("areAllValid", () => {
  test("checks all elements with default validation", () => {
    expect(areAllValid([1, 2, 3])).toBe(true);
    expect(areAllValid([1, 0, 3])).toBe(false); // 0 is falsy
    expect(areAllValid([1, null, 3])).toBe(false);
    expect(areAllValid([1, undefined, 3])).toBe(false);
  });

  test("works with custom validation function", () => {
    const isPositive = (n) => typeof n === "number" && n > 0;

    expect(areAllValid([1, 2, 3], isPositive)).toBe(true);
    expect(areAllValid([1, 0, 3], isPositive)).toBe(false);
    expect(areAllValid([1, -1, 3], isPositive)).toBe(false);
  });

  test("handles non-array inputs", () => {
    expect(areAllValid(null)).toBe(false);
    expect(areAllValid(undefined)).toBe(false);
    expect(areAllValid({})).toBe(false);
    expect(areAllValid("string")).toBe(false);
  });
});

describe("groupBy", () => {
  test("groups array by property key", () => {
    const array = [
      { category: "A", value: 1 },
      { category: "B", value: 2 },
      { category: "A", value: 3 },
      { category: "C", value: 4 },
    ];

    const grouped = groupBy(array, "category");

    expect(grouped.A.length).toBe(2);
    expect(grouped.B.length).toBe(1);
    expect(grouped.C.length).toBe(1);
    expect(grouped.A[0].value).toBe(1);
    expect(grouped.A[1].value).toBe(3);
  });

  test("groups array by function", () => {
    const array = [1, 2, 3, 4, 5];
    const isEven = (n) => (n % 2 === 0 ? "even" : "odd");

    const grouped = groupBy(array, isEven);

    expect(grouped.even.length).toBe(2);
    expect(grouped.odd.length).toBe(3);
    expect(grouped.even).toEqual([2, 4]);
    expect(grouped.odd).toEqual([1, 3, 5]);
  });

  test("handles empty array", () => {
    expect(groupBy([], "key")).toEqual({});
  });

  test("handles non-array input", () => {
    expect(groupBy(null, "key")).toEqual({});
    expect(groupBy(undefined, "key")).toEqual({});
    expect(groupBy({}, "key")).toEqual({});
  });
});

describe("getPropSafely", () => {
  test("accesses nested properties safely", () => {
    const obj = {
      a: {
        b: {
          c: "value",
        },
      },
      x: 10,
    };

    expect(getPropSafely(obj, "a.b.c")).toBe("value");
    expect(getPropSafely(obj, "x")).toBe(10);
  });

  test("returns default value when property not found", () => {
    const obj = { a: { b: "value" } };

    expect(getPropSafely(obj, "a.c")).toBe(null); // Default is null
    expect(getPropSafely(obj, "x", "not found")).toBe("not found");
  });

  test("handles null or undefined obj", () => {
    expect(getPropSafely(null, "a.b.c")).toBe(null);
    expect(getPropSafely(undefined, "a.b.c")).toBe(null);
    expect(getPropSafely(null, "a.b.c", "default")).toBe("default");
  });

  test("handles invalid paths", () => {
    const obj = { a: { b: "value" } };

    expect(getPropSafely(obj, "")).toBe(null);
    expect(getPropSafely(obj, null)).toBe(null);
    expect(getPropSafely(obj, undefined)).toBe(null);
  });
});

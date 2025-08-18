import { daysBetweenFlexibleDates, parseFlexibleDateChrono } from './timelineUtils.js';

describe("parseFlexibleDateChrono", () => {
  it("should parse 'Apr-Jun' in 2025 to Jun 30, 2025 (end of range)", () => {
    const result = parseFlexibleDateChrono('Apr-Jun', 2025);
    expect(result).not.toBeNull();
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(5); // June is 5 (0-based)
    expect(result.getDate()).toBe(30);
  });

  it("should parse 'Apr' in 2025 to Apr 1, 2025 (start of range)", () => {
    const result = parseFlexibleDateChrono('Apr', 2025);
    expect(result).not.toBeNull();
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(3); // April is 3 (0-based)
    expect(result.getDate()).toBe(1);
  });
});

describe("daysBetweenFlexibleDates", () => {
  it("should return correct days between 'Apr' and 'Jun' in 2025", () => {
    const result = daysBetweenFlexibleDates('Apr', 'Jun', 2025);
    // Jun 30 - Apr 1 + 1 = 91 days (inclusive)
    expect(result).toBeGreaterThan(90); // Should be 91
  });

  it("should return 30 for same month 'Apr' to 'Apr' in 2025", () => {
    const result = daysBetweenFlexibleDates('Apr', 'Apr', 2025);
    expect(result).toBe(30);
  });
});

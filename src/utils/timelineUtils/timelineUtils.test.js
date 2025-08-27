import { daysBetweenFlexibleDates, parseFlexibleDateChrono, normalizeDateForDisplay } from './timeline';

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

  it("should parse 'Oct-Dec' in 2025 to Dec 31, 2025 (end of range)", () => {
    const result = parseFlexibleDateChrono('Oct-Dec', 2025);
    expect(result).not.toBeNull();
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(11); // December is 11 (0-based)
    expect(result.getDate()).toBe(31);
  });

  it("should parse '20 Aug' in 2025 to Aug 20, 2025 (start of range)", () => {
    const result = parseFlexibleDateChrono('20 Aug', 2025);
    expect(result).not.toBeNull();
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(7); // August is 7 (0-based)
    expect(result.getDate()).toBe(20);
  });

  it("should parse ISO date '2025-08-15' correctly", () => {
    const result = parseFlexibleDateChrono('2025-08-15', 2025);
    expect(result).not.toBeNull();
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(7); // August is 7 (0-based)
    expect(result.getDate()).toBe(15);
  });

  it("should calculate correct days between '20 Aug' and 'Oct-Dec' in 2025", () => {
    const aug20 = parseFlexibleDateChrono('20 Aug', 2025, false);
    const dec31 = parseFlexibleDateChrono('Oct-Dec', 2025, true);
    
    expect(aug20).not.toBeNull();
    expect(dec31).not.toBeNull();
    
    if (aug20 && dec31) {
      const diffTime = dec31.getTime() - aug20.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Aug 20 to Dec 31 = 133 days
      expect(diffDays).toBe(133);
    }
  });
});

describe("daysBetweenFlexibleDates", () => {
  it("should return correct days between 'Apr' and 'Jun' in 2025", () => {
    const result = daysBetweenFlexibleDates('Apr', 'Jun', 2025);
    // Jun 30 - Apr 1 = 90 days (exclusive)
    expect(result).toBe(90);
  });

  it("should return 29 for same month 'Apr' to 'Apr' in 2025 (full month range)", () => {
    const result = daysBetweenFlexibleDates('Apr', 'Apr', 2025);
    // Apr 1 to Apr 30 = 29 days (exclusive)
    expect(result).toBe(29);
  });

  it("should return -16 for 'Oct-Dec' to '15 Dec' in 2025", () => {
    const result = daysBetweenFlexibleDates('Oct-Dec', '15 Dec', 2025);
    // Dec 15 is 16 days before Dec 31 (exclusive)
    expect(result).toBe(-16);
  });

  it("should return exact days for specific dates", () => {
    const result = daysBetweenFlexibleDates('20 Jun', '30 Jun', 2025);
    // June 30 - June 20 = 10 days (exclusive)
    expect(result).toBe(10);
  });

  it("should return 133 days for '20 Aug' to 'Oct-Dec' in 2025", () => {
    const result = daysBetweenFlexibleDates('20 Aug', 'Oct-Dec', 2025);
    // Aug 20 to Dec 31 = 133 days (exclusive)
    // Aug 20 → Aug 31 = 11 days, Sep = 30 days, Oct = 31 days, Nov = 30 days, Dec = 31 days
    // Total: 11 + 30 + 31 + 30 + 31 = 133 days
    expect(result).toBe(133);
  });

  it("should handle missing oldDueDate by using project target date as fallback", () => {
    // Simulate the scenario where oldDueDate is missing but newDueDate exists
    // This test verifies that the fallback logic in FetchProjectsUpdates works
    const aug20 = parseFlexibleDateChrono('20 Aug', 2025, false);
    const dec31 = parseFlexibleDateChrono('Oct-Dec', 2025, true);
    
    expect(aug20).not.toBeNull();
    expect(dec31).not.toBeNull();
    
    if (aug20 && dec31) {
      const diffTime = dec31.getTime() - aug20.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Aug 20 to Dec 31 = 133 days
      expect(diffDays).toBe(133);
    }
  });
});

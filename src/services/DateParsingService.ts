import * as chrono from "chrono-node";
import { parse, format } from "date-fns";
import { log, setFilePrefix } from '../utils/logger';

// Set file-level prefix for all logging in this file
setFilePrefix('[DateParsingService]');

const formats = [
  "yyyy-MM-dd",     // 2025-12-31
  "dd MMMM yyyy",   // 31 December 2025
  "dd MMM yyyy",    // 31 Dec 2025
  "MMMM yyyy",      // December 2025
  "MMMM",           // December (assume current year unless specified)
];

/**
 * Service for parsing and normalizing date strings using chrono-node and date-fns
 * Handles various date formats including ranges, natural language, and ISO dates
 */
export class DateParsingService {
  private static instance: DateParsingService;

  static getInstance(): DateParsingService {
    if (!DateParsingService.instance) {
      DateParsingService.instance = new DateParsingService();
    }
    return DateParsingService.instance;
  }

  /**
   * Parses a date string and returns both the original and normalized versions
   * @param dateInput - The date string to parse (e.g., "October to December", "December", "2025-12-31")
   * @returns Object with dueDate (original) and dueDateParsed (normalized ISO)
   */
  parseDate(dateInput: string | null | undefined): { dueDate: string; dueDateParsed: string | null } {
    if (!dateInput || typeof dateInput !== 'string') {
      return { dueDate: '', dueDateParsed: null };
    }

    const trimmedInput = dateInput.trim();
    if (!trimmedInput) {
      return { dueDate: '', dueDateParsed: null };
    }

    try {
      // 1. Try chrono (handles ranges + natural language)
      const results = chrono.parse(trimmedInput);

      if (results.length > 0) {
        const res = results[0];
        let normalizedDate: string;

        // If it's a range, return END date
        if (res.end) {
          normalizedDate = format(res.end.date(), "yyyy-MM-dd");
        } else {
          // Else just return the single date
          normalizedDate = format(res.start.date(), "yyyy-MM-dd");
        }

        return {
          dueDate: trimmedInput,
          dueDateParsed: normalizedDate
        };
      }

      // 2. Try date-fns with known formats
      for (const fmt of formats) {
        try {
          const parsed = parse(trimmedInput, fmt, new Date());
          if (!isNaN(parsed.getTime())) {
            const normalizedDate = format(parsed, "yyyy-MM-dd");
            return {
              dueDate: trimmedInput,
              dueDateParsed: normalizedDate
            };
          }
        } catch {
          // ignore and keep trying
        }
      }

      // If neither chrono nor date-fns could parse it, return the original with null parsed
      return {
        dueDate: trimmedInput,
        dueDateParsed: null
      };
      
    } catch (error) {
      log.warn(`Failed to parse date: "${trimmedInput}"`, String(error));
      return {
        dueDate: trimmedInput,
        dueDateParsed: null
      };
    }
  }

  /**
   * Checks if a date string represents a date range
   * @param dateInput - The date string to check
   * @returns True if it's a range, false otherwise
   */
  isDateRange(dateInput: string): boolean {
    if (!dateInput || typeof dateInput !== 'string') {
      return false;
    }

    try {
      const results = chrono.parse(dateInput.trim());
      return results.length > 0 && Boolean(results[0].end);
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets the end date of a date range
   * @param dateInput - The date range string
   * @returns ISO formatted end date or null if not a range
   */
  getRangeEndDate(dateInput: string): string | null {
    if (!this.isDateRange(dateInput)) {
      return null;
    }

    try {
      const results = chrono.parse(dateInput.trim());
      if (results.length > 0 && results[0].end) {
        return format(results[0].end.date(), "yyyy-MM-dd");
      }
    } catch (error) {
      log.warn(`Failed to get range end date: "${dateInput}"`, String(error));
    }

    return null;
  }
}

// Export singleton instance
export const dateParsingService = DateParsingService.getInstance();

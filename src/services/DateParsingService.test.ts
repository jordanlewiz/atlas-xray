import { DateParsingService, dateParsingService } from './DateParsingService';

describe('DateParsingService', () => {
  let service: DateParsingService;

  beforeEach(() => {
    service = DateParsingService.getInstance();
  });

  describe('parseDate', () => {
    it('should parse date range "October to December"', () => {
      const result = service.parseDate('October to December');
      
      expect(result.dueDate).toBe('October to December');
      expect(result.dueDateParsed).toMatch(/^\d{4}-12-01$/); // Should be December 1st of current year
    });

    it('should parse single month "December"', () => {
      const result = service.parseDate('December');
      
      expect(result.dueDate).toBe('December');
      expect(result.dueDateParsed).toMatch(/^\d{4}-12-01$/); // Should be December 1st of current year
    });

    it('should parse ISO date "2025-12-31"', () => {
      const result = service.parseDate('2025-12-31');
      
      expect(result.dueDate).toBe('2025-12-31');
      expect(result.dueDateParsed).toBe('2025-12-31');
    });

    it('should parse full date "31 December 2025"', () => {
      const result = service.parseDate('31 December 2025');
      
      expect(result.dueDate).toBe('31 December 2025');
      expect(result.dueDateParsed).toBe('2025-12-31');
    });

    it('should parse abbreviated date "31 Dec 2025"', () => {
      const result = service.parseDate('31 Dec 2025');
      
      expect(result.dueDate).toBe('31 Dec 2025');
      expect(result.dueDateParsed).toBe('2025-12-31');
    });

    it('should handle null input', () => {
      const result = service.parseDate(null);
      
      expect(result.dueDate).toBe('');
      expect(result.dueDateParsed).toBeNull();
    });

    it('should handle undefined input', () => {
      const result = service.parseDate(undefined);
      
      expect(result.dueDate).toBe('');
      expect(result.dueDateParsed).toBeNull();
    });

    it('should handle empty string', () => {
      const result = service.parseDate('');
      
      expect(result.dueDate).toBe('');
      expect(result.dueDateParsed).toBeNull();
    });

    it('should handle unparseable date', () => {
      const result = service.parseDate('not a date');
      
      expect(result.dueDate).toBe('not a date');
      expect(result.dueDateParsed).toBeNull();
    });
  });

  describe('isDateRange', () => {
    it('should identify "October to December" as a range', () => {
      expect(service.isDateRange('October to December')).toBe(true);
    });

    it('should not identify "December" as a range', () => {
      expect(service.isDateRange('December')).toBe(false);
    });

    it('should not identify "2025-12-31" as a range', () => {
      expect(service.isDateRange('2025-12-31')).toBe(false);
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = DateParsingService.getInstance();
      const instance2 = DateParsingService.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should export singleton instance', () => {
      expect(dateParsingService).toBe(service);
    });
  });
});

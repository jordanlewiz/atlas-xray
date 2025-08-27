import { analyzeUpdateCell } from './updateCellUtils';

describe('updateCellUtils', () => {
  describe('analyzeUpdateCell', () => {
    it('should identify date change when oldDueDate and newDueDate are different', () => {
      const update = {
        oldDueDate: '2024-01-01',
        newDueDate: '2024-01-15',
        raw: { missedUpdate: false }
      };

      const result = analyzeUpdateCell(update);

      expect(result.hasDateChange).toBe(true);
      expect(result.shouldShowDateDifference).toBe(true);
      expect(result.shouldShowIndicator).toBe(false);
      expect(result.cssClasses).toBe('timeline-cell-content has-old-due-date');
      expect(result.clickable).toBe(true);
      expect(result.oldDate).toBe('2024-01-01');
      expect(result.newDate).toBe('2024-01-15');
    });

    it('should not identify date change when oldDueDate and newDueDate are the same', () => {
      const update = {
        oldDueDate: '2024-01-01',
        newDueDate: '2024-01-01',
        raw: { missedUpdate: false }
      };

      const result = analyzeUpdateCell(update);

      expect(result.hasDateChange).toBe(false);
      expect(result.shouldShowDateDifference).toBe(false);
      expect(result.shouldShowIndicator).toBe(true);
      expect(result.cssClasses).toBe('timeline-cell-content ');
      expect(result.clickable).toBe(true);
    });

    it('should not identify date change when oldDueDate is missing', () => {
      const update = {
        newDueDate: '2024-01-15',
        raw: { missedUpdate: false }
      };

      const result = analyzeUpdateCell(update);

      expect(result.hasDateChange).toBe(false);
      expect(result.shouldShowDateDifference).toBe(false);
      expect(result.shouldShowIndicator).toBe(true);
      expect(result.cssClasses).toBe('timeline-cell-content ');
    });

    it('should not identify date change when newDueDate is missing', () => {
      const update = {
        oldDueDate: '2024-01-01',
        raw: { missedUpdate: false }
      };

      const result = analyzeUpdateCell(update);

      expect(result.hasDateChange).toBe(false);
      expect(result.shouldShowDateDifference).toBe(false);
      expect(result.shouldShowIndicator).toBe(true);
      expect(result.cssClasses).toBe('timeline-cell-content ');
    });

    it('should handle missed updates correctly', () => {
      const update = {
        oldDueDate: '2024-01-01',
        newDueDate: '2024-01-15',
        raw: { missedUpdate: true }
      };

      const result = analyzeUpdateCell(update);

      expect(result.hasMissedUpdate).toBe(true);
      expect(result.shouldShowDateDifference).toBe(false);
      expect(result.shouldShowIndicator).toBe(false);
      expect(result.clickable).toBe(false);
    });

    it('should handle missed updates from update.missedUpdate property', () => {
      const update = {
        oldDueDate: '2024-01-01',
        newDueDate: '2024-01-15',
        missedUpdate: true
      };

      const result = analyzeUpdateCell(update);

      expect(result.hasMissedUpdate).toBe(true);
      expect(result.shouldShowDateDifference).toBe(false);
      expect(result.shouldShowIndicator).toBe(false);
      expect(result.clickable).toBe(false);
    });

    it('should handle updates with no raw property', () => {
      const update = {
        oldDueDate: '2024-01-01',
        newDueDate: '2024-01-15'
      };

      const result = analyzeUpdateCell(update);

      expect(result.hasMissedUpdate).toBe(false);
      expect(result.hasDateChange).toBe(true);
      expect(result.shouldShowDateDifference).toBe(true);
      expect(result.clickable).toBe(true);
    });

    it('should handle empty update object', () => {
      const update = {};

      const result = analyzeUpdateCell(update);

      expect(result.hasDateChange).toBe(false);
      expect(result.hasMissedUpdate).toBe(false);
      expect(result.shouldShowDateDifference).toBe(false);
      expect(result.shouldShowIndicator).toBe(true);
      expect(result.cssClasses).toBe('timeline-cell-content ');
      expect(result.clickable).toBe(true);
    });

    it('should handle null/undefined values correctly', () => {
      const update = {
        oldDueDate: null,
        newDueDate: undefined,
        raw: null
      };

      const result = analyzeUpdateCell(update);

      expect(result.hasDateChange).toBe(false);
      expect(result.hasMissedUpdate).toBe(false);
      expect(result.shouldShowDateDifference).toBe(false);
      expect(result.shouldShowIndicator).toBe(true);
      expect(result.oldDate).toBe(null);
      expect(result.newDate).toBe(undefined);
    });
  });
});

import { analyzeUpdateCell } from './updateCellUtils';

describe('updateCellUtils', () => {
  describe('analyzeUpdateCell', () => {
    it('should identify date change when dueDateParsed exists', () => {
      const update = {
        dueDate: 'January 15, 2024',
        dueDateParsed: '2024-01-15',
        raw: { missedUpdate: false }
      };

      const result = analyzeUpdateCell(update);

      expect(result.hasDateChange).toBe(true);
      expect(result.shouldShowDateDifference).toBe(true);
      expect(result.shouldShowIndicator).toBe(false);
      expect(result.cssClasses).toBe('timeline-cell-content has-old-due-date');
      expect(result.clickable).toBe(true);
      expect(result.oldDate).toBe('January 15, 2024');
      expect(result.newDate).toBe('2024-01-15');
    });

    it('should not identify date change when dueDateParsed is missing', () => {
      const update = {
        dueDate: 'January 15, 2024',
        raw: { missedUpdate: false }
      };

      const result = analyzeUpdateCell(update);

      expect(result.hasDateChange).toBe(false);
      expect(result.shouldShowDateDifference).toBe(false);
      expect(result.shouldShowIndicator).toBe(true);
      expect(result.cssClasses).toBe('timeline-cell-content ');
      expect(result.clickable).toBe(true);
    });

    it('should not identify date change when dueDate is missing', () => {
      const update = {
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
        dueDate: 'January 15, 2024',
        dueDateParsed: '2024-01-15',
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
        dueDate: 'January 15, 2024',
        dueDateParsed: '2024-01-15',
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
        dueDate: 'January 15, 2024',
        dueDateParsed: '2024-01-15'
      };

      const result = analyzeUpdateCell(update);

      expect(result.hasMissedUpdate).toBe(false);
      expect(result.hasDateChange).toBe(true);
      expect(result.shouldShowDateDifference).toBe(true);
      expect(result.clickable).toBe(true);
    });

    it('should handle updates with missedUpdate property', () => {
      const update = {
        dueDate: 'January 15, 2024',
        dueDateParsed: '2024-01-15',
        missedUpdate: true
      };

      const result = analyzeUpdateCell(update);

      expect(result.hasMissedUpdate).toBe(true);
      expect(result.shouldShowDateDifference).toBe(false);
      expect(result.shouldShowIndicator).toBe(false);
      expect(result.clickable).toBe(false);
    });

    it('should handle null/undefined values correctly', () => {
      const update = {
        dueDate: null,
        dueDateParsed: undefined,
        raw: { missedUpdate: false }
      };

      const result = analyzeUpdateCell(update);

      expect(result.hasDateChange).toBe(false);
      expect(result.shouldShowDateDifference).toBe(false);
      expect(result.shouldShowIndicator).toBe(true);
      expect(result.oldDate).toBe(null);
      expect(result.newDate).toBe(null);
    });
  });
});

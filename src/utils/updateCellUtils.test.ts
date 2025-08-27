import { analyzeUpdateCell } from './updateCellUtils';

describe('updateCellUtils', () => {
  describe('analyzeUpdateCell', () => {
    it('should identify date change when oldTargetDate and newTargetDate are different', () => {
      const update = {
        oldTargetDate: 'January 1, 2024',
        oldTargetDateParsed: '2024-01-01',
        newTargetDate: 'January 15, 2024',
        newTargetDateParsed: '2024-01-15',
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

    it('should not identify date change when oldTargetDate and newTargetDate are the same', () => {
      const update = {
        oldTargetDate: 'January 15, 2024',
        oldTargetDateParsed: '2024-01-15',
        newTargetDate: 'January 15, 2024',
        newTargetDateParsed: '2024-01-15',
        raw: { missedUpdate: false }
      };

      const result = analyzeUpdateCell(update);

      expect(result.hasDateChange).toBe(false);
      expect(result.shouldShowDateDifference).toBe(false);
      expect(result.shouldShowIndicator).toBe(true);
      expect(result.cssClasses).toBe('timeline-cell-content ');
      expect(result.clickable).toBe(true);
    });

    it('should not identify date change when oldTargetDateParsed is missing', () => {
      const update = {
        newTargetDate: 'January 15, 2024',
        newTargetDateParsed: '2024-01-15',
        raw: { missedUpdate: false }
      };

      const result = analyzeUpdateCell(update);

      expect(result.hasDateChange).toBe(false);
      expect(result.shouldShowDateDifference).toBe(false);
      expect(result.shouldShowIndicator).toBe(true);
      expect(result.cssClasses).toBe('timeline-cell-content ');
    });

    it('should not identify date change when newTargetDateParsed is missing', () => {
      const update = {
        oldTargetDate: 'January 1, 2024',
        oldTargetDateParsed: '2024-01-01',
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
        oldTargetDate: 'January 1, 2024',
        oldTargetDateParsed: '2024-01-01',
        newTargetDate: 'January 15, 2024',
        newTargetDateParsed: '2024-01-15',
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
        oldTargetDate: 'January 1, 2024',
        oldTargetDateParsed: '2024-01-01',
        newTargetDate: 'January 15, 2024',
        newTargetDateParsed: '2024-01-15',
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
        oldTargetDate: 'January 1, 2024',
        oldTargetDateParsed: '2024-01-01',
        newTargetDate: 'January 15, 2024',
        newTargetDateParsed: '2024-01-15'
      };

      const result = analyzeUpdateCell(update);

      expect(result.hasMissedUpdate).toBe(false);
      expect(result.hasDateChange).toBe(true);
      expect(result.shouldShowDateDifference).toBe(true);
      expect(result.clickable).toBe(true);
    });

    it('should handle updates with missedUpdate property', () => {
      const update = {
        oldTargetDate: 'January 1, 2024',
        oldTargetDateParsed: '2024-01-01',
        newTargetDate: 'January 15, 2024',
        newTargetDateParsed: '2024-01-15',
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
        oldTargetDate: null,
        oldTargetDateParsed: undefined,
        newTargetDate: undefined,
        newTargetDateParsed: null,
        raw: { missedUpdate: false }
      };

      const result = analyzeUpdateCell(update);

      expect(result.hasDateChange).toBe(false);
      expect(result.shouldShowDateDifference).toBe(false);
      expect(result.shouldShowIndicator).toBe(true);
      expect(result.oldDate).toBe(undefined);
      expect(result.newDate).toBe(null);
    });
  });
});

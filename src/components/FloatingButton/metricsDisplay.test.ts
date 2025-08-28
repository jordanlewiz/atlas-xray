import { 
  formatFloatingButtonMetrics, 
  formatFloatingButtonTooltip,
  formatCompactMetrics, 
  formatMinimalMetrics,
  type FloatingButtonMetrics 
} from './metricsDisplay';

describe('FloatingButton Metrics Display', () => {
  const mockMetrics: FloatingButtonMetrics = {
    projectsVisible: 4,
    projectsStored: 4,
    updatesAvailable: 16,
    updatesStored: 27,
    updatesAnalyzed: 18
  };

  describe('formatFloatingButtonMetrics', () => {
    it('should format metrics with HTML strong tags', () => {
      const result = formatFloatingButtonMetrics(mockMetrics);
      expect(result).toContain('<strong>Projects:</strong>');
      expect(result).toContain('<strong>Updates:</strong>');
    });

    it('should display projects on first line', () => {
      const result = formatFloatingButtonMetrics(mockMetrics);
      const lines = result.split('\n');
      expect(lines[0]).toContain('4 in query • 4 Total Stored');
    });

    it('should display updates on second line', () => {
      const result = formatFloatingButtonMetrics(mockMetrics);
      const lines = result.split('\n');
      expect(lines[1]).toContain('16 in query • 27 Total Stored • 18 Analyzed');
    });

    it('should handle zero values', () => {
      const zeroMetrics: FloatingButtonMetrics = {
        projectsVisible: 0,
        projectsStored: 0,
        updatesAvailable: 0,
        updatesStored: 0,
        updatesAnalyzed: 0
      };
      const result = formatFloatingButtonMetrics(zeroMetrics);
      expect(result).toContain('0 in query • 0 Total Stored');
    });
  });

  describe('formatFloatingButtonTooltip', () => {
    it('should return formatted tooltip text', () => {
      const result = formatFloatingButtonTooltip(mockMetrics);
      expect(result).toContain('Projects: 4 in query • 4 Total Stored');
      expect(result).toContain('Updates: 16 in query • 27 Total Stored • 18 Analyzed');
    });

    it('should include newlines for proper formatting', () => {
      const result = formatFloatingButtonTooltip(mockMetrics);
      const lines = result.split('\n');
      expect(lines).toHaveLength(2); // 2 lines: projects and updates
    });
  });

  describe('formatCompactMetrics', () => {
    it('should format metrics in compact format', () => {
      const result = formatCompactMetrics(mockMetrics);
      expect(result).toBe('4 projects • 4 stored • 16 available • 27 total • 18 analyzed');
    });
  });

  describe('formatMinimalMetrics', () => {
    it('should format metrics with emojis and minimal text', () => {
      const result = formatMinimalMetrics(mockMetrics);
      expect(result).toBe('👁️4 💾4 📥16 📊27 ✅18');
    });
  });
});

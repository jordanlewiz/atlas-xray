import { renderHook } from '@testing-library/react';
import { useDateDifference } from './useDateDifference';

// Mock the daysBetweenFlexibleDates function
jest.mock('../utils/timelineUtils', () => ({
  daysBetweenFlexibleDates: jest.fn()
}));

import { daysBetweenFlexibleDates } from '../utils/timelineUtils';

const mockDaysBetweenFlexibleDates = daysBetweenFlexibleDates as jest.MockedFunction<typeof daysBetweenFlexibleDates>;

describe('useDateDifference', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return positive values correctly', () => {
    mockDaysBetweenFlexibleDates.mockReturnValue(5);
    
    const { result } = renderHook(() => useDateDifference('2024-01-01', '2024-01-06'));
    
    expect(result.current.value).toBe(5);
    expect(result.current.displayText).toBe('+5');
    expect(result.current.cssClass).toBe('positive');
    expect(result.current.hasChange).toBe(true);
  });

  it('should return negative values correctly', () => {
    mockDaysBetweenFlexibleDates.mockReturnValue(-3);
    
    const { result } = renderHook(() => useDateDifference('2024-01-06', '2024-01-03'));
    
    expect(result.current.value).toBe(-3);
    expect(result.current.displayText).toBe('-3');
    expect(result.current.cssClass).toBe('negative');
    expect(result.current.hasChange).toBe(true);
  });

  it('should return neutral values correctly', () => {
    mockDaysBetweenFlexibleDates.mockReturnValue(0);
    
    const { result } = renderHook(() => useDateDifference('2024-01-01', '2024-01-01'));
    
    expect(result.current.value).toBe(0);
    expect(result.current.displayText).toBe('0');
    expect(result.current.cssClass).toBe('neutral');
    expect(result.current.hasChange).toBe(false);
  });

  it('should handle null values correctly', () => {
    mockDaysBetweenFlexibleDates.mockReturnValue(null);
    
    const { result } = renderHook(() => useDateDifference(null, '2024-01-01'));
    
    expect(result.current.value).toBe(null);
    expect(result.current.displayText).toBe('');
    expect(result.current.cssClass).toBe('');
    expect(result.current.hasChange).toBe(false);
  });

  it('should handle undefined values correctly', () => {
    mockDaysBetweenFlexibleDates.mockReturnValue(null);
    
    const { result } = renderHook(() => useDateDifference(undefined, '2024-01-01'));
    
    expect(result.current.value).toBe(null);
    expect(result.current.displayText).toBe('');
    expect(result.current.cssClass).toBe('');
    expect(result.current.hasChange).toBe(false);
  });
});

import { renderHook } from '@testing-library/react';
import { useDateDifference } from './useDateDifference';
import type { ProjectUpdate } from '../types';

// Mock the getDueDateDiff function
jest.mock('../utils/timelineUtils', () => ({
  getDueDateDiff: jest.fn()
}));

import { getDueDateDiff } from '../utils/timelineUtils';

const mockGetDueDateDiff = getDueDateDiff as jest.MockedFunction<typeof getDueDateDiff>;

describe('useDateDifference', () => {
  const mockUpdate = {} as ProjectUpdate;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return positive values correctly', () => {
    mockGetDueDateDiff.mockReturnValue(5);
    
    const { result } = renderHook(() => useDateDifference(mockUpdate));
    
    expect(result.current.value).toBe(5);
    expect(result.current.displayText).toBe('+5');
    expect(result.current.cssClass).toBe('positive');
    expect(result.current.hasChange).toBe(true);
  });

  it('should return negative values correctly', () => {
    mockGetDueDateDiff.mockReturnValue(-3);
    
    const { result } = renderHook(() => useDateDifference(mockUpdate));
    
    expect(result.current.value).toBe(-3);
    expect(result.current.displayText).toBe('-3');
    expect(result.current.cssClass).toBe('negative');
    expect(result.current.hasChange).toBe(true);
  });

  it('should return neutral values correctly', () => {
    mockGetDueDateDiff.mockReturnValue(0);
    
    const { result } = renderHook(() => useDateDifference(mockUpdate));
    
    expect(result.current.value).toBe(0);
    expect(result.current.displayText).toBe('0');
    expect(result.current.cssClass).toBe('neutral');
    expect(result.current.hasChange).toBe(false);
  });

  it('should handle null values correctly', () => {
    mockGetDueDateDiff.mockReturnValue(null);
    
    const { result } = renderHook(() => useDateDifference(mockUpdate));
    
    expect(result.current.value).toBe(null);
    expect(result.current.displayText).toBe('');
    expect(result.current.cssClass).toBe('');
    expect(result.current.hasChange).toBe(false);
  });
});

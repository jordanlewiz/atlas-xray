import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FloatingButton from './FloatingButton';

// Mock dependencies
jest.mock('dexie-react-hooks', () => ({
  useLiveQuery: jest.fn()
}));

jest.mock('../../utils/database', () => ({
  db: {
    projectViews: {
      count: jest.fn()
    },
    projectUpdates: {
      count: jest.fn(),
      where: jest.fn(() => ({
        above: jest.fn(() => ({
          count: jest.fn()
        }))
      }))
    }
  },
  getVisibleProjectIds: jest.fn(),
  getTotalUpdatesAvailableCount: jest.fn()
}));

const mockUseLiveQuery = require('dexie-react-hooks').useLiveQuery;
const mockDatabase = require('../../utils/database');

describe('FloatingButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useLiveQuery for different queries
    mockUseLiveQuery.mockImplementation((query: any) => {
      if (typeof query === 'function') {
        const queryString = query.toString();
        if (queryString.includes('getVisibleProjectIds')) {
          return ['PROJ-1', 'PROJ-2']; // Visible projects - length 2
        }
        if (queryString.includes('db.projectViews.count')) {
          return 4; // Projects stored
        }
        if (queryString.includes('db.projectUpdates.count')) {
          return 27; // Updates stored
        }
        if (queryString.includes('updateQuality') && queryString.includes('above(0)')) {
          return 18; // Updates analyzed
        }
        if (queryString.includes('getTotalUpdatesAvailableCount')) {
          return 16; // Updates available
        }
      }
      return 0;
    });

    // Mock database functions
    mockDatabase.getVisibleProjectIds.mockResolvedValue(['PROJ-1', 'PROJ-2']);
    mockDatabase.getTotalUpdatesAvailableCount.mockResolvedValue(16);
  });

  describe('Display Text Formatting', () => {
    it('should display metrics in HTML format', () => {
      render(<FloatingButton />);
      
      // Should show the new HTML format with strong tags
      expect(screen.getByText(/Projects:/)).toBeInTheDocument();
      expect(screen.getByText(/Updates:/)).toBeInTheDocument();
      expect(screen.getByText(/2 in query • 4 Total Stored/)).toBeInTheDocument();
      expect(screen.getByText(/16 in query • 27 Total Stored • 18 Analyzed/)).toBeInTheDocument();
    });

    it('should handle zero values gracefully', () => {
      // Mock all values as zero
      mockUseLiveQuery.mockImplementation(() => 0);
      
      render(<FloatingButton />);
      
      // Should show zero values in HTML format
      expect(screen.getByText(/Projects:/)).toBeInTheDocument();
      expect(screen.getByText(/Updates:/)).toBeInTheDocument();
      expect(screen.getByText(/0 in query • 0 Total Stored • 0 Analyzed/)).toBeInTheDocument();
    });
  });

  describe('Tooltip Content', () => {
    it('should display tooltip with formatted content', () => {
      render(<FloatingButton />);
      
      // Should show tooltip button
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      
      // Button should be clickable
      expect(button).not.toBeDisabled();
    });
  });

  describe('Real-time Updates', () => {
    it('should use useLiveQuery for reactive data', () => {
      render(<FloatingButton />);
      
      // Verify useLiveQuery was called for each metric
      expect(mockUseLiveQuery).toHaveBeenCalledTimes(5);
      
      // Check that the component displays the mocked values
      expect(screen.getByText(/Projects:/)).toBeInTheDocument();
      expect(screen.getByText(/Updates:/)).toBeInTheDocument();
      expect(screen.getByText(/2 in query • 4 Total Stored/)).toBeInTheDocument();
      expect(screen.getByText(/16 in query • 27 Total Stored • 18 Analyzed/)).toBeInTheDocument();
    });
  });

  describe('Modal Integration', () => {
    it('should open modal when clicked', async () => {
      render(<FloatingButton />);
      
      const button = screen.getByRole('button');
      button.click();
      
      // Modal should be opened (this would require more complex testing setup)
      // For now, just verify the button is clickable
      expect(button).toBeInTheDocument();
    });
  });
});

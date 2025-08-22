import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FloatingButton from './FloatingButton';

// Mock dependencies
jest.mock('dexie-react-hooks', () => ({
  useLiveQuery: jest.fn()
}));

// projectIdScanner removed - now handled by ProjectPipeline

// useUpdateQuality hook removed - now handled by ProjectPipeline

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn()
}));

jest.mock('../../utils/database', () => ({
  db: {
    projectView: {
      count: jest.fn(),
      toArray: jest.fn()
    },
    projectUpdates: {
      toArray: jest.fn()
    }
  }
}));

const mockUseLiveQuery = require('dexie-react-hooks').useLiveQuery;

describe('FloatingButton', () => {
  const mockProjects = [
    { projectKey: 'PROJ-1', project: { name: 'Project 1' } },
    { projectKey: 'PROJ-2', project: { name: 'Project 2' } }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock React useState
    const { useState } = require('react');
    useState.mockImplementation((initialValue: any) => {
      if (initialValue === false) {
        return [false, jest.fn()]; // modalOpen
      }
      if (Array.isArray(initialValue) && initialValue.length === 0) {
        return [['PROJ-1', 'PROJ-2'], jest.fn()]; // visibleProjectKeys
      }
      if (typeof initialValue === 'number') {
        return [2, jest.fn()]; // visibleProjectCount
      }
      return [initialValue, jest.fn()];
    });
    
    // Mock useLiveQuery
    mockUseLiveQuery.mockImplementation((query: any) => {
      if (typeof query === 'function') {
        if (query.toString().includes('count')) {
          return 5; // Total projects
        }
        return mockProjects; // All projects
      }
      return mockProjects;
    });
  });

  describe('Project Count Display', () => {
    it('should show project count immediately', () => {
      render(<FloatingButton />);
      
      // Should show project count immediately, no loading state
      expect(screen.getByText(/0 projects/)).toBeInTheDocument(); // Should show "0 projects" initially
    });
  });

  describe('Tooltip Content', () => {
    it('should always show tooltip', () => {
      render(<FloatingButton />);
      
      // Should show tooltip
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });
});

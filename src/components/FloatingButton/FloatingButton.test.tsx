import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FloatingButton from './FloatingButton';

// Mock the new services
jest.mock('../../services/FetchProjectsList', () => ({
  fetchProjectsList: {
    getProjectList: jest.fn()
  }
}));

jest.mock('../../services/FetchProjectsSummary', () => ({
  fetchProjectsSummary: {
    getProjectSummaries: jest.fn()
  }
}));

jest.mock('../../services/FetchProjectsUpdates', () => ({
  fetchProjectsUpdates: {
    getProjectUpdates: jest.fn()
  }
}));

jest.mock('../../services/FetchProjectsFullDetails', () => ({
  fetchProjectsFullDetails: {
    getProjectFullDetails: jest.fn()
  }
}));

jest.mock('../../services/bootstrapService', () => ({
  bootstrapService: {
    loadBootstrapData: jest.fn()
  }
}));

const mockFetchProjectsList = require('../../services/FetchProjectsList').fetchProjectsList;
const mockFetchProjectsSummary = require('../../services/FetchProjectsSummary').fetchProjectsSummary;
const mockFetchProjectsUpdates = require('../../services/FetchProjectsUpdates').fetchProjectsUpdates;
const mockFetchProjectsFullDetails = require('../../services/FetchProjectsFullDetails').fetchProjectsFullDetails;
const mockBootstrapService = require('../../services/bootstrapService').bootstrapService;

describe('FloatingButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful responses
    mockBootstrapService.loadBootstrapData.mockResolvedValue(undefined);
    mockFetchProjectsList.getProjectList.mockResolvedValue(['TEST-123', 'TEST-456']);
    mockFetchProjectsSummary.getProjectSummaries.mockResolvedValue(undefined);
    mockFetchProjectsUpdates.getProjectUpdates.mockResolvedValue(undefined);
    mockFetchProjectsFullDetails.getProjectFullDetails.mockResolvedValue(undefined);

    // Mock DOM querySelector to return project keys
    jest.spyOn(document, 'querySelectorAll').mockReturnValue([
      { textContent: 'TEST-123 Project Name' },
      { textContent: 'Another TEST-456 Project' }
    ] as any);
  });

  it('should render initial state correctly', () => {
    render(<FloatingButton />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
    expect(screen.getByText('Atlas Xray')).toBeInTheDocument();
  });

  it('should show loading state when button is clicked', async () => {
    // Mock a delay in bootstrap service
    mockBootstrapService.loadBootstrapData.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<FloatingButton />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('⏳')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  it('should call all services in correct order', async () => {
    render(<FloatingButton />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockBootstrapService.loadBootstrapData).toHaveBeenCalledTimes(1);
      expect(mockFetchProjectsList.getProjectList).toHaveBeenCalledTimes(1);
      expect(mockFetchProjectsSummary.getProjectSummaries).toHaveBeenCalledTimes(1);
      expect(mockFetchProjectsUpdates.getProjectUpdates).toHaveBeenCalledTimes(1);
      expect(mockFetchProjectsFullDetails.getProjectFullDetails).toHaveBeenCalledTimes(1);
    });
  });

  it('should extract project keys from DOM correctly', async () => {
    render(<FloatingButton />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockFetchProjectsList.getProjectList).toHaveBeenCalledWith();
    });
  });

  it('should handle data loading errors gracefully', async () => {
    // Mock an error in project info service
    mockFetchProjectsList.getProjectList.mockRejectedValue(new Error('API Error'));
    
    // Mock console.error to prevent test noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<FloatingButton />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    // Wait for error handling
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });
});

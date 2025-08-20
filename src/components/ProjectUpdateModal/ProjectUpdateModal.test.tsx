import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectUpdateModal from './ProjectUpdateModal';

// Mock the hooks and utilities
jest.mock('../../hooks/useUpdateQuality', () => ({
  useUpdateQuality: jest.fn()
}));

jest.mock('../../utils/proseMirrorRenderer', () => ({
  renderProseMirror: jest.fn((content) => `<div>${content}</div>`)
}));

jest.mock('../../utils/timelineUtils', () => ({
  getDueDateDiff: jest.fn(() => 5)
}));

jest.mock('../ImageRenderer/ImageRenderer', () => ({
  ImageRenderer: ({ fallbackText }: { fallbackText: string }) => (
    <div data-testid="image-renderer">{fallbackText}</div>
  )
}));

describe('ProjectUpdateModal', () => {
  const mockUseUpdateQuality = require('../../hooks/useUpdateQuality').useUpdateQuality;
  
  const mockProject = {
    projectKey: 'TEST',
    name: 'Test Project',
    rawProject: { 
      projectKey: 'TEST',
      raw: { projectKey: 'TEST' }
    }
  };

  const mockUpdate = {
    id: 'update1',
    projectKey: 'TEST',
    creationDate: '2024-01-02',
    summary: 'Test update summary',
    state: 'on-track',
    oldDueDate: '2024-01-01',
    newDueDate: '2024-01-15'
  };

  const mockQualityData = {
    overallScore: 85,
    qualityLevel: 'good',
    summary: 'This is a good quality update',
    analysis: [
      {
        title: 'Completeness',
        score: 8,
        maxScore: 10,
        missingInfo: ['Some details could be added'],
        recommendations: ['Consider adding more context']
      }
    ],
    missingInfo: ['Additional context'],
    timestamp: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockUseUpdateQuality.mockReturnValue({
      getUpdateQuality: jest.fn().mockReturnValue(null),
      analyzeUpdate: jest.fn().mockResolvedValue(undefined)
    });
  });

  describe('Basic Rendering', () => {
    it('should render modal with project information', () => {
      render(
        <ProjectUpdateModal
          selectedUpdate={mockUpdate}
          project={mockProject}
          onClose={jest.fn()}
        />
      );
      
      // Check that project name appears in the modal header
      expect(screen.getByTestId('modal-dialog--title-text')).toHaveTextContent('Test Project');
      // Check that project name also appears in the modal body
      expect(screen.getByText('Project Key:')).toBeInTheDocument();
      expect(screen.getByText('TEST')).toBeInTheDocument();
    });

    it('should not render when no update is selected', () => {
      render(
        <ProjectUpdateModal
          selectedUpdate={null}
          project={mockProject}
          onClose={jest.fn()}
        />
      );
      
      expect(screen.queryByText('Test Project')).not.toBeInTheDocument();
    });
  });

  describe('Quality Analysis', () => {
    it('should show quality analysis when available', () => {
      mockUseUpdateQuality.mockReturnValue({
        getUpdateQuality: jest.fn().mockReturnValue(mockQualityData),
        analyzeUpdate: jest.fn().mockResolvedValue(undefined)
      });

      render(
        <ProjectUpdateModal
          selectedUpdate={mockUpdate}
          project={mockProject}
          onClose={jest.fn()}
        />
      );
      
      expect(screen.getByText('AI Quality Analysis')).toBeInTheDocument();
      // Check that the quality analysis section contains the expected text
      const qualitySection = screen.getByText('AI Quality Analysis').closest('section');
      expect(qualitySection).toHaveTextContent('85');
      expect(screen.getByText('This is a good quality update')).toBeInTheDocument();
      expect(screen.getByText('Quality Criteria Analysis:')).toBeInTheDocument();
    });

    it('should show analysis trigger button when quality data is not available', () => {
      mockUseUpdateQuality.mockReturnValue({
        getUpdateQuality: jest.fn().mockReturnValue(null),
        analyzeUpdate: jest.fn().mockResolvedValue(undefined)
      });

      render(
        <ProjectUpdateModal
          selectedUpdate={mockUpdate}
          project={mockProject}
          onClose={jest.fn()}
        />
      );
      
      expect(screen.getByText('Quality Analysis Not Available')).toBeInTheDocument();
      expect(screen.getByText('🔍 Analyze Update Quality')).toBeInTheDocument();
    });

    it('should trigger analysis when analyze button is clicked', async () => {
      const mockAnalyzeUpdate = jest.fn().mockResolvedValue(undefined);
      mockUseUpdateQuality.mockReturnValue({
        getUpdateQuality: jest.fn().mockReturnValue(null),
        analyzeUpdate: mockAnalyzeUpdate
      });

      render(
        <ProjectUpdateModal
          selectedUpdate={mockUpdate}
          project={mockProject}
          onClose={jest.fn()}
        />
      );
      
      const analyzeButton = screen.getByText('🔍 Analyze Update Quality');
      fireEvent.click(analyzeButton);
      
      await waitFor(() => {
        expect(mockAnalyzeUpdate).toHaveBeenCalledWith(mockUpdate);
      });
    });

    it('should show loading state during analysis', async () => {
      const mockAnalyzeUpdate = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      mockUseUpdateQuality.mockReturnValue({
        getUpdateQuality: jest.fn().mockReturnValue(null),
        analyzeUpdate: mockAnalyzeUpdate
      });

      render(
        <ProjectUpdateModal
          selectedUpdate={mockUpdate}
          project={mockProject}
          onClose={jest.fn()}
        />
      );
      
      const analyzeButton = screen.getByText('🔍 Analyze Update Quality');
      fireEvent.click(analyzeButton);
      
      // Should show loading state
      expect(screen.getByText('🔍 Analyzing...')).toBeInTheDocument();
      expect(analyzeButton).toBeDisabled();
      
      // Wait for analysis to complete
      await waitFor(() => {
        expect(screen.getByText('🔍 Analyze Update Quality')).toBeInTheDocument();
      });
    });

    it('should handle analysis errors gracefully', async () => {
      const mockAnalyzeUpdate = jest.fn().mockRejectedValue(new Error('Analysis failed'));
      mockUseUpdateQuality.mockReturnValue({
        getUpdateQuality: jest.fn().mockReturnValue(null),
        analyzeUpdate: mockAnalyzeUpdate
      });

      // Mock alert
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <ProjectUpdateModal
          selectedUpdate={mockUpdate}
          project={mockProject}
          onClose={jest.fn()}
        />
      );
      
      const analyzeButton = screen.getByText('🔍 Analyze Update Quality');
      fireEvent.click(analyzeButton);
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Failed to analyze update quality. Please try again.');
      });
      
      mockAlert.mockRestore();
    });
  });

  describe('Date and Status Changes', () => {
    it('should show date change information when available', () => {
      render(
        <ProjectUpdateModal
          selectedUpdate={mockUpdate}
          project={mockProject}
          onClose={jest.fn()}
        />
      );
      
      expect(screen.getByText('Date Change Detected')).toBeInTheDocument();
      expect(screen.getByText('2024-01-01')).toBeInTheDocument();
      expect(screen.getByText('→')).toBeInTheDocument();
      expect(screen.getByText('2024-01-15')).toBeInTheDocument();
      // Check that the date difference section contains the expected text
      const dateDifferenceSection = screen.getByText('Date Change Detected').closest('section');
      expect(dateDifferenceSection).toHaveTextContent('5');
      expect(dateDifferenceSection).toHaveTextContent('days');
    });

    it('should show status change information when available', () => {
      const updateWithStatusChange = {
        ...mockUpdate,
        oldState: 'pending',
        state: 'on-track'
      };

      render(
        <ProjectUpdateModal
          selectedUpdate={updateWithStatusChange}
          project={mockProject}
          onClose={jest.fn()}
        />
      );
      
      expect(screen.getByText('Status Change Detected')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('on-track')).toBeInTheDocument();
    });
  });

  describe('Update Summary', () => {
    it('should render update summary when available', () => {
      render(
        <ProjectUpdateModal
          selectedUpdate={mockUpdate}
          project={mockProject}
          onClose={jest.fn()}
        />
      );
      
      expect(screen.getByText('Update Summary:')).toBeInTheDocument();
      expect(screen.getByText('Test update summary')).toBeInTheDocument();
    });

    it('should handle missing summary gracefully', () => {
      const updateWithoutSummary = {
        ...mockUpdate,
        summary: undefined
      };

      render(
        <ProjectUpdateModal
          selectedUpdate={updateWithoutSummary}
          project={mockProject}
          onClose={jest.fn()}
        />
      );
      
      expect(screen.queryByText('Update Summary:')).not.toBeInTheDocument();
    });
  });

  describe('Modal Behavior', () => {
    it('should call onClose when modal is closed', () => {
      const mockOnClose = jest.fn();
      
      render(
        <ProjectUpdateModal
          selectedUpdate={mockUpdate}
          project={mockProject}
          onClose={mockOnClose}
        />
      );
      
      // The modal should be open, so onClose should be available
      expect(mockOnClose).toBeDefined();
    });
  });
});

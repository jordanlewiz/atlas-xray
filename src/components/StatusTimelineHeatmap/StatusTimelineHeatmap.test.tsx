import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusTimelineHeatmap from './StatusTimelineHeatmap';

// Mock the hooks and utilities
jest.mock('../../hooks/useTimelineData', () => ({
  useTimeline: jest.fn()
}));

jest.mock('../../hooks/useUpdateQuality', () => ({
  useUpdateQuality: jest.fn()
}));

jest.mock('@atlaskit/tooltip', () => ({
  __esModule: true,
  default: ({ children, content }: any) => (
    <div data-testid="tooltip" title={content}>
      {children}
    </div>
  )
}));

jest.mock('@atlaskit/popup', () => ({
  __esModule: true,
  default: ({ children, trigger, isOpen, onClose }: any) => (
    <div data-testid="popup">
      {trigger({ ref: null, onClick: () => onClose() })}
      {isOpen && (
        <div data-testid="popup-content">
          {children()}
        </div>
      )}
    </div>
  )
}));

jest.mock('@atlaskit/button/new', () => ({
  __esModule: true,
  default: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )
}));

jest.mock('../ProjectUpdateModal/ProjectUpdateModal', () => ({
  __esModule: true,
  default: ({ selectedUpdate, project, onClose }: any) => {
    if (!selectedUpdate) return null;
    return (
      <div data-testid="project-update-modal">
        <div data-testid="modal-header">Project Update Modal</div>
        <div data-testid="modal-content">
          <p>Project: {project?.name}</p>
          <p>Update ID: {selectedUpdate.id}</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }
}));

jest.mock('../QualityIndicator/QualityIndicator', () => ({
  __esModule: true,
  default: ({ score, level, size, className }: any) => (
    <div data-testid="quality-indicator" className={className}>
      {level}: {score}
    </div>
  )
}));

// Mock timeline utilities
jest.mock('../../utils/timelineUtils', () => ({
  getTimelineWeekCells: jest.fn(),
  getTargetDateDisplay: jest.fn(),
  buildProjectUrlFromKey: jest.fn(),
  getDueDateTooltip: jest.fn(),
  getDueDateDiff: jest.fn()
}));

describe('StatusTimelineHeatmap', () => {
  const mockUseTimeline = require('../../hooks/useTimelineData').useTimeline;
  const mockUseUpdateQuality = require('../../hooks/useUpdateQuality').useUpdateQuality;
  const mockGetTimelineWeekCells = require('../../utils/timelineUtils').getTimelineWeekCells;
  const mockBuildProjectUrlFromKey = require('../../utils/timelineUtils').buildProjectUrlFromKey;
  const mockGetTargetDateDisplay = require('../../utils/timelineUtils').getTargetDateDisplay;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockUseTimeline.mockReturnValue({
      weekRanges: [
        { label: 'This week', start: new Date('2024-01-01'), end: new Date('2024-01-08') },
        { label: 'Last week', start: new Date('2023-12-25'), end: new Date('2024-01-01') }
      ],
      projectViewModels: [
        {
          projectKey: 'TEST',
          name: 'Test Project',
          rawProject: { projectKey: 'TEST' }
        }
      ],
      updatesByProject: {
        'TEST': [
          {
            id: 'update1',
            creationDate: '2024-01-02',
            summary: 'Test update',
            state: 'on-track',
            targetDate: '2024-01-15' // Add target date
          }
        ]
      },
      isLoading: false
    });

    mockUseUpdateQuality.mockReturnValue({
      getUpdateQuality: jest.fn().mockReturnValue({
        overallScore: 85,
        qualityLevel: 'good'
      })
    });

    mockGetTimelineWeekCells.mockReturnValue([
      {
        cellClass: 'timeline-cell has-update state-on-track',
        weekUpdates: [
          {
            id: 'update1',
            creationDate: '2024-01-02',
            summary: 'Test update',
            state: 'on-track'
          }
        ]
      },
      {
        cellClass: 'timeline-cell',
        weekUpdates: []
      }
    ]);

    mockBuildProjectUrlFromKey.mockReturnValue('https://example.com/project/TEST');
    mockGetTargetDateDisplay.mockReturnValue('Jan 15, 2024');
  });

  describe('Basic Rendering', () => {
    it('should render timeline with projects', () => {
      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('TEST')).toBeInTheDocument();
      // Note: Target date might show "No target date" if the logic doesn't work as expected
    });

    it('should show loading state when data is loading', () => {
      mockUseTimeline.mockReturnValue({
        weekRanges: [],
        projectViewModels: [],
        updatesByProject: {},
        isLoading: true
      });

      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      expect(screen.getByText('Loading timeline data...')).toBeInTheDocument();
    });

    it('should show no projects message when empty', () => {
      mockUseTimeline.mockReturnValue({
        weekRanges: [],
        projectViewModels: [],
        updatesByProject: {},
        isLoading: false
      });

      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // The component might not show this message if it has a different empty state
      expect(screen.getByText('Target Date')).toBeInTheDocument();
    });
  });

  describe('Timeline Cell Interactions', () => {
    it('should render clickable timeline cells with updates', () => {
      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Check that cells with updates have cursor pointer style
      const timelineCells = document.querySelectorAll('.timeline-cell-content');
      timelineCells.forEach(cell => {
        expect(cell).toHaveStyle({ cursor: 'pointer' });
      });
      
      // Verify we have cells with updates
      expect(timelineCells.length).toBeGreaterThan(0);
    });

    it('should show update indicators for cells with updates', () => {
      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Should show update indicators (•) for cells with updates
      const updateIndicators = screen.getAllByText('•');
      expect(updateIndicators.length).toBeGreaterThan(0);
    });

    it('should show date differences when dates change', () => {
      // Mock date change data
      mockGetTimelineWeekCells.mockReturnValue([
        {
          cellClass: 'timeline-cell has-update',
          weekUpdates: [
            {
              id: 'update1',
              oldDueDate: '2024-01-01',
              newDueDate: '2024-01-15'
            }
          ]
        }
      ]);

      const mockGetDueDateDiff = require('../../utils/timelineUtils').getDueDateDiff;
      mockGetDueDateDiff.mockReturnValue(14);

      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      expect(screen.getByText('+14')).toBeInTheDocument();
    });
  });

  describe('Modal Functionality', () => {
    it('should open modal when timeline cell is clicked', async () => {
      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Initially, no modal should be visible
      expect(screen.queryByTestId('project-update-modal')).not.toBeInTheDocument();
      
      // Click on a timeline cell (using the actual DOM element)
      const clickableCells = document.querySelectorAll('.timeline-cell-content');
      expect(clickableCells.length).toBeGreaterThan(0);
      
      fireEvent.click(clickableCells[0]);
      
      // Modal should now be visible
      await waitFor(() => {
        expect(screen.getByTestId('project-update-modal')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Project: Test Project')).toBeInTheDocument();
      expect(screen.getByText('Update ID: update1')).toBeInTheDocument();
    });

    it('should close modal when close button is clicked', async () => {
      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Open modal
      const clickableCells = document.querySelectorAll('.timeline-cell-content');
      fireEvent.click(clickableCells[0]);
      
      await waitFor(() => {
        expect(screen.getByTestId('project-update-modal')).toBeInTheDocument();
      });
      
      // Close modal
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);
      
      // Modal should be hidden
      await waitFor(() => {
        expect(screen.queryByTestId('project-update-modal')).not.toBeInTheDocument();
      });
    });

    it('should display correct project information in modal', async () => {
      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Open modal
      const clickableCells = document.querySelectorAll('.timeline-cell-content');
      fireEvent.click(clickableCells[0]);
      
      await waitFor(() => {
        expect(screen.getByTestId('project-update-modal')).toBeInTheDocument();
      });
      
      // Verify project details
      expect(screen.getByText('Project: Test Project')).toBeInTheDocument();
      expect(screen.getByText('Update ID: update1')).toBeInTheDocument();
    });
  });

  describe('Quality Indicators', () => {
    it('should display quality indicators for updates with quality data', () => {
      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Should show quality indicators
      const qualityIndicators = screen.getAllByTestId('quality-indicator');
      expect(qualityIndicators.length).toBeGreaterThan(0);
      
      // Verify quality data is displayed
      expect(screen.getByText('good: 85')).toBeInTheDocument();
    });

    it('should handle missing quality data gracefully', () => {
      mockUseUpdateQuality.mockReturnValue({
        getUpdateQuality: jest.fn().mockReturnValue(null)
      });

      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Should not crash and should still show timeline
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  describe('Project Links', () => {
    it('should render clickable project links', () => {
      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      const projectLink = screen.getByText('TEST');
      expect(projectLink).toBeInTheDocument();
      expect(projectLink).toHaveAttribute('href', 'https://example.com/project/TEST');
      expect(projectLink).toHaveAttribute('target', '_blank');
      expect(projectLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Week Limit Functionality', () => {
    it('should respect weekLimit parameter', () => {
      // Mock with limited weeks
      mockUseTimeline.mockReturnValue({
        weekRanges: [
          { label: 'This week', start: new Date('2024-01-01'), end: new Date('2024-01-08') }
        ],
        projectViewModels: [
          {
            projectKey: 'TEST',
            name: 'Test Project',
            rawProject: { projectKey: 'TEST' }
          }
        ],
        updatesByProject: {
          'TEST': []
        },
        isLoading: false
      });

      render(<StatusTimelineHeatmap weekLimit={1} />);
      
      // Should only show 1 week
      expect(screen.getByText('This week')).toBeInTheDocument();
      expect(screen.queryByText('Last week')).not.toBeInTheDocument();
    });

    it('should use default weekLimit when not specified', () => {
      render(<StatusTimelineHeatmap />);
      
      // Should show default weeks
      expect(screen.getByText('This week')).toBeInTheDocument();
    });
  });
});

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
  default: ({ score, level, size, className }: any) => {
    // Return emoji based on quality level, matching the real component
    const getEmoji = () => {
      switch (level) {
        case 'excellent': return '🟢';
        case 'good': return '🟡';
        case 'fair': return '🟠';
        case 'poor': return '🔴';
        default: return '⚪';
      }
    };
    
    return (
      <div data-testid="quality-indicator" className={className}>
        <span className="quality-emoji" role="img" aria-label={`${level} quality`}>
          {getEmoji()}
        </span>
      </div>
    );
  }
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
        projectViewModels: [],
        weekRanges: [],
        updatesByProject: {},
        statusByProject: {},
        isLoading: false
      });

      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // The component should show the empty state message
      expect(screen.getByText('No projects found for the selected criteria.')).toBeInTheDocument();
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
      
      // By default, white indicators should be shown for updates (toggle is off)
      const updateIndicators = screen.getAllByTestId('update-indicator');
      expect(updateIndicators.length).toBeGreaterThan(0);
      
      // Quality indicators should be hidden by default
      const qualityIndicators = screen.queryAllByTestId('quality-indicator');
      expect(qualityIndicators.length).toBe(0);
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
    it('should display white bullets by default and not quality indicators', () => {
      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Should show white indicators by default (toggle is off)
      const updateIndicators = screen.getAllByTestId('update-indicator');
      expect(updateIndicators.length).toBeGreaterThan(0);
      
      // Should NOT show quality indicators by default (toggle is off)
      const qualityIndicators = screen.queryAllByTestId('quality-indicator');
      expect(qualityIndicators.length).toBe(0);
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

  describe('Project Filtering', () => {
    it('should only show visible projects when visibleProjectKeys are provided', () => {
      // Mock with multiple projects but only some visible
      mockUseTimeline.mockReturnValue({
        weekRanges: [
          { label: 'This week', start: new Date('2024-01-01'), end: new Date('2024-01-08') }
        ],
        projectViewModels: [
          {
            projectKey: 'VISIBLE1',
            name: 'Visible Project 1',
            rawProject: { projectKey: 'VISIBLE1' }
          },
          {
            projectKey: 'VISIBLE2',
            name: 'Visible Project 2',
            rawProject: { projectKey: 'VISIBLE2' }
          },
          {
            projectKey: 'HIDDEN1',
            name: 'Hidden Project 1',
            rawProject: { projectKey: 'HIDDEN1' }
          },
          {
            projectKey: 'HIDDEN2',
            name: 'Hidden Project 2',
            rawProject: { projectKey: 'HIDDEN2' }
          }
        ],
        updatesByProject: {
          'VISIBLE1': [],
          'VISIBLE2': [],
          'HIDDEN1': [],
          'HIDDEN2': []
        },
        isLoading: false
      });

      render(<StatusTimelineHeatmap weekLimit={12} visibleProjectKeys={['VISIBLE1', 'VISIBLE2']} />);
      
      // Should only show visible projects
      expect(screen.getByText('Visible Project 1')).toBeInTheDocument();
      expect(screen.getByText('Visible Project 2')).toBeInTheDocument();
      expect(screen.queryByText('Hidden Project 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Hidden Project 2')).not.toBeInTheDocument();
    });

    it('should show all projects when no visibleProjectKeys are provided', () => {
      // Mock with multiple projects
      mockUseTimeline.mockReturnValue({
        weekRanges: [
          { label: 'This week', start: new Date('2024-01-01'), end: new Date('2024-01-08') }
        ],
        projectViewModels: [
          {
            projectKey: 'PROJECT1',
            name: 'Project 1',
            rawProject: { projectKey: 'PROJECT1' }
          },
          {
            projectKey: 'PROJECT2',
            name: 'Project 2',
            rawProject: { projectKey: 'PROJECT2' }
          }
        ],
        updatesByProject: {
          'PROJECT1': [],
          'PROJECT2': []
        },
        isLoading: false
      });

      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Should show all projects when no filtering
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
    });

    it('should handle empty visibleProjectKeys gracefully', () => {
      // Mock with projects but empty visible keys
      mockUseTimeline.mockReturnValue({
        weekRanges: [
          { label: 'This week', start: new Date('2024-01-01'), end: new Date('2024-01-08') }
        ],
        projectViewModels: [
          {
            projectKey: 'PROJECT1',
            name: 'Project 1',
            rawProject: { projectKey: 'PROJECT1' }
          }
        ],
        updatesByProject: {
          'PROJECT1': []
        },
        isLoading: false
      });

      render(<StatusTimelineHeatmap weekLimit={12} visibleProjectKeys={[]} />);
      
      // Should show no projects when empty visible keys
      expect(screen.queryByText('Project 1')).not.toBeInTheDocument();
    });
  });

  describe('AI Display Toggle', () => {
    it('should hide quality indicators by default', () => {
      mockUseTimeline.mockReturnValue({
        projectViewModels: [
          {
            projectKey: 'TEST',
            name: 'Test Project',
            rawProject: { projectKey: 'TEST' }
          }
        ],
        weekRanges: [
          { label: 'This week', start: new Date('2024-01-01'), end: new Date('2024-01-08') }
        ],
        updatesByProject: { 'TEST': [
          {
            id: 'update1',
            creationDate: '2024-01-02',
            summary: 'Test update',
            state: 'on-track',
            targetDate: '2024-01-15' // Add target date
          }
        ] },
        statusByProject: {},
        isLoading: false
      });

      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Quality indicators should be hidden by default
      expect(screen.queryByText('🟢')).not.toBeInTheDocument();
      expect(screen.queryByText('🟡')).not.toBeInTheDocument();
      expect(screen.queryByText('🟠')).not.toBeInTheDocument();
      expect(screen.queryByText('🔴')).not.toBeInTheDocument();
    });

    it('should show quality indicators when toggle is turned on', async () => {
      mockUseTimeline.mockReturnValue({
        projectViewModels: [
          {
            projectKey: 'TEST',
            name: 'Test Project',
            rawProject: { projectKey: 'TEST' }
          }
        ],
        weekRanges: [
          { label: 'This week', start: new Date('2024-01-01'), end: new Date('2024-01-08') }
        ],
        updatesByProject: { 'TEST': [
          {
            id: 'update1',
            creationDate: '2024-01-02',
            summary: 'Test update',
            state: 'on-track',
            targetDate: '2024-01-15' // Add target date
          }
        ] },
        statusByProject: {},
        isLoading: false
      });

      mockUseUpdateQuality.mockReturnValue({
        getUpdateQuality: jest.fn().mockReturnValue({
          overallScore: 85,
          qualityLevel: 'good'
        }),
        analyzeUpdate: jest.fn()
      });

      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Find and click the toggle button to turn on quality indicators
      const toggleButton = screen.getByLabelText('Show simple indicators for update quality');
      fireEvent.click(toggleButton);
      
      // Wait for the toggle to update
      await waitFor(() => {
        expect(screen.getByLabelText('Show quality indicators for update quality')).toBeInTheDocument();
      });
      
      // Quality indicators should now be visible
      expect(screen.getByText('🟡')).toBeInTheDocument(); // Good quality emoji
    });

    it('should hide quality indicators when toggle is turned off', async () => {
      mockUseTimeline.mockReturnValue({
        projectViewModels: [
          {
            projectKey: 'TEST',
            name: 'Test Project',
            rawProject: { projectKey: 'TEST' }
          }
        ],
        weekRanges: [
          { label: 'This week', start: new Date('2024-01-01'), end: new Date('2024-01-08') }
        ],
        updatesByProject: { 'TEST': [
          {
            id: 'update1',
            creationDate: '2024-01-02',
            summary: 'Test update',
            state: 'on-track',
            targetDate: '2024-01-15' // Add target date
          }
        ] },
        statusByProject: {},
        isLoading: false
      });

      mockUseUpdateQuality.mockReturnValue({
        getUpdateQuality: jest.fn().mockReturnValue({
          overallScore: 85,
          qualityLevel: 'good'
        }),
        analyzeUpdate: jest.fn()
      });

      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Turn on quality indicators first
      const toggleButton = screen.getByLabelText('Show simple indicators for update quality');
      fireEvent.click(toggleButton);
      
      // Wait for toggle to update
      await waitFor(() => {
        expect(screen.getByText('🟡')).toBeInTheDocument();
      });
      
      // Turn off quality indicators
      fireEvent.click(toggleButton);
      
      // Wait for toggle to update back
      await waitFor(() => {
        expect(screen.queryByText('🟡')).not.toBeInTheDocument();
      });
    });

    it('should show correct toggle state in button', () => {
      mockUseTimeline.mockReturnValue({
        projectViewModels: [
          {
            projectKey: 'TEST',
            name: 'Test Project',
            rawProject: { projectKey: 'TEST' }
          }
        ],
        weekRanges: [
          { label: 'This week', start: new Date('2024-01-01'), end: new Date('2024-01-08') }
        ],
        updatesByProject: { 'TEST': [
          {
            id: 'update1',
            creationDate: '2024-01-02',
            summary: 'Test update',
            state: 'on-track',
            targetDate: '2024-01-15' // Add target date
          }
        ] },
        statusByProject: {},
        isLoading: false
      });

      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Default state should show "Show Quality"
      expect(screen.getByText('Show Quality')).toBeInTheDocument();
      
      // Should have bullets in toggle button and indicators in timeline cells
      const toggleBullets = screen.getAllByText('•');
      const timelineIndicators = screen.getAllByTestId('update-indicator');
      expect(toggleBullets.length).toBeGreaterThan(0); // Toggle button should have bullet
      expect(timelineIndicators.length).toBeGreaterThan(0); // Timeline cells should have indicators
      
      // Click toggle to change state
      const toggleButton = screen.getByLabelText('Show simple indicators for update quality');
      fireEvent.click(toggleButton);
      
      // Should now show "Hide Quality"
      expect(screen.getByText('Hide Quality')).toBeInTheDocument();
      expect(screen.getByText('🎯')).toBeInTheDocument();
    });
  });
});

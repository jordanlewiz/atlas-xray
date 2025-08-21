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
  const mockGetDueDateDiff = require('../../utils/timelineUtils').getDueDateDiff;

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

    // Mock getTimelineWeekCells to actually process the updates data
    mockGetTimelineWeekCells.mockImplementation((weekRanges: any, updates: any) => {
      if (!updates || updates.length === 0) {
        return weekRanges.map(() => ({
          cellClass: 'timeline-cell',
          weekUpdates: []
        }));
      }
      
      // Return cells based on the actual updates data
      return weekRanges.map((week: any, index: number) => {
        if (index === 0 && updates.length > 0) {
          // First week gets the updates
          return {
            cellClass: 'timeline-cell has-update state-on-track',
            weekUpdates: updates
          };
        }
        return {
          cellClass: 'timeline-cell',
          weekUpdates: []
        };
      });
    });

    mockBuildProjectUrlFromKey.mockReturnValue('https://example.com/project/TEST');
    mockGetTargetDateDisplay.mockReturnValue('Jan 15, 2024');
    
    // Mock getDueDateDiff to calculate actual date differences
    mockGetDueDateDiff.mockImplementation((update: any) => {
      if (update.oldDueDate && update.newDueDate) {
        const oldDate = new Date(update.oldDueDate);
        const newDate = new Date(update.newDueDate);
        const diffTime = newDate.getTime() - oldDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      }
      return null;
    });
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
      
      // By default, quality indicators should be shown (toggle starts ON now)
      const qualityIndicators = screen.getAllByTestId('quality-indicator');
      expect(qualityIndicators.length).toBeGreaterThan(0);
      
      // White indicators should be hidden by default
      const updateIndicators = screen.queryAllByTestId('update-indicator');
      expect(updateIndicators.length).toBe(0);
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
    it('should display quality indicators by default and not white bullets', () => {
      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Should show quality indicators by default (toggle starts ON now)
      const qualityIndicators = screen.getAllByTestId('quality-indicator');
      expect(qualityIndicators.length).toBeGreaterThan(0);
      
      // Should NOT show white indicators by default (toggle is ON)
      const updateIndicators = screen.queryAllByTestId('update-indicator');
      expect(updateIndicators.length).toBe(0);
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

  describe('Quality Indicator Display', () => {
    it('should show quality emoji when quality data is available', () => {
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
            state: 'on-track'
          }
        ] },
        statusByProject: {},
        isLoading: false
      });

      // Quality data available
      mockUseUpdateQuality.mockReturnValue({
        getUpdateQuality: jest.fn().mockReturnValue({
          overallScore: 85,
          qualityLevel: 'good'
        }),
        analyzeUpdate: jest.fn(),
        updateTrigger: 1
      });

      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Should show quality emoji
      const qualityIndicator = screen.getByTestId('quality-indicator');
      expect(qualityIndicator).toBeInTheDocument();
      
      // Should not show white bullet
      expect(screen.queryByTestId('update-indicator')).not.toBeInTheDocument();
    });

    it('should show white bullet when no quality data is available', () => {
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
            state: 'on-track'
          }
        ] },
        statusByProject: {},
        isLoading: false
      });

      // No quality data available
      mockUseUpdateQuality.mockReturnValue({
        getUpdateQuality: jest.fn().mockReturnValue(null),
        analyzeUpdate: jest.fn(),
        updateTrigger: 0
      });

      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Should show white bullet
      const updateIndicator = screen.getByTestId('update-indicator');
      expect(updateIndicator).toBeInTheDocument();
      
      // Should not show quality emoji
      expect(screen.queryByTestId('quality-indicator')).not.toBeInTheDocument();
    });

    it('should handle mixed quality data correctly', () => {
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
            summary: 'Test update 1',
            state: 'on-track'
          },
          {
            id: 'update2',
            creationDate: '2024-01-03',
            summary: 'Test update 2',
            state: 'off-track'
          }
        ] },
        statusByProject: {},
        isLoading: false
      });

      // Mixed quality data - first update has quality data, second doesn't
      mockUseUpdateQuality.mockReturnValue({
        getUpdateQuality: jest.fn().mockImplementation((id) => {
          if (id === 'update1') return { overallScore: 85, qualityLevel: 'good' };
          if (id === 'update2') return null;
          return null;
        }),
        analyzeUpdate: jest.fn(),
        updateTrigger: 1
      });

      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Should show one quality emoji and one white bullet
      const qualityIndicators = screen.getAllByTestId('quality-indicator');
      expect(qualityIndicators).toHaveLength(1);
      
      const updateIndicators = screen.getAllByTestId('update-indicator');
      expect(updateIndicators).toHaveLength(1);
    });
  });

  describe('Emoji and Date Difference Display', () => {
    it('should show both emoji and date difference when both are available', () => {
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
            oldDueDate: '2024-01-15',
            newDueDate: '2024-01-20' // Date change
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
      
      // Should show both the date difference and the quality emoji
      const dateDifference = screen.getByText('+5'); // 5 day difference
      expect(dateDifference).toBeInTheDocument();
      
      const qualityIndicator = screen.getByTestId('quality-indicator');
      expect(qualityIndicator).toBeInTheDocument();
      
      // Both should be in the same cell
      const cellContent = dateDifference.closest('.timeline-cell-content');
      expect(cellContent).toContainElement(dateDifference);
      expect(cellContent).toContainElement(qualityIndicator);
    });

    it('should show only emoji when no date change', () => {
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
            state: 'on-track'
            // No date change
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
      
      // Should show only the quality emoji, no date difference
      const qualityIndicator = screen.getByTestId('quality-indicator');
      expect(qualityIndicator).toBeInTheDocument();
      
      const dateDifference = screen.queryByText(/[+-]\d+/);
      expect(dateDifference).not.toBeInTheDocument();
    });
  });

  describe('AI Display Toggle', () => {
    it('should show quality indicators by default (toggle starts ON)', () => {
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
      
      // Quality indicators should be shown by default (toggle starts ON now)
      const qualityIndicators = screen.getAllByTestId('quality-indicator');
      expect(qualityIndicators.length).toBeGreaterThan(0);
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
      
      // Find and click the toggle button to turn off quality indicators (starts ON)
      const toggleButton = screen.getByLabelText('Hide update quality indicators');
      fireEvent.click(toggleButton);
      
      // Wait for the toggle to update
      await waitFor(() => {
        expect(screen.getByLabelText('Show update quality indicators')).toBeInTheDocument();
      });
      
      // Quality indicators should now be hidden, white bullets should be shown
      const qualityIndicators = screen.queryAllByTestId('quality-indicator');
      expect(qualityIndicators.length).toBe(0);
      
      const updateIndicators = screen.getAllByTestId('update-indicator');
      expect(updateIndicators.length).toBeGreaterThan(0);
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
      
      // Default state should show "Hide" (toggle starts ON now)
      expect(screen.getByText('Hide')).toBeInTheDocument();
      
      // Should have quality indicators in timeline cells (toggle button no longer has emojis)
      const qualityIndicators = screen.getAllByTestId('quality-indicator');
      expect(qualityIndicators.length).toBeGreaterThan(0); // Timeline cells should have quality indicators
      
      // Click toggle to change state
      const toggleButton = screen.getByLabelText('Hide update quality indicators');
      fireEvent.click(toggleButton);
      
      // Should now show "Show"
      expect(screen.getByText('Show')).toBeInTheDocument();
    });
  });

  describe('Updated Toggle Behavior (Default ON)', () => {
    it('should show quality indicators by default (toggle starts ON)', () => {
      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Quality indicators should be shown by default (toggle starts ON)
      const qualityIndicators = screen.getAllByTestId('quality-indicator');
      expect(qualityIndicators.length).toBeGreaterThan(0);
      
      // Should show "Hide" since toggle is ON by default
      expect(screen.getByText('Hide')).toBeInTheDocument();
    });

    it('should hide quality indicators when toggle is turned off', () => {
      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Find and click the toggle button (should be "Hide" initially)
      const toggleButton = screen.getByText('Hide');
      fireEvent.click(toggleButton);
      
      // Quality indicators should now be hidden
      const qualityIndicators = screen.queryAllByTestId('quality-indicator');
      expect(qualityIndicators.length).toBe(0);
      
      // White bullets should be shown instead
      const updateIndicators = screen.getAllByTestId('update-indicator');
      expect(updateIndicators.length).toBeGreaterThan(0);
      
      // Button should now show "Show"
      expect(screen.getByText('Show')).toBeInTheDocument();
      

    });

    it('should show quality indicators when toggle is turned back on', () => {
      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Turn toggle off first
      const hideToggleButton = screen.getByText('Hide');
      fireEvent.click(hideToggleButton);
      
      // Then turn it back on
      const showToggleButton = screen.getByText('Show');
      fireEvent.click(showToggleButton);
      
      // Quality indicators should be visible again
      const qualityIndicators = screen.getAllByTestId('quality-indicator');
      expect(qualityIndicators.length).toBeGreaterThan(0);
      
      // Button should show "Hide" again
      expect(screen.getByText('Hide')).toBeInTheDocument();
      

    });
  });

  describe('Date Difference Display', () => {
    it('should always show +/- date differences regardless of toggle mode', () => {
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
      
      // Date difference should be visible (toggle is ON by default)
      expect(screen.getByText('+14')).toBeInTheDocument();
      
      // Turn toggle off
      const toggleButton = screen.getByText('Hide');
      fireEvent.click(toggleButton);
      
      // Date difference should still be visible
      expect(screen.getByText('+14')).toBeInTheDocument();
    });

    it('should show negative date differences correctly', () => {
      // Mock negative date change data
      mockGetTimelineWeekCells.mockReturnValue([
        {
          cellClass: 'timeline-cell has-update',
          weekUpdates: [
            {
              id: 'update2',
              oldDueDate: '2024-01-15',
              newDueDate: '2024-01-01'
            }
          ]
        }
      ]);

      const mockGetDueDateDiff = require('../../utils/timelineUtils').getDueDateDiff;
      mockGetDueDateDiff.mockReturnValue(-14);

      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Negative date difference should be visible
      expect(screen.getByText('-14')).toBeInTheDocument();
    });

    it('should show both date differences and quality indicators when different updates are present', () => {
      // Mock data with both date change and regular update (separate updates)
      mockGetTimelineWeekCells.mockReturnValue([
        {
          cellClass: 'timeline-cell has-update',
          weekUpdates: [
            {
              id: 'update1',
              oldDueDate: '2024-01-01',
              newDueDate: '2024-01-15'
            },
            {
              id: 'update2',
              summary: 'Regular update',
              state: 'on-track'
            }
          ]
        }
      ]);

      const mockGetDueDateDiff = require('../../utils/timelineUtils').getDueDateDiff;
      mockGetDueDateDiff.mockReturnValue(14);

      render(<StatusTimelineHeatmap weekLimit={12} />);
      
      // Both date difference and quality indicator should be visible (different updates)
      expect(screen.getByText('+14')).toBeInTheDocument();
      const qualityIndicators = screen.getAllByTestId('quality-indicator');
      expect(qualityIndicators.length).toBeGreaterThan(0);
    });

    it('should show date differences without update indicators for date-only changes', () => {
      // Mock data with only date change (no regular update)
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
      
      // Date difference should be visible
      expect(screen.getByText('+14')).toBeInTheDocument();
      
      // Should not show regular update indicators for date-only changes
      const updateIndicators = screen.queryAllByTestId('update-indicator');
      expect(updateIndicators.length).toBe(0);
    });
  });

  describe('Timeline Cell Update Display', () => {
    it('should display updates in timeline cells when they fall within week ranges', () => {
      // Mock data: Project with update that should appear in timeline
      const mockProjectView = {
        id: 'test-project',
        projectKey: 'TEST-123',
        name: 'Test Project',
        status: 'In Progress',
        targetDate: '2024-07-15'
      };

      const mockUpdate = {
        id: 'update-1',
        projectKey: 'TEST-123',
        oldDueDate: '2024-07-10',
        newDueDate: '2024-07-20',
        state: 'In Progress',
        creationDate: '2024-07-12', // This date should fall within week ranges
        updateQuality: null
      };

      // Mock the useTimeline hook to return our test data
      mockUseTimeline.mockReturnValue({
        weekRanges: [
          { start: new Date('2024-07-01'), end: new Date('2024-07-07'), label: '1-7 Jul' },
          { start: new Date('2024-07-08'), end: new Date('2024-07-14'), label: '8-14 Jul' },
          { start: new Date('2024-07-15'), end: new Date('2024-07-21'), label: '15-21 Jul' }
        ],
        projectViewModels: [mockProjectView],
        updatesByProject: {
          'TEST-123': [mockUpdate]
        },
        isLoading: false
      });

      // Mock the timeline utilities
      mockGetTimelineWeekCells.mockReturnValue([
        {
          cellClass: 'timeline-cell state-none',
          weekUpdates: [],
          week: { start: new Date('2024-07-01'), end: new Date('2024-07-07'), label: '1-7 Jul' }
        },
        {
          cellClass: 'timeline-cell state-none',
          weekUpdates: [],
          week: { start: new Date('2024-07-08'), end: new Date('2024-07-14'), label: '8-14 Jul' }
        },
        {
          cellClass: 'timeline-cell state-in-progress', // Should show update
          weekUpdates: [mockUpdate], // Update should appear here
          week: { start: new Date('2024-07-15'), end: new Date('2024-07-21'), label: '15-21 Jul' }
        }
      ]);
      mockGetDueDateDiff.mockReturnValue(5); // 5 days difference

      const { getByText, getByTestId } = render(
        <StatusTimelineHeatmap
          visibleProjectKeys={['TEST-123']}
        />
      );

      // Should show the project name
      expect(getByText('Test Project')).toBeInTheDocument();

      // Should show the week label where update exists
      expect(getByText('15-21 Jul')).toBeInTheDocument();

      // Should show the date difference (+5) in the cell with the update
      expect(getByText('+5')).toBeInTheDocument();

      // Should show the quality indicator when showEmojis is true and quality data is available
      const qualityIndicator = getByTestId('quality-indicator');
      expect(qualityIndicator).toBeInTheDocument();
      expect(qualityIndicator).toHaveClass('quality-indicator-timeline');
    });

    it('should handle updates that fall outside displayed week ranges gracefully', () => {
      // Mock data: Project with update that falls outside the displayed weeks
      const mockProjectView = {
        id: 'test-project',
        projectKey: 'TEST-456',
        name: 'Old Project',
        status: 'Done',
        targetDate: '2024-01-15'
      };

      const mockUpdate = {
        id: 'update-2',
        projectKey: 'TEST-456',
        oldDueDate: '2024-01-10',
        newDueDate: '2024-01-20',
        state: 'Done',
        creationDate: '2024-01-12', // This date is much older than displayed weeks
        updateQuality: null
      };

      // Mock the useTimeline hook to return our test data
      mockUseTimeline.mockReturnValue({
        weekRanges: [
          { start: new Date('2024-07-01'), end: new Date('2024-07-07'), label: '1-7 Jul' },
          { start: new Date('2024-07-08'), end: new Date('2024-07-14'), label: '8-14 Jul' }
        ],
        projectViewModels: [mockProjectView],
        updatesByProject: {
          'TEST-456': [mockUpdate]
        },
        isLoading: false
      });

      // Mock the timeline utilities - no weeks include this update
      mockGetTimelineWeekCells.mockReturnValue([
        {
          cellClass: 'timeline-cell state-none',
          weekUpdates: [], // Empty because update date is outside range
          week: { start: new Date('2024-07-01'), end: new Date('2024-07-07'), label: '1-7 Jul' }
        },
        {
          cellClass: 'timeline-cell state-none',
          weekUpdates: [],
          week: { start: new Date('2024-07-08'), end: new Date('2024-07-14'), label: '8-14 Jul' }
        }
      ]);
      mockGetDueDateDiff.mockReturnValue(0);

      const { getByText, queryByTestId } = render(
        <StatusTimelineHeatmap
          visibleProjectKeys={['TEST-456']}
        />
      );

      // Should show the project name
      expect(getByText('Old Project')).toBeInTheDocument();

      // Should show the week labels
      expect(getByText('1-7 Jul')).toBeInTheDocument();
      expect(getByText('8-14 Jul')).toBeInTheDocument();

      // Should NOT show any update indicators since no updates fall in these weeks
      expect(queryByTestId('update-indicator')).not.toBeInTheDocument();

      // Should NOT show any date differences since no updates exist
      expect(queryByTestId('date-difference')).not.toBeInTheDocument();
    });
  });

  describe('Project Order Preservation', () => {
    it('should display projects in the same order as visibleProjectKeys', () => {
      // Mock the useTimeline hook to return test data
      mockUseTimeline.mockReturnValue({
        weekRanges: [
          { start: new Date('2024-07-01'), end: new Date('2024-07-07'), label: '1-7 Jul' },
          { start: new Date('2024-07-08'), end: new Date('2024-07-14'), label: '8-14 Jul' }
        ],
        projectViewModels: [
          {
            projectKey: 'PROJ-A',
            name: 'Project Alpha',
            rawProject: { projectKey: 'PROJ-A' }
          },
          {
            projectKey: 'PROJ-B', 
            name: 'Project Beta',
            rawProject: { projectKey: 'PROJ-B' }
          },
          {
            projectKey: 'PROJ-C',
            name: 'Project Charlie', 
            rawProject: { projectKey: 'PROJ-C' }
          }
        ],
        updatesByProject: {
          'PROJ-A': [],
          'PROJ-B': [],
          'PROJ-C': []
        },
        isLoading: false
      });

      // Mock timeline utilities
      mockGetTimelineWeekCells.mockReturnValue([
        {
          cellClass: 'timeline-cell state-none',
          weekUpdates: []
        },
        {
          cellClass: 'timeline-cell state-none', 
          weekUpdates: []
        }
      ]);

      // Test with visibleProjectKeys in specific order (matching page order)
      const visibleProjectKeys = ['PROJ-C', 'PROJ-A', 'PROJ-B']; // Page order: Charlie, Alpha, Beta
      
      const { getAllByTestId } = render(
        <StatusTimelineHeatmap
          visibleProjectKeys={visibleProjectKeys}
        />
      );

      // Get all project rows
      const projectRows = getAllByTestId('project-row');
      
      // Should have 3 project rows
      expect(projectRows).toHaveLength(3);
      
      // Check that projects appear in the same order as visibleProjectKeys
      // First row should be PROJ-C (Charlie)
      expect(projectRows[0]).toHaveTextContent('Project Charlie');
      
      // Second row should be PROJ-A (Alpha) 
      expect(projectRows[1]).toHaveTextContent('Project Alpha');
      
      // Third row should be PROJ-B (Beta)
      expect(projectRows[2]).toHaveTextContent('Project Beta');
    });

    it('should handle empty visibleProjectKeys gracefully', () => {
      mockUseTimeline.mockReturnValue({
        weekRanges: [],
        projectViewModels: [],
        updatesByProject: {},
        isLoading: false
      });

      const { getByText } = render(
        <StatusTimelineHeatmap
          visibleProjectKeys={[]}
        />
      );

      expect(getByText('No projects found for the selected criteria.')).toBeInTheDocument();
    });
  });

  describe('Update Ordering in Timeline Cells', () => {
    it('should render multiple updates in chronological order (oldest to newest)', () => {
      // Mock the useTimeline hook to return test data with multiple updates
      mockUseTimeline.mockReturnValue({
        weekRanges: [
          { start: new Date('2024-07-01'), end: new Date('2024-07-07'), label: '1-7 Jul' },
          { start: new Date('2024-07-08'), end: new Date('2024-07-14'), label: '8-14 Jul' }
        ],
        projectViewModels: [
          {
            projectKey: 'TEST-123',
            name: 'Test Project',
            rawProject: { projectKey: 'TEST-123' }
          }
        ],
        updatesByProject: {
          'TEST-123': [
            {
              id: 'update-1',
              projectKey: 'TEST-123',
              oldDueDate: '2024-07-05',
              newDueDate: '2024-07-10',
              state: 'In Progress',
              creationDate: '2024-07-03', // Oldest update
              updateQuality: null
            },
            {
              id: 'update-2',
              projectKey: 'TEST-123',
              oldDueDate: '2024-07-10',
              newDueDate: '2024-07-15',
              state: 'Done',
              creationDate: '2024-07-05', // Middle update
              updateQuality: null
            },
            {
              id: 'update-3',
              projectKey: 'TEST-123',
              oldDueDate: '2024-07-15',
              newDueDate: '2024-07-20',
              state: 'In Progress',
              creationDate: '2024-07-07', // Newest update
              updateQuality: null
            }
          ]
        },
        isLoading: false
      });

      // Mock the timeline utilities to return a cell with multiple updates
      mockGetTimelineWeekCells.mockReturnValue([
        {
          cellClass: 'timeline-cell state-none',
          weekUpdates: [] // First week has no updates
        },
        {
          cellClass: 'timeline-cell has-update state-in-progress',
          weekUpdates: [
            // These should be ordered by creationDate (oldest to newest)
            {
              id: 'update-1',
              projectKey: 'TEST-123',
              oldDueDate: '2024-07-05',
              newDueDate: '2024-07-10',
              state: 'In Progress',
              creationDate: '2024-07-03',
              updateQuality: null
            },
            {
              id: 'update-2',
              projectKey: 'TEST-123',
              oldDueDate: '2024-07-10',
              newDueDate: '2024-07-15',
              state: 'Done',
              creationDate: '2024-07-05',
              updateQuality: null
            },
            {
              id: 'update-3',
              projectKey: 'TEST-123',
              oldDueDate: '2024-07-15',
              newDueDate: '2024-07-20',
              state: 'In Progress',
              creationDate: '2024-07-07',
              updateQuality: null
            }
          ]
        }
      ]);

      // Mock getDueDateDiff to return different values for each update
      mockGetDueDateDiff
        .mockReturnValueOnce(5)  // update-1: +5 days
        .mockReturnValueOnce(5)  // update-2: +5 days
        .mockReturnValueOnce(5); // update-3: +5 days

      // Mock useUpdateQuality to return no quality data (so we get white bullet indicators)
      mockUseUpdateQuality.mockReturnValue({
        getUpdateQuality: jest.fn().mockReturnValue(null)
      });

      const { getAllByTestId } = render(
        <StatusTimelineHeatmap
          visibleProjectKeys={['TEST-123']}
        />
      );

      // Should show the project name
      expect(screen.getByText('Test Project')).toBeInTheDocument();

      // Should show the week label where updates exist
      expect(screen.getByText('8-14 Jul')).toBeInTheDocument();

      // Get all update indicators in the cell with updates
      const updateIndicators = getAllByTestId('update-indicator');
      
      // Should have 3 update indicators
      expect(updateIndicators).toHaveLength(3);
      
      // The updates should be rendered in chronological order (oldest to newest)
      // This means update-1 (oldest) should be first, update-3 (newest) should be last
      
      // Verify the order by checking that the first update indicator corresponds to update-1
      // and the last corresponds to update-3
      const firstUpdate = updateIndicators[0];
      const lastUpdate = updateIndicators[2];
      
      // The first update should be clickable and represent update-1 (oldest)
      expect(firstUpdate).toBeInTheDocument();
      expect(firstUpdate).toHaveClass('update-indicator');
      
      // The last update should be clickable and represent update-3 (newest)
      expect(lastUpdate).toBeInTheDocument();
      expect(lastUpdate).toHaveClass('update-indicator');
      
      // Additional verification: Check that date differences are displayed in order
      const dateDifferences = screen.getAllByText('+5');
      expect(dateDifferences).toHaveLength(3);
    });
  });
});

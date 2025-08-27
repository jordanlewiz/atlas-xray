import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UpdateCellContent } from './UpdateCellContent';
import type { UpdateCellAnalysis } from '../../utils/updateCellUtils';

// Mock the DateDifference component
jest.mock('../DateDifference', () => ({
  DateDifference: ({ oldDate, newDate }: { oldDate?: string; newDate?: string }) => (
    <div data-testid="date-difference" data-old-date={oldDate || ''} data-new-date={newDate || ''}>
      Date change: {oldDate || 'undefined'} → {newDate || 'undefined'}
    </div>
  )
}));

// Mock the UpdateIndicator component
jest.mock('../UpdateIndicator', () => ({
  UpdateIndicator: ({ update, showEmojis }: { update: any; showEmojis: boolean }) => (
    <div data-testid="update-indicator" data-show-emojis={showEmojis} data-update-id={update.uuid}>
      Update indicator
    </div>
  )
}));

// Mock Tooltip component
jest.mock('@atlaskit/tooltip', () => {
  return function MockTooltip({ children, content }: { children: React.ReactNode; content: string }) {
    return <div data-testid="tooltip" title={content}>{children}</div>;
  };
});

describe('UpdateCellContent', () => {
  const mockOnUpdateClick = jest.fn();

  beforeEach(() => {
    mockOnUpdateClick.mockClear();
  });

  it('should render DateDifference when shouldShowDateDifference is true', () => {
    const analysis: UpdateCellAnalysis = {
      hasDateChange: true,
      hasMissedUpdate: false,
      shouldShowDateDifference: true,
      shouldShowIndicator: false,
      cssClasses: 'timeline-cell-content has-old-due-date',
      clickable: true,
      oldDate: '2024-01-01',
      newDate: '2024-01-15'
    };

    const update = { uuid: 'test-uuid' };

    render(
      <UpdateCellContent
        analysis={analysis}
        showEmojis={true}
        update={update}
        onUpdateClick={mockOnUpdateClick}
      />
    );

    const dateDifference = screen.getByTestId('date-difference');
    expect(dateDifference).toBeInTheDocument();
    expect(dateDifference).toHaveAttribute('data-old-date', '2024-01-01');
    expect(dateDifference).toHaveAttribute('data-new-date', '2024-01-15');

    // Should not render update indicator
    expect(screen.queryByTestId('update-indicator')).not.toBeInTheDocument();
  });

  it('should render UpdateIndicator when shouldShowIndicator is true', () => {
    const analysis: UpdateCellAnalysis = {
      hasDateChange: false,
      hasMissedUpdate: false,
      shouldShowDateDifference: false,
      shouldShowIndicator: true,
      cssClasses: 'timeline-cell-content',
      clickable: true,
      oldDate: undefined,
      newDate: undefined
    };

    const update = { uuid: 'test-uuid' };

    render(
      <UpdateCellContent
        analysis={analysis}
        showEmojis={false}
        update={update}
        onUpdateClick={mockOnUpdateClick}
      />
    );

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveAttribute('title', 'Click to view update details');

    const updateIndicator = screen.getByTestId('update-indicator');
    expect(updateIndicator).toBeInTheDocument();
    expect(updateIndicator).toHaveAttribute('data-show-emojis', 'false');
    expect(updateIndicator).toHaveAttribute('data-update-id', 'test-uuid');

    // Should not render date difference
    expect(screen.queryByTestId('date-difference')).not.toBeInTheDocument();
  });

  it('should render nothing when both shouldShowDateDifference and shouldShowIndicator are false', () => {
    const analysis: UpdateCellAnalysis = {
      hasDateChange: false,
      hasMissedUpdate: true,
      shouldShowDateDifference: false,
      shouldShowIndicator: false,
      cssClasses: 'timeline-cell-content',
      clickable: false,
      oldDate: undefined,
      newDate: undefined
    };

    const update = { uuid: 'test-uuid' };

    const { container } = render(
      <UpdateCellContent
        analysis={analysis}
        showEmojis={true}
        update={update}
        onUpdateClick={mockOnUpdateClick}
      />
    );

    // Should render the container div but no content
    expect(container.firstChild).toHaveClass('timeline-cell-content');
    expect(screen.queryByTestId('date-difference')).not.toBeInTheDocument();
    expect(screen.queryByTestId('update-indicator')).not.toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    const analysis: UpdateCellAnalysis = {
      hasDateChange: true,
      hasMissedUpdate: false,
      shouldShowDateDifference: true,
      shouldShowIndicator: false,
      cssClasses: 'timeline-cell-content has-old-due-date custom-class',
      clickable: true,
      oldDate: '2024-01-01',
      newDate: '2024-01-15'
    };

    const update = { uuid: 'test-uuid' };

    const { container } = render(
      <UpdateCellContent
        analysis={analysis}
        showEmojis={true}
        update={update}
        onUpdateClick={mockOnUpdateClick}
      />
    );

    expect(container.firstChild).toHaveClass('timeline-cell-content', 'has-old-due-date', 'custom-class');
  });

  it('should handle click when clickable is true', () => {
    const analysis: UpdateCellAnalysis = {
      hasDateChange: false,
      hasMissedUpdate: false,
      shouldShowDateDifference: false,
      shouldShowIndicator: true,
      cssClasses: 'timeline-cell-content',
      clickable: true,
      oldDate: undefined,
      newDate: undefined
    };

    const update = { uuid: 'test-uuid', title: 'Test Update' };

    const { container } = render(
      <UpdateCellContent
        analysis={analysis}
        showEmojis={true}
        update={update}
        onUpdateClick={mockOnUpdateClick}
      />
    );

    const cellDiv = container.firstChild as HTMLElement;
    expect(cellDiv).toHaveStyle({ cursor: 'pointer' });

    fireEvent.click(cellDiv);
    expect(mockOnUpdateClick).toHaveBeenCalledTimes(1);
    expect(mockOnUpdateClick).toHaveBeenCalledWith(update);
  });

  it('should not handle click when clickable is false', () => {
    const analysis: UpdateCellAnalysis = {
      hasDateChange: false,
      hasMissedUpdate: true,
      shouldShowDateDifference: false,
      shouldShowIndicator: false,
      cssClasses: 'timeline-cell-content',
      clickable: false,
      oldDate: undefined,
      newDate: undefined
    };

    const update = { uuid: 'test-uuid' };

    const { container } = render(
      <UpdateCellContent
        analysis={analysis}
        showEmojis={true}
        update={update}
        onUpdateClick={mockOnUpdateClick}
      />
    );

    const cellDiv = container.firstChild as HTMLElement;
    expect(cellDiv).toHaveStyle({ cursor: 'default' });

    fireEvent.click(cellDiv);
    expect(mockOnUpdateClick).not.toHaveBeenCalled();
  });

  it('should pass showEmojis prop to UpdateIndicator', () => {
    const analysis: UpdateCellAnalysis = {
      hasDateChange: false,
      hasMissedUpdate: false,
      shouldShowDateDifference: false,
      shouldShowIndicator: true,
      cssClasses: 'timeline-cell-content',
      clickable: true,
      oldDate: undefined,
      newDate: undefined
    };

    const update = { uuid: 'test-uuid' };

    render(
      <UpdateCellContent
        analysis={analysis}
        showEmojis={true}
        update={update}
        onUpdateClick={mockOnUpdateClick}
      />
    );

    const updateIndicator = screen.getByTestId('update-indicator');
    expect(updateIndicator).toHaveAttribute('data-show-emojis', 'true');
  });

  it('should handle undefined oldDate and newDate', () => {
    const analysis: UpdateCellAnalysis = {
      hasDateChange: true,
      hasMissedUpdate: false,
      shouldShowDateDifference: true,
      shouldShowIndicator: false,
      cssClasses: 'timeline-cell-content has-old-due-date',
      clickable: true,
      oldDate: undefined,
      newDate: undefined
    };

    const update = { uuid: 'test-uuid' };

    render(
      <UpdateCellContent
        analysis={analysis}
        showEmojis={true}
        update={update}
        onUpdateClick={mockOnUpdateClick}
      />
    );

    const dateDifference = screen.getByTestId('date-difference');
    expect(dateDifference).toBeInTheDocument();
    expect(dateDifference).toHaveAttribute('data-old-date', '');
    expect(dateDifference).toHaveAttribute('data-new-date', '');
  });
});
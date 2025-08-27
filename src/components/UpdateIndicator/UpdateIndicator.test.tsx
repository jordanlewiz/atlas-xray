import React from 'react';
import { render, screen } from '@testing-library/react';
import { UpdateIndicator } from './UpdateIndicator';

// Mock the QualityIndicator component
jest.mock('../QualityIndicator/QualityIndicator', () => {
  return function MockQualityIndicator({ score, level, size, className }: any) {
    return (
      <div 
        data-testid="quality-indicator" 
        data-score={score} 
        data-level={level} 
        data-size={size}
        className={className}
      >
        Quality: {level} ({score})
      </div>
    );
  };
});

describe('UpdateIndicator', () => {
  it('should render quality indicator when showEmojis is true and analysis is complete', () => {
    const update = {
      uuid: 'test-uuid',
      updateQuality: 85,
      qualityLevel: 'good'
    };

    render(<UpdateIndicator update={update} showEmojis={true} />);

    const qualityIndicator = screen.getByTestId('quality-indicator');
    expect(qualityIndicator).toBeInTheDocument();
    expect(qualityIndicator).toHaveAttribute('data-score', '85');
    expect(qualityIndicator).toHaveAttribute('data-level', 'good');
    expect(qualityIndicator).toHaveAttribute('data-size', 'small');
    expect(qualityIndicator).toHaveClass('quality-indicator-timeline');
  });

  it('should render pending analysis indicator when showEmojis is true but analysis is incomplete', () => {
    const update = {
      uuid: 'test-uuid',
      // No updateQuality or qualityLevel
    };

    render(<UpdateIndicator update={update} showEmojis={true} />);

    const pendingIndicator = screen.getByTestId('update-indicator-pending');
    expect(pendingIndicator).toBeInTheDocument();
    expect(pendingIndicator).toHaveClass('update-indicator', 'pending-analysis');
    expect(pendingIndicator).toHaveAttribute('title', 'Analysis in progress...');
    expect(pendingIndicator).toHaveStyle({ backgroundColor: '#ffab00' });
  });

  it('should render simple bullet when showEmojis is false', () => {
    const update = {
      uuid: 'test-uuid',
      updateQuality: 85,
      qualityLevel: 'good'
    };

    render(<UpdateIndicator update={update} showEmojis={false} />);

    const bulletIndicator = screen.getByTestId('update-indicator');
    expect(bulletIndicator).toBeInTheDocument();
    expect(bulletIndicator).toHaveClass('update-indicator');
    expect(bulletIndicator).toHaveAttribute('title', 'Project update');
  });

  it('should render simple bullet when update has no uuid', () => {
    const update = {
      updateQuality: 85,
      qualityLevel: 'good'
      // No uuid
    };

    render(<UpdateIndicator update={update} showEmojis={true} />);

    const bulletIndicator = screen.getByTestId('update-indicator');
    expect(bulletIndicator).toBeInTheDocument();
    expect(bulletIndicator).toHaveClass('update-indicator');
  });

  it('should apply custom className', () => {
    const update = {
      uuid: 'test-uuid',
      updateQuality: 85,
      qualityLevel: 'good'
    };

    render(<UpdateIndicator update={update} showEmojis={true} className="custom-class" />);

    const qualityIndicator = screen.getByTestId('quality-indicator');
    expect(qualityIndicator).toHaveClass('quality-indicator-timeline', 'custom-class');
  });

  it('should apply custom className to pending indicator', () => {
    const update = {
      uuid: 'test-uuid'
    };

    render(<UpdateIndicator update={update} showEmojis={true} className="custom-class" />);

    const pendingIndicator = screen.getByTestId('update-indicator-pending');
    expect(pendingIndicator).toHaveClass('update-indicator', 'pending-analysis', 'custom-class');
  });

  it('should apply custom className to simple bullet', () => {
    const update = {
      uuid: 'test-uuid'
    };

    render(<UpdateIndicator update={update} showEmojis={false} className="custom-class" />);

    const bulletIndicator = screen.getByTestId('update-indicator');
    expect(bulletIndicator).toHaveClass('update-indicator', 'custom-class');
  });

  it('should handle edge case where qualityLevel exists but updateQuality is undefined', () => {
    const update = {
      uuid: 'test-uuid',
      qualityLevel: 'good'
      // updateQuality is undefined
    };

    render(<UpdateIndicator update={update} showEmojis={true} />);

    // Should show pending indicator since updateQuality is undefined
    const pendingIndicator = screen.getByTestId('update-indicator-pending');
    expect(pendingIndicator).toBeInTheDocument();
  });

  it('should handle edge case where updateQuality exists but qualityLevel is undefined', () => {
    const update = {
      uuid: 'test-uuid',
      updateQuality: 85
      // qualityLevel is undefined
    };

    render(<UpdateIndicator update={update} showEmojis={true} />);

    // Should show pending indicator since qualityLevel is undefined
    const pendingIndicator = screen.getByTestId('update-indicator-pending');
    expect(pendingIndicator).toBeInTheDocument();
  });
});

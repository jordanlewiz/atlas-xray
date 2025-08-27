import React from 'react';
import { render, screen } from '@testing-library/react';
import { DateDifference } from './DateDifference';
import type { ProjectUpdate } from '../../types';

// Mock the useDateDifference hook
jest.mock('../../hooks/useDateDifference');
import { useDateDifference } from '../../hooks/useDateDifference';

const mockUseDateDifference = useDateDifference as jest.MockedFunction<typeof useDateDifference>;

describe('DateDifference', () => {
  const mockUpdate = {} as ProjectUpdate;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render positive date difference', () => {
    mockUseDateDifference.mockReturnValue({
      value: 5,
      displayText: '+5',
      cssClass: 'positive',
      hasChange: true
    });

    render(<DateDifference update={mockUpdate} />);
    
    const element = screen.getByTestId('date-difference');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('+5');
    expect(element).toHaveClass('date-difference', 'positive');
  });

  it('should render negative date difference', () => {
    mockUseDateDifference.mockReturnValue({
      value: -3,
      displayText: '-3',
      cssClass: 'negative',
      hasChange: true
    });

    render(<DateDifference update={mockUpdate} />);
    
    const element = screen.getByTestId('date-difference');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('-3');
    expect(element).toHaveClass('date-difference', 'negative');
  });

  it('should not render when there is no change', () => {
    mockUseDateDifference.mockReturnValue({
      value: 0,
      displayText: '0',
      cssClass: 'neutral',
      hasChange: false
    });

    const { container } = render(<DateDifference update={mockUpdate} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should not render when value is null', () => {
    mockUseDateDifference.mockReturnValue({
      value: null,
      displayText: '',
      cssClass: '',
      hasChange: false
    });

    const { container } = render(<DateDifference update={mockUpdate} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should apply custom className when provided', () => {
    mockUseDateDifference.mockReturnValue({
      value: 5,
      displayText: '+5',
      cssClass: 'positive',
      hasChange: true
    });

    render(<DateDifference update={mockUpdate} className="custom-class" />);
    
    const element = screen.getByTestId('date-difference');
    expect(element).toHaveClass('date-difference', 'positive', 'custom-class');
  });
});

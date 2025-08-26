import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DependencyVisualizationModal from './DependencyVisualizationModal';

// Mock the database service
jest.mock('../../services/DatabaseService', () => ({
  db: {
    getProjectSummaries: jest.fn(() => Promise.resolve([])),
    getProjectUpdates: jest.fn(() => Promise.resolve([])),
    getAllProjectDependencies: jest.fn(() => Promise.resolve([]))
  }
}));

// Mock dexie-react-hooks
jest.mock('dexie-react-hooks', () => ({
  useLiveQuery: jest.fn((queryFn) => {
    if (queryFn.toString().includes('getProjectSummaries')) {
      return [];
    }
    if (queryFn.toString().includes('getProjectUpdates')) {
      return [];
    }
    if (queryFn.toString().includes('getAllProjectDependencies')) {
      return [];
    }
    return null;
  })
}));

// Mock D3
jest.mock('d3', () => ({
  select: jest.fn(() => ({
    selectAll: jest.fn(() => ({
      remove: jest.fn(),
      enter: jest.fn(() => ({
        append: jest.fn(() => ({
          attr: jest.fn(() => ({
            on: jest.fn(() => ({
              call: jest.fn()
            }))
          }))
        }))
      }))
    })),
    append: jest.fn(() => ({
      selectAll: jest.fn(() => ({
        enter: jest.fn(() => ({
          append: jest.fn(() => ({
            attr: jest.fn(() => ({
              on: jest.fn(() => ({
                call: jest.fn()
              }))
            }))
          }))
        }))
      }))
    })),
    attr: jest.fn(() => ({
      call: jest.fn()
    })),
    call: jest.fn(),
    transition: jest.fn(() => ({
      duration: jest.fn(() => ({
        call: jest.fn()
      }))
    }))
  })),
  forceSimulation: jest.fn(() => ({
    force: jest.fn(() => ({
      id: jest.fn(() => ({
        distance: jest.fn()
      })),
      strength: jest.fn(),
      radius: jest.fn()
    })),
    on: jest.fn(() => ({
      alphaTarget: jest.fn(() => ({
        restart: jest.fn()
      }))
    })),
    stop: jest.fn()
  })),
  forceLink: jest.fn(() => ({
    id: jest.fn(() => ({
      distance: jest.fn()
    }))
  })),
  forceManyBody: jest.fn(() => ({
    strength: jest.fn()
  })),
  forceCenter: jest.fn(() => ({
    x: jest.fn(),
    y: jest.fn()
  })),
  forceCollide: jest.fn(() => ({
    radius: jest.fn()
  })),
  zoom: jest.fn(() => ({
    scaleExtent: jest.fn(() => ({
      on: jest.fn(() => ({
        transform: jest.fn()
      }))
    }))
  })),
  zoomIdentity: {}
}));

describe('DependencyVisualizationModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<DependencyVisualizationModal {...defaultProps} />);
    expect(screen.getByText('Project Dependency Visualiser')).toBeInTheDocument();
  });

  it('shows loading state when no data is available', () => {
    render(<DependencyVisualizationModal {...defaultProps} />);
    expect(screen.getByText('Loading dependencies...')).toBeInTheDocument();
  });

  it('displays the correct title', () => {
    render(<DependencyVisualizationModal {...defaultProps} />);
    expect(screen.getByText('Project Dependency Visualiser')).toBeInTheDocument();
  });

  it('shows stats section', () => {
    render(<DependencyVisualizationModal {...defaultProps} />);
    expect(screen.getByText('Projects:')).toBeInTheDocument();
    expect(screen.getByText('Dependencies:')).toBeInTheDocument();
    expect(screen.getByText('Link Types:')).toBeInTheDocument();
  });

  it('shows legend sections', () => {
    render(<DependencyVisualizationModal {...defaultProps} />);
    expect(screen.getByText('Project Status Colors')).toBeInTheDocument();
    expect(screen.getByText('Dependency Types')).toBeInTheDocument();
  });

  it('shows correct dependency types in legend', () => {
    render(<DependencyVisualizationModal {...defaultProps} />);
    expect(screen.getByText('Relationship (dashed purple)')).toBeInTheDocument();
    expect(screen.getByText('Depends On (red arrow)')).toBeInTheDocument();
    expect(screen.getByText('Depended By (teal arrow)')).toBeInTheDocument();
  });

  it('shows correct project status colors in legend', () => {
    render(<DependencyVisualizationModal {...defaultProps} />);
    expect(screen.getByText('On Track')).toBeInTheDocument();
    expect(screen.getByText('Off Track')).toBeInTheDocument();
    expect(screen.getByText('At Risk')).toBeInTheDocument();
    expect(screen.getByText('Paused')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('has a close button', () => {
    render(<DependencyVisualizationModal {...defaultProps} />);
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('has a reset view button', () => {
    render(<DependencyVisualizationModal {...defaultProps} />);
    expect(screen.getByText('Reset View')).toBeInTheDocument();
  });
});

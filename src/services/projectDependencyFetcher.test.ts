import { fetchProjectDependencies, fetchMultipleProjectDependencies, getUniqueLinkTypes, groupDependenciesByLinkType } from './projectDependencyFetcher';
import { ProjectDependencyEdge } from './projectDependencyFetcher';

// Mock the apolloClient
jest.mock('./apolloClient', () => ({
  apolloClient: {
    query: jest.fn()
  }
}));

describe('projectDependencyFetcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchProjectDependencies', () => {
    it('should fetch and transform dependencies correctly', async () => {
      const mockResponse = {
        data: {
          project: {
            key: 'TEST-123',
            dependencies: {
              edges: [
                {
                  node: {
                    id: 'dep1',
                    linkType: 'DEPENDS_ON',
                    dependencyId: 'dep1',
                    outgoingProject: {
                      key: 'TEST-456',
                      id: 'proj456'
                    },
                    incomingProject: {
                      id: 'proj123'
                    }
                  }
                },
                {
                  node: {
                    id: 'dep2',
                    linkType: 'RELATED',
                    dependencyId: 'dep2',
                    outgoingProject: {
                      key: 'TEST-789',
                      id: 'proj789'
                    },
                    incomingProject: {
                      id: 'proj123'
                    }
                  }
                }
              ]
            }
          }
        }
      };

      const { apolloClient } = require('./apolloClient');
      apolloClient.query.mockResolvedValue(mockResponse);

      const result = await fetchProjectDependencies('TEST-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'dep1',
        linkType: 'DEPENDS_ON',
        dependencyId: 'dep1',
        sourceProject: {
          id: 'proj123',
          key: 'TEST-123',
          name: 'TEST-123'
        },
        targetProject: {
          id: 'proj456',
          key: 'TEST-456',
          name: 'TEST-456'
        }
      });
      expect(result[1].linkType).toBe('RELATED');
    });

    it('should handle projects with no dependencies', async () => {
      const mockResponse = {
        data: {
          project: {
            key: 'TEST-123',
            dependencies: {
              edges: []
            }
          }
        }
      };

      const { apolloClient } = require('./apolloClient');
      apolloClient.query.mockResolvedValue(mockResponse);

      const result = await fetchProjectDependencies('TEST-123');

      expect(result).toHaveLength(0);
    });
  });

  describe('getUniqueLinkTypes', () => {
    it('should return unique link types from dependencies', () => {
      const dependencies: ProjectDependencyEdge[] = [
        {
          id: 'dep1',
          linkType: 'DEPENDS_ON',
          dependencyId: 'dep1',
          sourceProject: { id: '1', key: 'TEST-1' },
          targetProject: { id: '2', key: 'TEST-2' }
        },
        {
          id: 'dep2',
          linkType: 'RELATED',
          dependencyId: 'dep2',
          sourceProject: { id: '1', key: 'TEST-1' },
          targetProject: { id: '3', key: 'TEST-3' }
        },
        {
          id: 'dep3',
          linkType: 'DEPENDS_ON',
          dependencyId: 'dep3',
          sourceProject: { id: '1', key: 'TEST-1' },
          targetProject: { id: '4', key: 'TEST-4' }
        }
      ];

      const result = getUniqueLinkTypes(dependencies);

      expect(result).toEqual(['DEPENDS_ON', 'RELATED']);
    });
  });

  describe('groupDependenciesByLinkType', () => {
    it('should group dependencies by link type', () => {
      const dependencies: ProjectDependencyEdge[] = [
        {
          id: 'dep1',
          linkType: 'DEPENDS_ON',
          dependencyId: 'dep1',
          sourceProject: { id: '1', key: 'TEST-1' },
          targetProject: { id: '2', key: 'TEST-2' }
        },
        {
          id: 'dep2',
          linkType: 'RELATED',
          dependencyId: 'dep2',
          sourceProject: { id: '1', key: 'TEST-1' },
          targetProject: { id: '3', key: 'TEST-3' }
        },
        {
          id: 'dep3',
          linkType: 'DEPENDS_ON',
          dependencyId: 'dep3',
          sourceProject: { id: '1', key: 'TEST-1' },
          targetProject: { id: '4', key: 'TEST-4' }
        }
      ];

      const result = groupDependenciesByLinkType(dependencies);

      expect(result.get('DEPENDS_ON')).toHaveLength(2);
      expect(result.get('RELATED')).toHaveLength(1);
    });
  });
});

// GraphQL Query for fetching project directory list
// This replaces network monitoring with direct API calls

export const PROJECT_DIRECTORY_LIST_QUERY = `
  query ProjectDirectoryListQuery(
    $workspaceId: ID
    $workspaceUuid: UUID!
    $first: Int = 50
    $after: String
    $q: String
  ) {
    projectTql(
      first: $first
      after: $after
      q: $q
      workspaceId: $workspaceId
    ) {
      count
      edges {
        node {
          id
          key
          name
          uuid
          archived
          private
          state {
            value
          }
          owner {
            aaid
            name
          }
          __typename
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// Simplified query for just getting project keys and names
export const PROJECT_KEYS_QUERY = `
  query ProjectKeysQuery(
    $workspaceId: ID
    $first: Int = 100
    $q: String = "(archived = false)"
  ) {
    projectTql(
      first: $first
      q: $q
      workspaceId: $workspaceId
    ) {
      count
      edges {
        node {
          key
          name
          archived
          __typename
        }
      }
    }
  }
`;

export const PROJECT_DIRECTORY_QUERY = `
query ProjectDirectoryQuery(
  $aaid: String
  $workspaceId: ID
  $workspaceUuid: UUID!
) {
  reportingLines(aaidOrHash: $aaid) {
    managers {
      __typename
    }
    peers {
      __typename
    }
    reports {
      __typename
    }
  }
  hasProjects(includeArchived: false, workspaceId: $workspaceId) {
    hasRecords
  }
  customFieldDefinitionTql(q: "(entityType = PROJECT AND (type != String OR hasPredefinedValues = true))", workspaceUuid: $workspaceUuid) {
    ...buildCustomFieldResolvers
  }
  customfieldHeaderSupport: customFieldDefinitionTql(q: "entityType = PROJECT", workspaceUuid: $workspaceUuid) {
    ...ProjectDirectoryHeaderColumns
  }
}

fragment ProjectDirectoryHeaderColumns on CustomFieldDefinitionConnection {
  edges {
    node {
      __typename
      ... on NumberCustomFieldDefinition {
        uuid
        name
        type
      }
      ... on TextCustomFieldDefinition {
        uuid
        name
        type
      }
      ... on TextSelectCustomFieldDefinition {
        uuid
        name
        type
        canSetMultipleValues
      }
      ... on UserCustomFieldDefinition {
        uuid
        name
        type
        canSetMultipleValues
      }
      ... on Node {
        __isNode: __typename
        id
      }
    }
  }
}

fragment buildCustomFieldResolvers on CustomFieldDefinitionConnection {
  edges {
    node {
      __typename
      ... on UserCustomFieldDefinition {
        ...buildCustomFieldResolvers_userResolver
      }
      ... on TextSelectCustomFieldDefinition {
        ...buildCustomFieldResolvers_textSelectResolver
      }
      ... on NumberCustomFieldDefinition {
        ...buildCustomFieldResolvers_numberResolver
      }
      ... on Node {
        __isNode: __typename
        id
      }
    }
  }
}

fragment buildCustomFieldResolvers_numberResolver on NumberCustomFieldDefinition {
  __typename
  name
  token
}

fragment buildCustomFieldResolvers_textSelectResolver on TextSelectCustomFieldDefinition {
  __typename
  name
  token
  canSetMultipleValues
  allowedValues {
    edges {
      node {
        value
        id
      }
    }
  }
}

fragment buildCustomFieldResolvers_userResolver on UserCustomFieldDefinition {
  __typename
  name
  token
  canSetMultipleValues
}
`
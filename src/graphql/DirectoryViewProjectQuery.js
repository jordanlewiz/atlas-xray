export const DIRECTORY_VIEW_PROJECT_QUERY = `
query DirectoryViewProjectQuery(
  $tql: String
  $directoryViewUuid: UUID
  $workspaceUuid: UUID!
  $after: String
  $first: Int
  $sort: [ProjectSortEnum]
  $isTableOrSavedView: Boolean!
  $isTimelineOrSavedView: Boolean!
  $includeContributors: Boolean!
  $includeFollowerCount: Boolean!
  $includeFollowing: Boolean!
  $includeLastUpdated: Boolean!
  $includeOwner: Boolean!
  $includeRelatedProjects: Boolean!
  $includeStatus: Boolean!
  $includeTargetDate: Boolean!
  $includeTeam: Boolean!
  $includeGoals: Boolean!
  $includeTags: Boolean!
  $includeStartDate: Boolean!
  $includedCustomFieldUuids: [UUID!]
  $skipTableTql: Boolean!
) {
  ...DirectoryTableViewProject_15M8p1 @include(if: $isTableOrSavedView)
  ...ProjectTimeline_3Zp2r6 @include(if: $isTimelineOrSavedView)
}

fragment ContributorsColumn on ContributorConnection {
  edges {
    node {
      __typename
      ... on User {
        pii {
          accountId
          name
          picture
        }
      }
      ... on Node {
        __isNode: __typename
        id
      }
    }
  }
}

fragment CustomFieldCell on CustomFieldConnection {
  edges {
    node {
      __typename
      ... on CustomFieldNode {
        __isCustomFieldNode: __typename
        definition {
          __typename
          ... on CustomFieldDefinitionNode {
            __isCustomFieldDefinitionNode: __typename
            uuid
          }
          ... on Node {
            __isNode: __typename
            id
          }
        }
      }
      ...NumberFieldColumn
      ...TextSelectFieldColumn
      ...UserFieldColumn
      ...TextFieldColumn
      ... on Node {
        __isNode: __typename
        id
      }
    }
  }
}

fragment DirectoryRowProject_3LjlDU on Project {
  latestUpdateDate @include(if: $includeLastUpdated)
  ...ProjectActions
  ...ProjectNameColumn
  ...ProjectFollowButton @include(if: $includeFollowing)
  contributors @include(if: $includeContributors) {
    ...ContributorsColumn
  }
  dueDate @include(if: $includeTargetDate) {
    ...TargetDate
  }
  state @include(if: $includeStatus) {
    ...ProjectState
  }
  owner @include(if: $includeOwner) {
    ...UserAvatar_2aqwkz
    id
  }
  dependencies @include(if: $includeRelatedProjects) {
    ...RelatedProjects
  }
  teams @include(if: $includeTeam) {
    ...TeamOfProject
  }
  goals @include(if: $includeGoals) {
    ...ProjectGoals
  }
  tags @include(if: $includeTags) {
    ...TagColumn
  }
  ...FollowerCount_project @include(if: $includeFollowerCount)
  startDate @include(if: $includeStartDate)
  customFields(includedCustomFieldUuids: $includedCustomFieldUuids) {
    ...CustomFieldCell
  }
}

fragment DirectoryTableViewProject_15M8p1 on Query {
  projectTql(first: $first, after: $after, q: $tql, workspaceUuid: $workspaceUuid, directoryViewUuid: $directoryViewUuid, sort: $sort) @skip(if: $skipTableTql) {
    count
    edges {
      node {
        id
        ...DirectoryRowProject_3LjlDU
        __typename
      }
      cursor
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
  currentUser {
    preferences {
      wrapTextEnabled
      id
    }
    id
  }
}

fragment FollowerCount_project on Project {
  key
  ...ProjectFollowersButton
}

fragment GoalEntry on Goal {
  ...GoalName
}

fragment GoalName on Goal {
  uuid
  id
  key
  ...PlatformGoalIcon
  name
}

fragment NumberFieldColumn on NumberCustomField {
  value {
    numberValue: value
    id
  }
}

fragment PlatformGoalIcon on Goal {
  icon {
    key
    appearance
  }
}

fragment ProjectActions on Project {
  id
  name
  archived
  private
}

fragment ProjectBar on Project {
  startDate
  creationDate
  state {
    value
    label
    localizedLabel {
      messageId
    }
  }
  targetDate
  targetDateConfidence
  targetDateSet
  ...ProjectName_data
  ...utilsGetProjectTargetEndDate
}

fragment ProjectFollowButton on Project {
  id
  uuid
  watching
}

fragment ProjectFollowersButton on Project {
  key
  watcherCount
}

fragment ProjectGoals on GoalConnection {
  count
  edges {
    node {
      id
      ...GoalEntry
    }
  }
}

fragment ProjectIcon on Project {
  private
  iconUrl {
    square {
      light
      dark
      transparent
    }
  }
}

fragment ProjectNameColumn on Project {
  managerData {
    managers {
      managerProfile {
        name
      }
      directReports
    }
  }
  ...ProjectName_data
}

fragment ProjectName_data on Project {
  id
  key
  name
  uuid
  ...ProjectIcon
}

fragment ProjectState on ProjectState {
  label
  localizedLabel {
    messageId
  }
  projectStateValue: value
  atCompletionState {
    value
    label
    localizedLabel {
      messageId
    }
  }
}

fragment ProjectTimeline_3Zp2r6 on Query {
  projectTimeline: projectTql(first: $first, after: $after, workspaceUuid: $workspaceUuid, q: $tql, directoryViewUuid: $directoryViewUuid, sort: $sort) {
    count
    edges {
      node {
        uuid
        startDate
        creationDate
        ...ProjectBar
        id
        __typename
      }
      cursor
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}

fragment RelatedProjects on ProjectDependencyConnection {
  count
  edges {
    node {
      outgoingProject {
        ...ProjectName_data
        id
      }
      id
    }
  }
}

fragment Tag on Tag {
  ...Tag_createTagOption
}

fragment TagColumn on TagConnection {
  edges {
    node {
      ...Tag
      id
    }
  }
  count
}

fragment Tag_createTagOption on Tag {
  id
  name
  uuid
  description
  projectUsageCount
  goalUsageCount
  helpPointerUsageCount
  watcherCount
}

fragment TargetDate on TargetDate {
  confidence
  label
  localizedLabel {
    messageId
  }
  tooltip: label(longFormat: true)
  localizedTooltip: localizedLabel(longFormat: true) {
    messageId
  }
  overdue
}

fragment TeamOfProject on TeamConnection {
  edges {
    node {
      avatarUrl
      name
      teamId
      id
    }
  }
  count
}

fragment TextFieldColumn on TextCustomField {
  value {
    textValue: value
    id
  }
}

fragment TextSelectFieldColumn on TextSelectCustomField {
  definition {
    __typename
    ... on TextSelectCustomFieldDefinition {
      canSetMultipleValues
    }
    ... on Node {
      __isNode: __typename
      id
    }
  }
  values {
    count
    edges {
      node {
        id
        value
      }
    }
  }
}

fragment UserAvatar_2aqwkz on User {
  aaid
  pii {
    picture
    accountId
  }
}

fragment UserFieldColumn on UserCustomField {
  definition {
    __typename
    ... on UserCustomFieldDefinition {
      canSetMultipleValues
    }
    ... on Node {
      __isNode: __typename
      id
    }
  }
  values {
    count
    edges {
      node {
        pii {
          accountId
          name
          picture
        }
        id
      }
    }
  }
}

fragment utilsGetProjectTargetEndDate on Project {
  newPhase {
    name
  }
  startDate
  creationDate
  targetDate
  targetDateConfidence
  targetDateSet
}
`
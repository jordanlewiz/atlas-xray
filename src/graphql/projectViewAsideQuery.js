export const PROJECT_VIEW_ASIDE_QUERY = `
query ProjectViewAsideQuery(
    $key: String!
    $trackViewEvent: TrackViewEvent
    $workspaceId: ID
    $areMilestonesEnabled: Boolean!
    $cloudId: String
    $isNavRefreshEnabled: Boolean!
  ) {
    project: projectByKey(key: $key, trackViewEvent: $trackViewEvent) @include(if: $isNavRefreshEnabled) {
      owner {
        aaid
        id
      }
      private
      members {
        ...utils_isUserInList
      }
      watchers {
        ...utils_isUserInList
      }
      ...ProjectSidebar_2SVbDg
      id
    }
    currentUser(workspaceId: $workspaceId) {
      aaid
      id
    }
  }
  
  fragment AddOrEditButton on CustomFieldNode {
    __isCustomFieldNode: __typename
    id
    definition {
      __typename
      ... on CustomFieldDefinitionNode {
        __isCustomFieldDefinitionNode: __typename
        type
      }
      ... on UserCustomFieldDefinition {
        canSetMultipleValues
      }
      ... on TextSelectCustomFieldDefinition {
        canSetMultipleValues
      }
      ... on Node {
        __isNode: __typename
        id
      }
    }
  }
  
  fragment FollowersSidebarSection on UserConnection {
    count
    edges {
      node {
        pii {
          name
          picture
          accountId
        }
        id
      }
    }
  }
  
  fragment FollowersSidebarSection_Owner on UserPII {
    accountId
  }
  
  fragment FollowersSidebarSection_ProjectKey on Project {
    key
  }
  
  fragment FreeformNumberField on NumberCustomField {
    ...AddOrEditButton
    id
    definition {
      __typename
      ... on CustomFieldDefinitionNode {
        __isCustomFieldDefinitionNode: __typename
        name
        description
      }
      ... on Node {
        __isNode: __typename
        id
      }
    }
    value {
      id
      numberValue: value
    }
  }
  
  fragment FreeformTextField on TextCustomField {
    ...AddOrEditButton
    id
    definition {
      __typename
      ... on CustomFieldDefinitionNode {
        __isCustomFieldDefinitionNode: __typename
        name
        description
      }
      ... on Node {
        __isNode: __typename
        id
      }
    }
    value {
      id
      textValue: value
    }
  }
  
  fragment GenericWorkTrackingLinks on Project {
    id
    workTrackingLinks: links(type: WORK_TRACKING, first: 1) {
      ...ProjectLinks
    }
  }
  
  fragment GoalItem on Goal {
    ...PlatformGoalIcon
    ...progressBarMetricTarget
    ...MetricChart
    progress {
      percentage
    }
    name
    key
    id
  }
  
  fragment InviteUserPromptPopup on Project {
    watchers {
      count
    }
  }
  
  fragment LinkedGoals on Project {
    id
    uuid
    goals {
      edges {
        node {
          id
          ...GoalItem
        }
      }
    }
  }
  
  fragment LinkedProject on ProjectDependency {
    dependencyId: id
    incomingProject {
      id
    }
    outgoingProject {
      id
      ...ProjectName_data
      state {
        ...ProjectState
      }
    }
  }
  
  fragment LinkedProjects on Project {
    id
    key
    dependencies {
      edges {
        node {
          linkType
          outgoingProject {
            key
            id
          }
          ...LinkedProject
          id
        }
      }
    }
  }
  
  fragment MetaActions on Project {
    key
    private
    ...ProjectStateAndTargetDate
    ...ProjectFollowButton
    ...InviteUserPromptPopup
    ...ProjectActions
  }
  
  fragment MetricChart on Goal {
    ...WrappedWithMetricPopup
    id
    progress {
      type
      percentage
    }
    subGoals {
      count
    }
    metricTargets {
      edges {
        node {
          ...common_metricTarget_direct
          id
        }
      }
    }
  }
  
  fragment MilestoneFields on Milestone {
    id
    title
    targetDate
    targetDateType
    status
  }
  
  fragment Milestones on Project {
    creationDate
    startDate
    milestones(first: 20) {
      edges {
        node {
          id
          status
          ...MilestoneFields
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
  
  fragment ProjectContributors_OtPnR on Project {
    id
    name
    key
    canEditMembers
    private
    owner {
      aaid
      id
    }
    contributors {
      edges {
        node {
          __typename
          ... on User {
            aaid
            ...UserItem
          }
          ... on Team {
            id
            teamId
            name
            ...TeamAndMembersItem_OtPnR
          }
          ... on Node {
            __isNode: __typename
            id
          }
        }
      }
    }
    members {
      count
      edges {
        node {
          aaid
          id
        }
      }
    }
  }
  
  fragment ProjectFollowButton on Project {
    id
    uuid
    watching
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
  
  fragment ProjectLinks on LinkConnection {
    edges {
      node {
        id
        name
        url
      }
    }
  }
  
  fragment ProjectName_data on Project {
    id
    key
    name
    uuid
    ...ProjectIcon
  }
  
  fragment ProjectOwner on Project {
    id
    key
    canEditMembers
    owner {
      aaid
      pii {
        name
        picture
        accountStatus
        email
      }
      ...UserAvatar
      id
    }
  }
  
  fragment ProjectSidebar_2SVbDg on Project {
    ari
    id
    key
    ...MetaActions
    ...ProjectOwner
    ...ProjectContributors_OtPnR
    ...LinkedGoals
    ...LinkedProjects
    ...WorkTrackingLinks
    ...RelatedLinks
    ...Milestones @include(if: $areMilestonesEnabled)
    ...FollowersSidebarSection_ProjectKey
    milestoneCount: milestones {
      count
    }
    tags {
      ...Tags
    }
    customFields {
      ...SidebarFields
    }
    watchers {
      ...FollowersSidebarSection
    }
    owner {
      pii {
        ...FollowersSidebarSection_Owner
      }
      id
    }
    ...ProjectStartDate
  }
  
  fragment ProjectStartDate on Project {
    id
    startDate
    ...ProjectStartDatePicker
  }
  
  fragment ProjectStartDatePicker on Project {
    startDate
    targetDate
    targetDateSet
    creationDate
    state {
      value
    }
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
  
  fragment ProjectStateAndTargetDate on Project {
    state {
      value
      atCompletionState {
        value
      }
    }
    creationDate
    startDate
    targetDate
    targetDateConfidence
  }
  
  fragment RelatedLinks on Project {
    id
    relatedLinks: links(type: RELATED) {
      ...ProjectLinks
    }
  }
  
  fragment RemoveMemberButton on User {
    id
    aaid
    pii {
      name
    }
  }
  
  fragment SelectField on TextSelectCustomField {
    ...AddOrEditButton
    id
    definition {
      __typename
      ... on TextSelectCustomFieldDefinition {
        name
        description
        canSetMultipleValues
        allowedValues {
          edges {
            node {
              id
              value
            }
          }
        }
      }
      ... on Node {
        __isNode: __typename
        id
      }
    }
    values {
      edges {
        node {
          id
          value
        }
      }
    }
  }
  
  fragment SidebarFields on CustomFieldConnection {
    edges {
      node {
        __typename
        ... on TextCustomField {
          ...FreeformTextField
        }
        ... on NumberCustomField {
          ...FreeformNumberField
        }
        ... on UserCustomField {
          ...UserField
        }
        ... on TextSelectCustomField {
          ...SelectField
        }
        ... on Node {
          __isNode: __typename
          id
        }
      }
    }
  }
  
  fragment Tag on Tag {
    ...Tag_createTagOption
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
  
  fragment Tags on TagConnection {
    edges {
      node {
        id
        uuid
        name
        ...Tag
        ...Tag_createTagOption
      }
    }
  }
  
  fragment TeamAndMembersItem_OtPnR on Team {
    ...TeamItem_OtPnR
    name
    id
    teamId
    teamDetails {
      membershipSettings
    }
    permission(cloudId: $cloudId)
    membersOfProject(key: $key) {
      edges {
        node {
          aaid
          ...UserItem
          id
        }
      }
    }
  }
  
  fragment TeamAvatar on Team {
    id
    name
    teamId
    teamDetails {
      isVerified
    }
    avatarUrl
  }
  
  fragment TeamItem_OtPnR on Team {
    id
    name
    teamId
    ...TeamAvatar
    ...TeamOptionsMenu_OtPnR
  }
  
  fragment TeamOptionsMenu_OtPnR on Team {
    id
    teamId
    name
    watching
    permission(cloudId: $cloudId)
    teamDetails {
      membershipSettings
    }
    membersOfProject(key: $key) {
      edges {
        node {
          aaid
          ...UserItem
          id
        }
      }
    }
  }
  
  fragment UserAvatar on User {
    aaid
    pii {
      picture
      name
      accountStatus
      accountId
    }
  }
  
  fragment UserAvatar_1TWJ92 on User {
    aaid
    pii {
      picture
      name
      accountStatus
      accountId
      extendedProfile {
        jobTitle
      }
    }
  }
  
  fragment UserField on UserCustomField {
    ...AddOrEditButton
    id
    definition {
      __typename
      ... on UserCustomFieldDefinition {
        name
        description
        canSetMultipleValues
      }
      ... on Node {
        __isNode: __typename
        id
      }
    }
    values {
      edges {
        node {
          id
          aaid
          ...UserAvatar_1TWJ92
        }
      }
    }
  }
  
  fragment UserItem on User {
    ...UserAvatar_1TWJ92
    ...RemoveMemberButton
  }
  
  fragment WorkTrackingLinks on Project {
    id
    uuid
    key
    ari
    workTrackingLinks: links(type: WORK_TRACKING, first: 1) {
      edges {
        node {
          id
          url
        }
      }
    }
    fusion {
      synced
    }
    workspace {
      site {
        productActivations {
          edges {
            node {
              __typename
              ... on JiraProductActivation {
                atlasForJiraCloudEnabled
              }
            }
          }
        }
      }
      id
    }
    ...GenericWorkTrackingLinks
  }
  
  fragment WrappedWithMetricPopup on Goal {
    id
    progress {
      percentage
    }
    metricTargets {
      edges {
        node {
          ...common_metricTarget_direct
          metric {
            archived
            id
          }
          id
        }
      }
    }
  }
  
  fragment common_metricTarget_direct on MetricTarget {
    startValue
    targetValue
    snapshotValue {
      value
      id
    }
    metric {
      id
      name
      type
      subType
      externalEntityId
    }
  }
  
  fragment progressBarMetricTarget on Goal {
    progress {
      type
      percentage
    }
    metricTargets {
      edges {
        node {
          snapshotValue {
            value
            id
          }
          startValue
          targetValue
          metric {
            type
            subType
            id
          }
          id
        }
      }
    }
  }
  
  fragment utils_isUserInList on UserConnection {
    edges {
      node {
        aaid
        id
      }
    }
  }
`;
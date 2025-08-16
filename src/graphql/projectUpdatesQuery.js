// GraphQL Query for ProjectUpdatesQuery

export const PROJECT_UPDATES_QUERY = `
  query ProjectUpdatesQuery(
    $key: String!
    $isUpdatesTab: Boolean!
  ) {
    project: projectByKey(key: $key) {
      key @include(if: $isUpdatesTab)
      ...ProjectUpdates @include(if: $isUpdatesTab)
      id
    }
  }

  fragment Comment on Comment {
    id
    ari
    commentText
    creationDate
    editDate
    creator {
      aaid
      ...UserAvatar
      id
    }
  }

  fragment Comments on CommentConnection {
    edges {
      node {
        id
        editDate
        ...Comment
      }
    }
  }

  fragment EditProjectUpdate on ProjectUpdate {
    id
    uuid
    summary
    newState {
      value
    }
    newTargetDate
    newTargetDateConfidence
    notes {
      summary
      title
      uuid
      archived
      id
    }
    project {
      id
      key
      uuid
      workspace {
        uuid
        id
        aiConfig {
          enabled
        }
      }
      startDate
      creationDate
      latestUserUpdate {
        editDate
        creationDate
        summary
        notes {
          title
          summary
          id
        }
        id
      }
    }
    missedUpdate
    updateType
    creationDate
    ...ProjectUpdateTargetDateAutoUpdated
    ...LearningsInUpdate
  }

  fragment EditableProjectUpdateCard on ProjectUpdate {
    id
    project {
      id
    }
    creator {
      aaid
      id
    }
    creationDate
    ...ProjectUpdateCard
    ...EditProjectUpdate
  }

  fragment LearningCard_cardQuery on Learning {
    uuid
    id
    summary
    description
    type
    ...LearningModifierSignatures_data
  }

  fragment LearningModifierSignatures_data on Highlight {
    __isHighlight: __typename
    uuid
    ari
    project {
      key
      ari
      id
    }
    goal {
      key
      ari
      id
    }
    creator {
      pii {
        name
      }
      ...UserAvatar_2aqwkz
      id
    }
    creationDate
    lastEditedBy {
      pii {
        name
      }
      ...UserAvatar_2aqwkz
      id
    }
    lastEditedDate
  }

  fragment LearningsInUpdate on ProjectUpdate {
    project {
      uuid
      id
      workspace {
        uuid
        id
      }
      state {
        label
      }
    }
    learnings {
      edges {
        node {
          type
          ...LearningCard_cardQuery
          id
        }
      }
    }
  }

  fragment LearningsSummary_data on ProjectUpdate {
    learnings {
      edges {
        node {
          type
          ...LearningCard_cardQuery
          id
        }
      }
    }
  }

  fragment MilestoneCard_cardQuery on Milestone {
    uuid
    ...MilestoneFields
  }

  fragment MilestoneFields on Milestone {
    id
    title
    targetDate
    targetDateType
    status
  }

  fragment MilestonesSummary_data on ProjectUpdate {
    milestones {
      edges {
        node {
          ...MilestoneCard_cardQuery
          id
        }
      }
    }
  }

  fragment MissedProjectUpdateCard on ProjectUpdate {
    id
    uuid
    project {
      ari
      uuid
      workspace {
        uuid
        id
      }
      id
    }
    ...ProjectUpdateCardHeader
    ...ProjectUpdateCardTop_PTxnb
    ...ProjectUpdateTargetDateAutoUpdated
    ...LearningsSummary_data
    ...ProjectUpdateCardFooter
    comments {
      ...Comments
    }
  }

  fragment ProjectDateChanged on ProjectUpdate {
    oldDueDate {
      ...TargetDate
    }
    newDueDate {
      ...TargetDate
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

  fragment ProjectMissedUpdateLabel on ProjectUpdate {
    creationDate
    missedUpdate
    updateType
    project {
      id
      key
      latestUserUpdate {
        id
        creationDate
      }
      latestUpdateDate
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

  fragment ProjectStatusChanged on ProjectUpdate {
    newState {
      ...ProjectState
    }
    oldState {
      ...ProjectState
    }
  }

  fragment ProjectUpdateCard on ProjectUpdate {
    id
    uuid
    missedUpdate
    updateType
    creator {
      aaid
      id
    }
    ...MissedProjectUpdateCard
    ...ProjectUpdateCardInternal
    project {
      uuid
      id
    }
    milestones {
      count
    }
    learnings {
      count
    }
    notes {
      __typename
      id
    }
  }

  fragment ProjectUpdateCardContentExtras on ProjectUpdate {
    ...ProjectUpdateNotes
    ...ProjectUpdateDiff
    ...LearningsSummary_data
    ...MilestonesSummary_data
    ...ProjectUpdateTargetDateAutoUpdated
  }

  fragment ProjectUpdateCardFooter on ProjectUpdate {
    ari
    updateType
    missedUpdate
    project {
      ari
      ...ProjectFollowButton
      id
    }
    ...ShareUpdateButton
  }

  fragment ProjectUpdateCardHeader on ProjectUpdate {
    project {
      ...ProjectFollowButton
      ...ProjectIcon
      id
      key
      name
    }
  }

  fragment ProjectUpdateCardInternal on ProjectUpdate {
    id
    project {
      uuid
      ari
      workspace {
        uuid
        id
      }
      id
    }
    ...ProjectUpdateCardHeader
    ...ProjectUpdateCardTop
    ...ProjectUpdateSummary
    ...ProjectUpdateCardContentExtras
    ...ProjectUpdateCardFooter
    comments {
      ...Comments
    }
  }

  fragment ProjectUpdateCardTop on ProjectUpdate {
    ari
    creator {
      ...UserAvatar_2aqwkz
      ...UserName
      id
    }
    ...ProjectUpdateCreationDate
    ...ProjectUpdateStatus
    ...ProjectMissedUpdateLabel
  }

  fragment ProjectUpdateCardTop_PTxnb on ProjectUpdate {
    ari
    creator {
      ...UserAvatar_2aqwkz
      ...UserName
      id
    }
    ...ProjectMissedUpdateLabel
    missedUpdate
  }

  fragment ProjectUpdateCreationDate on ProjectUpdate {
    id
    project {
      key
      id
    }
    creationDate
    editDate
    creator {
      aaid
      id
    }
    lastEditedBy {
      aaid
      pii {
        name
      }
      id
    }
  }

  fragment ProjectUpdateDiff on ProjectUpdate {
    ...ProjectDateChanged
    ...ProjectStatusChanged
  }

  fragment ProjectUpdateNotes on ProjectUpdate {
    notes {
      uuid
      ...UpdateNote
      id
    }
  }

  fragment ProjectUpdateStatus on ProjectUpdate {
    newDueDate {
      ...TargetDate
    }
    newState {
      projectStateValue: value
      ...ProjectState
    }
  }

  fragment ProjectUpdateSummary on ProjectUpdate {
    summary
  }

  fragment ProjectUpdateTargetDateAutoUpdated on ProjectUpdate {
    project {
      key
      id
    }
    newTargetDate
    changelog {
      newValue
      oldValue
      id
    }
  }

  fragment ProjectUpdates on Project {
    updates(first: 10) {
      edges {
        node {
          uuid
          creationDate
          ...EditableProjectUpdateCard
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
    id
  }

  fragment ShareUpdateButton on Update {
    __isUpdate: __typename
    ... on ProjectUpdate {
      id
    }
    ... on GoalUpdate {
      id
    }
    ...ShareUpdateDialogContent
  }

  fragment ShareUpdateDialogContent on Update {
    __isUpdate: __typename
    ... on ProjectUpdate {
      id
      project {
        key
        id
      }
    }
    ... on GoalUpdate {
      id
      url
      goal {
        key
        id
      }
    }
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

  fragment UpdateNote on UpdateNote {
    archived
    uuid
    title
    summary
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

  fragment UserAvatar_2aqwkz on User {
    aaid
    pii {
      picture
      accountId
    }
  }

  fragment UserName on User {
    aaid
    pii {
      name
      accountStatus
    }
  }
`; 
export const PROJECT_STATUS_HISTORY_QUERY = `
query ProjectStatusHistoryQuery(
  $projectKey: String!
) {
  project: projectByKey(key: $projectKey) {
    latestUpdateDate
    ...ProjectHistoryBars
    id
  }
}

fragment ProjectHistoryBars on Project {
  owner {
    aaid
    id
  }
  creationDate
  startDate
  targetDate
  state {
    value
  }
  updates {
    edges {
      node {
        id
        creationDate
        missedUpdate
        updateType
        newState {
          label
          localizedLabel {
            messageId
          }
          value
        }
        newTargetDate
        newTargetDateConfidence
        oldTargetDate
        oldTargetDateConfidence
      }
    }
  }
  projectMemberships {
    edges {
      node {
        user {
          ...UserAvatar
          aaid
          id
        }
        joined
      }
    }
  }
  projectTeamLinks {
    edges {
      node {
        team {
          ...TeamAvatar
          teamId
          members {
            edges {
              node {
                aaid
              }
            }
          }
          id
        }
        creationDate
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

fragment UserAvatar on User {
  aaid
  pii {
    picture
    name
    accountStatus
    accountId
  }
}
`
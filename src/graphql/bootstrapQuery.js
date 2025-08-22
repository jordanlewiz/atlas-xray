export const BOOTSTRAP_QUERY = `
query BootstrapQuery(
  $context: OrganizationContextInput
) {
  bootstrap(organizationContext: $context) {
    orgId
    cloudIds
    collabContext {
      cloudIds
      vortexMode
      isMultiSite
    }
    userIsOrgAdmin
    workspaces {
      id
      uuid
      cloudId
      type
      ...storeHomeWorkspace
      ...CapabilityRouterFragment
      ...utils_checkUserHasCapabilities
    }
  }
}

fragment CapabilityRouterFragment on WorkspaceSummary {
  userCapabilities {
    capabilities {
      capability
      capabilityContainer
      id
    }
  }
}

fragment storeHomeWorkspace on WorkspaceSummary {
  id
  uuid
  name
  keyPrefix
  timezone
  cloudId
  goalScoringMode
  type
  activationId
  navV4Enrollment
}

fragment utils_checkUserHasCapabilities on WorkspaceSummary {
  userCapabilities {
    capabilities {
      capability
      capabilityContainer
      id
    }
  }
}
`
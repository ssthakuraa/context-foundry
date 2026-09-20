# Decision 0001: Single-enterprise deployment boundary

**Status:** Proposed

## Decision

ContextFoundry will initially target a self-hosted deployment operated by one
enterprise. It will not require a shared multi-enterprise service architecture.

Within that deployment, the platform will support multiple business units,
products, repositories, packs, and source scopes with explicit authorization
boundaries.

## Rationale

- Enterprise source and engineering knowledge should remain within the
  enterprise's security boundary.
- Deployment, identity, retention, and policy decisions can be controlled by
  the owning organization.
- The product can support internal organizational isolation without taking on
  the complexity of cross-customer SaaS tenancy too early.
- The same authorization contracts can later support hosted or federated
  deployments if there is a clear need.

## Consequences

ContextFoundry must still provide:

- Enterprise identity integration
- Pack and source-scope authorization
- Function-level access control
- Extractor isolation
- Auditability and policy enforcement
- Secure UI, API, CLI, and MCP interfaces

“Single enterprise” is a deployment boundary, not permission to trust every
user, process, repository, or pack inside the deployment.

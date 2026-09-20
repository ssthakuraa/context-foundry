# Identity and policy

**Status:** Proposed

ContextFoundry is intended for one enterprise per deployment, with strong
authorization inside that enterprise. The system therefore needs identity and
policy controls even though it is not a multi-enterprise SaaS service.

## Principals

- Human users
- Service accounts
- Extractor workers
- Scheduled jobs
- Agent or MCP clients
- Administrative operators

Every request should carry an authenticated principal and an auditable policy
context.

## Initial roles

| Role | Typical authority |
|---|---|
| Platform administrator | Manage deployment-wide configuration and identity integration. |
| Pack owner | Manage a pack's scope, maintainers, and release policy. |
| Data publication approver | Approve captured source versions for a named audience; separate from extraction and pack administration. |
| Extractor operator | Run approved extraction jobs within assigned source scope. |
| Pack maintainer | Edit pack configuration and review candidate diagnostics. |
| Reviewer | Approve or reject candidate releases and design artifacts. |
| Task reviewer | Confirm task scope and, with a separate action grant, authorize an exact implementation proposal. |
| Engineering reader | Query authorized context and validation evidence. |
| Auditor | Read policy, release, and access history without changing data. |

Roles should be supplemented by attributes such as business unit, pack,
repository, source classification, environment, and action type.

## Protected operations

Authorization must cover:

- Pack discovery and listing
- Pack authoring and extraction
- Candidate validation and release promotion
- Knowledge search and relationship traversal
- Source pointer and source-body access
- Architecture proposal creation and approval
- Task creation, artifact access, human scope review and implementation authorization
- Test-impact analysis and validation evidence
- Export, reporting, and audit access
- MCP tools, API methods, and CLI commands

## Policy decision model

```text
Principal + action + resource + environment
                    ↓
              Policy decision
                    ↓
       allow/deny + obligations + audit receipt
```

The same policy decision service should be used by the UI, API, MCP, CLI,
extractors, and source providers. Clients may improve usability by hiding
unavailable actions, but they must never be trusted to enforce authorization.

## Machine access

Agent and extractor access should use separately identifiable machine
credentials with explicit capability grants. A connected agent should not
inherit unrestricted administrator access merely because it is operating on
behalf of an authorized user.

Delegation is not human presence. An agent credential cannot call the verified human
decision route even when its owner can approve in Studio. Design acceptance and
permission to code are different decisions. Receipt revocation/version conflicts and
task-evidence visibility follow [task contracts](../technical-design/task-and-review-contracts.md).

## Initial implementation policy

Use explicit allow grants scoped to pack, source domain, and action, with default
deny and explicit-deny precedence. Resource restrictions combine by intersection;
multiple grants within the same action may union allowed resources unless denied.
Do not infer grants from ownership labels. Review permissions and activation are
separate; a configurable separation-of-duties rule rejects self-approval where required.

Store immutable policy versions and audit changes. A request derives current effective
access on the server; principals cannot submit trusted group claims in ordinary JSON.
Browser sessions, CLI tokens, MCP delegates, and worker credentials all map to this
policy. Validate the intersection of delegating user and client grants. Initial SAML
support is via enterprise federation into OIDC.

Pack metadata, candidate diagnostics, audit details, and job logs have resource scope
as well as action permission. Being allowed to run a job does not automatically
authorize reading every emitted record. V0.1 rejects access to an inaccessible
derived record; field-level redaction is deferred until its inference risks and
semantics are specified. Do not imply a redacted record is complete.

Source-inherited access and explicitly approved publication are distinct modes.
Local snapshots initially require explicit publication receipts; no automatic live
filesystem ACL mirroring is claimed. Group/session revocation, source withdrawal
and policy updates advance the access epoch used for final response authorization
and continuations. See [source authority and revocation](../architecture/security-and-authorization.md#source-authority-and-publication).

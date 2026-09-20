# Security and authorization

**Status:** Proposed

Authorization is a platform invariant. A user or process that is not allowed
to access a pack, source root, function, or result must be denied regardless of
whether the request came from the UI, CLI, API, MCP, or an extractor.

## Security boundaries

1. **Identity boundary** — authenticate users, services, and scheduled jobs.
2. **Enterprise boundary** — bind the deployment to one enterprise security
   domain.
3. **Pack boundary** — isolate product and business-unit knowledge.
4. **Source boundary** — restrict repositories, snapshots, paths, and symbols.
5. **Function boundary** — authorize individual operations and capabilities.
6. **Evidence boundary** — prevent unauthorized facts from appearing in
   results, counts, diagnostics, logs, cursors, or exports.

## Deny-by-default requirements

- No anonymous access to enterprise data
- No authorization based only on UI visibility
- No broad filesystem access for extractors by convention
- No cross-pack search without explicit policy
- No source pointer or relationship leakage through error messages
- No logging of restricted source content
- No cached response reuse across incompatible authorization scopes

## Authorization timing

Authorization should occur before:

- Search ranking and result aggregation
- Relationship traversal
- Pagination and count calculation
- Source content loading
- Export or report generation
- Response serialization and caching

These checks reduce disclosure through result metadata; they do not by themselves
prove freedom from timing or statistical side channels. Test ranking, suggestions,
counts, cache behavior, and diagnostics under restricted principals.

## Extractor security

Extractors require scoped, preferably read-only credentials and an explicit
source manifest. Each run records the initiating principal, source scope,
pack, extractor version, policy decision, and resulting candidate release.

Secret scanning, data classification, redaction, retention, and release review
are part of the extraction workflow. Extractors do not receive permission to
publish or serve knowledge merely because they can read source.

## Effective access and derived evidence

For a delegated agent operation, effective access is the intersection of user grants,
client/tool grants, requested scope, and current policy. For an extractor worker it
is the intersection of the initiating authority, worker grant, approved source scope,
and current policy. An administrative role need not grant source-reading permission.

Authorize a derived relationship's endpoints and all supporting records/passages.
Precomputed dependency requirements may accelerate this check but cannot freeze
user grants into a release. Recheck the current access epoch before delivering results;
invalidate caches and cursors on change. Cached content still requires authorization.

Use resource actions such as pack.configure, extraction.run, candidate.review,
release.activate, context.search, evidence.read, proposal.approve, export.create,
task.create, task.read, task.write, task.review_scope, task.approve_implementation,
task.review_completion, task.revoke_decision, task.cancel, and audit.read. Data classification is a policy input, not an authorization mechanism
by itself. Unauthenticated, no-grant, unavailable-policy, and ambiguous-delegation
requests fail closed.

Task decisions bind exact map/proposal digests to authenticated human authority.
Agent/delegated tokens may submit drafts, not human approvals. Task membership does
not grant evidence access. Initial artifacts require visibility of all supports;
do not leak restricted facts through copied findings or approval screens. See
[task contracts](../technical-design/task-and-review-contracts.md).

Human review gates govern conforming workflow progression; they never expand source
access. A skill cannot prevent independent host shell reads/writes. Initial assurance
is guided behavior with verified receipts; enforced mode requires host mediation.

## Source authority and publication

Each source binding declares an access mode; extraction credentials never define
the audience of derived knowledge:

- **Source-inherited:** require current-enough source entitlements as well as local
  ContextFoundry grants. Record authority, identity mapping, ACL revision, observed
  time and expiry. Unknown identity, stale ACL, or unavailable required authority
  denies serving the affected content. Connector-specific freshness limits must be
  approved before use; no unbounded last-known-allow fallback.
- **Explicit publication:** an authorized data owner approves a captured version
  for a named audience under retention and withdrawal rules. Reader access follows
  that publication grant; it does not pretend to mirror live source permissions.
  This is the initial local-snapshot mode. Source acquisition and redistribution
  authority are reviewed separately; a generic pack administrator cannot grant both.

Derived descriptors, summaries, aliases and embeddings inherit all information
dependencies, including context used to generate them. Combining sources must not
broaden visibility. A sanitized/publication derivative is a separate reviewed
artifact, not an automatic privilege reduction for its original evidence.

Withdrawal blocks affected evidence and dependent results across retained generations
and exports before asynchronous cleanup. Immutable release history does not require
indefinite serving or retention of withdrawn bytes. Record a non-content tombstone
and follow approved deletion/backup-expiry policy. Test withdrawal after rollback.

## Revocation semantics

Local grants, group bindings, session revocation and source-withdrawal state share a
monotonic access epoch. Check the primary authority at final response authorization,
outside any old repeatable-read snapshot. Changed epochs require recomputation or
denial. A response authorized before a concurrent revocation can already be in
flight; do not promise recall of bytes already sent. Subsequent requests and export
downloads must see a committed local revocation. Long streams reauthorize chunks.

Remote IdP/source changes become enforceable when observed; short token lifetime
alone is not immediate revocation. Document sync/expiry limits and fail-closed
behavior. Bind groups to stable issuer/subject identifiers rather than email names.
No policy cache or read replica may silently weaken this documented consistency.

## Host and content boundaries

The service cannot govern a user's independent access to local source, nor recall
previous downloads. Access claims apply to ContextFoundry-controlled operations.
Treat retrieved documents, source comments, adapter output, and imported metadata
as untrusted content. No embedded text grants access or controls tool execution.
Escape HTML, restrict source-link schemes, and sanitize Markdown in Studio/export.

Network captures require SSRF controls and bounded redirects. Extractors require
process/container isolation, read-only inputs, resource limits, and approved egress.
Captured source and derived indexes are sensitive assets even without full bodies
in the canonical pack. Encrypt enterprise storage/backups according to deployment
policy and retain secrets only in approved secret storage.

## Security acceptance

Attempt direct API access to hidden UI actions, hidden-support graph traversal,
cross-user cursor replay, revoked cache hits, stale approval activation, malicious
document instructions, archive traversal, escaped HTML, worker escape through paths,
and unauthorized export downloads. Compare positive and denied paths so controls
do not silently destroy legitimate result quality. Permission-scoped performance
tests are required alongside correctness tests.

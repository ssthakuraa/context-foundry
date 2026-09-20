# Technical design

**Status:** Proposed technical specification · CF-0.2

## Module layout

```text
apps/studio             React review and administration UI
apps/server             HTTP, MCP, authentication/session boundary
apps/worker             isolated job runner
apps/cli                authenticated client and offline validation commands
packages/contracts      JSON schemas, generated types, compatibility fixtures
packages/domain         identity, record/release rules, evidence lifecycle
packages/preparation    inventory, adapter runner, resolution, candidate validation
packages/retrieval      exact/text search, typed traversal, selection, rendering
packages/policy         actions/resources, effective grants, enforcement helpers
packages/reviews        task state, human decisions, mappings, proposals, test assessments
packages/local-client   authenticated client, source-root binding, locator checks
packages/storage        PostgreSQL repositories, blobs, release manifests
packages/adapters       first-party source/metadata extractors
packages/evaluation     replay, experiments, scoring, accounting
```

This is a proposed implementation layout; no packages have been created. The domain
and contract packages do not import transport, UI, or database drivers. Application
services authorize operations before calling repositories. Offline validators may
read explicitly supplied files; they do not bypass enterprise serving policy.

The first implementation follows [validation work packages](../execution/validation-work-packages.md),
not creation of every module/UI feature at once. The initial extraction scope includes
Java/Spring and TypeScript. [Extraction/source binding](extraction-and-source-binding.md)
and [task/review contracts](task-and-review-contracts.md) specify the CF-0.2 boundaries.
The local client is not a second agent runtime; its root mappings remain on the host.

## Preparation worker protocol

Each run receives a trusted job descriptor: principal/delegation, pack, source
manifest, allowed adapter digests, configuration digest, resource limits, policy
generation, and output namespace. Inputs are immutable capture handles, not arbitrary
paths from an agent. Adapter results are bounded streams of records/diagnostics and
coverage declarations. Their claimed scope/identity is checked by the runner.

Use a workspace per attempt with read-only input mounts, no default egress, maximum
wall time/RSS/output bytes, and cancellation. Approved network capture runs separately
from parsing. JSON/XML parsing disables remote references/entity expansion; archive
ingestion checks path traversal, symlinks, expansion size, and file count. Download
connectors reject unexpected redirect destinations. Untrusted plugin execution is
never equivalent to a normal Node module imported into the API server.

## Job durability

Job states: queued -> leased -> running -> succeeded/failed/cancelled. Attempts have
monotonic fencing tokens, expiry, heartbeat, and checkpoints. Lease acquisition uses
a short database transaction; a worker commits outputs only if its fence still owns
the job. External side effects are idempotent. A stale worker cannot activate results.

Retries are bounded with backoff. Invalid configuration, unauthorized source, or
deterministic parser failure requires intervention; transient I/O may retry. Distinguish
cancel requested from cancelled. Worker death leaves verified shards reusable and
unverified staging ignored. Database job leasing can use SKIP LOCKED for queue-like
selection; it is not a general consistent-read strategy.
[PostgreSQL SELECT](https://www.postgresql.org/docs/current/sql-select.html).

## Query execution

1. Validate transport schema and authenticate principal/delegation.
2. Resolve allowed action and resource scope; reject absent grants.
3. Pin active generation and current access epoch; set transaction-local context.
4. Query only authorized descriptors and supporting evidence. Exact lookup has a
   separate index. Lexical rank is computed over authorized text contributions.
5. Expand typed adjacency in batches with visited-state and deadline limits; traversal
   state includes entity and relation-pattern position. Preserve edge direction even
   when traversing a dependency backward.
6. Materialize selected evidence summaries; retain full authorized evidence handles.
7. Serialize under result limits and reauthorize using the current access epoch from
   the primary authority outside the pinned content snapshot before responding.
8. Commit a minimal audit receipt; return outcome, generation, limits and timing.

Source changes do not trigger reindexing during query. An old generation may still
provide useful navigation, but current implementation behavior requires appropriate
source verification. Degraded coverage is represented per affected operation.

## Authorization cost without weakening authorization

Precompute each derived record's transitive visibility requirements at projection
build time, rejecting missing support and diagnosing cycles. The initial executable
contract fails closed on cycles and records blocked by them; a future implementation
may represent a strongly connected group for visibility after explicit conformance
tests. Such a group would not prove a semantic causal cycle. Requirement sets preserve source/domain identities, not
snapshotted user grants. Evaluate against current grants at query time.

Dense dependency sets may be costly; benchmark normalized joins versus materialized
sets. Exceeding supported proof size yields an explicit unsupported/limited outcome,
never an allow shortcut. Compare the optimized predicate with a reference recursive
implementation using hidden support, missing evidence, cycles, and policy changes.
Fast unrestricted queries do not establish restricted-user performance.

## Caches and continuations

Authorization oracle tests cover source-inherited ACL expiry, explicit publication,
withdrawal across old releases, and local revocation during a query. See the
[access consistency contract](../architecture/security-and-authorization.md#revocation-semantics).

Initial response cache is disabled to expose true query cost. Connection pools and
immutable metadata caching are allowed. If later enabled, response keys include
request hash, principal/effective-access fingerprint, policy generation, access epoch, release set,
schema, and ranking profile. In-flight coalescing uses the same key. Never share
content across merely similar roles. Denied/failed/partial requests are not successful
cache entries. Blob caches remain behind authorization on every read.

Continuation tokens are signed opaque handles binding query hash, operation,
generation, principal/access fingerprint, policy generation, access epoch, position, and expiry.
Access-epoch change returns CURSOR_STALE; the client restarts under current policy. No
cross-principal replay or caller-edited offsets into private ranked results.

## Concurrency and consistency

Review and configuration mutations require expected_version plus idempotency key.
Activation uses compare-and-swap on current generation. Job scheduling and outbox
insertion share a transaction. File writes use temporary objects plus digest check
and atomic rename/commit; never overwrite released content. No claim of a distributed
transaction across blob storage and PostgreSQL: upload first, commit references,
collect unreferenced objects later after a grace period.

## Error and observability contracts

Public codes: INVALID_INPUT, NOT_FOUND_OR_NOT_VISIBLE, FORBIDDEN_ACTION,
CONFLICT, CURSOR_STALE, RELEASE_UNAVAILABLE, WORK_LIMIT, DEADLINE, BUSY,
EVIDENCE_UNAVAILABLE, TASK_STATE_CONFLICT, REVIEW_REQUIRED, APPROVAL_STALE, INTERNAL.
Task-specific codes require prior task visibility. Typed internal causes map to safe messages and a
correlation ID. Generic 500 errors contain no paths, source, policy text, or secrets.
WORK_LIMIT carries continuation only when an authorized consistent continuation exists.

Trace stages independently. Count bytes examined and returned, candidates admitted,
edges visited, omitted results, time, and declared token estimate. Logs and metrics
must not introduce high-cardinality sensitive labels. Full trajectories require
explicit retention configuration and access control.

## Compatibility and testing

Transport parity fixtures invoke HTTP/MCP/CLI application paths under the same
principal. Contract tests assert qualified identity, evidence references, authorized
result equivalence, stale cursor behavior, and serializer bounds. Parser conformance
is distinct from semantic resolution coverage. Property-style fixtures cover repeated
builds, incremental/full equivalence, activation races, and permission narrowing.
Load tests exercise actual scoped queries and simultaneous extraction rather than
only tiny in-memory fixtures. See [evaluation](../evaluation/methodology.md).

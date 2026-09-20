# Deployment and operations

**Status:** Proposed for review · CF-0.2

## Initial installation

One enterprise runs API/Studio, workers, PostgreSQL, and managed evidence volumes.
TLS terminates at its gateway; the application independently validates identity and
permissions. Provide a Compose example with synthetic data. Enterprise mode requires
identity configuration. Demo mode binds loopback and refuses enterprise credentials.
The initial profile is single-node, with no claim of high availability.

API readiness checks database/schema compatibility, policy availability, and active
projection integrity. Liveness establishes only process health. Workers lease jobs,
heartbeat, checkpoint immutable outputs, and cancel at stage boundaries. Query
deadlines cancel database work; extraction never runs in the API request process.

Sources mount read-only; staging is writable only by the assigned worker. Workers
have no broad network access, privileged capabilities, or ambient user credentials.
Network connectors use destination allowlists and scoped secret references. Secrets
never enter packs, generated HTML, or logs.

## Activation and recovery

Write immutable blobs, verify hashes, construct a projection, then activate the
manifest reference atomically. Readers pin generations. Failed candidates remain
unserved. Upload-before-commit crashes leave collectible orphans; committed activation
recovers from its pointer. Generation rollback uses current policy.

Back up PostgreSQL and referenced blobs as a recoverable set. The backup manifest
records database restore position and required digests. Rebuilding indexes cannot
recover lost reviews, grants, task/artifact versions, decisions or audit events.
Restore drills check these separately, including revoked implementation receipts.
Proposed pilot targets are RPO <=24 hours and RTO <=4 hours on the declared pilot
dataset; these are planning targets, not achieved enterprise guarantees.

## Retention and revocation

Revocation invalidates subsequent reads, exports, caches, and continuations. In-flight
queries recheck the current access epoch outside pinned content snapshots before
delivery. Previously downloaded data cannot
be recalled. Retention expiry tombstones evidence, blocks serving, and invalidates
dependent mappings; physical deletion follows legal holds and configured retention.
Audit receipts retain only content permitted by policy.

## Observability

Measure queue delay; capture/parse/resolve/validate/index times; worker memory; bytes
read; cache reuse; projection lag; denied operations; and audit health. Query spans
separate authorization, candidate lookup, graph, evidence, and encoding. Distinguish
cold startup, warm unseen requests, and exact cache hits. Raw stories, source, tokens,
and document passages remain excluded from default logs.

## Required runbooks

| Incident | Recovery |
|---|---|
| Bad release | Activate verified prior generation with current permissions |
| Stuck worker | Fence expired lease and resume verified checkpoints |
| IdP/policy outage | Deny protected requests; display sanitized service status |
| Disk pressure | Pause builds; collect only expired unreferenced blobs after grace period |
| Corrupt projection | Mark unready, verify canonical manifest, rebuild new generation |
| Required audit sink unavailable | Fail protected mutations and data delivery closed |

Before release: test upgrades, rollback, backup restoration, capacity bounds, and
restrictive default configuration. HA and object-store deployment profiles follow
the first usefulness gate rather than enlarging the initial build.

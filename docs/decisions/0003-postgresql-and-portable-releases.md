# ADR 0003: PostgreSQL with portable immutable knowledge releases

**Status:** Proposed

## Decision

Use PostgreSQL for operational state and query projections, immutable JSONL/manifests
for canonical knowledge, and content-addressed blobs for evidence. Begin with managed
filesystem storage. Support one query implementation in the first enterprise release.

## Alternatives and rationale

SQLite is valuable for embedded immutable indexes and v2 supplies useful experience.
It was not proven to cause the observed retrieval failure. PostgreSQL is preferred
for concurrent review, grants, jobs, and activation; using it for retrieval avoids an
additional service. Dedicated graph/search engines are deferred pending scoped
workload evidence. Canonical data remains independent of this storage selection.

## Consequences and reversal criteria

Queries require careful authorization-aware SQL, indexing, and connection management.
No claim of BM25 parity or fast traversal follows from choosing PostgreSQL. M3 compares
quality and scoped performance against reference fixtures; failure after query/index
repair reopens this decision. Backend replacement must preserve contracts, permissions,
and evidence semantics. See [stack](../architecture/technology-stack.md).

Second-pass condition: execute the [E4 scoped projection spike](../evaluation/validation-sequence.md#e4-can-the-secured-query-implementation-support-it)
before broad platform investment. Compare against an independent authorization
oracle and authorized-only retrieval; unrestricted speed is insufficient. A failed
projection choice need not invalidate PostgreSQL for operational state.

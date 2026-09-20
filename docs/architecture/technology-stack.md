# Technology stack and tradeoffs

**Status:** Proposed validation-slice baseline · CF-0.2

## Recommended baseline

| Layer | Selection | Reason and cost |
|---|---|---|
| Studio | React, TypeScript, Vite; React Router and TanStack Query | Rich review interactions, static assets served by API, no SSR requirement |
| UI components | HTML/CSS with Radix primitives; TanStack Table | Accessible evidence tables and progressive disclosure |
| Diagrams | React Flow for bounded architecture views | Supply an equivalent textual view; no full-estate graph landing page |
| Runtime | Supported Node.js LTS, strict TypeScript | Shared contracts and extension authoring |
| HTTP | Fastify with first-party JSON Schema/Ajv | Explicit input/output schemas; services shared with MCP |
| Database access | PostgreSQL driver and versioned SQL migrations | Inspectable permission, search, and adjacency queries |
| Workers | Isolated Node processes/containers; Tree-sitter and format parsers | Bounded CPU/memory; framework semantics remain explicit |
| Semantic index ingestion | First-party SCIP import from approved enterprise CI | Revision-bound symbol resolution; no required external code-intelligence server |
| Operational storage | PostgreSQL 18 major as provisional baseline | Transactions for configuration, permissions, reviews, jobs, audit |
| Retrieval storage | PostgreSQL projection tables | Exact indexes, weighted full text, batched typed adjacency |
| Canonical releases | Canonical JSONL shards with manifest digests | Portable audit representation independent of query storage |
| Blob storage | Content-addressed filesystem on managed volumes | Minimal first deployment; S3-compatible storage extension later |
| Jobs | PostgreSQL leases and transactional outbox | No initial Redis or distributed workflow service |
| Identity | Existing OIDC provider; browser authorization-code login | SAML via enterprise OIDC broker, not home-grown SAML |
| Interfaces | Versioned HTTP JSON, official MCP TypeScript SDK, CLI | Common application and authorization paths |
| Agent integration | Versioned workflow guide, authenticated client and local binding helper | Existing host owns reasoning/reads/edits; verified reviews through minimal Studio |
| Telemetry | OpenTelemetry and structured logs | Enterprise monitoring integration; sensitive content off by default |
| Tests | Vitest, PostgreSQL integration tests, Playwright | Actual query/security checks and browser journeys |
| Packaging | pnpm workspace, OCI images, Compose | Small deployable monorepo; Kubernetes packaging later |

Exact versions and image digests are pinned during implementation bootstrap after
compatibility checks. These are selections for review, not installed or benchmarked
components. Record supported runtime/database versions in each release; broad
package ranges are not evidence of compatibility.

The backend remains TypeScript even though the first corpus includes Java/Spring.
Use bounded static adapters for both Java/Spring and TypeScript/Hono plus SQL and
Markdown; no Java service runtime is required merely to parse Java source. Pin grammar
and parser compatibility in WP1. See [extraction scope](../technical-design/extraction-and-source-binding.md).
Task/review state uses PostgreSQL; local root bindings use OS-protected client config.

## PostgreSQL decision

V2's latency evidence implicates scoped query planning, repeated matching, and
repeated evidence authorization; it does not establish a SQLite limitation.
PostgreSQL is selected for concurrent enterprise authoring, policy state, durable
jobs, and transactional activation. Reusing it for projections reduces initial
operational complexity compared with adding a second query engine.

PostgreSQL offers full-text search and recursive queries. These are building blocks,
not proof of v2 ranking parity or performance. Use explicit identifier indexes,
weighted text fields, and bounded batched adjacency. PostgreSQL text ranking is not
BM25. Restricted-scope relevance and latency gates precede release commitment.
[Full text](https://www.postgresql.org/docs/current/textsearch.html),
[recursive queries](https://www.postgresql.org/docs/17/queries-with.html).

SQLite FTS5 remains a reference and possible later portable format, not a second
supported backend in v0.1. Dedicated graph, search, vector, and cache servers are
deferred until measured workloads justify them.
[SQLite FTS5](https://www2.sqlite.org/fts5.html).

## Semantic retrieval

Start with exact identities, lexical search, and reviewed mappings. Reserve a
search-lane interface within ContextFoundry for embeddings. A semantic lane must
improve held-out terminology recall without changing evidence trust or access.
Evaluate pgvector first if needed; model routing, dimensions, embedding versioning,
cost, and safe restricted-scope ranking require a separate decision. No semantic
model is required for the initial build.

Optional query-time embedding/reranking inference must declare data routing, model
version, CPU/GPU needs and failure fallback. It is distinct from generative answer
production. See [hybrid retrieval](../design/hybrid-retrieval.md).

Do not postpone the semantic-recall experiment until after the business workbench.
If E2 finds terminology misses, compare a semantic lane on the same corpus early.
Keep serving independent of any particular model provider. Approximate indexing is
not the starting correctness oracle: verify against exact authorized-only results
and test hidden-distractor effects. See [second-pass assessment](../research/second-pass-assessment.md)
and [validation sequence](../evaluation/validation-sequence.md).

## Library evidence and constraints

React supports TypeScript; Vite can build the SPA. Fastify supports schema-based
validation and serialization, but compiled schemas are application code. Pack-uploaded
schemas must never be installed as executable route schemas.
[React](https://react.dev/learn/typescript), [Vite](https://vite.dev/guide/),
[Fastify](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/).

Tree-sitter provides syntax parsing, not complete semantic or runtime resolution.
Framework adapters must preserve unresolved references.
[Tree-sitter](https://tree-sitter.github.io/tree-sitter/).

PostgreSQL row security is defense in depth. Runtime identities must not own protected
tables or possess bypass privileges; migrations use a separate identity.
[Row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html).

## Alternatives

| Alternative | Why deferred | Revisit trigger |
|---|---|---|
| Next.js | Private review UI needs no SEO/SSR | Demonstrated server-rendering requirement |
| Python primary backend | Second main contract/runtime ecosystem | Specific extraction advantage; isolated Python workers can precede this |
| Graph server | Scoped neighborhoods and typed paths fit adjacency model | SQL implementation fails representative graph gates after optimization |
| Temporal | Initial preparation stages need bounded retries/checkpoints | Long-lived multi-system workflows and compensation |
| Kubernetes first | Installation burden | Enterprise HA and platform requirements |
| Full LLM knowledge generation | Adds interpretation, reproducibility and cost concerns | Reviewed offline proposals demonstrate measurable value |

# Second-pass architecture challenge

**Status:** Research-informed revisions proposed · 2026-09-20 · CF-0.1

Historical research pass retained as evidence. The reconciled CF-0.2 scope and
current verdict are in [design closeout](design-closeout.md); later Java/fixture and
review-workflow decisions supersede earlier sequencing suggestions here.

## Verdict

Keep the product direction and small deployment footprint. Change the first proof
of value, extraction precision model, and access lifecycle before implementation.
ContextFoundry should earn its place by supplying useful enterprise meaning and
constraints with inspectable evidence—not by producing another repository overview.
This pass strengthens the proposal; it does not validate a working product.

## Keep, change, defer

| Area | Disposition | Reason / next evidence |
|---|---|---|
| Existing agents own reasoning/code generation | Keep | No need to build another agent runtime |
| Independent implementation informed by other systems | Keep | Reuse mechanisms and formats, not whole runtime providers |
| React/TypeScript, Node/Fastify | Keep provisionally | No evidence found requiring a UI/runtime change; compatibility still untested |
| PostgreSQL operational state and initial projections | Keep conditionally | Scoped quality/query-plan spike must precede a broad build |
| Minimal business knowledge | Move earlier | M2/M3 must test the enterprise gap; full curation UI can wait |
| Syntax-only extraction | Change | Add precision tiers and a CI-produced semantic-index import path |
| Retrieval/guidance evaluation | Strengthen | Same-information baseline, minimal-guidance control, staged fault localization |
| Search roadmap | Change priority | Test semantic recall early if lexical/mapping lanes miss business terminology; no mandatory vector service |
| Access lifecycle | Strengthen | Acquisition, publication, source ACL freshness, withdrawal, and local revocation are different |
| Test impact / architecture proposals | Keep staged | Advisory, evidence-bound; compatibility is not behavioral parity |
| Broad connectors, full graph engine, HA, automatic migration | Defer | They do not resolve the first usefulness uncertainty |

## Evidence method and limits

Read primary documentation, a research-paper abstract/version record, selected
pinned public source paths, and v2 reports/source. Vendor descriptions establish
documented capabilities, not independent comparative quality. No external benchmark,
enterprise corpus run, paid model experiment, or full security audit was reproduced.
The AGENTS.md finding below uses the revised paper abstract, not a full replication.
Sources were accessed on 2026-09-20; live documentation can change.

### 1. More context and more guidance are not inherently better

The revised AGENTS.md study reports no general task-success improvement and higher
average inference cost in its evaluated repository-context settings. It also finds
instructions are followed. This challenges the assumption that failure to benefit
always means the model ignored guidance. It is not a study of ContextFoundry or of
permission-scoped enterprise retrieval. [Paper, v2](https://arxiv.org/abs/2602.11988v2).

Our inference: compare minimal guidance against the proposed guidance, and score
outcomes rather than obedience. Keep native source inspection available. A compact
response can still omit decisive evidence; a longer one can sometimes be justified.

### 2. Retrieval must preserve document meaning as well as code names

Anthropic describes adding chunk-specific context before lexical and embedding
indexing, then combining retrieval and reranking. Its reported gains are from its
own evaluation, not an enterprise-engineering guarantee.
[Contextual retrieval](https://www.anthropic.com/engineering/contextual-retrieval).

Our design: retain title, section hierarchy, product/version, and exact passage
together. Deterministic context comes first. Generated contextual descriptions,
embeddings, and reranking remain independently measured candidates. A descriptor
derived from restricted material inherits its visibility requirements. Do not let
curated aliases encode benchmark answers or postpone vocabulary failures indefinitely.

### 3. Structural precision needs an explicit ladder

Sourcegraph distinguishes precise SCIP-backed navigation from search fallback and
recommends CI indexing for complex/authenticated builds. SCIP is a language-neutral
code-intelligence format. Neither statement proves complete runtime dependency
coverage. [Precise navigation](https://sourcegraph.com/docs/code-navigation/precise-code-navigation),
[SCIP protocol](https://github.com/scip-code/scip).

Our design: distinguish syntax declarations, semantic symbol resolution, framework
bindings, and observed runtime behavior. Import bounded semantic indexes bound to
source digests from approved CI. ContextFoundry still does not execute arbitrary
repository builds during extraction, and Sourcegraph is not a required server.
Unsupported dynamic dispatch/reflection remains an explicit gap.

### 4. Recheck the mechanisms, not only the project summaries

The following pinned files were reopened. Historical v2 line ranges do not all
align with the functions in the fetched files; use commit, path, and function name
together. No copied implementation or benchmark claim follows from these inspections.

| Source inspected | Observation | Transfer / limitation |
|---|---|---|
| GitNexus `query`, `local-backend.ts`, commit `ac9a4e9abd8fd3058c070b72c23402a4f887929a` | Parallel lexical/semantic retrieval, rank fusion keyed by node ID with path fallback, batched process enrichment | Separate candidate retrieval from grouping; batching matters; process membership needs preparation and is not proven business flow |
| Codebase Memory MCP trace response, `mcp.c`, commit `8972ea69c6ad94b1ef1d4ffbf0a92d78d2db1798` | Distinguishes output, page, engine, and edge-data limits; continuation tied to query arguments | Preserve distinct incompleteness causes instead of one generic truncation flag |
| Graphify `_query_graph_text`, `_traversal_view`, `_cut_lines_to_budget`, `serve.py`, commit `c7ec1082083e3e876443f643ecf86ebcfae177c2` | Seed-oriented bounded output; neighborhood traversal uses an undirected view while retaining direction metadata | Useful neighborhood browsing is not equivalent to a directed causal path; preserve parallel directed edges in our impact engine |

[GitNexus source](https://github.com/abhigyanpatwari/GitNexus/blob/ac9a4e9abd8fd3058c070b72c23402a4f887929a/gitnexus/src/mcp/local/local-backend.ts),
[Codebase Memory source](https://github.com/DeusData/codebase-memory-mcp/blob/8972ea69c6ad94b1ef1d4ffbf0a92d78d2db1798/src/mcp/mcp.c),
[Graphify source](https://github.com/Graphify-Labs/graphify/blob/c7ec1082083e3e876443f643ecf86ebcfae177c2/graphify/serve.py).

GraphRAG local search combines graph-derived information with associated text for
answer context. Borrow the evidence association and selection idea, not a hidden
answer-generation service. [Local search](https://microsoft.github.io/graphrag/query/local_search/).

### 5. V2 implicates query composition, not just payload size

Re-read the retrospective, latency RCA, `discovery-response-v2.js`, and selected
`serving-projection-v2.js` / `typed-paths.js` paths. The response validator enforces
an exact one-call instruction string; this verifies wire policy, not agent behavior.
The RCA reports the same first lexical query at 0.740 seconds unrestricted versus
20.475 seconds with actual host scope. It identifies repeated witness/proof work;
the source includes scope-sensitive search and support authorization. These are
reported historical timings, not reruns. See [v2 disposition](v2-disposition.md).

The conclusion is narrower than the retrospective's preferred redesign: progressive
tools are a candidate, not a demonstrated cure. Keep a compact one-call arm. Do not
remove authorization to obtain speed or assume replacing SQLite solves the problem.
Measure capture availability, candidate recall, path construction, serialization,
tool latency, and final answer separately to locate the failure.

### 6. PostgreSQL is a reasonable consolidation choice, not retrieval proof

PostgreSQL's text-search configuration normalizes terms and supports weighted
ranking; code identifiers need their own exact/token handling. Native text rank
must not be presented as BM25. [Text search controls](https://www.postgresql.org/docs/current/textsearch-controls.html).

pgvector documents recall issues when filtering approximate-index scans, with
iterative scans and partitioning among the mitigations. SQL row filtering alone
does not demonstrate permission-independent retrieval quality.
[pgvector filtering](https://github.com/pgvector/pgvector#filtering).

Our gate: compare authorized-only exact retrieval with each candidate index plan;
vary permissions, hidden distractors, dependency density, and concurrent preparation.
Do this before selecting an approximate index or promising enterprise scale.

### 7. Authorization consistency is a product contract

OpenFGA explicitly distinguishes cached low-latency queries from higher-consistency
queries. That illustrates a tradeoff, not a recommendation to add OpenFGA or proof
that a local policy-version field solves distributed source permissions.
[Consistency modes](https://openfga.dev/docs/interacting/consistency).

Our design must name the authority for each source, the validity of its ACL snapshot,
and what happens when that authority is unavailable. Locally committed revocation
can be enforced immediately for subsequent authorization decisions; a remote
permission change is unknown until observed. Long-lived group claims and cached
exports need explicit treatment. Previously delivered content cannot be recalled.

MCP guidance prohibits token passthrough and covers confused-deputy, SSRF, and
session risks. Enterprise login alone does not address these integration boundaries.
[MCP security guidance](https://modelcontextprotocol.io/docs/2025-11-25/tutorials/security/security_best_practices).

### 8. The competitive gap is narrower than "code plus enterprise documents"

Unblocked documents PR discussion using connected code, documents, and team
discussions, as well as source-specific Teams permission controls.
[PR Chat](https://docs.getunblocked.com/code-review/pr-chat),
[Teams access behavior](https://docs.getunblocked.com/data-sources/microsoft-teams).

Therefore that combination alone is not a novel differentiator. Our proposed
position is a self-hosted, inspectable evidence layer with explicit business-to-code
relations, constraint applicability, revision-aware change/test reasoning, and
agent-independent access. This is a positioning hypothesis, not a claim competitors
lack those capabilities. Measure onboarding and maintenance effort as well as answer
quality. A connector inventory or public-source benchmark cannot establish leadership.

### 9. Compatibility and behavior are different obligations

Pact distinguishes consumer/provider message agreements from provider functional
side effects. This supports keeping contract compatibility, test coverage, and
behavioral parity separate in the review model.
[Contract versus functional tests](https://docs.pact.io/consumer/contract_tests_not_functional_tests).

Our extension needs behavior obligations with input partitions, observable outputs
and side effects, tolerances, exclusions, and actual run evidence. Test selection
alone is not a migration-validation feature. CI remains responsible for execution.

## What would change the recommendation

- If hand-selected evidence does not improve answers, revisit information utility
  and agent integration before optimizing retrieval.
- If useful evidence exists but cannot be selected reliably, fix retrieval before
  adding more preparation or a broad workbench.
- If decisive evidence is missing, add the narrowly identified source/semantic facet.
- If same-information baselines match our result at lower total effort, narrow or
  reconsider the product proposition.
- If authorized query plans fail after bounded optimization, reopen projection
  storage without discarding the operational database or portable records.

The [validation sequence](../evaluation/validation-sequence.md) defines the next
experiments. They require a separately authorized implementation/evaluation phase.

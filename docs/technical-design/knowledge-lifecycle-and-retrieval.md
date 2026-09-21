# Knowledge lifecycle and task evidence selection

**Status:** CF-0.3 implementation specification; algorithms and limits require the
[handoff receipts](../execution/architecture-handoff.md), not assumed performance.
This refines [data contracts](data-contracts.md), [hybrid retrieval](../design/hybrid-retrieval.md)
and [retrieval guidance](../design/retrieval-and-agent-guidance.md).

## Two graphs, four separate concerns

Entity relationships describe engineering/business connections and can contain
cycles. Evidence dependencies explain what supports an assertion and must form an
acyclic, bounded support graph in the first version. Mutual method calls are valid;
assertions that only justify each other are not. Neither graph is the job DAG.
Retrieval projections and task-local hypotheses are separate from all three.

Source-derived assertions, reviewed business knowledge, observed execution evidence
and task hypotheses keep different origins. No extraction or relevance score can
promote one to another. Store conflicting statements with applicability and support;
do not select the newest as truth by default. Inferred document summaries are
reviewable proposals, not substitutes for passages or required intent.

## Snapshot compiler and refresh algorithm

1. Capture the selected file inventory and bytes with source/revision provenance.
   Record selection/exclusion and supported-family coverage; a complete declared
   inventory is not proof of complete enterprise knowledge.
2. Store each analyzer's contribution keyed by capture unit, analyzer package,
   configuration and parser/rule digests. Reprocessing replaces that contribution,
   not other producers' assertions. Content-addressed blobs permit reuse.
3. Build qualified identity and interface registries over the selected snapshot.
   Resolve references with the [SDK contract](sdk-extension-contract.md). Record both
   positive dependencies and lookup/watch keys for empty or ambiguous candidate sets.
4. Import source-backed reviewed mappings with exact support fingerprints and
   applicability. Reusing a human review requires unchanged relevant evidence and
   configuration; otherwise mark stale and exclude it from current affirmed mappings.
   Keep the historical decision inspectable. Renames do not inherit review silently.
5. Validate envelope/profile compatibility, endpoint types and existence, capture
   bytes/locators, evidence closure, duplicate ownership and coverage. Incomplete
   families are explicitly partial; dangling exact relationships never activate.
6. Compile exact/lexical indexes and typed adjacency from validated assertions.
   Precompute bounded support sets once per immutable generation, not inside every
   lexical term query. Support-set validity is not user authorization.
7. Write manifest and completion receipt, then atomically select the candidate
   generation. Requests pin one generation; incomplete staging stays invisible.
   Offline activation is a local file-pointer operation, not enterprise publication.

For an incremental build, invalidate changed/deleted contributions, reverse support
dependents and resolver watch keys whose provider namespace/configuration changed.
Rerun affected resolution including previously unmatched references. A new duplicate
provider can turn a resolved link ambiguous; a removed provider can break an unchanged
consumer. Configuration/profile changes invalidate all affected producer outputs.
If dependency completeness is uncertain, rebuild the affected namespace or full
capture instead of retaining unverified edges. The first implementation may full
rebuild; incremental optimization follows a deterministic full-build oracle.

Compare full versus incremental **semantic output** after excluding run timestamps,
attempt IDs and receipt timing. Canonical assertion identities, locators, relationship
states, coverage and selected evidence must agree. Interrupted builds, empty inputs,
removed files, provider addition/removal and stale review are mandatory cases.

Source withdrawal and current access revocation are not ordinary historical refresh:
before shared serving, suppress access immediately using current policy even for
pinned older generations and exports/caches. Never activate historical permissions
on rollback. Retention/delete controls follow the operations/security specification.

## Retrieval request and result contracts

The host preserves the exact original task as immutable input. It can supply intent,
versioned concerns and human-confirmed scope separately. Never concatenate tool
instructions into the story. Unknown intent or applicability remains unknown; the
agent clarifies material ambiguity. No internal generative planning model is required.
Without supplied concerns, use the original request as one concern rather than
inventing an unsupported decomposition. Limits reject oversized requests explicitly;
they do not silently drop story requirements.

The offline engine receives a pinned snapshot, request, configured budgets and an
explicit allowed-input scope. That scope is a fixture boundary, **not** enterprise
authorization. Shared services later derive it from authenticated policy; callers
cannot nominate arbitrary principals or grants. Every retrieval operation carries
request/generation/configuration identifiers for replay.

Each evidence packet contains:

- Concern ID and original-request reference; interpreted intent and scope version.
- Ranked entry points with reasons, qualified IDs, precise locators and trust labels.
- Small supported relationships, their direction/basis and indispensable connectors.
- Per-question facets: supported, conflicting, stale, unresolved, unsupported or not
  yet investigated; absent facts never become false or universally inapplicable.
- Separate hypotheses/candidate associations, never interleaved as confirmed facts.
- Suggested next operation/read, why it is useful and the question it would address.
- Omission/limit diagnostics, continuation state and actual serialized byte counts.

The packet does not assert that the agent knows enough to modify code. The agent
records a sufficiency assessment for the intended action. API-use questions may be
answered from complete declared contract facets; implementation changes require
inspection of current relevant source and tests. A contract is not proof of actual
runtime behavior or absent side effects.

## Deterministic first selection algorithm

Initial configuration is versioned, not advertised as tuned. Use at most eight
explicit concerns, 32 candidates per lane/concern, 256 unique candidates across the
request, 200 visited nodes, 400 inspected edges and four hops across a request's
bounded expansion. These are workload caps, not completeness claims or latency SLOs.
A continuation consumes the remaining session allowance or requests an explicit
budget increase; it must not silently reset the entire exploration budget.

1. Search exact qualified identity/operation keys first, keeping ambiguous matches
   separate. In other lanes match names, reviewed aliases and lexical description/
   passage text. Split identifiers for search only; never normalize entity identity
   by fuzzy matching. Deduplicate within lanes before rank fusion.
2. Reserve the exact-match group, then fuse nonexact lanes using reciprocal rank
   fusion, `sum(1 / (60 + rank))`, with rank starting at 1 and equal lane weights.
   Missing lanes contribute nothing. Tie-break by qualified ID and immutable record
   ID using the existing canonical ordering. No undocumented model relevance score.
3. Round-robin concerns to admit initial candidates under the global cap, recording
   omissions. Lexical matching can nominate a connector but is not required of every
   intermediate node. One broad concern cannot exhaust all other concerns silently.
4. Expand admitted seeds only under the intent's named relation policy. Visit cycles
   with a `(node, policy, direction)` key, retaining the best deterministic supported
   path and counting every examined edge against the work budget. Batch neighbors;
   do not run full-corpus searches or recursive support queries per node/term.
5. Assemble small evidence units: entry point, necessary typed path and attributable
   source pointers. Group by concern. Deduplicate shared support across units. Pack
   whole units by ranked order, maintaining concern diversity and surfacing conflicts.
   If a complete unit exceeds the budget, return an explicit oversized-unit/gap and
   a focused inspect option; never display an unsupported edge to save bytes.
6. Serialize the actual response including labels, diagnostics and tool wrapper.
   Initial orientation has a 32 KiB hard cap and a 2,000 estimated-token target;
   focused inspect/evidence responses have a 16 KiB cap. Estimated tokens are not
   billed tokens. Oversized required metadata yields a typed bounded error. Log
   exclusions at each stage without emitting hidden source metadata to the caller.

| Policy | Allowed interpretation | Forbidden shortcut |
|---|---|---|
| API consumption | Operation -> source-declared request/response/error/security facets | Infer service behavior from route names |
| Enhancement/defect | Reviewed applicable business association -> implementation; supported calls/data/config references in their declared directions | Treat generic `related_to` or lexical similarity as executable dependency |
| Impact/test nomination | Reverse supported dependencies from changed entity; explicit/static test associations | Claim all affected code found or safely skip tests on partial coverage |
| Functional inquiry | Applicable rule/flow and its supporting passage; technical pointer if needed | Use a proposal or stale mapping as current business truth |

Fuzzy and semantic lanes remain optional additions, enabled only for diagnosed recall
misses on the same corpus and evaluated separately. An unavailable semantic lane
falls back to declared exact/lexical behavior with a lane diagnostic. PostgreSQL FTS
and any later embeddings must implement these selection/evidence semantics, although
their candidate rankings can differ from the reference backend. Compare against
authorized-only oracles, not a claim that two different rankers are identical.

## Access and performance boundary for shared serving

Current policy determines eligible assertions **and all supporting evidence** before
search, scoring and traversal. Precomputed support membership can accelerate this;
it never caches an allow decision across access epochs. A response-time recheck
prevents revocation races. Hidden candidates must not affect exposed ranks/counts or
diagnostic details; even corpus-wide scoring statistics require scrutiny against
the authorized-only oracle. Current PostgreSQL design is provisional until this
property and scoped query plans pass WP4. No response cache in the first shared slice.

## Agent loop, reviews and diagnostics

`orient/search -> scope review -> inspect/trace/evidence -> selective local reads ->
findings/design/plan -> implementation review` is a stage sequence, not a fixed
number of tool calls. Inspect/trace can repeat inside the approved scope. Record
why the agent broadens when evidence is missing/stale/contradicted; do not prohibit
necessary grep or falsely claim control over an external host's shell.

Local source resolution returns exact, changed, missing, ambiguous or unbound status.
Only exact current byte/range bindings are presented as verified pointers. A changed
file can still be read by the authorized host as new task evidence; it does not
retroactively update the old release. Material scope changes return to Gate 1;
material proposal changes invalidate Gate 2. Local scripted reviewer events test
state semantics but are visibly simulated, not authenticated human approvals.

Trace the chain: required source fact -> extracted assertion -> retrieved candidate
-> retained path -> serialized evidence -> actual source read -> finding/proposal.
Measure losses and cost at each stage, including empty results, failed queries,
wire bytes, source bytes read, unnecessary rediscovery, review corrections and
preparation/refresh labor. A deterministic script can prove mechanics; only a
controlled real-agent experiment can demonstrate investigation benefit.

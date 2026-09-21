# Validation-slice implementation work packages

**Status:** Revised local proof sequence; enterprise security gate remains mandatory · CF-0.2

These packages implement the first slice of the [milestone plan](implementation-plan.md).
They replace broad M1–M3 bootstrap work as the immediate coding queue. No package is
complete until its acceptance receipts exist. The document does not itself prove
implementation status; use the repository-root `WORKLIST.md` for verified progress.
Rich Studio, connectors and workbenches are excluded from this slice.

## Order and scope

```text
WP1 contracts -> WP2 bounded extraction -> POV local retrieval/workflow
                                                -> local utility decision
                                                       |
                                            WP3 identity/policy core
                                                       |
                                            WP4 secured retrieval
                                                       |
                                            WP5 integrated guided journey
                                                       |
                                            WP6 controlled enterprise evaluation
                                                       |
                                            WP7 keep/change/stop review
```

WP0 fixture/rubric and source-authority decisions run alongside this path and are
required before any private or paid benchmark. Synthetic-only contract and parser work
does not wait for them. The POV is a **local, single-operator, offline** diagnostic,
not a shared service or an authorization test. Reuse its retrieval and workflow
semantics in WP4/WP5; never carry a demo identity or simulated approval into
enterprise serving. Shared schema changes require coordinated review.

## WP0 — Freeze scope, truth and execution authority

**Inputs:** [benchmark dossier](../evaluation/three-repository-benchmark.md), product
requirements and owner review. **Outputs:** private capture manifest, exact development
tasks, sealed held-outs, independent rubric, approved workload and experiment budget.

Reconfirm revisions and allowed capture paths without changing checkouts. Establish
data publication audience, expected behavior owner, acceptable uncertainty, and
whether private code may be sent to a selected model. Record model/effort and host
capabilities; missing usage receipts stay unknown. Approve proposed thresholds before
results exist. Synthetic fixtures contain no copied private business/source content.

**Acceptance:** owner confirms the slice and rubric; all required facts have source
or attributed expert support; holdouts are not tuning inputs; no open data authority
or paid-run ambiguity. **Stop:** no rubric owner or necessary source authority.
Work may still proceed on approved synthetic contract fixtures, not private runs.

## WP1 — Executable contracts and conformance fixtures

**Packages:** contracts, domain, evaluation fixture schemas; minimal workspace/tooling.
**Inputs:** [data contracts](../technical-design/data-contracts.md),
[task contracts](../technical-design/task-and-review-contracts.md),
[extraction/binding](../technical-design/extraction-and-source-binding.md).

Implement strict schemas/types for captures, envelopes, assertions, locators, coverage,
release sets, task artifacts/decisions, errors and run manifests. Pin runtime/library
versions after compatibility/license checks. Define canonical serialization and hash
fixtures, including Unicode, numbers, duplicate keys, ordering and unsupported variants.

**Tests:** valid/invalid payloads, unknown fields, missing support, digest mismatch,
overloaded symbols, distinct source identities, unsupported kind handling, serialization
roundtrip. **Acceptance:** examples validate; generated types and runtime validators
agree; modules do not import UI/transport/database from domain. **Receipt:** schema
inventory, compatibility report and dependency lock. **Review:** high-attention contract
freeze before downstream work; no broad application skeleton or UI design exercise.

## WP2 — Bounded preparation and local binding

**Packages:** preparation, adapters, local-client binding module. **Depends on:** WP1.
First complete the [scanner evidence/disposition matrix](../research/scanner-and-enterprise-patterns.md)
against v1/v2 code and primary external mechanisms. Treat that matrix as a gate,
not a vendor dependency decision. No further TypeScript-only optimization precedes
the multi-family conformance fixture unless a measured failure justifies it.
Implement the declared Java/Spring, TypeScript/Hono, SQL, Markdown and test-source
patterns, qualified identities, ambiguity outcomes and approved reviewed-mapping import.
Add support closure, candidate validation and canonical release files. No compiler
build or runtime execution inside extraction. CI semantic import is an optional
precision sub-spike, not a substitute for supported syntax/framework fixtures.

Implement local source-root registration and digest-checked resolution; never upload
dirty bodies or auto-clone. Cache contributions only after full-build correctness.

**Tests:** full matrix in extraction/binding design; rename/delete/rebind/ambiguity,
partial parse, content limits, path traversal, stale local files and full/delta parity.
**Acceptance:** all expected supported facts recovered with no false exact bindings;
unsupported facts visible as coverage gaps; reusable business mappings predating task
tuning. A cross-layer task must connect a passage, API, service, data object and
associated tests with correct source pointers, explicit gaps and selective file reads.
**Receipts:** capture/release digest set, coverage report, reviewed mapping
receipt, parity report, preparation/curation time. **Stop:** required critical behavior
depends on unsupported extraction; review scope or add explicit reviewed evidence.

## POV — Local knowledge, retrieval and guided-workflow utility gate

**Depends on:** minimum frozen WP1 contracts and bounded WP2 outputs. Implement a
deterministic pack over explicitly selected, read-only inputs, then a same-information
exact/lexical pointer baseline and typed-evidence treatment. Exercise scope-map,
review feedback, selective file inspection, findings and implementation proposal in
an offline single-operator harness. Local reviewer choices are test inputs, **not**
authenticated human-decision receipts. Keep implementation modular so WP3/WP4 can
enforce policy before ranking, traversal, counts and response delivery.

**Safety now:** allowlisted input paths, normalized-path and byte/digest checks,
bounded parsing, no repository code execution, no ambient scanner roots, no secrets
in logs, source classification/provenance on every derived fact, and no network
listener or cross-user serving. Use public synthetic fixtures by default. Approved
private material remains outside the public repository; WP0 owner decisions govern
private/paid runs and model data routes. An extractor's read permission never means
publication permission.

**Acceptance:** reproducible pack and coverage, exact source pointers, baseline versus
typed retrieval comparison, useful scope corrections and selective reads on held-out
tasks, with failures and curation time recorded. **Stop:** unsafe source handling,
false exact binding, or unmeasured information differences. A favorable result
authorizes consideration of enterprise controls, not deployment to other users.

## WP3 — Minimal task, identity and policy core

**Packages:** policy, reviews, storage, minimal server routes and two review pages.
**Depends on:** the local utility decision for this sequence, plus WP1 contracts.
Implement PostgreSQL migrations, server-side principal/delegation,
OIDC/session boundary for human decisions, explicit scoped grants, task CAS/idempotency,
publication receipts and current access epoch. Demo identities are loopback/synthetic
only; no production bypass. Stage shared/private-serving evaluation only after valid identity
and publication configuration; offline single-operator diagnostics remain subject to
WP0 source authority. Initial review pages show exact artifact versions and
Accept/Request changes/Reject; postpone broad Studio administration.

**Tests:** deny/no-grant/hidden-support, agent self-approval, CSRF, digest/version drift,
concurrent decision, cross-task replay, revocation and task-artifact visibility.
**Acceptance:** human decision receipts cannot be forged by agent credentials;
direct HTTP cannot bypass hidden UI; policy failure denies access. **Receipts:**
transition table tests, authorization matrix, database-role checks, review screenshots.
**Stop:** identity/authorization uncertainty; never compensate with prompt instructions.

## WP4 — Secured retrieval and PostgreSQL decision spike

**Packages:** retrieval, storage projections, evaluation. **Depends on:** WP1 plus
WP2/WP3 contracts and sufficient outputs. Secure the proven local exact/lexical/alias retrieval,
bounded directed traversal, support authorization, inspect/evidence rendering and
signed continuations. Implement B (simple retrieval) before C (typed enrichment)
using common authorized captures. Keep response caching disabled.

**Tests:** independent recursive authorization oracle; scope fractions and hidden
distractors; connectors without lexical matches; overloaded/duplicate names; revocation
during query; malformed/stale cursors; serializer bounds and coverage outcomes.
**Acceptance:** oracle-equivalent visible results, no hidden rank/count/pointer leaks,
actual-scope latency/resource results at the approved envelope, with quality retained
at output limits. **Receipts:** SQL plans, phase timings, result parity and failure
traces. **Decision:** retain PostgreSQL projections or reopen ADR 0003. Do not add a
graph/vector server without this evidence. Model lanes require separate budget/data
approval and a diagnosed recall or ranking failure.

## WP5 — Complete guided agent journey

**Packages:** CLI/client, MCP read tools, versioned integration guide and minimal Studio.
**Depends on:** WP2–4. Render scope map, verified Gate 1 receipt, sufficiency/read
receipts, findings and minimal design/execution/validation proposal, Gate 2, completion.
Source reads and edits remain with the host. Task status is read-only via MCP; drafts
use HTTP/CLI; human approval uses authenticated UI. An inquiry completes without code.

**Tests:** contract-sufficient API question; enhancement with selective source reads;
human-added area; silence/rejection; missing/dirty local root; material expansion;
proposal/source drift; interrupted resume; injected source instructions; expired access.
Compare HTTP/MCP/CLI semantics. Test both review pages at narrow/wide widths and keyboard
only. **Acceptance:** no conforming workflow codes before verified Gate 2; no claim of
server-enforced host isolation. **Receipts:** state/event trace, host capability matrix,
UI checks and required-versus-actual read audit. No production application edits are
needed for read-only planning tasks; coding experiments use separately authorized copies.

## WP6 — Evidence utility and controlled comparison

**Depends on:** WP0–5, or approved offline diagnostic packets before the full service.
Start O-vs-A; then A/B/C development comparisons; then held-outs. Keep information,
model/effort, gates, task limits and cache conditions matched. Separate active model/tool
work, reviewer work and wait time. Record all failed/skipped attempts and preparation cost.

Use a small preapproved batch first; expand repetitions only when variance and budget
justify them. If a reviewer supplies new hints, record content and cost and apply an
equivalent policy across arms. Optional guidance/semantic treatments vary one factor.
Agent-generated judges assist but cannot replace independent critical-impact adjudication.

**Acceptance:** adjudicated scorecards and all gate outcomes; no tuning on sealed tasks;
usage estimates distinguished from receipts. **Receipts:** immutable run manifests,
per-task quality/effort, pipeline loss analysis and maintenance ledger. **Stop:** budget
ceiling, unauthorized disclosure or two failed diagnosed repair cycles.

## WP7 — Investment decision and handoff

Choose keep/change/stop for each mechanism, not only an overall verdict. If B is as
useful as C at lower maintenance cost, simplify. If even O fails, reconsider evidence
utility and task fit. If quality succeeds but costs fail, improve preparation/ranking
before adding UI features. If scoped query implementation fails, isolate storage from
the knowledge-model decision.

**Acceptance:** owner review of evidence; next milestone scope expressly authorized.
Only then expand M4/M5 workbenches and enterprise operations. A competitive market
claim additionally needs independent pilots and available fair external comparisons.

## Work-item handoff template

Every coding task includes: package/goal, requirement IDs, frozen input/output schema,
in-scope files, excluded work, dependencies, positive/negative tests, commands, expected
receipts and escalation conditions. One package may be split into smaller coherent
changes; do not combine unresolved policy, extraction and ranking redesign in one task.
Use the selected implementation model at normal effort; reserve deeper review for
contract/security decisions, hard failures and milestone verdicts.

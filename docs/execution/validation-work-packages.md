# Validation-slice implementation work packages

**Status:** Ready for owner review and bounded implementation authorization · CF-0.2

These packages implement the first slice of the [milestone plan](implementation-plan.md).
They replace broad M1–M3 bootstrap work as the immediate coding queue. No package is
complete until its acceptance receipts exist. No product code has been created by
this document. Rich Studio, connectors and workbenches are excluded from this slice.

## Order and scope

```text
WP0 fixture/rubric approval -> WP1 executable contracts
                                  |             |
                           WP2 extraction   WP3 task/policy core
                                  \             /
                            WP4 secured retrieval spike
                                       |
                            WP5 end-to-end guided integration
                                       |
                            WP6 controlled evaluation
                                       |
                            WP7 keep/change/stop review
```

WP2 and WP3 can proceed independently after WP1 freezes their contracts. Shared schema
changes require a coordinated review; do not let parallel implementations invent
different identity or approval semantics. WP4 can start with synthetic WP1 records
while WP2 develops, but cannot pass without real captured-shape evidence.

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
tuning. **Receipts:** capture/release digest set, coverage report, reviewed mapping
receipt, parity report, preparation/curation time. **Stop:** required critical behavior
depends on unsupported extraction; review scope or add explicit reviewed evidence.

## WP3 — Minimal task, identity and policy core

**Packages:** policy, reviews, storage, minimal server routes and two review pages.
**Depends on:** WP1. Implement PostgreSQL migrations, server-side principal/delegation,
OIDC/session boundary for human decisions, explicit scoped grants, task CAS/idempotency,
publication receipts and current access epoch. Demo identities are loopback/synthetic
only; no production bypass. Stage private local evaluation only after valid identity
and publication configuration. Initial review pages show exact artifact versions and
Accept/Request changes/Reject; postpone broad Studio administration.

**Tests:** deny/no-grant/hidden-support, agent self-approval, CSRF, digest/version drift,
concurrent decision, cross-task replay, revocation and task-artifact visibility.
**Acceptance:** human decision receipts cannot be forged by agent credentials;
direct HTTP cannot bypass hidden UI; policy failure denies access. **Receipts:**
transition table tests, authorization matrix, database-role checks, review screenshots.
**Stop:** identity/authorization uncertainty; never compensate with prompt instructions.

## WP4 — Secured retrieval and PostgreSQL decision spike

**Packages:** retrieval, storage projections, evaluation. **Depends on:** WP1 plus
WP2/WP3 contracts and sufficient outputs. Build exact/lexical/alias retrieval,
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

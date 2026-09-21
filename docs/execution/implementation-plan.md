# Detailed implementation plan

**Status:** CF-0.3 local utility gate before enterprise hardening

## Execution rule

Review this package before product implementation. Work proceeds by evidence-bearing
milestones. A milestone completes only when its acceptance evidence exists; documents,
schema counts, or test counts alone do not establish product usefulness. No deadline
estimate is implied by the sequence. Record actual effort during the first slice.

## Dependency order

The immediate coding queue is [A1–A5](architecture-handoff.md), refining the narrower
[validation work packages](validation-work-packages.md).
Its POV work package now proves a local single-operator knowledge/retrieval/workflow
path before enterprise identity and secured serving. M1 below remains the enterprise
application milestone; only its contract portion precedes that POV. Do not build
full M1 platform administration or rich M4/M5 screens before the usefulness gate. Review
[readiness/risks](readiness-and-risks.md) and [ADR 0005](../decisions/0005-validation-slice-baseline.md).

```text
M0 design/fixtures -> M1 contracts -> M2 bounded preparation -> local POV gate
      |                                                       |
      +-> fixed-corpus response/directive experiment           v
                                  enterprise identity/secured retrieval/integration
                                                               |
                                                M4-M6 product expansion and beta
```

The fixed-corpus experiment may begin as soon as inputs and a safe evaluation
harness are available. It must not wait for a large platform build. Local POV uses
an offline harness; M1/M3 later add authenticated UI and serving. M4 expands the
review experience. See the POV safety/acceptance boundary in the work packages.

Second-pass amendment: follow [E0–E5](../evaluation/validation-sequence.md). A small
reviewed business/constraint dataset belongs in M2/M3; M4 expands its authoring UI.
Run the permission-scoped projection spike before broad platform investment. Semantic
retrieval experiments may move earlier when E2 diagnoses vocabulary misses.

## M0 — Review, research ledger, and experiment specification

Tasks:

1. Review proposed ADRs, tech stack, security scope, and scoring/latency targets.
2. Freeze the private rentalapp/platform/agentic-platform maintenance fixture and
   a separate public-safe synthetic conformance corpus. Ratify expert obligations,
   data authority, execution budget and leasing holdouts before tuning.
3. Record v2 carry/adapt/rework decisions at component level. Establish provenance
   before any literal source reuse; independent implementation is the default.
4. Pin relevant reference-project revisions and record mechanisms without importing
   their platforms. Confirm parser/protocol/library compatibility.
5. Define scored impact questions, negative controls, and unseen-task reservation.
6. Specify frozen-corpus response/directive variants before tuning them.
7. Specify same-information baselines, reviewer-selected evidence diagnostic, and
   minimal-guidance control. Reserve independent must-find facts and unseen tasks.
8. Design the PostgreSQL authorization/query-plan spike, including hidden distractors,
   expired source entitlements, support density, and concurrent preparation.
9. Map CF-R01–17 to executable acceptance; freeze both review-gate semantics and host
   assurance level. Decide exact schema/runtime versions in WP1.
10. Audit v1/v2 extractor entry points and tests against Java/Spring, SQL/PLSQL,
    OpenAPI, TypeScript/Hono, document and test needs; record reuse/disposition and
    negative controls. Use the [scanner pattern gate](../research/scanner-and-enterprise-patterns.md).

Deliverables: accepted/rejected ADR record, fixture manifest, expected-evidence rubric,
trace classification guide, dependency inventory, and prioritized issues.
Exit: original story is separate from instructions; baseline can be reproduced or
its limits explicitly labelled. No unresolved license/data authority blocks the
selected public fixture. Review choices are recorded rather than silently assumed.

## M1 — Contracts, application skeleton, and access boundaries

Tasks:

1. Bootstrap pnpm workspace, strict TypeScript, lint/type/test tooling and CI.
2. Define JSON schemas and generated types for identity, evidence, release, errors,
   operations, and review state. Add compatibility fixtures.
3. Create PostgreSQL migrations for operational state and scoped projection skeleton.
4. Implement authenticated application context, OIDC browser flow, API credentials,
   explicit action/resource grants, policy versions, and minimal durable audit.
5. Build Studio shell with current identity/pack and authorized navigation.
6. Implement jobs with leases/fences, blob storage interface, and cancellation.
7. Separate acquisition and publication permissions; implement explicit publication
   receipts, access epochs, withdrawal and source-inherited ACL expiry contracts.
8. Implement task/map/proposal versions and human-only review decisions with CAS,
   revocation and minimal authenticated review pages; keep draft submission separate.

Acceptance: unauthenticated enterprise operations denied; a principal cannot invoke
hidden UI functions via HTTP; runtime DB role cannot bypass protected data; schema
failures are sanitized; job lease races cannot commit stale results. Secret-free
Compose demo boots and authenticates with its documented test identity setup.
Evidence: transport tests, database privilege checks, browser smoke, crash/retry test.

## M2 — Complete preparation slice

Tasks:

1. Inventory supplied local snapshots and Markdown captures; validate safe paths.
2. Implement isolated adapter runner, contribution cache, coverage inventory, and
   narrow Java/Spring and TypeScript/Hono/OpenAPI/SQL/Markdown adapters with declared limitations.
   Separate syntax capture, framework rules, semantic-index import and business
   review; do not infer a proven edge from a search candidate.
3. Add qualified identity, explicit ownership, provider/consumer resolution, and
   unresolved/ambiguous reference records.
4. Implement canonical JSONL manifests and candidate validation/diff report.
5. Build full projection, indexed dependency requirements, and atomic activation.
6. Add per-input incrementality plus reverse invalidation and full-build parity.
7. Include minimal reviewed business mappings and architecture constraints via
   validated import; bind publication approval to captured evidence and audience.
8. Prototype a revision/digest-checked Java or TypeScript SCIP import where required; keep syntax,
   semantic, framework and observed relationships distinguishable. Do not run builds
   inside the extractor. Semantic coverage gates any later precise-impact claim.
9. Implement safe local root binding and exact/changed/ambiguous/missing locator
   results. Source-control-neutral snapshots are required; no automatic source upload.

Acceptance: a complete candidate can be reviewed and activated; malformed archives,
hidden source, ambiguous routes, deleted providers, and changed ownership are handled
correctly. Interrupted jobs leave active release intact. Fresh/full and delta output
match semantically. Every selected fact has valid evidence; unsupported facets remain
visible as gaps. A passage -> API -> service -> data -> test task yields exact pointers,
explicit unresolved links and the files needed for deeper investigation. Measure
actual build stages and memory.
Evidence: fixture release, source/record manifests, validation report, parity report,
worker isolation tests, activation/rollback drill. Test count alone is not acceptance.

## M3 — Retrieval content and agent-usefulness gate

Tasks:

1. Implement exact and authorized lexical search with per-concern candidates.
2. Implement typed directional traversal, coherent path selection, and focused
   inspection/evidence operations; test connectors without lexical matches.
3. Add serialization bounds, signed continuations, safe errors and telemetry.
4. Expose HTTP, MCP, and CLI through shared authorized services. Retain trusted task
   text separately from agent search questions and output instructions.
5. Build compact content rendering and the first agent guidance profile.
6. Run fixed-corpus response/directive ablation before attributing changes to storage
   or preparation. Compare compact one-call vs focused follow-up delivery separately.
7. Run actual-scope performance and matched agent baseline experiments.
8. Include ordinary access to the same business documents in comparison arms, test
   minimal guidance, and record failure by pipeline stage. Complete the projection
   spike and evaluate semantic recall only if diagnosed misses justify it.
9. Complete map -> Gate 1 -> selective source investigation -> minimal findings,
   design/execution/validation proposal -> Gate 2 -> completion workflow. Inquiries
   end without coding. Test forged approvals, source drift and resume before rich UI.

Acceptance: hidden support cannot affect visible matches/ranks/paths; no partial path
masquerades as complete; cursor replay after revocation fails; wire output matches
offline semantics. Meet or explicitly reopen the proposed operational/usefulness
gates. Failure blocks broad workbench development. Limit tuning to two reasoned
iterations before architecture/product review.
Evidence: request/response fixtures, restricted-scope query plans, frozen run manifests,
blind scorecards, trace review, and per-task cost/time distributions.

## M4 — Business knowledge and Studio review

Tasks:

1. Create document capture/section/assertion and many-to-many mapping workflows.
2. Add business-to-code and reverse lookup with scoped evidence.
3. Implement mapping review bound to evidence fingerprints, conflicts, and stale
   approval invalidation. Offline model suggestions are a separate optional increment.
4. Complete pack configuration, candidate diff, evidence drawer, targeted graph view,
   jobs, and access administration with accessible alternatives.
5. Add authorized export and token expiry/revocation behavior.

Acceptance: terminology helps unseen business queries without adding expected-answer
lists. A changed document invalidates affected mappings; restricted passages do not
leak through aliases or reverse lookup. Browser journeys pass keyboard, narrow/wide
layout, session-expiry, concurrency, and direct-API denial tests.
Evidence: reviewed mapping corpus, quality/error analysis, Playwright reports, expert
review records. Creation/curation cost is reported alongside retrieval benefit.

## M5A — Architecture workbench

This extends the minimal proposal and approval already delivered in M3/WP5. It does
not postpone basic high-level design or implementation authorization until M5.

Tasks: version structured proposals against a baseline; import agent-authored options;
link enterprise constraints; show current/proposed diagrams and tables; manage review,
exceptions, supersession, and migration increments; connect validation obligations.

Acceptance: current-state claims resolve to authorized evidence; future components
remain proposed; stale baseline changes prompt re-review; approval never writes source
or changes observed facts. A reviewer can compare two realistic options and their
tradeoffs without reconstructing the evidence manually.
Evidence: architecture review example, citation checks, concurrency/revocation tests,
reviewer correction/time measurement.

## M5B — Test impact and validation

M3/WP5 already identifies validation obligations and test-evidence gaps. This milestone
adds richer analysis and verified-run ingestion; test migration/parity remains later.

Tasks: represent before/after change sets; map changed symbols/contracts to possible
dependents; classify test references vs observed coverage vs requirement mappings;
ingest authenticated CI reports; present recommendations and evidence gaps.

Acceptance: seeded changes recover known relevant tests; excess recommendations are
measured; stale coverage and wrong-commit runs cannot validate a change. CI is not
automatically pruned. A fault that should affect a test but is missed is investigated
before any claim of safe selection. Later test migration/parity needs its own fixtures.
Evidence: change/test truth set, fault-injection results, import integrity checks,
business-behavior review. M5A and M5B may run in parallel after shared contracts stabilize.

## M6 — Enterprise beta and operational readiness

Tasks: complete deployment documentation, upgrade/rollback, coordinated backups,
retention, audit export, source/adapter administration, bounded concurrency, and
supported runtime matrix. Test one representative enterprise identity setup and a
second independent product corpus. Run external-agent compatibility checks without
assuming all hosts report complete token usage or enforce identical instructions.

Acceptance: restored database/blobs reproduce active knowledge and reviews; policy
revocation and worker compromise boundaries are tested; declared scoped workload meets
latency limits; unseen tasks satisfy quality/usefulness criteria. Publish only verified
claims with corpus/model/configuration limits. Beta readiness does not claim market
leadership or universal language/framework coverage.

## Work-item discipline

Each implementation issue specifies input/output contract, dependencies, observable
behavior, failure cases, tests, documentation, and a concrete completion artifact.
Keep preparation, selection, rendering, and guidance commits distinguishable during
experiments. Record decisions, discovered gaps, and failed trials in the execution
ledger. Update Markdown and generated HTML together. No public publication, license
selection, or broad source migration is implied by completing a local milestone.

## Deferred work

Additional enterprise adapters, embedding retrieval, standalone graph/vector services,
HA/Kubernetes, automatic test pruning, code conversion, deployment orchestration,
and full behavior-parity automation follow evidence of need. Their extension points
exist in the design; they are not requirements for the first outcome demonstration.

Embedding retrieval is deferred as a production requirement, not prohibited as an
early diagnostic experiment. Likewise, enterprise CI semantic-index import does not
require supporting arbitrary builds or an external code-intelligence platform.

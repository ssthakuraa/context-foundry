# Implementation readiness and risk register

**Status:** Design closeout for validation implementation · CF-0.2 · 2026-09-20

## Ready means bounded

The requirements, architecture, workflows, extraction scope, task contracts and
ordered work packages are now a reconciled design baseline for the validation slice.
This is not an implemented product, completed M0 acceptance, or a proven market claim.
Owner review, benchmark truth and execution permission remain distinct checkpoints.

Read [research verdict](../research/design-closeout.md),
[traceability](../requirements/traceability.md),
[benchmark dossier](../evaluation/three-repository-benchmark.md), then
[work packages](validation-work-packages.md). Start WP0 before coding. Approval of
this documentation does not authorize paid inference, external publication, or edits
to the three evaluation repositories.

## Readiness matrix

| Area | Closeout result | Remaining gate |
|---|---|---|
| Product intent and functional journey | CF-R01–16; task depth and both human gates reconciled | Owner accepts detailed behavior |
| Architecture | Responsibility boundaries and reversible storage/retrieval choices specified | Scoped query spike and end-to-end value |
| Technical contracts | Extraction precision, source locators, task state/decisions, errors and access specified | Executable schemas/conformance fixtures in WP1 |
| Evaluation corpus | Three revisions recorded; bounded candidate tasks and holdout policy | Authorized capture, owner rubric, split freeze |
| Implementation scope | Dependency-ordered work packages with failure tests and receipts | Explicit start approval and WP0 exit |
| Competitive confidence | Positioning and evidence gaps explicit | Independent pilots and fair comparisons |
| Documentation | Canonical Markdown, generated HTML and link/parity checks | Re-run checks with each change |

## Risks and triggers

| ID | Risk | Mitigation / evidence | Escalation trigger |
|---|---|---|---|
| R1 | Useful enterprise knowledge is missing or stale | Expert obligations, evidence states, reusable reviewed mappings; track preparation labor | Oracle packet does not improve outcomes or necessary intent cannot be established |
| R2 | Rich graph costs more than it helps | Simple document/pointer baseline, incremental/full parity, per-lane ablations | No held-out gain after two bounded diagnosed iterations |
| R3 | Java/framework resolution overclaims precision | Narrow supported patterns, ambiguity fixtures, optional approved semantic indexes | Critical paths require unsupported reflection, dynamic SQL or generated wiring |
| R4 | Retrieval evidence leaks through derived facts/ranking | Support closure, current access epoch, independent authorization oracle | Any unauthorized payload/pointer/metadata disclosure; stop affected lane |
| R5 | Agent skips reviews or treats evidence as instruction | Verified decisions, guided/enforced labels, injection and resume tests | Host cannot support required conformance; do not advertise enforced mode |
| R6 | Test inventory masquerades as behavior coverage | Distinguish declarations, skipped tests, assertions and authenticated runs | Any parity claim based only on filenames or contract skeletons |
| R7 | Benchmark knowledge leaks into prepared mappings | Freeze mappings and rubrics separately; held-out workflow, exposure log | Exposed task treated as unseen; replace or relabel it |
| R8 | PostgreSQL scoped retrieval degrades | Actual-scope plans, hidden-distractor test, exact authorized oracle | Workload/quality gates fail after bounded query/index repair |
| R9 | Product becomes expensive enterprise consulting | Setup, expert review, refresh and ACL administration accounting | Recurring maintenance exceeds measured investigation savings |
| R10 | Existing products already solve the practical need | Same-information comparison and independent design partners | No repeatable advantage in quality, control, maintenance or deployment |
| R11 | Documentation drifts during parallel coding | Shared contracts first; small work packages; contract-change reviews | Worker changes interfaces or accepted semantics without review |
| R12 | Private material enters open-source outputs | Separate captures/trajectories; no corpus in product repo; publication review | Unapproved source, business rule, credential or identifying output in distributable artifacts |

## Quota-conscious execution handoff

The design-closeout boundary is the appropriate point to lower reasoning effort or
switch to the user's preferred implementation model. Routine implementation should
receive only its work package, linked contracts, relevant code and acceptance cases,
not an instruction to redesign the entire product. A model choice is not a quality
gate; check actual results.

Use stronger review selectively at WP1 contract/security freeze, WP4 authorization
and query-plan review, WP5 review-receipt/host boundary, and WP6 experiment verdict.
Escalate unresolved architectural or security choices; do not repeatedly regenerate
the whole design. This is an execution recommendation, not an estimate of account
quota multipliers or a promise of equivalent model performance.

## Decision log template

Documentation verification on 2026-09-20: generated-page parity and local link/anchor
checks passed for 45 pages; desktop review-guide and narrow work-package views were
visually spot-checked. All 16 requirement IDs have traceability rows. These checks
validate documentation artifacts, not application behavior or the proposed architecture.

Record date, work package, question, evidence, options, decision owner, affected
contracts/tests and keep/change/stop result. Store failed trials as well as successes.
Do not convert a proposed target into an achieved result by editing its status alone.

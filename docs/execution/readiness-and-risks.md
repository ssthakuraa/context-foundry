# Implementation readiness and risk register

**Status:** CF-0.3 bounded implementation handoff · 2026-09-20

## Ready means bounded

The [architecture review](../architecture/architecture-review.md) found and resolved
design gaps in extension interoperability, source lifecycle and evidence selection.
The [A1–A5 handoff](architecture-handoff.md) specifies the immediate implementation
and negative tests. It is ready for bounded coding, not production or a market claim.
Existing schemas/spikes are provisional; the new design is not yet implemented.

Read [research verdict](../research/design-closeout.md),
[traceability](../requirements/traceability.md),
[benchmark dossier](../evaluation/three-repository-benchmark.md), then
[work packages](validation-work-packages.md). Start A1 on public synthetic inputs;
WP0 remains required before private/paid evaluation. Public documentation checkpoints
are already authorized, but this does not authorize publishing private evidence,
new paid experiments or edits to the three evaluation repositories.

## Readiness matrix

| Area | Closeout result | Remaining gate |
|---|---|---|
| Product intent and functional journey | CF-R01–17; adopter extensibility made explicit; both review gates retained | Owner reviews task/domain truth for comparative evaluation |
| Architecture | Extension profiles, snapshot compilation, typed selection and six design walkthroughs specified | Integrated conformance, scoped query spike and end-to-end value |
| Technical contracts | 28 provisional exports and isolated spikes exist; closed-kind/language gap identified | A1 minimum contract revision; A2/A3 integration; no global freeze claimed |
| Evaluation corpus | Three revisions recorded; bounded candidate tasks and holdout policy | Authorized capture, owner rubric, split freeze |
| Implementation scope | A1–A5 specifies outputs, dependencies, failure tests and stop criteria | Public synthetic implementation may proceed; WP0 before private/paid runs |
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
| R11 | Documentation drifts during coding | Minimum relevant contracts first; small work packages; contract-change reviews | Implementation changes interfaces or accepted semantics without review |
| R12 | Private material enters open-source outputs | Separate captures/trajectories; no corpus in product repo; publication review | Unapproved source, business rule, credential or identifying output in distributable artifacts |
| R13 | Extension API exists but every new format needs core changes | Independent Python custom kind, standard projection and generic search/inspect acceptance | An adopter must patch core/UI or masquerade as a built-in kind |
| R14 | Incremental updates preserve stale or newly ambiguous links | Resolver watch keys and full-build oracle; stale-review invalidation | Provider change leaves a formerly resolved relation falsely exact |

## Quota-conscious execution handoff

The completed CF-0.3 documentation checkpoint is the appropriate point to switch
to the user's requested Sol Medium for A1–A5. Routine implementation should
receive only its work package, linked contracts, relevant code and acceptance cases,
not an instruction to redesign the entire product. A model choice is not a quality
gate; check actual results.

Use stronger review selectively at WP1 contract/security freeze, WP4 authorization
and query-plan review, WP5 review-receipt/host boundary, and WP6 experiment verdict.
Escalate unresolved architectural or security choices; do not repeatedly regenerate
the whole design. This is an execution recommendation, not an estimate of account
quota multipliers or a promise of equivalent model performance.

## Decision log template

Earlier documentation verification covered 45 pages; that historical count is not
the current inventory. Use the root `WORKLIST.md` for the latest HTML/link check.
All 17 requirement IDs have traceability rows. Documentation checks validate the
artifacts, not application behavior or the proposed architecture.

Record date, work package, question, evidence, options, decision owner, affected
contracts/tests and keep/change/stop result. Store failed trials as well as successes.
Do not convert a proposed target into an achieved result by editing its status alone.

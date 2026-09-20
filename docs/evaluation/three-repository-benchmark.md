# Three-repository benchmark dossier

**Status:** Candidate specification; owner rubric and execution approval pending
**Inspection date:** 2026-09-20 · CF-0.2

## Corpus and authority

Use the owner's local rentalapp, platform and agentic-platform clones privately.
Inspection was read-only: representative source, manifests, module documentation and
test declarations were examined. No application, database, test or model benchmark
was executed. Git status was clean when these revisions were recorded:

| Logical source | Revision | Evaluation role |
|---|---|---|
| rentalapp | 9b57b0e871555e815417c6654d193e0554bd6964 | Java/Spring domain implementation, React UI, SQL, functional/technical requirements |
| platform | 3781720a74937e5a4ab67b98b441ca31f4ec0c64 | Shared Java infrastructure and TypeScript packages |
| agentic-platform | 0159c29896ece2405a67d5a0db211f3622ccdfd8 | TypeScript API and shared integration/audit contracts |

These identifiers are observations, not an immutable capture manifest. WP0 freezes
authorized file digests without checkout changes. Local root mappings remain outside
the distributable corpus. Do not publish source, derived facts, answer keys or traces
without separate authority. Repository access is not open-source redistribution consent.

## Why this is representative enough to start

Rentalapp contains module-level functional specifications, technical specifications,
worklists and implementation, including maintenance, leasing, revenue and other
domains. Dependencies on platform appear in actual package/Maven manifests; maintenance
audit names also appear in agentic-platform contracts. This supports business-to-code,
shared-framework and cross-product tasks rather than an isolated repository demo.

It is still one related ecosystem with common development practices. It cannot
establish generality across legacy languages, other source-control systems, or
independently operated enterprises. Non-Git/path/security cases use synthetic fixtures.

## Bounded first capture

Capture maintenance requirements/technical documentation and explicitly relevant
historical decisions; Java maintenance services/resources/entities/repositories;
related schema and UI sections; the shared Java primitives they use; and matching
TypeScript contract declarations and consumers. Include dependency manifests and
test sources. Record dependency omissions rather than pretending the capture is complete.

Keep historical prompts/worklists as labelled untrusted reference material. They
do not authorize running commands. Distinguish draft intent, reported completion,
current declarations and executed behavior. Add a controlled distractor set from
other modules after the bounded case works; do not curate a corpus containing only
the answer-bearing files and then advertise full-repository retrieval performance.

## Candidate task families

The following are development themes, not sealed gold answers. Owner-confirmed exact
stories, required facts, accepted uncertainty and distractors are frozen in WP0.

| ID | Task | Main capability tested |
|---|---|---|
| D1 | Explain when maintenance dispatch requires human approval | Business meaning, applicability and current implementation reconciliation |
| D2 | Explain how to consume the maintenance triage API | Contract-sufficient answer without unnecessary implementation reads |
| D3 | Plan a change to a dispatch approval rule | Selective deep reading, impacts, validation plan and Gate 2 |
| D4 | Diagnose a document/implementation mismatch | Authority, freshness, contradictions and appropriate uncertainty |
| D5 | Trace a maintenance audit-contract change across products | Producer/consumer identity without claiming transport from name equality |
| D6 | Assess a shared permission/tenant-context change | Shared-library consumers and security obligations |
| D7 | Recommend validation for a maintenance change | Relevant tests versus skip markers, missing coverage and actual run evidence |
| D8 | Investigate an underspecified business variant | Ask for missing applicability; do not invent a universal rule |
| D9 | Resume after a human adds an overlooked subsystem | Revised scope, selective reading and invalidated approvals |

Reserve three exact leasing/renewal stories (H1–H3) with an owner/independent reviewer
before tuning. Only high-level themes—API use, behavior change and cross-module
impact—are specified here. They become valid holdouts only after exact stories and
rubrics are sealed from retrieval/guidance tuning. The earlier orientation read of
leasing documentation must be recorded; these are not a wholly unseen domain to the
design author. Prefer a separate evaluator for final held-out scoring.

Synthetic conformance cases additionally cover unanswerable queries, inaccessible
support, injected instructions, dirty/renamed sources, duplicate names, source
withdrawal, and test receipts for the wrong revision. Application tenant isolation
is domain evidence; it does not test ContextFoundry's own authorization automatically.

## Baseline arms and quota staging

- A: existing agent with normal authorized source/document access.
- B: same agent plus simple lexical document/code-chunk retrieval with precise pointers.
- C: same agent plus typed business/implementation context and selective retrieval.
- O: reviewer-selected evidence packet, diagnostic only, never advertised as retrieval.

Use identical model/effort, host instructions, gates, source permissions and task
limits across product comparisons. Any reusable expert-authored mapping or procedure
that adds information must also be available as readable reference material to A/B;
otherwise label a separate added-knowledge experiment, not a retrieval-only gain.
A representative external product is a later
head-to-head arm only if available and authorized; do not claim a win without it.
Optional fuzzy/semantic/reranking/procedure lanes are separate treatments, not bundled
changes. An oracle packet that fails to help is a signal to reconsider task/consumption.

First perform static extraction/locator/authorization checks without paid inference.
Then authorize a small O-vs-A evidence-utility diagnostic. Expand to A/B/C paired
runs only if useful; the four-arm v2 content/directive replay is separate and conditional
on comparable captured payloads. Do not pay to reproduce an unavailable historical
runtime merely to claim methodological completeness. Stop runs at the approved budget.

## Rubric and proposed decision gates

For each task record: intent, answerability, required facts/impacts, criticality,
evidence locations, acceptable alternatives, forbidden claims, expected source depth,
review transitions, validation obligations and scoring rationale. Owner judgments
about intended business rules are separate from source-observed behavior. A conflict
can be the correct result. Freeze all candidate-arm preparation before holdout reveal.

Proposed pilot gates, to ratify before runs:

1. No unauthorized disclosure, forged approval or unacknowledged critical false claim.
2. No silent critical omission against independent obligations. Explicitly unresolved
   cases are not counted as successful resolutions; report resolved-task rate separately.
3. At least 80% of the owner-labelled answerable pilot tasks satisfy all required
   obligations, and no regression against the strongest eligible baseline. Small
   samples are exploratory; this is a stop/go rule, not a population estimate.
4. Meet the quality-first effort gate in [methodology](methodology.md), including human
   review and knowledge preparation/refresh labor. Report both active work and waiting.
5. Carry useful performance to held-out stories without task-specific mapping repair.

Test files inspected include real unit assertions as well as contract tests with
unconditional or environment-dependent skips. Do not count all files as equivalent
coverage. Some historical handoff references no longer match current test paths;
staleness detection is part of the benchmark, not an error to silently clean away.

## Deliverables

Private capture manifest, task split/exposure ledger, independent obligation rubric,
run budget, per-arm receipts, failure-stage analysis and keep/change/stop decision.
The public product repo receives only approved synthetic equivalents and non-sensitive
aggregate outcomes. A second independent enterprise pilot follows before broad
competitive claims. The three source repositories remain unmodified by this plan.

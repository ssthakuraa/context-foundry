# Design-closeout review guide

**Status:** CF-0.3 bounded implementation handoff · 2026-09-20

## What is complete

The architecture review and targeted research follow-up are complete for a bounded
implementation slice. Start with the [architecture decision](architecture/architecture-review.md),
[product requirements](requirements/product-requirements.md), and
[readiness/risk register](execution/readiness-and-risks.md). This means a concrete
implementation handoff exists, not that the architecture is empirically proven.
No comparative agent experiments, PostgreSQL spike or serving product runtime has run.
Twenty-eight provisional schema exports and TypeScript, SQL, Java and Spring spikes
exist. No integrated source-to-agent utility gate has passed. Their closed kind and
language assumptions need the specified A1 revision, not another broad rewrite.
The [work packages](execution/validation-work-packages.md) now put a local,
single-operator utility proof before enterprise identity and secured serving.

The package specifies product boundaries, system architecture, a concrete technology
proposal, preparation/business knowledge, retrieval/directives, UI journeys, security,
data and interface contracts, architecture/test workflows, operational expectations,
evaluation, and a dependency-ordered implementation plan. Markdown is canonical;
HTML is generated for reading. This is a review baseline, not implemented behavior
or a production-certified specification.

## Suggested reading order

For the short owner review:

1. [Architecture review and decisions](architecture/architecture-review.md): findings,
   adopted mechanisms, representative task walkthroughs and what remains unproven.
2. [Product requirements](requirements/product-requirements.md) and
   [human-reviewed workflow](design/human-reviewed-engineering-workflow.md): confirm
   scope review, selective source reading, proposal and coding authorization.
3. [Benchmark dossier](evaluation/three-repository-benchmark.md): approve maintenance
   scope, rubric ownership, held-out policy and execution budget.
4. [A1–A5 handoff](execution/architecture-handoff.md): next five tasks, tests, stop
   conditions and model handoff; broader work packages remain the product roadmap.
5. [Traceability](requirements/traceability.md): requirements-to-design/test coverage.

Detailed architecture review follows:

| Order | Document | Review question |
|---|---|---|
| 1 | [System architecture](architecture/system.md) | Does responsibility stay with the right system and agent? |
| 2 | [Technology stack](architecture/technology-stack.md) | Is the enterprise operational footprint appropriate? |
| 3 | [V2 disposition](research/v2-disposition.md) | Are we preserving the useful foundations and isolating the failures? |
| 4 | [Retrieval and guidance](design/retrieval-and-agent-guidance.md) | Is the initial response useful and are follow-ups justified? |
| 5 | [Preparation and business knowledge](design/preparation-and-business-knowledge.md) | Does enterprise meaning retain evidence and ownership? |
| 6 | [Security](architecture/security-and-authorization.md) | Are extraction, UI, functions, derived evidence, and exports protected? |
| 7 | [Technical design](technical-design/system.md) | Are implementation boundaries and failure handling concrete? |
| 8 | [Evaluation](evaluation/methodology.md) | Will the experiment distinguish real benefit from test success? |
| 9 | [Execution plan](execution/implementation-plan.md) | Is the first usable slice small enough to prove value early? |

Implementers also read [extraction/source binding](technical-design/extraction-and-source-binding.md),
[task/decision contracts](technical-design/task-and-review-contracts.md) and the
[open WP1 freeze review](technical-design/contract-freeze-review.md) before dependent coding.

The new [SDK extension contract](technical-design/sdk-extension-contract.md) and
[lifecycle/retrieval specification](technical-design/knowledge-lifecycle-and-retrieval.md)
take precedence for their CF-0.3 refinements. Markdown is canonical; sibling `html/`
pages provide the same review content. Readiness means implementable decisions,
not evidence of market competitiveness or a freeze of every shared contract.

Then review [Studio](design/studio-experience.md), [architecture proposals](design/target-architecture-workbench.md),
[test impact](design/test-impact-and-validation.md), [data contracts](technical-design/data-contracts.md),
and [interfaces](technical-design/interfaces.md) in detail.

## Proposed decisions to review

| Decision | Recommendation | Remaining evidence |
|---|---|---|
| Product identity | Enterprise engineering context for existing agents | Held-out usefulness and user adoption |
| Implementation strategy | Own implementation, borrowing researched mechanisms | Per-algorithm pinned research/conformance |
| Initial stack | React/TypeScript, Node/Fastify, PostgreSQL, immutable blobs | Dependency compatibility and actual scoped workload |
| Retrieval behavior | Compact orientation plus focused operations | Fixed-corpus ablation and interaction comparison |
| First fixture | Private rentalapp/platform/agentic-platform maintenance plus public-safe synthetic cases | Frozen capture, owner rubric, sealed leasing stories and execution budget |
| Initial scope | Offline, single-operator preparation-to-retrieval/workflow utility proof first; enterprise enforcement of both review gates and scoped serving before shared use | POV decision, then WP3–WP5 security/integration gates before rich workbenches |
| Semantic extraction | Offline reviewable proposals, optional later | Mapping accuracy, curation cost, enterprise model policy |
| Success thresholds | Quality-first, proposed effort and latency gates | Review threshold suitability before experiments |

## Important corrections to the initial documents

Evidence origin, review, validation, freshness, and coverage are now independent.
An approved proposal remains proposed architecture, and a passing test is scoped to
its tested behavior. Permission diagnostics cannot identify hidden resources.
Agent guidance is distinguished from enforceable service policy. Canonical knowledge
need not mean committing every large generated corpus or capture into Git.

## Remaining uncertainty

No language stack guarantees retrieval quality; the selected PostgreSQL implementation
still needs benchmark evidence. V2's full corpus/model experiments were not rerun.
The external projects are research references, not validated ContextFoundry dependencies.
The first corpus is identified, but its private capture and expert rubric still need
approval. Model/data routing, execution budget, remaining dependency versions and
production SLOs require explicit decisions at their work-package gates. Apache-2.0
has been approved for the public repository; it does not grant rights to private fixtures.
The design does not assume paid evaluations or publication authority.

## Review outcome to record

Record accepted ADRs, requested changes, experiment thresholds and first implementation
scope. Begin WP0 and authorize specific coding packages; do not start the whole roadmap.
Routine implementation can use the preferred model at Medium effort with acceptance
tests. Reserve deeper review for contracts/security, hard failures and experiment
verdicts. No specific quota saving or equivalent model quality is guaranteed.

# Requirements-to-design traceability

**Status:** CF-0.3 design alignment audit · 2026-09-20

This maps intended behavior to implementation and observable acceptance. A row is
not an implementation claim. Requirement authority remains the
[product requirements](product-requirements.md); work is sequenced by the
[validation packages](../execution/validation-work-packages.md).

The immediate A1–A5 queue in the [architecture handoff](../execution/architecture-handoff.md)
refines WP1/WP2/POV. Local simulated review tests precede authenticated WP3–WP5
acceptance; they do not discharge CF-R13 or establish human authority.

| Requirement | Design / technical owner | First package | Acceptance evidence |
|---|---|---|---|
| CF-R01 Connected domain/product/implementation knowledge | [Knowledge model](../design/enterprise-knowledge-model.md), [extraction](../technical-design/extraction-and-source-binding.md) | WP2, WP4 | Business-to-code and cross-product paths retain typed support |
| CF-R02 Variants and conventions | Knowledge model, [preparation](../design/preparation-and-business-knowledge.md) | WP2 | Conflicting/applicable/unknown variant fixtures, expert-reviewed mappings |
| CF-R03 Intent and original request | [Task contracts](../technical-design/task-and-review-contracts.md) | WP1, WP3 | Immutable origin, clarification and read-only intent cases |
| CF-R04 Useful map | [Retrieval](../design/retrieval-and-agent-guidance.md) | WP4, WP5 | Critical anchors with reasons, current locators and explicit gaps |
| CF-R05 Gate 1 | [Workflow](../design/human-reviewed-engineering-workflow.md), task contracts | WP3, WP5 | Human addition changes map version; old receipt no longer authorizes |
| CF-R06 Per-question sufficiency | Workflow, [hybrid retrieval](../design/hybrid-retrieval.md) | WP5, WP6 | API use versus enhancement requires different evidence depth |
| CF-R07 Direct local navigation | Extraction/source-binding contracts | WP2, WP5 | Exact/changed/ambiguous/unbound/path-escape outcomes |
| CF-R08 Selective investigation | Workflow and integration contracts | WP5, WP6 | Necessary reads, fallback and material-scope escalation receipts |
| CF-R09 Evidence-backed proposal | Task contracts, [architecture workbench](../design/target-architecture-workbench.md) | WP5 | Minimal findings/design/steps/validation proposal before rich M5 UI |
| CF-R10 Gate 2 and final review | Task contracts, [security](../architecture/security-and-authorization.md) | WP3, WP5 | Forged approval/revocation/drift/resume tests; explicit coding authority |
| CF-R11 Agent and SCM independence | Source binding, [interfaces](../technical-design/interfaces.md) | WP1, WP5 | Git and supplied-snapshot fixtures; guided host capability matrix |
| CF-R12 Provenance/lifecycle | [Data contracts](../technical-design/data-contracts.md), [packs](../concepts/knowledge-packs.md) | WP1–4 | Source/review/validation/freshness distinctions; full/delta and withdrawal |
| CF-R13 Enterprise authorization | Security, [identity](../design/identity-and-policy.md) | WP3, WP4 | Independent oracle, direct-route denial, hidden support and access-epoch tests |
| CF-R14 Robust terminology | Hybrid retrieval | WP4, WP6 | Exact/typo/paraphrase/ambiguous cases scored independently |
| CF-R15 Reviewable artifacts | [Studio](../design/studio-experience.md), task contracts | WP3, WP5 | Same version in host and UI; keyboard/narrow layout; no mandatory graph |
| CF-R16 Measured value | [Methodology](../evaluation/methodology.md), [benchmark](../evaluation/three-repository-benchmark.md) | WP0, WP6, WP7 | Same-information comparisons, held-outs, critical-impact and maintenance ledger |
| CF-R17 Adopter-extensible SDK | [Extension contract](../technical-design/sdk-extension-contract.md) | A1–A3 / WP1–2 | Independent Python custom-kind producer; generic search/inspect without core edits; version/unsupported-semantic rejection |

## Alignment audit

| Document family | Reconciliation |
|---|---|
| Vision, overview, concepts | Company-specific functional/technical knowledge; inquiries and API consumption as well as changes; agent responsibility and both gates |
| Architecture, stack, operations | Modular service plus local helper; optional retrieval models distinct from an answer agent; task artifacts backed up; current access epoch |
| Preparation and data contracts | Java/Spring in first slice; source-control-neutral identity; typed applicability, declared precision and task/knowledge separation |
| Retrieval and evaluation | Retrieval tool order remains flexible within reviewed stages; optional guidance ablations cannot remove required gates |
| Workflow, UI, identity, interfaces | Version-bound authenticated human decisions; agent credentials cannot approve; minimal review UI precedes broad workbenches |
| Architecture/test workbenches | Minimal design and validation obligations in first slice; rich diagrams, migration and parity later; skipped tests are not proof |
| Execution | Private three-repository fixture plus public-safe synthetic cases; WP0–7 before broader feature investment |
| Research and decisions | Historical reports retained as evidence; [CF-0.3 architecture decision](../architecture/architecture-review.md) and bounded handoff define current design scope |

## Known limits after alignment

Twenty-eight provisional schema exports and isolated parser/conformance fixtures
exist; the new extension/lifecycle/retrieval contracts are not implemented or frozen.
Some dependency versions are pinned; additional dependencies require checks.
Benchmark answer keys require owner review; private evaluation and paid runs
require authority. PostgreSQL performance, agent conformance, quality gains and market
advantage remain unvalidated. These are tracked gates, not hidden missing design work.

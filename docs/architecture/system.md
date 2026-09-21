# System architecture

**Status:** Selected bounded design · CF-0.3; empirical validation pending

The [architecture review](architecture-review.md) records the decisions and remaining
proof. The [SDK extension contract](../technical-design/sdk-extension-contract.md)
and [lifecycle/retrieval specification](../technical-design/knowledge-lifecycle-and-retrieval.md)
govern extension compatibility, snapshot compilation and task evidence selection.

## Purpose and boundaries

ContextFoundry maintains business meaning, engineering structure, ownership,
standards, decisions, and validation evidence, then retrieves the portion relevant
to an investigation. One enterprise operates each installation, with separate
authorization for its business units and products.

The platform owns preparation, evidence integrity, retrieval, access enforcement,
review artifacts, and evaluation. The connected agent owns reasoning, source
investigation, design prose, and code generation. CI systems execute tests. Optional
offline model-assisted document extraction produces reviewable proposals. Optional
query embeddings/rerankers are explicitly configured retrieval models, not a hidden
second reasoning agent or answer-generation loop. No-model operation remains supported.

The second research pass adds CI-produced semantic-index ingestion, explicit source
publication/entitlement rules, and business knowledge in the first usefulness slice.
See [keep/change/defer assessment](../research/second-pass-assessment.md). Semantic
indexes are evidence inputs; generating them remains in the enterprise CI boundary.
The [scanner-pattern audit](../research/scanner-and-enterprise-patterns.md) is the
implementation gate for multi-artifact preparation. The initial TypeScript spike
does not satisfy it.

## System arrangement

```text
Source snapshots · product documents · standards · CI evidence
                            |
               scoped capture / isolated workers
                            |
 language/format extraction -> attributed resolution -> validation -> candidate review
                            |
              immutable knowledge release (files)
                            |
          projection compiler -> PostgreSQL query generation
                            |
             atomic activation of a release set
                            |
Enterprise IdP -> authenticated application services / policy enforcement
                            |
            search · inspect · trace · evidence · impact
                       /                  \
           Studio / CLI                existing AI agents
                       \                  /
                architecture and validation reviews
```

An API process, worker process, PostgreSQL, and managed evidence storage form the
first shared deployment. The preceding offline utility proof will use immutable files and
an in-memory projection, without a network listener or enterprise identity claims.
Use a modular application rather than a microservice estate.
Workers isolate expensive parsing and extraction from interactive requests.
Capture, language/format extraction, semantic-index import, framework resolution,
reviewed business mapping and observed CI/test evidence are separate stages. A
generic search hit must never acquire the authority of a resolved code edge.

## Components

| Component | Responsibility | Boundary |
|---|---|---|
| Studio | Pack configuration, candidate review, context inspection, design/test reviews | UI visibility never substitutes for authorization |
| Application services | Authenticated commands/queries, transactions, audit | No untrusted extractor code in API process |
| Preparation workers | Scoped inventory, extraction, resolution, diagnostics | No automatic release promotion or developer-view management |
| Release manager | Manifest integrity, validation receipts, activation and rollback | Historical facts remain immutable |
| Retrieval engine | Authorized candidates, typed paths, bounded evidence delivery | No final engineering conclusions |
| Policy module | Function/resource decisions and effective grants | Caller-supplied roles are not trusted |
| Review services | Proposed architecture, mapping decisions, test assessments | Approval does not establish runtime behavior |
| Task services | Scope maps, sufficiency/findings, proposals, exact-version human decisions | Agent credentials cannot approve; task assertions do not silently enter released knowledge |
| Local integration | Source-root binding, digest checks, stage guidance and review receipts | Roots and dirty files remain local; host performs actual source reads/edits |
| Evaluation harness | Fixed inputs, traces, outcomes, cost accounting | Fixture success is not a productivity claim |

## Knowledge authority

Repository identity, functional owner, knowledge pack, and developer checkout
binding remain distinct. A product may span repositories; a repository may contain
several products. Source locations use logical identities and relative paths.
Developer directories remain local to their agent integration.

Four logical models share this storage: enterprise meaning, implementation/evidence,
retrieval projections and task workspace. They are not four databases. See the
[enterprise knowledge model](../design/enterprise-knowledge-model.md).

Canonical releases contain portable records and evidence references. PostgreSQL
contains operational state and rebuildable search/graph projections. Document
captures and CI attachments are immutable blobs under retention policy. Architecture
proposals and approvals have their own versions. Accepted designs enter current-state
knowledge only when extraction observes their implementation.

Cross-pack relationships reference independently owned records in a pinned release
set. A consumer never rewrites a provider's release. Requests pin release identity
but check current authorization; rollback never restores old permissions.

## Retrieval and source use

The proposed default returns concern-grouped entry points, important connections,
precise locations, and evidence gaps, with focused inspection and tracing available.
A compact one-call alternative remains an evaluation arm. Delivery granularity is
an empirical decision, not a fixed call-count rule.

The service enforces its authorization and resource limits. It cannot control an
external agent's independent shell access. Guidance encourages reuse of supplied
facts while preserving source checks for behavior, contradictions, freshness, and edits.

The [workflow](../design/human-reviewed-engineering-workflow.md) is map -> human scope
review -> selective investigation -> findings/design/validation proposal -> human
implementation approval -> authorized coding/validation. Inquiry and diagnosis can
end without coding. Minimal maps and proposals belong in the offline proof, with
visibly simulated review events. Verified review pages belong in the secured shared
slice; rich workbenches follow evidence of benefit.

The [three-repository fixture](../evaluation/three-repository-benchmark.md) requires
narrow Java/Spring and TypeScript support before multi-profile acceptance. The first
integrated synthetic journey uses one cross-layer stack, not all languages at once.
Supported declarations,
framework rules and semantic bindings have separate precision tiers. No complete
runtime graph or business-rule inference is promised.
Before claiming useful preparation, a task fixture must trace a business passage
through an API, service, data object and associated tests, showing unsupported or
ambiguous links and exact files the agent must inspect.

## Reuse and acceptance

Borrow v2's identity, provenance, extraction, interface resolution, incremental
maintenance, and negative-test lessons. Adapt Business Map and authorization.
Rework retrieval selection, presentation, and guidance experimentally. Existing
code-intelligence projects inform mechanisms; they are not runtime providers.
Parser, database, UI, and protocol libraries remain appropriate dependencies.

A first release must demonstrate a complete path from authorized capture through a
reviewed release to a better investigation, deny unauthorized UI and non-UI access,
invalidate stale mappings, recover interrupted builds, and retain evidence for links.
See [execution plan](../execution/implementation-plan.md) for gating milestones.

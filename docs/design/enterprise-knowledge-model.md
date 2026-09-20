# Enterprise product and domain knowledge model

**Status:** Proposed design · CF-0.2 alignment · 2026-09-20

Implements CF-R01, CF-R02 and CF-R12. The model is a typed, evidence-backed graph
logically; PostgreSQL tables and portable records can implement it. It is neither
a bag of text chunks nor a graph inferred wholesale by an LLM.

## Small initial vocabulary

| Family | Entities and meaning |
|---|---|
| Business scope | Domain, product family, product, capability |
| Behavior | Business flow, flow step, business rule, variant/applicability condition |
| Technical policy | Standard, framework/library/utility, architectural decision, exception |
| Implementation | Component, service/program/job, workflow definition, API/event, entity/table, symbol/file |
| Evidence | Document passage, declaration, semantic-index receipt, observed run, test and validation obligation |

Typed relationships include product participates_in flow; flow contains step;
step has_rule; capability implemented_by component; component exposes API;
rule evidenced_by passage; standard applies_to scope; symbol declared_in file;
test validates obligation. API calls, imports, storage access and runtime observations
remain distinct relation types. A business sequence is not a proven runtime call path.

Domain/product membership is many-to-many. Repository, ownership, pack, deployment,
and developer checkout are separate identities. A Procurement capability can span
several products/repositories; a shared framework can serve many domains. Cross-pack
links preserve independently owned records under the pinned release set.

## Assertions rather than unqualified edges

Each relationship or rule is an assertion with qualified endpoints, relation kind,
supporting evidence, source revision, origin, review state, owner, applicability and
visibility requirements. Keep conflicting assertions rather than silently choosing
the newest or most similar. Reviewed expert assertions retain that origin.

Applicability includes named product/release, configuration/feature condition,
business-unit or jurisdiction when relevant, and business effective dates when
known. Distinguish business effective time from capture time and code revision.
Unknown applicability is not universal applicability. Initial conditions use bounded
declarative fields, not executable code or a new general rule engine.

An alias is scoped to a concept/domain/product and supported by evidence. Entity
resolution returns exact, candidate, ambiguous or unresolved outcomes; merging
different identities requires review. Embedding similarity never merges them by itself.

## Example: approval knowledge

Illustrative only: a purchase-order approval step participates in Procure to Pay.
An approved document states an approval rule for a particular product/configuration.
A reviewed association connects the step to a workflow and service component.
Extracted declarations link that component to an API and source symbol. Test
receipts support only the observations they actually exercised.

For API use, retrieve the contract, relevant rule and applicable constraints. For
enhancement, retrieve those plus implementation/workflow/test pointers and unresolved
dependencies. The agent still reads current source after scope review. A path through
these assertions explains relevance; it does not prove the proposed change is safe.

## Knowledge views and persistence

Capability summaries, API-use cards and change-navigation cards are bounded projections
of the same assertions, not independently maintained competing descriptions. Each
view includes evidence, coverage and freshness. Generated prose is a derived artifact
with source dependencies and cannot silently replace exact passages.

Canonical knowledge is reusable and reviewed. The task workspace holds hypotheses,
reviewer corrections, local-source findings and decisions for one request. Promotion
from a task to canonical knowledge is an explicit candidate/review/publication path.
An approved coding plan never becomes evidence that code was implemented.

## Maintenance and first scope

Assign owners to reusable concepts and mappings; report stale dependencies and review
burden. Validate changed/deleted sources against reverse dependencies. Begin with the
three-repository maintenance flow and a separate synthetic conformance fixture across
two products, including a shared utility, conflicting variants and an unknown rule.
Do not attempt all ERP domains first.
Operational transaction instances and a universal enterprise ontology are out of scope.

See [research basis](../research/enterprise-modeling-patterns.md),
[data contracts](../technical-design/data-contracts.md), and
[hybrid retrieval](hybrid-retrieval.md).

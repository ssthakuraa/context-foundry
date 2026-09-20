# Preparation and business knowledge

**Status:** Proposed validation-slice design · CF-0.2

## User journeys

A pack maintainer declares a product scope, owners, source roots, allowed adapters,
and publication reviewers. An extractor operator starts a scoped job. The system
captures a coherent source manifest, produces facts and diagnostics, and presents a
candidate diff. A reviewer accepts or rejects the candidate with reasons. Promotion
is a separate authorized action that activates a verified query generation.

A domain expert can add business definitions and review suggested mappings. They
see the document passage, engineering target, evidence origin, and alternatives
together. Approved associations remain reviewed associations; they do not become
source-declared call edges.

## Preparation stages

| Stage | Output | Failure behavior |
|---|---|---|
| Scope validation | Approved source/adapter manifest | Reject inaccessible roots and unsupported configuration |
| Inventory/capture | File/document identities, digests, supplied revisions | Reject inconsistent snapshot; do not refresh user checkouts |
| Extraction | Per-input fact shards and diagnostics | Isolate parser failure; mark coverage partial or fail required adapter |
| Identity/ownership | Qualified artifacts and explicit owners | Preserve conflicts for review |
| Resolution | Typed edges, interface bindings, unresolved candidates | Never pick a same-name target arbitrarily |
| Business mapping | Passage-backed concepts and reviewed associations | Keep unreviewed model suggestions separate |
| Validation | Integrity, coverage, policy, and change report | Failed candidate cannot be promoted |
| Projection/activation | Verified generation and release pointer | Atomic switch only after approval and successful indexing |

Source acquisition initially accepts prepared local snapshots with Git or supplied
enterprise-view identity and approved
document directories. GitHub/enterprise-wiki connectors are later adapter work.
The product does not execute repository builds, package scripts, or source-view
management commands during extraction. Parser limitations are recorded explicitly.

## First adapter slice

Use the private three-repository maintenance fixture plus public-safe synthetic
conformance cases. Include narrow Java/Spring, TypeScript/Hono, OpenAPI, SQL, Markdown
and test-source/report adapters. Java cannot wait for a later milestone when the
selected domain implementation is Java. Extract declared facts and supported framework
bindings; preserve ambiguity and unsupported coverage. Do not infer runtime calls
from imports or complete data dependencies from string matches. Exact supported
patterns and source-binding behavior are specified in
[extraction contracts](../technical-design/extraction-and-source-binding.md).

## Precision tiers and semantic-index import

Declare supported relationships per adapter: syntax declaration/reference,
semantic symbol resolution, framework/interface binding, or observed runtime edge.
Do not collapse them into a single "precise graph" label. Syntax-only operation is
supported with explicit limits; it cannot satisfy a precise call-impact promise.

Accept approved CI-produced semantic indexes through a bounded SCIP import adapter.
Validate producer identity, repository/revision, source digests, indexer/version,
format, document paths, symbol identities and dependency context. Imports join only
matching source manifests. Missing build context, stale or mismatched indexes remain
unavailable for precise resolution; do not silently substitute same-name symbols.
Preserve source/index references and resolver method in each imported assertion.

Generating these indexes belongs to the enterprise's CI/build boundary, not the
ContextFoundry extraction service. Prototype a matching Java or TypeScript import
where the benchmark needs precision before promising precise test impact. This adopts an
interchange format, not a Sourcegraph runtime dependency. See the
[second-pass rationale](../research/second-pass-assessment.md).

## Incremental maintenance

Cache file contributions by source identity, relative path, content digest, parser
and adapter versions, extraction configuration, and identity/ownership rules. Reuse
unchanged contributions but rebind revision locators only with matching content.
Resolve global references separately from parsing.

A changed/deleted provider invalidates incoming bindings, not just its own shard.
A newly added provider triggers previously unresolved-reference lookup. Maintain
reverse dependencies from facts to mappings, paths, and validation assessments.
Document edits invalidate dependent assertions and review fingerprints. Policy
changes invalidate visibility independently of factual regeneration.

Require semantic equality between full and incremental builds of the same manifest,
including ambiguity and deletion outcomes. Timing/run IDs are excluded from equality;
provenance is not. Fall back to rebuilding the affected scope when correctness cannot
be established incrementally. Measure entire pipeline cost, including inventory,
resolution, validation, indexing, and review—not only parser speed.

## Business knowledge model

Capture documents by stable ID, authority, edition when known, digest, and exact
section/span. Business concepts have pack-owned kinds, names, aliases, definitions,
and evidence. Relationships preserve conditions and documented order. A business
object, screen, API, and database table are separate identities linked many-to-many.

Mapping candidates arise from explicit references and reviewed semantic associations.
Unstructured prose may use offline model assistance under enterprise data-routing
policy. Record model, prompt version, inputs, output artifact, and cost. A review
decision binds to supporting evidence hashes and becomes stale when they change.
Query-time relevance cannot upgrade evidence trust.

Use the [enterprise model](enterprise-knowledge-model.md) for domains, products, flows,
rules, applicability and standards. A reusable worked business procedure can be a
reviewed knowledge artifact with prerequisites/outcomes and cited steps. It is evidence
for the agent to assess, not a higher-priority instruction or permission to execute.
Measure its benefit separately from generic tool/workflow guidance; do not author
procedures that contain held-out task answers.

Support both business-to-code and code-to-business retrieval. Exact code queries
need not pass through business lookup. Conflicting documents and code remain separate
claims; an authority rule applies to a claim type rather than making one source
globally superior. Initial curation must describe reusable product knowledge rather
than encode expected answers to evaluation stories.

## Acceptance

The first M2/M3 fixture includes a small versioned, reviewed business mapping set
and applicable architecture constraints. It does not wait for the M4 curation UI.
Index passages with title, section ancestry, product and edition so isolated chunks
retain meaning. Keep contextual descriptors distinct from exact evidence quotations;
all contributing passages remain authorization dependencies. Start with deterministic
descriptors. Model-generated descriptions need separate provenance and evaluation.

Initial local snapshots use explicitly approved publication audiences, not claims
of live source-ACL synchronization. See [source authority](../architecture/security-and-authorization.md#source-authority-and-publication).

Exercise duplicate names across repositories, unsupported formats, deleted providers,
newly resolvable references, ownership changes, corrupted caches, partial captures,
conflicting business definitions, revoked passages, and stale review decisions.
Show the actual coverage inventory to reviewers; a schema-valid release can still
be unsuitable for a particular engineering question.

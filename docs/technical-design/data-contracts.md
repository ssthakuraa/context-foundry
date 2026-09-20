# Data contracts and storage

**Status:** Proposed technical specification · CF-0.2

**Implementation note (2026-09-20):** `packages/contracts` now contains twenty
Draft 7-compatible TypeBox schemas (source capture, locator, record envelope,
captured file, coverage, release manifest/set, relationship payload, task artifact,
engineering symbol payload, business rule and mapping payloads, all five task artifact bodies,
human decision receipt, task error
and evaluation run manifest), static TypeScript types, strict Ajv runtime validators
and generated portable JSON files. A pinned workspace lockfile and positive/negative
tests exist. This is only a WP1 subset: remaining registered record kinds, deeper
cross-artifact checks, broader semantic cross-record checks and independent cross-language
canonicalization conformance are not implemented or frozen. A decision receipt's JSON shape does not establish
human identity or authorization; the server must issue and verify it. Do not treat
an envelope passing schema validation as a reviewed or fully supported assertion.

Strict task body schemas now cover `scope_map`, `sufficiency`, `findings`,
`implementation_proposal` and `completion`. Scope-map
candidates label evidence versus hypothesis and give a relevance reason; an
evidence-based candidate must cite evidence. An `inspect_source` sufficiency
judgment must name a planned local read. The artifact envelope's `body_digest`
must match canonical SHA-256 of the actual body, and its prior-version link must
immediately precede its version. Referenced evidence in scope, sufficiency and finding bodies must be
declared in the envelope. Findings distinguish observed source, business assertions,
inferences and hypotheses; a source-observed claim names a local read receipt, and a
business assertion cites evidence. Proposal bodies carry findings identity, ordered
steps, requested actions, validation obligations, risks and rollback. Completion
bodies record actual changes, check references, skips, deviations and residual risks.
These checks neither prove evidence or check receipts are authentic nor authorize
any action. Proposal/completion bodies now bind to exact referenced artifact ID,
version and body digest; `checkTaskArtifactReferences` verifies those references
within one task and catches duplicate/broken version series. Current task state,
approval receipts and human authority remain server responsibilities. In particular,
an implementation completion's approved-proposal reference is not proof that the
proposal was actually approved or remains valid.

The capture/locator/coverage envelopes were reconciled with the more precise
[extraction and binding contract](extraction-and-source-binding.md) before freeze.
Their individual normalized-path, line/byte-order and coverage-count checks are
supplemented by `checkCaptureBindings`, which compares source/snapshot/revision/path
and captured-file digests without reading source. It also recomputes a capture's
`file_manifest_digest` from its complete declared `CapturedFile` metadata: validate
each entry, require one source/snapshot and unique normalized paths, sort by path
using UTF-16 code-unit order, then SHA-256 hash the canonical JSON array. An empty
file list hashes as the canonical empty array. Invalid or duplicate file records
are separate failures and cannot establish manifest closure. This detects a changed
or omitted declared file record; it does **not** prove the actual file bytes match
their claimed digests, prove that no source file was omitted before capture, or grant
access. Those require trusted capture and local binding checks.

Source locators now carry a unique `evidence_id` within the supplied release set.
`checkSupportClosure` verifies that record evidence/dependency references resolve,
that relationship payload support is declared on its envelope, and that IDs are
unique. It computes a bounded transitive evidence-ID set per record for acyclic
dependencies. Missing/invalid references, duplicate IDs, cycles or excessive closure
return issues and **no** closure; records blocked by a cycle are diagnosed along with
cycle members. This initial slice rejects cycles rather than publishing a partial
strongly connected group. Call `checkReleaseIntegrity` to combine this check with
capture/file/locator binding; it withholds closure if either side fails. These are
metadata checks, not checks of current source bytes, evidence truth, approval,
publication permission or a user's current grants. Non-source evidence kinds and
cross-pack composition need explicit contracts before the freeze.

## Identity and versioning

An entity ID combines logical repository or document namespace with adapter-owned
artifact identity. A record ID identifies an assertion about an entity; a content
digest identifies its immutable representation. Source revision, pack release,
query generation, schema version, adapter version, and policy generation are distinct.
Do not use a content hash as the only long-lived entity identity.

Use opaque UUIDs for operational identities, qualified strings for entity keys, and
SHA-256 digests for canonical content. Canonical serialization uses UTF-8, LF, sorted
object keys, stable record ordering, and rejects non-finite numbers/duplicate keys.
The initial TypeScript serializer follows an
[RFC 8785-style](https://www.rfc-editor.org/rfc/rfc8785) I-JSON subset: preserve
Unicode scalar values without NFC/NFD conversion; reject unpaired surrogates; sort
object keys by UTF-16 code units; use ECMAScript JSON number formatting, including
`-0` as `0`; reject NaN and infinities. Raw JSON must enter through
`parseJsonStrict` before hashing so duplicate decoded object keys (including escaped
aliases) cannot disappear under ordinary `JSON.parse`. The strict parser rejects
bare integer tokens outside the safe-integer range; exponent-form binary64 numbers
remain supported. `canonicalRecordLines` sorts by unique `record_id` and terminates
each JSONL row with LF. The implementation limits depth to 128 and serialized/input
size to 16 MiB. [Portable canonical vectors](../../packages/contracts/fixtures/canonical-vectors.json)
pin valid input, expected canonical UTF-8 text and SHA-256 digests, plus rejected
variants. The pinned digests were calculated from expected bytes separately from
the TypeScript canonicalizer. The vectors pass TypeScript; an independent
non-TypeScript implementation must still consume them before freeze.
Build timestamps live in provenance/run metadata and are not invented to force
semantic equality between independently captured evidence.

## Record envelope

All fields below are conceptual schema requirements. JSON Schema Draft 7 is the
initial first-party validation dialect; generated TypeScript types must stay in sync.

```json
{
  "schema_version": "0.2.0",
  "record_id": "rec:billing:cycle-start",
  "entity_id": "repo:billing-service:symbol:BillingCycle.start",
  "kind": "engineering.symbol",
  "owner_id": "team:billing",
  "origin": "source_declared",
  "review": {"state": "not_required"},
  "payload": {"name": "start", "artifact_kind": "method", "language": "java", "signature": "start()"},
  "evidence_refs": ["ev:cycle-start"],
  "dependency_refs": [],
  "classification": "internal"
}
```

The owning release supplies pack/revision bindings. A relationship includes qualified
subject/object, relation type, direction, evidence, and supporting record references.
The initial registered record kinds are `engineering.symbol`,
`engineering.relationship`, `business.rule` and `business.mapping`. Symbol payloads require Java or
TypeScript language and a declared artifact kind; methods, constructors and
functions require a signature so overloaded callables are not silently conflated.
Business rules require a name, statement and explicit applicability state. A bounded
rule names at least a product or condition; unknown applicability cannot carry a
claimed scope and is never treated as universal. Business mappings explicitly bind
business and engineering entity IDs, a relation, applicability and either an
`explicit_reference` or `reviewed_association` basis. The basis constrains the
permitted origin; a reviewed association never becomes a source-declared runtime
call merely by approval. These checks constrain shape, not the truth of a rule or
mapping, review authority or effective-time semantics.
Registered extension kinds will use namespaced payload schemas and immutable schema
digests. Unknown required kinds currently fail validation. Preserving optional
unknown kinds with explicit coverage status is not implemented yet.

## Evidence dimensions

| Dimension | Values/examples | Rule |
|---|---|---|
| Origin | source_declared, static_resolution, human_asserted, model_proposed | Immutable attribution |
| Review | pending, approved, rejected, not_required, stale | Approval binds to evidence fingerprint |
| Validation | absent, passed, failed, inconclusive | Attached to a named check/run, not universal truth |
| Freshness | current_for_snapshot, source_changed, unknown | Relative to supplied identities, not wall-clock age alone |
| Coverage | complete_for_declared_scope, partial, unsupported, unavailable | Applies to a named extractor/corpus/facet |

Unknown is an epistemic outcome, not an extraction origin. A reviewed association
does not become source_declared. Validation retains revision, environment, test input,
assertion scope, and method. A model confidence score is neither calibrated certainty
nor approval. Relevance scores live on query results, not canonical evidence trust.

## Record families

| Family | Required fields |
|---|---|
| Source/document capture | Logical authority, URI/path, revision/edition, digest, capture policy |
| Evidence locator | Evidence ID, source/snapshot, line/range or document section/span, file digest |
| Engineering artifact | Qualified ID, kind, owner, declarations and contract references |
| Engineering relationship | Endpoints, typed direction, support records, resolution method |
| Interface contract | Protocol/service/version/operation, fields/types, completeness by facet |
| Business concept/assertion | Pack-owned meaning, aliases, source passages |
| Domain/product/flow/rule/variant | Qualified kind/identity, applicability, owner, evidence and named effective conditions; see enterprise knowledge model |
| Worked business procedure | Prerequisites, illustrative steps/outcomes, applicability, supporting evidence and review; never implicit execution authority |
| Business mapping | Business and engineering endpoints, mapping relation, support and review |
| Test association | Test identity, relation type, evidence, revision and optional run |
| Execution evidence | Tool/run ID, environment, revision, outcomes, coverage inputs, attachments |
| Semantic index receipt | Producer identity, format/indexer version, repository/revision, input digests, dependency context, validation outcome |
| Behavior obligation | Requirement, input partition, observable output/side effects, tolerance, exclusions, linked validation evidence |
| Architecture proposal | Baseline release set, constraints, changes, assumptions, review version |
| Task/artifact/decision | Immutable original input, versioned map/findings/proposal, evidence scope, authenticated decision and revocation; operational, not released knowledge |

## Storage separation

| Store | Contents | Source of truth |
|---|---|---|
| Canonical release files | Manifests, JSONL assertions, support dependencies, coverage | Released knowledge |
| PostgreSQL operational tables | Grants, configuration, jobs, reviews, proposal versions, activation, audit | Operational state |
| PostgreSQL projections | Search fields, adjacency, interface indexes, support dependencies | Rebuildable from releases |
| Blob directory | Approved captures, documents, CI artifacts, candidate shards | Captured evidence, under retention rules |

Git versions configuration, schemas, documentation, and reasonably sized canonical
metadata. Large generated corpora and sensitive captures use blob storage with a
manifest reference; do not force gigabytes of snapshots into application Git history.
No automatic commit or push is implied by generating a pack.

## Proposed relational layout

Operational tables: principal, group_binding, grant, policy_version, pack,
source_binding, adapter_registration, job, job_attempt, review, proposal_version,
validation_run, release_activation, audit_event, outbox.

CF-0.2 task tables: task, task_input, task_artifact, task_event, task_decision,
decision_revocation and optional local_read_receipt. Their fields, transition and
concurrency rules are in [task contracts](task-and-review-contracts.md). Do not index
private task text as reusable enterprise facts. Capture, precise locator, source-control
identity and coverage fields are in [extraction/source binding](extraction-and-source-binding.md).
Canonical business types follow the [enterprise model](../design/enterprise-knowledge-model.md).

Source bindings additionally retain access mode, entitlement authority, ACL observation
revision/expiry or explicit publication receipt, and withdrawal state. Access epochs
cover local policy, group/session revocation and withdrawals independently of releases.
Publication approval binds source digests and audience; extraction approval cannot
substitute for it. Semantic receipts are validated inputs, not permissions.

Projection tables: generation, artifact, assertion, locator, relationship,
record_dependency, descriptor, business_mapping, interface_provider,
interface_consumer, test_association, visibility_requirement.

Primary keys include generation_id for projected rows. Artifact identity is unique
within a generation; overlapping releases with conflicting facts block activation.
Index relationships by (generation, subject, relation) and reverse object ordering;
index exact artifact keys separately from weighted text fields. Search descriptors
retain evidence references so hidden text cannot contribute match reasons or rank.

## Release manifest and activation

Manifest: schema version, pack ID, release ID, source-manifest digests, adapter/config
digests, ordered shard digests, coverage/validation references, and creation identity.
A release set pins one version per included pack plus a cross-pack bridge digest.
Activation transaction verifies reviewed manifest identity, compiled generation,
policy compatibility, and expected prior activation version. Idempotency key prevents
duplicate promotion. Concurrent mismatches return CONFLICT rather than last-writer wins.

Rows never silently join across generations. A query keeps a consistent snapshot
until completion; subsequent continuation must use the same retained generation and
current policy or fail explicitly. Retention must keep referenced generations until
their query leases/cursors expire, subject to overriding access revocation.

## Schema changes and portability

Minor versions add optional fields; semantic changes require a new major contract.
Importers reject unsupported required versions. Migrations stage new canonical
outputs and projections, retain original digests, validate equivalence or declared
changes, and activate explicitly. Export bundles include schemas and manifests but
only evidence the exporter is allowed to redistribute. File presence alone does not
confer permission. The importer reassigns local access policy before serving.

# A1 extension contract compatibility receipt

**Status:** A1 minimum contract slice implemented and tested · 2026-09-20.
This is the historical A1 receipt. The subsequent [A2 receipt](a2-preparation-receipt.md)
records the bounded runner and additional first-party profiles; enterprise
authorization remains later work.

## Wire and export inventory

The existing twenty-eight `0.2.0` schemas and validation entry points are unchanged.
Six `0.3.0` extension schemas are exported alongside them: kind profile, adapter
manifest, consumer, record, source artifact payload and language-independent
engineering symbol payload. The package is still versioned `0.2.0` as a provisional
workspace package; this is a separate **wire generation**, not in-place reinterpretation
of old records. The schema exporter now writes and checks thirty-four Draft 7 files.

The `@context-foundry/contracts/extensions` entry point exposes installed profile
validation, manifest/consumer negotiation, record/support/reference checks, generic
descriptor search/inspect, explicit legacy symbol migration and UTF-16 to UTF-8 byte
offset conversion. No source connector, production extractor or shared server uses
this entry point yet.

| Producer / consumer | `0.2.0` strict path | `0.3.0` extension path |
|---|---|---|
| Legacy Java/TypeScript symbol producer | Continues to validate unchanged | Explicit `migrateLegacySymbol` with caller-chosen qualified identity and reviewed first-party profile; other kinds rejected |
| New language symbol | Old closed enum rejects it | `engineering.symbol` reviewed profile accepts a bounded language string; test uses Kotlin |
| New source/data artifact | Unsupported by old kind handshake | `source.artifact` reviewed profile is searchable/inspectable |
| Independently written Python workflow adapter | Old handshake rejects custom kind | Namespaced `acme.workflow` schema/profile and record are read by TypeScript without a core kind/UI branch |
| Unknown or changed profile | Rejected by old handshake | Rejected by installed full profile digest, including schema and semantic metadata |
| Unknown relation semantics | No custom relation support | Custom descriptor remains searchable; unregistered reference roles and reserved first-party names are rejected |

`KindProfile` includes semantic major, bounded payload schema, schema digest, full
profile digest, identity scheme/version, allowed origins and declared reference roles.
The installer compiles only a finite structural JSON Schema subset with limits on
schema size/depth and field/string/array counts. It rejects `$ref` and `pattern` in
adopter schemas. Installation is supplied by trusted configuration; a data pack
cannot register its own executable schema. First-party roots cannot be impersonated;
only `source.artifact` and `engineering.symbol` had reviewed profiles at the A1
checkpoint. A2 added five more without changing the `0.3.0` wire generation.
The manifest pins protocol major 1, package/configuration digests and bounded input,
output, message and wall-time limits. These are declarations, not a sandbox.

The `0.3.0` record has a standard descriptor, qualified identity, supported references,
profile and producer attribution, separate origin/review/classification, evidence
and dependency references. Candidate checks verify installed schema/origin/identity,
declared producer/consumer profile agreement, supported descriptors, unique exact
declarations, exact reference targets and acyclic transitive evidence dependencies.
Entity references may form cycles. Missing or ambiguous exact targets fail closed.
Generic search/inspect returns nothing from an invalid candidate. It is a small
interoperability reference operation; A3 will implement full task selection.

## Verification

- The Python standard-library vector in `packages/contracts/fixtures/emit-extension-vector.py`
  produces a manifest, installed custom profile, record and source locator with
  Unicode text. TypeScript's strict parser, hash checks and validators accept it.
- Contract tests cover version/digest mismatch, forged reserved kind, unsafe schema,
  malformed payload, undeclared producer, absent evidence, duplicate declarations,
  exact missing reference, separate engineering/evidence cycles, explicit legacy
  migration, a new language, source artifacts and UTF-8 byte-offset conversion.
- The first A1 run passed 71 contract tests. The checkpoint worklist records the
  broader workspace build/type/test, schema export and HTML checks once complete.

## Dependencies identified at A1

The first-party business, interface, relationship and test payloads needed reviewed
`0.3.0` profiles with their semantic validation ported; A2 added a bounded subset.
The A1 candidate/checks bound locator
IDs, but did not attest capture bytes, Git revision, publisher authority, installed
executable identity, process isolation or source ACL. A2 must stage a whole process
contribution, bind locators to approved bytes and report family coverage before
claiming a release candidate. A child process alone provides no filesystem or network
isolation. Full `0.2.0` release sets and task/review contracts are not migrated by A1.

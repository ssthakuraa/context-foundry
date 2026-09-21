# SDK extension and interoperability contract

**Status:** CF-0.3 implementation specification; partially implemented, not schema-frozen.

**A1/A2 progress:** the [minimum compatibility receipt](a1-compatibility-receipt.md)
documents implemented `0.3.0` profiles/manifests, records and generic descriptor
search. The [bounded preparation receipt](a2-preparation-receipt.md) covers a
reviewed-adapter process runner, Python producer and seven first-party profiles.
Enterprise installer enforcement, trusted source capture and remaining kind ports
are still pending.
Implements CF-R11, CF-R12, CF-R13 and CF-R17. Read with the
[architecture decision](../architecture/architecture-review.md).

## Extension units and boundaries

| Unit | Receives | Emits / responsibility |
|---|---|---|
| Source connector | Host-approved source selector and acquisition credentials | Immutable capture, inventory, revision attestation where supported; never agent-provided arbitrary paths |
| Analyzer | Approved capture handles, configuration, parser/rule versions | Source-anchored declarations, text/contract facets, reference requests, coverage and diagnostics |
| Resolver | Validated analyzer contributions and a pinned symbol/interface registry | Supported relationships or explicit unresolved/ambiguous/conflict outcomes; lookup dependencies |
| Knowledge importer | Approved documents or attributed expert mappings | Source/expert assertions with applicability and review status, never implicit runtime truth |
| CI evidence importer | Authenticated producer and revision-bound report bytes | Observations only after report integrity and producer authority checks |

A parser is a library within an analyzer, not a compulsory additional deployment.
Language syntax, framework conventions and project-wide binding have separate
versions and conformance cases even if shipped in one technology pack. First-party
and adopter-written analyzers use the same protocol. TypeScript convenience helpers
are optional; a Python process must be a first-class conforming producer.

## Installed manifest

Freeze an `AdapterManifest` in task A1 with required fields: protocol major, adapter
ID/version, package digest, role, accepted media/language identifiers, configuration
schema digest, emitted kind profiles, consumed kind profiles for resolvers, parser
and rule versions, requested input capabilities, resource-limit profile and license
metadata. Language identifiers are bounded strings, not a closed Java/TypeScript
enum. The host's approved job selects executable/runtime and actual grants; a
manifest cannot authorize itself, enlarge capture scope, or request credentials
from the user at query time.

An installed `KindProfile` contains a namespaced kind identifier and semantic major,
payload JSON Schema digest, standard projection schema version, allowed origins,
identity scheme, reference field definitions and optional relation profile. The
registry belongs to trusted installation configuration, not arbitrary pack uploads.
No downloaded `$ref`, executable schema keyword, dynamic query SQL, UI JavaScript or
unbounded regular expression is accepted from a knowledge pack. Validate schema size,
depth and supported keywords; compilation occurs outside request handling.

## Common projections, not untyped escape hatches

Every contributed assertion retains the core envelope: qualified entity identity,
kind/profile identity, immutable record/content identity, source/evidence support,
producer attribution, applicability and separate origin/review/freshness/coverage.
Custom payloads must validate against their installed profile. Unknown arbitrary
fields are not a substitute for an extension registry.

| Projection | Minimum interoperability | What it does not authorize |
|---|---|---|
| Descriptor | Bounded display name, aliases, description and source locators, each attributable to support | Generated descriptions/aliases cannot silently become source-declared facts |
| Entity identity | Source namespace, identity scheme/version, qualified key; optional language and artifact subtype | No merge merely because names, paths or embeddings resemble each other |
| Reference | Target kind/scheme, namespace and selector, source anchor, required resolution context | A selector is not a resolved relationship |
| Relationship | Typed subject/object, direction, assertion basis, support and resolution outcome | Custom relations cannot claim core `calls`, `implements` or data access semantics without the corresponding conformance profile |

Generic search and inspect consume the descriptor/envelope, so a new language or
custom workflow kind does not require a core switch statement or UI change. Typed
trace/impact is enabled only for installed relation profiles. Custom relations can
be displayed with their declared meaning without being used in the core impact
policy. Adopters may register namespaced traversal profiles as trusted configuration;
they cannot inject executable retrieval code through records.

Start with the nine provisional kinds plus a minimal `source.artifact` kind for
source-backed document sections/data objects and their subtype. Preserve dedicated
business, interface and test semantics. Broaden `engineering.symbol.language` to
bounded identifiers; make its subtype extensible through a profile. Do not pretend
a table or business flow is a Java symbol to satisfy existing reference checks.
Generalize endpoint validation through registered entity/reference profiles, while
retaining stricter target requirements where the payload explicitly requires a method.

## Identity and resolution

Separate an entity key from an assertion ID and its content digest. Entity identity
uses source/module namespace plus an explicit identity scheme; parser software
version belongs in provenance, not automatically in every entity key. A syntax
identity and a compiler/SCIP identity may coexist. Equivalence needs a validated
mapping; changing schemes requires migration, never silent renaming/merging.

Qualified display strings alone are not semantic keys. HTTP joins require declared
service identity, method, normalized route and applicable version. Preserve literal
case, explicit base paths and protocol rules. Missing service identity or duplicate
providers produces unresolved/ambiguous results. Column/ORM joins include catalog,
schema and dialect conventions; never universally lowercase quoted SQL names.

Resolution outcomes are `resolved`, `unresolved`, `ambiguous`, `conflict` or
`unsupported`, with a reason and bounded candidates. Only a supported `resolved`
outcome can yield the corresponding exact typed relationship. A reviewed business
association remains a reviewed association even when its endpoint resolves exactly.
Relationships and their supporting assertions retain independent authority labels.

## Process exchange and local safety

The first runner uses bounded JSONL over stdin/stdout. Host input is one job header
followed by declared capture units and a terminator; output starts with a matching
protocol/job/adapter header, then typed record/reference/diagnostic/coverage messages,
and exactly one completion message with counts and content digest. Binary input
uses approved read-only handles rather than embedding arbitrary filesystem paths.
Stderr is bounded diagnostics, not a second record channel. Reject extra output,
missing completion, unknown message tags, noncanonical/duplicate keys, malformed
UTF-8, mismatched counts, unsupported versions and output beyond limits.

The runner assigns verified producer/job/capture attribution after validation; it
does not trust producer-claimed identity, permission or completion. Stage all output
until a successful exit, complete stream, byte bindings and reference checks; failed
attempts cannot leave half a contribution active. Keep logs free of source bytes by
default. Existing canonical JSON/JSONL rules and configured size limits apply.

For the offline proof, run only reviewed first-party and synthetic demonstration
adapters, with bounded process time/output and explicit capture input. **A child
process is not a security sandbox.** It cannot substantiate denial of filesystem or
network access. Loading untrusted third-party adapters is prohibited until a runner
profile actually enforces read-only mounts, no credentials/egress, CPU/RSS/time limits
and termination, and passes escape/denial tests. Enterprise preparation authorization
is separately required before shared use.

## Compatibility and migration

Protocol major, envelope schema, kind profile, adapter package and release generation
are independently versioned. Negotiate actual installed profile digests, not merely
strings that claim support. A consumer must reject a missing required kind/profile
or unknown semantic major. The first slice also rejects unsupported optional kinds
at activation rather than silently discarding their support or search content; a
future opaque-archive mode needs a separate contract. Diagnostic lists never grant
permission to emit unregistered records.

The CF-0.2 implementation remains explicit legacy behavior. A1 introduces the next
schema version with an inventory of changed exports and before/after fixtures;
existing `0.2.0` records are never reinterpreted in place. Recompile the synthetic
capture or use an explicit tested migration. Do not update package/schema versions
merely because this document is called CF-0.3.

## Extension author acceptance

The conformance kit must validate manifest/profile compatibility, independent
Python serialization, declared kind enforcement, exact byte anchors, deterministic
output, explicit partial/unsupported coverage, reference closure and bounded failure.
Provide positive, decoy, malformed, ambiguous, Unicode-range and version-mismatch
fixtures. A second producer emitting the same identity must produce a deliberate
duplicate/conflict outcome, not last-writer-wins.

Acceptance is an adopter-style adapter outside core packages that contributes a
synthetic workflow artifact, appears in generic search/inspect, and declares its
unsupported impact semantics without editing the core registry source or UI. Adding
new code to a hard-coded built-in switch does not pass CF-R17. No plugin marketplace,
visual adapter authoring or universal language coverage is needed for this proof.

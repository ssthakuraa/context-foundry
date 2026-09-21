# Extraction and local source-binding contracts

**Status:** Implementation specification for the validation slice · CF-0.2

**WP1 alignment note (2026-09-20):** The provisional `SourceCaptureSchema` now
includes source/authority/snapshot identities, revision kind/value, file-manifest
digest, publication-policy reference and capture producer. The locator schema
carries source/snapshot identity, relative path and file digest, with separate
file, file-range and document-section shapes. Strict semantic validation rejects
non-normalized relative paths and reversed line/byte bounds. Git captures and
locators require a revision value; supplied immutable snapshots may omit a separate
revision value because their snapshot identity is explicit. A captured-file
envelope and metadata-only binding check now distinguish missing files, revision
drift and locator/file digest disagreement across separate source identities.
The check recomputes the capture's file-manifest digest from canonical, path-sorted
declared file metadata; this is metadata closure, not a read of actual source bytes.
Each locator has an `evidence_id` for support resolution, distinct from the file path
or content digest. Release-wide duplicate evidence IDs fail support validation.
Generalized symlink/case-collision checks, trusted revision-bound local-byte
comparison and authorization remain for WP2. The contract version is not frozen.

The isolated TypeScript local proof helper now performs Linux descriptor-anchored
reads of an explicit file list, rejects symlink components and non-regular files,
and compares read bytes to declared digests. It does not discover files, verify that
the supplied snapshot is a Git revision, establish a source owner's publication
authority, or enforce enterprise principal access. Case-collision behavior on other
filesystems and general multi-language adapters remain open. See the
[TypeScript spike](typescript-declaration-spike.md).

`verifyCapturedFileBytes` now compares caller-supplied raw bytes against one valid
captured-file entry's SHA-256 digest **and** byte length. It does not open paths,
prove the bytes came from the declared source/revision, establish a complete capture,
or authorize their use. A trusted capture producer/local helper must supply bytes
through an approved, path-safe handle; a changed result cannot be silently rebound
to the old locator. No local-root or symlink safety claim follows from this function.
`checkCaptureByteClosure` composes that comparison with the declared-file manifest:
all declared paths need exactly one supplied byte payload, with no extras, duplicate
paths or changed bytes. It returns verified file digests only if every check passes.
The caller still supplies both bytes and metadata; this is not authenticated capture
or proof that no source file was omitted before declaration.

Implements CF-R01, CF-R02, CF-R07, CF-R11 and CF-R12. This specification narrows
supported patterns; it does not promise a complete program-analysis engine.

## Source capture manifest

Each capture contains source_id, authority_id, snapshot_id, revision_kind
(git, enterprise_view, supplied_snapshot), optional revision_value, captured_at,
file-manifest digest, publication-policy reference and capture-producer identity.
Each included file has a normalized relative POSIX path, SHA-256 content digest,
byte length, media/language kind and exclusion/classification outcome. Excluded
files are not served; sensitive exclusion details are restricted diagnostics.

Reject duplicate normalized paths, absolute paths, parent traversal, symlink escapes,
case collisions on the target filesystem, inconsistent bytes/digests, excessive file
counts and oversized inputs. Apply limits before parsing. Default-deny inclusion
rules exclude credential files, dependency caches, build outputs, dumps and private
runtime data. A clean Git status is not a secret scan or redistribution permission.
Use prepared immutable captures; never switch branches or mutate developer checkouts.

## Adapter protocol

Trusted job input identifies capture digest, adapter/version digest, configuration,
supported grammar version, approved resource budget and output namespace. The runner
provides read-only input handles, not ambient developer roots or credentials. Output
streams contain declarations, assertions, locators, diagnostics and coverage units.
Every record binds to input digest(s); the runner verifies those bindings and IDs.
An adapter declares input family/dialect, parser and rule-set versions, produced
record kinds, supported patterns and unsupported constructs. Registry compatibility
is checked before a candidate is assembled. Parse output is not itself a verified
cross-file edge: a separate resolver must attach method, context, ambiguity state
and support. A framework rule or imported semantic index remains distinguishable
from syntax; a reviewed business mapping remains distinguishable from either.
See the [v1/v2 and external pattern audit](../research/scanner-and-enterprise-patterns.md).

No source code, package script, annotation processor, Maven/Gradle build, macro or
document instruction executes in the extractor. Framework interpretation is static
and bounded. Worker process isolation is not a complete hostile-code sandbox by
itself; enterprise untrusted adapters require the documented container/OS controls.

## First supported matrix

| Input | Extract initially | Do not infer |
|---|---|---|
| Java | Packages, types, methods/constructors with parameter signatures, fields, imports, annotations and source ranges using a pinned Java grammar | A call graph from matching names; overload resolution without adequate type context |
| Spring MVC | Literal class/method request mappings, HTTP method, declared DTO/parameter references, literal permission annotations and transaction annotations | Composed/custom annotations, inherited routes, placeholders or runtime bean selection without a supported resolver |
| JPA / SQL | Explicit entity/table/column mappings, literal named-table references, DDL tables/columns/keys; literal query references labelled with parser coverage | Complete data lineage, dynamic query targets, triggers' runtime effects, tenant isolation from a table name alone |
| TypeScript/React | Declarations, import/export bindings, literal file/workspace package dependencies; explicit JSX symbol references | Runtime behavior from imports, dynamic imports, generated modules or React effect execution |
| Hono / API metadata | Literal route/method registrations within supported router mount patterns; declared OpenAPI operations and schemas | Full endpoint identity when base mounts or paths are computed; OpenAPI parity with code without comparison |
| Cross-product events | Declared producer strings and consumer taxonomy members as separately evidenced artifacts | A working transport link merely because names match; record candidate contract association until supported |
| Markdown | Document identity, title, heading ancestry, exact passages, explicit references and document-stated status | Treating every worklist, historical report or prompt as current behavior or an instruction |
| Test source / reports | Test declarations and known skip markers; bounded JUnit/Vitest-style report outcomes if supplied | A passing run from source presence, behavior coverage from filename, or success from skipped cases |

The table is an implementation target, not evidence that these adapters exist.
The current TypeScript spike covers only a subset of its row. Java/Spring, SQL,
OpenAPI, Markdown and test adapters are still unimplemented here. No candidate
release or utility claim passes WP2 until the relevant family fixtures and the
cross-layer task journey pass.

An isolated `sql-ddl` syntax experiment now recognizes bounded `CREATE TABLE`
declarations/columns in caller-supplied bytes and rejects lexical decoys. It is
not a source-bound SQL adapter and does not change the WP2 status above. The
synthetic fixture and expected/forbidden assertions are described in the
[scanner gate](../research/scanner-and-enterprise-patterns.md#first-executable-continuation).
A similarly isolated Java syntax reader extracts top-level type/method signatures;
a separate Spring MVC rule recognizes literal imported `RestController`,
`RequestMapping` and `GetMapping`/`PostMapping` forms. Both return partial status.
They do not yet produce capture-bound records or prove controller-to-service calls.

Unsupported constructs emit operation-specific coverage gaps with permitted locators.
They do not silently disappear from the coverage denominator. Unit tests use tiny
synthetic examples of each supported/unsupported construct and representative private
source only in authorized evaluation. No private code becomes a checked-in golden file.

## Resolution and identities

Qualify symbols by source_id, language namespace, containing type/module and signature.
Keep record/content identity separate from symbol identity. A signature rename may
create a new symbol; do not silently equate identities through fuzzy matching.

Resolution states are exact, candidate, ambiguous, unresolved or unsupported.
Relationships retain method: syntax, semantic_index, framework_rule,
reviewed_mapping or observed_run. Configuration, parser/resolver versions and source
digests are part of resolution provenance. Semantic indexes are accepted only with
matching source and dependency context; producing them belongs to approved CI.

Cross-repository joins require explicit package/service namespace and version/context.
A `file:` dependency is a declared package relationship, not a runtime call. Route
matching uses service identity, normalized path template, HTTP method and version;
identical routes in different products remain different. Reviewed business mappings
retain evidence and applicability rather than pretending to be static calls.

## Coverage and incrementality

Coverage unit: source_id, capture digest, adapter, artifact family, supported patterns,
eligible/processed/failed/excluded counts, known unsupported constructs and diagnostics.
Completeness applies only to that declared unit. No global completeness percentage
combines unlike facts into an engineering safety guarantee.

Cache per-file contributions by content/configuration/adapter digest; maintain reverse
resolution dependencies. A provider change, deleted symbol or changed business passage
invalidates dependent bindings/reviews. New providers trigger unresolved-reference
reconsideration. Compare canonical full/delta outputs including deletions, ambiguity
and coverage; exclude only run-specific timing metadata. Initially permit full rebuild
of the bounded slice when incremental correctness cannot be established.

## Locator and local resolution

Server locator fields: evidence_id, source_id, snapshot_id, revision_kind/value when known, path,
file_digest, optional symbol_id, optional start_line/end_line and section_id. Lines
are one-based inclusive for text display; an optional byte span uses zero-based
half-open UTF-8 offsets. The schema requires paired bounds and validates ordering.
At least a file/document locator is required; symbol/line precision is never invented.

The helper keeps an OS-protected local map from source_id to approved absolute root.
It resolves paths under that root, checks containment after symlink resolution and
returns a structured result:

| Result | Required behavior |
|---|---|
| exact | File digest matches; supplied range/symbol may be used |
| changed | Digest differs; return permitted candidate locator and require inspection/reassessment, not silent equivalence |
| ambiguous | More than one permitted binding/candidate; ask for selection |
| unbound / missing | Ask for root or report absent file; no auto-clone or source-view switch |
| denied / unsafe_path | Stop resolution; do not fall back to a broader root |

The helper does not send absolute roots or dirty file contents to the server. Default
receipts contain logical locator, digest comparison, time and outcome; uploading
source excerpts requires explicit publication authority. Host native tools do actual
reading and editing. These checks protect helper operations, not arbitrary host shell
commands or races in a host's separate file reader. Enforced tool access requires
host mediation and separate conformance evidence.

## Acceptance fixtures

Cover Java overloads, duplicate service names, inherited/custom Spring mappings,
literal/dynamic Hono mounts, JPA explicit/implicit names, parameterized/dynamic SQL,
matching event strings without transport proof, test skips, UTF-8/CRLF ranges,
renamed/deleted files, dirty workspaces, missing semantic indexes, path escapes and
incremental/full parity. Record false bindings and unsupported coverage separately.

# A2 bounded preparation receipt

**Status:** synthetic local acceptance slice implemented · 2026-09-20. This is
not a production knowledge build, authenticated capture, or proof of agent utility.

## Executable path

`packages/preparation/src/runner.ts` accepts a caller-supplied, declared capture,
checks every file's bytes against the manifest, negotiates installed `0.3.0` kind
profiles, and sends canonical JSONL to a reviewed executable with explicit limits.
The output is staged until a complete canonical stream, counts, digest, coverage,
locator binding and record/reference/support checks pass. Cancellation, timeouts,
oversized or truncated streams and changed input return no candidate. This process
boundary is **not** an isolation sandbox for untrusted plugins; installation and
executable identity remain external responsibilities.

The independent standard-library Python workflow adapter in
`packages/preparation/fixtures/python-workflow-adapter.py` demonstrates a custom
format/kind without a new core record branch. It recognizes one deliberately tiny
XML grammar; unsupported forms fail closed. The fixture and tests use invented
public data only.

`packages/preparation/src/cross-layer.ts` separately assembles a first-party
candidate from the eight public synthetic files under
`packages/extractor-spike/fixtures/cross-layer/`. It reuses pinned syntax scanners,
extracts Markdown sections, literal OpenAPI operations, Java declarations and tests,
Spring routes, explicit Jakarta `@Table(name=...)` and limited field-call candidates,
Oracle-style unquoted SQL tables, and TypeScript declarations. Every emitted item
is bound to a declared file digest and exact locator; coverage is explicitly
**partial**, not a claim of family-wide recall. All seven first-party extension
profiles used by this slice are installed and validated.

The resolver joins only a unique literal OpenAPI/Spring operation to a controller,
an explicit field/parameter call to a unique declared method, and an explicit JPA
table name to an unquoted SQL table. Missing or ambiguous targets stay unresolved
with diagnostics. The reviewer-supplied business-to-operation mapping and
test-to-method association are labelled human assertions; they are not static
calls, observed test runs, behavior parity or authenticated approvals. Derived
records inherit the strongest classification of their dependencies. The
independently written `expected.json` is used as a test oracle, never runtime
input or an edge generator.

## Boundaries and failed claims

- The Python producer and first-party cross-layer assembler are two conforming
  candidate paths, not one orchestration service. No portable release shard,
  activation authority, refresh pipeline or shared serving exists yet.
- The capture is supplied by the caller. Byte closure does not attest its Git
  revision, owner approval, completeness, filesystem integrity or enterprise ACL.
- Java call resolution excludes dynamic/inherited dispatch, conversion-based
  overloads, imported field types and local receiver inference. SQL/JPA joining
  is scoped to explicit unquoted Oracle-style names. OpenAPI remote `$ref` and
  computed routes are unsupported.
- A discovered test method or reviewed relevance association is not evidence that
  a test ran or that behavior matches a requirement. Business rules parsed from
  Markdown have pending review and unknown applicability.
- The integrated candidate has no authorization enforcement or search-quality
  verdict. A3 must measure actual baseline and typed retrieval over the same bytes.

## Verification

The package tests exercise actual fixture bytes, deterministic order, byte mismatch,
missing review, quoted SQL, classification inheritance, protocol truncation and
oversize, malformed UTF-8, cancellation, unsupported XML and atomicity. The
contract suite also rejects absent typed relationship endpoints and classification
downgrades. See the root `WORKLIST.md` and Git history for the final full-suite
counts and checkpoint receipt.

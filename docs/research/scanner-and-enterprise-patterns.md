# Scanner and enterprise-context patterns

**Status:** Design input and implementation gate, not a claim of reproduced third-party performance · CF-0.2

## Finding

No reviewed system provides the whole ContextFoundry journey: company-specific
functional meaning, code/API/data/test links, authorization, and a reviewed agent
handoff. The useful common architecture is **capture -> specialized extractors ->
shared, source-anchored facts -> resolution -> task-specific retrieval**. Do not use
one parser, embedding index, or LLM extraction pass as a substitute for all stages.

| Primary reference | Demonstrated mechanism | ContextFoundry disposition |
|---|---|---|
| [Kythe indexer guide](https://kythe.io/docs/schema/writing-an-indexer.html) and [overview](https://kythe.io/docs/kythe-overview.html) | Separate hermetic extraction/build context from language indexers; emit anchored cross-reference facts; incomplete beats incorrect | Separate capture from parsing, and declarations from resolved edges; accept partial coverage explicitly |
| [Meta Glean](https://github.com/facebookincubator/glean) | Language-specific indexers and SCIP/LSIF feed a common queryable fact store | Normalize approved external index output; do not build every semantic indexer ourselves |
| [Sourcegraph code navigation](https://sourcegraph.com/docs/code-navigation/precise-code-navigation) | Broad search fallback plus revision-specific SCIP indexes, often generated in CI | Keep lexical candidates useful but visibly different from exact semantic links; import CI-produced indexes only when revisions/dependencies match |
| [OpenRewrite type attribution](https://docs.openrewrite.org/reference/type-attribution) and [CodeQL framework coverage](https://codeql.github.com/docs/codeql-overview/supported-languages-and-frameworks/) | Syntax gains semantic precision from type/classpath context; framework knowledge is explicit and extensible | Version framework rules and enterprise-library models; unsupported custom conventions stay unresolved or reviewed |
| [Backstage system model](https://backstage.io/docs/features/software-catalog/system-model/) | Declared component/API/resource/system/domain boundaries | Import/review ownership and business grouping; do not infer product domains from paths |
| [Microsoft GraphRAG indexing](https://github.com/microsoft/graphrag/blob/main/docs/index/default_dataflow.md) | Document text units support extracted entities, relationships and summaries | Use for candidate business/document associations; preserve passages and review status; do not promote summary similarity to code fact |
| [Bazel reverse dependency query](https://docs.bazel.build/versions/main/query-how-to.html) and [Meta predictive test selection](https://engineering.fb.com/2018/11/21/developer-tools/predictive-test-selection/) | Build dependencies nominate possibly affected tests; historical outcomes can rank likely regression detectors | Keep dependency, exercised behavior, and observed pass/fail separate; advisory recommendations only until independent fault/miss validation |

These sources demonstrate mechanisms, not equivalent product outcomes. Their
licensing, deployment assumptions, cost and fit require separate checks before a
library or index format becomes a dependency. ContextFoundry's business-to-code
mapping and review workflow remain a product hypothesis to evaluate.

## V1/V2 source audit: candidates, not imported implementation

The historical [v2 disposition](v2-disposition.md) inspected selected retrieval
paths; it did **not** audit all extractors. This bounded follow-up inspects source
and test entry points, not accuracy on the ContextFoundry benchmark.

| Family | Observed reference evidence | Decision for first slice | Unproven/negative controls |
|---|---|---|---|
| Java declarations/calls | V1 `src/java-ast-worker.js` uses Tree-sitter Java. V2 `src/adapters/java-contracts.js`, `java-call-binding.js` and `tests/preparation/java-contracts-tests.js` cover anchors, overload ambiguity, receiver scope and syntax errors | Adapt the *patterns* into a bounded Java worker over supplied bytes. Use qualified signatures and exact anchors. Do not copy source without provenance/license clearance | Inherited/dynamic dispatch, incomplete classpath, overloads, shadowing, same-name types; no name-only exact call edges |
| Java HTTP/framework | V2 `java-http-binding.js` and its tests cover bounded JAX-RS literals, custom annotation rejection and duplicate routes | Implement Spring MVC literals required by the benchmark, treating JAX-RS as a later explicit rule set. Match API to implementation only with service, method, normalized route and version evidence | Composed annotations, placeholders, inherited routes, duplicate service names |
| SQL/PLSQL/data | V2 `sql-source.js`, `plsql-contracts.js`, `plsql-data-access.js` and PL/SQL tests use offset-preserving lexical treatment of strings/comments and contract extraction | Reuse lexical-boundary design and explicit DDL/query patterns; keep SQL dialect/version on every parser | Dynamic SQL, quoted identifiers, comments/literal decoys, implicit ORM naming and actual runtime lineage |
| OpenAPI | V1 `extractor-packages/sdk-openapi`; V2 `openapi-contracts.js` and tests cover operation identity, parameters, schemas, references, response/security facets | Bounded structured OpenAPI reader with exact JSON pointer/source support; distinguish declared contract from code implementation | External refs, duplicate keys, version/base path, mismatched route, security override |
| Enterprise metadata | V2 registry includes ADF, ESS, XDF, VBCS and search-index adapters, with targeted tests | Keep as technology packs behind the same contract; do **not** make Oracle-specific records the universal model or first benchmark gate | Vendor/version specificity, custom metadata, portability and artifact ownership |
| Documents/guides | V2 `guide-sections.js`; reference test fixtures | Section-anchored Markdown assertions with edition/authority and review; no execution of document instructions | Historical/stale docs, conflicting passages, ambiguous business mappings |
| TypeScript/React/Hono | Current TypeScript declaration spike, not a complete v1/v2 transfer | Extend only patterns needed for the cross-layer fixture; route/framework rules remain separate from syntax | Dynamic routes, computed imports, TSX, generated code, test-to-behavior claims |
| Tests/CI | V2 tests are extractor conformance examples, not a generic test-impact index | Add test declaration and explicit target/contract associations; CI results require authenticated revision-bound import | Filename heuristics, skipped/flaky runs, stale reports, uncovered behavior |

Paths above are relative to the separate reference repositories
`engineering-knowledge-pack-sdk` and `engineering-knowledge-pack-sdkv2`; their
content is not licensed into this public repository by our Apache-2.0 license.
The table is an inventory/disposition, not a port-complete or full security audit.

## Implementation gate

1. Pin capture and parser versions. Run each adapter on approved immutable input,
   with byte/path limits and no execution of repository code.
2. Emit a common record/locator/coverage envelope. Assert a producer's declared
   kinds against the registry; validate support and source-byte closure.
3. Resolve separately from parsing. Exact means evidence and necessary context
   match; otherwise return candidate, ambiguous, unresolved or unsupported.
4. Keep framework rules, API-contract joins, build/semantic indexes, business
   mappings and CI observations as separately versioned, attributed assertions.
5. Conformance-fixture each supported and unsupported construct, including decoys.
   Report false exact links and missed facts by family, not a global coverage score.
6. Before a usefulness claim, demonstrate one task at each required repo profile:
   requirement/business passage -> API -> service -> data -> associated tests,
   with exact pointers, explicit missing edges, human scope correction and selective
   full-file inspection. Compare against same-information lexical retrieval.

This gate precedes more TypeScript-only polish or broad retrieval tuning. Synthetic
fixtures can establish contract behavior; private three-repository utility evaluation
still requires the WP0 owner decisions and independent held-outs.

## First executable continuation

The public-safe `packages/extractor-spike/fixtures/cross-layer/` fixture
now supplies invented business, OpenAPI, Spring/Java, JPA, SQL, test and TypeScript
artifacts plus independent expected/forbidden claims. The isolated
[`sql-ddl` spike](../../packages/extractor-spike/src/sql-ddl.ts) performs bounded
syntax-only `CREATE TABLE` and column extraction on caller-supplied bytes; tests
include comment/string decoys, quoted identifiers, nested type parentheses,
malformed input and byte limits. It is not wired to source capture, locators,
coverage records or release assembly, and proves nothing about runtime behavior.

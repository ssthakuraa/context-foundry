# Architecture review and implementation decision

**Status:** CF-0.3 design decision baseline · 2026-09-20. Ready for the bounded
implementation below; usefulness, scalability and production security are unproven.

## Verdict and authority

Retain the extensible extraction SDK, evidence-bearing knowledge and human-reviewed
agent journey. Do not restart the framework or replace it with document RAG, a
universal LLM extractor, or wrappers around other products. Correct the integration
contracts and test the complete investigation loop before expanding the platform.

This review supersedes conflicting CF-0.2 **design and sequencing** statements.
It does not change executable schema version `0.2.0`, claim a contract freeze, or
retroactively validate existing spikes. Product requirements remain authoritative;
the architect owns design choices and their evidence, the owner owns domain truth,
data authority and product acceptance. No further general architecture questionnaire
is needed to start the public synthetic slice.

The [SDK extension contract](../technical-design/sdk-extension-contract.md),
[knowledge lifecycle and retrieval specification](../technical-design/knowledge-lifecycle-and-retrieval.md)
and [bounded implementation handoff](../execution/architecture-handoff.md) are the
normative additions. Historical research remains evidence, not an alternative queue.

## What the review found

| Finding | Decision | Verification still required |
|---|---|---|
| An extensible SDK is promised, but kind negotiation accepts only nine built-ins and symbols only Java/TypeScript | Versioned installed kind registry, open language identifiers, standard searchable projections, separate custom relation semantics | Independently written Python adapter works without editing core or UI |
| Scanners are progressing independently of task usefulness | Integrate one business/API/Java/data/test journey; instrument every selection stage | From captured bytes to useful source reads, not a manually fabricated graph presented as extraction |
| Qualified names can be mistaken for shared identity | Explicit identity schemes, source/module qualification and evidence-bearing resolution | Overloads, duplicate services, unresolved and cross-pack references |
| Support cycles and program cycles can be confused | Evidence-dependency graph is acyclic; engineering relationship graph can be cyclic | Mutual calls accepted, circular proof rejected |
| Incremental parsing alone does not maintain cross-file truth | Contributions, resolution watch keys and reviewed-mapping invalidation | Added/removed provider, changed framework config, full/delta equivalence |
| Retrieval architecture is described more precisely than its selection algorithm | Bounded candidate lanes, typed path policies, per-concern evidence packets and explicit continuation | Connector survival, actual wire size, unsupported/ambiguous results and same-information comparison |
| Scope and implementation approvals can be overclaimed | Local simulation now; authenticated exact-version decisions before shared use; external shell remains outside server control | Resume/revocation tests and host capability conformance |
| Documents overstate readiness or lag the code | Separate design decisions, current prototypes, implementation acceptance and product utility | Worklist receipts and restart checks, never test counts as utility evidence |

## Research transferred into decisions

This is a targeted follow-up to [the research closeout](../research/design-closeout.md)
and [scanner audit](../research/scanner-and-enterprise-patterns.md), not a new market
survey. Primary sources below were inspected on 2026-09-20. External mechanisms
inform our design; their performance and product outcomes have not been reproduced.

| Evidence inspected | Mechanism adopted | Deliberate limit |
|---|---|---|
| [SCIP protocol source](https://github.com/scip-code/scip/blob/main/scip.proto) | Language string rather than closed language enum; qualified symbols, source occurrences and explicit position encoding | A SCIP reference is not automatically a call or runtime dependency; validate each indexer's semantics and revision |
| [Meta Glean schema model](https://glean.software/docs/schema/basic/) | Typed facts with explicit identity rather than an undifferentiated chunk store | Our conflicting assertions remain separate; do not silently apply one-value uniqueness to disputed business truth |
| [Backstage entity lifecycle](https://backstage.io/docs/features/software-catalog/life-of-an-entity/) | Separate contributions, relationship assembly and search projection; track origin dependencies for lifecycle | Provenance dependencies are not domain relations; adopt the separation, not the Backstage runtime |
| [LangGraph interrupts](https://docs.langchain.com/oss/javascript/langgraph/interrupts) | Durable pause/resume around reviewable state | A resume payload is not authenticated human authorization; do not require LangGraph to orchestrate an external coding agent |
| V2 `src/extractor-packages.js`, `extractor-authoring.js`, `interface-registry.js` | Adapter manifests/examples, attributed results, service-qualified joins, ambiguous/unresolved states and snapshot-bound lookup fingerprints | Independent implementation; no copying private code, platform dependency or assertion that all reference code is correct |

The v2 failed-design retrospective and discovery RCA in the supplied reference repo
report a large one-shot response followed by broad source rediscovery, plus expensive
scoped lexical/proof work. They distinguish historical model comparisons from
controlled runtime diagnostics. This review read those reports and selected source;
it did **not** rerun their experiments. They support changing retrieval composition,
observability and acceptance gates, not a conclusion that extensible extraction is
inherently wrong or PostgreSQL alone fixes performance.

## Selected architecture

1. **Capture:** source-control-neutral, immutable bytes and inventory; acquisition
   authority is separate from publication and query permission.
2. **Analyze:** language/format parsers produce anchored declarations, documents,
   contract facets and unresolved references. Framework rules add explicit meaning.
3. **Resolve and compile:** join qualified references against a pinned snapshot;
   preserve ambiguity; validate support, custom-kind profiles and coverage; assemble
   an immutable candidate. Reviewed business mappings are inputs, not inferred truth.
4. **Retrieve:** search and bounded typed expansion produce small, attributed
   evidence packets for particular concerns, not an answer or full repository dump.
5. **Investigate:** the host agent reasons about sufficiency, gets scope review,
   reads the indicated current source selectively, and proposes findings/design/plan.
6. **Review and implement:** a second exact-version human decision permits coding
   in a conforming integration. ContextFoundry does not generate or execute the code.

The offline reference implementation uses immutable files and an in-memory projection.
It tests semantics, not enterprise capacity. The first **shared deployment** remains
a TypeScript modular application, Fastify, React Studio, PostgreSQL and isolated
preparation workers. PostgreSQL is selected for shared transactional operations;
its retrieval performance remains a gate. No mandatory vector store, graph database,
query LLM, distributed workflow engine or rich UI precedes utility evidence.

Use existing parser/compiler/index formats when they supply the required semantics.
Tree-sitter is appropriate for syntax; SCIP/compiler output can improve binding;
structured OpenAPI/XML readers handle declared metadata. Do not build a general
compiler or widen the temporary SQL lexer into a dialect-complete parser. Choose and
license-check a dialect parser when the selected task exceeds the bounded DDL subset.

## Design walkthroughs — not executed acceptance tests

These traces identify necessary records and failure behavior. Fixtures and measured
receipts must establish that implementation follows them. `cross-layer` below means
the invented public fixture in `packages/extractor-spike/fixtures/cross-layer`.

| Task | Knowledge and investigation path | Required boundary / failure case |
|---|---|---|
| Consume the repair approval API | Exact operation -> request/response and declared error/security facets -> contract pointers; agent decides whether the known facets answer the question | Missing authorization or side-effect semantics remain unknown. Do not infer them from an HTTP verb or read the service automatically for a simple declared-contract question |
| Enhance approval to record the coordinator | Business passage -> reviewed mapping -> declared API -> qualified route/controller -> service -> explicitly mapped entity/table -> test candidates; Gate 1, selective reads, findings and Gate 2 | Fixture code omits the documented coordinator expectation; surface this mismatch, not a fabricated implementation claim. Empty test methods do not validate behavior |
| Diagnose a cross-product failure | Product/flow applicability -> relevant technical entry points -> unresolved integration/configuration boundary -> human adds missing subsystem -> revise scope -> read its evidence if authorized | A human addition is task-local and does not grant source access or become a published business mapping. Dynamic dispatch remains a gap until investigated |
| Assess a schema change and affected tests | Changed column/table -> reverse explicit ORM/query/dependency links -> consumers and statically associated tests -> agent reviews behavior and proposes tests | Unsupported SQL or missing consumers prevent a completeness claim. Static association does not justify skipping all other tests or declaring behavior parity |
| Add an enterprise workflow format | Independent Python analyzer emits a registered namespaced kind and standard projection -> generic search/inspect -> installed resolver supplies declared workflow relationships | No core language switch or custom UI needed. Unknown schema, false support, excessive output and unregistered relation semantics fail conformance |
| Refresh after deletion or a second provider appears | Replace source contribution -> invalidate dependent assertions/watch keys -> recompute joins -> stale reviewed mapping -> new validated snapshot | A formerly unique route becomes unresolved/ambiguous, not silently rebound. Old snapshot stays immutable; current access revocation still applies |

The first integrated slice needs one stack, not every technology on every task.
Java/Spring + OpenAPI + explicit JPA/SQL + Markdown + test declarations exercises
the difficult boundaries. Existing TypeScript work remains reusable and supplies a
second language check; React/Hono and wider enterprise formats follow diagnosed
task needs. Both required repository profiles must pass before multi-profile claims.

## Alternatives and stop rules

| Alternative | Decision and revisit trigger |
|---|---|
| Ordinary agent search with no prepared knowledge | Mandatory baseline. Prefer it if preparation does not earn its maintenance cost |
| Documents and precise pointers, without typed expansion | Mandatory same-information baseline. Ship this simpler scope if typed expansion adds no repeatable benefit |
| Embedding-first RAG | Optional recall lane when terminology misses are demonstrated; not an identity, evidence or dependency model |
| Fully automatic business knowledge extraction | Reviewable proposals only; accuracy, source support and curation cost must be measured |
| Build the enterprise platform before investigating utility | Rejected. Local proof first; no shared private serving until access/security gates pass |

Zero tolerance for false *exact* links in conformance cases, hidden evidence leakage,
forged approval acceptance or test-success claims from declarations. Quality must not
be traded away for smaller packets. Use the controlled evaluation gates, and after
two bounded diagnosed iterations without benefit choose simplify/change/stop rather
than adding mechanisms indefinitely. Synthetic success cannot establish market
leadership; that requires independent adopters, unseen tasks and maintenance evidence.

## Handoff

The design is sufficiently concrete for the five [bounded implementation tasks](../execution/architecture-handoff.md).
The shared contract is still provisional, and each task must supply its stated
receipts. Stronger review is reserved for new semantic/security decisions and the
utility verdict, not every parser function or test. The user can switch to Sol Medium
for this queue after this documentation checkpoint; no model setting is changed by
this document and no equivalence or quota-saving percentage is promised.

# First-slice record-kind catalog

**CF-0.3 design amendment:** this page inventories the implemented provisional
CF-0.2 kinds. Their closed registry is not the final SDK architecture. The
[extension contract](sdk-extension-contract.md) adds installed namespaced profiles,
generic projections and a minimal source-artifact kind in A1, with explicit schema
versioning and conformance. Unknown kinds remain rejected by current code until then.

**A1 implementation:** the separate `0.3.0` extension entry point now registers
reviewed `source.artifact` and open-language `engineering.symbol` profiles plus
namespaced adopter kinds. See the [compatibility receipt](a1-compatibility-receipt.md).
The legacy `0.2.0` kind handshake below stays closed; A2 must port the other seven
first-party kinds before using them in integrated extension contributions.

**Status:** Proposed catalog for CF-0.2, not a frozen schema or permission to emit unregistered kinds. A source parser may produce only kinds registered by the runtime validator; unsupported declarations become adapter coverage/diagnostics, not loosely shaped records.

| Kind | Meaning and minimum payload | Permitted origin and support boundary | Status |
|---|---|---|---|
| `engineering.symbol` | Language, declaration kind, short name, optional qualified name and callable signature | Source declaration with exact locator; no runtime behavior implied | Implemented; TypeScript spike emits qualified names |
| `engineering.relationship` | Qualified subject, relation, object and declared supporting records | Static or source-declared relationship; an unresolved candidate is not a confirmed edge | Implemented |
| `business.rule` | Rule statement and bounded/unknown applicability | Human asserted or source declared; review state stays separate from origin | Implemented |
| `business.mapping` | Business and engineering entities, mapping relation/basis and applicability | Explicit reference versus reviewed association; never silently converted to runtime call | Implemented |
| `interface.operation` | Stable interface ID, operation key, protocol, optional request/response contract pointers and known error/auth/side-effect descriptors; HTTP requires method and route | Source-declared contract only; descriptors absent or unknown remain unknown, not invented. Implementation pointer is distinct from contract claim | Strict payload registered; adapter pending |
| `test.association` | Test identity, target entity/obligation, association basis and expected scope | Static reference or human-asserted association; association is not evidence a test ran, passed or covers all behavior | Strict payload registered; adapter pending |
| `business.flow` | Flow identity, ordered step IDs and product/domain applicability | Expert assertion or source-declared documentation; order is not a runtime call graph | Strict payload and flow/step membership check; curation route pending |
| `business.flow_step` | Step identity, containing flow, involved product/capability and precondition/outcome pointers | Bounded applicability and explicit source/expert support; cross-product joins require reviewed mappings | Strict payload and flow/step membership check; curation route pending |
| `behavior.obligation` | Expected outcome, conditions, product scope and validation intent | Separates intended behavior from source observation; a test result can discharge it only through an authenticated run importer | Strict payload; importer and obligation-reference closure pending |

The producer/consumer handshake declares which kinds it can produce or use and which fields are optional or unknown. The current closed registry rejects unknown payloads. CF-0.3 selects an installed extension registry, explicitly negotiated by producer and consumer, which cannot masquerade as a first-party kind. Adapter coverage records unsupported constructs instead of promoting them to approximate facts.

`ProducerCapabilitiesSchema` and `ConsumerCapabilitiesSchema` now restrict declarations to the nine registered kinds. `checkKindHandshake` rejects missing consumer-required kinds, producer kinds not accepted by the consumer, undeclared emitted kinds and invalid records. It is a declared compatibility check, not authentication of an adapter, proof that declared extraction coverage is true, or evidence that a consumer correctly interprets every payload. Extensions remain unsupported in CF-0.2; `declared_unsupported` is a diagnostic label list, not a grant to emit unknown records.

Three distinctions are mandatory across future payloads: API consumption details versus service implementation location; test association versus observed execution; intended business outcome versus observed code behavior. Exact evidence pointers and transitive support remain required, but support alone does not establish truth, currency, visibility or permission.

`checkBusinessFlowLinks` rejects missing, duplicate, unlisted and mismatched flow/step identities. `checkObligationLinks` resolves step outcome references and test targets explicitly typed as behavior obligations against unique obligation entities. `checkEngineeringTargetLinks` resolves interface implementation pointers and test targets explicitly typed as engineering entities against unique, valid `engineering.symbol` records in the supplied record set; missing and ambiguous targets fail closed. `checkReleaseIntegrity` withholds its support closure if any of these checks fail. Step preconditions, business-mapping engineering pointers, test declaration identity, relationship endpoints and cross-pack targets are not yet resolved. Structural membership and typed references do not prove business sequence, test coverage, observed behavior or cross-product truth.

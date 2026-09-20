# First-slice record-kind catalog

**Status:** Proposed catalog for CF-0.2, not a frozen schema or permission to emit unregistered kinds. A source parser may produce only kinds registered by the runtime validator; unsupported declarations become adapter coverage/diagnostics, not loosely shaped records.

| Kind | Meaning and minimum payload | Permitted origin and support boundary | Status |
|---|---|---|---|
| `engineering.symbol` | Language, declaration kind, name and callable signature | Source declaration with exact locator; no runtime behavior implied | Implemented |
| `engineering.relationship` | Qualified subject, relation, object and declared supporting records | Static or source-declared relationship; an unresolved candidate is not a confirmed edge | Implemented |
| `business.rule` | Rule statement and bounded/unknown applicability | Human asserted or source declared; review state stays separate from origin | Implemented |
| `business.mapping` | Business and engineering entities, mapping relation/basis and applicability | Explicit reference versus reviewed association; never silently converted to runtime call | Implemented |
| `interface.operation` | Stable interface ID, operation key, protocol, optional request/response contract pointers and known error/auth/side-effect descriptors; HTTP requires method and route | Source-declared contract only; descriptors absent or unknown remain unknown, not invented. Implementation pointer is distinct from contract claim | Strict payload registered; adapter pending |
| `test.association` | Test identity, target entity/obligation, association basis and expected scope | Static reference or human-asserted association; association is not evidence a test ran, passed or covers all behavior | Strict payload registered; adapter pending |
| `business.flow` | Flow identity, ordered step IDs and product/domain applicability | Expert assertion or source-declared documentation; order is not a runtime call graph | Strict payload and flow/step membership check; curation route pending |
| `business.flow_step` | Step identity, containing flow, involved product/capability and precondition/outcome pointers | Bounded applicability and explicit source/expert support; cross-product joins require reviewed mappings | Strict payload and flow/step membership check; curation route pending |
| `behavior.obligation` | Expected outcome, conditions, product scope and validation intent | Separates intended behavior from source observation; a test result can discharge it only through an authenticated run importer | Strict payload; importer and obligation-reference closure pending |

The minimal first-slice producer/consumer handshake must declare which of these kinds it can produce, which it can use in retrieval, and which fields are optional or unknown. A strict required-kind registry rejects unknown payloads; an extension namespace, if later allowed, must be explicitly negotiated by both producer and consumer and cannot masquerade as a first-party kind. Adapter coverage records unsupported constructs instead of promoting them to approximate facts.

Three distinctions are mandatory across future payloads: API consumption details versus service implementation location; test association versus observed execution; intended business outcome versus observed code behavior. Exact evidence pointers and transitive support remain required, but support alone does not establish truth, currency, visibility or permission.

`checkBusinessFlowLinks` rejects missing, duplicate, unlisted and mismatched flow/step identities. `checkObligationLinks` resolves step outcome references and test targets explicitly typed as behavior obligations against unique obligation entities. `checkReleaseIntegrity` withholds its support closure if either check fails. Step preconditions, engineering test targets and interface implementation pointers are not yet resolved. Structural membership and obligation references do not prove business sequence, test coverage, observed behavior or cross-product truth.

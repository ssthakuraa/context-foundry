# First-slice record-kind catalog

**Status:** Proposed catalog for CF-0.2, not a frozen schema or permission to emit unregistered kinds. A source parser may produce only kinds registered by the runtime validator; unsupported declarations become adapter coverage/diagnostics, not loosely shaped records.

| Kind | Meaning and minimum payload | Permitted origin and support boundary | Status |
|---|---|---|---|
| `engineering.symbol` | Language, declaration kind, name and callable signature | Source declaration with exact locator; no runtime behavior implied | Implemented |
| `engineering.relationship` | Qualified subject, relation, object and declared supporting records | Static or source-declared relationship; an unresolved candidate is not a confirmed edge | Implemented |
| `business.rule` | Rule statement and bounded/unknown applicability | Human asserted or source declared; review state stays separate from origin | Implemented |
| `business.mapping` | Business and engineering entities, mapping relation/basis and applicability | Explicit reference versus reviewed association; never silently converted to runtime call | Implemented |
| `interface.operation` | Stable interface ID, operation key, protocol, request/response contract pointers and known error/auth/side-effect descriptors | Source-declared contract only; descriptors absent or unknown remain unknown, not invented. Implementation pointer is distinct from contract claim | Pending strict payload and adapter |
| `test.association` | Test identity, target entity/obligation, association basis and expected scope | Static reference or reviewed association; association is not evidence a test ran, passed or covers all behavior | Pending strict payload and adapter |
| `business.flow` | Flow identity, ordered step IDs, product/domain scope and variation status | Expert assertion/reviewed documentation; order is not a runtime call graph | Pending strict payload and curation route |
| `business.flow_step` | Step identity, containing flow, involved product/capability, preconditions and outcome pointers | Bounded applicability and explicit source/expert support; cross-product joins require reviewed mappings | Pending strict payload and curation route |
| `behavior.obligation` | Expected outcome, conditions, product scope and validation intent | Separates intended behavior from source observation; a test result can discharge it only through an authenticated run importer | Pending strict payload and importer route |

The minimal first-slice producer/consumer handshake must declare which of these kinds it can produce, which it can use in retrieval, and which fields are optional or unknown. A strict required-kind registry rejects unknown payloads; an extension namespace, if later allowed, must be explicitly negotiated by both producer and consumer and cannot masquerade as a first-party kind. Adapter coverage records unsupported constructs instead of promoting them to approximate facts.

Three distinctions are mandatory across future payloads: API consumption details versus service implementation location; test association versus observed execution; intended business outcome versus observed code behavior. Exact evidence pointers and transitive support remain required, but support alone does not establish truth, currency, visibility or permission.

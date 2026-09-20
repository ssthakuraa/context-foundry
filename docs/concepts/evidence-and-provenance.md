# Evidence and provenance

**Status:** Draft

ContextFoundry must distinguish what is observed from what is inferred or
proposed.

## Evidence dimensions

| Dimension | Meaning |
|---|---|
| Origin | Source-declared, statically resolved, human-asserted, or model-proposed. |
| Review | Pending, approved, rejected, not required, or stale. |
| Validation | Results of specific tests/checks, with revision and environment. |
| Freshness | Valid for a supplied snapshot, changed, or unknown. |
| Coverage | Complete for a declared scope, partial, unsupported, or unavailable. |

These dimensions are independent. Approval does not change an assertion's origin,
and a passing check establishes only what that check exercised. Unknown is a possible
conclusion when evidence is insufficient. Architecture proposals remain separate
from observed current state. See [data contracts](../technical-design/data-contracts.md).

## Provenance fields

Material records should retain, where applicable:

- Enterprise and pack identity
- Repository or source-system identity
- Revision, commit, snapshot, or release identifier
- Relative path and symbol/range locator
- Extractor or provider identity and version
- Extraction timestamp
- Owner and authorization scope
- Confidence and evidence state
- Derivation or relationship explanation

## Completeness

Absence is meaningful only when coverage is known. A search result that finds no
match must be distinguishable from:

- The source was not available
- The extractor does not support the technology
- The relationship was ambiguous
- The requested scope was incomplete
- Authorization prevented inspection
- The pack is stale

Report permitted coverage conditions rather than converting them into a negative
engineering conclusion. Hidden resources must not be identified through diagnostics:
"no result in your accessible scope" must not reveal a restricted artifact's existence.

# WP1 contract-freeze review

**Status:** Open review · CF-0.2 · 2026-09-20. This is a gap audit, not a freeze or permission to start private evaluation.

## Verified now

- Twenty-six Draft 7 JSON Schema exports, static TypeScript types and runtime validators exist. Nine registered record kinds cover engineering symbols/relationships, business rules/mappings, interface operations, test associations, business flows/steps and behavior obligations; all five task artifact body kinds have strict shapes.
- Metadata checks cover capture/file/locator binding, canonical declared-file manifest digests, acyclic source-evidence support with no empty-support record, and exact same-task artifact references. These checks return issues instead of partial authorization decisions.
- The current fifty-one package tests, typecheck, build, schema export check, forty-nine generated HTML pages, seventeen bounded semantic vectors in TypeScript/Python, nine valid/six rejected canonical JSON and three valid/three rejected JSONL vectors in TypeScript/Python pass. These are bounded fixtures, not a completeness claim.

## Blocking gaps before a shared contract freeze

| Gap | Why it matters | Exit evidence |
|---|---|---|
| Kind catalog | The nine [proposed first-slice kinds](record-kind-catalog.md) have strict payloads, flow/step membership and typed obligation-reference checks, but producer/consumer handshakes, engineering targets and other references, declaration adapters and explicit unsupported coverage remain | Each first-slice producer/consumer kind is either strictly handled or explicitly unsupported with coverage and reference closure |
| Portable semantic parity | JSON Schema exports do not encode all TypeScript semantic checks, including path normalization, cross-record support, exact body digest and version-chain rules | [Partial ledger](semantic-conformance.md) and seventeen shared cases now cover six bounded rule families in TypeScript/Python; full schema prevalidation and remaining single/cross-object parity are still required |
| Evidence trust | Execution-evidence JSON is shape-only; raw-byte and complete declared-manifest checks still trust caller-supplied bytes and declaration, not source origin, producer authenticity or publication authority | Authenticated importer and digest/revision/policy receipts; forged or stale report denial tests |
| Task authority | Receipt shape and artifact references cannot establish a human session, current grant, nonrevocation or valid state transition | WP3 transactional authorization/state tests before any implementation approval claim |
| Release-set closure | Exact two-pack manifest identity/digest closure now has synthetic positive/negative tests, but cross-pack entity conflicts, source-manifest provenance, shard/bridge byte closure and activation compatibility are not checked end to end | Verified bytes and provenance, cross-pack conflict cases and transactional activation tests |
| Cross-language boundaries | Nine valid/six rejected JSON and three valid/three rejected JSONL vectors include Unicode, numeric notation, ordering, LF and identity cases, but not size limits or an independent importer round-trip | Size-boundary cases and parity report with supported limits and rejection behavior |

## Decision

Keep `0.2.0` provisional. WP1 may continue with synthetic fixtures and bounded interfaces, but WP2/WP3 must not treat the current schemas as frozen. Schema validity, a claimed approval receipt or a `passed` report cannot substitute for authenticated policy, source-byte verification or human review. Private benchmark capture/runs still require the owner decisions recorded in [WP0](../execution/validation-work-packages.md).

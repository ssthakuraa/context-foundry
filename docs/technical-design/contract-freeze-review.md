# WP1 contract-freeze review

**Status:** Open review · CF-0.2 · 2026-09-20. This is a gap audit, not a freeze or permission to start private evaluation.

## Verified now

- Twenty-eight Draft 7 JSON Schema exports, static TypeScript types and runtime validators exist. Nine registered record kinds cover engineering symbols/relationships, business rules/mappings, interface operations, test associations, business flows/steps and behavior obligations; all five task artifact body kinds have strict shapes. Producer/consumer capability manifests can check declared kind compatibility.
- Metadata checks cover capture/file/locator binding, canonical declared-file manifest digests, acyclic source-evidence support with no empty-support record, and exact same-task artifact references. These checks return issues instead of partial authorization decisions.
- The current sixty-one contract tests plus two isolated extractor-spike tests, typecheck, build, schema export check, fifty generated HTML pages, twenty bounded semantic, three shape-invalid and six scope-map artifact variants in TypeScript/Python, nine valid/six rejected canonical JSON and three valid/three rejected JSONL vectors in TypeScript/Python pass. Generated 16 MiB size-boundary cases also pass in both languages. These are bounded fixtures, not a completeness claim.

## Blocking gaps before a shared contract freeze

| Gap | Why it matters | Exit evidence |
|---|---|---|
| Kind catalog | The nine [proposed first-slice kinds](record-kind-catalog.md) have strict payloads and declared producer/consumer kind compatibility, but manifest authenticity, engineering targets and other references, declaration adapters and actual unsupported coverage remain | Each first-slice producer/consumer kind is strictly handled or explicitly unsupported with coverage and reference closure |
| Portable semantic parity | JSON Schema exports do not encode all TypeScript semantic checks, including path normalization, cross-record support, exact body digest and version-chain rules | [Partial ledger](semantic-conformance.md) and twenty semantic/three shape-invalid plus six scope-map artifact variants cover bounded single-object rules with independent Draft 7 prevalidation in Python; other body kinds and cross-object parity remain |
| Evidence trust | Execution-evidence JSON is shape-only; raw-byte and complete declared-manifest checks still trust caller-supplied bytes and declaration, not source origin, producer authenticity or publication authority | Authenticated importer and digest/revision/policy receipts; forged or stale report denial tests |
| Task authority | A pure intent-sensitive transition planner labels required authority, but neither it nor receipt shape/artifact references establish a human session, current grant, nonrevocation or committed state transition | WP3 transactional authorization/state tests before any implementation approval claim |
| Release-set closure | Exact two-pack manifest identity/digest and caller-supplied ordered shard/bridge bytes have synthetic checks; a conservative one-owner-per-entity check rejects cross-pack duplicates, but pack grouping, source-manifest provenance, producer authenticity and activation compatibility are not established end to end | Trusted pack/byte provenance, explicit reownership policy and transactional activation tests |
| Cross-language boundaries | Nine valid/six rejected JSON and three valid/three rejected JSONL vectors include Unicode, numeric notation, ordering, LF and identity cases; generated size-boundary cases cover 16 MiB but not an independent importer round-trip or broad property testing | Parity report, independent importer round-trip and supported-limit/rejection behavior |

## Decision

Keep `0.2.0` provisional. WP1 may continue with synthetic fixtures and bounded interfaces, but WP2/WP3 must not treat the current schemas as frozen. Schema validity, a claimed approval receipt or a `passed` report cannot substitute for authenticated policy, source-byte verification or human review. Private benchmark capture/runs still require the owner decisions recorded in [WP0](../execution/validation-work-packages.md).

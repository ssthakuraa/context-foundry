# Portable semantic conformance ledger

**Status:** Partial, CF-0.2. JSON Schema shape validation is necessary but insufficient. A consumer must run applicable semantic and cross-object checks before treating an object as well formed; no validator alone grants source trust, visibility or human authority.

The language-neutral [semantic vectors](../../packages/contracts/fixtures/semantic-vectors.json) contain schema-valid objects with expected acceptance outcomes and separate shape-invalid cases. TypeScript runs the full `validate` entry point; the independent Python checker uses pinned `jsonschema==4.26.0` and the exported Draft 7 schemas to prevalidate shape before implementing only the rules listed as *parity checked* below. Three shape-invalid cases and six scope-map artifact variants are checked independently in both languages. The expected result does not establish provenance or approval.

| Rule ID | Scope | Invariant | Portable status |
|---|---|---|---|
| CF-S01 | Captured file and evidence locator | Path is relative normalized POSIX: no absolute/drive prefix, backslash, control character, empty, `.` or `..` segment | Parity checked: path examples |
| CF-S02 | File-range and byte-span locator | Start is at most end for lines, strictly less for byte offsets | Parity checked |
| CF-S03 | Coverage | Processed + failed + excluded does not exceed eligible | Parity checked |
| CF-S04 | Engineering symbol | Callable method, constructor or function has a nonempty signature | Parity checked: method example |
| CF-S05 | Business rule/mapping applicability | Bounded has a nonempty product or condition scope; unknown claims none | Parity checked: business rule examples only |
| CF-S11 | Interface operation | HTTP requires method and route; other protocols cannot claim HTTP fields | Parity checked: HTTP/event examples |
| CF-S12 | Consumer capabilities | Required kinds are a subset of accepted kinds | TypeScript only |
| CF-S06 | Release set | Pack IDs unique within the set | TypeScript only |
| CF-S07 | Task bodies | IDs unique where required; source-observed, business-asserted and evidence-based claims have their required support; source inspection has planned reads | TypeScript only |
| CF-S08 | Task artifact | Canonical body digest matches; previous version is immediate; body schema matches kind; body support is included in envelope support | Partial parity: six scope-map variants; other body kinds TypeScript only |
| CF-S09 | Record envelope | Kind is registered; payload schema and mapping origin/basis are consistent; relationship support is declared | TypeScript only |
| CF-S10 | Execution evidence shape | A passed run has completion time; skipped run has no observed obligations | TypeScript only; never evidence authentication |
| CF-X01 | Capture, files and locators | Exact source/snapshot/revision and digest binding, declared manifest closure | TypeScript only, metadata only |
| CF-X02 | Record support graph | References exist, graph is acyclic, every record has nonempty transitive source support | TypeScript only |
| CF-X03 | Task artifacts in a task | Exact same-task referenced version/kind exists and cross-artifact links are consistent | TypeScript only; not approval |
| CF-X04 | Flow/step/obligation records | Flow membership and explicitly typed obligation references resolve uniquely | TypeScript only; not business truth or test execution |

`CF-S01`–`CF-S05`, `CF-S11`, and the scope-map subset of `CF-S08` are a bounded cross-language start, not a second complete validator. Semantic cases satisfy the exported JSON Schema so their acceptance difference isolates a semantic rule. Both languages check shape; Python does not implement the other four task body kinds or cross-object checks. Before contract freeze, expand positive/negative boundaries, cover the remaining single-object and cross-object rules, and publish versioned rejection behavior. Consumers must not infer parity for an untested row.

Run from the repository root: `pnpm test` and, in a Python 3.12 environment with [pinned semantic-check dependencies](../../scripts/requirements-semantic-python.txt), `python3 scripts/check-semantic-python.py`. The public fixture checker has no access to private evaluation sources.

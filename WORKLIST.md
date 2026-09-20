# ContextFoundry worklist

**Updated:** 2026-09-20
**Purpose:** Durable progress ledger for the first validation slice. Update this file when a task changes state; preserve evidence of failures and reopenings. The detailed scope and exit criteria are in [validation work packages](docs/execution/validation-work-packages.md).

Legend: `[ ]` pending, `[-]` in progress, `[x]` complete, `[!]` needs a product decision or external input. A checked item means its stated evidence exists; it does not imply the entire package has passed.

## Design and handoff

- [x] CF-0.2 product requirements, architecture, research verdict, technical designs, traceability and execution plan written. Evidence: [review guide](docs/review-guide.md), [requirements traceability](docs/requirements/traceability.md).
- [x] Generated HTML pages validated and visually spot checked. Evidence: 49 pages passed `python3 scripts/build-docs.py --check` on 2026-09-20; prior desktop/mobile samples were spot checked.
- [x] Create this durable worklist, [restart context](restartcontext.md) and [restart prompt](restartprompt.md).
- [x] Create the public [GitHub repository](https://github.com/ssthakuraa/context-foundry) and configure `origin`. The private `.local/` directory is Git-ignored.
- [x] Adopt [Apache-2.0](LICENSE) with owner approval and record [ADR 0006](docs/decisions/0006-apache-2-license.md); private fixture material remains outside the public license grant.

## WP0 — Evaluation setup

- [x] Reconfirm the three repository revisions and derive a private, bounded source manifest without changing their checkouts. Evidence: `python3 scripts/create-evaluation-manifest.py --check` verified 154 file digests across three sources on 2026-09-20; the manifest is under ignored `.local/evaluation/`.
- [x] Draft exact maintenance development stories and a source backed obligation rubric; keep intended business behavior distinct from observed code. Evidence: ignored `.local/evaluation/development-rubric.md` contains nine provisional stories, source-observed candidates and explicit owner questions. This is not an adjudicated answer key.
- [ ] Reserve exact leasing stories and record prior exposure before any retrieval tuning.
- [!] Obtain the owner's review of task truth, scoring thresholds, permissible capture and model data route before private or paid benchmark runs. A proposed rubric can be prepared without that decision.

## WP1 — Executable contracts

- [x] Bootstrap the minimal TypeScript workspace and pin required runtime, validator and test dependencies after a compatibility/license check. Evidence: `pnpm-lock.yaml`, Node 24 local build, TypeScript 5.9.3, TypeBox 0.34.52, Ajv 8.20.0; `pnpm test`, `pnpm typecheck` and `pnpm build` passed on 2026-09-20.
- [-] Implement strict schemas and generated/static types for source captures, locators, assertions, coverage, releases, task artifacts, human decisions, errors and evaluation manifests. Twenty-six schemas, static types and portable JSON exports exist; strict first-party payload checks cover `engineering.symbol`, `engineering.relationship`, `business.rule`, `business.mapping`, `interface.operation`, `test.association`, `business.flow`, `business.flow_step` and `behavior.obligation`, plus all five task artifact bodies. An `ExecutionEvidenceSchema` describes claimed CI/test outcomes but is deliberately excluded from released support until authenticated import exists. Mapping basis cannot be silently promoted to a runtime edge. Task artifact body digests, prior versions and exact same-task findings/proposal references are checked by `checkTaskArtifactReferences`; this does not verify approval. Metadata-only binding covers distinct sources, missing files, revision drift, locator/file digest mismatch and canonical declared-file manifest digest closure. Source locators have evidence IDs; `checkSupportClosure` rejects missing/duplicate support, undeclared relationship support, cycles, empty transitive support and oversized closures, and returns bounded transitive evidence IDs only for valid graphs. `checkReleaseIntegrity` withholds that set if capture binding, flow/step membership or typed obligation-reference checks fail. `checkReleaseSetBindings` closes a two-pack set against exact canonical manifest metadata but not source/shard/bridge bytes or activation policy. `verifyCapturedFileBytes` checks one caller-supplied file; `checkCaptureByteClosure` fails closed across the entire declared file list, without proving its source, declaration completeness or publication authority. Evidence: 55 tests, typecheck, build, 26-schema check and 49 HTML page check passed on 2026-09-20. Producer adapters, authenticated non-source evidence import, trusted byte origin and authorization remain; schema validity alone never grants authority.
- [x] Implement initial TypeScript canonical serialization and SHA-256 digests; verify Unicode, number, duplicate decoded keys, record ordering, round trips and unsupported variants. Evidence: `packages/contracts/src/canonical.ts` and portable [canonical vectors](packages/contracts/fixtures/canonical-vectors.json) with fixed canonical UTF-8/digest expectations; independent `scripts/check-canonical-python.py` passed nine valid/six invalid JSON and three valid/three invalid JSONL vectors using pinned `rfc8785==0.1.4` on 2026-09-20. Generated input/output/JSONL 16 MiB boundary cases pass in both languages. Broader property/conformance testing and contract freeze remain open.
- [-] Audit the contract freeze and record compatibility/validation receipts before WP2/WP3 dependent work. The [freeze review](docs/technical-design/contract-freeze-review.md) records verified WP1 checks and blocking gaps. The [semantic conformance ledger](docs/technical-design/semantic-conformance.md) identifies fifteen rules; seventeen synthetic semantic, three shape-invalid and six scope-map artifact variants exercise bounded rule families with independent Draft 7 prevalidation in TypeScript and Python. The [proposed kind catalog](docs/technical-design/record-kind-catalog.md) defines boundaries for remaining first-slice kinds with all nine listed payloads now registered but adapters, remaining target-reference checks and producer/consumer coverage pending. Other task body kinds, full semantic and cross-object parity remain open; version `0.2.0` remains provisional.

## WP2 — Preparation and local binding

- [ ] Implement bounded Java/Spring, TypeScript/Hono, SQL, Markdown and test declaration adapters with declared coverage limits.
- [ ] Implement qualified resolution, reviewed business mapping import and portable candidate releases.
- [ ] Implement safe local source binding with digest and stale/ambiguous/missing outcomes.
- [ ] Verify path safety, unsupported cases and full versus incremental parity; record curation cost.

## WP3 — Task, identity and policy

- [ ] Implement migrations and authorization for sources, support evidence, task artifacts and human decisions.
- [-] Implement task state transitions, exact artifact approvals, idempotency and revocation. `planTaskTransition` now tests the pure intent/phase matrix and labels required authority; it is not an authenticated transition or approval. Persistence, CAS, current grants, receipt/visibility checks, idempotency and revocation remain pending.
- [ ] Add minimal authenticated scope/proposal review pages and verify denial of agent self approval.

## WP4 — Secured retrieval

- [ ] Implement same information simple lexical/pointer baseline, then typed context retrieval.
- [ ] Verify authorization with an independent oracle and hidden distractors; measure actual scoped query plans and latency.
- [ ] Decide whether PostgreSQL projections and typed enrichment earn their cost.

## Later validation

- [ ] WP5 connect the guided agent journey and verify both human review gates, selective source reads and completion receipts.
- [ ] WP6 run the approved, controlled development and held out comparisons.
- [ ] WP7 record the evidence based keep/change/stop investment decision.

## Operating notes

- The owner authorized work on this plan on 2026-09-20, asked for documentation updates as designs change, and wants continuity files for a quota interruption.
- Product implementation and experiments must be recorded separately. The three fixture repositories are evaluation inputs; their existing contents must not be edited as part of ContextFoundry development.
- The current proposed design is CF-0.2. It is an implementation baseline for a validation slice, not proof of market competitiveness.
- Commit and push the public repo after each verified work-package checkpoint; review the staged file list and keep `.local/` out of every push.
- After every meaningful work session, update this ledger and [restart context](restartcontext.md), then regenerate and check HTML for any changed documentation Markdown.

# Bounded implementation handoff after architecture review

**Status:** CF-0.3 queue in progress · 2026-09-20. A1 is complete; A2 has a
synthetic local receipt; A3 is in progress and A4–A5 are pending. Resume at A3 using the
root `WORKLIST.md`; do not repeat a broad research survey or build a platform shell.

The [A1 compatibility receipt](../technical-design/a1-compatibility-receipt.md)
records the minimum wire slice. The [A2 preparation receipt](../technical-design/a2-preparation-receipt.md)
records the current integrated-candidate boundary and unsupported semantics.

## Scope and model handoff

Read [the architecture decision](../architecture/architecture-review.md),
[SDK contract](../technical-design/sdk-extension-contract.md) and
[lifecycle/retrieval specification](../technical-design/knowledge-lifecycle-and-retrieval.md).
They refine WP1/WP2/POV, not a second competing project. WP0 authority decisions
apply to private/paid evaluation, not public synthetic implementation.

Sol Medium is a reasonable implementation choice for these specified, testable
tasks. This is an engineering recommendation, not a measured model comparison or
quota estimate. [Official Sol model documentation](https://developers.openai.com/api/docs/models/gpt-5.6-sol)
lists medium reasoning support. Keep stronger review for a genuinely new contract,
identity/resolution or security decision and the final utility verdict. Test failures
within an existing design are normal implementation work, not automatic escalation.

Each task ends with tests, doc/HTML updates, checked worklist evidence, refreshed
restart context and a reviewed Git checkpoint. Continue to the next independent
task without asking merely because a deliverable completed. Stop only for missing
authority, material product ambiguity or a demonstrated design contradiction.

## A1 — Freeze the minimum extension and evidence slice

**Purpose:** make the SDK extensible before additional built-in scanners entrench
the nine-kind/Java-TypeScript limitation. This is a narrow schema revision, not
completion of every enterprise WP1 contract.

**Work:** inventory existing exports and dependent checks in `packages/contracts`.
Add versioned installed adapter/kind profiles, standard descriptor projection,
language-independent identity/reference validation and minimal `source.artifact`.
Specify finite size/depth/message limits as checked configuration. Add producer and
consumer profile negotiation and an explicit provisional-version migration policy.
Generalize only relevant endpoint validation; preserve strict business/test rules.

**Tests:** custom workflow kind accepted only with installed matching profile;
unknown/changed profile rejected; Python-emitted canonical records accepted;
malformed support, duplicate identity, unknown fields and protocol version rejected;
Java/TypeScript legacy fixtures not silently reinterpreted; call cycles versus
evidence cycles distinguished; Unicode byte/range conversion specified.

**Receipt:** exported schema inventory, compatibility matrix, exact migration cases,
portable TypeScript/Python vectors, and a delta to the
[contract-freeze review](../technical-design/contract-freeze-review.md).
**Stop:** if general search requires a core code edit for every adopter kind, A1
has failed CF-R17. Do not freeze unrelated task/policy/CI schemas to unblock A2.

## A2 — Conforming producer runner and one integrated capture

**Depends:** A1's minimum subset. **Packages:** preparation/adapter modules and
conformance tests; retain experimental code under `extractor-spike` until promoted.

Build the bounded process protocol and atomic contribution assembly over reviewed
synthetic input. Demonstrate one independent Python custom-format adapter outside
the core package. Reuse the Java/SQL/TypeScript spikes only after matching their
output to capture-bound locators, family coverage and installed kind profiles.
Add bounded OpenAPI, Markdown, explicit JPA and test-declaration handling needed by
the public cross-layer fixture. Reject remote references and repository execution.

Separate framework route interpretation from Java declarations; resolution must
prove the controller/service target in this small fixture using explicit scope/type
evidence. If the current parser cannot do that, retain unresolved state and introduce
the smallest qualified resolver or approved semantic-index fixture needed. Never
patch in an exact edge because `expected.json` expects it. Expected files are test
oracles and are not runtime inputs. Explicit reviewed business mappings are valid
inputs, frozen separately and disclosed in both baseline arms.

**Tests:** exact source pointers; comments/string decoys; overload/duplicate-route
ambiguity; partial declarations; quoted SQL names; stream truncation/extra output;
timeout/cancel; unchanged deterministic capture. The empty test cannot emit a
passed-run or behavior-coverage claim. Untrusted-adapter sandbox claims are excluded.

**Receipt:** one actual capture -> validated contribution -> resolved/unknown links
-> candidate release trace, plus an adopter example that needs no core changes.
**Stop:** unresolved critical links are not a reason for more unrelated language
scanners. Diagnose their needed evidence or scope the claim down explicitly.

## A3 — Retrieval loop and same-information baseline

**Depends:** A2's integrated candidate. **Packages:** retrieval and local evaluation.
Use an in-memory reference projection; do not introduce PostgreSQL, a vector service
or a paid query model for this slice.

Implement exact/lexical pointer baseline and typed candidate expansion over the
**same** documents, mappings, declarations and searchable descriptors. Implement
orientation, inspect, trace and evidence as library operations with bounded serializable
results; no network listener. Use the specified ranking, concern diversity, path
admission and actual wire caps. Retain the original task separately from instructions.
Expose per-stage receipts and typed error/limit reasons.

**Tests:** API-use versus enhancement packet; critical low-lexical connector;
irrelevant same-name distractor; conflicting/stale rule; unsupported data access;
cycle/edge-budget termination; oversized evidence; ambiguity; stable tie ordering;
no exact-edge manufacture; extension descriptor found without a custom code path.
Test changing a question without changing the graph and changing evidence without
changing the question. A manually curated evidence packet is only an oracle arm.

**Receipt:** stage-loss report and full actual response capture for each scenario;
baseline/typed quality and byte comparisons, including failures. This is mechanical
retrieval evidence, not measured agent productivity.
**Stop:** required evidence lost by selection or serialization must be repaired
before adding semantic search or more preparation. Add a semantic experiment only
if source/extraction are correct and terminology recall is the diagnosed failure.

## A4 — Reviewed investigation walkthrough and utility decision

**Depends:** A3. **Packages:** local integration/evaluation and minimal task state.
Exercise scope correction, per-question sufficiency, changed/missing source binding,
selective reads, findings/design/validation plan and both review checkpoints. Use
versioned local reviewer events marked simulated for deterministic conformance.
Do not build authenticated Studio or claim these events are real human approval.

First run scripted mechanics on public fixtures. Then prepare the bounded real-agent
comparison: identical model/effort/tools, sources and task information; plain search,
pointer baseline and typed packets; fixed criteria and held-outs; separate response
content from guidance. Private sources, external model routing or paid runs wait for
WP0 decisions. Normal implementation may continue on public fixtures while waiting.

**Tests/receipt:** wrong scope corrected and re-reviewed; old map/proposal cannot
advance the task; diagnosis cannot authorize coding; source mismatch is visible;
declared test is not parity evidence; tracked broadening reasons; per-stage trajectory,
missed obligations, source/context cost and reviewer effort. Preserve negative trials.

**Decision:** scripted conformance permits A5, not a productivity claim. Broader
platform investment requires actual comparative utility and the scoped-storage
feasibility gate. Set task-specific quality/cost thresholds before model runs with
the rubric owner; do not invent an accepted business answer or silently call a run
successful because a report was generated. After two diagnosed no-benefit iterations,
choose simplify/change/stop and seek owner direction for material scope change.

## A5 — Refresh correctness and implementation handoff receipt

**Depends:** A2/A3; can proceed on public fixtures if A4's paid/private experiment
is awaiting authority. **Packages:** preparation lifecycle and evaluation.

Start from the full-build oracle. Add contribution replacement, watch-key invalidation,
reviewed-mapping staleness and atomic candidate activation. Full rebuild is an
acceptable initial strategy; claim incremental support only after equivalence tests.

**Tests:** provider added/removed/duplicated; unchanged consumer re-resolved; changed
configuration; deleted files; same-name other service; schema/profile change; stale
mapping; interrupted build and rollback; current-source mismatch; deterministic
semantic parity excluding attempt metadata.

**Receipt:** full/delta or explicit full-rebuild report, refresh/curation costs,
remaining precision/coverage matrix and a local-slice readiness review. This is the
strong-review checkpoint before WP3/WP4: authentication, extraction/publication/query
policy and actual scoped PostgreSQL workload. No serving of private knowledge or
untrusted extensions until their respective security gates pass.

## Existing code disposition

Keep canonical serialization, source-binding tests, evidence support checks and the
bounded parser spikes where they conform. Rework closed kind/language negotiation
and reference validation. Integrate before enlarging scanner coverage. Do not port
private v1/v2 files or infer their license from this repository's Apache-2.0 license.
No existing component test result counts as an A1–A5 acceptance receipt.

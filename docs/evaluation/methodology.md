# Evaluation and acceptance methodology

**Status:** Proposed gates; targets require owner ratification · CF-0.2

## Product hypothesis

ContextFoundry should reduce the effort needed to investigate enterprise software
while preserving or improving accuracy, impact coverage, and evidence quality.
Market leadership is an ambition, not a result established by this design.

## First experiment: isolate retrieval and guidance

Current fixture/split and economical execution order are defined by the
[three-repository dossier](three-repository-benchmark.md). E1 evidence utility precedes
costly broad comparisons. Historical v2 replay is conditional on usable captured
inputs; it is not a prerequisite to implement the validation harness.

The [second-pass validation sequence](validation-sequence.md) adds an evidence-utility
diagnostic, same-information baselines, minimal-guidance control, and early secured
query spike. These checks prevent retrieval tuning from obscuring a missing-value
problem. Include minimal business knowledge before the broad curation UI is built.

Freeze a prepared corpus, source revision, model/configuration, tools/permissions,
task wording, and expected evidence rubric. Keep original story and output instructions
separate. For the content/directive diagnostic use four arms: existing response/directive, revised response only, revised
directive only, and both revised. Then compare compact initial delivery against
progressive operations using the winning content policy. Do not simultaneously add
extractors, a new model, business curation, and a different query engine and attribute
all gains to response changes.

If the original v2 runtime/corpus cannot be safely reproduced, label archived payload
replay as replay. It cannot reproduce live latency. A synthetic proxy is separately
labelled and never presented as the historical experiment. No restricted source or
paid model run is required merely to write or review this plan.

Use at least three matched repetitions per development task to discover variance;
this small sample is exploratory. Randomize arm order, record cache state, use fresh
sessions, and have reviewers score anonymized answers before seeing cost results.
Choose further sample size from observed variance and desired confidence rather
than declaring significance from a small median difference.

## Baselines and task portfolio

Agent-only and agent plus a representative existing code-intelligence tool are
evaluation baselines, not ContextFoundry runtime dependencies. A matched ContextFoundry
arm then tests whether business knowledge and governed retrieval add value.

Development tasks: cross-layer feature impact, business terminology with no code
name, reverse code-to-business explanation, duplicate cross-repository names,
architecture constraint conflict, and a test-impact change. Negative controls include
unrelated requests, missing facts, stale documents, ambiguous APIs, and hidden evidence.
Reserve unseen tasks from another workflow/team before tuning. Paraphrases of exposed
stories are regression tests, not independent holdouts.

Add the simple document/pointer baseline before attributing value to typed graph
enrichment. Keep original enterprise documents and repository guidance available to
all applicable arms. Optional-strategy ablations retain the same two human review
gates and security policy. An agent's access to a historical prompt does not give that
prompt authority. Domain-procedure examples must predate held-out tasks.

## Metrics

| Dimension | Measurement |
|---|---|
| Preparation | Declared supported coverage, missing facts, wrong bindings, update parity, build cost |
| Retrieval | Relevant anchors and connections delivered, irrelevant items, time to first useful evidence |
| Engineering outcome | Critical missed impacts, unsupported claims, correctness, reviewer corrections |
| Agent use | Supplied locations used, justified source verification, redundant rediscovery |
| Context cost | Actual encoded bytes, model-reported input/output, cached subset, estimates labelled |
| Time | Startup, queue, tool latency, agent wall time, reviewer time separately |
| Review conformance | Scope corrections, verified decisions, rejection/silence, plan drift, resume and unauthorized implementation attempts |
| Operations | Scoped latency, concurrency, memory, cancellation, recovery, policy revocation |
| Maintenance | Capture/index/model preparation cost, curation effort, refresh and review burden |

Do not add cached tokens a second time. Token totals are not monetary cost; report
provider prices only when verified for the experiment and calculate cached/uncached
cost separately. Model usage unavailable from a host remains unknown. Count the full
investigation, not just the discovery call. Define redundant discovery by trace review;
reading a mapped method to confirm a transaction boundary is legitimate verification.

## Proposed usefulness gate

On the development portfolio: zero newly missed critical impacts relative to the
adjudicated baseline; no increased unsupported critical claims; and either >=20%
median active-investigation-time reduction or >=20% median uncached-input reduction, without >10%
regression in the other dimension or increased reviewer correction effort. Report
every task, dispersion, and failures—not just the median. These thresholds are initial
go/no-go proposals, not evidence of achieved benefit or universal enterprise targets.
Confirm the scoring rubric and tolerable noncritical differences before running.

Active investigation time includes agent/tool work, not human approval waiting;
report end-to-end elapsed and human labor separately so gates cannot be gamed by
different reviewer availability. Combine this effort gate with the benchmark's
absolute critical-obligation and resolved-task gates. Abstaining on everything is
not a successful low-cost result. Per-task shortfall takes precedence over a favorable
aggregate. Thresholds are proposed pilot decisions, not calibrated market metrics.

Baseline agreement alone is insufficient: independently specify must-find critical
facts and permitted abstentions. A baseline's critical miss does not excuse ours.
Report paired per-task differences with uncertainty when sample size permits. Include
the setup/curation/refresh burden when assessing total enterprise effort.

Repeat on unseen tasks before claiming general usefulness. If two bounded revisions
fail the quality/usefulness gate, stop feature expansion and review selection,
guidance, data adequacy, or product scope. Do not respond by adding more mechanisms
without a failure hypothesis and an isolating experiment.

## Proposed operational gate

Reference test envelope: 8 vCPU, 32 GiB RAM, local SSD, 100k artifacts/1M assertions,
8 concurrent readers with narrow and broad permissions. Target warm unseen search/
inspect p95 <=2 seconds and orientation/trace p95 <=5 seconds; measure startup
separately. These planning numbers require implementation evidence. Response-cache
hits cannot stand in for unseen requests. Capture result quality at each bound.

Target incremental changed-input work without unrelated reparsing; full-build parity
is mandatory even if speed targets fail. Report actual graph size, support density,
disk layout, index size, policy scopes, and concurrent worker activity. Set expansion
targets only after this first envelope is measured.

## Evidence retention

Each run manifest includes code/schema/profile digests, release/source identifiers,
model and parameters, tool definitions, instructions, task ID, policy, environment,
timings, output, score rationale, and available usage receipts. Protect trajectories
as enterprise content. Publish only synthetic/public examples and permitted aggregate
results. Preserve failed attempts to avoid selecting only favorable outcomes.

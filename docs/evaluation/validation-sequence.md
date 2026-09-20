# Validation sequence before broad implementation

**Status:** Proposed experiments, not executed · 2026-09-20

## Purpose

Turn the second research pass into falsifiable decisions. Begin with frozen inputs
and a small harness; do not wait for Studio, connectors, or all six retrieval tools.
This sequence supplements the [methodology](methodology.md), not a new success claim.

## E0 — Freeze evidence and fair comparisons

Use the private [three-repository fixture](three-repository-benchmark.md) with code,
API/schema, tests, business rules and architectural constraints, plus a separate
synthetic conformance corpus. Reserve a second workflow before tuning. Include
questions whose answers require enterprise-only meaning, code-only controls,
ambiguous or stale facts, and questions that correctly have no answer.

All comparison arms receive access to the same authorized underlying code and
documents. The ordinary agent baseline can read/search those documents. Include a
simple document-search baseline and a representative code-intelligence baseline
when available; record unsupported modalities rather than starving a baseline of
information. A code-only arm is diagnostic, not the headline comparison.

Freeze task text, model/effort, host/tool definitions, source revisions, permissions,
rubric and cache conditions. Count manually authored mappings and document cleanup
as preparation labor. General-purpose business mappings must predate held-out tasks.

## E1 — Is the missing enterprise evidence useful?

Use a reviewer-selected compact evidence packet as a diagnostic upper-bound aid,
compared with normal agent access to the same sources. Reviewers select evidence
without supplying the expected answer. Score correctness, critical omissions,
unsupported claims, investigation effort and reviewer corrections.

This oracle-like arm is privileged selection, not deployable retrieval and not a
market benchmark. If even useful selected evidence does not help, inspect task
suitability and agent consumption before implementing sophisticated selection.

## E2 — Where is information lost?

For each scored obligation record: source present -> extracted correctly -> candidate
found -> valid connection retained -> necessary evidence delivered -> conclusion used
correctly. Score each step independently. Manually specified truth belongs to the
evaluation harness and must not leak into production matching rules.

Compare exact/lexical/reviewed-mapping retrieval first. Add contextual descriptors,
semantic retrieval, and reranking one at a time only against diagnosed misses.
Record Recall@k and ranking quality at declared budgets, plus task-level critical
evidence recall. More returned items are not automatically a quality gain.

## E3 — Does guidance help, and how should retrieval interact?

Run the fixed-corpus 2x2 content/directive experiment. Then compare the selected
content with minimal optional guidance (tool purpose and trust boundary, no additional
strategy advice). Keep required human review gates and safety policy identical in
every product-conformant arm; old-workflow replay is diagnostic only. Separately compare compact
handoff and progressive delivery under matched overall task limits; neither arm
loses its ordinary source-reading ability.

Record unnecessary rediscovery only after trace review. Test injected instructions
in otherwise relevant evidence and verify both safe handling and retained utility.
Any paid evaluation or model configuration change needs its own explicit scope.

## E4 — Can the secured query implementation support it?

Before a broad platform build, run a disposable PostgreSQL projection spike using
the canonical contracts and an independent authorization oracle. Test 1%, 10%, and
100% visible-resource profiles plus broad endpoint access with hidden supports.
Vary support fan-out/cycles, graph hubs, document size, index cold/warm state,
concurrent extraction, and repeated policy changes. These are fixture dimensions,
not distributions claimed to represent all enterprises.

Capture query plans, examined rows, phase latency, memory, result completeness and
rank. A hidden-distractor metamorphic test adds inaccessible material while holding
visible content fixed; visible results/ranking should not change. Report timing
differences separately rather than claiming universal noninterference. If evaluating
vectors, compare to exact authorized-only search before choosing approximation.

## E5 — Does the end-to-end slice earn its maintenance cost?

Use the methodology's quality-first gate on unseen tasks. Include initial setup,
mapping review, refresh, stale-evidence repair, and access administration effort.
Report per-task outcomes and paired uncertainty; three repetitions are exploratory,
not a statistical proof. A failing baseline does not excuse critical errors: the
reference rubric defines must-find facts independently of baseline answers.

## Deliverables and decisions

For quota discipline, start with the lowest-cost static checks and evidence-utility
diagnostic. The 2x2 v2 replay is conditional on comparable archived payloads; label a
proxy honestly and do not block present-day validation on unavailable history. Worked
domain procedures are a separate knowledge-content treatment, not a reason to enlarge
every agent directive. See [research verdict](../research/design-closeout.md).

Each experiment produces a manifest, run receipts, failure examples, scorecard and
keep/change/stop recommendation. Distinguish a live run from archived replay and
synthetic proxy. E1-E3 can precede M1; E4 must resolve the storage risk by M3. No
full business-review UI is needed to test a small reviewed knowledge set. Broad
architecture/test workbenches wait for E5. Results may reopen any proposed ADR.

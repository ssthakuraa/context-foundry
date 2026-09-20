# Human-reviewed engineering workflow

**Status:** Proposed design · CF-0.2 alignment · 2026-09-20

Implements CF-R03–CF-R11 and CF-R15 in the
[product requirements](../requirements/product-requirements.md).

## Integration design

Deliver a versioned agent skill/workflow package with a small local binding helper
and authenticated retrieval client. These are proposed artifacts, not installed
plugins. The package has host-specific configuration but common task/map/proposal
contracts. Do not build a competing agent orchestrator. The initial host renders
reviews in conversation; Studio supplies durable review pages where needed.

The agent can call retrieval tools in any useful order within a stage. This freedom
does not remove the user-review checkpoints. Retrieval granularity and workflow
approval are separate decisions.

## Task state and artifacts

States: mapping -> scope_review -> investigating -> proposal_review -> implementing
-> validation_review -> completed. Inquiry/diagnosis branches can end with findings
after investigation. Needs_input, cancelled and rejected outcomes are explicit.
Artifacts are append-only versions; state changes use expected_version and audit.

| Artifact | Required content |
|---|---|
| Task | Original request, origin, intent, user constraints, task owner, selected packs |
| Investigation map | Interpreted concerns, business/product scope, evidence-backed relationships, logical file pointers, relevance, known gaps, release set |
| Scope decision | Human reviewer, map digest, accepted/corrected scope, supplements, timestamp |
| Sufficiency assessment | Question, available evidence, sufficient/inspect/unresolved judgment, rationale, intended file sections |
| Findings | Observed source identity/digests, conclusions, contradictions, evidence and unresolved risks |
| Proposal | Findings/impact, design, touched areas, execution steps, tests, risks, assumptions, baseline, exclusions |
| Implementation decision | Human identity, proposal digest, permitted actions/scope, validity and revocation |
| Completion record | Proposal linkage, changed locations, checks/results, deviations and residual risks |

Human additions are task-local assertions with attribution. Promoting one to shared
business knowledge needs separate evidence and publication review. A suggested file
does not become known-relevant until assessed, and does not grant filesystem access.

## Gate semantics

Gate 1 precedes deep implementation reading. Mapping can use prepared descriptors,
contracts, docs and bounded location/freshness checks; reading whole service bodies
to preempt the review defeats the purpose. Show missing/ambiguous areas for review.
An added area changes the map version; confirm the resulting scope, not an older map.

After Gate 1, read the smallest coherent section that can answer a question. Include
surrounding control flow, types and callers when necessary; tiny snippets are not
always sufficient. Ordinary dependencies within approved scope need no per-file
approval. A new product, security boundary, major behavior or write scope returns to
scope review. Record stale-source corrections and their implications.

Gate 2 requires explicit implementation authorization for the exact proposal. A
design approval without permission to code is recorded separately. Resume after
interruption rechecks task state, approval validity and relevant source fingerprints.
Any proposal revision invalidates its approval. Relevant source drift requires
reassessment and refreshed review before continuing affected implementation.
Neither approval authorizes commit, push, merge, deployment or destructive work.

## Human identity and host assurance

Guided mode pauses and asks in the host conversation. If the host cannot provide an
authenticated human event, a copied confirmation is labelled host-reported, not a
verified platform approval. Durable verified decisions use Studio's authenticated
review page or a validated host human-action channel. A delegated agent credential
may submit drafts and read decisions but cannot approve its own artifacts.

Enforced mode requires host tool mediation for stage-appropriate reading and writes;
it cannot be implemented by prompt text alone. Publish a host capability/conformance
matrix at implementation. Initially support guided mode with verified review receipts;
do not promise enforced mode on every host. A service-issued receipt attests a
decision, not that an unmediated external agent obeyed it.

## Local source binding

Keep logical source IDs in the server and absolute workspace roots local. A user
registers a source-ID-to-root mapping. The local helper canonicalizes paths, rejects
absolute/traversal escapes and symlinks outside allowed roots, and checks access.
Duplicate mappings require disambiguation. Repository name alone is not identity.

Git adapters may report commit and dirty-file digests. Other source systems report
snapshot/view identity and content digests through a read-only adapter. Unknown
revision is explicitly unknown, not silently current. Changed lines are re-located
by symbol plus digest checks; do not trust stale line numbers or silently select
another same-named file. Missing local sources prompt a binding request or authorized
fallback; never auto-clone, switch source views or fetch credentials.

Read files with existing host tools. Persist only permitted locator/read receipts by
default, not local source bodies. Uncommitted content is not automatically uploaded
or published. Source findings can be task-local without changing the active pack.

## Acceptance scenarios

Test API consumption without deep reading; enhancement requiring service inspection;
human-added cross-product scope; diagnosis ending without writes; rejection/silence at
both gates; a forged agent approval; proposal changes; revoked approvals; resume with
dirty/stale source; missing roots; path escape; and a material discovery during coding.
Measure useful file navigation, unnecessary reads, reviewer effort and final correctness.
Conformance must distinguish instructed behavior from host-enforced boundaries.

# Task, review and agent-integration contracts

**Status:** Implementation specification for the validation slice · CF-0.2

Implements CF-R03–CF-R11, CF-R13 and CF-R15. Product semantics are defined by the
[human-reviewed workflow](../design/human-reviewed-engineering-workflow.md).
All shapes below become strict first-party JSON schemas and conformance fixtures
in WP1; they are not claims of existing endpoints.

**WP1 implementation note (2026-09-20):** `TaskArtifactSchema` checks the canonical
body digest and immediate prior version. Strict body schemas exist for all five
artifact kinds. Scope candidates carry a relevance reason and evidence/hypothesis
basis, and `inspect_source` assessments identify planned evidence-linked reads.
Findings distinguish claim types and require read-receipt references for
source-observed claims; proposals and completions retain plans, checks and risks.
Body evidence references must also be declared on the artifact envelope.
The proposal and completion bodies use exact `{artifact_id, version, body_digest}`
references. `checkTaskArtifactReferences` rejects duplicate kind/version pairs,
broken version chains, wrong-kind/missing/cross-task references and digest drift.
An artifact ID is stable across versions of one kind within a task. This check
does not establish that a proposal was approved; authenticated task-state authority,
read-receipt authenticity, validation-run authenticity and human review decisions
remain unimplemented.

## Task aggregate

Task fields: task_id, owner_subject, intent, request_origin, original_request_ref,
selected_pack_ids, release_set_id, phase, wait_reason, task_version, created_at.
Intent is inquiry, consume_api, diagnose, impact_analysis or implement_change.
Original text is immutable; clarifications are attributed append-only inputs.
Request origin is human_ui, verified_host, imported_ticket or agent_submitted.
Only authenticated trusted channels may claim the first three origins.

Artifact envelope: artifact_id, task_id, kind, version, body_digest, previous_version,
created_by, origin, created_at, schema_version, release_set_id, evidence_refs,
visibility_requirements and body. Versions are immutable. Human supplements are
task-local assertions; only a separate release review can publish reusable knowledge.
The initial contract uses one artifact ID per task/kind series, monotonically
versioned. A proposal binds to an exact findings version and a completion binds to
an exact findings version plus an exact approved-proposal version when it reports
source changes. The task service must still verify that proposal's approval receipt.

## Artifact bodies

| Kind | Body fields |
|---|---|
| scope_map | Questions/intent, product/flow scope, candidate entities/locators, relevance reasons, assumptions, constraints, unknowns, source fingerprints, material-scope boundaries |
| sufficiency | Question ID, intended action, judgment (sufficient, inspect_source, unresolved), evidence refs, rationale, planned local reads, open questions |
| findings | Claims with evidence and claim type, read-receipt refs, contradictions, impacts, unresolved obligations, current source fingerprints |
| implementation_proposal | Findings ref, design/options as needed, affected areas, ordered steps, permitted action request, exclusions, validation obligations, risks, rollback approach, source fingerprints |
| completion | Findings ref; approved proposal ref required for implementation tasks; actual changes if any, check/run refs including skips, deviations, residual risks and requested final review |

Evidence-backed links and task-authored assertions are distinct. A proposal cannot
claim that cited tests passed without a valid run receipt. API-consumption findings
need not include a design or code-change plan.

## State transitions

| From | Event / required authority | To |
|---|---|---|
| mapping | Submit map with expected task version | scope_review |
| scope_review | Verified human accepts exact map version | investigating |
| scope_review | Reject/request changes; reasons preserved | mapping |
| investigating | Material scope expansion; new map | scope_review |
| investigating | Submit findings; non-implementation intent | validation_review |
| investigating | Submit implementation proposal | proposal_review |
| proposal_review | Verified human authorizes exact proposal and action scope | implementing |
| proposal_review | Design accepted without coding authority | proposal_review |
| proposal_review | Reject/request changes | investigating |
| implementing | Material source/plan change or revoked decision | investigating or scope_review as appropriate; writes must pause in conforming host |
| implementing | Submit completion and validation evidence | validation_review |
| validation_review | Human accepts outcome | completed |
| any nonterminal | Authorized owner cancellation | cancelled |

Missing input is wait_reason on the current phase, not an implicit approval. Rejection
is a decision outcome, not an unrecoverable task. Reopen completed tasks through a new
linked task. Generic context tools remain usable outside tasks; the service cannot
therefore enforce all stage-specific source reads on an independent host.

## Decision authority and concurrency

Decision fields: decision_id, task_id, gate (scope, implementation, completion),
artifact_ref/version/digest, outcome, reviewer_subject, authority_kind,
permitted_actions/scope where relevant, expected_task_version, issued_at and optional
expires_at. The server sets identity/time/authority from the authenticated channel.
Revocation is a separate immutable event; callers cannot edit a receipt.

Verified human decisions require an authenticated human session with the appropriate
task action, task visibility and referenced-evidence access. An agent token acting on
behalf of that human is still not a human approval channel. No request-body boolean,
quoted chat message, role string or agent-generated receipt can grant authority.
Host-reported confirmations may be stored as unverified annotations but cannot drive
verified transitions. Initially use the minimal Studio review page for both gates.

In one transaction, lock/check task_version, verify current artifact digest, policy
and nonrevoked decisions, append event and increment task_version. A different body
with the same idempotency key returns CONFLICT. Identical authorized retries return
the original receipt. Updating a map invalidates dependent scope/proposal approvals;
updating a proposal invalidates its implementation approval. Completion records may
be appended without rewriting the approved proposal. Source changes require an agent
reassessment; the server only knows submitted fingerprints, not live local edits.

## HTTP and MCP operations

All routes below are relative to /api/v1 and use common authorized application services.

| Route | Authority and semantics |
|---|---|
| POST /tasks | task.create; server binds origin/owner; never accept arbitrary principal grants |
| GET /tasks/{id} | task.read plus full artifact visibility; status and authorized references |
| POST /tasks/{id}/artifacts | task.write; draft kinds above, expected_version and idempotency key |
| POST /tasks/{id}/decisions | Human task.review_scope, task.approve_implementation or task.review_completion; exact artifact digest |
| POST /tasks/{id}/decision-revocations | Human task.revoke_decision grant plus task-owner or original-reviewer identity; invalidate affected authority and audit |
| POST /tasks/{id}/cancel | task.cancel; owner or explicit grant |
| GET /tasks/{id}/decisions/{decision_id} | task.read; current receipt validity under current policy |

Initial MCP adds cf_task_status for authorized read-only status. Draft submission is
via authenticated HTTP/CLI helper; the MCP read-only boundary is unchanged. No MCP
approval tool is exposed. Studio reviews use the same decision service and CSRF-protected
session flow. Receipt IDs are references, not bearer capabilities.

## Storage and information protection

Operational tables: task, task_artifact, task_event, task_decision, decision_revocation,
task_input and optional local_read_receipt. Unique (task_id, kind, version); artifact
digest binding and task-version CAS are mandatory. Private task bodies stay out of
released knowledge and search by default. Backup/retention covers these tables.

Task and artifact visibility intersects task membership/action grants with all
support dependencies. Initial implementation denies a whole artifact if a dependency
is unavailable rather than attempting inference-prone partial redaction. Loss of
access can make an old decision unreadable/nonusable but cannot grant the agent new
access. Audit records expose only authorized metadata. Do not serialize hidden names
in errors. Plaintext stories and local paths do not belong in URLs or default logs.

## Host integration package

Ship a small versioned workflow guide, schemas, retrieval client and local locator
helper, not another reasoning engine. It presents the map, waits for Gate 1, assesses
per-question sufficiency, reads current sources, drafts findings/proposal, waits for
Gate 2, and records completion. It polls task status only when useful to resume; no
background autonomous coding or repeated expensive context reload is required.

Initial conformance is guided with verified decisions: checks demonstrate the guide
and client honor gates, but arbitrary host tools remain outside server control.
Enforced mode is a later host-specific capability. A host matrix records source reads,
human-event authentication, write mediation, resume behavior and usage visibility.

## Required negative cases

Reject stale digest/version approvals, agent self-approval, reused decision on another
task, expiry/revocation, replay under another identity, concurrent conflicting edits,
unsupported artifact kinds and hidden evidence. Exercise silence/rejection, diagnosis
without writes, source drift, mid-implementation scope expansion and interrupted
resume. Report TASK_STATE_CONFLICT, REVIEW_REQUIRED or APPROVAL_STALE only after task
visibility checks; otherwise use NOT_FOUND_OR_NOT_VISIBLE.

# Studio user experience

**Status:** Proposed for review · CF-0.2

## Navigation

Studio offers Tasks, Packs, Explore, Architecture, Test Impact, Jobs, and Administration.
Visible navigation follows effective capabilities; every action is still checked by
the backend. Pack counts and search suggestions include only visible resources.
The header shows the active pack/release and freshness. Clearly distinguish a
candidate review from the active served release.

## Core screens

| Screen | Primary user task | Required content |
|---|---|---|
| Pack overview | Determine readiness | Owner, release, source coverage, freshness, unresolved diagnostics |
| Source configuration | Define extraction scope | Logical roots, supplied revision, adapters, exclusions, secret reference |
| Candidate review | Decide whether to release | Added/removed/changed facts, mapping changes, gaps, validation and policy results |
| Explore | Resolve an engineering question | Concern-grouped results with evidence drawer and targeted expansion |
| Business mapping | Review an association | Source passage beside artifact evidence, alternatives, approval rationale |
| Task scope review | Confirm the investigation target | Original request, interpreted map/version, local-source pointers, gaps and human additions |
| Implementation review | Authorize or reject an exact proposal | Findings, design, affected areas, steps, validation obligations, exclusions and explicit coding authority |
| Task completion | Review outcome and residual risks | Approved proposal, deviations, executed/skipped checks and unresolved behavior |
| Architecture review | Compare proposed options | Baseline, constraints, proposed changes, tradeoffs, evidence and review state |
| Test impact | Decide validation scope | Affected tests/behaviors, relation reasons, actual execution evidence and unknowns |
| Job detail | Diagnose preparation | Stage progress, resource usage, retry/cancel, sanitized diagnostics |
| Access administration | Manage effective grants | Principal/group, action, resource scope, expiry, policy history |

## Interaction detail

Explore begins with the user's question and a list of useful starting points. Selecting
a result opens its evidence drawer without losing query state. The drawer shows origin,
revision, review, freshness, and relevant passage. Expanding connections records the
selected relation and direction; a bounded diagram accompanies an accessible table.
Graph degree is never presented as certainty of impact.

Candidate approval and activation are separate controls. The confirmation identifies
the exact candidate digest and policy decision. A newer candidate invalidates an old
approval; optimistic concurrency prevents two reviewers silently overwriting decisions.

Saved architecture and test assessments use explicit Save actions. Reading evidence
does not silently publish analysis or add a business mapping. Export requires separate
permission and a current access check on all included material.

The first slice needs only minimal authenticated scope/proposal review pages and
task status, alongside conversation rendering of the same artifacts. It does not
wait for full Studio navigation or authoring tools. Reject/request changes is distinct
from approval; design acceptance alone is distinct from coding authorization. New
artifact versions visibly invalidate prior decisions. Plain conversation confirmations
without trusted human provenance are not displayed as verified platform approval.
See [task contracts](../technical-design/task-and-review-contracts.md).

## States and accessibility

Every list handles loading, empty authorized result, stale data, unavailable service,
partial coverage, work-limit exhaustion, and conflicting evidence. A missing or hidden
resource has one non-disclosing presentation. Job failure shows a correlation ID and
next operator action rather than internal paths or secrets.

Use keyboard focus management, semantic headings, labelled forms, contrast-tested
tokens, and table alternatives to diagrams. Evidence state must have text, not color
alone. Narrow screens stack evidence and results; wide tables scroll within their own
container. Browser navigation preserves filters but excludes sensitive story text
from shareable URLs unless explicitly saved and authorized.

## Browser acceptance journeys

Test a maintainer configuring a source and reviewing a candidate, an engineer tracing
a result into evidence, an unauthorized user attempting direct API/navigation access,
and a reviewer comparing a proposal with its baseline. Repeat core journeys using
keyboard only and at 390px/1440px widths. Reload, expired sessions, stale revisions,
cancelled jobs, and revoked export permission must remain understandable.

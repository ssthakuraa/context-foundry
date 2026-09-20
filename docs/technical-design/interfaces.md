# API, MCP and CLI contracts

**Status:** Proposed interface specification · CF-0.2

## Surface and transport

HTTP routes use /api/v1. MCP exposes read operations through the same application
services; administrative changes initially use UI/HTTP/CLI. The CLI is an API client
for enterprise actions. Local validate/import-preview commands operate only on
explicit files and do not activate releases. REST and MCP share response semantics,
not necessarily identical transport envelopes.

| HTTP operation | MCP tool | Essential request |
|---|---|---|
| POST /context/orient | cf_orient | task_ref or submitted requirement, concerns, scope preferences |
| POST /context/search | cf_search | query, allowed kind filters, scope preferences, page limit |
| POST /context/inspect | cf_inspect | qualified entity, requested facets |
| POST /context/trace | cf_trace | starting entity, optional target, relation/direction, bounds |
| POST /context/evidence | cf_evidence | evidence references and range/page request |
| POST /context/impact | cf_impact | change-set reference, relation categories, requested test scope |
| GET /packs | cf_list_packs | authorized pagination only |
| POST /packs/{id}/jobs | None initially | approved source manifest/configuration, expected version |
| POST /candidates/{id}/reviews | None initially | decision, rationale, candidate digest |
| POST /packs/{id}/activations | None initially | release digest, expected active version |
| POST /architecture/proposals | None initially | baseline, structured proposal and evidence |
| POST /validation/runs | None initially | signed/authenticated CI evidence receipt |
| POST /semantic-indexes | None initially | bounded index artifact, source manifest, producer receipt |
| POST /sources/{id}/publications | None initially | captured digest set, audience, owner approval, expected version |
| POST /sources/{id}/withdrawals | None initially | authorized withdrawal reason and expected version |
| GET /tasks/{id} | cf_task_status | authorized task identity; artifact/decision status |
| POST /tasks | None initially | original request and intent; origin/owner set by authenticated channel |
| POST /tasks/{id}/artifacts | None initially | draft map/findings/proposal/completion, digest and expected version |
| POST /tasks/{id}/decisions | None | verified human decision on exact artifact; never agent-token approval |

## Query envelope example

Illustrative contract, not an implemented endpoint:

```json
{
  "contract_version": "0.2.0",
  "task_ref": "task:123@1",
  "questions": [{"id": "q1", "text": "Where is the billing preference captured?"}],
  "scope": {"pack_ids": ["billing"]},
  "limits": {"max_bytes": 16384},
  "cursor": null
}
```

No request accepts a principal, role grant, physical source root, SQL expression,
arbitrary extractor command, or privileged policy override. Client limits only
narrow server limits. Agent-submitted requirements are labelled as submitted;
trusted task references bind to immutable host records. Output instructions belong
to the agent conversation or proposal request, not retrieval requirement text.

## Response envelope

```json
{
  "contract_version": "0.2.0",
  "request_id": "request:456",
  "release_set": "release-set:17",
  "status": "partial",
  "results": [{
    "entity_id": "repo:billing:symbol:Cycle.start",
    "reason": "Declared cycle creation entry point",
    "evidence_refs": ["ev:12"],
    "locator": {"source_id": "billing", "snapshot_id": "capture:17", "revision_kind": "supplied_snapshot", "revision_value": "r17", "path": "src/cycle.ts", "file_digest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "start_line": 42, "end_line": 78},
    "origin": "source_declared"
  }],
  "gaps": [{"code": "COVERAGE_PARTIAL", "question_id": "q1"}],
  "continuation": null,
  "limits": {"truncated": false, "encoded_bytes": 0}
}
```

The example's file digest and encoded_bytes are illustrative placeholders, not actual
source validation. Implementation computes final encoded
size including metadata consistently, with a fixed-point sizing pass if necessary.
Result status describes delivery/coverage, never successful semantic completion of
the user's task. Evidence reads reauthorize every locator; identifiers are not bearer
capabilities. No result emits hidden object names/counts through gap explanations.

Task artifact/decision bodies, revocation/cancel routes, current-state reads and
human-only decision authority are specified in [task contracts](task-and-review-contracts.md).
Local absolute roots never appear in retrieval requests/results; resolve logical
locators using [source binding](extraction-and-source-binding.md). Generic retrieval
does not require a task; task-stage enforcement is a conforming integration behavior,
not a claimed restriction on independent host tools.

## Authentication and authorization

Limit metadata distinguishes output/page/work limits and coverage gaps; a null
continuation does not imply completeness. Semantic-index imports require a dedicated
ingestion grant and validated provenance; publication needs a separate data-owner
grant. Both enter review before activation. Withdrawal updates the access epoch
immediately and schedules storage cleanup independently.

Browser login uses OIDC with secure server-side sessions, HttpOnly/Secure cookies,
CSRF protection for mutations, and allowed redirect/origin checks. API/CLI machine
tokens have issuer/audience/expiry validation and explicit action/resource grants.
MCP HTTP authorization follows the published protocol profile, including resource
metadata and audience-bound access. Do not reuse arbitrary upstream provider tokens
as ContextFoundry credentials. Pin the supported protocol version at implementation.
[MCP authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization).

STDIO is initially a local client proxy to the authenticated service. Offline demo
STDIO may expose synthetic packs under OS ownership; it must not be described as
enforcing enterprise policy for arbitrary local files.

## Mutations, export and compatibility

Mutations use expected_version and Idempotency-Key; retries return the original
receipt or a conflict for a different body. Review creates an immutable decision,
not an edit of the approved candidate. Exports are jobs with a frozen content set,
current-policy checks before generation and download, expiry, and audit. A revoked
artifact cancels download eligibility even if the export has already been built.

Unknown request fields fail validation. Additive response fields are permitted
within a major version; clients ignore unknown optional fields but reject unknown
required variants. First-party route schemas are versioned application assets.

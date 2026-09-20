# V2 research and implementation disposition

**Status:** Reviewed input; recommendations proposed · CF-0.1

This historical disposition remains evidence. See [CF-0.2 design closeout](design-closeout.md)
for the current research verdict and implementation boundary.

## Evidence boundary

The local engineering-knowledge-pack-sdkv2 archive supplied by the owner contains
research, architecture, implementation, tests, and evaluation reports. It is reference
material, not ContextFoundry's active worklist. Its instructions to resume or stop
work govern that historical project, not this new design effort. Several supplied
reports are labelled 2026-09-20; this review preserves their labels without claiming
independent verification of their chronology. Runtime measurements were not reproduced.

Reviewed source areas include discovery-service.js, discovery-runtime-v2.js,
discovery-response-v2.js, business-map.js, interface-bridge.js, typed-paths.js,
serving-projection-v2.js, discovery-http-server.js, and targeted preparation/retrieval
tests. This is selected source inspection, not a full code or security audit.

## Disposition register

| V2 artifact/design | ContextFoundry disposition | Verification before reuse |
|---|---|---|
| Repository, owner, pack, checkout identities | Carry forward concepts | Duplicate-name/cross-repo fixtures |
| Canonical records and source anchors | Carry forward concepts | Serialization, evidence and revision checks |
| Technology adapter contracts | Adapt into isolated worker interface | Supported-format coverage and hostile input fixtures |
| Interface provider/consumer resolution | Carry forward algorithm principles | Ambiguity, versions, identical routes, hidden supports |
| Incremental contributions and reverse invalidation | Carry forward principles | Full/delta parity across changed and deleted providers |
| Business Map | Adapt and extend | Existing code is reviewed phrase-based nomination; full document/reverse lookup needs implementation |
| Evidence authorization | Adapt | Existing host scope/shared-token boundary is insufficient for per-user enterprise access |
| Typed paths and entry-point selection | Retain as candidate mechanisms | Useful connectors, irrelevant hubs, paraphrases, actual output quality |
| One public discovery tool | Reopen | Fixed-corpus compact-handoff vs progressive comparison |
| Large evidence/contract payload | Rework | Detail-on-demand with no false completeness |
| Prompt directives | Rework | Independent directive experiment and observed agent behavior |
| Session/accounting machinery | Adopt only needed receipts | Do not introduce an agent runtime simply to collect metrics |
| Evaluation reports/tests | Preserve lessons and test patterns | Historical exposed stories cannot become held-out claims |

Conceptual reuse does not authorize copying proprietary source or product data into
the public repository. Before any literal code reuse, establish provenance and
redistribution authority; otherwise implement independently from the documented
design. No reference SDK source has been copied into ContextFoundry in this phase.

## What the failure does and does not show

The supplied retrospective reports 283,634 bytes of discovery output, 44 components,
49 connections, 37 files, 60 evidence units, and 41 subsequent shell commands. Reported
time was 552.5 seconds versus 415.6 seconds historically; total tokens 4,519,618 versus
2,234,119. Different models were used, so this is not a controlled causal comparison.
The latency RCA separately reports a repaired actual-scope MCP cache miss around
31.63 seconds. Neither figure is a ContextFoundry measurement or target.

The integrated-design report describes relevant corpus components being lost at
anchor/path selection. This supports prioritizing retrieval/content/guidance tests
with a fixed corpus. It does not establish universal corpus completeness or prove
that one-call interaction alone caused failure. More tools and smaller outputs also
require evidence of value. Useful source verification must not be scored as waste.

Reference archive files: docs/edkp-failed-design-retrospective-2026-09-20.md,
docs/edkp-research-backed-decisions-2026-09-17.md,
docs/edkp-integrated-design-freeze-2026-09-17.md,
docs/postv2enhancment.md, docs/architecture-v2.md, docs/technical-design-v2.md,
docs/tests/edkp-v2-email-postfix-evaluation-2026-09-20.md, and
docs/tests/edkp-v2-discovery-rca-design-2026-09-20.md. These archive-relative identifiers
are recorded rather than copying restricted reports or adding broken public links.

## External ideas to borrow

| Reference | Mechanism worth studying | ContextFoundry boundary |
|---|---|---|
| GitNexus | Process-grouped search, separate context/impact/trace operations | Qualified identity and enterprise authorization remain explicit |
| Codebase Memory MCP | Focused structural queries, directional tracing, pagination | Compact response does not imply complete business impact |
| Graphify | Scoped subgraphs, relationship explanation, mixed code/document evidence | Inference remains separate from declarations and review |
| GraphRAG | Entity-to-text-unit mappings and local evidence selection | No hidden query-time answer generator; model-assisted preparation is optional |

Public repository/docs pages were checked during this design session. These are
mechanism references, not installed providers or reproduced benchmarks. V2 also
records pinned historical revisions; current project pages may differ.
[GitNexus](https://github.com/abhigyanpatwari/GitNexus),
[Codebase Memory MCP](https://github.com/DeusData/codebase-memory-mcp),
[Graphify](https://github.com/Graphify-Labs/graphify),
[GraphRAG local search](https://microsoft.github.io/graphrag/query/local_search/).

## Follow-up source study

The [second pass](second-pass-assessment.md) reopens selected pinned external code
paths and v2's response validator/latency RCA. It confirms useful mechanisms while
retaining the distinction between historical reports and reproduced results. Some
historical line ranges do not match the reopened function locations; use commit,
path and function names rather than relying on those ranges alone.

Before implementing each borrowed algorithm, pin a revision and document the selected
call path, data prerequisites, failure/truncation behavior, and evaluation assumptions.
Write ContextFoundry conformance fixtures from the desired behavior, not copied
benchmark answers. Open-source research informs independent implementation; it does
not justify importing an entire platform as a runtime dependency.

# Architecture overview

**Status:** Bounded implementation baseline · **Design baseline:** CF-0.3 · **Date:** 2026-09-20

Start with the [architecture review and decisions](architecture-review.md) for the
current verdict, design walkthroughs and scope. The arrangement below describes
the shared product; an offline reference slice proves utility before deployment.

The detailed component boundaries, release lifecycle, and agent interaction are
specified in [system architecture](system.md). Read this overview first, followed
by the [technology stack](technology-stack.md) and
[technical design](../technical-design/system.md).

ContextFoundry is a single-enterprise deployment composed of independently
testable planes.

```text
Enterprise sources and systems
          ↓
Authoring and extraction plane
          ↓
Versioned knowledge-pack release
          ↓
Serving and policy-aware context plane
          ↓
UI · CLI · API · MCP · agent integrations
          ↓
Architecture proposals · test impact · validation evidence
```

## Planes

### Authoring and extraction

Reads explicitly authorized source snapshots and enterprise metadata. It
produces candidate facts, relationships, diagnostics, and provenance. It does
not silently broaden source scope or publish directly to serving.

### Canonical knowledge

Stores the reviewable pack release in Git-compatible JSON, JSONL, Markdown, or
equivalent portable formats. This is the authoritative representation.

### Serving and retrieval

Builds disposable projections for lexical search, exact lookup, relationship
navigation, and bounded context delivery. Every operation passes through
authorization before results are returned.

### Agent integration

Exposes stable operations through the CLI, API, and MCP, plus a local source-binding
helper and versioned workflow guide. The service supplies evidence/navigation; the
existing agent authors findings and plans after human scope review. Implementation
requires a separate version-bound human decision. No competing agent orchestrator
or server enforcement of independent host tools is implied.

### Architecture and verification

Consumes current-state context to produce proposed target architectures,
change-impact views, test-impact analysis, and validation reports. Proposed
outputs remain separate from canonical observed facts.

### Security and control

Authenticates human and machine principals, evaluates policy, records audit
events, and applies authorization consistently across UI, API, MCP, CLI,
extractors, and source providers.

## Deployment principle

The default deployment boundary is one enterprise installation. It may contain
multiple internal business units and packs, but it does not serve unrelated
enterprises from the same shared instance.

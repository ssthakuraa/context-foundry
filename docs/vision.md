# Vision

**Status:** Proposed product vision · CF-0.2

## Ambition and proof

ContextFoundry aims to lead in trusted enterprise engineering context for existing
AI agents. Its differentiation is the connection between business meaning, actual
implementation, ownership, decisions, and test evidence under enterprise access
controls. Success must be demonstrated through fewer missed impacts, fewer unsupported
claims, lower investigation/review effort, and sustainable knowledge maintenance.
Market leadership is an objective, not a claim about this design-stage project.

Start with one complete preparation-to-investigation workflow including reviewed
scope, selective source reading, a minimal design/validation proposal, and explicit
implementation approval. Then expand architecture and test-impact experiences.
See [evaluation](evaluation/methodology.md) and [execution plan](execution/implementation-plan.md).

## Problem

AI coding agents understand public programming technologies well, but they do
not automatically know an enterprise's private terminology, system boundaries,
ownership, business capabilities, undocumented dependencies, test obligations,
or approved architectural patterns.

That knowledge is distributed across source repositories, architecture
documents, tickets, databases, APIs, tests, runbooks, operational systems, and
the people who maintain them. Without a governed context layer, every agent
and every engineer must rediscover the same relationships.

## Product vision

ContextFoundry builds a durable engineering context layer that lets an
enterprise answer:

> What does this system mean, how is it connected, who owns it, where is the
> evidence, what could be affected by a change, and what remains uncertain?

The platform turns that context into bounded, traceable inputs for AI agents,
architecture work, test-impact analysis, and modernization planning.

## Product principles

1. **Enterprise context is an asset.** It should be versioned, reviewable, and
   reusable rather than recreated in every conversation.
2. **Source and runtime evidence remain authoritative.** ContextFoundry guides
   investigation; it does not replace source, tests, builds, or production
   evidence.
3. **Every material claim is attributable.** Facts retain provenance,
   ownership, freshness, and confidence.
4. **Agents remain responsible for reasoning.** ContextFoundry supplies
   governed evidence and tools; the connected agent chooses how to investigate.
5. **Security is part of correctness.** Unauthorized context must be denied,
   not merely hidden from a user interface.
6. **Open interfaces matter.** Portable packs, extractor adapters and agent
   integrations avoid a mandatory external context-platform dependency.

The [product requirements](requirements/product-requirements.md) define task-appropriate
depth: an API-use answer may need a contract, while enhancement needs current source.
Product specialists and cross-product domain experts supply meaning that code alone
cannot establish. The agent normally already has authorized local project access.
Two human gates confirm investigation scope and then authorize implementation.

## Product boundary

ContextFoundry includes:

- Engineering knowledge-pack creation and validation
- Source and enterprise-metadata extraction
- Provenance-aware relationships and dependency maps
- Search and graph-based context retrieval
- Target-architecture proposals grounded in current evidence
- Test impact analysis and validation-evidence tracking
- Enterprise identity, authorization, policy, and audit controls
- CLI, API, UI, and MCP interfaces

ContextFoundry does not aim to become:

- A general-purpose coding agent
- A code-generation model
- A production deployment system
- A replacement for CI or test execution platforms
- An automatic code-conversion factory
- A managed consulting or engineering service

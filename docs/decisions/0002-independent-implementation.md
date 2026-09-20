# ADR 0002: Independent implementation informed by existing systems

**Status:** Accepted product direction; implementation details proposed

## Decision

ContextFoundry borrows researched mechanisms from v2, GitNexus, Codebase Memory MCP,
Graphify, and GraphRAG, implementing its own preparation/retrieval behavior. These
systems are not installed as runtime code-intelligence providers. Conventional
libraries for parsing, transport, identity, storage, and UI are permitted.

## Rationale and consequences

The owner explicitly chose design reuse rather than provider integration. This gives
ContextFoundry control over enterprise semantics, evidence representation, and access
policy, but creates maintenance responsibility for selection/traversal algorithms.
Pin source studies and preserve each mechanism's prerequisites and workflow context.
Benchmarks from other systems do not transfer automatically. Evaluate them separately
as baselines where appropriate. Literal source reuse requires provenance/permission
review and is not authorized by this conceptual decision.

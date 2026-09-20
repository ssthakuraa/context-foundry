# ADR 0005: Validation slice and two-gate implementation baseline

**Status:** Proposed implementation baseline, ready for owner review · CF-0.2

## Decision

Use a private, read-only three-repository fixture: rentalapp for business behavior,
platform for shared libraries, and agentic-platform for cross-product contracts.
Start with maintenance; reserve leasing/renewals for held-out evaluation. Keep a
separate synthetic fixture for distributable tests and security/path failure cases.
No private source or derived corpus is added to the public product repository.

The first slice includes Java/Spring and TypeScript declarations, supported framework
bindings, SQL/Markdown records, reviewed reusable business mappings, task-specific
orientation, safe local locators, two human review gates and minimal proposal/test
obligation artifacts. It does not wait for a rich architecture or test workbench.

Use the stack in [technology choices](../architecture/technology-stack.md). Freeze
contracts before parallel implementation. Follow the narrower
[work packages](../execution/validation-work-packages.md) before the broad milestone
plan. Implement only after the owner authorizes coding; design-closeout approval is
not an authorization for paid runs, publishing, or modifying the fixture products.

## Firm product boundaries

Existing agents own source inspection, reasoning and coding. ContextFoundry owns
controlled retrieval, provenance, task/review artifacts and service authorization.
Local files remain local unless explicitly published. Human review decisions are
version-bound; agent credentials cannot manufacture verified human approvals.
Guided integration is the initial assurance level, not host-enforced tool isolation.

## Reversible hypotheses

Exact/lexical selection is the initial control; semantic retrieval and reranking are
experimental treatments when terminology misses justify them. Graph enrichment must
outperform the simpler document/pointer baseline at sustainable maintenance cost.
PostgreSQL projections must pass correctness and scoped-workload checks. Compact vs
progressive delivery and optional procedural guidance remain measured choices.

## Consequences

Java support increases the first extractor scope, but matches the selected use case.
Limit supported Spring patterns rather than claiming complete Java analysis. No
extractor runs Maven, package scripts, annotation processors, or repository code.
Approved CI semantic indexes may improve precision without becoming a dependency
on another code-intelligence platform. Unsupported behavior remains explicit.

CF-0.2 supersedes earlier TypeScript-only first-fixture and late-core-review sequencing.
It does not retroactively accept other proposed ADRs or assert experimental success.

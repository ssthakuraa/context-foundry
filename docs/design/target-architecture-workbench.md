# Target architecture workbench

**Status:** Proposed

The Target Architecture Workbench helps an engineer turn a requirement and
current-state evidence into reviewed architecture options and a migration
plan. It is an evidence-grounded design surface, not an autonomous code
generator.

## Inputs

- Business requirement or capability goal
- Current-state pack and authorized source evidence
- Technical constraints and approved standards
- Security, compliance, and operational policies
- Existing architecture decisions and patterns
- Risk tolerance and migration constraints

## Outputs

- One or more target-architecture options
- Component and dependency diagrams
- Proposed boundaries and integration contracts
- Migration increments or waves
- Architecture Decision Records
- Risks, assumptions, trade-offs, and unresolved questions
- Evidence references for current-state claims

## Workflow

```text
Requirement
   ↓
Current-state discovery
   ↓
Evidence and constraints review
   ↓
Architecture options
   ↓
Human review and decision
   ↓
Approved ADR and migration backlog
```

The connected LLM may author or explain proposals, but ContextFoundry should
provide the context, policy checks, evidence references, structured output
format, and review workflow.

## Fact separation

The workbench must distinguish:

- Existing system facts
- Deterministic dependency analysis
- Agent-generated proposals
- Human-approved decisions
- Validation results after implementation

An approved target architecture should not overwrite the pack's current-state
facts. It should become a separate, versioned design artifact linked to the
facts that informed it.

## Proposal lifecycle and contract

Lifecycle: draft -> in_review -> approved/rejected -> superseded. Revisions create
new versions; a review references the exact proposal digest and baseline release set.
Source changes mark affected assumptions for re-review. Approval does not activate
implementation changes or alter source facts.

Each proposal contains baseline_release_set, requirement_refs, constraint_refs,
options, proposed_entity_changes, proposed_relationship_changes, assumptions,
tradeoffs, unresolved_questions, validation_plan, and evidence_refs. Options compare
compatibility, ownership, security boundaries, migration sequencing, and operational
cost qualitatively unless numeric estimates have explicit inputs. Standards have
authority, version, applicability, and exception records.

The external agent authors options using retrieved context. Studio imports and
validates the proposal, resolves citations, shows a baseline/proposed delta, and
records review. No internal agent runtime is required. A human may author the same
structure. Missing sources or unvalidated assumptions remain visible at approval.

## Initial usable slice

The core workflow already includes a minimal evidence-backed design/execution/validation
proposal and Gate 2 in WP5/M3. The richer workbench below is a later M5 extension,
not a prerequisite for basic design review. Architecture acceptance never implies
permission to code; implementation authority follows the exact task proposal receipt.

Support a boundary/API change proposal with two options, cited current dependencies,
applicable standards, a migration sequence, and a test-impact link. Render a diagram
and accessible tables. Approval checks provenance and required fields; it cannot
prove that the architect selected the best option.

Accept when a reviewer can trace every current-state assertion, distinguish proposed
relationships, identify policy conflicts, and understand remaining validation work.
Test changed baselines, removed evidence, conflicting reviewers, hidden constraints,
and export permission changes. Measure reviewer corrections and review time alongside
the completeness of generated prose.

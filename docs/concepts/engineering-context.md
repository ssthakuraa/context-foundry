# Engineering context

**Status:** Draft

Engineering context is structured information that helps an engineer or AI
agent understand an enterprise system for inquiry, API use, diagnosis or change.

It may include:

- Business capabilities, domains, and terminology
- Applications, services, libraries, jobs, and data stores
- APIs, events, schemas, tables, and external integrations
- Source files, symbols, declarations, and configuration
- Dependencies and other evidence-backed relationships
- Ownership, lifecycle, repository, and release information
- Requirements, architecture decisions, and test associations
- Known gaps, ambiguity, staleness, and coverage limitations

Engineering context is not a copy of the entire source estate. It is a
compact, navigable map that points an agent toward the evidence it needs.

## Context layers

```text
Business intent
      ↓
Product and domain concepts
      ↓
Architecture and system components
      ↓
Source symbols, data objects, APIs, and tests
      ↓
Validation and operational evidence
```

The layers are related, but they must not be collapsed into one type of fact.
A business label is not proof of an implementation relationship, and a static
dependency is not proof of runtime behavior.

## Context delivery

ContextFoundry should normally return:

- Relevant components and why they matched
- Source locations and revision identity
- Connected components and relationship types
- Ownership and access scope
- Evidence status and known gaps
- Handles for focused follow-up retrieval

It should avoid returning a preassembled source dump as the default. The
connected agent should inspect current source and choose the next operation.

An API-use contract can be sufficient without a full source read. A behavior change
normally needs the actual service/workflow/tests after human scope review. The
agent usually already has local file access; logical locators guide it there directly.
The map reduces discovery, not necessary verification. See the
[knowledge model](../design/enterprise-knowledge-model.md) and
[two-gate workflow](../design/human-reviewed-engineering-workflow.md).

# Knowledge packs

**Status:** Draft

A knowledge pack is a versioned, enterprise-owned release of engineering
context for a product, system, or bounded collection of repositories.

Canonical records are portable; their storage does not require every generated
record or capture to be committed into Git. Small metadata/configuration is suitable
for Git review, while large/private releases use immutable managed storage and
manifest references. See [storage contracts](../technical-design/data-contracts.md).

## Pack contents

A pack may contain:

- A manifest with identity, version, owner, and compatibility information
- Functional scopes and product terminology
- Artifact descriptors
- Typed relationships
- Source-root and revision mappings
- Ownership and lifecycle metadata
- Requirements, architecture, and test associations
- Completeness declarations and diagnostics
- Extractor and provider provenance

Source bodies are not required in the canonical pack. The default design is to
store metadata and revision-bound pointers while allowing authorized consumers
to read source from the enterprise's own source providers.

## Pack lifecycle

```text
Configure → Extract → Diagnose → Validate → Review → Release → Serve
                                      ↑                  ↓
                                      └── Refresh / supersede
```

Generation creates a candidate. Validation and human review are separate from
promotion. A serving index is a rebuildable projection of a released pack,
not a second source of truth.

## Pack ownership

Each pack should declare its owning enterprise domain, maintainers, source
scope, supported extractors, and publication policy. Product semantics belong
to the pack; generic platform contracts belong to ContextFoundry.

## Pack isolation

One enterprise deployment may serve multiple internal packs, but a pack must
not reveal facts, source locations, ownership data, or diagnostics outside its
authorized scope. Pack isolation is enforced by the service layer and policy
engine, not by conventions in the UI.

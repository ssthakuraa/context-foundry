# ADR 0006: Apache-2.0 license for the public product

**Status:** Accepted · 2026-09-20

## Decision

License the public ContextFoundry repository under
[Apache License 2.0](../../LICENSE), as expressly approved by the project owner.
Record `Apache-2.0` in package metadata. The permissive terms and explicit
contributor patent grant are appropriate for an enterprise-facing open-source
product. The [Apache Software Foundation's published license](https://www.apache.org/licenses/LICENSE-2.0.html)
is the source for the repository's exact license text.

## Scope and consequences

This decision covers the material published in the ContextFoundry repository.
It does not grant a license to the separate rentalapp, platform or agentic-platform
repositories, private fixture captures, `.local/` notes, third-party dependencies,
or source whose owner has not authorized redistribution. Keep those materials out
of public commits. Generated HTML review pages follow their Markdown sources.

Any future imported code or assets need their own provenance and license review.
No contributor agreement or trademark policy is established by this ADR.

# ContextFoundry documentation

ContextFoundry gives AI agents governed access to enterprise engineering
context while keeping source systems, authorization, and engineering judgment
inside the enterprise boundary.

## Start here

**CF-0.3 architecture review:** begin with the [review guide](review-guide.md),
[architecture decisions and walkthroughs](architecture/architecture-review.md) and
[next five implementation tasks](execution/architecture-handoff.md).
The bounded design is ready for implementation; executable schemas and parser
spikes are still provisional. No integrated utility or enterprise-serving acceptance
is claimed. See [readiness and risks](execution/readiness-and-risks.md).

1. [Vision](vision.md)
2. [Engineering context](concepts/engineering-context.md)
3. [Knowledge packs](concepts/knowledge-packs.md)
4. [Evidence and provenance](concepts/evidence-and-provenance.md)
5. [Architecture overview](architecture/overview.md)

## Design areas

- [Product requirements](requirements/product-requirements.md)
- [Requirements traceability](requirements/traceability.md)
- [Enterprise knowledge model](design/enterprise-knowledge-model.md)
- [Human-reviewed engineering workflow](design/human-reviewed-engineering-workflow.md)
- [Hybrid retrieval](design/hybrid-retrieval.md)

- [Preparation and business knowledge](design/preparation-and-business-knowledge.md)
- [Retrieval content and agent guidance](design/retrieval-and-agent-guidance.md)
- [Studio experience](design/studio-experience.md)

- [Target architecture workbench](design/target-architecture-workbench.md)
- [Test impact and validation](design/test-impact-and-validation.md)
- [Identity and policy](design/identity-and-policy.md)

## Architecture and security

- [Architecture review and decisions](architecture/architecture-review.md)
- [System architecture](architecture/system.md)
- [Technology stack and alternatives](architecture/technology-stack.md)
- [Deployment and operations](architecture/deployment-and-operations.md)

- [Architecture overview](architecture/overview.md)
- [Security and authorization](architecture/security-and-authorization.md)
- [Single-enterprise deployment decision](decisions/0001-single-enterprise-deployment.md)

- [Independent implementation decision](decisions/0002-independent-implementation.md)
- [Storage decision](decisions/0003-postgresql-and-portable-releases.md)
- [Retrieval experiment decision](decisions/0004-retrieval-and-guidance-experiment.md)
- [Validation-slice baseline decision](decisions/0005-validation-slice-baseline.md)
- [Open-source license decision](decisions/0006-apache-2-license.md)

## Technical design and execution

- [SDK extension and interoperability contract](technical-design/sdk-extension-contract.md)
- [A1 extension compatibility receipt](technical-design/a1-compatibility-receipt.md)
- [Knowledge lifecycle and task evidence selection](technical-design/knowledge-lifecycle-and-retrieval.md)
- [Bounded A1–A5 implementation handoff](execution/architecture-handoff.md)
- [Technical design](technical-design/system.md)
- [Data contracts and storage](technical-design/data-contracts.md)
- [API, MCP, and CLI contracts](technical-design/interfaces.md)
- [Extraction and local source binding](technical-design/extraction-and-source-binding.md)
- [Task and review contracts](technical-design/task-and-review-contracts.md)
- [Evaluation and acceptance](evaluation/methodology.md)
- [Three-repository benchmark](evaluation/three-repository-benchmark.md)
- [Validation work packages](execution/validation-work-packages.md)
- [Detailed implementation plan](execution/implementation-plan.md)

## Research

- [Research verdict and design closeout](research/design-closeout.md)
- [Scanner and enterprise-context patterns](research/scanner-and-enterprise-patterns.md)
- [Enterprise modeling patterns](research/enterprise-modeling-patterns.md)

- [Second-pass architecture challenge](research/second-pass-assessment.md)
- [Validation sequence before broad implementation](evaluation/validation-sequence.md)

- [V2 research and implementation disposition](research/v2-disposition.md)

- [Reference analysis](research/reference-analysis.md)
- [Market and technical landscape](research/market-and-technical-landscape.md)

## Documentation conventions

Documents use these statuses:

- **Draft** — under discussion and expected to change.
- **Proposed** — shaped enough for review and implementation planning.
- **Accepted** — approved direction that implementation should follow.
- **Implemented** — supported by working code and validation evidence.
- **Superseded** — replaced by a later decision or design.

Architecture and design documents describe intended behavior. Decision records
capture why a significant choice was made. Reference documentation should be
generated or kept close to the interfaces it describes once implementation
exists.

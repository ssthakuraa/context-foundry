# ContextFoundry product requirements

**Status:** User-confirmed product direction; detailed requirements proposed for review
**Baseline:** CF-0.2 requirements alignment · 2026-09-20

## Authority and purpose

This document is the authoritative statement of intended product behavior. It
captures the owner's clarified requirements; it does not claim implementation or
approval of every design choice. Design documents describe how these requirements
are fulfilled. Historical research is evidence, not a competing product specification.
CF-0.2 is the reconciled validation-slice design baseline. Historical CF-0.1 research
remains evidence, not a competing execution plan; unchanged technical choices retain
their proposed status.

ContextFoundry fills the company-specific knowledge gap between a general-purpose
LLM and the enterprise's functional, technical, product-family and domain experts.
It supports existing agents rather than replacing their reasoning or coding tools.

## Users and knowledge scope

Users include product specialists, functional/domain experts, architects, developers,
support engineers, testers, and knowledge/security administrators. Product experts
know implementation depth; domain experts connect products across procurement,
supply chain, Order to Cash, Procure to Pay, and other enterprise flows.

Knowledge must connect these levels, not merely collect documents:

- Domain, product family, product, capability, business flow and flow step.
- Company-specific rules, variants, exceptions, configuration and applicability.
- Custom libraries, frameworks, utilities, standards and architectural decisions.
- Entities/tables, backend programs, jobs, workflows, APIs, events and integrations.
- Actual source locations, tests, ownership, evidence and known limitations.

Intended behavior, observed implementation, expert assertions, and proposals remain
distinct. Product/domain boundaries need not coincide with repositories or packs.

## Supported task intents

| Intent | Appropriate outcome |
|---|---|
| Functional/user inquiry | Explain current behavior and conditions with evidence |
| Consume a capability/API | Contract, prerequisites, authorization, errors, side effects and usage constraints |
| Defect investigation | Expected versus observed behavior, hypotheses, targeted investigation and findings |
| Impact analysis | Affected flows/products/layers/tests, reasons, uncertainty and validation needs |
| Enhancement request/new feature | Investigated design, impact findings, execution/validation plan, then authorized implementation |

Diagnosis does not authorize a fix. A consumption question does not automatically
require reading a full service implementation. Every outcome is limited by available
and authorized evidence.

## Primary journey and review checkpoints

| Stage | Required output | Progress condition |
|---|---|---|
| Understand and map | Interpreted request, relevant business/product areas, constraints, source pointers and gaps | Present a reviewable scope; no broad implementation investigation yet |
| Gate 1: scope review | Human confirmation, corrections, additions or narrowing | Confirm the exact revised scope before deeper investigation |
| Assess and investigate | Per-question sufficiency assessment; selective source/test inspection; updated findings | Resolve or explicitly surface material uncertainty |
| Propose | Findings, impact analysis, appropriately sized design, execution and validation plan | Inquiry/diagnosis can conclude here; implementation requests go to Gate 2 |
| Gate 2: implementation review | Human decision on the exact proposal and permitted implementation scope | Explicit authorization to code; rejection or revision returns to proposal |
| Implement and validate | Changes, check results, deviations, residual risks and final handoff | Material scope/design changes return for review; no implicit merge/deploy authorization |

Gate 1 asks whether the agent is investigating the right areas. Gate 2 asks whether
the resulting change is understood and authorized. Approval of one never implies the
other. A review may be short, but cannot be inferred from silence. Straightforward
inquiries may combine scope confirmation with clarification and need no coding gate.

## Functional requirements and acceptance

| ID | Requirement | Observable acceptance |
|---|---|---|
| CF-R01 | Represent connected product/domain/implementation knowledge | A cross-product flow query reaches distinct product steps and evidenced technical artifacts without assuming repo = product |
| CF-R02 | Preserve company variants and technical conventions | Two similarly named capabilities with different applicability remain distinguishable; unsupported applicability prompts clarification |
| CF-R03 | Identify task intent and preserve original request | Agent questions and reviewer additions are separate versioned inputs; diagnosis stays read-only |
| CF-R04 | Produce a useful investigation map | Each selected area/file has relevance, evidence, source identity and gaps; no default source dump |
| CF-R05 | Support Gate 1 and human supplementation | A missing subsystem can be added; revised scope is confirmed before deep reading; correction is not silently published as shared fact |
| CF-R06 | Assess sufficiency by question and intended action | API-use and service-change tasks over the same capability produce different reading needs and explain why |
| CF-R07 | Navigate directly into accessible local source | Logical source references resolve to approved local folders, symbols/sections and revisions; stale/missing mappings are explicit |
| CF-R08 | Investigate selectively with a safe fallback | Agent reads necessary sections/files, expands when justified, and reports material scope changes rather than hiding them |
| CF-R09 | Deliver an evidence-backed proposal | Current facts, proposed changes, impacts, risks, unknowns, execution steps and validation obligations are separated |
| CF-R10 | Support Gate 2, plan versioning and final review | No coding before explicit authorization in conforming integrations; material plan changes invalidate approval; results retain plan linkage |
| CF-R11 | Remain agent- and source-control-independent | Existing agent handles local reads/edits; logical snapshot identity supports Git and enterprise source mechanisms without requiring a Git SHA |
| CF-R12 | Govern knowledge provenance and lifecycle | Revisions, origin, review, conflicts, coverage, withdrawal and stale mappings are visible and independently represented |
| CF-R13 | Enforce enterprise access at all controlled surfaces | Direct UI/API/MCP/CLI/extractor paths deny unauthorized actions and evidence; review confirmation cannot grant source access |
| CF-R14 | Retrieve terminology robustly without inventing facts | Exact names, typos and paraphrases are evaluated separately; similarity nominates candidates, never proves business equivalence or dependency |
| CF-R15 | Expose review and investigation artifacts accessibly | Host conversation and Studio can display the same versioned map/proposal; tables/text do not require graph visualization |
| CF-R16 | Demonstrate benefit and maintainability | Same-information baselines, unseen tasks, missed impacts, human effort, preparation/refresh cost and scoped latency are reported |

CF-R01/R07/R12 require multi-artifact evidence, not merely a populated index:
supported Java/Spring, SQL/data, API contract, TypeScript/frontend, document and
test facts must carry source pointers and family-specific coverage. A business
passage -> API -> service -> data -> test example must expose exact, candidate,
reviewed and missing links distinctly. A code-search match is not a resolved call,
and a declared test is not a passing run. The
[scanner gate](../research/scanner-and-enterprise-patterns.md) supplies the first
executable acceptance shape without claiming full language coverage.

## Default source-access model

The coding agent normally has authorized project-folder access already. ContextFoundry
returns logical source identity, relative file path, symbol/section, revision/digest,
and why the location matters. Local integration resolves this to the actual workspace.
No upload of the whole working tree is required for investigation. Nonlocal document
evidence can still be retrieved under service authorization.

Known file locations should reduce unnecessary discovery, not prohibit grep/search
when knowledge is stale, missing, ambiguous, or contradicted by current source.

## Responsibilities and assurance

ContextFoundry owns knowledge preparation, retrieval, evidence, access and review
artifacts. The integration guides stages, source binding and checkpoints. The agent
owns sufficiency reasoning, source inspection, design, coding and tests; CI may
execute validation. Humans supply domain context and approve scope and implementation.

A prompt-driven skill provides guided compliance, not an enforceable filesystem
barrier. The initial release must label this assurance honestly. Enforced mode is
claimed only when a host can gate its own read/write tools and the integration has
passed conformance tests. The knowledge server cannot block independent agent tools.
Neither mode turns an agent's claimed approval into authenticated human approval.

## Non-goals and sequencing

No replacement coding model, mandatory agent runtime, automatic code conversion,
production deployment orchestrator, or automatic test-suite pruning. No claim that
all functional knowledge can be inferred from source. Experts and approved documents
are necessary inputs where implementation does not explain business intent.

The first usable slice includes connected business knowledge, local navigation,
both review checkpoints and a minimal proposal. Rich architecture diagrams and
test-migration workbenches follow; the core workflow must not wait for them.

See [workflow design](../design/human-reviewed-engineering-workflow.md),
[retrieval strategy](../design/hybrid-retrieval.md), and
[requirements traceability](traceability.md).

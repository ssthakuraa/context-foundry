# Research verdict and design closeout

**Later design review:** the [CF-0.3 architecture decision](../architecture/architecture-review.md)
supersedes conflicting readiness/sequence statements in this historical synthesis.
It retains the research evidence and adds extension interoperability, lifecycle,
task evidence selection and a bounded implementation handoff. This report is not
evidence that the prototype has demonstrated utility.

**Status:** Research synthesis complete for the validation slice; empirical validation pending
**Baseline:** CF-0.2 · 2026-09-20

## Verdict

Proceed to a bounded validation implementation, not a full enterprise platform build.
The defensible hypothesis is that company-specific business meaning, qualified code
facts, and task-appropriate evidence can improve an existing agent's investigation.
A larger graph, more context, or stronger instructions alone is not the hypothesis.

The owner-confirmed requirements are in [product requirements](../requirements/product-requirements.md).
The proposed implementation baseline is [ADR 0005](../decisions/0005-validation-slice-baseline.md).
This closes the bounded literature review and design reconciliation, not the product
validation gate. No comparative agent runs, database spike, or customer study has run.

## Evidence ledger and transfer limits

Sources were read as primary research or first-party engineering/product accounts.
Author-reported experiments are not our reproductions. Product pages establish
overlapping positioning, not independent performance. No numerical improvement from
another workload is a ContextFoundry forecast.

| Source and evidence type | Observation | Adopt, test, or reject |
|---|---|---|
| [Google sufficient-context research](https://research.google/blog/deeper-insights-into-retrieval-augmented-generation-the-role-of-sufficient-context/) — QA experiments | Relevant context can still be insufficient; adding context can discourage appropriate abstention | Adopt per-question sufficiency and explicit gaps. Test against expert obligations; agent self-confidence is not a correctness oracle. QA evidence does not establish safe software impact analysis. |
| [Meta CRAG](https://arxiv.org/abs/2406.04744) — benchmark | RAG evaluation spans varied domains, question complexity and knowledge dynamics | Adopt stale, ambiguous and unanswerable cases, not only easy lookup. Public QA differs from private cross-repository engineering. |
| [Salesforce CRMArena-Pro](https://arxiv.org/abs/2505.18878) — enterprise simulation | The reported multi-turn outcomes and confidentiality failures show that enterprise tasks cannot be judged by single-turn answer quality alone | Adopt multi-stage review/resume and confidentiality scenarios. Historical models, synthetic CRM tasks and coding-agent tasks are not interchangeable. |
| [Salesforce follow-up experiments](https://www.salesforce.com/blog/llm-agents-for-crm/) — small task-family intervention | Specialized function headers did not help unseen tasks; correct implementations and worked workflows helped more. Buggy refactored helpers weakened results | Test reusable, evidence-backed domain procedures as context, separately from agent-control directives. Do not encode benchmark answers in recipes. The study is small; its workflow labels include privileged expert knowledge. The article's result table and concluding percentage differ, so no headline percentage is imported. |
| [Anthropic contextual retrieval](https://www.anthropic.com/engineering/contextual-retrieval) — author-reported retrieval experiments | Contextualized chunks, lexical/embedding retrieval and reranking improved their retrieval results | Start with deterministic title/product/section descriptors; add model-generated descriptors, embeddings or reranking one at a time against diagnosed misses. Retrieval gains alone do not establish engineering-task gains. |
| [Microsoft GraphRAG global search](https://www.microsoft.com/en-us/research/blog/graphrag-improving-global-search-via-dynamic-community-selection/) — engineering/experimental account | Community selection addresses broad corpus-level questions and query cost | Keep local evidenced traversal distinct from global summarization. Defer generated community summaries until broad landscape queries justify their build, refresh and ACL costs. |
| [Meta Glean](https://engineering.fb.com/2024/12/19/developer-tools/glean-open-source-code-indexing/) — implementation account | Typed code facts and revision-aware navigation support large-scale code tooling | Adopt identities, precision tiers and incremental facts. It is not evidence that syntax reveals all company business rules; this Glean is not the enterprise-search company. |
| [Evaluating AGENTS.md, v2](https://arxiv.org/abs/2602.11988v2) and [efficiency study](https://arxiv.org/abs/2601.20404) — coding-agent studies | The studies examine different task sets and outcomes; context-file benefits are not universal, and additional instructions can impose cost | Keep guidance short; measure task success separately from tokens/time. Preserve required safety/review gates while ablating optional advice. Do not turn either study into a universal instruction-file verdict. |
| [LangGraph interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts) — framework mechanism | Durable pause/resume is distinct from knowledge retrieval | Adopt versioned task decisions; do not add a mandatory agent orchestrator or claim prompts enforce host filesystem tools. |

## V2 failure decomposition

The [v2 disposition](v2-disposition.md) records source inspection and reported metrics.
Different models and payloads prevent a causal productivity conclusion. Trace each
obligation through these stages before choosing a repair:

| Stage | Failure hypothesis | Diagnostic |
|---|---|---|
| Source knowledge | A business rule was never recorded | Expert/source comparison; mark unknown instead of tuning search |
| Preparation | A recorded rule, identity or binding was lost | Compare captures with extracted records and ambiguity diagnostics |
| Retrieval | Correct records exist but anchors/paths are not found | Frozen-corpus candidate and path recall |
| Delivery | Necessary evidence is truncated, buried or stripped of applicability | Compare selected records with actual wire bytes |
| Consumption | Evidence arrives but the agent ignores or misinterprets it | Same content, varied guidance; blind outcome review |
| Investigation | Local source is stale or the agent stops too early | Locator/read receipts, contradictions and obligation completion |
| Operations | Scoped queries or repeated proof checks dominate effort | Actual-scope query plans and phase timing, with response cache disabled |

The next action is the cheapest diagnostic that separates these causes. Two failed
bounded repair iterations reopen the hypothesis; do not indefinitely enlarge prompts,
payloads, mappings or graph heuristics.

## Architecture alternatives and decision

| Alternative | Strength | Decision |
|---|---|---|
| Agent plus ordinary search | No preparation service; strong baseline for source-local tasks | Mandatory same-information baseline |
| Document retrieval with precise pointers | Simpler preparation and operation | Mandatory simple baseline; ship this simpler approach if richer structure adds no useful outcome |
| Typed business/evidence model with selective retrieval | Represents applicability, cross-product connections and uncertainty | Proposed ContextFoundry slice; must earn curation and resolution cost |
| Generated global GraphRAG summaries | Broad thematic synthesis | Defer; not a replacement for exact change-impact evidence |
| Autonomous multi-agent investigation platform | Centralized orchestration | Reject for initial product: duplicates the host agent and increases scope |
| Fine-tuning a company expert model | Potentially changes behavior/style | Defer; not an initial solution to current source identity, provenance and revocable access |

Use one modular TypeScript application, PostgreSQL operations/projections, immutable
canonical releases, isolated extractors, and a local binding helper. Include narrow
Java/Spring, TypeScript, SQL and Markdown extraction now. No graph server, vector
server, model training or hidden answer-generation agent is mandatory. PostgreSQL
retrieval remains reversible if the scoped spike fails.

## Competitive position and confidence

The category is already competitive. [Augment Context Engine MCP](https://www.augmentcode.com/product/context-engine-mcp)
advertises agent-independent context across repositories and documentation.
[Unblocked](https://getunblocked.com/blog/context-layer-ai-agents/) explicitly targets
institutional engineering knowledge across code, documents and conversations.
These are vendor claims, not a head-to-head evaluation. Neither code-plus-docs nor
MCP integration is a unique advantage.

Our proposed focus is self-hosted, auditable, company-variant-aware investigation:
business rule -> applicable implementation -> scoped source reading -> reviewed
impact/design -> test obligations, alongside existing coding agents. This is a
positioning hypothesis, not a verified exclusive feature set. Open source helps
inspectability and control, but also requires packaging, upgrades, documentation,
community support and a viable maintenance model.

Current subjective assessment, not calibrated probabilities:

- **High confidence:** the slice is technically buildable with the proposed components.
- **Moderate confidence:** it can improve selected enterprise-context-heavy tasks;
  competing simple baselines and curation burden remain unmeasured.
- **Low-to-moderate confidence:** it will be highly competitive across enterprises.
  We have no independent pilots, head-to-head results or adoption evidence.
- **Market leadership:** not defensibly predictable from a design document.

Raise confidence only after held-out quality/effort gains, manageable refresh costs,
another independently maintained enterprise corpus, and design-partner evidence
that this solves a frequent painful problem. A successful rentalapp experiment alone
does not meet that bar. See [risks and readiness](../execution/readiness-and-risks.md).

## Research stop rule

This evidence is sufficient to choose the next bounded experiments. Further broad
survey work is deferred. Reopen source research only for a specific failed hypothesis,
security/protocol requirement, or implementation dependency. Pin library versions and
borrowed algorithm references during the relevant work package, not by claiming that
all current external software was audited in this review.

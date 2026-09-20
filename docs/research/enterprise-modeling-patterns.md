# Enterprise knowledge and workflow modeling patterns

**Status:** Primary-source comparison and proposed synthesis · 2026-09-20

## Conclusion

There is no verified single best model for this entire problem. The useful pattern
is separation: typed enterprise knowledge, revision-aware implementation facts,
task-specific retrieval, and resumable human-reviewed workflow. This is our synthesis,
not a claim that the following systems implement ContextFoundry's exact journey.
Documentation and engineering reports were inspected; systems were not deployed or
benchmarked. Sources describe different scopes and dates, not a common comparison.

## Google: entity identity and contextual relationships

Gemini Enterprise documents knowledge-graph query annotation, entity linking and
ACL-aware entities. Its described graph centers on people, content and interactions;
the documented private graph is not a ready-made procurement-to-code ontology.
[Google knowledge graph](https://docs.cloud.google.com/gemini/enterprise/docs/use-knowledge-graph-search).

Transfer: separate names from identities, preserve ambiguous mentions, and use
product/domain scope to interpret terms. Do not assume a search engine understands
company business variants without the relevant records. Organizational proximity
may help find an expert; it must not establish truth or grant permission.

## Meta: structural facts, revision-aware navigation and staged ranking

Meta's Glean stores queryable code facts and supports incremental indexing; Glass
exposes navigation with repository/path/revision and symbol identities. Meta also
describes incident investigation using heuristic retrieval followed by model-based
ranking. These are different systems/use cases, not one enterprise-domain assistant.
[Glean and Glass](https://engineering.fb.com/2024/12/19/developer-tools/glean-open-source-code-indexing/),
[incident retrieval](https://engineering.fb.com/2024/06/24/data-infrastructure/leveraging-ai-for-efficient-incident-response/).

Transfer: typed extracted facts and locators underpin navigation; rank a constrained
candidate set instead of asking a model to examine everything. Incremental cost
depends on affected dependencies, not just the number of edited files. Meta's Glean
is distinct from the enterprise-search company also named Glean. Neither this source
study nor a measured result at Meta establishes ContextFoundry performance.

## Salesforce: task-shaped context, actions and business scope

Salesforce's Agentforce guide separates topics/actions, conversation variables,
retrieved knowledge and guardrails. It describes task-based narrowing and recommends
structured mechanisms for critical logic rather than only natural-language rules.
[Agentforce context engineering](https://developer.salesforce.com/blogs/2025/08/a-developers-guide-to-context-engineering-with-agentforce).

Transfer: shape context by task intent and domain; separate knowledge from authority
to act. API consumption and service enhancement need different facets. Do not adopt
an arbitrary vendor topic-count limit or execute business actions from our knowledge
service. The page is architectural guidance, not proof of cross-product code impact.

## LangGraph: durable workflow state is not a knowledge graph

LangGraph separates thread-scoped state/checkpoints from cross-session stores; its
interrupt mechanism supports human input and resumption. This provides workflow
primitives, not a ready-made enterprise ontology or source authorization policy.
[Memory](https://docs.langchain.com/oss/python/concepts/memory),
[interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts).

Transfer: keep the task map, reviewer additions, approvals and progress separate
from released knowledge. Durable checkpoints help resumption but do not magically
enforce an external coding agent's tools. A small task/review state machine is enough
for our initial integration; LangGraph is not a required runtime dependency.

## Palantir: explicit ontology tied to actual data

Foundry describes object types, properties, link types and action types bound to
organizational data. It is a useful reference for modeling business meaning rather
than treating documents as the only abstraction.
[Ontology core concepts](https://www.palantir.com/docs/foundry/ontology/core-concepts).

Transfer: define a small typed vocabulary for capabilities, flows, variants and
implementation links, with explicit provenance. ContextFoundry models knowledge
about software and behavior; it does not copy the enterprise's operational orders,
customers and payments into a second transaction system or reproduce Foundry Actions.

## Recommended ContextFoundry model

Use four logical layers, not four new databases:

1. Enterprise domain model: concepts, capabilities, flows, rules, variants and standards.
2. Evidence/implementation model: declarations, semantic bindings, contracts, source
   locators, runtime/test receipts and assertions connecting them to domain meaning.
3. Retrieval projections: exact, lexical, optional fuzzy/semantic lanes and bounded
   typed traversal. Ranking selects evidence; it does not write canonical facts.
4. Task workspace: interpreted request, scope map, human corrections, sufficiency,
   findings, proposal, approvals and execution receipts.

PostgreSQL plus canonical files remains the proposed storage implementation. A
logical knowledge graph does not require selecting a graph database now. Do not
start with a universal enterprise ontology; prove a small cross-product flow and
extend namespaced types only when required. See the
[knowledge model](../design/enterprise-knowledge-model.md) and
[human-reviewed workflow](../design/human-reviewed-engineering-workflow.md).

The question is not whether embeddings or graphs are fashionable. It is whether
the model can explain a company's rule, select the correct variant, and lead an
agent to current implementation with less effort and no loss of critical context.

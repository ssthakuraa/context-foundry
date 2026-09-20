# Hybrid retrieval: exact, fuzzy, semantic and structural

**Status:** Proposed strategy; model/index choices experimental · 2026-09-20

Supports CF-R01, CF-R02, CF-R04, CF-R06 and CF-R14. Search finds candidates;
evidence-backed relations explain connections. Neither similarity nor model fluency
establishes company-specific truth.

## Technique selection

| Lane | Useful for | Must not do |
|---|---|---|
| Exact identity / lexical fields | Qualified symbols, paths, APIs, error codes, known terms | Lose exact matches through stemming or approximate spelling |
| Reviewed terminology | Enterprise abbreviations, product-family aliases, business variants | Treat one acronym as globally unambiguous |
| Bounded fuzzy matching | Typographical errors and nearby names | Silently correct an exact API/field identifier or infer semantic equivalence |
| Transformer embeddings | Paraphrases and conceptual similarity across descriptions/passages | Invent missing business rules or treat a nearby vector as a dependency |
| Cross-encoder reranking | Reorder a small candidate set for the actual question | Recover facts absent from the candidate set or certify truth |
| Typed relationship traversal | Connect flows to product steps, services, entities, APIs and tests | Treat shared vocabulary or an undirected neighborhood as causal impact |

Fuzzy search can use edit distance; PostgreSQL's pg_trgm instead offers trigram
similarity and indexed search. They are different approximate-string mechanisms.
[Elastic fuzzy query](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-fuzzy-query),
[PostgreSQL pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html).

Sentence Transformers documents efficient embedding-based retrieval followed by a
cross-encoder that scores query/candidate pairs. The latter is applied to a limited
candidate set because scoring the whole corpus is more expensive.
[Retrieve and rerank](https://www.sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html).

## Proposed query path

1. Authorize sources, descriptors and supporting evidence; bind product/version scope.
2. Recognize explicit identifiers; maintain an exact-match lane separately.
3. Retrieve lexical and reviewed-alias candidates per concern. Suggest bounded fuzzy
   alternatives for weak/empty name matches, with the original query preserved.
4. For conceptual questions, evaluate a semantic lane over context-preserving
   passages/descriptors. Filter authorized candidates before exposed ranking/aggregation.
5. Deduplicate by qualified entity or passage identity, not file basename. Combine
   approximate lane rankings with measured reciprocal rank fusion parameters; keep
   exact identifiers distinguishable. Do not compare raw cosine and text scores directly.
6. Optionally rerank a bounded shortlist. Record model/profile versions, latency and
   availability. A failure falls back explicitly to nonmodel retrieval, not empty truth.
7. Expand only supported typed relationships needed by the concern. Preserve alternate
   interpretations, variant conditions, provenance and gaps.
8. Return a reviewable map and locators. After scope review, the agent judges sufficiency
   and reads current local source; retrieval does not silently assemble every file.

RRF combines ranked lists rather than requiring comparable relevance scores.
[Elastic RRF](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion).
Using the technique does not require Elasticsearch or prove it is optimal here.

## Enterprise semantic model

Capture product/domain/flow identities and explicit many-to-many implementation
links. A flow step has business preconditions/outcomes, participating products,
applicable variants and implementation references. A standard has version,
applicability and approved exceptions. Similarity nominates such records, while their
stored relationships provide the evidenced path to code. Do not expect general
embeddings to know an undocumented enterprise acronym or implicit business exception.

Represent API-use facets separately from implementation-change pointers. A user may
need a contract only, or need a service/workflow/test investigation. Sufficiency is
an agent judgment supported by coverage metadata, not a universal confidence score.

## Implementation and data protection

Keep PostgreSQL exact/full-text/adjacency as the initial baseline. Evaluate pg_trgm
for typo candidates and pgvector for embeddings when the controlled experiment
justifies them. No new mandatory search service is selected. Start with a pretrained
retrieval model; do not train a foundation model or fine-tune on private source by default.
Model/license/runtime selection, CPU/GPU sizing and latency require a separate spike.

Offline corpus embedding is versioned by model, input digest, chunking and dimensions;
query embedding and cross-encoder scoring run at query time under explicit routing
policy. These are retrieval models, not a hidden generative answer agent. Default
enterprise operation must support local inference or no-model retrieval; remote
processing is opt-in with approved data policy. Authorization precedes model input.
Treat vectors/descriptors as sensitive derivatives with withdrawal dependencies.

## Experiments and boundaries

Keep exact/lexical/mapping retrieval as the control. Separately add fuzzy matching,
embeddings, rank fusion and reranking; include typos, paraphrases, ambiguous acronyms,
negation, product-version variants, hidden distractors and unknown facts. Measure
critical evidence recall, false positives, scoped latency and human review effort.
Do not trade a decisive missing impact for a better average search score.

The analogy to web search is useful at the level of combining matching and ranking
signals. This design makes no claim to reproduce Google's proprietary system.
Retrieval cannot replace missing enterprise knowledge or either human review gate.

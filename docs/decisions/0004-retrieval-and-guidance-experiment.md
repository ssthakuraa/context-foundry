# ADR 0004: Isolate retrieval content and guidance before redesigning preparation

**Status:** Proposed implementation method; reflects agreed investigation priority

## Decision

Freeze a prepared knowledge corpus and independently test content and directive
changes. Keep original requirements separate from agent-generated search concerns.
Offer focused follow-up operations as the proposed architecture, but compare their
utility with a better compact initial response before committing the interaction.

## Rationale

V2 contains evidence of relevant facts lost during selection and large responses
that did not reduce discovery. Its historical model comparison is uncontrolled.
Neither preparation failure nor the superiority of progressive retrieval follows
from that result. The four-arm experiment isolates causes more effectively.

## Consequences

Quality, task effort, and actual delivered content govern the decision. Prompt
guidance cannot enforce external shell behavior. Service controls remain enforceable
regardless of agent compliance. Two unsuccessful bounded iterations trigger review;
the next step is a new failure hypothesis, not indefinite heuristic growth.

CF-0.2 clarification: optional retrieval guidance and response format are experiment
variables; the owner's two human review gates are not. Product comparisons retain
identical gates. Historical replay can study old behavior but cannot count as current
workflow conformance. Use the evidence-utility diagnostic and simple retrieval baseline
before spending on wider comparisons; see [benchmark](../evaluation/three-repository-benchmark.md).

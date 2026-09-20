# Test impact and validation

**Status:** Proposed

ContextFoundry should begin with Test Impact Analysis and grow into a broader
change-verification capability. It should complement CI and test platforms,
not replace them.

## Primary question

> Given a requirement, code change, schema change, API change, or proposed
> architecture change, which tests and validation activities may be affected?

## Impact inputs

- Changed files, symbols, APIs, schemas, and configuration
- Requirement and business-capability associations
- Static dependency relationships
- Test-to-code and test-to-requirement mappings
- Runtime coverage when available
- Historical change and failure data
- Ownership, criticality, and security metadata

## Impact outputs

- Likely affected tests
- Affected requirements and business capabilities
- Impacted interfaces, data objects, jobs, and consumers
- Missing or weak test coverage
- Recommended regression and contract checks
- Potentially unaffected test areas
- Evidence, confidence, and unresolved gaps

“Unaffected” must be treated as a qualified result. It means no impact was
found within the available and authorized evidence, not that impact is
impossible.

## Future extensions

- Characterization-test recommendations for legacy behavior
- Mapping legacy tests to replacement components
- Test-framework migration plans
- Contract and schema compatibility comparisons
- Golden-data and differential-execution evidence
- CI result ingestion and release validation reports
- Behavior-parity assessment across old and new implementations

## Responsibility boundaries

```text
ContextFoundry: map impact and preserve evidence
LLM: explain impact and propose validation work
CI/test systems: execute tests and collect results
Human reviewers: accept risk and validation conclusions
```

Passing related tests is not by itself proof of behavioral equivalence. The
platform must report exactly which behaviors were exercised and which remain
unvalidated.

## Association semantics

Keep static imports/references, declared requirement mappings, observed runtime
coverage, and actual test assertions as different relation types. A static import
nominates a test; it does not prove the test validates a behavior. Runtime coverage
applies to a particular revision, environment, input set, and run.

Change sets identify before/after revisions and actual changed symbols, APIs, fields,
or configuration. Requirement-only impact is labelled hypothetical. Traverse reverse
dependencies under relation-specific rules, then retrieve associated tests. Each
recommendation carries the path and evidence reason; confidence labels must explain
their basis rather than present invented probabilities.

## Initial output and safety

WP5/M3 includes a minimal validation-obligation list linked to the reviewed task and
proposal. M5 expands analytical UI and report ingestion. Test declarations, statically
recognized skips, contract skeletons and authenticated execution outcomes are separate.
Absence of a skip marker is not proof a test ran. A wrong-revision or skipped run cannot
discharge a behavior obligation. See [task contracts](../technical-design/task-and-review-contracts.md).

Return recommended tests, affected behavior/contracts, evidence basis, missing
coverage, and unresolved dynamic/reflection/external-consumer dependencies. Keep
tests with no discovered connection in a separate low-evidence category rather than
automatically excluding them from CI. Initial releases are advisory and never skip
tests automatically. Selection safety requires separate mutation/fault experiments.

CI imports authenticate the reporting system and bind results to source snapshot/revision, environment,
test identities, report digest, coverage format/version, and attachments. Duplicate
imports are idempotent; wrong-revision evidence cannot validate a new change. XML/JSON
reports are parsed under the same hostile-input limits as other sources.

## Migration and parity extensions

Later mapping records connect old tests/behaviors to new components without replacing
their historical identities. Differential comparisons record both revisions,
controlled inputs, environment differences, nondeterminism handling, compared outputs,
and tolerances. Passing only establishes equivalence for the tested observations.
Failed comparisons and uncovered behavior remain visible in an approval report.

Represent a behavior obligation separately from a test: requirement/source, input
partition, expected observations, side effects, ordering/time constraints, tolerances,
exclusions and owner. Link old/new tests and actual run receipts to this obligation.
An API compatibility result cannot validate persistence, notifications, authorization,
or other business side effects. Contract, functional and differential evidence stay
separate; see [research rationale](../research/second-pass-assessment.md).

Before describing impact as precise, demonstrate semantic-resolution coverage for
the supported language slice. An unresolved dependency is not an unaffected one.
Require critical test/behavior truth from an independent rubric, not just agreement
with a baseline that may itself miss faults.

Acceptance uses seeded faults with known affected tests, negative/irrelevant tests,
changed test names, stale coverage, inaccessible dependencies, and incomplete reports.
Measure missed relevant tests and excess recommended tests separately; minimal test
counts alone are not a success metric.

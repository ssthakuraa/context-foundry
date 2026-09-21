# A3 retrieval prototype receipt

**Status:** in progress · 2026-09-20. Same-information synthetic comparisons
are executable. The full A3 scenario, selection and budget gates are not complete.

`packages/preparation/src/retrieval.ts` accepts the A2 validated in-memory
candidate, one question and an explicit intent. Both arms use the same records,
descriptors, payload text and source locators. The lexical arm ranks text only;
the typed arm starts from the identical lexical seeds and follows only the
candidate's resolved relationship/mapping records. The response includes actual
serialized byte length, source digest pointers, origin/review/classification,
partial-coverage warning and basic candidate/seed/edge admission counts. It
refuses to truncate an oversized response into a misleading path. This library
is neither a shared service nor an authorization boundary.

The public fixture's `coordinator` enhancement query is a useful narrow test.
With one seed in each arm, the current lexical packet is 974 bytes and contains the
business rule; the typed packet is 6,367 bytes and additionally retains the
reviewed rule-to-operation mapping, literal operation-to-controller link and
source-resolved controller-to-service call. It examines three edges and admits
six connector facts. Both warn of partial coverage. The test can emit each full
actual packet by running the preparation tests with `CF_A3_RECEIPT=1`. These
numbers describe this fixture and serialization only; typed retrieval costs
more bytes here and no agent outcome has been measured.

A four-scenario same-candidate matrix now runs both arms at one seed, four hops,
the same source facts and default wire caps. Expected IDs are applied **after**
retrieval, never as ranking input. Optional `CF_A3_RECEIPT=1` test output includes
the full actual lexical/typed packets and obligation-stage receipt for each case.

| Scenario | Lexical bytes | Typed bytes | Required fact in lexical / typed | Boundary |
| --- | ---: | ---: | --- | --- |
| Declared API use | 1,058 | 1,056 | 1 / 1 | No service implementation in typed packet |
| Business rule to service | 987 | 7,904 | 0 / 1 | Reviewed map plus source-resolved calls |
| Reverse test impact | 1,048 | 6,497 | 0 / 1 | Reviewed relevance, not test execution |
| Unsupported service-to-data | 1,048 | 2,582 | n/a | Table remains absent; no invented edge |

This is a **3/3 versus 1/3 source-observed obligation** result for these selected
queries, not a general retrieval metric or agent benefit. The typed arm's connector
cost is substantial; the unsupported data path remains a failure of cross-layer
coverage. Negative and perturbation cases still need matrix coverage.

Both packets now carry complete capture-bound locators, including revision,
file digest and line/section range; shortening these to path-only pointers would
make a coding agent repeat the discovery work.

Seed ranking now reserves exact identity/name/operation-key matches, then fuses
descriptor, qualified-identity and string-payload lexical lanes with reciprocal
rank fusion (`1/(60 + rank)`, rank starting at one). Each lane is capped at 32;
ties break by immutable record ID. Reversing the input record order does not
change exact, tied lexical or typed-neighbor results; typed adjacency is sorted
by qualified target and edge ID before traversal. This is still a reference in-memory
ranker, not a tuned search-quality claim.
The independently written Python `acme.workflow` vector is also visible through
this generic descriptor ranker without a new kind-specific retrieval branch;
A1 separately checks its profile/record conformance. This A3 unit test is a
projection check, not a fresh trusted-capture claim for that vector.
Conversely, a synthetic `generic.related_to` relationship between the same
endpoints does not authorize enhancement traversal. Descriptive extension
visibility and executable core relation policy are intentionally separate.

Traversal caps now report `HOP_LIMIT`, `NODE_LIMIT` or `EDGE_LIMIT` when they
actually stop expansion. The favorable three-hop packet also carries `HOP_LIMIT`
because a service call continues beyond its selected depth; reaching the service
is not evidence that all downstream impact was explored.
A synthetic supported call cycle terminates under the visited-record set without
duplicating the controller fact; this is a graph-mechanics test, not a validated
new release fixture.

Whole-path packing groups each seed with its retained connector edges and
endpoints before serialization, but reserves one independent orientation anchor
per nominated seed first (round-robin across stated concerns). The earlier
greedy implementation was a real
failure: in the 3,000-byte two-concern scenario, it dropped the approval rule
despite a 1,762-byte lexical packet retaining both concerns. The corrected
typed packet is 1,900 bytes, retains both approval-rule and storage anchors,
and omits the approval connector path as a unit. It reports `PATH_TRUNCATED`
and `OVERSIZED_UNIT`, with an inspectable seed ID; it does not present a partial
connector chain as complete. At the same seed/hop settings with a 32 KiB wire
cap, the typed path costs 7,156 bytes and reaches the service. This comparison
demonstrates budget behavior, not net retrieval advantage under the tight cap.
If no anchor fits, `PACKET_TOO_LARGE` carries an inspectable seed. A no-match
query returns an empty packet rather than an oversize error.

An API-use query is restricted to declared contract facts and does not traverse
implementation links. A 256-byte cap returns `PACKET_TOO_LARGE` rather than a
partial edge. Exact record inspection returns a bounded file-range pointer and
support without reading implementation bytes. A stale reviewed mapping is not
used as a current traversal edge. Tests are deterministic over the same candidate
digest except the deliberately injected stale-state scenario, which is a policy
unit test rather than a new release build.
The same rule excludes stale reviewed test relevance; a stale association cannot
nominate a test-impact path. A source-byte perturbation with the same `coordinator`
question yields a different candidate digest and two separately pending business
passages, not an automatically adjudicated answer.

Exact trace accepts a selected record ID and original task separately. It is
anchored to that **record ID**, so a competing descriptor text match cannot
displace the selected source. It starts under a focused 16 KiB default cap while
preserving the original question in the response. This is a local library
operation; it does not authenticate a user or read the implementation file.

The focused evidence operation takes an evidence ID and the caller-supplied A2
capture, rechecks full declared-byte closure and locator binding, then returns
one exact UTF-8 file-line range with a content digest under a 16 KiB cap. A
changed source file aborts the read. For OpenAPI JSON-pointer locators it can
return a canonical subtree, explicitly labelled `canonical_json_pointer` rather
than misrepresented as a raw source span. Other document sections remain
unsupported. The host agent can still use the pointer to open the full source
file when a deeper investigation is warranted. This is offline selective-context
mechanics, not an enterprise file-access policy.

The API-use journey now has an explicit two-step test: orientation selects the
source-declared `POST /v1/repairs/{id}/approve` operation without traversing into
the service; focused OpenAPI evidence supplies the declared required `id` path
parameter and `204`/`409` responses. It does not claim that runtime behavior or
side effects match the contract. A service-enhancement question instead follows
the implementation pointer and reads the bound service method range.
The synthetic business passage expects approval to record the coordinator;
the selected service-method range does not show that term. The fixture test
preserves those as separate observations, not an automated defect verdict or
proof of absence elsewhere in the application. The rule still has pending
review and no test execution evidence has been imported.

An injected contradictory approval passage remains a second pending rule in a
separate source range. With sufficient lexical seed budget both are visible;
only the explicitly reviewed original rule has a technical mapping. The test
does **not** claim automatic contradiction detection or decide which passage
is applicable. That requires functional review and scope/edition evidence.

The negative service-to-data query does **not** return `REPAIR_REQUEST`: A2 knows
the entity/table mapping, but lacks a supported repository-to-entity edge from
the service's call path. The missing edge is an investigation target, not a
reason to join on a similar name or imply complete data impact.

The separate offline evaluation helper accepts expected record IDs **only after**
both retrieval arms run. It reports source presence, lexical nomination, seed
admission and typed-packet inclusion for each obligation. A same-seed/same-hop
32 KiB counterfactual distinguishes a path omitted by the requested wire cap
from one absent even at that cap; the latter is **not** proof that a graph path
does not exist beyond the traversal limits. On the synthetic
business-to-service scenario, the service is not a lexical seed but is retained
by typed traversal. On service-to-data, the SQL table is source-present yet absent
from the packet, classified as a traversal/budget gap. A wide lexical audit that
cannot serialize is marked evaluation-incomplete, not mistaken for zero recall.

Reverse `test_impact` traversal can nominate the reviewed test association from
an exact service symbol. It does not claim that the test ran or passed. This test
also exposed a seed-ranking bug: a relationship whose key merely contained the
whole service identity tied with the exact symbol. Exact identity now outranks
substring matches. Traversal uses an explicit safe relation list; an arbitrary
relationship payload cannot silently become a core path.

Up to eight caller-stated concerns can now nominate seeds in round-robin order
under one shared seed cap; a two-concern test retains both approval and storage
entries. The original question remains a separate request field. This is not
yet concern-aware path packing, and the
caller-supplied concerns are not treated as verified requirement truth. A multiline
original story is preserved verbatim in the packet; disallowed control bytes
are rejected.

Open A3 work: richer orientation and remaining document-section evidence;
more representative concern-diverse path packing; path- and byte-budget stage
loss reporting; stronger applicability/conflict and unsupported-access cases;
broader test-impact traversal and ambiguity handling; full captured packets
for every scenario; and a measured quality/byte comparison. A3 must not be
marked complete on this one favorable path.

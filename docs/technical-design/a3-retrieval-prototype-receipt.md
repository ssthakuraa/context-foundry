# A3 retrieval prototype receipt

**Status:** in progress · 2026-09-20. One same-information synthetic comparison
is executable. The full A3 scenario, selection and budget gates are not complete.

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
Both packets now carry complete capture-bound locators, including revision,
file digest and line/section range; shortening these to path-only pointers would
make a coding agent repeat the discovery work.

Traversal caps now report `HOP_LIMIT`, `NODE_LIMIT` or `EDGE_LIMIT` when they
actually stop expansion. The favorable three-hop packet also carries `HOP_LIMIT`
because a service call continues beyond its selected depth; reaching the service
is not evidence that all downstream impact was explored.

An API-use query is restricted to declared contract facts and does not traverse
implementation links. A 256-byte cap returns `PACKET_TOO_LARGE` rather than a
partial edge. Exact record inspection returns a bounded file-range pointer and
support without reading implementation bytes. A stale reviewed mapping is not
used as a current traversal edge. Tests are deterministic over the same candidate
digest except the deliberately injected stale-state scenario, which is a policy
unit test rather than a new release build.

Exact trace accepts a selected record ID and original task separately. It starts
from the exact identity under a focused 16 KiB default cap while preserving the
original question in the response. This is a local library operation; it does
not authenticate a user or read the implementation file.

The focused evidence operation takes an evidence ID and the caller-supplied A2
capture, rechecks full declared-byte closure and locator binding, then returns
one exact UTF-8 file-line range with a raw-range digest under a 16 KiB cap. A
changed source file aborts the read. Document-section locators are not yet
readable through this operation; the host agent can still use the pointer to
open the full source file when a deeper investigation is warranted. This is
offline selective-context mechanics, not an enterprise file-access policy.

The negative service-to-data query does **not** return `REPAIR_REQUEST`: A2 knows
the entity/table mapping, but lacks a supported repository-to-entity edge from
the service's call path. The missing edge is an investigation target, not a
reason to join on a similar name or imply complete data impact.

The separate offline evaluation helper accepts expected record IDs **only after**
both retrieval arms run. It reports source presence, lexical nomination, seed
admission and typed-packet inclusion for each obligation. On the synthetic
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
yet the specified multi-lane rank fusion or concern-aware path packing, and the
caller-supplied concerns are not treated as verified requirement truth. A multiline
original story is preserved verbatim in the packet; disallowed control bytes
are rejected.

Open A3 work: richer orientation and document-section evidence; concern
diversity, exact/lexical lane fusion and admission; path- and byte-budget stage
loss reporting; stale/conflicting rule and unsupported-access cases; reverse
broader test-impact traversal; cycle/ambiguity and tie handling; full captured packets
for every scenario; and a measured quality/byte comparison. A3 must not be
marked complete on this one favorable path.

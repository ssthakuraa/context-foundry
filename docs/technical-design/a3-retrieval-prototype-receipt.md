# A3 retrieval prototype receipt

**Status:** in progress · 2026-09-20. One same-information synthetic comparison
is executable. The full A3 scenario, stage-loss and budget gates are not complete.

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
With one seed in each arm, the lexical packet is 797 bytes and contains the
business rule; the typed packet is 4,852 bytes and additionally retains the
reviewed rule-to-operation mapping, literal operation-to-controller link and
source-resolved controller-to-service call. It examines three edges and admits
six connector facts. Both warn of partial coverage. The test can emit each full
actual packet by running the preparation tests with `CF_A3_RECEIPT=1`. These
numbers describe this fixture and serialization only; typed retrieval costs
more bytes here and no agent outcome has been measured.

An API-use query is restricted to declared contract facts and does not traverse
implementation links. A 256-byte cap returns `PACKET_TOO_LARGE` rather than a
partial edge. Exact record inspection returns a bounded file-range pointer and
support without reading implementation bytes. A stale reviewed mapping is not
used as a current traversal edge. Tests are deterministic over the same candidate
digest except the deliberately injected stale-state scenario, which is a policy
unit test rather than a new release build.

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

Open A3 work: separate orientation/trace/evidence operations; concern
diversity, exact/lexical lane fusion and admission; path- and byte-budget stage
loss reporting; stale/conflicting rule and unsupported-access cases; reverse
test-impact traversal; cycle/ambiguity and tie handling; full captured packets
for every scenario; and a measured quality/byte comparison. A3 must not be
marked complete on this one favorable path.

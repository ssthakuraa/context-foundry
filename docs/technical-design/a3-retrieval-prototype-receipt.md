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
partial edge. Tests are deterministic over the same candidate digest.

Open A3 work: separate orientation/inspect/trace/evidence operations; concern
diversity, exact/lexical lane fusion and admission; path- and byte-budget stage
loss reporting; stale/conflicting rule and unsupported-access cases; reverse
test-impact traversal; cycle/ambiguity and tie handling; full captured packets
for every scenario; and a measured quality/byte comparison. A3 must not be
marked complete on this one favorable path.

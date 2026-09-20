import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import {
  canonicalSha256, checkReleaseSetBindings, checkReleaseSetByteClosure, CONTRACT_VERSION,
  type ReleaseManifest, type ReleaseSet,
} from '../src/index.js';

const hash = 'a'.repeat(64);
const manifestA: ReleaseManifest = {
  schema_version: CONTRACT_VERSION, pack_id: 'pack:A', release_id: 'release:A:1',
  source_manifest_digests: [hash], adapter_digest: hash, config_digest: hash,
  ordered_shard_digests: [hash], coverage_refs: [], validation_refs: [], created_by: 'producer:1',
};
const manifestB: ReleaseManifest = {
  ...manifestA, pack_id: 'pack:B', release_id: 'release:B:1',
};
const releaseSet: ReleaseSet = {
  schema_version: CONTRACT_VERSION, release_set_id: 'set:1',
  cross_pack_bridge_digest: hash,
  packs: [
    { pack_id: 'pack:A', release_id: manifestA.release_id, manifest_digest: canonicalSha256(manifestA) },
    { pack_id: 'pack:B', release_id: manifestB.release_id, manifest_digest: canonicalSha256(manifestB) },
  ],
};

test('two-pack release set closes against exact canonical manifest metadata', () => {
  assert.deepEqual(checkReleaseSetBindings(releaseSet, [manifestA, manifestB]), []);
  assert.deepEqual(checkReleaseSetBindings(releaseSet, [manifestB, manifestA]), []);
  assert.deepEqual(checkReleaseSetBindings(releaseSet, [manifestA])
    .map(issue => issue.code), ['MISSING_RELEASE_MANIFEST']);
  assert.deepEqual(checkReleaseSetBindings(releaseSet, [manifestA, { ...manifestB, config_digest: 'b'.repeat(64) }])
    .map(issue => issue.code), ['MANIFEST_DIGEST_MISMATCH']);
  assert.deepEqual(checkReleaseSetBindings(releaseSet, [manifestA, { ...manifestB, release_id: 'other' }])
    .map(issue => issue.code), ['MANIFEST_DIGEST_MISMATCH']);
});

test('ambiguous, extra and invalid manifests cannot be a clean release set', () => {
  assert.deepEqual(checkReleaseSetBindings(releaseSet, [manifestA, manifestA, manifestB])
    .map(issue => issue.code), ['DUPLICATE_RELEASE_MANIFEST']);
  assert.deepEqual(checkReleaseSetBindings(releaseSet, [manifestA, manifestB, { ...manifestA, pack_id: 'pack:C' }])
    .map(issue => issue.code), ['UNLISTED_RELEASE_MANIFEST']);
  assert.deepEqual(checkReleaseSetBindings(releaseSet, [manifestA, { ...manifestB, adapter_digest: 'wrong' }])
    .map(issue => issue.code), ['INVALID_RELEASE_MANIFEST', 'MISSING_RELEASE_MANIFEST']);
  assert.deepEqual(checkReleaseSetBindings({ ...releaseSet, packs: [releaseSet.packs[0]!, releaseSet.packs[0]!] },
    [manifestA, manifestB]).map(issue => issue.code), ['INVALID_RELEASE_SET']);
});

test('ordered shard and bridge bytes close only against exact two-pack metadata', () => {
  const shardA = Buffer.from('A shard');
  const shardB = Buffer.from('B shard');
  const bridge = Buffer.from('A to B bridge');
  const hashBytes = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
  const a: ReleaseManifest = { ...manifestA, ordered_shard_digests: [hashBytes(shardA)] };
  const b: ReleaseManifest = { ...manifestB, ordered_shard_digests: [hashBytes(shardB)] };
  const set: ReleaseSet = {
    ...releaseSet, cross_pack_bridge_digest: hashBytes(bridge),
    packs: [
      { pack_id: a.pack_id, release_id: a.release_id, manifest_digest: canonicalSha256(a) },
      { pack_id: b.pack_id, release_id: b.release_id, manifest_digest: canonicalSha256(b) },
    ],
  };
  const supplied = [
    { pack_id: b.pack_id, ordered_shard_bytes: [shardB] },
    { pack_id: a.pack_id, ordered_shard_bytes: [shardA] },
  ];
  assert.deepEqual(checkReleaseSetByteClosure(set, [a, b], supplied, bridge), []);
  assert.deepEqual(checkReleaseSetByteClosure(set, [a, b], supplied, Buffer.from('forged'))
    .map(issue => issue.code), ['BRIDGE_DIGEST_MISMATCH']);
  assert.deepEqual(checkReleaseSetByteClosure(set, [a, b], [
    supplied[0]!, { pack_id: a.pack_id, ordered_shard_bytes: [shardB] },
  ], bridge).map(issue => issue.code), ['SHARD_DIGEST_MISMATCH']);
  assert.deepEqual(checkReleaseSetByteClosure(set, [a, b], supplied.slice(0, 1), bridge)
    .map(issue => issue.code), ['MISSING_PACK_BYTES']);
  assert.deepEqual(checkReleaseSetByteClosure(set, [a, b], [
    ...supplied, supplied[0]!, { pack_id: 'pack:extra', ordered_shard_bytes: [] },
  ], bridge).map(issue => issue.code), ['DUPLICATE_PACK_BYTES', 'UNLISTED_PACK_BYTES']);
  assert.deepEqual(checkReleaseSetByteClosure(set, [a, b], [
    supplied[0]!, { pack_id: a.pack_id, ordered_shard_bytes: [] },
  ], bridge).map(issue => issue.code), ['SHARD_COUNT_MISMATCH']);
  assert.deepEqual(checkReleaseSetByteClosure(set, [a, { ...b, config_digest: 'b'.repeat(64) }],
    supplied, bridge).map(issue => issue.code), ['INVALID_RELEASE_METADATA']);
});

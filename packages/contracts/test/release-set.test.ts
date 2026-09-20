import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canonicalSha256, checkReleaseSetBindings, CONTRACT_VERSION,
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

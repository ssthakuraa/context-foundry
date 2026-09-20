import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import {
  checkCaptureByteClosure, CONTRACT_VERSION, fileManifestDigest, verifyCapturedFileBytes,
  type CapturedFile, type SourceCapture,
} from '../src/index.js';

const raw = Buffer.from([0, 13, 10, 255]);
const digest = createHash('sha256').update(raw).digest('hex');
const file: CapturedFile = {
  schema_version: CONTRACT_VERSION, source_id: 'source:1', snapshot_id: 'snapshot:1',
  path: 'src/binary.dat', file_digest: digest, bytes: raw.length,
  media_kind: 'application/octet-stream', classification: 'internal',
};

test('raw bytes bind by both digest and length without text normalization', () => {
  assert.deepEqual(verifyCapturedFileBytes(file, raw), {
    status: 'exact', actual_digest: digest, actual_bytes: 4,
  });
  assert.equal(verifyCapturedFileBytes(file, Buffer.from([0, 10, 255])).status, 'changed');
  assert.equal(verifyCapturedFileBytes({ ...file, bytes: 5 }, raw).status, 'changed');
  assert.equal(verifyCapturedFileBytes({ ...file, file_digest: 'b'.repeat(64) }, raw).status, 'changed');
  assert.deepEqual(verifyCapturedFileBytes({ ...file, path: '../escape' }, raw), { status: 'invalid_file' });
});

const anotherRaw = Buffer.from('second', 'utf8');
const another: CapturedFile = {
  ...file, path: 'README.md', file_digest: createHash('sha256').update(anotherRaw).digest('hex'),
  bytes: anotherRaw.length,
};
const capture: SourceCapture = {
  schema_version: CONTRACT_VERSION, capture_id: 'capture:1', source_id: file.source_id,
  authority_id: 'team:1', snapshot_id: file.snapshot_id, revision_kind: 'git',
  revision_value: 'abc123', captured_at: '2026-09-20T00:00:00Z',
  file_manifest_digest: fileManifestDigest([file, another]), publication_policy_ref: 'policy:1',
  capture_producer_id: 'producer:1', capture_policy: 'metadata_only', classification: 'internal',
};

test('complete capture bytes close against all declared files without partial success', () => {
  const supplied = [{ path: another.path, bytes: anotherRaw }, { path: file.path, bytes: raw }];
  assert.deepEqual(checkCaptureByteClosure(capture, [file, another], supplied), {
    issues: [], verified_file_digests: [file.file_digest, another.file_digest],
  });
  const missing = checkCaptureByteClosure(capture, [file, another], supplied.slice(0, 1));
  assert.deepEqual(missing.issues.map(issue => issue.code), ['MISSING_SUPPLIED_BYTES']);
  assert.equal(missing.verified_file_digests, undefined);
  assert.deepEqual(checkCaptureByteClosure(capture, [file, another], [
    ...supplied, { path: file.path, bytes: raw }, { path: 'unexpected', bytes: raw },
  ]).issues.map(issue => issue.code), ['DUPLICATE_SUPPLIED_PATH', 'UNDECLARED_SUPPLIED_PATH']);
  assert.deepEqual(checkCaptureByteClosure(capture, [file, another], [
    supplied[0]!, { path: file.path, bytes: Buffer.from([0, 13, 10, 254]) },
  ]).issues.map(issue => issue.code), ['FILE_BYTES_CHANGED']);
  assert.deepEqual(checkCaptureByteClosure({ ...capture, file_manifest_digest: 'b'.repeat(64) },
    [file, another], supplied).issues.map(issue => issue.code), ['CAPTURE_METADATA_INVALID']);
  assert.deepEqual(checkCaptureByteClosure(capture, [file, another], [
    supplied[0]!, { path: file.path, bytes: null as unknown as Uint8Array },
  ]).issues.map(issue => issue.code), ['INVALID_SUPPLIED_BYTES']);
});

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { CONTRACT_VERSION, verifyCapturedFileBytes, type CapturedFile } from '../src/index.js';

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

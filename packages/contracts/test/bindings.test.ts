import assert from 'node:assert/strict';
import test from 'node:test';
import {
  checkCaptureBindings, CONTRACT_VERSION,
  type CapturedFile, type EvidenceLocator, type SourceCapture,
} from '../src/index.js';

const hashA = 'a'.repeat(64);
const hashB = 'b'.repeat(64);
const captureA: SourceCapture = {
  schema_version: CONTRACT_VERSION, capture_id: 'cap:A', source_id: 'repo:A',
  authority_id: 'team:A', snapshot_id: 'snap:1', revision_kind: 'git',
  revision_value: 'rev1', captured_at: '2026-09-20T00:00:00Z',
  file_manifest_digest: hashA, publication_policy_ref: 'policy:A',
  capture_producer_id: 'producer:A', capture_policy: 'metadata_only',
  classification: 'internal',
};
const fileA: CapturedFile = {
  schema_version: CONTRACT_VERSION, source_id: 'repo:A', snapshot_id: 'snap:1',
  path: 'src/Service.java', file_digest: hashA, bytes: 42,
  media_kind: 'text/plain', language_kind: 'java', classification: 'internal',
};
const locatorA: EvidenceLocator = {
  kind: 'file_range', source_id: 'repo:A', snapshot_id: 'snap:1', revision_kind: 'git',
  revision_value: 'rev1', path: 'src/Service.java', file_digest: hashA,
  start_line: 1, end_line: 3,
};

test('same relative path in distinct sources remains distinct', () => {
  const captureB: SourceCapture = { ...captureA, capture_id: 'cap:B', source_id: 'repo:B' };
  const fileB: CapturedFile = { ...fileA, source_id: 'repo:B', file_digest: hashB };
  const locatorB: EvidenceLocator = { ...locatorA, source_id: 'repo:B', file_digest: hashB };
  assert.deepEqual(checkCaptureBindings([captureA, captureB], [fileA, fileB], [locatorA, locatorB]), []);
});

test('digest, source and revision errors remain separate outcomes', () => {
  const { revision_value: _ignored, ...withoutRevision } = locatorA;
  const issues = checkCaptureBindings(
    [captureA], [fileA], [
      { ...locatorA, file_digest: hashB },
      { ...locatorA, revision_value: 'rev2' },
      withoutRevision,
      { ...locatorA, source_id: 'repo:missing' },
    ],
  );
  assert.deepEqual(issues.map(issue => issue.code), [
    'FILE_DIGEST_MISMATCH', 'REVISION_MISMATCH', 'REVISION_MISMATCH', 'UNBOUND_LOCATOR_SOURCE',
  ]);
});

test('missing or duplicate metadata never creates an exact binding', () => {
  assert.deepEqual(checkCaptureBindings([captureA], [], [locatorA]).map(issue => issue.code), ['MISSING_FILE']);
  assert.deepEqual(checkCaptureBindings([captureA], [fileA, fileA], []).map(issue => issue.code), ['DUPLICATE_PATH']);
  assert.deepEqual(checkCaptureBindings([], [fileA], []).map(issue => issue.code), ['UNBOUND_FILE']);
  assert.deepEqual(checkCaptureBindings([captureA, captureA], [], []).map(issue => issue.code), ['DUPLICATE_CAPTURE']);
});

test('unsafe locator shape is rejected before binding', () => {
  const issues = checkCaptureBindings([captureA], [fileA], [{ ...locatorA, path: '../secret' }]);
  assert.deepEqual(issues.map(issue => issue.code), ['INVALID_LOCATOR']);
});

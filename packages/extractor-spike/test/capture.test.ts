import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { checkReleaseIntegrity, CONTRACT_VERSION, fileManifestDigest,
  type CapturedFile, type SourceCapture } from '@context-foundry/contracts';
import { extractTypeScriptCapture } from '../src/capture.js';

function input(text: string | Uint8Array) {
  const bytes = typeof text === 'string' ? new TextEncoder().encode(text) : text;
  const file: CapturedFile = {
    schema_version: CONTRACT_VERSION, source_id: 'repo:synthetic', snapshot_id: 'snap:1',
    path: 'src/approval.ts', file_digest: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.byteLength, media_kind: 'text/typescript', language_kind: 'typescript',
    classification: 'restricted',
  };
  const capture: SourceCapture = {
    schema_version: CONTRACT_VERSION, capture_id: 'capture:1', source_id: 'repo:synthetic',
    authority_id: 'team:synthetic', snapshot_id: 'snap:1', revision_kind: 'git',
    revision_value: 'revision:1', captured_at: '2026-09-20T00:00:00Z',
    file_manifest_digest: fileManifestDigest([file]), publication_policy_ref: 'policy:local-only',
    capture_producer_id: 'producer:synthetic', capture_policy: 'metadata_only',
    classification: 'internal',
  };
  return { capture, file, bytes };
}

test('one supplied file yields deterministic source-bound symbols and explicit partial coverage', () => {
  const source = 'export class Approval { approve(id: string): boolean { return true; } }\n' +
    'export function submit(id: string): void {}';
  const supplied = input(source);
  const first = extractTypeScriptCapture(supplied);
  assert.equal(first.ok, true);
  if (!first.ok) return;
  assert.deepEqual(extractTypeScriptCapture(supplied), first);
  assert.deepEqual(first.records.map(record => record.payload['name']),
    ['Approval', 'approve', 'submit']);
  assert.deepEqual(first.records.map(record => record.classification),
    ['restricted', 'restricted', 'restricted']);
  assert.ok(first.records.every(record => record.evidence_refs.length === 1));
  assert.ok(first.locators.every(locator => locator.file_digest === supplied.file.file_digest &&
    locator.revision_value === supplied.capture.revision_value));
  assert.equal(first.coverage.status, 'partial');
  assert.equal(first.coverage.processed_count, 1);
  assert.ok(first.coverage.known_unsupported.includes('semantic resolution'));
  const integrity = checkReleaseIntegrity([supplied.capture], [supplied.file],
    first.locators, first.records);
  assert.deepEqual(integrity.bindingIssues, []);
  assert.deepEqual(integrity.supportIssues, []);
});

test('changed bytes, forged metadata, unsupported path and invalid UTF-8 fail before records', () => {
  const supplied = input('export class Approval {}');
  assert.deepEqual(extractTypeScriptCapture({ ...supplied, bytes: new TextEncoder().encode('changed') }),
    { ok: false, code: 'BYTES_MISMATCH' });
  assert.deepEqual(extractTypeScriptCapture({ ...supplied, file: { ...supplied.file,
    path: '../approval.ts' } }), { ok: false, code: 'INVALID_METADATA' });
  assert.deepEqual(extractTypeScriptCapture({ ...supplied, capture: { ...supplied.capture,
    file_manifest_digest: 'a'.repeat(64) } }), { ok: false, code: 'CAPTURE_MISMATCH' });
  const tsx = input('export class Approval {}');
  tsx.file.path = 'src/approval.tsx';
  tsx.capture.file_manifest_digest = fileManifestDigest([tsx.file]);
  assert.deepEqual(extractTypeScriptCapture(tsx), { ok: false, code: 'UNSUPPORTED_INPUT' });
  const invalid = input(new Uint8Array([0xff]));
  assert.deepEqual(extractTypeScriptCapture(invalid), { ok: false, code: 'INVALID_UTF8' });
  const oversized = input(new Uint8Array(1024 * 1024 + 1));
  assert.deepEqual(extractTypeScriptCapture(oversized), { ok: false, code: 'SOURCE_TOO_LARGE' });
});

test('syntax failure emits no records and never reports complete coverage', () => {
  const result = extractTypeScriptCapture(input('export class Approval { method( {'));
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.records, []);
  assert.deepEqual(result.locators, []);
  assert.equal(result.coverage.failed_count, 1);
  assert.equal(result.coverage.processed_count, 0);
  assert.equal(result.coverage.status, 'partial');
  assert.deepEqual(result.diagnostics.map(item => item.code), ['PARSE_ERROR']);
});

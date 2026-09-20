import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { CONTRACT_VERSION, fileManifestDigest, type CapturedFile, type SourceCapture,
} from '@context-foundry/contracts';
import { assembleTypeScriptCandidate } from '../src/candidate.js';

function fixture() {
  const content = new Map([
    ['src/a.ts', new TextEncoder().encode('export class Approval {}')],
    ['src/b.ts', new TextEncoder().encode('export function submit(id: string): void {}')],
  ]);
  const files: CapturedFile[] = [...content].map(([path, bytes]) => ({
    schema_version: CONTRACT_VERSION, source_id: 'repo:synthetic', snapshot_id: 'snap:1',
    path, file_digest: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.byteLength, media_kind: 'text/typescript', language_kind: 'typescript',
    classification: 'internal',
  }));
  const capture: SourceCapture = {
    schema_version: CONTRACT_VERSION, capture_id: 'capture:multi',
    source_id: 'repo:synthetic', authority_id: 'team:synthetic', snapshot_id: 'snap:1',
    revision_kind: 'git', revision_value: 'revision:1',
    captured_at: '2026-09-20T00:00:00Z', file_manifest_digest: fileManifestDigest(files),
    publication_policy_ref: 'policy:local-only', capture_producer_id: 'producer:synthetic',
    capture_policy: 'metadata_only', classification: 'internal',
  };
  return { capture, files, supplied: [...content].map(([path, bytes]) => ({ path, bytes })) };
}

test('declared multi-file candidate is deterministic regardless of supplied ordering', () => {
  const original = fixture();
  const first = assembleTypeScriptCandidate(original);
  const reordered = assembleTypeScriptCandidate({ ...original,
    files: [...original.files].reverse(), supplied: [...original.supplied].reverse() });
  assert.equal(first.ok, true, JSON.stringify(first));
  assert.deepEqual(reordered, first);
  if (!first.ok) return;
  assert.equal(first.records.length, 2);
  assert.deepEqual(first.locators.map(locator => locator.path), ['src/a.ts', 'src/b.ts']);
  assert.equal(first.coverage.eligible_count, 2);
  assert.equal(first.coverage.processed_count, 2);
  assert.equal(first.coverage.status, 'partial');
  assert.ok(first.record_lines.includes('engineering.symbol'));
  assert.match(first.candidate_digest, /^[a-f0-9]{64}$/);
});

test('missing, extra, changed or duplicated supplied file prevents any candidate', () => {
  const original = fixture();
  assert.deepEqual(assembleTypeScriptCandidate({ ...original, files: [], supplied: [] }),
    { ok: false, code: 'EMPTY_CAPTURE' });
  const missing = assembleTypeScriptCandidate({ ...original, supplied: original.supplied.slice(0, 1) });
  assert.deepEqual(missing, { ok: false, code: 'CAPTURE_BYTE_CLOSURE' });
  const changed = assembleTypeScriptCandidate({ ...original, supplied: original.supplied.map(item =>
    item.path === 'src/b.ts' ? { ...item, bytes: new TextEncoder().encode('changed') } : item) });
  assert.deepEqual(changed, { ok: false, code: 'CAPTURE_BYTE_CLOSURE' });
  const extra = assembleTypeScriptCandidate({ ...original, supplied: [...original.supplied,
    { path: 'src/secret.ts', bytes: new Uint8Array() }] });
  assert.deepEqual(extra, { ok: false, code: 'CAPTURE_BYTE_CLOSURE' });
  const duplicate = assembleTypeScriptCandidate({ ...original, supplied: [...original.supplied,
    original.supplied[0]!] });
  assert.deepEqual(duplicate, { ok: false, code: 'CAPTURE_BYTE_CLOSURE' });
});

test('syntax errors remain visible as failed file-unit coverage', () => {
  const original = fixture();
  const bytes = new TextEncoder().encode('export class Broken { method( {');
  const files = original.files.map(file => file.path === 'src/b.ts' ? {
    ...file, file_digest: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.byteLength,
  } : file);
  const capture = { ...original.capture, file_manifest_digest: fileManifestDigest(files) };
  const supplied = original.supplied.map(item => item.path === 'src/b.ts' ? { ...item, bytes } : item);
  const result = assembleTypeScriptCandidate({ capture, files, supplied });
  assert.equal(result.ok, true, JSON.stringify(result));
  if (!result.ok) return;
  assert.equal(result.records.length, 1);
  assert.equal(result.coverage.failed_count, 1);
  assert.equal(result.coverage.processed_count, 1);
  assert.deepEqual(result.diagnostics.map(diagnostic => diagnostic.code), ['PARSE_ERROR']);
});

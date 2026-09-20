import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { CONTRACT_VERSION, fileManifestDigest, type CapturedFile, type SourceCapture,
} from '@context-foundry/contracts';
import { assembleTypeScriptCandidate } from '../src/candidate.js';
import { searchLocalSymbols } from '../src/retrieval.js';

function candidate() {
  const bytes = new TextEncoder().encode(
    'export class ApprovalService { approve(id: string): boolean { return true; } }\n' +
    'export function submit(): void {}');
  const file: CapturedFile = {
    schema_version: CONTRACT_VERSION, source_id: 'repo:synthetic', snapshot_id: 'snap:search',
    path: 'src/approval.ts', file_digest: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.byteLength, media_kind: 'text/typescript', language_kind: 'typescript',
    classification: 'internal',
  };
  const capture: SourceCapture = {
    schema_version: CONTRACT_VERSION, capture_id: 'capture:search',
    source_id: 'repo:synthetic', authority_id: 'team:synthetic', snapshot_id: 'snap:search',
    revision_kind: 'supplied_snapshot', captured_at: '2026-09-20T00:00:00Z',
    file_manifest_digest: fileManifestDigest([file]), publication_policy_ref: 'policy:local-only',
    capture_producer_id: 'producer:synthetic', capture_policy: 'metadata_only',
    classification: 'internal',
  };
  const result = assembleTypeScriptCandidate({ capture, files: [file],
    supplied: [{ path: file.path, bytes }] });
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error('synthetic candidate failed');
  return result;
}

test('exact qualified symbol wins and returns a digest-bound source pointer', () => {
  const result = searchLocalSymbols(candidate(), 'ApprovalService.approve');
  assert.equal(result.warning, 'LOCAL_ONLY_PARTIAL_COVERAGE');
  assert.equal(result.coverage_status, 'partial');
  assert.equal(result.candidates[0]?.qualified_name, 'ApprovalService.approve');
  assert.equal(result.candidates[0]?.match_reason, 'exact_qualified_name');
  assert.equal(result.candidates[0]?.locator.path, 'src/approval.ts');
  assert.equal(result.candidates[0]?.locator.kind, 'file_range');
  assert.equal(result.candidates[0]?.origin, 'source_declared');
  assert.equal(result.candidates[0]?.review_state, 'pending');
  assert.equal(result.candidates[0]?.classification, 'internal');
});

test('short name and path tokens are lexical matches, not behavior claims', () => {
  const prepared = candidate();
  assert.equal(searchLocalSymbols(prepared, 'approve').candidates[0]?.name, 'approve');
  assert.equal(searchLocalSymbols(prepared, 'submit', 1).candidates.length, 1);
  assert.equal(searchLocalSymbols(prepared, 'calculates discount').candidates.length, 0);
  const withoutLocators = { ...prepared, locators: [] };
  assert.deepEqual(searchLocalSymbols(withoutLocators, 'approve').candidates, []);
});

test('empty, control-character, oversized and unbounded queries are rejected', () => {
  const prepared = candidate();
  for (const query of ['', '  ', 'approve\nanything', 'x'.repeat(513)]) {
    const result = searchLocalSymbols(prepared, query);
    assert.equal(result.warning, 'INVALID_QUERY');
    assert.deepEqual(result.candidates, []);
  }
  assert.equal(searchLocalSymbols(prepared, 'approve', 21).warning, 'INVALID_QUERY');
});

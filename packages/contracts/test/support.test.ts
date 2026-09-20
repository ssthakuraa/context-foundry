import assert from 'node:assert/strict';
import test from 'node:test';
import {
  checkReleaseIntegrity, checkSupportClosure, CONTRACT_VERSION, fileManifestDigest,
  type CapturedFile, type EvidenceLocator, type RecordEnvelope, type SourceCapture,
} from '../src/index.js';

const digest = 'a'.repeat(64);
const locator = (evidenceId: string): EvidenceLocator => ({
  kind: 'file', evidence_id: evidenceId, source_id: 'repo:demo', snapshot_id: 'snap:1',
  revision_kind: 'git', revision_value: 'rev1', path: 'src/A.ts', file_digest: digest,
});
const record = (recordId: string, evidenceRefs: string[], dependencyRefs: string[] = []): RecordEnvelope => ({
  schema_version: CONTRACT_VERSION, record_id: recordId, entity_id: `entity:${recordId}`,
  kind: 'engineering.symbol', owner_id: 'team:demo', origin: 'source_declared',
  review: { state: 'not_required' },
  payload: { name: recordId, artifact_kind: 'type', language: 'typescript' },
  evidence_refs: evidenceRefs, dependency_refs: dependencyRefs, classification: 'internal',
});

test('transitive support resolves forward references and deduplicates evidence', () => {
  const result = checkSupportClosure([
    record('rec:top', ['ev:top'], ['rec:mid', 'rec:base']),
    record('rec:mid', [], ['rec:base']),
    record('rec:base', ['ev:base']),
  ], [locator('ev:top'), locator('ev:base')]);
  assert.deepEqual(result.issues, []);
  assert.deepEqual(result.evidenceByRecord?.get('rec:top'), ['ev:base', 'ev:top']);
  assert.deepEqual(result.evidenceByRecord?.get('rec:mid'), ['ev:base']);
  assert.deepEqual(result.evidenceByRecord?.get('rec:base'), ['ev:base']);
});

test('missing and duplicate support fails closed without a partial closure', () => {
  const result = checkSupportClosure([
    record('rec:one', ['ev:missing'], ['rec:missing']),
  ], [locator('ev:known')]);
  assert.deepEqual(result.issues.map(issue => issue.code), ['MISSING_EVIDENCE', 'MISSING_DEPENDENCY']);
  assert.equal(result.evidenceByRecord, undefined);
  assert.deepEqual(checkSupportClosure([record('rec:one', []), record('rec:one', [])], [])
    .issues.map(issue => issue.code), ['DUPLICATE_RECORD_ID']);
  assert.deepEqual(checkSupportClosure([], [locator('ev:one'), locator('ev:one')])
    .issues.map(issue => issue.code), ['DUPLICATE_EVIDENCE_ID']);
  const orphan = checkSupportClosure([record('rec:orphan', [])], []);
  assert.deepEqual(orphan.issues.map(issue => issue.code), ['MISSING_TRANSITIVE_SUPPORT']);
  assert.equal(orphan.evidenceByRecord, undefined);
});

test('cycles and records blocked by cycles are diagnosed, never published as closure', () => {
  const result = checkSupportClosure([
    record('rec:a', [], ['rec:b']),
    record('rec:b', [], ['rec:a']),
    record('rec:dependent', [], ['rec:a']),
  ], []);
  assert.deepEqual(result.issues.map(issue => issue.code), [
    'DEPENDENCY_CYCLE_OR_BLOCKED', 'DEPENDENCY_CYCLE_OR_BLOCKED',
    'DEPENDENCY_CYCLE_OR_BLOCKED',
  ]);
  assert.equal(result.evidenceByRecord, undefined);
});

test('relationship support must be declared in the envelope dependencies', () => {
  const relationship: RecordEnvelope = {
    ...record('rec:relationship', ['ev:relation']), kind: 'engineering.relationship',
    payload: {
      subject_id: 'entity:A', object_id: 'entity:B', relation_type: 'engineering.calls',
      direction: 'subject_to_object', resolution_method: 'syntax',
      evidence_refs: ['ev:relation'], supporting_record_refs: ['rec:base'],
    },
  };
  const result = checkSupportClosure([
    relationship, record('rec:base', ['ev:base']),
  ], [locator('ev:relation'), locator('ev:base')]);
  assert.deepEqual(result.issues.map(issue => issue.code), ['UNDECLARED_RELATIONSHIP_SUPPORT']);
  assert.equal(result.evidenceByRecord, undefined);
  const declared = checkSupportClosure([
    { ...relationship, dependency_refs: ['rec:base'] }, record('rec:base', ['ev:base']),
  ], [locator('ev:relation'), locator('ev:base')]);
  assert.deepEqual(declared.evidenceByRecord?.get('rec:relationship'), ['ev:base', 'ev:relation']);
});

test('invalid locators and records cannot contribute support', () => {
  const badLocator = { ...locator('ev:bad'), path: '../private' };
  const badRecord = { ...record('rec:bad', []), origin: 'invented' };
  const result = checkSupportClosure([badRecord as RecordEnvelope], [badLocator]);
  assert.deepEqual(result.issues.map(issue => issue.code), ['INVALID_EVIDENCE', 'INVALID_RECORD']);
  assert.equal(result.evidenceByRecord, undefined);
});

test('combined integrity gate withholds closure when capture metadata is inconsistent', () => {
  const file: CapturedFile = {
    schema_version: CONTRACT_VERSION, source_id: 'repo:demo', snapshot_id: 'snap:1',
    path: 'src/A.ts', file_digest: digest, bytes: 10, media_kind: 'text/plain',
    classification: 'internal',
  };
  const capture: SourceCapture = {
    schema_version: CONTRACT_VERSION, capture_id: 'cap:1', source_id: 'repo:demo',
    authority_id: 'team:demo', snapshot_id: 'snap:1', revision_kind: 'git',
    revision_value: 'rev1', captured_at: '2026-09-20T00:00:00Z',
    file_manifest_digest: fileManifestDigest([file]), publication_policy_ref: 'policy:1',
    capture_producer_id: 'producer:1', capture_policy: 'metadata_only',
    classification: 'internal',
  };
  const good = checkReleaseIntegrity([capture], [file], [locator('ev:one')],
    [record('rec:one', ['ev:one'])]);
  assert.deepEqual(good.bindingIssues, []);
  assert.deepEqual(good.supportIssues, []);
  assert.deepEqual(good.evidenceByRecord?.get('rec:one'), ['ev:one']);

  const altered = checkReleaseIntegrity([capture], [{ ...file, bytes: 11 }],
    [locator('ev:one')], [record('rec:one', ['ev:one'])]);
  assert.deepEqual(altered.bindingIssues.map(issue => issue.code), ['FILE_MANIFEST_DIGEST_MISMATCH']);
  assert.deepEqual(altered.supportIssues, []);
  assert.equal(altered.evidenceByRecord, undefined);
});

test('oversized transitive support fails closed', () => {
  const ids = Array.from({ length: 10_001 }, (_, index) => `ev:${index}`);
  const result = checkSupportClosure([record('rec:large', ids)], ids.map(locator));
  assert.deepEqual(result.issues.map(issue => issue.code), ['SUPPORT_LIMIT_EXCEEDED']);
  assert.equal(result.evidenceByRecord, undefined);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { checkCrossPackEntityOwnership, CONTRACT_VERSION, type RecordEnvelope } from '../src/index.js';

const record = (entity: string, recordId: string): RecordEnvelope => ({
  schema_version: CONTRACT_VERSION, record_id: recordId, entity_id: entity,
  kind: 'engineering.symbol', owner_id: 'team:A', origin: 'source_declared',
  review: { state: 'not_required' }, payload: {
    name: 'Service', artifact_kind: 'type', language: 'typescript',
  }, evidence_refs: ['ev:1'], dependency_refs: [], classification: 'internal',
});

test('two packs may reference each other but cannot independently own the same entity', () => {
  assert.deepEqual(checkCrossPackEntityOwnership([
    { pack_id: 'pack:A', records: [record('repo:A:Service', 'rec:A')] },
    { pack_id: 'pack:B', records: [record('repo:B:Consumer', 'rec:B')] },
  ]), []);
  assert.deepEqual(checkCrossPackEntityOwnership([
    { pack_id: 'pack:A', records: [record('business:approval', 'rec:A')] },
    { pack_id: 'pack:B', records: [record('business:approval', 'rec:B')] },
  ]).map(issue => issue.code), ['CROSS_PACK_ENTITY_OWNER_CONFLICT']);
  assert.deepEqual(checkCrossPackEntityOwnership([
    { pack_id: 'pack:A', records: [record('business:approval', 'rec:A'),
      record('business:approval', 'rec:A:other-assertion')] },
  ]), []);
});

test('malformed records and ambiguous group identities cannot establish ownership', () => {
  assert.deepEqual(checkCrossPackEntityOwnership([
    { pack_id: 'pack:A', records: [record('repo:A:Service', 'rec:A')] },
    { pack_id: 'pack:A', records: [record('repo:B:Service', 'rec:B')] },
  ]).map(issue => issue.code), ['DUPLICATE_PACK_GROUP']);
  assert.deepEqual(checkCrossPackEntityOwnership([
    { pack_id: '', records: [] },
  ]).map(issue => issue.code), ['INVALID_PACK_GROUP']);
  assert.deepEqual(checkCrossPackEntityOwnership([
    { pack_id: 'pack:A', records: [{ ...record('repo:A:Service', 'rec:A'), kind: 'unknown.kind' }] },
  ]).map(issue => issue.code), ['INVALID_PACK_RECORD']);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { CONTRACT_VERSION, Schemas, validate, validationErrors } from '../src/index.js';

const hash = 'a'.repeat(64);

test('all core schemas compile in strict mode', () => {
  assert.equal(Object.keys(Schemas).length, 5);
});

test('capture accepts a bounded source identity and rejects unknown fields', () => {
  const capture = {
    schema_version: CONTRACT_VERSION, capture_id: 'cap:1', source_id: 'repo:demo',
    logical_authority: 'team:demo', uri: 'src/Service.java', revision_kind: 'git',
    revision: '0123456', content_sha256: hash, capture_policy: 'metadata_only',
    classification: 'internal',
  };
  assert.equal(validate('source_capture', capture), true);
  assert.equal(validate('source_capture', { ...capture, secret: 'hidden' }), false);
  assert.match(validationErrors('source_capture').join(' '), /additional properties/);
  assert.equal(validate('source_capture', { ...capture, content_sha256: 'wrong' }), false);
  assert.equal(validate('source_capture', { ...capture, schema_version: '0.1.0' }), false);
});

test('locators discriminate file lines from document sections', () => {
  assert.equal(validate('evidence_locator', {
    kind: 'file_range', capture_id: 'cap:1', path: 'src/Service.java',
    start_line: 3, end_line: 9, content_sha256: hash,
  }), true);
  assert.equal(validate('evidence_locator', {
    kind: 'document_section', capture_id: 'cap:1', section: 'Policy > Approval', content_sha256: hash,
  }), true);
  assert.equal(validate('evidence_locator', {
    kind: 'file_range', capture_id: 'cap:1', path: 'src/Service.java',
    start_line: 0, end_line: 9, content_sha256: hash,
  }), false);
});

test('record envelope retains origin and review as separate dimensions', () => {
  const record = {
    schema_version: CONTRACT_VERSION, record_id: 'rec:1', entity_id: 'repo:demo:symbol:A.m',
    kind: 'engineering.symbol', owner_id: 'team:demo', origin: 'source_declared',
    review: { state: 'not_required' }, payload: { name: 'm' }, evidence_refs: ['ev:1'],
    dependency_refs: [], classification: 'internal',
  };
  assert.equal(validate('record_envelope', record), true);
  assert.equal(validate('record_envelope', { ...record, review: { state: 'approved', reviewer: 'agent' } }), false);
  assert.equal(validate('record_envelope', { ...record, origin: 'unknown' }), false);
});

test('coverage and release manifest reject unsupported values', () => {
  const coverage = {
    schema_version: CONTRACT_VERSION, source_id: 'repo:demo', revision: 'r1',
    adapter_id: 'java:0.1', facet: 'spring-routes', status: 'partial', reason: 'dynamic registration',
  };
  assert.equal(validate('coverage', coverage), true);
  assert.equal(validate('coverage', { ...coverage, status: 'probably-complete' }), false);
  const release = {
    schema_version: CONTRACT_VERSION, pack_id: 'pack:demo', release_id: 'r:1',
    source_manifest_digests: [hash], adapter_digest: hash, config_digest: hash,
    ordered_shard_digests: [], coverage_refs: [], validation_refs: [], created_by: 'human:1',
  };
  assert.equal(validate('release_manifest', release), true);
  assert.equal(validate('release_manifest', { ...release, source_manifest_digests: [] }), false);
});

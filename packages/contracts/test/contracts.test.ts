import assert from 'node:assert/strict';
import test from 'node:test';
import { CONTRACT_VERSION, Schemas, validate, validationErrors } from '../src/index.js';

const hash = 'a'.repeat(64);

test('all core schemas compile in strict mode', () => {
  assert.equal(Object.keys(Schemas).length, 9);
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

test('task artifact requires an immutable envelope and rejects unknown kinds', () => {
  const artifact = {
    schema_version: CONTRACT_VERSION, artifact_id: 'artifact:1', task_id: 'task:1',
    kind: 'scope_map', version: 1, body_digest: hash, created_by: 'agent:1',
    origin: 'agent', created_at: '2026-09-20T00:00:00Z', release_set_id: 'release-set:1',
    evidence_refs: ['ev:1'], visibility_requirements: ['ev:1'], body: { questions: ['q1'] },
  };
  assert.equal(validate('task_artifact', artifact), true);
  assert.equal(validate('task_artifact', { ...artifact, kind: 'agent_approval' }), false);
  assert.equal(validate('task_artifact', { ...artifact, body_digest: 'not-a-digest' }), false);
  assert.equal(validate('task_artifact', { ...artifact, approved: true }), false);
});

test('human decision receipt is server-shaped but not proof of authority', () => {
  const receipt = {
    schema_version: CONTRACT_VERSION, decision_id: 'decision:1', task_id: 'task:1',
    gate: 'scope', artifact_id: 'artifact:1', artifact_version: 1, artifact_digest: hash,
    outcome: 'accept', reviewer_subject: 'human:1', authority_kind: 'verified_human_session',
    permitted_actions: [], permitted_scope: [], expected_task_version: 1,
    issued_at: '2026-09-20T00:00:00Z',
  };
  assert.equal(validate('human_decision_receipt', receipt), true);
  assert.equal(validate('human_decision_receipt', { ...receipt, authority_kind: 'agent_token' }), false);
  assert.equal(validate('human_decision_receipt', { ...receipt, task_id: undefined }), false);
});

test('task errors use bounded codes without leaking arbitrary details', () => {
  const error = {
    schema_version: CONTRACT_VERSION, code: 'NOT_FOUND_OR_NOT_VISIBLE',
    message: 'Not found or not visible', correlation_id: 'trace:1',
  };
  assert.equal(validate('task_error', error), true);
  assert.equal(validate('task_error', { ...error, code: 'HIDDEN_SOURCE_EXISTS' }), false);
  assert.equal(validate('task_error', { ...error, hidden_source: 'repo:secret' }), false);
});

test('evaluation manifest records comparable arm and unknown cache state', () => {
  const manifest = {
    schema_version: CONTRACT_VERSION, run_id: 'run:1', task_id: 'task:1', arm: 'A', attempt: 1,
    corpus_manifest_digest: hash, task_input_digest: hash, instruction_digest: hash,
    model_id: 'model:1', model_effort: 'medium', host_id: 'host:1',
    policy_generation: 'policy:1', cache_state: 'unknown', status: 'planned',
    started_at: '2026-09-20T00:00:00Z',
  };
  assert.equal(validate('evaluation_run_manifest', manifest), true);
  assert.equal(validate('evaluation_run_manifest', { ...manifest, arm: 'uncontrolled' }), false);
  assert.equal(validate('evaluation_run_manifest', { ...manifest, attempt: 0 }), false);
});

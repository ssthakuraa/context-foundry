import assert from 'node:assert/strict';
import test from 'node:test';
import { checkEngineeringTargetLinks, CONTRACT_VERSION, type RecordEnvelope } from '../src/index.js';

const symbol: RecordEnvelope = {
  schema_version: CONTRACT_VERSION, record_id: 'rec:service', entity_id: 'repo:A:ApprovalService.submit',
  kind: 'engineering.symbol', owner_id: 'team:A', origin: 'source_declared',
  review: { state: 'pending' }, evidence_refs: ['ev:service'], dependency_refs: [],
  classification: 'internal', payload: {
    name: 'submit', artifact_kind: 'method', language: 'java', signature: 'submit(Request)',
  },
};
const operation: RecordEnvelope = {
  ...symbol, record_id: 'rec:operation', entity_id: 'api:submit', kind: 'interface.operation',
  payload: { interface_id: 'api:approval', operation_key: 'submit', protocol: 'http',
    http_method: 'POST', route_template: '/approval',
    implementation_entity_ref: symbol.entity_id },
};
const association: RecordEnvelope = {
  ...symbol, record_id: 'rec:test-association', entity_id: 'association:approval',
  kind: 'test.association', origin: 'static_resolution',
  payload: { test_entity_id: 'repo:A:ApprovalTest.submit', target_entity_id: symbol.entity_id,
    target_kind: 'engineering_entity', association_basis: 'static_reference',
    expected_scope: 'approval submission' },
};

test('explicit implementation and engineering test targets require exact unique symbols', () => {
  assert.deepEqual(checkEngineeringTargetLinks([symbol, operation, association]), []);
  assert.deepEqual(checkEngineeringTargetLinks([operation, association]).map(issue => issue.code),
    ['MISSING_IMPLEMENTATION_ENTITY', 'MISSING_TEST_TARGET_ENTITY']);
  assert.deepEqual(checkEngineeringTargetLinks([symbol, { ...symbol, record_id: 'rec:duplicate' },
    operation, association]).map(issue => issue.code),
  ['DUPLICATE_ENGINEERING_ENTITY', 'AMBIGUOUS_IMPLEMENTATION_ENTITY', 'AMBIGUOUS_TEST_TARGET_ENTITY']);
});

test('optional implementation pointer and obligation targets do not claim an engineering symbol', () => {
  const { implementation_entity_ref: _, ...payload } = operation.payload as Record<string, unknown>;
  assert.deepEqual(checkEngineeringTargetLinks([{ ...operation, payload }, { ...association,
    payload: { ...association.payload, target_kind: 'behavior_obligation',
      target_entity_id: 'obligation:approval' },
  }]), []);
});

test('invalid symbols cannot satisfy a typed pointer', () => {
  assert.deepEqual(checkEngineeringTargetLinks([{ ...symbol, payload: { ...symbol.payload,
    signature: '' } }, operation]).map(issue => issue.code), ['MISSING_IMPLEMENTATION_ENTITY']);
});

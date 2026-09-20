import assert from 'node:assert/strict';
import test from 'node:test';
import { checkObligationLinks, CONTRACT_VERSION, type RecordEnvelope } from '../src/index.js';

const obligation: RecordEnvelope = {
  schema_version: CONTRACT_VERSION, record_id: 'rec:obligation', entity_id: 'obligation:approval',
  kind: 'behavior.obligation', owner_id: 'team:domain', origin: 'human_asserted',
  review: { state: 'pending' }, evidence_refs: ['ev:requirement'], dependency_refs: [],
  classification: 'internal', payload: {
    name: 'Approve', expected_outcome: 'A reviewer approves above threshold',
    condition_refs: [], applicability: { status: 'bounded', product_ids: ['product:A'] },
    validation_intent: 'Exercise above threshold',
  },
};
const step: RecordEnvelope = {
  ...obligation, record_id: 'rec:step', entity_id: 'step:approve', kind: 'business.flow_step',
  payload: { flow_entity_id: 'flow:p2p', name: 'Approve', product_id: 'product:A',
    precondition_refs: [], outcome_refs: ['obligation:approval'],
    applicability: { status: 'bounded', product_ids: ['product:A'] } },
};
const association: RecordEnvelope = {
  ...obligation, record_id: 'rec:association', entity_id: 'test:approval',
  kind: 'test.association', origin: 'static_resolution',
  payload: { test_entity_id: 'test:approval', target_entity_id: 'obligation:approval',
    target_kind: 'behavior_obligation', association_basis: 'static_reference',
    expected_scope: 'above threshold',
  },
};

test('outcome and test obligation references resolve to an explicit obligation record', () => {
  assert.deepEqual(checkObligationLinks([obligation, step, association]), []);
  assert.deepEqual(checkObligationLinks([step, association]).map(issue => issue.code),
    ['MISSING_OUTCOME_OBLIGATION', 'MISSING_TEST_TARGET_OBLIGATION']);
  assert.deepEqual(checkObligationLinks([obligation, { ...obligation, record_id: 'rec:duplicate' }])
    .map(issue => issue.code), ['DUPLICATE_OBLIGATION_ENTITY']);
  assert.deepEqual(checkObligationLinks([{ ...obligation, payload: { ...obligation.payload,
    expected_outcome: '' } }, step]).map(issue => issue.code),
    ['INVALID_OBLIGATION_RECORD', 'MISSING_OUTCOME_OBLIGATION']);
});

test('engineering test targets remain outside this obligation-only check', () => {
  assert.deepEqual(checkObligationLinks([{ ...association, payload: {
    ...association.payload, target_kind: 'engineering_entity', target_entity_id: 'repo:A:Service',
  } }]), []);
});

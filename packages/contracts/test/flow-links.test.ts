import assert from 'node:assert/strict';
import test from 'node:test';
import { checkBusinessFlowLinks, CONTRACT_VERSION, type RecordEnvelope } from '../src/index.js';

const flow: RecordEnvelope = {
  schema_version: CONTRACT_VERSION, record_id: 'rec:flow', entity_id: 'flow:p2p',
  kind: 'business.flow', owner_id: 'team:domain', origin: 'human_asserted',
  review: { state: 'pending' }, evidence_refs: ['ev:flow'], dependency_refs: [],
  classification: 'internal', payload: {
    name: 'Procure to Pay', domain_id: 'domain:procurement',
    ordered_step_ids: ['step:request', 'step:approve'],
    applicability: { status: 'bounded', product_ids: ['product:A'] },
  },
};
const request: RecordEnvelope = {
  ...flow, record_id: 'rec:request', entity_id: 'step:request', kind: 'business.flow_step',
  payload: { flow_entity_id: 'flow:p2p', name: 'Request', product_id: 'product:A',
    precondition_refs: [], outcome_refs: [], applicability: { status: 'bounded', product_ids: ['product:A'] } },
};
const approve: RecordEnvelope = {
  ...request, record_id: 'rec:approve', entity_id: 'step:approve',
};

test('flow links require listed, uniquely identified steps with matching parent', () => {
  assert.deepEqual(checkBusinessFlowLinks([flow, request, approve]), []);
  assert.deepEqual(checkBusinessFlowLinks([flow, request]).map(issue => issue.code), ['MISSING_FLOW_STEP']);
  assert.deepEqual(checkBusinessFlowLinks([flow, request, { ...approve, payload: {
    ...approve.payload, flow_entity_id: 'flow:other',
  } }]).map(issue => issue.code), ['STEP_PARENT_MISMATCH', 'MISSING_PARENT_FLOW']);
  assert.deepEqual(checkBusinessFlowLinks([flow, request, approve, {
    ...request, record_id: 'rec:extra', entity_id: 'step:extra',
  }]).map(issue => issue.code), ['UNLISTED_FLOW_STEP']);
});

test('missing parent, duplicate identities and malformed flow payloads fail closed', () => {
  assert.deepEqual(checkBusinessFlowLinks([request]).map(issue => issue.code), ['MISSING_PARENT_FLOW']);
  assert.deepEqual(checkBusinessFlowLinks([flow, request, approve, { ...approve, record_id: 'rec:dup' }])
    .map(issue => issue.code), ['DUPLICATE_STEP_ENTITY']);
  assert.deepEqual(checkBusinessFlowLinks([flow, { ...flow, record_id: 'rec:dup' }, request, approve])
    .map(issue => issue.code), ['DUPLICATE_FLOW_ENTITY']);
  assert.deepEqual(checkBusinessFlowLinks([{ ...flow, payload: { ...flow.payload, ordered_step_ids: [] } },
    request, approve]).map(issue => issue.code),
    ['INVALID_FLOW_RECORD', 'MISSING_PARENT_FLOW', 'MISSING_PARENT_FLOW']);
});

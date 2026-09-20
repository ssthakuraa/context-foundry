import assert from 'node:assert/strict';
import test from 'node:test';
import {
  checkKindHandshake, CONTRACT_VERSION, validate,
  type ConsumerCapabilities, type ProducerCapabilities, type RecordEnvelope,
} from '../src/index.js';

const producer: ProducerCapabilities = {
  schema_version: CONTRACT_VERSION, producer_id: 'adapter:ts', adapter_digest: 'a'.repeat(64),
  record_kinds: ['engineering.symbol', 'test.association'],
  declared_unsupported: ['dynamic-router-registration'],
};
const consumer: ConsumerCapabilities = {
  schema_version: CONTRACT_VERSION, consumer_id: 'retriever:1',
  required_kinds: ['engineering.symbol'],
  accepted_kinds: ['engineering.symbol', 'test.association'],
};
const record: RecordEnvelope = {
  schema_version: CONTRACT_VERSION, record_id: 'rec:1', entity_id: 'repo:A:Symbol',
  kind: 'engineering.symbol', owner_id: 'team:A', origin: 'source_declared',
  review: { state: 'not_required' }, payload: {
    name: 'Symbol', artifact_kind: 'type', language: 'typescript',
  }, evidence_refs: ['ev:1'], dependency_refs: [], classification: 'internal',
};

test('producer and consumer explicitly agree on required and emitted kinds', () => {
  assert.deepEqual(checkKindHandshake(producer, consumer, [record]), []);
  assert.deepEqual(checkKindHandshake({ ...producer, record_kinds: ['test.association'] }, consumer)
    .map(issue => issue.code), ['MISSING_REQUIRED_KIND']);
  assert.deepEqual(checkKindHandshake(producer, { ...consumer, accepted_kinds: ['engineering.symbol'] })
    .map(issue => issue.code), ['UNACCEPTED_PRODUCED_KIND']);
  assert.deepEqual(checkKindHandshake({ ...producer, record_kinds: ['test.association'] },
    { ...consumer, required_kinds: [], accepted_kinds: ['test.association'] }, [record])
    .map(issue => issue.code), ['UNDECLARED_RECORD_KIND']);
});

test('unknown, duplicate and malformed capabilities cannot negotiate extension by accident', () => {
  assert.equal(validate('producer_capabilities', { ...producer, record_kinds: ['engineering.unknown'] }), false);
  assert.equal(validate('producer_capabilities', { ...producer,
    record_kinds: ['engineering.symbol', 'engineering.symbol'] }), false);
  assert.equal(validate('consumer_capabilities', { ...consumer,
    required_kinds: ['business.rule'] }), false);
  assert.deepEqual(checkKindHandshake({ ...producer, record_kinds: ['engineering.unknown'] } as unknown as ProducerCapabilities,
    consumer).map(issue => issue.code), ['INVALID_PRODUCER']);
  assert.deepEqual(checkKindHandshake(producer, consumer, [{ ...record, payload: { name: 'Symbol' } }])
    .map(issue => issue.code), ['INVALID_PRODUCED_RECORD']);
});

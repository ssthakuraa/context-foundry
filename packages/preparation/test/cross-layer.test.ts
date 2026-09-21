import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileManifestDigest, type CapturedFile, type SourceCapture } from '@context-foundry/contracts';
import { assembleCrossLayerCandidate, type CrossLayerInput } from '../src/cross-layer.js';

const paths = ['business.md', 'openapi.json', 'RepairController.java',
  'RepairService.java', 'RepairRequest.java', 'RepairServiceTest.java',
  'schema.sql', 'client.ts'];

function input(): CrossLayerInput {
  const supplied = paths.map(path => ({ path, bytes: readFileSync(
    new URL(`../../../extractor-spike/fixtures/cross-layer/${path}`, import.meta.url)) }));
  const files: CapturedFile[] = supplied.map(item => ({
    schema_version: '0.2.0', source_id: 'repo:synthetic-repairs', snapshot_id: 'snap:fixture-1',
    path: item.path, file_digest: createHash('sha256').update(item.bytes).digest('hex'),
    bytes: item.bytes.byteLength, media_kind: item.path.endsWith('.json') ? 'application/json' : 'text/plain',
    classification: 'public',
  }));
  const capture: SourceCapture = {
    schema_version: '0.2.0', capture_id: 'cap:fixture-1', source_id: 'repo:synthetic-repairs',
    authority_id: 'team:fixture', snapshot_id: 'snap:fixture-1',
    revision_kind: 'supplied_snapshot', captured_at: '2026-09-20T00:00:00Z',
    file_manifest_digest: fileManifestDigest(files),
    publication_policy_ref: 'policy:synthetic', capture_producer_id: 'test:fixture',
    capture_policy: 'approved_content', classification: 'public',
  };
  return {
    capture: { capture, files, supplied }, service_id: 'fixture:repairs', sql_dialect: 'oracle',
    reviewed_mappings: [{ business_section: 'Approving a request',
      operation_key: 'POST /v1/repairs/{id}/approve',
      reviewer_id: 'fixture-domain-reviewer', applicability: 'synthetic repairs' }],
    reviewed_test_associations: [{
      test_signature: 'fixture.repairs.RepairServiceTest.rejectsSecondApproval()',
      target_signature: 'fixture.repairs.RepairService.approve(String)',
      reviewer_id: 'fixture-domain-reviewer', expected_scope: 'second approval rejection',
    }],
  };
}

function replaceFile(source: CrossLayerInput, path: string, bytes: Uint8Array): CrossLayerInput {
  const supplied = source.capture.supplied.map(item => item.path === path ? { ...item, bytes } : item);
  const files = source.capture.files.map(item => item.path === path ? {
    ...item, bytes: bytes.byteLength, file_digest: createHash('sha256').update(bytes).digest('hex'),
  } : item);
  return { ...source, capture: { capture: { ...source.capture.capture,
    file_manifest_digest: fileManifestDigest(files) }, files, supplied } };
}

test('actual synthetic bytes yield a bounded business/API/service/data/test path', async () => {
  const result = await assembleCrossLayerCandidate(input());
  assert.equal(result.ok, true, JSON.stringify(result));
  if (!result.ok) return;
  const { records, locators, coverage } = result.candidate;
  const oracle = JSON.parse(readFileSync(new URL(
    '../../../extractor-spike/fixtures/cross-layer/expected.json', import.meta.url), 'utf8')) as {
      required_declarations: { identity: string }[];
      required_relationships: { from: string; to: string }[];
    };
  for (const declared of oracle.required_declarations) {
    assert.ok(records.some(item => item.identity.key.toLowerCase().includes(declared.identity.toLowerCase()) ||
      item.descriptor.name.toLowerCase().includes(declared.identity.toLowerCase()) ||
      item.payload['operation_key'] === declared.identity),
    `missing ${declared.identity}`);
  }
  for (const edge of oracle.required_relationships) {
    const from = edge.from.replace(' ', '|').toLowerCase();
    assert.ok(records.some(item => item.kind === 'engineering.relationship' &&
      item.identity.key.toLowerCase().includes(from) &&
      item.identity.key.toLowerCase().includes(edge.to.toLowerCase())),
    `missing ${edge.from} -> ${edge.to}`);
  }
  assert.equal(coverage.length, paths.length);
  const symbols = records.filter(item => item.kind === 'engineering.symbol')
    .map(item => item.identity.key);
  assert.ok(symbols.includes('fixture.repairs.RepairController.approve(String)'));
  assert.ok(symbols.includes('fixture.repairs.RepairService.approve(String)'));
  assert.ok(symbols.includes('fixture.repairs.RepairServiceTest.rejectsSecondApproval()'));
  assert.ok(records.some(item => item.kind === 'interface.operation' &&
    item.payload['route'] === '/v1/repairs/{id}/approve'));
  assert.ok(records.some(item => item.kind === 'source.artifact' &&
    item.payload['artifact_type'] === 'sql_table' && item.payload['name'] === 'REPAIR_REQUEST'));
  assert.ok(records.some(item => item.kind === 'business.rule' &&
    String(item.payload['statement']).includes('coordinator')));
  assert.deepEqual(records.filter(item => item.kind === 'engineering.relationship')
    .map(item => item.payload['relation_type']).sort(), [
    'api.implemented_by', 'engineering.calls', 'engineering.calls', 'engineering.persisted_in',
  ]);
  assert.ok(records.some(item => item.kind === 'engineering.relationship' &&
    item.identity.key.includes('RepairController.approve(String)') &&
    item.identity.key.includes('RepairService.approve(String)')));
  const businessMapping = records.find(item => item.kind === 'business.mapping');
  assert.equal(businessMapping?.review.state, 'approved');
  assert.equal(businessMapping?.origin, 'human_asserted');
  const testAssociation = records.find(item => item.kind === 'test.association');
  assert.equal(testAssociation?.payload['association_basis'], 'reviewed_relevance');
  assert.ok(locators.some(item => item.path === 'RepairService.java'));
  assert.ok(!records.some(item => JSON.stringify(item).includes('phantom_request')));
  assert.ok(!records.some(item => JSON.stringify(item).includes('passed')));
  assert.ok(!records.some(item => item.kind === 'engineering.relationship' &&
    JSON.stringify(item).includes('approveRepairMaybe')));
});

test('candidate is deterministic and changed bytes fail before parsing', async () => {
  const original = input();
  const first = await assembleCrossLayerCandidate(original);
  assert.equal(first.ok, true);
  const reordered = { ...original, capture: { ...original.capture,
    files: [...original.capture.files].reverse(),
    supplied: [...original.capture.supplied].reverse() } };
  const second = await assembleCrossLayerCandidate(reordered);
  assert.equal(second.ok, true);
  if (first.ok && second.ok) assert.equal(first.candidate.digest, second.candidate.digest);
  const changed = { ...original, capture: { ...original.capture,
    supplied: original.capture.supplied.map(item => item.path === 'RepairService.java'
      ? { ...item, bytes: new TextEncoder().encode('changed') } : item) } };
  assert.deepEqual(await assembleCrossLayerCandidate(changed),
    { ok: false, code: 'CAPTURE_BYTES_CHANGED' });
});

test('without reviewed mapping, syntax does not claim business linkage or test coverage', async () => {
  const source = input();
  const result = await assembleCrossLayerCandidate({ ...source,
    reviewed_mappings: [], reviewed_test_associations: [] });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.candidate.records.some(item => item.kind === 'business.mapping'), false);
  assert.equal(result.candidate.records.some(item => item.kind === 'test.association'), false);
});

test('quoted SQL table cannot gain an exact JPA edge from lossy identifier normalization', async () => {
  const original = input();
  const sql = new TextDecoder().decode(original.capture.supplied.find(item => item.path === 'schema.sql')!.bytes);
  const changed = replaceFile(original, 'schema.sql', new TextEncoder().encode(
    sql.replace('repair_request', '"repair_request"')));
  const result = await assembleCrossLayerCandidate(changed);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(result.candidate.diagnostics.some(item => item.startsWith('JPA_TABLE_UNRESOLVED:')));
  assert.ok(!result.candidate.records.some(item => item.kind === 'engineering.relationship' &&
    item.payload['relation_type'] === 'engineering.persisted_in'));
});

test('duplicate literal Spring routes remain ambiguous rather than gaining exact API edges', async () => {
  const original = input();
  const controller = new TextDecoder().decode(original.capture.supplied.find(
    item => item.path === 'RepairController.java')!.bytes);
  const path = 'RepairController2.java';
  const bytes = new TextEncoder().encode(controller.replaceAll('RepairController', 'RepairController2'));
  const supplied = [...original.capture.supplied, { path, bytes }];
  const files: CapturedFile[] = [...original.capture.files, {
    ...original.capture.files[2]!, path, bytes: bytes.byteLength,
    file_digest: createHash('sha256').update(bytes).digest('hex'),
  }];
  const ambiguous: CrossLayerInput = { ...original, capture: {
    capture: { ...original.capture.capture, file_manifest_digest: fileManifestDigest(files) },
    files, supplied,
  } };
  const result = await assembleCrossLayerCandidate(ambiguous);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(result.candidate.diagnostics.some(item => item.startsWith('ROUTE_AMBIGUOUS:')));
  assert.ok(!result.candidate.records.some(item => item.kind === 'engineering.relationship' &&
    item.payload['relation_type'] === 'api.implemented_by'));
});

test('derived review mapping inherits restricted source classification', async () => {
  const original = input();
  const files = original.capture.files.map(item => item.path === 'business.md'
    ? { ...item, classification: 'restricted' as const } : item);
  const restricted: CrossLayerInput = { ...original, capture: { ...original.capture,
    files, capture: { ...original.capture.capture, file_manifest_digest: fileManifestDigest(files) } } };
  const result = await assembleCrossLayerCandidate(restricted);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.candidate.records.find(item => item.kind === 'business.mapping')?.classification,
    'restricted');
});

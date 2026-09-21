import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileManifestDigest, type CapturedFile, type SourceCapture } from '@context-foundry/contracts';
import { assembleCrossLayerCandidate, type CrossLayerInput } from '../src/cross-layer.js';
import { inspectCandidateRecord, retrieveCandidate, traceCandidateRecord } from '../src/retrieval.js';
import { compareRetrieval } from '../src/evaluation.js';
import { readBoundEvidence } from '../src/evidence.js';

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
  assert.equal(records.find(item => item.kind === 'business.rule')?.payload['edition'],
    'synthetic-1');
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

test('same-information typed retrieval retains a low-lexical business-to-service connector', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const request = { question: 'coordinator', intent: 'enhancement' as const, max_seeds: 1 };
  const lexical = retrieveCandidate(built.candidate, { ...request, mode: 'lexical' });
  const typed = retrieveCandidate(built.candidate, { ...request, mode: 'typed' });
  assert.equal(lexical.ok, true);
  assert.equal(typed.ok, true);
  if (!lexical.ok || !typed.ok) return;
  assert.equal(lexical.packet.stage.seeds, typed.packet.stage.seeds);
  assert.ok(!lexical.packet.facts.some(item => item.identity.includes('RepairService.approve')));
  assert.ok(typed.packet.facts.some(item => item.identity.includes('RepairService.approve')));
  assert.ok(typed.packet.facts.some(item => item.kind === 'business.mapping'));
  assert.ok(typed.packet.facts.every(item => item.locators.length > 0));
  assert.ok(typed.packet.facts.some(item => item.identity.includes('RepairService.approve') &&
    item.locators.some(locator => locator.kind === 'file_range' &&
      locator.path === 'RepairService.java')));
  assert.ok(typed.packet.diagnostics.includes('PARTIAL_COVERAGE'));
  assert.equal(Buffer.byteLength(typed.json), typed.bytes);
  assert.ok(typed.bytes > lexical.bytes);
  if (process.env['CF_A3_RECEIPT'] === '1') {
    process.stdout.write(`${JSON.stringify({ scenario: 'coordinator', arm: 'lexical',
      bytes: lexical.bytes, packet: lexical.packet })}\n`);
    process.stdout.write(`${JSON.stringify({ scenario: 'coordinator', arm: 'typed',
      bytes: typed.bytes, packet: typed.packet })}\n`);
  }
});

test('API-use policy does not traverse from operation into service implementation', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const result = retrieveCandidate(built.candidate, { question: 'POST /v1/repairs/{id}/approve',
    intent: 'api_use', mode: 'typed', max_seeds: 1 });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(!result.packet.facts.some(item => item.identity.includes('RepairService.approve')));
  assert.ok(!result.packet.facts.some(item => item.identity.includes('RepairController.approve')));
  assert.ok(!result.packet.facts.some(item => item.kind === 'business.mapping'));
});

test('retrieval refuses a packet that cannot fit the actual serialized wire cap', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const oversized = retrieveCandidate(built.candidate, {
    question: 'coordinator', intent: 'enhancement', mode: 'typed', max_seeds: 1,
    max_bytes: 256,
  });
  assert.equal(oversized.ok, false);
  if (oversized.ok) return;
  assert.equal(oversized.code, 'PACKET_TOO_LARGE');
  assert.equal(oversized.inspect_record_ids?.length, 1);
});

test('exact inspect returns an implementation source pointer without reading the file', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const service = built.candidate.records.find(item => item.kind === 'engineering.symbol' &&
    item.identity.key === 'fixture.repairs.RepairService.approve(String)')!;
  const inspected = inspectCandidateRecord(built.candidate, service.record_id);
  assert.equal(inspected.ok, true);
  if (!inspected.ok) return;
  assert.equal(inspected.locators[0]?.path, 'RepairService.java');
  assert.equal(inspected.locators[0]?.kind, 'file_range');
  assert.equal(inspected.record.identity.key, service.identity.key);
  assert.equal(Buffer.byteLength(inspected.json), inspected.bytes);
  assert.deepEqual(inspectCandidateRecord(built.candidate, 'missing'),
    { ok: false, code: 'NOT_FOUND' });
});

test('stale reviewed mapping is not traversed as current business-to-technical support', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const stale = { ...built.candidate, records: built.candidate.records.map(item =>
    item.kind === 'business.mapping' ? { ...item, review: { state: 'stale' as const } } : item) };
  const result = retrieveCandidate(stale, {
    question: 'coordinator', intent: 'enhancement', mode: 'typed', max_seeds: 1 });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(!result.packet.facts.some(item => item.kind === 'interface.operation'));
  assert.ok(!result.packet.facts.some(item => item.identity.includes('RepairService.approve')));
});

test('stale reviewed test relevance cannot nominate a test-impact path', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const stale = { ...built.candidate, records: built.candidate.records.map(item =>
    item.kind === 'test.association' ? { ...item, review: { state: 'stale' as const } } : item) };
  const result = retrieveCandidate(stale, {
    question: 'fixture.repairs.RepairService.approve(String)',
    intent: 'test_impact', mode: 'typed', max_seeds: 1 });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(!result.packet.facts.some(item => item.kind === 'test.association'));
  assert.ok(!result.packet.facts.some(item => item.identity.includes('rejectsSecondApproval')));
});

test('repository-to-table gap stays visible instead of inventing a service data edge', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const result = retrieveCandidate(built.candidate, {
    question: 'fixture.repairs.RepairService.approve(String)', intent: 'enhancement',
    mode: 'typed', max_seeds: 1, max_hops: 4 });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(result.packet.facts.some(item => item.identity.includes('RepairService.approve')));
  assert.ok(!result.packet.facts.some(item => item.kind === 'source.artifact' &&
    item.name === 'REPAIR_REQUEST'));
});

test('evaluation oracle reports connector gain and unresolved data-path loss by stage', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const service = built.candidate.records.find(item => item.kind === 'engineering.symbol' &&
    item.identity.key === 'fixture.repairs.RepairService.approve(String)')!;
  const table = built.candidate.records.find(item => item.kind === 'source.artifact' &&
    item.payload['name'] === 'REPAIR_REQUEST')!;
  const gained = compareRetrieval(built.candidate, 'business-to-service', {
    question: 'coordinator', intent: 'enhancement', max_seeds: 1 }, [service.record_id]);
  assert.equal(gained.obligations[0]?.source_present, true);
  assert.equal(gained.obligations[0]?.selected_seed, false);
  assert.equal(gained.obligations[0]?.typed_packet, true);
  assert.equal(gained.obligations[0]?.loss_stage, 'none');
  const missing = compareRetrieval(built.candidate, 'service-to-data', {
    question: 'fixture.repairs.RepairService.approve(String)', intent: 'enhancement',
    max_seeds: 1, max_hops: 4 }, [table.record_id]);
  assert.equal(missing.obligations[0]?.source_present, true);
  assert.equal(missing.obligations[0]?.typed_packet, false);
  assert.equal(missing.obligations[0]?.lexical_candidate, false);
  assert.equal(missing.obligations[0]?.loss_stage, 'typed_traversal_or_budget');
  assert.equal(missing.obligations[0]?.typed_with_full_wire_cap, false);
});

test('evaluation distinguishes a complete-path wire omission from an unsupported graph path', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const rule = built.candidate.records.find(item => item.kind === 'business.rule' &&
    String(item.payload['statement']).includes('coordinator'))!;
  const table = built.candidate.records.find(item => item.kind === 'source.artifact' &&
    item.payload['name'] === 'REPAIR_REQUEST')!;
  const service = built.candidate.records.find(item => item.kind === 'engineering.symbol' &&
    item.identity.key === 'fixture.repairs.RepairService.approve(String)')!;
  const request = {
    question: 'Investigate approval and storage', intent: 'enhancement' as const,
    concerns: [{ id: 'approval', text: 'coordinator' },
      { id: 'storage', text: 'REPAIR_REQUEST' }],
    max_seeds: 2, max_hops: 3, max_bytes: 3000,
  };
  const receipt = compareRetrieval(built.candidate, 'two-concern-tight-cap', request,
    [rule.record_id, table.record_id, service.record_id]);
  assert.equal(receipt.obligations[0]?.typed_with_full_wire_cap, true);
  assert.equal(receipt.obligations[0]?.typed_packet, true);
  assert.equal(receipt.obligations[0]?.loss_stage, 'none');
  assert.equal(receipt.obligations[1]?.loss_stage, 'none');
  assert.equal(receipt.obligations[2]?.typed_packet, false);
  assert.equal(receipt.obligations[2]?.loss_stage, 'wire_budget');
  assert.ok(receipt.typed_full_wire_bytes! > receipt.typed_bytes!);
  if (process.env['CF_A3_RECEIPT'] === '1') process.stdout.write(`${JSON.stringify(receipt)}\n`);
});

test('same-information scenario matrix records quality and wire cost without oracle-fed ranking', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const candidate = built.candidate;
  const find = (kind: string, match: (item: (typeof candidate.records)[number]) => boolean) =>
    candidate.records.find(item => item.kind === kind && match(item))!.record_id;
  const operation = find('interface.operation', item =>
    item.payload['operation_key'] === 'POST /v1/repairs/{id}/approve');
  const service = find('engineering.symbol', item =>
    item.identity.key === 'fixture.repairs.RepairService.approve(String)');
  const testAssociation = find('test.association', () => true);
  const table = find('source.artifact', item => item.payload['name'] === 'REPAIR_REQUEST');
  const scenarios = [
    { id: 'api-use', question: 'POST /v1/repairs/{id}/approve',
      intent: 'api_use' as const, required: [operation], forbidden: [service] },
    { id: 'business-to-service', question: 'coordinator',
      intent: 'enhancement' as const, required: [service], forbidden: [] },
    { id: 'reverse-test-impact', question: 'fixture.repairs.RepairService.approve(String)',
      intent: 'test_impact' as const, required: [testAssociation], forbidden: [] },
    { id: 'unsupported-service-data', question: 'fixture.repairs.RepairService.approve(String)',
      intent: 'enhancement' as const, required: [], forbidden: [table] },
  ];
  let lexicalRequired = 0;
  let typedRequired = 0;
  let requiredCount = 0;
  for (const scenario of scenarios) {
    const request = { question: scenario.question, intent: scenario.intent, max_seeds: 1,
      max_hops: 4 };
    const lexical = retrieveCandidate(candidate, { ...request, mode: 'lexical' });
    const typed = retrieveCandidate(candidate, { ...request, mode: 'typed' });
    assert.equal(lexical.ok, true, scenario.id);
    assert.equal(typed.ok, true, scenario.id);
    if (!lexical.ok || !typed.ok) continue;
    const lexicalIds = new Set(lexical.packet.facts.map(item => item.record_id));
    const typedIds = new Set(typed.packet.facts.map(item => item.record_id));
    lexicalRequired += scenario.required.filter(id => lexicalIds.has(id)).length;
    typedRequired += scenario.required.filter(id => typedIds.has(id)).length;
    requiredCount += scenario.required.length;
    for (const id of scenario.forbidden) assert.ok(!typedIds.has(id), scenario.id);
    const receipt = compareRetrieval(candidate, scenario.id, request, scenario.required);
    assert.equal(receipt.lexical_bytes, lexical.bytes);
    assert.equal(receipt.typed_bytes, typed.bytes);
    if (process.env['CF_A3_RECEIPT'] === '1') process.stdout.write(`${JSON.stringify({
      scenario: scenario.id, receipt, lexical: lexical.packet, typed: typed.packet,
    })}\n`);
  }
  assert.equal(requiredCount, 3);
  assert.equal(typedRequired, 3);
  assert.ok(lexicalRequired < typedRequired);
});

test('reverse test-impact path nominates reviewed test relevance without claiming execution', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const result = retrieveCandidate(built.candidate, {
    question: 'fixture.repairs.RepairService.approve(String)',
    intent: 'test_impact', mode: 'typed', max_seeds: 1, max_hops: 2 });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(result.packet.facts.some(item => item.identity.includes('rejectsSecondApproval')));
  assert.ok(result.packet.facts.some(item => item.kind === 'test.association' &&
    item.origin === 'human_asserted'));
  assert.ok(!result.json.includes('test_passed'));
});

test('two explicit concerns each retain a seed under the shared cap', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const result = retrieveCandidate(built.candidate, {
    question: 'Investigate approval and request storage', intent: 'enhancement',
    mode: 'lexical', max_seeds: 2,
    concerns: [{ id: 'approval', text: 'coordinator' },
      { id: 'storage', text: 'REPAIR_REQUEST' }],
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.packet.facts.map(item => item.concern_id), ['approval', 'storage']);
  assert.equal(result.packet.stage.seeds, 2);
});

test('original multiline story is preserved separately from stated concerns', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const story = 'As a coordinator,\nI need to approve a request.';
  const result = retrieveCandidate(built.candidate, { question: story,
    concerns: [{ id: 'business', text: 'coordinator' }],
    intent: 'enhancement', mode: 'lexical', max_seeds: 1 });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.packet.request.question, story);
  assert.equal(result.packet.facts[0]?.concern_id, 'business');
  assert.deepEqual(retrieveCandidate(built.candidate, { question: 'bad\u0000story',
    intent: 'enhancement', mode: 'lexical' }), { ok: false, code: 'INVALID_REQUEST' });
});

test('hop cutoff reports an explicit traversal gap instead of silently implying completeness', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const result = retrieveCandidate(built.candidate, { question: 'coordinator',
    intent: 'enhancement', mode: 'typed', max_seeds: 1, max_hops: 0 });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.packet.stage.examined_edges, 0);
  assert.ok(result.packet.diagnostics.includes('HOP_LIMIT'));
  assert.ok(!result.packet.facts.some(item => item.kind === 'interface.operation'));
});

test('exact trace keeps the original task separate from a selected source record', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const service = built.candidate.records.find(item => item.kind === 'engineering.symbol' &&
    item.identity.key === 'fixture.repairs.RepairService.approve(String)')!;
  const story = 'What tests should I inspect before changing approval?';
  const result = traceCandidateRecord(built.candidate, {
    record_id: service.record_id, original_question: story, intent: 'test_impact',
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.packet.request.question, story);
  assert.equal(result.packet.facts[0]?.record_id, service.record_id);
  assert.ok(result.packet.facts.some(item => item.identity.includes('rejectsSecondApproval')));
});

test('exact trace is anchored to the selected record ID despite a competing exact-name match', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const service = built.candidate.records.find(item => item.kind === 'engineering.symbol' &&
    item.identity.key === 'fixture.repairs.RepairService.approve(String)')!;
  const rival = built.candidate.records.find(item => item.kind === 'source.artifact')!;
  // Deliberately altered in-memory search projection; not a validated capture.
  const candidate = { ...built.candidate, records: built.candidate.records.map(item =>
    item.record_id === rival.record_id ? { ...item, record_id: '000-rival',
      descriptor: { ...item.descriptor, name: service.identity.key } } : item) };
  const result = traceCandidateRecord(candidate, { record_id: service.record_id,
    original_question: 'Investigate approval', intent: 'test_impact' });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.packet.facts[0]?.record_id, service.record_id);
  assert.ok(!result.packet.facts.some(item => item.record_id === '000-rival'));
});

test('selective evidence read checks the full capture and returns exact source lines', async () => {
  const source = input();
  const built = await assembleCrossLayerCandidate(source);
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const service = built.candidate.records.find(item => item.kind === 'engineering.symbol' &&
    item.identity.key === 'fixture.repairs.RepairService.approve(String)')!;
  const read = readBoundEvidence(built.candidate, source.capture, service.evidence_refs[0]!);
  assert.equal(read.ok, true);
  if (!read.ok) return;
  assert.ok(read.text.includes('repository.find(id)'));
  assert.ok(read.text.includes('repository.save(request)'));
  assert.ok(!read.text.includes('package fixture.repairs'));
  assert.equal(Buffer.byteLength(read.json), read.bytes);
  const changed = { ...source.capture, supplied: source.capture.supplied.map(item =>
    item.path === 'RepairService.java' ? { ...item, bytes: new TextEncoder().encode('changed') } : item) };
  assert.deepEqual(readBoundEvidence(built.candidate, changed, service.evidence_refs[0]!),
    { ok: false, code: 'CAPTURE_CHANGED' });
});

test('OpenAPI document pointer returns a labelled canonical subtree, not fake raw lines', async () => {
  const source = input();
  const built = await assembleCrossLayerCandidate(source);
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const operation = built.candidate.records.find(item => item.kind === 'interface.operation')!;
  const read = readBoundEvidence(built.candidate, source.capture, operation.evidence_refs[0]!);
  assert.equal(read.ok, true);
  if (!read.ok) return;
  assert.ok(read.text.includes('approveRepair'));
  assert.ok(read.json.includes('canonical_json_pointer'));
  assert.ok(!read.json.includes('raw_file_lines'));
});

test('API-use orientation plus focused evidence reveals declared parameter and responses only', async () => {
  const source = input();
  const built = await assembleCrossLayerCandidate(source);
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const oriented = retrieveCandidate(built.candidate, {
    question: 'POST /v1/repairs/{id}/approve', intent: 'api_use',
    mode: 'typed', max_seeds: 1 });
  assert.equal(oriented.ok, true);
  if (!oriented.ok) return;
  const operation = oriented.packet.facts.find(item => item.kind === 'interface.operation');
  assert.ok(operation);
  assert.ok(!oriented.packet.facts.some(item => item.identity.includes('RepairService.approve')));
  const read = readBoundEvidence(built.candidate, source.capture,
    operation!.locators[0]!.evidence_id);
  assert.equal(read.ok, true);
  if (!read.ok) return;
  const declared = JSON.parse(read.text) as {
    parameters: { name: string; in: string; required: boolean }[];
    responses: Record<string, unknown>;
  };
  assert.deepEqual(declared.parameters.map(item => [item.name, item.in, item.required]),
    [['id', 'path', true]]);
  assert.deepEqual(Object.keys(declared.responses).sort(), ['204', '409']);
  assert.ok(!read.text.includes('repository.find'));
});

test('selective implementation read does not promote a business expectation into observed behavior', async () => {
  const source = input();
  const built = await assembleCrossLayerCandidate(source);
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const rule = built.candidate.records.find(item => item.kind === 'business.rule' &&
    item.descriptor.name === 'Approving a request')!;
  const service = built.candidate.records.find(item => item.kind === 'engineering.symbol' &&
    item.identity.key === 'fixture.repairs.RepairService.approve(String)')!;
  const read = readBoundEvidence(built.candidate, source.capture, service.evidence_refs[0]!);
  assert.equal(read.ok, true);
  if (!read.ok) return;
  assert.ok(String(rule.payload['statement']).includes('records the coordinator'));
  assert.equal(rule.review.state, 'pending');
  assert.ok(!read.text.includes('coordinator'));
  assert.ok(!built.candidate.records.some(item => item.kind === 'test.association' &&
    item.payload['association_basis'] === 'observed_pass'));
});

test('conflicting source passages stay separate and neither becomes reviewed truth by rank', async () => {
  const original = input();
  const originalBuilt = await assembleCrossLayerCandidate(original);
  assert.equal(originalBuilt.ok, true);
  if (!originalBuilt.ok) return;
  const business = new TextDecoder().decode(original.capture.supplied.find(
    item => item.path === 'business.md')!.bytes);
  const altered = replaceFile(original, 'business.md', new TextEncoder().encode(
    `${business}\n## Alternative approval guidance\n\nAn authorized coordinator must never approve a pending request.\n`));
  const built = await assembleCrossLayerCandidate(altered);
  assert.equal(built.ok, true);
  if (!built.ok) return;
  assert.notEqual(built.candidate.digest, originalBuilt.candidate.digest);
  const rules = built.candidate.records.filter(item => item.kind === 'business.rule');
  assert.equal(rules.length, 2);
  assert.ok(rules.every(item => item.review.state === 'pending'));
  const result = retrieveCandidate(built.candidate, {
    question: 'coordinator', intent: 'enhancement', mode: 'lexical', max_seeds: 16 });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(rules.every(rule => result.packet.facts.some(item => item.record_id === rule.record_id)));
  const before = retrieveCandidate(originalBuilt.candidate, {
    question: 'coordinator', intent: 'enhancement', mode: 'lexical', max_seeds: 16 });
  assert.equal(before.ok, true);
  if (!before.ok) return;
  assert.equal(before.packet.facts.filter(item => item.kind === 'business.rule').length, 1);
  assert.equal(result.packet.facts.filter(item => item.kind === 'business.rule').length, 2);
  assert.equal(built.candidate.records.filter(item => item.kind === 'business.mapping').length, 1);
});

test('exact identity and fused-lane ties are stable across candidate record order', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const reordered = { ...built.candidate, records: [...built.candidate.records].reverse() };
  const exactRequest = { question: 'fixture.repairs.RepairService.approve(String)',
    intent: 'enhancement' as const, mode: 'lexical' as const, max_seeds: 1 };
  const first = retrieveCandidate(built.candidate, exactRequest);
  const second = retrieveCandidate(reordered, exactRequest);
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  if (!first.ok || !second.ok) return;
  assert.equal(first.packet.facts[0]?.identity, exactRequest.question);
  assert.deepEqual(first.packet.facts, second.packet.facts);
  const lexical = { question: 'coordinator', intent: 'enhancement' as const,
    mode: 'lexical' as const, max_seeds: 2 };
  const tieA = retrieveCandidate(built.candidate, lexical);
  const tieB = retrieveCandidate(reordered, lexical);
  assert.equal(tieA.ok, true);
  assert.equal(tieB.ok, true);
  if (tieA.ok && tieB.ok) assert.deepEqual(tieA.packet.facts, tieB.packet.facts);
  const typedA = retrieveCandidate(built.candidate, { ...lexical, mode: 'typed' });
  const typedB = retrieveCandidate(reordered, { ...lexical, mode: 'typed' });
  assert.equal(typedA.ok, true);
  assert.equal(typedB.ok, true);
  if (typedA.ok && typedB.ok) assert.deepEqual(typedA.packet.facts, typedB.packet.facts);
});

test('adopter-defined kind enters descriptor retrieval without a core kind switch', () => {
  const vector = JSON.parse(execFileSync('python3', [new URL(
    '../../../contracts/fixtures/emit-extension-vector.py', import.meta.url).pathname],
  { encoding: 'utf8' })) as {
    record: import('@context-foundry/contracts/extensions').ExtensionRecord;
    locator: import('@context-foundry/contracts').EvidenceLocator;
  };
  const candidate = { records: [vector.record], locators: [vector.locator],
    coverage: [], diagnostics: [], digest: 'd'.repeat(64) };
  const found = retrieveCandidate(candidate, { question: 'réparer',
    intent: 'enhancement', mode: 'lexical' });
  assert.equal(found.ok, true);
  if (!found.ok) return;
  assert.equal(found.packet.facts[0]?.kind, 'acme.workflow');
  assert.equal(found.packet.facts[0]?.locators[0]?.evidence_id, vector.locator.evidence_id);
});

test('generic relationship label cannot authorize core enhancement traversal', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const route = built.candidate.records.find(item => item.kind === 'engineering.relationship' &&
    item.payload['relation_type'] === 'api.implemented_by')!;
  const generic = { ...route, record_id: 'rec:generic-relation',
    payload: { ...route.payload, relation_type: 'generic.related_to' },
    identity: { ...route.identity, key: 'generic:operation-controller' } };
  const candidate = { ...built.candidate,
    records: [...built.candidate.records.filter(item => item.record_id !== route.record_id), generic] };
  const result = retrieveCandidate(candidate, {
    question: 'POST /v1/repairs/{id}/approve', intent: 'enhancement',
    mode: 'typed', max_seeds: 1, max_hops: 2 });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(!result.packet.facts.some(item => item.identity.includes('RepairController.approve')));
});

test('a supported call cycle terminates without duplicating source facts', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const call = built.candidate.records.find(item => item.kind === 'engineering.relationship' &&
    item.payload['relation_type'] === 'engineering.calls' &&
    item.identity.key.includes('RepairController.approve'))!;
  const [controller, service] = call.references;
  const returnCall = { ...call, record_id: 'rec:synthetic-cycle',
    identity: { ...call.identity, key: 'cycle:service-to-controller' },
    references: [{ ...service!, role: 'subject_symbol' }, { ...controller!, role: 'object' }] };
  const candidate = { ...built.candidate, records: [...built.candidate.records, returnCall] };
  const result = retrieveCandidate(candidate, {
    question: 'fixture.repairs.RepairController.approve(String)',
    intent: 'enhancement', mode: 'typed', max_seeds: 1, max_hops: 4 });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.packet.facts.filter(item =>
    item.identity === 'fixture.repairs.RepairController.approve(String)').length, 1);
  assert.ok(result.packet.stage.examined_edges <= 400);
});

test('tight wire cap skips an oversized complete path but retains another concern', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const result = retrieveCandidate(built.candidate, {
    question: 'Investigate approval and storage', intent: 'enhancement', mode: 'typed',
    concerns: [{ id: 'approval', text: 'coordinator' },
      { id: 'storage', text: 'REPAIR_REQUEST' }],
    max_seeds: 2, max_hops: 3, max_bytes: 3000,
  });
  assert.equal(result.ok, true, JSON.stringify(result));
  if (!result.ok) return;
  assert.ok(result.bytes <= 3000);
  assert.ok(result.packet.diagnostics.includes('OVERSIZED_UNIT'));
  assert.ok(result.packet.diagnostics.includes('PATH_TRUNCATED'));
  assert.ok(result.packet.inspect_record_ids?.length);
  assert.ok(result.packet.facts.some(item => item.concern_id === 'approval'));
  assert.ok(result.packet.facts.some(item => item.concern_id === 'storage'));
  assert.ok(!result.packet.facts.some(item => item.kind === 'engineering.relationship'));
  if (process.env['CF_A3_RECEIPT'] === '1') process.stdout.write(`${JSON.stringify({
    scenario: 'two-concern-tight-cap', arm: 'typed', bytes: result.bytes,
    packet: result.packet,
  })}\n`);
});

test('a valid no-match request returns an empty bounded packet, not an oversize error', async () => {
  const built = await assembleCrossLayerCandidate(input());
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const result = retrieveCandidate(built.candidate, {
    question: 'unrepresented_zebra_operation', intent: 'api_use', mode: 'lexical',
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.packet.facts, []);
  assert.equal(result.packet.stage.candidates, 0);
});

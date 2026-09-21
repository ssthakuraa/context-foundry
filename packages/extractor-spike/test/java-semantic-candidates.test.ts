import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { scanJavaSemanticCandidates } from '../src/java-semantic-candidates.js';

const encode = (value: string): Uint8Array => new TextEncoder().encode(value);

test('synthetic Java field/parameter call and explicit JPA table are only candidates', async () => {
  const controller = await scanJavaSemanticCandidates(readFileSync(
    new URL('../../fixtures/cross-layer/RepairController.java', import.meta.url)));
  assert.equal(controller.ok, true);
  if (!controller.ok) return;
  assert.deepEqual(controller.calls.map(call => [call.source, call.target]), [[
    'fixture.repairs.RepairController.approve(String)',
    'fixture.repairs.RepairService.approve(String)',
  ]]);
  const entity = await scanJavaSemanticCandidates(readFileSync(
    new URL('../../fixtures/cross-layer/RepairRequest.java', import.meta.url)));
  assert.equal(entity.ok, true);
  if (entity.ok) assert.deepEqual(entity.jpa_tables.map(item => [item.entity, item.table]),
    [['fixture.repairs.RepairRequest', 'repair_request']]);
});

test('same-named Table annotation or shadowed/external field type never yields candidate', async () => {
  const fake = await scanJavaSemanticCandidates(encode('@interface Table { String name(); } @Table(name="fake") class A {}'));
  assert.equal(fake.ok, true);
  if (fake.ok) assert.deepEqual(fake.jpa_tables, []);
  const shadowed = await scanJavaSemanticCandidates(encode(
    'package fixture; class C { Service service; void go(String id) { Service service = null; service.run(id); } }'));
  assert.equal(shadowed.ok, true);
  if (shadowed.ok) assert.deepEqual(shadowed.calls, []);
  const imported = await scanJavaSemanticCandidates(encode(
    'package fixture; import other.Service; class C { Service service; void go(String id) { service.run(id); } }'));
  assert.equal(imported.ok, true);
  if (imported.ok) assert.deepEqual(imported.calls, []);
});

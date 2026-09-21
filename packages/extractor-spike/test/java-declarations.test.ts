import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { scanJavaDeclarations } from '../src/java-declarations.js';

const encode = (source: string) => new TextEncoder().encode(source);

test('synthetic fixture yields qualified Java methods without claiming calls or routes', async () => {
  const source = readFileSync(new URL('../../fixtures/cross-layer/RepairController.java', import.meta.url));
  const result = await scanJavaDeclarations(source);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.declarations.map(item => item.qualified_name), [
    'fixture.repairs.RepairController',
    'fixture.repairs.RepairController.RepairController(RepairService)',
    'fixture.repairs.RepairController.approve(String)',
  ]);
  assert.equal(result.status, 'partial');
  assert.ok(result.known_unsupported.includes('Spring routes'));
});

test('overloads keep separate signatures; syntax errors withhold all output', async () => {
  const result = await scanJavaDeclarations(encode('package fixture; class Work { void go(String x) {} void go(int x) {} }'));
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.declarations.map(item => item.qualified_name),
    ['fixture.Work', 'fixture.Work.go(String)', 'fixture.Work.go(int)']);
  assert.deepEqual(await scanJavaDeclarations(encode('class Broken { void go( }')),
    { ok: false, code: 'SYNTAX_ERROR' });
});

test('service, entity and test declarations are present but behavior remains unproved', async () => {
  const paths = ['RepairService.java', 'RepairRequest.java', 'RepairServiceTest.java'];
  const results = await Promise.all(paths.map(path => scanJavaDeclarations(
    readFileSync(new URL(`../../fixtures/cross-layer/${path}`, import.meta.url)))));
  assert.ok(results.every(result => result.ok));
  const names = results.flatMap(result => result.ok ? result.declarations.map(item => item.qualified_name) : []);
  assert.ok(names.includes('fixture.repairs.RepairService.approve(String)'));
  assert.ok(names.includes('fixture.repairs.RepairRequest'));
  assert.ok(names.includes('fixture.repairs.RepairServiceTest.rejectsSecondApproval()'));
});

test('invalid UTF-8 and oversized input fail closed', async () => {
  assert.deepEqual(await scanJavaDeclarations(new Uint8Array([0xff])), { ok: false, code: 'INVALID_UTF8' });
  assert.deepEqual(await scanJavaDeclarations(new Uint8Array(1024 * 1024 + 1)), { ok: false, code: 'TOO_LARGE' });
});

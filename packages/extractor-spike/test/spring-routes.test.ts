import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { scanSpringRoutes } from '../src/spring-routes.js';

const encode = (source: string) => new TextEncoder().encode(source);

test('literal Spring route with declared imports maps to method, not runtime behavior', async () => {
  const source = readFileSync(new URL('../../fixtures/cross-layer/RepairController.java', import.meta.url));
  const result = await scanSpringRoutes(source);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.routes.map(route => [route.method, route.path, route.implementation]), [
    ['POST', '/v1/repairs/{id}/approve', 'fixture.repairs.RepairController.approve(String)'],
  ]);
  assert.deepEqual(result.diagnostics, []);
});

test('same-named custom annotations do not become Spring routes', async () => {
  const source = encode('package fixture; @RestController @RequestMapping("/x") class C { @PostMapping("/y") void m() {} }');
  const result = await scanSpringRoutes(source);
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.routes, []);
});

test('computed path stays unsupported and does not bind', async () => {
  const source = encode('import org.springframework.web.bind.annotation.RestController;\nimport org.springframework.web.bind.annotation.RequestMapping;\nimport org.springframework.web.bind.annotation.PostMapping;\n@RestController @RequestMapping("/x") class C { @PostMapping(PATH) void m() {} }');
  const result = await scanSpringRoutes(source);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.routes, []);
    assert.deepEqual(result.diagnostics, ['UNSUPPORTED_METHOD_ROUTE']);
  }
});

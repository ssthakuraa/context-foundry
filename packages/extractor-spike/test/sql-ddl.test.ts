import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { scanSqlDdl } from '../src/sql-ddl.js';

const encode = (source: string) => new TextEncoder().encode(source);

test('synthetic cross-layer SQL table and columns, not commented decoy', () => {
  const source = readFileSync(new URL('../../fixtures/cross-layer/schema.sql', import.meta.url));
  const result = scanSqlDdl(source);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.tables.map(table => table.name), ['REPAIR_REQUEST']);
  assert.deepEqual(result.tables[0]?.columns, ['ID', 'STATUS']);
  assert.equal(result.tables[0]?.start_line, 1);
  assert.equal(result.status, 'partial');
});

test('strings and comments cannot create false tables', () => {
  const result = scanSqlDdl(encode("-- CREATE TABLE fake (id INT);\nSELECT 'CREATE TABLE fake2 (id INT)';\n/* CREATE TABLE fake3 (id INT) */"));
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.tables, []);
});

test('quoted names, nested type parentheses, and constraints', () => {
  const result = scanSqlDdl(encode('CREATE TABLE "Case"."Work" ("Key" DECIMAL(8,2), status TEXT, CONSTRAINT pk PRIMARY KEY ("Key"));'));
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.tables, [{ name: 'Case.Work', columns: ['Key', 'STATUS'], start_line: 1, end_line: 1 }]);
});

test('malformed and oversized input fail closed', () => {
  assert.deepEqual(scanSqlDdl(encode('/* unclosed')), { ok: false, code: 'UNTERMINATED_TOKEN' });
  assert.deepEqual(scanSqlDdl(encode('CREATE TABLE repair_request (')), { ok: false, code: 'MALFORMED_TABLE' });
  assert.deepEqual(scanSqlDdl(new Uint8Array(1024 * 1024 + 1)), { ok: false, code: 'TOO_LARGE' });
});

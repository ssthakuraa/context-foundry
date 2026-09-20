import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { canonicalJson, canonicalRecordLines, canonicalSha256, parseJsonStrict } from '../src/index.js';

type VectorFile = {
  format: string;
  valid: { name: string; input: string; canonical: string; sha256: string }[];
  invalid: { name: string; input: string }[];
  jsonl_valid: { name: string; records: { record_id: string }[]; jsonl: string; sha256: string }[];
  jsonl_invalid: { name: string; records: unknown[] }[];
};
const vectors = JSON.parse(readFileSync(new URL('../../fixtures/canonical-vectors.json', import.meta.url),
  'utf8')) as VectorFile;

test('portable canonical vectors match bytes and independently pinned SHA-256 values', () => {
  assert.equal(vectors.format, 'context-foundry-canonical-vectors-1');
  for (const vector of vectors.valid) {
    const value = parseJsonStrict(vector.input);
    assert.equal(canonicalJson(value), vector.canonical, vector.name);
    assert.equal(canonicalSha256(value), vector.sha256, vector.name);
    assert.equal(createHash('sha256').update(vector.canonical, 'utf8').digest('hex'),
      vector.sha256, vector.name);
  }
  for (const vector of vectors.invalid) {
    assert.throws(() => parseJsonStrict(vector.input), Error, vector.name);
  }
});

test('portable JSONL vectors pin record ordering, LF and invalid identity behavior', () => {
  for (const vector of vectors.jsonl_valid) {
    const actual = canonicalRecordLines(vector.records);
    assert.equal(actual, vector.jsonl, vector.name);
    assert.equal(createHash('sha256').update(actual, 'utf8').digest('hex'), vector.sha256, vector.name);
  }
  for (const vector of vectors.jsonl_invalid) {
    assert.throws(() => canonicalRecordLines(vector.records as { record_id: string }[]), Error, vector.name);
  }
});

test('16 MiB input, output and JSONL shard byte boundaries are exact', () => {
  const limit = 16 * 1024 * 1024;
  const atLimit = `"${'x'.repeat(limit - 2)}"`;
  assert.equal(canonicalJson(parseJsonStrict(atLimit)).length, limit);
  assert.throws(() => parseJsonStrict(`"${'x'.repeat(limit - 1)}"`), /size limit/);
  assert.throws(() => canonicalJson('x'.repeat(limit - 1)), /size limit/);
  const emptyRecord = { record_id: 'r', value: '' };
  const overhead = Buffer.byteLength(canonicalRecordLines([emptyRecord]));
  const exact = { record_id: 'r', value: 'x'.repeat(limit - overhead) };
  assert.equal(Buffer.byteLength(canonicalRecordLines([exact])), limit);
  const tooLarge = { ...exact, value: `${exact.value}x` };
  assert.throws(() => canonicalRecordLines([tooLarge]), /size limit/);
});

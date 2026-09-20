import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { canonicalJson, canonicalSha256, parseJsonStrict } from '../src/index.js';

type VectorFile = {
  format: string;
  valid: { name: string; input: string; canonical: string; sha256: string }[];
  invalid: { name: string; input: string }[];
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

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { Ajv } from 'ajv';
import { CONTRACT_VERSION, Schemas, validate, type SchemaName } from '../src/index.js';

type VectorFile = {
  format: string;
  schema_version: string;
  cases: { name: string; schema: SchemaName; valid: boolean; value: unknown }[];
};
const vectors = JSON.parse(readFileSync(new URL('../../fixtures/semantic-vectors.json', import.meta.url),
  'utf8')) as VectorFile;

test('portable semantic vectors match TypeScript validation', () => {
  assert.equal(vectors.format, 'context-foundry-semantic-vectors-1');
  assert.equal(vectors.schema_version, CONTRACT_VERSION);
  const ajv = new Ajv({ strict: true });
  const names = new Set<string>();
  for (const vector of vectors.cases) {
    assert.equal(names.has(vector.name), false, `duplicate case ${vector.name}`);
    names.add(vector.name);
    assert.equal(ajv.validate(Schemas[vector.schema], vector.value), true,
      `${vector.name} must be JSON Schema valid: ${ajv.errorsText()}`);
    assert.equal(validate(vector.schema, vector.value), vector.valid, vector.name);
  }
});

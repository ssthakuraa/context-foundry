import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Ajv } from 'ajv';
import { Schemas } from '../dist/index.js';

const root = fileURLToPath(new URL('../schemas/', import.meta.url));
const check = process.argv.includes('--check');
const ajv = new Ajv({ strict: true });

function sorted(value) {
  if (Array.isArray(value)) return value.map(sorted);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, sorted(value[key])]));
  }
  return value;
}

if (!check) mkdirSync(root, { recursive: true });
for (const [name, schema] of Object.entries(Schemas)) {
  const path = join(root, `${name}.schema.json`);
  const content = `${JSON.stringify(sorted({ $schema: 'http://json-schema.org/draft-07/schema#', ...schema }), null, 2)}\n`;
  ajv.compile(JSON.parse(content));
  if (check) {
    if (readFileSync(path, 'utf8') !== content) throw new Error(`stale schema export: ${name}`);
  } else {
    writeFileSync(path, content);
  }
}
console.log(`${check ? 'Verified' : 'Exported'} ${Object.keys(Schemas).length} JSON schemas`);

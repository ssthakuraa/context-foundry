import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { canonicalJson, canonicalRecordLines, canonicalSha256, parseJsonStrict } from '../src/index.js';

test('object keys sort by UTF-16 and array order remains significant', () => {
  assert.equal(canonicalJson({ z: [2, 1], a: true }), '{"a":true,"z":[2,1]}');
  assert.equal(canonicalJson({ '\uE000': 1, '\uD800\uDC00': 2 }), '{"𐀀":2,"":1}');
  assert.notEqual(canonicalSha256([1, 2]), canonicalSha256([2, 1]));
});

test('Unicode scalar values are preserved, not normalized', () => {
  assert.notEqual(canonicalSha256('é'), canonicalSha256('e\u0301'));
  assert.equal(canonicalJson('𐀀'), '"𐀀"');
  assert.throws(() => canonicalJson('\uD800'), /unpaired Unicode/);
  assert.throws(() => parseJsonStrict('"\\ud800"'), /unpaired Unicode/);
});

test('numbers use ECMAScript representation and reject nonfinite values', () => {
  assert.equal(canonicalJson(-0), '0');
  assert.equal(canonicalJson(1e30), '1e+30');
  assert.equal(canonicalJson(0.000001), '0.000001');
  assert.throws(() => canonicalJson(NaN), /non-finite/);
  assert.throws(() => canonicalJson(Infinity), /non-finite/);
  assert.throws(() => parseJsonStrict('9007199254740993'), /invalid or duplicate JSON/);
});

test('decoded duplicate keys are rejected before parsing', () => {
  assert.throws(() => parseJsonStrict('{"a":1,"a":2}'), /duplicate/);
  assert.throws(() => parseJsonStrict('{"a":1,"\\u0061":2}'), /duplicate/);
  assert.throws(() => parseJsonStrict('{"outer":{"x":1,"x":2}}'), /duplicate/);
  assert.deepEqual(parseJsonStrict('{"outer":{"x":1},"x":2}'), { outer: { x: 1 }, x: 2 });
});

test('round trip produces stable bytes and digest', () => {
  const value = parseJsonStrict('{ "b": [3, true], "a": "é" }');
  const canonical = canonicalJson(value);
  assert.equal(canonical, '{"a":"é","b":[3,true]}');
  assert.deepEqual(parseJsonStrict(canonical), value);
  assert.equal(canonicalSha256(value), createHash('sha256').update(canonical, 'utf8').digest('hex'));
});

test('unsupported variants, cycles, getters and sparse arrays fail', () => {
  assert.throws(() => canonicalJson(undefined), /unsupported/);
  assert.throws(() => canonicalJson(1n), /unsupported/);
  assert.throws(() => canonicalJson(new Date()), /non-plain/);
  assert.throws(() => canonicalJson([, 1]), /sparse/);
  const cycle: { self?: unknown } = {};
  cycle.self = cycle;
  assert.throws(() => canonicalJson(cycle), /cyclic/);
  const getter = Object.defineProperty({}, 'secret', { enumerable: true, get: () => 'x' });
  assert.throws(() => canonicalJson(getter), /non-data/);
});

test('record JSONL sorts stable IDs and uses exactly one trailing LF', () => {
  const a = { record_id: 'rec:a', value: 1 };
  const b = { record_id: 'rec:b', value: 2 };
  assert.equal(canonicalRecordLines([b, a]), '{"record_id":"rec:a","value":1}\n{"record_id":"rec:b","value":2}\n');
  assert.equal(canonicalRecordLines([a, b]), canonicalRecordLines([b, a]));
  assert.equal(canonicalRecordLines([]), '');
  assert.throws(() => canonicalRecordLines([a, a]), /duplicate record_id/);
});

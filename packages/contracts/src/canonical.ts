import { createHash } from 'node:crypto';

const MAX_DEPTH = 128;
const MAX_BYTES = 16 * 1024 * 1024;
const numberPattern = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/;

function assertUnicodeScalars(value: string): void {
  for (let i = 0; i < value.length; i++) {
    const unit = value.charCodeAt(i);
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = value.charCodeAt(++i);
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw new TypeError('unpaired Unicode surrogate');
    } else if (unit >= 0xdc00 && unit <= 0xdfff) {
      throw new TypeError('unpaired Unicode surrogate');
    }
  }
}

/** RFC 8785-style JSON canonicalization of the I-JSON subset. No Unicode normalization. */
export function canonicalJson(value: unknown): string {
  const active = new WeakSet<object>();

  function encode(input: unknown, depth: number): string {
    if (depth > MAX_DEPTH) throw new TypeError('JSON nesting limit exceeded');
    if (input === null) return 'null';
    if (typeof input === 'boolean') return input ? 'true' : 'false';
    if (typeof input === 'string') {
      assertUnicodeScalars(input);
      return JSON.stringify(input);
    }
    if (typeof input === 'number') {
      if (!Number.isFinite(input)) throw new TypeError('non-finite JSON number');
      return JSON.stringify(input);
    }
    if (typeof input !== 'object') throw new TypeError('unsupported JSON value');
    if (active.has(input)) throw new TypeError('cyclic JSON value');
    active.add(input);
    try {
      if (Array.isArray(input)) {
        if (input.length > 1_000_000) throw new TypeError('array item limit exceeded');
        const keys = Reflect.ownKeys(input);
        if (keys.length !== input.length + 1) throw new TypeError('sparse or extended JSON array');
        const items: string[] = [];
        for (let i = 0; i < input.length; i++) {
          const descriptor = Object.getOwnPropertyDescriptor(input, String(i));
          if (!descriptor || !('value' in descriptor) || !descriptor.enumerable) {
            throw new TypeError('sparse or accessor JSON array');
          }
          items.push(encode(descriptor.value, depth + 1));
        }
        return `[${items.join(',')}]`;
      }
      const prototype = Object.getPrototypeOf(input);
      if (prototype !== Object.prototype && prototype !== null) throw new TypeError('non-plain JSON object');
      const pairs: string[] = [];
      const keys = Reflect.ownKeys(input);
      if (keys.some(key => typeof key !== 'string')) throw new TypeError('symbol JSON key');
      for (const key of (keys as string[]).sort()) {
        assertUnicodeScalars(key);
        const descriptor = Object.getOwnPropertyDescriptor(input, key);
        if (!descriptor || !descriptor.enumerable || !('value' in descriptor)) {
          throw new TypeError('non-data JSON property');
        }
        pairs.push(`${JSON.stringify(key)}:${encode(descriptor.value, depth + 1)}`);
      }
      return `{${pairs.join(',')}}`;
    } finally {
      active.delete(input);
    }
  }

  const result = encode(value, 0);
  if (Buffer.byteLength(result, 'utf8') > MAX_BYTES) throw new TypeError('canonical JSON size limit exceeded');
  return result;
}

/** Detect duplicate decoded keys before JSON.parse can silently retain the last one. */
export function parseJsonStrict(text: string): unknown {
  if (Buffer.byteLength(text, 'utf8') > MAX_BYTES) throw new SyntaxError('JSON input size limit exceeded');
  let position = 0;
  const fail = (): never => { throw new SyntaxError(`invalid or duplicate JSON near offset ${position}`); };
  const whitespace = (): void => {
    while (position < text.length && /[ \t\r\n]/.test(text[position]!)) position++;
  };
  const string = (): string => {
    const start = position;
    if (text[position++] !== '"') fail();
    while (position < text.length) {
      const char = text.charCodeAt(position++);
      if (char === 34) return JSON.parse(text.slice(start, position)) as string;
      if (char < 0x20) fail();
      if (char === 92) {
        const escape = text[position++];
        if (escape === 'u') {
          if (!/^[0-9a-fA-F]{4}$/.test(text.slice(position, position + 4))) fail();
          position += 4;
        } else if (!escape || !'"\\/bfnrt'.includes(escape)) fail();
      }
    }
    return fail();
  };
  const value = (depth: number): void => {
    if (depth > MAX_DEPTH) fail();
    whitespace();
    const token = text[position];
    if (token === '{') {
      position++;
      whitespace();
      if (text[position] === '}') { position++; return; }
      const names = new Set<string>();
      while (position < text.length) {
        whitespace();
        const key = string();
        if (names.has(key)) fail();
        names.add(key);
        whitespace();
        if (text[position++] !== ':') fail();
        value(depth + 1);
        whitespace();
        const separator = text[position++];
        if (separator === '}') return;
        if (separator !== ',') fail();
      }
      fail();
    }
    if (token === '[') {
      position++;
      whitespace();
      if (text[position] === ']') { position++; return; }
      while (position < text.length) {
        value(depth + 1);
        whitespace();
        const separator = text[position++];
        if (separator === ']') return;
        if (separator !== ',') fail();
      }
      fail();
    }
    if (token === '"') { string(); return; }
    for (const literal of ['true', 'false', 'null']) {
      if (text.startsWith(literal, position)) { position += literal.length; return; }
    }
    const match = numberPattern.exec(text.slice(position));
    if (!match) return fail();
    position += match[0].length;
    const parsed = Number(match[0]);
    if (!Number.isFinite(parsed)) fail();
    if (/^-?[0-9]+$/.test(match[0]) && !Number.isSafeInteger(parsed)) fail();
  };
  value(0);
  whitespace();
  if (position !== text.length) fail();
  const parsed: unknown = JSON.parse(text);
  canonicalJson(parsed);
  return parsed;
}

export function canonicalSha256(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex');
}

/** Immutable JSONL shard representation: record_id order, one LF per record. */
export function canonicalRecordLines(records: readonly { record_id: string }[]): string {
  const ids = new Set<string>();
  for (const record of records) {
    if (typeof record.record_id !== 'string' || record.record_id.length === 0) {
      throw new TypeError('missing record_id');
    }
    if (ids.has(record.record_id)) throw new TypeError('duplicate record_id');
    ids.add(record.record_id);
  }
  const content = [...records].sort((a, b) => a.record_id < b.record_id ? -1 : a.record_id > b.record_id ? 1 : 0)
    .map(record => canonicalJson(record)).join('\n');
  const result = content.length ? `${content}\n` : '';
  if (Buffer.byteLength(result, 'utf8') > MAX_BYTES) throw new TypeError('JSONL shard size limit exceeded');
  return result;
}

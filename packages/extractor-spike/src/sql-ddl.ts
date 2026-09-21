/** Bounded, syntax-only SQL DDL experiment; not a dialect-wide parser. */
export type SqlTable = { name: string; columns: readonly string[]; start_line: number; end_line: number };
export type SqlDdlResult =
  | { ok: false; code: 'TOO_LARGE' | 'INVALID_UTF8' | 'UNTERMINATED_TOKEN' | 'MALFORMED_TABLE' }
  | { ok: true; tables: readonly SqlTable[]; status: 'partial'; known_unsupported: readonly string[] };
type Token = { kind: 'word' | 'quoted' | 'string' | 'symbol'; value: string; line: number };
const MAX_BYTES = 1024 * 1024;
const MAX_TOKENS = 50000;
const UNSUPPORTED = ['dynamic SQL', 'dialect-specific DDL', 'ALTER TABLE', 'constraints and foreign keys'];

function tokenize(source: string): Token[] | undefined {
  const tokens: Token[] = [];
  let i = 0;
  let line = 1;
  const advance = (end: number): void => {
    for (let p = i; p < end; p++) if (source[p] === '\n') line++;
    i = end;
  };
  while (i < source.length) {
    if (tokens.length >= MAX_TOKENS) return undefined;
    if (/\s/.test(source[i]!)) { advance(i + 1); continue; }
    if (source.startsWith('--', i)) {
      const end = source.indexOf('\n', i + 2);
      advance(end < 0 ? source.length : end);
      continue;
    }
    if (source.startsWith('/*', i)) {
      const end = source.indexOf('*/', i + 2);
      if (end < 0) return undefined;
      advance(end + 2);
      continue;
    }
    const startLine = line;
    if (source[i] === "'" || source[i] === '"') {
      const quote = source[i]!;
      const start = i;
      let end = i + 1;
      let closed = false;
      while (end < source.length) {
        if (source[end] === quote) {
          if (source[end + 1] === quote) { end += 2; continue; }
          end++; closed = true; break;
        }
        end++;
      }
      if (!closed) return undefined;
      tokens.push({ kind: quote === '"' ? 'quoted' : 'string', value: source.slice(start, end), line: startLine });
      advance(end);
      continue;
    }
    const word = /^[A-Za-z_][A-Za-z0-9_$#]*/.exec(source.slice(i));
    if (word) {
      tokens.push({ kind: 'word', value: word[0], line: startLine });
      advance(i + word[0].length);
    } else {
      tokens.push({ kind: 'symbol', value: source[i]!, line: startLine });
      advance(i + 1);
    }
  }
  return tokens;
}

const isWord = (token: Token | undefined, word: string): boolean =>
  token?.kind === 'word' && token.value.toUpperCase() === word;
function name(token: Token | undefined): string | undefined {
  if (token?.kind === 'word') return token.value.toUpperCase();
  if (token?.kind === 'quoted') return token.value.slice(1, -1).replaceAll('""', '"');
  return undefined;
}

export function scanSqlDdl(bytes: Uint8Array): SqlDdlResult {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength > MAX_BYTES) return { ok: false, code: 'TOO_LARGE' };
  let source: string;
  try { source = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { return { ok: false, code: 'INVALID_UTF8' }; }
  const tokens = tokenize(source);
  if (!tokens) return { ok: false, code: 'UNTERMINATED_TOKEN' };
  const tables: SqlTable[] = [];
  for (let i = 0; i < tokens.length - 3; i++) {
    if (!isWord(tokens[i], 'CREATE') || !isWord(tokens[i + 1], 'TABLE')) continue;
    const start = tokens[i]!.line;
    let cursor = i + 2;
    let tableName = name(tokens[cursor]);
    if (!tableName) return { ok: false, code: 'MALFORMED_TABLE' };
    cursor++;
    if (tokens[cursor]?.value === '.') {
      const local = name(tokens[cursor + 1]);
      if (!local) return { ok: false, code: 'MALFORMED_TABLE' };
      tableName += `.${local}`;
      cursor += 2;
    }
    if (tokens[cursor]?.value !== '(') return { ok: false, code: 'MALFORMED_TABLE' };
    cursor++;
    let depth = 1;
    const columns: string[] = [];
    let atItemStart = true;
    for (; cursor < tokens.length && depth; cursor++) {
      const token = tokens[cursor]!;
      if (token.value === '(') { depth++; continue; }
      if (token.value === ')') { depth--; continue; }
      if (depth !== 1) continue;
      if (token.value === ',') { atItemStart = true; continue; }
      if (atItemStart) {
        if (!isWord(token, 'CONSTRAINT') && !isWord(token, 'PRIMARY') &&
          !isWord(token, 'FOREIGN') && !isWord(token, 'UNIQUE') && !isWord(token, 'CHECK')) {
          const column = name(token);
          if (!column) return { ok: false, code: 'MALFORMED_TABLE' };
          columns.push(column);
        }
        atItemStart = false;
      }
    }
    if (depth || !columns.length) return { ok: false, code: 'MALFORMED_TABLE' };
    tables.push({ name: tableName, columns, start_line: start, end_line: tokens[cursor - 1]!.line });
    i = cursor - 1;
  }
  return { ok: true, tables, status: 'partial', known_unsupported: UNSUPPORTED };
}

import assert from 'node:assert/strict';
import test from 'node:test';
import { extractTypeScriptDeclarations } from '../src/index.js';

test('extracts bounded declarations and overload signatures without executing source', () => {
  const text = [
    'import { neverRun } from "./side-effect";',
    'export interface Request { id: string }',
    'export class ApprovalService {',
    '  approve(id: string): boolean;',
    '  approve(id: number): boolean;',
    '  approve(id: string | number): boolean { throw new Error("not executed"); }',
    '  [computed()](value: string) {}',
    '}',
    'export function submit(request: Request): void {}',
  ].join('\n');
  const result = extractTypeScriptDeclarations('src/approval.ts', text);
  assert.deepEqual(result.declarations.map(item => [item.kind, item.qualified_name, item.signature]), [
    ['interface', 'Request', undefined], ['class', 'ApprovalService', undefined],
    ['method', 'ApprovalService.approve', 'approve(string):boolean'],
    ['method', 'ApprovalService.approve', 'approve(number):boolean'],
    ['method', 'ApprovalService.approve', 'approve(string | number):boolean'],
    ['function', 'submit', 'submit(Request):void'],
  ]);
  assert.deepEqual(result.diagnostics.map(item => item.code), ['UNSUPPORTED_NAME']);
  assert.equal(result.declarations[0]?.start_line, 2);
  assert.equal(result.declarations.at(-1)?.start_line, 9);
});

test('syntax errors withhold declarations; unsupported anonymous declarations are diagnosed', () => {
  const broken = extractTypeScriptDeclarations('src/broken.ts', 'export class A { method( {');
  assert.deepEqual(broken.declarations, []);
  assert.equal(broken.diagnostics[0]?.code, 'PARSE_ERROR');
  const anonymous = extractTypeScriptDeclarations('src/anonymous.ts', 'export default function () {}');
  assert.deepEqual(anonymous.declarations, []);
  assert.deepEqual(anonymous.diagnostics.map(item => item.code), ['UNSUPPORTED_NAME']);
});

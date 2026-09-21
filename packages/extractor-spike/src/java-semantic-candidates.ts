import { Parser, type Node } from 'web-tree-sitter';
import { javaChildren, javaMethodSignature, javaPackageName, loadJavaGrammar } from './java-declarations.js';

export type JpaTableCandidate = { entity: string; table: string; start_line: number; end_line: number };
export type JavaCallCandidate = { source: string; target: string; start_line: number; end_line: number };
export type JavaSemanticCandidates =
  | { ok: false; code: 'TOO_LARGE' | 'INVALID_UTF8' | 'SYNTAX_ERROR' }
  | { ok: true; jpa_tables: readonly JpaTableCandidate[];
      calls: readonly JavaCallCandidate[]; known_unsupported: readonly string[] };

const MAX_BYTES = 1024 * 1024;
const MAX_CANDIDATES = 10000;
const childrenOf = (node: Node, type: string): Node[] => javaChildren(node).filter(child => child.type === type);

function annotationName(node: Node): string | undefined { return node.childForFieldName('name')?.text; }
function explicitTable(classNode: Node): { name: string; line: number } | undefined {
  const modifiers = javaChildren(classNode).find(child => child.type === 'modifiers');
  const tableAnnotations = modifiers ? childrenOf(modifiers, 'annotation').filter(node => annotationName(node) === 'Table') : [];
  if (tableAnnotations.length !== 1) return undefined;
  const annotation = tableAnnotations[0]!;
  const args = annotation.childForFieldName('arguments');
  const pairs = args ? childrenOf(args, 'element_value_pair') : [];
  if (pairs.length !== 1 || pairs[0]?.childForFieldName('key')?.text !== 'name') return undefined;
  const value = pairs[0].childForFieldName('value');
  if (value?.type !== 'string_literal') return undefined;
  try {
    const parsed: unknown = JSON.parse(value.text);
    return typeof parsed === 'string' && parsed.length && parsed.length <= 512
      ? { name: parsed, line: annotation.startPosition.row + 1 } : undefined;
  } catch { return undefined; }
}

function fieldTypes(body: Node): Map<string, string> {
  const fields = new Map<string, string>();
  const ambiguous = new Set<string>();
  for (const field of childrenOf(body, 'field_declaration')) {
    const type = field.childForFieldName('type')?.text;
    const declarations = childrenOf(field, 'variable_declarator');
    if (!type || declarations.length !== 1) continue;
    const name = declarations[0]?.childForFieldName('name')?.text;
    if (!name) continue;
    if (fields.has(name)) ambiguous.add(name);
    fields.set(name, type);
  }
  for (const name of ambiguous) fields.delete(name);
  return fields;
}

function parameterTypes(method: Node): Map<string, string> {
  const params = new Map<string, string>();
  const list = method.childForFieldName('parameters');
  for (const param of list ? javaChildren(list) : []) {
    if (param.type !== 'formal_parameter') continue;
    const name = param.childForFieldName('name')?.text;
    const type = param.childForFieldName('type')?.text;
    if (name && type) params.set(name, type);
  }
  return params;
}

function walk(node: Node, visit: (node: Node) => void): void {
  visit(node);
  for (const child of javaChildren(node)) walk(child, visit);
}

/** Source-anchored candidates only; project resolver must verify unique targets. */
export async function scanJavaSemanticCandidates(bytes: Uint8Array): Promise<JavaSemanticCandidates> {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength > MAX_BYTES) return { ok: false, code: 'TOO_LARGE' };
  let source: string;
  try { source = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { return { ok: false, code: 'INVALID_UTF8' }; }
  const language = await loadJavaGrammar();
  const parser = new Parser();
  let tree: ReturnType<Parser['parse']> = null;
  try {
    parser.setLanguage(language);
    tree = parser.parse(source);
    if (!tree || tree.rootNode.hasError) return { ok: false, code: 'SYNTAX_ERROR' };
    const pkg = javaPackageName(tree.rootNode);
    const tableImport = javaChildren(tree.rootNode).some(node => node.type === 'import_declaration' &&
      /^import\s+jakarta\.persistence\.Table\s*;$/.test(node.text));
    const importedTypes = new Set(javaChildren(tree.rootNode).filter(node => node.type === 'import_declaration')
      .map(node => /^import\s+([A-Za-z_][A-Za-z0-9_.]*)\s*;$/.exec(node.text)?.[1]?.split('.').at(-1))
      .filter((name): name is string => !!name));
    const jpa_tables: JpaTableCandidate[] = [];
    const calls: JavaCallCandidate[] = [];
    for (const type of childrenOf(tree.rootNode, 'class_declaration')) {
      const local = type.childForFieldName('name')?.text;
      if (!local) continue;
      const owner = pkg ? `${pkg}.${local}` : local;
      const table = tableImport ? explicitTable(type) : undefined;
      if (table) jpa_tables.push({ entity: owner, table: table.name,
        start_line: table.line, end_line: table.line });
      const body = type.childForFieldName('body');
      if (!body) continue;
      const fields = fieldTypes(body);
      for (const method of childrenOf(body, 'method_declaration')) {
        const sourceMethod = javaMethodSignature(method, owner);
        if (!sourceMethod) continue;
        const params = parameterTypes(method);
        const methodBody = method.childForFieldName('body');
        if (!methodBody) continue;
        const shadowed = new Set<string>(params.keys());
        walk(methodBody, node => {
          if (node.type !== 'local_variable_declaration') return;
          for (const declaration of childrenOf(node, 'variable_declarator')) {
            const name = declaration.childForFieldName('name')?.text;
            if (name) shadowed.add(name);
          }
        });
        walk(methodBody, node => {
          if (node.type !== 'method_invocation') return;
          const receiver = node.childForFieldName('object');
          const methodName = node.childForFieldName('name')?.text;
          if (receiver?.type !== 'identifier' || !methodName || shadowed.has(receiver.text)) return;
          const targetType = fields.get(receiver.text);
          const args = node.childForFieldName('arguments');
          const argumentsList = args ? javaChildren(args) : [];
          if (!targetType || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(targetType) ||
            importedTypes.has(targetType) ||
            argumentsList.some(arg => arg.type !== 'identifier' || !params.has(arg.text))) return;
          const argumentTypes = argumentsList.map(arg => params.get(arg.text)!);
          const targetOwner = pkg ? `${pkg}.${targetType}` : targetType;
          calls.push({ source: sourceMethod,
            target: `${targetOwner}.${methodName}(${argumentTypes.join(',')})`,
            start_line: node.startPosition.row + 1, end_line: node.endPosition.row + 1 });
        });
      }
    }
    if (calls.length + jpa_tables.length > MAX_CANDIDATES) return { ok: false, code: 'TOO_LARGE' };
    return { ok: true, jpa_tables, calls,
      known_unsupported: ['inherited/dynamic dispatch', 'local receiver inference',
        'overload conversion', 'imports for field type', 'implicit ORM naming'] };
  } finally { tree?.delete(); parser.delete(); }
}

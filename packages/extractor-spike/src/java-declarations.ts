import { createRequire } from 'node:module';
import { Language, Parser, type Node } from 'web-tree-sitter';

/** Bounded Java syntax experiment over caller-supplied bytes. No call or route resolution. */
export type JavaDeclaration = {
  kind: 'type' | 'method' | 'constructor';
  qualified_name: string;
  signature?: string;
  start_line: number;
  end_line: number;
};
export type JavaResult =
  | { ok: false; code: 'TOO_LARGE' | 'INVALID_UTF8' | 'SYNTAX_ERROR' | 'DECLARATION_LIMIT' }
  | { ok: true; declarations: readonly JavaDeclaration[]; status: 'partial';
      known_unsupported: readonly string[] };

const MAX_BYTES = 1024 * 1024;
const MAX_DECLARATIONS = 10000;
const TYPE_NODES = new Set(['class_declaration', 'interface_declaration', 'enum_declaration', 'record_declaration']);
const UNSUPPORTED = ['nested/local types', 'fields', 'semantic call resolution', 'Spring routes', 'JPA mappings'];
const require = createRequire(import.meta.url);
export const javaChildren = (node: Node): Node[] => node.namedChildren.filter((child): child is Node => child !== null);
let javaLanguage: Promise<Language> | undefined;
export function loadJavaGrammar(): Promise<Language> {
  javaLanguage ??= (async () => {
    await Parser.init();
    return Language.load(require.resolve('tree-sitter-wasms/out/tree-sitter-java.wasm'));
  })();
  return javaLanguage;
}

export function javaPackageName(root: Node): string {
  const declaration = javaChildren(root).find(node => node.type === 'package_declaration');
  return declaration && javaChildren(declaration).find(node => node.type === 'identifier' || node.type === 'scoped_identifier')?.text || '';
}
export function javaMethodSignature(node: Node, owner: string): string | undefined {
  const methodName = node.childForFieldName('name')?.text;
  if (!methodName) return undefined;
  const parameterList = node.childForFieldName('parameters');
  const parameters = parameterList ? javaChildren(parameterList) : [];
  const types: string[] = [];
  for (const parameter of parameters) {
    if (parameter.type !== 'formal_parameter' && parameter.type !== 'spread_parameter') return undefined;
    const declared = parameter.childForFieldName('type')?.text;
    if (!declared) return undefined;
    const dimensions = javaChildren(parameter).find(child => child.type === 'dimensions')?.text ?? '';
    types.push(`${declared}${dimensions}${parameter.type === 'spread_parameter' ? '...' : ''}`.replace(/\s+/g, ''));
  }
  return `${owner}.${methodName}(${types.join(',')})`;
}

export async function scanJavaDeclarations(bytes: Uint8Array): Promise<JavaResult> {
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
    const declarations: JavaDeclaration[] = [];
    for (const type of javaChildren(tree.rootNode).filter(node => TYPE_NODES.has(node.type))) {
      const local = type.childForFieldName('name')?.text;
      if (!local) return { ok: false, code: 'SYNTAX_ERROR' };
      const owner = pkg ? `${pkg}.${local}` : local;
      declarations.push({ kind: 'type', qualified_name: owner,
        start_line: type.startPosition.row + 1, end_line: type.endPosition.row + 1 });
      const body = type.childForFieldName('body');
      for (const member of body ? javaChildren(body) : []) {
        if (member.type !== 'method_declaration' && member.type !== 'constructor_declaration') continue;
        const signature = javaMethodSignature(member, owner);
        if (!signature) return { ok: false, code: 'SYNTAX_ERROR' };
        declarations.push({ kind: member.type === 'method_declaration' ? 'method' : 'constructor',
          qualified_name: signature, signature,
          start_line: member.startPosition.row + 1, end_line: member.endPosition.row + 1 });
        if (declarations.length > MAX_DECLARATIONS) return { ok: false, code: 'DECLARATION_LIMIT' };
      }
    }
    return { ok: true, declarations, status: 'partial', known_unsupported: UNSUPPORTED };
  } finally {
    tree?.delete();
    parser.delete();
  }
}

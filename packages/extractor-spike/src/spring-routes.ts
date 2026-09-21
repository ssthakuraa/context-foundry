import { Parser, type Node } from 'web-tree-sitter';
import { javaChildren, javaMethodSignature, javaPackageName, loadJavaGrammar } from './java-declarations.js';

/** Narrow Spring MVC literal-route experiment; never executes source or resolves beans. */
export type SpringRoute = { method: 'GET' | 'POST'; path: string; implementation: string;
  start_line: number; end_line: number };
export type SpringRouteResult =
  | { ok: false; code: 'TOO_LARGE' | 'INVALID_UTF8' | 'SYNTAX_ERROR' }
  | { ok: true; routes: readonly SpringRoute[]; diagnostics: readonly string[]; status: 'partial' };

const MAX_BYTES = 1024 * 1024;
const IMPORT_PREFIX = 'org.springframework.web.bind.annotation.';
const HTTP = { GetMapping: 'GET', PostMapping: 'POST' } as const;
function annotations(node: Node): Node[] {
  const modifiers = javaChildren(node).find(child => child.type === 'modifiers');
  return modifiers ? javaChildren(modifiers).filter(child =>
    child.type === 'annotation' || child.type === 'marker_annotation') : [];
}
function annotationName(node: Node): string | undefined {
  return node.childForFieldName('name')?.text;
}
function literalArg(node: Node): string | undefined {
  const args = node.childForFieldName('arguments');
  const expressions = args ? javaChildren(args) : [];
  if (expressions.length !== 1 || expressions[0]?.type !== 'string_literal') return undefined;
  try {
    const parsed: unknown = JSON.parse(expressions[0].text);
    return typeof parsed === 'string' ? parsed : undefined;
  } catch { return undefined; }
}
function imports(root: Node): Set<string> {
  const result = new Set<string>();
  for (const declaration of javaChildren(root).filter(node => node.type === 'import_declaration')) {
    const match = /^import\s+(org\.springframework\.web\.bind\.annotation\.[A-Za-z]+)\s*;$/.exec(declaration.text);
    if (match) result.add(match[1]!);
  }
  return result;
}
function joinPath(base: string, suffix: string): string | undefined {
  if (!base.startsWith('/') || !suffix.startsWith('/') || base.includes('{') || suffix.includes('${')) return undefined;
  return `${base.replace(/\/$/, '')}${suffix}` || '/';
}

export async function scanSpringRoutes(bytes: Uint8Array): Promise<SpringRouteResult> {
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
    const available = imports(tree.rootNode);
    const routes: SpringRoute[] = [];
    const diagnostics: string[] = [];
    const pkg = javaPackageName(tree.rootNode);
    for (const type of javaChildren(tree.rootNode).filter(node => node.type === 'class_declaration')) {
      const typeName = type.childForFieldName('name')?.text;
      if (!typeName) continue;
      const classAnnotations = annotations(type);
      const controller = classAnnotations.some(node => annotationName(node) === 'RestController' &&
        available.has(`${IMPORT_PREFIX}RestController`));
      if (!controller) continue;
      const baseAnnotation = classAnnotations.find(node => annotationName(node) === 'RequestMapping' &&
        available.has(`${IMPORT_PREFIX}RequestMapping`));
      const base = baseAnnotation && literalArg(baseAnnotation);
      if (base === undefined) { diagnostics.push('UNSUPPORTED_BASE_ROUTE'); continue; }
      const body = type.childForFieldName('body');
      for (const member of body ? javaChildren(body) : []) {
        if (member.type !== 'method_declaration') continue;
        for (const annotation of annotations(member)) {
          const kind = annotationName(annotation) as keyof typeof HTTP | undefined;
          if (!kind || !(kind in HTTP) || !available.has(`${IMPORT_PREFIX}${kind}`)) continue;
          const suffix = literalArg(annotation);
          const path = suffix === undefined ? undefined : joinPath(base, suffix);
          const owner = pkg ? `${pkg}.${typeName}` : typeName;
          const implementation = javaMethodSignature(member, owner);
          if (!path || !implementation) { diagnostics.push('UNSUPPORTED_METHOD_ROUTE'); continue; }
          routes.push({ method: HTTP[kind], path, implementation,
            start_line: annotation.startPosition.row + 1, end_line: member.endPosition.row + 1 });
        }
      }
    }
    return { ok: true, routes, diagnostics, status: 'partial' };
  } finally {
    tree?.delete();
    parser.delete();
  }
}

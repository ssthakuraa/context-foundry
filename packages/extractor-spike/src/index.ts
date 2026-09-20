import ts from 'typescript';

export type Declaration = {
  kind: 'class' | 'interface' | 'function' | 'method';
  name: string;
  qualified_name: string;
  signature?: string;
  start_line: number;
  end_line: number;
};
export type ExtractionDiagnostic = {
  code: 'PARSE_ERROR' | 'UNSUPPORTED_NAME' | 'UNSUPPORTED_DECLARATION';
  line: number;
};
export type DeclarationExtraction = {
  declarations: readonly Declaration[];
  diagnostics: readonly ExtractionDiagnostic[];
};

/** Syntax-only prototype on caller-supplied text. No source execution, resolution, or runtime claims. */
export function extractTypeScriptDeclarations(path: string, source: string): DeclarationExtraction {
  const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const line = (position: number) => file.getLineAndCharacterOfPosition(position).line + 1;
  const host = ts.createCompilerHost({ noResolve: true, noLib: true });
  host.getSourceFile = requested => requested === path ? file : undefined;
  host.fileExists = requested => requested === path;
  host.readFile = requested => requested === path ? source : undefined;
  const program = ts.createProgram([path], { noResolve: true, noLib: true }, host);
  const parseErrors: ExtractionDiagnostic[] = program.getSyntacticDiagnostics(file).map(error => ({
    code: 'PARSE_ERROR', line: line(error.start ?? 0),
  }));
  if (parseErrors.length) return { declarations: [], diagnostics: parseErrors };
  const declarations: Declaration[] = [];
  const diagnostics: ExtractionDiagnostic[] = [];
  const add = (kind: Declaration['kind'], node: ts.Node, name: string, parent?: string,
    signature?: string): void => {
    declarations.push({
      kind, name, qualified_name: parent ? `${parent}.${name}` : name,
      ...(signature === undefined ? {} : { signature }),
      start_line: line(node.getStart(file)), end_line: line(node.getEnd() - 1),
    });
  };
  const nameOf = (node: ts.Node, name: ts.PropertyName | ts.BindingName | undefined): string | undefined => {
    if (name && ts.isIdentifier(name)) return name.text;
    diagnostics.push({ code: 'UNSUPPORTED_NAME', line: line(node.getStart(file)) });
    return undefined;
  };
  const signatureOf = (name: string, parameters: ts.NodeArray<ts.ParameterDeclaration>,
    returnType?: ts.TypeNode): string =>
    `${name}(${parameters.map(parameter => parameter.type?.getText(file) ?? '?').join(',')})` +
    (returnType ? `:${returnType.getText(file)}` : '');
  for (const statement of file.statements) {
    if (ts.isClassDeclaration(statement) || ts.isInterfaceDeclaration(statement)) {
      const className = nameOf(statement, statement.name);
      if (!className) continue;
      add(ts.isClassDeclaration(statement) ? 'class' : 'interface', statement, className);
      if (ts.isClassDeclaration(statement)) {
        for (const member of statement.members) {
          if (ts.isMethodDeclaration(member)) {
            const methodName = nameOf(member, member.name);
            if (methodName) add('method', member, methodName, className,
              signatureOf(methodName, member.parameters, member.type));
          } else if (!ts.isConstructorDeclaration(member) && !ts.isPropertyDeclaration(member) &&
            !ts.isGetAccessorDeclaration(member) && !ts.isSetAccessorDeclaration(member) &&
            !ts.isSemicolonClassElement(member)) {
            diagnostics.push({ code: 'UNSUPPORTED_DECLARATION', line: line(member.getStart(file)) });
          }
        }
      }
    } else if (ts.isFunctionDeclaration(statement)) {
      const functionName = nameOf(statement, statement.name);
      if (functionName) add('function', statement, functionName, undefined,
        signatureOf(functionName, statement.parameters, statement.type));
    }
  }
  return { declarations, diagnostics };
}

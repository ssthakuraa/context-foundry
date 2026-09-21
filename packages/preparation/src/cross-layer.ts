import { createHash } from 'node:crypto';
import { canonicalSha256, checkCaptureBindings, checkCaptureByteClosure, parseJsonStrict,
  validate, type Coverage, type EvidenceLocator } from '@context-foundry/contracts';
import { checkExtensionRecords, createBuiltinProfile, installKindProfiles,
  type AdapterManifest, type BuiltinExtensionKind, type ExtensionConsumer,
  type ExtensionRecord } from '@context-foundry/contracts/extensions';
import { scanJavaDeclarations } from '@context-foundry/extractor-spike/java';
import { scanSpringRoutes } from '@context-foundry/extractor-spike/spring';
import { scanSqlDdl } from '@context-foundry/extractor-spike/sql';
import { scanJavaSemanticCandidates } from '@context-foundry/extractor-spike/semantic-candidates';
import { extractTypeScriptDeclarations } from '@context-foundry/extractor-spike/typescript';
import type { ApprovedCapture } from './runner.js';

const PRODUCER_ID = 'context-foundry:seeded';
const KINDS: readonly BuiltinExtensionKind[] = [
  'source.artifact', 'engineering.symbol', 'interface.operation',
  'engineering.relationship', 'business.rule', 'business.mapping', 'test.association',
];
const profiles = KINDS.map(createBuiltinProfile);
const installed = installKindProfiles(profiles).installed!;
const profileByKind = new Map(profiles.map(item => [item.kind, item]));
const profileRefs = profiles.map(item => ({ kind: item.kind, profile_digest: item.profile_digest }));
const manifest: AdapterManifest = {
  schema_version: '0.3.0', protocol_major: 1,
  adapter_id: PRODUCER_ID, adapter_version: '0.1.0', package_digest: 'a'.repeat(64),
  role: 'analyzer', media_types: ['text/plain', 'application/json'],
  languages: ['java', 'sql', 'markdown', 'typescript', 'openapi'],
  config_schema_digest: 'b'.repeat(64), emitted_profiles: profileRefs,
  consumed_profiles: [], parser_version: 'bounded-1', rule_version: 'bounded-1',
  requested_capabilities: ['capture.read'],
  resource_limits: { input_bytes: 16 * 1024 * 1024, output_bytes: 16 * 1024 * 1024,
    messages: 100_000, wall_ms: 300_000 }, license: 'Apache-2.0',
};
const consumer: ExtensionConsumer = {
  schema_version: '0.3.0', consumer_id: 'offline-candidate:1',
  required_profiles: [], accepted_profiles: profileRefs,
};

export type ReviewedMapping = {
  business_section: string; operation_key: string; reviewer_id: string;
  applicability: string;
};
export type ReviewedTestAssociation = {
  test_signature: string; target_signature: string; reviewer_id: string;
  expected_scope: string;
};
export type CrossLayerInput = {
  capture: ApprovedCapture;
  service_id: string;
  sql_dialect: 'oracle';
  reviewed_mappings?: readonly ReviewedMapping[];
  reviewed_test_associations?: readonly ReviewedTestAssociation[];
};
export type CrossLayerCandidate = {
  records: readonly ExtensionRecord[]; locators: readonly EvidenceLocator[];
  coverage: readonly Coverage[]; diagnostics: readonly string[]; digest: string;
};
export type CrossLayerResult = { ok: true; candidate: CrossLayerCandidate } |
  { ok: false; code: 'INVALID_INPUT' | 'CAPTURE_BYTES_CHANGED' | 'INVALID_CANDIDATE' };

function stableId(prefix: string, parts: readonly string[]): string {
  return `${prefix}:${createHash('sha256').update(JSON.stringify(parts)).digest('hex')}`;
}

/** Bounded first-party worker proof over caller-supplied, declared bytes. */
export async function assembleCrossLayerCandidate(input: CrossLayerInput): Promise<CrossLayerResult> {
  const { capture, files, supplied } = input.capture;
  if (!input.service_id || input.service_id.length > 512 || files.length > 100 || !files.length ||
    files.some(file => file.bytes > 1024 * 1024) ||
    (input.reviewed_mappings ?? []).some(item => !item.business_section || !item.operation_key ||
      !item.reviewer_id || !item.applicability) ||
    (input.reviewed_test_associations ?? []).some(item => !item.test_signature ||
      !item.target_signature || !item.reviewer_id || !item.expected_scope)) {
    return { ok: false, code: 'INVALID_INPUT' };
  }
  if (checkCaptureByteClosure(capture, files, supplied).issues.length) {
    return { ok: false, code: 'CAPTURE_BYTES_CHANGED' };
  }
  const byPath = new Map(supplied.map(item => [item.path, item.bytes]));
  const records: ExtensionRecord[] = [];
  const locators: EvidenceLocator[] = [];
  const coverage: Coverage[] = [];
  const diagnostics: string[] = [];
  const symbolByKey = new Map<string, ExtensionRecord[]>();
  const operationByKey = new Map<string, ExtensionRecord[]>();
  const ruleBySection = new Map<string, ExtensionRecord[]>();
  const tableByName = new Map<string, ExtensionRecord[]>();
  const springRoutes: { method: string; path: string; implementation: string; evidence: string }[] = [];
  const callCandidates: { source: string; target: string; evidence: string }[] = [];
  const jpaCandidates: { entity: string; table: string; evidence: string }[] = [];
  const captureDigest = canonicalSha256(capture);
  const sourceNamespace = capture.source_id;
  const classification = (fileClass: 'public' | 'internal' | 'restricted') =>
    capture.classification === 'restricted' || fileClass === 'restricted' ? 'restricted' as const :
      capture.classification === 'internal' || fileClass === 'internal' ? 'internal' as const : 'public' as const;
  const joinedClassification = (...items: readonly ExtensionRecord[]): ExtensionRecord['classification'] =>
    items.some(item => item.classification === 'restricted') ? 'restricted' :
      items.some(item => item.classification === 'internal') ? 'internal' : 'public';

  const addLocator = (file: (typeof files)[number], tag: string, start?: number, end?: number): string => {
    const evidence_id = stableId('ev', [capture.capture_id, file.path, file.file_digest, tag,
      String(start ?? ''), String(end ?? '')]);
    const base = { evidence_id, source_id: capture.source_id, snapshot_id: capture.snapshot_id,
      revision_kind: capture.revision_kind,
      ...(capture.revision_value ? { revision_value: capture.revision_value } : {}),
      path: file.path, file_digest: file.file_digest };
    const locator: EvidenceLocator = start !== undefined && end !== undefined
      ? { ...base, kind: 'file_range', start_line: start, end_line: end }
      : { ...base, kind: 'document_section', section_id: tag };
    locators.push(locator);
    return evidence_id;
  };
  const addRecord = (kind: BuiltinExtensionKind, key: string, payload: Record<string, unknown>,
    name: string, support: readonly string[], dependencies: readonly string[] = [],
    options: { origin?: ExtensionRecord['origin']; review?: ExtensionRecord['review'];
      references?: ExtensionRecord['references']; classification?: ExtensionRecord['classification'];
      summary?: string; owner?: string } = {}): ExtensionRecord => {
    const profile = profileByKind.get(kind)!;
    const identity = { source_namespace: sourceNamespace, scheme: profile.identity_scheme,
      scheme_version: profile.scheme_version, key };
    const result: ExtensionRecord = {
      schema_version: '0.3.0', record_id: stableId('rec', [capture.capture_id, kind, key, ...support]),
      kind, profile_digest: profile.profile_digest, identity, producer_id: PRODUCER_ID,
      owner_id: options.owner ?? capture.authority_id, origin: options.origin ?? 'source_declared',
      review: options.review ?? { state: 'not_required' }, payload,
      descriptor: { name, aliases: [], ...(options.summary ? { summary: options.summary } : {}),
        locator_refs: [...support] },
      references: [...(options.references ?? [])], evidence_refs: [...support],
      dependency_refs: [...dependencies], classification: options.classification ?? capture.classification,
    };
    records.push(result);
    return result;
  };
  const index = (map: Map<string, ExtensionRecord[]>, key: string, record: ExtensionRecord) => {
    const group = map.get(key) ?? [];
    group.push(record); map.set(key, group);
  };
  const cover = (file: (typeof files)[number], family: string, patterns: readonly string[], unsupported: readonly string[],
    failed = false) => {
    coverage.push({ schema_version: '0.2.0', source_id: capture.source_id,
      capture_digest: captureDigest, adapter_id: PRODUCER_ID,
      artifact_family: `${family}:${file.path}`, supported_patterns: [...patterns],
      eligible_count: 1, processed_count: failed ? 0 : 1, failed_count: failed ? 1 : 0,
      excluded_count: 0, known_unsupported: [...unsupported],
      diagnostic_refs: [], status: 'partial',
      reason: failed ? 'Parser rejected this declared file.' : 'Only named patterns were analyzed.',
    });
  };

  for (const file of [...files].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0)) {
    const bytes = byPath.get(file.path)!;
    if (file.path.endsWith('.java')) {
      const [declarations, routes, semantics] = await Promise.all([
        scanJavaDeclarations(bytes), scanSpringRoutes(bytes), scanJavaSemanticCandidates(bytes),
      ]);
      const failed = !declarations.ok || !routes.ok || !semantics.ok;
      if (failed) { diagnostics.push(`JAVA_UNSUPPORTED:${file.path}`); cover(file, 'java', [], [], true); continue; }
      for (const declaration of declarations.declarations) {
        const evidence = addLocator(file, declaration.qualified_name,
          declaration.start_line, declaration.end_line);
        const name = declaration.qualified_name.split('.').at(-1)!;
        const symbol = addRecord('engineering.symbol', declaration.qualified_name,
          { name, qualified_name: declaration.qualified_name, artifact_kind: declaration.kind,
            language: 'java', ...(declaration.signature ? { signature: declaration.signature } : {}) },
          name, [evidence], [], { classification: classification(file.classification) });
        index(symbolByKey, declaration.qualified_name, symbol);
      }
      for (const route of routes.routes) {
        springRoutes.push({ method: route.method, path: route.path,
          implementation: route.implementation,
          evidence: addLocator(file, `spring:${route.method}:${route.path}`,
            route.start_line, route.end_line) });
      }
      for (const call of semantics.calls) callCandidates.push({ source: call.source, target: call.target,
        evidence: addLocator(file, `call:${call.source}:${call.target}`,
          call.start_line, call.end_line) });
      for (const table of semantics.jpa_tables) jpaCandidates.push({ entity: table.entity,
        table: table.table, evidence: addLocator(file, `jpa:${table.entity}:${table.table}`,
          table.start_line, table.end_line) });
      diagnostics.push(...routes.diagnostics.map(item => `${item}:${file.path}`));
      cover(file, 'java', ['top-level declarations', 'literal Spring routes',
        'explicit JPA table', 'field/parameter call candidates'], semantics.known_unsupported);
    } else if (file.path.endsWith('.sql')) {
      const sql = scanSqlDdl(bytes);
      if (!sql.ok) { diagnostics.push(`SQL_UNSUPPORTED:${file.path}`); cover(file, 'sql', [], [], true); continue; }
      const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      for (const table of sql.tables) {
        const evidence = addLocator(file, `table:${table.name}`, table.start_line, table.end_line);
        // The bounded scanner loses quoted-identifier provenance. Quoted DDL is never joined exactly.
        const tableKey = text.includes('"') ? `quoted-unknown:${table.name}` : `sql:oracle:${table.name}`;
        const item = addRecord('source.artifact', tableKey,
          { artifact_type: 'sql_table', name: table.name }, table.name, [evidence], [],
          { classification: classification(file.classification) });
        index(tableByName, tableKey, item);
      }
      cover(file, 'sql', ['CREATE TABLE and columns'], sql.known_unsupported);
    } else if (file.path.endsWith('.json')) {
      let document: unknown;
      try { document = parseJsonStrict(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
      catch { diagnostics.push(`JSON_INVALID:${file.path}`); cover(file, 'openapi', [], [], true); continue; }
      const api = document as { openapi?: unknown; info?: { version?: unknown };
        paths?: Record<string, Record<string, unknown>> };
      if (!api || typeof api !== 'object' || typeof api.openapi !== 'string' ||
        typeof api.info?.version !== 'string' || !api.paths || typeof api.paths !== 'object') {
        diagnostics.push(`OPENAPI_UNSUPPORTED:${file.path}`); cover(file, 'openapi', [], [], true); continue;
      }
      for (const [route, methods] of Object.entries(api.paths)) {
        if (!route.startsWith('/') || !methods || typeof methods !== 'object') continue;
        for (const [verb, raw] of Object.entries(methods)) {
          if (!['get', 'post', 'put', 'patch', 'delete'].includes(verb) ||
            !raw || typeof raw !== 'object') continue;
          const operation = raw as { operationId?: unknown; responses?: Record<string, unknown>;
            $ref?: unknown };
          if (operation.$ref !== undefined || typeof operation.operationId !== 'string' ||
            !operation.responses || typeof operation.responses !== 'object' ||
            Object.values(operation.responses).some(value => value && typeof value === 'object' && '$ref' in value)) {
            diagnostics.push(`OPENAPI_OPERATION_UNSUPPORTED:${file.path}:${verb}:${route}`); continue;
          }
          const method = verb.toUpperCase();
          const key = `${input.service_id}|${api.info.version}|${method}|${route}`;
          const evidence = addLocator(file, `/paths/${route.replaceAll('~', '~0').replaceAll('/', '~1')}/${verb}`);
          const item = addRecord('interface.operation', key,
            { name: operation.operationId, operation_key: `${method} ${route}`,
              service_id: input.service_id, version: api.info.version, method, route,
              responses: Object.keys(operation.responses) },
            operation.operationId, [evidence], [], { classification: classification(file.classification) });
          index(operationByKey, `${method} ${route}`, item);
        }
      }
      cover(file, 'openapi', ['literal paths and methods'], ['external $ref', 'callbacks', 'computed routes']);
    } else if (file.path.endsWith('.md')) {
      let text: string;
      try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
      catch { diagnostics.push(`MARKDOWN_INVALID:${file.path}`); cover(file, 'markdown', [], [], true); continue; }
      const lines = text.split(/\r?\n/);
      const edition = /^Edition:\s*([A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*)/m.exec(text)?.[1] ?? 'unknown';
      for (let i = 0; i < lines.length; i++) {
        const heading = /^##\s+(.+)$/.exec(lines[i]!);
        if (!heading) continue;
        const title = heading[1]!.trim();
        let end = i + 1;
        while (end < lines.length && !/^##\s+/.test(lines[end]!)) end++;
        const passage = lines.slice(i + 1, end).join('\n').trim();
        if (!passage) continue;
        const evidence = addLocator(file, title, i + 1, end);
        addRecord('source.artifact', `${file.path}#${title}`,
          { artifact_type: 'document_section', name: title, description: passage },
          title, [evidence], [], { classification: classification(file.classification) });
        const rule = addRecord('business.rule', `${file.path}#${title}`,
          { statement: passage, edition, applicability: 'unknown' },
          title, [evidence], [], { review: { state: 'pending' },
            classification: classification(file.classification) });
        index(ruleBySection, title, rule);
        i = end - 1;
      }
      cover(file, 'markdown', ['level-two passages'], ['embedded HTML', 'unreviewed applicability']);
    } else if (file.path.endsWith('.ts')) {
      let text: string;
      try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
      catch { diagnostics.push(`TYPESCRIPT_INVALID:${file.path}`); cover(file, 'typescript', [], [], true); continue; }
      const declarations = extractTypeScriptDeclarations(file.path, text);
      for (const declaration of declarations.declarations) {
        const evidence = addLocator(file, declaration.qualified_name,
          declaration.start_line, declaration.end_line);
        const item = addRecord('engineering.symbol', `${file.path}:${declaration.qualified_name}`,
          { name: declaration.name, qualified_name: declaration.qualified_name,
            artifact_kind: declaration.kind, language: 'typescript',
            ...(declaration.signature ? { signature: declaration.signature } : {}) },
          declaration.name, [evidence], [], { classification: classification(file.classification) });
        index(symbolByKey, `${file.path}:${declaration.qualified_name}`, item);
      }
      diagnostics.push(...declarations.diagnostics.map(item => `${item.code}:${file.path}:${item.line}`));
      cover(file, 'typescript', ['top-level declarations'],
        ['framework routes', 'semantic imports'], declarations.diagnostics.some(item => item.code === 'PARSE_ERROR'));
    } else return { ok: false, code: 'INVALID_INPUT' };
  }

  const relationship = (key: string, relationType: string, basis: string,
    subject: ExtensionRecord, object: ExtensionRecord, support: readonly string[],
    role: 'subject' | 'subject_symbol', objectRole: 'object' | 'object_artifact') => {
    addRecord('engineering.relationship', key,
      { relation_type: relationType, basis }, relationType, support,
      [subject.record_id, object.record_id], { origin: 'static_resolution',
        references: [
          { role, target_kind: subject.kind, target: subject.identity, resolution: 'resolved' },
          { role: objectRole, target_kind: object.kind, target: object.identity, resolution: 'resolved' },
        ], classification: joinedClassification(subject, object) });
  };
  const routeCounts = new Map<string, number>();
  for (const route of springRoutes) {
    const key = `${route.method} ${route.path}`;
    routeCounts.set(key, (routeCounts.get(key) ?? 0) + 1);
  }
  for (const route of springRoutes) {
    if (routeCounts.get(`${route.method} ${route.path}`) !== 1) {
      diagnostics.push(`ROUTE_AMBIGUOUS:${route.method} ${route.path}`); continue;
    }
    const operations = operationByKey.get(`${route.method} ${route.path}`) ?? [];
    const targets = symbolByKey.get(route.implementation) ?? [];
    if (operations.length !== 1 || targets.length !== 1) {
      diagnostics.push(`ROUTE_UNRESOLVED:${route.method} ${route.path}`); continue;
    }
    const operation = operations[0]!, target = targets[0]!;
    relationship(`route:${operation.identity.key}:${target.identity.key}`, 'api.implemented_by',
      'spring_literal_route', operation, target,
      [...operation.evidence_refs, route.evidence], 'subject', 'object');
  }
  for (const call of callCandidates) {
    const callers = symbolByKey.get(call.source) ?? [];
    const targets = symbolByKey.get(call.target) ?? [];
    if (callers.length !== 1 || targets.length !== 1) {
      diagnostics.push(`CALL_UNRESOLVED:${call.source}:${call.target}`); continue;
    }
    relationship(`call:${call.source}:${call.target}`, 'engineering.calls', 'field_and_parameter_types',
      callers[0]!, targets[0]!, [call.evidence], 'subject_symbol', 'object');
  }
  for (const jpa of jpaCandidates) {
    const entities = symbolByKey.get(jpa.entity) ?? [];
    const tables = tableByName.get(`sql:oracle:${jpa.table.toUpperCase()}`) ?? [];
    if (entities.length !== 1 || tables.length !== 1) {
      diagnostics.push(`JPA_TABLE_UNRESOLVED:${jpa.entity}:${jpa.table}`); continue;
    }
    relationship(`jpa:${jpa.entity}:${tables[0]!.identity.key}`, 'engineering.persisted_in',
      'explicit_jpa_table_oracle_unquoted', entities[0]!, tables[0]!,
      [jpa.evidence, ...tables[0]!.evidence_refs], 'subject_symbol', 'object_artifact');
  }
  for (const mapping of input.reviewed_mappings ?? []) {
    const rules = ruleBySection.get(mapping.business_section) ?? [];
    const operations = operationByKey.get(mapping.operation_key) ?? [];
    if (rules.length !== 1 || operations.length !== 1) {
      diagnostics.push(`BUSINESS_MAPPING_UNRESOLVED:${mapping.business_section}`); continue;
    }
    const rule = rules[0]!, operation = operations[0]!;
    const support = [...rule.evidence_refs, ...operation.evidence_refs];
    addRecord('business.mapping', `${rule.identity.key}:${operation.identity.key}`,
      { mapping_relation: 'exposed_by', mapping_basis: 'reviewed_association',
        applicability: mapping.applicability }, mapping.business_section,
      support, [rule.record_id, operation.record_id], {
        origin: 'human_asserted', owner: mapping.reviewer_id,
        review: { state: 'approved', evidence_fingerprint: canonicalSha256(support) },
        references: [
          { role: 'business', target_kind: rule.kind, target: rule.identity, resolution: 'resolved' },
          { role: 'technical', target_kind: operation.kind, target: operation.identity, resolution: 'resolved' },
        ],
        classification: joinedClassification(rule, operation),
      });
  }
  for (const association of input.reviewed_test_associations ?? []) {
    const tests = symbolByKey.get(association.test_signature) ?? [];
    const targets = symbolByKey.get(association.target_signature) ?? [];
    if (tests.length !== 1 || targets.length !== 1) {
      diagnostics.push(`TEST_ASSOCIATION_UNRESOLVED:${association.test_signature}`); continue;
    }
    const test = tests[0]!, target = targets[0]!;
    const support = [...test.evidence_refs, ...target.evidence_refs];
    addRecord('test.association', `${test.identity.key}:${target.identity.key}`,
      { association_basis: 'reviewed_relevance', expected_scope: association.expected_scope },
      association.test_signature, support, [test.record_id, target.record_id], {
        origin: 'human_asserted', owner: association.reviewer_id,
        review: { state: 'approved', evidence_fingerprint: canonicalSha256(support) },
        references: [
          { role: 'test', target_kind: test.kind, target: test.identity, resolution: 'resolved' },
          { role: 'target', target_kind: target.kind, target: target.identity, resolution: 'resolved' },
        ],
        classification: joinedClassification(test, target),
      });
  }
  if (checkCaptureBindings([capture], files, locators).length ||
    coverage.some(item => !validate('coverage', item)) ||
    checkExtensionRecords(records, locators, manifest, consumer, installed).issues.length) {
    return { ok: false, code: 'INVALID_CANDIDATE' };
  }
  const orderedRecords = records.sort((a, b) => a.record_id < b.record_id ? -1 : a.record_id > b.record_id ? 1 : 0);
  const orderedLocators = locators.sort((a, b) => a.evidence_id < b.evidence_id ? -1 : a.evidence_id > b.evidence_id ? 1 : 0);
  const orderedCoverage = coverage.sort((a, b) => a.artifact_family < b.artifact_family ? -1 : a.artifact_family > b.artifact_family ? 1 : 0);
  const orderedDiagnostics = diagnostics.sort();
  return { ok: true, candidate: { records: orderedRecords, locators: orderedLocators,
    coverage: orderedCoverage, diagnostics: orderedDiagnostics,
    digest: canonicalSha256({ capture, files: [...files].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0),
      records: orderedRecords, locators: orderedLocators, coverage: orderedCoverage,
      diagnostics: orderedDiagnostics }) } };
}

import { createHash } from 'node:crypto';
import {
  canonicalSha256, checkCaptureBindings, checkReleaseIntegrity, validate,
  verifyCapturedFileBytes, type CapturedFile, type Coverage, type EvidenceLocator,
  type RecordEnvelope, type SourceCapture,
} from '@context-foundry/contracts';
import { extractTypeScriptDeclarations, type ExtractionDiagnostic } from './index.js';

const MAX_SOURCE_BYTES = 1024 * 1024;
const ADAPTER_ID = 'typescript-declaration-spike:1';
const SUPPORTED = ['top-level class', 'top-level interface', 'top-level function', 'class method'];
const UNSUPPORTED = ['imports', 'constructors', 'fields', 'accessors', 'interface methods',
  'computed names', 'TSX', 'framework routes', 'semantic resolution'];

export type CaptureInput = {
  capture: SourceCapture;
  file: CapturedFile;
  bytes: Uint8Array;
  declaredFiles?: readonly CapturedFile[];
};
export type CaptureDiagnostic = ExtractionDiagnostic & { diagnostic_id: string };
export type CaptureResult =
  | { ok: false; code: 'INVALID_METADATA' | 'CAPTURE_MISMATCH' | 'BYTES_MISMATCH' |
      'UNSUPPORTED_INPUT' | 'SOURCE_TOO_LARGE' | 'INVALID_UTF8' }
  | { ok: true; records: readonly RecordEnvelope[]; locators: readonly EvidenceLocator[];
      coverage: Coverage; diagnostics: readonly CaptureDiagnostic[] };

function stableId(prefix: string, parts: readonly string[]): string {
  return `${prefix}:${createHash('sha256').update(JSON.stringify(parts)).digest('hex')}`;
}

/** A one-file, caller-supplied synthetic precursor. It does not attest source origin,
 * acquire a repository, authorize publication, or produce an activatable pack. */
export function extractTypeScriptCapture(input: CaptureInput): CaptureResult {
  const { capture, file, bytes } = input;
  if (!validate('source_capture', capture) || !validate('captured_file', file)) {
    return { ok: false, code: 'INVALID_METADATA' };
  }
  const declaredFiles = input.declaredFiles ?? [file];
  if (checkCaptureBindings([capture], declaredFiles, []).length ||
    !declaredFiles.some(declared => canonicalSha256(declared) === canonicalSha256(file))) {
    return { ok: false, code: 'CAPTURE_MISMATCH' };
  }
  if (!file.path.endsWith('.ts') || (file.language_kind && file.language_kind !== 'typescript')) {
    return { ok: false, code: 'UNSUPPORTED_INPUT' };
  }
  if (bytes.byteLength > MAX_SOURCE_BYTES) return { ok: false, code: 'SOURCE_TOO_LARGE' };
  if (verifyCapturedFileBytes(file, bytes).status !== 'exact') {
    return { ok: false, code: 'BYTES_MISMATCH' };
  }
  let source: string;
  try {
    source = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return { ok: false, code: 'INVALID_UTF8' };
  }

  const extracted = extractTypeScriptDeclarations(file.path, source);
  const captureDigest = canonicalSha256(capture);
  const diagnostics: CaptureDiagnostic[] = extracted.diagnostics.map(diagnostic => ({
    ...diagnostic,
    diagnostic_id: stableId('diag', [capture.capture_id, file.path,
      diagnostic.code, String(diagnostic.line)]),
  }));
  const classification = (['public', 'internal', 'restricted'] as const).reduce(
    (highest, candidate) =>
      [capture.classification, file.classification].includes(candidate) ? candidate : highest,
    'public' as 'public' | 'internal' | 'restricted',
  );
  const locators: EvidenceLocator[] = [];
  const records: RecordEnvelope[] = [];
  for (const declaration of extracted.declarations) {
    const identity = [capture.source_id, file.path, declaration.kind,
      declaration.qualified_name, declaration.signature ?? ''];
    const entityId = stableId('ts-symbol', identity);
    const evidenceId = stableId('ev', [capture.capture_id, file.file_digest,
      entityId, String(declaration.start_line), String(declaration.end_line)]);
    const locator: EvidenceLocator = {
      kind: 'file_range', evidence_id: evidenceId, source_id: capture.source_id,
      snapshot_id: capture.snapshot_id, revision_kind: capture.revision_kind,
      ...(capture.revision_value ? { revision_value: capture.revision_value } : {}),
      path: file.path, file_digest: file.file_digest,
      start_line: declaration.start_line, end_line: declaration.end_line,
    };
    const record: RecordEnvelope = {
      schema_version: capture.schema_version,
      record_id: stableId('rec', [capture.capture_id, evidenceId]), entity_id: entityId,
      kind: 'engineering.symbol', owner_id: capture.authority_id,
      origin: 'source_declared', review: { state: 'pending' },
      payload: { name: declaration.name, qualified_name: declaration.qualified_name,
        artifact_kind: declaration.kind === 'class' || declaration.kind === 'interface'
          ? 'type' : declaration.kind,
        language: 'typescript',
        ...(declaration.signature ? { signature: declaration.signature } : {}) },
      evidence_refs: [evidenceId], dependency_refs: [], classification,
    };
    if (!validate('evidence_locator', locator) || !validate('record_envelope', record)) {
      return { ok: false, code: 'INVALID_METADATA' };
    }
    locators.push(locator);
    records.push(record);
  }
  const coverage: Coverage = {
    schema_version: capture.schema_version, source_id: capture.source_id,
    capture_digest: captureDigest, adapter_id: ADAPTER_ID,
    artifact_family: 'typescript.declarations', supported_patterns: SUPPORTED,
    eligible_count: 1, processed_count: extracted.diagnostics.some(item => item.code === 'PARSE_ERROR') ? 0 : 1,
    failed_count: extracted.diagnostics.some(item => item.code === 'PARSE_ERROR') ? 1 : 0,
    excluded_count: 0, known_unsupported: UNSUPPORTED,
    diagnostic_refs: diagnostics.map(item => item.diagnostic_id), status: 'partial',
    reason: 'Syntax-only one-file spike; unsupported declaration families remain outside the denominator.',
  };
  if (!validate('coverage', coverage)) return { ok: false, code: 'INVALID_METADATA' };
  const integrity = checkReleaseIntegrity([capture], declaredFiles, locators, records);
  if (integrity.bindingIssues.length || integrity.supportIssues.length ||
    integrity.flowIssues.length || integrity.obligationIssues.length ||
    integrity.engineeringTargetIssues.length) return { ok: false, code: 'INVALID_METADATA' };
  return { ok: true, records, locators, coverage, diagnostics };
}

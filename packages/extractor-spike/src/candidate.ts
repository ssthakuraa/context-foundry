import {
  canonicalRecordLines, canonicalSha256, checkCaptureByteClosure, checkReleaseIntegrity,
  type CapturedFile, type Coverage, type EvidenceLocator, type RecordEnvelope,
  type SourceCapture,
} from '@context-foundry/contracts';
import { extractTypeScriptCapture, type CaptureDiagnostic } from './capture.js';

const MAX_FILES = 100;
const MAX_TOTAL_BYTES = 16 * 1024 * 1024;

export type CandidateInput = {
  capture: SourceCapture;
  files: readonly CapturedFile[];
  supplied: readonly { path: string; bytes: Uint8Array }[];
};
export type CandidateResult =
  | { ok: false; code: 'EMPTY_CAPTURE' | 'TOO_MANY_FILES' | 'TOO_MANY_BYTES' | 'CAPTURE_BYTE_CLOSURE' |
      'FILE_EXTRACTION_FAILED' | 'INTEGRITY_FAILED' | 'CANDIDATE_TOO_LARGE'; path?: string }
  | { ok: true; candidate_digest: string; record_lines: string;
      records: readonly RecordEnvelope[]; locators: readonly EvidenceLocator[];
      coverage: Coverage; diagnostics: readonly CaptureDiagnostic[] };

/** Deterministic, in-memory candidate over a complete *declared* file list.
 * The caller is still responsible for source origin, manifest completeness and authority. */
export function assembleTypeScriptCandidate(input: CandidateInput): CandidateResult {
  const { capture, files, supplied } = input;
  if (!files.length) return { ok: false, code: 'EMPTY_CAPTURE' };
  if (files.length > MAX_FILES || supplied.length > MAX_FILES) {
    return { ok: false, code: 'TOO_MANY_FILES' };
  }
  if (supplied.some(item => !(item.bytes instanceof Uint8Array)) ||
    supplied.reduce((sum, item) => sum + item.bytes.byteLength, 0) > MAX_TOTAL_BYTES) {
    return { ok: false, code: 'TOO_MANY_BYTES' };
  }
  if (checkCaptureByteClosure(capture, files, supplied).issues.length) {
    return { ok: false, code: 'CAPTURE_BYTE_CLOSURE' };
  }
  const byPath = new Map(supplied.map(item => [item.path, item.bytes]));
  const orderedFiles = [...files].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  const records: RecordEnvelope[] = [];
  const locators: EvidenceLocator[] = [];
  const fileCoverage: Coverage[] = [];
  const diagnostics: CaptureDiagnostic[] = [];
  for (const file of orderedFiles) {
    const bytes = byPath.get(file.path);
    if (!bytes) return { ok: false, code: 'CAPTURE_BYTE_CLOSURE' };
    const extracted = extractTypeScriptCapture({ capture, file, bytes, declaredFiles: files });
    if (!extracted.ok) return { ok: false, code: 'FILE_EXTRACTION_FAILED', path: file.path };
    records.push(...extracted.records);
    locators.push(...extracted.locators);
    fileCoverage.push(extracted.coverage);
    diagnostics.push(...extracted.diagnostics);
  }
  const integrity = checkReleaseIntegrity([capture], files, locators, records);
  if (integrity.bindingIssues.length || integrity.supportIssues.length || integrity.flowIssues.length ||
    integrity.obligationIssues.length || integrity.engineeringTargetIssues.length) {
    return { ok: false, code: 'INTEGRITY_FAILED' };
  }
  const coverage: Coverage = {
    schema_version: capture.schema_version, source_id: capture.source_id,
    capture_digest: canonicalSha256(capture), adapter_id: 'typescript-declaration-spike:1',
    artifact_family: 'typescript.declarations',
    supported_patterns: ['top-level class', 'top-level interface', 'top-level function', 'class method'],
    eligible_count: files.length,
    processed_count: fileCoverage.reduce((sum, item) => sum + item.processed_count, 0),
    failed_count: fileCoverage.reduce((sum, item) => sum + item.failed_count, 0),
    excluded_count: 0,
    known_unsupported: fileCoverage[0]?.known_unsupported ??
      ['imports', 'constructors', 'fields', 'accessors', 'interface methods',
        'computed names', 'TSX', 'framework routes', 'semantic resolution'],
    diagnostic_refs: diagnostics.map(item => item.diagnostic_id),
    status: 'partial',
    reason: 'Syntax-only candidate; file-unit coverage is not declaration-family recall.',
  };
  try {
    const recordLines = canonicalRecordLines(records);
    const candidateDigest = canonicalSha256({
      capture, files: orderedFiles, records, locators, coverage, diagnostics,
    });
    return { ok: true, candidate_digest: candidateDigest, record_lines: recordLines,
      records, locators, coverage, diagnostics };
  } catch {
    return { ok: false, code: 'CANDIDATE_TOO_LARGE' };
  }
}

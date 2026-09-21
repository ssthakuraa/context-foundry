import { createHash } from 'node:crypto';
import { canonicalJson, checkCaptureBindings, checkCaptureByteClosure,
  parseJsonStrict } from '@context-foundry/contracts';
import type { ApprovedCapture } from './runner.js';
import type { CrossLayerCandidate } from './cross-layer.js';

export type EvidenceRead = { ok: true; json: string; bytes: number; text: string } |
  { ok: false; code: 'INVALID_REQUEST' | 'CAPTURE_CHANGED' | 'NOT_FOUND' |
      'UNSUPPORTED_LOCATOR' | 'OUT_OF_RANGE' | 'EVIDENCE_TOO_LARGE' };

/** Selectively brings one verified file line range into local context. No FS/network access. */
export function readBoundEvidence(candidate: CrossLayerCandidate, capture: ApprovedCapture,
  evidenceId: string, maxBytes = 16 * 1024): EvidenceRead {
  if (!evidenceId || evidenceId.length > 512 || !Number.isInteger(maxBytes) ||
    maxBytes < 256 || maxBytes > 16 * 1024) return { ok: false, code: 'INVALID_REQUEST' };
  if (checkCaptureByteClosure(capture.capture, capture.files, capture.supplied).issues.length) {
    return { ok: false, code: 'CAPTURE_CHANGED' };
  }
  const locator = candidate.locators.find(item => item.evidence_id === evidenceId);
  if (!locator) return { ok: false, code: 'NOT_FOUND' };
  if (checkCaptureBindings([capture.capture], capture.files, [locator]).length) {
    return { ok: false, code: 'CAPTURE_CHANGED' };
  }
  const supplied = capture.supplied.find(item => item.path === locator.path);
  if (!supplied) return { ok: false, code: 'CAPTURE_CHANGED' };
  const source = Buffer.from(supplied.bytes);
  let text: string;
  let content: Buffer;
  let representation: 'raw_file_lines' | 'canonical_json_pointer';
  let span: { start_line: number; end_line: number } | { section_id: string };
  if (locator.kind === 'file_range') {
    const starts = [0];
    for (let i = 0; i < source.length; i++) if (source[i] === 10) starts.push(i + 1);
    if (locator.start_line < 1 || locator.end_line < locator.start_line ||
      locator.end_line > starts.length) return { ok: false, code: 'OUT_OF_RANGE' };
    const begin = starts[locator.start_line - 1]!;
    const end = starts[locator.end_line] ?? source.length;
    content = source.subarray(begin, end);
    try { text = new TextDecoder('utf-8', { fatal: true }).decode(content); }
    catch { return { ok: false, code: 'OUT_OF_RANGE' }; }
    representation = 'raw_file_lines';
    span = { start_line: locator.start_line, end_line: locator.end_line };
  } else if (locator.kind === 'document_section') {
    if (!locator.path.endsWith('.json') || !locator.section_id.startsWith('/')) {
      return { ok: false, code: 'UNSUPPORTED_LOCATOR' };
    }
    let value: unknown;
    try {
      value = parseJsonStrict(new TextDecoder('utf-8', { fatal: true }).decode(source));
      const tokens = locator.section_id.slice(1).split('/');
      if (tokens.length > 64 || tokens.some(token => /~(?![01])/u.test(token))) {
        return { ok: false, code: 'OUT_OF_RANGE' };
      }
      for (const token of tokens) {
        const key = token.replaceAll('~1', '/').replaceAll('~0', '~');
        if (!value || typeof value !== 'object' || !Object.hasOwn(value, key)) {
          return { ok: false, code: 'OUT_OF_RANGE' };
        }
        value = (value as Record<string, unknown>)[key];
      }
      text = canonicalJson(value);
    } catch { return { ok: false, code: 'OUT_OF_RANGE' }; }
    content = Buffer.from(text, 'utf8');
    representation = 'canonical_json_pointer';
    span = { section_id: locator.section_id };
  } else {
    return { ok: false, code: 'UNSUPPORTED_LOCATOR' };
  }
  const json = canonicalJson({ candidate_digest: candidate.digest, evidence_id: evidenceId,
    source_id: locator.source_id, snapshot_id: locator.snapshot_id,
    path: locator.path, file_digest: locator.file_digest,
    representation, ...span,
    content_sha256: createHash('sha256').update(content).digest('hex'), text });
  const bytes = Buffer.byteLength(json, 'utf8');
  return bytes > maxBytes ? { ok: false, code: 'EVIDENCE_TOO_LARGE' } :
    { ok: true, json, bytes, text };
}

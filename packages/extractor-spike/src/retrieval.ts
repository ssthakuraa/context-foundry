import type { EvidenceLocator, RecordEnvelope } from '@context-foundry/contracts';
import type { CandidateResult } from './candidate.js';

type ReadyCandidate = Extract<CandidateResult, { ok: true }>;

export type LocalPointer = {
  record_id: string;
  entity_id: string;
  name: string;
  qualified_name?: string;
  signature?: string;
  locator: EvidenceLocator;
  origin: RecordEnvelope['origin'];
  review_state: RecordEnvelope['review']['state'];
  classification: RecordEnvelope['classification'];
  score: number;
  match_reason: 'exact_qualified_name' | 'exact_name' | 'lexical_overlap';
};
export type LocalSearchResult = {
  candidates: readonly LocalPointer[];
  candidate_digest: string;
  coverage_status: ReadyCandidate['coverage']['status'];
  warning: 'LOCAL_ONLY_PARTIAL_COVERAGE' | 'INVALID_QUERY';
};

/** A reproducible offline symbol/pointer baseline, not authorization or proof of behavior. */
export function searchLocalSymbols(candidate: ReadyCandidate, query: string, limit = 10): LocalSearchResult {
  const empty = (warning: LocalSearchResult['warning']): LocalSearchResult => ({
    candidates: [], candidate_digest: candidate.candidate_digest,
    coverage_status: candidate.coverage.status, warning,
  });
  if (!query.trim() || query.length > 512 || /[\u0000-\u001f\u007f]/.test(query) ||
    !Number.isInteger(limit) || limit < 1 || limit > 20) return empty('INVALID_QUERY');
  const lowered = query.trim().toLocaleLowerCase('en');
  const terms = [...new Set(lowered.match(/[\p{L}\p{N}_]+/gu) ?? [])];
  if (!terms.length) return empty('INVALID_QUERY');
  const byEvidence = new Map<string, EvidenceLocator[]>();
  for (const locator of candidate.locators) {
    const group = byEvidence.get(locator.evidence_id) ?? [];
    group.push(locator);
    byEvidence.set(locator.evidence_id, group);
  }
  const scored: LocalPointer[] = [];
  for (const record of candidate.records) {
    if (record.kind !== 'engineering.symbol') continue;
    const name = record.payload['name'];
    const qualifiedName = record.payload['qualified_name'];
    const signature = record.payload['signature'];
    if (typeof name !== 'string' || (qualifiedName !== undefined && typeof qualifiedName !== 'string') ||
      (signature !== undefined && typeof signature !== 'string')) continue;
    const locators = record.evidence_refs.flatMap(ref => byEvidence.get(ref) ?? []);
    if (record.evidence_refs.length !== 1 || locators.length !== 1) continue;
    const locator = locators[0]!;
    const nameLower = name.toLocaleLowerCase('en');
    const qualifiedLower = qualifiedName?.toLocaleLowerCase('en');
    const haystack = [name, qualifiedName ?? '', signature ?? '', locator.path]
      .join(' ').toLocaleLowerCase('en');
    const overlap = terms.filter(term => haystack.includes(term)).length;
    if (!overlap) continue;
    const exactQualified = qualifiedLower === lowered;
    const exactName = nameLower === lowered;
    const score = overlap * 10 + (exactQualified ? 100 : exactName ? 80 : 0);
    scored.push({ record_id: record.record_id, entity_id: record.entity_id, name,
      ...(qualifiedName === undefined ? {} : { qualified_name: qualifiedName }),
      ...(signature === undefined ? {} : { signature }), locator,
      origin: record.origin, review_state: record.review.state,
      classification: record.classification, score,
      match_reason: exactQualified ? 'exact_qualified_name' : exactName ? 'exact_name' :
        'lexical_overlap' });
  }
  scored.sort((a, b) => b.score - a.score ||
    (a.record_id < b.record_id ? -1 : a.record_id > b.record_id ? 1 : 0));
  return { candidates: scored.slice(0, limit), candidate_digest: candidate.candidate_digest,
    coverage_status: candidate.coverage.status,
    warning: 'LOCAL_ONLY_PARTIAL_COVERAGE' };
}

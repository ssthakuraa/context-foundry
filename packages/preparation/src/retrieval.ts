import { canonicalJson, type EvidenceLocator } from '@context-foundry/contracts';
import type { ExtensionRecord } from '@context-foundry/contracts/extensions';
import type { CrossLayerCandidate } from './cross-layer.js';

export type RetrievalIntent = 'api_use' | 'enhancement';
export type RetrievalMode = 'lexical' | 'typed';
export type RetrievalRequest = {
  question: string; intent: RetrievalIntent; mode: RetrievalMode;
  max_seeds?: number; max_hops?: number; max_bytes?: number;
};
export type RetrievalFact = {
  record_id: string; kind: string; identity: string; name: string;
  origin: ExtensionRecord['origin']; review: ExtensionRecord['review']['state'];
  classification: ExtensionRecord['classification'];
  locators: readonly { path: string; evidence_id: string; file_digest: string }[];
  reason: 'lexical' | 'exact' | 'typed_connector';
  via?: string;
};
export type RetrievalPacket = {
  request: RetrievalRequest; candidate_digest: string;
  facts: readonly RetrievalFact[];
  stage: { candidates: number; seeds: number; examined_edges: number;
    admitted_connectors: number; omitted_for_limit: number };
  diagnostics: readonly string[];
};
export type RetrievalResult = { ok: true; packet: RetrievalPacket; json: string; bytes: number } |
  { ok: false; code: 'INVALID_REQUEST' | 'PACKET_TOO_LARGE' };

export type InspectionResult = {
  ok: true; json: string; bytes: number;
  record: ExtensionRecord; locators: readonly EvidenceLocator[];
} | { ok: false; code: 'INVALID_REQUEST' | 'NOT_FOUND' | 'MISSING_EVIDENCE' |
  'PACKET_TOO_LARGE' };

/** Exact record inspect; returns pointers and support, never reads source bytes. */
export function inspectCandidateRecord(candidate: CrossLayerCandidate, recordId: string,
  maxBytes = 16 * 1024): InspectionResult {
  if (!recordId || recordId.length > 512 || !Number.isInteger(maxBytes) ||
    maxBytes < 256 || maxBytes > 16 * 1024) return { ok: false, code: 'INVALID_REQUEST' };
  const record = candidate.records.find(item => item.record_id === recordId);
  if (!record) return { ok: false, code: 'NOT_FOUND' };
  const byId = new Map(candidate.locators.map(item => [item.evidence_id, item]));
  const locators = record.evidence_refs.map(ref => byId.get(ref));
  if (locators.some(item => !item)) return { ok: false, code: 'MISSING_EVIDENCE' };
  const complete = locators as EvidenceLocator[];
  const json = canonicalJson({ candidate_digest: candidate.digest, record, locators: complete });
  const bytes = Buffer.byteLength(json, 'utf8');
  return bytes > maxBytes ? { ok: false, code: 'PACKET_TOO_LARGE' } :
    { ok: true, json, bytes, record, locators: complete };
}

const rank = (item: ExtensionRecord, query: string, terms: readonly string[]): number => {
  const searchable = [item.descriptor.name, ...item.descriptor.aliases,
    item.descriptor.summary ?? '', item.identity.key,
    ...Object.values(item.payload).filter((value): value is string => typeof value === 'string')]
    .join(' ').toLowerCase();
  if (!terms.length) return 0;
  const matched = terms.filter(term => searchable.includes(term)).length;
  return matched ? matched * 10 + (searchable.includes(query) ? 100 : 0) : 0;
};

/** Offline same-information comparison. Caller provides an already validated candidate. */
export function retrieveCandidate(candidate: CrossLayerCandidate,
  request: RetrievalRequest): RetrievalResult {
  const { question, mode, intent } = request;
  const maxSeeds = request.max_seeds ?? 3;
  const maxHops = request.max_hops ?? 3;
  const maxBytes = request.max_bytes ?? 32 * 1024;
  if (!question || question.length > 2048 || /[\u0000-\u001f]/u.test(question) ||
    !['lexical', 'typed'].includes(mode) || !['api_use', 'enhancement'].includes(intent) ||
    !Number.isInteger(maxSeeds) || maxSeeds < 1 || maxSeeds > 32 ||
    !Number.isInteger(maxHops) || maxHops < 0 || maxHops > 4 ||
    !Number.isInteger(maxBytes) || maxBytes < 256 || maxBytes > 32 * 1024) {
    return { ok: false, code: 'INVALID_REQUEST' };
  }
  const normalized = question.trim().toLowerCase();
  const terms = [...new Set(normalized.match(/[\p{L}\p{N}_]+/gu) ?? [])];
  const ranked = candidate.records.map(item => ({ item, score: rank(item, normalized, terms) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.item.record_id.localeCompare(b.item.record_id));
  const seeds = ranked.slice(0, maxSeeds).map(item => item.item);
  const byId = new Map(candidate.records.map(item => [item.record_id, item]));
  const byIdentity = new Map(candidate.records.map(item => [
    `${item.kind}\u0000${canonicalJson(item.identity)}`, item,
  ]));
  const locators = new Map<string, EvidenceLocator>(candidate.locators.map(item => [item.evidence_id, item]));
  const links = new Map<string, { target: string; via: string }[]>();
  if (mode === 'typed') {
    for (const edge of candidate.records) {
      if (!['engineering.relationship', 'business.mapping', 'test.association'].includes(edge.kind) ||
        edge.references.length !== 2 || edge.references.some(ref => ref.resolution !== 'resolved') ||
        (edge.kind === 'business.mapping' && edge.review.state !== 'approved')) continue;
      const [first, second] = edge.references.map(ref => byIdentity.get(
        `${ref.target_kind}\u0000${canonicalJson(ref.target)}`));
      if (!first || !second) continue;
      // API consumption exposes declared contract facts; implementation links are
      // enhancement pointers, not evidence of the public API's runtime behavior.
      if (intent === 'api_use') continue;
      const from = links.get(first.record_id) ?? [];
      from.push({ target: second.record_id, via: edge.record_id });
      links.set(first.record_id, from);
    }
  }
  const selected = new Map<string, { reason: RetrievalFact['reason']; via?: string }>();
  for (const seed of seeds) selected.set(seed.record_id, {
    reason: seed.identity.key.toLowerCase() === normalized ? 'exact' : 'lexical',
  });
  let examinedEdges = 0;
  const queue = seeds.map(item => ({ id: item.record_id, depth: 0 }));
  for (let cursor = 0; cursor < queue.length && queue.length <= 200; cursor++) {
    const item = queue[cursor]!;
    if (item.depth >= maxHops) continue;
    for (const link of links.get(item.id) ?? []) {
      examinedEdges++;
      if (examinedEdges > 400) break;
      if (selected.has(link.target)) continue;
      selected.set(link.via, { reason: 'typed_connector', via: item.id });
      selected.set(link.target, { reason: 'typed_connector', via: link.via });
      queue.push({ id: link.target, depth: item.depth + 1 });
    }
    if (examinedEdges > 400) break;
  }
  const facts: RetrievalFact[] = [];
  for (const [id, selection] of selected) {
    const item = byId.get(id);
    if (!item) continue;
    facts.push({ record_id: id, kind: item.kind, identity: item.identity.key,
      name: item.descriptor.name, origin: item.origin, review: item.review.state,
      classification: item.classification,
      locators: item.evidence_refs.map(ref => locators.get(ref)).filter(
        (value): value is EvidenceLocator => !!value).map(value => ({
        path: value.path, evidence_id: value.evidence_id, file_digest: value.file_digest,
      })), reason: selection.reason, ...(selection.via ? { via: selection.via } : {}) });
  }
  const packet: RetrievalPacket = { request, candidate_digest: candidate.digest, facts,
    stage: { candidates: ranked.length, seeds: seeds.length, examined_edges: examinedEdges,
      admitted_connectors: facts.filter(item => item.reason === 'typed_connector').length,
      omitted_for_limit: Math.max(0, ranked.length - maxSeeds) },
    diagnostics: candidate.coverage.some(item => item.status !== 'complete_for_declared_scope')
      ? ['PARTIAL_COVERAGE'] : [],
  };
  const json = canonicalJson(packet);
  const bytes = Buffer.byteLength(json, 'utf8');
  return bytes > maxBytes ? { ok: false, code: 'PACKET_TOO_LARGE' } :
    { ok: true, packet, json, bytes };
}

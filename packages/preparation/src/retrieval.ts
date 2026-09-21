import { canonicalJson, type EvidenceLocator } from '@context-foundry/contracts';
import type { ExtensionRecord } from '@context-foundry/contracts/extensions';
import type { CrossLayerCandidate } from './cross-layer.js';

export type RetrievalIntent = 'api_use' | 'enhancement' | 'test_impact';
export type RetrievalMode = 'lexical' | 'typed';
export type RetrievalRequest = {
  question: string; intent: RetrievalIntent; mode: RetrievalMode;
  concerns?: readonly { id: string; text: string }[];
  max_seeds?: number; max_hops?: number; max_bytes?: number;
};
export type RetrievalFact = {
  record_id: string; kind: string; identity: string; name: string;
  origin: ExtensionRecord['origin']; review: ExtensionRecord['review']['state'];
  classification: ExtensionRecord['classification'];
  locators: readonly EvidenceLocator[];
  reason: 'lexical' | 'exact' | 'typed_connector';
  concern_id?: string;
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

export function traceCandidateRecord(candidate: CrossLayerCandidate, args: {
  record_id: string; original_question: string; intent: RetrievalIntent;
  max_hops?: number; max_bytes?: number;
}): RetrievalResult | { ok: false; code: 'NOT_FOUND' } {
  const record = candidate.records.find(item => item.record_id === args.record_id);
  if (!record) return { ok: false, code: 'NOT_FOUND' };
  return retrieveCandidate(candidate, {
    question: args.original_question, intent: args.intent, mode: 'typed',
    concerns: [{ id: 'trace', text: record.identity.key }],
    max_seeds: 1, max_hops: args.max_hops ?? 4,
    max_bytes: args.max_bytes ?? 16 * 1024,
  });
}

function rankConcern(records: readonly ExtensionRecord[], query: string): ExtensionRecord[] {
  const normalized = query.trim().toLowerCase();
  const terms = [...new Set(normalized.match(/[\p{L}\p{N}_]+/gu) ?? [])];
  const fused = new Map<string, { item: ExtensionRecord; score: number; exact: boolean }>();
  for (const item of records) {
    const exact = item.identity.key.toLowerCase() === normalized ||
      item.descriptor.name.toLowerCase() === normalized ||
      item.payload['operation_key']?.toString().toLowerCase() === normalized;
    if (exact) fused.set(item.record_id, { item, score: 0, exact: true });
  }
  const laneText = [
    (item: ExtensionRecord) => [item.descriptor.name, ...item.descriptor.aliases,
      item.descriptor.summary ?? ''].join(' '),
    (item: ExtensionRecord) => item.identity.key,
    (item: ExtensionRecord) => Object.values(item.payload).filter(
      (value): value is string => typeof value === 'string').join(' '),
  ];
  for (const textOf of laneText) {
    const lane = records.map(item => ({ item,
      overlap: terms.filter(term => textOf(item).toLowerCase().includes(term)).length,
    })).filter(item => item.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap || a.item.record_id.localeCompare(b.item.record_id));
    lane.slice(0, 32).forEach((match, index) => {
      const prior = fused.get(match.item.record_id) ?? { item: match.item, score: 0, exact: false };
      prior.score += 1 / (60 + index + 1);
      fused.set(match.item.record_id, prior);
    });
  }
  return [...fused.values()].sort((a, b) => Number(b.exact) - Number(a.exact) ||
    b.score - a.score || a.item.record_id.localeCompare(b.item.record_id))
    .map(item => item.item);
}

/** Offline same-information comparison. Caller provides an already validated candidate. */
export function retrieveCandidate(candidate: CrossLayerCandidate,
  request: RetrievalRequest): RetrievalResult {
  const { question, mode, intent } = request;
  const maxSeeds = request.max_seeds ?? 3;
  const maxHops = request.max_hops ?? 3;
  const maxBytes = request.max_bytes ?? 32 * 1024;
  const suppliedConcerns = request.concerns ?? [{ id: 'original', text: question }];
  if (!question.trim() || question.length > 2048 ||
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(question) ||
    !suppliedConcerns.length || suppliedConcerns.length > 8 ||
    new Set(suppliedConcerns.map(item => item.id)).size !== suppliedConcerns.length ||
    suppliedConcerns.some(item => !item.id || item.id.length > 128 || !item.text.trim() ||
      item.text.length > 2048 ||
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(item.text)) ||
    !['lexical', 'typed'].includes(mode) ||
    !['api_use', 'enhancement', 'test_impact'].includes(intent) ||
    !Number.isInteger(maxSeeds) || maxSeeds < 1 || maxSeeds > 32 ||
    !Number.isInteger(maxHops) || maxHops < 0 || maxHops > 4 ||
    !Number.isInteger(maxBytes) || maxBytes < 256 || maxBytes > 32 * 1024) {
    return { ok: false, code: 'INVALID_REQUEST' };
  }
  const lanes = suppliedConcerns.map(concern => {
    return { id: concern.id, ranked: rankConcern(candidate.records, concern.text) };
  });
  const rankedIds = new Set(lanes.flatMap(lane => lane.ranked.map(item => item.record_id)));
  const seedEntries: { item: ExtensionRecord; concern_id: string }[] = [];
  const seen = new Set<string>();
  for (let depth = 0; seedEntries.length < maxSeeds && depth < 32; depth++) {
    let any = false;
    for (const lane of lanes) {
      const match = lane.ranked[depth];
      if (!match) continue;
      any = true;
      if (seen.has(match.record_id)) continue;
      seen.add(match.record_id);
      seedEntries.push({ item: match, concern_id: lane.id });
      if (seedEntries.length >= maxSeeds) break;
    }
    if (!any) break;
  }
  const seeds = seedEntries.map(entry => entry.item);
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
      const relation = edge.payload['relation_type'];
      const safeEngineering = edge.kind === 'engineering.relationship' &&
        ['api.implemented_by', 'engineering.calls', 'engineering.persisted_in'].includes(
          String(relation));
      const safeMapping = edge.kind === 'business.mapping' &&
        edge.payload['mapping_relation'] === 'exposed_by' &&
        edge.payload['mapping_basis'] === 'reviewed_association';
      const safeTest = edge.kind === 'test.association' &&
        edge.payload['association_basis'] === 'reviewed_relevance';
      if (intent === 'enhancement' && !(safeEngineering || safeMapping)) continue;
      if (intent === 'test_impact' && !(safeEngineering || safeTest)) continue;
      const from = intent === 'test_impact' ? second : first;
      const to = intent === 'test_impact' ? first : second;
      const group = links.get(from.record_id) ?? [];
      group.push({ target: to.record_id, via: edge.record_id });
      links.set(from.record_id, group);
    }
    for (const group of links.values()) group.sort((a, b) =>
      a.target.localeCompare(b.target) || a.via.localeCompare(b.via));
  }
  const selected = new Map<string, { reason: RetrievalFact['reason']; via?: string;
    concern_id?: string }>();
  for (const seed of seedEntries) selected.set(seed.item.record_id, {
    reason: seed.item.identity.key.toLowerCase() ===
      suppliedConcerns.find(item => item.id === seed.concern_id)!.text.trim().toLowerCase()
      ? 'exact' : 'lexical', concern_id: seed.concern_id,
  });
  let examinedEdges = 0;
  const limitDiagnostics = new Set<string>();
  const queue = seeds.map(item => ({ id: item.record_id, depth: 0 }));
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const item = queue[cursor]!;
    if (item.depth >= maxHops) {
      if ((links.get(item.id)?.length ?? 0) > 0) limitDiagnostics.add('HOP_LIMIT');
      continue;
    }
    for (const link of links.get(item.id) ?? []) {
      if (examinedEdges >= 400) { limitDiagnostics.add('EDGE_LIMIT'); break; }
      examinedEdges++;
      if (selected.has(link.target)) continue;
      if (queue.length >= 200) { limitDiagnostics.add('NODE_LIMIT'); continue; }
      selected.set(link.via, { reason: 'typed_connector', via: item.id });
      selected.set(link.target, { reason: 'typed_connector', via: link.via });
      queue.push({ id: link.target, depth: item.depth + 1 });
    }
    if (limitDiagnostics.has('EDGE_LIMIT')) break;
  }
  const facts: RetrievalFact[] = [];
  for (const [id, selection] of selected) {
    const item = byId.get(id);
    if (!item) continue;
    facts.push({ record_id: id, kind: item.kind, identity: item.identity.key,
      name: item.descriptor.name, origin: item.origin, review: item.review.state,
      classification: item.classification,
      locators: item.evidence_refs.map(ref => locators.get(ref)).filter(
        (value): value is EvidenceLocator => !!value), reason: selection.reason,
      ...(selection.concern_id ? { concern_id: selection.concern_id } : {}),
      ...(selection.via ? { via: selection.via } : {}) });
  }
  const packet: RetrievalPacket = { request, candidate_digest: candidate.digest, facts,
    stage: { candidates: rankedIds.size, seeds: seeds.length, examined_edges: examinedEdges,
      admitted_connectors: facts.filter(item => item.reason === 'typed_connector').length,
      omitted_for_limit: Math.max(0, rankedIds.size - seeds.length) },
    diagnostics: [
      ...(candidate.coverage.some(item => item.status !== 'complete_for_declared_scope')
        ? ['PARTIAL_COVERAGE'] : []),
      ...[...limitDiagnostics].sort(),
    ],
  };
  const json = canonicalJson(packet);
  const bytes = Buffer.byteLength(json, 'utf8');
  return bytes > maxBytes ? { ok: false, code: 'PACKET_TOO_LARGE' } :
    { ok: true, packet, json, bytes };
}

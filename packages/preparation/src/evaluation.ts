import type { CrossLayerCandidate } from './cross-layer.js';
import { retrieveCandidate, type RetrievalRequest } from './retrieval.js';

export type StageLoss = {
  record_id: string;
  source_present: boolean;
  lexical_candidate: boolean;
  selected_seed: boolean;
  typed_with_full_wire_cap: boolean;
  typed_packet: boolean;
  loss_stage: 'none' | 'preparation' | 'evaluation_incomplete' | 'seed_selection' |
    'typed_traversal_or_budget' | 'serialization' | 'wire_budget';
};
export type ComparisonReceipt = {
  scenario: string; candidate_digest: string;
  lexical_bytes: number | null; typed_bytes: number | null;
  typed_full_wire_bytes: number | null;
  lexical_wide_error?: string;
  lexical_error?: string; typed_error?: string; typed_full_wire_error?: string;
  obligations: readonly StageLoss[];
};

/** Offline evaluation oracle only. Expected IDs must never be fed into retrieval. */
export function compareRetrieval(candidate: CrossLayerCandidate, scenario: string,
  request: Omit<RetrievalRequest, 'mode'>, expectedRecordIds: readonly string[]): ComparisonReceipt {
  const lexicalWide = retrieveCandidate(candidate, { ...request, mode: 'lexical',
    max_seeds: 32, max_bytes: 32 * 1024 });
  const lexical = retrieveCandidate(candidate, { ...request, mode: 'lexical' });
  const typed = retrieveCandidate(candidate, { ...request, mode: 'typed' });
  // This counterfactual holds ranking, seed and hop settings fixed. Only the
  // transport cap changes; it cannot prove a missing graph link is recoverable.
  const typedFullWire = retrieveCandidate(candidate, { ...request, mode: 'typed',
    max_bytes: 32 * 1024 });
  const wideIds = new Set(lexicalWide.ok ? lexicalWide.packet.facts.map(item => item.record_id) : []);
  const seedIds = new Set(lexical.ok ? lexical.packet.facts.map(item => item.record_id) : []);
  const typedIds = new Set(typed.ok ? typed.packet.facts.map(item => item.record_id) : []);
  const typedFullIds = new Set(typedFullWire.ok ?
    typedFullWire.packet.facts.map(item => item.record_id) : []);
  const obligations = expectedRecordIds.map(record_id => {
    const source_present = candidate.records.some(item => item.record_id === record_id);
    const lexical_candidate = wideIds.has(record_id);
    const selected_seed = seedIds.has(record_id);
    const typed_packet = typedIds.has(record_id);
    const typed_with_full_wire_cap = typedFullIds.has(record_id);
    const loss_stage: StageLoss['loss_stage'] = !source_present ? 'preparation' :
      typed_packet ? 'none' : typed_with_full_wire_cap ? 'wire_budget' :
      !lexicalWide.ok || !typedFullWire.ok ? 'evaluation_incomplete' :
      !typed.ok ? 'serialization' :
        lexical_candidate && !selected_seed ? 'seed_selection' :
          'typed_traversal_or_budget';
    return { record_id, source_present, lexical_candidate, selected_seed,
      typed_with_full_wire_cap, typed_packet, loss_stage };
  });
  return { scenario, candidate_digest: candidate.digest,
    lexical_bytes: lexical.ok ? lexical.bytes : null,
    typed_bytes: typed.ok ? typed.bytes : null,
    typed_full_wire_bytes: typedFullWire.ok ? typedFullWire.bytes : null,
    ...(!lexicalWide.ok ? { lexical_wide_error: lexicalWide.code } : {}),
    ...(!lexical.ok ? { lexical_error: lexical.code } : {}),
    ...(!typed.ok ? { typed_error: typed.code } : {}),
    ...(!typedFullWire.ok ? { typed_full_wire_error: typedFullWire.code } : {}),
    obligations };
}

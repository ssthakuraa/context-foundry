import { Ajv, type ValidateFunction } from 'ajv';
import { Type, type Static } from '@sinclair/typebox';
import { canonicalSha256 } from './canonical.js';
export { canonicalJson, canonicalRecordLines, canonicalSha256, parseJsonStrict } from './canonical.js';

export const CONTRACT_VERSION = '0.2.0' as const;
const id = () => Type.String({ minLength: 1, maxLength: 512 });
const digest = () => Type.String({ pattern: '^[a-f0-9]{64}$' });
const refs = () => Type.Array(id(), { uniqueItems: true });

export const SourceCaptureSchema = Type.Object({
  schema_version: Type.Literal(CONTRACT_VERSION),
  capture_id: id(),
  source_id: id(),
  authority_id: id(),
  snapshot_id: id(),
  revision_kind: Type.Union([
    Type.Literal('git'), Type.Literal('enterprise_view'), Type.Literal('supplied_snapshot'),
  ]),
  revision_value: Type.Optional(id()),
  captured_at: Type.String({ minLength: 1 }),
  file_manifest_digest: digest(),
  publication_policy_ref: id(),
  capture_producer_id: id(),
  capture_policy: Type.Union([Type.Literal('metadata_only'), Type.Literal('approved_content')]),
  classification: Type.Union([Type.Literal('public'), Type.Literal('internal'), Type.Literal('restricted')]),
}, { $id: 'urn:context-foundry:schema:0.2.0:source-capture', additionalProperties: false });
export type SourceCapture = Static<typeof SourceCaptureSchema>;

export const CapturedFileSchema = Type.Object({
  schema_version: Type.Literal(CONTRACT_VERSION),
  source_id: id(),
  snapshot_id: id(),
  path: Type.String({ minLength: 1, maxLength: 4096 }),
  file_digest: digest(),
  bytes: Type.Integer({ minimum: 0 }),
  media_kind: id(),
  language_kind: Type.Optional(id()),
  classification: Type.Union([Type.Literal('public'), Type.Literal('internal'), Type.Literal('restricted')]),
}, { $id: 'urn:context-foundry:schema:0.2.0:captured-file', additionalProperties: false });
export type CapturedFile = Static<typeof CapturedFileSchema>;

const LocatorBase = {
  evidence_id: id(),
  source_id: id(),
  snapshot_id: id(),
  revision_kind: Type.Union([
    Type.Literal('git'), Type.Literal('enterprise_view'), Type.Literal('supplied_snapshot'),
  ]),
  revision_value: Type.Optional(id()),
  path: Type.String({ minLength: 1, maxLength: 4096 }),
  file_digest: digest(),
  symbol_id: Type.Optional(id()),
  byte_span: Type.Optional(Type.Object({
    start: Type.Integer({ minimum: 0 }), end: Type.Integer({ minimum: 1 }),
  }, { additionalProperties: false })),
} as const;

const FileLocator = Type.Object({
  kind: Type.Literal('file'),
  ...LocatorBase,
}, { additionalProperties: false });

const FileRangeLocator = Type.Object({
  kind: Type.Literal('file_range'),
  ...LocatorBase,
  start_line: Type.Integer({ minimum: 1 }),
  end_line: Type.Integer({ minimum: 1 }),
}, { additionalProperties: false });

const DocumentSectionLocator = Type.Object({
  kind: Type.Literal('document_section'),
  ...LocatorBase,
  section_id: Type.String({ minLength: 1, maxLength: 1024 }),
}, { additionalProperties: false });

export const EvidenceLocatorSchema = Type.Union([FileLocator, FileRangeLocator, DocumentSectionLocator], {
  $id: 'urn:context-foundry:schema:0.2.0:evidence-locator',
});
export type EvidenceLocator = Static<typeof EvidenceLocatorSchema>;

// Shape only. An authenticated importer must verify producer, inputs and report bytes.
export const ExecutionEvidenceSchema = Type.Object({
  schema_version: Type.Literal(CONTRACT_VERSION),
  evidence_id: id(),
  run_id: id(),
  producer_id: id(),
  runner_kind: Type.Union([
    Type.Literal('ci'), Type.Literal('local_tool'), Type.Literal('imported_report'),
  ]),
  input_capture_digests: Type.Array(digest(), { minItems: 1, uniqueItems: true }),
  report_digest: digest(),
  environment_id: id(),
  started_at: Type.String({ minLength: 1 }),
  completed_at: Type.Optional(Type.String({ minLength: 1 })),
  outcome: Type.Union([
    Type.Literal('passed'), Type.Literal('failed'), Type.Literal('skipped'),
    Type.Literal('inconclusive'),
  ]),
  observed_test_ids: refs(),
  observed_obligation_ids: refs(),
  classification: Type.Union([
    Type.Literal('public'), Type.Literal('internal'), Type.Literal('restricted'),
  ]),
}, { $id: 'urn:context-foundry:schema:0.2.0:execution-evidence', additionalProperties: false });
export type ExecutionEvidence = Static<typeof ExecutionEvidenceSchema>;

const Review = Type.Object({
  state: Type.Union([
    Type.Literal('pending'), Type.Literal('approved'), Type.Literal('rejected'),
    Type.Literal('not_required'), Type.Literal('stale'),
  ]),
  evidence_fingerprint: Type.Optional(digest()),
}, { additionalProperties: false });

export const RecordEnvelopeSchema = Type.Object({
  schema_version: Type.Literal(CONTRACT_VERSION),
  record_id: id(),
  entity_id: id(),
  kind: Type.String({ pattern: '^[a-z][a-z0-9]*(?:[._][a-z][a-z0-9]*)+$' }),
  owner_id: id(),
  origin: Type.Union([
    Type.Literal('source_declared'), Type.Literal('static_resolution'),
    Type.Literal('human_asserted'), Type.Literal('model_proposed'),
  ]),
  review: Review,
  payload: Type.Record(Type.String(), Type.Unknown()),
  evidence_refs: refs(),
  dependency_refs: refs(),
  classification: Type.Union([Type.Literal('public'), Type.Literal('internal'), Type.Literal('restricted')]),
}, { $id: 'urn:context-foundry:schema:0.2.0:record-envelope', additionalProperties: false });
export type RecordEnvelope = Static<typeof RecordEnvelopeSchema>;

export const CoverageSchema = Type.Object({
  schema_version: Type.Literal(CONTRACT_VERSION),
  source_id: id(),
  capture_digest: digest(),
  adapter_id: id(),
  artifact_family: id(),
  supported_patterns: refs(),
  eligible_count: Type.Integer({ minimum: 0 }),
  processed_count: Type.Integer({ minimum: 0 }),
  failed_count: Type.Integer({ minimum: 0 }),
  excluded_count: Type.Integer({ minimum: 0 }),
  known_unsupported: refs(),
  diagnostic_refs: refs(),
  status: Type.Union([
    Type.Literal('complete_for_declared_scope'), Type.Literal('partial'),
    Type.Literal('unsupported'), Type.Literal('unavailable'),
  ]),
  reason: Type.Optional(Type.String({ minLength: 1, maxLength: 2048 })),
}, { $id: 'urn:context-foundry:schema:0.2.0:coverage', additionalProperties: false });
export type Coverage = Static<typeof CoverageSchema>;

export const ReleaseManifestSchema = Type.Object({
  schema_version: Type.Literal(CONTRACT_VERSION),
  pack_id: id(),
  release_id: id(),
  source_manifest_digests: Type.Array(digest(), { minItems: 1, uniqueItems: true }),
  adapter_digest: digest(),
  config_digest: digest(),
  ordered_shard_digests: Type.Array(digest(), { uniqueItems: true }),
  coverage_refs: refs(),
  validation_refs: refs(),
  created_by: id(),
}, { $id: 'urn:context-foundry:schema:0.2.0:release-manifest', additionalProperties: false });
export type ReleaseManifest = Static<typeof ReleaseManifestSchema>;

const ReleaseSetEntry = Type.Object({
  pack_id: id(), release_id: id(), manifest_digest: digest(),
}, { additionalProperties: false });
export const ReleaseSetSchema = Type.Object({
  schema_version: Type.Literal(CONTRACT_VERSION),
  release_set_id: id(),
  packs: Type.Array(ReleaseSetEntry, { minItems: 1 }),
  cross_pack_bridge_digest: digest(),
}, { $id: 'urn:context-foundry:schema:0.2.0:release-set', additionalProperties: false });
export type ReleaseSet = Static<typeof ReleaseSetSchema>;

export const EngineeringSymbolPayloadSchema = Type.Object({
  name: id(),
  artifact_kind: Type.Union([
    Type.Literal('package'), Type.Literal('type'), Type.Literal('method'),
    Type.Literal('constructor'), Type.Literal('field'), Type.Literal('function'),
    Type.Literal('variable'), Type.Literal('module'),
  ]),
  language: Type.Union([Type.Literal('java'), Type.Literal('typescript')]),
  signature: Type.Optional(Type.String({ minLength: 1, maxLength: 2048 })),
}, { $id: 'urn:context-foundry:schema:0.2.0:engineering-symbol-payload', additionalProperties: false });
export type EngineeringSymbolPayload = Static<typeof EngineeringSymbolPayloadSchema>;

const RuleApplicability = Type.Object({
  status: Type.Union([Type.Literal('bounded'), Type.Literal('unknown')]),
  product_ids: Type.Optional(refs()),
  conditions: Type.Optional(Type.Array(Type.String({ minLength: 1, maxLength: 1024 }), { uniqueItems: true })),
}, { additionalProperties: false });

export const BusinessRulePayloadSchema = Type.Object({
  name: id(),
  statement: Type.String({ minLength: 1, maxLength: 8192 }),
  applicability: RuleApplicability,
}, { $id: 'urn:context-foundry:schema:0.2.0:business-rule-payload', additionalProperties: false });
export type BusinessRulePayload = Static<typeof BusinessRulePayloadSchema>;

export const BusinessMappingPayloadSchema = Type.Object({
  business_entity_id: id(),
  engineering_entity_id: id(),
  mapping_relation: Type.Union([
    Type.Literal('implemented_by'), Type.Literal('exposed_by'),
    Type.Literal('stored_in'), Type.Literal('validated_by'),
  ]),
  mapping_basis: Type.Union([
    Type.Literal('explicit_reference'), Type.Literal('reviewed_association'),
  ]),
  applicability: RuleApplicability,
}, { $id: 'urn:context-foundry:schema:0.2.0:business-mapping-payload', additionalProperties: false });
export type BusinessMappingPayload = Static<typeof BusinessMappingPayloadSchema>;

export const RelationshipPayloadSchema = Type.Object({
  subject_id: id(),
  object_id: id(),
  relation_type: Type.String({ pattern: '^[a-z][a-z0-9]*(?:[._][a-z][a-z0-9]*)+$' }),
  direction: Type.Union([Type.Literal('subject_to_object'), Type.Literal('object_to_subject')]),
  resolution_method: Type.Union([
    Type.Literal('syntax'), Type.Literal('semantic_index'), Type.Literal('framework_rule'),
    Type.Literal('reviewed_mapping'), Type.Literal('observed_run'),
  ]),
  evidence_refs: Type.Array(id(), { minItems: 1, uniqueItems: true }),
  supporting_record_refs: refs(),
}, { $id: 'urn:context-foundry:schema:0.2.0:relationship-payload', additionalProperties: false });
export type RelationshipPayload = Static<typeof RelationshipPayloadSchema>;

const boundedText = () => Type.String({ minLength: 1, maxLength: 2048 });
const ScopeCandidate = Type.Object({
  entity_id: id(),
  relevance_reason: boundedText(),
  basis: Type.Union([Type.Literal('evidence'), Type.Literal('hypothesis')]),
  evidence_refs: refs(),
}, { additionalProperties: false });
export const ScopeMapBodySchema = Type.Object({
  intent: Type.Union([
    Type.Literal('inquiry'), Type.Literal('consume_api'), Type.Literal('diagnose'),
    Type.Literal('impact_analysis'), Type.Literal('implement_change'),
  ]),
  questions: Type.Array(Type.Object({
    question_id: id(), text: boundedText(),
  }, { additionalProperties: false }), { minItems: 1 }),
  candidates: Type.Array(ScopeCandidate),
  assumptions: Type.Array(boundedText()),
  unknowns: Type.Array(boundedText()),
  material_scope_boundaries: Type.Array(boundedText()),
}, { $id: 'urn:context-foundry:schema:0.2.0:scope-map-body', additionalProperties: false });
export type ScopeMapBody = Static<typeof ScopeMapBodySchema>;

const SufficiencyAssessment = Type.Object({
  question_id: id(),
  intended_action: Type.Union([
    Type.Literal('answer'), Type.Literal('inspect_source'), Type.Literal('propose_change'),
  ]),
  judgment: Type.Union([
    Type.Literal('sufficient'), Type.Literal('inspect_source'), Type.Literal('unresolved'),
  ]),
  evidence_refs: refs(),
  rationale: boundedText(),
  planned_local_reads: refs(),
  open_questions: Type.Array(boundedText()),
}, { additionalProperties: false });
export const SufficiencyBodySchema = Type.Object({
  assessments: Type.Array(SufficiencyAssessment, { minItems: 1 }),
}, { $id: 'urn:context-foundry:schema:0.2.0:sufficiency-body', additionalProperties: false });
export type SufficiencyBody = Static<typeof SufficiencyBodySchema>;

const FindingClaim = Type.Object({
  statement: boundedText(),
  claim_type: Type.Union([
    Type.Literal('source_observed'), Type.Literal('business_asserted'),
    Type.Literal('inference'), Type.Literal('hypothesis'),
  ]),
  evidence_refs: refs(),
  read_receipt_refs: refs(),
}, { additionalProperties: false });
export const FindingsBodySchema = Type.Object({
  claims: Type.Array(FindingClaim, { minItems: 1 }),
  contradictions: Type.Array(boundedText()),
  impacts: Type.Array(boundedText()),
  unresolved_obligations: Type.Array(boundedText()),
  source_fingerprints: Type.Array(digest(), { uniqueItems: true }),
}, { $id: 'urn:context-foundry:schema:0.2.0:findings-body', additionalProperties: false });
export type FindingsBody = Static<typeof FindingsBodySchema>;

const ArtifactRef = Type.Object({
  artifact_id: id(),
  version: Type.Integer({ minimum: 1 }),
  body_digest: digest(),
}, { additionalProperties: false });
type ArtifactReference = Static<typeof ArtifactRef>;

export const ImplementationProposalBodySchema = Type.Object({
  findings_ref: ArtifactRef,
  design_summary: boundedText(),
  affected_entity_ids: refs(),
  ordered_steps: Type.Array(boundedText(), { minItems: 1 }),
  permitted_actions_requested: refs(),
  exclusions: Type.Array(boundedText()),
  validation_obligations: Type.Array(boundedText(), { minItems: 1 }),
  risks: Type.Array(boundedText()),
  rollback_approach: boundedText(),
  source_fingerprints: Type.Array(digest(), { uniqueItems: true }),
}, { $id: 'urn:context-foundry:schema:0.2.0:implementation-proposal-body', additionalProperties: false });
export type ImplementationProposalBody = Static<typeof ImplementationProposalBodySchema>;

export const CompletionBodySchema = Type.Object({
  findings_ref: ArtifactRef,
  approved_proposal_ref: Type.Optional(ArtifactRef),
  actual_changes: Type.Array(boundedText()),
  check_refs: refs(),
  skipped_checks: Type.Array(boundedText()),
  deviations: Type.Array(boundedText()),
  residual_risks: Type.Array(boundedText()),
  requested_final_review: Type.Boolean(),
}, { $id: 'urn:context-foundry:schema:0.2.0:completion-body', additionalProperties: false });
export type CompletionBody = Static<typeof CompletionBodySchema>;

export const TaskArtifactSchema = Type.Object({
  schema_version: Type.Literal(CONTRACT_VERSION),
  artifact_id: id(),
  task_id: id(),
  kind: Type.Union([
    Type.Literal('scope_map'), Type.Literal('sufficiency'), Type.Literal('findings'),
    Type.Literal('implementation_proposal'), Type.Literal('completion'),
  ]),
  version: Type.Integer({ minimum: 1 }),
  body_digest: digest(),
  previous_version: Type.Optional(Type.Integer({ minimum: 1 })),
  created_by: id(),
  origin: Type.Union([Type.Literal('human'), Type.Literal('agent'), Type.Literal('imported')]),
  created_at: Type.String({ minLength: 1 }),
  release_set_id: id(),
  evidence_refs: refs(),
  visibility_requirements: refs(),
  body: Type.Record(Type.String(), Type.Unknown()),
}, { $id: 'urn:context-foundry:schema:0.2.0:task-artifact', additionalProperties: false });
export type TaskArtifact = Static<typeof TaskArtifactSchema>;

// Server-issued receipt only. A valid JSON shape never establishes review authority.
export const HumanDecisionReceiptSchema = Type.Object({
  schema_version: Type.Literal(CONTRACT_VERSION),
  decision_id: id(),
  task_id: id(),
  gate: Type.Union([Type.Literal('scope'), Type.Literal('implementation'), Type.Literal('completion')]),
  artifact_id: id(),
  artifact_version: Type.Integer({ minimum: 1 }),
  artifact_digest: digest(),
  outcome: Type.Union([
    Type.Literal('accept'), Type.Literal('request_changes'), Type.Literal('reject'),
    Type.Literal('design_only'),
  ]),
  reviewer_subject: id(),
  authority_kind: Type.Literal('verified_human_session'),
  permitted_actions: refs(),
  permitted_scope: refs(),
  expected_task_version: Type.Integer({ minimum: 0 }),
  issued_at: Type.String({ minLength: 1 }),
  expires_at: Type.Optional(Type.String({ minLength: 1 })),
}, { $id: 'urn:context-foundry:schema:0.2.0:human-decision-receipt', additionalProperties: false });
export type HumanDecisionReceipt = Static<typeof HumanDecisionReceiptSchema>;

export const TaskErrorSchema = Type.Object({
  schema_version: Type.Literal(CONTRACT_VERSION),
  code: Type.Union([
    Type.Literal('NOT_FOUND_OR_NOT_VISIBLE'), Type.Literal('TASK_STATE_CONFLICT'),
    Type.Literal('REVIEW_REQUIRED'), Type.Literal('APPROVAL_STALE'),
    Type.Literal('UNSUPPORTED_KIND'), Type.Literal('SOURCE_STALE'),
  ]),
  message: Type.String({ minLength: 1, maxLength: 512 }),
  correlation_id: id(),
}, { $id: 'urn:context-foundry:schema:0.2.0:task-error', additionalProperties: false });
export type TaskError = Static<typeof TaskErrorSchema>;

export const EvaluationRunManifestSchema = Type.Object({
  schema_version: Type.Literal(CONTRACT_VERSION),
  run_id: id(),
  task_id: id(),
  arm: Type.Union([Type.Literal('A'), Type.Literal('B'), Type.Literal('C'), Type.Literal('O')]),
  attempt: Type.Integer({ minimum: 1 }),
  corpus_manifest_digest: digest(),
  task_input_digest: digest(),
  instruction_digest: digest(),
  model_id: id(),
  model_effort: Type.Union([
    Type.Literal('low'), Type.Literal('medium'), Type.Literal('high'),
    Type.Literal('xhigh'), Type.Literal('unknown'),
  ]),
  host_id: id(),
  policy_generation: id(),
  cache_state: Type.Union([Type.Literal('cold'), Type.Literal('warm'), Type.Literal('unknown')]),
  status: Type.Union([Type.Literal('planned'), Type.Literal('completed'), Type.Literal('failed'), Type.Literal('skipped')]),
  started_at: Type.String({ minLength: 1 }),
  usage_receipt_ref: Type.Optional(id()),
}, { $id: 'urn:context-foundry:schema:0.2.0:evaluation-run-manifest', additionalProperties: false });
export type EvaluationRunManifest = Static<typeof EvaluationRunManifestSchema>;

export const Schemas = {
  source_capture: SourceCaptureSchema,
  captured_file: CapturedFileSchema,
  evidence_locator: EvidenceLocatorSchema,
  execution_evidence: ExecutionEvidenceSchema,
  record_envelope: RecordEnvelopeSchema,
  coverage: CoverageSchema,
  release_manifest: ReleaseManifestSchema,
  release_set: ReleaseSetSchema,
  engineering_symbol_payload: EngineeringSymbolPayloadSchema,
  business_rule_payload: BusinessRulePayloadSchema,
  business_mapping_payload: BusinessMappingPayloadSchema,
  relationship_payload: RelationshipPayloadSchema,
  scope_map_body: ScopeMapBodySchema,
  sufficiency_body: SufficiencyBodySchema,
  findings_body: FindingsBodySchema,
  implementation_proposal_body: ImplementationProposalBodySchema,
  completion_body: CompletionBodySchema,
  task_artifact: TaskArtifactSchema,
  human_decision_receipt: HumanDecisionReceiptSchema,
  task_error: TaskErrorSchema,
  evaluation_run_manifest: EvaluationRunManifestSchema,
} as const;
export type SchemaName = keyof typeof Schemas;

const ajv = new Ajv({ strict: true, allErrors: true, removeAdditional: false, coerceTypes: false, useDefaults: false });
const validators = Object.fromEntries(
  Object.entries(Schemas).map(([name, schema]) => [name, ajv.compile(schema)]),
) as Record<SchemaName, ValidateFunction>;

function normalizedRelativePath(path: string): boolean {
  const parts = path.split('/');
  return !path.startsWith('/') && !path.includes('\\') &&
    !/[\u0000-\u001f\u007f]/.test(path) && !/^[a-zA-Z]:/.test(path) &&
    parts.every(part => !!part && part !== '.' && part !== '..');
}

function applicabilityErrors(applicability: BusinessRulePayload['applicability']): string[] {
  const hasScope = !!applicability.product_ids?.length || !!applicability.conditions?.length;
  if (applicability.status === 'bounded' && !hasScope) {
    return ['/applicability bounded records require product IDs or conditions'];
  }
  if (applicability.status === 'unknown' && hasScope) {
    return ['/applicability unknown cannot carry a claimed scope'];
  }
  return [];
}

function semanticErrors(name: SchemaName, value: unknown): string[] {
  if (name === 'evidence_locator') {
    const locator = value as EvidenceLocator;
    const errors: string[] = [];
    if (!normalizedRelativePath(locator.path)) {
      errors.push('/path must be a normalized relative POSIX path');
    }
    if (locator.kind === 'file_range' && locator.start_line > locator.end_line) {
      errors.push('/start_line must not exceed end_line');
    }
    if (locator.byte_span && locator.byte_span.start >= locator.byte_span.end) {
      errors.push('/byte_span.start must be less than end');
    }
    return errors;
  }
  if (name === 'captured_file') {
    return normalizedRelativePath((value as CapturedFile).path)
      ? [] : ['/path must be a normalized relative POSIX path'];
  }
  if (name === 'execution_evidence') {
    const run = value as ExecutionEvidence;
    if (run.outcome === 'skipped' && run.observed_obligation_ids.length) {
      return ['/observed_obligation_ids must be empty for skipped runs'];
    }
    if (run.outcome === 'passed' && !run.completed_at) {
      return ['/completed_at is required for passed runs'];
    }
    return [];
  }
  if (name === 'coverage') {
    const coverage = value as Coverage;
    return coverage.processed_count + coverage.failed_count + coverage.excluded_count > coverage.eligible_count
      ? ['/eligible_count must cover processed, failed and excluded items'] : [];
  }
  if (name === 'release_set') {
    const packs = (value as ReleaseSet).packs;
    return new Set(packs.map(pack => pack.pack_id)).size === packs.length
      ? [] : ['/packs must contain each pack_id at most once'];
  }
  if (name === 'engineering_symbol_payload') {
    const symbol = value as EngineeringSymbolPayload;
    return ['method', 'constructor', 'function'].includes(symbol.artifact_kind) && !symbol.signature
      ? ['/signature is required for callable symbols'] : [];
  }
  if (name === 'business_rule_payload') {
    return applicabilityErrors((value as BusinessRulePayload).applicability);
  }
  if (name === 'business_mapping_payload') {
    return applicabilityErrors((value as BusinessMappingPayload).applicability);
  }
  if (name === 'scope_map_body') {
    const body = value as ScopeMapBody;
    const questionIds = body.questions.map(question => question.question_id);
    if (new Set(questionIds).size !== questionIds.length) return ['/questions contains duplicate question_id'];
    if (body.candidates.some(candidate => candidate.basis === 'evidence' && !candidate.evidence_refs.length)) {
      return ['/candidates evidence basis requires an evidence reference'];
    }
    return [];
  }
  if (name === 'sufficiency_body') {
    const body = value as SufficiencyBody;
    const questionIds = body.assessments.map(item => item.question_id);
    if (new Set(questionIds).size !== questionIds.length) return ['/assessments contains duplicate question_id'];
    if (body.assessments.some(item => item.judgment === 'inspect_source' && !item.planned_local_reads.length)) {
      return ['/assessments inspect_source requires planned_local_reads'];
    }
    return [];
  }
  if (name === 'findings_body') {
    const body = value as FindingsBody;
    if (body.claims.some(claim => claim.claim_type === 'source_observed' && !claim.read_receipt_refs.length)) {
      return ['/claims source_observed requires a local read receipt'];
    }
    if (body.claims.some(claim => claim.claim_type === 'business_asserted' && !claim.evidence_refs.length)) {
      return ['/claims business_asserted requires evidence'];
    }
    return [];
  }
  if (name === 'completion_body') {
    const body = value as CompletionBody;
    return body.actual_changes.length && !body.approved_proposal_ref
      ? ['/approved_proposal_ref required when actual_changes is nonempty'] : [];
  }
  if (name === 'task_artifact') {
    const artifact = value as TaskArtifact;
    try {
      if (canonicalSha256(artifact.body) !== artifact.body_digest) {
        return ['/body_digest does not match canonical body'];
      }
    } catch {
      return ['/body is not canonical JSON'];
    }
    if (artifact.version === 1 && artifact.previous_version !== undefined) {
      return ['/previous_version must be absent for version 1'];
    }
    if (artifact.version > 1 && artifact.previous_version !== artifact.version - 1) {
      return ['/previous_version must immediately precede version'];
    }
    if (artifact.kind === 'scope_map') {
      const checked = validateDetailed('scope_map_body', artifact.body);
      if (!checked.valid) return ['/body must conform to scope_map_body', ...checked.errors];
      const body = artifact.body as ScopeMapBody;
      if (body.candidates.some(candidate => candidate.evidence_refs.some(ref => !artifact.evidence_refs.includes(ref)))) {
        return ['/evidence_refs must include candidate support'];
      }
    }
    if (artifact.kind === 'sufficiency') {
      const checked = validateDetailed('sufficiency_body', artifact.body);
      if (!checked.valid) return ['/body must conform to sufficiency_body', ...checked.errors];
      const body = artifact.body as SufficiencyBody;
      if (body.assessments.some(item => [...item.evidence_refs, ...item.planned_local_reads]
        .some(ref => !artifact.evidence_refs.includes(ref)))) {
        return ['/evidence_refs must include assessment support and planned reads'];
      }
    }
    if (artifact.kind === 'findings') {
      const checked = validateDetailed('findings_body', artifact.body);
      if (!checked.valid) return ['/body must conform to findings_body', ...checked.errors];
      const body = artifact.body as FindingsBody;
      if (body.claims.some(claim => claim.evidence_refs.some(ref => !artifact.evidence_refs.includes(ref)))) {
        return ['/evidence_refs must include finding claim support'];
      }
    }
    if (artifact.kind === 'implementation_proposal' &&
      !validateDetailed('implementation_proposal_body', artifact.body).valid) {
      return ['/body must conform to implementation_proposal_body'];
    }
    if (artifact.kind === 'completion' && !validateDetailed('completion_body', artifact.body).valid) {
      return ['/body must conform to completion_body'];
    }
    return [];
  }
  if (name === 'record_envelope') {
    const record = value as RecordEnvelope;
    if (record.kind === 'engineering.relationship') {
      if (!validators.relationship_payload(record.payload)) return ['/payload must conform to relationship_payload'];
      const relationship = record.payload as RelationshipPayload;
      return relationship.evidence_refs.every(ref => record.evidence_refs.includes(ref))
        ? [] : ['/evidence_refs must include relationship payload support'];
    }
    if (record.kind === 'engineering.symbol') {
      return validateDetailed('engineering_symbol_payload', record.payload).valid
        ? [] : ['/payload must conform to engineering_symbol_payload'];
    }
    if (record.kind === 'business.rule') {
      return validateDetailed('business_rule_payload', record.payload).valid
        ? [] : ['/payload must conform to business_rule_payload'];
    }
    if (record.kind === 'business.mapping') {
      if (!validateDetailed('business_mapping_payload', record.payload).valid) {
        return ['/payload must conform to business_mapping_payload'];
      }
      const mapping = record.payload as BusinessMappingPayload;
      if (mapping.mapping_basis === 'explicit_reference' &&
        !['source_declared', 'static_resolution'].includes(record.origin)) {
        return ['/origin must be source_declared or static_resolution for explicit_reference'];
      }
      if (mapping.mapping_basis === 'reviewed_association' &&
        !['human_asserted', 'model_proposed'].includes(record.origin)) {
        return ['/origin must be human_asserted or model_proposed for reviewed_association'];
      }
      return [];
    }
    return ['/kind is not registered as a required record kind'];
  }
  return [];
}

export function validateDetailed(name: SchemaName, value: unknown): { valid: boolean; errors: readonly string[] } {
  const validator = validators[name];
  if (!validator(value)) {
    return {
      valid: false,
      errors: (validator.errors ?? []).map(error => `${error.instancePath || '/'} ${error.message ?? 'invalid'}`),
    };
  }
  const errors = semanticErrors(name, value);
  return { valid: errors.length === 0, errors };
}

export function validate(name: SchemaName, value: unknown): boolean {
  return validateDetailed(name, value).valid;
}

export type BindingIssueCode =
  | 'INVALID_CAPTURE' | 'DUPLICATE_CAPTURE' | 'INVALID_FILE' | 'UNBOUND_FILE'
  | 'DUPLICATE_PATH' | 'INVALID_LOCATOR' | 'UNBOUND_LOCATOR_SOURCE'
  | 'REVISION_MISMATCH' | 'MISSING_FILE' | 'FILE_DIGEST_MISMATCH'
  | 'FILE_MANIFEST_DIGEST_MISMATCH';

export type BindingIssue = {
  code: BindingIssueCode;
  item: 'capture' | 'file' | 'locator';
  index: number;
};

/** Hash complete, validated file metadata in normalized-path order for one capture. */
export function fileManifestDigest(files: readonly CapturedFile[]): string {
  let sourceId: string | undefined;
  let snapshotId: string | undefined;
  const paths = new Set<string>();
  for (const file of files) {
    if (!validate('captured_file', file)) throw new TypeError('invalid captured file');
    if (sourceId === undefined) {
      sourceId = file.source_id;
      snapshotId = file.snapshot_id;
    } else if (file.source_id !== sourceId || file.snapshot_id !== snapshotId) {
      throw new TypeError('file manifest spans multiple captures');
    }
    if (paths.has(file.path)) throw new TypeError('duplicate file path');
    paths.add(file.path);
  }
  const ordered = [...files].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  return canonicalSha256(ordered);
}

/** Metadata-only consistency check, including file-list digest closure. No byte or access check. */
export function checkCaptureBindings(
  captures: readonly SourceCapture[],
  files: readonly CapturedFile[],
  locators: readonly EvidenceLocator[],
): readonly BindingIssue[] {
  const issues: BindingIssue[] = [];
  const captureKey = (source: string, snapshot: string) => JSON.stringify([source, snapshot]);
  const fileKey = (source: string, snapshot: string, path: string) => JSON.stringify([source, snapshot, path]);
  const capturesByKey = new Map<string, SourceCapture>();
  const filesByKey = new Map<string, CapturedFile>();
  const filesByCapture = new Map<string, CapturedFile[]>();
  const duplicateCaptureKeys = new Set<string>();
  const duplicateFileKeys = new Set<string>();
  let invalidFileSeen = false;

  captures.forEach((capture, index) => {
    if (!validate('source_capture', capture)) {
      issues.push({ code: 'INVALID_CAPTURE', item: 'capture', index });
      return;
    }
    const key = captureKey(capture.source_id, capture.snapshot_id);
    if (capturesByKey.has(key)) {
      issues.push({ code: 'DUPLICATE_CAPTURE', item: 'capture', index });
      duplicateCaptureKeys.add(key);
    }
    else capturesByKey.set(key, capture);
  });

  files.forEach((file, index) => {
    if (!validate('captured_file', file)) {
      issues.push({ code: 'INVALID_FILE', item: 'file', index });
      invalidFileSeen = true;
      return;
    }
    if (!capturesByKey.has(captureKey(file.source_id, file.snapshot_id))) {
      issues.push({ code: 'UNBOUND_FILE', item: 'file', index });
      return;
    }
    const key = fileKey(file.source_id, file.snapshot_id, file.path);
    if (filesByKey.has(key)) {
      issues.push({ code: 'DUPLICATE_PATH', item: 'file', index });
      duplicateFileKeys.add(captureKey(file.source_id, file.snapshot_id));
    } else {
      filesByKey.set(key, file);
      const groupKey = captureKey(file.source_id, file.snapshot_id);
      const group = filesByCapture.get(groupKey) ?? [];
      group.push(file);
      filesByCapture.set(groupKey, group);
    }
  });

  // An invalid file may have lost its source identity; do not claim manifest closure.
  if (!invalidFileSeen) captures.forEach((capture, index) => {
    if (!validate('source_capture', capture)) return;
    const key = captureKey(capture.source_id, capture.snapshot_id);
    if (duplicateCaptureKeys.has(key) || duplicateFileKeys.has(key)) return;
    if (fileManifestDigest(filesByCapture.get(key) ?? []) !== capture.file_manifest_digest) {
      issues.push({ code: 'FILE_MANIFEST_DIGEST_MISMATCH', item: 'capture', index });
    }
  });

  locators.forEach((locator, index) => {
    if (!validate('evidence_locator', locator)) {
      issues.push({ code: 'INVALID_LOCATOR', item: 'locator', index });
      return;
    }
    const capture = capturesByKey.get(captureKey(locator.source_id, locator.snapshot_id));
    if (!capture) {
      issues.push({ code: 'UNBOUND_LOCATOR_SOURCE', item: 'locator', index });
      return;
    }
    if (capture.revision_kind !== locator.revision_kind || capture.revision_value !== locator.revision_value) {
      issues.push({ code: 'REVISION_MISMATCH', item: 'locator', index });
    }
    const file = filesByKey.get(fileKey(locator.source_id, locator.snapshot_id, locator.path));
    if (!file) issues.push({ code: 'MISSING_FILE', item: 'locator', index });
    else if (file.file_digest !== locator.file_digest) {
      issues.push({ code: 'FILE_DIGEST_MISMATCH', item: 'locator', index });
    }
  });
  return issues;
}

export type SupportIssueCode =
  | 'INVALID_RECORD' | 'DUPLICATE_RECORD_ID' | 'INVALID_EVIDENCE'
  | 'DUPLICATE_EVIDENCE_ID' | 'MISSING_EVIDENCE' | 'MISSING_DEPENDENCY'
  | 'UNDECLARED_RELATIONSHIP_SUPPORT' | 'DEPENDENCY_CYCLE_OR_BLOCKED'
  | 'SUPPORT_LIMIT_EXCEEDED';

export type SupportIssue = {
  code: SupportIssueCode;
  item: 'record' | 'evidence';
  index: number;
};

export type SupportClosure = {
  issues: readonly SupportIssue[];
  /** Present only when every record and reference is valid. Not an access decision. */
  evidenceByRecord?: ReadonlyMap<string, readonly string[]>;
};

const MAX_SUPPORT_REFS_PER_RECORD = 10_000;

/** Validate declared support and compute transitive evidence IDs for an acyclic release. */
export function checkSupportClosure(
  records: readonly RecordEnvelope[],
  evidence: readonly EvidenceLocator[],
): SupportClosure {
  const issues: SupportIssue[] = [];
  const evidenceIds = new Set<string>();
  const recordsById = new Map<string, { record: RecordEnvelope; index: number }>();

  evidence.forEach((locator, index) => {
    if (!validate('evidence_locator', locator)) {
      issues.push({ code: 'INVALID_EVIDENCE', item: 'evidence', index });
    } else if (evidenceIds.has(locator.evidence_id)) {
      issues.push({ code: 'DUPLICATE_EVIDENCE_ID', item: 'evidence', index });
    } else evidenceIds.add(locator.evidence_id);
  });
  records.forEach((record, index) => {
    if (!validate('record_envelope', record)) {
      issues.push({ code: 'INVALID_RECORD', item: 'record', index });
    } else if (recordsById.has(record.record_id)) {
      issues.push({ code: 'DUPLICATE_RECORD_ID', item: 'record', index });
    } else recordsById.set(record.record_id, { record, index });
  });
  if (issues.length) return { issues };

  for (const { record, index } of recordsById.values()) {
    for (const ref of record.evidence_refs) {
      if (!evidenceIds.has(ref)) issues.push({ code: 'MISSING_EVIDENCE', item: 'record', index });
    }
    for (const ref of record.dependency_refs) {
      if (!recordsById.has(ref)) issues.push({ code: 'MISSING_DEPENDENCY', item: 'record', index });
    }
    if (record.kind === 'engineering.relationship') {
      const payload = record.payload as RelationshipPayload;
      for (const ref of payload.supporting_record_refs) {
        if (!record.dependency_refs.includes(ref)) {
          issues.push({ code: 'UNDECLARED_RELATIONSHIP_SUPPORT', item: 'record', index });
        }
      }
    }
  }
  if (issues.length) return { issues };

  const requirements = new Map<string, Set<string>>();
  const remaining = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  const ready: string[] = [];
  for (const [recordId, { record }] of recordsById) {
    requirements.set(recordId, new Set(record.evidence_refs));
    remaining.set(recordId, record.dependency_refs.length);
    if (!record.dependency_refs.length) ready.push(recordId);
    for (const dependencyId of record.dependency_refs) {
      const list = dependents.get(dependencyId) ?? [];
      list.push(recordId);
      dependents.set(dependencyId, list);
    }
  }

  let processed = 0;
  for (let cursor = 0; cursor < ready.length; cursor++) {
    const id = ready[cursor]!;
    processed++;
    const upstream = requirements.get(id)!;
    if (upstream.size > MAX_SUPPORT_REFS_PER_RECORD) {
      issues.push({ code: 'SUPPORT_LIMIT_EXCEEDED', item: 'record', index: recordsById.get(id)!.index });
      break;
    }
    for (const dependentId of dependents.get(id) ?? []) {
      const downstream = requirements.get(dependentId)!;
      for (const evidenceId of upstream) downstream.add(evidenceId);
      const count = remaining.get(dependentId)! - 1;
      remaining.set(dependentId, count);
      if (count === 0) ready.push(dependentId);
    }
  }
  if (issues.length) return { issues };
  if (processed !== recordsById.size) {
    for (const [recordId, count] of remaining) {
      if (count > 0) {
        issues.push({ code: 'DEPENDENCY_CYCLE_OR_BLOCKED', item: 'record', index: recordsById.get(recordId)!.index });
      }
    }
    return { issues };
  }
  return {
    issues,
    evidenceByRecord: new Map([...requirements].map(([id, ids]) => [id, [...ids].sort()])),
  };
}

/** Combined metadata gate: never expose support closure if capture binding failed. */
export function checkReleaseIntegrity(
  captures: readonly SourceCapture[],
  files: readonly CapturedFile[],
  locators: readonly EvidenceLocator[],
  records: readonly RecordEnvelope[],
): { bindingIssues: readonly BindingIssue[]; supportIssues: readonly SupportIssue[];
  evidenceByRecord?: ReadonlyMap<string, readonly string[]> } {
  const bindingIssues = checkCaptureBindings(captures, files, locators);
  const support = checkSupportClosure(records, locators);
  return {
    bindingIssues,
    supportIssues: support.issues,
    ...(bindingIssues.length || support.issues.length ? {} : { evidenceByRecord: support.evidenceByRecord }),
  };
}

export type ArtifactChainIssueCode =
  | 'INVALID_ARTIFACT' | 'DUPLICATE_KIND_VERSION' | 'DUPLICATE_ARTIFACT_VERSION'
  | 'ARTIFACT_ID_KIND_CONFLICT' | 'MISSING_PREVIOUS_VERSION'
  | 'MISSING_ARTIFACT_REFERENCE' | 'WRONG_REFERENCE_KIND' | 'REFERENCE_DIGEST_MISMATCH';
export type ArtifactChainIssue = { code: ArtifactChainIssueCode; index: number };

/** Exact same-task artifact references; approval, task intent and grants are not checked here. */
export function checkTaskArtifactReferences(artifacts: readonly TaskArtifact[]): readonly ArtifactChainIssue[] {
  const issues: ArtifactChainIssue[] = [];
  const byIdVersion = new Map<string, TaskArtifact>();
  const byKindVersion = new Set<string>();
  const seriesKind = new Map<string, TaskArtifact['kind']>();
  const idVersionKey = (taskId: string, artifactId: string, version: number) =>
    JSON.stringify([taskId, artifactId, version]);

  artifacts.forEach((artifact, index) => {
    if (!validate('task_artifact', artifact)) {
      issues.push({ code: 'INVALID_ARTIFACT', index });
      return;
    }
    const kindKey = JSON.stringify([artifact.task_id, artifact.kind, artifact.version]);
    if (byKindVersion.has(kindKey)) issues.push({ code: 'DUPLICATE_KIND_VERSION', index });
    else byKindVersion.add(kindKey);
    const seriesKey = JSON.stringify([artifact.task_id, artifact.artifact_id]);
    if (seriesKind.has(seriesKey) && seriesKind.get(seriesKey) !== artifact.kind) {
      issues.push({ code: 'ARTIFACT_ID_KIND_CONFLICT', index });
    } else seriesKind.set(seriesKey, artifact.kind);
    const key = idVersionKey(artifact.task_id, artifact.artifact_id, artifact.version);
    if (byIdVersion.has(key)) issues.push({ code: 'DUPLICATE_ARTIFACT_VERSION', index });
    else byIdVersion.set(key, artifact);
  });
  if (issues.length) return issues;

  const checkRef = (artifact: TaskArtifact, index: number, ref: ArtifactReference,
    expectedKind: TaskArtifact['kind']): void => {
    const target = byIdVersion.get(idVersionKey(artifact.task_id, ref.artifact_id, ref.version));
    if (!target) issues.push({ code: 'MISSING_ARTIFACT_REFERENCE', index });
    else if (target.kind !== expectedKind) issues.push({ code: 'WRONG_REFERENCE_KIND', index });
    else if (target.body_digest !== ref.body_digest) issues.push({ code: 'REFERENCE_DIGEST_MISMATCH', index });
  };
  artifacts.forEach((artifact, index) => {
    if (artifact.version > 1 && !byIdVersion.has(
      idVersionKey(artifact.task_id, artifact.artifact_id, artifact.version - 1))) {
      issues.push({ code: 'MISSING_PREVIOUS_VERSION', index });
    }
    if (artifact.kind === 'implementation_proposal') {
      checkRef(artifact, index, (artifact.body as ImplementationProposalBody).findings_ref, 'findings');
    }
    if (artifact.kind === 'completion') {
      const body = artifact.body as CompletionBody;
      checkRef(artifact, index, body.findings_ref, 'findings');
      if (body.approved_proposal_ref) {
        checkRef(artifact, index, body.approved_proposal_ref, 'implementation_proposal');
      }
    }
  });
  return issues;
}

import { Ajv, type ValidateFunction } from 'ajv';
import { Type, type Static } from '@sinclair/typebox';

export const CONTRACT_VERSION = '0.2.0' as const;
const id = () => Type.String({ minLength: 1, maxLength: 512 });
const digest = () => Type.String({ pattern: '^[a-f0-9]{64}$' });
const refs = () => Type.Array(id(), { uniqueItems: true });

export const SourceCaptureSchema = Type.Object({
  schema_version: Type.Literal(CONTRACT_VERSION),
  capture_id: id(),
  source_id: id(),
  logical_authority: id(),
  uri: Type.String({ minLength: 1, maxLength: 4096 }),
  revision_kind: Type.Union([Type.Literal('git'), Type.Literal('edition'), Type.Literal('snapshot')]),
  revision: id(),
  content_sha256: digest(),
  capture_policy: Type.Union([Type.Literal('metadata_only'), Type.Literal('approved_content')]),
  classification: Type.Union([Type.Literal('public'), Type.Literal('internal'), Type.Literal('restricted')]),
}, { $id: 'urn:context-foundry:schema:0.2.0:source-capture', additionalProperties: false });
export type SourceCapture = Static<typeof SourceCaptureSchema>;

const FileRangeLocator = Type.Object({
  kind: Type.Literal('file_range'),
  capture_id: id(),
  path: Type.String({ minLength: 1, maxLength: 4096 }),
  start_line: Type.Integer({ minimum: 1 }),
  end_line: Type.Integer({ minimum: 1 }),
  content_sha256: digest(),
}, { additionalProperties: false });

const DocumentSectionLocator = Type.Object({
  kind: Type.Literal('document_section'),
  capture_id: id(),
  section: Type.String({ minLength: 1, maxLength: 1024 }),
  content_sha256: digest(),
}, { additionalProperties: false });

export const EvidenceLocatorSchema = Type.Union([FileRangeLocator, DocumentSectionLocator], {
  $id: 'urn:context-foundry:schema:0.2.0:evidence-locator',
});
export type EvidenceLocator = Static<typeof EvidenceLocatorSchema>;

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
  revision: id(),
  adapter_id: id(),
  facet: id(),
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
  evidence_locator: EvidenceLocatorSchema,
  record_envelope: RecordEnvelopeSchema,
  coverage: CoverageSchema,
  release_manifest: ReleaseManifestSchema,
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

export function validate(name: SchemaName, value: unknown): boolean {
  return validators[name](value) as boolean;
}

export function validationErrors(name: SchemaName): readonly string[] {
  return (validators[name].errors ?? []).map(error => `${error.instancePath || '/'} ${error.message ?? 'invalid'}`);
}

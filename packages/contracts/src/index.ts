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

export const Schemas = {
  source_capture: SourceCaptureSchema,
  evidence_locator: EvidenceLocatorSchema,
  record_envelope: RecordEnvelopeSchema,
  coverage: CoverageSchema,
  release_manifest: ReleaseManifestSchema,
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

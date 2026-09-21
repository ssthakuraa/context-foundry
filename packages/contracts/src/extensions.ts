import { Ajv, type ValidateFunction } from 'ajv';
import { Type, type Static } from '@sinclair/typebox';
import { canonicalJson, canonicalSha256, validate, type EvidenceLocator, type RecordEnvelope } from './index.js';

/** A separate wire generation. Existing 0.2.0 records never change meaning in place. */
export const EXTENSION_RECORD_VERSION = '0.3.0' as const;
export const ADAPTER_PROTOCOL_MAJOR = 1 as const;
export const STANDARD_PROJECTION_VERSION = 1 as const;

const name = () => Type.String({ minLength: 1, maxLength: 512 });
const bounded = () => Type.String({ minLength: 1, maxLength: 2048 });
const digest = () => Type.String({ pattern: '^[a-f0-9]{64}$' });
const kind = () => Type.String({ pattern: '^[a-z][a-z0-9]*(?:[._][a-z][a-z0-9]*)+$', maxLength: 256 });
const refs = () => Type.Array(name(), { maxItems: 1024, uniqueItems: true });
const Origin = Type.Union([
  Type.Literal('source_declared'), Type.Literal('static_resolution'),
  Type.Literal('human_asserted'), Type.Literal('model_proposed'),
]);
const Classification = Type.Union([
  Type.Literal('public'), Type.Literal('internal'), Type.Literal('restricted'),
]);
const Identity = Type.Object({
  source_namespace: name(), scheme: name(), scheme_version: name(), key: bounded(),
}, { additionalProperties: false });
const ProfileRef = Type.Object({ kind: kind(), profile_digest: digest() }, { additionalProperties: false });
const ReferenceRole = Type.Object({ role: name(), target_kind: kind() }, { additionalProperties: false });
const Reference = Type.Object({
  role: name(), target_kind: kind(), target: Identity,
  resolution: Type.Union([
    Type.Literal('resolved'), Type.Literal('unresolved'), Type.Literal('ambiguous'),
    Type.Literal('conflict'), Type.Literal('unsupported'),
  ]),
}, { additionalProperties: false });

export const KindProfileSchema = Type.Object({
  schema_version: Type.Literal(EXTENSION_RECORD_VERSION),
  kind: kind(), semantic_major: Type.Integer({ minimum: 1, maximum: 1000 }),
  profile_digest: digest(),
  payload_schema: Type.Record(Type.String(), Type.Unknown()),
  payload_schema_digest: digest(),
  projection_version: Type.Literal(STANDARD_PROJECTION_VERSION),
  identity_scheme: name(), scheme_version: name(),
  allowed_origins: Type.Array(Origin, { minItems: 1, maxItems: 4, uniqueItems: true }),
  reference_roles: Type.Array(ReferenceRole, { maxItems: 64 }),
  relation: Type.Optional(Type.Object({
    relation_type: kind(), direction: Type.Union([
      Type.Literal('subject_to_object'), Type.Literal('object_to_subject'),
    ]),
  }, { additionalProperties: false })),
}, { $id: 'urn:context-foundry:schema:0.3.0:kind-profile', additionalProperties: false });
export type KindProfile = Static<typeof KindProfileSchema>;

export const AdapterManifestSchema = Type.Object({
  schema_version: Type.Literal(EXTENSION_RECORD_VERSION),
  protocol_major: Type.Literal(ADAPTER_PROTOCOL_MAJOR),
  adapter_id: name(), adapter_version: name(), package_digest: digest(),
  role: Type.Union([
    Type.Literal('analyzer'), Type.Literal('resolver'), Type.Literal('knowledge_importer'),
  ]),
  media_types: Type.Array(name(), { maxItems: 128, uniqueItems: true }),
  languages: Type.Array(name(), { maxItems: 128, uniqueItems: true }),
  config_schema_digest: digest(),
  emitted_profiles: Type.Array(ProfileRef, { maxItems: 128 }),
  consumed_profiles: Type.Array(ProfileRef, { maxItems: 128 }),
  parser_version: name(), rule_version: name(),
  requested_capabilities: Type.Array(Type.Union([
    Type.Literal('capture.read'), Type.Literal('registry.read'),
  ]), { maxItems: 2, uniqueItems: true }),
  resource_limits: Type.Object({
    input_bytes: Type.Integer({ minimum: 1, maximum: 16 * 1024 * 1024 }),
    output_bytes: Type.Integer({ minimum: 1, maximum: 16 * 1024 * 1024 }),
    messages: Type.Integer({ minimum: 1, maximum: 100_000 }),
    wall_ms: Type.Integer({ minimum: 1, maximum: 300_000 }),
  }, { additionalProperties: false }),
  license: name(),
}, { $id: 'urn:context-foundry:schema:0.3.0:adapter-manifest', additionalProperties: false });
export type AdapterManifest = Static<typeof AdapterManifestSchema>;

export const ExtensionConsumerSchema = Type.Object({
  schema_version: Type.Literal(EXTENSION_RECORD_VERSION),
  consumer_id: name(), required_profiles: Type.Array(ProfileRef, { maxItems: 128 }),
  accepted_profiles: Type.Array(ProfileRef, { maxItems: 128 }),
}, { $id: 'urn:context-foundry:schema:0.3.0:extension-consumer', additionalProperties: false });
export type ExtensionConsumer = Static<typeof ExtensionConsumerSchema>;

export const ExtensionRecordSchema = Type.Object({
  schema_version: Type.Literal(EXTENSION_RECORD_VERSION),
  record_id: name(), kind: kind(), profile_digest: digest(),
  identity: Identity, producer_id: name(), owner_id: name(), origin: Origin,
  review: Type.Object({
    state: Type.Union([
      Type.Literal('pending'), Type.Literal('approved'), Type.Literal('rejected'),
      Type.Literal('not_required'), Type.Literal('stale'),
    ]),
    evidence_fingerprint: Type.Optional(digest()),
  }, { additionalProperties: false }),
  payload: Type.Record(Type.String(), Type.Unknown()),
  descriptor: Type.Object({
    name: name(), aliases: Type.Array(name(), { maxItems: 32, uniqueItems: true }),
    summary: Type.Optional(Type.String({ minLength: 1, maxLength: 8192 })),
    locator_refs: refs(),
  }, { additionalProperties: false }),
  references: Type.Array(Reference, { maxItems: 128 }),
  evidence_refs: refs(), dependency_refs: refs(), classification: Classification,
}, { $id: 'urn:context-foundry:schema:0.3.0:extension-record', additionalProperties: false });
export type ExtensionRecord = Static<typeof ExtensionRecordSchema>;

export const SourceArtifactPayloadSchema = Type.Object({
  artifact_type: name(), name: name(),
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 8192 })),
}, { $id: 'urn:context-foundry:schema:0.3.0:source-artifact-payload', additionalProperties: false });
export type SourceArtifactPayload = Static<typeof SourceArtifactPayloadSchema>;

export const EngineeringSymbolV03PayloadSchema = Type.Object({
  name: name(), qualified_name: Type.Optional(bounded()),
  artifact_kind: name(), language: name(), signature: Type.Optional(bounded()),
}, { $id: 'urn:context-foundry:schema:0.3.0:engineering-symbol-payload', additionalProperties: false });

export const ExtensionSchemas = {
  kind_profile: KindProfileSchema, adapter_manifest: AdapterManifestSchema,
  extension_consumer: ExtensionConsumerSchema, extension_record: ExtensionRecordSchema,
  source_artifact_payload: SourceArtifactPayloadSchema,
  engineering_symbol_v03_payload: EngineeringSymbolV03PayloadSchema,
} as const;

const ajv = new Ajv({ strict: true, allErrors: true, removeAdditional: false, coerceTypes: false, useDefaults: false });
const shape = {
  profile: ajv.compile(KindProfileSchema), manifest: ajv.compile(AdapterManifestSchema),
  consumer: ajv.compile(ExtensionConsumerSchema), record: ajv.compile(ExtensionRecordSchema),
};
const RESERVED_KIND_ROOTS = new Set(['engineering', 'business', 'interface', 'test', 'behavior', 'source']);
const FIRST_PARTY_KINDS = new Set(['source.artifact', 'engineering.symbol']);

export type ExtensionIssue = {
  code: 'INVALID_PROFILE' | 'UNSAFE_PAYLOAD_SCHEMA' | 'PROFILE_DIGEST_MISMATCH' |
    'DUPLICATE_PROFILE' | 'INVALID_MANIFEST' | 'INVALID_CONSUMER' |
    'UNKNOWN_PROFILE' | 'PROFILE_VERSION_MISMATCH' | 'MISSING_REQUIRED_PROFILE' |
    'UNACCEPTED_PROFILE' | 'INVALID_RECORD' | 'UNDECLARED_RECORD_KIND' |
    'INVALID_PAYLOAD' | 'INVALID_ORIGIN' | 'IDENTITY_SCHEME_MISMATCH' |
    'INVALID_REFERENCE_ROLE' | 'MISSING_REFERENCE_TARGET' | 'AMBIGUOUS_REFERENCE_TARGET' |
    'INVALID_DESCRIPTOR_SUPPORT' | 'DUPLICATE_RECORD_ID' | 'DUPLICATE_DECLARATION_IDENTITY' |
    'INVALID_EVIDENCE' | 'DUPLICATE_EVIDENCE_ID' | 'MISSING_EVIDENCE' |
    'MISSING_DEPENDENCY' | 'MISSING_TRANSITIVE_SUPPORT' | 'DEPENDENCY_CYCLE_OR_BLOCKED' |
    'SUPPORT_LIMIT_EXCEEDED' | 'LIMIT_EXCEEDED';
  index: number;
};
const issue = (code: ExtensionIssue['code'], index: number): ExtensionIssue => ({ code, index });

/** Only a deliberately small, finite JSON Schema subset may be installed. */
function safePayloadSchema(value: unknown): value is Record<string, unknown> {
  try { if (Buffer.byteLength(canonicalJson(value), 'utf8') > 64 * 1024) return false; }
  catch { return false; }
  const visit = (node: unknown, depth: number): boolean => {
    if (!node || typeof node !== 'object' || Array.isArray(node) || depth > 16) return false;
    const schema = node as Record<string, unknown>;
    const allowed = new Set(['type', 'properties', 'required', 'additionalProperties',
      'items', 'enum', 'minLength', 'maxLength', 'minimum', 'maximum', 'minItems', 'maxItems']);
    if (Object.keys(schema).some(key => !allowed.has(key))) return false;
    if (!['object', 'string', 'integer', 'number', 'boolean'].includes(String(schema['type'])) &&
      schema['type'] !== 'array') return false;
    if (schema['enum'] !== undefined &&
      (!Array.isArray(schema['enum']) || !schema['enum'].length || schema['enum'].length > 64 ||
        schema['enum'].some(item => typeof item !== 'string' && typeof item !== 'number' && typeof item !== 'boolean'))) return false;
    for (const key of ['minLength', 'maxLength', 'minItems', 'maxItems', 'minimum', 'maximum']) {
      if (schema[key] !== undefined && (!Number.isSafeInteger(schema[key]) ||
        (schema[key] as number) < 0 || (schema[key] as number) > 8192)) return false;
    }
    if (schema['type'] === 'object') {
      if (schema['additionalProperties'] !== false || !schema['properties'] ||
        typeof schema['properties'] !== 'object' || Array.isArray(schema['properties'])) return false;
      const properties = schema['properties'] as Record<string, unknown>;
      if (Object.keys(properties).length > 64 || Object.keys(properties).some(k => !/^[A-Za-z][A-Za-z0-9_]*$/.test(k))) return false;
      if (!Array.isArray(schema['required']) || schema['required'].some(k => typeof k !== 'string' || !(k in properties)) ||
        new Set(schema['required']).size !== schema['required'].length) return false;
      return Object.values(properties).every(child => visit(child, depth + 1));
    }
    if (schema['type'] === 'array') return schema['maxItems'] !== undefined && visit(schema['items'], depth + 1);
    if (schema['type'] === 'string') return schema['maxLength'] !== undefined;
    return true;
  };
  return value !== null && (value as { type?: unknown }).type === 'object' && visit(value, 0);
}

export type InstalledProfiles = ReadonlyMap<string, { profile: KindProfile; validatePayload: ValidateFunction }>;

export function kindProfileDigest(profile: Omit<KindProfile, 'profile_digest'>): string {
  const { payload_schema, profile_digest: _ignored, ...semantic } = profile as KindProfile;
  return canonicalSha256({ ...semantic, payload_schema_digest: canonicalSha256(payload_schema) });
}

/** Reviewed first-party profiles; other built-in families join this list as they are ported. */
export function createBuiltinProfile(builtin: 'source.artifact' | 'engineering.symbol'): KindProfile {
  const typebox = builtin === 'source.artifact' ? SourceArtifactPayloadSchema : EngineeringSymbolV03PayloadSchema;
  const { $id: _schemaId, ...payload_schema } = JSON.parse(JSON.stringify(typebox)) as Record<string, unknown>;
  const base = {
    schema_version: EXTENSION_RECORD_VERSION, kind: builtin, semantic_major: 1,
    payload_schema, payload_schema_digest: canonicalSha256(payload_schema),
    projection_version: STANDARD_PROJECTION_VERSION,
    identity_scheme: builtin === 'source.artifact' ? 'source-artifact' : 'syntax',
    scheme_version: '1', allowed_origins: ['source_declared'] as ['source_declared'],
    reference_roles: [],
  };
  return { ...base, profile_digest: kindProfileDigest(base) };
}

export function installKindProfiles(profiles: readonly KindProfile[]):
  { issues: readonly ExtensionIssue[]; installed?: InstalledProfiles } {
  const issues: ExtensionIssue[] = [];
  const installed = new Map<string, { profile: KindProfile; validatePayload: ValidateFunction }>();
  if (profiles.length > 128) return { issues: [issue('LIMIT_EXCEEDED', 0)] };
  profiles.forEach((profile, index) => {
    if (!shape.profile(profile)) { issues.push(issue('INVALID_PROFILE', index)); return; }
    if (!safePayloadSchema(profile.payload_schema)) { issues.push(issue('UNSAFE_PAYLOAD_SCHEMA', index)); return; }
    if (canonicalSha256(profile.payload_schema) !== profile.payload_schema_digest) {
      issues.push(issue('PROFILE_DIGEST_MISMATCH', index)); return;
    }
    if (kindProfileDigest(profile) !== profile.profile_digest) {
      issues.push(issue('PROFILE_DIGEST_MISMATCH', index)); return;
    }
    if (new Set(profile.reference_roles.map(item => item.role)).size !== profile.reference_roles.length ||
      (RESERVED_KIND_ROOTS.has(profile.kind.split('.')[0]!) &&
        (!FIRST_PARTY_KINDS.has(profile.kind) ||
          createBuiltinProfile(profile.kind as 'source.artifact' | 'engineering.symbol').profile_digest !== profile.profile_digest))) {
      // Other built-ins will be installed with their reviewed first-party profiles in A2.
      issues.push(issue('INVALID_PROFILE', index)); return;
    }
    if (installed.has(profile.kind)) { issues.push(issue('DUPLICATE_PROFILE', index)); return; }
    try {
      const validator = ajv.compile(profile.payload_schema);
      installed.set(profile.kind, { profile, validatePayload: validator });
    } catch { issues.push(issue('UNSAFE_PAYLOAD_SCHEMA', index)); }
  });
  return issues.length ? { issues } : { issues, installed };
}

const profileKey = (value: { kind: string; profile_digest: string }): string =>
  `${value.kind}\u0000${value.profile_digest}`;

export function checkExtensionHandshake(
  manifest: AdapterManifest, consumer: ExtensionConsumer, installed: InstalledProfiles,
): readonly ExtensionIssue[] {
  const issues: ExtensionIssue[] = [];
  if (!shape.manifest(manifest)) issues.push(issue('INVALID_MANIFEST', 0));
  if (!shape.consumer(consumer)) issues.push(issue('INVALID_CONSUMER', 0));
  if (issues.length) return issues;
  const emitted = new Set<string>();
  manifest.emitted_profiles.forEach((ref, index) => {
    if (emitted.has(ref.kind)) issues.push(issue('DUPLICATE_PROFILE', index));
    emitted.add(ref.kind);
    const item = installed.get(ref.kind);
    if (!item) issues.push(issue('UNKNOWN_PROFILE', index));
    else if (item.profile.profile_digest !== ref.profile_digest) issues.push(issue('PROFILE_VERSION_MISMATCH', index));
  });
  const consumed = new Set<string>();
  manifest.consumed_profiles.forEach((ref, index) => {
    if (consumed.has(ref.kind)) issues.push(issue('DUPLICATE_PROFILE', index));
    consumed.add(ref.kind);
    const item = installed.get(ref.kind);
    if (!item) issues.push(issue('UNKNOWN_PROFILE', index));
    else if (item.profile.profile_digest !== ref.profile_digest) issues.push(issue('PROFILE_VERSION_MISMATCH', index));
  });
  const accepted = new Set<string>();
  consumer.accepted_profiles.forEach((ref, index) => {
    if (accepted.has(ref.kind)) issues.push(issue('DUPLICATE_PROFILE', index));
    accepted.add(ref.kind);
    const item = installed.get(ref.kind);
    if (!item) issues.push(issue('UNKNOWN_PROFILE', index));
    else if (item.profile.profile_digest !== ref.profile_digest) issues.push(issue('PROFILE_VERSION_MISMATCH', index));
  });
  const emittedKeys = new Set(manifest.emitted_profiles.map(profileKey));
  const acceptedKeys = new Set(consumer.accepted_profiles.map(profileKey));
  consumer.required_profiles.forEach((ref, index) => {
    if (!acceptedKeys.has(profileKey(ref)) || !emittedKeys.has(profileKey(ref))) {
      issues.push(issue('MISSING_REQUIRED_PROFILE', index));
    }
  });
  manifest.emitted_profiles.forEach((ref, index) => {
    if (!acceptedKeys.has(profileKey(ref))) issues.push(issue('UNACCEPTED_PROFILE', index));
  });
  return issues;
}

const identityKey = (identity: ExtensionRecord['identity']): string => canonicalJson(identity);

/** Candidate-local integrity check. No provenance, publication or authorization claim. */
export function checkExtensionRecords(
  records: readonly ExtensionRecord[], locators: readonly EvidenceLocator[],
  manifest: AdapterManifest, consumer: ExtensionConsumer, installed: InstalledProfiles,
): { issues: readonly ExtensionIssue[]; evidenceByRecord?: ReadonlyMap<string, readonly string[]> } {
  const issues = [...checkExtensionHandshake(manifest, consumer, installed)];
  if (records.length > 100_000 || locators.length > 100_000) return { issues: [...issues, issue('LIMIT_EXCEEDED', 0)] };
  const byId = new Map<string, { record: ExtensionRecord; index: number }>();
  const byIdentity = new Map<string, number[]>();
  const declared = new Set<string>();
  const evidenceIds = new Set<string>();
  locators.forEach((locator, index) => {
    if (!validate('evidence_locator', locator)) issues.push(issue('INVALID_EVIDENCE', index));
    else if (evidenceIds.has(locator.evidence_id)) issues.push(issue('DUPLICATE_EVIDENCE_ID', index));
    else evidenceIds.add(locator.evidence_id);
  });
  records.forEach((record, index) => {
    if (!shape.record(record)) { issues.push(issue('INVALID_RECORD', index)); return; }
    if (byId.has(record.record_id)) issues.push(issue('DUPLICATE_RECORD_ID', index));
    else byId.set(record.record_id, { record, index });
    const identity = `${record.kind}\u0000${identityKey(record.identity)}`;
    const group = byIdentity.get(identity) ?? [];
    group.push(index); byIdentity.set(identity, group);
    if (record.origin === 'source_declared') {
      if (declared.has(identity)) issues.push(issue('DUPLICATE_DECLARATION_IDENTITY', index));
      declared.add(identity);
    }
    const item = installed.get(record.kind);
    if (!item) { issues.push(issue('UNKNOWN_PROFILE', index)); return; }
    if (record.profile_digest !== item.profile.profile_digest) issues.push(issue('PROFILE_VERSION_MISMATCH', index));
    if (!manifest.emitted_profiles.some(ref => ref.kind === record.kind && ref.profile_digest === record.profile_digest) ||
      record.producer_id !== manifest.adapter_id) issues.push(issue('UNDECLARED_RECORD_KIND', index));
    if (record.identity.scheme !== item.profile.identity_scheme ||
      record.identity.scheme_version !== item.profile.scheme_version) issues.push(issue('IDENTITY_SCHEME_MISMATCH', index));
    if (!item.profile.allowed_origins.includes(record.origin)) issues.push(issue('INVALID_ORIGIN', index));
    try {
      if (Buffer.byteLength(canonicalJson(record.payload), 'utf8') > 64 * 1024 ||
        !item.validatePayload(record.payload)) issues.push(issue('INVALID_PAYLOAD', index));
    } catch { issues.push(issue('INVALID_PAYLOAD', index)); }
    if (!record.descriptor.locator_refs.length ||
      record.descriptor.locator_refs.some(ref => !record.evidence_refs.includes(ref))) {
      issues.push(issue('INVALID_DESCRIPTOR_SUPPORT', index));
    }
    for (const reference of record.references) {
      if (!item.profile.reference_roles.some(role => role.role === reference.role && role.target_kind === reference.target_kind)) {
        issues.push(issue('INVALID_REFERENCE_ROLE', index));
      }
    }
  });
  if (issues.length) return { issues };
  records.forEach((record, index) => {
    for (const ref of record.evidence_refs) if (!evidenceIds.has(ref)) issues.push(issue('MISSING_EVIDENCE', index));
    for (const ref of record.dependency_refs) if (!byId.has(ref)) issues.push(issue('MISSING_DEPENDENCY', index));
    for (const reference of record.references) {
      if (reference.resolution !== 'resolved') continue;
      const candidates = byIdentity.get(`${reference.target_kind}\u0000${identityKey(reference.target)}`) ?? [];
      if (!candidates.length) issues.push(issue('MISSING_REFERENCE_TARGET', index));
      else if (candidates.length > 1) issues.push(issue('AMBIGUOUS_REFERENCE_TARGET', index));
    }
  });
  if (issues.length) return { issues };
  const supports = new Map<string, Set<string>>();
  const remaining = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  const ready: string[] = [];
  for (const record of records) {
    supports.set(record.record_id, new Set(record.evidence_refs));
    remaining.set(record.record_id, record.dependency_refs.length);
    if (!record.dependency_refs.length) ready.push(record.record_id);
    for (const ref of record.dependency_refs) {
      const group = dependents.get(ref) ?? [];
      group.push(record.record_id); dependents.set(ref, group);
    }
  }
  let processed = 0;
  for (let cursor = 0; cursor < ready.length; cursor++) {
    const recordId = ready[cursor]!; processed++;
    const upstream = supports.get(recordId)!;
    const recordIndex = byId.get(recordId)!.index;
    if (!upstream.size) issues.push(issue('MISSING_TRANSITIVE_SUPPORT', recordIndex));
    if (upstream.size > 10_000) issues.push(issue('SUPPORT_LIMIT_EXCEEDED', recordIndex));
    if (issues.length) return { issues };
    for (const dependentId of dependents.get(recordId) ?? []) {
      const downstream = supports.get(dependentId)!;
      for (const ref of upstream) downstream.add(ref);
      const count = remaining.get(dependentId)! - 1;
      remaining.set(dependentId, count);
      if (!count) ready.push(dependentId);
    }
  }
  if (processed !== records.length) {
    records.forEach((record, index) => {
      if (remaining.get(record.record_id)! > 0) issues.push(issue('DEPENDENCY_CYCLE_OR_BLOCKED', index));
    });
  }
  return issues.length ? { issues } : {
    issues, evidenceByRecord: new Map([...supports].map(([recordId, refs]) => [recordId, [...refs].sort()])),
  };
}

export type ExtensionHit = {
  record_id: string; kind: string; identity: ExtensionRecord['identity'];
  name: string; locator_refs: readonly string[]; score: number;
};

/** Generic projection consumer; only validated records may become hits. */
export function searchExtensionDescriptors(
  records: readonly ExtensionRecord[], locators: readonly EvidenceLocator[],
  manifest: AdapterManifest, consumer: ExtensionConsumer, installed: InstalledProfiles,
  query: string, limit = 10,
): { issues: readonly ExtensionIssue[]; hits: readonly ExtensionHit[] } {
  const checked = checkExtensionRecords(records, locators, manifest, consumer, installed);
  if (checked.issues.length) return { issues: checked.issues, hits: [] };
  if (!query.trim() || query.length > 512 || !Number.isInteger(limit) || limit < 1 || limit > 32) {
    return { issues: [issue('LIMIT_EXCEEDED', 0)], hits: [] };
  }
  const needle = query.trim().toLocaleLowerCase('en');
  const tokens = [...new Set(needle.match(/[\p{L}\p{N}_]+/gu) ?? [])];
  const hits: ExtensionHit[] = [];
  for (const record of records) {
    const words = [record.descriptor.name, ...record.descriptor.aliases,
      record.descriptor.summary ?? '', record.identity.key].map(x => x.toLocaleLowerCase('en'));
    const overlap = tokens.filter(token => words.some(x => x.includes(token))).length;
    if (!overlap) continue;
    const exact = words[0] === needle || words.includes(needle);
    hits.push({ record_id: record.record_id, kind: record.kind, identity: record.identity,
      name: record.descriptor.name, locator_refs: record.descriptor.locator_refs,
      score: overlap * 10 + (exact ? 100 : 0) });
  }
  hits.sort((a, b) => b.score - a.score ||
    (a.record_id < b.record_id ? -1 : a.record_id > b.record_id ? 1 : 0));
  return { issues: [], hits: hits.slice(0, limit) };
}

export function inspectExtensionRecord(
  records: readonly ExtensionRecord[], locators: readonly EvidenceLocator[],
  manifest: AdapterManifest, consumer: ExtensionConsumer, installed: InstalledProfiles,
  recordId: string,
): { issues: readonly ExtensionIssue[]; record?: ExtensionRecord } {
  const checked = checkExtensionRecords(records, locators, manifest, consumer, installed);
  if (checked.issues.length) return { issues: checked.issues };
  const record = records.find(item => item.record_id === recordId);
  return record ? { issues: [], record } : { issues: [] };
}

export function migrateLegacySymbol(
  legacy: RecordEnvelope, identity: ExtensionRecord['identity'],
  profile: KindProfile, producerId: string,
): ExtensionRecord {
  if (!validate('record_envelope', legacy) || legacy.kind !== 'engineering.symbol' ||
    legacy.schema_version !== '0.2.0' || profile.kind !== 'engineering.symbol' ||
    identity.scheme !== profile.identity_scheme || identity.scheme_version !== profile.scheme_version) {
    throw new TypeError('unsupported legacy record migration');
  }
  const payload = legacy.payload as { name: string; qualified_name?: string; artifact_kind: string;
    language: string; signature?: string };
  const migrated = { ...payload };
  if (!ajv.validate(EngineeringSymbolV03PayloadSchema, migrated)) throw new TypeError('invalid migrated payload');
  return {
    schema_version: EXTENSION_RECORD_VERSION, record_id: legacy.record_id,
    kind: legacy.kind, profile_digest: profile.profile_digest,
    identity, producer_id: producerId, owner_id: legacy.owner_id,
    origin: legacy.origin, review: legacy.review, payload: migrated,
    descriptor: { name: payload.name, aliases: [],
      ...(payload.signature ? { summary: payload.signature } : {}),
      locator_refs: [...legacy.evidence_refs] },
    references: [], evidence_refs: [...legacy.evidence_refs],
    dependency_refs: [...legacy.dependency_refs], classification: legacy.classification,
  };
}

/** Convert parser UTF-16 offsets to canonical UTF-8 byte spans; reject split surrogates. */
export function utf16OffsetToUtf8ByteOffset(source: string, offset: number): number {
  if (!Number.isInteger(offset) || offset < 0 || offset > source.length) throw new RangeError('invalid UTF-16 offset');
  canonicalJson(source); // reject malformed source, including text beyond the requested offset
  if (offset > 0 && offset < source.length &&
    /[\uD800-\uDBFF]/u.test(source[offset - 1]!) && /[\uDC00-\uDFFF]/u.test(source[offset]!)) {
    throw new RangeError('offset splits surrogate pair');
  }
  const prefix = source.slice(0, offset);
  canonicalJson(prefix); // rejects unpaired Unicode, matching release serialization rules
  return Buffer.byteLength(prefix, 'utf8');
}
